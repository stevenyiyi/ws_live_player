import { ExpGolomb } from "./exp-golomb.js";
import { HEVC_NALU } from "./nalu-hevc.js";

export class H265Parser {
  constructor(track) {
    this.track = track;
    this.firstFound = false;
  }

  static generalProfileSpaceString(generalProfileSpace) {
    let s;
    switch (generalProfileSpace) {
      case 0:
        s = "";
        break;
      case 1:
        s = "A";
        break;
      case 2:
        s = "B";
        break;
      case 3:
        s = "A";
        break;
      default:
        throw Error(`Invalid hevc GeneralProfileSpace:${generalProfileSpace}!`);
    }
    return s;
  }

  static swap32(val) {
    return (
      ((val & 0xff) << 24) |
      ((val & 0xff00) << 8) |
      ((val >> 8) & 0xff00) |
      ((val >> 24) & 0xff)
    );
  }

  static trim_leading_zeros(str) {
    for (let i = 0; i < str.size(); ++i) {
      if (str.charCodeAt(i) === "0") continue;
      return str.substr(i);
    }
    return "0";
  }

  // Encode the 32 bits input, but in reverse bit order, i.e. bit [31] as the most
  // significant bit, followed by, bit [30], and down to bit [0] as the least
  // significant bit, where bits [i] for i in the range of 0 to 31, inclusive, are
  // specified in ISO/IEC 23008‐2, encoded in hexadecimal (leading zeroes may be
  // omitted).
  static reverse_bits_and_hex_encode(x) {
    x = ((x & 0x55555555) << 1) | ((x & 0xaaaaaaaa) >>> 1);
    x = ((x & 0x33333333) << 2) | ((x & 0xcccccccc) >>> 2);
    x = ((x & 0x0f0f0f0f) << 4) | ((x & 0xf0f0f0f0) >>> 4);
    x = this.swap32(x);
    let sbytes = x.toString(16);
    return H265Parser.trim_leading_zeros(sbytes);
  }

  parseVPS(vps) {
    let config = H265Parser.readVPS(new Uint8Array(vps));
    this.track.vps = [new Uint8Array(vps)];
    this.track.codec = "hvc1.";
    let scodecs = [];
    scodecs.push(
      `${H265Parser.generalProfileSpaceString(config.GeneralProfileSpace)}${
        config.GeneralProfileIdc
      }`
    );
    scodecs.push(
      H265Parser.reverse_bits_and_hex_encode(
        config.GeneralProfileCompatibilityFlags
      )
    );
    scodecs.push((config.GeneralTierFlag ? "H" : "L") + config.GeneralLevelIdc);

    let contraints = config.GeneralConstraintIndicatorFlags;
    let contraintsBuf = new Uint8Array(
      (contraints & 0x0000ff0000000000) >> 40,
      (contraints & 0x000000ff00000000) >> 32,
      (contraints & 0x00000000ff000000) >> 24,
      (contraints & 0x0000000000ff0000) >> 16,
      (contraints & 0x000000000000ff00) >> 8,
      contraints & 0x00000000000000ff
    );

    let count = contraintsBuf.length;
    for (; count > 0; --count) {
      if (contraints[count - 1] !== 0) {
        break;
      }
    }

    for (let i = 0; i < count; i++) {
      scodecs.push(
        contraintsBuf[i].toString(16).padStart(2, "0").toUpperCase()
      );
    }

    this.track.codec += scodecs.join(".");
    this.track.vpsconfig = config;
  }

  parseSPS(sps) {
    var config = H265Parser.readSPS(new Uint8Array(sps));
    this.track.width = config.width;
    this.track.height = config.height;
    this.track.hasBFrames = config.hasBFrames;
    this.track.sps = [new Uint8Array(sps)];
  }

  parsePPS(pps) {
    this.track.pps = [new Uint8Array(pps)];
  }

