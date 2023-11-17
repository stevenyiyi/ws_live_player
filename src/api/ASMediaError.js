/**
 * Analogue of the MediaError class returned by
 * HTMLMediaElement.error property
 */
export class ASMediaError {
  static get MEDIA_ERR_SYSTEM() {
    return 1;
  }
  /** Network error */
  static get MEDIA_ERR_NETWORK() {
    return 2;
  }
  /** RTSP error, message:{code: xxx, statusLine: xxxxxx} */
  static get MEDIA_ERR_RTSP() {
    return 3;
  }
  /** av packet assembly error */
  static get MEDIA_ERR_AV() {
    return 4;
  }
  /** MSE error */
  static get MEDIA_ERR_DECODE() {
    return 5;
  }
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
}

export class ASInfoNotice {
  static get AVINFO() {
    return 1;
  }
  static get RECONNECTING() {
    return 2;
  }

  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
}
