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
