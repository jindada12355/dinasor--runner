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
    DINO_HITBOX_STAND: { dx: 6, dy: 6, w: 38, h: 28 },
    DINO_HITBOX_DUCK: { dx: 6, dy: 8, w: 38, h: 16 },
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

  GameCore.updateDino = function (state, input) {
    const dino = state.dino;

    // 1. 起跳（仅在地面）
    const jumped = dino.onGround && input.jump;
    if (jumped) {
      dino.vy = CONSTANTS.JUMP_VY;
      dino.onGround = false;
      dino.ducking = false;
      dino.height = CONSTANTS.DINO_H_STAND;
      dino.y = CONSTANTS.GROUND_Y - dino.height; // 站起时保持脚着地
    }

    // 2. 下蹲（地面切换姿势 / 空中加速下落）；起跳帧跳过，保证跳/蹲互斥
    if (!jumped) {
      if (dino.onGround) {
        dino.ducking = !!input.duck;
        dino.height = dino.ducking ? CONSTANTS.DINO_H_DUCK : CONSTANTS.DINO_H_STAND;
        dino.y = CONSTANTS.GROUND_Y - dino.height;
      } else if (input.duck) {
        dino.vy += CONSTANTS.FALL_BOOST_VY;
      }
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

  GameCore.dinoRect = function (dino) {
    const hb = dino.ducking ? CONSTANTS.DINO_HITBOX_DUCK : CONSTANTS.DINO_HITBOX_STAND;
    return {
      x: dino.x + hb.dx,
      y: dino.y + hb.dy,
      width: hb.w,
      height: hb.h,
    };
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

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameCore;
  } else {
    global.GameCore = GameCore;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
