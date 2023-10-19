import { getTagged } from "./utils/logger.js";
import { TinyEvents } from "./utils/event.js";
const LOG_TAG = "transport:ws";
const Log = getTagged(LOG_TAG);

export class WebsocketTransport extends TinyEvents {
  constructor(url, protocols, stream_type) {
    super();
    this.stream_type = stream_type;
    this.socket_url = url;
    this.protocols = protocols;
    this.attempts = 1;
    this.timeoutID = 0;
    this.is_reconnect = false;
    Object.defineProperties(this, {
      readyState: {
        get: function getReadyState() {
          return this.ws.readyState;
        }
      }
    });
    /// this.ready = this.connect();
  }

  _setupWebsocket(ws) {
    ws.onopen = this.onOpen.bind(this);
    ws.onerror = this.onError.bind(this);
    ws.onclose = this.onClose.bind(this);
    ws.onmessage = this.onMessage.bind(this);
  }

  _generateInterval(k) {
    return Math.min(30, Math.pow(2, k) - 1) * 1000;
  }

  onOpen(e) {
    Log.log(`WS connect ${this.socket_url} success!`);
    this.emit("connected");
  }

  onError(e) {
    Log.log("WS onerror:", e);
    this.emit("error", e);
  }

  onClose(e) {
    Log.log(`WS onclose, code:${e.code}`);
    this.emit("disconnected", e);
    if (
      e.code !== 1000 &&
      e.code !== 4000 &&
      e.code !== 4001 &&
      e.code !== 4002 &&
      e.code !== 4003
    ) {
      if (this.is_reconnect) this.reconnect();
    }
  }

  onMessage(e) {
    /// Processing websocket message
    if (typeof e.data === "string") {
      /// RTSP control command
      this.emit("control", e.data);
    } else if (typeof e.data === "object") {
      let classObject = Object.prototype.toString.call(e.data).slice(8, -1);
      if (classObject === "ArrayBuffer") {
        /// Receive array buffer data
        const dv = new DataView(e.data);
        if (36 === dv.getUint8(0)) {
          this.emit("data", e.data);
        } else {
          this.emit("jabber", e.data);
        }
      } else if (classObject === "Blob") {
        e.data.arrayBuffer().then((buf) => {
          const ubuf = new Uint8Array(buf);
          if (36 === ubuf[0]) {
            this.emit("data", ubuf);
          } else {
            this.emit("jabber", ubuf);
          }
        });
      } else {
        Log.log(`WS receive invalid data type:${classObject}`);
      }
    } else {
      Log.log("WS receive invalid data type!");
    }
  }

  reconnect() {
    Log.log("WebSocket reconnect...");
    let time = this._generateInterval(this.attempts);
    this.timeoutID = setTimeout(() => {
      this.attempts = this.attempts + 1;
      let subprotos = this.protocols.split(",");
      this.ws = new WebSocket(this.socket_url, subprotos);
      this._setupWebsocket(this.ws);
    }, time);
  }

  static canTransfer(stream_type) {
    return WebsocketTransport.streamTypes().includes(stream_type);
  }

  static streamTypes() {
    return ["rtmp", "rtsp"];
  }

  connect() {
    this.disconnect().then(() => {
      let subprotos = this.protocols.split(",");
      this.ws = new WebSocket(this.socket_url, subprotos);
      this._setupWebsocket(this.ws);
    });
  }

  disconnect() {
    /// clearTimeout(this.timeoutID);
    return new Promise((resolve) => {
      if (this.ws) {
        this.ws.onclose = (e) => {
          Log.log(`closed, code:${e.code}.`);
          resolve();
        };
        this.ws.close();
      } else {
        resolve();
      }
    });
  }

  send(_data, fn) {
    let ws = this.ws;
    if (ws.readyState !== WebSocket.OPEN) {
      Log.error("WS send in invalid state!");
      fn(-1);
    }

    ws.send(_data);
    const timerid = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        clearInterval(timerid);
        fn(-1);
      } else if (ws.bufferedAmount === 0) {
        clearInterval(timerid);
        fn(0);
      }
    }, 20);
  }
}
