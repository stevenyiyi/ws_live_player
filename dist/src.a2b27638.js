// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;
function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }
  return bundleURL;
}
function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);
    if (matches) {
      return getBaseURL(matches[0]);
    }
  }
  return '/';
}
function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)?\/[^/]+(?:\?.*)?$/, '$1') + '/';
}
exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');
function updateLink(link) {
  var newLink = link.cloneNode();
  newLink.onload = function () {
    link.remove();
  };
  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
  if (cssTimeout) {
    return;
  }
  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }
    cssTimeout = null;
  }, 50);
}
module.exports = reloadCSS;
},{"./bundle-url":"node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"src/styles.css":[function(require,module,exports) {
var reloadCSS = require('_css_loader');
module.hot.dispose(reloadCSS);
module.hot.accept(reloadCSS);
},{"_css_loader":"node_modules/parcel-bundler/src/builtins/css-loader.js"}],"src/utils/logger.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Logger = exports.LogLevel = exports.Log = void 0;
exports.getTagged = getTagged;
exports.setDefaultLogLevel = setDefaultLogLevel;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// ERROR=0, WARN=1, LOG=2, DEBUG=3
var LogLevel = exports.LogLevel = {
  Error: 0,
  Warn: 1,
  Log: 2,
  Debug: 3
};
var DEFAULT_LOG_LEVEL = LogLevel.Debug;
function setDefaultLogLevel(level) {
  DEFAULT_LOG_LEVEL = level;
}
var Logger = exports.Logger = /*#__PURE__*/function () {
  function Logger() {
    var level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_LOG_LEVEL;
    var tag = arguments.length > 1 ? arguments[1] : undefined;
    _classCallCheck(this, Logger);
    this.tag = tag;
    this.setLevel(level);
  }
  _createClass(Logger, [{
    key: "setLevel",
    value: function setLevel(level) {
      this.level = level;
    }
  }, {
    key: "_log",
    value: function _log(lvl, args) {
      args = Array.prototype.slice.call(args);
      if (this.tag) {
        args.unshift("[".concat(this.tag, "]"));
      }
      if (this.level >= lvl) console[Logger.level_map[lvl]].apply(console, args);
    }
  }, {
    key: "log",
    value: function log() {
      this._log(LogLevel.Log, arguments);
    }
  }, {
    key: "debug",
    value: function debug() {
      this._log(LogLevel.Debug, arguments);
    }
  }, {
    key: "error",
    value: function error() {
      this._log(LogLevel.Error, arguments);
    }
  }, {
    key: "warn",
    value: function warn() {
      this._log(LogLevel.Warn, arguments);
    }
  }], [{
    key: "level_map",
    get: function get() {
      return _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, LogLevel.Debug, 'log'), LogLevel.Log, 'log'), LogLevel.Warn, 'warn'), LogLevel.Error, 'error');
    }
  }]);
  return Logger;
}();
var taggedLoggers = new Map();
function getTagged(tag) {
  if (!taggedLoggers.has(tag)) {
    taggedLoggers.set(tag, new Logger(DEFAULT_LOG_LEVEL, tag));
  }
  return taggedLoggers.get(tag);
}
var Log = exports.Log = new Logger();
},{}],"src/api/ASMediaError.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ASMediaError = exports.ASInfoNotice = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Analogue of the MediaError class returned by
 * HTMLMediaElement.error property
 */
var ASMediaError = exports.ASMediaError = /*#__PURE__*/function () {
  function ASMediaError(code, message) {
    _classCallCheck(this, ASMediaError);
    this.code = code;
    this.message = message;
  }
  _createClass(ASMediaError, null, [{
    key: "MEDIA_ERR_SYSTEM",
    get: function get() {
      return 1;
    }
    /** Network error */
  }, {
    key: "MEDIA_ERR_NETWORK",
    get: function get() {
      return 2;
    }
    /** RTSP error, message:{code: xxx, statusLine: xxxxxx} */
  }, {
    key: "MEDIA_ERR_RTSP",
    get: function get() {
      return 3;
    }
    /** av packet assembly error */
  }, {
    key: "MEDIA_ERR_AV",
    get: function get() {
      return 4;
    }
    /** MSE error */
  }, {
    key: "MEDIA_ERR_DECODE",
    get: function get() {
      return 5;
    }
  }]);
  return ASMediaError;
}();
var ASInfoNotice = exports.ASInfoNotice = /*#__PURE__*/function () {
  function ASInfoNotice(code, message) {
    _classCallCheck(this, ASInfoNotice);
    this.code = code;
    this.message = message;
  }
  _createClass(ASInfoNotice, null, [{
    key: "AVINFO",
    get: function get() {
      return 1;
    }
  }, {
    key: "RECONNECTING",
    get: function get() {
      return 2;
    }
  }]);
  return ASInfoNotice;
}();
},{}],"src/utils/event.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TinyEvents = exports.EventSourceWrapper = exports.EventEmitter = exports.DestructibleEventListener = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// just the bits we need
var listener = Symbol("event_listener");
var listeners = Symbol("event_listeners");
var DestructibleEventListener = exports.DestructibleEventListener = /*#__PURE__*/function () {
  function DestructibleEventListener(eventListener) {
    _classCallCheck(this, DestructibleEventListener);
    this[listener] = eventListener;
    this[listeners] = new Map();
  }
  _createClass(DestructibleEventListener, [{
    key: "clear",
    value: function clear() {
      if (this[listeners]) {
        var _iterator = _createForOfIteratorHelper(this[listeners]),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;
            var _iterator2 = _createForOfIteratorHelper(entry[1]),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var fn = _step2.value;
                this[listener].removeEventListener(entry[0], fn);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      this[listeners].clear();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.clear();
      this[listeners] = null;
    }
  }, {
    key: "on",
    value: function on(event, selector, fn) {
      if (fn === undefined) {
        fn = selector;
        selector = null;
      }
      if (selector) {
        return this.addEventListener(event, function (e) {
          if (e.target.matches(selector)) {
            fn(e);
          }
        });
      } else {
        return this.addEventListener(event, fn);
      }
    }
  }, {
    key: "addEventListener",
    value: function addEventListener(event, fn) {
      if (!this[listeners].has(event)) {
        this[listeners].set(event, new Set());
      }
      this[listeners].get(event).add(fn);
      this[listener].addEventListener(event, fn, false);
      return fn;
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(event, fn) {
      this[listener].removeEventListener(event, fn, false);
      if (this[listeners].has(event)) {
        //this[listeners].set(event, new Set());
        var ev = this[listeners].get(event);
        ev.delete(fn);
        if (!ev.size) {
          this[listeners].delete(event);
        }
      }
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(event) {
      if (this[listener]) {
        this[listener].dispatchEvent(event);
      }
    }
  }]);
  return DestructibleEventListener;
}();
var EventEmitter = exports.EventEmitter = /*#__PURE__*/function () {
  function EventEmitter() {
    var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    _classCallCheck(this, EventEmitter);
    this[listener] = new DestructibleEventListener(element || document.createElement("div"));
  }
  _createClass(EventEmitter, [{
    key: "clear",
    value: function clear() {
      if (this[listener]) {
        this[listener].clear();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this[listener]) {
        this[listener].destroy();
        this[listener] = null;
      }
    }
  }, {
    key: "on",
    value: function on(event, selector, fn) {
      if (this[listener]) {
        return this[listener].on(event, selector, fn);
      }
      return null;
    }
  }, {
    key: "addEventListener",
    value: function addEventListener(event, fn) {
      if (this[listener]) {
        return this[listener].addEventListener(event, fn, false);
      }
      return null;
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(event, fn) {
      if (this[listener]) {
        this[listener].removeEventListener(event, fn, false);
      }
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(event, data) {
      if (this[listener]) {
        this[listener].dispatchEvent(new CustomEvent(event, {
          detail: data
        }));
      }
    }
  }]);
  return EventEmitter;
}();
var EventSourceWrapper = exports.EventSourceWrapper = /*#__PURE__*/function () {
  function EventSourceWrapper(eventSource) {
    _classCallCheck(this, EventSourceWrapper);
    this.eventSource = eventSource;
    this[listeners] = new Map();
  }
  _createClass(EventSourceWrapper, [{
    key: "on",
    value: function on(event, selector, fn) {
      if (!this[listeners].has(event)) {
        this[listeners].set(event, new Set());
      }
      var listener = this.eventSource.on(event, selector, fn);
      if (listener) {
        this[listeners].get(event).add(listener);
      }
    }
  }, {
    key: "off",
    value: function off(event, fn) {
      this.eventSource.removeEventListener(event, fn);
    }
  }, {
    key: "clear",
    value: function clear() {
      this.eventSource.clear();
      this[listeners].clear();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.eventSource.clear();
      this[listeners] = null;
      this.eventSource = null;
    }
  }]);
  return EventSourceWrapper;
}();
var TinyEvents = exports.TinyEvents = /*#__PURE__*/function () {
  function TinyEvents() {
    _classCallCheck(this, TinyEvents);
    this._e = {};
  }
  _createClass(TinyEvents, [{
    key: "on",
    value: function on(name, handler) {
      (this._e[name] || (this._e[name] = [])).push(handler);
    }
  }, {
    key: "off",
    value: function off(name, handler) {
      var l = this._e[name] || [];
      var i = l.indexOf(handler);
      if (handler >= 0) {
        l.splice(i, 1);
      }
    }
  }, {
    key: "emit",
    value: function emit(name, arg) {
      (this._e[name] || []).slice().forEach(function (f) {
        return f(arg);
      });
    }
  }]);
  return TinyEvents;
}();
},{}],"src/BaseStream.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _event = require("./utils/event.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var BaseStream = exports.default = /*#__PURE__*/function () {
  function BaseStream(options) {
    _classCallCheck(this, BaseStream);
    this.eventSource = new _event.EventEmitter();
    this.cacheSize = options.cacheSize || 500; // default ms
    this.flushInterval = options.flush || 100; // default ms
    this.wsurl = options.wsurl;
    this.rtspurl = options.rtspurl;
    this.video = options.video;
    this.bufferedDuration = options.bufferedDuration || 120;
    /// Properties defines
    Object.defineProperties(this, {
      duration: {
        value: NaN,
        writable: true
      },
      hasAudio: {
        get: function getHasAudio() {
          return this._getHasAudio();
        }
      },
      hasVideo: {
        get: function getHasVideo() {
          return this._getHasVideo();
        }
      },
      buffering: {
        value: false,
        writable: true
      },
      seeking: {
        value: false,
        writable: true
      },
      seekable: {
        value: false,
        writable: true
      },
      eof: {
        value: false,
        writable: true
      },
      audioInfo: {
        get: function getAudioInfo() {
          return this._getAudioInfo();
        }
      },
      videoInfo: {
        get: function getVideoInfo() {
          return this._getVideoInfo();
        }
      }
    });
  }

  /// Public methods

  /// return Promise
  _createClass(BaseStream, [{
    key: "load",
    value: function load() {
      /// Inherite class implement
      throw Error("Call load in abstract class!");
    }

    /// return Promise
  }, {
    key: "seek",
    value: function seek(offset) {
      /// Inherite class implement
      throw Error("Call seek in abstract class!");
    }

    /// stop
  }, {
    key: "stop",
    value: function stop() {
      throw Error("Call stop in abstract class!");
    }

    /// destroy
  }, {
    key: "destroy",
    value: function destroy() {
      throw Error("Call destroy in abstract class!");
    }

    /// Array of array [[s, e],...]
  }, {
    key: "getBufferedRanges",
    value: function getBufferedRanges() {
      /// Inherite class implement
      throw Error("Call etBufferedRanges in abstract class!");
    }

    /// void
  }, {
    key: "abort",
    value: function abort() {
      throw Error("Call abort in abstract class!");
    }
  }, {
    key: "startStreamFlush",
    value: function startStreamFlush() {
      var _this = this;
      this.flushTimerId = setInterval(function () {
        if (!_this.paused) {
          _this.eventSource.dispatchEvent("flush");
        }
      }, this.flushInterval);
    }
  }, {
    key: "stopStreamFlush",
    value: function stopStreamFlush() {
      clearInterval(this.flushTimerId);
    }
  }, {
    key: "_getHasAudio",
    value: function _getHasAudio() {
      throw Error("Call _getHasAudio() in abstract class!");
    }
  }, {
    key: "_getHasVideo",
    value: function _getHasVideo() {
      throw Error("Call _getHasVideo() in abstract class!");
    }
  }, {
    key: "_getAudioInfo",
    value: function _getAudioInfo() {
      throw Error("Call _getAudioInfo() in abstract class!");
    }
  }, {
    key: "_getVideoInfo",
    value: function _getVideoInfo() {
      throw Error("Call _getVideoInfo() in abstract class!");
    }
  }]);
  return BaseStream;
}();
},{"./utils/event.js":"src/utils/event.js"}],"src/StreamDefine.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StreamType = exports.PayloadType = exports.PESType = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var StreamType = exports.StreamType = /*#__PURE__*/function () {
  function StreamType() {
    _classCallCheck(this, StreamType);
  }
  _createClass(StreamType, null, [{
    key: "VIDEO",
    get: function get() {
      return 1;
    }
  }, {
    key: "AUDIO",
    get: function get() {
      return 2;
    }
  }, {
    key: "CONTAINER",
    get: function get() {
      return 3;
    }
  }, {
    key: "map",
    get: function get() {
      return _defineProperty(_defineProperty(_defineProperty({}, StreamType.VIDEO, "video"), StreamType.AUDIO, "audio"), StreamType.CONTAINER, "container");
    }
  }]);
  return StreamType;
}();
var PESType = exports.PESType = /*#__PURE__*/function () {
  function PESType() {
    _classCallCheck(this, PESType);
  }
  _createClass(PESType, null, [{
    key: "AAC",
    get: function get() {
      return 0x0f;
    } // ISO/IEC 13818-7 ADTS AAC (MPEG-2 lower bit-rate audio)
  }, {
    key: "ID3",
    get: function get() {
      return 0x15;
    } // Packetized metadata (ID3)
  }, {
    key: "PCMA",
    get: function get() {
      return 0x90;
    } // GBT 28181
  }, {
    key: "PCMU",
    get: function get() {
      return 0x91;
    } // GBT 28181
  }, {
    key: "G722",
    get: function get() {
      return 0x92;
    } // GBT 28181
  }, {
    key: "G723",
    get: function get() {
      return 0x93;
    } // GBT 28181
  }, {
    key: "G726",
    get: function get() {
      return 0x94;
    } // GBT 28181
  }, {
    key: "G729",
    get: function get() {
      return 0x99;
    } // GBT 28181
  }, {
    key: "H264",
    get: function get() {
      return 0x1b;
    } // ITU-T Rec. H.264 and ISO/IEC 14496-10 (lower bit-rate video)
  }, {
    key: "H265",
    get: function get() {
      return 0x24;
    } // ITU-T H.265 | ISO/IEC 23008-2 video stream or an HEVC temporal video sub-bitstream
  }]);
  return PESType;
}();
var PayloadType = exports.PayloadType = /*#__PURE__*/function () {
  function PayloadType() {
    _classCallCheck(this, PayloadType);
  }
  _createClass(PayloadType, null, [{
    key: "H264",
    get: function get() {
      return 1;
    }
  }, {
    key: "H265",
    get: function get() {
      return 2;
    }
  }, {
    key: "AV1",
    get: function get() {
      return 3;
    }
  }, {
    key: "VP9",
    get: function get() {
      return 4;
    }
  }, {
    key: "AAC",
    get: function get() {
      return 5;
    }
  }, {
    key: "ALAW",
    get: function get() {
      return 6;
    }
  }, {
    key: "ULAW",
    get: function get() {
      return 7;
    }
  }, {
    key: "OPUS",
    get: function get() {
      return 8;
    }
  }, {
    key: "G722",
    get: function get() {
      return 9;
    }
  }, {
    key: "G723",
    get: function get() {
      return 10;
    }
  }, {
    key: "G726",
    get: function get() {
      return 11;
    }
  }, {
    key: "G729",
    get: function get() {
      return 12;
    }
  }, {
    key: "TS",
    get: function get() {
      return 13;
    }
  }, {
    key: "PS",
    get: function get() {
      return 14;
    }
  }, {
    key: "map",
    get: function get() {
      var _ref2;
      return _ref2 = {}, _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_ref2, PayloadType.H264, "video"), PayloadType.H265, "video"), PayloadType.AV1, "video"), PayloadType.VP9, "video"), PayloadType.AAC, "audio"), PayloadType.ALAW, "audio"), PayloadType.ULAW, "audio"), PayloadType.OPUS, "audio"), PayloadType.G722, "audio"), PayloadType.G723, "audio"), _defineProperty(_defineProperty(_defineProperty(_defineProperty(_ref2, PayloadType.G726, "audio"), PayloadType.G729, "audio"), PayloadType.TS, "container"), PayloadType.PS, "container");
    }
  }, {
    key: "string_map",
    get: function get() {
      return {
        H264: PayloadType.H264,
        H265: PayloadType.H265,
        AV1: PayloadType.AV1,
        VP9: PayloadType.VP9,
        AAC: PayloadType.AAC,
        "MP4A-LATM": PayloadType.AAC,
        "MPEG4-GENERIC": PayloadType.AAC,
        PCMA: PayloadType.ALAW,
        PCMU: PayloadType.ULAW,
        opus: PayloadType.OPUS,
        G722: PayloadType.G722,
        G723: PayloadType.G723,
        G726: PayloadType.G726,
        G729: PayloadType.G729,
        M2TS: PayloadType.TS,
        MP2T: PayloadType.TS,
        PS: PayloadType.PS
      };
    }
  }, {
    key: "stringCodec",
    value: function stringCodec(codecid) {
      var scodecs = ["unknown", "h264", "h265", "av1", "vp9", "aac", "alaw", "ulaw", "opus", "g722", "g723", "g726", "g729", "ts", "ps"];
      return scodecs[codecid];
    }
  }]);
  return PayloadType;
}();
},{}],"src/iso-bmff/mp4-generator.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MP4 = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Generate MP4 Box
 * got from: https://github.com/dailymotion/hls.js
 */
