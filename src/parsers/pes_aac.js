import { getTagged } from "../utils/logger.js";
import { ADTS } from "./adts.js";
import { PayloadType } from "../StreamDefine.js";
import { MediaAccessunit } from "../MediaAccessunit.js";
const LOG_TAG = "parses:pes_aac";
const Log = getTagged(LOG_TAG);
export class AACPES {
  constructor(pesType) {
    this.pesType = pesType;
    this.aacOverFlow = null;
    this.lastAacPTS = null;
    this.track = {};
    this.config = null;
  }

  parse(pes) {
    let data = pes.data;
    let pts = pes.pts;
    let startOffset = 0;
    let aacOverFlow = this.aacOverFlow;
    let lastAacPTS = this.lastAacPTS;
    let frameDuration, frameIndex, offset, stamp, len;

    if (aacOverFlow) {
      var tmp = new Uint8Array(aacOverFlow.byteLength + data.byteLength);
      tmp.set(aacOverFlow, 0);
      tmp.set(data, aacOverFlow.byteLength);
      Log.debug(
        `append overflowing ${aacOverFlow.byteLength} bytes to beginning of new PES`
      );
      data = tmp;
    }

    // look for ADTS header (0xFFFx)
    for (offset = startOffset, len = pes.length; offset < len - 1; offset++) {
      if (data[offset] === 0xff && (data[offset + 1] & 0xf0) === 0xf0) {
        break;
      }
    }
    // if ADTS header does not start straight from the beginning of the PES payload, raise an error
    if (offset) {
      var reason, fatal;
      if (offset < len - 1) {
        reason = `PES did not start with ADTS header,offset:${offset}`;
        fatal = false;
      } else {
        reason = "no ADTS header found in AAC PES";
        fatal = true;
      }
      Log.error(reason);
      if (fatal) {
        return;
      }
    }

    let hdr = null;
    let res = new MediaAccessunit(PayloadType.AAC, 0, 0, []);
    if (!this.config) {
      hdr = ADTS.parseHeaderConfig(data.subarray(offset));
      this.config = hdr.config;
      res.config = hdr.config;
      hdr.config = null;
      Log.debug(
        `parsed codec:${this.config.codec},rate:${this.config.samplerate},nb channel:${this.config.channels}`
      );
    }
    frameIndex = 0;
    frameDuration = (1024 * 90000) / this.config.samplerate;

    // if last AAC frame is overflowing, we should ensure timestamps are contiguous:
    // first sample PTS should be equal to last sample PTS + frameDuration
    if (aacOverFlow && lastAacPTS) {
      var newPTS = lastAacPTS + frameDuration;
      if (Math.abs(newPTS - pts) > 1) {
        Log.debug(
          `align PTS for overlapping frames by ${Math.round(
            (newPTS - pts) / 90
          )}`
        );
        pts = newPTS;
      }
    }

    while (offset + 5 < len) {
      if (!hdr) {
        hdr = ADTS.parseHeader(data.subarray(offset));
      }
      Log.log(
        `pes size:${len}, aac header size:${hdr.size},offset:${hdr.offset}`
      );
      if (hdr.size > 0 && offset + hdr.offset + hdr.size <= len) {
        stamp = pts + frameIndex * frameDuration;
        res.pts = stamp;
        res.dts = stamp;
        res.units.push(
          data.subarray(offset + hdr.offset, offset + hdr.offset + hdr.size)
        );
        offset += hdr.offset + hdr.size;
        frameIndex++;
        // look for ADTS header (0xFFFx)
        for (; offset < len - 1; offset++) {
          if (data[offset] === 0xff && (data[offset + 1] & 0xf0) === 0xf0) {
            break;
          }
        }
      } else {
        break;
      }
    }
    if (offset < len && data[offset] === 0xff) {
      // TODO: check it
      aacOverFlow = data.subarray(offset, len);
      Log.log(
        `AAC: frame length:${len}, offset:${offset}, hdr size:${
          hdr.size
        }, hdr offset:${hdr.offset} overflow detected:${len - offset}`
      );
    } else {
      aacOverFlow = null;
    }
    this.aacOverFlow = aacOverFlow;
    this.lastAacPTS = stamp;
    hdr = null;
    return res;
  }
}
