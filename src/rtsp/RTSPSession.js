import { getTagged } from "../utils/logger.js";

import { RTSPClientSM as RTSPClient } from "./RTSPClient.js";
import { Url } from "../utils/url.js";

const LOG_TAG = "rtsp:session";
const Log = getTagged(LOG_TAG);

export class RTSPSession {
  constructor(client, sessionId) {
    this.state = null;
    this.client = client;
    this.sessionId = sessionId;
    this.url = this.getControlURL();
  }

  reset() {
    this.client = null;
  }

  start(pos = 0, scale = 1) {
    return this.sendPlay(pos, scale);
  }

  stop() {
    return this.sendTeardown();
  }

  getControlURL() {
    let ctrl = this.client.sdp.getSessionBlock().control;
    if (Url.isAbsolute(ctrl)) {
      return ctrl;
    } else if (!ctrl || "*" === ctrl) {
      return this.client.contentBase;
    } else {
      return `${this.client.contentBase}${ctrl}`;
    }
  }

  sendRequest(_cmd, _params = {}) {
    let params = {};
    if (this.sessionId) {
      params["Session"] = this.sessionId;
    }
    Object.assign(params, _params);
    return this.client.sendRequest(_cmd, this.getControlURL(), params);
  }

  async sendPlay(pos = 0, scale = 1) {
    this.state = RTSPClient.STATE_PLAY;
    let params = {};
    if(scale !== this.client.scale) {
      params["Scale"] = scale;
      this.client.scale = scale;
    } else {
      if(pos === 0) {
        params["Range"] = "npt=now-";
      } else {
        params["Range"] = `npt=${pos}-`;
      }
      this.client.pos = pos;
    }

    let data = await this.sendRequest("PLAY", params);
    this.state = RTSPClient.STATE_PLAYING;
    return { data: data };
  }

  async sendPause() {
    if (!this.client.supports("PAUSE")) {
      return;
    }
    this.state = RTSPClient.STATE_PAUSE;
    await this.sendRequest("PAUSE");
    this.state = RTSPClient.STATE_PAUSED;
  }

  async sendTeardown() {
    if (this.state !== RTSPClient.STATE_TEARDOWN) {
      this.state = RTSPClient.STATE_TEARDOWN;
      await this.sendRequest("TEARDOWN");
      Log.log("RTSPClient: STATE_TEARDOWN");
      ///this.client.connection.disconnect();
      // TODO: Notify client
    }
  }
}
