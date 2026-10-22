const test = require('node:test');
const assert = require('node:assert/strict');
const p = require('./authoring-workbench-presenter.js');
const session = (overrides={}) => ({kind:'film',stage:'QA',status:'IN_PROGRESS',gaps:[],decisions:[],runs:[],...overrides});

test('Hebrew stages and unknown statuses remain honest',()=>{
 assert.equal(p.stageLabel('UNITY_BUILD'),'בנייה ביוניטי');
 assert.equal(p.stageLabel('WAVES'),'גלים ונקודות הופעה');
 assert.equal(p.statusLabel('NOT_TESTED'),'טרם נבדק');
 assert.equal(p.statusLabel('SOMETHING_NEW'),'מצב לא מוכר');
});
test('advisor gives unknown submitted operations priority and never suggests replay',()=>{
 const a=p.advice(session({inFlightAction:{status:'UNKNOWN'},stage:'UNITY_BUILD'}));
 assert.equal(a.code,'INSPECT_OPERATION');
 assert.match(a.body,/לפני פעולה נוספת/);
 assert.doesNotMatch(a.body,/להריץ שוב/);
});
test('QA advice never promotes another or an unselected run to current evidence',()=>{
 const s=session({runs:[{id:'old',capture:'COMPLETED',technical:'PASS',cinematic:'PASS',runtime:'PASS'}]});
 assert.equal(p.advice(s).code,'SELECT_RUN');
 assert.equal(p.advice(s,{id:'foreign',technical:'PASS'}).code,'SELECT_RUN');
 assert.equal(p.advice(s,s.runs[0]).code,'USER_REVIEW');
 assert.match(p.advice(s,s.runs[0]).body,/אישור/);
});
test('technical success and capture never stand in for cinematic or runtime acceptance',()=>{
 const run={id:'r',captureStatus:'COMPLETED',technicalVisualQa:'PASS',cinematicQa:'REVIEW_REQUIRED',runtimeQa:'NOT_TESTED'};
 const a=p.advice(session({runs:[run]}),run);
 assert.equal(a.code,'REVIEW_VISUAL');
 assert.match(a.body,/ריצה שנבחרה/);
 assert.equal(p.evidenceName('ACTUAL_CAPTURE'),'צילום מתוך המערכת');
 assert.equal(p.evidenceName('REFERENCE'),'תמונת השראה או מקור');
});
test('COMPLETE without referenced user acceptance is not displayed as accepted',()=>{
 assert.equal(p.advice(session({stage:'COMPLETE'})).code,'ACCEPTANCE_MISSING');
 assert.equal(p.advice(session({stage:'COMPLETE',decisions:[{type:'USER_ACCEPTANCE',accepted:true,reference:'user message'}]})).code,'ACCEPTED');
});
test('level advice follows the level and wave route; recoverable gaps do not block',()=>{
 const a=p.advice(session({kind:'level',stage:'WAVES',gaps:[{status:'PENDING'}]}));
 assert.equal(a.code,'WAVES');
 assert.match(a.body,/Reverse/);
 assert.equal(p.openGaps([{status:'RESOLVED'},{status:'PENDING'},{status:'UNKNOWN'}]),2);
});
test('level visual QA proceeds to waves before gameplay QA or final review',()=>{
 const r={id:'level-run',capture:'COMPLETED',technical:'PASS',cinematic:'PASS',runtime:'NOT_TESTED'};
 assert.equal(p.advice(session({kind:'level',stage:'LEVEL_QA',runs:[r]}),r).code,'WAVES');
 assert.equal(p.advice(session({kind:'level',stage:'LEVEL_QA',runs:[{...r,runtime:'PASS'}]}),r).code,'WAVES');
 assert.equal(p.advice(session({kind:'level',stage:'GAMEPLAY_QA',runs:[r]}),r).code,'CHECK_RUNTIME');
});
test('failed or unverified capture and technical evidence cannot become readiness advice',()=>{
 for(const capture of ['FAILED','PARTIAL','NOT_TESTED']){
  const r={id:'r',capture,technical:'PASS',cinematic:'PASS',runtime:'PASS'};
  assert.equal(p.advice(session({runs:[r]}),r).code,'CHECK_CAPTURE');
 }
 for(const technical of ['FAIL','NOT_TESTED','WARNINGS']){
  const r={id:'r',capture:'COMPLETED',technical,cinematic:'PASS',runtime:'PASS'};
  assert.equal(p.advice(session({runs:[r]}),r).code,'CHECK_TECHNICAL');
 }
 const unidentified={capture:'COMPLETED',technical:'PASS',cinematic:'PASS',runtime:'PASS'};
 assert.equal(p.advice(session({runs:[unidentified]}),unidentified).code,'SELECT_RUN');
});
