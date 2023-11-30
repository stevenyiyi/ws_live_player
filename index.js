import "./styles.css";
import { ASPlayer } from "./src/ASPlayer";
document.getElementById("app").innerHTML = `
<h1>rtsp player</h1>
<div class="video__container">
<video id="test_video" controls autoplay>
</video>
</div>
`;
let video = document.getElementById("test_video");
let player = new ASPlayer({
  /// Websocket connect endpoint
  wsurl: "ws://10.201.2.17/ws_live",
  /// rtsp base endpoint
  /** Play recording */
  rtspurl:
    "rtsp://10.201.2.17:5554/live/50011286121320004002?RecordTimeRange=1701273151_1701278137",
  /** Play live camera */
  /*rtspurl:
    "rtsp://50010303121110099054:991100@192.168.3.100:5554/live/50010303121329905401",*/
  cacheSize: 500,         /// fragment mp4 duration
  video: video,           /// htmlvideoelement
  bufferedDuration: 120,  /// Media source buffer cache duration
  reconnect: true         /// Wether auto reconnecting 
});
/** Error handling */
player.errorHandler = (e) => {
  console.log(e);
};
/** Information handling */
player.infoHandler = (info) => {
  console.log(info);
};
/// scale: default 1  /** 倍速播放，取值为0.25 、0.5 、1 、2 、4 */
player.start(1);
