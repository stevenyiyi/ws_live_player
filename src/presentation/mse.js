import { EventEmitter } from "../utils/event.js";
import { getTagged } from "../utils/logger.js";

const LOG_TAG = "mse";
const Log = getTagged(LOG_TAG);

export class MSEBuffer {
  constructor(parent, codec) {
    this.mediaSource = parent.mediaSource;
    this.players = parent.players;
    this.cleaning = false;
    this.parent = parent;
    this.queue = [];
    this.cleanResolvers = [];
    this.codec = codec;
    this.cleanRanges = [];
    this.updatesToCleanup = 0;
    this.firstMoveToBufferStart = true;

    Log.debug(`Use codec: ${codec}`);

    this.sourceBuffer = this.mediaSource.addSourceBuffer(codec);
    Log.debug(`Source buffer mode:${this.sourceBuffer.mode}`);
    this.eventSource = new EventEmitter(this.sourceBuffer);

    this.eventSource.addEventListener("updatestart", (_) => {
      // this.updating = true;
      // Log.debug('update start');
      if (this.cleaning) {
        Log.debug(`${this.codec} cleaning start`);
      }
    });

    this.eventSource.addEventListener("update", (_) => {
      if (this.cleaning) {
        Log.debug(`${this.codec} cleaning update`);
      }
    });

    this.eventSource.addEventListener("updateend", (_) => {
      // Log.debug('update end');
      if (this.cleaning) {
        Log.debug(`${this.codec} cleaning end`);
        try {
          if (
            this.sourceBuffer.buffered.length &&
            this.scaled(this.players[0].currentTime) < this.sourceBuffer.buffered.start(0)
          ) {
            this.players[0].userSeekClick = false;
            this.players[0].currentTime = this.unscaled(this.sourceBuffer.buffered.start(0));
          }
        } catch (e) {
          // TODO: do something?
        }

        while (this.cleanResolvers.length) {
          let resolver = this.cleanResolvers.shift();
          resolver();
        }

        this.cleaning = false;

        if (this.cleanRanges.length) {
          this.doCleanup();
          return;
        }
      }

      if (this.sourceBuffer.updating) return;

      this.parent.setDurationInfinity();
      // cleanup buffer after 100 updates
      this.updatesToCleanup++;
      if (this.updatesToCleanup > 100) {
        this.cleanupBuffer();
        this.updatesToCleanup = 0;
      }
      this.feedNext();
    });

    this.eventSource.addEventListener("error", (e) => {
      Log.debug(`Source buffer error: ${this.mediaSource.readyState}`);
      if (this.mediaSource.sourceBuffers.length) {
        this.mediaSource.removeSourceBuffer(this.sourceBuffer);
      }
      this.parent.eventSource.dispatchEvent("error", e);
    });

    this.eventSource.addEventListener("abort", (e) => {
      Log.debug(`Source buffer aborted: ${this.mediaSource.readyState}`);
      if (this.mediaSource.sourceBuffers.length) {
        this.mediaSource.removeSourceBuffer(this.sourceBuffer);
      }
      this.parent.eventSource.dispatchEvent("error", e);
    });

    if (!this.sourceBuffer.updating) {
      this.feedNext();
    }
    // TODO: cleanup every hour for live streams
  }

  scaled(timestamp) {
    return timestamp / this.parent.scaleFactor;
  }

  unscaled(timestamp) {
    return timestamp * this.parent.scaleFactor;
  }

  firstMoveToBufferedStart(f) {
    this.firstMoveToBufferStart = f;
  }

  getBufferedDuration() {
    let duration = 0;
    let buffered = this.sourceBuffer.buffered;
    for (let i = 0; i < buffered.length; i++) {
      duration += buffered.end(i) - buffered.start(i);
    }
    return duration;
  }

  isInBuffered() {
    let currentPlayTime = this.scaled(this.players[0].currentTime);
    let buffered = this.sourceBuffer.buffered;
    let f = false;
    for (let i = 0; i < buffered.length; i++) {
      if (currentPlayTime >= buffered.start(i) && currentPlayTime <= buffered.end(i)) {
        if (buffered.end(i) === currentPlayTime) {
          Log.warn(`currentTime:${currentPlayTime} is end of buffered!`)
        }
        f = true;
        break;
      }
    }
    return f;
  }

