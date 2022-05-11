import {
  FrameSink
} from "./FrameSink";
import {
  WebGLFrameSink
} from "./WebGLFrameSink";
import {
  SoftwareFrameSink
} from "./SoftwareFrameSink";

/**
 * @typedef {Object} YUVCanvasOptions
 * @property {boolean} webGL - Whether to use WebGL to draw to the canvas and accelerate color space conversion. If left out, defaults to auto-detect.
 */

var YUVCanvas = {
  FrameSink: FrameSink,

  SoftwareFrameSink: SoftwareFrameSink,

  WebGLFrameSink: WebGLFrameSink,

  /**
   * Attach a suitable FrameSink instance to an HTML5 canvas element.
   *
   * This will take over the drawing context of the canvas and may turn
   * it into a WebGL 3d canvas if possible. Do not attempt to use the
   * drawing context directly after this.
   *
   * @param {HTMLCanvasElement} canvas - HTML canvas element to attach to
   * @param {YUVCanvasOptions} options - map of options
   * @returns {FrameSink} - instance of suitable subclass.
   */
  attach: function (canvas, options) {
    options = options || {};
    var webGL = ('webGL' in options) ? options.webGL : WebGLFrameSink.isAvailable();
    if (webGL) {
      return new WebGLFrameSink(canvas, options);
    } else {
      return new SoftwareFrameSink(canvas, options);
    }
  }
};

export {
  YUVCanvas
};