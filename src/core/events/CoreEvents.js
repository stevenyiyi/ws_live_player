import EventBase from "./EventBase";
class CoreEvents extends EventBase {
    constructor() {
        super();
        this.ERROR = 'error';
        this.WS_CONNECTING = 'wsConnecting';
        this.WS_CONNECTED = 'wsConnected';
        this.WS_RECONNECTING = "wsReconnecting";
        this.WS_DISCONNECTED = 'wsDisconnected';
        this.WS_CONTROL = 'wsControl';
        this.WS_DATA = 'wsData';
        this.WS_JABBER = 'jabber';
        this.MEDIA_TRACKS_READY = 'mediaTracksReady';
        this.LOADING_PROGRESS = 'loadingProgress';
        this.LOADING_COMPLETED = 'loadingCompleted';
        this.LOADING_ABANDONED = 'loadingAborted';
        this.SOURCE_BUFFER_ERROR = 'sourceBufferError';
        this.QUOTA_EXCEEDED = 'quotaExceeded';
        this.DRAIN_SAMPLE = 'drainSample';
        this.CLEAR = 'clear';
    }
}
export default CoreEvents;