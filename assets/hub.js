(()=>{
'use strict';
const UI_BUILD='20260906-1930-v3.9.1-NO-LEGACY-PACK';
if(!document.querySelector('link[data-ui-polish]')){const l=document.createElement('link');l.rel='stylesheet';l.href=`assets/ui-polish.css?build=${UI_BUILD}`;l.dataset.uiPolish='1';document.head.appendChild(l)}
if(!document.querySelector('script[data-ui-polish]')){const s=document.createElement('script');s.src=`assets/ui-polish.js?build=${UI_BUILD}`;s.defer=true;s.dataset.uiPolish='1';document.head.appendChild(s)}

const status=document.getElementById('designerStatus');
const meta=document.getElementById('designerMeta');
const note=document.getElementById('designerNote');
const authoringPackageButton=document.getElementById('downloadAuthoringPackage');
const atlasDownloadButton=document.getElementById('downloadAtlasOnly');
const visualLibraryButton=document.getElementById('downloadBundle');
const obsoleteCatalogButton=document.getElementById('downloadCatalog');
const obsoleteBookButton=document.getElementById('downloadBook');
const copy=document.getElementById('copyChatStart');
let openCurrent=null;

const LOCAL_CURRENT='designer-ai/open-current/OPEN_CURRENT.json';
const RAW_CURRENT='https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/designer-ai/open-current/OPEN_CURRENT.json';
const short=s=>s?String(s).slice(0,12)+'…':'—';
const mb=n=>Number.isFinite(Number(n))?(Number(n)/1048576).toFixed(1)+' MB':'—';
const setStatus=(text,kind)=>{if(!status)return;status.textContent=text;status.className='hub-status'+(kind?' '+kind:'')};
const resetDownload=el=>{if(!el)return;el.classList.add('disabled');el.removeAttribute('href');el.setAttribute('aria-disabled','true');delete el.dataset.downloadUrl};
const activate=(el,url,label)=>{if(!el||!url){resetDownload(el);return}el.textContent=label;el.href=url;el.dataset.downloadUrl=url;el.classList.remove('disabled');el.removeAttribute('aria-disabled')};

// One public authoring site: the main Hub. OPEN_CURRENT is the single public CURRENT source.
// Git main is authoritative while GitHub Pages may briefly trail after a publish.
// Normal NEW authoring is Simple V1. The previous request-scoped package is intentionally not exposed.
obsoleteCatalogButton?.remove();
obsoleteBookButton?.remove();
resetDownload(authoringPackageButton);
if(authoringPackageButton)authoringPackageButton.textContent='AUTHORING PACKAGE AWAITING CLEAN REPUBLISH';
if(atlasDownloadButton)atlasDownloadButton.textContent='VISUAL PDF NOT PUBLISHED';
if(visualLibraryButton)visualLibraryButton.textContent='DOWNLOAD VISUAL LIBRARY';

function verifyCurrent(o){
  if(!o||!['CURRENT_VERIFIED','CURRENT_VERIFIED_OPEN'].includes(o.status))throw new Error('Open CURRENT is not verified');
  const required=o.requiredCurrent||{};
  const identity={
    publishTransactionId:o.publishTransactionId,
    catalogRevision:required.catalogRevision,
    snapshotContentHash:required.snapshotContentHash,
    contractRevision:o.contractRevision,
    schemaHash:o.schemaHash,
    authoringRuleRegistryRevision:o.authoringRuleRegistryRevision
  };
  for(const [key,value] of Object.entries(identity)){
    if(value===undefined||value===null||value==='')throw new Error('CURRENT identity missing '+key);
  }
  if(required.contractRevision!==o.contractRevision)throw new Error('CURRENT contract revision mismatch');
  if(required.schemaHash!==o.schemaHash)throw new Error('CURRENT schema hash mismatch');
  if(required.authoringRuleRegistryRevision!==o.authoringRuleRegistryRevision)throw new Error('CURRENT rules revision mismatch');
  if(o.provenance?.publishTransactionId!==o.publishTransactionId)throw new Error('CURRENT provenance transaction mismatch');
  if(!o.visualLibrary?.downloadUrl)throw new Error('Visual Library URL missing');
  if(o.visualLibrary?.catalogRevision!==required.catalogRevision)throw new Error('Visual Library catalog revision mismatch');
  if(o.visualLibrary?.snapshotContentHash!==required.snapshotContentHash)throw new Error('Visual Library snapshot mismatch');
  return identity;
}

async function fetchCurrent(url){
  const joiner=url.includes('?')?'&':'?';
  const response=await fetch(url+joiner+'ts='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw new Error(`OPEN CURRENT HTTP ${response.status}`);
  const value=await response.json();
  verifyCurrent(value);
  return value;
}

async function load(){
  try{
    let pagesCurrent=null,pagesError=null,gitCurrent=null,gitError=null;
    try{pagesCurrent=await fetchCurrent(LOCAL_CURRENT)}catch(e){pagesError=e}
    try{gitCurrent=await fetchCurrent(RAW_CURRENT)}catch(e){gitError=e}

    if(!pagesCurrent&&!gitCurrent)throw new Error(`Pages: ${pagesError?.message||'unavailable'}; Git main: ${gitError?.message||'unavailable'}`);

    openCurrent=gitCurrent||pagesCurrent;
    const identity=verifyCurrent(openCurrent);
    const visualLibrary=openCurrent.visualLibrary||{};
    const atlasPdfUrl=openCurrent.visualAtlas?.pdfUrl||null;
    const pagesSynced=!!pagesCurrent&&pagesCurrent.publishTransactionId===openCurrent.publishTransactionId;

    if(gitCurrent&&!pagesSynced){
      setStatus('CURRENT VERIFIED · PAGES PROPAGATING','warning');
    }else{
      setStatus('CURRENT VERIFIED','');
    }

    if(meta)meta.innerHTML=`<span>Transaction: <b>${identity.publishTransactionId}</b></span><span>Catalog revision: <b>${identity.catalogRevision}</b></span><span>Rules: <b>${short(identity.authoringRuleRegistryRevision)}</b></span><span>Authoring: <b>Simple V1 CURRENT</b></span><span>Visual library: <b>${visualLibrary.assetCount||0} assets / ${mb(visualLibrary.sizeBytes)}</b></span>`;

    resetDownload(authoringPackageButton);
    if(authoringPackageButton)authoringPackageButton.textContent='AUTHORING PACKAGE AWAITING CLEAN REPUBLISH';
    activate(visualLibraryButton,visualLibrary.downloadUrl,'DOWNLOAD VISUAL LIBRARY');
    if(atlasPdfUrl){
      activate(atlasDownloadButton,atlasPdfUrl,'DOWNLOAD VISUAL PDF ONLY');
    }else{
      resetDownload(atlasDownloadButton);
      if(atlasDownloadButton)atlasDownloadButton.textContent='VISUAL PDF NOT PUBLISHED';
    }

    if(note)note.textContent='Normal NEW authoring uses COPY FOR CHAT and the sealed public CURRENT. The previous request-scoped authoring ZIP is intentionally blocked until a clean Simple V1 package is republished.';
  }catch(e){
    setStatus('CURRENT UNAVAILABLE','failed');
    if(meta)meta.innerHTML=`<span>${String(e.message||e)}</span>`;
    if(note)note.textContent='Storyboard access still works. Designer AI authoring is blocked because OPEN_CURRENT could not be verified.';
    resetDownload(authoringPackageButton);
    resetDownload(atlasDownloadButton);
    resetDownload(visualLibraryButton);
  }
}

copy?.addEventListener('click',async()=>{
  const text='Use only the sealed STARWARS_DELTA CURRENT at https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/CHATGPT_START.txt and verify https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/OPEN_CURRENT.json. For a NEW movie, author exactly one CUTSCENE_SCRIPT_V1 from my natural-language request. Do NOT ask me for a Request Report/COPY REQUEST, do NOT hand-author V3/V5, raw Actor IDs or raw Animation IDs. V3/V5 are backend only. Use REPAIR only after Unity rejects a specific candidate and supplies diagnostics. Return the movie as a real downloadable .json file.';
  try{await navigator.clipboard.writeText(text);copy.textContent='COPIED';setTimeout(()=>copy.textContent='COPY FOR CHAT',1600)}catch(_){window.prompt('Copy this message for ChatGPT:',text)}
});

load();
setInterval(load,60000);
})();