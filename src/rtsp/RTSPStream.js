import { getTagged } from "../utils/logger.js";
import { ASMediaError } from "../api/ASMediaError.js";
import BaseStream from "../BaseStream.js";
import { PayloadType } from "../StreamDefine.js";
import { Remuxer } from "../remuxer/remuxer.js";
import { MSE } from "../presentation/mse.js";
import { RTSPClient } from "./RTSPClient";
import { WebsocketTransport } from "../websocket";
import { H264Parser } from "../parsers/h264.js";
import { H265Parser } from "../parsers/h265.js";
import { NALU } from "../parsers/nalu.js";
import { HEVC_NALU } from "../parsers/nalu-hevc.js";
const LOG_TAG = "RTSPStream";
const Log = getTagged(LOG_TAG);

export default class RTSPStream extends BaseStream {
  constructor(options) {
    super(options);
    this.firstRAP = false;
    this.tracks = null;
    this.useMSE = false;
    this.remux = null;
    this.isContainer = false;
    this.tracksReady = false;

    /// Sample queues
    this.sampleQueues = {};

    /// Events
    this._onTracks = this.onTracks.bind(this);
    this._onTsTracks = this.onTsTracks.bind(this);
    this._onSample = this.onSample.bind(this);
    this._onClear = this.onClear.bind(this);
    this._onDisconnect = this.onDisconnect.bind(this);
    this._onError = this.onError.bind(this);

    /// Establish rtp client
    this.client = new RTSPClient(options);
    let transport = new WebsocketTransport(this.wsurl, "rtsp", "rtsp");
    this.client.attachTransport(transport);
    this.client.on("tracks", this._onTracks);
    this.client.on("tstracks", this._onTsTracks);
    this.client.on("sample", this._onSample);
    this.client.on("clear", this._onClear);
    this.client.on("disconnect", this._onDisconnect);
    this.client.on("error", this._onError);
  }

  /// Public methods

  /// Override method, return Promise
  load(scale = 1) {
    Log.log("load starting!");
    this.client.reset();
    this.client.setSource(this.rtspurl);
    this.buffering = true;
    return this.client.start(scale);
  }

  /// return Promise
  seek(offset) {
    /// RTSP seek to postion
    return this.client.seek(offset);
  }

  abort() {
    this.client.stop().then(() => {
      if (this.client.transport) {
        return this.client.transport.disconnect();
      } else {
        throw Error("abort stream, but transport is null!");
      }
    });
  }

  pause() {
    /**return this.client.pause();*/
  }

  stop() {
    return this.client.stop();
  }

  destroy() {
    Log.debug("destroy");
    this.client.reset();
    this.client.destroy();
    /** Clear sampleQueues */
    this.sampleQueues = {};
    /** Clear tracks */
    this.tracks = null;
    /** Destory remux */
    if (this.remux) {
      this.remux.destroy();
      this.remux = null;
    }
  }

  getScale() {
    return this.client.getScale();
  }

  /// events
  onTracks(tracks) {
    Log.debug("onTracks:", tracks);
    this.tracks = tracks;
    if (
      tracks[0].type === PayloadType.TS ||
      tracks[0].type === PayloadType.PS
    ) {
      this.isContainer = true;
    } else {
      this.isContainer = false;
      for (const track of tracks) {
        /** Initialize samplesQueues */
        this.sampleQueues[
          PayloadType.string_map[track.rtpmap[track.fmt[0]].name]
        ] = [];
      }
      this._onTracksReady(tracks);
    }
  }

  onTsTracks(tracks) {
    Log.debug("onTsTracks:", tracks);
    /** add duration\track\offset properties*/
    for (const track of tracks) {
      track.duration = this.tracks[0].duration;
      track.track = this.tracks[0].track;
      track.offset = this.tracks[0].offset;
      this.sampleQueues[track.type] = [];
    }
    this.tracks[0].tracks = tracks;

    let hasCodecConf = false;
    for (const track of tracks) {
      if (track.hasCodecConf) {
        hasCodecConf = true;
        break;
      }
    }

    if (!hasCodecConf) {
      this._onTracksReady(tracks);
    }
  }

  _onTracksReady(tracks) {
    this.seekable = this.client.seekable;
    this.duration = this.client.duration;

    this._decideMSE(tracks);

    if (this.useMSE) {    
      /** 设置Video playbackRate */
      this.remux = new Remuxer(this.video);
      this.remux.attachClient(this);
      this.eventSource.dispatchEvent("tracks", tracks);
      /// this.startStreamFlush();
      /// Dispatch avinfo
      this.eventSource.dispatchEvent("info", this._getAVInfo());
    } else {
      this.eventSource.dispatchEvent(
        "error",
        new ASMediaError(
          ASMediaError.MEDIA_ERR_SRC_NOT_SUPPORTED,
          "Codec not supported using MSE!"
        )
      );
      this.destroy();
    }
  }

