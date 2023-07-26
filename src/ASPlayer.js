import extend from "./utils/extend";
import ASTimeRanges from "./utils/ASTimeRanges";
import ASMediaError from "./utils/ASMediaError";
import ASMediaType from "./ASMediaType";
import Bisector from "./Bisector";
import RTSPStream from "./rtsp/RTSPStream";
const constants = {
  /**
   * Constants for networkState
   */
  NETWORK_EMPTY: 0,
  NETWORK_IDLE: 1,
  NETWORK_LOADING: 2,
  NETWORK_NO_SOURCE: 3,

  /**
   * Constants for readyState
   */
  HAVE_NOTHING: 0,
  HAVE_METADATA: 1,
  HAVE_CURRENT_DATA: 2,
  HAVE_FUTURE_DATA: 3,
  HAVE_ENOUGH_DATA: 4
};

const State = {
  INITIAL: "INITIAL",
  SEEKING_END: "SEEKING_END",
  LOADED: "LOADED",
  PRELOAD: "PRELOAD",
  READY: "READY",
  PLAYING: "PLAYING",
  SEEKING: "SEEKING",
  ENDED: "ENDED",
  ERROR: "ERROR"
};

const SeekState = {
  NOT_SEEKING: "NOT_SEEKING",
  BISECT_TO_TARGET: "BISECT_TO_TARGET",
  BISECT_TO_KEYPOINT: "BISECT_TO_KEYPOINT",
  LINEAR_TO_TARGET: "LINEAR_TO_TARGET"
};

const SeekMode = {
  EXACT: "exact",
  FAST: "fast"
};

