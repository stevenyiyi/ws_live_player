import { getTagged } from "./utils/logger.js";
import RTSPStream from "./rtsp/RTSPStream";
const LOG_TAG = "ASPlayer";
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
    this.runing = false;
    this.stream = new RTSPStream(options); 
    this.stream.eventSource.addEventListener("error", this._onError.bind(this));
    this.stream.eventSource.addEventListener("info", this._onInfo.bind(this));
    this._playEvent = this._playHandler.bind(this);
    this._pauseEvent = this._pauseHandler.bind(this);
    this._endedEvent = this._endedHandler.bind(this);
    this._abortEvent = this._abortHandler.bind(this);
    this._canplayEvent = this._canplayHandler.bind(this);
    this._seekingEvent = this._seekingHandler.bind(this);
    this._timeupdateEvent = this._timeupdateHandler.bind(this);
    this._attachVideo(options.video);
  }

  _playHandler() {
    if (!this.isPlaying()) {
      this.stream.start();
    }
  }

  _pauseHandler() {
    this.stream.pause();
  }

  _seekingHandler() {
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
    } else {
      console.log("No user seeking!");
      this._video.userSeekClick = true;
    }
  }

  _timeupdateHandler() {
    if (!this._video.seeking && !this.stream.seekable) {
      this.supposedCurrentTime = this._video.currentTime;
    }
  }

  _abortHandler() {
    Log.debug("video abort!");
  }

  _endedHandler() {
    this.supposedCurrentTime = 0;
  }

  _canplayHandler() {
    /// segmentDuration = video.duration / totalSegments;
    this._video.play().catch((e) => {
      if (e.name === "NotAllowedError") {
        this._video.muted = true;
        this._video.play();
      }
    });
  }

  /** video play handler */
  _attachVideo(video) {
    this._video = video;
    this._video.userSeekClick = true;
    this._video.addEventListener(
      "play",
      this._playEvent,
      false
    );
    /** video pause handler */
    this._video.addEventListener(
      "pause",
      this._pauseEvent,
      false
    );
    /** video seeking handler */
    this._video.addEventListener(
      "seeking",
      this._seekingEvent,
      false
    );

    /** video updatetime handler */
    this._video.addEventListener(
      "timeupdate",
      this._timeupdateEvent,
      false
    );

    /** video abort handler */
    this._video.addEventListener(
      "abort",
      this._abortEvent,
      false
    );

    /** video ended handler */
    this._video.addEventListener(
      "ended",
      this._endedEvent,
      false
    );

    /** video canpaly handler */
    this._video.addEventListener(
      "canplay",
      this._canplayEvent,
      false);
  }
  // TODO: check native support
  isPlaying() {
    return !(this._video.paused || this.stream.paused);
  }

  /** Load */
  start(scale = 1, offset = 0) {
    if (this.stream) {
      this._video.userSeekClick = false;
      this._video.currentTime = offset;
      return this.stream.load(scale, offset);
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
    this._detachVideo();
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

  _detachVideo() {
    this._video.removeEventListener('play', this._playEvent);
    this._video.removeEventListener('pause', this._pauseEvent);
    this._video.removeEventListener('canplay', this._canplayEvent);
    this._video.removeEventListener('timeupdate', this._timeupdateEvent);
    this._video.removeEventListener('ended', this._endedEvent);
    this._video.removeEventListener('abort', this._abortEvent);
    this._video.removeEventListener('seeking', this._seekingEvent);
  }
}
