import { getTagged } from "./utils/logger.js";
import { TinyEvents } from "./utils/event.js";
import { ASMediaError } from "./api/ASMediaError.js";
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
    this.connectPromise = null;
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
    if (this.connectPromise) {
      this.connectPromise.resolve();
      this.connectPromise = null;
    } else {
      this.emit("connected");
    }
  }

  onError(e) {
    Log.log(`WS onerror:${e}`);
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

  onClose(e) {
    Log.log(`WS onclose, code:${e.code}`);
    let err = new ASMediaError(
      ASMediaError.MEDIA_ERR_NETWORK,
      "network disconnected!"
    );
    if (this.connectPromise) {
      this.connectPromise.reject(err);
      this.connectPromise = null;
    } else {
      this.emit("disconnected", err);
    }
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
    return ["rtsp"];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.connectPromise = { resolve, reject };
      this.disconnect().then(() => {
        let subprotos = this.protocols.split(",");
        this.ws = new WebSocket(this.socket_url, subprotos);
        this._setupWebsocket(this.ws);
      });
    });
  }

  disconnect() {
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

  send(_data) {
    return new Promise((resolve, reject) => {
      let ws = this.ws;
      if (ws.readyState !== WebSocket.OPEN) {
        Log.error("WS send in invalid state!");
        reject(
          new ASMediaError(
            ASMediaError.MEDIA_ERR_NETWORK,
            "WS send in invalid state!"
          )
        );
      }

      ws.send(_data);
      const timerid = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          clearInterval(timerid);
          reject(
            new ASMediaError(
              ASMediaError.MEDIA_ERR_NETWORK,
              "WS send in invalid state!"
            )
          );
        } else if (ws.bufferedAmount === 0) {
          clearInterval(timerid);
          resolve();
        }
      }, 20);
    });
  }
}
