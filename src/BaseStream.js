import { EventEmitter } from "./utils/event.js";
export default class BaseStream {
  constructor(options) {
    this.eventSource = new EventEmitter();
    this.cacheSize = options.cacheSize || 500; // default ms
    this.flushInterval = options.flush || 100; // default ms
    this.wsurl = options.wsurl;
    this.rtspurl = options.rtspurl;
    this.video = options.video;
    this.bufferedDuration = options.bufferedDuration || 120;

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
      eof: { value: false, writable: true },
      audioInfo: {
        get: function getAudioInfo() {
          return this._getAudioInfo();
        }
      },
      videoInfo: {
        get: function getVideoInfo() {
          return this._getVideoInfo();
        }
      }
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

  /// destroy
  destroy() {
    throw Error("Call destroy in abstract class!");
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

  startStreamFlush() {
    this.flushTimerId = setInterval(() => {
      if (!this.paused) {
        this.eventSource.dispatchEvent("flush");
      }
    }, this.flushInterval);
  }

  stopStreamFlush() {
    clearInterval(this.flushTimerId);
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

  _getAudioInfo() {
    throw Error("Call _getAudioInfo() in abstract class!");
  }

  _getVideoInfo() {
    throw Error("Call _getVideoInfo() in abstract class!");
  }
}
