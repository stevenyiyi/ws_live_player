import { getTagged } from "../utils/logger.js";
import { ASMediaError } from "../api/ASMediaError.js";
import { Url } from "../utils/url.js";
import { StateMachine } from "../utils/statemachine.js";
import { SDPParser } from "./sdp.js";
import { RTSPTrackStream } from "./RTSPTrackStream.js";
import md5 from "../utils/md5.js";
import RTPFactory from "./RTPFactory.js";
import { MessageBuilder } from "./RTSPMessage.js";
import { RTPPayloadParser } from "./RTPPayloadParser.js";
import { PayloadType } from "../StreamDefine.js";
import { base64ToArrayBuffer, hexToByteArray } from "../utils/binary.js";
import { AACParser } from "../parsers/aac.js";
import { RTSPSession } from "./RTSPSession.js";
import { BaseClient } from "../BaseClient.js";

const LOG_TAG = "client:rtsp";
const Log = getTagged(LOG_TAG);

export class RTSPClient extends BaseClient {
  constructor(options) {
    super(options);
    this.clientSM = new RTSPClientSM(this);
    this.clientSM.shouldReconnect = options.reconnect;
  }

  static streamType() {
    return "rtsp";
  }

  setSource(url) {
    super.setSource(url);
    this.clientSM.setSource(url);
  }

  attachTransport(transport) {
    super.attachTransport(transport);
    this.clientSM.transport = transport;
  }

  detachTransport() {
    super.detachTransport();
    this.clientSM.transport = null;
  }

  async reset() {
    super.reset();
    await this.clientSM.reset();
  }

  async destroy() {
    this.clientSM.destroy();
    await super.destroy();
  }

  start(scale = 1) {
    super.start();
    if (this.transport) {
      if (this.connected) {
        return this.clientSM.start(scale);
      } else {
        this.transport
          .connect()
          .then(() => {
            this.connected = true;
            return this.clientSM.start(scale);
          })
          .catch((e) => {
            this.connected = false;
            this.emit("error", e);
          });
      }
    } else {
      Promise.reject("no transport attached");
    }
  }

  seek(timeOffset) {
    return this.clientSM.seek(timeOffset);
  }

  stop() {
    super.stop();
    return this.clientSM.stop();
  }

  pause() {
    super.pause();
    return this.clientSM.pause();
  }

  getScale() {
    let scale = 1;
    if (this.clientSM) {
      scale = this.clientSM.scale;
    }
    return scale;
  }

  getSeekPostion() {
    let pos = 0;
    if(this.clientSM) {
      pos = this.clientSM.pos;
    }
    return pos;
  }

  onControl(data) {
    this.clientSM.onControl(data);
  }

  onData(data) {
    this.clientSM.onData(data);
  }

  onConnected() {
    super.onConnected();
    this.clientSM.onConnected();
  }

  onDisconnected() {
    super.onDisconnected();
    this.clientSM.onDisconnected();
    this.emit("disconnect");
  }

  /// Private
  _getDuration() {
    let d = NaN;
    if (this.clientSM.sdp) {
      let dt = this.clientSM.sdp.timing;
      if (dt && dt.stop !== "now") {
        d = Number(dt.stop) - Number(dt.start);
      }
    }
    return d;
  }
}

class AuthError extends Error {
  constructor(msg) {
    super(msg);
  }
}

export class RTSPError extends Error {
  constructor(data) {
    super(data.msg);
    this.data = data;
  }
}

export class RTSPClientSM extends StateMachine {
  static get USER_AGENT() {
    return "SFRtsp 0.3";
  }
  static get STATE_INITIAL() {
    return 1 << 0;
  }
  static get STATE_OPTIONS() {
    return 1 << 1;
  }
  static get STATE_DESCRIBE() {
    return 1 << 2;
  }
  static get STATE_SETUP() {
    return 1 << 3;
  }
  static get STATE_STREAMS() {
    return 1 << 4;
  }
  static get STATE_TEARDOWN() {
    return 1 << 5;
  }
  static get STATE_PLAY() {
    return 1 << 6;
  }
  static get STATE_PLAYING() {
    return 1 << 7;
  }
  static get STATE_PAUSE() {
    return 1 << 8;
  }
  static get STATE_PAUSED() {
    return 1 << 9;
  }