  /// Error occure notify
  onError(e) {
    this.buffering = false;
    this.eventSource.dispatchEvent("error", e);
    this.destroy();
  }

  /// MSE  accessunit event notify
  onSample(accessunit) {
    if (
      accessunit.ctype === PayloadType.H264 ||
      accessunit.ctype === PayloadType.H265
    ) {
      if (!this.firstRAP && accessunit.isKeyFrame()) {
        this.firstRAP = true;
      }
    }

    if (!this.firstRAP) {
      /// Drop accessunit ...
      Log.warn(
        "Receive accessunit, but not found track, discard this access unit!"
      );
      return;
    }
    let track = null;
    /// Find track
    if (
      this.tracks[0].type === PayloadType.TS ||
      this.tracks[0].type === PayloadType.PS
    ) {
      for (const t of this.tracks[0].tracks) {
        if (t.type === accessunit.ctype) {
          track = t;
          break;
        }
      }
    } else {
      for (const t of this.tracks) {
        if (t.type === accessunit.ctype) {
          track = t;
          break;
        }
      }
    }

    if (!track) {
      Log.warn("Receive accessunit, but not found track!");
      return;
    }

    if (
      track.type === PayloadType.H264 &&
      (!track.params.sps || !track.params.pps)
    ) {
      for (const frame of accessunit.units) {
        if (frame.type() === NALU.SPS) {
          track.params.sps = frame.getData().subarray(4);
        } else if (frame.type() === NALU.PPS) {
          track.params.pps = frame.getData().subarray(4);
        }
      }
      if (track.params.sps && track.params.pps) {
        track.ready = true;
        track.codec = H264Parser.getCodec(track.params.sps);
      }
    } else if (
      track.type === PayloadType.H265 &&
      (!track.params.vps || !track.params.sps || !track.params.pps)
    ) {
      for (const frame of accessunit.units) {
        if (frame.type() === HEVC_NALU.VPS) {
          track.params.vps = frame.getData().subarray(4);
        } else if (frame.type() === HEVC_NALU.SPS) {
          track.params.sps = frame.getData().subarray(4);
        } else if (frame.type() === HEVC_NALU.PPS) {
          track.params.pps = frame.getData().subarray(4);
        }
      }
      if (track.params.vps && track.params.sps && track.params.pps) {
        track.ready = true;
        track.codec = H265Parser.getCodec(track.params.vps);
      }
    } else if (track.type === PayloadType.AAC && !track.params.config) {
      if (!accessunit.config) {
        this.eventSource.dispatchEvent(
          "error",
          new ASMediaError(
            ASMediaError.MEDIA_ERR_AV,
            "Receive AAC accessunit, but have not config information!"
          )
        );
        this.destory();
      } else {
        track.params.config = accessunit.config;
        track.codec = accessunit.config.codec;
        track.ready = true;
      }
    }

    /// Check TS/PS container tracks ready
    if (this.isContainer) {
      let f = true;
      const tracks = this.tracks[0].tracks;
      for (const t of tracks) {
        if (!t.ready) {
          f = false;
          break;
        }
      }
      if (f && !this.tracksReady) {
        this._onTracksReady(tracks);
        this.tracksReady = true;
      }
    }
   
    if (this.tracksReady) {
      while (this.sampleQueues[accessunit.ctype].length) {
        let sample = this.sampleQueues[accessunit.ctype].shift();
        this.eventSource.dispatchEvent("samples", sample);
      }
      this.eventSource.dispatchEvent("samples", accessunit);
    } else {
      if(track.ready) {
        this.sampleQueues[accessunit.ctype].push(accessunit);
      } else {
        Log.warn("droped no ready sample!");
      }
    }
  }

  reset() {
    this.duration = NaN;
    this.buffering = false;
    /** Clear sampleQueues */
    this.sampleQueues = {};
    /** Clear tracks */
    this.tracks = null;
    this.tracksReady = false;
    this.firstRAP = false;
    this.useMSE = false;
    this.isContainer = false;
  }

  onClear() {
    this.reset();
    this.eventSource.dispatchEvent("clear");
    Log.log("onClear!");
  }

  onDisconnect() {
    this.reset();
    /** Destory remux */
    if (this.remux) {
      this.remux.destroy();
      this.remux = null;
    }
    this.eventSource.dispatchEvent(
      "error",
      new ASMediaError(ASMediaError.MEDIA_ERR_NETWORK, "websocket disconected!")
    );
  }

