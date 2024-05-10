import EventBus from "core/EventBus";
import Events from "core/events/Events";
import Logger from "core/Logger";
import { ASMediaError } from "./api/ASMediaError";

function WSSession(eventBus, url, protocols, is_reconnect) {
  const context = this.context;
  let instance,
    ws_,
    connectPromise_,
    logger,
    timerid_ = 0,
    attempts_ = 1;

  function setup() {
    logger = Logger.getLogger(instance);
  }

  function _connecting() {
    let subprotos = protocols.split(",");
    try {
      ws_ = new WebSocket(url, subprotos);
      _setupWebsocket();
    } catch (e) {
      if (connectPromise_) {
        connectPromise_.reject(e);
        connectPromise_ = null;
      } else {
        eventBus.trigger(Events.ERROR, e);
      }
    }
  }

  function _generateInterval(k) {
    return Math.min(30, Math.pow(2, k) - 1) * 1000;
  }

  function _reconnect() {
    let time = _generateInterval(attempts_);
    timerid_ = setTimeout(() => {
      attempts_++;
      _connecting();
    }, time);
  }

  function _onOpen() {
    logger.debug(`websocket connect ${url} success!`);
    if (connectPromise_) {
      connectPromise_.resolve();
      connectPromise_ = null;
    } else {
      eventBus.trigger(Events.WS_COONECTED);
    }
  }

  function _onClose(e) {
    let msg = `websocket url:${url} closed,code:${e.code}`;
    logger.debug(msg);
    let err = new ASMediaError(Events.WS_DISCONNECTED, msg);
    if (connectPromise_) {
      connectPromise_.reject(err);
      connectPromise_ = null;
    } else {
      eventBus.trigger(Events.WS_DISCONNECTED, {
        code: e.code,
        message: e.message,
      });
    }
    if (
      e.code !== 1000 &&
      e.code !== 4000 &&
      e.code !== 4001 &&
      e.code !== 4002 &&
      e.code !== 4003
    ) {
      if (is_reconnect) _reconnect();
    }
  }

  function _onError(e) {
    logger.error(`websocket url:${url} error:${e}`);
  }

  function _dispatchMessage(abuf) {
    /// Receive array buffer data
    const dv = new DataView(abuf);
    if (36 === dv.getUint8(0)) {
      eventBus.trigger(Events.WS_DATA, { data: abuf });
    } else {
      eventBus.trigger(EventBus.WS_JABBER, { data: abuf });
    }
  }

  function _onMessage(e) {
    if (typeof e.data === "string") {
      /// RTSP control message
      eventBus.trigger(Events.WS_CONTROL, { data: e.data });
    } else if (typeof e.data === "object") {
      let classObject = Object.prototype.toString.call(e.data).slice(8, -1);
      if (classObject === "ArrayBuffer") {
        _dispatchMessage(e.data);
      } else if (classObject === "Blob") {
        e.data.arrayBuffer().then((buf) => {
          _dispatchMessage(buf);
        });
      } else {
        logger.error(`websocket receive invalid message type:${classObject}`);
      }
    } else {
      logger.error("websocket receive invalid message!");
    }
  }

  function _setupWebsocket() {
    ws_.onopen = _onOpen;
    ws_.onclose = _onClose;
    ws_.onerror = _onError;
    ws_.onmessage = _onMessage;
  }

  function connect() {
    return new Promise((resolve, reject) => {
      connectPromise_ = { resolve, reject };
      disconnect().then(() => {
        _connecting();
      });
    });
  }

  function send(data) {
    return new Promise((resolve, reject) => {
      if (ws_.readyState !== WebSocket.OPEN) {
        reject(
          new ASMediaError(
            Events.ERR_WS_STATE_CODE,
            `websocket send data in invalid readState:${ws_.readyState}`
          )
        );
      } else {
        ws_.send(data);
        timerid_ = setInterval(() => {
          if (ws_.readyState !== WebSocket.OPEN) {
            clearInterval(timerid_);
            reject(
              new ASMediaError(
                Events.ERR_WS_STATE_CODE,
                `websocket send data in invalid readState:${ws_.readyState}`
              )
            );
          } else if (ws_.bufferedAmount === 0) {
            clearInterval(timerid_);
            resolve();
          }
        }, 20);
      }
    });
  }

  function disconnect() {
    return new Promise((resolve) => {
      if (ws_) {
        ws_.onclose = (e) => {
          logger.error(`WSSession closed,code:${e.code()}.`);
          resolve();
        };
        ws_.close();
      } else {
        resolve();
      }
    });
  }
  instance = {connect, disconnect, send};
  setup();
  return instance;
}
