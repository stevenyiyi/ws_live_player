import { Log } from "./utils/logger.js";
import { TinyEvents } from "./utils/event.js";

export class BaseClient extends TinyEvents {
  constructor(options = { flush: 100 }) {
    super();

    this.options = options;
    Object.defineProperties(this, {
      sourceUrl: { value: null, writable: true }, // TODO: getter with validator
      paused: { value: true, writable: true },
      seekable: { value: false, writable: true },
      connected: { value: false, writable: true },
      duration: function getDuration() {
        return this._getDuration();
      }
    });
    this._onControl = (data) => {
      if (this.connected) {
        this.onControl(data);
      }
    };
    this._onJabber = (data) => {
      if (this.connected) {
        this.onJabber(data);
      }
    };
    this._onData = (data) => {
      if (this.connected) {
        this.onData(data);
      }
    };
    this._onConnect = this.onConnected.bind(this);
    this._onDisconnect = this.onDisconnected.bind(this);
  }

  static streamType() {
    return null;
  }

  destroy() {
    this.detachTransport();
  }

  attachTransport(transport) {
    if (this.transport) {
      this.detachTransport();
    }
    this.transport = transport;
    this.transport.on("control", this._onControl);
    this.transport.on("jabber", this._onJabber);
    this.transport.on("data", this._onData);
    this.transport.on("connected", this._onConnect);
    this.transport.on("disconnected", this._onDisconnect);
  }

  detachTransport() {
    if (this.transport) {
      this.transport.off("jabber", this._onJabber);
      this.transport.off("control", this._onData);
      this.transport.off("data", this._onData);
      this.transport.off("connected", this._onConnect);
      this.transport.off("disconnected", this._onDisconnect);
      this.transport = null;
    }
  }
  reset() {}

  start() {
    Log.log("Client started");
    this.paused = false;
  }

  stop() {
    Log.log("Client paused");
    this.paused = true;
  }

  seek(timeOffset) {}

  setSource(source) {
    this.stop();
    this.endpoint = source;
    this.sourceUrl = source.urlpath;
  }

  startStreamFlush() {
    this.flushInterval = setInterval(() => {
      if (!this.paused) {
        this.emit("flush");
      }
    }, this.options.flush);
  }

  stopStreamFlush() {
    clearInterval(this.flushInterval);
  }

  onControl(data) {}
  onJabber(data) {}
  onData(data) {}

  onConnected() {
    if (!this.seekable) {
      this.transport.dataQueue = [];
      this.emit("clear");
    }
    this.connected = true;
  }

  onDisconnected() {
    this.connected = false;
  }

  queryCredentials() {
    return Promise.resolve();
  }

  setCredentials(user, password) {
    this.endpoint.user = user;
    this.endpoint.pass = password;
    this.endpoint.auth = `${user}:${password}`;
  }

  /// Private
  _getDuration() {
    throw Error("Call _getDuration() in abstract class BaseClient!");
  }
}