  constructor(parent) {
    super();

    this.parent = parent;
    this.transport = null;
    this.scale = 1;
    this.pos = 0;
    this.startScale = 1;
    this.payParser = new RTPPayloadParser();
    this.rtp_channels = new Set();
    this.sessions = {};
    this.promises = {};
    this.payParser.on("tracks", (tracks) => {
      this.parent.emit("tstracks", tracks);
    });

    this.payParser.on("sample", (sample) => {
      this.parent.emit("sample", sample);
    });

    this.addState(RTSPClientSM.STATE_INITIAL, {})
      .addState(RTSPClientSM.STATE_OPTIONS, {
        activate: this.sendOptions,
        finishTransition: this.onOptions,
      })
      .addState(RTSPClientSM.STATE_DESCRIBE, {
        activate: this.sendDescribe,
        finishTransition: this.onDescribe,
      })
      .addState(RTSPClientSM.STATE_SETUP, {
        activate: this.sendSetup,
        finishTransition: this.onSetup,
      })
      .addState(RTSPClientSM.STATE_STREAMS, {})
      .addState(RTSPClientSM.STATE_TEARDOWN, {
        activate: () => {
          this.started = false;
        },
        finishTransition: () => {
          return this.transitionTo(RTSPClientSM.STATE_INITIAL);
        },
      })
      .addTransition(RTSPClientSM.STATE_INITIAL, RTSPClientSM.STATE_OPTIONS)
      .addTransition(RTSPClientSM.STATE_INITIAL, RTSPClientSM.STATE_TEARDOWN)
      .addTransition(RTSPClientSM.STATE_OPTIONS, RTSPClientSM.STATE_DESCRIBE)
      .addTransition(RTSPClientSM.STATE_DESCRIBE, RTSPClientSM.STATE_SETUP)
      .addTransition(RTSPClientSM.STATE_SETUP, RTSPClientSM.STATE_STREAMS)
      .addTransition(RTSPClientSM.STATE_TEARDOWN, RTSPClientSM.STATE_INITIAL)
      // .addTransition(RTSPClientSM.STATE_STREAMS, RTSPClientSM.STATE_PAUSED)
      // .addTransition(RTSPClientSM.STATE_PAUSED, RTSPClientSM.STATE_STREAMS)
      .addTransition(RTSPClientSM.STATE_STREAMS, RTSPClientSM.STATE_TEARDOWN)
      // .addTransition(RTSPClientSM.STATE_PAUSED, RTSPClientSM.STATE_TEARDOWN)
      .addTransition(RTSPClientSM.STATE_SETUP, RTSPClientSM.STATE_TEARDOWN)
      .addTransition(RTSPClientSM.STATE_DESCRIBE, RTSPClientSM.STATE_TEARDOWN)
      .addTransition(RTSPClientSM.STATE_OPTIONS, RTSPClientSM.STATE_TEARDOWN);

    this.reset();

    this.shouldReconnect = false;
  }

  destroy() {
    this.parent = null;
  }

  setSource(url) {
    this.reset();
    this.endpoint = Url.parse(url);
    this.url = `${this.endpoint.protocol}://${this.endpoint.location}${this.endpoint.urlpath}`;
  }

  onConnected() {
    if (this.rtpFactory) {
      this.rtpFactory = null;
    }
    if (this.shouldReconnect) {
      this.start().catch((e) => {
        Log.error(`onConnected:${e}`);
        this.reset();
      });
    }
  }

  async onDisconnected() {
    this.reset();
    this.shouldReconnect = true;
    await this.transitionTo(RTSPClientSM.STATE_TEARDOWN);
    await this.transitionTo(RTSPClientSM.STATE_INITIAL);
  }

  start(scale) {
    if (this.currentState.name !== RTSPClientSM.STATE_STREAMS) {
      this.startScale = scale;
      return this.transitionTo(RTSPClientSM.STATE_OPTIONS);
    } else {
      // TODO: seekable
      let promises = [];
      for (let session in this.sessions) {
        promises.push(this.sessions[session].sendPlay(this.pos, scale));
      }
      return Promise.all(promises);
    }
  }

  seek(pos) {
    // TODO: seekable
    let promises = [];
    for (let session in this.sessions) {
      promises.push(this.sessions[session].sendPlay(pos, this.scale));
    }
    this.pos = pos;
    return Promise.all(promises);
  }

