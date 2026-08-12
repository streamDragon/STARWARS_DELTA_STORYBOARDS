(()=>{
'use strict';
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
    const ready=manifest.status==='READY'&&c.downloadUrl&&i.downloadUrl;
    setStatus(ready?'CURRENT VERIFIED':String(manifest.status||'NOT READY').replaceAll('_',' '),ready?'':'warn');
    meta.innerHTML=`<span>Catalog revision: <b>${c.catalogRevision||'—'}</b></span><span>Contract: <b>${short(c.contractRevision)}</b></span><span>Schema: <b>${short(c.schemaHash)}</b></span><span>Snapshot: <b>${short(c.snapshotContentHash)}</b></span><span>Instruction Book: <b>${i.bookVersion||'—'}</b></span>`;
    if(manifest.publishedUtc)meta.innerHTML+=`<span>Published: <b>${String(manifest.publishedUtc).replace('T',' ').slice(0,19)} UTC</b></span>`;
    activate(catalog,c.downloadUrl);activate(book,i.downloadUrl);activate(bundle,b.downloadUrl);
    note.textContent=ready?'These links point to the last successfully published CURRENT release. A failed candidate does not replace them.':(manifest.note||'Designer AI packages are not published yet.');
  }catch(e){setStatus('CURRENT MANIFEST UNAVAILABLE','failed');meta.innerHTML=`<span>${String(e.message||e)}</span>`;note.textContent='Storyboard access still works. Designer AI downloads could not be resolved.'}
}
copy?.addEventListener('click',async()=>{
  const c=manifest?.catalog||{},i=manifest?.instructionBook||{};
  const text=`Use the attached CURRENT STARWARS_DELTA Catalog and CURRENT Instruction Book as the only authoring authority. Create a NEW Cutscene from my natural-language request. Do not reuse old JSON, old revisions, remembered asset IDs, or examples from previous chats. Catalog revision: ${c.catalogRevision||'CURRENT'}. Snapshot hash: ${c.snapshotContentHash||'CURRENT'}. Contract: ${c.contractRevision||'CURRENT'}. Schema hash: ${c.schemaHash||'CURRENT'}. Instruction Book: ${i.bookVersion||'CURRENT'}.`;
  try{await navigator.clipboard.writeText(text);copy.textContent='COPIED';setTimeout(()=>copy.textContent='COPY CHATGPT START MESSAGE',1600)}catch(_){window.prompt('Copy this message for ChatGPT:',text)}
});
load();setInterval(load,60000);
})();