  parseNAL(unit) {
    if (!unit) return false;

    let push = null;
    // console.log(unit.toString());
    switch (unit.type()) {
      case HEVC_NALU.SLICE_RADL_N:
      case HEVC_NALU.SLICE_RADL_R:
      case HEVC_NALU.SLICE_RASL_N:
      case HEVC_NALU.SLICE_STSA_N:
      case HEVC_NALU.SLICE_STSA_R:
      case HEVC_NALU.SLICE_TLA_R:
      case HEVC_NALU.SLICE_TSA_N:
      case HEVC_NALU.SLICE_TRAIL_N:
      case HEVC_NALU.SLICE_TRAIL_R:
      case HEVC_NALU.SLICE_BLA_W_LP:
      case HEVC_NALU.SLICE_BLA_N_LP:
      case HEVC_NALU.SLICE_BLA_W_RADL:
      case HEVC_NALU.SLICE_IDR_N_LP:
      case HEVC_NALU.SLICE_IDR_W_RADL:
      case HEVC_NALU.SLICE_CRA:
      case HEVC_NALU.SLICE_RSV_IRAP_VCL22:
      case HEVC_NALU.SLICE_RSV_IRAP_VCL23:
        if (unit.isKeyframe() && !this.firstFound) {
          this.firstFound = true;
        }
        if (this.firstFound) {
          push = true;
        } else {
          push = false;
        }
        break;
      case HEVC_NALU.VPS:
        push = false;
        if (!this.track.vps) {
          this.parseVPS(unit.getData().subarray(4));
        }
        break;
      case HEVC_NALU.SPS:
        push = false;
        if (!this.track.sps) {
          this.parseSPS(unit.getData().subarray(4));
        }
        break;
      case HEVC_NALU.PPS:
        push = false;
        if (!this.track.pps) {
          this.parsePPS(unit.getData().subarray(4));
        }
        break;
      case HEVC_NALU.PREFIX_SEI:
      case HEVC_NALU.SUFFIX_SEI:
        push = false;
        let data = new DataView(
          unit.data.buffer,
          unit.data.byteOffset,
          unit.data.byteLength
        );
        let byte_idx = 0;
        let pay_type = data.getUint8(byte_idx);
        ++byte_idx;
        let pay_size = 0;
        let sz = data.getUint8(byte_idx);
        ++byte_idx;
        while (sz === 255) {
          pay_size += sz;
          sz = data.getUint8(byte_idx);
          ++byte_idx;
        }
        pay_size += sz;

        let uuid = unit.data.subarray(byte_idx, byte_idx + 16);
        byte_idx += 16;
        console.log(
          `PT: ${pay_type}, PS: ${pay_size}, UUID: ${Array.from(uuid)
            .map(function (i) {
              return ("0" + i.toString(16)).slice(-2);
            })
            .join("")}`
        );
        // debugger;
        break;
      case HEVC_NALU.EOS:
      case HEVC_NALU.EOB:
        push = false;
        break;
      default:
        break;
    }

    if (push === null && this.getLayerID() > 0) {
      push = true;
    }
    return push;
  }
  // See Rec. ITU-T H.265 v3 (04/2015) Chapter 7.3.2.1 for reference
  static readVPS(data) {
    let reader = new ExpGolomb(data);
    // Skip vps_video_parameter_set_id
    reader.skipBits(4);
    // Skip vps_base_layer_internal_flag
    reader.skipBits(1);
    // Skip vps_base_layer_available_flag
    reader.skipBits(1);
    // Skip vps_max_layers_minus_1
    reader.skipBits(6);

    let vps_max_sub_layers_minus1 = reader.getBits(3) + 1;
    // Skip vps_temporal_id_nesting_flags
    reader.skipBits(1);

    // Skip reserved
    reader.skipBits(16);

    let config = {};
    config["GeneralProfileSpace"] = reader.getBits(2);
    config["GeneralTierFlag"] = reader.readBoolean();
    config["GeneralProfileIdc"] = reader.readBits(5);
    config["GeneralProfileCompatibilityFlags"] = reader.readUInt();
    config["GeneralConstraintIndicatorFlags"] =
      (reader.getBits(16) << 32) | reader.getBits(32);
    config["GeneralLevelIdc"] = reader.readBits(8);
    return config;
  }

