import { getTagged } from "../utils/logger.js";
import { BitArray } from "../utils/binary.js";
import { PESAsm } from "./pes.js";
import { H26XPES } from "./pes_h26x.js";
import { AACPES } from "./pes_aac.js";
import { G7XXPES } from "./pes_g7xx.js";
import { PayloadType, PESType } from "../StreamDefine.js";
import { ASMediaError } from "../utils/ASMediaError.js";
const LOG_TAG = "parses:ts";
const Log = getTagged(LOG_TAG);

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

  reset() {
    this.pesParsers.clear();
    this.pesAsms = {};
    this.pmtParsed = false;
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
      let adaptation_field_control = bits.readBits(2);
      /// Ignore continuity_counter (4)
      bits.skipBits(4);

      if (adaptation_field_control === 2 || adaptation_field_control === 3) {
        /// Parse Adaptation_field
        /// adaptation_field_length(8)
        let adaptSize = bits.readBits(8);
        this.toSkip = bits.skipBits(adaptSize * 8);
        if (bits.finished()) {
          return null;
        }
      }

      if (adaptation_field_control === 0 || adaptation_field_control === 2) {
        /// No pes
        Log.warn("No pes buffer!");
        return null;
      }

      /// Parse payload
      let payload = packet.subarray(bits.bytepos); //bitSlice(packet, bits.bitpos+bits.bytepos*8);

      if (this.pmtParsed && this.pesParsers.has(pid)) {
        let pes = this.pesAsms[pid].feed(payload, payStart);
        if (pes) {
          /// Log.debug(`pes buffer size:${pes.data.byteLength},pts:${pes.pts}`);
          return this.pesParsers.get(pid).parse(pes);
        }
      } else {
        if (pid === 0) {
          /// Parse PAT
          this.pmtId = this.parsePAT(payload);
          Log.debug(`pmtId:${this.pmtId}`);
        } else if (pid === this.pmtId) {
          /// Parse PMT
          this.parsePMT(payload);
          this.pmtParsed = true;
        } else {
          Log.error(`Invalid pid:${pid}`);
          throw new ASMediaError(
            ASMediaError.MEDIA_ERR_AV,
            `Invalid pid:${pid}`
          );
        }
      }
    } else {
      Log.error("Invalid ts packet, first byte must be 0x47!");
      throw new ASMediaError(
        ASMediaError.MEDIA_ERR_AV,
        "Invalid ts packet, first byte must be 0x47!"
      );
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
            new (this.pesParserTypes.get(pesType))(pesType)
          );
          this.pesAsms[pid] = new PESAsm(pid);
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
              throw new ASMediaError(
                ASMediaError.MEDIA_ERR_AV,
                `Invalid pes type:${pesType} not supported!`
              );
          }
        }
      }
      readLen -= 5 + il;
    }

    if (tracks.size === 0) {
      throw new ASMediaError(
        ASMediaError.MEDIA_ERR_AV,
        "Parse PMT, not found track!"
      );
    }

    /// Has codec special data?
    for (const track of tracks) {
      if (
        track.type === PayloadType.H264 ||
        track.type === PayloadType.H265 ||
        track.type === PayloadType.AAC
      ) {
        track.hasCodecConf = true;
        track.params = {};
        track.ready = false;
      } else {
        track.hasCodecConf = false;
        track.ready = true;
      }
    }
    // TODO: notify about tracks
    if (this.ontracks) {
      this.ontracks(tracks);
    }
  }
}
