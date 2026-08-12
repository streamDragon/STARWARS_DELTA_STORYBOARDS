(()=>{
'use strict';
const UI_BUILD='20260812-2015-v2.2DOWNLOAD';
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
const setStatus=(text,kind)=>{if(!status)return;status.textContent=text;status.className='hub-status'+(kind?' '+kind:'')};
function releaseTag(m){const u=String(m?.releaseUrl||'');const hit=u.match(/\/releases\/tag\/([^/?#]+)/i);return hit?decodeURIComponent(hit[1]):''}
function stableAssetUrl(m,item){if(!item?.fileName)return'';const tag=releaseTag(m);if(tag)return`https://github.com/streamDragon/STARWARS_DELTA_STORYBOARDS/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(item.fileName)}`;const raw=String(item.downloadUrl||'');return raw&&!/\/untagged-[^/]+\//i.test(raw)?raw:''}
function resetDownload(el){if(!el)return;el.classList.add('disabled');el.removeAttribute('href');delete el.dataset.downloadUrl}
function activate(el,url,label){if(!el||!url){resetDownload(el);return}el.href=url;el.dataset.downloadUrl=url;el.dataset.defaultLabel=label||el.textContent;el.classList.remove('disabled');el.removeAttribute('aria-disabled')}
function bindDownload(el){if(!el||el.dataset.boundDownload==='1')return;el.dataset.boundDownload='1';el.addEventListener('click',e=>{const url=el.dataset.downloadUrl;if(!url){e.preventDefault();setStatus('DOWNLOAD NOT READY','warn');if(note)note.textContent='The download link is not ready. Refresh after the next successful PUBLISH.';return}const original=el.dataset.defaultLabel||el.textContent;el.textContent='DOWNLOADING...';el.classList.add('downloading');setStatus('DOWNLOAD STARTED','');if(note)note.textContent='Download started. Chrome may show the file in its Downloads panel; downloading the same file again is allowed.';setTimeout(()=>{el.textContent=original;el.classList.remove('downloading');if(manifest?.status)setStatus('CURRENT PUBLISHED','')},1800)})}
[bundle,catalog,book].forEach(bindDownload);
async function load(){
  try{
    const r=await fetch('designer-ai/current.json?ts='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    manifest=await r.json();
    const c=manifest.catalog||{},i=manifest.instructionBook||{},b=manifest.bundle||{};
    const catalogUrl=stableAssetUrl(manifest,c),bookUrl=stableAssetUrl(manifest,i),bundleUrl=stableAssetUrl(manifest,b);
    const published=!!(catalogUrl&&bookUrl&&bundleUrl);
    setStatus(published?'CURRENT PUBLISHED':String(manifest.status||'NOT READY').replaceAll('_',' '),published?'':'warn');
    meta.innerHTML=`<span>Catalog revision: <b>${c.catalogRevision||'—'}</b></span><span>Contract: <b>${short(c.contractRevision||manifest.contractRevision)}</b></span><span>Schema: <b>${short(c.schemaHash||manifest.schemaHash)}</b></span><span>Snapshot: <b>${short(c.snapshotContentHash)}</b></span><span>Instruction Book: <b>${i.bookVersion||'—'}</b></span>`;
    if(manifest.publishedUtc)meta.innerHTML+=`<span>Published together: <b>${String(manifest.publishedUtc).replace('T',' ').slice(0,19)} UTC</b></span>`;
    activate(catalog,catalogUrl,'CATALOG');activate(book,bookUrl,'INSTRUCTION BOOK');activate(bundle,bundleUrl,'DOWNLOAD EVERYTHING FOR CHATGPT');
    if(published){note.textContent='Ready. Downloads use the final published Release tag. Re-downloading the same CURRENT package is allowed.'}else{note.textContent='CURRENT exists, but a stable published Release download could not be resolved. The buttons stay disabled instead of opening a broken page.'}
  }catch(e){setStatus('CURRENT MANIFEST UNAVAILABLE','failed');if(meta)meta.innerHTML=`<span>${String(e.message||e)}</span>`;if(note)note.textContent='Storyboard access still works. Designer AI downloads could not be resolved.';[bundle,catalog,book].forEach(resetDownload)}
}
copy?.addEventListener('click',async()=>{
  const c=manifest?.catalog||{},i=manifest?.instructionBook||{};
  const text=`Use the attached CURRENT STARWARS_DELTA Catalog and CURRENT Instruction Book together as the only authoring authority. Create a NEW Cutscene from my natural-language request. Do not reuse old JSON, old revisions, remembered asset IDs, or examples from previous chats. Catalog revision: ${c.catalogRevision||'CURRENT'}. Snapshot hash: ${c.snapshotContentHash||'CURRENT'}. Contract: ${c.contractRevision||manifest?.contractRevision||'CURRENT'}. Schema hash: ${c.schemaHash||manifest?.schemaHash||'CURRENT'}. Instruction Book: ${i.bookVersion||'CURRENT'}.`;
  try{await navigator.clipboard.writeText(text);copy.textContent='COPIED';setTimeout(()=>copy.textContent='COPY CHATGPT START MESSAGE',1600)}catch(_){window.prompt('Copy this message for ChatGPT:',text)}
});
load();setInterval(load,60000);
})();