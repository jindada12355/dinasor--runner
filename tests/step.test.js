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

test('step：会生成障碍物并写回状态', () => {
  const s = GameCore.createInitialState();
  s.spawnTimer = 1;
  GameCore.step(s, { jump: false, duck: false }, () => 0.1);
  assert.equal(s.obstacles.length, 1);
  assert.equal(s.obstacles[0].type, 'cactus');
  assert.equal(s.obstacles[0].x, C.WIDTH);
});

test('step：障碍物随帧向左移动（数组写回）', () => {
  const s = GameCore.createInitialState();
  s.obstacles = [{
    type: 'cactus',
    x: 500,
    y: C.GROUND_Y - C.CACTUS_H,
    width: C.CACTUS_W,
    height: C.CACTUS_H,
  }];
  s.spawnTimer = 9999;
  GameCore.step(s, { jump: false, duck: false }, () => 0.1);
  assert.equal(s.obstacles[0].x, 500 - C.BASE_SPEED);
});
