'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/../assets/film-workbench-v2.js', 'utf8');
const section = source.slice(source.indexOf('function runStatus('), source.indexOf('function renderReadiness('));
const labelSource = source.slice(source.indexOf('const labels='), source.indexOf('const $='));
const helperSection = source.slice(source.indexOf('function fleetCaptions('), source.indexOf('function render(s)'));
const harness = labelSource + 'function previewUrl(){return null;}\n' + section + helperSection + '\nglobalThis.subject={readinessItems,latestCapturedRun,fleetCaptions,labels};';
const context = {};
vm.runInNewContext(harness, context);
const {readinessItems, latestCapturedRun, fleetCaptions, labels} = context.subject;
const get = (s, title) => readinessItems(s).find(x => x.title === title).done;

{
  const s = {id:'fleet30-camera',stage:'UNITY_BUILD',runs:[]};
  assert.equal(get(s,'סרט בנוי ב־Unity'), false);
  assert.equal(get(s,'צילום מתוך Unity'), false);
  const c = fleetCaptions(s);
  assert.match(c.explanation, /בנייה.*לא תועדה/);
  assert.match(c.subtitle, /צילום.*לא תועד/);
  assert.doesNotMatch(c.subtitle, /הושלם|אושר/);
}
{
  const s = {id:'fleet30-camera',stage:'UNITY_BUILD',runs:[{id:'build1',build:'PASS',capture:'NOT_RUN',artifacts:[]} ]};
  assert.equal(get(s,'סרט בנוי ב־Unity'), true);
  assert.equal(get(s,'צילום מתוך Unity'), false);
  const c = fleetCaptions(s);
  assert.match(c.explanation, /בנייה מוצלחת תועדה/);
  assert.match(c.subtitle, /ממתינים לצילום/);
  assert.doesNotMatch(c.subtitle, /הושלם|אושר/);
}
{
  const s = {id:'fleet30-camera',stage:'REVISION',runs:[{id:'qa1',build:'PASS',capture:'COMPLETED',cinematic:'REVIEW_REQUIRED',runtime:'NOT_TESTED',artifacts:[{kind:'capture',evidenceStatus:'CAPTURED',runId:'qa1',path:'film-qa/run/frame.png'}]}],decisions:[]};
  assert.equal(get(s,'סרט בנוי ב־Unity'), true);
  assert.equal(get(s,'צילום מתוך Unity'), true);
  const c = fleetCaptions(s);
  assert.match(c.explanation, /צילום Unity תועדו/);
  assert.match(c.subtitle, /איכות קולנועית.*דורשת סקירה/);
  assert.doesNotMatch(c.subtitle, /קבלת משתמש מפורשת תועדה|הסרט אושר|סרט גמור/);
  assert.equal(labels.REVISION, 'תיקון לאחר בדיקה');
}
console.log('PASS: no build/no capture');
console.log('PASS: built without capture');
{
  const s = {id:'fleet30-camera',stage:'REVISION',runs:[
    {id:'old',build:'PASS',capture:'COMPLETED',cinematic:'PASS',artifacts:[{kind:'capture',evidenceStatus:'CAPTURED',runId:'old',path:'film-qa/old/frame.png'}]},
    {id:'new',build:'PASS',capture:'COMPLETED',cinematic:'REVIEW_REQUIRED',artifacts:[{kind:'capture',evidenceStatus:'CAPTURED',runId:'new',path:'film-qa/new/frame.png'}]}
  ],decisions:[{id:'old-acceptance',type:'USER_ACCEPTANCE',accepted:true,reference:'acceptance for old run'}]};
  assert.equal(latestCapturedRun(s).id,'new');
  const c=fleetCaptions(s);
  assert.match(c.subtitle,/איכות קולנועית דורשת סקירה/);
  assert.doesNotMatch(c.subtitle,/קבלת משתמש מפורשת תועדה|הסרט אושר/);
}
console.log('PASS: captured with cinematic review pending');
console.log('PASS: historical acceptance cannot approve a newer captured run');
console.log('PASS: no false finished/approved caption; REVISION has Hebrew label');

