import ErrorsBase from "./ErrorBase";
class Errors extends ErrorsBase {
    constructor() {
        super();
        /** Websocket disconnected */
        this.ERR_WS_DISCONNECTED_CODE = 10;
        /** RTSP authenticate error */
        this.ERR_RTSP_AUTH_CODE = 11;
        /** RTSP protocol error */
        this.ERR_RTSP_PROTO_CODE = 12;
        /** MPEG2TS not supported */
        this.ERR_TS_NO_SUPPORT_CODE = 13;
        /** MPEG2TS protocol error */
        this.ERR_TS_PROTO_CODE = 14;
        /** Media source not supported */
        this.ERR_MSE_NOT_SUPPORT_CODE = 15;
        /** Media source error  */
        this.ERR_MSE_CODE = 16;
    }
}
let errors = new Errors();
export default errors;