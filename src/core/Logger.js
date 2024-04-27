import FactoryMaker from "./FactoryMaker.js";

const LOG_LEVEL_NONE = 0;
const LOG_LEVEL_FATAL = 1;
const LOG_LEVEL_ERROR = 2;
const LOG_LEVEL_WARNING = 3;
const LOG_LEVEL_INFO = 4;
const LOG_LEVEL_DEBUG = 5;

/**
 * @module Logger
 * @param {object} config
 * @ignore
 */
function Logger(config) {
  config = config || {};
  const settings = config.settings;
  const logFn = [];

  let instance, showLogTimestamp, showCalleeName, startTime;

  function setup() {
    showLogTimestamp = true;
    showCalleeName = true;
    startTime = new Date().getTime();

    if (typeof window !== "undefined" && window.console) {
      logFn[LOG_LEVEL_FATAL] = getLogFn(window.console.error);
      logFn[LOG_LEVEL_ERROR] = getLogFn(window.console.error);
      logFn[LOG_LEVEL_WARNING] = getLogFn(window.console.warn);
      logFn[LOG_LEVEL_INFO] = getLogFn(window.console.info);
      logFn[LOG_LEVEL_DEBUG] = getLogFn(window.console.debug);
    }
  }

  function getLogFn(fn) {
    if (fn && fn.bind) {
      return fn.bind(window.console);
    }
    // if not define, return the default function for reporting logs
    return window.console.log.bind(window.console);
  }

  /**
   * Retrieves a logger which can be used to write logging information in browser console.
   * @param {object} instance Object for which the logger is created. It is used
   * to include calle object information in log messages.
   * @memberof module:Debug
   * @returns {Logger}
   * @instance
   */
  function getLogger(instance) {
    return {
      fatal: fatal.bind(instance),
      error: error.bind(instance),
      warn: warn.bind(instance),
      info: info.bind(instance),
      debug: debug.bind(instance),
    };
  }

  /**
   * Prepends a timestamp in milliseconds to each log message.
   * @param {boolean} value Set to true if you want to see a timestamp in each log message.
   * @default LOG_LEVEL_WARNING
   * @memberof module:Debug
   * @instance
   */
  function setLogTimestampVisible(value) {
    showLogTimestamp = value;
  }

  /**
   * Prepends the callee object name, and media type if available, to each log message.
   * @param {boolean} value Set to true if you want to see the callee object name and media type in each log message.
   * @default true
   * @memberof module:Debug
   * @instance
   */
  function setCalleeNameVisible(value) {
    showCalleeName = value;
  }

  function fatal(...params) {
    doLog(LOG_LEVEL_FATAL, this, ...params);
  }

  function error(...params) {
    doLog(LOG_LEVEL_ERROR, this, ...params);
  }

  function warn(...params) {
    doLog(LOG_LEVEL_WARNING, this, ...params);
  }

  function info(...params) {
    doLog(LOG_LEVEL_INFO, this, ...params);
  }

  function debug(...params) {
    doLog(LOG_LEVEL_DEBUG, this, ...params);
  }

  function doLog(level, _this, ...params) {
    let message = "";
    let logTime = null;

    if (showLogTimestamp) {
      logTime = new Date().getTime();
      message += "[" + (logTime - startTime) + "]";
    }

    if (showCalleeName && _this && _this.getClassName) {
      message += "[" + _this.getClassName() + "]";
      if (_this.getType) {
        message += "[" + _this.getType() + "]";
      }
    }

    if (message.length > 0) {
      message += " ";
    }

    Array.apply(null, params).forEach(function (item) {
      message += item + " ";
    });

    // log to console if the log level is high enough
    if (logFn[level] && settings && settings.get().debug.logLevel >= level) {
      logFn[level](message);
    }
  }

  instance = {
    getLogger: getLogger,
    setLogTimestampVisible: setLogTimestampVisible,
    setCalleeNameVisible: setCalleeNameVisible,
  };

  setup();

  return instance;
}

Logger.__asjs_factory_name = 'Logger';

const factory = FactoryMaker.getSingletonFactory(Logger);
factory.LOG_LEVEL_NONE = LOG_LEVEL_NONE;
factory.LOG_LEVEL_FATAL = LOG_LEVEL_FATAL;
factory.LOG_LEVEL_ERROR = LOG_LEVEL_ERROR;
factory.LOG_LEVEL_WARNING = LOG_LEVEL_WARNING;
factory.LOG_LEVEL_INFO = LOG_LEVEL_INFO;
factory.LOG_LEVEL_DEBUG = LOG_LEVEL_DEBUG;
FactoryMaker.updateSingletonFactory(Logger.__asjs_factory_name, factory);
export default factory;
