/**
 * Constructor for BufferQueue class.
 * @class
 * @param {number} numChannels - channel count to validate against
 * @param {number} bufferSize - desired size of pre-chunked output buffers, in samples
 *
 * @classdesc
 * Abstraction around a queue of audio buffers.
 *
 * Stuff input buffers of any length in via {@link BufferQueue#appendBuffer},
 * check how much is queued with {@link BufferQueue#sampleCount}, and pull out
 * data in fixed-size chunks from the start with {@link BufferQueue#shift}.
 */
export function BufferQueue(numChannels, bufferSize) {
  if (numChannels < 1 || numChannels !== Math.round(numChannels)) {
    throw new Error("Invalid channel count for BufferQueue");
  }
  this.channels = numChannels;
  this.bufferSize = bufferSize;
  this.flush();
}

/**
 * Flush any data out of the queue, resetting to empty state.
 */
BufferQueue.prototype.flush = function () {
  this._buffers = [];
  this._pendingBuffer = this.createBuffer(this.bufferSize);
  this._pendingPos = 0;
};

/**
 * Count how many samples are queued up
 *
 * @returns {number} - total count in samples
 */
BufferQueue.prototype.sampleCount = function () {
  let count = 0;
  this._buffers.forEach(function (buffer) {
    count += buffer[0].length;
  });
  return count;
};

/**
 * Create an empty audio sample buffer with space for the given count of samples.
 *
 * @param {number} sampleCount - number of samples to reserve in the buffer
 * @returns {SampleBuffer} - empty buffer
 */
BufferQueue.prototype.createBuffer = function (sampleCount) {
  let output = [];
  for (let i = 0; i < this.channels; i++) {
    output[i] = new Float32Array(sampleCount);
  }
  return output;
};

/**
 * Validate a buffer for correct object layout
 *
 * @param {SampleBuffer} buffer - an audio buffer to check
 * @returns {boolean} - true if input buffer is valid
 */
BufferQueue.prototype.validate = function (buffer) {
  if (buffer.length !== this.channels) {
    return false;
  }

  let sampleCount;
  for (let i = 0; i < buffer.length; i++) {
    let channelData = buffer[i];
    if (!(channelData instanceof Float32Array)) {
      return false;
    }
    if (i === 0) {
      sampleCount = channelData.length;
    } else if (channelData.length !== sampleCount) {
      return false;
    }
  }

  return true;
};

/**
 * Append a buffer of input data to the queue...
 *
 * @param {SampleBuffer} sampleData - an audio buffer to append
 * @throws exception on invalid input
 */
BufferQueue.prototype.appendBuffer = function (sampleData) {
  if (!this.validate(sampleData)) {
    throw new Error("Invalid audio buffer passed to BufferQueue.appendBuffer");
  }

  let firstChannel = sampleData[0],
    sampleCount = firstChannel.length;

  // @todo this still seems kinda inefficient
  let channels = this.channels;
  let pendingPos = this._pendingPos;
  let pendingBuffer = this._pendingBuffer;
  let bufferSize = this.bufferSize;
  for (let i = 0; i < sampleCount; i++) {
    for (let channel = 0; channel < channels; channel++) {
      pendingBuffer[channel][pendingPos] = sampleData[channel][i];
    }
    if (++pendingPos === bufferSize) {
      this._buffers.push(pendingBuffer);
      pendingPos = this._pendingPos = 0;
      pendingBuffer = this._pendingBuffer = this.createBuffer(bufferSize);
    }
  }
  this._pendingPos = pendingPos;
};

/**
 * Unshift the given sample buffer onto the beginning of the buffer queue.
 *
 * @param {SampleBuffer} sampleData - an audio buffer to prepend
 * @throws exception on invalid input
 *
 * @todo this is currently pretty inefficient as it rechunks all the buffers.
 */
BufferQueue.prototype.prependBuffer = function (sampleData) {
  if (!this.validate(sampleData)) {
    throw new Error("Invalid audio buffer passed to BufferQueue.prependBuffer");
  }

  // Since everything is pre-chunked in the queue, we're going to have
  // to pull everything out and re-append it.
  let buffers = this._buffers.slice(0);
  buffers.push(this.trimBuffer(this._pendingBuffer, 0, this._pendingPos));

  this.flush();
  this.appendBuffer(sampleData);

  // Now put back any old buffers, dividing them up into chunks.
  for (let i = 0; i < buffers.length; i++) {
    this.appendBuffer(buffers[i]);
  }
};

/**
 * Shift out a buffer from the head of the queue, containing a maximum of
 * {@link BufferQueue#bufferSize} samples; if there are not enough samples
 * you may get a shorter buffer. Call {@link BufferQueue#sampleCount} to
 * check if enough samples are available for your needs.
 *
 * @returns {SampleBuffer} - an audio buffer with zero or more samples
 */
BufferQueue.prototype.nextBuffer = function () {
  if (this._buffers.length) {
    return this._buffers.shift();
  } else {
    let trimmed = this.trimBuffer(this._pendingBuffer, 0, this._pendingPos);
    this._pendingBuffer = this.createBuffer(this.bufferSize);
    this._pendingPos = 0;
    return trimmed;
  }
};

/**
 * Trim a buffer down to a given maximum sample count.
 * Any additional samples will simply be cropped off of the view.
 * If no trimming is required, the same buffer will be returned.
 *
 * @param {SampleBuffer} sampleData - input data
 * @param {number} start - sample number to start at
 * @param {number} maxSamples - count of samples to crop to
 * @returns {SampleBuffer} - output data with at most maxSamples samples
 */
BufferQueue.prototype.trimBuffer = function (sampleData, start, maxSamples) {
  let bufferLength = sampleData[0].length,
    end = start + Math.min(maxSamples, bufferLength);
  if (start === 0 && end >= bufferLength) {
    return sampleData;
  } else {
    let output = [];
    for (let i = 0; i < this.channels; i++) {
      output[i] = sampleData[i].subarray(start, end);
    }
    return output;
  }
};
