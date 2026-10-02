# 霓虹恐龙跑酷 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用原生 Canvas + JavaScript 实现一个零依赖、打开即玩的霓虹风极简恐龙跑酷游戏。

**Architecture:** 纯游戏逻辑（物理、碰撞、障碍物、难度、计分）全部抽成无 DOM/canvas 依赖的纯函数，放进 `game-core.js`，用 Node 内置 `node:test` 做 TDD；渲染、输入、游戏循环、最高分持久化放在 `game.js`。浏览器通过 `<script>` 加载 `game-core.js`（挂到 `window.GameCore`），Node 测试通过 `require` 加载同一个文件（`module.exports`）。

**Tech Stack:** 原生 JavaScript（ES2015+）、HTML5 Canvas、Node.js 内置测试运行器（`node:test` + `node:assert/strict`）。零外部依赖、零构建。

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `index.html` | 页面骨架：`<canvas>` + 加载 `game-core.js`/`game.js`/`style.css` |
| `style.css` | 深色页面背景、居中画布、霓虹标题样式 |
| `game-core.js` | 纯游戏逻辑（常量、状态、物理、碰撞、障碍物、难度、计分、step） |
| `game.js` | 霓虹渲染、键盘输入、固定步长游戏循环、最高分持久化 |
| `tests/state.test.js` | `createInitialState` 测试 |
| `tests/physics.test.js` | `updateDino` 物理测试 |
| `tests/collision.test.js` | `aabbOverlap`/`collides` 测试 |
| `tests/obstacles.test.js` | 障碍物移动/生成、难度、计分测试 |
| `tests/step.test.js` | `step` 整合与死亡判定测试 |

**测试命令：** 单文件 `node --test tests/state.test.js`；全部 `node --test`（自动发现 `tests/*.test.js`）。

---

## Task 1: 项目骨架 + 常量与初始状态

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `game-core.js`
- Create: `tests/state.test.js`

- [ ] **Step 1: 写失败测试**

创建 `tests/state.test.js`：

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const GameCore = require('../game-core.js');

const C = GameCore.CONSTANTS;

