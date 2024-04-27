import FactoryMaker from "./FactoryMaker.js";
const EVENT_PRIORITY_LOW = 0;
const EVENT_PRIORITY_HIGH = 5000;
const EVENT_MODE_ON_RECEIVE = "eventModeOnReceive";
const EVENT_MODE_ON_START = "eventModeOnStart";
function EventBus() {
  let handlers = {};
  function on(type, listener, scope, options = {}) {
    if (!type) {
      throw new Error("event type cannot be null or undefined");
    }
    if (!listener || typeof listener !== "function") {
      throw new Error("listener must be a function: " + listener);
    }

    let priority = options.priority || EVENT_PRIORITY_LOW;

    if (getHandlerIdx(type, listener, scope) >= 0) return;

    handlers[type] = handlers[type] || [];

    const handler = {
      callback: listener,
      scope,
      priority,
    };

    if (scope && scope.getStreamId) {
      handler.streamId = scope.getStreamId();
    }
    if (scope && scope.getType) {
      handler.mediaType = scope.getType();
    }
    if (options && options.mode) {
      handler.mode = options.mode;
    }

    const inserted = handlers[type].some((item, idx) => {
      if (item && priority > item.priority) {
        handlers[type].splice(idx, 0, handler);
        return true;
      }
    });

    if (!inserted) {
      handlers[type].push(handler);
    }
  }

  function off(type, listener, scope) {
    if (!type || !listener || !handlers[type]) return;
    const idx = getHandlerIdx(type, listener, scope);
    if (idx < 0) return;
    handlers[type][idx] = null;
}

function trigger(type, payload = {}, filters = {}) {
    if (!type || !handlers[type]) return;

    payload = payload || {};

    if (Object.prototype.hasOwnProperty.call(payload, 'type')) throw new Error('\'type\' is a reserved word for event dispatching');

    payload.type = type;

    if (filters.streamId) {
        payload.streamId = filters.streamId;
    }
    if (filters.mediaType) {
        payload.mediaType = filters.mediaType;
    }

    handlers[type]
        .filter((handler) => {
            if (!handler) {
                return false;
            }
            if (filters.streamId && handler.streamId && handler.streamId !== filters.streamId) {
                return false;
            }
            if (filters.mediaType && handler.mediaType && handler.mediaType !== filters.mediaType) {
                return false;
            }
            // This is used for dispatching DASH events. By default we use the onStart mode. Consequently we filter everything that has a non matching mode and the onReceive events for handlers that did not specify a mode.
            if ((filters.mode && handler.mode && handler.mode !== filters.mode) || (!handler.mode && filters.mode && filters.mode === EVENT_MODE_ON_RECEIVE)) {
                return false;
            }
            return true;
        })
        .forEach(handler => handler && handler.callback.call(handler.scope, payload));
}

function getHandlerIdx(type, listener, scope) {

    let idx = -1;

    if (!handlers[type]) return idx;

    handlers[type].some((item, index) => {
        if (item && item.callback === listener && (!scope || scope === item.scope)) {
            idx = index;
            return true;
        }
    });
    return idx;
}


function reset() {
    handlers = {};
}

const instance = {
    on: on,
    off: off,
    trigger: trigger,
    reset: reset
};

return instance;

}

EventBus.__dashjs_factory_name = 'EventBus';
const factory = FactoryMaker.getSingletonFactory(EventBus);
factory.EVENT_PRIORITY_LOW = EVENT_PRIORITY_LOW;
factory.EVENT_PRIORITY_HIGH = EVENT_PRIORITY_HIGH;
factory.EVENT_MODE_ON_RECEIVE = EVENT_MODE_ON_RECEIVE;
factory.EVENT_MODE_ON_START = EVENT_MODE_ON_START;
FactoryMaker.updateSingletonFactory(EventBus.__dashjs_factory_name, factory);
export default factory;