  /// See Rec. ITU-T H.265 v3 (04/2015) Chapter 7.3.2.2 for reference
  static readSPS(data) {
    let decoder = new ExpGolomb(data);
    // Skip sps_video_parameter_set_id
    decoder.skipBits(4);
    // sps_max_sub_layers_minus1
    let sps_max_sub_layers_minus1 = decoder.getBits(3);
    // Skip sps_temporal_id_nesting_flag;
    decoder.skipBits(1);
    // Skip general profile
    decoder.skipBits(96);
    if (sps_max_sub_layers_minus1 > 0) {
      let subLayerProfilePresentFlag = new Uint8Array(8);
      let subLayerLevelPresentFlag = new Uint8Array(8);
      for (let i = 0; i < sps_max_sub_layers_minus1; ++i) {
        subLayerProfilePresentFlag[i] = decoder.getBits(1);
        subLayerLevelPresentFlag[i] = decoder.getBits(1);
      }
      // Skip reserved
      decoder.skipBits(2 * (8 - sps_max_sub_layers_minus1));
      for (let i = 0; i < sps_max_sub_layers_minus1; ++i) {
        if (subLayerProfilePresentFlag[i]) {
          // Skip profile
          decoder.skipBits(88);
        }
        if (subLayerLevelPresentFlag[i]) {
          // Skip sub_layer_level_idc[i]
          decoder.skipBits(8);
        }
      }
    }
    // Skip sps_seq_parameter_set_id
    decoder.skipUEG();
    // chroma_format_idc
    let chromaFormatIdc = decoder.readUEG();
    let separate_colour_plane_flag = 0;
    if (chromaFormatIdc === 3) {
      // separate_colour_plane_flag
      separate_colour_plane_flag = decoder.getBits(1);
    }

    // pic_width_in_luma_samples
    let pic_width_in_luma_samples = decoder.readUEG();
    // pic_height_in_luma_samples
    let pic_height_in_luma_samples = decoder.readUEG();

    let conformance_window_flag = decoder.readBoolean();
    if (conformance_window_flag) {
      // conf_win_left_offset
      let conf_win_left_offset = decoder.readUEG();
      // conf_win_right_offset
      let conf_win_right_offset = decoder.readUEG();
      // conf_win_top_offset
      let conf_win_top_offset = decoder.readUEG();
      // conf_win_bottom_offset
      let conf_win_bottom_offset = decoder.readUEG();

      let sub_width_c =
        (1 === chromaFormatIdc || 2 === chromaFormatIdc) &&
        0 === separate_colour_plane_flag
          ? 2
          : 1;
      let sub_height_c =
        1 === chromaFormatIdc && 0 === separate_colour_plane_flag ? 2 : 1;
      pic_width_in_luma_samples -=
        sub_width_c * conf_win_right_offset +
        sub_width_c * conf_win_left_offset;
      pic_height_in_luma_samples -=
        sub_height_c * conf_win_bottom_offset +
        sub_height_c * conf_win_top_offset;
    }

    // bit_depth_luma_minus8
    decoder.skipUEG();
    // bit_depth_chroma_minus8
    decoder.skipUEG();
    // log2_max_pic_order_cnt_lsb_minus4
    decoder.skipUEG();
    // sps_sub_layer_ordering_info_present_flag
    let spsSubLayerOrderingInfoPresentFlag = decoder.readBits(1);

    return {
      width: pic_width_in_luma_samples,
      height: pic_height_in_luma_samples,
      hasBFrames: spsSubLayerOrderingInfoPresentFlag === 1 ? true : false
    };
  }
}
