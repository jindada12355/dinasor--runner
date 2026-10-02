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
