(()=>{
'use strict';
const UI_BUILD='20260828-0425-v2.4CURRENT';
if(!document.querySelector('link[data-ui-polish]')){const l=document.createElement('link');l.rel='stylesheet';l.href=`assets/ui-polish.css?build=${UI_BUILD}`;l.dataset.uiPolish='1';document.head.appendChild(l)}
if(!document.querySelector('script[data-ui-polish]')){const s=document.createElement('script');s.src=`assets/ui-polish.js?build=${UI_BUILD}`;s.defer=true;s.dataset.uiPolish='1';document.head.appendChild(s)}

const status=document.getElementById('designerStatus');
const meta=document.getElementById('designerMeta');
const note=document.getElementById('designerNote');
const authoringPackageButton=document.getElementById('downloadAuthoringPackage');
const atlasDownloadButton=document.getElementById('downloadAtlasOnly');
const atlasButton=document.getElementById('downloadBundle');
const obsoleteCatalogButton=document.getElementById('downloadCatalog');
const obsoleteBookButton=document.getElementById('downloadBook');
const copy=document.getElementById('copyChatStart');
let openCurrent=null;

const LOCAL_CURRENT='designer-ai/open-current/OPEN_CURRENT.json';
const RAW_CURRENT='https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/designer-ai/open-current/OPEN_CURRENT.json';
const short=s=>s?String(s).slice(0,12)+'…':'—';
const setStatus=(text,kind)=>{if(!status)return;status.textContent=text;status.className='hub-status'+(kind?' '+kind:'')};
const resetDownload=el=>{if(!el)return;el.classList.add('disabled');el.removeAttribute('href');delete el.dataset.downloadUrl};
const activate=(el,url,label)=>{if(!el||!url){resetDownload(el);return}el.textContent=label;el.href=url;el.dataset.downloadUrl=url;el.classList.remove('disabled');el.removeAttribute('aria-disabled')};

// One public authoring site: the main Hub. OPEN_CURRENT is the single public CURRENT source.
// Git main is authoritative while GitHub Pages may briefly trail after a publish.
// designer-ai/current.json is publisher input only and must never be consumed by public UI.
obsoleteCatalogButton?.remove();
obsoleteBookButton?.remove();
if(authoringPackageButton)authoringPackageButton.textContent='DOWNLOAD DEVORA AUTHORING PACKAGE';
if(atlasDownloadButton)atlasDownloadButton.textContent='DOWNLOAD ATLAS ONLY';
if(atlasButton)atlasButton.textContent='VISUAL ATLAS';

function verifyAtomicIdentity(o){
  if(!o||!['CURRENT_VERIFIED','CURRENT_VERIFIED_OPEN'].includes(o.status))throw new Error('Open CURRENT is not verified');
  const identity=o.atomicIdentity||{};
  const required=['publishTransactionId','catalogRevision','snapshotContentHash','contractRevision','schemaHash','authoringRuleRegistryRevision'];
  for(const key of required){if(identity[key]===undefined||identity[key]===null||identity[key]==='')throw new Error('Atomic CURRENT identity missing '+key)}
  const expected={
    publishTransactionId:o.publishTransactionId,
    catalogRevision:o.catalogRevision,
    snapshotContentHash:o.snapshotContentHash,
    contractRevision:o.contractRevision,
    schemaHash:o.schemaHash,
    authoringRuleRegistryRevision:o.authoringRuleRegistryRevision
  };
  for(const key of required){if(identity[key]!==expected[key])throw new Error('Atomic CURRENT identity mismatch: '+key)}
  if(o.directorView?.requestScoped!==false)throw new Error('Director CURRENT is not full-catalog');
  if(o.visualAtlas?.publishTransactionId!==identity.publishTransactionId)throw new Error('Visual Atlas transaction mismatch');
  if(!o.visualAtlas?.pdfUrl)throw new Error('Visual Atlas URL missing');
  if(o.authoringPackage?.publishTransactionId!==identity.publishTransactionId)throw new Error('Authoring package transaction mismatch');
  if(!o.authoringPackage?.downloadUrl)throw new Error('Authoring package URL missing');
  return identity;
}

async function fetchCurrent(url){
  const joiner=url.includes('?')?'&':'?';
  const response=await fetch(url+joiner+'ts='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw new Error(`OPEN CURRENT HTTP ${response.status}`);
  const value=await response.json();
  verifyAtomicIdentity(value);
  return value;
}

async function load(){
  try{
    let pagesCurrent=null,pagesError=null,gitCurrent=null,gitError=null;
    try{pagesCurrent=await fetchCurrent(LOCAL_CURRENT)}catch(e){pagesError=e}
    try{gitCurrent=await fetchCurrent(RAW_CURRENT)}catch(e){gitError=e}

    if(!pagesCurrent&&!gitCurrent)throw new Error(`Pages: ${pagesError?.message||'unavailable'}; Git main: ${gitError?.message||'unavailable'}`);

    // Prefer Git main when available. A temporarily stale/broken Pages copy is propagation state, not a false product failure.
    openCurrent=gitCurrent||pagesCurrent;
    const identity=verifyAtomicIdentity(openCurrent);
    const counts=openCurrent.directorView?.counts||{};
    const atlas=openCurrent.visualAtlas||{};
    const authoringPackage=openCurrent.authoringPackage||{};
    const pagesSynced=!!pagesCurrent&&pagesCurrent.publishTransactionId===openCurrent.publishTransactionId;

    if(gitCurrent&&!pagesSynced){
      setStatus('CURRENT VERIFIED · PAGES PROPAGATING','warning');
    }else{
      setStatus('CURRENT VERIFIED','');
    }

    if(meta)meta.innerHTML=`<span>Transaction: <b>${identity.publishTransactionId}</b></span><span>Catalog revision: <b>${identity.catalogRevision}</b></span><span>Rules: <b>${short(identity.authoringRuleRegistryRevision)}</b></span><span>Director: <b>${counts.actors||0} actors / ${counts.layers||0} layers / ${counts.effects||0} effects / ${counts.ui||0} UI</b></span><span>Visual Atlas: <b>${atlas.totalPages||0} pages</b></span>`;
    activate(authoringPackageButton,authoringPackage.downloadUrl,'DOWNLOAD DEVORA AUTHORING PACKAGE');
    activate(atlasDownloadButton,atlas.pdfUrl,'DOWNLOAD ATLAS ONLY');
    activate(atlasButton,atlas.pdfUrl,'VISUAL ATLAS');
    if(note)note.textContent=pagesSynced
      ?'One normal path: download the current authoring package here, attach it to ChatGPT, and describe the film. OPEN_CURRENT is the only public CURRENT source.'
      :'Git main CURRENT is verified. GitHub Pages is still propagating; this is not a CURRENT failure.';
  }catch(e){
    setStatus('CURRENT UNAVAILABLE','failed');
    if(meta)meta.innerHTML=`<span>${String(e.message||e)}</span>`;
    if(note)note.textContent='Storyboard access still works. Designer AI authoring is blocked only because neither Git main nor Pages contains a verifiable OPEN_CURRENT.';
    resetDownload(authoringPackageButton);
    resetDownload(atlasDownloadButton);
    resetDownload(atlasButton);
  }
}

copy?.addEventListener('click',async()=>{
  const text='Use the sealed STARWARS_DELTA FULL DIRECTOR CURRENT instructions at https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/CHATGPT_START.txt . Read https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/OPEN_CURRENT.json and verify the complete atomic identity including authoringRuleRegistryRevision. Use only that matching Director, Catalog contract, Instruction Book and Visual Atlas. Create a NEW cutscene from my request.';
  try{await navigator.clipboard.writeText(text);copy.textContent='COPIED';setTimeout(()=>copy.textContent='COPY FOR CHAT',1600)}catch(_){window.prompt('Copy this message for ChatGPT:',text)}
});

load();
setInterval(load,60000);
})();