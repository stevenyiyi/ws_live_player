import { getTagged } from "../utils/logger.js";
import { BaseStream } from "../BaseStream.js";
import { PayloadType } from "../StreamDefine.js";
import { Remuxer } from "../remuxer/remuxer.js";
import { MSE } from "../presentation/mse.js";
import { H264Parser } from "../parsers/h264.js";
import { H265Parser } from "../parsers/h265.js";
import AudioFeeder from "../audio-feeder/audio-feeder";

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
    this.hasBFrames = false;

    this.loadedMetadata = false;
    this.processingTimer = 0;
    this.flushIter = 0;

    this.loadedAudioMetadata = false;
    this.loadedVideoMetadata = false;
    this.loadedAllMetadata = false;

    this.onseek = null;

    this.audioBuffers = [];
    this.videoBuffers = [];

    this.videoBytes = 0;
    this.audioBytes = 0;
    this.firstAudioPts = -1;
    this.firstVideoPts = -1;
    this.lastKeyframeTimestamp = -1;

    this.work = new Worker("RTSPStreamWork.js");
    this.work.onmessage = (event) => {
      if (event.data.event === "onTracks") {
        this.seekable = event.data.seekable;
        this.duration = event.data.duration;
        this.onTracks(event.data.tracks);
      } else if (event.data.event === "onTsTracks") {
        this.seekable = event.data.seekable;
        this.duration = event.data.duration;
        this.onTsTracks(event.data.tracks);
      } else if (event.data.event === "onSamples") {
        this.onSample(event.data.samples);
      } else if (event.data.event === "onAudioBuffer") {
        this.onAudioBuffer({
          pts: event.data.pts,
          dts: event.data.dts,
          sample: event.data.sample
        });
      } else if (event.data.event === "onFrameBuffer") {
        this.onFrameBuffer({
          pts: event.data.pts,
          dts: event.data.dts,
          sample: event.data.sample
        });
      } else if (event.data.event === "onDisconnect") {
        this.onDisconnect();
      } else if (event.data.event === "onClear") {
        this.onClear();
      }
    };
    return this;
  }

  /// Public methods

  /// Override method, return Promise
  load(url) {
    this.work.postMessage({
      method: "load",
      params: { wsurl: this.wsurl, rtspurl: url }
    });
    this.buffering = true;
  }

  abort() {
    this.work.postMessage({
      method: "abort"
    });
  }

  /// events
  onTracks(tracks) {
    Log.log(tracks);
    this.tracks = tracks;
    if (
      tracks[0].ptype === PayloadType.TS ||
      tracks[0].ptype === PayloadType.PS
    ) {
      this.isContainer = true;
    } else {
      this.hasBFrames = this._getHasBFrames();
      this._decideMSE();
      this.work.postMessage({
        method: "onSupportedMSE",
        params: { result: this.useMSE }
      });
      if (this.useMSE) {
        this.eventSource.dispatchEvent("tracks", tracks);
      } else {
        this.processingTimer = setInterval(() => {
          this.process();
        }, 10);
      }
    }
  }

  onTsTracks(tracks) {
    this.tracks[0].tracks = tracks;
    this.hasBFrames = this._getHasBFrames();
    this._decideMSE();
    this.work.postMessage({
      method: "onSupportedMSE",
      params: { result: this.useMSE }
    });
    if (this.useMSE) {
      this.eventSource.dispatchEvent("tracks", tracks);
    } else {
      this.processingTimer = setInterval(() => {
        this.process();
      }, 10);
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
      return;
    }

    let track = null;
    /// Find track
    if (
      this.tracks[0].ptype === PayloadType.TS ||
      this.tracks[0].ptype === PayloadType.PS
    ) {
      for (const t of this.tracks[0].tracks) {
        if (t.ptype === accessunit.ctype) {
          track = t;
          break;
        }
      }
    } else {
      for (const t of this.tracks) {
        if (t.ptype === accessunit.ctype) {
          track = t;
          break;
        }
      }
    }

    if (!track) {
      return;
    }

    if (track.ptype === PayloadType.H264 && (!track.sps || !track.pps)) {
      if (!track.parser) {
        track.parser = new H264Parser(track);
      }
      for (const frame of accessunit.units) {
        track.parser.parseNAL(frame);
      }
    } else if (
      track.ptype === PayloadType.H265 &&
      (!track.vps || !track.sps || !track.pps)
    ) {
      if (!track.parser) {
        track.parser = new H265Parser(track);
      }
      for (const frame of accessunit.units) {
        track.parser.parseNAL(frame);
      }
    }
    if (this.firstVideoPts === -1 && track.type === "video") {
      this.firstVideoPts = accessunit.pts;
    } else if (this.firstAudioPts === -1 && track.type === "audio") {
      this.firstAudioPts = accessunit.pts;
    }
    track.sampleQueue.push(accessunit);
  }

  onAudioBuffer(sample) {
    if (this.firstAudioPts < 0) {
      this.firstAudioPts = sample.pts;
      this._initAudioFeeder();
    }
    this.audioBuffers.push(sample);
  }

  onFrameBuffer(sample) {
    if (this.firstVideoPts < 0) {
      this.firstVideoPts = sample.pts;
    }
    this.videoBuffers.push(sample);
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
        if (!this.videoDecoder) {
          this._loadVideoCodec(() => {
            this.loadedVideoMetadata = true;
            finish(true);
          });
        }
      } else if (track.type === "audio") {
        if (!this.audioDecoder) {
          this._loadAudioCodec(() => {
            this.loadedAudioMetadata = true;
            finish(true);
          }, track.ptype);
        }
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

  discardFrame(callback) {}

  discardAudio(callback) {}

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

    let codecs = "";
    for (const track of tracks) {
      codecs += track.codecs;
    }

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

  _initAudioFeeder() {
    let audioOptions = {
      /// Buffer in largeish chunks to survive long CPU spikes on slow CPUs (eg, 32-bit iOS)
      bufferSize: 8192
    };
    let audioFeeder = (this._audioFeeder = new AudioFeeder(audioOptions));
    audioFeeder.init(this._audioInfo.channels, this._audioInfo.rate);
  }
}
