import {getTagged} from '../utils/logger.js';

const Log = getTagged('remuxer:base');
let track_id = 1;
export class BaseRemuxer {

    static get MP4_TIMESCALE() { return 90000;}

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

    constructor(timescale, scaleFactor, params) {
        this.timeOffset = 0;
        this.timescale = timescale;
        this.scaleFactor = scaleFactor;
        this.readyToDecode = false;
        this.samples = [];
        this.seq = 1;
        this.tsAlign = 1;
    }

    scaled(timestamp) {
        return timestamp / this.scaleFactor;
    }

    unscaled(timestamp) {
        return timestamp * this.scaleFactor;
    }

    remux(unit) {
        if (unit) {
            this.samples.push({
                unit: unit,
                pts: unit.pts,
                dts: unit.dts
            });
            return true;
        }
        return false;
    }

    static toMS(timestamp) {
        return timestamp/90;
    }
    
    setConfig(config) {
        
    }

    insertDscontinuity() {
        this.samples.push(null);
    }

    init(initPTS, initDTS, shouldInitialize=true) {
        this.initPTS = Math.min(initPTS, this.samples[0].dts /*- this.unscaled(this.timeOffset)*/);
        this.initDTS = Math.min(initDTS, this.samples[0].dts /*- this.unscaled(this.timeOffset)*/);
        Log.debug(`Initial pts=${this.initPTS} dts=${this.initDTS} offset=${this.unscaled(this.timeOffset)}`);
        this.initialized = shouldInitialize;
    }

    flush() {
        this.seq++;
        this.mp4track.len = 0;
        this.mp4track.samples = [];
    }

    static dtsSortFunc(a,b) {
        return (a.dts-b.dts);
    }

    static groupByDts(gop) {
        const groupBy = (xs, key) => {
            return xs.reduce((rv, x) => {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        return groupBy(gop, 'dts');
    }

    getPayloadBase(sampleFunction, setupSample) {
        if (!this.readyToDecode || !this.initialized || !this.samples.length) return null;
        this.samples.sort(BaseRemuxer.dtsSortFunc);
        return true;
    }
}