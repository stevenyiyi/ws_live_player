import { getTagged } from "../utils/logger.js";

const Log = getTagged("remuxer:base");
let track_id = 1;
export class BaseRemuxer {
  static get MP4_TIMESCALE() {
    return 90000;
  }

  // TODO: move to ts parser
  // static PTSNormalize(value, reference) {
  //
  //     let offset;
  //     if (reference === undefined) {
  //         return value;
  //     }
  //     if (reference < value) {
  //         // - 2^33
  //         offset = -8589934592;
  //     } else {
  //         // + 2^33
  //         offset = 8589934592;
  //     }
  //     /* PTS is 33bit (from 0 to 2^33 -1)
  //      if diff between value and reference is bigger than half of the amplitude (2^32) then it means that
  //      PTS looping occured. fill the gap */
  //     while (Math.abs(value - reference) > 4294967296) {
  //         value += offset;
  //     }
  //     return value;
  // }

  static getTrackID() {
    return track_id++;
  }

  constructor(timescale, scaleFactor, drainDuration) {
    this.timeOffset = 0;
    this.timescale = timescale;
    this.scaleFactor = scaleFactor;
    this.readyToDecode = false;
    this.samples = [];
    this.seq = 1;
    this.tsAlign = 1;
    this.duration = 0;
    this.defaultSampleDuration = 0;
    this.pendingUnit = null;
    this.onSegment = null;
    this.drainDuration = drainDuration; /// ms
    Log.debug(`Draining duration:${drainDuration}`);
  }

  scaled(timestamp) {
    return timestamp / this.scaleFactor;
  }

  unscaled(timestamp) {
    return timestamp * this.scaleFactor;
  }

  checkDrainSamples() {
    return BaseRemuxer.toMS(this.mp4track.segmentDuration)  >= this.drainDuration ? true : false;
  }

  remux(unit) {
    if (unit) {
      let len = 0;
      if (!this.pendingUnit) {
        this.pendingUnit = unit;
      } else {
        let dur = unit.dts - this.pendingUnit.dts;
        this.samples.push({
          unit: this.pendingUnit,
          pts: this.pendingUnit.pts,
          dts: this.pendingUnit.dts,
          duration: dur,
          cts: this.pendingUnit.pts - this.pendingUnit.dts,
        });
        len = this.pendingUnit.getSize();
   
        if(!this.defaultSampleDuration) {
          this.defaultSampleDuration = BaseRemuxer.toMS(dur);
          Log.debug(`default sample duration:${this.defaultSampleDuration}`);
        }
        if(this.mp4track.sps && dur >= 90000) {
          Log.warn(`Invalid h264 sample duration:${BaseRemuxer.toMS(dur)},previous dts:${this.pendingUnit.dts},current dts:${unit.dts}`);
        }
        this.mp4track.segmentDuration += dur;
        this.pendingUnit = unit;
      }
      return len;
    }
    return 0;
  }

  static toMS(timestamp) {
    return timestamp * 1000 / BaseRemuxer.MP4_TIMESCALE;
  }

  setConfig(config) {}

  insertDscontinuity(dts) {
    this.pendingUnit = null;
    this.samples = [];
    this.mp4track.len = 0;
    this.mp4track.segmentDuration = 0;
   /// this.mp4track.seq = dts / (this.drainDuration * 90);
    Log.debug("insertDscontinuity");

  }

  init(initPTS, initDTS, shouldInitialize = true) {
    this.initPTS = Math.min(initPTS, this.samples[0].dts);
    this.initDTS = Math.min(initDTS, this.samples[0].dts);
    Log.debug(
      `Initial pts=${this.initPTS} dts=${this.initDTS} offset=${this.unscaled(
        this.timeOffset,
      )}`,
    );
    this.initialized = shouldInitialize;
  }

  cacheSize() {
    let duration = 0;
    for (const sample of this.samples) {
      duration += sample.duration;
    }
    if (duration > 0) {
      /** Convert to ms */
      duration = BaseRemuxer.toMS(duration);
    }
    return duration;
  }

  flush() {
    this.seq++;
    this.mp4track.len = 0;
    this.mp4track.segmentDuration = 0;
    this.mp4track.samples = [];
  }

  static dtsSortFunc(a, b) {
    return a.dts - b.dts;
  }

  static groupByDts(gop) {
    const groupBy = (xs, key) => {
      return xs.reduce((rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };
    return groupBy(gop, "dts");
  }

  getPayloadBase(sampleFunction, setupSample) {
    if (!this.readyToDecode || !this.initialized || !this.samples.length)
      return null;
    this.samples.sort(BaseRemuxer.dtsSortFunc);
    return true;
  }
}