var MP4 = exports.MP4 = /*#__PURE__*/function () {
  function MP4() {
    _classCallCheck(this, MP4);
  }
  _createClass(MP4, null, [{
    key: "init",
    value: function init() {
      var hasavc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var hashvc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      MP4.types = {
        avc1: [],
        // codingname
        avcC: [],
        btrt: [],
        dinf: [],
        dref: [],
        esds: [],
        ftyp: [],
        hdlr: [],
        hvc1: [],
        hvcC: [],
        mdat: [],
        mdhd: [],
        mdia: [],
        mfhd: [],
        minf: [],
        moof: [],
        moov: [],
        mp4a: [],
        mvex: [],
        mvhd: [],
        sdtp: [],
        stbl: [],
        stco: [],
        stsc: [],
        stsd: [],
        stsz: [],
        stts: [],
        tfdt: [],
        tfhd: [],
        traf: [],
        trak: [],
        trun: [],
        trex: [],
        tkhd: [],
        vmhd: [],
        smhd: []
      };
      var i;
      for (i in MP4.types) {
        if (MP4.types.hasOwnProperty(i)) {
          MP4.types[i] = [i.charCodeAt(0), i.charCodeAt(1), i.charCodeAt(2), i.charCodeAt(3)];
        }
      }
      var videoHdlr = new Uint8Array([0x00,
      // version 0
      0x00, 0x00, 0x00,
      // flags
      0x00, 0x00, 0x00, 0x00,
      // pre_defined
      0x76, 0x69, 0x64, 0x65,
      // handler_type: 'vide'
      0x00, 0x00, 0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00, 0x00,
      // reserved
      0x56, 0x69, 0x64, 0x65, 0x6f, 0x48, 0x61, 0x6e, 0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'VideoHandler'
      ]);

      var audioHdlr = new Uint8Array([0x00,
      // version 0
      0x00, 0x00, 0x00,
      // flags
      0x00, 0x00, 0x00, 0x00,
      // pre_defined
      0x73, 0x6f, 0x75, 0x6e,
      // handler_type: 'soun'
      0x00, 0x00, 0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00, 0x00,
      // reserved
      0x53, 0x6f, 0x75, 0x6e, 0x64, 0x48, 0x61, 0x6e, 0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'SoundHandler'
      ]);

      MP4.HDLR_TYPES = {
        video: videoHdlr,
        audio: audioHdlr
      };
      var dref = new Uint8Array([0x00,
      // version 0
      0x00, 0x00, 0x00,
      // flags
      0x00, 0x00, 0x00, 0x01,
      // entry_count
      0x00, 0x00, 0x00, 0x0c,
      // entry_size
      0x75, 0x72, 0x6c, 0x20,
      // 'url' type
      0x00,
      // version 0
      0x00, 0x00, 0x01 // entry_flags
      ]);

      var stco = new Uint8Array([0x00,
      // version
      0x00, 0x00, 0x00,
      // flags
      0x00, 0x00, 0x00, 0x00 // entry_count
      ]);

      MP4.STTS = MP4.STSC = MP4.STCO = stco;
      MP4.STSZ = new Uint8Array([0x00,
      // version
      0x00, 0x00, 0x00,
      // flags
      0x00, 0x00, 0x00, 0x00,
      // sample_size
      0x00, 0x00, 0x00, 0x00 // sample_count
      ]);

      MP4.VMHD = new Uint8Array([0x00,
      // version
      0x00, 0x00, 0x01,
      // flags
      0x00, 0x00,
      // graphicsmode
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00 // opcolor
      ]);

      MP4.SMHD = new Uint8Array([0x00,
      // version
      0x00, 0x00, 0x00,
      // flags
      0x00, 0x00,
      // balance
      0x00, 0x00 // reserved
      ]);

      MP4.STSD = new Uint8Array([0x00,
      // version 0
      0x00, 0x00, 0x00,
      // flags
      0x00, 0x00, 0x00, 0x01]); // entry_count

      var majorBrand = new Uint8Array([105, 115, 111, 54]); // iso6
      var iso4Brand = new Uint8Array([105, 115, 111, 52]); // iso4
      var iso5Brand = new Uint8Array([105, 115, 111, 53]); // iso5
      var avc1Brand = new Uint8Array([97, 118, 99, 49]); // avc1
      var hvc1Brand = new Uint8Array([104, 118, 99, 49]); // hvc1
      var minorVersion = new Uint8Array([0, 0, 0, 1]);
      var dashBrand = new Uint8Array([100, 97, 115, 104]); // dash
      if (hasavc) MP4.FTYP = MP4.box(MP4.types.ftyp, majorBrand, minorVersion, iso4Brand, avc1Brand, majorBrand, iso5Brand, dashBrand);else MP4.FTYP = MP4.box(MP4.types.ftyp, majorBrand, minorVersion, iso4Brand, hvc1Brand, majorBrand, iso5Brand, dashBrand);
      MP4.DINF = MP4.box(MP4.types.dinf, MP4.box(MP4.types.dref, dref));
    }
  }, {
    key: "box",
    value: function box(type) {
      for (var _len = arguments.length, payload = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        payload[_key - 1] = arguments[_key];
      }
      var size = 8,
        i = payload.length,
        len = i,
        result;
      // calculate the total size we need to allocate
      while (i--) {
        size += payload[i].byteLength;
      }
      result = new Uint8Array(size);
      result[0] = size >> 24 & 0xff;
      result[1] = size >> 16 & 0xff;
      result[2] = size >> 8 & 0xff;
      result[3] = size & 0xff;
      result.set(type, 4);
      // copy the payload into the result
      for (i = 0, size = 8; i < len; ++i) {
        // copy payload[i] array @ offset size
        result.set(payload[i], size);
        size += payload[i].byteLength;
      }
      return result;
    }
  }, {
    key: "hdlr",
    value: function hdlr(type) {
      return MP4.box(MP4.types.hdlr, MP4.HDLR_TYPES[type]);
    }
  }, {
    key: "mdat",
    value: function mdat(data) {
      return MP4.box(MP4.types.mdat, data);
    }
  }, {
    key: "mdhd",
    value: function mdhd(timescale, duration) {
      return MP4.box(MP4.types.mdhd, new Uint8Array([0x00,
      // version 0
      0x00, 0x00, 0x00,
      // flags
      0x00, 0x00, 0x00, 0x02,
      // creation_time
      0x00, 0x00, 0x00, 0x03,
      // modification_time
      timescale >> 24 & 0xff, timescale >> 16 & 0xff, timescale >> 8 & 0xff, timescale & 0xff,
      // timescale
      duration >> 24, duration >> 16 & 0xff, duration >> 8 & 0xff, duration & 0xff,
      // duration
      0x55, 0xc4,
      // 'und' language (undetermined)
      0x00, 0x00]));
    }
  }, {
    key: "mdia",
    value: function mdia(track) {
      return MP4.box(MP4.types.mdia, MP4.mdhd(track.timescale, track.duration), MP4.hdlr(track.type), MP4.minf(track));
    }
  }, {
    key: "mfhd",
    value: function mfhd(sequenceNumber) {
      return MP4.box(MP4.types.mfhd, new Uint8Array([0x00, 0x00, 0x00, 0x00,
      // flags
      sequenceNumber >> 24, sequenceNumber >> 16 & 0xff, sequenceNumber >> 8 & 0xff, sequenceNumber & 0xff // sequence_number
      ]));
    }
  }, {
    key: "minf",
    value: function minf(track) {
      if (track.type === "audio") {
        return MP4.box(MP4.types.minf, MP4.box(MP4.types.smhd, MP4.SMHD), MP4.DINF, MP4.stbl(track));
      } else {
        return MP4.box(MP4.types.minf, MP4.box(MP4.types.vmhd, MP4.VMHD), MP4.DINF, MP4.stbl(track));
      }
    }
  }, {
    key: "moof",
    value: function moof(sn, baseMediaDecodeTime, track) {
      return MP4.box(MP4.types.moof, MP4.mfhd(sn), MP4.traf(track, baseMediaDecodeTime));
    }
    /**
     * @param tracks... (optional) {array} the tracks associated with this movie
     */
  }, {
    key: "moov",
    value: function moov(tracks, duration, timescale) {
      var i = tracks.length,
        boxes = [];
      while (i--) {
        boxes[i] = MP4.trak(tracks[i]);
      }
      return MP4.box.apply(null, [MP4.types.moov, MP4.mvhd(timescale, duration)].concat(boxes).concat(MP4.mvex(tracks)));
    }
  }, {
    key: "mvex",
    value: function mvex(tracks) {
      var i = tracks.length,
        boxes = [];
      while (i--) {
        boxes[i] = MP4.trex(tracks[i]);
      }
      return MP4.box.apply(null, [MP4.types.mvex].concat(boxes));
    }
  }, {
    key: "mvhd",
    value: function mvhd(timescale, duration) {
      var bytes = new Uint8Array([0x00,
      // version 0
      0x00, 0x00, 0x00,
      // flags
      0x00, 0x00, 0x00, 0x01,
      // creation_time
      0x00, 0x00, 0x00, 0x02,
      // modification_time
      timescale >> 24 & 0xff, timescale >> 16 & 0xff, timescale >> 8 & 0xff, timescale & 0xff,
      // timescale
      duration >> 24 & 0xff, duration >> 16 & 0xff, duration >> 8 & 0xff, duration & 0xff,
      // duration
      0x00, 0x01, 0x00, 0x00,
      // 1.0 rate
      0x01, 0x00,
      // 1.0 volume
      0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00, 0x00,
      // reserved
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00,
      // transformation: unity matrix
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // pre_defined
      0xff, 0xff, 0xff, 0xff // next_track_ID
      ]);

      return MP4.box(MP4.types.mvhd, bytes);
    }
  }, {
    key: "sdtp",
    value: function sdtp(track) {
      var samples = track.samples || [],
        bytes = new Uint8Array(4 + samples.length),
        flags,
        i;
      // leave the full box header (4 bytes) all zero
      // write the sample table
      for (i = 0; i < samples.length; i++) {
        flags = samples[i].flags;
        bytes[i + 4] = flags.dependsOn << 4 | flags.isDependedOn << 2 | flags.hasRedundancy;
      }
      return MP4.box(MP4.types.sdtp, bytes);
    }
  }, {
    key: "stbl",
    value: function stbl(track) {
      return MP4.box(MP4.types.stbl, MP4.stsd(track), MP4.box(MP4.types.stts, MP4.STTS), MP4.box(MP4.types.stsc, MP4.STSC), MP4.box(MP4.types.stsz, MP4.STSZ), MP4.box(MP4.types.stco, MP4.STCO));
    }
  }, {
    key: "avc1",
    value: function avc1(track) {
      var sps = [],
        pps = [],
        i,
        data,
        len;
      // assemble the SPSs

      for (i = 0; i < track.sps.length; i++) {
        data = track.sps[i];
        len = data.byteLength;
        sps.push(len >>> 8 & 0xff);
        sps.push(len & 0xff);
        sps = sps.concat(Array.prototype.slice.call(data)); // SPS
      }

      // assemble the PPSs
      for (i = 0; i < track.pps.length; i++) {
        data = track.pps[i];
        len = data.byteLength;
        pps.push(len >>> 8 & 0xff);
        pps.push(len & 0xff);
        pps = pps.concat(Array.prototype.slice.call(data));
      }
      var avcc = MP4.box(MP4.types.avcC, new Uint8Array([0x01,
        // version
        sps[3],
        // profile
        sps[4],
        // profile compat
        sps[5],
        // level
        0xfc | 3,
        // lengthSizeMinusOne, hard-coded to 4 bytes
        0xe0 | track.sps.length // 3bit reserved (111) + numOfSequenceParameterSets
        ].concat(sps).concat([track.pps.length // numOfPictureParameterSets
        ]).concat(pps))),
        // "PPS"
        width = track.width,
        height = track.height;
      //console.log('avcc:' + Hex.hexDump(avcc));
      return MP4.box(MP4.types.avc1, new Uint8Array([0x00, 0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00,
      // reserved
      0x00, 0x01,
      // data_reference_index
      0x00, 0x00,
      // pre_defined
      0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // pre_defined
      width >> 8 & 0xff, width & 0xff,
      // width
      height >> 8 & 0xff, height & 0xff,
      // height
      0x00, 0x48, 0x00, 0x00,
      // horizresolution
      0x00, 0x48, 0x00, 0x00,
      // vertresolution
      0x00, 0x00, 0x00, 0x00,
      // reserved
      0x00, 0x01,
      // frame_count
      0x12, 0x62, 0x69, 0x6e, 0x65,
      //binelpro.ru
      0x6c, 0x70, 0x72, 0x6f, 0x2e, 0x72, 0x75, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // compressorname
      0x00, 0x18,
      // depth = 24
      0x11, 0x11]),
      // pre_defined = -1
      avcc, MP4.box(MP4.types.btrt, new Uint8Array([0x00, 0x1c, 0x9c, 0x80,
      // bufferSizeDB
      0x00, 0x2d, 0xc6, 0xc0,
      // maxBitrate
      0x00, 0x2d, 0xc6, 0xc0])) // avgBitrate
      );
    }
  }, {
    key: "esds",
    value: function esds(track) {
      var configlen = track.config.byteLength;
      var data = new Uint8Array(26 + configlen + 3);
      data.set([0x00,
      // version 0
      0x00, 0x00, 0x00,
      // flags

      0x03,
      // descriptor_type
      0x17 + configlen,
      // length
      0x00, 0x01,
      //es_id
      0x00,
      // stream_priority

      0x04,
      // descriptor_type
      0x0f + configlen,
      // length
      0x40,
      //codec : mpeg4_audio
      0x15,
      // stream_type
      0x00, 0x00, 0x00,
      // buffer_size
      0x00, 0x00, 0x00, 0x00,
      // maxBitrate
      0x00, 0x00, 0x00, 0x00,
      // avgBitrate

      0x05,
      // descriptor_type
      configlen]);
      data.set(track.config, 26);
      data.set([0x06, 0x01, 0x02], 26 + configlen);
      // return new Uint8Array([
      //     0x00, // version 0
      //     0x00, 0x00, 0x00, // flags
      //
      //     0x03, // descriptor_type
      //     0x17+configlen, // length
      //     0x00, 0x01, //es_id
      //     0x00, // stream_priority
      //
      //     0x04, // descriptor_type
      //     0x0f+configlen, // length
      //     0x40, //codec : mpeg4_audio
      //     0x15, // stream_type
      //     0x00, 0x00, 0x00, // buffer_size
      //     0x00, 0x00, 0x00, 0x00, // maxBitrate
      //     0x00, 0x00, 0x00, 0x00, // avgBitrate
      //
      //     0x05 // descriptor_type
      // ].concat([configlen]).concat(track.config).concat([0x06, 0x01, 0x02])); // GASpecificConfig)); // length + audio config descriptor
      return data;
    }
  }, {
    key: "hvc1",
    value: function hvc1(track) {
      var vps = [],
        sps = [],
        pps = [],
        i,
        data,
        len;

      // assemble the VPSs/SPSs/PPSs
      var numNalus = track.vps.length;
      // nalu type of vps
      vps.push(32 | 0x80);
      vps.push(numNalus >>> 8 & 0xff);
      vps.push(numNalus & 0xff);
      for (i = 0; i < numNalus; i++) {
        data = track.vps[i];
        len = data.byteLength;
        vps.push(len >>> 8 & 0xff);
        vps.push(len & 0xff);
        vps = vps.concat(Array.prototype.slice.call(data)); // VPS
      }

      numNalus = track.sps.length;
      // nalu type of sps
      sps.push(33 | 0x80);
      sps.push(numNalus >>> 8 & 0xff);
      sps.push(numNalus & 0xff);
      for (i = 0; i < numNalus; i++) {
        data = track.sps[i];
        len = data.byteLength;
        sps.push(len >>> 8 & 0xff);
        sps.push(len & 0xff);
        sps = sps.concat(Array.prototype.slice.call(data)); // VPS
      }

      numNalus = track.pps.length;
      // nalu type of sps
      pps.push(34 | 0x80);
      pps.push(numNalus >>> 8 & 0xff);
      pps.push(numNalus & 0xff);
      for (i = 0; i < numNalus; i++) {
        data = track.pps[i];
        len = data.byteLength;
        pps.push(len >>> 8 & 0xff);
        pps.push(len & 0xff);
        pps = pps.concat(Array.prototype.slice.call(data)); // VPS
      }

      var hvcc = MP4.box(MP4.types.hvcC, new Uint8Array([0x01,
      // version
      track.vpsconfig.GeneralProfileSpace << 6 | track.vpsconfig.GeneralTierFlag << 5 | track.vpsconfig.GeneralProfileIdc, track.vpsconfig.CompatibilityFlags >> 24 & 0xff, track.vpsconfig.CompatibilityFlags >> 16 & 0xff, track.vpsconfig.CompatibilityFlags >> 8 & 0xff, track.vpsconfig.CompatibilityFlags & 0xff, track.vpsconfig.ConstraintIdcFlags >> 40 & 0xff, track.vpsconfig.ConstraintIdcFlags >> 32 & 0xff, track.vpsconfig.ConstraintIdcFlags >> 24 & 0xff, track.vpsconfig.ConstraintIdcFlags >> 16 & 0xff, track.vpsconfig.ConstraintIdcFlags >> 8 & 0xff, track.vpsconfig.ConstraintIdcFlags & 0xff, track.vpsconfig.GeneralLevelIdc, 0xf0, 0x0, 0xfc, 0xfc | track.vpsconfig.ChromaFormatIdc, 0xf8 | track.vpsconfig.BitDepthLumaMinus8, 0xf8 | track.vpsconfig.BitDepthChromaMinus8, 0x0, 0x0, 0x3, 0x3].concat(vps).concat(sps).concat(pps)));
      var width = track.width;
      var height = track.height;
      //console.log('avcc:' + Hex.hexDump(avcc));
      return MP4.box(MP4.types.hvc1, new Uint8Array([0x00, 0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00,
      // reserved
      0x00, 0x01,
      // data_reference_index
      0x00, 0x00,
      // pre_defined
      0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // pre_defined
      width >> 8 & 0xff, width & 0xff,
      // width
      height >> 8 & 0xff, height & 0xff,
      // height
      0x00, 0x48, 0x00, 0x00,
      // horizresolution
      0x00, 0x48, 0x00, 0x00,
      // vertresolution
      0x00, 0x00, 0x00, 0x00,
      // reserved
      0x00, 0x01,
      // frame_count
      0x12, 0x62, 0x69, 0x6e, 0x65,
      //binelpro.ru
      0x6c, 0x70, 0x72, 0x6f, 0x2e, 0x72, 0x75, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // compressorname
      0x00, 0x18,
      // depth = 24
      0x11, 0x11]),
      // pre_defined = -1
      hvcc, MP4.box(MP4.types.btrt, new Uint8Array([0x00, 0x1c, 0x9c, 0x80,
      // bufferSizeDB
      0x00, 0x2d, 0xc6, 0xc0,
      // maxBitrate
      0x00, 0x2d, 0xc6, 0xc0])) // avgBitrate
      );
    }
  }, {
    key: "mp4a",
    value: function mp4a(track) {
      var audiosamplerate = track.audiosamplerate;
      return MP4.box(MP4.types.mp4a, new Uint8Array([0x00, 0x00, 0x00,
      // reserved
      0x00, 0x00, 0x00,
      // reserved
      0x00, 0x01,
      // data_reference_index
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // reserved
      0x00, track.channelCount,
      // channelcount
      0x00, 0x10,
      // sampleSize:16bits
      0x00, 0x00,
      // pre_defined
      0x00, 0x00,
      // reserved2
      audiosamplerate >> 8 & 0xff, audiosamplerate & 0xff,
      //
      0x00, 0x00]), MP4.box(MP4.types.esds, MP4.esds(track)));
    }
  }, {
    key: "stsd",
    value: function stsd(track) {
      if (track.type === "audio") {
        return MP4.box(MP4.types.stsd, MP4.STSD, MP4.mp4a(track));
      } else {
        if (track.vps) {
          return MP4.box(MP4.types.stsd, MP4.STSD, MP4.hvc1(track));
        } else {
          return MP4.box(MP4.types.stsd, MP4.STSD, MP4.avc1(track));
        }
      }
    }
  }, {
    key: "tkhd",
    value: function tkhd(track) {
      var id = track.id,
        duration = track.duration,
        width = track.width,
        height = track.height,
        volume = track.volume;
      return MP4.box(MP4.types.tkhd, new Uint8Array([0x00,
      // version 0
      0x00, 0x00, 0x07,
      // flags
      0x00, 0x00, 0x00, 0x00,
      // creation_time
      0x00, 0x00, 0x00, 0x00,
      // modification_time
      id >> 24 & 0xff, id >> 16 & 0xff, id >> 8 & 0xff, id & 0xff,
      // track_ID
      0x00, 0x00, 0x00, 0x00,
      // reserved
      duration >> 24, duration >> 16 & 0xff, duration >> 8 & 0xff, duration & 0xff,
      // duration
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // reserved
      0x00, 0x00,
      // layer
      0x00, 0x00,
      // alternate_group
      volume >> 0 & 0xff, volume % 1 * 10 >> 0 & 0xff,
      // track volume // FIXME
      0x00, 0x00,
      // reserved
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00,
      // transformation: unity matrix
      width >> 8 & 0xff, width & 0xff, 0x00, 0x00,
      // width
      height >> 8 & 0xff, height & 0xff, 0x00, 0x00 // height
      ]));
    }
  }, {
    key: "traf",
    value: function traf(track, baseMediaDecodeTime) {
      var sampleDependencyTable = MP4.sdtp(track),
        id = track.id;
      return MP4.box(MP4.types.traf, MP4.box(MP4.types.tfhd, new Uint8Array([0x00,
      // version 0
      0x00, 0x00, 0x00,
      // flags
      id >> 24, id >> 16 & 0xff, id >> 8 & 0xff, id & 0xff // track_ID
      ])), MP4.box(MP4.types.tfdt, new Uint8Array([0x00,
      // version 0
      0x00, 0x00, 0x00,
      // flags
      baseMediaDecodeTime >> 24, baseMediaDecodeTime >> 16 & 0xff, baseMediaDecodeTime >> 8 & 0xff, baseMediaDecodeTime & 0xff // baseMediaDecodeTime
      ])), MP4.trun(track, sampleDependencyTable.length +
      //sdtp
      16 +
      // tfhd
      16 +
      // tfdt
      8 +
      // traf header
      16 +
      // mfhd
      8 +
      // moof header
      8),
      // mdat header
      sampleDependencyTable);
    }

    /**
     * Generate a track box.
     * @param track {object} a track definition
     * @return {Uint8Array} the track box
     */
  }, {
    key: "trak",
    value: function trak(track) {
      track.duration = track.duration || 0xffffffff;
      return MP4.box(MP4.types.trak, MP4.tkhd(track), MP4.mdia(track));
    }
  }, {
    key: "trex",
    value: function trex(track) {
      var id = track.id;
      return MP4.box(MP4.types.trex, new Uint8Array([0x00,
      // version 0
      0x00, 0x00, 0x00,
      // flags
      id >> 24, id >> 16 & 0xff, id >> 8 & 0xff, id & 0xff,
      // track_ID
      0x00, 0x00, 0x00, 0x01,
      // default_sample_description_index
      0x00, 0x00, 0x00, 0x00,
      // default_sample_duration
      0x00, 0x00, 0x00, 0x00,
      // default_sample_size
      0x00, 0x01, 0x00, 0x01 // default_sample_flags
      ]));
    }
  }, {
    key: "trun",
    value: function trun(track, offset) {
      var samples = track.samples || [],
        len = samples.length,
        arraylen = 12 + 16 * len,
        array = new Uint8Array(arraylen),
        i,
        sample,
        duration,
        size,
        flags,
        cts;
      offset += 8 + arraylen;
      array.set([0x00,
      // version 0
      0x00, 0x0f, 0x01,
      // flags
      len >>> 24 & 0xff, len >>> 16 & 0xff, len >>> 8 & 0xff, len & 0xff,
      // sample_count
      offset >>> 24 & 0xff, offset >>> 16 & 0xff, offset >>> 8 & 0xff, offset & 0xff // data_offset
      ], 0);
      for (i = 0; i < len; i++) {
        sample = samples[i];
        duration = sample.duration;
        size = sample.size;
        flags = sample.flags;
        cts = sample.cts;
        array.set([duration >>> 24 & 0xff, duration >>> 16 & 0xff, duration >>> 8 & 0xff, duration & 0xff,
        // sample_duration
        size >>> 24 & 0xff, size >>> 16 & 0xff, size >>> 8 & 0xff, size & 0xff,
        // sample_size
        flags.isLeading << 2 | flags.dependsOn, flags.isDependedOn << 6 | flags.hasRedundancy << 4 | flags.paddingValue << 1 | flags.isNonSync, flags.degradPrio & 0xf0 << 8, flags.degradPrio & 0x0f,
        // sample_flags
        cts >>> 24 & 0xff, cts >>> 16 & 0xff, cts >>> 8 & 0xff, cts & 0xff // sample_composition_time_offset
        ], 12 + 16 * i);
      }
      return MP4.box(MP4.types.trun, array);
    }
  }, {
    key: "initSegment",
    value: function initSegment(hasavc, tracks, duration, timescale) {
      if (!MP4.types) {
        MP4.init(hasavc);
      }
      var movie = MP4.moov(tracks, duration, timescale),
        result;
      result = new Uint8Array(MP4.FTYP.byteLength + movie.byteLength);
      result.set(MP4.FTYP);
      result.set(movie, MP4.FTYP.byteLength);
      return result;
    }
  }]);
  return MP4;
}();
},{}],"src/presentation/mse.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MSEBuffer = exports.MSE = void 0;
var _event = require("../utils/event.js");
var _logger = require("../utils/logger.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var LOG_TAG = "mse";
var Log = (0, _logger.getTagged)(LOG_TAG);
var MSEBuffer = exports.MSEBuffer = /*#__PURE__*/function () {
  function MSEBuffer(parent, codec) {
    var _this = this;
    _classCallCheck(this, MSEBuffer);
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
    Log.debug("Use codec: ".concat(codec));
    this.sourceBuffer = this.mediaSource.addSourceBuffer(codec);
    this.eventSource = new _event.EventEmitter(this.sourceBuffer);
    this.eventSource.addEventListener("updatestart", function (e) {
      // this.updating = true;
      // Log.debug('update start');
      if (_this.cleaning) {
        Log.debug("".concat(_this.codec, " cleaning start"));
      }
    });
    this.eventSource.addEventListener("update", function (e) {
      // this.updating = true;
      if (_this.cleaning) {
        Log.debug("".concat(_this.codec, " cleaning update"));
      }
    });
    this.eventSource.addEventListener("updateend", function (e) {
      // Log.debug('update end');
      // this.updating = false;
      if (_this.cleaning) {
        Log.debug("".concat(_this.codec, " cleaning end"));
        try {
          if (_this.sourceBuffer.buffered.length && _this.players[0].currentTime < _this.sourceBuffer.buffered.start(0)) {
            _this.players[0].currentTime = _this.sourceBuffer.buffered.start(0);
          }
        } catch (e) {
          // TODO: do something?
        }
        while (_this.cleanResolvers.length) {
          var resolver = _this.cleanResolvers.shift();
          resolver();
        }
        _this.cleaning = false;
        if (_this.cleanRanges.length) {
          _this.doCleanup();
          return;
        }
      }
      if (_this.sourceBuffer.updating) return;
      _this.parent.setDurationInfinity();
      // cleanup buffer after 100 updates
      _this.updatesToCleanup++;
      if (_this.updatesToCleanup > 100) {
        _this.cleanupBuffer();
        _this.updatesToCleanup = 0;
      }
      _this.feedNext();
    });
    this.eventSource.addEventListener("error", function (e) {
      Log.debug("Source buffer error: ".concat(_this.mediaSource.readyState));
      if (_this.mediaSource.sourceBuffers.length) {
        _this.mediaSource.removeSourceBuffer(_this.sourceBuffer);
      }
      _this.parent.eventSource.dispatchEvent("error", e);
    });
    this.eventSource.addEventListener("abort", function (e) {
      Log.debug("Source buffer aborted: ".concat(_this.mediaSource.readyState));
      if (_this.mediaSource.sourceBuffers.length) {
        _this.mediaSource.removeSourceBuffer(_this.sourceBuffer);
      }
      _this.parent.eventSource.dispatchEvent("error", e);
    });
    if (!this.sourceBuffer.updating) {
      this.feedNext();
    }
    // TODO: cleanup every hour for live streams
  }
  _createClass(MSEBuffer, [{
    key: "cleanupBuffer",
    value: function cleanupBuffer() {
      if (this.sourceBuffer.buffered.length && !this.sourceBuffer.updating) {
        var currentPlayTime = this.players[0].currentTime;
        var startBuffered = this.sourceBuffer.buffered.start(0);
        var endBuffered = this.sourceBuffer.buffered.end(0);
        var bufferedDuration = endBuffered - startBuffered;
        var removeEnd = endBuffered - this.parent.bufferDuration;
        if (removeEnd > 0 && bufferedDuration > this.parent.bufferDuration && currentPlayTime > startBuffered && currentPlayTime > removeEnd) {
          try {
            /// Log.debug("Remove media segments", startBuffered, removeEnd);
            this.sourceBuffer.remove(startBuffered, removeEnd);
          } catch (e) {
            Log.warn("Failed to cleanup buffer");
            this.parent.eventSource.dispatchEvent("error", e);
          }
        }
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.eventSource.destroy();
      this.clear();
      this.queue = [];
      this.mediaSource.removeSourceBuffer(this.sourceBuffer);
    }
  }, {
    key: "clear",
    value: function clear() {
      var _this2 = this;
      this.queue = [];
      var promises = [];
      var _loop = function _loop(i) {
        // TODO: await remove
        _this2.cleaning = true;
        promises.push(new Promise(function (resolve, reject) {
          _this2.cleanResolvers.push(resolve);
          if (!_this2.sourceBuffer.updating) {
            _this2.sourceBuffer.remove(_this2.sourceBuffer.buffered.start(i), _this2.sourceBuffer.buffered.end(i));
            resolve();
          } else {
            _this2.sourceBuffer.onupdateend = function () {
              if (_this2.sourceBuffer) {
                _this2.sourceBuffer.remove(_this2.sourceBuffer.buffered.start(i), _this2.sourceBuffer.buffered.end(i));
              }
              resolve();
            };
          }
        }));
      };
      for (var i = 0; i < this.sourceBuffer.buffered.length; ++i) {
        _loop(i);
      }
      return Promise.all(promises);
    }
  }, {
    key: "setLive",
    value: function setLive(is_live) {
      this.is_live = is_live;
    }
  }, {
    key: "feedNext",
    value: function feedNext() {
      // Log.debug("feed next ", this.sourceBuffer.updating);
      if (!this.sourceBuffer.updating && !this.cleaning && this.queue.length) {
        this.doAppend(this.queue.shift());
      }
    }
  }, {
    key: "doCleanup",
    value: function doCleanup() {
      if (!this.cleanRanges.length) {
        this.cleaning = false;
        this.feedNext();
        return;
      }
      var range = this.cleanRanges.shift();
      Log.debug("".concat(this.codec, " remove range [").concat(range[0], " - ").concat(range[1], "). \n                  \nUpdating: ").concat(this.sourceBuffer.updating, "\n                  "));
      this.cleaning = true;
      this.sourceBuffer.remove(range[0], range[1]);
    }
  }, {
    key: "initCleanup",
    value: function initCleanup() {
      if (this.sourceBuffer.buffered.length && !this.sourceBuffer.updating && !this.cleaning) {
        Log.debug("".concat(this.codec, " cleanup"));
        var removeBound = this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1) - 2;
        for (var i = 0; i < this.sourceBuffer.buffered.length; ++i) {
          var removeStart = this.sourceBuffer.buffered.start(i);
          var removeEnd = this.sourceBuffer.buffered.end(i);
          if (this.players[0].currentTime <= removeStart || removeBound <= removeStart) continue;
          if (removeBound <= removeEnd && removeBound >= removeStart) {
            Log.debug("Clear [".concat(removeStart, ", ").concat(removeBound, "], leave [").concat(removeBound, ", ").concat(removeEnd, "]"));
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
  }, {
    key: "doAppend",
    value: function doAppend(data) {
      var err = this.players[0].error;
      if (err) {
        Log.error("Error occured: ".concat(MSE.ErrorNotes[err.code]));
        try {
          this.players.forEach(function (video) {
            video.stop();
          });
          this.mediaSource.endOfStream();
        } catch (e) {}
        this.parent.eventSource.dispatchEvent("error");
      } else {
        try {
          this.sourceBuffer.appendBuffer(data);
          if (this.firstMoveToBufferStart && this.sourceBuffer.buffered.length) {
            this.players[0].currentTime = this.sourceBuffer.buffered.start(0);
            if (this.players[0].autoPlay) {
              this.players[0].start();
            }
            this.firstMoveToBufferStart = false;
          }
        } catch (e) {
          if (e.name === "QuotaExceededError") {
            Log.debug("".concat(this.codec, " quota fail"));
            this.queue.unshift(data);
            this.initCleanup();
            return;
          }

          // reconnect on fail
          Log.error("Error occured while appending buffer. ".concat(e.name, ": ").concat(e.message));
          this.parent.eventSource.dispatchEvent("error");
        }
      }
    }
  }, {
    key: "feed",
    value: function feed(data) {
      this.queue = this.queue.concat(data);
      // Log.debug(this.sourceBuffer.updating, this.updating, this.queue.length);
      if (this.sourceBuffer && !this.sourceBuffer.updating && !this.cleaning) {
        // Log.debug('enq feed');
        this.feedNext();
      }
    }
  }]);
  return MSEBuffer;
}();
var MSE = exports.MSE = /*#__PURE__*/function () {
  function MSE(players) {
    _classCallCheck(this, MSE);
    this.players = players;
    var playing = this.players.map(function (video, idx) {
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
    this.eventSource = new _event.EventEmitter(this.mediaSource);
    this.reset();
  }
  _createClass(MSE, [{
    key: "setDurationInfinity",
    value: function setDurationInfinity() {
      if (!this.is_live) return;
      for (var idx in this.buffers) {
        if (this.buffers[idx].sourceBuffer.updating) return;
      }
      //hack to get safari on mac to start playing, video.currentTime gets stuck on 0
      if (this.mediaSource.duration !== Number.POSITIVE_INFINITY && this.players[0].currentTime === 0 && this.mediaSource.duration > 0) {
        this.players[0].currentTime = this.mediaSource.duration - 1;
        this.mediaSource.duration = Number.POSITIVE_INFINITY;
      }
    }
  }, {
    key: "bufferDuration",
    get: function get() {
      return this.bufferDuration_;
    },
    set: function set(buffDuration) {
      this.bufferDuration_ = buffDuration;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.reset();
      this.eventSource.destroy();
      this.mediaSource = null;
      this.eventSource = null;
    }
  }, {
    key: "play",
    value: function play() {
      var _this3 = this;
      this.players.forEach(function (video, idx) {
        if (video.paused && !_this3.playing[idx]) {
          Log.debug("player ".concat(idx, ": play"));
          video.play();
        }
      });
    }
  }, {
    key: "setLive",
    value: function setLive(is_live) {
      for (var idx in this.buffers) {
        this.buffers[idx].setLive(is_live);
      }
      this.is_live = is_live;
    }
  }, {
    key: "resetBuffers",
    value: function resetBuffers() {
      var _this4 = this;
      this.players.forEach(function (video, idx) {
        if (!video.paused && _this4.playing[idx]) {
          video.pause();
          video.currentTime = 0;
        }
      });
      var promises = [];
      var _iterator = _createForOfIteratorHelper(this.buffers.values()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var buffer = _step.value;
          promises.push(buffer.clear());
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return Promise.all(promises).then(function () {
        _this4.mediaSource.endOfStream();
        _this4.mediaSource.duration = 0;
        _this4.mediaSource.clearLiveSeekableRange();
        _this4.play();
      });
    }
  }, {
    key: "clear",
    value: function clear() {
      var _this5 = this;
      this.reset();
      this.players.forEach(function (video) {
        video.src = URL.createObjectURL(_this5.mediaSource);
      });
      return this.setupEvents();
    }
  }, {
    key: "setupEvents",
    value: function setupEvents() {
      var _this6 = this;
      this.eventSource.clear();
      this.resolved = false;
      this.mediaReady = new Promise(function (resolve, reject) {
        _this6._sourceOpen = function () {
          Log.debug("Media source opened: ".concat(_this6.mediaSource.readyState));
          if (!_this6.resolved) {
            _this6.resolved = true;
            resolve();
          }
        };
        _this6._sourceEnded = function () {
          Log.debug("Media source ended: ".concat(_this6.mediaSource.readyState));
        };
        _this6._sourceClose = function () {
          Log.debug("Media source closed: ".concat(_this6.mediaSource.readyState));
          if (_this6.resolved) {
            _this6.eventSource.dispatchEvent("sourceclosed");
          }
        };
        _this6.eventSource.addEventListener("sourceopen", _this6._sourceOpen);
        _this6.eventSource.addEventListener("sourceended", _this6._sourceEnded);
        _this6.eventSource.addEventListener("sourceclose", _this6._sourceClose);
      });
      return this.mediaReady;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.ready = false;
      for (var track in this.buffers) {
        this.buffers[track].destroy();
        delete this.buffers[track];
      }
      if (this.mediaSource.readyState == "open") {
        this.mediaSource.duration = 0;
        this.mediaSource.endOfStream();
      }
      this.updating = false;
      this.resolved = false;
      this.buffers = {};
      // this.players.forEach((video)=>{video.src = URL.createObjectURL(this.mediaSource)});
      // TODO: remove event listeners for existing media source
      // this.setupEvents();
      // this.clear();
    }
  }, {
    key: "setCodec",
    value: function setCodec(track, mimeCodec) {
      var _this7 = this;
      return this.mediaReady.then(function () {
        _this7.buffers[track] = new MSEBuffer(_this7, mimeCodec);
        _this7.buffers[track].setLive(_this7.is_live);
      });
    }
  }, {
    key: "feed",
    value: function feed(track, data) {
      if (this.buffers[track]) {
        this.buffers[track].feed(data);
      }
    }
  }], [{
    key: "ErrorNotes",
    get:
    // static CODEC_AVC_BASELINE = "avc1.42E01E";
    // static CODEC_AVC_MAIN = "avc1.4D401E";
    // static CODEC_AVC_HIGH = "avc1.64001E";
    // static CODEC_VP8 = "vp8";
    // static CODEC_AAC = "mp4a.40.2";
    // static CODEC_VORBIS = "vorbis";
    // static CODEC_THEORA = "theora";

    function get() {
      return _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, MediaError.MEDIA_ERR_ABORTED, "fetching process aborted by user"), MediaError.MEDIA_ERR_NETWORK, "error occurred when downloading"), MediaError.MEDIA_ERR_DECODE, "error occurred when decoding"), MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED, "audio/video not supported");
    }
  }, {
    key: "isSupported",
    value: function isSupported(codecs) {
      return window.MediaSource && window.MediaSource.isTypeSupported("video/mp4; codecs=\"".concat(codecs.join(","), "\""));
    }
  }]);
  return MSE;
}();
},{"../utils/event.js":"src/utils/event.js","../utils/logger.js":"src/utils/logger.js"}],"src/remuxer/base-remuxer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseRemuxer = void 0;
var _logger = require("../utils/logger.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Log = (0, _logger.getTagged)("remuxer:base");
var track_id = 1;
var BaseRemuxer = exports.BaseRemuxer = /*#__PURE__*/function () {
  function BaseRemuxer(timescale, scaleFactor, params) {
    _classCallCheck(this, BaseRemuxer);
    this.timeOffset = 0;
    this.timescale = timescale;
    this.scaleFactor = scaleFactor;
    this.readyToDecode = false;
    this.samples = [];
    this.seq = 1;
    this.tsAlign = 1;
    this.pendingUnit = null;
  }
  _createClass(BaseRemuxer, [{
    key: "scaled",
    value: function scaled(timestamp) {
      return timestamp / this.scaleFactor;
    }
  }, {
    key: "unscaled",
    value: function unscaled(timestamp) {
      return timestamp * this.scaleFactor;
    }
  }, {
    key: "remux",
    value: function remux(unit) {
      if (unit) {
        var len = 0;
        if (!this.pendingUnit) {
          this.pendingUnit = unit;
        } else {
          var dur = unit.dts - this.pendingUnit.dts;
          this.samples.push({
            unit: this.pendingUnit,
            pts: this.pendingUnit.pts,
            dts: this.pendingUnit.dts,
            duration: dur,
            cts: this.pendingUnit.pts - this.pendingUnit.dts
          });
          len = this.pendingUnit.getSize();
          this.pendingUnit = unit;
        }
        return len;
      }
      return 0;
    }
  }, {
    key: "setConfig",
    value: function setConfig(config) {}
  }, {
    key: "insertDscontinuity",
    value: function insertDscontinuity() {
      this.pendingUnit = null;
      Log.debug("insertDscontinuity");
    }
  }, {
    key: "init",
    value: function init(initPTS, initDTS) {
      var shouldInitialize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      this.initPTS = Math.min(initPTS, this.samples[0].dts);
      this.initDTS = Math.min(initDTS, this.samples[0].dts);
      Log.debug("Initial pts=".concat(this.initPTS, " dts=").concat(this.initDTS, " offset=").concat(this.unscaled(this.timeOffset)));
      this.initialized = shouldInitialize;
    }
  }, {
    key: "cacheSize",
    value: function cacheSize() {
      var duration = 0;
      var _iterator = _createForOfIteratorHelper(this.samples),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var sample = _step.value;
          duration += sample.duration;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (duration > 0) {
        /** Convert to ms */
        duration = duration * 1000 / BaseRemuxer.MP4_TIMESCALE;
      }
      return duration;
    }
  }, {
    key: "flush",
    value: function flush() {
      this.seq++;
      this.mp4track.len = 0;
      this.mp4track.samples = [];
    }
  }, {
    key: "getPayloadBase",
    value: function getPayloadBase(sampleFunction, setupSample) {
      if (!this.readyToDecode || !this.initialized || !this.samples.length) return null;
      this.samples.sort(BaseRemuxer.dtsSortFunc);
      return true;
    }
  }], [{
    key: "MP4_TIMESCALE",
    get: function get() {
      return 90000;
    }

    // TODO: move to ts parser
    // static PTSNormalize(value, reference) {
    //
    //     let offset;
    //     if (reference === undefined) {
    //         return value;
    //     }
    //     if (reference < value) {
    //         // - 2^33
    //         offset = -8589934592;
    //     } else {
    //         // + 2^33
    //         offset = 8589934592;
    //     }
    //     /* PTS is 33bit (from 0 to 2^33 -1)
    //      if diff between value and reference is bigger than half of the amplitude (2^32) then it means that
    //      PTS looping occured. fill the gap */
    //     while (Math.abs(value - reference) > 4294967296) {
    //         value += offset;
    //     }
    //     return value;
    // }
  }, {
    key: "getTrackID",
    value: function getTrackID() {
      return track_id++;
    }
  }, {
    key: "toMS",
    value: function toMS(timestamp) {
      return timestamp / 90;
    }
  }, {
    key: "dtsSortFunc",
    value: function dtsSortFunc(a, b) {
      return a.dts - b.dts;
    }
  }, {
    key: "groupByDts",
    value: function groupByDts(gop) {
      var groupBy = function groupBy(xs, key) {
        return xs.reduce(function (rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };
      return groupBy(gop, "dts");
    }
  }]);
  return BaseRemuxer;
}();
},{"../utils/logger.js":"src/utils/logger.js"}],"src/remuxer/aac.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AACRemuxer = void 0;
var _logger = require("../utils/logger.js");
var _mse = require("../presentation/mse.js");
var _baseRemuxer = require("./base-remuxer.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var Log = (0, _logger.getTagged)("remuxer:aac");
// TODO: asm.js
var AACRemuxer = exports.AACRemuxer = /*#__PURE__*/function (_BaseRemuxer) {
  _inherits(AACRemuxer, _BaseRemuxer);
  var _super = _createSuper(AACRemuxer);
  function AACRemuxer(timescale) {
    var _this;
    var scaleFactor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _classCallCheck(this, AACRemuxer);
    _this = _super.call(this, timescale, scaleFactor);
    _this.codecstring = _mse.MSE.CODEC_AAC;
    _this.units = [];
    _this.initDTS = undefined;
    _this.nextDts = undefined;
    _this.lastPts = 0;
    _this.firstDTS = 0;
    _this.firstPTS = 0;
    _this.duration = params.duration || 1;
    _this.initialized = false;
    _this.mp4track = {
      id: _baseRemuxer.BaseRemuxer.getTrackID(),
      type: "audio",
      fragmented: true,
      channelCount: 0,
      audiosamplerate: _this.timescale,
      duration: 0,
      timescale: _this.timescale,
      volume: 1,
      samples: [],
      config: "",
      len: 0
    };
    if (params.config) {
      _this.setConfig(params.config);
    }
    return _this;
  }
  _createClass(AACRemuxer, [{
    key: "setConfig",
    value: function setConfig(config) {
      this.mp4track.channelCount = config.channels;
      this.mp4track.audiosamplerate = config.samplerate;
      if (!this.mp4track.duration) {
        this.mp4track.duration = (this.duration ? this.duration : 1) * config.samplerate;
      }
      this.mp4track.timescale = config.samplerate;
      this.mp4track.config = config.config;
      this.mp4track.codec = config.codec;
      this.timescale = config.samplerate;
      this.scaleFactor = _baseRemuxer.BaseRemuxer.MP4_TIMESCALE / config.samplerate;
      this.expectedSampleDuration = 1024 * this.scaleFactor;
      this.readyToDecode = true;
    }
  }, {
    key: "remux",
    value: function remux(aac) {
      this.mp4track.len += _get(_getPrototypeOf(AACRemuxer.prototype), "remux", this).call(this, aac);
    }
  }, {
    key: "getPayload",
    value: function getPayload() {
      if (!this.readyToDecode || !this.samples.length) return null;
      var payload = new Uint8Array(this.mp4track.len);
      var offset = 0;
      var samples = this.mp4track.samples;
      var mp4Sample, lastDTS, pts, dts;
      while (this.samples.length) {
        var sample = this.samples.shift();
        var unit = sample.unit;
        pts = sample.pts - this.initDTS;
        dts = sample.dts - this.initDTS;
        mp4Sample = {
          size: unit.getSize(),
          cts: 0,
          duration: 1024,
          flags: {
            isLeading: 0,
            isDependedOn: 0,
            hasRedundancy: 0,
            degradPrio: 0,
            dependsOn: 1
          }
        };
        payload.set(unit.getData(), offset);
        offset += unit.getSize();
        samples.push(mp4Sample);
        if (lastDTS === undefined) {
          this.firstDTS = dts;
          ///Log.debug(`AAC first dts:${this.firstDTS}`);
        }

        lastDTS = dts;
      }
      if (!samples.length) return null;
      return payload;
    }
  }]);
  return AACRemuxer;
}(_baseRemuxer.BaseRemuxer);
},{"../utils/logger.js":"src/utils/logger.js","../presentation/mse.js":"src/presentation/mse.js","./base-remuxer.js":"src/remuxer/base-remuxer.js"}],"src/parsers/exp-golomb.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpGolomb = void 0;
var _logger = require("../utils/logger.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /**
 * Parser for exponential Golomb codes, a variable-bitwidth number encoding scheme used by h264/hevc.
 */ // TODO: asm.js
var ExpGolomb = exports.ExpGolomb = /*#__PURE__*/function () {
  function ExpGolomb(data) {
    _classCallCheck(this, ExpGolomb);
    this.data = data;
    // the number of bytes left to examine in this.data
    this.bytesAvailable = this.data.byteLength;
    // the current word being examined
    this.word = 0; // :uint
    // the number of bits left to examine in the current word
    this.bitsAvailable = 0; // :uint
  }
  _createClass(ExpGolomb, [{
    key: "numBitsLeft",
    value: function numBitsLeft() {
      return this.bytesAvailable * 8 + this.bitsAvailable;
    }
    // ():void
  }, {
    key: "loadWord",
    value: function loadWord() {
      var position = this.data.byteLength - this.bytesAvailable,
        workingBytes = new Uint8Array(4),
        availableBytes = Math.min(4, this.bytesAvailable);
      if (availableBytes === 0) {
        throw new Error("no bytes available");
      }
      workingBytes.set(this.data.subarray(position, position + availableBytes));
      this.word = new DataView(workingBytes.buffer, workingBytes.byteOffset, workingBytes.byteLength).getUint32(0);
      // track the amount of this.data that has been processed
      this.bitsAvailable = availableBytes * 8;
      this.bytesAvailable -= availableBytes;
    }

    // (count:int):void
  }, {
    key: "skipBits",
    value: function skipBits(count) {
      var skipBytes; // :int
      if (this.bitsAvailable > count) {
        this.word <<= count;
        this.bitsAvailable -= count;
      } else {
        count -= this.bitsAvailable;
        skipBytes = count >> 3;
        count -= skipBytes << 3;
        this.bytesAvailable -= skipBytes;
        this.loadWord();
        this.word <<= count;
        this.bitsAvailable -= count;
      }
    }

    // (size:int):uint
  }, {
    key: "readBits",
    value: function readBits(size) {
      var bits = Math.min(this.bitsAvailable, size),
        // :uint
        valu = this.word >>> 32 - bits; // :uint
      if (size > 32) {
        _logger.Log.error("Cannot read more than 32 bits at a time");
      }
      this.bitsAvailable -= bits;
      if (this.bitsAvailable > 0) {
        this.word <<= bits;
      } else if (this.bytesAvailable > 0) {
        this.loadWord();
      }
      bits = size - bits;
      if (bits > 0) {
        return valu << bits | this.readBits(bits);
      } else {
        return valu;
      }
    }

    // ():uint
  }, {
    key: "skipLZ",
    value: function skipLZ() {
      var leadingZeroCount; // :uint
      for (leadingZeroCount = 0; leadingZeroCount < this.bitsAvailable; ++leadingZeroCount) {
        if (0 !== (this.word & 0x80000000 >>> leadingZeroCount)) {
          // the first bit of working word is 1
          this.word <<= leadingZeroCount;
          this.bitsAvailable -= leadingZeroCount;
          return leadingZeroCount;
        }
      }
      // we exhausted word and still have not found a 1
      this.loadWord();
      return leadingZeroCount + this.skipLZ();
    }

    // ():void
  }, {
    key: "skipUEG",
    value: function skipUEG() {
      this.skipBits(1 + this.skipLZ());
    }

    // ():void
  }, {
    key: "skipEG",
    value: function skipEG() {
      this.skipBits(1 + this.skipLZ());
    }

    // ():uint
  }, {
    key: "readUEG",
    value: function readUEG() {
      var clz = this.skipLZ(); // :uint
      return this.readBits(clz + 1) - 1;
    }

    // ():int
  }, {
    key: "readEG",
    value: function readEG() {
      var valu = this.readUEG(); // :int
      if (0x01 & valu) {
        // the number is odd if the low order bit is set
        return 1 + valu >>> 1; // add 1 to make it even, and divide by 2
      } else {
        return -1 * (valu >>> 1); // divide by two then make it negative
      }
    }

    // Some convenience functions
    // :Boolean
  }, {
    key: "readBoolean",
    value: function readBoolean() {
      return 1 === this.readBits(1);
    }

    // ():int
  }, {
    key: "readUByte",
    value: function readUByte() {
      return this.readBits(8);
    }

    // ():int
  }, {
    key: "readUShort",
    value: function readUShort() {
      return this.readBits(16);
    }
    // ():int
  }, {
    key: "readUInt",
    value: function readUInt() {
      return this.readBits(32);
    }
  }], [{
    key: "removeH264or5EmulationBytes",
    value: function removeH264or5EmulationBytes(nal) {
      var len = nal.byteLength;
      var i = 0,
        toSize = 0;
      var onal = new Uint8Array(len);
      while (i < len) {
        if (i + 2 < len && nal[i] === 0 && nal[i + 1] === 0 && nal[i + 2] === 3) {
          onal[toSize] = onal[toSize + 1] = 0;
          toSize += 2;
          i += 3;
        } else {
          onal[toSize] = nal[i];
          toSize += 1;
          i += 1;
        }
      }
      return onal.subarray(0, toSize);
    }
  }]);
  return ExpGolomb;
}();
},{"../utils/logger.js":"src/utils/logger.js"}],"src/utils/binary.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BitArray = void 0;
exports.appendByteArray = appendByteArray;
exports.appendByteArrayAsync = appendByteArrayAsync;
exports.base64ToArrayBuffer = base64ToArrayBuffer;
exports.bitSlice = bitSlice;
exports.concatenate = concatenate;
exports.hexToByteArray = hexToByteArray;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// TODO: asm.js

function appendByteArray(buffer1, buffer2) {
  var tmp = new Uint8Array((buffer1.byteLength | 0) + (buffer2.byteLength | 0));
  tmp.set(buffer1, 0);
  tmp.set(buffer2, buffer1.byteLength | 0);
  return tmp;
}
function appendByteArrayAsync(buffer1, buffer2) {
  return new Promise(function (resolve, reject) {
    var blob = new Blob([buffer1, buffer2]);
    var reader = new FileReader();
    reader.addEventListener("loadend", function () {
      resolve();
    });
    reader.readAsArrayBuffer(blob);
  });
}
function base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
function hexToByteArray(hex) {
  var len = hex.length >> 1;
  var bufView = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bufView[i] = parseInt(hex.substr(i << 1, 2), 16);
  }
  return bufView;
}
function concatenate(resultConstructor) {
  var totalLength = 0;
  for (var _len = arguments.length, arrays = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    arrays[_key - 1] = arguments[_key];
  }
  for (var _i = 0, _arrays = arrays; _i < _arrays.length; _i++) {
    var arr = _arrays[_i];
    totalLength += arr.length;
  }
  var result = new resultConstructor(totalLength);
  var offset = 0;
  for (var _i2 = 0, _arrays2 = arrays; _i2 < _arrays2.length; _i2++) {
    var _arr = _arrays2[_i2];
    result.set(_arr, offset);
    offset += _arr.length;
  }
  return result;
}
function bitSlice(bytearray) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : bytearray.byteLength * 8;
  var byteLen = Math.ceil((end - start) / 8);
  var res = new Uint8Array(byteLen);
  var startByte = start >>> 3; // /8
  var endByte = (end >>> 3) - 1; // /8
  var bitOffset = start & 0x7; // %8
  var nBitOffset = 8 - bitOffset;
  var endOffset = 8 - end & 0x7; // %8
  for (var i = 0; i < byteLen; ++i) {
    var tail = 0;
    if (i < endByte) {
      tail = bytearray[startByte + i + 1] >> nBitOffset;
      if (i === endByte - 1 && endOffset < 8) {
        tail >>= endOffset;
        tail <<= endOffset;
      }
    }
    res[i] = bytearray[startByte + i] << bitOffset | tail;
  }
  return res;
}
var BitArray = exports.BitArray = /*#__PURE__*/function () {
  function BitArray(src) {
    _classCallCheck(this, BitArray);
    this.src = new DataView(src.buffer, src.byteOffset, src.byteLength);
    this.bitpos = 0;
    this.byte = this.src.getUint8(0); /* This should really be undefined, uint wont allow it though */
    this.bytepos = 0;
  }
  _createClass(BitArray, [{
    key: "readBits",
    value: function readBits(length) {
      if (32 < (length | 0) || 0 === (length | 0)) {
        /* To big for an uint */
        throw new Error("too big");
      }
      var result = 0;
      for (var i = length; i > 0; --i) {
        /* Shift result one left to make room for another bit,
               then add the next bit on the stream. */
        result = (result | 0) << 1 | (this.byte | 0) >> 8 - ++this.bitpos & 0x01;
        if ((this.bitpos | 0) >= 8) {
          this.byte = this.src.getUint8(++this.bytepos);
          this.bitpos &= 0x7;
        }
      }
      return result;
    }
  }, {
    key: "skipBits",
    value: function skipBits(length) {
      this.bitpos += (length | 0) & 0x7; // %8
      this.bytepos += (length | 0) >>> 3; // *8
      if (this.bitpos > 7) {
        this.bitpos &= 0x7;
        ++this.bytepos;
      }
      if (!this.finished()) {
        this.byte = this.src.getUint8(this.bytepos);
        return 0;
      } else {
        return this.bytepos - this.src.byteLength - this.src.bitpos;
      }
    }
  }, {
    key: "finished",
    value: function finished() {
      return this.bytepos >= this.src.byteLength;
    }
  }]);
  return BitArray;
}();
},{}],"src/parsers/nalu.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NALU = void 0;
var _binary = require("../utils/binary.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var NALU = exports.NALU = /*#__PURE__*/function () {
  function NALU(ntype, nri, data, dts, pts) {
    _classCallCheck(this, NALU);
    this.data = data;
    this.ntype = ntype;
    this.nri = nri;
    this.dts = dts;
    this.pts = pts;
    this.sliceType = null;
  }
  _createClass(NALU, [{
    key: "appendData",
    value: function appendData(idata) {
      this.data = (0, _binary.appendByteArray)(this.data, idata);
    }
  }, {
    key: "toString",
    value: function toString() {
      return "".concat(NALU.type(this), "(").concat(this.data.byteLength, "): NRI: ").concat(this.getNri(), ", PTS: ").concat(this.pts, ", DTS: ").concat(this.dts);
    }
  }, {
    key: "getNri",
    value: function getNri() {
      return this.nri >>> 5;
    }
  }, {
    key: "type",
    value: function type() {
      return this.ntype;
    }
  }, {
    key: "isKeyframe",
    value: function isKeyframe() {
      return this.ntype === NALU.IDR || this.sliceType === 7;
    }
  }, {
    key: "getSize",
    value: function getSize() {
      return 4 + 1 + this.data.byteLength;
    }
  }, {
    key: "getData",
    value: function getData() {
      var header = new Uint8Array(5 + this.data.byteLength);
      var view = new DataView(header.buffer);
      view.setUint32(0, this.data.byteLength + 1);
      view.setUint8(4, 0x0 & 0x80 | this.nri & 0x60 | this.ntype & 0x1f);
      header.set(this.data, 5);
      return header;
    }
  }], [{
    key: "NDR",
    get: function get() {
      return 1;
    }
  }, {
    key: "SLICE_PART_A",
    get: function get() {
      return 2;
    }
  }, {
    key: "SLICE_PART_B",
    get: function get() {
      return 3;
    }
  }, {
    key: "SLICE_PART_C",
    get: function get() {
      return 4;
    }
  }, {
    key: "IDR",
    get: function get() {
      return 5;
    }
  }, {
    key: "SEI",
    get: function get() {
      return 6;
    }
  }, {
    key: "SPS",
    get: function get() {
      return 7;
    }
  }, {
    key: "PPS",
    get: function get() {
      return 8;
    }
  }, {
    key: "DELIMITER",
    get: function get() {
      return 9;
    }
  }, {
    key: "EOSEQ",
    get: function get() {
      return 10;
    }
  }, {
    key: "EOSTR",
    get: function get() {
      return 11;
    }
  }, {
    key: "FILTER",
    get: function get() {
      return 12;
    }
  }, {
    key: "STAP_A",
    get: function get() {
      return 24;
    }
  }, {
    key: "STAP_B",
    get: function get() {
      return 25;
    }
  }, {
    key: "FU_A",
    get: function get() {
      return 28;
    }
  }, {
    key: "FU_B",
    get: function get() {
      return 29;
    }
  }, {
    key: "TYPES",
    get: function get() {
      return _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, NALU.IDR, "IDR"), NALU.SEI, "SEI"), NALU.SPS, "SPS"), NALU.PPS, "PPS"), NALU.NDR, "NDR");
    }
  }, {
    key: "type",
    value: function type(nalu) {
      if (nalu.ntype in NALU.TYPES) {
        return NALU.TYPES[nalu.ntype];
      } else {
        return "UNKNOWN";
      }
    }
  }]);
  return NALU;
}();
},{"../utils/binary.js":"src/utils/binary.js"}],"src/parsers/h264.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.H264Parser = void 0;
var _expGolomb = require("./exp-golomb.js");
var _nalu = require("./nalu.js");
var _ASMediaError = require("../api/ASMediaError.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var H264Parser = exports.H264Parser = /*#__PURE__*/function () {
  function H264Parser(track) {
    _classCallCheck(this, H264Parser);
    this.track = track;
    this.firstFound = false;
  }
  _createClass(H264Parser, [{
    key: "parseSPS",
    value: function parseSPS(sps) {
      var config = H264Parser.readSPS(new Uint8Array(sps));
      this.track.width = config.width;
      this.track.height = config.height;
      this.track.hasBFrames = config.hasBFrames;
      this.track.sps = [new Uint8Array(sps)];
      this.track.codec = H264Parser.getCodec(sps);
    }
  }, {
    key: "parsePPS",
    value: function parsePPS(pps) {
      this.track.pps = [new Uint8Array(pps)];
    }
  }, {
    key: "parseNAL",
    value: function parseNAL(unit) {
      if (!unit) return false;
      var push = null;
      // console.log(unit.toString());
      switch (unit.type()) {
        case _nalu.NALU.NDR:
        case _nalu.NALU.IDR:
          unit.sliceType = H264Parser.parceSliceHeader(unit.data);
          if (unit.isKeyframe() && !this.firstFound) {
            this.firstFound = true;
          }
          if (this.firstFound) {
            push = true;
          } else {
            push = false;
          }
          break;
        case _nalu.NALU.PPS:
          push = false;
          if (!this.track.pps) {
            this.parsePPS(unit.getData().subarray(4));
          }
          break;
        case _nalu.NALU.SPS:
          push = false;
          if (!this.track.sps) {
            this.parseSPS(unit.getData().subarray(4));
          }
          break;
        case _nalu.NALU.SEI:
          push = false;
          var data = new DataView(unit.data.buffer, unit.data.byteOffset, unit.data.byteLength);
          var byte_idx = 0;
          var pay_type = data.getUint8(byte_idx);
          ++byte_idx;
          var pay_size = 0;
          var sz = data.getUint8(byte_idx);
          ++byte_idx;
          while (sz === 255) {
            pay_size += sz;
            sz = data.getUint8(byte_idx);
            ++byte_idx;
          }
          pay_size += sz;
          var uuid = unit.data.subarray(byte_idx, byte_idx + 16);
          byte_idx += 16;
          /** console.log(
            `PT: ${pay_type}, PS: ${pay_size}, UUID: ${Array.from(uuid)
              .map(function (i) {
                return ("0" + i.toString(16)).slice(-2);
              })
              .join("")}`
          ); */
          // debugger;
          break;
        case _nalu.NALU.DELIMITER:
        case _nalu.NALU.FILTER:
        case _nalu.NALU.EOSEQ:
        case _nalu.NALU.EOSTR:
          push = false;
          break;
        default:
          break;
      }
      if (push === null && unit.getNri() > 0) {
        push = true;
      }
      return push;
    }
  }], [{
    key: "getCodec",
    value: function getCodec(sps) {
      var codec = "avc1.";
      var codecarray = new DataView(sps.buffer, sps.byteOffset + 1, 4);
      for (var i = 0; i < 3; ++i) {
        var h = codecarray.getUint8(i).toString(16);
        if (h.length < 2) {
          h = "0" + h;
        }
        codec += h;
      }
      return codec;
    }
  }, {
    key: "parceSliceHeader",
    value: function parceSliceHeader(data) {
      var decoder = new _expGolomb.ExpGolomb(data);
      /** Skip first_mb  */
      decoder.skipUEG();
      var slice_type = decoder.readUEG();
      /** Skip pps_id */
      decoder.skipUEG();
      /** Skip frame_num */
      decoder.skipBits(8);
      // console.log(`first_mb: ${first_mb}, slice_type: ${slice_type}, ppsid: ${ppsid}, frame_num: ${frame_num}`);
      return slice_type;
    }

    /**
     * Advance the ExpGolomb decoder past a scaling list. The scaling
     * list is optionally transmitted as part of a sequence parameter
     * set and is not relevant to transmuxing.
     * @param decoder {ExpGolomb} exp golomb decoder
     * @param count {number} the number of entries in this scaling list
     * @see Recommendation ITU-T H.264, Section 7.3.2.1.1.1
     */
  }, {
    key: "skipScalingList",
    value: function skipScalingList(decoder, count) {
      var lastScale = 8,
        nextScale = 8,
        deltaScale;
      for (var j = 0; j < count; j++) {
        if (nextScale !== 0) {
          deltaScale = decoder.readEG();
          nextScale = (lastScale + deltaScale + 256) % 256;
        }
        lastScale = nextScale === 0 ? lastScale : nextScale;
      }
    }

    /**
     * Read a sequence parameter set and return some interesting video
     * properties. A sequence parameter set is the H264 metadata that
     * describes the properties of upcoming video frames.
     * @param data {Uint8Array} the bytes of a sequence parameter set
     * @return {object} an object with configuration parsed from the
     * sequence parameter set, including the dimensions of the
     * associated video frames.
     */
  }, {
    key: "readSPS",
    value: function readSPS(data) {
      data = _expGolomb.ExpGolomb.removeH264or5EmulationBytes(data);
      var decoder = new _expGolomb.ExpGolomb(data);
      var frameCropLeftOffset = 0,
        frameCropRightOffset = 0,
        frameCropTopOffset = 0,
        frameCropBottomOffset = 0,
        sarScale = 1,
        profileIdc,
        numRefFramesInPicOrderCntCycle,
        fixedFrameRate = true,
        frameDuration = 0,
        picWidthInMbsMinus1,
        picHeightInMapUnitsMinus1,
        frameMbsOnlyFlag,
        scalingListCount;
      /// Skip nal head
      decoder.skipBits(8);
      profileIdc = decoder.readUByte(); // profile_idc
      decoder.skipBits(5); // constraint_set[0-4]_flag, u(5)
      decoder.skipBits(3); // reserved_zero_3bits u(3),
      decoder.skipBits(8); //level_idc u(8)
      decoder.skipUEG(); // seq_parameter_set_id
      // some profiles have more optional data we don't need
      if (profileIdc === 100 || profileIdc === 110 || profileIdc === 122 || profileIdc === 244 || profileIdc === 44 || profileIdc === 83 || profileIdc === 86 || profileIdc === 118 || profileIdc === 128) {
        var chromaFormatIdc = decoder.readUEG();
        if (chromaFormatIdc === 3) {
          decoder.skipBits(1); // separate_colour_plane_flag
        }

        decoder.skipUEG(); // bit_depth_luma_minus8
        decoder.skipUEG(); // bit_depth_chroma_minus8
        decoder.skipBits(1); // qpprime_y_zero_transform_bypass_flag
        if (decoder.readBoolean()) {
          // seq_scaling_matrix_present_flag
          scalingListCount = chromaFormatIdc !== 3 ? 8 : 12;
          for (var i = 0; i < scalingListCount; ++i) {
            if (decoder.readBoolean()) {
              // seq_scaling_list_present_flag[ i ]
              if (i < 6) {
                H264Parser.skipScalingList(decoder, 16);
              } else {
                H264Parser.skipScalingList(decoder, 64);
              }
            }
          }
        }
      }
      decoder.skipUEG(); // log2_max_frame_num_minus4
      var picOrderCntType = decoder.readUEG();
      if (picOrderCntType === 0) {
        decoder.readUEG(); //log2_max_pic_order_cnt_lsb_minus4
      } else if (picOrderCntType === 1) {
        decoder.skipBits(1); // delta_pic_order_always_zero_flag
        decoder.skipEG(); // offset_for_non_ref_pic
        decoder.skipEG(); // offset_for_top_to_bottom_field
        numRefFramesInPicOrderCntCycle = decoder.readUEG();
        for (var _i = 0; _i < numRefFramesInPicOrderCntCycle; ++_i) {
          decoder.skipEG(); // offset_for_ref_frame[ i ]
        }
      }

      decoder.skipUEG(); // max_num_ref_frames
      decoder.skipBits(1); // gaps_in_frame_num_value_allowed_flag
      picWidthInMbsMinus1 = decoder.readUEG();
      picHeightInMapUnitsMinus1 = decoder.readUEG();
      frameMbsOnlyFlag = decoder.readBits(1);
      if (frameMbsOnlyFlag === 0) {
        decoder.skipBits(1); // mb_adaptive_frame_field_flag
      }

      decoder.skipBits(1); // direct_8x8_inference_flag
      if (decoder.readBoolean()) {
        // frame_cropping_flag
        frameCropLeftOffset = decoder.readUEG();
        frameCropRightOffset = decoder.readUEG();
        frameCropTopOffset = decoder.readUEG();
        frameCropBottomOffset = decoder.readUEG();
      }
      if (decoder.readBoolean()) {
        // vui_parameters_present_flag
        if (decoder.readBoolean()) {
          // aspect_ratio_info_present_flag
          var sarRatio;
          var aspectRatioIdc = decoder.readUByte();
          switch (aspectRatioIdc) {
            case 1:
              sarRatio = [1, 1];
              break;
            case 2:
              sarRatio = [12, 11];
              break;
            case 3:
              sarRatio = [10, 11];
              break;
            case 4:
              sarRatio = [16, 11];
              break;
            case 5:
              sarRatio = [40, 33];
              break;
            case 6:
              sarRatio = [24, 11];
              break;
            case 7:
              sarRatio = [20, 11];
              break;
            case 8:
              sarRatio = [32, 11];
              break;
            case 9:
              sarRatio = [80, 33];
              break;
            case 10:
              sarRatio = [18, 11];
              break;
            case 11:
              sarRatio = [15, 11];
              break;
            case 12:
              sarRatio = [64, 33];
              break;
            case 13:
              sarRatio = [160, 99];
              break;
            case 14:
              sarRatio = [4, 3];
              break;
            case 15:
              sarRatio = [3, 2];
              break;
            case 16:
              sarRatio = [2, 1];
              break;
            case 255:
              {
                sarRatio = [decoder.readUByte() << 8 | decoder.readUByte(), decoder.readUByte() << 8 | decoder.readUByte()];
                break;
              }
            default:
              throw new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_DECODE, "Invalid avc sps aspectRatioIdc: ".concat(aspectRatioIdc));
          }
          if (sarRatio) {
            sarScale = sarRatio[0] / sarRatio[1];
          }
        }
        if (decoder.readBoolean()) {
          decoder.skipBits(1);
        }
        if (decoder.readBoolean()) {
          decoder.skipBits(4);
          if (decoder.readBoolean()) {
            decoder.skipBits(24);
          }
        }
        if (decoder.readBoolean()) {
          decoder.skipUEG();
          decoder.skipUEG();
        }
        if (decoder.readBoolean()) {
          var unitsInTick = decoder.readUInt();
          var timeScale = decoder.readUInt();
          fixedFrameRate = decoder.readBoolean();
          frameDuration = timeScale / (2 * unitsInTick);
          console.log("timescale: ".concat(timeScale, "; unitsInTick: ").concat(unitsInTick, "; fixedFramerate: ").concat(fixedFrameRate, "; avgFrameDuration: ").concat(frameDuration));
        }
      }
      return {
        width: Math.ceil(((picWidthInMbsMinus1 + 1) * 16 - frameCropLeftOffset * 2 - frameCropRightOffset * 2) * sarScale),
        height: (2 - frameMbsOnlyFlag) * (picHeightInMapUnitsMinus1 + 1) * 16 - (frameMbsOnlyFlag ? 2 : 4) * (frameCropTopOffset + frameCropBottomOffset),
        hasBFrames: picOrderCntType === 2 ? false : true,
        fixedFrameRate: fixedFrameRate,
        frameDuration: frameDuration
      };
    }
  }, {
    key: "readSliceType",
    value: function readSliceType(decoder) {
      // skip NALu type
      decoder.skipBits(8);
      // discard first_mb_in_slice
      decoder.skipUEG();
      // return slice_type
      return decoder.readUEG();
    }
  }]);
  return H264Parser;
}();
},{"./exp-golomb.js":"src/parsers/exp-golomb.js","./nalu.js":"src/parsers/nalu.js","../api/ASMediaError.js":"src/api/ASMediaError.js"}],"src/remuxer/h264.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.H264Remuxer = void 0;
var _logger = require("../utils/logger.js");
var _h = require("../parsers/h264.js");
var _baseRemuxer = require("./base-remuxer.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var Log = (0, _logger.getTagged)("remuxer:h264");
// TODO: asm.js
var H264Remuxer = exports.H264Remuxer = /*#__PURE__*/function (_BaseRemuxer) {
  _inherits(H264Remuxer, _BaseRemuxer);
  var _super = _createSuper(H264Remuxer);
  function H264Remuxer(timescale) {
    var _this;
    var scaleFactor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _classCallCheck(this, H264Remuxer);
    _this = _super.call(this, timescale, scaleFactor);
    _this.firstDTS = 0;
    _this.readyToDecode = false;
    _this.initialized = false;
    _this.lastDTS = undefined;
    _this.lastSampleDuration = 0;
    _this.lastDurations = [];
    // this.timescale = 90000;
    _this.tsAlign = Math.round(_this.timescale / 60);
    _this.mp4track = {
      id: _baseRemuxer.BaseRemuxer.getTrackID(),
      type: "video",
      len: 0,
      fragmented: true,
      sps: "",
      pps: "",
      width: 0,
      height: 0,
      timescale: timescale,
      duration: timescale,
      samples: []
    };
    _this.samples = [];
    _this.lastGopDTS = -99999999999999;
    _this.gop = [];
    _this.h264 = new _h.H264Parser(_this.mp4track);
    if (params.sps) {
      var arr = new Uint8Array(params.sps);
      if ((arr[0] & 0x1f) === 7) {
        _this.setSPS(arr);
      } else {
        Log.warn("bad SPS in SDP");
      }
    }
    if (params.pps) {
      var _arr = new Uint8Array(params.pps);
      if ((_arr[0] & 0x1f) === 8) {
        _this.setPPS(_arr);
      } else {
        Log.warn("bad PPS in SDP");
      }
    }
    if (_this.mp4track.pps && _this.mp4track.sps) {
      _this.readyToDecode = true;
    }
    return _this;
  }
  _createClass(H264Remuxer, [{
    key: "_scaled",
    value: function _scaled(timestamp) {
      return timestamp >>> this.scaleFactor;
    }
  }, {
    key: "_unscaled",
    value: function _unscaled(timestamp) {
      return timestamp << this.scaleFactor;
    }
  }, {
    key: "setSPS",
    value: function setSPS(sps) {
      this.h264.parseSPS(sps);
    }
  }, {
    key: "setPPS",
    value: function setPPS(pps) {
      this.h264.parsePPS(pps);
    }
  }, {
    key: "remux",
    value: function remux(nalu) {
      if (this.lastGopDTS < nalu.dts) {
        this.gop.sort(_baseRemuxer.BaseRemuxer.dtsSortFunc);
        if (this.gop.length > 1) {
          // Aggregate multi-slices which belong to one frame
          var groupedGop = _baseRemuxer.BaseRemuxer.groupByDts(this.gop);
          this.gop = Object.values(groupedGop).map(function (group) {
            return group.reduce(function (preUnit, curUnit) {
              var naluData = curUnit.getData();
              naluData.set(new Uint8Array([0x0, 0x0, 0x0, 0x1]));
              preUnit.appendData(naluData);
              return preUnit;
            });
          });
        }
        var _iterator = _createForOfIteratorHelper(this.gop),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var unit = _step.value;
            this.mp4track.len += _get(_getPrototypeOf(H264Remuxer.prototype), "remux", this).call(this, unit);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.gop = [];
        this.lastGopDTS = nalu.dts;
      }
      var push = this.h264.parseNAL(nalu);
      if (push) {
        this.gop.push(nalu);
      }
      if (!this.readyToDecode && this.mp4track.pps && this.mp4track.sps) {
        this.readyToDecode = true;
      }
    }
  }, {
    key: "getPayload",
    value: function getPayload() {
      if (!this.getPayloadBase()) {
        return null;
      }
      var payload = new Uint8Array(this.mp4track.len);
      var offset = 0;
      var samples = this.mp4track.samples;
      var mp4Sample, lastDTS, pts, dts;
      while (this.samples.length) {
        var sample = this.samples.shift();
        var unit = sample.unit;
        pts = sample.pts - this.initDTS;
        dts = sample.dts - this.initDTS;
        mp4Sample = {
          size: unit.getSize(),
          duration: sample.duration,
          cts: sample.cts,
          flags: {
            isLeading: 0,
            isDependedOn: 0,
            hasRedundancy: 0,
            degradPrio: 0,
            isNonSync: 0
          }
        };
        var flags = mp4Sample.flags;
        if (sample.unit.isKeyframe() === true) {
          // the current sample is a key frame
          flags.dependsOn = 2;
          flags.isDependedOn = 1;
          flags.isNonSync = 0;
        } else {
          flags.dependsOn = 1;
          flags.isDependedOn = 1;
          flags.isNonSync = 1;
        }
        payload.set(unit.getData(), offset);
        offset += unit.getSize();
        samples.push(mp4Sample);
        if (lastDTS === undefined) {
          this.firstDTS = dts;
          ///Log.debug(`AVC fitst dts:${this.firstDTS}`);
        }

        lastDTS = dts;
      }
      if (!samples.length) return null;
      return payload;
    }
  }]);
  return H264Remuxer;
}(_baseRemuxer.BaseRemuxer);
},{"../utils/logger.js":"src/utils/logger.js","../parsers/h264.js":"src/parsers/h264.js","./base-remuxer.js":"src/remuxer/base-remuxer.js"}],"src/parsers/nalu-hevc.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HEVC_NALU = void 0;
var _binary = require("../utils/binary.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var HEVC_NALU = exports.HEVC_NALU = /*#__PURE__*/function () {
  /*       HEVC nalu playload header
   *        +---------------+---------------+
   *        |0|1|2|3|4|5|6|7|0|1|2|3|4|5|6|7|
   *        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   *        |F|   Type    |  LayerId  | TID |
   *        +-------------+-----------------+
   *        Figure 1: The Structure of the HEVC NAL Unit Header
   */
  function HEVC_NALU(ntype, layerid, tid, data, dts, pts) {
    _classCallCheck(this, HEVC_NALU);
    this.data = data;
    this.ntype = ntype;
    this.layerid = layerid;
    this.tid = tid;
    this.dts = dts;
    this.pts = pts;
    this.sliceType = null;
  }
  _createClass(HEVC_NALU, [{
    key: "appendData",
    value: function appendData(idata) {
      this.data = (0, _binary.appendByteArray)(this.data, idata);
    }
  }, {
    key: "toString",
    value: function toString() {
      return "".concat(HEVC_NALU.type(this), "(").concat(this.data.byteLength, "): LayerID: ").concat(this.getLayerID(), ", TID: ").concat(this.getTID(), ", PTS: ").concat(this.pts, ", DTS: ").concat(this.dts);
    }
  }, {
    key: "getLayerID",
    value: function getLayerID() {
      return this.layerid;
    }
  }, {
    key: "getTID",
    value: function getTID() {
      return this.tid;
    }
  }, {
    key: "type",
    value: function type() {
      return this.ntype;
    }
  }, {
    key: "isKeyframe",
    value: function isKeyframe() {
      return this.ntype === HEVC_NALU.SLICE_IDR_N_LP || this.ntype === HEVC_NALU.SLICE_IDR_W_RADL;
    }
  }, {
    key: "isRAP",
    value: function isRAP() {
      return this.ntype >= HEVC_NALU.SLICE_BLA_W_LP && this.ntype <= HEVC_NALU.SLICE_RSV_IRAP_VCL23;
    }
  }, {
    key: "getSize",
    value: function getSize() {
      return 4 + 2 + this.data.byteLength;
    }
  }, {
    key: "getData",
    value: function getData() {
      var header = new Uint8Array(6 + this.data.byteLength);
      var view = new DataView(header.buffer);
      view.setUint32(0, this.data.byteLength + 2);
      view.setUint8(4, this.ntype << 1 & 0x7e | this.layerid >>> 5);
      view.setUint8(5, this.layerid << 3 | this.tid);
      header.set(this.data, 6);
      return header;
    }
  }], [{
    key: "SLICE_TRAIL_N",
    get: function get() {
      return 0;
    }
  }, {
    key: "SLICE_TRAIL_R",
    get: function get() {
      return 1;
    }
  }, {
    key: "SLICE_TSA_N",
    get: function get() {
      return 2;
    }
  }, {
    key: "SLICE_TLA_R",
    get: function get() {
      return 3;
    }
  }, {
    key: "SLICE_STSA_N",
    get: function get() {
      return 4;
    }
  }, {
    key: "SLICE_STSA_R",
    get: function get() {
      return 5;
    }
  }, {
    key: "SLICE_RADL_N",
    get: function get() {
      return 6;
    }
  }, {
    key: "SLICE_RADL_R",
    get: function get() {
      return 7;
    }
  }, {
    key: "SLICE_RASL_N",
    get: function get() {
      return 8;
    }
  }, {
    key: "SLICE_RASL_R",
    get: function get() {
      return 9;
    }
  }, {
    key: "SLICE_BLA_W_LP",
    get: function get() {
      return 16;
    }
  }, {
    key: "SLICE_BLA_W_RADL",
    get: function get() {
      return 17;
    }
  }, {
    key: "SLICE_BLA_N_LP",
    get: function get() {
      return 18;
    }
  }, {
    key: "SLICE_IDR_W_RADL",
    get: function get() {
      return 19;
    }
  }, {
    key: "SLICE_IDR_N_LP",
    get: function get() {
      return 20;
    }
  }, {
    key: "SLICE_CRA",
    get: function get() {
      return 21;
    }
  }, {
    key: "SLICE_RSV_IRAP_VCL22",
    get: function get() {
      return 22;
    }
  }, {
    key: "SLICE_RSV_IRAP_VCL23",
    get: function get() {
      return 23;
    }
  }, {
    key: "VPS",
    get: function get() {
      return 32;
    }
  }, {
    key: "SPS",
    get: function get() {
      return 33;
    }
  }, {
    key: "PPS",
    get: function get() {
      return 34;
    }
  }, {
    key: "DELIMITER",
    get: function get() {
      return 35;
    }
  }, {
    key: "EOS",
    get: function get() {
      return 36;
    }
  }, {
    key: "EOB",
    get: function get() {
      return 37;
    }
  }, {
    key: "FILTER",
    get: function get() {
      return 38;
    }
  }, {
    key: "PREFIX_SEI",
    get: function get() {
      return 39;
    }
  }, {
    key: "SUFFIX_SEI",
    get: function get() {
      return 40;
    }
  }, {
    key: "STAP",
    get: function get() {
      return 48;
    }
  }, {
    key: "FU",
    get: function get() {
      return 49;
    }
  }, {
    key: "PACI",
    get: function get() {
      return 50;
    }
  }, {
    key: "TYPES",
    get: function get() {
      var _ref;
      return _ref = {}, _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_ref, HEVC_NALU.SLICE_IDR_N_LP, "IDR"), HEVC_NALU.SLICE_IDR_W_RADL, "IDR"), HEVC_NALU.PREFIX_SEI, "SEI"), HEVC_NALU.SUFFIX_SEI, "SEI"), HEVC_NALU.VPS, "VPS"), HEVC_NALU.SPS, "SPS"), HEVC_NALU.PPS, "PPS"), HEVC_NALU.SLICE_BLA_W_LP, "RAP"), HEVC_NALU.SLICE_BLA_W_RADL, "RAP"), HEVC_NALU.SLICE_BLA_N_LP, "RAP"), _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_ref, HEVC_NALU.SLICE_CRA, "RAP"), HEVC_NALU.SLICE_RSV_IRAP_VCL22, "RAP"), HEVC_NALU.SLICE_RSV_IRAP_VCL23, "RAP"), HEVC_NALU.DELIMITER, "AUD"), HEVC_NALU.FILTER, "FILTER"), HEVC_NALU.EOS, "EOS"), HEVC_NALU.EOS, "EOB"), HEVC_NALU.SLICE_TRAIL_N, "NDR"), HEVC_NALU.SLICE_TRAIL_R, "NDR"), HEVC_NALU.SLICE_TSA_N, "NDR"), _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_ref, HEVC_NALU.SLICE_TLA_R, "NDR"), HEVC_NALU.SLICE_STSA_N, "NDR"), HEVC_NALU.SLICE_STSA_R, "NDR"), HEVC_NALU.SLICE_RADL_N, "NDR"), HEVC_NALU.SLICE_RADL_R, "NDR"), HEVC_NALU.SLICE_RASL_N, "NDR"), HEVC_NALU.SLICE_RASL_R, "NDR");
    }
  }, {
    key: "type",
    value: function type(nalu) {
      if (nalu.ntype in HEVC_NALU.TYPES) {
        return HEVC_NALU.TYPES[nalu.ntype];
      } else {
        return "UNKNOWN";
      }
    }
  }]);
  return HEVC_NALU;
}();
},{"../utils/binary.js":"src/utils/binary.js"}],"src/parsers/h265.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.H265Parser = void 0;
var _expGolomb = require("./exp-golomb.js");
var _naluHevc = require("./nalu-hevc.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var H265Parser = exports.H265Parser = /*#__PURE__*/function () {
  function H265Parser(track) {
    _classCallCheck(this, H265Parser);
    this.track = track;
    this.firstFound = false;
  }
  _createClass(H265Parser, [{
    key: "parseVPS",
    value: function parseVPS(vps) {
      this.track.vps = [vps];
      var config = H265Parser.readVPS(vps);
      this.track.vpsconfig = config;
      this.track.codec = H265Parser.getCodecByConfig(config);
    }
  }, {
    key: "parseSPS",
    value: function parseSPS(sps) {
      var config = H265Parser.readSPS(sps);
      this.track.width = config.width;
      this.track.height = config.height;
      this.track.hasBFrames = config.hasBFrames;
      this.track.sps = [sps];
    }
  }, {
    key: "parsePPS",
    value: function parsePPS(pps) {
      this.track.pps = [pps];
    }
  }, {
    key: "parseNAL",
    value: function parseNAL(unit) {
      if (!unit) return false;
      var push = null;
      // console.log(unit.toString());
      switch (unit.type()) {
        case _naluHevc.HEVC_NALU.SLICE_RADL_N:
        case _naluHevc.HEVC_NALU.SLICE_RADL_R:
        case _naluHevc.HEVC_NALU.SLICE_RASL_N:
        case _naluHevc.HEVC_NALU.SLICE_STSA_N:
        case _naluHevc.HEVC_NALU.SLICE_STSA_R:
        case _naluHevc.HEVC_NALU.SLICE_TLA_R:
        case _naluHevc.HEVC_NALU.SLICE_TSA_N:
        case _naluHevc.HEVC_NALU.SLICE_TRAIL_N:
        case _naluHevc.HEVC_NALU.SLICE_TRAIL_R:
        case _naluHevc.HEVC_NALU.SLICE_BLA_W_LP:
        case _naluHevc.HEVC_NALU.SLICE_BLA_N_LP:
        case _naluHevc.HEVC_NALU.SLICE_BLA_W_RADL:
        case _naluHevc.HEVC_NALU.SLICE_IDR_N_LP:
        case _naluHevc.HEVC_NALU.SLICE_IDR_W_RADL:
        case _naluHevc.HEVC_NALU.SLICE_CRA:
        case _naluHevc.HEVC_NALU.SLICE_RSV_IRAP_VCL22:
        case _naluHevc.HEVC_NALU.SLICE_RSV_IRAP_VCL23:
          if (unit.isKeyframe() && !this.firstFound) {
            this.firstFound = true;
          }
          if (this.firstFound) {
            push = true;
          } else {
            push = false;
          }
          break;
        case _naluHevc.HEVC_NALU.VPS:
          push = false;
          if (!this.track.vps) {
            this.parseVPS(unit.getData().subarray(4));
          }
          break;
        case _naluHevc.HEVC_NALU.SPS:
          push = false;
          if (!this.track.sps) {
            this.parseSPS(unit.getData().subarray(4));
          }
          break;
        case _naluHevc.HEVC_NALU.PPS:
          push = false;
          if (!this.track.pps) {
            this.parsePPS(unit.getData().subarray(4));
          }
          break;
        case _naluHevc.HEVC_NALU.PREFIX_SEI:
        case _naluHevc.HEVC_NALU.SUFFIX_SEI:
          push = false;
          var data = new DataView(unit.data.buffer, unit.data.byteOffset, unit.data.byteLength);
          var byte_idx = 0;
          var pay_type = data.getUint8(byte_idx);
          ++byte_idx;
          var pay_size = 0;
          var sz = data.getUint8(byte_idx);
          ++byte_idx;
          while (sz === 255) {
            pay_size += sz;
            sz = data.getUint8(byte_idx);
            ++byte_idx;
          }
          pay_size += sz;
          var uuid = unit.data.subarray(byte_idx, byte_idx + 16);
          byte_idx += 16;
          /** console.log(
            `PT: ${pay_type}, PS: ${pay_size}, UUID: ${Array.from(uuid)
              .map(function (i) {
                return ("0" + i.toString(16)).slice(-2);
              })
              .join("")}`
          ); */
          // debugger;
          break;
        case _naluHevc.HEVC_NALU.DELIMITER:
        case _naluHevc.HEVC_NALU.FILTER:
        case _naluHevc.HEVC_NALU.EOS:
        case _naluHevc.HEVC_NALU.EOB:
          push = false;
          break;
        default:
          break;
      }
      if (push === null && unit.getLayerID() > 0) {
        push = true;
      }
      return push;
    }
    // See Rec. ITU-T H.265 v3 (04/2015) Chapter 7.3.2.1 for reference
  }], [{
    key: "generalProfileSpaceString",
    value: function generalProfileSpaceString(generalProfileSpace) {
      var s;
      switch (generalProfileSpace) {
        case 0:
          s = "";
          break;
        case 1:
          s = "A";
          break;
        case 2:
          s = "B";
          break;
        case 3:
          s = "A";
          break;
        default:
          throw Error("Invalid hevc GeneralProfileSpace:".concat(generalProfileSpace, "!"));
      }
      return s;
    }
  }, {
    key: "swap32",
    value: function swap32(val) {
      return (val & 0xff00) << 24 | (val & 0xff00) << 8 | val >> 8 & 0xff00 | val >> 24 & 0xff;
    }
  }, {
    key: "trim_leading_zeros",
    value: function trim_leading_zeros(str) {
      for (var i = 0; i < str.length; ++i) {
        if (str.charCodeAt(i) === "0") continue;
        return str.substr(i);
      }
      return "0";
    }

    // Encode the 32 bits input, but in reverse bit order, i.e. bit [31] as the most
    // significant bit, followed by, bit [30], and down to bit [0] as the least
    // significant bit, where bits [i] for i in the range of 0 to 31, inclusive, are
    // specified in ISO/IEC 23008‐2, encoded in hexadecimal (leading zeroes may be
    // omitted).
  }, {
    key: "reverse_bits_and_hex_encode",
    value: function reverse_bits_and_hex_encode(x) {
      x = (x & 0x55555555) << 1 | (x & 0xaaaaaaaa) >>> 1;
      x = (x & 0x33333333) << 2 | (x & 0xcccccccc) >>> 2;
      x = (x & 0x0f0f0f0f) << 4 | (x & 0xf0f0f0f0) >>> 4;
      x = this.swap32(x);
      var sbytes = x.toString(16);
      return H265Parser.trim_leading_zeros(sbytes);
    }
  }, {
    key: "getCodecByConfig",
    value: function getCodecByConfig(config) {
      var codec = "hvc1.";
      var scodecs = [];
      scodecs.push("".concat(H265Parser.generalProfileSpaceString(config.GeneralProfileSpace)).concat(config.GeneralProfileIdc));
      scodecs.push(H265Parser.reverse_bits_and_hex_encode(config.GeneralProfileCompatibilityFlags));
      scodecs.push((config.GeneralTierFlag ? "H" : "L") + config.GeneralLevelIdc);
      var contraints = config.GeneralConstraintIndicatorFlags;
      var contraintsBuf = new Uint8Array((contraints & 0x0000ff0000000000) >> 40, (contraints & 0x000000ff00000000) >> 32, (contraints & 0x00000000ff000000) >> 24, (contraints & 0x0000000000ff0000) >> 16, (contraints & 0x000000000000ff00) >> 8, contraints & 0x00000000000000ff);
      var count = contraintsBuf.length;
      for (; count > 0; --count) {
        if (contraints[count - 1] !== 0) {
          break;
        }
      }
      for (var i = 0; i < count; i++) {
        scodecs.push(contraintsBuf[i].toString(16).padStart(2, "0").toUpperCase());
      }
      codec += scodecs.join(".");
      return codec;
    }
  }, {
    key: "getCodec",
    value: function getCodec(vps) {
      var config = H265Parser.readVPS(vps);
      return H265Parser.getCodecByConfig(config);
    }
  }, {
    key: "readVPS",
    value: function readVPS(data) {
      data = _expGolomb.ExpGolomb.removeH264or5EmulationBytes(data);
      var reader = new _expGolomb.ExpGolomb(data);
      // Skip nal head
      reader.skipBits(16);
      // Skip vps_video_parameter_set_id
      reader.skipBits(4);
      // Skip vps_base_layer_internal_flag
      reader.skipBits(1);
      // Skip vps_base_layer_available_flag
      reader.skipBits(1);
      // Skip vps_max_layers_minus_1
      reader.skipBits(6);
      var vps_max_sub_layers_minus1 = reader.readBits(3) + 1;
      // Skip vps_temporal_id_nesting_flags
      reader.skipBits(1);

      // Skip reserved
      reader.skipBits(16);
      var config = {};
      config["GeneralProfileSpace"] = reader.readBits(2);
      config["GeneralTierFlag"] = reader.readBoolean();
      config["GeneralProfileIdc"] = reader.readBits(5);
      config["GeneralProfileCompatibilityFlags"] = reader.readUInt();
      config["GeneralConstraintIndicatorFlags"] = Number(reader.readBits(16) << 32 | reader.readBits(32));
      config["GeneralLevelIdc"] = reader.readBits(8);
      /** vps_sub_layer_ordering_info_present_flag */
      var vps_sub_layer_ordering_info_present_flag = reader.readBits(1);
      var i = vps_sub_layer_ordering_info_present_flag ? 0 : vps_max_sub_layers_minus1 - 1;
      for (; i < vps_max_sub_layers_minus1; i++) {
        //Skip vps_max_dec_pic_buffering_minus1[i]
        reader.skipUEG();
        //Skip vps_max_num_reorder_pics[i]
        reader.skipUEG();
        //Skip vps_max_latency_increase_plus1
        reader.skipUEG();
      }
      /// vps_max_layer_id
      var vps_max_layer_id = reader.readBits(6);
      var vps_num_layer_sets_minus1 = reader.readUEG() + 1;
      for (var _i = 1; _i < vps_num_layer_sets_minus1; _i++) {
        for (var j = 0; j <= vps_max_layer_id; j++) {
          reader.skipBits(1); // layer_id_
        }
      }

      var vps_timing_info_present_flag = reader.readBits(1);
      if (vps_timing_info_present_flag) {
        //vps_num_units_in_tick
        var num = reader.readBits(32);
        //vps_time_scale
        var den = reader.readBits(32);
        config["fixedFrameRate"] = true;
        config["frameDuration"] = num / den;
      } else {
        config["fixedFrameRate"] = false;
        config["frameDuration"] = 0;
      }
      return config;
    }

    /// See Rec. ITU-T H.265 v3 (04/2015) Chapter 7.3.2.2 for reference
  }, {
    key: "readSPS",
    value: function readSPS(data) {
      data = _expGolomb.ExpGolomb.removeH264or5EmulationBytes(data);
      var decoder = new _expGolomb.ExpGolomb(data);
      // Skip nal head
      decoder.skipBits(16);
      // Skip sps_video_parameter_set_id
      decoder.skipBits(4);
      // sps_max_sub_layers_minus1
      var sps_max_sub_layers_minus1 = decoder.readBits(3);
      // Skip sps_temporal_id_nesting_flag;
      decoder.skipBits(1);
      // Skip general profile
      decoder.skipBits(96);
      if (sps_max_sub_layers_minus1 > 0) {
        var subLayerProfilePresentFlag = new Uint8Array(8);
        var subLayerLevelPresentFlag = new Uint8Array(8);
        for (var i = 0; i < sps_max_sub_layers_minus1; ++i) {
          subLayerProfilePresentFlag[i] = decoder.readBits(1);
          subLayerLevelPresentFlag[i] = decoder.readBits(1);
        }
        // Skip reserved
        decoder.skipBits(2 * (8 - sps_max_sub_layers_minus1));
        for (var _i2 = 0; _i2 < sps_max_sub_layers_minus1; ++_i2) {
          if (subLayerProfilePresentFlag[_i2]) {
            // Skip profile
            decoder.skipBits(88);
          }
          if (subLayerLevelPresentFlag[_i2]) {
            // Skip sub_layer_level_idc[i]
            decoder.skipBits(8);
          }
        }
      }
      // Skip sps_seq_parameter_set_id
      decoder.skipUEG();
      // chroma_format_idc
      var chromaFormatIdc = decoder.readUEG();
      var separate_colour_plane_flag = 0;
      if (chromaFormatIdc === 3) {
        // separate_colour_plane_flag
        separate_colour_plane_flag = decoder.readBits(1);
      }

      // pic_width_in_luma_samples
      var pic_width_in_luma_samples = decoder.readUEG();
      console.log("pic_width_in_luma_samples:".concat(pic_width_in_luma_samples));
      // pic_height_in_luma_samples
      var pic_height_in_luma_samples = decoder.readUEG();
      console.log("pic_height_in_luma_samples:".concat(pic_height_in_luma_samples));
      var conformance_window_flag = decoder.readBoolean();
      if (conformance_window_flag) {
        // conf_win_left_offset
        var conf_win_left_offset = decoder.readUEG();
        // conf_win_right_offset
        var conf_win_right_offset = decoder.readUEG();
        // conf_win_top_offset
        var conf_win_top_offset = decoder.readUEG();
        // conf_win_bottom_offset
        var conf_win_bottom_offset = decoder.readUEG();
        var sub_width_c = (1 === chromaFormatIdc || 2 === chromaFormatIdc) && 0 === separate_colour_plane_flag ? 2 : 1;
        var sub_height_c = 1 === chromaFormatIdc && 0 === separate_colour_plane_flag ? 2 : 1;
        pic_width_in_luma_samples -= sub_width_c * conf_win_right_offset + sub_width_c * conf_win_left_offset;
        pic_height_in_luma_samples -= sub_height_c * conf_win_bottom_offset + sub_height_c * conf_win_top_offset;
      }

      // bit_depth_luma_minus8
      decoder.skipUEG();
      // bit_depth_chroma_minus8
      decoder.skipUEG();
      // log2_max_pic_order_cnt_lsb_minus4
      decoder.skipUEG();
      // sps_sub_layer_ordering_info_present_flag
      var spsSubLayerOrderingInfoPresentFlag = decoder.readBits(1);
      return {
        width: pic_width_in_luma_samples,
        height: pic_height_in_luma_samples,
        hasBFrames: spsSubLayerOrderingInfoPresentFlag === 1 ? true : false
      };
    }
  }]);
  return H265Parser;
}();
},{"./exp-golomb.js":"src/parsers/exp-golomb.js","./nalu-hevc.js":"src/parsers/nalu-hevc.js"}],"src/remuxer/h265.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.H265Remuxer = void 0;
var _logger = require("../utils/logger.js");
var _h = require("../parsers/h265.js");
var _baseRemuxer = require("./base-remuxer.js");
var _naluHevc = require("../parsers/nalu-hevc.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var Log = (0, _logger.getTagged)("remuxer:h265");
var H265Remuxer = exports.H265Remuxer = /*#__PURE__*/function (_BaseRemuxer) {
  _inherits(H265Remuxer, _BaseRemuxer);
  var _super = _createSuper(H265Remuxer);
  function H265Remuxer(timescale) {
    var _this;
    var scaleFactor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _classCallCheck(this, H265Remuxer);
    _this = _super.call(this, timescale, scaleFactor);
    _this.nextDts = undefined;
    _this.readyToDecode = false;
    _this.initialized = false;
    _this.firstDTS = 0;
    _this.lastDTS = undefined;
    _this.lastSampleDuration = 0;
    _this.lastDurations = [];
    // this.timescale = 90000;
    _this.tsAlign = Math.round(_this.timescale / 60);
    _this.mp4track = {
      id: _baseRemuxer.BaseRemuxer.getTrackID(),
      type: "video",
      len: 0,
      fragmented: true,
      vps: "",
      sps: "",
      pps: "",
      width: 0,
      height: 0,
      timescale: timescale,
      duration: timescale,
      samples: [] /** mp4 samples */
    };

    _this.samples = [];
    _this.lastGopDTS = -99999999999999;
    _this.gop = [];
    _this.firstUnit = true;
    _this.h265 = new _h.H265Parser(_this.mp4track);
    if (params.vps) {
      var arr = new Uint8Array(params.vps);
      var type = arr[0] >>> 1 & 0x3f;
      if (type === _naluHevc.HEVC_NALU.VPS) {
        _this.setVPS(arr);
      } else {
        Log.warn("bad VPS in SDP!");
      }
    }
    if (params.sps) {
      var _arr = new Uint8Array(params.sps);
      var _type = _arr[0] >>> 1 & 0x3f;
      if (_type === _naluHevc.HEVC_NALU.SPS) {
        _this.setSPS(_arr);
      } else {
        Log.warn("bad SPS in SDP");
      }
    }
    if (params.pps) {
      var _arr2 = new Uint8Array(params.pps);
      var _type2 = _arr2[0] >>> 1 & 0x3f;
      if (_type2 === _naluHevc.HEVC_NALU.PPS) {
        _this.setPPS(_arr2);
      } else {
        Log.warn("bad PPS in SDP");
      }
    }
    if (_this.mp4track.vps && _this.mp4track.sps && _this.mp4track.pps) {
      _this.readyToDecode = true;
    }
    return _this;
  }
  _createClass(H265Remuxer, [{
    key: "_scaled",
    value: function _scaled(timestamp) {
      return timestamp >>> this.scaleFactor;
    }
  }, {
    key: "_unscaled",
    value: function _unscaled(timestamp) {
      return timestamp << this.scaleFactor;
    }
  }, {
    key: "setVPS",
    value: function setVPS(vps) {
      this.h265.parseVPS(vps);
    }
  }, {
    key: "setSPS",
    value: function setSPS(sps) {
      this.h265.parseSPS(sps);
    }
  }, {
    key: "setPPS",
    value: function setPPS(pps) {
      this.h265.parsePPS(pps);
    }
  }, {
    key: "remux",
    value: function remux(nalu) {
      if (this.lastGopDTS < nalu.dts) {
        this.gop.sort(_baseRemuxer.BaseRemuxer.dtsSortFunc);
        if (this.gop.length > 1) {
          // Aggregate multi-slices which belong to one frame
          var groupedGop = _baseRemuxer.BaseRemuxer.groupByDts(this.gop);
          this.gop = Object.values(groupedGop).map(function (group) {
            return group.reduce(function (preUnit, curUnit) {
              var naluData = curUnit.getData();
              naluData.set(new Uint8Array([0x0, 0x0, 0x0, 0x1]));
              preUnit.appendData(naluData);
              return preUnit;
            });
          });
        }
        var _iterator = _createForOfIteratorHelper(this.gop),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var unit = _step.value;
            if (_get(_getPrototypeOf(H265Remuxer.prototype), "remux", this).call(this, unit)) {
              this.mp4track.len += unit.getSize();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.gop = [];
        this.lastGopDTS = nalu.dts;
      }
      var push = this.h265.parseNAL(nalu);
      if (push) {
        this.gop.push(nalu);
      }
      if (!this.readyToDecode && this.mp4track.vps && this.mp4track.sps && this.mp4track.pps) {
        this.readyToDecode = true;
      }
    }
  }, {
    key: "getPayload",
    value: function getPayload() {
      if (!this.getPayloadBase()) {
        return null;
      }
      var payload = new Uint8Array(this.mp4track.len);
      var offset = 0;
      var samples = this.mp4track.samples;
      var mp4Sample, lastDTS, pts, dts;

      // Log.debug(this.samples.map((e)=>{
      //     return Math.round((e.dts - this.initDTS));
      // }));

      // let minDuration = Number.MAX_SAFE_INTEGER;
      while (this.samples.length) {
        var sample = this.samples.shift();
        if (sample === null) {
          // discontinuity
          this.nextDts = undefined;
          break;
        }
        var unit = sample.unit;
        pts = sample.pts - this.initDTS; ///*Math.round(*/(sample.pts - this.initDTS)/*/this.tsAlign)*this.tsAlign*/;
        dts = sample.dts - this.initDTS; ///*Math.round(*/(sample.dts - this.initDTS)/*/this.tsAlign)*this.tsAlign*/;
        // ensure DTS is not bigger than PTS
        dts = Math.min(pts, dts);
        // if not first HEVC sample of video track, normalize PTS/DTS with previous sample value
        // and ensure that sample duration is positive
        if (lastDTS !== undefined) {
          var sampleDuration = this.scaled(dts - lastDTS);
          // Log.debug(`Sample duration: ${sampleDuration}`);
          if (sampleDuration < 0) {
            Log.log("invalid HEVC sample duration at PTS/DTS: ".concat(pts, "/").concat(dts, "|lastDTS: ").concat(lastDTS, ":").concat(sampleDuration));
            this.mp4track.len -= unit.getSize();
            continue;
          }
          // minDuration = Math.min(sampleDuration, minDuration);
          this.lastDurations.push(sampleDuration);
          if (this.lastDurations.length > 100) {
            this.lastDurations.shift();
          }
          mp4Sample.duration = sampleDuration;
        } else {
          if (this.nextDts) {
            var delta = dts - this.nextDts;
            // if fragment are contiguous, or delta less than 600ms, ensure there is no overlap/hole between fragments
            if ( /*contiguous ||*/Math.abs(Math.round(_baseRemuxer.BaseRemuxer.toMS(delta))) < 600) {
              if (delta) {
                // set DTS to next DTS
                // Log.debug(`Video/PTS/DTS adjusted: ${pts}->${Math.max(pts - delta, this.nextDts)}/${dts}->${this.nextDts},delta:${delta}`);
                dts = this.nextDts;
                // offset PTS as well, ensure that PTS is smaller or equal than new DTS
                pts = Math.max(pts - delta, dts);
              }
            } else {
              if (delta < 0) {
                Log.log("skip frame from the past at DTS=".concat(dts, " with expected DTS=").concat(this.nextDts));
                this.mp4track.len -= unit.getSize();
                continue;
              }
            }
          }
          // remember first DTS of our hevcSamples, ensure value is positive
          this.firstDTS = Math.max(0, dts);
        }
        mp4Sample = {
          size: unit.getSize(),
          duration: 0,
          cts: this.scaled(pts - dts),
          flags: {
            isLeading: 0,
            isDependedOn: 0,
            hasRedundancy: 0,
            degradPrio: 0,
            isNonSync: 0
          }
        };
        var flags = mp4Sample.flags;
        if (sample.unit.isKeyframe() === true) {
          // the current sample is a key frame
          flags.dependsOn = 2;
          flags.isDependedOn = 1;
          flags.isNonSync = 0;
        } else {
          flags.dependsOn = 1;
          flags.isDependedOn = 1;
          flags.isNonSync = 1;
        }
        payload.set(unit.getData(), offset);
        offset += unit.getSize();
        samples.push(mp4Sample);
        lastDTS = dts;
      }
      if (!samples.length) return null;
      /** Average duration for samples */
      var avgDuration = this.lastDurations.reduce(function (a, b) {
        return (a | 0) + (b | 0);
      }, 0) / (this.lastDurations.length || 1) | 0;
      if (samples.length >= 2) {
        this.lastSampleDuration = avgDuration;
        mp4Sample.duration = avgDuration;
      } else {
        mp4Sample.duration = this.lastSampleDuration;
      }
      if (samples.length && (!this.nextDts || navigator.userAgent.toLowerCase().indexOf("chrome") > -1)) {
        var _flags = samples[0].flags;
        // chrome workaround, mark first sample as being a Random Access Point to avoid sourcebuffer append issue
        // https://code.google.com/p/chromium/issues/detail?id=229412
        _flags.dependsOn = 2;
        _flags.isNonSync = 0;
      }

      // next HEVC sample DTS should be equal to last sample DTS + last sample duration
      this.nextDts = dts + this.unscaled(this.lastSampleDuration);
      // Log.debug(`next dts: ${this.nextDts}, last duration: ${this.lastSampleDuration}, last dts: ${dts}`);

      return new Uint8Array(payload.buffer, 0, this.mp4track.len);
    }
  }]);
  return H265Remuxer;
}(_baseRemuxer.BaseRemuxer);
},{"../utils/logger.js":"src/utils/logger.js","../parsers/h265.js":"src/parsers/h265.js","./base-remuxer.js":"src/remuxer/base-remuxer.js","../parsers/nalu-hevc.js":"src/parsers/nalu-hevc.js"}],"src/remuxer/remuxer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Remuxer = void 0;
var _event = require("../utils/event.js");
var _logger = require("../utils/logger.js");
var _mp4Generator = require("../iso-bmff/mp4-generator.js");
var _aac = require("./aac.js");
var _h = require("./h264.js");
var _h2 = require("./h265.js");
var _mse = require("../presentation/mse.js");
var _StreamDefine = require("../StreamDefine.js");
var _ASMediaError = require("../api/ASMediaError.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, catch: function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var LOG_TAG = "remuxer";
var Log = (0, _logger.getTagged)(LOG_TAG);
var Remuxer = exports.Remuxer = /*#__PURE__*/function () {
  function Remuxer(mediaElement) {
    _classCallCheck(this, Remuxer);
    this.mse = new _mse.MSE([mediaElement]);
    this.eventSource = new _event.EventEmitter();
    this.mseEventSource = new _event.EventSourceWrapper(this.mse.eventSource);
    this.mse_ready = true;
    this.reset();
    this.errorListener = this.mseError.bind(this);
    this.closeListener = this.mseClose.bind(this);
    this.errorDecodeListener = this.mseErrorDecode.bind(this);
    this.eventSource.addEventListener("ready", this.init.bind(this));
  }
  _createClass(Remuxer, [{
    key: "initMSEHandlers",
    value: function initMSEHandlers() {
      this.mseEventSource.on("error", this.errorListener);
      this.mseEventSource.on("sourceclosed", this.closeListener);
      this.mseEventSource.on("errordecode", this.errorDecodeListener);
    }
  }, {
    key: "reset",
    value: function () {
      var _reset = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              this.tracks = {};
              this.initialized = false;
              this.initSegments = {};
              this.codecs = [];
              this.streams = {};
              this.enabled = false;
              _context.next = 8;
              return this.mse.clear();
            case 8:
              this.initMSEHandlers();
            case 9:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function reset() {
        return _reset.apply(this, arguments);
      }
      return reset;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      this.mseEventSource.destroy();
      this.mse.destroy();
      this.mse = null;
      this.detachClient();
      this.eventSource.destroy();
    }
  }, {
    key: "onTracks",
    value: function onTracks(tracks) {
      var _this = this;
      Log.debug("ontracks: ", tracks.detail);
      // store available track types
      tracks.detail.forEach(function (track, key, tracks) {
        _this.tracks[track.type] = new Remuxer.TrackConverters[track.type](Remuxer.TrackTimescale[track.type], Remuxer.TrackScaleFactor[track.type], track.params);
        if (track.offset) {
          _this.tracks[track.type].timeOffset = track.offset;
        }
        if (track.duration) {
          _this.tracks[track.type].mp4track.duration = track.duration * (_this.tracks[track.type].timescale || Remuxer.TrackTimescale[track.type]);
          _this.tracks[track.type].duration = track.duration;
        } else {
          _this.tracks[track.type].duration = 1;
        }
      });
      // this.tracks[track.type].duration
      this.mse.setLive(!this.client.seekable);
    }
  }, {
    key: "setTimeOffset",
    value: function setTimeOffset(timeOffset, track) {
      if (this.tracks[track.type]) {
        this.tracks[track.type].timeOffset = timeOffset; ///this.tracks[track.type].scaleFactor;
      }
    }
  }, {
    key: "MSE",
    get: function get() {
      return this.mse;
    }
  }, {
    key: "init",
    value: function init() {
      var _this2 = this;
      var tracks = [];
      this.codecs = [];
      var initmse = [];
      var initPts = Infinity;
      var initDts = Infinity;
      var hasavc = true;
      for (var track_type in this.tracks) {
        var track = this.tracks[track_type];
        if (!_mse.MSE.isSupported([track.mp4track.codec])) {
          throw new Error("".concat(track.mp4track.type, " codec ").concat(track.mp4track.codec, " is not supported"));
        }
        tracks.push(track.mp4track);
        this.codecs.push(track.mp4track.codec);
        track.init(initPts, initDts /*, false*/);
        if (track.mp4track.type === "video") {
          if (track.mp4track.vps) {
            hasavc = false;
          }
        }
      }
      for (var _track_type in this.tracks) {
        var _track = this.tracks[_track_type];
        //track.init(initPts, initDts);
        this.initSegments[_track_type] = _mp4Generator.MP4.initSegment(hasavc, [_track.mp4track], _track.duration * _track.timescale, _track.timescale);
        initmse.push(this.initMSE(_track_type, _track.mp4track.codec));
      }
      this.initialized = true;
      return Promise.all(initmse).then(function () {
        //this.mse.play();
        _this2.enabled = true;
      });
    }
  }, {
    key: "initMSE",
    value: function initMSE(track_type, codec) {
      var _this3 = this;
      if (_mse.MSE.isSupported(this.codecs)) {
        return this.mse.setCodec(track_type, "".concat(_StreamDefine.PayloadType.map[track_type], "/mp4; codecs=\"").concat(codec, "\"")).then(function () {
          _this3.mse.feed(track_type, _this3.initSegments[track_type]);
          // this.mse.play();
          // this.enabled = true;
        });
      } else {
        this.eventSource.dispatchEvent("error", new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_DECODE, "Codecs:".concat(this.codecs, " are not supported")));
      }
    }
  }, {
    key: "mseError",
    value: function mseError(e) {
      this.eventSource.dispatchEvent("error", new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_DECODE, e));
    }
  }, {
    key: "mseClose",
    value: function mseClose() {
      this.eventSource.dispatchEvent("error", new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_DECODE, "mse closed!"));
    }
  }, {
    key: "mseErrorDecode",
    value: function mseErrorDecode() {
      if (this.tracks[2]) {
        console.warn(this.tracks[2].mp4track.type);
        this.mse.buffers[2].destroy();
        delete this.tracks[2];
      }
    }
  }, {
    key: "flush",
    value: function flush() {
      this.onSamples();
      if (!this.initialized) {
        // Log.debug(`Initialize...`);
        if (Object.keys(this.tracks).length) {
          for (var track_type in this.tracks) {
            if (!this.tracks[track_type].readyToDecode || !this.tracks[track_type].samples.length) return;
            Log.debug("Init MSE for track ".concat(this.tracks[track_type].mp4track.type));
          }
          this.eventSource.dispatchEvent("ready");
        }
      } else {
        for (var _track_type2 in this.tracks) {
          var track = this.tracks[_track_type2];
          var pay = track.getPayload();
          if (pay && pay.byteLength) {
            this.mse.feed(_track_type2, [_mp4Generator.MP4.moof(track.seq, track.scaled(track.firstDTS), track.mp4track), _mp4Generator.MP4.mdat(pay)]);
            track.flush();
          }
        }
      }
    }
  }, {
    key: "onSamples",
    value: function onSamples(ev) {
      // TODO: check format
      // let data = ev.detail;
      // if (this.tracks[data.pay] && this.client.sampleQueues[data.pay].length) {
      // console.log(`video ${data.units[0].dts}`);
      for (var qidx in this.client.sampleQueues) {
        var queue = this.client.sampleQueues[qidx];
        while (queue.length) {
          var accessunit = queue.shift();
          if (this.tracks[qidx]) {
            if (accessunit.discontinuity) {
              Log.debug("discontinuity, dts:".concat(accessunit.dts));
              this.tracks[qidx].insertDscontinuity();
            }
            var _iterator = _createForOfIteratorHelper(accessunit.units),
              _step;
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var unit = _step.value;
                this.tracks[qidx].remux(unit);
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
          }
        }
      }
    }
  }, {
    key: "onAudioConfig",
    value: function onAudioConfig(ev) {
      if (this.tracks[ev.detail.pay]) {
        this.tracks[ev.detail.pay].setConfig(ev.detail.config);
      }
    }
  }, {
    key: "attachClient",
    value: function attachClient(client) {
      var _this4 = this;
      this.detachClient();
      this.client = client;
      this.clientEventSource = new _event.EventSourceWrapper(this.client.eventSource);
      this.clientEventSource.on("samples", this.samplesListener);
      this.clientEventSource.on("audio_config", this.audioConfigListener);
      this.clientEventSource.on("tracks", this.onTracks.bind(this));
      this.clientEventSource.on("flush", this.flush.bind(this));
      this.clientEventSource.on("clear", function () {
        _this4.reset();
        _this4.mse.clear().then(function () {
          //this.mse.play();
          _this4.initMSEHandlers();
        });
      });
    }
  }, {
    key: "detachClient",
    value: function detachClient() {
      if (this.client) {
        this.clientEventSource.destroy();
        // this.client.eventSource.removeEventListener('samples', this.onSamples.bind(this));
        // this.client.eventSource.removeEventListener('audio_config', this.onAudioConfig.bind(this));
        // // TODO: clear other listeners
        // this.client.eventSource.removeEventListener('clear', this._clearListener);
        // this.client.eventSource.removeEventListener('tracks', this._tracksListener);
        // this.client.eventSource.removeEventListener('flush', this._flushListener);
        this.client = null;
      }
    }
  }], [{
    key: "TrackConverters",
    get: function get() {
      return _defineProperty(_defineProperty(_defineProperty({}, _StreamDefine.PayloadType.H264, _h.H264Remuxer), _StreamDefine.PayloadType.H265, _h2.H265Remuxer), _StreamDefine.PayloadType.AAC, _aac.AACRemuxer);
    }
  }, {
    key: "TrackScaleFactor",
    get: function get() {
      return _defineProperty(_defineProperty(_defineProperty({}, _StreamDefine.PayloadType.H264, 1), _StreamDefine.PayloadType.H265, 1), _StreamDefine.PayloadType.AAC, 0);
    }
  }, {
    key: "TrackTimescale",
    get: function get() {
      return _defineProperty(_defineProperty(_defineProperty({}, _StreamDefine.PayloadType.H264, 90000), _StreamDefine.PayloadType.H265, 90000), _StreamDefine.PayloadType.AAC, 0);
    }
  }]);
  return Remuxer;
}();
},{"../utils/event.js":"src/utils/event.js","../utils/logger.js":"src/utils/logger.js","../iso-bmff/mp4-generator.js":"src/iso-bmff/mp4-generator.js","./aac.js":"src/remuxer/aac.js","./h264.js":"src/remuxer/h264.js","./h265.js":"src/remuxer/h265.js","../presentation/mse.js":"src/presentation/mse.js","../StreamDefine.js":"src/StreamDefine.js","../api/ASMediaError.js":"src/api/ASMediaError.js"}],"src/utils/url.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Url = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Url = exports.Url = /*#__PURE__*/function () {
  function Url() {
    _classCallCheck(this, Url);
  }
  _createClass(Url, null, [{
    key: "parse",
    value: function parse(url) {
      var ret = {};
      var urlparts = decodeURI(url).split(" ");
      url = urlparts.shift();
      ret.client = urlparts.join(" ");

      //protocol, login, urlpath
      var regex = /^([^:]+):\/\/([^\/]+)(.*)$/;
      var result = regex.exec(url);
      if (!result) {
        throw new Error("bad url");
      }
      ret.full = url;
      ret.protocol = result[1];
      ret.urlpath = result[3];
      var parts = ret.urlpath.split("/");
      ret.basename = parts.pop().split(/\?|#/)[0];
      ret.basepath = parts.join("/");
      var loginSplit = result[2].split("@");
      var hostport = loginSplit[0].split(":");
      var userpass = [null, null];
      if (loginSplit.length === 2) {
        userpass = loginSplit[0].split(":");
        hostport = loginSplit[1].split(":");
      }
      ret.user = userpass[0];
      ret.pass = userpass[1];
      ret.host = hostport[0];
      ret.auth = ret.user && ret.pass ? "".concat(ret.user, ":").concat(ret.pass) : "";
      ret.port = null == hostport[1] ? Url.protocolDefaultPort(ret.protocol) : hostport[1];
      ret.portDefined = null != hostport[1];
      ret.location = "".concat(ret.host, ":").concat(ret.port);
      if (ret.protocol === "unix") {
        ret.socket = ret.port;
        ret.port = undefined;
      }
      return ret;
    }
  }, {
    key: "full",
    value: function full(parsed) {
      return "".concat(parsed.protocol, "://").concat(parsed.location, "/").concat(parsed.urlpath);
    }
  }, {
    key: "isAbsolute",
    value: function isAbsolute(url) {
      return /^[^:]+:\/\//.test(url);
    }
  }, {
    key: "protocolDefaultPort",
    value: function protocolDefaultPort(protocol) {
      switch (protocol) {
        case "rtsp":
          return 554;
        case "http":
          return 80;
        case "https":
          return 443;
        default:
          return 0;
      }
    }
  }]);
  return Url;
}();
},{}],"src/utils/statemachine.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StateMachine = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var State = /*#__PURE__*/function () {
  function State(name, stateMachine) {
    _classCallCheck(this, State);
    this.stateMachine = stateMachine;
    this.transitions = new Set();
    this.name = name;
  }
  _createClass(State, [{
    key: "activate",
    value: function activate() {
      return Promise.resolve(null);
    }
  }, {
    key: "finishTransition",
    value: function finishTransition() {}
  }, {
    key: "failHandler",
    value: function failHandler() {}
  }, {
    key: "deactivate",
    value: function deactivate() {
      return Promise.resolve(null);
    }
  }]);
  return State;
}();
var StateMachine = exports.StateMachine = /*#__PURE__*/function () {
  function StateMachine() {
    _classCallCheck(this, StateMachine);
    this.storage = {};
    this.currentState = null;
    this.states = new Map();
  }
  _createClass(StateMachine, [{
    key: "addState",
    value: function addState(name, _ref) {
      var activate = _ref.activate,
        finishTransition = _ref.finishTransition,
        deactivate = _ref.deactivate;
      var state = new State(name, this);
      if (activate) state.activate = activate;
      if (finishTransition) state.finishTransition = finishTransition;
      if (deactivate) state.deactivate = deactivate;
      this.states.set(name, state);
      return this;
    }
  }, {
    key: "addTransition",
    value: function addTransition(fromName, toName) {
      if (!this.states.has(fromName)) {
        throw ReferenceError("No such state: ".concat(fromName, " while connecting to ").concat(toName));
      }
      if (!this.states.has(toName)) {
        throw ReferenceError("No such state: ".concat(toName, " while connecting from ").concat(fromName));
      }
      this.states.get(fromName).transitions.add(toName);
      return this;
    }
  }, {
    key: "_promisify",
    value: function _promisify(res) {
      var promise;
      try {
        promise = res;
        if (!promise.then) {
          promise = Promise.resolve(promise);
        }
      } catch (e) {
        promise = Promise.reject(e);
      }
      return promise;
    }
  }, {
    key: "transitionTo",
    value: function transitionTo(stateName) {
      var _this = this;
      /// console.log(`StateMachine change state:${stateName}`);
      if (this.currentState == null) {
        var state = this.states.get(stateName);
        return this._promisify(state.activate.call(this)).then(function (data) {
          _this.currentState = state;
          return data;
        }).then(state.finishTransition.bind(this)).catch(function (e) {
          state.failHandler();
          throw e;
        });
      }
      if (this.currentState.name === stateName) return Promise.resolve();
      if (this.currentState.transitions.has(stateName)) {
        var _state = this.states.get(stateName);
        return this._promisify(this.currentState.deactivate.call(this)).then(_state.activate.bind(this)).then(function (data) {
          /// console.log(`StateMachine set current state:${stateName}`);
          _this.currentState = _state;
          return data;
        }).then(_state.finishTransition.bind(this)).catch(function (e) {
          //console.log(e);
          _state.failHandler();
          throw e;
        });
      } else {
        return Promise.reject("No such transition: ".concat(this.currentState.name, " to ").concat(stateName));
      }
    }
  }]);
  return StateMachine;
}();
},{}],"src/rtsp/sdp.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SDPParser = void 0;
var _logger = require("../utils/logger.js");
var _StreamDefine = require("../StreamDefine.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Log = (0, _logger.getTagged)("parser:sdp");
var SDPParser = exports.SDPParser = /*#__PURE__*/function () {
  function SDPParser() {
    _classCallCheck(this, SDPParser);
    this.version = -1;
    this.origin = null;
    this.sessionName = null;
    this.timing = null;
    this.sessionBlock = {};
    this.media = {};
    this.tracks = {};
    this.mediaMap = {};
  }
  _createClass(SDPParser, [{
    key: "parse",
    value: function parse(content) {
      var _this = this;
      // Log.debug(content);
      return new Promise(function (resolve, reject) {
        var dataString = content;
        var success = true;
        var currentMediaBlock = _this.sessionBlock;

        // TODO: multiple audio/video tracks
        var _iterator = _createForOfIteratorHelper(dataString.split("\n")),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var line = _step.value;
            line = line.replace(/\r/, "");
            if (0 === line.length) {
              /* Empty row (last row perhaps?), skip to next */
              continue;
            }
            switch (line.charAt(0)) {
              case "v":
                if (-1 !== _this.version) {
                  Log.log("Version present multiple times in SDP");
                  reject();
                  return false;
                }
                success = success && _this._parseVersion(line);
                break;
              case "o":
                if (null !== _this.origin) {
                  Log.log("Origin present multiple times in SDP");
                  reject();
                  return false;
                }
                success = success && _this._parseOrigin(line);
                break;
              case "s":
                if (null !== _this.sessionName) {
                  Log.log("Session Name present multiple times in SDP");
                  reject();
                  return false;
                }
                success = success && _this._parseSessionName(line);
                break;
              case "t":
                if (null !== _this.timing) {
                  Log.log("Timing present multiple times in SDP");
                  reject();
                  return false;
                }
                success = success && _this._parseTiming(line);
                break;
              case "m":
                if (null !== currentMediaBlock && _this.sessionBlock !== currentMediaBlock) {
                  /* Complete previous block and store it */
                  _this.media[currentMediaBlock.type] = currentMediaBlock;
                }

                /* A wild media block appears */
                currentMediaBlock = {};
                currentMediaBlock.rtpmap = {};
                success = success && _this._parseMediaDescription(line, currentMediaBlock);
                break;
              case "a":
                success = success && SDPParser._parseAttribute(line, currentMediaBlock);
                break;
              default:
                Log.log("Ignored unknown SDP directive: " + line);
                break;
            }
            if (!success) {
              reject();
              return;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        _this.media[currentMediaBlock.type] = currentMediaBlock;
        success ? resolve() : reject();
      });
    }

    /** v=0 */
  }, {
    key: "_parseVersion",
    value: function _parseVersion(line) {
      var matches = line.match(/^v=([0-9]+)$/);
      if (!matches || !matches.length) {
        Log.log("'v=' (Version) formatted incorrectly: " + line);
        return false;
      }
      this.version = matches[1];
      if (0 != this.version) {
        Log.log("Unsupported SDP version:" + this.version);
        return false;
      }
      return true;
    }

    /**  o=<username> <sess-id> <sess-version> <nettype> <addrtype>
          <unicast-address>
    */
  }, {
    key: "_parseOrigin",
    value: function _parseOrigin(line) {
      var matches = line.match(/^o=([^ ]+) (-?[0-9]+) (-?[0-9]+) (IN) (IP4|IP6) ([^ ]+)$/);
      if (!matches || !matches.length) {
        Log.log("'o=' (Origin) formatted incorrectly: " + line);
        return false;
      }
      this.origin = {};
      this.origin.username = matches[1];
      this.origin.sessionid = matches[2];
      this.origin.sessionversion = matches[3];
      this.origin.nettype = matches[4];
      this.origin.addresstype = matches[5];
      this.origin.unicastaddress = matches[6];
      return true;
    }

    /** s=<session name> */
  }, {
    key: "_parseSessionName",
    value: function _parseSessionName(line) {
      var matches = line.match(/^s=([^\r\n]+)$/);
      if (!matches || !matches.length) {
        Log.log("'s=' (Session Name) formatted incorrectly: " + line);
        return false;
      }
      this.sessionName = matches[1];
      return true;
    }

    /** t=<start-time> <stop-time> */
  }, {
    key: "_parseTiming",
    value: function _parseTiming(line) {
      var matches = line.match(/^t=([0-9]+) ([0-9]+)$/);
      if (!matches || !matches.length) {
        Log.log("'t=' (Timing) formatted incorrectly: " + line);
        return false;
      }
      this.timing = {};
      this.timing.start = matches[1];
      this.timing.stop = matches[2];
      return true;
    }

    /** m=<media> <port> <proto> <fmt> ... */
  }, {
    key: "_parseMediaDescription",
    value: function _parseMediaDescription(line, media) {
      var matches = line.match(/^m=([^ ]+) ([^ ]+) ([^ ]+)[ ]/);
      if (!matches || !matches.length) {
        Log.log("'m=' (Media) formatted incorrectly: " + line);
        return false;
      }
      media.type = matches[1];
      if (!["video", "audio", "text", "application"].includes(media.type)) {
        throw new Error("Invalid sdp Media Descriptions:".concat(line));
      }
      media.port = matches[2];
      media.proto = matches[3];
      media.fmt = line.substr(matches[0].length).split(" ").map(function (fmt, index, array) {
        return parseInt(fmt, 10);
      });
      var _iterator2 = _createForOfIteratorHelper(media.fmt),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var fmt = _step2.value;
          this.mediaMap[fmt] = media;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return true;
    }
  }, {
    key: "getSessionBlock",
    value: function getSessionBlock() {
      return this.sessionBlock;
    }
  }, {
    key: "hasMedia",
    value: function hasMedia(mediaType) {
      return this.media[mediaType] !== undefined;
    }
  }, {
    key: "getMediaBlock",
    value: function getMediaBlock(mediaType) {
      return this.media[mediaType];
    }
  }, {
    key: "getMediaBlockByPayloadType",
    value: function getMediaBlockByPayloadType(pt) {
      // for (var m in this.media) {
      //     if (-1 !== this.media[m].fmt.indexOf(pt)) {
      //         return this.media[m];
      //     }
      // }
      return this.mediaMap[pt] || null;

      //ErrorManager.dispatchError(826, [pt], true);
      // Log.error(`failed to find media with payload type ${pt}`);
      //
      // return null;
    }
  }, {
    key: "getMediaBlockList",
    value: function getMediaBlockList() {
      var res = [];
      for (var m in this.media) {
        res.push(m);
      }
      return res;
    }
  }], [{
    key: "_parseAttribute",
    value: function _parseAttribute(line, media) {
      if (null === media) {
        /* Not in a media block, can't be bothered parsing attributes for session */
        return true;
      }
      var matches;
      /* Used for some cases of below switch-case */
      var separator = line.indexOf(":");
      var attribute = line.substr(0, -1 === separator ? 0x7fffffff : separator);
      /* 0x7FF.. is default */

      switch (attribute) {
        case "a=recvonly":
        case "a=sendrecv":
        case "a=sendonly":
        case "a=inactive":
          media.mode = line.substr("a=".length);
          break;
        case "a=range":
          matches = line.match(/^a=range:\s*([a-zA-Z-]+)=([0-9.]+|now)\s*-\s*([0-9.]*)$/);
          media.range = [Number(matches[2] === "now" ? -1 : matches[2]), Number(matches[3]), matches[1]];
          break;
        case "a=control":
          media.control = line.substr("a=control:".length);
          break;
        case "a=rtpmap":
          matches = line.match(/^a=rtpmap:(\d+) (.*)$/);
          if (null === matches) {
            Log.log("Could not parse 'rtpmap' of 'a='");
            return false;
          }
          var payload = parseInt(matches[1], 10);
          media.rtpmap[payload] = {};
          var attrs = matches[2].split("/");
          media.rtpmap[payload].name = attrs[0].toUpperCase();
          media.rtpmap[payload].clock = attrs[1];
          if (undefined !== attrs[2]) {
            media.rtpmap[payload].encparams = attrs[2];
          }
          media.ptype = _StreamDefine.PayloadType.string_map[attrs[0].toUpperCase()];
          break;
        case "a=fmtp":
          matches = line.match(/^a=fmtp:(\d+) (.*)$/);
          if (0 === matches.length) {
            Log.log("Could not parse 'fmtp'  of 'a='");
            return false;
          }
          media.fmtp = {};
          var _iterator3 = _createForOfIteratorHelper(matches[2].split(";")),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var param = _step3.value;
              var idx = param.indexOf("=");
              media.fmtp[param.substr(0, idx).toLowerCase().trim()] = param.substr(idx + 1).trim();
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
          break;
        default:
          break;
      }
      return true;
    }
  }]);
  return SDPParser;
}();
},{"../utils/logger.js":"src/utils/logger.js","../StreamDefine.js":"src/StreamDefine.js"}],"src/rtsp/RTSPTrackStream.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RTSPTrackStream = void 0;
var _logger = require("../utils/logger.js");
var _RTSPClient = require("./RTSPClient.js");
var _url = require("../utils/url.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var LOG_TAG = "rtsp:stream";
var Log = (0, _logger.getTagged)(LOG_TAG);
var RTSPTrackStream = exports.RTSPTrackStream = /*#__PURE__*/function () {
  function RTSPTrackStream(client, track) {
    _classCallCheck(this, RTSPTrackStream);
    this.state = null;
    this.client = client;
    this.track = track;
    this.rtpChannel = 1;
    this.stopKeepAlive();
    this.keepaliveInterval = null;
    this.keepaliveTime = 30000;
  }
  _createClass(RTSPTrackStream, [{
    key: "reset",
    value: function reset() {
      Log.debug("reset!!!");
      this.stopKeepAlive();
      this.client.forgetRTPChannel(this.rtpChannel);
      this.client = null;
      this.track = null;
    }
  }, {
    key: "start",
    value: function start() {
      var _this = this;
      var lastSetupPromise = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (lastSetupPromise != null) {
        // if a setup was already made, use the same session
        return lastSetupPromise.then(function (obj) {
          return _this.sendSetup(obj.session);
        });
      } else {
        return this.sendSetup();
      }
    }
  }, {
    key: "stop",
    value: function stop() {}
  }, {
    key: "getSetupURL",
    value: function getSetupURL(track) {
      var sessionBlock = this.client.sdp.getSessionBlock();
      if (_url.Url.isAbsolute(track.control)) {
        return track.control;
      } else if (_url.Url.isAbsolute("".concat(sessionBlock.control).concat(track.control))) {
        return "".concat(sessionBlock.control).concat(track.control);
      } else if (_url.Url.isAbsolute("".concat(this.client.contentBase).concat(track.control))) {
        /* Check the end of the address for a separator */
        if (this.client.contentBase[this.client.contentBase.length - 1] !== "/") {
          return "".concat(this.client.contentBase, "/").concat(track.control);
        }

        /* Should probably check session level control before this */
        return "".concat(this.client.contentBase).concat(track.control);
      } else {
        //need return default
        return track.control;
      }
    }
  }, {
    key: "getControlURL",
    value: function getControlURL() {
      var ctrl = this.client.sdp.getSessionBlock().control;
      if (_url.Url.isAbsolute(ctrl)) {
        return ctrl;
      } else if (!ctrl || "*" === ctrl) {
        return this.client.contentBase;
      } else {
        return "".concat(this.client.contentBase).concat(ctrl);
      }
    }
  }, {
    key: "sendKeepalive",
    value: function sendKeepalive() {
      if (this.client.methods.includes("GET_PARAMETER")) {
        return this.client.sendRequest("GET_PARAMETER", this.getSetupURL(this.track), {
          Session: this.session
        });
      } else {
        return this.client.sendRequest("OPTIONS", "*");
      }
    }
  }, {
    key: "stopKeepAlive",
    value: function stopKeepAlive() {
      clearInterval(this.keepaliveInterval);
    }
  }, {
    key: "startKeepAlive",
    value: function startKeepAlive() {
      var _this2 = this;
      this.keepaliveInterval = setInterval(function () {
        _this2.sendKeepalive().catch(function (e) {
          Log.error(e);
          if (e instanceof _RTSPClient.RTSPError) {
            if (Number(e.data.parsed.code) === 501) {
              return;
            }
          }
        });
      }, this.keepaliveTime);
    }
  }, {
    key: "sendRequest",
    value: function sendRequest(_cmd) {
      var _params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var params = {};
      if (this.session) {
        params["Session"] = this.session;
      }
      Object.assign(params, _params);
      return this.client.sendRequest(_cmd, this.getControlURL(), params);
    }
  }, {
    key: "sendSetup",
    value: function sendSetup() {
      var _this3 = this;
      var session = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      Log.log("send setup");
      this.state = _RTSPClient.RTSPClientSM.STATE_SETUP;
      this.rtpChannel = this.client.interleaveChannelIndex;
      var interleavedChannels = this.client.interleaveChannelIndex++ + "-" + this.client.interleaveChannelIndex++;
      var params = {
        Transport: "RTP/AVP/TCP;unicast;interleaved=".concat(interleavedChannels),
        Date: new Date().toUTCString()
      };
      if (session) {
        params.Session = session;
      }
      return this.client.sendRequest("SETUP", this.getSetupURL(this.track), params).then(function (_data) {
        _this3.session = _data.headers["session"];
        var transport = _data.headers["transport"];
        if (transport) {
          var interleaved = transport.match(/interleaved=([0-9]+)-([0-9]+)/)[1];
          if (interleaved) {
            _this3.rtpChannel = Number(interleaved);
          }
        }
        var sessionParamsChunks = _this3.session.split(";").slice(1);
        var sessionParams = {};
        var _iterator = _createForOfIteratorHelper(sessionParamsChunks),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var chunk = _step.value;
            var kv = chunk.split("=");
            sessionParams[kv[0]] = kv[1];
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        if (sessionParams["timeout"]) {
          _this3.keepaliveInterval = Number(sessionParams["timeout"]) * 500; // * 1000 / 2
        }

        Log.debug("add rtp channel:".concat(_this3.rtpChannel));
        _this3.client.useRTPChannel(_this3.rtpChannel);
        _this3.startKeepAlive();
        return {
          track: _this3.track,
          data: _data,
          session: _this3.session
        };
      });
    }
  }]);
  return RTSPTrackStream;
}();
},{"../utils/logger.js":"src/utils/logger.js","./RTSPClient.js":"src/rtsp/RTSPClient.js","../utils/url.js":"src/utils/url.js"}],"src/utils/md5.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = md5;
/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
* Add integers, wrapping at 2^32. This uses 16-bit operations internally
* to work around bugs in some JS interpreters.
*/
function safeAdd(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xFFFF;
}