  onControl(data) {
    /// Parse CSeq
    let parsed = this.parse(data);
    Log.log(parsed);
    let cseq = parsed.headers["cseq"];
    if (cseq) {
      this.promises[Number(cseq)].resovle(parsed);
      delete this.promises[Number(cseq)];
    } else {
      this.promises[Number(cseq)].reject(
        new ASMediaError(ASMediaError.MEDIA_ERROR_RTSP, {
          code: 513,
          statusLine: "Not found CSeq in RTSP response header!",
        })
      );
    }
  }

  onData(data) {
    let channel = data[1];
    if (this.rtp_channels.has(channel)) {
      this.onRTP({ packet: data.subarray(4), type: channel });
    } else {
      Log.error(`Not found RTSP channel:${channel}!`);
      if (this.parent) {
        this.parent.emit(
          "error",
          new ASMediaError(ASMediaError.MEDIA_ERR_RTSP, {
            code: 512,
            statusLine: `Not found RTSP channel:${channel}!`,
          })
        );
      }
    }
  }

  stop() {
    this.shouldReconnect = false;
    let promises = [];
    for (let session in this.sessions) {
      promises.push(this.sessions[session].stop());
    }
    return Promise.all(promises);
  }

  pause() {
    let promises = [];
    for (let session in this.sessions) {
      promises.push(this.sessions[session].sendPause());
    }
    return Promise.all(promises);
  }

  async reset() {
    this.authenticator = "";
    this.methods = [];
    this.tracks = [];
    this.rtpBuffer = {};
    this.payParser.reset();
    for (let stream in this.streams) {
      this.streams[stream].reset();
    }
    for (let session in this.sessions) {
      this.sessions[session].reset();
    }
    this.streams = {};
    this.sessions = {};
    this.contentBase = "";
    if (this.currentState) {
      if (this.currentState.name !== RTSPClientSM.STATE_INITIAL) {
        await this.transitionTo(RTSPClientSM.STATE_TEARDOWN);
        Log.debug(`Current state:${this.currentState.name}`);
        await this.transitionTo(RTSPClientSM.STATE_INITIAL);
      }
    } else {
      await this.transitionTo(RTSPClientSM.STATE_INITIAL);
    }
    this.sdp = null;
    this.interleaveChannelIndex = 0;
    this.session = null;
    this.timeOffset = {};
    this.lastTimestamp = {};
  }

  async reconnect() {
    //this.parent.eventSource.dispatchEvent('clear');
    await this.reset();
    if (this.currentState.name !== RTSPClientSM.STATE_INITIAL) {
      await this.transitionTo(RTSPClientSM.STATE_TEARDOWN);
      return this.transitionTo(RTSPClientSM.STATE_OPTIONS);
    } else {
      return this.transitionTo(RTSPClientSM.STATE_OPTIONS);
    }
  }

  supports(method) {
    return this.methods.includes(method);
  }

  parse(_data) {
    Log.debug(_data);
    let d = _data.split("\r\n\r\n");
    let parsed = MessageBuilder.parse(d[0]);
    let len = Number(parsed.headers["content-length"]);
    if (len) {
      let d = _data.split("\r\n\r\n");
      parsed.body = d[1];
    } else {
      parsed.body = "";
    }
    return parsed;
  }

  sendRequest(_cmd, _host, _params = {}, _payload = null) {
    this.cSeq++;
    Object.assign(_params, {
      CSeq: this.cSeq,
      "User-Agent": RTSPClientSM.USER_AGENT,
    });
    if (this.authenticator) {
      _params["Authorization"] = this.authenticator(_cmd);
    }
    return this.send(
      MessageBuilder.build(_cmd, _host, _params, _payload)
    ).catch((e) => {
      if (e instanceof AuthError && !_params["Authorization"]) {
        return this.sendRequest(_cmd, _host, _params, _payload);
      } else {
        throw e;
      }
    });
  }

  _transportRequest(_data) {
    return new Promise((resovle, reject) => {
      this.promises[this.cSeq] = { resovle, reject };
      this.transport
        .send(_data)
        .then(() => {
          Log.log(`send data success,cseq:${this.cSeq}`);
        })
        .catch((e) => {
          Log.error(e);
          delete this.promises[this.cSeq];
          reject(
            new ASMediaError(ASMediaError.MEDIA_ERR_RTSP, {
              code: 462,
              statusLine: "462 Destination Unreachable",
            })
          );
        });
    });
  }

