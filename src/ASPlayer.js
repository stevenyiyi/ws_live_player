import RTSPStream from "./rtsp/RTSPStream";

export class ASPlayer {
  constructor(options) {
    // Always call super first in constructor
    this.errorHandler = null;
    this.infoHandler = null;
    this.dataHandler = null;
    this.queryCredentials = null;
    this.bufferDuration_ = 120;
    this.stream = new RTSPStream(options);
    this._attachVideo(options.video);
  }

  /** video play handler */
  _attachVideo(video) {
    this._video = video;
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
        this.stream.stop();
      },
      false
    );
    /** video seeking handler */
    this._video.addEventListener(
      "seeking",
      () => {
        if (!this._is_in_buffered(this._video.currentTime)) {
          this.stream.seek(this._video.currentTime);
        }
      },
      false
    );
    /** video abort handler */
    this._video.addEventListener(
      "abort",
      () => {
        this.stream.abort().then(() => {
          this.stream.destroy();
        });
      },
      false
    );
  }

  // TODO: check native support
  isPlaying() {
    return !(this._video.paused || this.stream.paused);
  }

  /** Load */
  start() {
    if (this.stream) {
      this.stream.load();
    }
  }

  /** stop */
  stop() {
    this.stream.stop();
  }

  /** destory */
  destroy() {
    this.stream.destory();
  }

  _is_in_buffered(current_time) {
    let buffereds = this._video.buffered;
    let f = false;
    for (let i = 0; i < buffereds.length; i++) {
      if (
        current_time >= buffereds.start(i) &&
        current_time <= buffereds.end(i)
      ) {
        f = true;
        break;
      }
    }
    return f;
  }
}