/*
* Bitwise rotate a 32-bit number to the left.
*/
function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}

/*
* These functions implement the four basic operations the algorithm uses.
*/
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

/*
* Calculate the MD5 of an array of little-endian words, and a bit length.
*/
function binlMD5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[(len + 64 >>> 9 << 4) + 14] = len;
  var i;
  var olda;
  var oldb;
  var oldc;
  var oldd;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;
  for (i = 0; i < x.length; i += 16) {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}

/*
* Convert an array of little-endian words to a string
*/
function binl2rstr(input) {
  var i;
  var output = '';
  var length32 = input.length * 32;
  for (i = 0; i < length32; i += 8) {
    output += String.fromCharCode(input[i >> 5] >>> i % 32 & 0xFF);
  }
  return output;
}

/*
* Convert a raw string to an array of little-endian words
* Characters >255 have their high-byte silently ignored.
*/
function rstr2binl(input) {
  var i;
  var output = [];
  output[(input.length >> 2) - 1] = undefined;
  for (i = 0; i < output.length; i += 1) {
    output[i] = 0;
  }
  var length8 = input.length * 8;
  for (i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << i % 32;
  }
  return output;
}

/*
* Calculate the MD5 of a raw string
*/
function rstrMD5(s) {
  return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
}

/*
* Calculate the HMAC-MD5, of a key and some data (raw strings)
*/
function rstrHMACMD5(key, data) {
  var i;
  var bkey = rstr2binl(key);
  var ipad = [];
  var opad = [];
  var hash;
  ipad[15] = opad[15] = undefined;
  if (bkey.length > 16) {
    bkey = binlMD5(bkey, key.length * 8);
  }
  for (i = 0; i < 16; i += 1) {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }
  hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  return binl2rstr(binlMD5(opad.concat(hash), 512 + 128));
}

