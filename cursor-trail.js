document.addEventListener("DOMContentLoaded", () => {
  const startColor = hexToRgb("#f39200"); // orange (point éloigné)
  const endColor = hexToRgb("#e94e1b");   // rouge (point proche)

  const POINTS_COUNT = 10;
  const MAX_SIZE = 16;
  const MIN_SIZE = 6;

  const points = [];
  for (let i = 0; i < POINTS_COUNT; i++) {
    const el = document.createElement("div");
    el.className = "point";

    const t = 1 - i / (POINTS_COUNT - 1);
    const color = lerpColor(startColor, endColor, t);
    el.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

    const size = MIN_SIZE + t * (MAX_SIZE - MIN_SIZE);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    document.body.appendChild(el);

    // Position initiale à (0, 0) pour éviter mauvais placement
    points.push({ el, x: 0, y: 0, size });
  }

  function hexToRgb(hex) {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return m ? {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16)
    } : null;
  }

  function lerpColor(c1, c2, t) {
    return {
      r: Math.round(c1.r + (c2.r - c1.r) * t),
      g: Math.round(c1.g + (c2.g - c1.g) * t),
      b: Math.round(c1.b + (c2.b - c1.b) * t),
    };
  }

  let positions = [];
  const MAX_POSITIONS = 200;

  let isMoving = false;
  let lastMousePos = null;
  let startPos = null;
  let stopTimer = null;
  const STOP_DELAY = 100;

  window.addEventListener("mousemove", (e) => {
    const pos = { x: e.clientX, y: e.clientY, time: performance.now() };

    if (!isMoving) {
      isMoving = true;
      startPos = { x: e.clientX, y: e.clientY };

      // Correction ici : on place tous les points au bon endroit dès le premier mouvement
      for (let p of points) {
        p.x = pos.x;
        p.y = pos.y;
      }

      positions = [pos];
    } else {
      positions.push(pos);
      if (positions.length > MAX_POSITIONS) {
        positions.shift();
      }
    }

    lastMousePos = pos;

    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      isMoving = false;
    }, STOP_DELAY);
  });

  function getPositionAt(t) {
    if (positions.length === 0) return { x: 0, y: 0 };
    if (positions.length === 1) return { x: positions[0].x, y: positions[0].y };

    const startTime = positions[0].time;
    const endTime = positions[positions.length - 1].time;
    const totalDuration = endTime - startTime;

    if (totalDuration === 0) return { x: positions[positions.length - 1].x, y: positions[positions.length - 1].y };

    const targetTime = startTime + t * totalDuration;

    for (let i = 0; i < positions.length - 1; i++) {
      const p1 = positions[i];
      const p2 = positions[i + 1];
      if (targetTime >= p1.time && targetTime <= p2.time) {
        const localT = (targetTime - p1.time) / (p2.time - p1.time);
        return {
          x: p1.x + (p2.x - p1.x) * localT,
          y: p1.y + (p2.y - p1.y) * localT,
        };
      }
    }

    return { x: positions[positions.length - 1].x, y: positions[positions.length - 1].y };
  }

  function animate() {
    requestAnimationFrame(animate);

    if (isMoving) {
      for (let i = 0; i < POINTS_COUNT; i++) {
        const t = 1 - i / (POINTS_COUNT - 1);
        const pos = getPositionAt(t);
        points[i].x = pos.x;
        points[i].y = pos.y;
      }
    } else {
      if (positions.length > 1) {
        positions.shift();
        if (positions.length < 2) {
          const last = positions[positions.length - 1];
          for (let p of points) {
            p.x = last.x;
            p.y = last.y;
          }
          return;
        }
        for (let i = 0; i < POINTS_COUNT; i++) {
          const t = 1 - i / (POINTS_COUNT - 1);
          const pos = getPositionAt(t);
          points[i].x = pos.x;
          points[i].y = pos.y;
        }
      }
    }

    for (let p of points) {
      p.el.style.left = `${p.x}px`;
      p.el.style.top = `${p.y}px`;

    }
  }

  animate();
});
