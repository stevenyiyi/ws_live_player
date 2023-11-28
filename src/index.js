import "./styles.css";
import { ASPlayer } from "./ASPlayer";
document.getElementById("app").innerHTML = `
<h1>rtsp player</h1>
<div class="video__container">
<video id="test_video" controls autoplay>
</video>
</div>
`;
let video = document.getElementById("test_video");
let player = new ASPlayer({
  wsurl: "wss://192.168.3.100/ws_live",
  rtspurl:
    "rtsp://50010303121110099054:991100@192.168.3.100:5554/live/50010303121329905401?RecordTimeRange=1700270399_1700272552",
  cacheSize: 500,
  video: video,
  bufferedDuration: 120,
  reconnect: true
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
