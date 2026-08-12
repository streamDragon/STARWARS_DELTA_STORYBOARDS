(()=>{
'use strict';
const UI_BUILD='20260812-1205-v2.1CINEMATIC';
if(!document.querySelector('link[data-ui-polish]')){const l=document.createElement('link');l.rel='stylesheet';l.href=`assets/ui-polish.css?build=${UI_BUILD}`;l.dataset.uiPolish='1';document.head.appendChild(l)}
if(!document.querySelector('script[data-ui-polish]')){const s=document.createElement('script');s.src=`assets/ui-polish.js?build=${UI_BUILD}`;s.defer=true;s.dataset.uiPolish='1';document.head.appendChild(s)}
const status=document.getElementById('designerStatus');
const meta=document.getElementById('designerMeta');
const note=document.getElementById('designerNote');
const bundle=document.getElementById('downloadBundle');
const catalog=document.getElementById('downloadCatalog');
const book=document.getElementById('downloadBook');
const copy=document.getElementById('copyChatStart');
let manifest=null;
const short=s=>s?String(s).slice(0,12)+'…':'—';
const activate=(el,url)=>{if(!el||!url)return;el.href=url;el.classList.remove('disabled')};
const setStatus=(text,kind)=>{status.textContent=text;status.className='hub-status'+(kind?' '+kind:'')};
async function load(){
  try{
    const r=await fetch('designer-ai/current.json?ts='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    manifest=await r.json();
    const c=manifest.catalog||{},i=manifest.instructionBook||{},b=manifest.bundle||{};
    const published=!!(c.downloadUrl&&i.downloadUrl);
    setStatus(published?'CURRENT PUBLISHED':String(manifest.status||'NOT READY').replaceAll('_',' '),published?'':'warn');
    meta.innerHTML=`<span>Catalog revision: <b>${c.catalogRevision||'—'}</b></span><span>Contract: <b>${short(c.contractRevision||manifest.contractRevision)}</b></span><span>Schema: <b>${short(c.schemaHash||manifest.schemaHash)}</b></span><span>Snapshot: <b>${short(c.snapshotContentHash)}</b></span><span>Instruction Book: <b>${i.bookVersion||'—'}</b></span>`;
    if(manifest.publishedUtc)meta.innerHTML+=`<span>Published together: <b>${String(manifest.publishedUtc).replace('T',' ').slice(0,19)} UTC</b></span>`;
    activate(catalog,c.downloadUrl);activate(book,i.downloadUrl);activate(bundle,b.downloadUrl);
    note.textContent=published?'Catalog + Instruction Book are one CURRENT authoring set. PUBLISH replaces both together; a failed publish leaves the previous pair available.':(manifest.note||'Designer AI packages are waiting for the first publish.');
  }catch(e){setStatus('CURRENT MANIFEST UNAVAILABLE','failed');meta.innerHTML=`<span>${String(e.message||e)}</span>`;note.textContent='Storyboard access still works. Designer AI downloads could not be resolved.'}
}
copy?.addEventListener('click',async()=>{
  const c=manifest?.catalog||{},i=manifest?.instructionBook||{};
  const text=`Use the attached CURRENT STARWARS_DELTA Catalog and CURRENT Instruction Book together as the only authoring authority. Create a NEW Cutscene from my natural-language request. Do not reuse old JSON, old revisions, remembered asset IDs, or examples from previous chats. Catalog revision: ${c.catalogRevision||'CURRENT'}. Snapshot hash: ${c.snapshotContentHash||'CURRENT'}. Contract: ${c.contractRevision||manifest?.contractRevision||'CURRENT'}. Schema hash: ${c.schemaHash||manifest?.schemaHash||'CURRENT'}. Instruction Book: ${i.bookVersion||'CURRENT'}.`;
  try{await navigator.clipboard.writeText(text);copy.textContent='COPIED';setTimeout(()=>copy.textContent='COPY CHATGPT START MESSAGE',1600)}catch(_){window.prompt('Copy this message for ChatGPT:',text)}
});
load();setInterval(load,60000);
})();