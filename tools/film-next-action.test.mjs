import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const nodes=new Map();
const location={href:'http://localhost:8000/workbench.html',hostname:'localhost',search:''};
const context={location,URL,URLSearchParams,Date,fetch:()=>new Promise(()=>{}),window:{addEventListener(){}},document:{getElementById(id){if(!nodes.has(id))nodes.set(id,{style:{},textContent:'',className:''});return nodes.get(id);}}};
const code=readFileSync('assets/film-workbench-v2.js','utf8').replace(/\}\)\(\);\s*$/, 'globalThis.inspectAction=actionText;globalThis.inspectCopy=buildCopyText;})();');
vm.runInNewContext(code,context);
test('unknown native build takes priority over the fixed FLEET build instruction',()=>{
 const s={id:'fleet30-camera',stage:'UNITY_BUILD',inFlightAction:{status:'UNKNOWN',requestId:'fleet-artpack-once'},nextAction:'Build the film'};
 const action=context.inspectAction(s);
 assert.match(action.title,/לבדוק/);
 assert.match(action.description,/fleet-artpack-once/);
 assert.match(action.description,/אין לשלוח/);
});
test('continuation uses the recorded next action after a real capture',()=>{
 const s={id:'fleet30-camera',stage:'QA',nextAction:'Inspect native frame 10 and repair cannon framing.'};
 assert.equal(context.inspectAction(s).description,s.nextAction);
});
test('copy prompt preserves the unknown-operation instruction',()=>{
 const s={id:'fleet30-camera',stage:'UNITY_BUILD',revision:8,inFlightAction:{status:'SUBMITTED',requestId:'fleet-artpack-once'}};
 const copy=context.inspectCopy(s);
 assert.match(copy,/fleet-artpack-once/);
 assert.match(copy,/אין לשלוח/);
});
