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
