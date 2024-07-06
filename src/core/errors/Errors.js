import ErrorsBase from "./ErrorBase";
class Errors extends ErrorsBase {
  constructor() {
    super();
    /** Websocket disconnected */
    this.ERR_WS_DISCONNECTED_CODE = 10;
    /** Websocket state error */
    this.ERR_WS_STATE_CODE = 11;
    /** RTSP authenticate error */
    this.ERR_RTSP_AUTH_CODE = 12;
    /** RTSP protocol error */
    this.ERR_RTSP_PROTO_CODE = 13;
    /** MPEG2TS not supported */
    this.ERR_TS_NO_SUPPORT_CODE = 14;
    /** MPEG2TS protocol error */
    this.ERR_TS_PROTO_CODE = 15;
     /* Error code returned when the append operation in the SourceBuffer failed
     */
    this.ERR_MSE_APPEND_CODE = 17;
    /**
     * Error code returned when the remove operation in the SourceBuffer failed
     */
    this.ERR_MSE_REMOVE_CODE = 18;
    /**
     * Error code returned when MediaSource is not supported by the browser
     */
    this.ERR_MSE_CAPABILITY_ERROR_CODE = 19;

    /**
     * Error code returned when Protected contents are not supported
     */
    this.ERR_MSE_CAPABILITY_MEDIAKEYS_CODE = 20;
    /**
     * Error code returned when a media source type is not supported
     */
    this.ERR_MSE_TYPE_UNSUPPORTED_CODE = 21;
    this.ERR_WS_DISCONNECTED_MSG = "Websocket disconnected";
    this.ERR_RTSP_PROTO_MSG = "RTSP protocol error";
    this.ERR_TS_NO_SUPPORT_MSG = "MPEG2TS not supported!";
    this.ERR_TS_PROTO_MSG = "MPEG2TS protocol parsing error!";
    this.ERR_MSE_APPEND_MSG = "Mediasource append buffer error";
    this.ERR_MSE_REMOVE_MSG = "Mediasource remove buffer error";
    this.ERR_MSE_CAPABILITY_ERROR_MSG = "mediasource is not supported";
    this.ERR_MSE_CAPABILITY_MEDIAKEYS_MSG = "mediakeys is not supported";
    this.ERR_MSE_TYPE_UNSUPPORTED_MSG = "Error creating source buffer of type :";
  }
}
let errors = new Errors();
export default errors;
