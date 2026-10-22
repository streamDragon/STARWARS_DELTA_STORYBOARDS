(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PreviewSessionBridge=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const BASE='https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/';
function id(v){if(typeof v!=='string'||v.length>100||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v))throw Error('Unsafe session id');return v;}
function path(v){if(typeof v!=='string'||!v||v.startsWith('/')||/[\\:%?#\x00-\x20]/.test(v)||v.split('/').some(x=>!x||x==='.'||x==='..'))throw Error('Unsafe source path');return v;}
function params(search){const input=new URLSearchParams(search),out=new URLSearchParams();for(const key of ['session','source','run'])if(input.has(key)){const v=input.get(key);if(key==='session')id(v);else if(key==='source')path(v);else if(!/^[a-zA-Z0-9_-]{1,160}$/.test(v))throw Error('Unsafe run id');out.set(key,v);}return out;}
function base(href){const u=new URL(href);return ['localhost','127.0.0.1','[::1]'].includes(u.hostname)?new URL('../',u).href:BASE;}
async function hash(bytes,crypto){if(!crypto?.subtle)throw Error('SHA256 verification unavailable');return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');}
async function chooseSource(session,selection,read,crypto){
 const global=Array.isArray(session.sourceArtifacts)?session.sourceArtifacts:[];
 let artifacts=global;
 if(selection.run){
  const run=(session.runs||[]).find(r=>(r.id||r.runId)===selection.run);
  if(!run)throw Error('RUN_NOT_FOUND · requested run does not exist');
  const references=[...(run.artifacts||[]),...(run.sourceArtifacts||[])];
  artifacts=[...global.filter(a=>a.runId===selection.run),...references.map(ref=>{
   const r=typeof ref==='string'?{path:ref}:ref;
   if(!r||typeof r!=='object')return null;
   const original=global.find(a=>(r.path&&a.path===r.path)||(r.id&&a.id===r.id));
   return {...original,...r};
  })];
 }
 const explicit=selection.source||(!selection.run?session.currentSourcePath:null);
 const legal=[],seen=new Set();
 for(const a of artifacts){
  if(a?.kind!=='source'||(selection.run&&a.runId&&a.runId!==selection.run)||(explicit&&![a.id,a.path].includes(explicit)))continue;
  const p=path(a.path),identity=JSON.stringify([p,a.sha256||'']);if(seen.has(identity))continue;seen.add(identity);
  const bytes=await read(p);let object;try{object=JSON.parse(new TextDecoder().decode(bytes));}catch{continue;}
  if(object?.schema!=='STARWARS_DELTA_CUTSCENE_SCRIPT')continue;
  const digest=await hash(bytes,crypto);if(a.sha256&&String(a.sha256).toLowerCase()!==digest)throw Error('SHA256 mismatch: '+p);
  legal.push({artifact:a,bytes,object,hash:digest});
 }
 if(legal.length>1)throw Error('SOURCE_AMBIGUOUS · select an exact source parameter or designate session.currentSourcePath: '+legal.map(s=>s.artifact.path).join(', '));
 return legal[0]||null;
}
function cursorKey(selection,hash){return 'preview-cursor:'+JSON.stringify([selection.session||'drop',hash,selection.source||'',selection.run||'']);}
function executionCopy(o){if(!o||typeof o!=='object'||!Array.isArray(o.beats))throw Error('No readable movie beats');const copy=JSON.parse(JSON.stringify(o));copy.beats=copy.beats.filter(b=>b&&typeof b==='object'&&!Array.isArray(b));if(!copy.beats.length)throw Error('No readable movie beats');copy.cast=Array.isArray(copy.cast)?copy.cast.filter(c=>c&&typeof c==='object'):[];for(const b of copy.beats){for(const k of ['visible','dialogue','actions','audio'])b[k]=Array.isArray(b[k])?b[k].filter(v=>v&&typeof v==='object'&&!Array.isArray(v)):[];}return copy;}
return {BASE,id,path,params,base,hash,chooseSource,cursorKey,executionCopy};
});
