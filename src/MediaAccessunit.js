import { PayloadType } from "./StreamDefine.js";
export class MediaAccessunit {
  constructor(ctype, pts, dts, units) {
    this.ctype = ctype;
    this.pts = pts;
    this.dts = dts;
    this.units = units;

    /// Properties defines
    Object.defineProperties(this, {
      byteLength: {
        get: function getByteLength() {}
      }
    });
  }

  isKeyFrame() {
    let f = false;
    if (this.ctype === PayloadType.H264 || this.ctype === PayloadType.H265) {
      for (let unit in this.units) {
        if (unit.isKeyframe()) {
          f = true;
          break;
        }
      }
    } else {
      f = true;
    }
    return f;
  }

  static dtsSortFunc(a, b) {
    return a.dts - b.dts;
  }

  static ptsSortFunc(a, b) {
    return a.pts - b.pts;
  }
}
