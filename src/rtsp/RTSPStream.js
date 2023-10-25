import { getTagged } from "../utils/logger.js";
import BaseStream from "../BaseStream.js";
import { PayloadType } from "../StreamDefine.js";
import { Remuxer } from "../remuxer/remuxer.js";
import { MSE } from "../presentation/mse.js";
import { RTSPClient } from "./RTSPClient";
import { WebsocketTransport } from "../websocket";
import { H264Parser } from "../parsers/h264.js";
import { H265Parser } from "../parsers/h265.js";
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

    this.loadedMetadata = false;
    this.processingTimer = 0;

    this.loadedAudioMetadata = false;
    this.loadedVideoMetadata = false;
    this.loadedAllMetadata = false;

    this.onseek = null;
    this.promises = {};

    this.audioBuffers = [];
    this.videoBuffers = [];

    this.videoBytes = 0;
    this.audioBytes = 0;
    this.firstAudioPts = -1;
    this.firstVideoPts = -1;
    this.lastKeyframeTimestamp = -1;
    this.firstPlaying = false;

    /// Events
    this._onTracks = this.onTracks.bind(this);
    this._onTsTracks = this.onTsTracks.bind(this);
    this._onSample = this.onSample.bind(this);
    this._onClear = this.onClear.bind(this);
    this._onDisconnect = this.onDisconnect.bind(this);
  }

  /// Public methods

  /// Override method, return Promise
  load() {
    Log.log("load starting!");
    if (!this.client) {
      this.client = new RTSPClient(this.options);
      let transport = new WebsocketTransport(this.wsurl, "rtsp", "rtsp");
      this.client.attachTransport(transport);
      this.client.on("tracks", this._onTracks);
      this.client.on("tstracks", this._onTsTracks);
      this.client.on("sample", this._onSample);
      this.client.on("clear", this._onClear);
      this.client.on("disconnect", this._onDisconnect);
    } else {
      this.client.reset();
    }
    this.client.setSource(this.rtspurl);
    this.buffering = true;
    this.client.start();
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

  stop() {
    return this.client.stop();
  }

  destory() {
    this.client.destory();
  }

  /// events
  onTracks(tracks) {
    Log.log(tracks);
    this.tracks = tracks;
    if (
      tracks[0].type === PayloadType.TS ||
      tracks[0].type === PayloadType.PS
    ) {
      this.isContainer = true;
    } else {
      this.isContainer = false;
      this.seekable = this.client.seekable;
      this.duration = this.client.duration;
      this._decideMSE();
      if (this.useMSE) {
        this.eventSource.dispatchEvent("tracks", tracks);
      } else {
        this.eventSource.dispatchEvent("loadedmetadata");
      }
    }
  }

  onTsTracks(tracks) {
    Log.log(tracks);
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
      this._onTracksReady(tracks);
    }
  }

  _onTracksReady(tracks) {
    this.seekable = this.client.seekable;
    this.duration = this.client.duration;

    this._decideMSE();

    if (this.useMSE) {
      this.eventSource.dispatchEvent("tracks", tracks);
    } else {
      this.eventSource.dispatchEvent("loadedmetadata");
    }
  }

  /// MSE  accessunit event notify
  onSample(accessunit) {
    Log.debug("on sample!");
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
        this._onTracksReady(tracks);
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

    track.sampleQueue.push(accessunit);
    let sample = track.sampleQueue.shift();
    while (sample) {
      this.eventSource.dispatchEvent("sample", sample);
      sample = track.sampleQueue.shift();
    }
  }

  onClear() {
    this.buffering = false;
    Log.log("onClear!");
  }

  onDisconnect() {
    this.buffering = false;
    Log.log("onDisconnect!");
  }

  process(callback) {
    let tracks = null;
    if (this.isContainer) {
      tracks = this.tracks[0];
    } else {
      tracks = this.tracks;
    }

    for (const track of tracks) {
      if (track.ptype === PayloadType.H264 && track.sps && track.pps) {
        this.loadedVideoMetadata = true;
      } else if (
        track.ptype === PayloadType.H265 &&
        track.vps &&
        track.sps &&
        track.pps
      ) {
        this.loadedVideoMetadata = true;
      } else if (track.type === "audio") {
        this.loadedAudioMetadata = true;
      }
    }

    if (this.hasVideo && this.loadedVideoMetadata && !this.hasAudio) {
      this.loadedAllMetadata = true;
    } else if (
      this.hasVideo &&
      this.loadedVideoMetadata &&
      this.hasAudio &&
      this.loadedAudioMetadata
    ) {
      this.loadedAudioMetadata = true;
    } else if (!this.hasVideo && this.hasAudio && this.loadedAudioMetadata) {
      this.loadedAudioMetadata = true;
    }

    if (this.loadedAllMetadata) {
    }
  }

  discardFrame(callback) {
    Log.log("Discard video frame!");
  }

  discardAudio(callback) {
    Log.log("Discard audio frame!");
  }

  _getCacheLength() {
    let cachesize = 0;
    if (this.frameBuffers.length > 0) {
      for (const frame of this.frameBuffers) {
        cachesize += frame.timestamp;
      }
    }
    return cachesize;
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

  _decideMSE() {
    let tracks = null;
    if (this.isContainer) {
      tracks = tracks[0].tracks;
    } else {
      tracks = this.tracks;
    }
    Log.log(tracks);
    let codecs = "";
    for (const track of tracks) {
      codecs += track.codecs;
    }
    Log.log(`codec:${codecs}`);
    if (MSE.isSupported(codecs)) {
      this.useMSE = true;
      this.remux = new Remuxer(this.video);
      this.remux.attachClient(this);
    }
  }

  _getAudioInfo() {}

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
}
