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
        /** Media source not supported */
        this.ERR_MSE_NOT_SUPPORT_CODE = 16;
        /** Media source error  */
        this.ERR_MSE_CODE = 17;
    }
}
let errors = new Errors();
export default errors;