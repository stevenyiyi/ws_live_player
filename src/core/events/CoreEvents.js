import EventBase from "./EventBase";
class CoreEvents extends EventBase {
    constructor() {
        super();
        this.WS_CONNECTING = 'wsConnecting';
        this.WS_CONNECTED = 'wsConnected';
        this.WS_RECONNECTING = "wsReconnecting"
        this.MEDIA_TRACKS_READY = 'mediaTracksReady';
        this.LOADING_PROGRESS = 'loadingProgress';
        this.LOADING_COMPLETED = 'loadingCompleted';
        this.LOADING_ABANDONED = 'loadingAborted';
        this.SOURCE_BUFFER_ERROR = 'sourceBufferError';
        this.QUOTA_EXCEEDED = 'quotaExceeded';
    }
}
export default CoreEvents;