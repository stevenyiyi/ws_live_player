import { WebAudioBackend } from "./web-audio-backend";
import { AudioTempoChanger } from "./audio_tempo_changer";

/**
 * Audio sample buffer format passed to {@link AudioFeeder#bufferData} and its backends.
 *
 * Buffers are arrays containing one Float32Array of sample data
 * per channel. Channel counts must match the expected value, and
 * all channels within a buffer must have the same length in samples.
 *
 * Since input data may be stored for a while before being taken
 * back out, be sure that your Float32Arrays for channel data are
 * standalone, not backed on an ArrayBuffer that might change!
 *
 * @typedef {SampleBuffer} SampleBuffer
 * @todo consider replacing this with AudioBuffer-like wrapper object
 */

/**
 * Object dictionary format used to pass options into {@link AudioFeeder} and its backends.
 *
 * @typedef {Object} AudioFeederOptions
 * @property {string} base - (optional) base URL to find additional resources in
 * @property {AudioContext} audioContext - (optional) Web Audio API AudioContext
 *                          instance to use inplace of creating a default one
 */

/**
 * Object dictionary format returned from {@link AudioFeeder#getPlaybackState} and friends.
 *
 * @typedef {Object} PlaybackState
 * @property {number} playbackPosition - total seconds so far of input audio data that have played (pre tempo change)
 * @property {number} outputPlaybackPosition - total seconds so far of audio that has been played (post tempo change)
 * @property {number} samplesQueued - number of samples at target rate that are queued up for playback
 * @property {number} dropped - number of underrun events, when we had to play silence due to data starvation
 * @property {number} delayedTime - total seconds so far of silent time during playback due to data starvation
 * @todo drop 'dropped' in favor of delayedTime
 * @todo replace sampledQueued with a time unit?
 */

/**
 * Object that we can throw audio data into and have it drain out.
 * @class
 * @param {AudioFeederOptions} options - dictionary of config settings
 *
 * @classdesc
 * Object that we can throw audio data into and have it drain out.
 */
export function AudioFeeder(options) {
  this._options = options || {};
  this._backend = null; // AudioBackend instance, after init...
  this._resampleFractional = 0;
  this._resampleLastSampleData = undefined;
  this._tempoChanger = null; // Initialized at init
}

/**
 * Sample rate in Hz, as requested by the caller in {@link AudioFeeder#init}.
 *
 * If the backend's actual sample rate differs from this requested rate,
 * input data will be resampled automatically.
 *
 * @type {number}
 * @readonly
 * @see AudioFeeder#targetRate
 */
AudioFeeder.prototype.rate = 0;

/**
 * Actual output sample rate in Hz, as provided by the backend.
 * This may differ from the rate requested, in which case input data
 * will be resampled automatically.
 *
 * @type {number}
 * @readonly
 * @see AudioFeeder#rate
 */
AudioFeeder.prototype.targetRate = 0;

/**
 * Number of output channels, as requested by the caller in {@link AudioFeeder#init}.
 *
 * If the backend's actual channel count differs from this requested count,
 * input data will be resampled automatically.
 *
 * Warning: currently more than 2 channels may result in additional channels
 * being cropped out, as downmixing has not yet been implemented.
 *
 * @type {number}
 * @readonly
 */
AudioFeeder.prototype.channels = 0;

/**
 * Size of output buffers in samples, as a hint for latency/scheduling
 * @type {number}
 * @readonly
 */
AudioFeeder.prototype.bufferSize = 0;

/**
 * Duration of the minimum buffer size, in seconds.
 * If the amount of buffered data falls below this,
 * caller will receive a synchronous 'starved' event
 * with a last chance to buffer more data.
 *
 * @type {number}
 * @readonly
 */
Object.defineProperty(AudioFeeder.prototype, "bufferDuration", {
  get: function getBufferDuration() {
    if (this.targetRate) {
      return this.bufferSize / this.targetRate;
    } else {
      return 0;
    }
  }
});

/**
 * Duration of remaining data at which a 'bufferlow' event will be
 * triggered, in seconds.
 *
 * This defaults to twice bufferDuration, but can be overridden.
 *
 * @type {number}
 */
