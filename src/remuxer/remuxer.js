import { EventEmitter, EventSourceWrapper } from "../utils/event.js";
import { getTagged } from "../utils/logger.js";
import { MP4 } from "../iso-bmff/mp4-generator.js";
import { AACRemuxer } from "./aac.js";
import { H264Remuxer } from "./h264.js";
import { H265Remuxer } from "./h265.js";
import { MSE } from "../presentation/mse.js";
import { PayloadType } from "../StreamDefine.js";
import { ASMediaError } from "../api/ASMediaError.js";

const LOG_TAG = "remuxer";
const Log = getTagged(LOG_TAG);

export class Remuxer {
  static get TrackConverters() {
    return {
      [PayloadType.H264]: H264Remuxer,
      [PayloadType.H265]: H265Remuxer,
      [PayloadType.AAC]: AACRemuxer,
    };
  }

  static get TrackScaleFactor() {
    return {
      [PayloadType.H264]: 1,
      [PayloadType.H265]: 1,
      [PayloadType.AAC]: 1,
    };
  }

  static get TrackTimescale() {
    return {
      [PayloadType.H264]: 90000,
      [PayloadType.H265]: 90000,
      [PayloadType.AAC]: 90000,
    };
  }

  constructor(mediaElement) {
    this.mse = new MSE([mediaElement]);
    this.eventSource = new EventEmitter();
    this.mseEventSource = new EventSourceWrapper(this.mse.eventSource);
    this.mse_ready = true;

    this.reset();
    this.errorListener = this.mseError.bind(this);
    this.closeListener = this.mseClose.bind(this);
    this.errorDecodeListener = this.mseErrorDecode.bind(this);

    this.eventSource.addEventListener("ready", this.init.bind(this));
  }

  initMSEHandlers() {
    this.mseEventSource.on("error", this.errorListener);
    this.mseEventSource.on("sourceclosed", this.closeListener);
    this.mseEventSource.on("errordecode", this.errorDecodeListener);
  }

  async reset() {
    this.tracks = {};
    this.initialized = false;
    this.initSegments = {};
    this.codecs = [];
    this.streams = {};
    this.enabled = false;
    await this.mse.clear();
    this.initMSEHandlers();
  }

  destroy() {
    /// this.mseEventSource.destroy();
    this.mse.destroy();
    this.mse = null;

    this.detachClient();

    this.eventSource.destroy();
  }

  onTracks(tracks) {
    Log.debug(`ontracks: `, tracks.detail);
    // store available track types
    tracks.detail.forEach((track, key, tracks) => {
      this.tracks[track.type] = new Remuxer.TrackConverters[track.type](
        Remuxer.TrackTimescale[track.type],
        Remuxer.TrackScaleFactor[track.type],
        this.client.cacheSize,
        track.params,
      );
      if (track.offset) {
        this.tracks[track.type].timeOffset = track.offset;
      }
      if (track.duration) {
        this.tracks[track.type].mp4track.duration =
          track.duration *
          (this.tracks[track.type].timescale ||
            Remuxer.TrackTimescale[track.type]);
        this.tracks[track.type].duration = track.duration;
      } else {
        this.tracks[track.type].duration = 1;
      }
    });
    // this.tracks[track.type].duration
    this.mse.setLive(!this.client.seekable);
  }

  setTimeOffset(timeOffset, track) {
    if (this.tracks[track.type]) {
      this.tracks[track.type].timeOffset = timeOffset; ///this.tracks[track.type].scaleFactor;
    }
  }

  get MSE() {
    return this.mse;
  }

  init() {
    let tracks = [];
    this.codecs = [];
    let initmse = [];
    let initPts = Infinity;
    let initDts = Infinity;
    let hasavc = true;
    for (let track_type in this.tracks) {
      let track = this.tracks[track_type];
      if (!MSE.isSupported([track.mp4track.codec])) {
        throw new Error(
          `${track.mp4track.type} codec ${track.mp4track.codec} is not supported`,
        );
      }
      tracks.push(track.mp4track);
      this.codecs.push(track.mp4track.codec);
      track.init(initPts, initDts /*, false*/);
      if (track.mp4track.type === "video") {
        if (track.mp4track.vps) {
          hasavc = false;
        }
      }
    }

    for (let track_type in this.tracks) {
      let track = this.tracks[track_type];
      //track.init(initPts, initDts);
      this.initSegments[track_type] = MP4.initSegment(
        hasavc,
        [track.mp4track],
        track.duration * track.timescale,
        track.timescale,
      );
      initmse.push(this.initMSE(track_type, track.mp4track.codec));
    }
    this.initialized = true;
    return Promise.all(initmse).then(() => {
      //this.mse.play();
      this.enabled = true;
    });
  }

