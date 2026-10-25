const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
let source=fs.readFileSync(path.join(__dirname,'../assets/film-workbench-v2.js'),'utf8');
source=source.slice(0,source.indexOf("if(typeof ResizeObserver==='function')"))+"window.testAPI={actionText,readinessItems:typeof readinessItems==='function'?readinessItems:undefined};})();";
function api(){const window={};vm.runInNewContext(source,{window,document:{},location:{search:''},URLSearchParams});return window.testAPI;}
test('Fleet continuation comes from current dossier instead of a fixed old instruction',()=>{
 const s={id:'fleet30-camera',stage:'AUTHORING',nextAction:'Build the validated V2 once, inspect original anchors and capture the actual film.'};
 assert.equal(api().actionText(s).description,s.nextAction);
});
test('empty continuation falls back to stage guidance',()=>{
 const a=api().actionText({id:'fleet30-camera',stage:'QA',nextAction:''});
 assert.match(a.description,/ריצה מדויקת/);
});
test('an unbuilt film cannot inherit completed Fleet milestones',()=>{
 const items=api().readinessItems({id:'other-film',storyboard:[],runs:[],sourceArtifacts:[],targetArtifacts:[]});
 assert.equal(items.length,4);
 assert.ok(items.every(i=>!i.done));
});
test('technical lint alone does not establish Unity movie or capture readiness',()=>{
 const items=api().readinessItems({id:'fleet30-camera',storyboard:[{}],sourceArtifacts:[],targetArtifacts:[],runs:[{technical:'PASS',capture:'NOT_RUN',artifacts:[]}]});
 assert.equal(items[0].done,true);
 assert.equal(items[2].done,false);
 assert.equal(items[3].done,false);
});
test('only a capture tied to its own completed run establishes capture readiness',()=>{
 const artifact={kind:'capture',evidenceStatus:'CAPTURED',path:'film-qa/run-a/frame.png',runId:'run-a'};
 const a=api().readinessItems({runs:[{id:'run-a',build:'PASS',capture:'COMPLETED',artifacts:[artifact]}]});
 assert.equal(a[2].done,true);assert.equal(a[3].done,true);
 const b=api().readinessItems({runs:[{id:'run-b',capture:'COMPLETED',artifacts:[artifact]}]});
 assert.equal(b[3].done,false);
});
