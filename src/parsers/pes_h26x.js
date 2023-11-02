import { NALUAsm } from "./nalu-asm.js";
import { NALUAsmHevc } from "./nalu-asm-hevc.js";
import { appendByteArray } from "../utils/binary.js";
import { PayloadType } from "../StreamDefine.js";
import { MediaAccessunit } from "../MediaAccessunit.js";
export class H26XPES {
  constructor(pesType) {
    this.pesType = pesType;
    if (pesType === PayloadType.H264) {
      this.naluasm = new NALUAsm();
    } else {
      this.naluasm = new NALUAsmHevc();
    }
    this.lastUnit = null;
  }

  parse(pes) {
    let array = pes.data;
    let i = 0,
      len = pes.length,
      value,
      overflow,
      state = 0;
    let units = [],
      lastUnitStart;
    while (i < len) {
      value = array[i++];
      // finding 3 or 4-byte start codes (00 00 01 OR 00 00 00 01)
      switch (state) {
        case 0:
          if (value === 0) {
            state = 1;
          }
          break;
        case 1:
          if (value === 0) {
            state = 2;
          } else {
            state = 0;
          }
          break;
        case 2:
        case 3:
          if (value === 0) {
            state = 3;
          } else if (value === 1 && i < len) {
            if (lastUnitStart) {
              let nalu = this.naluasm.onNALUFragment(
                array.subarray(lastUnitStart, i - state - 1),
                pes.dts,
                pes.dts
              );
              if (nalu) {
                for (const enalu of nalu) {
                  units.push(enalu);
                }
              }
            } else {
              // If NAL units are not starting right at the beginning of the PES packet, push preceding data into previous NAL unit.
              overflow = i - state - 1;
              if (overflow) {
                if (this.lastUnit) {
                  this.lastUnit.data = appendByteArray(
                    this.lastUnit.data.byteLength,
                    array.subarray(0, overflow)
                  );
                }
              }
            }
            lastUnitStart = i;
            state = 0;
          } else {
            state = 0;
          }
          break;
        default:
          break;
      }
    }
    if (lastUnitStart) {
      let nalu = this.naluasm.onNALUFragment(
        array.subarray(lastUnitStart, len),
        pes.dts,
        pes.pts
      );
      if (nalu) {
        for (const enalu of nalu) {
          units.push(enalu);
        }
      }
    }
    this.lastUnit = units[units.length - 1];
    return new MediaAccessunit(
      this.pesType === 0x1b ? PayloadType.H264 : PayloadType.H265,
      pes.dts,
      pes.dts,
      units
    );
  }
}
