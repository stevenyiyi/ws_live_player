import { BitArray } from "../util/binary.js";
import { PESAsm } from "./pes.js";
import { H26XPES } from "./pes_h26x.js";
import { AACPES } from "./pes_aac.js";
import { G7XXPES } from "./pes_g7xx.js";
import { PayloadType } from "../StreamDefine.js";

export class PESType {
  static get AAC() {
    return 0x0f;
  } // ISO/IEC 13818-7 ADTS AAC (MPEG-2 lower bit-rate audio)
  static get ID3() {
    return 0x15;
  } // Packetized metadata (ID3)
  static get PCMA() {
    return 0x90;
  } // GBT 28181
  static get PCMU() {
    return 0x91;
  } // GBT 28181
  static get G722() {
    return 0x92;
  } // GBT 28181
  static get G723() {
    return 0x93;
  } // GBT 28181
  static get G726() {
    return 0x94;
  } // GBT 28181
  static get G729() {
    return 0x99;
  } // GBT 28181
  static get H264() {
    return 0x1b;
  } // ITU-T Rec. H.264 and ISO/IEC 14496-10 (lower bit-rate video)
  static get H265() {
    return 0x24;
  } // ITU-T H.265 | ISO/IEC 23008-2 video stream or an HEVC temporal video sub-bitstream
}

export class TSParser {
  static get PACKET_LENGTH() {
    return 188;
  }

  constructor() {
    this.pmtParsed = false;
    this.pesParserTypes = new Map();
    this.pesParserTypes.set(PESType.AAC, AACPES);
    this.pesParserTypes.set(PESType.H264, H26XPES);
    this.pesParserTypes.set(PESType.H265, H26XPES);
    this.pesParserTypes.set(PESType.PCMA, G7XXPES);
    this.pesParserTypes.set(PESType.PCMU, G7XXPES);
    this.pesParserTypes.set(PESType.G722, G7XXPES);
    this.pesParserTypes.set(PESType.G723, G7XXPES);
    this.pesParserTypes.set(PESType.G726, G7XXPES);
    this.pesParserTypes.set(PESType.G729, G7XXPES);
    this.pesParsers = new Map();
    this.pesAsms = {};
    this.ontracks = null;
    this.toSkip = 0;
  }

  parse(packet) {
    let bits = new BitArray(packet);
    if (packet[0] === 0x47) {
      /// Ignore transport_error_indicator(1)
      bits.skipBits(9);
      /// payload_unit_start_indicator
      let payStart = bits.readBits(1);
      /// Ignore transport_priority(1)
      bits.skipBits(1);
      /// PID
      let pid = bits.readBits(13);
      /// Ignore transport_scrambling_control
      bits.skipBits(2);
      /// adaptation_field_control (2)
      let adaptFlag = bits.readBits(1);
      let payFlag = bits.readBits(1);
      /// Ignore continuity_counter (4)
      bits.skipBits(4);
      if (adaptFlag) {
        /// Parse Adaptation_field
        /// adaptation_field_length(8)
        let adaptSize = bits.readBits(8);
        this.toSkip = bits.skipBits(adaptSize * 8);
        if (bits.finished()) {
          return null;
        }
      }
      if (!payFlag) return null;

      /// Parse payload
      let payload = packet.subarray(bits.bytepos); //bitSlice(packet, bits.bitpos+bits.bytepos*8);

      if (this.pmtParsed && this.pesParsers.has(pid)) {
        let pes = this.pesAsms[pid].feed(payload, payStart);
        if (pes) {
          return this.pesParsers.get(pid).parse(pes);
        }
      } else {
        if (pid === 0) {
          /// Parse PAT
          this.pmtId = this.parsePAT(payload);
        } else if (pid === this.pmtId) {
          /// Parse PMT
          this.parsePMT(payload);
          this.pmtParsed = true;
        }
      }
    }
    return null;
  }

  parsePAT(data) {
    let bits = new BitArray(data);
    let ptr = bits.readBits(8);
    bits.skipBits(8 * ptr + 83);
    return bits.readBits(13);
  }

  parsePMT(data) {
    let bits = new BitArray(data);
    let ptr = bits.readBits(8);
    bits.skipBits(8 * ptr + 8);
    bits.skipBits(6);
    let secLen = bits.readBits(10);
    bits.skipBits(62);
    let pil = bits.readBits(10);
    bits.skipBits(pil * 8);

    let tracks = new Set();
    let readLen = secLen - 13 - pil;
    while (readLen > 0) {
      let pesType = bits.readBits(8);
      bits.skipBits(3);
      let pid = bits.readBits(13);
      bits.skipBits(6);
      let il = bits.readBits(10);
      bits.skipBits(il * 8);
      if (
        [
          PESType.AAC,
          PESType.PCMA,
          PESType.PCMU,
          PESType.G726,
          PESType.G723,
          PESType.G729,
          PESType.H264,
          PESType.H265
        ].includes(pesType)
      ) {
        if (this.pesParserTypes.has(pesType) && !this.pesParsers.has(pid)) {
          this.pesParsers.set(
            pid,
            new (this.pesParserTypes.get(pesType)(pesType))()
          );
          this.pesAsms[pid] = new PESAsm();
          switch (pesType) {
            case PESType.AAC:
              tracks.add({
                type: PayloadType.AAC,
                offset: 0
              });
              break;
            case PESType.PCMA:
              tracks.add({
                type: PayloadType.PCMA,
                offset: 0
              });
              break;
            case PESType.PCMU:
              tracks.add({
                type: PayloadType.PCMU,
                offset: 0
              });
              break;
            case PESType.G722:
              tracks.add({
                type: PayloadType.G722,
                offset: 0
              });
              break;
            case PESType.G723:
              tracks.add({
                type: PayloadType.G723,
                offset: 0
              });
              break;
            case PESType.G726:
              tracks.add({
                type: PayloadType.G726,
                offset: 0
              });
              break;
            case PESType.G729:
              tracks.add({
                type: PayloadType.G729,
                offset: 0
              });
              break;
            case PESType.H264:
              tracks.add({
                type: PayloadType.H264,
                offset: 0
              });
              break;
            case PESType.H265:
              tracks.add({
                type: PayloadType.H265,
                offset: 0
              });
              break;
            default:
              throw new Error(`Invalid pes type:${pesType} not supported!`);
          }
        }
      }
      readLen -= 5 + il;
    }

    if (tracks.size === 0) {
      throw new Error("Parse PMT, not found track!");
    }

    /// Has codec special data?
    for (const track of tracks) {
      if (
        track.type === PayloadType.H264 ||
        track.type === PayloadType.H265 ||
        track.type === PayloadType.AAC
      ) {
        track.hasCodecConf = true;
      } else {
        track.hasCodecConf = false;
      }
    }
    // TODO: notify about tracks
    if (this.ontracks) {
      this.ontracks(tracks);
    }
  }
}
