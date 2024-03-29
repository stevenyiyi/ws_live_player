import { appendByteArray } from "../utils/binary.js";
import { getTagged } from "../utils/logger.js";
const LOG_TAG = "parses:pes";
const Log = getTagged(LOG_TAG);
export class PESAsm {
  constructor(pid) {
    this.pid = pid;
    this.fragments = [];
    this.pesLength = 0;
    this.pesPkt = null;
  }

  parse(frag) {
    if (this.extPresent) {
      let ext = this.parseExtension(frag);
      ext.data = frag.subarray(ext.offset);
    } else {
      return null;
    }
  }

  /// Parse PES header
  parseHeader() {
    let hdr = this.fragments[0].data;
    /// packet_start_code_prefix(24)
    let pesPrefix = (hdr[0] << 16) + (hdr[1] << 8) + hdr[2];
    /// stream_id (8)
    this.extPresent = ![0xbe, 0xbf].includes(hdr[3]);
    if (pesPrefix === 1) {
      /// PES_packet_length(16)
      let pesLength = (hdr[4] << 8) + hdr[5];
      /** Log.debug(
        `pid:${this.pid},pes length:${pesLength},this.pesLength:${this.pesLength}`
      ); */
      if (pesLength) {
        this.pesLength = pesLength;
        this.hasLength = true;
      } else {
        this.hasLength = false;
        this.pesPkt = null;
      }
      return true;
    }
    return false;
  }

  static PTSNormalize(value, reference) {
    let offset;
    if (reference === undefined) {
      return value;
    }
    if (reference < value) {
      // - 2^33
      offset = -8589934592;
    } else {
      // + 2^33
      offset = 8589934592;
    }
    /* PTS is 33bit (from 0 to 2^33 -1)
         if diff between value and reference is bigger than half of the amplitude (2^32) then it means that
         PTS looping occured. fill the gap */
    while (Math.abs(value - reference) > 4294967296) {
      value += offset;
    }
    return value;
  }

  parseExtension(frag) {
    let pesFlags, pesHdrLen, pesPts, pesDts, payloadStartOffset;

    pesFlags = frag[1];
    if (pesFlags & 0x80) {
      /* PES header described here : http://dvd.sourceforge.net/dvdinfo/pes-hdr.html
                 as PTS / DTS is 33 bit we cannot use bitwise operator in JS,
                 as Bitwise operators treat their operands as a sequence of 32 bits */
      pesPts =
        (frag[3] & 0x0e) * 536870912 + // 1 << 29
        (frag[4] & 0xff) * 4194304 + // 1 << 22
        (frag[5] & 0xfe) * 16384 + // 1 << 14
        (frag[6] & 0xff) * 128 + // 1 << 7
        (frag[7] & 0xfe) / 2;
      // check if greater than 2^32 -1
     /** if (pesPts > 4294967295) {
        // decrement 2^33
        pesPts -= 8589934592;
      } */
      if (pesFlags & 0x40) {
        pesDts =
          (frag[8] & 0x0e) * 536870912 + // 1 << 29
          (frag[9] & 0xff) * 4194304 + // 1 << 22
          (frag[10] & 0xfe) * 16384 + // 1 << 14
          (frag[11] & 0xff) * 128 + // 1 << 7
          (frag[12] & 0xfe) / 2;
        // check if greater than 2^32 -1
        /*if (pesDts > 4294967295) {
          // decrement 2^33
          pesDts -= 8589934592;
        } */
      } else {
        pesDts = pesPts;
      }

      pesHdrLen = frag[2];
      payloadStartOffset = pesHdrLen + 9;

      // TODO: normalize pts/dts
      return { offset: payloadStartOffset, pts: pesPts, dts: pesDts };
    } else {
      return null;
    }
  }

  feed(frag, shouldParse, discontinuity_indicator) {
    let res = null;
    if (shouldParse && this.fragments.length) {
      if (!this.parseHeader()) {
        throw new Error("Invalid PES packet");
      }

      let offset = 6;
      let parsed = {};
      let discontinuity = this.fragments[0].discontinuity;
      if (this.extPresent) {
        // TODO: make sure fragment have necessary length
        parsed = this.parseExtension(this.fragments[0].data.subarray(6));
        offset = parsed.offset;
      }

      if (!this.pesPkt) {
        this.pesPkt = new Uint8Array(this.pesLength);
      }

      let poffset = 0;
      while (this.pesLength && this.fragments.length) {
        let datafrag = this.fragments.shift();
        if (offset) {
          if (datafrag.data.byteLength < offset) {
            offset -= datafrag.data.byteLength;
            continue;
          } else {
            datafrag.data = datafrag.data.subarray(offset);
            this.pesLength -= offset - (this.hasLength ? 6 : 0);
            offset = 0;
          }
        }
        this.pesPkt.set(datafrag.data, poffset);
        poffset += datafrag.data.byteLength;
        this.pesLength -= datafrag.data.byteLength;
      }
      res = {
        data: this.pesPkt.subarray(0, poffset),
        pts: parsed.pts,
        dts: parsed.dts,
        discontinuity: discontinuity
      };
      /** Log.debug(
        `pid:${this.pid},This PES length:${this.pesLength}, length:${poffset}`
      ); */
    } else {
      this.pesPkt = null;
    }
    /** Log.debug(
      `feed pid:${this.pid},frag size:${frag.byteLength},shouldParse:${shouldParse}`
    ); */
    this.pesLength += frag.byteLength;

    if (
      this.fragments.length &&
      this.fragments[this.fragments.length - 1].data.byteLength < 6
    ) {
      /** Merge small buffer to a whole buffer */
      this.fragments[this.fragments.length - 1].data = appendByteArray(
        this.fragments[this.fragments.length - 1].data,
        frag
      );
    } else {
      this.fragments.push({data: frag, discontinuity: discontinuity_indicator});
    }

    return res;
  }
}
