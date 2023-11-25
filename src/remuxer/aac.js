import { getTagged } from "../utils/logger.js";
import { MSE } from "../presentation/mse.js";
import { BaseRemuxer } from "./base-remuxer.js";

const Log = getTagged("remuxer:aac");
// TODO: asm.js
export class AACRemuxer extends BaseRemuxer {
  constructor(timescale, scaleFactor = 1, drainDuration, params = {}) {
    super(timescale, scaleFactor, drainDuration);

    this.codecstring = MSE.CODEC_AAC;
    this.units = [];
    this.initDTS = undefined;
    this.nextDts = undefined;
    this.lastPts = 0;
    this.firstDTS = 0;
    this.firstPTS = 0;
    this.duration = params.duration || 1;
    this.initialized = false;

    this.mp4track = {
      id: BaseRemuxer.getTrackID(),
      type: "audio",
      fragmented: true,
      channelCount: 0,
      audiosamplerate: 0,
      duration: 0,
      segmentDuration: 0,
      timescale: timescale,
      volume: 1,
      samples: [],
      config: "",
      len: 0,
      defaultSampleDuration: 0,
      defaultSampleSize: 0
    };
    if (params.config) {
      this.setConfig(params.config);
    }
  }

  setConfig(config) {
    this.mp4track.channelCount = config.channels;
    this.mp4track.audiosamplerate = config.samplerate;
    this.mp4track.config = config.config;
    this.mp4track.codec = config.codec;
    this.readyToDecode = true;
  }

  remux(aac) {
    this.mp4track.len += super.remux.call(this, aac);
  }

  getPayload() {
    if (!this.readyToDecode || !this.samples.length) return null;

    let payload = new Uint8Array(this.mp4track.len);
    let offset = 0;
    let samples = this.mp4track.samples;
    let mp4Sample, lastDTS, pts, dts;

    while (this.samples.length) {
      let sample = this.samples.shift();
      let unit = sample.unit;
      pts = sample.pts - this.initDTS;
      dts = sample.dts - this.initDTS;

      mp4Sample = {
        size: unit.getSize(),
        cts: 0,
        duration: sample.duration,
        flags: {
          isLeading: 0,
          dependsOn: 2,
          isDependedOn: 0,
          paddingValue: 0,
          hasRedundancy: 0,
          degradPrio: 0,
          isNonSync: 0,
        },
      };

      payload.set(unit.getData(), offset);
      offset += unit.getSize();
      samples.push(mp4Sample);
     
      if (lastDTS === undefined) {
        this.firstDTS = dts;
        this.firstPTS = pts;
        ///Log.debug(`AAC first dts:${this.firstDTS}`);
      }
      lastDTS = dts;
    }
    if (!samples.length) return null;
    return payload;
  }
}