Object.defineProperty(AudioFeeder.prototype, "bufferThreshold", {
  get: function getBufferThreshold() {
    if (this._backend) {
      return this._backend.bufferThreshold / this.targetRate;
    } else {
      return 0;
    }
  },
  set: function setBufferThreshold(val) {
    if (this._backend) {
      this._backend.bufferThreshold = Math.round(val * this.targetRate);
    } else {
      throw Error(
        "Invalid state: AudioFeeder cannot set bufferThreshold before init"
      );
    }
  }
});

/**
 * Current playback position, in seconds, in input time (i.e. pre tempo change)
 * This compensates for drops and underruns, and is suitable for a/v sync.
 *
 * @type {number}
 * @readonly
 */
Object.defineProperty(AudioFeeder.prototype, "playbackPosition", {
  get: function getPlaybackPosition() {
    if (this._backend) {
      let playbackState = this.getPlaybackState();
      return playbackState.playbackPosition;
    } else {
      return 0;
    }
  }
});

/**
 * Current playback position, in seconds, in output time (i.e. post tempo change)
 * Also compensates for drops and underruns, and is suitable for a/v sync.
 *
 * @type {number}
 * @readonly
 */
Object.defineProperty(AudioFeeder.prototype, "outputPlaybackPosition", {
  get: function getOutputPlaybackPosition() {
    if (this._backend) {
      let playbackState = this.getPlaybackState();
      return playbackState.outputPlaybackPosition;
    } else {
      return 0;
    }
  }
});

/**
 * Duration of remaining queued data, in seconds.
 *
 * @type {number}
 */
Object.defineProperty(AudioFeeder.prototype, "durationBuffered", {
  get: function getDurationBuffered() {
    if (this._backend) {
      let playbackState = this.getPlaybackState();
      return playbackState.samplesQueued / this.targetRate;
    } else {
      return 0;
    }
  }
});

/**
 * Is the feeder currently set to mute output?
 * When muted, this overrides the volume property.
 *
 * @type {boolean}
 */
Object.defineProperty(AudioFeeder.prototype, "muted", {
  get: function getMuted() {
    if (this._backend) {
      return this._backend.muted;
    } else {
      throw new Error("Invalid state: cannot get mute before init");
    }
  },
  set: function setMuted(val) {
    if (this._backend) {
      this._backend.muted = val;
    } else {
      throw new Error("Invalid state: cannot set mute before init");
    }
  }
});

/**
 * @deprecated in favor of muted and volume properties
 */
AudioFeeder.prototype.mute = function () {
  this.muted = true;
};

/**
 * @deprecated in favor of muted and volume properties
 */
AudioFeeder.prototype.unmute = function () {
  this.muted = false;
};

/**
 * Volume multiplier, defaults to 1.0.
 * @name volume
 * @type {number}
 */
Object.defineProperty(AudioFeeder.prototype, "volume", {
  get: function getVolume() {
    if (this._backend) {
      return this._backend.volume;
    } else {
      throw new Error("Invalid state: cannot get volume before init");
    }
  },
  set: function setVolume(val) {
    if (this._backend) {
      this._backend.volume = val;
    } else {
      throw new Error("Invalid state: cannot set volume before init");
    }
  }
});

/**
 * Tempo multiplier, defaults to 1.0.
 * @name volume
 * @type {number}
 */
Object.defineProperty(AudioFeeder.prototype, "tempo", {
  get: function getTempo() {
    if (this._tempoChanger) {
      return this._tempoChanger.getTempo();
    } else {
      throw new Error("Invalid state: cannot get tempo before init");
    }
  },
  set: function setTempo(val) {
    if (this._tempoChanger) {
      this._tempoChanger.setTempo(val);
    } else {
      throw new Error("Invalid state: cannot set tempo before init");
    }
  }
});

/**
 * Start setting up for output with the given channel count and sample rate.
 * Audio data you provide will be resampled if necessary to whatever the
 * backend actually supports.
 *
 * @param {number} numChannels - requested number of channels (output may differ)
 * @param {number} sampleRate - requested sample rate in Hz (output may differ)
 *
 * @todo merge into constructor?
 */
