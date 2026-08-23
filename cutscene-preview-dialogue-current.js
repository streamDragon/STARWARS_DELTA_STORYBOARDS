(()=>{
  const CURRENT_KEYS=['catalogRevision','contractRevision','schemaHash','snapshotContentHash','authoringRuleRegistryRevision'];
  const style=document.createElement('style');
  style.textContent=`
  .dlgStage{position:absolute;inset:0;z-index:22;pointer-events:none}
  .dlgCard{position:absolute;bottom:9%;width:18%;max-width:240px;min-width:130px;background:#070b13f2;border:1px solid #4c5873;border-radius:10px;overflow:hidden;box-shadow:0 12px 30px #000a;opacity:0;transition:opacity .12s linear,transform .18s ease}
  .dlgCard.left{left:2.5%;transform:translateX(-8px)}.dlgCard.right{right:2.5%;transform:translateX(8px)}
  .dlgCard.on{opacity:1;transform:translateX(0)}
  .dlgPortrait{width:100%;aspect-ratio:1.18/1;display:block;background:#0a0f18;object-fit:contain}
  .dlgInfo{padding:6px 8px;background:#080c14e8}.dlgName{font-size:11px;font-weight:900;color:#eef3ff}.dlgExpr{font-size:9px;color:#f2c86b;margin-top:2px}.dlgIdentity{font-size:8px;color:#7de0a1;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dlgMissing{height:128px;display:grid;place-items:center;text-align:center;padding:8px;color:#f1c96c;font-size:9px;border-bottom:1px dashed #765;white-space:pre-line}
  .dlgCenter{position:absolute;left:22%;right:22%;bottom:2.5%;min-height:58px;background:#05070bf2;border:1px solid #465069;border-radius:9px;padding:8px 12px;text-shadow:0 2px 7px #000;opacity:0;transition:opacity .12s linear}
  .dlgCenter.on{opacity:1}.dlgCenter .speaker{font-size:10px;font-weight:900;color:#9db3ff}.dlgCenter .emotion{font-size:9px;color:#f1ca70;margin-left:7px}.dlgCenter .text{font-size:13px;line-height:1.28;margin-top:3px;color:#f3f5f9}
  .dlgCenter.blocked{left:14%;right:14%;bottom:7%;border-color:#9b3f49;background:#23090df5;color:#ffd5d9;opacity:1}
  .dlgCenter.blocked .speaker{color:#ff8993}.dlgCenter.blocked .text{font-size:11px;white-space:pre-line;color:#ffd5d9}
  .dlgStageTag{position:absolute;left:10px;top:10px;background:#07130dec;border:1px solid #3f7654;border-radius:999px;padding:3px 7px;color:#7de0a1;font-size:8px;font-weight:800}
  .dlgStageTag.blocked{background:#25090dec;border-color:#9b3f49;color:#ff8993}
  `;
  document.head.appendChild(style);

  let dialogueRoot=null,dlgState=null;
  const repertoire={ready:false,reason:'not loaded',tx:'',required:null,byId:new Map(),available:[]};
  const dnorm=v=>String(v??'').trim();
  const arrays=v=>Array.isArray(v)?v:[];
  const nonEmpty=o=>CURRENT_KEYS.every(k=>String(o?.[k]??'').length>0);
  const sameRequired=(a,b)=>nonEmpty(a)&&nonEmpty(b)&&CURRENT_KEYS.every(k=>String(a[k])===String(b[k]));
  const txOf=o=>String(o?.publishTransactionId||o?.provenance?.publishTransactionId||o?.atomicIdentity?.publishTransactionId||'');
  const fresh=async url=>{const u=new URL(url,location.href);u.searchParams.set('_dlg',Date.now()+Math.random());const r=await fetch(u.href,{cache:'no-store'});if(!r.ok)throw new Error(`${url} HTTP ${r.status}`);return r.json()};
  const castArrays=j=>[
    j?.cast,j?.actors,j?.storyboard?.cast,j?.cutscene?.cast,j?.script?.cast,j?.data?.cast,
    ...arrays(j?.sequences).map(x=>x?.cast),...arrays(j?.storyboard?.sequences).map(x=>x?.cast),...arrays(j?.cutscene?.sequences).map(x=>x?.cast)
  ].filter(Array.isArray);

  async function loadRepertoire(){
    try{
      const [current,open,rep]=await Promise.all([
        fresh('designer-ai/current.json'),
        fresh('designer-ai/open-current/OPEN_CURRENT.json'),
        fresh('designer-ai/open-current/EMOTIONAL_DIALOGUE_CURRENT.json')
      ]);
      const tx=txOf(open);
      if(current?.status!=='CURRENT_VERIFIED'||open?.status!=='CURRENT_VERIFIED_OPEN'||!tx)throw new Error('CURRENT identity is not verified');
      if(txOf(current)!==tx||!sameRequired(current.requiredCurrent,open.requiredCurrent))throw new Error('CURRENT/open-current mismatch');
      if(rep?.schema!=='STARWARS_DELTA_EMOTIONAL_DIALOGUE_CURRENT'||rep?.schemaVersion!==1||rep?.status!=='CURRENT_VERIFIED_EMOTIONAL_DIALOGUE')throw new Error('Emotional Dialogue CURRENT is not verified');
      if(txOf(rep)!==tx||!sameRequired(rep.requiredCurrent,open.requiredCurrent))throw new Error('Emotional Dialogue CURRENT is stale/non-atomic');
      repertoire.byId.clear();
      for(const c of rep.characters||[])if(c?.authoringReady===true&&dnorm(c.actorId))repertoire.byId.set(String(c.actorId),c);
      repertoire.available=[...repertoire.byId.keys()];
      if(!repertoire.available.length)throw new Error('zero authoring-ready Emotional Dialogue characters');
      repertoire.ready=true;repertoire.reason='';repertoire.tx=tx;repertoire.required=rep.requiredCurrent;
      console.info(`[CUTSCENE_PREVIEW] Emotional Dialogue CLOSED WORLD ready: ${repertoire.available.length} characters`);
    }catch(e){
      repertoire.ready=false;repertoire.reason=String(e?.message||e);repertoire.byId.clear();repertoire.available=[];
      console.warn('[CUTSCENE_PREVIEW] dialogue authoring disabled:',repertoire.reason);
    }
    queueMicrotask(updateDialogue);
  }

  function getLines(w){
    if(!w||w.simple)return[];
    const s=w.shot||{},q=w.seq||{};
    const normalize=v=>typeof v==='string'?{text:v}:v;
    const seq=[...arrays(q.dialogue),...arrays(q.dialogues),...arrays(q.lines)].map(normalize);
    const shot=[...arrays(s.dialogue),...arrays(s.dialogues),...arrays(s.lines)].map(normalize);
    return [...seq,...shot].filter(x=>x&&typeof x==='object');
  }

  function participantId(line,side){
    return line?.[`${side}ActorId`]??line?.[`${side}Id`]??line?.[side==='speaker'?'actorId':'targetActorId']??null;
  }
  function castActor(id){
    if(id==null)return null;
    const exact=String(id);
    const fromMap=typeof cast!=='undefined'&&cast?.get?cast.get(exact):null;
    if(fromMap){const fid=fromMap?.entityId??fromMap?.actorId??fromMap?.id;if(fid==null||String(fid)===exact)return fromMap;}
    for(const a of castArrays(dialogueRoot).flat()){
      const aid=a?.entityId??a?.actorId??a?.id;
      if(aid!=null&&String(aid)===exact)return a;
    }
    return null;
  }
  function requestedExpression(line,side,ch){
    const raw=line?.[`${side}Expression`]??line?.[`${side}Emotion`]??line?.[side==='speaker'?'emotion':'listenerEmotion'];
    return dnorm(raw)||dnorm(ch?.defaultExpression)||'Neutral';
  }
  function participant(line,side){
    const idRaw=participantId(line,side),id=idRaw==null?'':String(idRaw),ch=repertoire.byId.get(id)||null,actor=castActor(id);
    const expr=requestedExpression(line,side,ch);
    const supported=!!ch&&Array.isArray(ch.supportedExpressions)&&ch.supportedExpressions.includes(expr);
    const identityHandle=dnorm(actor?.identityHandle),identityMatches=!!ch&&(!identityHandle||identityHandle===String(ch.identityHandle));
    const portraitId=ch?.defaultPresentationHandle||null;
    const descriptor=portraitId&&typeof resolveVisual==='function'?resolveVisual(portraitId):null;
    let blocker='';
    if(!repertoire.ready)blocker=`DIALOGUE AUTHORING DISABLED\n${repertoire.reason}`;
    else if(!id)blocker=`DIALOGUE_CHARACTER_OUTSIDE_REPERTOIRE\nMissing ${side} actorId.`;
    else if(!ch)blocker=`DIALOGUE_CHARACTER_OUTSIDE_REPERTOIRE\nRequested: ${id}\nAvailable CURRENT Emotional Dialogue characters:\n${repertoire.available.join(', ')}`;
    else if(!actor)blocker=`DIALOGUE_CAST_ID_MISSING\n${id} is in Emotional Dialogue CURRENT but is not present in the uploaded cast.`;
    else if(!identityMatches)blocker=`DIALOGUE_CHARACTER_OUTSIDE_REPERTOIRE\n${id} cast identityHandle does not match Emotional Dialogue CURRENT.`;
    else if(!supported)blocker=`DIALOGUE_EXPRESSION_OUTSIDE_REPERTOIRE\nCharacter: ${id}\nRequested: ${expr}\nSupported: ${(ch.supportedExpressions||[]).join(', ')}`;
    return {side,id,ch,actor,expr,portraitId,descriptor,blocker,name:ch?.displayName||id||'Unknown'};
  }

  function portraitCanvas(d){
    const c=document.createElement('canvas');c.className='dlgPortrait';
    if(!d)return c;
    const img=new Image();img.crossOrigin='anonymous';
    img.onload=()=>{try{const src=typeof crop==='function'?crop(img,d,true):null;if(!src)return;c.width=Math.max(1,src.width);c.height=Math.max(1,src.height);c.getContext('2d').drawImage(src,0,0,c.width,c.height)}catch{}};
    img.src=d.url;return c;
  }
  function makeCard(side){const card=document.createElement('div');card.className='dlgCard '+side;const media=document.createElement('div'),info=document.createElement('div');info.className='dlgInfo';card.append(media,info);return{card,media,info,lastKey:''}}
  function ensureStage(){
    let shell=stage.querySelector('.dlgStage');
    if(shell&&dlgState?.shell===shell)return dlgState;
    shell=document.createElement('div');shell.className='dlgStage';
    const tag=document.createElement('div');tag.className='dlgStageTag';tag.textContent='EMOTIONAL DIALOGUE · CLOSED WORLD';
    const left=makeCard('left'),right=makeCard('right'),center=document.createElement('div');center.className='dlgCenter';
    shell.append(tag,left.card,right.card,center);stage.appendChild(shell);
    dlgState={shell,tag,left,right,center,lineIndex:-1,lines:[]};return dlgState;
  }
  function setCard(box,p,on){
    box.card.classList.toggle('on',!!on);if(!on)return;
    const key=[p.id,p.portraitId,p.expr].join('|');
    if(box.lastKey===key)return;
    box.media.innerHTML='';
    if(p.descriptor)box.media.appendChild(portraitCanvas(p.descriptor));
    else{const m=document.createElement('div');m.className='dlgMissing';m.textContent=`${p.id}\nCharacterPack presentation unavailable in browser\nNo substitute used`;box.media.appendChild(m)}
    box.info.innerHTML=`<div class="dlgName">${esc(p.name)}</div><div class="dlgExpr">${esc(p.expr)}</div><div class="dlgIdentity">CURRENT CHARACTERPACK · ${esc(p.id)}</div>`;
    box.lastKey=key;
  }
  function writeDiag(html){
    const old=diag.querySelector('[data-dialogue-diag]');if(old)old.remove();const d=document.createElement('div');d.dataset.dialogueDiag='1';d.innerHTML=html;diag.appendChild(d);
  }
  function blockLine(state,problems){
    state.tag.classList.add('blocked');state.tag.textContent='DIALOGUE BLOCKED · CLOSED WORLD';
    state.left.card.classList.remove('on');state.right.card.classList.remove('on');
    state.center.className='dlgCenter on blocked';state.center.style.opacity=1;
    state.center.innerHTML=`<div class="speaker">DIALOGUE BLOCKED</div><div class="text">${esc(problems.join('\n\n'))}</div>`;
    writeDiag(`<hr><b>Emotional Dialogue</b><br><span class="bad">✕ ${esc(problems.join(' · '))}</span><br><span class="bad">No Actor/Ui/Atlas/filename/WorldActor fallback is allowed.</span>`);
  }

  function updateDialogue(){
    if(typeof mode==='undefined'||mode!=='v5'||!items?.length||!items[idx]||items[idx].simple){if(dlgState?.shell)dlgState.shell.remove();dlgState=null;return}
    const w=items[idx],lines=getLines(w),state=ensureStage();state.lines=lines;
    if(!lines.length){state.left.card.classList.remove('on');state.right.card.classList.remove('on');state.center.classList.remove('on');return}
    const p=typeof local==='function'?local():0,n=lines.length,i=Math.min(n-1,Math.floor(Math.max(0,Math.min(.9999,p))*n)),line=lines[i];
    const sp=participant(line,'speaker'),li=participant(line,'listener');
    const participants=[sp,...(li.id?[li]:[])],problems=[...new Set(participants.map(x=>x.blocker).filter(Boolean))];
    if(problems.length){blockLine(state,problems);state.lineIndex=i;return}
    state.tag.classList.remove('blocked');state.tag.textContent='EMOTIONAL DIALOGUE · CLOSED WORLD';state.center.className='dlgCenter on';
    setCard(state.left,sp,true);setCard(state.right,li,!!li.id);
    const seg=p*n-i,fade=Math.max(0,Math.min(1,Math.min(seg*7,(1-seg)*7)));state.center.style.opacity=fade;
    state.center.innerHTML=`<div><span class="speaker">${esc(sp.name)}</span><span class="emotion">${esc(sp.expr)}</span></div><div class="text">${esc(line.text||line.line||line.content||'')}</div>`;
    if(i!==state.lineIndex){
      state.lineIndex=i;
      const missingVisual=participants.filter(x=>x.portraitId&&!x.descriptor).map(x=>x.id);
      writeDiag(`<hr><b>Emotional Dialogue CLOSED WORLD</b><br><span class="ok">✓ participants belong to CURRENT repertoire</span><br><span class="ok">✓ expressions validated against each CharacterPack</span><br><span class="ok">✓ presentation handle comes only from that CharacterPack</span><br>${missingVisual.length?`<span class="warn">⚠ exact CharacterPack presentation has no browser visual for: ${esc(missingVisual.join(', '))}; no substitute used.</span><br>`:''}<span class="warn">Browser preview does not claim Unity materialization success.</span>`);
    }
  }

  if(typeof loadText==='function'){
    const previousLoadText=loadText;
    loadText=function(text,name){try{dialogueRoot=JSON.parse(text)}catch{dialogueRoot=null}const r=previousLoadText(text,name);queueMicrotask(updateDialogue);return r};
  }
  if(typeof renderV5==='function'){const previousRenderV5=renderV5;renderV5=function(w){const r=previousRenderV5(w);updateDialogue();return r}}
  if(typeof tick==='function'){const previousTick=tick;tick=function(now){const r=previousTick(now);updateDialogue();return r}}
  if(typeof seek==='function'){const previousSeek=seek;seek=function(t){const r=previousSeek(t);updateDialogue();return r}}

  loadRepertoire();
})();