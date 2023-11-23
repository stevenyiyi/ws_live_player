import { PayloadType } from "./StreamDefine.js";
export class MediaAccessunit {
  constructor(ctype, pts, dts, units) {
    this.ctype = ctype;
    this.pts = pts;
    this.dts = dts;
    this.units = units;
    this.config = null;
    this.discontinuity = false;

    /// Properties defines
    Object.defineProperties(this, {
      byteLength: {
        get: function () {
          let bytes = 0;
          for (const unit of this.units) {
            bytes += unit.getSize();
          }
          return bytes;
        }
      }
    });
  }

  isKeyFrame() {
    let f = false;
    if (this.ctype === PayloadType.H264 || this.ctype === PayloadType.H265) {
      for (const unit of this.units) {
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