AudioFeeder.prototype.init = function (numChannels, sampleRate) {
  this.channels = numChannels;
  this.rate = sampleRate;

  if (this._options.backendFactory) {
    // For a custom backend. Warning: the internal API is not stable!
    this._backend = this._options.backendFactory(
      numChannels,
      sampleRate,
      this._options
    );
  } else if (WebAudioBackend.isSupported()) {
    this._backend = new WebAudioBackend(numChannels, sampleRate, this._options);
  } else {
    throw new Error("No supported backend");
  }

  this.targetRate = this._backend.rate;
  this.bufferSize = this._backend.bufferSize;

  // Initialize tempo changer (NB! no "new")
  this._tempoChanger = AudioTempoChanger({
    sampleRate: this.targetRate,
    numChannels: numChannels,
    tempo: 1.0
  });

  // Pass through the starved event
  this._backend.onstarved = function () {
    if (this.onstarved) {
      this.onstarved();
    }
  }.bind(this);
  this._backend.onbufferlow = function () {
    if (this.onbufferlow) {
      this.onbufferlow();
    }
  }.bind(this);
};

/**
 * Resample a buffer from the input rate/channel count to the output.
 *
 * This is horribly naive and wrong.
 * Replace me with a better algo!
 *
 * @param {SampleBuffer} sampleData - input data in requested sample rate / channel count
 * @returns {SampleBuffer} output data in backend's sample rate/channel count
 */
AudioFeeder.prototype._resample = function (sampleData) {
  let rate = this.rate,
    channels = this.channels,
    targetRate = this._backend.rate,
    targetChannels = this._backend.channels;

  if (rate === targetRate && channels === targetChannels) {
    return sampleData;
  } else {
    let newSamples = [];

    // Mind that packet boundaries won't always align on
    // sample boundaries in the resamples output, so maintain
    // a running rounding fractional offset of the portion of
    // a sample we'll have to pull from the previous run on
    // the next one.
    let inputLen = sampleData[0].length,
      previousFractional = this._resampleFractional,
      outputLen = (inputLen * targetRate) / rate + previousFractional,
      outputSamples = Math.floor(outputLen),
      remainingFractional = outputLen - outputSamples;

    let interpolate;
    if (rate < targetRate) {
      // Input rate is lower than the target rate,
      // use linear interpolation to minimize "tinny" artifacts.
      interpolate = function (input, output, previous, adjustment) {
        let inputSample = function (i) {
          if (i < 0) {
            if (previous && previous.length + i > 0) {
              // Beware sometimes we have empty bits at start.
              return previous[previous.length + i];
            } else {
              // this probably shouldn't happen
              // but if it does be safe ;)
              return input[0];
            }
          } else {
            return input[i];
          }
        };

        for (let i = 0; i < output.length; i++) {
          // Map the output sample to input space,
          // offset by one to give us room to interpolate.
          let j = ((i + 1 - previousFractional) * rate) / targetRate - 1;
          let a = Math.floor(j);
          let b = Math.ceil(j);

          let out;
          if (a === b) {
            out = inputSample(a);
          } else {
            out = inputSample(a) * (b - j) + inputSample(b) * (j - a);
          }

          output[i] = adjustment * out;
        }
      };
    } else {
      // Input rate is higher than the target rate.
      // For now, discard extra samples.
      interpolate = function (input, output, previous, adjustment) {
        for (var i = 0; i < output.length; i++) {
          output[i] =
            adjustment * input[((i * input.length) / output.length) | 0];
        }
      };
    }

    let adjustment = 1;
    if (targetChannels > channels) {
      // assume mono -> stereo conversion
      // tone down the loudness rather than duplicating to both channels
      adjustment = Math.SQRT1_2;
    }

    for (let channel = 0; channel < targetChannels; channel++) {
      let inputChannel = channel;
      if (channel >= channels) {
        // If input is mono, dupe the first channel
        inputChannel = 0;
      }
      let input = sampleData[inputChannel],
        output = new Float32Array(outputSamples),
        previous = this._resampleLastSampleData
          ? this._resampleLastSampleData[inputChannel]
          : undefined;

      interpolate(input, output, previous, adjustment);

      newSamples.push(output);
    }
    this._resampleFractional = remainingFractional;
    this._resampleLastSampleData = sampleData;
    return newSamples;
  }
};

/**
 * Queue up some audio data for playback.
 *
 * @param {SampleBuffer} sampleData - input data to queue up for playback
 *
 * @todo throw if data invalid or uneven
 */