  checkBuffer() {
    if (!this.isInBuffered()) {
      let currentPlayTime = this.scaled(this.players[0].currentTime);
      let buffered = this.sourceBuffer.buffered;
      for (let i = 0; i < buffered.length; i++) {
        if (currentPlayTime < buffered.start(i) && (buffered.start(i) - currentPlayTime) <= 5) {
          Log.debug(`currentTime:${currentPlayTime} move to buffered position:${buffered.start(i)} playing!`)
          this.players[0].userSeekClick = false;
          this.players[0].currentTime = this.unscaled(buffered.start(i));
          break;
        }
      }
    }
  }

  cleanupBuffer() {
    this.checkBuffer();
    if (this.sourceBuffer.buffered.length && !this.sourceBuffer.updating) {
      let currentPlayTime = this.scaled(this.players[0].currentTime);
      let bufferedDuration = this.getBufferedDuration();
      if (bufferedDuration > this.parent.bufferDuration) {
        let buffered = this.sourceBuffer.buffered;
        for (let i = 0; i < buffered.length; i++) {
          let starttime = buffered.start(i);
          let endtime = buffered.end(i);
          try {
            if (!this.sourceBuffer.updating) {
              if (currentPlayTime >= starttime && currentPlayTime <= endtime) {
                if (currentPlayTime > starttime) {
                  this.sourceBuffer.remove(starttime, currentPlayTime);
                }
              } else {
                this.sourceBuffer.remove(starttime, endtime);
              }
            }
          } catch (e) {
            Log.warn("Failed to cleanup buffer:", e);
            this.parent.eventSource.dispatchEvent("error", e);
          }
        }
      }
    }
  }

  async destroy() {
    this.eventSource.destroy();
    ///await this.clear();
    this.queue = [];
    this.mediaSource.removeSourceBuffer(this.sourceBuffer);
  }

  clear() {
    this.queue = [];
    let promises = [];
    for (let i = 0; i < this.sourceBuffer.buffered.length; i++) {
      // TODO: await remove
      this.cleaning = true;
      promises.push(
        new Promise((resolve) => {
          this.cleanResolvers.push(resolve);
          if (!this.sourceBuffer.updating) {
            this.sourceBuffer.remove(
              this.sourceBuffer.buffered.start(i),
              this.sourceBuffer.buffered.end(i)
            );
            resolve();
          } else {
            this.sourceBuffer.onupdateend = () => {
              if (this.sourceBuffer && i < this.sourceBuffer.buffered.length) {
                this.sourceBuffer.remove(
                  this.sourceBuffer.buffered.start(i),
                  this.sourceBuffer.buffered.end(i)
                );
              }
              resolve();
            };
          }
        })
      );
    }
    return Promise.all(promises);
  }

  setLive(is_live) {
    this.is_live = is_live;
  }

  feedNext() {
    if (!this.sourceBuffer.updating && !this.cleaning && this.queue.length) {
      this.doAppend(this.queue.shift());
    }
  }

  doCleanup() {
    if (!this.cleanRanges.length) {
      this.cleaning = false;
      this.feedNext();
      return;
    }
    let range = this.cleanRanges.shift();
    Log.debug(`${this.codec} remove range [${range[0]} - ${range[1]}). 
                  \nUpdating: ${this.sourceBuffer.updating}
                  `);
    this.cleaning = true;
    this.sourceBuffer.remove(range[0], range[1]);
  }

  initCleanup() {
    if (
      this.sourceBuffer.buffered.length &&
      !this.sourceBuffer.updating &&
      !this.cleaning
    ) {
      Log.debug(`${this.codec} cleanup`);
      let removeBound =
        this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1) -
        2;

      for (let i = 0; i < this.sourceBuffer.buffered.length; ++i) {
        let removeStart = this.sourceBuffer.buffered.start(i);
        let removeEnd = this.sourceBuffer.buffered.end(i);
        if (
          this.scaled(this.players[0].currentTime) <= removeStart ||
          removeBound <= removeStart
        )
          continue;

        if (removeBound <= removeEnd && removeBound >= removeStart) {
          Log.debug(
            `Clear [${removeStart}, ${removeBound}], leave [${removeBound}, ${removeEnd}]`
          );
          removeEnd = removeBound;
          if (removeEnd != removeStart) {
            this.cleanRanges.push([removeStart, removeEnd]);
          }
          continue; // Do not cleanup buffered range after current position
        }
        this.cleanRanges.push([removeStart, removeEnd]);
      }

      this.doCleanup();
    } else {
      this.feedNext();
    }
  }

  doAppend(data) {
    let err = this.players[0].error;
    if (err) {
      Log.error(`Error occured: ${MSE.ErrorNotes[err.code]}`);
      try {
        this.players.forEach((video) => {
          video.pause();
        });
        this.mediaSource.endOfStream();
      } catch (e) {
        Log.error("Can't stop video!");
      }
      this.parent.eventSource.dispatchEvent("error");
    } else {
      try {
        this.sourceBuffer.appendBuffer(data);
        if (this.firstMoveToBufferStart && this.sourceBuffer.buffered.length) {
          this.players[0].userSeekClick = false;
          Log.debug(`move to first buffered:${this.sourceBuffer.buffered.start(0)}`);
          this.players[0].currentTime = this.unscaled(this.sourceBuffer.buffered.start(0));
          if (this.players[0].autoPlay) {
            this.players[0].start();
          }
          this.firstMoveToBufferStart = false;
        }
      } catch (e) {
        if (e.name === "QuotaExceededError") {
          Log.debug(`${this.codec} quota fail`);
          this.queue.unshift(data);
          this.initCleanup();
          return;
        }

        // reconnect on fail
        Log.error(
          `Error occured while appending buffer. ${e.name}: ${e.message}`
        );
        this.parent.eventSource.dispatchEvent("error");
      }
    }
  }

  feed(data) {
    this.queue = this.queue.concat(data);
    if (this.sourceBuffer && !this.sourceBuffer.updating && !this.cleaning) {
      this.feedNext();
    }
  }
}

