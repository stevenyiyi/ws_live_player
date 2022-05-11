import { AudioFrame } from "./audio-frame.js";
import { StreamType, PayloadType } from "../StreamDefine.js";
export class G7XXPES {
  constructor(pesType) {
    this.pesType = pesType;
    this.lastG7xxPTS = null;
    this.track = {};
  }

  payloadType() {
    let pt = -1;
    switch (this.pesType) {
      case 0x90:
        pt = PayloadType.ALAW;
        break;
      case 0x91:
        pt = PayloadType.ULAW;
        break;
      case 0x92:
        pt = PayloadType.G726;
        break;
      case 0x93:
        pt = PayloadType.G723;
        break;
      case 0x99:
        pt = PayloadType.G729;
        break;
      default:
        throw new Error(`Invalid G7XX pes type:${this.pesType}`);
    }
    return pt;
  }

  parse(pes) {
    return {
      units: [new AudioFrame(pes.data, pes.pts)],
      type: StreamType.AUDIO,
      pay: this.payloadType(this.pesType)
    };
  }
}
