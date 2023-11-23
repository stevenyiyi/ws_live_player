import "./styles.css";
import { ASPlayer } from "./ASPlayer";
document.getElementById("app").innerHTML = `
<h1>rtsp player</h1>
<div class="video__container">
<video id="test_video" controls autoplay>
    <!--<source src="rtsp://192.168.10.205:554/ch01.264" type="application/x-rtsp">-->
    <!--<source src="rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov" type="application/x-rtsp">-->
</video>
</div>
`;
let video = document.getElementById("test_video");
let player = new ASPlayer({
  wsurl: "wss://192.168.3.100/ws_live",
  rtspurl:
    "rtsp://50010303121110099054:991100@192.168.3.100:5554/live/50010303121329905401", //?RecordTimeRange=1700270399_1700272552",
  cacheSize: 1000,
  video: video,
  bufferedDuration: 15,
  reconnect: true,
});
/** Error handling */
player.errorHandler = (e) => {
  console.log(e);
};
/** Information handling */
player.infoHandler = (info) => {
  console.log(info);
};
player.start();
