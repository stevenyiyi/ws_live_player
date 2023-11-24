import { getTagged } from "../utils/logger.js";
import { H265Parser } from "../parsers/h265.js";
import { BaseRemuxer } from "./base-remuxer.js";
import { HEVC_NALU } from "../parsers/nalu-hevc.js";

const Log = getTagged("remuxer:h265");

export class H265Remuxer extends BaseRemuxer {
  constructor(timescale, scaleFactor = 1, drainDuration, params = {}) {
    super(timescale, scaleFactor, drainDuration);
   
    this.readyToDecode = false;
    this.initialized = false;

    this.firstDTS = 0;
    this.firstPTS = 0;
    this.lastDTS = undefined;
    
    this.tsAlign = Math.round(this.timescale / 60);
    this.mp4track = {
      id: BaseRemuxer.getTrackID(),
      type: "video",
      len: 0,
      fragmented: true,
      vps: "",
      sps: "",
      pps: "",
      width: 0,
      height: 0,
      timescale: timescale,
      duration: 0,
      segmentDuration: 0,
      samples: [] /** mp4 samples */,
    };
    this.samples = [];
    this.lastGopDTS = -99999999999999;
    this.gop = [];
    this.firstUnit = true;

    this.h265 = new H265Parser(this.mp4track);

    if (params.vps) {
      let arr = new Uint8Array(params.vps);
      let type = (arr[0] >>> 1) & 0x3f;
      if (type === HEVC_NALU.VPS) {
        this.setVPS(arr);
      } else {
        Log.warn("bad VPS in SDP!");
      }
    }

    if (params.sps) {
      let arr = new Uint8Array(params.sps);
      let type = (arr[0] >>> 1) & 0x3f;
      if (type === HEVC_NALU.SPS) {
        this.setSPS(arr);
      } else {
        Log.warn("bad SPS in SDP");
      }
    }

    if (params.pps) {
      let arr = new Uint8Array(params.pps);
      let type = (arr[0] >>> 1) & 0x3f;
      if (type === HEVC_NALU.PPS) {
        this.setPPS(arr);
      } else {
        Log.warn("bad PPS in SDP");
      }
    }

    if (this.mp4track.vps && this.mp4track.sps && this.mp4track.pps) {
      this.readyToDecode = true;
    }
  }

  _scaled(timestamp) {
    return timestamp >>> this.scaleFactor;
  }

  _unscaled(timestamp) {
    return timestamp << this.scaleFactor;
  }

  setVPS(vps) {
    this.h265.parseVPS(vps);
  }

  setSPS(sps) {
    this.h265.parseSPS(sps);
  }

  setPPS(pps) {
    this.h265.parsePPS(pps);
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
        this.mp4track.len += super.remux.call(this, unit)
      }
      this.gop = [];
      this.lastGopDTS = nalu.dts;
    }
    let push = this.h265.parseNAL(nalu);
    if (push) {
      this.gop.push(nalu);
    }
    if (
      !this.readyToDecode &&
      this.mp4track.vps &&
      this.mp4track.sps &&
      this.mp4track.pps
    ) {
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

    // Log.debug(this.samples.map((e)=>{
    //     return Math.round((e.dts - this.initDTS));
    // }));

    // let minDuration = Number.MAX_SAFE_INTEGER;
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
