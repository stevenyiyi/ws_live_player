import { Log } from "./utils/logger.js";
import { Url } from "./utils/url.js";
import { TinyEvents } from "./utils/event.js";

export class BaseClient extends TinyEvents {
  constructor(options) {
    super();

    this.options = options;
    Object.defineProperties(this, {
      sourceUrl: { value: null, writable: true }, // TODO: getter with validator
      paused: { value: true, writable: true },
      seekable: { value: false, writable: true },
      connected: { value: false, writable: true },
      transport: { value: null, writable: true },
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
    this._onConnected = this.onConnected.bind(this);
    this._onDisconnect = this.onDisconnected.bind(this);
    this._onData = this.onData.bind(this);
    this._onControl = this.onControl.bind(this);
    this._onJabber = this.onJabber.bind(this);
    this._onError = this.onError.bind(this);
  }

  static streamType() {
    return null;
  }

  async destroy() {
    this.detachTransport();

    if (this.transport) {
      await this.transport.disconnect();
      this.transport = null;
    }
  }

  attachTransport(transport) {
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

  detachTransport() {
    if (this.transport) {
      this.transport.off("jabber", this._onJabber);
      this.transport.off("control", this._onData);
      this.transport.off("data", this._onData);
      this.transport.off("connected", this._onConnected);
      this.transport.off("disconnected", this._onDisconnect);
      this.transport.off("error", this._onError);
    }
  }
  reset() {}

  start(scale = 1) {
    Log.log("Client started");
    this.paused = false;
  }

  pause() {
    Log.log("Client paused");
    this.paused = false;
  }

  stop() {
    Log.log("Client stoped");
  }

  seek(timeOffset) {}

  setSource(source) {
    this.stop();
    this.endpoint = Url.parse(source);
    this.sourceUrl = this.endpoint.urlpath;
  }

  onControl(data) {}
  onJabber(data) {}
  onData(data) {}

  onConnected() {
    if (!this.seekable) {
      this.emit("clear");
    }
    this.connected = true;
  }

  onDisconnected() {
    this.connected = false;
  }

  onError(e) {
    this.emit("error", e);
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