export class MSE {
  // static CODEC_AVC_BASELINE = "avc1.42E01E";
  // static CODEC_AVC_MAIN = "avc1.4D401E";
  // static CODEC_AVC_HIGH = "avc1.64001E";
  // static CODEC_VP8 = "vp8";
  // static CODEC_AAC = "mp4a.40.2";
  // static CODEC_VORBIS = "vorbis";
  // static CODEC_THEORA = "theora";

  static get ErrorNotes() {
    return {
      [MediaError.MEDIA_ERR_ABORTED]: "fetching process aborted by user",
      [MediaError.MEDIA_ERR_NETWORK]: "error occurred when downloading",
      [MediaError.MEDIA_ERR_DECODE]: "error occurred when decoding",
      [MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED]: "audio/video not supported",
    };
  }

  static isSupported(codecs) {
    return (
      window.MediaSource &&
      window.MediaSource.isTypeSupported(
        `video/mp4; codecs="${codecs.join(",")}"`
      )
    );
  }

  constructor(players) {
    this.players = players;
    const playing = this.players.map((video, idx) => {
      video.onplaying = function () {
        playing[idx] = true;
      };
      video.onpause = function () {
        playing[idx] = false;
      };
      return !video.paused;
    });
    this.playing = playing;
    this.bufferDuration_ = 120;
    this.mediaSource = new MediaSource();
    this.eventSource = new EventEmitter(this.mediaSource);
    this.aborting = false;
    this.scaleFactor = 1.0;
    this.reset();
  }

  setDurationInfinity() {
    if (!this.is_live) return;
    for (let idx in this.buffers) {
      if (this.buffers[idx].sourceBuffer.updating) return;
    }
    //hack to get safari on mac to start playing, video.currentTime gets stuck on 0
    if (
      this.mediaSource.duration !== Number.POSITIVE_INFINITY &&
      this.players[0].currentTime === 0 &&
      this.mediaSource.duration > 0
    ) {
      this.players[0].currentTime = this.mediaSource.duration - 1;
      this.mediaSource.duration = Number.POSITIVE_INFINITY;
    }
  }

  set bufferDuration(buffDuration) {
    this.bufferDuration_ = buffDuration;
  }

  get bufferDuration() {
    return this.bufferDuration_;
  }

  deattachPlayers() {
    this.players.forEach((video) => {
      video.pause();
      video.src = "";
      video.load();
    });
  }

  async destroy() {
    Log.debug('mse destory!');
    await this.reset();
    this.eventSource.destroy();
    this.mediaSource = null;
    this.eventSource = null;
    this.deattachPlayers();
  }

  play() {
    this.players.forEach((video, idx) => {
      if (video.paused && !this.playing[idx]) {
        Log.debug(`player ${idx}: play`);
        video.play();
      }
    });
  }

  setScale(rate) {
    this.players.forEach((video) => {
      video.playbackRate = rate;
    });
    this.scaleFactor = rate;
    Log.debug(`video scale:${this.players[0].playbackRate}`);
  }

  setLive(is_live) {
    for (let idx in this.buffers) {
      this.buffers[idx].setLive(is_live);
    }
    this.is_live = is_live;
  }

  setFirstBufferedStart(enabled) {
    for (let idx in this.buffers) {
      this.buffers[idx].firstMoveToBufferedStart(enabled);
    }
  }

