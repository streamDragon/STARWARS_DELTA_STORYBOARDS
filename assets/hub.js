(()=>{
'use strict';
const UI_BUILD='20260920-current-visual-browser-v1';
if(!document.querySelector('link[data-ui-polish]')){const l=document.createElement('link');l.rel='stylesheet';l.href=`assets/ui-polish.css?build=${UI_BUILD}`;l.dataset.uiPolish='1';document.head.appendChild(l)}
if(!document.querySelector('script[data-ui-polish]')){const s=document.createElement('script');s.src=`assets/ui-polish.js?build=${UI_BUILD}`;s.defer=true;s.dataset.uiPolish='1';document.head.appendChild(s)}

const status=document.getElementById('designerStatus');
const meta=document.getElementById('designerMeta');
const note=document.getElementById('designerNote');
const atlasDownloadButton=document.getElementById('downloadAtlasOnly');
const visualLibraryButton=document.getElementById('downloadVisualLibrary');
const visualProofButton=document.getElementById('downloadVisualProof');
const copy=document.getElementById('copyChatStart');
const visualGrid=document.getElementById('visualBrowserGrid');
const visualSearch=document.getElementById('visualSearch');
const visualType=document.getElementById('visualType');
const visualMessage=document.getElementById('visualBrowserMessage');
const visualStats=document.getElementById('visualBrowserStats');

const ROOT='designer-ai/open-current/';
const LOCAL_CURRENT=ROOT+'OPEN_CURRENT.json';
const AUTHORING_INDEX=ROOT+'CHATGPT_AUTHORING_INDEX.json';
const ANIMATION_INDEX=ROOT+'simple-authoring/ANIMATION_RETRIEVAL_INDEX.json';
const FULL_VISUAL_INDEX=ROOT+'FULL_VISUAL_INDEX.json';
const CURRENT_VISUAL_PDF=ROOT+'full-visual-sheets/STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_CURRENT.pdf';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mb=n=>Number.isFinite(Number(n))?(Number(n)/1048576).toFixed(1)+' MB':'—';
let visualState=null;

function previewUrl(v){
  if(!v)return '';
  if(v.pageImageUrl)return /^https?:/.test(v.pageImageUrl)?v.pageImageUrl:ROOT+v.pageImageUrl.replace(/^\/+/, '');
  if(v.previewUrl)return v.previewUrl;
  return '';
}
function visualThumb(v,name){
  const url=previewUrl(v);
  if(!url)return '<div class="visual-card-missing">NO PUBLISHED PREVIEW</div>';
  const slot=Number(v?.atlasSlot||v?.visualSheetsSlot||0);
  if(slot>=1&&slot<=12&&v?.pageImageUrl){
    const col=(slot-1)%3,row=Math.floor((slot-1)/3);
    const x=col===0?0:col===1?50:100;
    const y=row===0?0:row===1?33.333:row===2?66.667:100;
    return `<a class="visual-crop-link" href="${esc(url)}" target="_blank" rel="noopener"><div class="visual-crop" role="img" aria-label="${esc(name)}" style="background-image:url('${esc(url)}');background-position:${x}% ${y}%"></div></a>`;
  }
  return `<a href="${esc(url)}" target="_blank" rel="noopener"><img loading="lazy" src="${esc(url)}" alt="${esc(name)}"></a>`;
}
function card(item){
  const badge=item.kind==='animation'?'ANIMATION':item.animated?'ANIMATED ACTOR':item.kind.toUpperCase();
  const sub=item.subtitle||'';
  return `<article class="visual-card">${visualThumb(item.visual,item.name)}<div class="visual-card-body"><div class="visual-card-badge">${badge}</div><h3>${esc(item.name)}</h3>${sub?`<p>${esc(sub)}</p>`:''}${item.animationCount?`<button class="visual-animations-toggle" data-actor="${esc(item.handle)}">SHOW ${item.animationCount} ANIMATIONS</button>`:''}<div class="visual-animation-detail" data-detail="${esc(item.handle||'')}"></div></div></article>`;
}
function flattenGroups(groups,kind,visualByRef){
  const out=[];
  Object.entries(groups||{}).forEach(([group,arr])=>(arr||[]).forEach(x=>out.push({kind,name:x.displayName||x.handle,handle:x.handle,subtitle:group,visual:visualByRef.get(x.visualReferenceId)||{previewUrl:x.previewUrl,pageImageUrl:x.previewUrl}})));
  return out;
}
function actorAnimations(handle){
  const actor=visualState?.animationIndex?.actors?.[handle];
  if(!actor)return [];
  const seen=new Set(),out=[];
  Object.entries(actor.byIntent||{}).forEach(([intent,bucket])=>(bucket?.candidates||[]).forEach(c=>{
    const key=c.animationHandle||c.displayName;
    if(seen.has(key))return; seen.add(key);
    out.push({kind:'animation',name:c.displayName||c.animationHandle,handle:c.animationHandle,subtitle:intent,visual:visualState.visualByRef.get(c.visualReferenceId)});
  }));
  return out;
}
function bindAnimationToggles(){
  visualGrid?.querySelectorAll('.visual-animations-toggle').forEach(btn=>btn.onclick=()=>{
    const box=visualGrid.querySelector(`[data-detail="${CSS.escape(btn.dataset.actor)}"]`);
    if(!box)return;
    if(box.classList.contains('open')){box.classList.remove('open');box.innerHTML='';btn.textContent=btn.dataset.closedText||btn.textContent.replace('HIDE','SHOW');return}
    const rows=actorAnimations(btn.dataset.actor);
    box.innerHTML=rows.length?rows.map(x=>{const u=previewUrl(x.visual);return `<div class="mini-animation">${visualThumb(x.visual,x.name)}<span><b>${esc(x.name)}</b><small>${esc(x.subtitle)}</small></span></div>`}).join(''):'<div class="hub-note">No visual animation evidence is published for this Actor.</div>';
    box.classList.add('open');btn.dataset.closedText=btn.textContent;btn.textContent='HIDE ANIMATIONS';
  });
}
function renderVisuals(){
  if(!visualState||!visualGrid)return;
  const q=(visualSearch?.value||'').trim().toLowerCase();
  const type=visualType?.value||'animated';
  let rows=type==='animated'?visualState.animatedActors:type==='actors'?visualState.actors:type==='animations'?visualState.animations:type==='effects'?visualState.effects:visualState.scenery;
  if(q)rows=rows.filter(x=>(x.name+' '+x.subtitle+' '+(x.searchTerms||'')).toLowerCase().includes(q));
  rows=rows.slice(0,120);
  visualGrid.innerHTML=rows.length?rows.map(card).join(''):'<div class="hub-note">No CURRENT visuals match this filter.</div>';
  if(visualMessage)visualMessage.textContent=`Showing ${rows.length} CURRENT items. Click an image for the published visual evidence.`;
  bindAnimationToggles();
}
async function loadVisualBrowser(){
  if(!visualGrid)return;
  const [indexRes,animRes,visualRes]=await Promise.all([
    fetch(AUTHORING_INDEX+'?ts='+Date.now(),{cache:'no-store'}),
    fetch(ANIMATION_INDEX+'?ts='+Date.now(),{cache:'no-store'}),
    fetch(FULL_VISUAL_INDEX+'?ts='+Date.now(),{cache:'no-store'})
  ]);
  if(!indexRes.ok||!animRes.ok||!visualRes.ok)throw new Error(`CURRENT visual sources unavailable (${indexRes.status}/${animRes.status}/${visualRes.status})`);
  const [index,animationIndex,fullVisual]=await Promise.all([indexRes.json(),animRes.json(),visualRes.json()]);
  const visualByRef=new Map((fullVisual.assets||[]).map(v=>[v.visualReferenceId,v]));
  const actors=(index.actors||[]).map(a=>{const v=visualByRef.get(a.visualReferenceId)||{previewUrl:a.previewUrl,pageImageUrl:a.previewUrl};const artpack=String(v?.sourcePath||'').toLowerCase().includes('/artpack/');return {kind:'actor',name:a.displayName||a.handle,handle:a.handle,animated:!!a.animated,animationCount:Number(a.compatibleAnimationCount||0),subtitle:(artpack?'ARTPACK · ':'')+(a.animationIntents||[]).join(', '),searchTerms:[...(a.searchTerms||[]),v?.sourcePath||'',artpack?'artpack':''].join(' '),visual:v};});
  const animations=(fullVisual.assets||[]).filter(v=>String(v.category).toLowerCase()==='animation').map(v=>({kind:'animation',name:v.displayName||v.assetId,handle:v.assetId,subtitle:(v.sourcePath||'').split('/').slice(-3,-1).join(' / '),visual:v}));
  const effects=flattenGroups(index.effectGroups,'effect',visualByRef);
  const scenery=flattenGroups(index.sceneryGroups,'scenery',visualByRef);
  visualState={index,animationIndex,visualByRef,actors,animatedActors:actors.filter(a=>a.animated),animations,effects,scenery};
  if(visualStats)visualStats.innerHTML=`<div class="stat"><b>${actors.length}</b><span>Actors</span></div><div class="stat"><b>${actors.filter(a=>a.animated).length}</b><span>Animated Actors</span></div><div class="stat"><b>${animations.length}</b><span>Animation visuals</span></div>`;
  renderVisuals();
}
async function refreshLinks(){
  try{
    const response=await fetch(LOCAL_CURRENT+'?ts='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const current=await response.json();
    const visualLibrary=current?.visualLibrary||{};
    const visualProof=current?.visualProof||{};
    const atlasPdfUrl=current?.visualAtlas?.pdfUrl||CURRENT_VISUAL_PDF;
    if(atlasDownloadButton&&atlasPdfUrl){atlasDownloadButton.href=atlasPdfUrl;atlasDownloadButton.removeAttribute('aria-disabled');}
    if(visualLibraryButton){visualLibraryButton.href=visualLibrary.downloadUrl||CURRENT_VISUAL_PDF;visualLibraryButton.removeAttribute('aria-disabled');}
    if(visualProofButton){visualProofButton.href=visualProof.downloadUrl||CURRENT_VISUAL_PDF;visualProofButton.removeAttribute('aria-disabled');}
    if(status)status.textContent='READY';
    if(meta){const tx=current?.publishTransactionId||'CURRENT';const count=visualLibrary.assetCount||0;const size=visualLibrary.sizeBytes?mb(visualLibrary.sizeBytes):'—';meta.innerHTML=`<span>Transaction: <b>${esc(tx)}</b></span><span>Authoring: <b>Simple V1 CURRENT</b></span><span>Visual library: <b>${count} assets / ${size}</b></span>`;}
    if(note)note.textContent='Normal movie workflow: COPY FOR CHAT, paste into ChatGPT, then describe the movie. The Visual Browser below is optional browsing.';
  }catch(e){if(status)status.textContent='CURRENT UNAVAILABLE';if(note)note.textContent='CURRENT links are unavailable; no stale fallback is used.';}
}
copy?.addEventListener('click',async()=>{
  const text='Use only the sealed STARWARS_DELTA CURRENT at https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/CHATGPT_START.txt and verify https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current/OPEN_CURRENT.json. For visual choices, use the matching CURRENT CHATGPT_AUTHORING_INDEX previewUrl when present and do not guess appearance from names. For a NEW movie, author exactly one CUTSCENE_SCRIPT_V1 from my natural-language request. Do NOT ask me for a Request Report/COPY REQUEST, do NOT hand-author V3/V5, raw Actor IDs or raw Animation IDs. V3/V5 are backend only. Use REPAIR only after Unity rejects a specific candidate and supplies diagnostics. Return the movie as a real downloadable .json file.';
  try{await navigator.clipboard.writeText(text);copy.textContent='COPIED';setTimeout(()=>copy.textContent='COPY FOR CHAT',1600)}catch(_){window.prompt('Copy this message for ChatGPT:',text)}
});
[visualSearch,visualType].filter(Boolean).forEach(x=>x.addEventListener(x===visualSearch?'input':'change',renderVisuals));
refreshLinks();
loadVisualBrowser().catch(e=>{if(visualMessage)visualMessage.textContent='Could not load CURRENT Visual Browser: '+e.message;});
setInterval(refreshLinks,60000);
})();