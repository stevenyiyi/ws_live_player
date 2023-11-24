import { getTagged } from "../utils/logger.js";
import { H264Parser } from "../parsers/h264.js";
import { BaseRemuxer } from "./base-remuxer.js";

const Log = getTagged("remuxer:h264");
// TODO: asm.js
export class H264Remuxer extends BaseRemuxer {
  constructor(timescale, scaleFactor = 1, drainDuration, params = {}) {
    super(timescale, scaleFactor, drainDuration);
    this.firstDTS = 0;
    this.firstPTS = 0;
    this.readyToDecode = false;
    this.initialized = false;
    this.lastDTS = undefined;
   
    // this.timescale = 90000;
    this.tsAlign = Math.round(this.timescale / 60);

    this.mp4track = {
      id: BaseRemuxer.getTrackID(),
      type: "video",
      len: 0,
      fragmented: true,
      sps: "",
      pps: "",
      width: 0,
      height: 0,
      timescale: timescale,
      duration: 0,
      segmentDuration: 0,
      samples: [],
    };
    this.samples = [];
    this.lastGopDTS = -99999999999999;
    this.gop = [];

    this.h264 = new H264Parser(this.mp4track);

    if (params.sps) {
      let arr = new Uint8Array(params.sps);
      if ((arr[0] & 0x1f) === 7) {
        this.setSPS(arr);
      } else {
        Log.warn("bad SPS in SDP");
      }
    }
    if (params.pps) {
      let arr = new Uint8Array(params.pps);
      if ((arr[0] & 0x1f) === 8) {
        this.setPPS(arr);
      } else {
        Log.warn("bad PPS in SDP");
      }
    }

    if (this.mp4track.pps && this.mp4track.sps) {
      this.readyToDecode = true;
    }
  }

  _scaled(timestamp) {
    return timestamp >>> this.scaleFactor;
  }

  _unscaled(timestamp) {
    return timestamp << this.scaleFactor;
  }

  setSPS(sps) {
    this.h264.parseSPS(sps);
  }

  setPPS(pps) {
    this.h264.parsePPS(pps);
  }

  insertDscontinuity(dts) {
    super.insertDscontinuity(dts);
    this.lastGopDTS = -99999999999999;
    this.gop = [];
  }

  remux(nalu) {
    if (this.lastGopDTS < nalu.dts) {
      this.gop.sort(BaseRemuxer.dtsSortFunc);

      if (this.gop.length > 1) {
        // Aggregate multi-slices which belong to one frame
        const groupedGop = BaseRemuxer.groupByDts(this.gop);
        this.gop = Object.values(groupedGop).map((group) => {
          return group.reduce((preUnit, curUnit) => {
            const naluData = curUnit.getData();
            naluData.set(new Uint8Array([0x0, 0x0, 0x0, 0x1]));
            preUnit.appendData(naluData);
            return preUnit;
          });
        });
      }

      for (let unit of this.gop) {
        this.mp4track.len += super.remux.call(this, unit);
      }
      this.gop = [];
      this.lastGopDTS = nalu.dts;
    }

    let push = this.h264.parseNAL(nalu);
    if (push) {
      this.gop.push(nalu);
    }
    if (!this.readyToDecode && this.mp4track.pps && this.mp4track.sps) {
      this.readyToDecode = true;
    }
  }

  getPayload() {
    if (!this.getPayloadBase()) {
      return null;
    }

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
        duration: sample.duration,
        cts: sample.cts,
        flags: {
          isLeading: 0,
          dependsOn: 0,
          isDependedOn: 0,
          paddingValue: 0,
          hasRedundancy: 0,
          degradPrio: 0,
          isNonSync: 0,
        },
      };
      let flags = mp4Sample.flags;
      if (sample.unit.isKeyframe() === true) {
        // the current sample is a key frame
        flags.dependsOn = 2;
        flags.isDependedOn = 1;
        flags.isNonSync = 0;
      } else {
        flags.dependsOn = 1;
        flags.isDependedOn = 1;
        flags.isNonSync = 1;
      }

      payload.set(unit.getData(), offset);
      offset += unit.getSize();
      samples.push(mp4Sample);
      
      if (lastDTS === undefined) {
        this.firstDTS = dts;
        this.firstPTS = pts;
        ///Log.debug(`AVC fitst dts:${this.firstDTS}`);
      }
      lastDTS = dts;
    }

    if (!samples.length) return null;
    return payload;
  }
}
