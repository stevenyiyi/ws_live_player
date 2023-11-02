import { appendByteArray } from "../utils/binary.js";

export class HEVC_NALU {
  static get SLICE_TRAIL_N() {
    return 0;
  }
  static get SLICE_TRAIL_R() {
    return 1;
  }
  static get SLICE_TSA_N() {
    return 2;
  }
  static get SLICE_TLA_R() {
    return 3;
  }
  static get SLICE_STSA_N() {
    return 4;
  }
  static get SLICE_STSA_R() {
    return 5;
  }
  static get SLICE_RADL_N() {
    return 6;
  }
  static get SLICE_RADL_R() {
    return 7;
  }
  static get SLICE_RASL_N() {
    return 8;
  }
  static get SLICE_RASL_R() {
    return 9;
  }
  static get SLICE_BLA_W_LP() {
    return 16;
  }
  static get SLICE_BLA_W_RADL() {
    return 17;
  }
  static get SLICE_BLA_N_LP() {
    return 18;
  }
  static get SLICE_IDR_W_RADL() {
    return 19;
  }
  static get SLICE_IDR_N_LP() {
    return 20;
  }
  static get SLICE_CRA() {
    return 21;
  }
  static get SLICE_RSV_IRAP_VCL22() {
    return 22;
  }
  static get SLICE_RSV_IRAP_VCL23() {
    return 23;
  }
  static get VPS() {
    return 32;
  }
  static get SPS() {
    return 33;
  }
  static get PPS() {
    return 34;
  }
  static get DELIMITER() {
    return 35;
  }
  static get EOS() {
    return 36;
  }
  static get EOB() {
    return 37;
  }
  static get FILTER() {
    return 38;
  }
  static get PREFIX_SEI() {
    return 39;
  }
  static get SUFFIX_SEI() {
    return 40;
  }
  static get STAP() {
    return 48;
  }
  static get FU() {
    return 49;
  }
  static get PACI() {
    return 50;
  }

  static get TYPES() {
    return {
      [HEVC_NALU.SLICE_IDR_N_LP]: "IDR",
      [HEVC_NALU.SLICE_IDR_W_RADL]: "IDR",
      [HEVC_NALU.PREFIX_SEI]: "SEI",
      [HEVC_NALU.SUFFIX_SEI]: "SEI",
      [HEVC_NALU.VPS]: "VPS",
      [HEVC_NALU.SPS]: "SPS",
      [HEVC_NALU.PPS]: "PPS",
      [HEVC_NALU.SLICE_BLA_W_LP]: "RAP",
      [HEVC_NALU.SLICE_BLA_W_RADL]: "RAP",
      [HEVC_NALU.SLICE_BLA_N_LP]: "RAP",
      [HEVC_NALU.SLICE_CRA]: "RAP",
      [HEVC_NALU.SLICE_RSV_IRAP_VCL22]: "RAP",
      [HEVC_NALU.SLICE_RSV_IRAP_VCL23]: "RAP",
      [HEVC_NALU.DELIMITER]: "AUD",
      [HEVC_NALU.FILTER]: "FILTER",
      [HEVC_NALU.EOS]: "EOS",
      [HEVC_NALU.EOS]: "EOB",
      [HEVC_NALU.SLICE_TRAIL_N]: "NDR",
      [HEVC_NALU.SLICE_TRAIL_R]: "NDR",
      [HEVC_NALU.SLICE_TSA_N]: "NDR",
      [HEVC_NALU.SLICE_TLA_R]: "NDR",
      [HEVC_NALU.SLICE_STSA_N]: "NDR",
      [HEVC_NALU.SLICE_STSA_R]: "NDR",
      [HEVC_NALU.SLICE_RADL_N]: "NDR",
      [HEVC_NALU.SLICE_RADL_R]: "NDR",
      [HEVC_NALU.SLICE_RASL_N]: "NDR",
      [HEVC_NALU.SLICE_RASL_R]: "NDR"
    };
  }

  static type(nalu) {
    if (nalu.ntype in HEVC_NALU.TYPES) {
      return HEVC_NALU.TYPES[nalu.ntype];
    } else {
      return "UNKNOWN";
    }
  }

  /*       HEVC nalu playload header
   *        +---------------+---------------+
   *        |0|1|2|3|4|5|6|7|0|1|2|3|4|5|6|7|
   *        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   *        |F|   Type    |  LayerId  | TID |
   *        +-------------+-----------------+
   *        Figure 1: The Structure of the HEVC NAL Unit Header
   */
  constructor(ntype, layerid, tid, data, dts, pts) {
    this.data = data;
    this.ntype = ntype;
    this.layerid = layerid;
    this.tid = tid;
    this.dts = dts;
    this.pts = pts;
    this.sliceType = null;
  }

  appendData(idata) {
    this.data = appendByteArray(this.data, idata);
  }

  toString() {
    return `${HEVC_NALU.type(this)}(${
      this.data.byteLength
    }): LayerID: ${this.getLayerID()}, TID: ${this.getTID()}, PTS: ${
      this.pts
    }, DTS: ${this.dts}`;
  }

  getLayerID() {
    return this.layerid;
  }

  getTID() {
    return this.tid;
  }

  type() {
    return this.ntype;
  }

  isKeyframe() {
    return (
      this.ntype === HEVC_NALU.SLICE_IDR_N_LP ||
      this.ntype === HEVC_NALU.SLICE_IDR_W_RADL
    );
  }

  isRAP() {
    return (
      this.ntype >= HEVC_NALU.SLICE_BLA_W_LP &&
      this.ntype <= HEVC_NALU.SLICE_RSV_IRAP_VCL23
    );
  }

  getSize() {
    return 4 + 2 + this.data.byteLength;
  }

  getData() {
    let header = new Uint8Array(6 + this.data.byteLength);
    let view = new DataView(header.buffer);
    view.setUint32(0, this.data.byteLength + 2);
    view.setUint8(4, ((this.ntype << 1) & 0x7e) | (this.layerid >>> 5));
    view.setUint8(5, (this.layerid << 3) | this.tid);
    header.set(this.data, 6);
    return header;
  }
}
