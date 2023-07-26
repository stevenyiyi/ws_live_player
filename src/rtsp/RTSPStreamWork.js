/// RTSP stream web worker
import { getTagged } from "../utils/logger.js";
import { RTSPClient } from "./RTSPClient";
import { PayloadType } from "../StreamDefine";
import { WebsocketTransport } from "../websocket";
import { H264Parser } from "../parsers/h264.js";
import { H265Parser } from "../parsers/h265.js";
const LOG_TAG = "RTSPStreamWork";
const Log = getTagged(LOG_TAG);
var proxy = null;
class RTSPStreamWork {
  constructor(options) {
    this.options = options;
    this.wsurl = options.wsurl;
    this.firstRAP = false;
    this.tracks = null;
    this.client = null;
    this.isReceviceMSE = false;
    this.useMSE = false;
    this.remux = null;
    this.isContainer = false;

    /// Decoder
    this.videoDecoder = null;
    this.audioDecoder = null;
    this.loadedMetadata = false;

    /// events binds
    this._onTracks = this.onTracks.bind(this);
    this._onTsTracks = this.onTsTracks.bind(this);
    this._onSample = this.onSample.bind(this);
    this._onClear = this.onClear.bind(this);
    this._onDisconnect = this.onDisconnect.bind(this);

    this.loadedAudioMetadata = false;
    this.loadedVideoMetadata = false;
    this.loadedAllMetadata = false;

    this.onseek = null;

    this.videoBytes = 0;
    this.audioBytes = 0;
    this.firstAudioPts = -1;
    this.firstVideoPts = -1;
    this.lastKeyframeTimestamp = -1;
  }

  load(url) {
    if (!this.client) {
      this.client = new RTSPClient();
      let transport = new WebsocketTransport(url, "rtsp", {
        socket: this.wsurl
      });
      this.client.attachTransport(transport);
      this.client.on("tracks", this._onTracks);
      this.client.on("tstracks", this._onTsTracks);
      this.client.on("sample", this._onSample);
      this.client.on("clear", this._onClear);
      this.client.on("disconnect", this._onDisconnect);
    } else {
      this.client.reset();
    }
    this.client.setSource(url);
    this.buffering = true;
    this.client.start();
  }

  /// events
  onTracks(tracks) {
    this.tracks = tracks;
    if (
      tracks[0].type === PayloadType.TS ||
      tracks[0].type === PayloadType.PS
    ) {
      this.isContainer = true;
    } else {
      this.isContainer = false;
    }
    if (!this.isContainer) {
      postMessage({
        event: "onTracks",
        seekable: this.client.seekable,
        duration: this.client.duration,
        tracks: tracks
      });
    }
  }

  onTsTracks(tracks) {
    /** add duration\track\offset properties*/
    for (const track of tracks) {
      track.duration = this.tracks[0].duration;
      track.track = this.tracks[0].track;
      track.offset = this.tracks[0].offset;
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
      postMessage({
        event: "onTsTracks",
        seekable: this.client.seekable,
        duration: this.client.duration,
        tracks: tracks
      });
    }
  }

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
      Log.error("Receive accessunit, but not found track!");
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
      Log.error("Receive accessunit, but not found track!");
      return;
    }

    if (track.type === PayloadType.H264 && (!track.sps || !track.pps)) {
      if (!track.parser) {
        track.parser = new H264Parser(track);
      }
      for (const frame of accessunit.units) {
        track.parser.parseNAL(frame);
      }
      if (track.sps && track.pps) {
        track.ready = true;
      }
    } else if (
      track.type === PayloadType.H265 &&
      (!track.vps || !track.sps || !track.pps)
    ) {
      if (!track.parser) {
        track.parser = new H265Parser(track);
      }
      for (const frame of accessunit.units) {
        track.parser.parseNAL(frame);
      }
      if (track.vps && track.sps && track.pps) {
        track.ready = true;
      }
    } else if (track.type === PayloadType.AAC && !track.config) {
      if (!accessunit.config) {
        throw new Error(
          "Receive aac accessunit, but have not config information!"
        );
      }
      track.config = accessunit.config;
      track.ready = true;
    }

    /// Check TS/PS container tracks ready
    if (this.isContainer) {
      let f = true;
      const tracks = this.tracks[0].tracks;
      for (const t of tracks) {
        f = !!t.ready;
      }
      if (f) {
        postMessage({
          event: "onTsTracks",
          seekable: this.client.seekable,
          duration: this.client.duration,
          tracks: tracks
        });
      }
    }

    if (this.firstVideoPts === -1 && track.type === "video") {
      this.firstVideoPts = accessunit.pts;
    } else if (this.firstAudioPts === -1 && track.type === "audio") {
      this.firstAudioPts = accessunit.pts;
    }
    if (
      accessunit.ctype === PayloadType.H264 ||
      (accessunit.ctype === PayloadType.H265 && accessunit.isKeyFrame())
    ) {
      this.lastKeyframeTimestamp = accessunit.pts;
    }
    if (this.isReceviceMSE) {
      if (this.useMSE) {
        track.sampleQueue.push(accessunit);
        let sample = track.sampleQueue.shift();
        while (sample) {
          postMessage(
            {
              event: "onSamples",
              samples: sample
            },
            [sample]
          );
          sample = track.sampleQueue.shift();
        }
      }
    }
  }

  onClear() {
    postMessage({ event: "onClear" });
  }

  onDisconnect() {
    postMessage({ event: "onDisconnect" });
  }

  discardFrame(callback) {}

  discardAudio(callback) {}

  /// Private
  _getSeekable() {
    return this.client.seekable;
  }

  _getMediaLength() {
    if (!this.tracks) {
      throw Error("_getMediaLength but tracks not ready!");
    }

    let track = null;
    if (
      this.tracks[0].ptype === PayloadType.TS ||
      this.tracks[0].ptype === PayloadType.PS
    ) {
      track = this.tracks[0].tracks[0];
    } else {
      track = this.tracks[0];
    }

    if (!track.sampleQueue) {
      return 0;
    }

    const queue = track.sampleQueue;
    let dts = 0;
    for (const sample of queue) {
      dts += sample.dts;
    }

    const ptype = track.ptype;
    let timescale = this._getTimeScale(ptype);
    dts = (dts * 1000) / timescale;
    return dts;
  }

  _getDuration() {
    return this.client.duration;
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

  _getHasAudio() {
    let f = false;
    let tracks = null;
    if (this.isContainer) {
      tracks = this.tracks[0].tracks;
    } else {
      tracks = this.tracks;
    }

    for (const track of tracks) {
      if (track.type === "audio") {
        f = true;
        break;
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
      if (track.type === "video") {
        f = true;
        break;
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

  onmessage = (event) => {
    switch (event.data.method) {
      case "load":
        if (!proxy) {
          proxy = new RTSPStreamWork(event.data.options);
        }
        proxy.load(event.data.params.url);
        break;
      case "getCacheLength":
        {
          let r = proxy._getCacheLength();
          postMessage({
            method: "getCacheLength",
            result: r
          });
        }
        break;
      case "getMediaLength":
        {
          let r = proxy._getMediaLength();
          postMessage({
            method: "getMediaLength",
            result: r
          });
        }
        break;
      case "onSupportedMSE":
        proxy.isReceviceMSE = true;
        proxy.useMSE = event.data.params.result;
        break;
      default:
        break;
    }
  };
}
