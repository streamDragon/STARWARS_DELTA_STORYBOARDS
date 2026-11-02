'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const timeline = require('../assets/level-timeline.js').LevelTimeline;

const level = {
  scrollSpeed: 1.2,
  camera: { x: 0, y: 0, width: 84.13687, height: 27 }
};

test('fixed 16:9 gameplay viewport keeps camera centered and true world scale', () => {
  const center = timeline.viewport({ x: 0, y: 0 }, level, 0);
  assert.equal(center.x, 500);
  assert.equal(center.y, 281.25);
  assert.equal(timeline.viewport({ x: 24, y: 0 }, level, 0).x, 1000);
});

test('rightward level progress scrolls background LEFT in the fixed viewport', () => {
  assert.equal(timeline.viewport({ x: 0, y: 0 }, level, 10).x, 250);
  assert.equal(timeline.viewport({ x: 24, y: 0 }, level, 10).x, 750);
});

const wave = {
  id: 1, name: 'Test enemy', prediction: 'spline', mode: 'Spline',
  at: 1, count: 3, interval: 1, teleportDelay: 0,
  speed: 10, lifetime: 0, loop: 'Loop',
  spawn: { x: 20, y: 0 },
  path: [{ x: 20, y: 0 }, { x: -20, y: 0 }]
};

test('each spawned enemy travels its own offset on the authored spline', () => {
  const ships = timeline.activeShips(wave, 2.5);
  assert.deepEqual(ships.map(s => s.index), [0, 1]);
  assert.deepEqual(ships.map(s => s.position.x), [5, 15]);
});

test('open routes exit instead of wrapping to their spawn as a phantom new wave', () => {
  const ships = timeline.activeShips(wave, 6.1);
  assert.deepEqual(ships.map(s => s.index), [2]);
  assert.ok(Math.abs(ships[0].position.x - (-11)) < 1e-8);
});

test('future spawn groups are absent from the live preview', () => {
  assert.equal(timeline.activeShips(wave, 0).length, 0);
  assert.equal(timeline.activeShips(wave, 1).length, 1);
});

test('a stationary spawn without a path does not get fake spline movement', () => {
  const boss = { ...wave, prediction: 'spawn', path: [], count: 1, at: 2, spawn: {x: 8, y: -5} };
  assert.deepEqual(timeline.activeShips(boss, 3).map(s => s.position), [{x:8,y:-5}]);
});

const fs = require('node:fs');
const path = require('node:path');
test('real Gradius Volcano authored waves do not respawn after completing open paths', () => {
  const file = path.join(__dirname, '..', 'level-qa', 'level-GRADIUS_VOLCANO_01-20261028233236491', 'timeline.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const first = data.waves[0];
  assert.equal(first.loop, 'Loop'); // Exported metadata must not force preview wrapping.
  assert.ok(timeline.activeShips(first, 1.1).length > 0);
  assert.equal(timeline.activeShips(first, 120).length, 0);
});
test('real Gradius Volcano preview uses the captured 27-unit camera height', () => {
  const file = path.join(__dirname, '..', 'level-qa', 'level-GRADIUS_VOLCANO_01-20261028233236491', 'timeline.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const center = timeline.viewport({x:0,y:0}, data, 0);
  assert.deepEqual(center,{x:500,y:281.25});
  assert.equal(timeline.viewport({x:24,y:0}, data, 0).x,1000);
});