  async send(_data) {
    if (this.transport) {
      try {
        await this.transport.ready;
      } catch (e) {
        this.onDisconnected();
        throw e;
      }
      Log.debug(_data);

      let parsed = await this._transportRequest(_data);

      // TODO: parse status codes
      if (parsed.code === 401) {
        Log.debug(parsed.headers["www-authenticate"]);
        let auth = parsed.headers["www-authenticate"];
        let method = auth.substring(0, auth.indexOf(" "));
        auth = auth.substr(method.length + 1);
        let chunks = auth.split(",");

        let ep = this.parent.endpoint;
        if (!ep.user || !ep.pass) {
          try {
            await this.parent.queryCredentials.call(this.parent);
          } catch (e) {
            throw new AuthError(e.message);
          }
        }

        if (method.toLowerCase() === "digest") {
          let parsedChunks = {};
          for (let chunk of chunks) {
            let c = chunk.trim();
            let [k, v] = c.split("=");
            parsedChunks[k] = v.substr(1, v.length - 2);
          }
          this.authenticator = (_method) => {
            let ep = this.parent.endpoint;
            let ha1 = md5(`${ep.user}:${parsedChunks.realm}:${ep.pass}`);
            let ha2 = md5(`${_method}:${this.url}`);
            let response = md5(`${ha1}:${parsedChunks.nonce}:${ha2}`);
            let tail = ""; // TODO: handle other params
            return `Digest username="${ep.user}", realm="${parsedChunks.realm}", nonce="${parsedChunks.nonce}", uri="${this.url}", response="${response}"${tail}`;
          };
        } else {
          this.authenticator = () => {
            return `Basic ${btoa(this.parent.endpoint.auth)}`;
          };
        }

        throw new AuthError(parsed);
      }
      if (parsed.code >= 300) {
        throw new ASMediaError(ASMediaError.MEDIA_ERR_RTSP, {
          code: parsed.code,
          statusLine: parsed.statusLine,
        });
      }
      return parsed;
    } else {
      return Promise.reject("No transport attached");
    }
  }

  sendOptions() {
    this.reset();
    this.started = true;
    this.cSeq = 0;
    return this.sendRequest("OPTIONS", "*", {});
  }

  onOptions(data) {
    this.methods = data.headers["public"].split(",").map((e) => e.trim());
    return this.transitionTo(RTSPClientSM.STATE_DESCRIBE);
  }

  sendDescribe() {
    return this.sendRequest("DESCRIBE", this.url, {
      Accept: "application/sdp",
    }).then((data) => {
      this.sdp = new SDPParser();
      return this.sdp
        .parse(data.body)
        .catch(() => {
          throw new ASMediaError(ASMediaError.MEDIA_ERR_RTSP, {
            code: 515,
            statusLine: "Failed to parse SDP",
          });
        })
        .then(() => {
          return data;
        });
    });
  }

  useRTPChannel(channel) {
    this.rtp_channels.add(channel);
  }

  forgetRTPChannel(channel) {
    this.rtp_channels.delete(channel);
  }

  onDescribe(data) {
    Log.debug("onDescribe");
    this.contentBase = data.headers["content-base"] || this.url;
    this.tracks = this.sdp.getMediaBlockList();
    this.rtpFactory = new RTPFactory(this.sdp);

    Log.log(
      "SDP contained " +
        this.tracks.length +
        " track(s). Calling SETUP for each."
    );

    if (data.headers["session"]) {
      this.session = data.headers["session"];
    }

    if (!this.tracks.length) {
      this.emit(
        "error",
        new ASMediaError(ASMediaError.MEDIA_ERR_RTSP, {
          code: 514,
          statusLine: "No tracks in SDP",
        })
      );
    } else {
      return this.transitionTo(RTSPClientSM.STATE_SETUP).catch((e) => {
        Log.error(e);
        this.parent.emit("error", e);
      });
    }
  }

