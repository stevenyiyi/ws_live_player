import { getTagged } from "../utils/logger.js";
import { H265Parser } from "../parsers/h265.js";
import { BaseRemuxer } from "./base-remuxer.js";
import { HEVC_NALU } from "../parsers/nalu-hevc.js";

const Log = getTagged("remuxer:h265");

export class H265Remuxer extends BaseRemuxer {
  constructor(timescale, scaleFactor = 1, params = {}) {
    super(timescale, scaleFactor);
    this.nextDts = undefined;
    this.readyToDecode = false;
    this.initialized = false;

    this.firstDTS = 0;
    this.firstPTS = 0;
    this.lastDTS = undefined;
    this.lastSampleDuration = 0;
    this.lastDurations = [];
    // this.timescale = 90000;
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
      duration: timescale,
      samples: [] /** mp4 samples */
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
        if (super.remux.call(this, unit)) {
          this.mp4track.len += unit.getSize();
        }
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
      if (sample === null) {
        // discontinuity
        this.nextDts = undefined;
        break;
      }

      let unit = sample.unit;

      pts = sample.pts - this.initDTS; ///*Math.round(*/(sample.pts - this.initDTS)/*/this.tsAlign)*this.tsAlign*/;
      dts = sample.dts - this.initDTS; ///*Math.round(*/(sample.dts - this.initDTS)/*/this.tsAlign)*this.tsAlign*/;
      // ensure DTS is not bigger than PTS
      dts = Math.min(pts, dts);
      // if not first HEVC sample of video track, normalize PTS/DTS with previous sample value
      // and ensure that sample duration is positive
      if (lastDTS !== undefined) {
        let sampleDuration = this.scaled(dts - lastDTS);
        // Log.debug(`Sample duration: ${sampleDuration}`);
        if (sampleDuration < 0) {
          Log.log(
            `invalid HEVC sample duration at PTS/DTS: ${pts}/${dts}|lastDTS: ${lastDTS}:${sampleDuration}`
          );
          this.mp4track.len -= unit.getSize();
          continue;
        }
        // minDuration = Math.min(sampleDuration, minDuration);
        this.lastDurations.push(sampleDuration);
        if (this.lastDurations.length > 100) {
          this.lastDurations.shift();
        }
        mp4Sample.duration = sampleDuration;
      } else {
        if (this.nextDts) {
          let delta = dts - this.nextDts;
          // if fragment are contiguous, or delta less than 600ms, ensure there is no overlap/hole between fragments
          if (
            /*contiguous ||*/ Math.abs(Math.round(BaseRemuxer.toMS(delta))) <
            600
          ) {
            if (delta) {
              // set DTS to next DTS
              // Log.debug(`Video/PTS/DTS adjusted: ${pts}->${Math.max(pts - delta, this.nextDts)}/${dts}->${this.nextDts},delta:${delta}`);
              dts = this.nextDts;
              // offset PTS as well, ensure that PTS is smaller or equal than new DTS
              pts = Math.max(pts - delta, dts);
            }
          } else {
            if (delta < 0) {
              Log.log(
                `skip frame from the past at DTS=${dts} with expected DTS=${this.nextDts}`
              );
              this.mp4track.len -= unit.getSize();
              continue;
            }
          }
        }
        // remember first DTS of our hevcSamples, ensure value is positive
        this.firstDTS = Math.max(0, dts);
      }

      mp4Sample = {
        size: unit.getSize(),
        duration: 0,
        cts: this.scaled(pts - dts),
        flags: {
          isLeading: 0,
          isDependedOn: 0,
          hasRedundancy: 0,
          degradPrio: 0,
          isNonSync: 0
        }
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
      lastDTS = dts;
    }

    if (!samples.length) return null;
    /** Average duration for samples */
    let avgDuration =
      (this.lastDurations.reduce(function (a, b) {
        return (a | 0) + (b | 0);
      }, 0) /
        (this.lastDurations.length || 1)) |
      0;
    if (samples.length >= 2) {
      this.lastSampleDuration = avgDuration;
      mp4Sample.duration = avgDuration;
    } else {
      mp4Sample.duration = this.lastSampleDuration;
    }

    if (
      samples.length &&
      (!this.nextDts ||
        navigator.userAgent.toLowerCase().indexOf("chrome") > -1)
    ) {
      let flags = samples[0].flags;
      // chrome workaround, mark first sample as being a Random Access Point to avoid sourcebuffer append issue
      // https://code.google.com/p/chromium/issues/detail?id=229412
      flags.dependsOn = 2;
      flags.isNonSync = 0;
    }

    // next HEVC sample DTS should be equal to last sample DTS + last sample duration
    this.nextDts = dts + this.unscaled(this.lastSampleDuration);
    // Log.debug(`next dts: ${this.nextDts}, last duration: ${this.lastSampleDuration}, last dts: ${dts}`);

    return new Uint8Array(payload.buffer, 0, this.mp4track.len);
  }
}