AudioFeeder.prototype.bufferData = function (sampleData) {
  if (this._backend) {
    let samples = this._resample(sampleData);

    // NB! it is important all samples go through tempoChanger
    //  it is built to switch to just copying if tempo = 1.0
    //  but it still needs the samples to transition smoothly
    //  and keep an accurate time map
    samples = this._tempoChanger.process(samples);

    this._backend.appendBuffer(samples);
  } else {
    throw new Error("Invalid state: AudioFeeder cannot bufferData before init");
  }
};

/**
 * Get an object with information about the current playback state.
 *
 * @return {PlaybackState} - info about current playback state
 */
AudioFeeder.prototype.getPlaybackState = function () {
  if (this._backend) {
    let state = this._backend.getPlaybackState();
    state.outputPlaybackPosition = state.playbackPosition; // as _backend works only in output time
    state.playbackPosition = this._tempoChanger.mapOutputToInputTime(
      state.outputPlaybackPosition
    );
    return state;
  } else {
    throw new Error(
      "Invalid state: AudioFeeder cannot getPlaybackState before init"
    );
  }
};

/**
 * Checks if audio system is ready and calls the callback when ready
 * to begin playback.
 *
 * @param {function} callback - called when ready
 */
AudioFeeder.prototype.waitUntilReady = function (callback) {
  if (this._backend) {
    this._backend.waitUntilReady(callback);
  } else {
    throw new Error(
      "Invalid state: AudioFeeder cannot waitUntilReady before init"
    );
  }
};

/**
 * Start/continue playback as soon as possible.
 *
 * You should buffer some audio ahead of time to avoid immediately
 * running into starvation.
 */
AudioFeeder.prototype.start = function () {
  if (this._backend) {
    this._backend.start();
  } else {
    throw new Error("Invalid state: AudioFeeder cannot start before init");
  }
};

/**
 * Stop/pause playback as soon as possible.
 *
 * Audio that has been buffered but not yet sent to the device will
 * remain buffered, and can be continued with another call to start().
 */
AudioFeeder.prototype.stop = function () {
  if (this._backend) {
    this._backend.stop();
  } else {
    throw new Error("Invalid state: AudioFeeder cannot stop before init");
  }
};

/**
 * Flush any queued data out of the system.
 */
AudioFeeder.prototype.flush = function () {
  this._resampleFractional = 0;
  this._resampleLastSampleData = undefined;
  if (this._backend) {
    this._tempoChanger.flush(this.durationBuffered);
    this._backend.flush();
  } else {
    throw new Error("Invalid state: AudioFeeder cannot flush before init");
  }
};

/**
 * Close out the audio channel. The AudioFeeder instance will no
 * longer be usable after closing.
 *
 * @todo close out the AudioContext if no longer needed
 * @todo make the instance respond more consistently once closed
 */
AudioFeeder.prototype.close = function () {
  if (this._backend) {
    this._backend.close();
    this._backend = null;
  }
};

/**
 * Synchronous callback when we find we're out of buffered data.
 *
 * @type {function}
 */
AudioFeeder.prototype.onstarved = null;

/**
 * Asynchronous callback when we're running low on buffered data.
 *
 * @type {function}
 */
AudioFeeder.prototype.onbufferlow = null;

/**
 * Is the AudioFeeder class supported in this browser?
 *
 * Note that it's still possible to be supported but not work, for instance
 * if there are no audio output devices but the APIs are available.
 *
 * @returns {boolean} - true if Web Audio API is available
 */
AudioFeeder.isSupported = function () {
  return !!Float32Array && WebAudioBackend.isSupported();
};

/**
 * Force initialization of the default Web Audio API context, if applicable.
 *
 * Some browsers (such as mobile Safari) disable audio output unless
 * first triggered from a UI event handler; call this method as a hint
 * that you will be starting up an AudioFeeder soon but won't have data
 * for it until a later callback.
 *
 * @returns {AudioContext|null} - initialized AudioContext instance, if applicable
 */
AudioFeeder.initSharedAudioContext = function () {
  if (WebAudioBackend.isSupported()) {
    return WebAudioBackend.initSharedAudioContext();
  } else {
    return null;
  }
};
