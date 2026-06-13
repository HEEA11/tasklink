document.addEventListener('DOMContentLoaded', function () {
  const scene = document.querySelector('#ink_scene');
  const paintedLayer = document.querySelector('#painted_elements');
  const brushCanvas = document.querySelector('#brush_canvas');
  const brush = brushCanvas.getContext('2d');
  const assets = [
    { type: 'object', src: 'object1.png', width: [120, 190], opacity: 0.82, yLift: 0 },
    { type: 'object', src: 'object2.png', width: [110, 180], opacity: 0.8, yLift: 0 },
    { type: 'object', src: 'object3.png', width: [115, 185], opacity: 0.82, yLift: 0 },
    { type: 'object', src: 'object4.png', width: [125, 200], opacity: 0.78, yLift: 0 },
    { type: 'object', src: 'object5.png', width: [110, 175], opacity: 0.8, yLift: 0 },
    { type: 'object', src: 'object6.png', width: [118, 188], opacity: 0.82, yLift: 0 },
    { type: 'object', src: 'object7.png', width: [112, 182], opacity: 0.8, yLift: 0 },
    { type: 'object', src: 'object8.png', width: [90, 150], opacity: 0.84, yLift: 0 },
    { type: 'object', src: 'object9.png', width: [118, 190], opacity: 0.8, yLift: 0 },
    { type: 'object', src: 'object10.png', width: [104, 170], opacity: 0.82, yLift: 0 }
  ];
  let clickCount = 0;
  let isDrawing = false;
  let didDrag = false;
  let lastPoint = null;
  let activePointerId = null;

  function resizeBrushCanvas() {
    const rect = scene.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    brushCanvas.width = rect.width * ratio;
    brushCanvas.height = rect.height * ratio;
    brushCanvas.style.width = rect.width + 'px';
    brushCanvas.style.height = rect.height + 'px';
    brush.setTransform(ratio, 0, 0, ratio, 0, 0);
    brush.lineCap = 'round';
    brush.lineJoin = 'round';
  }

  function getPoint(event) {
    const rect = scene.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      pressure: event.pressure || 0.45,
      time: performance.now()
    };
  }

  function drawBrushStroke(from, to) {
    const marks = Number(brushCanvas.dataset.brushMarks || 0) + 1;
    brushCanvas.dataset.brushMarks = marks;

    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const elapsed = Math.max(16, to.time - from.time);
    const speed = distance / elapsed;
    const pressure = Math.max(from.pressure, to.pressure, 0.32);
    const width = Math.max(5, Math.min(26, 18 * pressure - speed * 11 + Math.random() * 2.6));
    const midX = (from.x + to.x) / 2 + (Math.random() - 0.5) * 1.8;
    const midY = (from.y + to.y) / 2 + (Math.random() - 0.5) * 1.8;

    brush.save();
    brush.globalCompositeOperation = 'source-over';
    brush.strokeStyle = 'rgba(28, 34, 28, 0.56)';
    brush.lineWidth = width;
    brush.beginPath();
    brush.moveTo(from.x, from.y);
    brush.quadraticCurveTo(midX, midY, to.x, to.y);
    brush.stroke();

    brush.strokeStyle = 'rgba(38, 48, 38, 0.18)';
    brush.lineWidth = width * 1.9;
    brush.beginPath();
    brush.moveTo(from.x + 1, from.y - 1);
    brush.quadraticCurveTo(midX, midY, to.x, to.y);
    brush.stroke();

    if (distance > 8) {
      brush.fillStyle = 'rgba(20, 24, 20, 0.14)';
      for (let i = 0; i < 3; i += 1) {
        const scatter = Math.random() * width * 0.9;
        brush.beginPath();
        brush.arc(
          to.x + (Math.random() - 0.5) * scatter,
          to.y + (Math.random() - 0.5) * scatter,
          Math.random() * 1.8,
          0,
          Math.PI * 2
        );
        brush.fill();
      }
    }
    brush.restore();
  }

  function placeElement(event) {
    const rect = scene.getBoundingClientRect();
    const asset = assets[clickCount % assets.length];
    const element = document.createElement('img');
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const randomOffsetX = (Math.random() - 0.5) * 42;
    const randomOffsetY = (Math.random() - 0.5) * 30;
    const width = asset.width[0] + Math.random() * (asset.width[1] - asset.width[0]);
    const scale = 0.86 + Math.random() * 0.28;
    const rotate = -18 + Math.random() * 36;

    element.className = 'paint_element ' + asset.type;
    element.src = asset.src;
    element.alt = '';
    element.style.setProperty('--x', x + randomOffsetX + 'px');
    element.style.setProperty('--y', y + randomOffsetY - asset.yLift + 'px');
    element.style.setProperty('--width', width + 'px');
    element.style.setProperty('--scale', scale);
    element.style.setProperty('--rotate', rotate + 'deg');
    element.style.setProperty('--opacity', asset.opacity);

    paintedLayer.appendChild(element);
    clickCount += 1;
  }

  resizeBrushCanvas();
  window.addEventListener('resize', resizeBrushCanvas);

  scene.addEventListener('pointerdown', function (event) {
    isDrawing = true;
    didDrag = false;
    activePointerId = event.pointerId;
    lastPoint = getPoint(event);
    scene.setPointerCapture(event.pointerId);
  });

  scene.addEventListener('pointermove', function (event) {
    if (!isDrawing || event.pointerId !== activePointerId) return;

    const nextPoint = getPoint(event);
    const distance = Math.hypot(nextPoint.x - lastPoint.x, nextPoint.y - lastPoint.y);

    if (distance > 2) {
      didDrag = true;
      drawBrushStroke(lastPoint, nextPoint);
      lastPoint = nextPoint;
    }
  });

  scene.addEventListener('pointerup', function (event) {
    if (event.pointerId !== activePointerId) return;

    if (!didDrag) {
      placeElement(event);
    }

    isDrawing = false;
    activePointerId = null;
    lastPoint = null;
  });

  scene.addEventListener('pointercancel', function () {
    isDrawing = false;
    activePointerId = null;
    lastPoint = null;
  });
});
