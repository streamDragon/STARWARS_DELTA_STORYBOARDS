(()=>{
'use strict';
const UI_BUILD='20260915-devora-direct-downloads-v1';
if(!document.querySelector('link[data-ui-polish]')){const l=document.createElement('link');l.rel='stylesheet';l.href=`assets/ui-polish.css?build=${UI_BUILD}`;l.dataset.uiPolish='1';document.head.appendChild(l)}
if(!document.querySelector('script[data-ui-polish]')){const s=document.createElement('script');s.src=`assets/ui-polish.js?build=${UI_BUILD}`;s.defer=true;s.dataset.uiPolish='1';document.head.appendChild(s)}

const status=document.getElementById('designerStatus');
const meta=document.getElementById('designerMeta');
const note=document.getElementById('designerNote');
const atlasDownloadButton=document.getElementById('downloadAtlasOnly');
const visualLibraryButton=document.getElementById('downloadBundle');
const obsoleteCatalogButton=document.getElementById('downloadCatalog');
const obsoleteBookButton=document.getElementById('downloadBook');
const copy=document.getElementById('copyChatStart');
let openCurrent=null;

const LOCAL_CURRENT='designer-ai/open-current/OPEN_CURRENT.json';
const RAW_CURRENT='https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/designer-ai/open-current/OPEN_CURRENT.json';
const CURRENT_VISUAL_PDF='designer-ai/open-current/full-visual-sheets/STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_CURRENT.pdf';
const short=s=>s?String(s).slice(0,12)+'…':'—';
const mb=n=>Number.isFinite(Number(n))?(Number(n)/1048576).toFixed(1)+' MB':'—';
const setStatus=(text,kind)=>{if(!status)return;status.textContent=text;status.className='hub-status'+(kind?' '+kind:'')};
const fallbackUrl=el=>el?.dataset?.fallbackUrl||'';
const resetDownload=el=>{
  if(!el)return;
  const fallback=fallbackUrl(el);
  delete el.dataset.downloadUrl;
  if(fallback){
    el.href=fallback;
    el.classList.remove('disabled');
    el.removeAttribute('aria-disabled');
    return;
  }
  el.classList.add('disabled');
  el.removeAttribute('href');
  el.setAttribute('aria-disabled','true');
};
const activate=(el,url,label)=>{if(!el||!url){resetDownload(el);return}el.textContent=label;el.href=url;el.dataset.downloadUrl=url;el.classList.remove('disabled');el.removeAttribute('aria-disabled')};

// One public authoring site: the main Hub. OPEN_CURRENT is the single public CURRENT source.
// Normal NEW authoring is Simple V1. Legacy request-scoped authoring packages are not part of the UI.
// Download links are progressively enhanced: verified public fallbacks remain usable even if CURRENT verification is unavailable.
obsoleteCatalogButton?.remove();
obsoleteBookButton?.remove();
if(atlasDownloadButton)atlasDownloadButton.textContent='DOWNLOAD VISUAL PDF';
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

    // The public site must prefer the CURRENT that GitHub Pages actually serves.
    // Git main may legitimately be ahead during a publication or provenance repair.
    openCurrent=pagesCurrent||gitCurrent;
    const identity=verifyCurrent(openCurrent);
    const visualLibrary=openCurrent.visualLibrary||{};
    const atlasPdfUrl=openCurrent.visualAtlas?.pdfUrl||CURRENT_VISUAL_PDF;
    const gitMatchesPages=!gitCurrent||!pagesCurrent||gitCurrent.publishTransactionId===pagesCurrent.publishTransactionId;

    if(pagesCurrent&&gitCurrent&&!gitMatchesPages){
      setStatus('CURRENT VERIFIED · GIT AHEAD','warning');
    }else if(!pagesCurrent&&gitCurrent){
      setStatus('CURRENT VERIFIED · PAGES FALLBACK TO GIT','warning');
    }else{
      setStatus('CURRENT VERIFIED','');
    }

    if(meta)meta.innerHTML=`<span>Transaction: <b>${identity.publishTransactionId}</b></span><span>Catalog revision: <b>${identity.catalogRevision}</b></span><span>Rules: <b>${short(identity.authoringRuleRegistryRevision)}</b></span><span>Authoring: <b>Simple V1 CURRENT</b></span><span>Visual library: <b>${visualLibrary.assetCount||0} assets / ${mb(visualLibrary.sizeBytes)}</b></span>`;

    activate(visualLibraryButton,visualLibrary.downloadUrl,'DOWNLOAD VISUAL LIBRARY');
    activate(atlasDownloadButton,atlasPdfUrl,'DOWNLOAD VISUAL PDF');

    if(note)note.textContent='Downloads are direct. The page prefers the verified CURRENT served by GitHub Pages and keeps fallback downloads available if verification is temporarily unavailable.';
  }catch(e){
    setStatus('CURRENT CHECK FAILED · DOWNLOAD FALLBACK READY','warning');
    if(meta)meta.innerHTML=`<span>${String(e.message||e)}</span><span><b>Verified fallback downloads remain available.</b></span>`;
    if(note)note.textContent='Designer AI CURRENT verification could not complete, but the published fallback Visual PDF and Visual Library can still be downloaded directly from this page.';
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
