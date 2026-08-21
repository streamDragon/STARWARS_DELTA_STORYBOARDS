(()=>{
  const style=document.createElement('style');
  style.textContent=`
  .dlgStage{position:absolute;inset:0;z-index:22;pointer-events:none}
  .dlgCard{position:absolute;bottom:9%;width:18%;max-width:240px;min-width:130px;background:#070b13e8;border:1px solid #4c5873;border-radius:10px;overflow:hidden;box-shadow:0 12px 30px #000a;opacity:0;transition:opacity .12s linear,transform .18s ease}
  .dlgCard.left{left:2.5%;transform:translateX(-8px)}.dlgCard.right{right:2.5%;transform:translateX(8px)}
  .dlgCard.on{opacity:1;transform:translateX(0)}
  .dlgPortrait{width:100%;aspect-ratio:1.18/1;display:block;background:#0a0f18;object-fit:contain}
  .dlgInfo{padding:6px 8px;background:#080c14e8}.dlgName{font-size:11px;font-weight:900;color:#eef3ff}.dlgExpr{font-size:9px;color:#f2c86b;margin-top:2px}.dlgIdentity{font-size:8px;color:#7de0a1;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dlgMissing{height:128px;display:grid;place-items:center;text-align:center;padding:8px;color:#f1c96c;font-size:9px;border-bottom:1px dashed #765}
  .dlgCenter{position:absolute;left:22%;right:22%;bottom:2.5%;min-height:58px;background:#05070bf2;border:1px solid #465069;border-radius:9px;padding:8px 12px;text-shadow:0 2px 7px #000;opacity:0;transition:opacity .12s linear}
  .dlgCenter.on{opacity:1}.dlgCenter .speaker{font-size:10px;font-weight:900;color:#9db3ff}.dlgCenter .emotion{font-size:9px;color:#f1ca70;margin-left:7px}.dlgCenter .text{font-size:13px;line-height:1.28;margin-top:3px;color:#f3f5f9}
  .dlgStageTag{position:absolute;left:10px;top:10px;background:#07130ddc;border:1px solid #3f7654;border-radius:999px;padding:3px 7px;color:#7de0a1;font-size:8px;font-weight:800}
  `;
  document.head.appendChild(style);

  let dialogueRoot=null,dlgState=null;
  const dnorm=v=>String(v??'').trim();
  const low=v=>dnorm(v).toLowerCase();
  const arrays=v=>Array.isArray(v)?v:[];
  const castArrays=j=>[
    j?.cast,j?.actors,j?.storyboard?.cast,j?.cutscene?.cast,j?.script?.cast,j?.data?.cast,
    ...arrays(j?.sequences).map(x=>x?.cast),...arrays(j?.storyboard?.sequences).map(x=>x?.cast),...arrays(j?.cutscene?.sequences).map(x=>x?.cast)
  ].filter(Array.isArray);

  function normalizePortraitActors(j){
    for(const a of castArrays(j).flat()){
      if(!a||typeof a!=='object')continue;
      const portraitOnly=low(a.presentationMode)==='dialogueportrait'||a.spawnWorldActor===false||a.dialogueOnly===true||a.portraitOnly===true;
      if(portraitOnly){
        a.__dialoguePortraitOnly=true;
        const r=String(a.role||'');
        if(!/portrait|dialogue/i.test(r))a.role=(r?r+' ':'')+'DialoguePortrait';
      }
    }
  }

  function getLines(w){
    if(!w||w.simple)return[];
    const s=w.shot||{},q=w.seq||{};
    const normalize=v=>typeof v==='string'?{text:v}:v;
    const seq=[...arrays(q.dialogue),...arrays(q.dialogues),...arrays(q.lines)].map(normalize);
    const shot=[...arrays(s.dialogue),...arrays(s.dialogues),...arrays(s.lines)].map(normalize);
    return [...seq,...shot].filter(x=>x&&typeof x==='object');
  }

  function castActor(id){
    if(id==null)return null;
    const fromMap=typeof cast!=='undefined'&&cast?.get?cast.get(String(id)):null;
    if(fromMap)return fromMap;
    for(const a of castArrays(dialogueRoot).flat()){
      const aid=a?.entityId??a?.actorId??a?.id;
      if(aid!=null&&String(aid)===String(id))return a;
    }
    return null;
  }

  function actorName(actor,id,fallback){return dnorm(fallback||actor?.displayName||actor?.name||actor?.characterName||id||'Unknown')}
  function explicitPortrait(line,side){
    const cap=side==='speaker'?'Speaker':'Listener';
    return line?.[`${side}PortraitAssetId`]||line?.[`${side}PortraitId`]||line?.[`${side}DialoguePortraitAssetId`]||line?.[`${side}BodyAssetId`]||line?.[`${cap}PortraitAssetId`];
  }
  function expression(line,side){return dnorm(line?.[`${side}Expression`]||line?.[`${side}Emotion`]||line?.[side==='speaker'?'emotion':'listenerEmotion']||'Neutral')}
  function participant(line,side){
    const id=line?.[`${side}ActorId`]||line?.[`${side}Id`]||line?.[side==='speaker'?'actorId':'targetActorId'];
    const actor=castActor(id);
    const explicit=explicitPortrait(line,side);
    const portraitId=explicit||actor?.speakerPortraitAssetId||actor?.portraitAssetId||actor?.dialoguePortraitAssetId||actor?.dialogueProfileAssetId||actor?.presentationAssetId||actor?.visualAssetId||actor?.actorAssetId||actor?.assetId||null;
    const descriptor=portraitId&&typeof resolveVisual==='function'?resolveVisual(portraitId):null;
    const identityResolved=!!actor||!!id;
    return {side,id,actor,portraitId,descriptor,identityResolved,name:actorName(actor,id,line?.[`${side}Name`]||(side==='speaker'?line?.speakerName:null)),expr:expression(line,side),portraitOnly:actor?.__dialoguePortraitOnly||low(actor?.presentationMode)==='dialogueportrait'||actor?.spawnWorldActor===false,explicit:!!explicit};
  }

  function portraitCanvas(d){
    const c=document.createElement('canvas');c.className='dlgPortrait';
    if(!d)return c;
    const img=new Image();img.crossOrigin='anonymous';
    img.onload=()=>{try{const src=typeof crop==='function'?crop(img,d,true):null;if(!src)return;c.width=Math.max(1,src.width);c.height=Math.max(1,src.height);c.getContext('2d').drawImage(src,0,0,c.width,c.height)}catch{}};
    img.src=d.url;return c;
  }

  function makeCard(side){
    const card=document.createElement('div');card.className='dlgCard '+side;
    const media=document.createElement('div'),info=document.createElement('div');info.className='dlgInfo';
    card.append(media,info);return{card,media,info,lastKey:''};
  }

  function ensureStage(){
    let shell=stage.querySelector('.dlgStage');
    if(shell&&dlgState?.shell===shell)return dlgState;
    shell=document.createElement('div');shell.className='dlgStage';
    const tag=document.createElement('div');tag.className='dlgStageTag';tag.textContent='DIALOGUE IDENTITY ≠ WORLD ACTOR';
    const left=makeCard('left'),right=makeCard('right'),center=document.createElement('div');center.className='dlgCenter';
    shell.append(tag,left.card,right.card,center);stage.appendChild(shell);
    dlgState={shell,left,right,center,lineIndex:-1,lines:[]};return dlgState;
  }

  function setCard(box,p,on){
    box.card.classList.toggle('on',!!on);if(!on)return;
    const key=[p.id,p.portraitId,p.expr].join('|');
    if(box.lastKey!==key){
      box.media.innerHTML='';
      if(p.descriptor)box.media.appendChild(portraitCanvas(p.descriptor));
      else{const m=document.createElement('div');m.className='dlgMissing';m.textContent=p.portraitId?`Portrait unresolved\n${p.portraitId}`:`Identity resolved\nNo portrait asset supplied`;box.media.appendChild(m)}
      box.info.innerHTML=`<div class="dlgName">${esc(p.name)}</div><div class="dlgExpr">${esc(p.expr||'Neutral')}</div><div class="dlgIdentity">${p.identityResolved?'IDENTITY RESOLVED':'IDENTITY MISSING'}${p.portraitOnly?' · PORTRAIT ONLY':''}${p.explicit?' · EXPLICIT PORTRAIT':''}</div>`;
      box.lastKey=key;
    }
  }

  function updateDialogue(){
    if(mode!=='v5'||!items?.length||!items[idx]||items[idx].simple){if(dlgState?.shell)dlgState.shell.remove();dlgState=null;return}
    const w=items[idx],lines=getLines(w),state=ensureStage();state.lines=lines;
    if(!lines.length){state.left.card.classList.remove('on');state.right.card.classList.remove('on');state.center.classList.remove('on');return}
    const p=typeof local==='function'?local():0,n=lines.length,i=Math.min(n-1,Math.floor(Math.max(0,Math.min(.9999,p))*n)),line=lines[i];
    const sp=participant(line,'speaker'),li=participant(line,'listener');
    setCard(state.left,sp,!!(sp.id||sp.portraitId||sp.name));
    setCard(state.right,li,!!(li.id||li.portraitId));
    const seg=p*n-i,fade=Math.max(0,Math.min(1,Math.min(seg*7,(1-seg)*7)));
    state.center.classList.add('on');state.center.style.opacity=fade;
    state.center.innerHTML=`<div><span class="speaker">${esc(sp.name)}</span><span class="emotion">${esc(sp.expr)}</span></div><div class="text">${esc(line.text||line.line||line.content||'')}</div>`;
    if(i!==state.lineIndex){
      state.lineIndex=i;
      const identityProblems=[sp,li].filter(x=>(x.id||x.portraitId)&&!x.identityResolved).map(x=>x.id||x.name);
      const portraitProblems=[sp,li].filter(x=>x.portraitId&&!x.descriptor).map(x=>x.portraitId);
      const portraitOnly=[sp,li].filter(x=>x.portraitOnly).map(x=>x.name);
      const extra=`<hr><b>Dialogue Stage</b><br><span class="${identityProblems.length?'bad':'ok'}">${identityProblems.length?'✕':'✓'} participant identity ${identityProblems.length?'missing: '+esc(identityProblems.join(', ')):'resolved independently of WorldActor'}</span><br>${portraitOnly.length?`<span class="ok">✓ portrait-only legal: ${esc(portraitOnly.join(', '))}</span><br>`:''}${portraitProblems.length?`<span class="warn">⚠ portrait visual unresolved: ${esc(portraitProblems.join(', '))}</span><br>`:''}<span class="warn">Expression shown as requested; browser does not prove Unity expression compatibility.</span>`;
      const old=diag.querySelector('[data-dialogue-diag]');if(old)old.remove();const d=document.createElement('div');d.dataset.dialogueDiag='1';d.innerHTML=extra;diag.appendChild(d);
    }
  }

  // Make portrait-only legality visible to the existing V5 renderer without changing the user's JSON on disk.
  if(typeof loadText==='function'){
    const previousLoadText=loadText;
    loadText=function(text,name){
      try{const j=JSON.parse(text);normalizePortraitActors(j);dialogueRoot=j;text=JSON.stringify(j)}catch{}
      const r=previousLoadText(text,name);queueMicrotask(updateDialogue);return r;
    };
  }

  if(typeof renderV5==='function'){
    const previousRenderV5=renderV5;
    renderV5=function(w){const r=previousRenderV5(w);updateDialogue();return r};
  }
  if(typeof tick==='function'){
    const previousTick=tick;
    tick=function(now){const r=previousTick(now);updateDialogue();return r};
  }
  if(typeof seek==='function'){
    const previousSeek=seek;
    seek=function(t){const r=previousSeek(t);updateDialogue();return r};
  }

  console.info('[CUTSCENE_PREVIEW] dialogue identity/portrait patch ready');
})();