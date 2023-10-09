import { EventEmitter } from "./utils/event.js";
export default class BaseStream {
  constructor(options) {
    this.eventSource = new EventEmitter();
    this.cacheSize = options.cacheSize || 500; //default ms
    this.wsurl = options.wsurl;
    this.rtspurl = options.rtspurl;
    this.video = options.video;

    this._frameSink = options.frameSink;

    this._videoTrack = null;
    this._audioTrack = null;
    this._canvasStream = null;

    this._videoInfo = null;

    /// Properties defines
    Object.defineProperties(this, {
      duration: { value: NaN, writable: true },
      hasAudio: {
        get: function getHasAudio() {
          return this._getHasAudio();
        }
      },
      hasVideo: {
        get: function getHasVideo() {
          return this._getHasVideo();
        }
      },
      hasBFrames: {
        get: function getHasBFrames() {
          return this._getHasBFrames();
        }
      },
      length: {
        get: function getLength() {
          return this._getMediaLength();
        }
      },
      buffering: { value: false, writable: true },
      seeking: { value: false, writable: true },
      waiting: { value: false, writable: true },
      seekable: { value: false, writable: true },
      eof: { value: false, writable: true }
    });
  }

  /// Public methods

  /// return Promise
  load() {
    /// Inherite class implement
    throw Error("Call load in abstract class!");
  }

  /// return Promise
  seek(offset) {
    /// Inherite class implement
    throw Error("Call seek in abstract class!");
  }

  /// stop
  stop() {
    throw Error("Call stop in abstract class!");
  }

  /// destory
  destory() {
    throw Error("Call destory in abstract class!");
  }

  /// Array of array [[s, e],...]
  getBufferedRanges() {
    /// Inherite class implement
    throw Error("Call etBufferedRanges in abstract class!");
  }

  /// void
  abort() {
    throw Error("Call abort in abstract class!");
  }

  /// Private methods
  _getMediaLength() {
    throw Error("Call _getMediaLength() in abstract class!");
  }

  _getHasAudio() {
    throw Error("Call _getHasAudio() in abstract class!");
  }

  _getHasVideo() {
    throw Error("Call _getHasVideo() in abstract class!");
  }

  _getHasBFrames() {
    throw Error("Call _getHasVideo() in abstract class!");
  }
}
