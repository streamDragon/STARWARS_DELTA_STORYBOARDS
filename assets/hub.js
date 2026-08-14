(()=>{
'use strict';
const UI_BUILD='20260814-1440-v2.3DIRECTOR';
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
let openCurrent=null;
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
    const [manifestResponse,openResponse]=await Promise.all([
      fetch('designer-ai/current.json?ts='+Date.now(),{cache:'no-store'}),
      fetch('designer-ai/open-current/OPEN_CURRENT.json?ts='+Date.now(),{cache:'no-store'})
    ]);
    if(!manifestResponse.ok)throw new Error(`CURRENT HTTP ${manifestResponse.status}`);
    if(!openResponse.ok)throw new Error(`OPEN CURRENT HTTP ${openResponse.status}`);
    manifest=await manifestResponse.json();
    openCurrent=await openResponse.json();
    if(openCurrent.status!=='CURRENT_VERIFIED_OPEN'||openCurrent.publishTransactionId!==manifest.publishTransactionId)throw new Error('Director CURRENT does not match Unity CURRENT');
    const c=manifest.catalog||{},i=manifest.instructionBook||{},b=manifest.bundle||{};
    const catalogUrl=stableAssetUrl(manifest,c),bookUrl=stableAssetUrl(manifest,i),bundleUrl=stableAssetUrl(manifest,b);
    const published=!!(catalogUrl&&bookUrl&&bundleUrl);
    setStatus(published?'FULL DIRECTOR CURRENT':'CURRENT NOT READY',published?'':'warn');
    meta.innerHTML=`<span>Transaction: <b>${manifest.publishTransactionId||'—'}</b></span><span>Catalog revision: <b>${c.catalogRevision||openCurrent.catalogRevision||'—'}</b></span><span>Contract: <b>${short(c.contractRevision||manifest.contractRevision)}</b></span><span>Schema: <b>${short(c.schemaHash||manifest.schemaHash)}</b></span><span>Snapshot: <b>${short(c.snapshotContentHash||openCurrent.snapshotContentHash)}</b></span><span>Instruction Book: <b>${i.bookVersion||'—'}</b></span>`;
    if(manifest.publishedUtc)meta.innerHTML+=`<span>Unity publish: <b>${String(manifest.publishedUtc).replace('T',' ').slice(0,19)} UTC</b></span>`;
    activate(catalog,catalogUrl,'CATALOG');activate(book,bookUrl,'INSTRUCTION BOOK');activate(bundle,bundleUrl,'DOWNLOAD EVERYTHING FOR CHATGPT');
    if(published){note.textContent='Debora normal flow: open DEBORA CUTSCENE START and press COPY FOR CHAT. Downloads below are advanced/fallback archives for the same atomic CURRENT.'}else{note.textContent='CURRENT exists, but a stable published Release download could not be resolved. The buttons stay disabled instead of opening a broken page.'}
  }catch(e){setStatus('CURRENT MANIFEST UNAVAILABLE','failed');if(meta)meta.innerHTML=`<span>${String(e.message||e)}</span>`;if(note)note.textContent='Storyboard access still works. Designer AI CURRENT could not be resolved.';[bundle,catalog,book].forEach(resetDownload)}
}
copy?.addEventListener('click',async()=>{
  const fallback=(openCurrent?.download&&openCurrent.download.chatgptDirectorCurrentZipUrl)||'https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip';
  const text='Use the STARWARS_DELTA FULL DIRECTOR CURRENT instructions at https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/CHATGPT_START.txt . Read OPEN_CURRENT and the full Director View yourself. Verify the atomic identity; search Actors, Layers, Effects, UI, Animations and Audio; inspect real pageImageUrl pixels before visual choices; use exact current IDs; validate against the matching contract. If direct access genuinely fails, use the atomic fallback pack at '+fallback+'. Then create a NEW cutscene from my request.';
  try{await navigator.clipboard.writeText(text);copy.textContent='COPIED';setTimeout(()=>copy.textContent='COPY CHATGPT START MESSAGE',1600)}catch(_){window.prompt('Copy this message for ChatGPT:',text)}
});
load();setInterval(load,60000);
})();