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
