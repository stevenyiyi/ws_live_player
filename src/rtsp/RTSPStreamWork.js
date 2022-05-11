/// RTSP stream web worker
import { getTagged } from "../utils/logger.js";
import { RTSPClient } from "./RTSPClient";
import { PayloadType } from "../StreamDefine";
import { WebsocketTransport } from "../websocket";
import { H264Parser } from "../parsers/h264.js";
import { H265Parser } from "../parsers/h265.js";
import ASLoader from "../ASLoaderWeb.js";
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
      tracks[0].ptype === PayloadType.TS ||
      tracks[0].ptype === PayloadType.PS
    ) {
      this.isContainer = true;
    } else {
      this.isContainer = false;
    }
    postMessage({
      event: "onTracks",
      seekable: this.client.seekable,
      duration: this.client.duration,
      tracks: tracks
    });
  }

  onTsTracks(tracks) {
    this.tracks[0].tracks = tracks;
    postMessage({
      event: "onTsTracks",
      seekable: this.client.seekable,
      duration: this.client.duration,
      tracks: tracks
    });
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
      Log.error("Receive accessunit, but not found track!");
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
    } else if (track.ptype === PayloadType.AAC && !track.config) {
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
    if (this.isReceviceMSE) {
      if (this.useMSE) {
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
      } else {
        /// Decode sample
        if (track.type === "video" && !this.videoDecoder) {
          this._loadVideoCodec(() => {
            let sample = track.sampleQueue.shift();
            while (sample) {
              this._decodeSample(track, sample);
              sample = track.sampleQueue.shift();
            }
          }, track.ptype);
        } else if (track.type === "audio" && !this.audioDecoder) {
          this._loadAudioCodec(() => {
            let sample = track.sampleQueue.shift();
            while (sample) {
              this._decodeSample(track, sample);
              sample = track.sampleQueue.shift();
            }
          }, track.ptype);
        } else {
          let sample = track.sampleQueue.shift();
          while (sample) {
            this._decodeSample(track, sample);
            sample = track.sampleQueue.shift();
          }
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

  _decodeSample(track, sample) {
    if (track.type === "audio") {
      this.audioDecoder.processAudio(sample, (ret) => {
        /// post audio buffer to audio-feeder
        postMessage(
          {
            event: "onAudioBuffer",
            pts: sample.pts,
            dts: sample.dts,
            sample: this.audioDecoder.audioBuffer
          },
          [this.audioDecoder.audioBuffer]
        );
      });
    } else if (track.type === "video") {
      this.videoDecoder.processFrame(sample, (ret) => {
        /// post video yuv buffer to yuv-cavans
        postMessage(
          {
            event: "onFrameBuffer",
            pts: sample.pts,
            dts: sample.dts,
            sample: this.videoDecoder.frameBuffer
          },
          [this.videoDecoder.frameBuffer]
        );
      });
    }
  }

  _loadAudioCodec(callback, ptype) {
    let audioClassMap = {
      alaw: "ASDecoderAudioAlawW",
      ulaw: "ASDecoderAudioUlawW",
      g723: "ASDecoderAudioG723W",
      g726: "ASDecoderAudioG726W",
      g729: "ASDecoderAudioG729W",
      aac: "ASDecoderAudioAacW"
    };

    let className = audioClassMap[PayloadType.stringCodec(ptype)];
    if (!className) {
      throw Error(`Not found audio codec:${ptype}`);
    }
    this.processing = true;
    ASLoader.loadClass(
      className,
      (audioCodecClass) => {
        let audioOptions = {};
        audioCodecClass(audioOptions).then((decoder) => {
          this.audioDecoder = decoder;
          decoder.init(() => {
            this.loadedAudioMetadata = decoder.loadedMetadata;
            this.processing = false;
            callback();
          });
        });
      },
      {
        work: this.options.work
      }
    );
  }

  _loadVideoCodec(callback, ptype) {
    let simd = !!this.options.simd,
      threading = !!this.options.threading;
    let videoClassMap = {
      avc: threading
        ? simd
          ? "ASDecoderVideoAvcSIMDMTW"
          : "ASDecoderVideoAvcMTW"
        : simd
        ? "ASDecoderVideoAvcSIMDW"
        : "ASDecoderVideoAvcW",
      hevc: threading
        ? simd
          ? "ASDecoderVideoHevcSIMDMTW"
          : "ASDecoderVideoHevcMTW"
        : simd
        ? "ASDecoderVideoHevcSIMDW"
        : "ASVDecoderVideoHevcW",
      av1: threading
        ? simd
          ? "ASDecoderVideoAV1SIMDMTW"
          : "ASVDecoderVideoAV1MTW"
        : simd
        ? "ASDecoderVideoAV1SIMDW"
        : "ASDecoderVideoAV1W"
    };

    let className = videoClassMap[PayloadType.stringCodec(ptype)];
    if (!className) {
      throw Error(`Not found video codec:${ptype}`);
    }

    this.processing = true;
    ASLoader.loadClass(
      className,
      (videoCodecClass) => {
        let audioOptions = {};
        videoCodecClass(audioOptions).then((decoder) => {
          this.videoDecoder = decoder;
          decoder.init(() => {
            this.loadedVideoMetadata = decoder.loadedMetadata;
            this.processing = false;
            callback();
          });
        });
      },
      {
        work: this.options.work && !this.options.threading
      }
    );
  }
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