  resetBuffers() {
    this.players.forEach((video, idx) => {
      if (!video.paused && this.playing[idx]) {
        video.pause();
        video.currentTime = 0;
      }
    });

    let promises = [];
    for (let buffer of this.buffers.values()) {
      promises.push(buffer.clear());
    }
    return Promise.all(promises).then(() => {
      this.mediaSource.endOfStream();
      this.mediaSource.duration = 0;
      this.mediaSource.clearLiveSeekableRange();
      this.play();
    });
  }

  clear() {
    this.reset();
    this.players.forEach((video) => {
      video.src = URL.createObjectURL(this.mediaSource);
    });

    return this.setupEvents();
  }

  setupEvents() {
    this.eventSource.clear();
    this.resolved = false;
    this.mediaReady = new Promise((resolve, reject) => {
      this._sourceOpen = () => {
        Log.debug(`Media source opened: ${this.mediaSource.readyState}`);
        if (!this.resolved) {
          this.resolved = true;
          resolve();
        }
      };
      this._sourceEnded = () => {
        Log.debug(`Media source ended: ${this.mediaSource.readyState}`);
      };
      this._sourceClose = () => {
        Log.debug(`Media source closed: ${this.mediaSource.readyState}`);
        if (this.resolved) {
          this.eventSource.dispatchEvent("sourceclosed");
        }
      };
      this.eventSource.addEventListener("sourceopen", this._sourceOpen);
      this.eventSource.addEventListener("sourceended", this._sourceEnded);
      this.eventSource.addEventListener("sourceclose", this._sourceClose);
    });
    return this.mediaReady;
  }

  async reset() {
    this.ready = false;
    for (let track in this.buffers) {
      await this.buffers[track].destroy();
      delete this.buffers[track];
    }
    if (this.mediaSource && this.mediaSource.readyState == "open") {
      this.mediaSource.duration = 0;
      this.mediaSource.endOfStream();
    }
    this.updating = false;
    this.resolved = false;
    this.buffers = {};
    this.aborting = false;
  }

  setCodec(track, mimeCodec) {
    return this.mediaReady.then(() => {
      this.buffers[track] = new MSEBuffer(this, mimeCodec);
      this.buffers[track].setLive(this.is_live);
    });
  }

  feed(track, data) {
    if (this.buffers[track]) {
      this.buffers[track].feed(data);
    }
  }

  scaled(timestamp) {
    return timestamp / this.scaleFactor;
  }

  unscaled(timestamp) {
    return timestamp * this.scaleFactor;
  }

  realMoveToBuffer(timeid, pos) {
    clearInterval(timeid);
    Log.debug(`Seeking move to buffered postion:${pos}`);
    this.players[0].userSeekClick = false;
    this.players[0].currentTime = this.unscaled(pos);
    this.aborting = false;
  }

  moveSeekBuffer() {
    if (this.aborting) return;

    this.aborting = true;
    const timerid = setInterval(() => {
      let isInBuffered = false;
      let currentPlayTime = this.scaled(this.players[0].currentTime);
      let buffered = this.players[0].buffered;
      let bufferedLen = this.players[0].buffered.length;
      Log.debug(`Seek current time:${currentPlayTime}`);
      for (let i = 0; i < bufferedLen; i++) {
        if (
          currentPlayTime >= buffered.start(i) &&
          currentPlayTime <= buffered.end(i)
        ) {
          Log.debug(`seek position in buffered, begin:${buffered.start(i)},end:${buffered.end(i)}`);
          clearInterval(timerid);
          isInBuffered = true;
          this.aborting = false;
          break;
        }
      }
      if (!isInBuffered) {
        for (let i = 0; i < bufferedLen; i++) {
          let bstart = buffered.start(i);
          let bend = buffered.end(i);
          let dur = bend - bstart;
          Log.debug(
            `buffered index${i},start:${bstart},end:${bend}, duratiom:${dur}`
          );
          if (currentPlayTime < bstart && dur >= 1) {
            let delta = bstart - currentPlayTime;
            if (delta <= 5 && dur >= 1) {
              this.realMoveToBuffer(timerid, bstart);
              break;
            }
          }
        }
      }
    }, 500);
  }

  abort() {
    ///this.buffers[track].aborting = true;
    const sourceBufferList = this.mediaSource.activeSourceBuffers;
    for (const sourceBuffer of sourceBufferList) {
      /// Do something with each SourceBuffer, such as call abort()
      sourceBuffer.abort();
    }
  }
}
