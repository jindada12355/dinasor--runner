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