test('createInitialState 返回正确的初始状态', () => {
  const s = GameCore.createInitialState();
  assert.equal(s.dino.x, C.DINO_X);
  assert.equal(s.dino.y, C.GROUND_Y - C.DINO_H_STAND);
  assert.equal(s.dino.onGround, true);
  assert.equal(s.dino.vy, 0);
  assert.equal(s.dino.height, C.DINO_H_STAND);
  assert.equal(s.dino.ducking, false);
  assert.deepEqual(s.obstacles, []);
  assert.equal(s.speed, C.BASE_SPEED);
  assert.equal(s.distance, 0);
  assert.equal(s.score, 0);
  assert.equal(s.gameOver, false);
  assert.equal(s.spawnTimer, C.INITIAL_SPAWN_DELAY);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/state.test.js`
Expected: FAIL，报 `Cannot find module '../game-core.js'`

- [ ] **Step 3: 实现 `game-core.js`（常量 + `createInitialState`）**

创建 `game-core.js`：

```js
(function (global) {
  'use strict';

  const CONSTANTS = {
    WIDTH: 900,
    HEIGHT: 300,
    GROUND_Y: 250,
    DINO_X: 80,
    DINO_W: 50,
    DINO_H_STAND: 50,
    DINO_H_DUCK: 30,
    GRAVITY: 0.7,
    JUMP_VY: -13,
    FALL_BOOST_VY: 1.2,
    BASE_SPEED: 6,
    MAX_SPEED: 13,
    SPEED_RAMP: 0.002,
    SCORE_DIVISOR: 10,
    CACTUS_W: 30,
    CACTUS_H: 40,
    BIRD_W: 44,
    BIRD_H: 26,
    BIRD_LOW_BOTTOM: 210,
    BIRD_HIGH_BOTTOM: 155,
    MIN_SPAWN_GAP: 60,
    MAX_SPAWN_GAP: 160,
    INITIAL_SPAWN_DELAY: 90,
  };

  const GameCore = { CONSTANTS };

  GameCore.createInitialState = function () {
    return {
      dino: {
        x: CONSTANTS.DINO_X,
        y: CONSTANTS.GROUND_Y - CONSTANTS.DINO_H_STAND,
        vy: 0,
        height: CONSTANTS.DINO_H_STAND,
        ducking: false,
        onGround: true,
      },
      obstacles: [],
      speed: CONSTANTS.BASE_SPEED,
      distance: 0,
      score: 0,
      gameOver: false,
      spawnTimer: CONSTANTS.INITIAL_SPAWN_DELAY,
    };
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameCore;
  } else {
    global.GameCore = GameCore;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `node --test tests/state.test.js`
Expected: PASS（1 个测试通过）

- [ ] **Step 5: 创建 `index.html` 与 `style.css`**

创建 `index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>霓虹恐龙跑酷</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="stage">
    <h1 class="title">霓虹恐龙跑酷</h1>
    <canvas id="game" width="900" height="300"></canvas>
    <p class="hint">空格 / ↑ 跳跃　·　↓ 下蹲</p>
  </div>
  <script src="game-core.js"></script>
  <script src="game.js"></script>
</body>
</html>
```

创建 `style.css`：

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #05060f;
  color: #00e5ff;
  font-family: "Courier New", monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.stage { text-align: center; }

.title {
  font-size: 26px;
  letter-spacing: 6px;
  margin-bottom: 16px;
  text-shadow: 0 0 12px #00e5ff;
}

canvas {
  display: block;
  max-width: 90vw;
  height: auto;
  border: 1px solid rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.25);
  background: #0d0f2b;
}

.hint {
  margin-top: 14px;
  font-size: 14px;
  color: rgba(0, 229, 255, 0.7);
}
```

（`game.js` 在 Task 6 创建；在此之前 `index.html` 对它的引用会 404，但不影响 `node --test` 测试。）

- [ ] **Step 6: 提交**

```bash
git add index.html style.css game-core.js tests/state.test.js
git commit -m "feat: 游戏骨架 + 核心常量与初始状态"
```

---

## Task 2: 恐龙物理（重力 / 跳跃 / 下蹲）

**Files:**
- Modify: `game-core.js`（新增 `updateDino`）
- Create: `tests/physics.test.js`

- [ ] **Step 1: 写失败测试**

创建 `tests/physics.test.js`：

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const GameCore = require('../game-core.js');

const C = GameCore.CONSTANTS;
const fresh = () => GameCore.createInitialState();

test('跳跃：地面按跳会离地并给向上速度', () => {
  const s = fresh();
  GameCore.updateDino(s, { jump: true, duck: false });
  assert.equal(s.dino.onGround, false);
  assert.equal(s.dino.vy, C.JUMP_VY + C.GRAVITY);
});

test('重力：跳跃后多帧会回落到地面', () => {
  const s = fresh();
  GameCore.updateDino(s, { jump: true, duck: false });
  for (let i = 0; i < 100; i++) GameCore.updateDino(s, { jump: false, duck: false });
  assert.equal(s.dino.onGround, true);
  assert.equal(s.dino.y, C.GROUND_Y - s.dino.height);
  assert.equal(s.dino.vy, 0);
});

test('下蹲：地面按蹲会变矮且贴地', () => {
  const s = fresh();
  GameCore.updateDino(s, { jump: false, duck: true });
  assert.equal(s.dino.ducking, true);
  assert.equal(s.dino.height, C.DINO_H_DUCK);
  assert.equal(s.dino.y, C.GROUND_Y - C.DINO_H_DUCK);
});

test('空中下蹲会加速下落', () => {
  const s = fresh();
  GameCore.updateDino(s, { jump: true, duck: false });
  const vyBefore = s.dino.vy;
  GameCore.updateDino(s, { jump: false, duck: true });
  assert.ok(s.dino.vy > vyBefore);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/physics.test.js`
Expected: FAIL，报 `GameCore.updateDino is not a function`

- [ ] **Step 3: 实现 `updateDino`**

在 `game-core.js` 中，`GameCore.createInitialState = ... };` 之后、`if (typeof module ...` 之前插入：

```js
  GameCore.updateDino = function (state, input) {
    const dino = state.dino;

    // 1. 起跳（仅在地面）
    if (dino.onGround && input.jump) {
      dino.vy = CONSTANTS.JUMP_VY;
      dino.onGround = false;
      dino.ducking = false;
      dino.height = CONSTANTS.DINO_H_STAND;
    }

    // 2. 下蹲（地面切换姿势 / 空中加速下落）
    if (dino.onGround) {
      dino.ducking = !!input.duck;
      dino.height = dino.ducking ? CONSTANTS.DINO_H_DUCK : CONSTANTS.DINO_H_STAND;
      dino.y = CONSTANTS.GROUND_Y - dino.height;
    } else if (input.duck) {
      dino.vy += CONSTANTS.FALL_BOOST_VY;
    }

    // 3. 重力与位移（仅空中）
    if (!dino.onGround) {
      dino.vy += CONSTANTS.GRAVITY;
      dino.y += dino.vy;
      if (dino.y >= CONSTANTS.GROUND_Y - dino.height) {
        dino.y = CONSTANTS.GROUND_Y - dino.height;
        dino.vy = 0;
        dino.onGround = true;
        dino.ducking = false;
        dino.height = CONSTANTS.DINO_H_STAND;
      }
    }

    return dino;
  };
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `node --test tests/physics.test.js`
Expected: PASS（4 个测试通过）

- [ ] **Step 5: 提交**

```bash
git add game-core.js tests/physics.test.js
git commit -m "feat: 恐龙物理（重力/跳跃/下蹲）"
```

---

## Task 3: 碰撞检测（AABB）

**Files:**
- Modify: `game-core.js`（新增 `dinoRect`、`aabbOverlap`、`collides`）
- Create: `tests/collision.test.js`

- [ ] **Step 1: 写失败测试**

创建 `tests/collision.test.js`：

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const GameCore = require('../game-core.js');

const C = GameCore.CONSTANTS;

test('aabbOverlap：重叠返回 true', () => {
  assert.equal(GameCore.aabbOverlap(
    { x: 0, y: 0, width: 10, height: 10 },
    { x: 5, y: 5, width: 10, height: 10 }
  ), true);
});

test('aabbOverlap：不相交返回 false', () => {
  assert.equal(GameCore.aabbOverlap(
    { x: 0, y: 0, width: 10, height: 10 },
    { x: 20, y: 20, width: 10, height: 10 }
  ), false);
});

test('aabbOverlap：边界相切不重叠返回 false', () => {
  assert.equal(GameCore.aabbOverlap(
    { x: 0, y: 0, width: 10, height: 10 },
    { x: 10, y: 0, width: 10, height: 10 }
  ), false);
});

test('collides：恐龙与障碍物重叠时返回 true', () => {
  const s = GameCore.createInitialState();
  s.obstacles = [{
    type: 'cactus',
    x: C.DINO_X,
    y: C.GROUND_Y - C.CACTUS_H,
    width: C.CACTUS_W,
    height: C.CACTUS_H,
  }];
  assert.equal(GameCore.collides(s), true);
});

test('collides：无障碍物时返回 false', () => {
  const s = GameCore.createInitialState();
  assert.equal(GameCore.collides(s), false);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/collision.test.js`
Expected: FAIL，报 `GameCore.aabbOverlap is not a function`

- [ ] **Step 3: 实现碰撞函数**

在 `game-core.js` 的 `updateDino` 之后插入：

```js
  GameCore.dinoRect = function (dino) {
    return { x: dino.x, y: dino.y, width: CONSTANTS.DINO_W, height: dino.height };
  };

  GameCore.aabbOverlap = function (a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  GameCore.collides = function (state) {
    const dino = GameCore.dinoRect(state.dino);
    return state.obstacles.some(function (o) {
      return GameCore.aabbOverlap(dino, { x: o.x, y: o.y, width: o.width, height: o.height });
    });
  };
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `node --test tests/collision.test.js`
Expected: PASS（5 个测试通过）

- [ ] **Step 5: 提交**

```bash
git add game-core.js tests/collision.test.js
git commit -m "feat: AABB 碰撞检测"
```

---

## Task 4: 障碍物移动/生成、难度、计分

**Files:**
- Modify: `game-core.js`（新增 `updateObstacles`、`maybeSpawnObstacle`、`updateDifficulty`、`updateScore`）
- Create: `tests/obstacles.test.js`

- [ ] **Step 1: 写失败测试**

创建 `tests/obstacles.test.js`：

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const GameCore = require('../game-core.js');

const C = GameCore.CONSTANTS;
const fresh = () => GameCore.createInitialState();

test('updateObstacles：向左移动并移除出屏的', () => {
  const obstacles = [
    { type: 'cactus', x: 100, y: 210, width: 30, height: 40 },
    { type: 'cactus', x: -40, y: 210, width: 30, height: 40 },
  ];
  const next = GameCore.updateObstacles(obstacles, 6);
  assert.equal(next.length, 1);
  assert.equal(next[0].x, 94);
});

test('maybeSpawnObstacle：计时器归零时生成障碍物', () => {
  const s = fresh();
  s.spawnTimer = 1;
  const next = GameCore.maybeSpawnObstacle(s, () => 0.1); // < 0.5 => cactus
  assert.equal(next.length, 1);
  assert.equal(next[0].type, 'cactus');
  assert.equal(next[0].x, C.WIDTH);
});

test('maybeSpawnObstacle：计时器未归零不生成', () => {
  const s = fresh();
  s.spawnTimer = 5;
  const next = GameCore.maybeSpawnObstacle(s, () => 0.1);
  assert.equal(next.length, 0);
  assert.equal(s.spawnTimer, 4);
});

test('maybeSpawnObstacle：roll 决定障碍类型', () => {
  const s = fresh();
  s.spawnTimer = 1;
  const nextLow = GameCore.maybeSpawnObstacle(s, () => 0.7); // 0.5~0.8 => bird-low
  assert.equal(nextLow[0].type, 'bird-low');
  const s2 = fresh();
  s2.spawnTimer = 1;
  const nextHigh = GameCore.maybeSpawnObstacle(s2, () => 0.9); // > 0.8 => bird-high
  assert.equal(nextHigh[0].type, 'bird-high');
});

test('updateDifficulty：速度随距离上升并封顶', () => {
  const s = fresh();
  s.distance = 0;
  GameCore.updateDifficulty(s);
  assert.equal(s.speed, C.BASE_SPEED);
  s.distance = 100000;
  GameCore.updateDifficulty(s);
  assert.equal(s.speed, C.MAX_SPEED);
});

test('updateScore：分数随距离累加', () => {
  const s = fresh();
  for (let i = 0; i < 25; i++) GameCore.updateScore(s);
  assert.equal(s.distance, 25);
  assert.equal(s.score, 2); // floor(25 / 10)
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/obstacles.test.js`
Expected: FAIL，报 `GameCore.updateObstacles is not a function`

- [ ] **Step 3: 实现四个函数**

在 `game-core.js` 的 `collides` 之后插入：

```js
  GameCore.updateObstacles = function (obstacles, speed) {
    return obstacles
      .map(function (o) { return Object.assign({}, o, { x: o.x - speed }); })
      .filter(function (o) { return o.x + o.width > 0; });
  };

  GameCore.maybeSpawnObstacle = function (state, rng) {
    state.spawnTimer -= 1;
    if (state.spawnTimer > 0) return state.obstacles;

    const roll = rng();
    let obstacle;
    if (roll < 0.5) {
      obstacle = {
        type: 'cactus',
        x: CONSTANTS.WIDTH,
        y: CONSTANTS.GROUND_Y - CONSTANTS.CACTUS_H,
        width: CONSTANTS.CACTUS_W,
        height: CONSTANTS.CACTUS_H,
      };
    } else if (roll < 0.8) {
      obstacle = {
        type: 'bird-low',
        x: CONSTANTS.WIDTH,
        y: CONSTANTS.BIRD_LOW_BOTTOM - CONSTANTS.BIRD_H,
        width: CONSTANTS.BIRD_W,
        height: CONSTANTS.BIRD_H,
      };
    } else {
      obstacle = {
        type: 'bird-high',
        x: CONSTANTS.WIDTH,
        y: CONSTANTS.BIRD_HIGH_BOTTOM - CONSTANTS.BIRD_H,
        width: CONSTANTS.BIRD_W,
        height: CONSTANTS.BIRD_H,
      };
    }

    const gapScale = Math.max(0.5, 1 - state.distance / 20000);
    const span = (CONSTANTS.MAX_SPAWN_GAP - CONSTANTS.MIN_SPAWN_GAP) * gapScale;
    state.spawnTimer = Math.floor(CONSTANTS.MIN_SPAWN_GAP + rng() * span);

    return state.obstacles.concat([obstacle]);
  };

  GameCore.updateDifficulty = function (state) {
    state.speed = Math.min(
      CONSTANTS.BASE_SPEED + CONSTANTS.SPEED_RAMP * state.distance,
      CONSTANTS.MAX_SPEED
    );
  };

  GameCore.updateScore = function (state) {
    state.distance += 1;
    state.score = Math.floor(state.distance / CONSTANTS.SCORE_DIVISOR);
  };
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `node --test tests/obstacles.test.js`
Expected: PASS（6 个测试通过）

- [ ] **Step 5: 提交**

```bash
git add game-core.js tests/obstacles.test.js
git commit -m "feat: 障碍物移动/生成、难度递增、计分"
```

---

## Task 5: 整合 `step` 函数与死亡判定

**Files:**
- Modify: `game-core.js`（新增 `step`）
- Create: `tests/step.test.js`

- [ ] **Step 1: 写失败测试**

创建 `tests/step.test.js`：

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const GameCore = require('../game-core.js');

const C = GameCore.CONSTANTS;

test('step：正常帧距离递增、未死亡', () => {
  const s = GameCore.createInitialState();
  GameCore.step(s, { jump: false, duck: false }, () => 0.9);
  assert.equal(s.gameOver, false);
  assert.equal(s.distance, 1);
});

test('step：碰撞后 gameOver 为 true', () => {
  const s = GameCore.createInitialState();
  s.obstacles = [{
    type: 'cactus',
    x: C.DINO_X,
    y: C.GROUND_Y - C.CACTUS_H,
    width: C.CACTUS_W,
    height: C.CACTUS_H,
  }];
  s.spawnTimer = 9999;
  GameCore.step(s, { jump: false, duck: false }, () => 0.9);
  assert.equal(s.gameOver, true);
});

test('step：gameOver 后不再更新', () => {
  const s = GameCore.createInitialState();
  s.gameOver = true;
  const dist = s.distance;
  GameCore.step(s, { jump: false, duck: false }, () => 0.9);
  assert.equal(s.distance, dist);
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --test tests/step.test.js`
Expected: FAIL，报 `GameCore.step is not a function`

- [ ] **Step 3: 实现 `step`**

在 `game-core.js` 的 `updateScore` 之后插入：

```js
  GameCore.step = function (state, input, rng) {
    if (state.gameOver) return state;

    GameCore.updateDino(state, input);
    state.obstacles = GameCore.updateObstacles(state.obstacles, state.speed);
    state.obstacles = GameCore.maybeSpawnObstacle(state, rng);
    GameCore.updateDifficulty(state);
    GameCore.updateScore(state);

    if (GameCore.collides(state)) {
      state.gameOver = true;
    }

    return state;
  };
```

- [ ] **Step 4: 运行全部测试，确认通过**

Run: `node --test`
Expected: PASS（全部 19 个测试通过）

- [ ] **Step 5: 提交**

```bash
git add game-core.js tests/step.test.js
git commit -m "feat: step 整合与死亡判定"
```

---

## Task 6: 霓虹渲染、输入、游戏循环（`game.js`）

**Files:**
- Create: `game.js`

（本任务为视觉与交互，按规格以手动验收为主，无自动化测试。）

- [ ] **Step 1: 实现 `game.js`**

创建 `game.js`（完整内容）：

```js
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
  }

  function onKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (state.gameOver) { restart(); return; }
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
    const offset = (state.distance * state.speed) % spacing;
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
    drawGrid();
    drawGround();
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
```

- [ ] **Step 2: 浏览器手动验收**

在浏览器打开 `index.html`（或用 `python3 -m http.server` 起本地服务后访问）。逐项核对 Task 7 的验收清单。

- [ ] **Step 3: 提交**

```bash
git add game.js
git commit -m "feat: 霓虹渲染、键盘输入与游戏循环"
```

---

## Task 7: 手动验收与打磨

**Files:**
- 可能 Modify: `game-core.js`（调参数）、`game.js`（调形状）

- [ ] **Step 1: 按验收清单逐项点验**

| 项 | 操作 | 预期 |
|----|------|------|
| 跳 | 空格/↑ | 起跳，落地后能再跳 |
| 蹲 | ↓ | 恐龙变矮贴地；空中 ↓ 加速下落 |
| 仙人掌 | 遇到 | 跳过不死亡 |
| 翼龙-低 | 遇到 | 下蹲躲过 |
| 翼龙-高 | 遇到 | 站立直接从下方跑过 |
| 死亡重开 | 碰撞后按空格 | 立即重开 |
| 最高分持久化 | 刷新页面 | 最高分保留 |
| 后台恢复 | 切走再切回 | 不瞬死、不瞬跳 |

- [ ] **Step 2: 若体验不佳则微调常量**

速度/重力/跳跃力度在 `game-core.js` 的 `CONSTANTS`；恐龙与障碍物轮廓在 `game.js` 的 `traceDinoStanding`/`traceDinoDuck`/`drawCactus`/`drawBird`。改动后重新打开页面验证，无需改测试（测试只断言逻辑关系，不绑定手感参数）。

- [ ] **Step 3: 提交（若有改动）**

```bash
git add -A
git commit -m "chore: 手感与视觉微调"
```
