import { getTagged } from "../utils/logger.js";
import { HEVC_NALU } from "./nalu-hevc.js";
const LOG_TAG = "asm:hevc";
const Log = getTagged(LOG_TAG);
// TODO: asm.js
export class NALUAsmHevc {
  constructor() {
    this.fragmented_nalu = null;
  }

  static parseNALHeader(hdr) {
    /*        HEVC nalu playload header
     *        +---------------+---------------+
     *        |0|1|2|3|4|5|6|7|0|1|2|3|4|5|6|7|
     *        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
     *        |F|   Type    |  LayerId  | TID |
     *        +-------------+-----------------+
     *        Figure 1: The Structure of the HEVC NAL Unit Header
     */
    return {
      type: (hdr >>> 9) & 0x3f,
      layerid: (hdr >>> 3) & 0x3f,
      tid: hdr & 0x07
    };
  }

  parseSingleNALUPacket(rawData, header, dts, pts) {
    return new HEVC_NALU(
      header.type,
      header.layerid,
      header.tid,
      rawData.subarray(0),
      dts,
      pts
    );
  }

  parseAggregationPacket(rawData, header, dts, pts) {
    let data = new DataView(
      rawData.buffer,
      rawData.byteOffset,
      rawData.byteLength
    );
    let nal_start_idx = 0;
    /**
        let don = null;
        if (HEVC_NALU.STAP === header.type) {
            don = data.getUint16(nal_start_idx);
            nal_start_idx += 2;
        }
        */
    let ret = [];
    while (nal_start_idx < data.byteLength) {
      let size = data.getUint16(nal_start_idx);
      nal_start_idx += 2;
      let header = NALUAsmHevc.parseNALHeader(data.getUint16(nal_start_idx));
      nal_start_idx++;
      let nalu = this.parseSingleNALUPacket(
        rawData.subarray(nal_start_idx, nal_start_idx + size),
        header,
        dts,
        pts
      );
      if (nalu !== null) {
        ret.push(nalu);
      }
      nal_start_idx += size;
    }
    return ret;
  }

  parseFragmentationUnit(rawData, header, dts, pts) {
    /* The FU header consists of an S bit, an E bit, and a 6-bit FuType
     *        field, as shown in Figure 10.
     *        +---------------+
     *        |0|1|2|3|4|5|6|7|
     *        +-+-+-+-+-+-+-+-+
     *        |S|E|  FuType   |
     *        +---------------+
     *        Figure 10: The Structure of FU Header
     */
    let data = new DataView(
      rawData.buffer,
      rawData.byteOffset,
      rawData.byteLength
    );
    let nal_start_idx = 0;
    let fu_header = data.getUint8(nal_start_idx);
    let is_start = (fu_header & 0x80) >>> 7;
    let is_end = (fu_header & 0x40) >>> 6;
    let payload_type = fu_header & 0x3f;
    let ret = null;

    nal_start_idx++;
    if (is_start) {
      this.fragmented_nalu = new HEVC_NALU(
        payload_type,
        header.layerid,
        header.tid,
        rawData.subarray(nal_start_idx),
        dts,
        pts
      );
    }
    if (this.fragmented_nalu && this.fragmented_nalu.ntype === payload_type) {
      if (!is_start) {
        this.fragmented_nalu.appendData(rawData.subarray(nal_start_idx));
      }
      if (is_end) {
        ret = this.fragmented_nalu;
        this.fragmented_nalu = null;
        return ret;
      }
    }
    return null;
  }

  onNALUFragment(rawData, dts, pts) {
    let data = new DataView(
      rawData.buffer,
      rawData.byteOffset,
      rawData.byteLength
    );

    let header = NALUAsmHevc.parseNALHeader(data.getUint16(0));

    let nal_start_idx = 2;

    let unit = null;
    if (header.type >= 1 && header.type <= 47) {
      unit = this.parseSingleNALUPacket(
        rawData.subarray(nal_start_idx),
        header,
        dts,
        pts
      );
    } else if (HEVC_NALU.FU === header.type) {
      unit = this.parseFragmentationUnit(
        rawData.subarray(nal_start_idx),
        header,
        dts,
        pts
      );
    } else if (HEVC_NALU.STAP === header.type) {
      return this.parseAggregationPacket(
        rawData.subarray(nal_start_idx),
        header,
        dts,
        pts
      );
    } else {
      /* 30 - 31 is undefined, ignore those (RFC3984). */
      Log.warn("Undefined NAL unit, type: " + header.type);
      return null;
    }
    if (unit) {
      return [unit];
    }
    return null;
  }
}
