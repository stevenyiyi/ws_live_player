import RTSPStream from "./rtsp/RTSPStream";

export class ASPlayer {
  constructor() {
    // Always call super first in constructor
    super();
    this._video = null;
    this.errorHandler = null;
    this.infoHandler = null;
    this.dataHandler = null;
    this.queryCredentials = null;
    this.bufferDuration_ = 120;
    this.url = null;
    this.stream = new RTSPStream();
  }

  /** video play handler */
  attachVideo(video) {
    this._video = video;
    this._video.addEventListener(
      "play",
      () => {
        this.continuousRecording.pause(false);
        this.eventRecording.pause(false);

        if (!this.isPlaying()) {
          this.client.start();
        }
      },
      false
    );
    /** video pause handler */
    this._video.addEventListener(
      "pause",
      () => {
        this.client.stop();
        this.continuousRecording.pause(true);
        this.eventRecording.pause(true);
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
        // disconnect the transport when the player is closed
        this.stream.stop();
        this.transport.disconnect().then(() => {
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
  start(url) {
    if (this.stream) {
      this.url = url;
      this.stream.load(this.url);
    }
  }

  /** stop */
  stop() {
    this.stream.stop();
  }

  _is_in_buffered(current_time) {
    let buffereds = this._video.buffered;
    let f = false;
    for (let i = 0; i < buffereds.length; i++) {
      if (
        current_time >= buffereds[i].start(0) &&
        current_time <= buffereds[i].end(0)
      ) {
        f = true;
        break;
      }
    }
    return f;
  }
}
