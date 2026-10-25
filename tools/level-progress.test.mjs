import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

class Element {
 constructor(tag){this.tag=tag;this.children=[];this.textContent='';}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(){}
}
function handoff(session,scene){
 const host=new Element('section'),copied=[];
 const context={window:{},document:{getElementById:()=>host,createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text})},navigator:{clipboard:{writeText:async value=>copied.push(value)}},Intl,Date};
 vm.runInNewContext(readFileSync('assets/level-progress.js','utf8'),context);
 context.window.LevelProgress.render({session,scene,recipe:null,qa:{runs:[]},root:'https://example.org/revision/',navigate:()=>{}});
 const walk=n=>[n,...(n.children||[]).flatMap(walk)];
 const button=walk(host).find(n=>n.tag==='button'&&n.textContent==='העתקת הוראות ההמשך לסוכן');
 button.onclick();return copied[0];
}
const base={id:'level-grad9-golden-gameplay',revision:1,stage:'GAMEPLAY_QA',status:'NOT_TESTED',scenePath:'Assets/GRAD_9.unity',sourceArtifacts:[{path:'workbench/projects/level-grad9-golden-gameplay/artifacts/CONTINUATION.md',kind:'report'}]};
test('a primary level hands off its own scene and reports, with no GRAD11 reference',()=>{
 const prompt=handoff(base,'GRAD_9');
 assert.ok(prompt.includes('Unity scene: Assets/GRAD_9.unity'),prompt);
 assert.ok(prompt.includes('https://example.org/revision/'+base.sourceArtifacts[0].path),prompt);
 assert.ok(!prompt.includes('GRAD11'),prompt);
});
test('linked V2 hands off its own scene rather than the primary scene',()=>{
 const prompt=handoff({...base,id:'level-grad11-asteroid-forge',scenePath:'Assets/GRAD11.unity',linkedScenePaths:['Assets/GRAD11_V2.unity']},'GRAD11_V2');
 assert.ok(prompt.includes('Unity scene: Assets/GRAD11_V2.unity'));
});
