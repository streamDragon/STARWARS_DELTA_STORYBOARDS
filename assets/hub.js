(()=>{
'use strict';
const UI_BUILD='20260920-current-sync-v2';
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
const AUTHORING_INDEX='designer-ai/open-current/CHATGPT_AUTHORING_INDEX.json';
const ATLAS_MANIFEST='designer-ai/open-current/full-visual-sheets/VISUAL_ATLAS_CURRENT.json';
const CURRENT_VISUAL_PDF='designer-ai/open-current/full-visual-sheets/STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_CURRENT.pdf';
const mb=n=>Number.isFinite(Number(n))?(Number(n)/1048576).toFixed(1)+' MB':'—';
const fetchJson=async path=>{
  const r=await fetch(path+'?ts='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw new Error(path+' HTTP '+r.status);
  return r.json();
};
const countPreviewUrls=index=>{
  let count=0;
  const seen=new Set();
  const add=v=>{
    const url=v&&v.previewUrl;
    if(url&&!seen.has(url)){seen.add(url);count++;}
  };
  (index?.actors||[]).forEach(add);
  Object.values(index?.effectGroups||{}).flat().forEach(add);
  Object.values(index?.sceneryGroups||{}).flat().forEach(add);
  return count;
};

async function refreshLinks(){
  try{
    const [current,index,atlas]=await Promise.all([
      fetchJson(LOCAL_CURRENT),
      fetchJson(AUTHORING_INDEX),
      fetchJson(ATLAS_MANIFEST)
    ]);
    const tx=current?.publishTransactionId||'';
    const indexTx=index?.publishTransactionId||'';
    const atlasTx=atlas?.publishTransactionId||'';
    const sameCurrent=!!tx&&tx===indexTx&&tx===atlasTx;
    const visualLibrary=current?.visualLibrary||{};
    const visualProof=current?.visualProof||{};
    const atlasPdfUrl=current?.visualAtlas?.pdfUrl||atlas?.masterPdfUrl||CURRENT_VISUAL_PDF;
    const previewCount=countPreviewUrls(index);

    if(atlasDownloadButton){
      if(sameCurrent&&atlasPdfUrl){
        atlasDownloadButton.href=atlasPdfUrl;
        atlasDownloadButton.removeAttribute('aria-disabled');
        atlasDownloadButton.classList.remove('disabled');
      }else{
        atlasDownloadButton.removeAttribute('href');
        atlasDownloadButton.setAttribute('aria-disabled','true');
        atlasDownloadButton.classList.add('disabled');
      }
    }
    if(visualLibraryButton){
      if(visualLibrary.downloadUrl){
        visualLibraryButton.href=visualLibrary.downloadUrl;
        visualLibraryButton.removeAttribute('aria-disabled');
      }else{
        visualLibraryButton.removeAttribute('href');
        visualLibraryButton.setAttribute('aria-disabled','true');
      }
    }
    if(visualProofButton){
      if(visualProof.downloadUrl){
        visualProofButton.href=visualProof.downloadUrl;
        visualProofButton.removeAttribute('aria-disabled');
      }else{
        visualProofButton.removeAttribute('href');
        visualProofButton.setAttribute('aria-disabled','true');
      }
    }

    if(status){
      status.textContent=sameCurrent?'READY · CURRENT SYNCED':'CURRENT MISMATCH';
      status.classList.toggle('warn',!sameCurrent);
    }
    if(meta){
      const count=visualLibrary.assetCount||0;
      const size=visualLibrary.sizeBytes?mb(visualLibrary.sizeBytes):'—';
      meta.innerHTML=
        `<span>Transaction: <b>${tx||'UNKNOWN'}</b></span>`+
        `<span>Authoring index: <b>${indexTx===tx?'SYNCED':'MISMATCH'}</b></span>`+
        `<span>Visual atlas: <b>${atlasTx===tx?'SYNCED':'MISMATCH'}</b></span>`+
        `<span>Direct visual previews: <b>${previewCount}</b></span>`+
        `<span>Visual library: <b>${count} assets / ${size}</b></span>`;
    }
    if(note){
      note.textContent=sameCurrent
        ? 'CURRENT, authoring index and visual atlas are on the same transaction. Direct preview links are the preferred visual evidence.'
        : 'Do not author from mixed data. CURRENT, authoring index and visual atlas are not on the same transaction yet.';
    }
  }catch(err){
    if(status){status.textContent='CURRENT UNAVAILABLE';status.classList.add('warn');}
    if(note)note.textContent='CURRENT sync check failed. No stale fallback is treated as authoring truth.';
  }
}

copy?.addEventListener('click',async()=>{
  const text='Use only the sealed STARWARS_DELTA CURRENT at https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/CHATGPT_START.txt and verify https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/OPEN_CURRENT.json. For visual choices, use the matching CURRENT CHATGPT_AUTHORING_INDEX previewUrl when present and do not guess appearance from names. For a NEW movie, author exactly one CUTSCENE_SCRIPT_V1 from my natural-language request. Do NOT ask me for a Request Report/COPY REQUEST, do NOT hand-author V3/V5, raw Actor IDs or raw Animation IDs. V3/V5 are backend only. Use REPAIR only after Unity rejects a specific candidate and supplies diagnostics. Return the movie as a real downloadable .json file.';
  try{await navigator.clipboard.writeText(text);copy.textContent='COPIED';setTimeout(()=>copy.textContent='COPY FOR CHAT',1600)}catch(_){window.prompt('Copy this message for ChatGPT:',text)}
});

refreshLinks();
setInterval(refreshLinks,60000);
})();
