const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
// A broken or mismatched bundle link must not look like a verified download.
const html=fs.readFileSync(path.join(__dirname,'../devora.html'),'utf8');
const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean).join('\n');
const manifest={status:'CURRENT_VERIFIED',publishTransactionId:'test-transaction',bundle:{fileName:'current.zip',sha256:'abc',downloadUrl:'https://github.com/streamDragon/STARWARS_DELTA_STORYBOARDS/releases/download/current/current.zip'}};
async function load(value){
 const elements=new Map(),document={getElementById(id){if(!elements.has(id))elements.set(id,{hidden:true});return elements.get(id);}};
 const context={document,URL,Date,fetch:async url=>url.includes('OPEN_CURRENT.json')?{ok:true,json:async()=>value}:{ok:false,status:503},navigator:{},setTimeout(){}};
 vm.runInNewContext(script,context);await new Promise(resolve=>setImmediate(resolve));return elements;
}
test('Devora downloads the exact bundle named by verified CURRENT without a GitHub plugin',async()=>{const e=await load(manifest),link=e.get('devoraBundle');assert.equal(link.href,manifest.bundle.downloadUrl);assert.equal(link.download,'current.zip');assert.equal(link.hidden,false);assert.match(link.title,/test-transaction/);});
test('an unverified manifest never exposes a bundle download',async()=>{const e=await load({...manifest,status:'BUILDING'});assert.notEqual(e.get('devoraBundle')?.hidden,false);});
test('a foreign download host is not promoted from CURRENT metadata',async()=>{const e=await load({...manifest,bundle:{...manifest.bundle,downloadUrl:'https://example.invalid/current.zip'}});assert.notEqual(e.get('devoraBundle')?.hidden,false);});
test('missing bundle metadata leaves the download unavailable',async()=>{const e=await load({...manifest,bundle:undefined});assert.notEqual(e.get('devoraBundle')?.hidden,false);});