  initMSE(track_type, codec) {
    if (MSE.isSupported(this.codecs)) {
      return this.mse
        .setCodec(
          track_type,
          `${PayloadType.map[track_type]}/mp4; codecs="${codec}"`,
        )
        .then(() => {
          this.mse.feed(track_type, this.initSegments[track_type]);
          // this.mse.play();
          // this.enabled = true;
        });
    } else {
      this.eventSource.dispatchEvent(
        "error",
        new ASMediaError(
          ASMediaError.MEDIA_ERR_DECODE,
          `Codecs:${this.codecs} are not supported`,
        ),
      );
    }
  }

  mseError(e) {
    this.eventSource.dispatchEvent(
      "error",
      new ASMediaError(ASMediaError.MEDIA_ERR_DECODE, e),
    );
  }

  mseClose() {
    this.eventSource.dispatchEvent(
      "error",
      new ASMediaError(ASMediaError.MEDIA_ERR_DECODE, "mse closed!"),
    );
  }

  mseErrorDecode() {
    if (this.tracks[2]) {
      console.warn(this.tracks[2].mp4track.type);
      this.mse.buffers[2].destroy();
      delete this.tracks[2];
    }
  }

  initMoov() {
    if (Object.keys(this.tracks).length) {
      for (let track_type in this.tracks) {
        if (
          !this.tracks[track_type].readyToDecode ||
          !this.tracks[track_type].samples.length
        )
          return;
        Log.debug(
          `Init MSE for track ${this.tracks[track_type].mp4track.type}`,
        );
      }
      this.eventSource.dispatchEvent("ready");
    }
  }

  flush() {
    this.onSamples();

    if (!this.initialized) {
      // Log.debug(`Initialize...`);
      if (Object.keys(this.tracks).length) {
        for (let track_type in this.tracks) {
          if (
            !this.tracks[track_type].readyToDecode ||
            !this.tracks[track_type].samples.length
          )
            return;
          Log.debug(
            `Init MSE for track ${this.tracks[track_type].mp4track.type}`,
          );
        }
        this.eventSource.dispatchEvent("ready");
      }
    } else {
      for (let track_type in this.tracks) {
        let track = this.tracks[track_type];
        let pay = track.getPayload();
        if (pay && pay.byteLength) {
          let moof = MP4.moof(track.seq, track.scaled(track.firstDTS), track.mp4track);
          let mdat = MP4.mdat(pay);
          let referenceSize = moof.byteLength + mdat.byteLength;
          this.mse.feed(track_type, [
            MP4.sidx(track.firstPTS, track.mp4track, referenceSize),
            moof,
            mdat,
          ]);
          track.flush();
        }
      }
    }
  }

  onSamples(ev) {
    // TODO: check format
    let accessunit = ev.detail;
    let type = accessunit.ctype;
    let track = this.tracks[type];
    if(track) {
      if (!this.initialized) {
        this.initMoov();
      }
      if (accessunit.discontinuity) {
        Log.debug(`discontinuity, dts:${accessunit.dts}, unit dts:${accessunit.units[0].dts}`);
        this.MSE.abort(type);
        track.insertDscontinuity();
      }
      for (const unit of accessunit.units) {
        track.remux(unit);
      }
      if(this.initialized && track.checkDrainSamples()) {
        /// Draining sample to MSE
        let pay = track.getPayload();
        if (pay && pay.byteLength) {
          let moof = MP4.moof(track.seq, track.scaled(track.firstDTS), track.mp4track);
          let mdat = MP4.mdat(pay);
          let referenceSize = moof.byteLength + mdat.byteLength;
          this.mse.feed(type, [
            MP4.sidx(track.firstPTS, track.mp4track, referenceSize),
            moof,
            mdat,
          ]);
          track.flush();
      }
    }
  }
}

  onAudioConfig(ev) {
    if (this.tracks[ev.detail.pay]) {
      this.tracks[ev.detail.pay].setConfig(ev.detail.config);
    }
  }

  attachClient(client) {
    this.detachClient();
    this.client = client;
    this.clientEventSource = new EventSourceWrapper(this.client.eventSource);
    this.clientEventSource.on("samples", this.onSamples.bind(this));
    this.clientEventSource.on("tracks", this.onTracks.bind(this));
    this.clientEventSource.on("flush", this.flush.bind(this));
    this.clientEventSource.on("clear", () => {
      this.reset();
      this.mse.clear().then(() => {
        //this.mse.play();
        this.initMSEHandlers();
      });
    });
  }

  detachClient() {
    if (this.client) {
      this.clientEventSource.destroy();
      // this.client.eventSource.removeEventListener('samples', this.onSamples.bind(this));
      // this.client.eventSource.removeEventListener('audio_config', this.onAudioConfig.bind(this));
      // // TODO: clear other listeners
      // this.client.eventSource.removeEventListener('clear', this._clearListener);
      // this.client.eventSource.removeEventListener('tracks', this._tracksListener);
      // this.client.eventSource.removeEventListener('flush', this._flushListener);
      this.client = null;
    }
  }
}