  _getTimeScale(ptype) {
    let timescale = 0;
    for (let i = 0; i < this.tracks.length; i++) {
      if (
        this.tracks[i].ptype === PayloadType.PS ||
        this.tracks[i].ptype === PayloadType.TS
      ) {
        timescale = 90000;
        break;
      } else if (this.tracks[i].ptype === ptype) {
        const rtpmap = this.tracks[i].rtpmap.entries();
        for (let j = 0; j < rtpmap.length; j++) {
          timescale = rtpmap[j][1].clock;
          break;
        }
      }
    }
    return timescale;
  }

  _decideMSE(tracks) {
   Log.debug("MSE tracks:", tracks);
   tracks.forEach((track) => {
      Log.debug(`track type:${track.type},codec:${track.codec}`);
      if (MSE.isSupported([track.codec])) {
        track.useMSE = true;
        this.useMSE = true;
      } else {
        Log.error(
          `MSE not supported codec:video/mp4; codecs=${track.codec}`
        );
        track.useMSE = false;
      }
    });
  }

  _getAVInfo() {
    return { video: this._getVideoInfo(), audio: this._getAudioInfo() };
  }

  _getAudioInfo() {
    /// get audio info
    let tracks = null;
    if (this.isContainer) {
      tracks = this.tracks[0].tracks;
    } else {
      tracks = this.tracks;
    }
    if (!tracks) {
      return null;
    }
    for (const track of tracks) {
      if (!this.isContainer) {
        if (track.type === "audio" && track.ptype === PayloadType.AAC) {
          return {
            codec: track.params.config.codec,
            samplerate: track.params.config.samplerate,
            channel: track.params.config.channel,
          };
        }
      } else {
        if (track.type === PayloadType.AAC) {
          return {
            codec: track.params.config.codec,
            samplerate: track.params.config.samplerate,
            channel: track.params.config.channel,
          };
        }
      }
    }
    return null;
  }

  _getVideoExt(track) {
    if (track.type === PayloadType.H264) {
      if (!track.params.sps || !track.params.pps) return null;
      return H264Parser.readSPS(track.params.sps);
    } else if (track.type === PayloadType.H265) {
      let vpsconfig = H265Parser.readVPS(track.params.vps);
      let info = H265Parser.readSPS(track.params.sps);
      info["fixedFrameRate"] = vpsconfig.fixedFrameRate;
      info["frameDuration"] = vpsconfig.frameDuration;
      return info;
    }
    return null;
  }

  _getVideoInfo() {
    /// get video info
    let tracks = null;
    if (this.isContainer) {
      tracks = this.tracks[0].tracks;
    } else {
      tracks = this.tracks;
    }
    if (!tracks) {
      return null;
    }
    for (const track of tracks) {
      if (!this.isContainer) {
        if (
          track.type === "video" &&
          (track.ptype === PayloadType.H264 ||
            track.ptype === PayloadType.H265 ||
            track.ptype === PayloadType.AV1)
        ) {
          if (!track.params.info) {
            track.params.info = this._getVideoExt(track);
            track.params.info.codec = track.codec;
          }
          return track.params.info;
        }
      } else {
        if (
          track.type === PayloadType.H264 ||
          track.type === PayloadType.H265 ||
          track.type === PayloadType.AV1
        ) {
          if (!track.params.info) {
            track.params.info = this._getVideoExt(track);
            track.params.info.codec = track.codec;
          }
          return track.params.info;
        }
      }
    }
    return null;
  }

  _getHasAudio() {
    let f = false;
    let tracks = null;
    if (this.isContainer) {
      tracks = this.tracks[0].tracks;
    } else {
      tracks = this.tracks;
    }

    for (const track of tracks) {
      if (!this.isContainer) {
        if (track.type === "audio") {
          f = true;
          break;
        }
      } else {
        if (track.type === PayloadType.AAC) {
          f = true;
          break;
        }
      }
    }
    return f;
  }

  _getHasVideo() {
    let f = false;
    let tracks = null;
    if (this.isContainer) {
      tracks = this.tracks[0].tracks;
    } else {
      tracks = this.tracks;
    }

    for (const track of tracks) {
      if (!this.isContainer) {
        if (track.type === "video") {
          f = true;
          break;
        }
      } else {
        if (
          track.type === PayloadType.H264 ||
          track.type === PayloadType.H265 ||
          track.type === PayloadType.AV1
        ) {
          f = true;
          break;
        }
      }
    }
    return f;
  }

  _getHasBFrames() {
    let f = false;
    let tracks = null;
    if (this.isContainer) {
      tracks = this.tracks[0].tracks;
    } else {
      tracks = this.tracks;
    }

    for (const track of tracks) {
      if (track.type === "video") {
        f = track.hasBFrames;
        break;
      }
    }
    return f;
  }
}
