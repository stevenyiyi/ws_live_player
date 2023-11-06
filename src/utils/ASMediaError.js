import extend from "./extend.js";

const ASMediaErrorConstants = {
  MEDIA_ERR_ABORTED: 1,
  MEDIA_ERR_NETWORK: 2,
  MEDIA_ERR_RTSP: 3,
  MEDIA_ERR_AV: 4,
  MEDIA_ERR_DECODE: 5,
  MEDIA_ERR_SRC_NOT_SUPPORTED: 6
};

/**
 * Analogue of the MediaError class returned by
 * HTMLMediaElement.error property
 */
export class ASMediaError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
}

extend(ASMediaError, ASMediaErrorConstants);
extend(ASMediaError.prototype, ASMediaErrorConstants);