class ASPlayer extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    this._state = State.INITIAL;
    this._seekState = SeekState.NOT_SEEKING;
    this._detectedType = null;
    this._canvas = document.createElement("canvas");
    this._frameSink = null;
    this._mediaStream = new MediaStream();
    this._video = document.createElement("video");
    this._video.playsInline = true; // for iOS to not fullscreen it
    this._video.srcObject = this._mediaStream;
    this._canvasStream = null;

    extend(this, constants);

    this._view = this._video;
    this._view.style.position = "absolute";
    this._view.style.top = "0";
    this._view.style.left = "0";
    this._view.style.width = "100%";
    this._view.style.height = "100%";
    this._view.style.objectFit = "contain";

    // Used for relative timestamp in _log()
    this._startTime = window.performance.now();

    this._audioInfo = null;
    this._videoInfo = null;
    this._muted = false;
    this._initialPlaybackPosition = 0.0;
    this._initialPlaybackOffset = 0.0;
    this._prebufferingAudio = false;
    this._initialSeekTime = 0.0;

    this._currentSrc = "";
    this._streamEnded = false;
    this._mediaError = null;
    this._dataEnded = false;
    this._byteLength = 0;
    this._duration = null;
    this._lastSeenTimestamp = null;
    this._nextFrameTimer = null;
    this._loading = false;
    this._started = false;
    this._paused = true;
    this._ended = false;
    this._startedPlaybackInDocument = false;

    this._stream = undefined;

    // Benchmark data, exposed via getPlaybackStats()
    this._framesProcessed = 0; // frames
    this._targetPerFrameTime = 1000 / 60; // ms
    this._actualPerFrameTime = 0; // ms
    this._totalFrameTime = 0; // ms
    this._totalFrameCount = 0; // frames
    this._playTime = 0; // ms
    this._bufferTime = 0; // ms
    this._drawingTime = 0; // ms
    this._proxyTime = 0; // ms
    this._totalJitter = 0; // sum of ms we're off from expected frame delivery time
    // Benchmark data that doesn't clear
    this._droppedAudio = 0; // number of times we were starved for audio
    this._delayedAudio = 0; // seconds audio processing was delayed by blocked CPU
    this._lateFrames = 0; // number of times a frame was late and we had to halt audio
    this._poster = "";
    this._thumbnail = null;

    this._frameEndTimestamp = 0.0;
    this._audioEndTimestamp = 0.0;
    this._decodedFrames = [];
    this._pendingFrames = [];
    this._lastFrameDecodeTime = 0.0;
    this._lastFrameVideoCpuTime = 0;
    this._lastFrameAudioCpuTime = 0;
    this._lastFrameDemuxerCpuTime = 0;
    this._lastFrameDrawingTime = 0;
    this._lastFrameBufferTime = 0;
    this._lastFrameProxyTime = 0;
    this._lastVideoCpuTime = 0;
    this._lastAudioCpuTime = 0;
    this._lastDemuxerCpuTime = 0;
    this._lastBufferTime = 0;
    this._lastProxyTime = 0;
    this._lastDrawingTime = 0;
    this._lastFrameTimestamp = 0.0;
    this._currentVideoCpuTime = 0.0;

    this._lastTimeUpdate = 0; // ms
    this._timeUpdateInterval = 250; // ms

    // -- seek functions
    this._seekTargetTime = 0.0;
    this._bisectTargetTime = 0.0;
    this._seekMode = null;
    this._lastSeekPosition = null;
    this._seekBisector = null;
    this._didSeek = null;

    // Display size...
    this._width = 0;
    this._height = 0;
    this._volume = 1;
    this._playbackRate = 1;

    Object.defineProperties(this, {
      /**
       * HTMLMediaElement src property
       */
      src: {
        get: function getSrc() {
          return this.getAttribute("src") || "";
        },
        set: function setSrc(val) {
          this.setAttribute("src", val);
          this._loading = false; // just in case?
          this._prepForLoad("interactive");
        }
      },
      /**
       * HTMLMediaElement buffered property
       */
      buffered: {
        get: function getBuffered() {
          let ranges;
          if (this._stream && this._byteLength && this._duration) {
            ranges = this._stream.getBufferedRanges().map((range) => {
              return range.map((offset) => {
                return (offset / this._stream.length) * this._duration;
              });
            });
          } else {
            ranges = [[0, 0]];
          }
          return new ASTimeRanges(ranges);
        }
      },
      /**
       * HTMLMediaElement seekable property
       */
      seekable: {
        get: function getSeekable() {
          if (
            this.duration < Infinity &&
            this._stream &&
            this._stream.seekable
          ) {
            return new ASTimeRanges([[0, this._duration]]);
          } else {
            return new ASTimeRanges([]);
          }
        }
      },

      /**
       * HTMLMediaElement currentTime property
       */
      currentTime: {
        get: function getCurrentTime() {
          if (this._state === State.SEEKING) {
            return this._seekTargetTime;
          } else {
            if (this._codec) {
              if (this._state === State.PLAYING && !this._paused) {
                return this._getPlaybackTime();
              } else {
                return this._initialPlaybackOffset;
              }
            } else {
              return this._initialSeekTime;
            }
          }
        },
        set: function setCurrentTime(val) {
          this._seek(val, SeekMode.EXACT);
        }
      },

      /**
       * HTMLMediaElement duration property
       */
      duration: {
        get: function getDuration() {
          if (this._codec && this._codec.loadedMetadata) {
            if (this._duration !== null) {
              return this._duration;
            } else {
              return Infinity;
            }
          } else {
            return NaN;
          }
        }
      },

      /**
       * HTMLMediaElement paused property
       */
      paused: {
        get: function getPaused() {
          return this._paused;
        }
      },

      /**
       * HTMLMediaElement ended property
       */
      ended: {
        get: function getEnded() {
          return this._ended;
        }
      },

      /**
       * HTMLMediaElement ended property
       */
      seeking: {
        get: function getSeeking() {
          return this._state === State.SEEKING;
        }
      },

      /**
       * HTMLMediaElement muted property
       */
      muted: {
        get: function getMuted() {
          return this._muted;
        },
        set: function setMuted(val) {
          this._muted = val;
          if (this._started && !this._muted && this.stream.hasAudio) {
            this._log("unmuting: switching from timer to audio clock");
            this._initAudioFeeder();
            this._startPlayback(this._audioEndTimestamp);
          }
          this._fireEventAsync("volumechange");
        }
      },

      /**
       * HTMLMediaElement poster property
       */
      poster: {
        get: function getPoster() {
          return this._poster;
        },
        set: function setPoster(val) {
          this._poster = val;
          if (!this._started) {
            if (this._thumbnail) {
              this.removeChild(this._thumbnail);
            }
            let thumbnail = new Image();
            thumbnail.src = this._poster;
            thumbnail.className = "anyseejs-poster";
            thumbnail.style.position = "absolute";
            thumbnail.style.top = "0";
            thumbnail.style.left = "0";
            thumbnail.style.width = "100%";
            thumbnail.style.height = "100%";
            thumbnail.style.objectFit = "contain";
            thumbnail.style.visibility = "hidden";
            thumbnail.addEventListener("load", () => {
              if (this._thumbnail === thumbnail) {
                ASPlayer.styleManager.appendRule("." + this._instanceId, {
                  width: thumbnail.naturalWidth + "px",
                  height: thumbnail.naturalHeight + "px"
                });
                ASPlayer.updatePositionOnResize();
                thumbnail.style.visibility = "visible";
              }
            });
            this._thumbnail = thumbnail;
            this.appendChild(thumbnail);
          }
        }
      },

      /**
       * HTMLMediaElement video width property
       */
      videoWidth: {
        get: function getVideoWidth() {
          if (this._videoInfo) {
            return this._videoInfo.displayWidth;
          } else {
            return 0;
          }
        }
      },

      /**
       * HTMLMediaElement video height property
       */
      videoHeight: {
        get: function getVideoHeight() {
          if (this._videoInfo) {
            return this._videoInfo.displayHeight;
          } else {
            return 0;
          }
        }
      },
      /**
       * Custom video framerate property
       */
      videoFrameRate: {
        get: function getVideoFrameRate() {
          if (this._videoInfo) {
            if (this._videoInfo.fps === 0) {
              return this._totalFrameCount / (this._totalFrameTime / 1000);
            } else {
              return this._videoInfo.fps;
            }
          } else {
            return 0;
          }
        }
      },

      /**
       * Custom audio metadata property
       */
      audioChannels: {
        get: function getAudioChannels() {
          if (this._audioInfo) {
            return this._audioInfo.channels;
          } else {
            return 0;
          }
        }
      },

      /**
       * Custom audio metadata property
       */
      audioSampleRate: {
        get: function getAudioChannels() {
          if (this._audioInfo) {
            return this._audioInfo.rate;
          } else {
            return 0;
          }
        }
      },
      /**
       * @property width
       * @todo reflect to the width attribute?
       */
      width: {
        get: function getWidth() {
          return this._width;
        },
        set: function setWidth(val) {
          this._width = parseInt(val, 10);
          this.style.width = this._width + "px";
        }
      },

      /**
       * @property height
       * @todo reflect to the height attribute?
       */
      height: {
        get: function getHeight() {
          return this._height;
        },
        set: function setHeight(val) {
          this._height = parseInt(val, 10);
          this.style.height = this._height + "px";
        }
      },

      /**
       * @property autoplay {boolean} stub prop
       * @todo reflect to the autoplay attribute?
       * @todo implement actual autoplay behavior
       */
      autoplay: {
        get: function getAutoplay() {
          return false;
        },
        set: function setAutoplay(val) {
          // ignore
        }
      },

      /**
       * @property controls {boolean} stub prop
       * @todo reflect to the controls attribute?
       * @todo implement actual control behavior
       */
      controls: {
        get: function getControls() {
          return false;
        },
        set: function setControls(val) {
          // ignore
        }
      },

      /**
       * @property loop {boolean} stub prop
       * @todo reflect to the controls attribute?
       * @todo implement actual loop behavior
       */
      loop: {
        get: function getLoop() {
          return false;
        },
        set: function setLoop(val) {
          // ignore
        }
      },

      /**
       * @property crossOrigin {string|null}
       * @todo properly pass through to underlying file
       */
      crossOrigin: {
        get: function getCrossOrigin() {
          return this._crossOrigin;
        },
        set: function setCrossOrigin(val) {
          switch (val) {
            case null:
              this._crossOrigin = val;
              this.removeAttribute("crossorigin");
              break;
            default:
              val = "anonymous";
            // fall through
            case "":
            case "anonymous":
            case "use-credentials":
              this._crossOrigin = val;
              this.setAttribute("crossorigin", val);
          }
          if (this._thumbnail) {
            this._thumbnail.crossOrigin = val;
          }
        }
      },
      /**
       * Returns the URL to the currently-playing resource.
       * @property currentSrc {string|null}
       */
      currentSrc: {
        get: function getCurrentSrc() {
          // @todo return absolute URL per spec
          return this._currentSrc;
        }
      },

      defaultMuted: {
        get: function getDefaultMuted() {
          return false;
        }
      },

      defaultPlaybackRate: {
        get: function getDefaultPlaybackRate() {
          return 1;
        }
      },

      /**
       * @property error {OGVMediaError|null}
       */
      error: {
        get: function getError() {
          if (this._state === State.ERROR) {
            if (this._mediaError) {
              return this._mediaError;
            } else {
              return new ASMediaError(
                "unknown error occurred in media procesing"
              );
            }
          } else {
            return null;
          }
        }
      },

      /**
       * @property preload {string}
       */
      preload: {
        get: function getPreload() {
          return this.getAttribute("preload") || "";
        },
        set: function setPreload(val) {
          this.setAttribute("preload", val);
        }
      },

      /**
       * @property readyState {number}
       * @todo return more accurate info about availability of data
       */
      readyState: {
        get: function getReadyState() {
          if (this._stream && this._codec && this._codec.loadedMetadata) {
            // for now we don't really calc this stuff
            // just pretend we have lots of data coming in already
            return ASPlayer.HAVE_ENOUGH_DATA;
          } else {
            return ASPlayer.HAVE_NOTHING;
          }
        }
      },

      /**
       * @property networkState {number}
       * @todo implement
       */
      networkState: {
        get: function getNetworkState() {
          if (this._stream) {
            if (this._stream.waiting) {
              return ASPlayer.NETWORK_LOADING;
            } else {
              return ASPlayer.NETWORK_IDLE;
            }
          } else {
            if (this.readyState === ASPlayer.HAVE_NOTHING) {
              return ASPlayer.NETWORK_EMPTY;
            } else {
              return ASPlayer.NETWORK_NO_SOURCE;
            }
          }
        }
      },

      /**
       * @property playbackRate {number}
       */
      playbackRate: {
        get: function getPlaybackRate() {
          return this._playbackRate;
        },
        set: function setPlaybackRate(val) {
          var newRate = Number(val) || 1.0;
          if (this._audioFeeder) {
            this._audioFeeder.tempo = newRate;
          } else if (!this._paused) {
            // Change while playing
            // Move to the coordinate system created by the new tempo
            this._initialPlaybackOffset = this._getPlaybackTime();
            this._initialPlaybackPosition =
              (newRate * window.performance.now()) / 1000;
          }
          this._playbackRate = newRate;
          this._fireEventAsync("ratechange");
        }
      },

      /**
       * @property played {ASTimeRanges}
       * @todo implement correctly more or less
       */
      played: {
        get: function getPlayed() {
          return new ASTimeRanges([[0, this.currentTime]]);
        }
      },

      /**
       * @property volume {number}
       */
      volume: {
        get: function getVolume() {
          return this._volume;
        },
        set: function setVolume(val) {
          this._volume = +val;
          this._fireEventAsync("volumechange");
        }
      }
    });

    /// Events!

    /**
     * custom onframecallback, takes frame decode time in ms
     */
    this.onframecallback = null;

    /**
     * Network state events
     * @todo implement
     */
    this.onloadstate = null;
    this.onprogress = null;
    this.onsuspend = null;
    this.onabort = null;
    this.onemptied = null;
    this.onstalled = null;

    /**
     * Called when all metadata is available.
     * Note in theory we must know 'duration' at this point.
     */
    this.onloadedmetadata = null;

    /**
     * Called when enough data for first frame is ready.
     * @todo implement
     */
    this.onloadeddata = null;

    /**
     * Called when enough data is ready to start some playback.
     * @todo implement
     */
    this.oncanplay = null;

    /**
     * Called when enough data is ready to play through to the
     * end if no surprises in network download rate.
     * @todo implement
     */
    this.oncanplaythrough = null;

    /**
     * Called when playback continues after a stall
     * @todo implement
     */
    this.onplaying = null;

    /**
     * Called when playback is delayed waiting on data
     * @todo implement
     */
    this.onwaiting = null;

    /**
     * Called when seeking begins
     * @todo implement
     */
    this.onseeking = null;

    /**
     * Called when seeking ends
     * @todo implement
     */
    this.onseeked = null;

    /**
     * Called when playback ends
     */
    this.onended = null;

    /**
     * Called when duration becomes known
     * @todo implement
     */
    this.ondurationchange = null;

    /**
     * Called periodically during playback
     */
    this.ontimeupdate = null;

    /**
     * Called when we start playback
     */
    this.onplay = null;

    /**
     * Called when we get paused
     */
    this.onpause = null;

    /**
     * Called when the playback rate changes
     * @todo implement
     */
    this.onratechange = null;

    /**
     * Called when the size of the video stream changes
     * @todo implement
     */
    this.onresize = null;

    /**
     * Called when the volume setting changes
     * @todo implement
     */
    this.onvolumechange = null;

    /**
     * Called when the audio feeder is created
     * This allows for modifying the instance for special audio processing
     */
    this.onaudiofeedercreated = null;

    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });
  }

  _time(cb) {
    let start = window.performance.now();
    cb();
    let delta = window.performance.now() - start;
    this._lastFrameDecodeTime += delta;
    return delta;
  }

  _log(msg) {
    let options = this._options;
    if (options.debug) {
      let now = window.performance.now(),
        delta = now - this._startTime;

      //console.log('+' + delta + 'ms ' + msg);
      //then = now;

      if (!options.debugFilter || msg.match(options.debugFilter)) {
        console.log("[" + Math.round(delta * 10) / 10 + "ms] " + msg);
      }
    }
  }

  _fireEvent(eventName, props = {}) {
    this._log("fireEvent " + eventName);

    let standard = typeof Event === "function";
    let event;
    if (standard) {
      // standard event creation
      event = new CustomEvent(eventName);
    } else {
      // IE back-compat mode
      // https://msdn.microsoft.com/en-us/library/dn905219%28v=vs.85%29.aspx
      event = document.createEvent("Event");
      event.initEvent(eventName, false, false);
    }

    for (let prop in props) {
      if (props.hasOwnProperty(prop)) {
        event[prop] = props[prop];
      }
    }

    let allowDefault = this.dispatchEvent(event);
    if (!standard && eventName === "resize" && this.onresize && allowDefault) {
      // resize demands special treatment!
      // in IE 11 it doesn't fire through to the .onresize handler
      // for some crazy reason
      this.onresize.call(this, event);
    }
  }

  _fireEventAsync(eventName, props = {}) {
    this._log("fireEventAsync " + eventName);
    setImmediate(() => {
      this._fireEvent(eventName, props);
    });
  }

  _startPlayback(offset) {
    this._initialPlaybackPosition =
      (this._playbackRate * window.performance.now()) / 1000;

    if (offset !== undefined) {
      this._initialPlaybackOffset = offset;
    }
    // Clear the late flag if it was set.
    this._prebufferingAudio = false;
    this._log(
      "continuing at " +
        this._initialPlaybackPosition +
        ", " +
        this._initialPlaybackOffset
    );
  }

  _stopPlayback() {
    this._initialPlaybackOffset = this._getPlaybackTime();
    this._log("pausing at " + this._initialPlaybackOffset);
  }

  /**
   * Get audio playback time position in file's units
   *
   * @return {number} seconds since file start
   */
  _getPlaybackTime(state) {
    if (this._prebufferingAudio || this._paused) {
      return this._initialPlaybackOffset;
    } else {
      let position;
      // @fixme handle paused/stoped time better
      position = (this._playbackRate * window.performance.now()) / 1000;

      return (
        position - this._initialPlaybackPosition + this._initialPlaybackOffset
      );
    }
  }

  // called when stopping old video on load()
  _stopVideo() {
    this._log("STOPPING");
    // kill the previous video if any
    this._state = State.INITIAL;
    this._seekState = SeekState.NOT_SEEKING;
    this._started = false;
    //this._paused = true; // don't change this?
    this._ended = false;
    this._frameEndTimestamp = 0.0;
    this._audioEndTimestamp = 0.0;
    this._lastFrameDecodeTime = 0.0;
    this._prebufferingAudio = false;

    // Abort all queued actions
    this._actionQueue.splice(0, this._actionQueue.length);

    if (this._stream) {
      // @todo fire an abort event if still loading
      // @todo fire an emptied event if previously had data
      this._stream.abort();
      this._stream = null;
      this._streamEnded = false;
    }

    this._videoInfo = null;
    this._audioInfo = null;
    if (this._audioFeeder) {
      this._audioFeeder.close();
      this._audioFeeder = null;
    }

    if (this._frameSink) {
      this._frameSink.clear();
      this._frameSink = null;
    }

    this._initialSeekTime = 0.0;
    // @todo set playback position, may need to fire timeupdate if wasnt previously 0
    this._initialPlaybackPosition = 0;
    this._initialPlaybackOffset = 0;
    this._duration = null; // do not fire durationchange
    // timeline offset to 0?
  }

  _seekStream(offset) {
    if (this._stream.seeking) {
      this._stream.abort();
    }
    if (this._stream.buffering) {
      this._stream.abort();
    }
    this._streamEnded = false;
    this._dataEnded = false;
    this._ended = false;
    this._stream
      .seek(offset)
      .then(() => {
        this._readBytesAndWait();
      })
      .catch((e) => {
        this._onStreamError(e);
      });
  }

  _onStreamError(err) {
    if (err.name === "AbortError") {
      // do nothing
      this._log("i/o promise canceled; ignoring");
    } else {
      this._log("i/o error: " + err);
      this._mediaError = new ASMediaError(
        ASMediaError.MEDIA_ERR_NETWORK,
        String(err)
      );
      this._state = State.ERROR;
      this._stopPlayback();
    }
  }

  _seek(toTime, mode) {
    this._log("requested seek to " + toTime + ", mode " + mode);

    if (this.readyState === this.HAVE_NOTHING) {
      this._log("not yet loaded; saving seek position for later");
      this._initialSeekTime = toTime;
      return;
    }

    if (this._stream && !this._stream.seekable) {
      throw new Error("Cannot seek a non-seekable stream");
    }

    if (this._codec && !this._codec.seekable) {
      throw new Error("Cannot seek in a non-seekable file");
    }

    let prepForSeek = (callback) => {
      if (this._stream && this._stream.buffering) {
        this._stream.abort();
      }
      if (this._stream && this._stream.seeking) {
        this._stream.abort();
      }
      // clear any queued input/seek-start
      this._actionQueue.splice(0, this._actionQueue.length);
      this._stopPlayback();
      this._prebufferingAudio = false;
      this._state = State.SEEKING;
      this._seekTargetTime = toTime;
      this._seekMode = mode;
      callback();
    };

    // Abort any previous seek or play suitably
    prepForSeek(() => {
      if (this._isProcessing()) {
        // already waiting on input
      } else {
        // start up the new load *after* event loop churn
        this._pingProcessing(0);
      }
    });

    this._actionQueue.push(() => {
      // Just in case another async task stopped us...
      prepForSeek(() => {
        this._doSeek(toTime);
      });
    });
  }

  _doSeek(toTime) {
    this._streamEnded = false;
    this._dataEnded = false;
    this._ended = false;
    this._state = State.SEEKING;
    this._seekTargetTime = toTime;
    this._lastSeekPosition = -1;
    this._didSeek = false;
  }

  _startBisection(targetTime) {
    // leave room for potentially long Ogg page syncing
    let endPoint = Math.max(0, this._stream.length - 65536);

    this._bisectTargetTime = targetTime;
    this._seekBisector = new Bisector({
      start: 0,
      end: endPoint,
      process: (start, end, position) => {
        if (position === this._lastSeekPosition) {
          return false;
        } else {
          this._lastSeekPosition = position;
          this._codec.flush(() => {
            this._seekStream(position);
          });
          return true;
        }
      }
    });
    this._seekBisector.start();
  }

  _setupVideo() {
    if (this._videoInfo.fps > 0) {
      this._targetPerFrameTime = 1000 / this._videoInfo.fps;
    } else {
      this._targetPerFrameTime = 16.667; // recalc this later
    }

    this._canvas.width = this._videoInfo.displayWidth;
    this._canvas.height = this._videoInfo.displayHeight;
    ASPlayer.styleManager.appendRule("." + this._instanceId, {
      width: this._videoInfo.displayWidth + "px",
      height: this._videoInfo.displayHeight + "px"
    });
    ASPlayer.updatePositionOnResize();

    let canvasOptions = {};
    if (this._options.webGL !== undefined) {
      // @fixme confirm format of webGL option
      canvasOptions.webGL = this._options.webGL;
    }
    if (!!this._options.forceWebGL) {
      canvasOptions.webGL = "required";
    }
  }

  _doProcessReady() {
    this._log("initial seek to " + this._initialSeekTime);
    if (this._initialSeekTime > 0) {
      let target = this._initialSeekTime;
      this._initialSeekTime = 0;
      this._log("initial seek to " + target);
      this._doSeek(target);
    } else if (this._paused) {
      // Paused? stop here.
      this._log("paused while in ready");
    } else {
      let finishStartPlaying = () => {
        this._log("finishStartPlaying");

        this._state = State.PLAYING;
        this._lastFrameTimestamp = window.performance.now();
        this._startPlayback();

        this._fireEventAsync("play");
        this._fireEventAsync("playing");
      };
      finishStartPlaying();
    }
  }

  _doProcessSeeking() {
    if (this._seekState === SeekState.NOT_SEEKING) {
      throw new Error("seeking in invalid state (not seeking?)");
    } else if (this._seekState === SeekState.BISECT_TO_TARGET) {
      this._doProcessBisectionSeek();
    } else if (this._seekState === SeekState.BISECT_TO_KEYPOINT) {
      this._doProcessBisectionSeek();
    } else if (this._seekState === SeekState.LINEAR_TO_TARGET) {
      this._doProcessLinearSeeking();
    } else {
      throw new Error("Invalid seek state " + this._seekState);
    }
  }

  _doProcessPlay() {
    if (this._paused) {
      // ok we're done for now!
      this._log("paused during playback; stopping loop");
    } else {
      // No audio; drive on the general clock.
      // @fixme account for dropped frame times...
      playbackPosition = this._getPlaybackTime();

      // If playing muted with no audio output device,
      // just keep up with audio in general.
      readyForAudioDecode =
        this._codec.audioReady && this._audioEndTimestamp < playbackPosition;
    }
  }

  _doProcessError() {
    // Nothing to do.
    //console.log("Reached error state. Sorry bout that.");
  }

  /**
   * Are we waiting on an async operation that will return later?
   */
  _isProcessing() {
    return (
      (this._stream && (this._stream.buffering || this._stream.seeking)) ||
      (this._codec && this._codec.processing)
    );
  }

  _startProcessingVideo(firstBuffer) {
    if (this._started || this._codec) {
      return;
    }

    this._framesProcessed = 0;
    this._bufferTime = 0;
    this._drawingTime = 0;
    this._proxyTime = 0;
    this._started = true;
    this._ended = false;

    let codecOptions = {
      // Base to the worker thread, so it can load the codec JS
      base: this._options.base,
      worker: this._enableWorker,
      threading: this._enableThreading,
      simd: this._enableSIMD
    };
    if (this._detectedType) {
      codecOptions.type = this._detectedType;
    }

    this._lastVideoCpuTime = 0;
    this._lastAudioCpuTime = 0;
    this._lastDemuxerCpuTime = 0;
    this._lastBufferTime = 0;
    this._lastDrawingTime = 0;
    this._lastProxyTime = 0;
    this._lastFrameVideoCpuTime = 0;
    this._lastFrameAudioCpuTime = 0;
    this._lastFrameDemuxerCpuTime = 0;
    this._lastFrameBufferTime = 0;
    this._lastFrameProxyTime = 0;
    this._lastFrameDrawingTime = 0;
    this._currentVideoCpuTime = 0;
    this._codec.onseek = (offset) => {
      this._didSeek = true;
      if (this._stream) {
        this._seekStream(offset);
      }
    };
  }

  _onCanPlayThrough() {
    if (this._startTime < 0) {
      this._startTime = window.performance.now();
    }

    this._timerID = setInterval(this._onPlayAVSample.bind(this), 1);
  }

  _onBuffering() {}

  _onStreamError(err) {}

  _prepForLoad(preload) {
    this._stopVideo();

    let doLoad = () => {
      // @todo networkState == NETWORK_LOADING
      this._stream = new RTSPStream({
        url: this.src,
        cacheSize: 16 * 1024 * 1024,

        // Workaround for https://github.com/stevenyiyi/anysee.js/issues/514
        // binary string used for progressive downloads can cause
        // data corruption when UTF-16 BOM markers appear at chunk
        // boundaries.
        progressive: false
      });

      // Subscribe events for stream
      this._stream.eventSource.addEventListener(
        "canplaythrough",
        this._onCanPlayThrough.bind(this)
      );
      this._stream.eventSource.addEventListener(
        "buffering",
        this._onBuffering.bind(this)
      );
      this._stream.eventSource.addEventListener(
        "streamerror",
        this._onStreamError.bind(this)
      );

      this._stream
        .load()
        .then(() => {
          this._loading = false;

          // @todo handle failure / unrecognized type

          this._currentSrc = this.src;

          // Fire off the read/decode/draw loop...
          this._byteLength = this._stream.seekable ? this._stream.length : 0;

          // If we get X-Content-Duration, that's as good as an explicit hint
          let durationHeader = this._stream.headers["x-content-duration"];
          if (typeof durationHeader === "string") {
            this._duration = parseFloat(durationHeader);
          }
          this._loadCodec((buf) => {
            this._startProcessingVideo(buf);
          });
        })
        .catch((e) => {
          this._onStreamError(e);
        });
    };

    // @todo networkState = this.NETWORK_NO_SOURCE;
    // @todo show poster
    // @todo set 'delay load event flag'

    this._currentSrc = "";
    this._loading = true;
    this._actionQueue.push(() => {
      if (preload && this.preload === "none") {
        // Done for now, we'll pick up if someone hits play() or load()
        this._loading = false;
      } else {
        doLoad();
      }
    });
    this._pingProcessing(0);
  }

  /**
   * HTMLMediaElement load method
   *
   * https://www.w3.org/TR/html5/embedded-content-0.html#concept-media-load-algorithm
   */
  load() {
    this._prepForLoad();
  }

  /**
   * HTMLMediaElement canPlayType method
   */
  canPlayType(contentType) {
    let type = new ASMediaType(contentType);
    function checkTypes(supported) {
      if (type.codecs) {
        let knownCodecs = 0,
          unknownCodecs = 0;
        type.codecs.forEach((codec) => {
          if (supported.indexOf(codec) >= 0) {
            knownCodecs++;
          } else {
            unknownCodecs++;
          }
        });
        if (knownCodecs === 0) {
          return "";
        } else if (unknownCodecs > 0) {
          return "";
        }
        // All listed codecs are ones we know. Neat!
        return "probably";
      } else {
        return "maybe";
      }
    }
    if (
      type.minor === "mp4" &&
      (type.major === "audio" || type.major === "video")
    ) {
      return checkTypes([
        "mp4a",
        "opus",
        "alaw",
        "ulaw",
        "g726",
        "g723",
        "g729",
        "avc1",
        "avc3",
        "hev1",
        "hvc1"
      ]);
    } else if (
      type.minor === "ogg" &&
      (type.major === "audio" ||
        type.major === "video" ||
        type.major === "application")
    ) {
      return checkTypes(["vorbis", "opus", "theora"]);
    } else if (
      type.minor === "webm" &&
      (type.major === "audio" || type.major === "video")
    ) {
      return checkTypes(["vorbis", "opus", "vp8", "vp9"]);
    } else {
      return "";
    }
  }

  /**
   * HTMLMediaElement play method
   * @fixme return a promise
   */
  play() {
    if (!this._muted && !this._options.audioContext) {
      ASPlayer.initSharedAudioContext();
    }

    if (this._paused) {
      this._startedPlaybackInDocument = document.body.contains(this);

      this._paused = false;

      if (this._state === State.SEEKING) {
        // Seeking? Just make sure we know to pick up after.
      } else if (this._started && this._codec && this._codec.loadedMetadata) {
        if (this._ended && this._stream && this._byteLength) {
          this._log(".play() starting over after end");
          this._seek(0);
        } else {
          this._log(".play() while already started");
        }

        this._state = State.READY;
        if (this._isProcessing()) {
          // waiting on the codec already
        } else {
          this._pingProcessing();
        }
      } else if (this._loading) {
        this._log(".play() while loading");
      } else {
        this._log(".play() before started");

        // Let playback begin when metadata loading is complete
        if (!this._stream) {
          this.load();
        }
      }
    }

    if (this._video && this._video.paused) {
      this._video.play();
    }
  }

  /**
   * custom getPlaybackStats method
   */
  getPlaybackStats() {
    return {
      targetPerFrameTime: this._targetPerFrameTime,
      framesProcessed: this._framesProcessed,
      videoBytes: this._codec ? this._codec.videoBytes : 0,
      audioBytes: this._codec ? this._codec.audioBytes : 0,
      playTime: this._playTime,
      demuxingTime: this._codec
        ? this._codec.demuxerCpuTime - this._lastDemuxerCpuTime
        : 0,
      videoDecodingTime: this._codec
        ? this._codec.videoCpuTime - this._lastVideoCpuTime
        : 0,
      audioDecodingTime: this._codec
        ? this._codec.audioCpuTime - this._lastAudioCpuTime
        : 0,
      bufferTime: this._bufferTime - this._lastBufferTime,
      drawingTime: this._drawingTime - this._lastDrawingTime,
      proxyTime: this._proxyTime - this._lastProxyTime,
      droppedAudio: this._droppedAudio,
      delayedAudio: this._delayedAudio,
      jitter: this._totalJitter / this._framesProcessed,
      lateFrames: this._lateFrames
    };
  }

  resetPlaybackStats() {
    this._framesProcessed = 0;
    this._playTime = 0;
    if (this._codec) {
      this._lastDemuxerCpuTime = this._codec.demuxerCpuTime;
      this._lastVideoCpuTime = this._codec.videoCpuTime;
      this._lastAudioCpuTime = this._codec.audioCpuTime;
      this._codec.videoBytes = 0;
      this._codec.audioBytes = 0;
    }
    this._lastBufferTime = this._bufferTime;
    this._lastDrawingTime = this._drawingTime;
    this._lastProxyTime = this._proxyTime;
    this._totalJitter = 0;
    this._totalFrameTime = 0;
    this._totalFrameCount = 0;
  }

  getVideoFrameSink() {
    return this._frameSink;
  }

  getCanvas() {
    return this._canvas;
  }

  getVideo() {
    return this._video;
  }

  /**
   * HTMLMediaElement pause method
   */
  pause() {
    if (!this._paused) {
      if (this._nextProcessingTimer) {
        clearTimeout(this._nextProcessingTimer);
        this._nextProcessingTimer = null;
      }
      this._stopPlayback();
      this._prebufferingAudio = false;
      this._paused = true;
      this._fireEvent("pause");
    }
  }

  /**
   * custom 'stop' method
   */
  stop() {
    this._stopVideo();
    this._paused = true;
  }

  fastSeek(seekToTime) {
    this._seek(+seekToTime, SeekMode.FAST);
  }
}

// Define the new element
customElements.define("ws_rtsp_player", ASPlayer);
