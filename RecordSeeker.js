export function RecordSeeker(dom, options) {
  const config = {
    minHeight: 40,
    minWidth: 100,
    padding: 8,
    pointSpace: 10,
    defaultColors: {
      scaleStart: "#000",
      scaleEnd: "#000",
      scaleLine: "#000",
      scaleTextStart: "#333",
      scaleTextEnd: "#333",
      scalePointsSmall: "#0063a9",
      scalePointsBig: "#0190f5",
      activePointStroke: "black",
      activePointFill: "rgba(100, 191, 255, 1.0)",
      activeTipsBackground: "rgba(100, 191, 255, 0.8)",
      activeTipsText: "white",
      hoverPointStroke: "black",
      hoverPointFill: "white",
      hoverTipsBackground: "rgba(0, 0, 0, 0.8)",
      hoverTipsText: "white",
      controlBtn: "#000",
    },
    darkColors: {
      scaleStart: "#bbb",
      scaleEnd: "#bbb",
      scaleLine: "#bbb",
      scaleTextStart: "#ccc",
      scaleTextEnd: "#ccc",
      scalePointsSmall: "#fff",
      scalePointsBig: "#fff",
      activePointStroke: "#fff",
      activePointFill: "rgba(100, 191, 255, 1.0)",
      activeTipsBackground: "rgba(100, 191, 255, 0.8)",
      activeTipsText: "white",
      hoverPointStroke: "#fff",
      hoverPointFill: "#eee",
      hoverTipsBackground: "#666",
      hoverTipsText: "white",
      controlBtn: "#fff",
    },
  };
  const dpr = window.devicePixelRatio;
  config.padding /= dpr;
  config.pointSpace /= dpr;
  const domStyle = window.getComputedStyle(dom);
  const padding = config.padding;
  let height =
    options.height || Math.max(parseFloat(domStyle.height), config.minHeight);
  let width =
    options.width || Math.max(parseFloat(domStyle.width, config.minWidth));
  const chunks = options.chunks;
  const beginTime = options.beginTime;
  const endTime = options.endTime;
  let canvas = null;
  let ctx = null;
  let events = {};
  let hoverTime = null;
  let activeTime = 0;
  let colors = null;
  let duration =
    ((new Date(endTime)).valueOf() - (new Date(beginTime)).valueOf())/1000;

  console.log(`width:${width},beginTime:${beginTime},endTime:${endTime}, duration:${duration}`);
  /// Theme
  if (options.colors) {
    colors = Object.assign(config, options.colors);
  } else {
    colors =
      options.theme === "dark" ? config.darkColors : config.defaultColors;
  }

  /// Canvas
  setupCanvas();
  function setupCanvas() {
    /// Create canvas
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    ctx.width = `${width + padding * 2}px`;
    ctx.height = `${height}px`;
    dom.appendChild(canvas);

    /// Scale canvas
    canvas.width = canvas.width * dpr;
    canvas.height = canvas.height * dpr;
    console.log(`dpr:${dpr}`);
    ctx.scale(dpr, dpr);
    width /= dpr;
    height /= dpr;
  }
  setupEvent();
  function setupEvent() {
    canvas.onmousemove = (e) => {
      /// Calucate hover index
      const offset = e.offsetX / dpr - padding;
      const percent = offset / width;
      hoverTime = duration * percent;
      /// draw
      draw();
    };

    canvas.onmouseleave = () => {
      hoverTime = null;
      /// draw
      draw();
    };

    canvas.onclick = (e) => {
      const offset = e.offsetX / dpr - padding;
      const percent = offset / width;
      activeTime = duration * percent;
      /// draw
      draw();
    };
  }

  function _getText(time) {
    let stime = "";
    if (time >= 3600) {
      stime = `${Math.round(time / 3600)}小时${Math.round(
        time % 3600 / 60
      )}分${Math.round(time % 60)}秒`;
    } else if (time >= 60) {
      stime = `${Math.round(time / 60)}分${Math.round(time % 60)}秒`;
    } else {
      stime = `${time}秒`;
    }
    return stime;
  }

  function drawScale() {
    const step = width / (chunks - 1);
    /// draw left and right end line
    ctx.lineWidth = 2 / dpr;
    ctx.beginPath();
    ctx.moveTo(padding, 0);
    ctx.lineTo(padding, height);
    ctx.strokeStyle = colors.scaleStart;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width + padding, 0);
    ctx.lineTo(width + padding, height);
    ctx.strokeStyle = colors.scaleEnd;
    ctx.stroke();

    // draw horizontal line
    ctx.beginPath();
    ctx.moveTo(padding, height / 2);
    ctx.lineTo(width + padding, height / 2);
    ctx.lineWidth = 1 / dpr;
    ctx.strokeStyle = colors.scaleLine;
    ctx.stroke();

    // draw start and end text
    ctx.textBaseline = "top";
    ctx.font = `${10/dpr}px Orbitron`;
    ctx.textAlign = "left";
    ctx.fillStyle = colors.scaleTextStart;
    ctx.fillText(beginTime, padding + 4 / dpr, 0);

    ctx.textAlign = "right";
    ctx.fillStyle = colors.scaleTextEnd;
    ctx.fillText(endTime, width + padding - 4 / dpr, 0);

    // draw scale points
    ctx.beginPath();
    let stepWidth = 0;
    const bigPoints = [];
    for (let i = 1; i * step < width; i++) {
      stepWidth += step;
      let fillcolor;
      let pointWidth;
      if (stepWidth >= config.pointSpace) {
        stepWidth = 0;
        pointWidth = 4 / dpr;
        bigPoints.push({
          leftX: i * step - pointWidth / 2 + padding,
          leftY: height / 2 - pointWidth / 2,
        });
      } else {
        pointWidth = 1.5;
        fillcolor = colors.scalePointsSmall;
        const leftX = i * step - pointWidth / 2 + padding;
        const leftY = height / 2 - pointWidth / 2;
        ctx.fillStyle = fillcolor;
        ctx.fillRect(leftX, leftY, pointWidth, pointWidth);
      }
    }

    bigPoints.forEach(({ leftX, leftY }) => {
      ctx.fillStyle = colors.scalePointsBig;
      ctx.fillRect(leftX, leftY, 4 / dpr, 4 / dpr);
    });
  }

  function drawHover() {
    if (hoverTime !== null) {
      ctx.beginPath();
      ctx.arc(
        (hoverTime / duration) * width + padding,
        height / 2,
        4 / dpr,
        0,
        Math.PI * 2
      );
      ctx.lineWidth = 1;
      ctx.fillStyle = colors.hoverPointFill;
      ctx.strokeStyle = colors.hoverPointStroke;
      ctx.stroke();
      ctx.fill();

      ctx.textBaseline = "top";

      const textInfo = ctx.measureText(_getText(hoverTime));

      let bgLeft;
      let textX;
      const bgOffset = 5 / dpr;
      const textOffset = 5 / dpr;
      if (hoverTime > duration / 2) {
        ctx.textAlign = "right";
        bgLeft =
          (hoverTime / duration) * width +
          padding -
          textInfo.width -
          textOffset * 2 -
          bgOffset;
        textX =
          (hoverTime / duration) * width + padding - textOffset - bgOffset;
      } else {
        ctx.textAlign = "left";
        bgLeft = (hoverTime / duration) * width + padding + bgOffset;
        textX = bgLeft + textOffset;
      }

      ctx.fillStyle = colors.hoverTipsBackground;
      ctx.fillRect(bgLeft, 0, textInfo.width + 10 / dpr, 14 / dpr);

      ctx.fillStyle = colors.hoverTipsText;
      ctx.fillText(_getText(hoverTime), textX, 2 / dpr);
    }
  }

  function drawActive() {
   
    ctx.beginPath();
    ctx.arc(activeTime / duration * width + padding, height / 2, 4 / dpr, 0, Math.PI * 2);
    ctx.lineWidth = 2/dpr;
    ctx.strokeStyle = colors.activePointStroke;
    ctx.fillStyle = colors.activePointFill;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    //

    ctx.font = `${12/dpr}px Orbitron`;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
    const textInfo = ctx.measureText(_getText(activeTime));

    let bgLeft;
    let textX;
    let textPadding = 5 / dpr;
    let bgOffset = 5 / dpr;
    const rectWidth = textInfo.width + textPadding * 2;

    if (activeTime > duration / 2) {
      ctx.textAlign = "right";
      bgLeft = activeTime / duration * width + padding - rectWidth - bgOffset;
      textX = activeTime / duration * width + padding - bgOffset - textPadding;
    } else {
      ctx.textAlign = "left";
      bgLeft = activeTime / duration * width + padding + bgOffset;
      textX = bgLeft + textPadding;
    }
    ctx.fillStyle = colors.activeTipsBackground;
    ctx.fillRect(bgLeft, height - 14 / dpr, rectWidth, 14 / dpr);
    //
    ctx.fillStyle = colors.activeTipsText;
    ctx.fillText(_getText(activeTime), textX, height);
  }

  function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawScale();
    drawHover();
    drawActive();
  }
  return {};
}
