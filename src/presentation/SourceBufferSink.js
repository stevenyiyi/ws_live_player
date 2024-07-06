import FactoryMaker from "../core/FactoryMaker";
import Logger from "../utils/logger";
import Settings from "../api/Settings";
import Events from "../core/events/Events";
import Errors from "../core/errors/Errors";
import { ASMediaError } from "../api/ASMediaError";
const APPEND_WINDOW_START_OFFSET = 0.1;
const APPEND_WINDOW_END_OFFSET = 0.01;
const CHECK_INTERVAL = 50;

function SourceBufferSink(config) {
  const context = this.context;
  const settings = Settings(context).getInstance();
  const textController = config.textController;
  const eventBus = config.eventBus;
  let instance, logger, type, buffer, mediaInfo, intervalId;
  let callbacks = [];
  let appendQueue = [];
  let isAppendingInProgress = false;
  let mediaSource = config.mediaSource;
  let lastRequestAppended = null;

  function setup() {
    logger = Logger(context).getInstance().getLogger(instance);
  }

  function _getCodecStringForRepresentation(representation) {
    return representation.mimeType + ';codecs="' + representation.codecs + '"';
  }

  function initializeForStreamSwitch(
    mInfo,
    selectedRepresentation,
    oldSourceBufferSink
  ) {
    mediaInfo = mInfo;
    type = mediaInfo.type;

    _copyPreviousSinkData(oldSourceBufferSink);
    _addEventListeners();

    const promises = [];

    promises.push(_abortBeforeAppend());
    promises.push(updateAppendWindow(mediaInfo.streamInfo));

    if (settings.get().streaming.buffer.useChangeTypeForTrackSwitch) {
      promises.push(changeType(selectedRepresentation));
    }

    if (
      selectedRepresentation &&
      selectedRepresentation.mseTimeOffset !== undefined
    ) {
      promises.push(
        updateTimestampOffset(selectedRepresentation.mseTimeOffset)
      );
    }

    return Promise.all(promises);
  }

  function changeType(representation) {
    const codec = _getCodecStringForRepresentation(representation);
    return new Promise((resolve) => {
      _waitForUpdateEnd(() => {
        if (buffer.changeType) {
          logger.debug(`Changing SourceBuffer codec to ${codec}`);
          buffer.changeType(codec);
        }
        resolve();
      });
    });
  }

  function _copyPreviousSinkData(oldSourceBufferSink) {
    buffer = oldSourceBufferSink.getBuffer();
  }

  function initializeForFirstUse(streamInfo, mInfo, selectedRepresentation) {
    mediaInfo = mInfo;
    type = mediaInfo.type;
    const codec = selectedRepresentation
      ? _getCodecStringForRepresentation(selectedRepresentation)
      : mInfo.codec;
    try {
      // Safari claims to support anything starting 'application/mp4'.
      // it definitely doesn't understand 'application/mp4;codecs="stpp"'
      // - currently no browser does, so check for it and use our own
      // implementation. The same is true for codecs="wvtt".
      if (codec.match(/application\/mp4;\s*codecs="(stpp|wvtt).*"/i)) {
        return _initializeForText(streamInfo);
      }

      buffer = mediaSource.addSourceBuffer(codec);

      _addEventListeners();

      const promises = [];

      promises.push(updateAppendWindow(mediaInfo.streamInfo));

      if (
        selectedRepresentation &&
        selectedRepresentation.mseTimeOffset !== undefined
      ) {
        promises.push(
          updateTimestampOffset(selectedRepresentation.mseTimeOffset)
        );
      }

      return Promise.all(promises);
    } catch (e) {
      // Note that in the following, the quotes are open to allow for extra text after stpp and wvtt
      if (
        (mediaInfo.type == 'text' && !mediaInfo.isFragmented) ||
        codec.indexOf('codecs="stpp') !== -1 ||
        codec.indexOf('codecs="vtt') !== -1 ||
        codec.indexOf("text/vtt") !== -1
      ) {
        return _initializeForText(streamInfo);
      }
      return Promise.reject(e);
    }
  }

  function _initializeForText(streamInfo) {
    buffer = textController.getTextSourceBuffer(streamInfo);
    return Promise.resolve();
  }

  function _addEventListeners() {
    // use updateend event if possible
    if (typeof buffer.addEventListener === "function") {
      try {
        buffer.addEventListener("updateend", _updateEndHandler, false);
        buffer.addEventListener("error", _errHandler, false);
        buffer.addEventListener("abort", _errHandler, false);
      } catch (err) {
        // use setInterval to periodically check if updating has been completed
        intervalId = setInterval(_updateEndHandler, CHECK_INTERVAL);
      }
    } else {
      // use setInterval to periodically check if updating has been completed
      intervalId = setInterval(_updateEndHandler, CHECK_INTERVAL);
    }
  }

  function getType() {
    return type;
  }

  function _removeEventListeners() {
    try {
      if (typeof buffer.removeEventListener === "function") {
        buffer.removeEventListener("updateend", _updateEndHandler, false);
        buffer.removeEventListener("error", _errHandler, false);
        buffer.removeEventListener("abort", _errHandler, false);
      }
      clearInterval(intervalId);
    } catch (e) {
      logger.error(e);
    }
  }

  function updateAppendWindow(sInfo) {
    return new Promise((resolve) => {
      if (!buffer || !settings.get().streaming.buffer.useAppendWindow) {
        resolve();
        return;
      }

      _waitForUpdateEnd(() => {
        try {
          if (!buffer) {
            resolve();
            return;
          }

          let appendWindowEnd = mediaSource.duration;
          let appendWindowStart = 0;
          if (
            sInfo &&
            !isNaN(sInfo.start) &&
            !isNaN(sInfo.duration) &&
            isFinite(sInfo.duration)
          ) {
            appendWindowEnd = sInfo.start + sInfo.duration;
          }
          if (sInfo && !isNaN(sInfo.start)) {
            appendWindowStart = sInfo.start;
          }
          if (
            buffer.appendWindowEnd !== appendWindowEnd ||
            buffer.appendWindowStart !== appendWindowStart
          ) {
            buffer.appendWindowStart = 0;
            buffer.appendWindowEnd = appendWindowEnd + APPEND_WINDOW_END_OFFSET;
            buffer.appendWindowStart = Math.max(
              appendWindowStart - APPEND_WINDOW_START_OFFSET,
              0
            );
            logger.debug(
              `Updated append window for ${mediaInfo.type}. Set start to ${buffer.appendWindowStart} and end to ${buffer.appendWindowEnd}`
            );
          }

          resolve();
        } catch (e) {
          logger.warn(`Failed to set append window`);
          resolve();
        }
      });
    });
  }

  function updateTimestampOffset(mseTimeOffset) {
    return new Promise((resolve) => {
      if (!buffer) {
        resolve();
        return;
      }

      _waitForUpdateEnd(() => {
        try {
          if (
            buffer.timestampOffset !== mseTimeOffset &&
            !isNaN(mseTimeOffset)
          ) {
            buffer.timestampOffset = mseTimeOffset;
            logger.debug(`Set MSE timestamp offset to ${mseTimeOffset}`);
          }
          resolve();
        } catch (e) {
          resolve();
        }
      });
    });
  }

  function reset() {
    if (buffer) {
      try {
        callbacks = [];
        _removeEventListeners();
        isAppendingInProgress = false;
        appendQueue = [];
        if (
          !buffer.getClassName ||
          buffer.getClassName() !== "TextSourceBuffer"
        ) {
          logger.debug(`Removing sourcebuffer from media source`);
          mediaSource.removeSourceBuffer(buffer);
        }
      } catch (e) {
        logger.error(`reset exception: ${e.message}`);
      }
      buffer = null;
    }
    lastRequestAppended = null;
  }

  function getBuffer() {
    return buffer;
  }

  function getAllBufferRanges() {
    try {
      return buffer.buffered;
    } catch (e) {
      logger.error("getAllBufferRanges exception: " + e.message);
      return null;
    }
  }

  function append(chunk, request = null) {
    return new Promise((resolve, reject) => {
      if (!chunk) {
        reject({
          chunk: chunk,
          error: new ASMediaError(
            Errors.ERR_MSE_APPEND_CODE,
            Errors.ERR_MSE_APPEND_MSG
          ),
        });
        return;
      }
      appendQueue.push({ data: chunk, promise: { resolve, reject }, request });
      _waitForUpdateEnd(_appendNextInQueue.bind(this));
    });
  }

  function _abortBeforeAppend() {
    return new Promise((resolve) => {
      _waitForUpdateEnd(() => {
        // Save the append window, which is reset on abort().
        const appendWindowStart = buffer.appendWindowStart;
        const appendWindowEnd = buffer.appendWindowEnd;

        if (buffer) {
          buffer.abort();
          buffer.appendWindowStart = appendWindowStart;
          buffer.appendWindowEnd = appendWindowEnd;
        }
        resolve();
      });
    });
  }

  function remove(range) {
    return new Promise((resolve, reject) => {
      const start = range.start;
      const end = range.end;

      // make sure that the given time range is correct. Otherwise we will get InvalidAccessError
      if (!(start >= 0 && end > start)) {
        resolve();
        return;
      }

      _waitForUpdateEnd(function () {
        try {
          buffer.remove(start, end);
          // updating is in progress, we should wait for it to complete before signaling that this operation is done
          _waitForUpdateEnd(function () {
            resolve({
              from: start,
              to: end,
              unintended: false,
            });
            if (range.resolve) {
              range.resolve();
            }
          });
        } catch (err) {
          reject({
            from: start,
            to: end,
            unintended: false,
            error: new ASMediaError(
              Errors.ERR_MSE_REMOVE_CODE,
              Errors.ERR_MSE_REMOVE_MSG
            ),
          });
          if (range.reject) {
            range.reject(err);
          }
        }
      });
    });
  }

  function _appendNextInQueue() {
    if (isAppendingInProgress) {
      return;
    }

    if (appendQueue.length > 0) {
      isAppendingInProgress = true;
      const nextChunk = appendQueue[0];
      appendQueue.splice(0, 1);

      const afterSuccess = function () {
        isAppendingInProgress = false;
        if (appendQueue.length > 0) {
          _appendNextInQueue.call(this);
        }
        // Init segments are cached. In any other case we dont need the chunk bytes anymore and can free the memory
        if (
          nextChunk &&
          nextChunk.data &&
          nextChunk.data.segmentType &&
          nextChunk.data.segmentType !== HTTPRequest.INIT_SEGMENT_TYPE
        ) {
          delete nextChunk.data.bytes;
        }
        nextChunk.promise.resolve({ chunk: nextChunk.data });
      };

      try {
        lastRequestAppended = nextChunk.request;
        if (nextChunk.data.bytes.byteLength === 0) {
          afterSuccess.call(this);
        } else {
          if (buffer.appendBuffer) {
            buffer.appendBuffer(nextChunk.data.bytes);
          } else {
            buffer.append(nextChunk.data.bytes, nextChunk.data);
          }
          // updating is in progress, we should wait for it to complete before signaling that this operation is done
          _waitForUpdateEnd(afterSuccess.bind(this));
        }
      } catch (err) {
        logger.fatal('SourceBuffer append failed "' + err + '"');
        if (appendQueue.length > 0) {
          _appendNextInQueue();
        } else {
          isAppendingInProgress = false;
        }

        delete nextChunk.data.bytes;
        nextChunk.promise.reject({
          chunk: nextChunk.data,
          error: new ASMediaError(err.code, err.message),
        });
      }
    }
  }

  function abort() {
    return new Promise((resolve) => {
      try {
        appendQueue = [];
        if (mediaSource.readyState === "open") {
          _waitForUpdateEnd(() => {
            try {
              if (buffer) {
                buffer.abort();
              }
              resolve();
            } catch (e) {
              resolve();
            }
          });
        } else if (
          buffer &&
          buffer.setTextTrack &&
          mediaSource.readyState === "ended"
        ) {
          buffer.abort(); //The cues need to be removed from the TextSourceBuffer via a call to abort()
          resolve();
        } else {
          resolve();
        }
      } catch (e) {
        resolve();
      }
    });
  }

  function _executeCallback() {
    if (callbacks.length > 0) {
      if (!buffer.updating) {
        const cb = callbacks.shift();
        cb();
        // Try to execute next callback if still not updating
        _executeCallback();
      }
    }
  }

  function _updateEndHandler() {
    // if updating is still in progress do nothing and wait for the next check again.
    if (buffer.updating) {
      return;
    }

    // updating is completed, now we can stop checking and resolve the promise
    _executeCallback();
  }

  function _errHandler(e) {
    const error = e.target || {};
    _triggerEvent(Events.SOURCE_BUFFER_ERROR, { error, lastRequestAppended });
  }

  function _triggerEvent(eventType, data) {
    let payload = data || {};
    eventBus.trigger(eventType, payload, {
      streamId: mediaInfo.streamInfo.id,
      mediaType: type,
    });
  }

  function _waitForUpdateEnd(callback) {
    callbacks.push(callback);

    if (!buffer.updating) {
      _executeCallback();
    }
  }

  instance = {
    abort,
    append,
    changeType,
    getAllBufferRanges,
    getBuffer,
    getType,
    initializeForFirstUse,
    initializeForStreamSwitch,
    remove,
    reset,
    updateAppendWindow,
    updateTimestampOffset,
  };

  setup();

  return instance;
}

SourceBufferSink.__asjs_factory_name = 'SourceBufferSink';
const factory = FactoryMaker.getClassFactory(SourceBufferSink);
export default factory;