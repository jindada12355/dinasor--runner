(function () {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const C = GameCore.CONSTANTS;

  const PALETTE = {
    bg: '#0d0f2b',
    grid: 'rgba(0, 229, 255, 0.07)',
    ground: '#00e5ff',
    dino: '#00e5ff',
    dinoFill: 'rgba(0, 229, 255, 0.15)',
    obstacle: '#ff2d95',
    obstacleFill: 'rgba(255, 45, 149, 0.15)',
    text: '#00e5ff',
  };

  let state = GameCore.createInitialState();
  let highScore = loadHighScore();
  let input = { jump: false, duck: false };
  let scrollX = 0; // 累计滚动距离，用于背景视差

  // 远景星星（视差层），加载时生成一次
  const stars = [];
  (function initStars() {
    for (let i = 0; i < 70; i++) {
      const depth = Math.random();
      stars.push({
        x: Math.random() * C.WIDTH,
        y: Math.random() * (C.GROUND_Y - 40),
        depth: depth,
        r: depth > 0.65 ? 1.5 : 1,
      });
    }
  })();

  function loadHighScore() {
    try { return parseInt(localStorage.getItem('dino-highscore'), 10) || 0; }
    catch (e) { return 0; }
  }
  function saveHighScore(value) {
    try { localStorage.setItem('dino-highscore', String(value)); }
    catch (e) { /* 隐私模式等场景下最高分仅存内存 */ }
  }

  function restart() {
    state = GameCore.createInitialState();
    input = { jump: false, duck: false };
    scrollX = 0;
  }

  function onKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (state.gameOver) { if (!e.repeat) restart(); return; }
      if (!e.repeat) input.jump = true;
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      input.duck = true;
    }
  }
  function onKeyUp(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') input.jump = false;
    else if (e.code === 'ArrowDown') input.duck = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', function () { input = { jump: false, duck: false }; });

  // ---- 渲染 ----
  function drawNeon(pathFn, color, fill) {
    ctx.save();
    ctx.beginPath();
    pathFn();
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.stroke();
    ctx.restore();
  }

  function drawBackground() {
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, C.WIDTH, C.HEIGHT);
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = PALETTE.grid;
    ctx.lineWidth = 1;
    const spacing = 60;
    const offset = scrollX % spacing;
    for (let x = -offset; x < C.WIDTH; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, C.HEIGHT);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGround() {
    drawNeon(function () {
      ctx.moveTo(0, C.GROUND_Y);
      ctx.lineTo(C.WIDTH, C.GROUND_Y);
    }, PALETTE.ground, null);
  }

  function drawStars() {
    ctx.save();
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const factor = 0.1 + s.depth * 0.3; // 视差：越深越慢（0.1x~0.4x）
      const x = ((s.x - scrollX * factor) % C.WIDTH + C.WIDTH) % C.WIDTH;
      ctx.fillStyle = 'rgba(0, 229, 255, ' + (0.15 + s.depth * 0.35).toFixed(2) + ')';
      ctx.fillRect(x, s.y, s.r, s.r);
    }
    ctx.restore();
  }

  function drawGroundDashes() {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
    ctx.lineWidth = 2;
    const dashLen = 24;
    const gap = 24;
    const period = dashLen + gap;
    const offset = scrollX % period;
    const y = C.GROUND_Y + 12;
    for (let x = -offset; x < C.WIDTH; x += period) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dashLen, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function traceDinoStanding(w, h) {
    ctx.moveTo(w * 0.08, h * 0.60);
    ctx.lineTo(w * 0.28, h * 0.52);
    ctx.lineTo(w * 0.28, h * 0.36);
    ctx.lineTo(w * 0.44, h * 0.28);
    ctx.lineTo(w * 0.48, h * 0.16);
    ctx.lineTo(w * 0.60, h * 0.12);
    ctx.lineTo(w * 0.84, h * 0.16);
    ctx.lineTo(w * 0.92, h * 0.28);
    ctx.lineTo(w * 0.84, h * 0.36);
    ctx.lineTo(w * 0.68, h * 0.40);
    ctx.lineTo(w * 0.64, h * 0.56);
    ctx.lineTo(w * 0.68, h * 0.68);
    ctx.lineTo(w * 0.60, h * 0.68);
    ctx.lineTo(w * 0.60, h * 0.56);
    ctx.lineTo(w * 0.48, h * 0.68);
    ctx.lineTo(w * 0.40, h * 0.68);
    ctx.lineTo(w * 0.40, h * 0.52);
    ctx.closePath();
  }

  function traceDinoDuck(w, h) {
    ctx.moveTo(w * 0.06, h * 0.72);
    ctx.lineTo(w * 0.26, h * 0.60);
    ctx.lineTo(w * 0.26, h * 0.44);
    ctx.lineTo(w * 0.44, h * 0.40);
    ctx.lineTo(w * 0.60, h * 0.34);
    ctx.lineTo(w * 0.82, h * 0.40);
    ctx.lineTo(w * 0.92, h * 0.56);
    ctx.lineTo(w * 0.84, h * 0.62);
    ctx.lineTo(w * 0.68, h * 0.58);
    ctx.lineTo(w * 0.66, h * 0.78);
    ctx.lineTo(w * 0.56, h * 0.78);
    ctx.lineTo(w * 0.56, h * 0.60);
    ctx.lineTo(w * 0.42, h * 0.78);
    ctx.lineTo(w * 0.32, h * 0.78);
    ctx.lineTo(w * 0.32, h * 0.60);
    ctx.closePath();
  }

  function drawDino() {
    const d = state.dino;
    ctx.save();
    ctx.translate(d.x, d.y);
    drawNeon(function () {
      if (d.ducking) traceDinoDuck(C.DINO_W, d.height);
      else traceDinoStanding(C.DINO_W, d.height);
    }, PALETTE.dino, PALETTE.dinoFill);
    ctx.restore();
  }

  function drawCactus(o) {
    drawNeon(function () {
      const tw = o.width * 0.4;
      const cx = o.x + o.width / 2;
      ctx.rect(cx - tw / 2, o.y, tw, o.height);
      ctx.rect(cx - tw / 2 - o.width * 0.25, o.y + o.height * 0.2, o.width * 0.25, o.height * 0.12);
      ctx.rect(cx - tw / 2 - o.width * 0.25, o.y + o.height * 0.2, o.width * 0.12, o.height * 0.3);
      ctx.rect(cx + tw / 2, o.y + o.height * 0.3, o.width * 0.25, o.height * 0.12);
      ctx.rect(cx + tw / 2 + o.width * 0.13, o.y + o.height * 0.3, o.width * 0.12, o.height * 0.3);
    }, PALETTE.obstacle, PALETTE.obstacleFill);
  }

  function drawBird(o) {
    drawNeon(function () {
      ctx.moveTo(o.x, o.y + o.height);
      ctx.lineTo(o.x + o.width * 0.5, o.y);
      ctx.lineTo(o.x + o.width, o.y + o.height);
      ctx.closePath();
      ctx.moveTo(o.x + o.width * 0.15, o.y + o.height * 0.55);
      ctx.lineTo(o.x + o.width * 0.5, o.y + o.height * 0.45);
      ctx.lineTo(o.x + o.width * 0.85, o.y + o.height * 0.55);
    }, PALETTE.obstacle, PALETTE.obstacleFill);
  }

  function drawObstacle(o) {
    if (o.type === 'cactus') drawCactus(o);
    else drawBird(o);
  }

  function drawScore() {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.shadowBlur = 10;
    ctx.fillStyle = PALETTE.text;
    ctx.shadowColor = PALETTE.text;
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText(String(state.score).padStart(5, '0'), C.WIDTH - 20, 34);
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText('HI ' + String(highScore).padStart(5, '0'), C.WIDTH - 20, 58);
    ctx.restore();
  }

  function drawGameOver() {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.obstacle;
    ctx.shadowBlur = 20;
    ctx.shadowColor = PALETTE.obstacle;
    ctx.font = '40px "Courier New", monospace';
    ctx.fillText('GAME OVER', C.WIDTH / 2, C.HEIGHT / 2 - 20);
    ctx.fillStyle = PALETTE.text;
    ctx.shadowColor = PALETTE.text;
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('按空格重新开始', C.WIDTH / 2, C.HEIGHT / 2 + 20);
    ctx.restore();
  }

  function render() {
    drawBackground();
    drawStars();
    drawGrid();
    drawGround();
    drawGroundDashes();
    drawDino();
    for (let i = 0; i < state.obstacles.length; i++) drawObstacle(state.obstacles[i]);
    drawScore();
    if (state.gameOver) drawGameOver();
  }

  // ---- 游戏循环（固定步长 60fps，处理高刷屏与后台恢复） ----
  const STEP_MS = 1000 / 60;
  let accumulator = 0;
  let lastTime = performance.now();

  function loop(now) {
    const dt = now - lastTime;
    lastTime = now;
    accumulator += Math.min(dt, 100); // 后台恢复最多补 100ms，防止瞬跳

    while (accumulator >= STEP_MS) {
      state = GameCore.step(state, input, Math.random);
      if (!state.gameOver) scrollX += state.speed; // 死亡后背景冻结
      input.jump = false; // 跳跃是边沿触发，消费掉本帧的跳跃请求
      accumulator -= STEP_MS;
    }

    if (!state.gameOver && state.score > highScore) {
      highScore = state.score;
      saveHighScore(highScore);
    }

    render();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
