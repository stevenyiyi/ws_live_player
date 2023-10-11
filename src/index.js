import "./styles.css";
import { ASPlayer } from "./ASPlayer";
document.getElementById("app").innerHTML = `
<h1>rtsp player</h1>
<video id="test_video" controls autoplay>
    <!--<source src="rtsp://192.168.10.205:554/ch01.264" type="application/x-rtsp">-->
    <!--<source src="rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov" type="application/x-rtsp">-->
</video>
`;
let video = document.getElementById("test_video");
let player = new ASPlayer({
  wsurl: "ws://localhost/live",
  rtspurl: "rtsp://localhost:8554/live/50011200121328555763",
  cacheSize: 1000,
  video: video
});
player.start();
