(()=>{
'use strict';
const UI_BUILD='20260915-devora-simple-downloads-v2';
if(!document.querySelector('link[data-ui-polish]')){const l=document.createElement('link');l.rel='stylesheet';l.href=`assets/ui-polish.css?build=${UI_BUILD}`;l.dataset.uiPolish='1';document.head.appendChild(l)}
if(!document.querySelector('script[data-ui-polish]')){const s=document.createElement('script');s.src=`assets/ui-polish.js?build=${UI_BUILD}`;s.defer=true;s.dataset.uiPolish='1';document.head.appendChild(s)}

const status=document.getElementById('designerStatus');
const meta=document.getElementById('designerMeta');
const note=document.getElementById('designerNote');
const atlasDownloadButton=document.getElementById('downloadAtlasOnly');
const visualLibraryButton=document.getElementById('downloadVisualLibrary');
const visualProofButton=document.getElementById('downloadVisualProof');
const copy=document.getElementById('copyChatStart');

const LOCAL_CURRENT='designer-ai/open-current/OPEN_CURRENT.json';
const CURRENT_VISUAL_PDF='designer-ai/open-current/full-visual-sheets/STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_CURRENT.pdf';
const short=s=>s?String(s).slice(0,12)+'…':'—';
const mb=n=>Number.isFinite(Number(n))?(Number(n)/1048576).toFixed(1)+' MB':'—';

async function refreshLinks(){
  try{
    const response=await fetch(LOCAL_CURRENT+'?ts='+Date.now(),{cache:'no-store'});
    if(!response.ok)return;
    const current=await response.json();
    const visualLibrary=current?.visualLibrary||{};
    const visualProof=current?.visualProof||{};
    const atlasPdfUrl=current?.visualAtlas?.pdfUrl||CURRENT_VISUAL_PDF;

    if(atlasDownloadButton&&atlasPdfUrl)atlasDownloadButton.href=atlasPdfUrl;
    if(visualLibraryButton&&visualLibrary.downloadUrl){visualLibraryButton.href=visualLibrary.downloadUrl;visualLibraryButton.removeAttribute('aria-disabled');}
    if(visualProofButton&&visualProof.downloadUrl){visualProofButton.href=visualProof.downloadUrl;visualProofButton.removeAttribute('aria-disabled');}

    if(status)status.textContent='READY';
    if(meta){
      const tx=current?.publishTransactionId||'CURRENT';
      const count=visualLibrary.assetCount||0;
      const size=visualLibrary.sizeBytes?mb(visualLibrary.sizeBytes):'—';
      meta.innerHTML=`<span>Transaction: <b>${tx}</b></span><span>Authoring: <b>Simple V1 CURRENT</b></span><span>Visual library: <b>${count} assets / ${size}</b></span>`;
    }
    if(note)note.textContent='Direct downloads are ready. CURRENT links refresh quietly in the background.';
  }catch(_){
    if(status)status.textContent='CURRENT UNAVAILABLE';
    if(note)note.textContent='CURRENT download links are unavailable; no stale fallback is used.';
  }
}

copy?.addEventListener('click',async()=>{
  const text='Use only the sealed STARWARS_DELTA CURRENT at https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/CHATGPT_START.txt and verify https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/OPEN_CURRENT.json. For a NEW movie, author exactly one CUTSCENE_SCRIPT_V1 from my natural-language request. Do NOT ask me for a Request Report/COPY REQUEST, do NOT hand-author V3/V5, raw Actor IDs or raw Animation IDs. V3/V5 are backend only. Use REPAIR only after Unity rejects a specific candidate and supplies diagnostics. Return the movie as a real downloadable .json file.';
  try{await navigator.clipboard.writeText(text);copy.textContent='COPIED';setTimeout(()=>copy.textContent='COPY FOR CHAT',1600)}catch(_){window.prompt('Copy this message for ChatGPT:',text)}
});

refreshLinks();
setInterval(refreshLinks,60000);
})();
