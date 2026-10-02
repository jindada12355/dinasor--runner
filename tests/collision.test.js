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

test('dinoRect：站立命中框是贴合模型的缩小框', () => {
  const s = GameCore.createInitialState();
  const r = GameCore.dinoRect(s.dino);
  assert.equal(r.x, C.DINO_X + C.DINO_HITBOX_STAND.dx);
  assert.equal(r.y, C.GROUND_Y - C.DINO_H_STAND + C.DINO_HITBOX_STAND.dy);
  assert.equal(r.width, C.DINO_HITBOX_STAND.w);
  assert.equal(r.height, C.DINO_HITBOX_STAND.h);
});

test('dinoRect：下蹲命中框更矮', () => {
  const s = GameCore.createInitialState();
  GameCore.updateDino(s, { jump: false, duck: true });
  const r = GameCore.dinoRect(s.dino);
  assert.equal(r.height, C.DINO_HITBOX_DUCK.h);
  assert.ok(C.DINO_HITBOX_DUCK.h < C.DINO_HITBOX_STAND.h);
});

test('collides：站立撞低飞翼龙，下蹲躲过', () => {
  const birdLow = {
    type: 'bird-low',
    x: C.DINO_X,
    y: C.BIRD_LOW_BOTTOM - C.BIRD_H,
    width: C.BIRD_W,
    height: C.BIRD_H,
  };
  const standing = GameCore.createInitialState();
  standing.obstacles = [birdLow];
  assert.equal(GameCore.collides(standing), true);

  const ducking = GameCore.createInitialState();
  GameCore.updateDino(ducking, { jump: false, duck: true });
  ducking.obstacles = [birdLow];
  assert.equal(GameCore.collides(ducking), false);
});
