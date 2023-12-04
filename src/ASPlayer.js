import { getTagged } from "./utils/logger.js";
import RTSPStream from "./rtsp/RTSPStream";
const LOG_TAG = "RTSPStream";
const Log = getTagged(LOG_TAG);
export class ASPlayer {
  constructor(options) {
    // Always call super first in constructor
    this.errorHandler = null;
    this.infoHandler = null;
    this.dataHandler = null;
    this.queryCredentials = null;
    this.bufferDuration_ = 120;
    this.supposedCurrentTime = 0;
    this.stream = new RTSPStream(options);
    this._attachVideo(options.video);
    this.stream.eventSource.addEventListener("error", this._onError.bind(this));
    this.stream.eventSource.addEventListener("info", this._onInfo.bind(this));
  }

  /** video play handler */
  _attachVideo(video) {
    this._video = video;
    this._video.userSeekClick = true;
    this._video.addEventListener(
      "play",
      () => {
        if (!this.isPlaying()) {
          this.stream.start();
        }
      },
      false
    );
    /** video pause handler */
    this._video.addEventListener(
      "pause",
      () => {
        this.stream.pause();
      },
      false
    );
    /** video seeking handler */
    this._video.addEventListener(
      "seeking",
      () => {
        if (this._video.userSeekClick) {
          if (this.stream.seekable) {
            let result = this._is_in_buffered(this._video.currentTime);
            if (!result.inBuffered) {
              console.log(`seek to ${this._video.currentTime}`);
              this.stream.seek(this._video.currentTime);
            } else {
              console.log(`seek in buffered,move to:${result.seekOffset}`);
              this.stream.seek(result.seekOffset);
            }
          } else {
            let delta = this._video.currentTime - this.supposedCurrentTime;
            if (Math.abs(delta) >= 0.01) {
              console.log("Seeking is disabled");
              this._video.currentTime = this.supposedCurrentTime;
            }
          }
        }
        else {
          console.log("No user seeking!");
          this._video.userSeekClick = true;
        }
      },
      false
    );

    /** video updatetime handler */
    this._video.addEventListener(
      "timeupdate",
      () => {
        if (!this._video.seeking && !this.stream.seekable) {
          this.supposedCurrentTime = this._video.currentTime;
        }
      },
      false
    );

    /** video abort handler */
    this._video.addEventListener(
      "abort",
      () => {
        Log.debug("video abort!");
      },
      false
    );

    /** video ended handler */
    this._video.addEventListener(
      "ended",
      () => {
        this.supposedCurrentTime = 0;
      },
      false
    );

    /** video canpaly handler */
    this._video.addEventListener(
      "canplay",
      () => {
        /// segmentDuration = video.duration / totalSegments;
        this._video.play().catch((e) => {
          if (e.name === "NotAllowedError") {
            this._video.muted = true;
            this._video.play();
          }
        });
      }, false);
  }
  // TODO: check native support
  isPlaying() {
    return !(this._video.paused || this.stream.paused);
  }

  /** Load */
  start(scale = 1) {
    if (this.stream) {
      return this.stream.load(scale);
    } else {
      Promise.reject("Not attach stream!");
    }
  }

  /** Scale play */
  scalePlay(scale) {
    if (this.stream) {
      this.stream.scalePlay(scale);
    }
  }

  /** stop */
  stop() {
    this.stream.stop();
  }

  /** destroy */
  destroy() {
    this.stream.destroy();
  }

  _onInfo(info) {
    if (this.infoHandler) {
      this.infoHandler(info);
    }
  }

  _onData(data) {
    if (this.dataHandler) {
      this.dataHandler(data);
    }
  }

  _onError(e) {
    if (this.errorHandler) {
      this.errorHandler(e);
    }
  }

  _is_in_buffered(current_time) {
    let buffereds = this._video.buffered;
    let result = { inBuffered: false, seekOffset: 0 };
    for (let i = 0; i < buffereds.length; i++) {
      if (
        current_time >= buffereds.start(i) &&
        current_time <= buffereds.end(i)
      ) {
        result.inBuffered = true;
        result.seekOffset = buffereds.end(i);
        break;
      }
    }
    return result;
  }
}