  sendSetup() {
    let streams = [];
    let lastPromise = null;

    Log.log(this.sdp);
    // TODO: select first video and first audio tracks
    for (let track_type of this.tracks) {
      Log.log("setup track: " + track_type);
      let track = this.sdp.getMediaBlock(track_type);
      Log.log(track);
      if (!PayloadType.string_map[track.rtpmap[track.fmt[0]].name]) continue;

      this.streams[track_type] = new RTSPTrackStream(this, track);
      let setupPromise = this.streams[track_type].start(lastPromise);
      lastPromise = setupPromise;

      this.rtpBuffer[track.fmt[0]] = [];
      streams.push(
        setupPromise.then(({ track, data }) => {
          Log.log(track);
          this.timeOffset[track.fmt[0]] = 0;
          try {
            let rtp_info = data.headers["rtp-info"].split(";");
            for (let chunk of rtp_info) {
              let [key, val] = chunk.split("=");
              if (key === "rtptime") {
                this.timeOffset[track.fmt[0]] = 0; //Number(val);
              }
            }
          } catch (e) {
            // new Date().getTime();
          }
          let params = {
            timescale: 0,
            scaleFactor: 0,
          };
          if (track.fmtp && track.fmtp["sprop-parameter-sets"]) {
            let sps_pps = track.fmtp["sprop-parameter-sets"].split(",");
            params = {
              sps: base64ToArrayBuffer(sps_pps[0]),
              pps: base64ToArrayBuffer(sps_pps[1]),
            };
          } else if (track.fmtp && track.fmtp["sprop-vps"]) {
            params.vps = base64ToArrayBuffer(track.fmtp["sprop-vps"]);
          } else if (track.fmtp && track.fmtp["sprop-sps"]) {
            params.sps = base64ToArrayBuffer(track.fmtp["sprop-sps"]);
          } else if (track.fmtp && track.fmtp["sprop-pps"]) {
            params.pps = base64ToArrayBuffer(track.fmtp["sprop-pps"]);
          } else if (track.fmtp && track.fmtp["config"]) {
            let config = track.fmtp["config"];
            this.has_config = track.fmtp["cpresent"] != "0";
            let generic = track.rtpmap[track.fmt[0]].name == "MPEG4-GENERIC";
            if (generic) {
              params = {
                config: AACParser.parseAudioSpecificConfig(
                  hexToByteArray(config)
                ),
              };
              this.payParser.aacparser.setConfig(params.config);
            } else if (config) {
              // todo: parse audio specific config for mpeg4-generic
              params = {
                config: AACParser.parseStreamMuxConfig(hexToByteArray(config)),
              };
              this.payParser.aacparser.setConfig(params.config);
            }
          }
          params.duration = this.sdp.sessionBlock.range
            ? this.sdp.sessionBlock.range[1] - this.sdp.sessionBlock.range[0]
            : 1;
          this.parent.seekable = params.duration > 1;
          let res = {
            track: track,
            offset: this.timeOffset[track.fmt[0]],
            type: PayloadType.string_map[track.rtpmap[track.fmt[0]].name],
            params: params,
            duration: params.duration,
          };

          let session = data.headers.session.split(";")[0];
          if (!this.sessions[session]) {
            this.sessions[session] = new RTSPSession(this, session);
          }
          return res;
        })
      );
    }
    return Promise.all(streams).then((tracks) => {
      let sessionPromises = [];
      for (let session in this.sessions) {
        sessionPromises.push(
          this.sessions[session].start(this.pos, this.startScale)
        );
      }
      return Promise.all(sessionPromises).then(() => {
        this.parent.emit("tracks", tracks);
      });
    });
  }

  onSetup() {
    Log.debug("onSetup");
    return this.transitionTo(RTSPClientSM.STATE_STREAMS);
  }

  onRTP(_data) {
    if (!this.rtpFactory) return;

    let rtp = this.rtpFactory.build(_data.packet, this.sdp);
    if (!rtp.type) {
      return;
    }

    if (this.timeOffset[rtp.pt] === undefined) {
      //console.log(rtp.pt, this.timeOffset[rtp.pt]);
      this.rtpBuffer[rtp.pt].push(rtp);
      return;
    }

    if (this.lastTimestamp[rtp.pt] === undefined) {
      this.lastTimestamp[rtp.pt] = rtp.timestamp - this.timeOffset[rtp.pt];
    }

    let queue = this.rtpBuffer[rtp.pt];
    queue.push(rtp);

    while (queue.length) {
      let rtp = queue.shift();

      rtp.timestamp =
        rtp.timestamp - this.timeOffset[rtp.pt] - this.lastTimestamp[rtp.pt];

      if (rtp.media) {
        try {
          this.payParser.parse(rtp);
        } catch (error) {
          this.parent.emit("error", error);
        }
      }
    }
  }
}
