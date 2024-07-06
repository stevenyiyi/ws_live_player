/**
 * Analogue of the MediaError class returned by
 * HTMLMediaElement.error property
 */
export class ASMediaError {
  constructor(code, message, data) {
    this.code = code || null;
    this.message = message || null;
    this.data = data || null;
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