/*
* Convert a raw string to a hex string
*/
function rstr2hex(input) {
  var hexTab = '0123456789abcdef';
  var output = '';
  var x;
  var i;
  for (i = 0; i < input.length; i += 1) {
    x = input.charCodeAt(i);
    output += hexTab.charAt(x >>> 4 & 0x0F) + hexTab.charAt(x & 0x0F);
  }
  return output;
}

/*
* Encode a string as utf-8
*/
function str2rstrUTF8(input) {
  return unescape(encodeURIComponent(input));
}

/*
* Take string arguments and return either raw or hex encoded strings
*/
function rawMD5(s) {
  return rstrMD5(str2rstrUTF8(s));
}
function hexMD5(s) {
  return rstr2hex(rawMD5(s));
}
function rawHMACMD5(k, d) {
  return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
}
function hexHMACMD5(k, d) {
  return rstr2hex(rawHMACMD5(k, d));
}
function md5(string, key, raw) {
  if (!key) {
    if (!raw) {
      return hexMD5(string);
    }
    return rawMD5(string);
  }
  if (!raw) {
    return hexHMACMD5(key, string);
  }
  return rawHMACMD5(key, string);
}
},{}],"src/rtsp/rtp.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _logger = require("../utils/logger.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } // TODO: asm.js
//rtp demuxer
/*The RTP header has the following format:                          */
/* 0                   1                   2                   3    */
/* 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1  */
/*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ */
/*|V=2|P|X|  CC   |M|     PT      |       sequence number         | */
/*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ */
/*|                           timestamp                           | */
/*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ */
/*|           synchronization source (SSRC) identifier            | */
/*+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ */
/*|            contributing source (CSRC) identifiers             | */
/*|                             ....                              | */
/*+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ */
var RTP = exports.default = /*#__PURE__*/function () {
  function RTP(pkt /*uint8array*/, sdp) {
    _classCallCheck(this, RTP);
    var bytes = new DataView(pkt.buffer, pkt.byteOffset, pkt.byteLength);
    this.version = bytes.getUint8(0) >>> 6;
    this.padding = (bytes.getUint8(0) & 0x20) >>> 5;
    this.has_extension = (bytes.getUint8(0) & 0x10) >>> 4;
    this.csrc = bytes.getUint8(0) & 0x0f;
    this.marker = bytes.getUint8(1) >>> 7;
    this.pt = bytes.getUint8(1) & 0x7f;
    this.sequence = bytes.getUint16(2);
    this.timestamp = bytes.getUint32(4);
    this.ssrc = bytes.getUint32(8);
    this.csrcs = [];
    var pktIndex = 12;
    if (this.csrc > 0) {
      this.csrcs.push(bytes.getUint32(pktIndex));
      pktIndex += 4;
    }
    if (this.has_extension === 1) {
      this.extension = bytes.getUint16(pktIndex);
      this.ehl = bytes.getUint16(pktIndex + 2);
      pktIndex += 4;
      this.header_data = pkt.slice(pktIndex, this.ehl);
      pktIndex += this.ehl;
    }
    this.headerLength = pktIndex;
    var padLength = 0;
    if (this.padding) {
      padLength = bytes.getUint8(pkt.byteLength - 1);
    }
    this.bodyLength = pkt.byteLength - this.headerLength - padLength;
    this.media = sdp.getMediaBlockByPayloadType(this.pt);
    if (null === this.media) {
      _logger.Log.error("Media description for payload type: ".concat(this.pt, " not provided."));
    } else {
      this.type = this.media.ptype; //PayloadType.string_map[this.media.rtpmap[this.media.fmt[0]].name];
    }

    this.data = pkt.subarray(pktIndex);
  }
  _createClass(RTP, [{
    key: "getPayload",
    value: function getPayload() {
      return this.data;
    }
  }, {
    key: "getTimestamp",
    value: function getTimestamp() {
      return this.timestamp;
    }
  }, {
    key: "toString",
    value: function toString() {
      return "RTP(" + "version:" + this.version + ", " + "padding:" + this.padding + ", " + "has_extension:" + this.has_extension + ", " + "csrc:" + this.csrc + ", " + "marker:" + this.marker + ", " + "pt:" + this.pt + ", " + "sequence:" + this.sequence + ", " + "timestamp:" + this.timestamp + ", " + "ssrc:" + this.ssrc + ")";
    }
  }, {
    key: "isVideo",
    value: function isVideo() {
      return this.media.type === "video";
    }
  }, {
    key: "isAudio",
    value: function isAudio() {
      return this.media.type === "audio";
    }
  }]);
  return RTP;
}();
},{"../utils/logger.js":"src/utils/logger.js"}],"src/rtsp/RTPFactory.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _rtp = _interopRequireDefault(require("./rtp.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var RTPFactory = exports.default = /*#__PURE__*/function () {
  function RTPFactory(sdp) {
    _classCallCheck(this, RTPFactory);
    this.tsOffsets = {};
    for (var pay in sdp.media) {
      var _iterator = _createForOfIteratorHelper(sdp.media[pay].fmt),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var pt = _step.value;
          this.tsOffsets[pt] = {
            last: 0,
            overflow: 0
          };
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }
  _createClass(RTPFactory, [{
    key: "build",
    value: function build(pkt /*uint8array*/, sdp) {
      var rtp = new _rtp.default(pkt, sdp);
      var tsOffset = this.tsOffsets[rtp.pt];
      if (tsOffset) {
        rtp.timestamp += tsOffset.overflow;
        if (tsOffset.last && Math.abs(rtp.timestamp - tsOffset.last) > 0x7fffffff) {
          console.log("\nlast ts: ".concat(tsOffset.last, "\n\n                            new ts: ").concat(rtp.timestamp, "\n\n                            new ts adjusted: ").concat(rtp.timestamp + 0xffffffff, "\n\n                            last overflow: ").concat(tsOffset.overflow, "\n\n                            new overflow: ").concat(tsOffset.overflow + 0xffffffff, "\n\n                            "));
          tsOffset.overflow += 0xffffffff;
          rtp.timestamp += 0xffffffff;
        }
        /*if (rtp.timestamp>0xffffffff) {
                  console.log(`ts: ${rtp.timestamp}, seq: ${rtp.sequence}`);
              }*/
        tsOffset.last = rtp.timestamp;
      }
      return rtp;
    }
  }]);
  return RTPFactory;
}();
},{"./rtp.js":"src/rtsp/rtp.js"}],"src/rtsp/RTSPMessage.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RTSPMessage = exports.MessageBuilder = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var RTSPMessage = exports.RTSPMessage = /*#__PURE__*/function () {
  function RTSPMessage(_rtsp_version) {
    _classCallCheck(this, RTSPMessage);
    this.version = _rtsp_version;
  }
  _createClass(RTSPMessage, [{
    key: "build",
    value: function build(_cmd, _host) {
      var _params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _payload = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var requestString = "".concat(_cmd, " ").concat(_host, " ").concat(this.version, "\r\n");
      for (var param in _params) {
        requestString += "".concat(param, ": ").concat(_params[param], "\r\n");
      }
      // TODO: binary payload
      if (_payload) {
        requestString += "Content-Length: ".concat(_payload.length, "\r\n");
      }
      requestString += "\r\n";
      if (_payload) {
        requestString += _payload;
      }
      return requestString;
    }
  }, {
    key: "parse",
    value: function parse(_data) {
      var lines = _data.split("\r\n");
      var parsed = {
        headers: {},
        body: null,
        code: 0,
        statusLine: ""
      };
      var match;
      var _lines$0$match = lines[0].match(new RegExp("".concat(this.version, "[ ]+([0-9]{3})[ ]+(.*)")));
      var _lines$0$match2 = _slicedToArray(_lines$0$match, 3);
      match = _lines$0$match2[0];
      parsed.code = _lines$0$match2[1];
      parsed.statusLine = _lines$0$match2[2];
      parsed.code = Number(parsed.code);
      var lineIdx = 1;
      while (lines[lineIdx]) {
        var _lines$lineIdx$split = lines[lineIdx].split(/:(.+)/),
          _lines$lineIdx$split2 = _slicedToArray(_lines$lineIdx$split, 2),
          k = _lines$lineIdx$split2[0],
          v = _lines$lineIdx$split2[1];
        parsed.headers[k.toLowerCase()] = v.trim();
        lineIdx++;
      }
      parsed.body = lines.slice(lineIdx).join("\n\r");
      return parsed;
    }
  }], [{
    key: "RTSP_1_0",
    get: function get() {
      return "RTSP/1.0";
    }
  }]);
  return RTSPMessage;
}();
var MessageBuilder = exports.MessageBuilder = new RTSPMessage(RTSPMessage.RTSP_1_0);
},{}],"src/MediaAccessunit.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MediaAccessunit = void 0;
var _StreamDefine = require("./StreamDefine.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var MediaAccessunit = exports.MediaAccessunit = /*#__PURE__*/function () {
  function MediaAccessunit(ctype, pts, dts, units) {
    _classCallCheck(this, MediaAccessunit);
    this.ctype = ctype;
    this.pts = pts;
    this.dts = dts;
    this.units = units;
    this.config = null;
    this.discontinuity = false;

    /// Properties defines
    Object.defineProperties(this, {
      byteLength: {
        get: function get() {
          var bytes = 0;
          var _iterator = _createForOfIteratorHelper(this.units),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var unit = _step.value;
              bytes += unit.getSize();
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          return bytes;
        }
      }
    });
  }
  _createClass(MediaAccessunit, [{
    key: "isKeyFrame",
    value: function isKeyFrame() {
      var f = false;
      if (this.ctype === _StreamDefine.PayloadType.H264 || this.ctype === _StreamDefine.PayloadType.H265) {
        var _iterator2 = _createForOfIteratorHelper(this.units),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var unit = _step2.value;
            if (unit.isKeyframe()) {
              f = true;
              break;
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      } else {
        f = true;
      }
      return f;
    }
  }], [{
    key: "dtsSortFunc",
    value: function dtsSortFunc(a, b) {
      return a.dts - b.dts;
    }
  }, {
    key: "ptsSortFunc",
    value: function ptsSortFunc(a, b) {
      return a.pts - b.pts;
    }
  }]);
  return MediaAccessunit;
}();
},{"./StreamDefine.js":"src/StreamDefine.js"}],"src/parsers/nalu-asm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NALUAsm = void 0;
var _logger = require("../utils/logger.js");
var _nalu = require("./nalu.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var LOG_TAG = "asm:avc";
var Log = (0, _logger.getTagged)(LOG_TAG);
// TODO: asm.js
var NALUAsm = exports.NALUAsm = /*#__PURE__*/function () {
  function NALUAsm() {
    _classCallCheck(this, NALUAsm);
    this.fragmented_nalu = null;
  }
  _createClass(NALUAsm, [{
    key: "parseSingleNALUPacket",
    value: function parseSingleNALUPacket(rawData, header, dts, pts) {
      return new _nalu.NALU(header.type, header.nri, rawData.subarray(0), dts, pts);
    }
  }, {
    key: "parseAggregationPacket",
    value: function parseAggregationPacket(rawData, header, dts, pts) {
      var data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);
      var nal_start_idx = 0;
      var don = null;
      if (_nalu.NALU.STAP_B === header.type) {
        don = data.getUint16(nal_start_idx);
        nal_start_idx += 2;
      }
      var ret = [];
      while (nal_start_idx < data.byteLength) {
        var size = data.getUint16(nal_start_idx);
        nal_start_idx += 2;
        var _header = NALUAsm.parseNALHeader(data.getInt8(nal_start_idx));
        nal_start_idx++;
        var nalu = this.parseSingleNALUPacket(rawData.subarray(nal_start_idx, nal_start_idx + size), _header, dts, pts);
        if (nalu !== null) {
          ret.push(nalu);
        }
        nal_start_idx += size;
      }
      return ret;
    }
  }, {
    key: "parseFragmentationUnit",
    value: function parseFragmentationUnit(rawData, header, dts, pts) {
      var data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);
      var nal_start_idx = 0;
      var fu_header = data.getUint8(nal_start_idx);
      var is_start = (fu_header & 0x80) >>> 7;
      var is_end = (fu_header & 0x40) >>> 6;
      var payload_type = fu_header & 0x1f;
      var ret = null;
      nal_start_idx++;
      var don = 0;
      if (_nalu.NALU.FU_B === header.type) {
        don = data.getUint16(nal_start_idx);
        nal_start_idx += 2;
      }
      if (is_start) {
        this.fragmented_nalu = new _nalu.NALU(payload_type, header.nri, rawData.subarray(nal_start_idx), dts, pts);
      }
      if (this.fragmented_nalu && this.fragmented_nalu.ntype === payload_type) {
        if (!is_start) {
          this.fragmented_nalu.appendData(rawData.subarray(nal_start_idx));
        }
        if (is_end) {
          ret = this.fragmented_nalu;
          this.fragmented_nalu = null;
          return ret;
        }
      }
      return null;
    }
  }, {
    key: "onNALUFragment",
    value: function onNALUFragment(rawData, dts, pts) {
      var data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);
      var header = NALUAsm.parseNALHeader(data.getUint8(0));
      var nal_start_idx = 1;
      var unit = null;
      if (header.type > 0 && header.type < 24) {
        unit = this.parseSingleNALUPacket(rawData.subarray(nal_start_idx), header, dts, pts);
      } else if (_nalu.NALU.FU_A === header.type || _nalu.NALU.FU_B === header.type) {
        unit = this.parseFragmentationUnit(rawData.subarray(nal_start_idx), header, dts, pts);
      } else if (_nalu.NALU.STAP_A === header.type || _nalu.NALU.STAP_B === header.type) {
        return this.parseAggregationPacket(rawData.subarray(nal_start_idx), header, dts, pts);
      } else {
        /* 30 - 31 is undefined, ignore those (RFC3984). */
        Log.warn("Undefined NAL unit, type: " + header.type);
        return null;
      }
      if (unit) {
        return [unit];
      }
      return null;
    }
  }], [{
    key: "parseNALHeader",
    value: function parseNALHeader(hdr) {
      return {
        nri: hdr & 0x60,
        type: hdr & 0x1f
      };
    }
  }]);
  return NALUAsm;
}();
},{"../utils/logger.js":"src/utils/logger.js","./nalu.js":"src/parsers/nalu.js"}],"src/parsers/nalu-asm-hevc.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NALUAsmHevc = void 0;
var _logger = require("../utils/logger.js");
var _naluHevc = require("./nalu-hevc.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var LOG_TAG = "asm:hevc";
var Log = (0, _logger.getTagged)(LOG_TAG);
// TODO: asm.js
var NALUAsmHevc = exports.NALUAsmHevc = /*#__PURE__*/function () {
  function NALUAsmHevc() {
    _classCallCheck(this, NALUAsmHevc);
    this.fragmented_nalu = null;
  }
  _createClass(NALUAsmHevc, [{
    key: "parseSingleNALUPacket",
    value: function parseSingleNALUPacket(rawData, header, dts, pts) {
      return new _naluHevc.HEVC_NALU(header.type, header.layerid, header.tid, rawData.subarray(0), dts, pts);
    }
  }, {
    key: "parseAggregationPacket",
    value: function parseAggregationPacket(rawData, header, dts, pts) {
      var data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);
      var nal_start_idx = 0;
      /**
          let don = null;
          if (HEVC_NALU.STAP === header.type) {
              don = data.getUint16(nal_start_idx);
              nal_start_idx += 2;
          }
          */
      var ret = [];
      while (nal_start_idx < data.byteLength) {
        var size = data.getUint16(nal_start_idx);
        nal_start_idx += 2;
        var _header = NALUAsmHevc.parseNALHeader(data.getUint16(nal_start_idx));
        nal_start_idx++;
        var nalu = this.parseSingleNALUPacket(rawData.subarray(nal_start_idx, nal_start_idx + size), _header, dts, pts);
        if (nalu !== null) {
          ret.push(nalu);
        }
        nal_start_idx += size;
      }
      return ret;
    }
  }, {
    key: "parseFragmentationUnit",
    value: function parseFragmentationUnit(rawData, header, dts, pts) {
      /* The FU header consists of an S bit, an E bit, and a 6-bit FuType
       *        field, as shown in Figure 10.
       *        +---------------+
       *        |0|1|2|3|4|5|6|7|
       *        +-+-+-+-+-+-+-+-+
       *        |S|E|  FuType   |
       *        +---------------+
       *        Figure 10: The Structure of FU Header
       */
      var data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);
      var nal_start_idx = 0;
      var fu_header = data.getUint8(nal_start_idx);
      var is_start = (fu_header & 0x80) >>> 7;
      var is_end = (fu_header & 0x40) >>> 6;
      var payload_type = fu_header & 0x3f;
      var ret = null;
      nal_start_idx++;
      if (is_start) {
        this.fragmented_nalu = new _naluHevc.HEVC_NALU(payload_type, header.layerid, header.tid, rawData.subarray(nal_start_idx), dts, pts);
      }
      if (this.fragmented_nalu && this.fragmented_nalu.ntype === payload_type) {
        if (!is_start) {
          this.fragmented_nalu.appendData(rawData.subarray(nal_start_idx));
        }
        if (is_end) {
          ret = this.fragmented_nalu;
          this.fragmented_nalu = null;
          return ret;
        }
      }
      return null;
    }
  }, {
    key: "onNALUFragment",
    value: function onNALUFragment(rawData, dts, pts) {
      var data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);
      var header = NALUAsmHevc.parseNALHeader(data.getUint16(0));
      var nal_start_idx = 2;
      var unit = null;
      if (header.type >= 1 && header.type <= 47) {
        unit = this.parseSingleNALUPacket(rawData.subarray(nal_start_idx), header, dts, pts);
      } else if (_naluHevc.HEVC_NALU.FU === header.type) {
        unit = this.parseFragmentationUnit(rawData.subarray(nal_start_idx), header, dts, pts);
      } else if (_naluHevc.HEVC_NALU.STAP === header.type) {
        return this.parseAggregationPacket(rawData.subarray(nal_start_idx), header, dts, pts);
      } else {
        /* 30 - 31 is undefined, ignore those (RFC3984). */
        Log.warn("Undefined NAL unit, type: " + header.type);
        return null;
      }
      if (unit) {
        return [unit];
      }
      return null;
    }
  }], [{
    key: "parseNALHeader",
    value: function parseNALHeader(hdr) {
      /*        HEVC nalu playload header
       *        +---------------+---------------+
       *        |0|1|2|3|4|5|6|7|0|1|2|3|4|5|6|7|
       *        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       *        |F|   Type    |  LayerId  | TID |
       *        +-------------+-----------------+
       *        Figure 1: The Structure of the HEVC NAL Unit Header
       */
      return {
        type: hdr >>> 9 & 0x3f,
        layerid: hdr >>> 3 & 0x3f,
        tid: hdr & 0x07
      };
    }
  }]);
  return NALUAsmHevc;
}();
},{"../utils/logger.js":"src/utils/logger.js","./nalu-hevc.js":"src/parsers/nalu-hevc.js"}],"src/parsers/audio-frame.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AudioFrame = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var AudioFrame = exports.AudioFrame = /*#__PURE__*/function () {
  function AudioFrame(data, dts, pts) {
    _classCallCheck(this, AudioFrame);
    this.dts = dts;
    this.pts = pts ? pts : this.dts;
    this.data = data; //.subarray(offset);
  }
  _createClass(AudioFrame, [{
    key: "getData",
    value: function getData() {
      return this.data;
    }
  }, {
    key: "getSize",
    value: function getSize() {
      return this.data.byteLength;
    }
  }]);
  return AudioFrame;
}();
},{}],"src/parsers/aac-asm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AACAsm = void 0;
var _audioFrame = require("./audio-frame.js");
var _binary = require("../utils/binary");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// TODO: asm.js
var AACAsm = exports.AACAsm = /*#__PURE__*/function () {
  function AACAsm() {
    _classCallCheck(this, AACAsm);
    this.config = null;
  }
  _createClass(AACAsm, [{
    key: "onAACFragment",
    value: function onAACFragment(pkt) {
      var rawData = pkt.getPayload();
      if (!pkt.media) {
        return null;
      }
      var data = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);
      var sizeLength = Number(pkt.media.fmtp["sizelength"] || 0);
      var indexLength = Number(pkt.media.fmtp["indexlength"] || 0);
      var indexDeltaLength = Number(pkt.media.fmtp["indexdeltalength"] || 0);
      var CTSDeltaLength = Number(pkt.media.fmtp["ctsdeltalength"] || 0);
      var DTSDeltaLength = Number(pkt.media.fmtp["dtsdeltalength"] || 0);
      var RandomAccessIndication = Number(pkt.media.fmtp["randomaccessindication"] || 0);
      var StreamStateIndication = Number(pkt.media.fmtp["streamstateindication"] || 0);
      var AuxiliaryDataSizeLength = Number(pkt.media.fmtp["auxiliarydatasizelength"] || 0);
      var configHeaderLength = sizeLength + Math.max(indexLength, indexDeltaLength) + CTSDeltaLength + DTSDeltaLength + RandomAccessIndication + StreamStateIndication + AuxiliaryDataSizeLength;
      var auHeadersLengthPadded = 0;
      var offset = 0;
      var ts = (Math.round(pkt.getTimestamp() / 1024) << 10) * 90000 / this.config.samplerate;
      if (0 !== configHeaderLength) {
        /* The AU header section is not empty, read it from payload */
        var auHeadersLengthInBits = data.getUint16(0); // Always 2 octets, without padding
        auHeadersLengthPadded = 2 + (auHeadersLengthInBits >>> 3) + (auHeadersLengthInBits & 0x7 ? 1 : 0); // Add padding

        // TODO: parse config
        var frames = [];
        var frameOffset = 0;
        var bits = new _binary.BitArray(rawData.subarray(2 + offset));
        var cts = 0;
        var dts = 0;
        for (var _offset = 0; _offset < auHeadersLengthInBits;) {
          var size = bits.readBits(sizeLength);
          var idx = bits.readBits(_offset ? indexDeltaLength : indexLength);
          _offset += sizeLength + (_offset ? indexDeltaLength : indexLength) /*+2*/;
          if ( /*ctsPresent &&*/CTSDeltaLength) {
            var ctsPresent = bits.readBits(1);
            cts = bits.readBits(CTSDeltaLength);
            _offset += CTSDeltaLength;
          }
          if ( /*dtsPresent && */DTSDeltaLength) {
            var dtsPresent = bits.readBits(1);
            dts = bits.readBits(DTSDeltaLength);
            _offset += CTSDeltaLength;
          }
          if (RandomAccessIndication) {
            bits.skipBits(1);
            _offset += 1;
          }
          if (StreamStateIndication) {
            bits.skipBits(StreamStateIndication);
            _offset += StreamStateIndication;
          }
          frames.push(new _audioFrame.AudioFrame(rawData.subarray(auHeadersLengthPadded + frameOffset, auHeadersLengthPadded + frameOffset + size), ts + dts, ts + cts));
          frameOffset += size;
        }
        return frames;
      } else {
        var aacData = rawData.subarray(auHeadersLengthPadded);
        while (true) {
          if (aacData[offset] !== 255) break;
          ++offset;
        }
        ++offset;
        return [new _audioFrame.AudioFrame(rawData.subarray(auHeadersLengthPadded + offset), ts)];
      }
    }
  }]);
  return AACAsm;
}();
},{"./audio-frame.js":"src/parsers/audio-frame.js","../utils/binary":"src/utils/binary.js"}],"src/parsers/pes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PESAsm = void 0;
var _binary = require("../utils/binary.js");
var _logger = require("../utils/logger.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var LOG_TAG = "parses:pes";
var Log = (0, _logger.getTagged)(LOG_TAG);
var PESAsm = exports.PESAsm = /*#__PURE__*/function () {
  function PESAsm(pid) {
    _classCallCheck(this, PESAsm);
    this.pid = pid;
    this.fragments = [];
    this.pesLength = 0;
    this.pesPkt = null;
  }
  _createClass(PESAsm, [{
    key: "parse",
    value: function parse(frag) {
      if (this.extPresent) {
        var ext = this.parseExtension(frag);
        ext.data = frag.subarray(ext.offset);
      } else {
        return null;
      }
    }

    /// Parse PES header
  }, {
    key: "parseHeader",
    value: function parseHeader() {
      var hdr = this.fragments[0];
      /// packet_start_code_prefix(24)
      var pesPrefix = (hdr[0] << 16) + (hdr[1] << 8) + hdr[2];
      /// stream_id (8)
      this.extPresent = ![0xbe, 0xbf].includes(hdr[3]);
      if (pesPrefix === 1) {
        /// PES_packet_length(16)
        var pesLength = (hdr[4] << 8) + hdr[5];
        /** Log.debug(
          `pid:${this.pid},pes length:${pesLength},this.pesLength:${this.pesLength}`
        ); */
        if (pesLength) {
          this.pesLength = pesLength;
          this.hasLength = true;
        } else {
          this.hasLength = false;
          this.pesPkt = null;
        }
        return true;
      }
      return false;
    }
  }, {
    key: "parseExtension",
    value: function parseExtension(frag) {
      var pesFlags, pesHdrLen, pesPts, pesDts, payloadStartOffset;
      pesFlags = frag[1];
      if (pesFlags & 0xc0) {
        /* PES header described here : http://dvd.sourceforge.net/dvdinfo/pes-hdr.html
                   as PTS / DTS is 33 bit we cannot use bitwise operator in JS,
                   as Bitwise operators treat their operands as a sequence of 32 bits */
        pesPts = (frag[3] & 0x0e) * 536870912 +
        // 1 << 29
        (frag[4] & 0xff) * 4194304 +
        // 1 << 22
        (frag[5] & 0xfe) * 16384 +
        // 1 << 14
        (frag[6] & 0xff) * 128 +
        // 1 << 7
        (frag[7] & 0xfe) / 2;
        // check if greater than 2^32 -1
        if (pesPts > 4294967295) {
          // decrement 2^33
          pesPts -= 8589934592;
        }
        if (pesFlags & 0x40) {
          pesDts = (frag[8] & 0x0e) * 536870912 +
          // 1 << 29
          (frag[9] & 0xff) * 4194304 +
          // 1 << 22
          (frag[10] & 0xfe) * 16384 +
          // 1 << 14
          (frag[11] & 0xff) * 128 +
          // 1 << 7
          (frag[12] & 0xfe) / 2;
          // check if greater than 2^32 -1
          if (pesDts > 4294967295) {
            // decrement 2^33
            pesDts -= 8589934592;
          }
        } else {
          pesDts = pesPts;
        }
        pesHdrLen = frag[2];
        payloadStartOffset = pesHdrLen + 9;

        // TODO: normalize pts/dts
        return {
          offset: payloadStartOffset,
          pts: pesPts,
          dts: pesDts
        };
      } else {
        return null;
      }
    }
  }, {
    key: "feed",
    value: function feed(frag, shouldParse) {
      var res = null;
      if (shouldParse && this.fragments.length) {
        if (!this.parseHeader()) {
          throw new Error("Invalid PES packet");
        }
        var offset = 6;
        var parsed = {};
        if (this.extPresent) {
          // TODO: make sure fragment have necessary length
          parsed = this.parseExtension(this.fragments[0].subarray(6));
          offset = parsed.offset;
        }
        if (!this.pesPkt) {
          this.pesPkt = new Uint8Array(this.pesLength);
        }
        var poffset = 0;
        while (this.pesLength && this.fragments.length) {
          var data = this.fragments.shift();
          if (offset) {
            if (data.byteLength < offset) {
              offset -= data.byteLength;
              continue;
            } else {
              data = data.subarray(offset);
              this.pesLength -= offset - (this.hasLength ? 6 : 0);
              offset = 0;
            }
          }
          this.pesPkt.set(data, poffset);
          poffset += data.byteLength;
          this.pesLength -= data.byteLength;
        }
        res = {
          data: this.pesPkt.subarray(0, poffset),
          pts: parsed.pts,
          dts: parsed.dts
        };
        /** Log.debug(
          `pid:${this.pid},This PES length:${this.pesLength}, length:${poffset}`
        ); */
      } else {
        this.pesPkt = null;
      }
      /** Log.debug(
        `feed pid:${this.pid},frag size:${frag.byteLength},shouldParse:${shouldParse}`
      ); */
      this.pesLength += frag.byteLength;
      if (this.fragments.length && this.fragments[this.fragments.length - 1].byteLength < 6) {
        /** Merge small buffer to a whole buffer */
        this.fragments[this.fragments.length - 1] = (0, _binary.appendByteArray)(this.fragments[this.fragments.length - 1], frag);
      } else {
        this.fragments.push(frag);
      }
      return res;
    }
  }], [{
    key: "PTSNormalize",
    value: function PTSNormalize(value, reference) {
      var offset;
      if (reference === undefined) {
        return value;
      }
      if (reference < value) {
        // - 2^33
        offset = -8589934592;
      } else {
        // + 2^33
        offset = 8589934592;
      }
      /* PTS is 33bit (from 0 to 2^33 -1)
           if diff between value and reference is bigger than half of the amplitude (2^32) then it means that
           PTS looping occured. fill the gap */
      while (Math.abs(value - reference) > 4294967296) {
        value += offset;
      }
      return value;
    }
  }]);
  return PESAsm;
}();
},{"../utils/binary.js":"src/utils/binary.js","../utils/logger.js":"src/utils/logger.js"}],"src/parsers/pes_h26x.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.H26XPES = void 0;
var _naluAsm = require("./nalu-asm.js");
var _naluAsmHevc = require("./nalu-asm-hevc.js");
var _binary = require("../utils/binary.js");
var _StreamDefine = require("../StreamDefine.js");
var _MediaAccessunit = require("../MediaAccessunit.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var H26XPES = exports.H26XPES = /*#__PURE__*/function () {
  function H26XPES(pesType) {
    _classCallCheck(this, H26XPES);
    console.log("Construct H26XPES, pesType:".concat(pesType));
    this.pesType = pesType;
    if (pesType === _StreamDefine.PESType.H264) {
      this.naluasm = new _naluAsm.NALUAsm();
    } else {
      this.naluasm = new _naluAsmHevc.NALUAsmHevc();
    }
    this.lastUnit = null;
  }
  _createClass(H26XPES, [{
    key: "parse",
    value: function parse(pes) {
      var array = pes.data;
      var i = 0,
        len = array.byteLength,
        value,
        overflow,
        state = 0;
      var units = [],
        lastUnitStart;
      while (i < len) {
        value = array[i++];
        // finding 3 or 4-byte start codes (00 00 01 OR 00 00 00 01)
        switch (state) {
          case 0:
            if (value === 0) {
              state = 1;
            }
            break;
          case 1:
            if (value === 0) {
              state = 2;
            } else {
              state = 0;
            }
            break;
          case 2:
          case 3:
            if (value === 0) {
              state = 3;
            } else if (value === 1 && i < len) {
              if (lastUnitStart) {
                var nalu = this.naluasm.onNALUFragment(array.subarray(lastUnitStart, i - state - 1), pes.dts, pes.dts);
                if (nalu) {
                  var _iterator = _createForOfIteratorHelper(nalu),
                    _step;
                  try {
                    for (_iterator.s(); !(_step = _iterator.n()).done;) {
                      var enalu = _step.value;
                      units.push(enalu);
                    }
                  } catch (err) {
                    _iterator.e(err);
                  } finally {
                    _iterator.f();
                  }
                }
              } else {
                // If NAL units are not starting right at the beginning of the PES packet, push preceding data into previous NAL unit.
                overflow = i - state - 1;
                if (overflow) {
                  if (this.lastUnit) {
                    this.lastUnit.data = (0, _binary.appendByteArray)(this.lastUnit.data.byteLength, array.subarray(0, overflow));
                  }
                }
              }
              lastUnitStart = i;
              state = 0;
            } else {
              state = 0;
            }
            break;
          default:
            break;
        }
      }
      if (lastUnitStart) {
        var _nalu = this.naluasm.onNALUFragment(array.subarray(lastUnitStart, len), pes.dts, pes.pts);
        if (_nalu) {
          var _iterator2 = _createForOfIteratorHelper(_nalu),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var _enalu = _step2.value;
              units.push(_enalu);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      }
      this.lastUnit = units[units.length - 1];
      return new _MediaAccessunit.MediaAccessunit(this.pesType === 0x1b ? _StreamDefine.PayloadType.H264 : _StreamDefine.PayloadType.H265, pes.dts, pes.dts, units);
    }
  }]);
  return H26XPES;
}();
},{"./nalu-asm.js":"src/parsers/nalu-asm.js","./nalu-asm-hevc.js":"src/parsers/nalu-asm-hevc.js","../utils/binary.js":"src/utils/binary.js","../StreamDefine.js":"src/StreamDefine.js","../MediaAccessunit.js":"src/MediaAccessunit.js"}],"src/parsers/aac.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AACParser = void 0;
var _binary = require("../utils/binary.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var AACParser = exports.AACParser = /*#__PURE__*/function () {
  function AACParser() {
    _classCallCheck(this, AACParser);
  }
  _createClass(AACParser, null, [{
    key: "SampleRates",
    get: function get() {
      return [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
    }

    // static Profile = [
    //     0: Null
    //     1: AAC Main
    //     2: AAC LC (Low Complexity)
    //     3: AAC SSR (Scalable Sample Rate)
    //     4: AAC LTP (Long Term Prediction)
    //     5: SBR (Spectral Band Replication)
    //     6: AAC Scalable
    // ]
  }, {
    key: "parseAudioSpecificConfig",
    value: function parseAudioSpecificConfig(bytesOrBits) {
      var config;
      if (bytesOrBits.byteLength) {
        // is byteArray
        config = new _binary.BitArray(bytesOrBits);
      } else {
        config = bytesOrBits;
      }
      var bitpos = config.bitpos + (config.src.byteOffset + config.bytepos) * 8;
      var prof = config.readBits(5);
      this.codec = "mp4a.40.".concat(prof);
      var sfi = config.readBits(4);
      if (sfi === 0xf) config.skipBits(24);
      var channels = config.readBits(4);
      return {
        config: (0, _binary.bitSlice)(new Uint8Array(config.src.buffer), bitpos, bitpos + 16),
        codec: "mp4a.40.".concat(prof),
        samplerate: AACParser.SampleRates[sfi],
        channels: channels
      };
    }
  }, {
    key: "parseStreamMuxConfig",
    value: function parseStreamMuxConfig(bytes) {
      // ISO_IEC_14496-3 Part 3 Audio. StreamMuxConfig
      var config = new _binary.BitArray(bytes);
      if (!config.readBits(1)) {
        config.skipBits(14);
        return AACParser.parseAudioSpecificConfig(config);
      }
    }
  }]);
  return AACParser;
}();
},{"../utils/binary.js":"src/utils/binary.js"}],"src/parsers/adts.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ADTS = void 0;
var _binary = require("../utils/binary.js");
var _aac = require("./aac.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ADTS = exports.ADTS = /*#__PURE__*/function () {
  function ADTS() {
    _classCallCheck(this, ADTS);
  }
  _createClass(ADTS, null, [{
    key: "parseHeader",
    value: function parseHeader(data) {
      var bits = new _binary.BitArray(data);
      bits.skipBits(15);
      var protectionAbs = bits.readBits(1);
      bits.skipBits(14);
      var len = bits.readBits(13);
      bits.skipBits(11);
      var cnt = bits.readBits(2);
      if (!protectionAbs) {
        /** skip checksum */
        bits.skipBits(16);
      }
      return {
        size: len - bits.bytepos,
        frameCount: cnt,
        offset: bits.bytepos
      };
    }
  }, {
    key: "parseHeaderConfig",
    value: function parseHeaderConfig(data) {
      var bits = new _binary.BitArray(data);
      bits.skipBits(15);
      var protectionAbs = bits.readBits(1);
      var profile = bits.readBits(2) + 1;
      var freq = bits.readBits(4);
      bits.skipBits(1);
      var channels = bits.readBits(3);
      bits.skipBits(4);
      var len = bits.readBits(13);
      bits.skipBits(11);
      var cnt = bits.readBits(2);
      if (!protectionAbs) {
        bits.skipBits(16);
      }
      var userAgent = navigator.userAgent.toLowerCase();
      var configLen = 4;
      var extSamplingIdx;

      // firefox: freq less than 24kHz = AAC SBR (HE-AAC)
      if (userAgent.indexOf("firefox") !== -1) {
        if (freq >= 6) {
          profile = 5;
          configLen = 4;
          // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
          // there is a factor 2 between frame sample rate and output sample rate
          // multiply frequency by 2 (see table below, equivalent to substract 3)
          extSamplingIdx = freq - 3;
        } else {
          profile = 2;
          configLen = 2;
          extSamplingIdx = freq;
        }
        // Android : always use AAC
      } else if (userAgent.indexOf("android") !== -1) {
        profile = 2;
        configLen = 2;
        extSamplingIdx = freq;
      } else {
        /**  for other browsers (chrome ...)
        /**  always force audio type to be HE-AAC SBR, as some browsers do not support audio codec switch properly (like Chrome ...)
        */
        profile = 5;
        configLen = 4;
        // if (manifest codec is HE-AAC or HE-AACv2) OR (manifest codec not specified AND frequency less than 24kHz)
        if (freq >= 6) {
          // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
          // there is a factor 2 between frame sample rate and output sample rate
          // multiply frequency by 2 (see table below, equivalent to substract 3)
          extSamplingIdx = freq - 3;
        } else {
          // if (manifest codec is AAC) AND (frequency less than 24kHz OR nb channel is 1) OR (manifest codec not specified and mono audio)
          // Chrome fails to play back with AAC LC mono when initialized with HE-AAC.  This is not a problem with stereo.
          if (channels === 1) {
            profile = 2;
            configLen = 2;
          }
          extSamplingIdx = freq;
        }
      }
      var config = new Uint8Array(configLen);
      config[0] = profile << 3;
      // samplingFrequencyIndex
      config[0] |= (freq & 0x0e) >> 1;
      config[1] |= (freq & 0x01) << 7;
      // channelConfiguration
      config[1] |= channels << 3;
      if (profile === 5) {
        // adtsExtensionSampleingIndex
        config[1] |= (extSamplingIdx & 0x0e) >> 1;
        config[2] = (extSamplingIdx & 0x01) << 7;
        // adtsObjectType (force to 2, chrome is checking that object type is less than 5 ???
        //    https://chromium.googlesource.com/chromium/src.git/+/master/media/formats/mp4/aac.cc
        config[2] |= 2 << 2;
        config[3] = 0;
      }
      return {
        config: {
          config: config,
          codec: "mp4a.40.".concat(profile),
          samplerate: _aac.AACParser.SampleRates[freq],
          channels: channels
        },
        size: len - bits.bytepos,
        frameCount: cnt,
        offset: bits.bytepos
      };
    }
  }]);
  return ADTS;
}();
},{"../utils/binary.js":"src/utils/binary.js","./aac.js":"src/parsers/aac.js"}],"src/parsers/aac_frame.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AACFrame = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var AACFrame = exports.AACFrame = /*#__PURE__*/function () {
  function AACFrame(data, dts, pts) {
    _classCallCheck(this, AACFrame);
    this.dts = dts;
    this.pts = pts ? pts : this.dts;
    this.data = data; //.subarray(offset);
  }
  _createClass(AACFrame, [{
    key: "getData",
    value: function getData() {
      return this.data;
    }
  }, {
    key: "getSize",
    value: function getSize() {
      return this.data.byteLength;
    }
  }]);
  return AACFrame;
}();
},{}],"src/parsers/pes_aac.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AACPES = void 0;
var _logger = require("../utils/logger.js");
var _adts = require("./adts.js");
var _StreamDefine = require("../StreamDefine.js");
var _MediaAccessunit = require("../MediaAccessunit.js");
var _aac_frame = require("./aac_frame.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var LOG_TAG = "parses:pes_aac";
var Log = (0, _logger.getTagged)(LOG_TAG);
var AACPES = exports.AACPES = /*#__PURE__*/function () {
  function AACPES(pesType) {
    _classCallCheck(this, AACPES);
    this.pesType = pesType;
    this.aacOverFlow = null;
    this.lastAacPTS = null;
    this.track = {};
    this.config = null;
  }
  _createClass(AACPES, [{
    key: "parse",
    value: function parse(pes) {
      var data = pes.data;
      var pts = pes.pts;
      var startOffset = 0;
      var aacOverFlow = this.aacOverFlow;
      var lastAacPTS = this.lastAacPTS;
      var frameDuration, frameIndex, offset, stamp, len;
      if (aacOverFlow) {
        var tmp = new Uint8Array(aacOverFlow.byteLength + data.byteLength);
        tmp.set(aacOverFlow, 0);
        tmp.set(data, aacOverFlow.byteLength);
        Log.debug("append overflowing ".concat(aacOverFlow.byteLength, " bytes to beginning of new PES"));
        data = tmp;
      }

      // look for ADTS header (0xFFFx)
      for (offset = startOffset, len = data.length; offset < len - 1; offset++) {
        if (data[offset] === 0xff && (data[offset + 1] & 0xf0) === 0xf0) {
          break;
        }
      }
      // if ADTS header does not start straight from the beginning of the PES payload, raise an error
      if (offset) {
        var reason, fatal;
        if (offset < len - 1) {
          reason = "PES did not start with ADTS header,offset:".concat(offset);
          fatal = false;
        } else {
          reason = "no ADTS header found in AAC PES";
          fatal = true;
        }
        Log.error(reason);
        if (fatal) {
          return;
        }
      }
      var hdr = null;
      var res = new _MediaAccessunit.MediaAccessunit(_StreamDefine.PayloadType.AAC, 0, 0, []);
      if (!this.config) {
        hdr = _adts.ADTS.parseHeaderConfig(data.subarray(offset));
        this.config = hdr.config;
        res.config = hdr.config;
        hdr.config = null;
        Log.debug("parsed codec:".concat(this.config.codec, ",rate:").concat(this.config.samplerate, ",nb channel:").concat(this.config.channels));
      }
      frameIndex = 0;
      frameDuration = 1024 * 90000 / this.config.samplerate;

      // if last AAC frame is overflowing, we should ensure timestamps are contiguous:
      // first sample PTS should be equal to last sample PTS + frameDuration
      if (aacOverFlow && lastAacPTS) {
        var newPTS = lastAacPTS + frameDuration;
        if (Math.abs(newPTS - pts) > 1) {
          Log.debug("align PTS for overlapping frames by ".concat(Math.round((newPTS - pts) / 90)));
          pts = newPTS;
        }
      }
      while (offset + 5 < len) {
        if (!hdr) {
          hdr = _adts.ADTS.parseHeader(data.subarray(offset));
        }
        /** Log.log(
          `pes size:${len}, aac header size:${hdr.size},offset:${hdr.offset}`
        ); */
        if (hdr.size > 0 && offset + hdr.offset + hdr.size <= len) {
          stamp = pts + frameIndex * frameDuration;
          res.pts = stamp;
          res.dts = stamp;
          res.units.push(new _aac_frame.AACFrame(data.subarray(offset + hdr.offset, offset + hdr.offset + hdr.size), stamp));
          offset += hdr.offset + hdr.size;
          frameIndex++;
          // look for ADTS header (0xFFFx)
          for (; offset < len - 1; offset++) {
            if (data[offset] === 0xff && (data[offset + 1] & 0xf0) === 0xf0) {
              hdr = null;
              break;
            }
          }
        } else {
          break;
        }
      }
      if (offset < len && data[offset] === 0xff) {
        // TODO: check it
        aacOverFlow = data.subarray(offset, len);
        Log.log("AAC: frame length:".concat(len, ", offset:").concat(offset, ", hdr size:").concat(hdr.size, ", hdr offset:").concat(hdr.offset, " overflow detected:").concat(len - offset));
      } else {
        aacOverFlow = null;
      }
      this.aacOverFlow = aacOverFlow;
      this.lastAacPTS = stamp;
      hdr = null;
      return res;
    }
  }]);
  return AACPES;
}();
},{"../utils/logger.js":"src/utils/logger.js","./adts.js":"src/parsers/adts.js","../StreamDefine.js":"src/StreamDefine.js","../MediaAccessunit.js":"src/MediaAccessunit.js","./aac_frame.js":"src/parsers/aac_frame.js"}],"src/parsers/pes_g7xx.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.G7XXPES = void 0;
var _audioFrame = require("./audio-frame.js");
var _StreamDefine = require("../StreamDefine.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var G7XXPES = exports.G7XXPES = /*#__PURE__*/function () {
  function G7XXPES(pesType) {
    _classCallCheck(this, G7XXPES);
    this.pesType = pesType;
    this.lastG7xxPTS = null;
    this.track = {};
  }
  _createClass(G7XXPES, [{
    key: "payloadType",
    value: function payloadType() {
      var pt = -1;
      switch (this.pesType) {
        case 0x90:
          pt = _StreamDefine.PayloadType.ALAW;
          break;
        case 0x91:
          pt = _StreamDefine.PayloadType.ULAW;
          break;
        case 0x92:
          pt = _StreamDefine.PayloadType.G726;
          break;
        case 0x93:
          pt = _StreamDefine.PayloadType.G723;
          break;
        case 0x99:
          pt = _StreamDefine.PayloadType.G729;
          break;
        default:
          throw new Error("Invalid G7XX pes type:".concat(this.pesType));
      }
      return pt;
    }
  }, {
    key: "parse",
    value: function parse(pes) {
      return {
        units: [new _audioFrame.AudioFrame(pes.data, pes.pts)],
        type: _StreamDefine.StreamType.AUDIO,
        pay: this.payloadType(this.pesType)
      };
    }
  }]);
  return G7XXPES;
}();
},{"./audio-frame.js":"src/parsers/audio-frame.js","../StreamDefine.js":"src/StreamDefine.js"}],"src/parsers/ts.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TSParser = void 0;
var _logger = require("../utils/logger.js");
var _binary = require("../utils/binary.js");
var _pes = require("./pes.js");
var _pes_h26x = require("./pes_h26x.js");
var _pes_aac = require("./pes_aac.js");
var _pes_g7xx = require("./pes_g7xx.js");
var _StreamDefine = require("../StreamDefine.js");
var _ASMediaError = require("../api/ASMediaError.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var LOG_TAG = "parses:ts";
var Log = (0, _logger.getTagged)(LOG_TAG);
var TSParser = exports.TSParser = /*#__PURE__*/function () {
  function TSParser() {
    _classCallCheck(this, TSParser);
    this.pmtParsed = false;
    this.pesParserTypes = new Map();
    this.pesParserTypes.set(_StreamDefine.PESType.AAC, _pes_aac.AACPES);
    this.pesParserTypes.set(_StreamDefine.PESType.H264, _pes_h26x.H26XPES);
    this.pesParserTypes.set(_StreamDefine.PESType.H265, _pes_h26x.H26XPES);
    this.pesParserTypes.set(_StreamDefine.PESType.PCMA, _pes_g7xx.G7XXPES);
    this.pesParserTypes.set(_StreamDefine.PESType.PCMU, _pes_g7xx.G7XXPES);
    this.pesParserTypes.set(_StreamDefine.PESType.G722, _pes_g7xx.G7XXPES);
    this.pesParserTypes.set(_StreamDefine.PESType.G723, _pes_g7xx.G7XXPES);
    this.pesParserTypes.set(_StreamDefine.PESType.G726, _pes_g7xx.G7XXPES);
    this.pesParserTypes.set(_StreamDefine.PESType.G729, _pes_g7xx.G7XXPES);
    this.pesParsers = new Map();
    this.pesAsms = {};
    this.ontracks = null;
    this.toSkip = 0;
    this.discontinuitys = new Map();
  }
  _createClass(TSParser, [{
    key: "reset",
    value: function reset() {
      this.pesParsers.clear();
      this.pesAsms = {};
      this.pmtParsed = false;
      this.toSkip = 0;
    }
  }, {
    key: "parse",
    value: function parse(packet) {
      var bits = new _binary.BitArray(packet);
      if (packet[0] === 0x47) {
        /// Ignore transport_error_indicator(1)
        bits.skipBits(9);
        /// payload_unit_start_indicator
        var payStart = bits.readBits(1);
        /// Ignore transport_priority(1)
        bits.skipBits(1);
        /// PID
        var pid = bits.readBits(13);
        /// Ignore transport_scrambling_control
        bits.skipBits(2);
        /// adaptation_field_control (2)
        var adaptation_field_control = bits.readBits(2);
        /// Ignore continuity_counter (4)
        bits.skipBits(4);
        if (adaptation_field_control === 3) {
          /// Parse Adaptation_field
          /// adaptation_field_length(8)
          var adaptSize = bits.readBits(8);
          if (adaptSize > 0 && payStart && pid > 0) {
            /// Parse discontinuity_indicator
            var discontinuity_indicator = bits.readBits(1);
            if (discontinuity_indicator > 0) {
              Log.debug("pid:".concat(pid, " discontinuity:").concat(discontinuity_indicator));
            }
            this.discontinuitys.set(pid, discontinuity_indicator ? true : false);
            /// No parse
            this.toSkip = bits.skipBits(adaptSize * 8 - 1);
          } else {
            this.toSkip = bits.skipBits(adaptSize * 8);
          }
          if (bits.finished()) {
            return null;
          }
        } else if (adaptation_field_control === 1) {
          this.discontinuitys.set(pid, false);
        }
        if (adaptation_field_control === 0 || adaptation_field_control === 2) {
          /// No pes
          Log.warn("No pes buffer!");
          return null;
        }

        /// Parse payload
        var payload = packet.subarray(bits.bytepos); //bitSlice(packet, bits.bitpos+bits.bytepos*8);

        if (this.pmtParsed && this.pesParsers.has(pid)) {
          var pes = this.pesAsms[pid].feed(payload, payStart);
          if (pes) {
            /// Log.debug(`pes buffer size:${pes.data.byteLength},pts:${pes.pts}`);
            var accessuint = this.pesParsers.get(pid).parse(pes);
            if (accessuint) {
              var discontinuity = this.discontinuitys.get(pid);
              if (discontinuity) {
                Log.debug("pes pid:".concat(pid, " accessunit length:").concat(accessuint.byteLength, ",discontinuity is true!"));
                accessuint.discontinuity = true;
              } else {
                accessuint.discontinuity = false;
              }
            }
            return accessuint;
          }
        } else {
          if (pid === 0) {
            /// Parse PAT
            this.pmtId = this.parsePAT(payload);
            Log.debug("pmtId:".concat(this.pmtId));
          } else if (pid === this.pmtId) {
            /// Parse PMT
            this.parsePMT(payload);
            this.pmtParsed = true;
          } else {
            Log.error("Invalid pid:".concat(pid));
            throw new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_AV, "Invalid pid:".concat(pid));
          }
        }
      } else {
        Log.error("Invalid ts packet, first byte must be 0x47!");
        throw new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_AV, "Invalid ts packet, first byte must be 0x47!");
      }
      return null;
    }
  }, {
    key: "parsePAT",
    value: function parsePAT(data) {
      var bits = new _binary.BitArray(data);
      var ptr = bits.readBits(8);
      bits.skipBits(8 * ptr + 83);
      return bits.readBits(13);
    }
  }, {
    key: "parsePMT",
    value: function parsePMT(data) {
      var bits = new _binary.BitArray(data);
      var ptr = bits.readBits(8);
      bits.skipBits(8 * ptr + 8);
      bits.skipBits(6);
      var secLen = bits.readBits(10);
      bits.skipBits(62);
      var pil = bits.readBits(10);
      bits.skipBits(pil * 8);
      var tracks = new Set();
      var readLen = secLen - 13 - pil;
      while (readLen > 0) {
        var pesType = bits.readBits(8);
        bits.skipBits(3);
        var pid = bits.readBits(13);
        bits.skipBits(6);
        var il = bits.readBits(10);
        bits.skipBits(il * 8);
        if ([_StreamDefine.PESType.AAC, _StreamDefine.PESType.PCMA, _StreamDefine.PESType.PCMU, _StreamDefine.PESType.G726, _StreamDefine.PESType.G723, _StreamDefine.PESType.G729, _StreamDefine.PESType.H264, _StreamDefine.PESType.H265].includes(pesType)) {
          if (this.pesParserTypes.has(pesType) && !this.pesParsers.has(pid)) {
            this.pesParsers.set(pid, new (this.pesParserTypes.get(pesType))(pesType));
            this.pesAsms[pid] = new _pes.PESAsm(pid);
            switch (pesType) {
              case _StreamDefine.PESType.AAC:
                tracks.add({
                  type: _StreamDefine.PayloadType.AAC,
                  offset: 0
                });
                break;
              case _StreamDefine.PESType.PCMA:
                tracks.add({
                  type: _StreamDefine.PayloadType.PCMA,
                  offset: 0
                });
                break;
              case _StreamDefine.PESType.PCMU:
                tracks.add({
                  type: _StreamDefine.PayloadType.PCMU,
                  offset: 0
                });
                break;
              case _StreamDefine.PESType.G722:
                tracks.add({
                  type: _StreamDefine.PayloadType.G722,
                  offset: 0
                });
                break;
              case _StreamDefine.PESType.G723:
                tracks.add({
                  type: _StreamDefine.PayloadType.G723,
                  offset: 0
                });
                break;
              case _StreamDefine.PESType.G726:
                tracks.add({
                  type: _StreamDefine.PayloadType.G726,
                  offset: 0
                });
                break;
              case _StreamDefine.PESType.G729:
                tracks.add({
                  type: _StreamDefine.PayloadType.G729,
                  offset: 0
                });
                break;
              case _StreamDefine.PESType.H264:
                tracks.add({
                  type: _StreamDefine.PayloadType.H264,
                  offset: 0
                });
                break;
              case _StreamDefine.PESType.H265:
                tracks.add({
                  type: _StreamDefine.PayloadType.H265,
                  offset: 0
                });
                break;
              default:
                throw new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_AV, "Invalid pes type:".concat(pesType, " not supported!"));
            }
          }
        }
        readLen -= 5 + il;
      }
      if (tracks.size === 0) {
        throw new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_AV, "Parse PMT, not found track!");
      }

      /// Has codec special data?
      var _iterator = _createForOfIteratorHelper(tracks),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var track = _step.value;
          if (track.type === _StreamDefine.PayloadType.H264 || track.type === _StreamDefine.PayloadType.H265 || track.type === _StreamDefine.PayloadType.AAC) {
            track.hasCodecConf = true;
            track.params = {};
            track.ready = false;
          } else {
            track.hasCodecConf = false;
            track.ready = true;
          }
        }
        // TODO: notify about tracks
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (this.ontracks) {
        this.ontracks(tracks);
      }
    }
  }], [{
    key: "PACKET_LENGTH",
    get: function get() {
      return 188;
    }
  }]);
  return TSParser;
}();
},{"../utils/logger.js":"src/utils/logger.js","../utils/binary.js":"src/utils/binary.js","./pes.js":"src/parsers/pes.js","./pes_h26x.js":"src/parsers/pes_h26x.js","./pes_aac.js":"src/parsers/pes_aac.js","./pes_g7xx.js":"src/parsers/pes_g7xx.js","../StreamDefine.js":"src/StreamDefine.js","../api/ASMediaError.js":"src/api/ASMediaError.js"}],"src/rtsp/RTPPayloadParser.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RTPPayloadParser = void 0;
var _MediaAccessunit = require("../MediaAccessunit.js");
var _naluAsm = require("../parsers/nalu-asm.js");
var _naluAsmHevc = require("../parsers/nalu-asm-hevc.js");
var _aacAsm = require("../parsers/aac-asm.js");
var _ts = require("../parsers/ts.js");
var _StreamDefine = require("../StreamDefine.js");
var _event = require("../utils/event.js");
var _ASMediaError = require("../api/ASMediaError.js");
var _logger = require("../utils/logger.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var RTPPayloadParser = exports.RTPPayloadParser = /*#__PURE__*/function (_TinyEvents) {
  _inherits(RTPPayloadParser, _TinyEvents);
  var _super = _createSuper(RTPPayloadParser);
  function RTPPayloadParser() {
    var _this;
    _classCallCheck(this, RTPPayloadParser);
    _this = _super.call(this);
    _this.h264parser = new RTPH264Parser();
    _this.h265parser = new RTPH265Parser();
    _this.aacparser = new RTPAACParser();
    _this.g7xxparser = new RTPGXXParser();
    _this.tsparser = new _ts.TSParser();
    _this.tsparser.ontracks = function (tracks) {
      _this.emit("tracks", tracks);
    };
    return _this;
  }
  _createClass(RTPPayloadParser, [{
    key: "reset",
    value: function reset() {
      this.tsparser.reset();
    }
  }, {
    key: "parse",
    value: function parse(rtp) {
      var parsed = null;
      if (rtp.media.type === "video" && rtp.media.ptype === _StreamDefine.PayloadType.H264) {
        parsed = this.h264parser.parse(rtp);
        if (parsed) {
          this.emit("sample", parsed);
        }
      } else if (rtp.media.type === "video" && rtp.media.ptype === _StreamDefine.PayloadType.H265) {
        parsed = this.h265parser.parse(rtp);
        if (parsed) {
          this.emit("sample", parsed);
        }
      } else if (rtp.media.type === "video" && rtp.media.ptype === _StreamDefine.PayloadType.TS) {
        /** Parse mpeg2ts */
        var data = rtp.getPayload();
        var offset = 0;
        if (data.byteLength % _ts.TSParser.PACKET_LENGTH) {
          _logger.Log.error("Invalid rtp ts payload length:".concat(data.ByteLength));
          return;
        }
        while (offset < data.byteLength) {
          parsed = this.tsparser.parse(data.subarray(offset, offset + _ts.TSParser.PACKET_LENGTH));
          offset += _ts.TSParser.PACKET_LENGTH;
          if (parsed) {
            this.emit("sample", parsed);
          }
        }
      } else if (rtp.media.type === "audio" && rtp.media.ptype === _StreamDefine.PayloadType.AAC) {
        parsed = this.aacparser.parse(rtp);
        if (parsed) {
          this.emit("sample", parsed);
        }
      } else if (rtp.media.type === "audio" && (rtp.media.ptype === _StreamDefine.PayloadType.G711 || rtp.media.ptype === _StreamDefine.PayloadType.G722 || rtp.media.ptype === _StreamDefine.PayloadType.G723 || rtp.media.ptype === _StreamDefine.PayloadType.G726 || rtp.media.ptype === _StreamDefine.PayloadType.G729)) {
        parsed = this.g7xxparser.parse(rtp);
        if (parsed) {
          this.emit("sample", parsed);
        }
      } else {
        throw (0, _ASMediaError.ASMediaError)(_ASMediaError.ASMediaError.MEDIA_ERROR_AV, "Not support codec:".concat(_StreamDefine.PayloadType.stringCodec(rtp.media.ptype)));
      }
    }
  }]);
  return RTPPayloadParser;
}(_event.TinyEvents);
var RTPH264Parser = /*#__PURE__*/function () {
  function RTPH264Parser() {
    _classCallCheck(this, RTPH264Parser);
    this.naluasm = new _naluAsm.NALUAsm();
  }
  _createClass(RTPH264Parser, [{
    key: "parse",
    value: function parse(rtp) {
      var nalus = this.naluasm.onNALUFragment(rtp.getPayload());
      if (nalus) {
        return new _MediaAccessunit.MediaAccessunit(rtp.type, rtp.getTimestamp(), rtp.getTimestamp(), nalus);
      } else {
        return null;
      }
    }
  }]);
  return RTPH264Parser;
}();
var RTPH265Parser = /*#__PURE__*/function () {
  function RTPH265Parser() {
    _classCallCheck(this, RTPH265Parser);
    this.naluasm = new _naluAsmHevc.NALUAsmHevc();
  }
  _createClass(RTPH265Parser, [{
    key: "parse",
    value: function parse(rtp) {
      var nalus = this.naluasm.onNALUFragment(rtp.getPayload());
      if (nalus) {
        return new _MediaAccessunit.MediaAccessunit(rtp.type, rtp.getTimestamp(), rtp.getTimestamp(), nalus);
      } else {
        return null;
      }
    }
  }]);
  return RTPH265Parser;
}();
var RTPAACParser = /*#__PURE__*/function () {
  function RTPAACParser() {
    _classCallCheck(this, RTPAACParser);
    this.scale = 1;
    this.asm = new _aacAsm.AACAsm();
  }
  _createClass(RTPAACParser, [{
    key: "setConfig",
    value: function setConfig(conf) {
      this.asm.config = conf;
    }
  }, {
    key: "parse",
    value: function parse(rtp) {
      var acus = this.asm.onAACFragment(rtp);
      var ts = (Math.round(rtp.getTimestamp() / 1024) << 10) * 90000 / this.config.samplerate;
      return new _MediaAccessunit.MediaAccessunit(rtp.type, ts, ts, acus);
    }
  }]);
  return RTPAACParser;
}();
var RTPGXXParser = /*#__PURE__*/function () {
  function RTPGXXParser() {
    _classCallCheck(this, RTPGXXParser);
  }
  _createClass(RTPGXXParser, [{
    key: "parse",
    value: function parse(rtp) {
      return new _MediaAccessunit.MediaAccessunit(rtp.type, rtp.getTimestamp(), rtp.getTimestamp(), rtp.getPayload());
    }
  }]);
  return RTPGXXParser;
}();
},{"../MediaAccessunit.js":"src/MediaAccessunit.js","../parsers/nalu-asm.js":"src/parsers/nalu-asm.js","../parsers/nalu-asm-hevc.js":"src/parsers/nalu-asm-hevc.js","../parsers/aac-asm.js":"src/parsers/aac-asm.js","../parsers/ts.js":"src/parsers/ts.js","../StreamDefine.js":"src/StreamDefine.js","../utils/event.js":"src/utils/event.js","../api/ASMediaError.js":"src/api/ASMediaError.js","../utils/logger.js":"src/utils/logger.js"}],"src/rtsp/RTSPSession.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RTSPSession = void 0;
var _logger = require("../utils/logger.js");
var _RTSPClient = require("./RTSPClient.js");
var _url = require("../utils/url.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, catch: function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var LOG_TAG = "rtsp:session";
var Log = (0, _logger.getTagged)(LOG_TAG);
var RTSPSession = exports.RTSPSession = /*#__PURE__*/function () {
  function RTSPSession(client, sessionId) {
    _classCallCheck(this, RTSPSession);
    this.state = null;
    this.client = client;
    this.sessionId = sessionId;
    this.url = this.getControlURL();
  }
  _createClass(RTSPSession, [{
    key: "reset",
    value: function reset() {
      this.client = null;
    }
  }, {
    key: "start",
    value: function start() {
      return this.sendPlay();
    }
  }, {
    key: "stop",
    value: function stop() {
      return this.sendTeardown();
    }
  }, {
    key: "getControlURL",
    value: function getControlURL() {
      var ctrl = this.client.sdp.getSessionBlock().control;
      if (_url.Url.isAbsolute(ctrl)) {
        return ctrl;
      } else if (!ctrl || "*" === ctrl) {
        return this.client.contentBase;
      } else {
        return "".concat(this.client.contentBase).concat(ctrl);
      }
    }
  }, {
    key: "sendRequest",
    value: function sendRequest(_cmd) {
      var _params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var params = {};
      if (this.sessionId) {
        params["Session"] = this.sessionId;
      }
      Object.assign(params, _params);
      return this.client.sendRequest(_cmd, this.getControlURL(), params);
    }
  }, {
    key: "sendPlay",
    value: function () {
      var _sendPlay = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var pos,
          params,
          data,
          _args = arguments;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              pos = _args.length > 0 && _args[0] !== undefined ? _args[0] : 0;
              this.state = _RTSPClient.RTSPClientSM.STATE_PLAY;
              params = {};
              params["Range"] = "npt=".concat(pos, "-");
              _context.next = 6;
              return this.sendRequest("PLAY", params);
            case 6:
              data = _context.sent;
              this.state = _RTSPClient.RTSPClientSM.STATE_PLAYING;
              return _context.abrupt("return", {
                data: data
              });
            case 9:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function sendPlay() {
        return _sendPlay.apply(this, arguments);
      }
      return sendPlay;
    }()
  }, {
    key: "sendPause",
    value: function () {
      var _sendPause = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (this.client.supports("PAUSE")) {
                _context2.next = 2;
                break;
              }
              return _context2.abrupt("return");
            case 2:
              this.state = _RTSPClient.RTSPClientSM.STATE_PAUSE;
              _context2.next = 5;
              return this.sendRequest("PAUSE");
            case 5:
              this.state = _RTSPClient.RTSPClientSM.STATE_PAUSED;
            case 6:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function sendPause() {
        return _sendPause.apply(this, arguments);
      }
      return sendPause;
    }()
  }, {
    key: "sendTeardown",
    value: function () {
      var _sendTeardown = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (!(this.state !== _RTSPClient.RTSPClientSM.STATE_TEARDOWN)) {
                _context3.next = 5;
                break;
              }
              this.state = _RTSPClient.RTSPClientSM.STATE_TEARDOWN;
              _context3.next = 4;
              return this.sendRequest("TEARDOWN");
            case 4:
              Log.log("RTSPClient: STATE_TEARDOWN");
              ///this.client.connection.disconnect();
              // TODO: Notify client
            case 5:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function sendTeardown() {
        return _sendTeardown.apply(this, arguments);
      }
      return sendTeardown;
    }()
  }]);
  return RTSPSession;
}();
},{"../utils/logger.js":"src/utils/logger.js","./RTSPClient.js":"src/rtsp/RTSPClient.js","../utils/url.js":"src/utils/url.js"}],"src/BaseClient.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseClient = void 0;
var _logger = require("./utils/logger.js");
var _url = require("./utils/url.js");
var _event = require("./utils/event.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, catch: function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var BaseClient = exports.BaseClient = /*#__PURE__*/function (_TinyEvents) {
  _inherits(BaseClient, _TinyEvents);
  var _super = _createSuper(BaseClient);
  function BaseClient(options) {
    var _this;
    _classCallCheck(this, BaseClient);
    _this = _super.call(this);
    _this.options = options;
    Object.defineProperties(_assertThisInitialized(_this), {
      sourceUrl: {
        value: null,
        writable: true
      },
      // TODO: getter with validator
      paused: {
        value: true,
        writable: true
      },
      seekable: {
        value: false,
        writable: true
      },
      connected: {
        value: false,
        writable: true
      },
      transport: {
        value: null,
        writable: true
      },
      duration: function getDuration() {
        return this._getDuration();
      }
    });
    _this._onControl = function (data) {
      if (_this.connected) {
        _this.onControl(data);
      }
    };
    _this._onJabber = function (data) {
      if (_this.connected) {
        _this.onJabber(data);
      }
    };
    _this._onData = function (data) {
      if (_this.connected) {
        _this.onData(data);
      }
    };
    _this._onConnected = _this.onConnected.bind(_assertThisInitialized(_this));
    _this._onDisconnect = _this.onDisconnected.bind(_assertThisInitialized(_this));
    _this._onData = _this.onData.bind(_assertThisInitialized(_this));
    _this._onControl = _this.onControl.bind(_assertThisInitialized(_this));
    _this._onJabber = _this.onJabber.bind(_assertThisInitialized(_this));
    _this._onError = _this.onError.bind(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(BaseClient, [{
    key: "destroy",
    value: function () {
      var _destroy = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              this.detachTransport();
              if (!this.transport) {
                _context.next = 5;
                break;
              }
              _context.next = 4;
              return this.transport.disconnect();
            case 4:
              this.transport = null;
            case 5:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function destroy() {
        return _destroy.apply(this, arguments);
      }
      return destroy;
    }()
  }, {
    key: "attachTransport",
    value: function attachTransport(transport) {
      if (this.transport) {
        this.detachTransport();
      }
      this.transport = transport;
      transport.is_reconnect = this.options.reconnect;
      this.transport.on("control", this._onControl);
      this.transport.on("jabber", this._onJabber);
      this.transport.on("data", this._onData);
      this.transport.on("connected", this._onConnected);
      this.transport.on("disconnected", this._onDisconnect);
      this.transport.on("error", this._onError);
    }
  }, {
    key: "detachTransport",
    value: function detachTransport() {
      if (this.transport) {
        this.transport.off("jabber", this._onJabber);
        this.transport.off("control", this._onData);
        this.transport.off("data", this._onData);
        this.transport.off("connected", this._onConnected);
        this.transport.off("disconnected", this._onDisconnect);
        this.transport.off("error", this._onError);
      }
    }
  }, {
    key: "reset",
    value: function reset() {}
  }, {
    key: "start",
    value: function start() {
      _logger.Log.log("Client started");
      this.paused = false;
    }
  }, {
    key: "pause",
    value: function pause() {
      _logger.Log.log("Client paused");
      this.paused = false;
    }
  }, {
    key: "stop",
    value: function stop() {
      _logger.Log.log("Client stoped");
    }
  }, {
    key: "seek",
    value: function seek(timeOffset) {}
  }, {
    key: "setSource",
    value: function setSource(source) {
      this.stop();
      this.endpoint = _url.Url.parse(source);
      this.sourceUrl = this.endpoint.urlpath;
    }
  }, {
    key: "onControl",
    value: function onControl(data) {}
  }, {
    key: "onJabber",
    value: function onJabber(data) {}
  }, {
    key: "onData",
    value: function onData(data) {}
  }, {
    key: "onConnected",
    value: function onConnected() {
      if (!this.seekable) {
        this.emit("clear");
      }
      this.connected = true;
    }
  }, {
    key: "onDisconnected",
    value: function onDisconnected() {
      this.connected = false;
    }
  }, {
    key: "onError",
    value: function onError(e) {
      this.emit("error", e);
    }
  }, {
    key: "queryCredentials",
    value: function queryCredentials() {
      return Promise.resolve();
    }
  }, {
    key: "setCredentials",
    value: function setCredentials(user, password) {
      this.endpoint.user = user;
      this.endpoint.pass = password;
      this.endpoint.auth = "".concat(user, ":").concat(password);
    }

    /// Private
  }, {
    key: "_getDuration",
    value: function _getDuration() {
      throw Error("Call _getDuration() in abstract class BaseClient!");
    }
  }], [{
    key: "streamType",
    value: function streamType() {
      return null;
    }
  }]);
  return BaseClient;
}(_event.TinyEvents);
},{"./utils/logger.js":"src/utils/logger.js","./utils/url.js":"src/utils/url.js","./utils/event.js":"src/utils/event.js"}],"src/rtsp/RTSPClient.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RTSPError = exports.RTSPClientSM = exports.RTSPClient = void 0;
var _logger = require("../utils/logger.js");
var _ASMediaError = require("../api/ASMediaError.js");
var _url = require("../utils/url.js");
var _statemachine = require("../utils/statemachine.js");
var _sdp = require("./sdp.js");
var _RTSPTrackStream = require("./RTSPTrackStream.js");
var _md = _interopRequireDefault(require("../utils/md5.js"));
var _RTPFactory = _interopRequireDefault(require("./RTPFactory.js"));
var _RTSPMessage = require("./RTSPMessage.js");
var _RTPPayloadParser = require("./RTPPayloadParser.js");
var _StreamDefine = require("../StreamDefine.js");
var _binary = require("../utils/binary.js");
var _aac = require("../parsers/aac.js");
var _RTSPSession = require("./RTSPSession.js");
var _BaseClient2 = require("../BaseClient.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeFunction(fn) { try { return Function.toString.call(fn).indexOf("[native code]") !== -1; } catch (e) { return typeof fn === "function"; } }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, catch: function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var LOG_TAG = "client:rtsp";
var Log = (0, _logger.getTagged)(LOG_TAG);
var RTSPClient = exports.RTSPClient = /*#__PURE__*/function (_BaseClient) {
  _inherits(RTSPClient, _BaseClient);
  var _super = _createSuper(RTSPClient);
  function RTSPClient(options) {
    var _this;
    _classCallCheck(this, RTSPClient);
    _this = _super.call(this, options);
    _this.clientSM = new RTSPClientSM(_assertThisInitialized(_this));
    _this.clientSM.shouldReconnect = options.reconnect;
    return _this;
  }
  _createClass(RTSPClient, [{
    key: "setSource",
    value: function setSource(url) {
      _get(_getPrototypeOf(RTSPClient.prototype), "setSource", this).call(this, url);
      this.clientSM.setSource(url);
    }
  }, {
    key: "attachTransport",
    value: function attachTransport(transport) {
      _get(_getPrototypeOf(RTSPClient.prototype), "attachTransport", this).call(this, transport);
      this.clientSM.transport = transport;
    }
  }, {
    key: "detachTransport",
    value: function detachTransport() {
      _get(_getPrototypeOf(RTSPClient.prototype), "detachTransport", this).call(this);
      this.clientSM.transport = null;
    }
  }, {
    key: "reset",
    value: function reset() {
      _get(_getPrototypeOf(RTSPClient.prototype), "reset", this).call(this);
      this.clientSM.reset();
    }
  }, {
    key: "destroy",
    value: function () {
      var _destroy = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              this.clientSM.destroy();
              _context.next = 3;
              return _get(_getPrototypeOf(RTSPClient.prototype), "destroy", this).call(this);
            case 3:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function destroy() {
        return _destroy.apply(this, arguments);
      }
      return destroy;
    }()
  }, {
    key: "start",
    value: function start() {
      var _this2 = this;
      _get(_getPrototypeOf(RTSPClient.prototype), "start", this).call(this);
      if (this.transport) {
        if (this.connected) {
          Promise.resolve();
        } else {
          this.transport.connect().then(function () {
            _this2.connected = true;
            return _this2.clientSM.start();
          }).catch(function (e) {
            _this2.connected = false;
            _this2.emit("error", e);
          });
        }
      } else {
        Promise.reject("no transport attached");
      }
    }
  }, {
    key: "seek",
    value: function seek(timeOffset) {
      return this.clientSM.start(timeOffset);
    }
  }, {
    key: "stop",
    value: function stop() {
      _get(_getPrototypeOf(RTSPClient.prototype), "stop", this).call(this);
      return this.clientSM.stop();
    }
  }, {
    key: "pause",
    value: function pause() {
      _get(_getPrototypeOf(RTSPClient.prototype), "pause", this).call(this);
      return this.clientSM.pause();
    }
  }, {
    key: "onControl",
    value: function onControl(data) {
      this.clientSM.onControl(data);
    }
  }, {
    key: "onData",
    value: function onData(data) {
      this.clientSM.onData(data);
    }
  }, {
    key: "onConnected",
    value: function onConnected() {
      _get(_getPrototypeOf(RTSPClient.prototype), "onConnected", this).call(this);
      this.clientSM.onConnected();
    }
  }, {
    key: "onDisconnected",
    value: function onDisconnected() {
      _get(_getPrototypeOf(RTSPClient.prototype), "onDisconnected", this).call(this);
      this.clientSM.onDisconnected();
      this.emit("disconnect");
    }

    /// Private
  }, {
    key: "_getDuration",
    value: function _getDuration() {
      var d = NaN;
      if (this.clientSM.sdp) {
        var dt = this.clientSM.sdp.timing;
        if (dt && dt.stop !== "now") {
          d = Number(dt.stop) - Number(dt.start);
        }
      }
      return d;
    }
  }], [{
    key: "streamType",
    value: function streamType() {
      return "rtsp";
    }
  }]);
  return RTSPClient;
}(_BaseClient2.BaseClient);
var AuthError = /*#__PURE__*/function (_Error) {
  _inherits(AuthError, _Error);
  var _super2 = _createSuper(AuthError);
  function AuthError(msg) {
    _classCallCheck(this, AuthError);
    return _super2.call(this, msg);
  }
  return _createClass(AuthError);
}( /*#__PURE__*/_wrapNativeSuper(Error));
var RTSPError = exports.RTSPError = /*#__PURE__*/function (_Error2) {
  _inherits(RTSPError, _Error2);
  var _super3 = _createSuper(RTSPError);
  function RTSPError(data) {
    var _this3;
    _classCallCheck(this, RTSPError);
    _this3 = _super3.call(this, data.msg);
    _this3.data = data;
    return _this3;
  }
  return _createClass(RTSPError);
}( /*#__PURE__*/_wrapNativeSuper(Error));
var RTSPClientSM = exports.RTSPClientSM = /*#__PURE__*/function (_StateMachine) {
  _inherits(RTSPClientSM, _StateMachine);
  var _super4 = _createSuper(RTSPClientSM);
  function RTSPClientSM(parent) {
    var _this4;
    _classCallCheck(this, RTSPClientSM);
    _this4 = _super4.call(this);
    _this4.parent = parent;
    _this4.transport = null;
    _this4.payParser = new _RTPPayloadParser.RTPPayloadParser();
    _this4.rtp_channels = new Set();
    _this4.sessions = {};
    _this4.promises = {};
    _this4.payParser.on("tracks", function (tracks) {
      _this4.parent.emit("tstracks", tracks);
    });
    _this4.payParser.on("sample", function (sample) {
      _this4.parent.emit("sample", sample);
    });
    _this4.addState(RTSPClientSM.STATE_INITIAL, {}).addState(RTSPClientSM.STATE_OPTIONS, {
      activate: _this4.sendOptions,
      finishTransition: _this4.onOptions
    }).addState(RTSPClientSM.STATE_DESCRIBE, {
      activate: _this4.sendDescribe,
      finishTransition: _this4.onDescribe
    }).addState(RTSPClientSM.STATE_SETUP, {
      activate: _this4.sendSetup,
      finishTransition: _this4.onSetup
    }).addState(RTSPClientSM.STATE_STREAMS, {}).addState(RTSPClientSM.STATE_TEARDOWN, {
      activate: function activate() {
        _this4.started = false;
      },
      finishTransition: function finishTransition() {
        return _this4.transitionTo(RTSPClientSM.STATE_INITIAL);
      }
    }).addTransition(RTSPClientSM.STATE_INITIAL, RTSPClientSM.STATE_OPTIONS).addTransition(RTSPClientSM.STATE_INITIAL, RTSPClientSM.STATE_TEARDOWN).addTransition(RTSPClientSM.STATE_OPTIONS, RTSPClientSM.STATE_DESCRIBE).addTransition(RTSPClientSM.STATE_DESCRIBE, RTSPClientSM.STATE_SETUP).addTransition(RTSPClientSM.STATE_SETUP, RTSPClientSM.STATE_STREAMS).addTransition(RTSPClientSM.STATE_TEARDOWN, RTSPClientSM.STATE_INITIAL)
    // .addTransition(RTSPClientSM.STATE_STREAMS, RTSPClientSM.STATE_PAUSED)
    // .addTransition(RTSPClientSM.STATE_PAUSED, RTSPClientSM.STATE_STREAMS)
    .addTransition(RTSPClientSM.STATE_STREAMS, RTSPClientSM.STATE_TEARDOWN)
    // .addTransition(RTSPClientSM.STATE_PAUSED, RTSPClientSM.STATE_TEARDOWN)
    .addTransition(RTSPClientSM.STATE_SETUP, RTSPClientSM.STATE_TEARDOWN).addTransition(RTSPClientSM.STATE_DESCRIBE, RTSPClientSM.STATE_TEARDOWN).addTransition(RTSPClientSM.STATE_OPTIONS, RTSPClientSM.STATE_TEARDOWN);
    _this4.reset();
    _this4.shouldReconnect = false;
    return _this4;
  }
  _createClass(RTSPClientSM, [{
    key: "destroy",
    value: function destroy() {
      this.parent = null;
    }
  }, {
    key: "setSource",
    value: function setSource(url) {
      this.reset();
      this.endpoint = _url.Url.parse(url);
      this.url = "".concat(this.endpoint.protocol, "://").concat(this.endpoint.location).concat(this.endpoint.urlpath);
    }
  }, {
    key: "onConnected",
    value: function onConnected() {
      var _this5 = this;
      if (this.rtpFactory) {
        this.rtpFactory = null;
      }
      if (this.shouldReconnect) {
        this.start().catch(function (e) {
          Log.error("onConnected:".concat(e));
          _this5.reset();
        });
      }
    }
  }, {
    key: "onDisconnected",
    value: function () {
      var _onDisconnected = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              this.reset();
              this.shouldReconnect = true;
              _context2.next = 4;
              return this.transitionTo(RTSPClientSM.STATE_TEARDOWN);
            case 4:
              _context2.next = 6;
              return this.transitionTo(RTSPClientSM.STATE_INITIAL);
            case 6:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function onDisconnected() {
        return _onDisconnected.apply(this, arguments);
      }
      return onDisconnected;
    }()
  }, {
    key: "start",
    value: function start(pos) {
      if (this.currentState.name !== RTSPClientSM.STATE_STREAMS) {
        return this.transitionTo(RTSPClientSM.STATE_OPTIONS);
      } else {
        // TODO: seekable
        var promises = [];
        for (var session in this.sessions) {
          promises.push(this.sessions[session].sendPlay(pos));
        }
        return Promise.all(promises);
      }
    }
  }, {
    key: "onControl",
    value: function onControl(data) {
      /// Parse CSeq
      var parsed = this.parse(data);
      Log.log(parsed);
      var cseq = parsed.headers["cseq"];
      if (cseq) {
        this.promises[Number(cseq)].resovle(parsed);
        delete this.promises[Number(cseq)];
      } else {
        this.promises[Number(cseq)].reject(new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERROR_RTSP, {
          code: 513,
          statusLine: "Not found CSeq in RTSP response header!"
        }));
      }
    }
  }, {
    key: "onData",
    value: function onData(data) {
      var channel = data[1];
      if (this.rtp_channels.has(channel)) {
        this.onRTP({
          packet: data.subarray(4),
          type: channel
        });
      } else {
        Log.error("Not found RTSP channel:".concat(channel, "!"));
        this.parent.emit("error", new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_RTSP, {
          code: 512,
          statusLine: "Not found RTSP channel:".concat(channel, "!")
        }));
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      this.shouldReconnect = false;
      var promises = [];
      for (var session in this.sessions) {
        promises.push(this.sessions[session].stop());
      }
      return Promise.all(promises);
    }
  }, {
    key: "pause",
    value: function pause() {
      var promises = [];
      for (var session in this.sessions) {
        promises.push(this.sessions[session].sendPause());
      }
      return Promise.all(promises);
    }
  }, {
    key: "reset",
    value: function () {
      var _reset = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        var stream, session;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              this.authenticator = "";
              this.methods = [];
              this.tracks = [];
              this.rtpBuffer = {};
              this.payParser.reset();
              for (stream in this.streams) {
                this.streams[stream].reset();
              }
              for (session in this.sessions) {
                this.sessions[session].reset();
              }
              this.streams = {};
              this.sessions = {};
              this.contentBase = "";
              if (!this.currentState) {
                _context3.next = 19;
                break;
              }
              if (!(this.currentState.name !== RTSPClientSM.STATE_INITIAL)) {
                _context3.next = 17;
                break;
              }
              _context3.next = 14;
              return this.transitionTo(RTSPClientSM.STATE_TEARDOWN);
            case 14:
              Log.debug("Current state:".concat(this.currentState.name));
              _context3.next = 17;
              return this.transitionTo(RTSPClientSM.STATE_INITIAL);
            case 17:
              _context3.next = 21;
              break;
            case 19:
              _context3.next = 21;
              return this.transitionTo(RTSPClientSM.STATE_INITIAL);
            case 21:
              this.sdp = null;
              this.interleaveChannelIndex = 0;
              this.session = null;
              this.timeOffset = {};
              this.lastTimestamp = {};
            case 26:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function reset() {
        return _reset.apply(this, arguments);
      }
      return reset;
    }()
  }, {
    key: "reconnect",
    value: function () {
      var _reconnect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return this.reset();
            case 2:
              if (!(this.currentState.name !== RTSPClientSM.STATE_INITIAL)) {
                _context4.next = 8;
                break;
              }
              _context4.next = 5;
              return this.transitionTo(RTSPClientSM.STATE_TEARDOWN);
            case 5:
              return _context4.abrupt("return", this.transitionTo(RTSPClientSM.STATE_OPTIONS));
            case 8:
              return _context4.abrupt("return", this.transitionTo(RTSPClientSM.STATE_OPTIONS));
            case 9:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function reconnect() {
        return _reconnect.apply(this, arguments);
      }
      return reconnect;
    }()
  }, {
    key: "supports",
    value: function supports(method) {
      return this.methods.includes(method);
    }
  }, {
    key: "parse",
    value: function parse(_data) {
      Log.debug(_data);
      var d = _data.split("\r\n\r\n");
      var parsed = _RTSPMessage.MessageBuilder.parse(d[0]);
      var len = Number(parsed.headers["content-length"]);
      if (len) {
        var _d = _data.split("\r\n\r\n");
        parsed.body = _d[1];
      } else {
        parsed.body = "";
      }
      return parsed;
    }
  }, {
    key: "sendRequest",
    value: function sendRequest(_cmd, _host) {
      var _this6 = this;
      var _params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _payload = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      this.cSeq++;
      Object.assign(_params, {
        CSeq: this.cSeq,
        "User-Agent": RTSPClientSM.USER_AGENT
      });
      if (this.authenticator) {
        _params["Authorization"] = this.authenticator(_cmd);
      }
      return this.send(_RTSPMessage.MessageBuilder.build(_cmd, _host, _params, _payload), _cmd).catch(function (e) {
        if (e instanceof AuthError && !_params["Authorization"]) {
          return _this6.sendRequest(_cmd, _host, _params, _payload);
        } else {
          throw e;
        }
      });
    }
  }, {
    key: "_transportRequest",
    value: function _transportRequest(_data) {
      var _this7 = this;
      return new Promise(function (resovle, reject) {
        _this7.promises[_this7.cSeq] = {
          resovle: resovle,
          reject: reject
        };
        _this7.transport.send(_data).then(function () {
          Log.log("send data success,cseq:".concat(_this7.cSeq));
        }).catch(function (e) {
          delete _this7.promises[_this7.cSeq];
          reject(new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_RTSP, {
            code: 462,
            statusLine: "462 Destination Unreachable"
          }));
        });
      });
    }
  }, {
    key: "send",
    value: function () {
      var _send = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(_data, _method) {
        var _this8 = this;
        var parsed, auth, method, chunks, ep, parsedChunks, _iterator, _step, chunk, c, _c$split, _c$split2, k, v;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              if (!this.transport) {
                _context5.next = 37;
                break;
              }
              _context5.prev = 1;
              _context5.next = 4;
              return this.transport.ready;
            case 4:
              _context5.next = 10;
              break;
            case 6:
              _context5.prev = 6;
              _context5.t0 = _context5["catch"](1);
              this.onDisconnected();
              throw _context5.t0;
            case 10:
              Log.debug(_data);
              _context5.next = 13;
              return this._transportRequest(_data);
            case 13:
              parsed = _context5.sent;
              if (!(parsed.code === 401 /*&& !this.authenticator */)) {
                _context5.next = 32;
                break;
              }
              Log.debug(parsed.headers["www-authenticate"]);
              auth = parsed.headers["www-authenticate"];
              method = auth.substring(0, auth.indexOf(" "));
              auth = auth.substr(method.length + 1);
              chunks = auth.split(",");
              ep = this.parent.endpoint;
              if (!(!ep.user || !ep.pass)) {
                _context5.next = 30;
                break;
              }
              _context5.prev = 22;
              _context5.next = 25;
              return this.parent.queryCredentials.call(this.parent);
            case 25:
              _context5.next = 30;
              break;
            case 27:
              _context5.prev = 27;
              _context5.t1 = _context5["catch"](22);
              throw new AuthError(_context5.t1.message);
            case 30:
              if (method.toLowerCase() === "digest") {
                parsedChunks = {};
                _iterator = _createForOfIteratorHelper(chunks);
                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    chunk = _step.value;
                    c = chunk.trim();
                    _c$split = c.split("="), _c$split2 = _slicedToArray(_c$split, 2), k = _c$split2[0], v = _c$split2[1];
                    parsedChunks[k] = v.substr(1, v.length - 2);
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }
                this.authenticator = function (_method) {
                  var ep = _this8.parent.endpoint;
                  var ha1 = (0, _md.default)("".concat(ep.user, ":").concat(parsedChunks.realm, ":").concat(ep.pass));
                  var ha2 = (0, _md.default)("".concat(_method, ":").concat(_this8.url));
                  var response = (0, _md.default)("".concat(ha1, ":").concat(parsedChunks.nonce, ":").concat(ha2));
                  var tail = ""; // TODO: handle other params
                  return "Digest username=\"".concat(ep.user, "\", realm=\"").concat(parsedChunks.realm, "\", nonce=\"").concat(parsedChunks.nonce, "\", uri=\"").concat(_this8.url, "\", response=\"").concat(response, "\"").concat(tail);
                };
              } else {
                this.authenticator = function () {
                  return "Basic ".concat(btoa(_this8.parent.endpoint.auth));
                };
              }
              throw new AuthError(parsed);
            case 32:
              if (!(parsed.code >= 300)) {
                _context5.next = 34;
                break;
              }
              throw new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_RTSP, {
                code: parsed.code,
                statusLine: parsed.statusLine
              });
            case 34:
              return _context5.abrupt("return", parsed);
            case 37:
              return _context5.abrupt("return", Promise.reject("No transport attached"));
            case 38:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[1, 6], [22, 27]]);
      }));
      function send(_x, _x2) {
        return _send.apply(this, arguments);
      }
      return send;
    }()
  }, {
    key: "sendOptions",
    value: function sendOptions() {
      this.reset();
      this.started = true;
      this.cSeq = 0;
      return this.sendRequest("OPTIONS", "*", {});
    }
  }, {
    key: "onOptions",
    value: function onOptions(data) {
      this.methods = data.headers["public"].split(",").map(function (e) {
        return e.trim();
      });
      return this.transitionTo(RTSPClientSM.STATE_DESCRIBE);
    }
  }, {
    key: "sendDescribe",
    value: function sendDescribe() {
      var _this9 = this;
      return this.sendRequest("DESCRIBE", this.url, {
        Accept: "application/sdp"
      }).then(function (data) {
        _this9.sdp = new _sdp.SDPParser();
        return _this9.sdp.parse(data.body).catch(function () {
          throw new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_RTSP, {
            code: 515,
            statusLine: "Failed to parse SDP"
          });
        }).then(function () {
          return data;
        });
      });
    }
  }, {
    key: "useRTPChannel",
    value: function useRTPChannel(channel) {
      this.rtp_channels.add(channel);
    }
  }, {
    key: "forgetRTPChannel",
    value: function forgetRTPChannel(channel) {
      this.rtp_channels.delete(channel);
    }
  }, {
    key: "onDescribe",
    value: function onDescribe(data) {
      var _this10 = this;
      Log.debug("onDescribe");
      this.contentBase = data.headers["content-base"] || this.url;
      this.tracks = this.sdp.getMediaBlockList();
      this.rtpFactory = new _RTPFactory.default(this.sdp);
      Log.log("SDP contained " + this.tracks.length + " track(s). Calling SETUP for each.");
      if (data.headers["session"]) {
        this.session = data.headers["session"];
      }
      if (!this.tracks.length) {
        this.emit("error", new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_RTSP, {
          code: 514,
          statusLine: "No tracks in SDP"
        }));
      } else {
        return this.transitionTo(RTSPClientSM.STATE_SETUP).catch(function (e) {
          Log.error(e);
          _this10.parent.emit("error", e);
        });
      }
    }
  }, {
    key: "sendSetup",
    value: function sendSetup() {
      var _this11 = this;
      var streams = [];
      var lastPromise = null;
      Log.log(this.sdp);
      // TODO: select first video and first audio tracks
      var _iterator2 = _createForOfIteratorHelper(this.tracks),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var track_type = _step2.value;
          Log.log("setup track: " + track_type);
          var track = this.sdp.getMediaBlock(track_type);
          Log.log(track);
          if (!_StreamDefine.PayloadType.string_map[track.rtpmap[track.fmt[0]].name]) continue;
          this.streams[track_type] = new _RTSPTrackStream.RTSPTrackStream(this, track);
          var setupPromise = this.streams[track_type].start(lastPromise);
          lastPromise = setupPromise;
          this.rtpBuffer[track.fmt[0]] = [];
          streams.push(setupPromise.then(function (_ref) {
            var track = _ref.track,
              data = _ref.data;
            Log.log(track);
            _this11.timeOffset[track.fmt[0]] = 0;
            try {
              var rtp_info = data.headers["rtp-info"].split(";");
              var _iterator3 = _createForOfIteratorHelper(rtp_info),
                _step3;
              try {
                for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                  var chunk = _step3.value;
                  var _chunk$split = chunk.split("="),
                    _chunk$split2 = _slicedToArray(_chunk$split, 2),
                    key = _chunk$split2[0],
                    val = _chunk$split2[1];
                  if (key === "rtptime") {
                    _this11.timeOffset[track.fmt[0]] = 0; //Number(val);
                  }
                }
              } catch (err) {
                _iterator3.e(err);
              } finally {
                _iterator3.f();
              }
            } catch (e) {
              // new Date().getTime();
            }
            var params = {
              timescale: 0,
              scaleFactor: 0
            };
            if (track.fmtp && track.fmtp["sprop-parameter-sets"]) {
              var sps_pps = track.fmtp["sprop-parameter-sets"].split(",");
              params = {
                sps: (0, _binary.base64ToArrayBuffer)(sps_pps[0]),
                pps: (0, _binary.base64ToArrayBuffer)(sps_pps[1])
              };
            } else if (track.fmtp && track.fmtp["sprop-vps"]) {
              params.vps = (0, _binary.base64ToArrayBuffer)(track.fmtp["sprop-vps"]);
            } else if (track.fmtp && track.fmtp["sprop-sps"]) {
              params.sps = (0, _binary.base64ToArrayBuffer)(track.fmtp["sprop-sps"]);
            } else if (track.fmtp && track.fmtp["sprop-pps"]) {
              params.pps = (0, _binary.base64ToArrayBuffer)(track.fmtp["sprop-pps"]);
            } else if (track.fmtp && track.fmtp["config"]) {
              var config = track.fmtp["config"];
              _this11.has_config = track.fmtp["cpresent"] != "0";
              var generic = track.rtpmap[track.fmt[0]].name == "MPEG4-GENERIC";
              if (generic) {
                params = {
                  config: _aac.AACParser.parseAudioSpecificConfig((0, _binary.hexToByteArray)(config))
                };
                _this11.payParser.aacparser.setConfig(params.config);
              } else if (config) {
                // todo: parse audio specific config for mpeg4-generic
                params = {
                  config: _aac.AACParser.parseStreamMuxConfig((0, _binary.hexToByteArray)(config))
                };
                _this11.payParser.aacparser.setConfig(params.config);
              }
            }
            params.duration = _this11.sdp.sessionBlock.range ? _this11.sdp.sessionBlock.range[1] - _this11.sdp.sessionBlock.range[0] : 1;
            _this11.parent.seekable = params.duration > 1;
            var res = {
              track: track,
              offset: _this11.timeOffset[track.fmt[0]],
              type: _StreamDefine.PayloadType.string_map[track.rtpmap[track.fmt[0]].name],
              params: params,
              duration: params.duration
            };
            var session = data.headers.session.split(";")[0];
            if (!_this11.sessions[session]) {
              _this11.sessions[session] = new _RTSPSession.RTSPSession(_this11, session);
            }
            return res;
          }));
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return Promise.all(streams).then(function (tracks) {
        var sessionPromises = [];
        for (var session in _this11.sessions) {
          sessionPromises.push(_this11.sessions[session].start());
        }
        return Promise.all(sessionPromises).then(function () {
          _this11.parent.emit("tracks", tracks);
        });
      });
    }
  }, {
    key: "onSetup",
    value: function onSetup() {
      Log.debug("onSetup");
      return this.transitionTo(RTSPClientSM.STATE_STREAMS);
    }
  }, {
    key: "onRTP",
    value: function onRTP(_data) {
      if (!this.rtpFactory) return;
      var rtp = this.rtpFactory.build(_data.packet, this.sdp);
      if (!rtp.type) {
        return;
      }
      if (this.timeOffset[rtp.pt] === undefined) {
        //console.log(rtp.pt, this.timeOffset[rtp.pt]);
        this.rtpBuffer[rtp.pt].push(rtp);
        return;
      }
      if (this.lastTimestamp[rtp.pt] === undefined) {
        this.lastTimestamp[rtp.pt] = rtp.timestamp - this.timeOffset[rtp.pt];
      }
      var queue = this.rtpBuffer[rtp.pt];
      queue.push(rtp);
      while (queue.length) {
        var _rtp = queue.shift();
        _rtp.timestamp = _rtp.timestamp - this.timeOffset[_rtp.pt] - this.lastTimestamp[_rtp.pt];
        if (_rtp.media) {
          try {
            this.payParser.parse(_rtp);
          } catch (error) {
            this.parent.emit("error", error);
          }
        }
      }
    }
  }], [{
    key: "USER_AGENT",
    get: function get() {
      return "SFRtsp 0.3";
    }
  }, {
    key: "STATE_INITIAL",
    get: function get() {
      return 1 << 0;
    }
  }, {
    key: "STATE_OPTIONS",
    get: function get() {
      return 1 << 1;
    }
  }, {
    key: "STATE_DESCRIBE",
    get: function get() {
      return 1 << 2;
    }
  }, {
    key: "STATE_SETUP",
    get: function get() {
      return 1 << 3;
    }
  }, {
    key: "STATE_STREAMS",
    get: function get() {
      return 1 << 4;
    }
  }, {
    key: "STATE_TEARDOWN",
    get: function get() {
      return 1 << 5;
    }
  }, {
    key: "STATE_PLAY",
    get: function get() {
      return 1 << 6;
    }
  }, {
    key: "STATE_PLAYING",
    get: function get() {
      return 1 << 7;
    }
  }, {
    key: "STATE_PAUSE",
    get: function get() {
      return 1 << 8;
    }
  }, {
    key: "STATE_PAUSED",
    get: function get() {
      return 1 << 9;
    }
  }]);
  return RTSPClientSM;
}(_statemachine.StateMachine);
},{"../utils/logger.js":"src/utils/logger.js","../api/ASMediaError.js":"src/api/ASMediaError.js","../utils/url.js":"src/utils/url.js","../utils/statemachine.js":"src/utils/statemachine.js","./sdp.js":"src/rtsp/sdp.js","./RTSPTrackStream.js":"src/rtsp/RTSPTrackStream.js","../utils/md5.js":"src/utils/md5.js","./RTPFactory.js":"src/rtsp/RTPFactory.js","./RTSPMessage.js":"src/rtsp/RTSPMessage.js","./RTPPayloadParser.js":"src/rtsp/RTPPayloadParser.js","../StreamDefine.js":"src/StreamDefine.js","../utils/binary.js":"src/utils/binary.js","../parsers/aac.js":"src/parsers/aac.js","./RTSPSession.js":"src/rtsp/RTSPSession.js","../BaseClient.js":"src/BaseClient.js"}],"src/websocket.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebsocketTransport = void 0;
var _logger = require("./utils/logger.js");
var _event = require("./utils/event.js");
var _ASMediaError = require("./api/ASMediaError.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var LOG_TAG = "transport:ws";
var Log = (0, _logger.getTagged)(LOG_TAG);
var WebsocketTransport = exports.WebsocketTransport = /*#__PURE__*/function (_TinyEvents) {
  _inherits(WebsocketTransport, _TinyEvents);
  var _super = _createSuper(WebsocketTransport);
  function WebsocketTransport(url, protocols, stream_type) {
    var _this;
    _classCallCheck(this, WebsocketTransport);
    _this = _super.call(this);
    _this.stream_type = stream_type;
    _this.socket_url = url;
    _this.protocols = protocols;
    _this.attempts = 1;
    _this.timeoutID = 0;
    _this.is_reconnect = false;
    Object.defineProperties(_assertThisInitialized(_this), {
      readyState: {
        get: function getReadyState() {
          return this.ws.readyState;
        }
      }
    });
    _this.connectPromise = null;
    return _this;
  }
  _createClass(WebsocketTransport, [{
    key: "_setupWebsocket",
    value: function _setupWebsocket(ws) {
      ws.onopen = this.onOpen.bind(this);
      ws.onerror = this.onError.bind(this);
      ws.onclose = this.onClose.bind(this);
      ws.onmessage = this.onMessage.bind(this);
    }
  }, {
    key: "_generateInterval",
    value: function _generateInterval(k) {
      return Math.min(30, Math.pow(2, k) - 1) * 1000;
    }
  }, {
    key: "onOpen",
    value: function onOpen(e) {
      Log.log("WS connect ".concat(this.socket_url, " success!"));
      if (this.connectPromise) {
        this.connectPromise.resolve();
        this.connectPromise = null;
      } else {
        this.emit("connected");
      }
    }
  }, {
    key: "onError",
    value: function onError(e) {
      Log.log("WS onerror:".concat(e));
      /**
      let err = new ASMediaError(
        ASMediaError.MEDIA_ERR_NETWORK,
        "network error!"
      );
      if (this.connectPromise) {
        this.connectPromise.reject(err);
        this.connectPromise = null;
      } else {
        this.emit("error", err);
      } */
    }
  }, {
    key: "onClose",
    value: function onClose(e) {
      Log.log("WS onclose, code:".concat(e.code));
      var err = new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_NETWORK, "network disconnected!");
      if (this.connectPromise) {
        this.connectPromise.reject(err);
        this.connectPromise = null;
      } else {
        this.emit("disconnected", err);
      }
      if (e.code !== 1000 && e.code !== 4000 && e.code !== 4001 && e.code !== 4002 && e.code !== 4003) {
        if (this.is_reconnect) this.reconnect();
      }
    }
  }, {
    key: "onMessage",
    value: function onMessage(e) {
      var _this2 = this;
      /// Processing websocket message
      if (typeof e.data === "string") {
        /// RTSP control command
        this.emit("control", e.data);
      } else if (_typeof(e.data) === "object") {
        var classObject = Object.prototype.toString.call(e.data).slice(8, -1);
        if (classObject === "ArrayBuffer") {
          /// Receive array buffer data
          var dv = new DataView(e.data);
          if (36 === dv.getUint8(0)) {
            this.emit("data", e.data);
          } else {
            this.emit("jabber", e.data);
          }
        } else if (classObject === "Blob") {
          e.data.arrayBuffer().then(function (buf) {
            var ubuf = new Uint8Array(buf);
            if (36 === ubuf[0]) {
              _this2.emit("data", ubuf);
            } else {
              _this2.emit("jabber", ubuf);
            }
          });
        } else {
          Log.log("WS receive invalid data type:".concat(classObject));
        }
      } else {
        Log.log("WS receive invalid data type!");
      }
    }
  }, {
    key: "reconnect",
    value: function reconnect() {
      var _this3 = this;
      Log.log("WebSocket reconnect...");
      var time = this._generateInterval(this.attempts);
      this.timeoutID = setTimeout(function () {
        _this3.attempts = _this3.attempts + 1;
        var subprotos = _this3.protocols.split(",");
        _this3.ws = new WebSocket(_this3.socket_url, subprotos);
        _this3._setupWebsocket(_this3.ws);
      }, time);
    }
  }, {
    key: "connect",
    value: function connect() {
      var _this4 = this;
      return new Promise(function (resolve, reject) {
        _this4.connectPromise = {
          resolve: resolve,
          reject: reject
        };
        _this4.disconnect().then(function () {
          var subprotos = _this4.protocols.split(",");
          _this4.ws = new WebSocket(_this4.socket_url, subprotos);
          _this4._setupWebsocket(_this4.ws);
        });
      });
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var _this5 = this;
      return new Promise(function (resolve) {
        if (_this5.ws) {
          _this5.ws.onclose = function (e) {
            Log.log("closed, code:".concat(e.code, "."));
            resolve();
          };
          _this5.ws.close();
        } else {
          resolve();
        }
      });
    }
  }, {
    key: "send",
    value: function send(_data) {
      var _this6 = this;
      return new Promise(function (resolve, reject) {
        var ws = _this6.ws;
        if (ws.readyState !== WebSocket.OPEN) {
          Log.error("WS send in invalid state!");
          reject(new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_NETWORK, "WS send in invalid state!"));
        }
        ws.send(_data);
        var timerid = setInterval(function () {
          if (ws.readyState !== WebSocket.OPEN) {
            clearInterval(timerid);
            reject(new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_NETWORK, "WS send in invalid state!"));
          } else if (ws.bufferedAmount === 0) {
            clearInterval(timerid);
            resolve();
          }
        }, 20);
      });
    }
  }], [{
    key: "canTransfer",
    value: function canTransfer(stream_type) {
      return WebsocketTransport.streamTypes().includes(stream_type);
    }
  }, {
    key: "streamTypes",
    value: function streamTypes() {
      return ["rtsp"];
    }
  }]);
  return WebsocketTransport;
}(_event.TinyEvents);
},{"./utils/logger.js":"src/utils/logger.js","./utils/event.js":"src/utils/event.js","./api/ASMediaError.js":"src/api/ASMediaError.js"}],"src/rtsp/RTSPStream.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _logger = require("../utils/logger.js");
var _ASMediaError = require("../api/ASMediaError.js");
var _BaseStream2 = _interopRequireDefault(require("../BaseStream.js"));
var _StreamDefine = require("../StreamDefine.js");
var _remuxer = require("../remuxer/remuxer.js");
var _mse = require("../presentation/mse.js");
var _RTSPClient = require("./RTSPClient");
var _websocket = require("../websocket");
var _h = require("../parsers/h264.js");
var _h2 = require("../parsers/h265.js");
var _nalu = require("../parsers/nalu.js");
var _naluHevc = require("../parsers/nalu-hevc.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var LOG_TAG = "RTSPStream";
var Log = (0, _logger.getTagged)(LOG_TAG);
var RTSPStream = exports.default = /*#__PURE__*/function (_BaseStream) {
  _inherits(RTSPStream, _BaseStream);
  var _super = _createSuper(RTSPStream);
  function RTSPStream(options) {
    var _this;
    _classCallCheck(this, RTSPStream);
    _this = _super.call(this, options);
    _this.firstRAP = false;
    _this.tracks = null;
    _this.useMSE = false;
    _this.remux = null;
    _this.isContainer = false;
    _this.tracksReady = false;

    /// Sample queues
    _this.sampleQueues = {};

    /// Events
    _this._onTracks = _this.onTracks.bind(_assertThisInitialized(_this));
    _this._onTsTracks = _this.onTsTracks.bind(_assertThisInitialized(_this));
    _this._onSample = _this.onSample.bind(_assertThisInitialized(_this));
    _this._onClear = _this.onClear.bind(_assertThisInitialized(_this));
    _this._onDisconnect = _this.onDisconnect.bind(_assertThisInitialized(_this));
    _this._onError = _this.onError.bind(_assertThisInitialized(_this));

    /// Establish rtp client
    _this.client = new _RTSPClient.RTSPClient(options);
    var transport = new _websocket.WebsocketTransport(_this.wsurl, "rtsp", "rtsp");
    _this.client.attachTransport(transport);
    _this.client.on("tracks", _this._onTracks);
    _this.client.on("tstracks", _this._onTsTracks);
    _this.client.on("sample", _this._onSample);
    _this.client.on("clear", _this._onClear);
    _this.client.on("disconnect", _this._onDisconnect);
    _this.client.on("error", _this._onError);
    return _this;
  }

  /// Public methods

  /// Override method, return Promise
  _createClass(RTSPStream, [{
    key: "load",
    value: function load() {
      Log.log("load starting!");
      this.client.reset();
      this.client.setSource(this.rtspurl);
      this.buffering = true;
      return this.client.start();
    }

    /// return Promise
  }, {
    key: "seek",
    value: function seek(offset) {
      /// RTSP seek to postion
      return this.client.seek(offset);
    }
  }, {
    key: "abort",
    value: function abort() {
      var _this2 = this;
      this.client.stop().then(function () {
        if (_this2.client.transport) {
          return _this2.client.transport.disconnect();
        } else {
          throw Error("abort stream, but transport is null!");
        }
      });
    }
  }, {
    key: "pause",
    value: function pause() {
      /**return this.client.pause();*/
    }
  }, {
    key: "stop",
    value: function stop() {
      return this.client.stop();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      Log.debug("destroy");
      this.client.reset();
      this.client.destroy();
      /** Clear sampleQueues */
      this.sampleQueues = {};
      /** Clear tracks */
      this.tracks = null;
      /** Destory remux */
      if (this.remux) {
        this.remux.destroy();
      }
    }

    /// events
  }, {
    key: "onTracks",
    value: function onTracks(tracks) {
      Log.debug("onTracks:", tracks);
      this.tracks = tracks;
      if (tracks[0].type === _StreamDefine.PayloadType.TS || tracks[0].type === _StreamDefine.PayloadType.PS) {
        this.isContainer = true;
      } else {
        this.isContainer = false;
        var _iterator = _createForOfIteratorHelper(tracks),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var track = _step.value;
            /** Initialize samplesQueues */
            this.sampleQueues[_StreamDefine.PayloadType.string_map[track.rtpmap[track.fmt[0]].name]] = [];
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this._onTracksReady(tracks);
      }
    }
  }, {
    key: "onTsTracks",
    value: function onTsTracks(tracks) {
      Log.debug("onTsTracks:", tracks);
      /** add duration\track\offset properties*/
      var _iterator2 = _createForOfIteratorHelper(tracks),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var track = _step2.value;
          track.duration = this.tracks[0].duration;
          track.track = this.tracks[0].track;
          track.offset = this.tracks[0].offset;
          this.sampleQueues[track.type] = [];
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.tracks[0].tracks = tracks;
      var hasCodecConf = false;
      var _iterator3 = _createForOfIteratorHelper(tracks),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _track = _step3.value;
          if (_track.hasCodecConf) {
            hasCodecConf = true;
            break;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      if (!hasCodecConf) {
        this._onTracksReady(tracks);
      }
    }
  }, {
    key: "_onTracksReady",
    value: function _onTracksReady(tracks) {
      this.seekable = this.client.seekable;
      this.duration = this.client.duration;
      this._decideMSE(tracks);
      if (this.useMSE) {
        this.eventSource.dispatchEvent("tracks", tracks);
        this.startStreamFlush();
        /// Dispatch avinfo
        this.eventSource.dispatchEvent("info", this._getAVInfo());
      } else {
        this.eventSource.dispatchEvent("error", new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_SRC_NOT_SUPPORTED, "Codec not supported using MSE!"));
        this.destroy();
      }
    }

    /// Error occure notify
  }, {
    key: "onError",
    value: function onError(e) {
      this.buffering = false;
      this.eventSource.dispatchEvent("error", e);
      this.destroy();
    }

    /// MSE  accessunit event notify
  }, {
    key: "onSample",
    value: function onSample(accessunit) {
      if (accessunit.ctype === _StreamDefine.PayloadType.H264 || accessunit.ctype === _StreamDefine.PayloadType.H265) {
        if (!this.firstRAP && accessunit.isKeyFrame()) {
          this.firstRAP = true;
        }
      }
      if (!this.firstRAP) {
        /// Drop accessunit ...
        Log.warn("Receive accessunit, but not found track, discard this access unit!");
        return;
      }
      var track = null;
      /// Find track
      if (this.tracks[0].type === _StreamDefine.PayloadType.TS || this.tracks[0].type === _StreamDefine.PayloadType.PS) {
        var _iterator4 = _createForOfIteratorHelper(this.tracks[0].tracks),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var t = _step4.value;
            if (t.type === accessunit.ctype) {
              track = t;
              break;
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
      } else {
        var _iterator5 = _createForOfIteratorHelper(this.tracks),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var _t = _step5.value;
            if (_t.type === accessunit.ctype) {
              track = _t;
              break;
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
      }
      if (!track) {
        Log.warn("Receive accessunit, but not found track!");
        return;
      }
      if (track.type === _StreamDefine.PayloadType.H264 && (!track.params.sps || !track.params.pps)) {
        var _iterator6 = _createForOfIteratorHelper(accessunit.units),
          _step6;
        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var frame = _step6.value;
            if (frame.type() === _nalu.NALU.SPS) {
              track.params.sps = frame.getData().subarray(4);
            } else if (frame.type() === _nalu.NALU.PPS) {
              track.params.pps = frame.getData().subarray(4);
            }
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }
        if (track.params.sps && track.params.pps) {
          track.ready = true;
          track.codec = _h.H264Parser.getCodec(track.params.sps);
        }
      } else if (track.type === _StreamDefine.PayloadType.H265 && (!track.params.vps || !track.params.sps || !track.params.pps)) {
        var _iterator7 = _createForOfIteratorHelper(accessunit.units),
          _step7;
        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var _frame = _step7.value;
            if (_frame.type() === _naluHevc.HEVC_NALU.VPS) {
              track.params.vps = _frame.getData().subarray(4);
            } else if (_frame.type() === _naluHevc.HEVC_NALU.SPS) {
              track.params.sps = _frame.getData().subarray(4);
            } else if (_frame.type() === _naluHevc.HEVC_NALU.PPS) {
              track.params.pps = _frame.getData().subarray(4);
            }
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }
        if (track.params.vps && track.params.sps && track.params.pps) {
          track.ready = true;
          track.codec = _h2.H265Parser.getCodec(track.params.vps);
        }
      } else if (track.type === _StreamDefine.PayloadType.AAC && !track.params.config) {
        if (!accessunit.config) {
          this.eventSource.dispatchEvent("error", new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_AV, "Receive AAC accessunit, but have not config information!"));
          this.destory();
        } else {
          track.params.config = accessunit.config;
          track.codec = accessunit.config.codec;
          track.ready = true;
        }
      }

      /// Check TS/PS container tracks ready
      if (this.isContainer) {
        var f = true;
        var tracks = this.tracks[0].tracks;
        var _iterator8 = _createForOfIteratorHelper(tracks),
          _step8;
        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var _t2 = _step8.value;
            if (!_t2.ready) {
              f = false;
              break;
            }
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }
        if (f && !this.tracksReady) {
          this._onTracksReady(tracks);
          this.tracksReady = true;
        }
      }
      this.sampleQueues[accessunit.ctype].push(accessunit);
    }
  }, {
    key: "reset",
    value: function reset() {
      this.duration = NaN;
      this.buffering = false;
      /** Clear sampleQueues */
      this.sampleQueues = {};
      /** Clear tracks */
      this.tracks = null;
      this.tracksReady = false;
      this.firstRAP = false;
      this.useMSE = false;
      this.isContainer = false;
    }
  }, {
    key: "onClear",
    value: function onClear() {
      this.reset();
      this.eventSource.dispatchEvent("clear");
      Log.log("onClear!");
    }
  }, {
    key: "onDisconnect",
    value: function onDisconnect() {
      this.reset();
      /** Destory remux */
      if (this.remux) {
        this.remux.destroy();
      }
      this.eventSource.dispatchEvent("error", new _ASMediaError.ASMediaError(_ASMediaError.ASMediaError.MEDIA_ERR_NETWORK, "websocket disconected!"));
    }
  }, {
    key: "_getTimeScale",
    value: function _getTimeScale(ptype) {
      var timescale = 0;
      for (var i = 0; i < this.tracks.length; i++) {
        if (this.tracks[i].ptype === _StreamDefine.PayloadType.PS || this.tracks[i].ptype === _StreamDefine.PayloadType.TS) {
          timescale = 90000;
          break;
        } else if (this.tracks[i].ptype === ptype) {
          var rtpmap = this.tracks[i].rtpmap.entries();
          for (var j = 0; j < rtpmap.length; j++) {
            timescale = rtpmap[j][1].clock;
            break;
          }
        }
      }
      return timescale;
    }
  }, {
    key: "_decideMSE",
    value: function _decideMSE(tracks) {
      var codecs = [];
      Log.debug("MSE tracks:", tracks);
      var _iterator9 = _createForOfIteratorHelper(tracks),
        _step9;
      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var track = _step9.value;
          Log.debug("track type:".concat(track.type, ",codec:").concat(track.codec));
          codecs.push(track.codec);
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }
      if (_mse.MSE.isSupported(codecs)) {
        this.useMSE = true;
        this.remux = new _remuxer.Remuxer(this.video);
        this.remux.MSE.bufferDuration = this.bufferedDuration;
        this.remux.attachClient(this);
      } else {
        Log.error("MSE not supported codec:video/mp4; codecs=\"".concat(codecs.join(","), "\""));
      }
    }
  }, {
    key: "_getAVInfo",
    value: function _getAVInfo() {
      return {
        video: this._getVideoInfo(),
        audio: this._getAudioInfo()
      };
    }
  }, {
    key: "_getAudioInfo",
    value: function _getAudioInfo() {
      /// get audio info
      var tracks = null;
      if (this.isContainer) {
        tracks = this.tracks[0].tracks;
      } else {
        tracks = this.tracks;
      }
      if (!tracks) {
        return null;
      }
      var _iterator10 = _createForOfIteratorHelper(tracks),
        _step10;
      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var track = _step10.value;
          if (!this.isContainer) {
            if (track.type === "audio" && track.ptype === _StreamDefine.PayloadType.AAC) {
              return {
                codec: track.params.config.codec,
                samplerate: track.params.config.samplerate,
                channel: track.params.config.channel
              };
            }
          } else {
            if (track.type === _StreamDefine.PayloadType.AAC) {
              return {
                codec: track.params.config.codec,
                samplerate: track.params.config.samplerate,
                channel: track.params.config.channel
              };
            }
          }
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
      return null;
    }
  }, {
    key: "_getVideoExt",
    value: function _getVideoExt(track) {
      if (track.type === _StreamDefine.PayloadType.H264) {
        if (!track.params.sps || !track.params.pps) return null;
        return _h.H264Parser.readSPS(track.params.sps);
      } else if (track.type === _StreamDefine.PayloadType.H265) {
        var vpsconfig = _h2.H265Parser.readVPS(track.params.vps);
        var info = _h2.H265Parser.readSPS(track.params.sps);
        info["fixedFrameRate"] = vpsconfig.fixedFrameRate;
        info["frameDuration"] = vpsconfig.frameDuration;
        return info;
      }
      return null;
    }
  }, {
    key: "_getVideoInfo",
    value: function _getVideoInfo() {
      /// get video info
      var tracks = null;
      if (this.isContainer) {
        tracks = this.tracks[0].tracks;
      } else {
        tracks = this.tracks;
      }
      if (!tracks) {
        return null;
      }
      var _iterator11 = _createForOfIteratorHelper(tracks),
        _step11;
      try {
        for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
          var track = _step11.value;
          if (!this.isContainer) {
            if (track.type === "video" && (track.ptype === _StreamDefine.PayloadType.H264 || track.ptype === _StreamDefine.PayloadType.H265 || track.ptype === _StreamDefine.PayloadType.AV1)) {
              if (!track.params.info) {
                track.params.info = this._getVideoExt(track);
                track.params.info.codec = track.codec;
              }
              return track.params.info;
            }
          } else {
            if (track.type === _StreamDefine.PayloadType.H264 || track.type === _StreamDefine.PayloadType.H265 || track.type === _StreamDefine.PayloadType.AV1) {
              if (!track.params.info) {
                track.params.info = this._getVideoExt(track);
                track.params.info.codec = track.codec;
              }
              return track.params.info;
            }
          }
        }
      } catch (err) {
        _iterator11.e(err);
      } finally {
        _iterator11.f();
      }
      return null;
    }
  }, {
    key: "_getHasAudio",
    value: function _getHasAudio() {
      var f = false;
      var tracks = null;
      if (this.isContainer) {
        tracks = this.tracks[0].tracks;
      } else {
        tracks = this.tracks;
      }
      var _iterator12 = _createForOfIteratorHelper(tracks),
        _step12;
      try {
        for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
          var track = _step12.value;
          if (!this.isContainer) {
            if (track.type === "audio") {
              f = true;
              break;
            }
          } else {
            if (track.type === _StreamDefine.PayloadType.AAC) {
              f = true;
              break;
            }
          }
        }
      } catch (err) {
        _iterator12.e(err);
      } finally {
        _iterator12.f();
      }
      return f;
    }
  }, {
    key: "_getHasVideo",
    value: function _getHasVideo() {
      var f = false;
      var tracks = null;
      if (this.isContainer) {
        tracks = this.tracks[0].tracks;
      } else {
        tracks = this.tracks;
      }
      var _iterator13 = _createForOfIteratorHelper(tracks),
        _step13;
      try {
        for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
          var track = _step13.value;
          if (!this.isContainer) {
            if (track.type === "video") {
              f = true;
              break;
            }
          } else {
            if (track.type === _StreamDefine.PayloadType.H264 || track.type === _StreamDefine.PayloadType.H265 || track.type === _StreamDefine.PayloadType.AV1) {
              f = true;
              break;
            }
          }
        }
      } catch (err) {
        _iterator13.e(err);
      } finally {
        _iterator13.f();
      }
      return f;
    }
  }, {
    key: "_getHasBFrames",
    value: function _getHasBFrames() {
      var f = false;
      var tracks = null;
      if (this.isContainer) {
        tracks = this.tracks[0].tracks;
      } else {
        tracks = this.tracks;
      }
      var _iterator14 = _createForOfIteratorHelper(tracks),
        _step14;
      try {
        for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
          var track = _step14.value;
          if (track.type === "video") {
            f = track.hasBFrames;
            break;
          }
        }
      } catch (err) {
        _iterator14.e(err);
      } finally {
        _iterator14.f();
      }
      return f;
    }
  }]);
  return RTSPStream;
}(_BaseStream2.default);
},{"../utils/logger.js":"src/utils/logger.js","../api/ASMediaError.js":"src/api/ASMediaError.js","../BaseStream.js":"src/BaseStream.js","../StreamDefine.js":"src/StreamDefine.js","../remuxer/remuxer.js":"src/remuxer/remuxer.js","../presentation/mse.js":"src/presentation/mse.js","./RTSPClient":"src/rtsp/RTSPClient.js","../websocket":"src/websocket.js","../parsers/h264.js":"src/parsers/h264.js","../parsers/h265.js":"src/parsers/h265.js","../parsers/nalu.js":"src/parsers/nalu.js","../parsers/nalu-hevc.js":"src/parsers/nalu-hevc.js"}],"src/ASPlayer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ASPlayer = void 0;
var _RTSPStream = _interopRequireDefault(require("./rtsp/RTSPStream"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ASPlayer = exports.ASPlayer = /*#__PURE__*/function () {
  function ASPlayer(options) {
    _classCallCheck(this, ASPlayer);
    // Always call super first in constructor
    this.errorHandler = null;
    this.infoHandler = null;
    this.dataHandler = null;
    this.queryCredentials = null;
    this.bufferDuration_ = 120;
    this.supposedCurrentTime = 0;
    this.stream = new _RTSPStream.default(options);
    this._attachVideo(options.video);
    this.stream.eventSource.addEventListener("error", this._onError.bind(this));
    this.stream.eventSource.addEventListener("info", this._onInfo.bind(this));
  }

  /** video play handler */
  _createClass(ASPlayer, [{
    key: "_attachVideo",
    value: function _attachVideo(video) {
      var _this = this;
      this._video = video;
      this._video.addEventListener("play", function () {
        if (!_this.isPlaying()) {
          _this.stream.start();
        }
      }, false);
      /** video pause handler */
      this._video.addEventListener("pause", function () {
        _this.stream.pause();
      }, false);
      /** video seeking handler */
      this._video.addEventListener("seeking", function () {
        if (_this.stream.seekable) {
          if (!_this._is_in_buffered(_this._video.currentTime)) {
            console.log("seek to ".concat(_this._video.currentTime));
            _this.stream.seek(_this._video.currentTime);
          }
        } else {
          var delta = _this._video.currentTime - _this.supposedCurrentTime;
          if (Math.abs(delta) >= 0.01) {
            console.log("Seeking is disabled");
            _this._video.currentTime = _this.supposedCurrentTime;
          }
        }
      }, false);

      /** video updatetime handler */
      this._video.addEventListener("timeupdate", function () {
        if (!_this._video.seeking) {
          _this.supposedCurrentTime = _this._video.currentTime;
        }
      }, false);

      /** video abort handler */
      this._video.addEventListener("abort", function () {
        _this.stream.abort().then(function () {
          _this.stream.destroy();
        });
      }, false);

      /** video ended handler */
      this._video.addEventListener("ended", function () {
        _this.supposedCurrentTime = 0;
      }, false);
    }

    // TODO: check native support
  }, {
    key: "isPlaying",
    value: function isPlaying() {
      return !(this._video.paused || this.stream.paused);
    }

    /** Load */
  }, {
    key: "start",
    value: function start() {
      if (this.stream) {
        return this.stream.load();
      } else {
        Promise.reject("Not attach stream!");
      }
    }

    /** stop */
  }, {
    key: "stop",
    value: function stop() {
      this.stream.stop();
    }

    /** destory */
  }, {
    key: "destroy",
    value: function destroy() {
      this.stream.destory();
    }
  }, {
    key: "_onInfo",
    value: function _onInfo(info) {
      if (this.infoHandler) {
        this.infoHandler(info);
      }
    }
  }, {
    key: "_onData",
    value: function _onData(data) {
      if (this.dataHandler) {
        this.dataHandler(data);
      }
    }
  }, {
    key: "_onError",
    value: function _onError(e) {
      if (this.errorHandler) {
        this.errorHandler(e);
      }
    }
  }, {
    key: "_is_in_buffered",
    value: function _is_in_buffered(current_time) {
      var buffereds = this._video.buffered;
      var f = false;
      for (var i = 0; i < buffereds.length; i++) {
        if (current_time >= buffereds.start(i) && current_time <= buffereds.end(i)) {
          f = true;
          break;
        }
      }
      return f;
    }
  }]);
  return ASPlayer;
}();
},{"./rtsp/RTSPStream":"src/rtsp/RTSPStream.js"}],"src/index.js":[function(require,module,exports) {
"use strict";

require("./styles.css");
var _ASPlayer = require("./ASPlayer");
document.getElementById("app").innerHTML = "\n<h1>rtsp player</h1>\n<div class=\"video__container\">\n<video id=\"test_video\" controls autoplay>\n    <!--<source src=\"rtsp://192.168.10.205:554/ch01.264\" type=\"application/x-rtsp\">-->\n    <!--<source src=\"rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov\" type=\"application/x-rtsp\">-->\n</video>\n</div>\n";
var video = document.getElementById("test_video");
var player = new _ASPlayer.ASPlayer({
  wsurl: "wss://192.168.3.100/ws_live",
  rtspurl: "rtsp://50010303121110099054:991100@192.168.3.100:5554/live/50010303121329905401",
  //?RecordTimeRange=1700270399_1700272552",
  cacheSize: 1000,
  video: video,
  bufferedDuration: 15,
  reconnect: true
});
/** Error handling */
player.errorHandler = function (e) {
  console.log(e);
};
/** Information handling */
player.infoHandler = function (info) {
  console.log(info);
};
player.start();
},{"./styles.css":"src/styles.css","./ASPlayer":"src/ASPlayer.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "53054" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.a2b27638.js.map