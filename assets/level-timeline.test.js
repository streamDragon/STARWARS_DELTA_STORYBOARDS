'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LevelTimeline } = require('./level-timeline.js');
const timeline = { camera: {x:0, y:0, height:27}, scrollSpeed:1.2 };
const anchor = {x:20.00447,y:-3.20569};

test('camera-anchored spawn stays at same screen X after 100 KM of progression', () => {
  const wave = {layerAttached:false};
  const p0 = LevelTimeline.waveViewport(anchor,timeline,0,wave);
  const p100 = LevelTimeline.waveViewport(anchor,timeline,100,wave);
  assert.equal(p0.x,p100.x);
  assert.equal(p0.y,p100.y);
});
test('scrolling world geometry shifts across stationary camera', () => {
  const wave = {layerAttached:true};
  const p0 = LevelTimeline.waveViewport(anchor,timeline,0,wave);
  const p100 = LevelTimeline.waveViewport(anchor,timeline,100,wave);
  assert.ok(p100.x < p0.x - 2000, '1.2 world units per second must move the world left');
});
test('next planned wave displays its KM without pretending playback is live gameplay', () => {
  const waves=[{id:3,at:9},{id:1,at:1},{id:2,at:5}];
  assert.equal(LevelTimeline.nextScheduledWave(waves,0).id,1);
  assert.equal(LevelTimeline.nextScheduledWave(waves,5).id,3);
  assert.equal(LevelTimeline.nextScheduledWave(waves,9),null);
});
test('future wave does not appear before KM gate', () => {
  const w={at:100,count:3,interval:0.8,teleportDelay:0,spawn:anchor,prediction:'spline',path:[anchor,{x:-80,y:anchor.y}],speed:5,loop:'Once'};
  assert.equal(LevelTimeline.activeShips(w,99.9).length,0);
  assert.equal(LevelTimeline.activeShips(w,100).length,1);
  assert.equal(LevelTimeline.activeShips(w,100.9).length,2);
});
