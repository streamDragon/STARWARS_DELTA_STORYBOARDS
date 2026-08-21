(()=>{
  const style=document.createElement('style');
  style.textContent=`
  .truthBox{margin-top:10px;padding:8px;border:1px solid #35415a;border-radius:8px;background:#0a101b}
  .truthBox b{color:#eef3ff}.truthRow{margin-top:4px}.truthAuth{color:#74d99a}.truthInfer{color:#f2c96e}.truthUnity{color:#ff9e78}
  `;
  document.head.appendChild(style);

  const qClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const qLow=v=>String(v??'').toLowerCase();
  const qArr=v=>Array.isArray(v)?v:[];
  const originalCrop=typeof crop==='function'?crop:null;

  function pixelBlank(r,g,b,a){
    if(a<24)return true;
    const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
    return mx>238&&mx-mn<18;
  }

  function longestRun(values,threshold,minLen=1){
    let best=null,start=-1;
    for(let i=0;i<=values.length;i++){
      const on=i<values.length&&values[i]>=threshold;
      if(on&&start<0)start=i;
      if((!on||i===values.length)&&start>=0){
        const end=i-1,len=end-start+1;
        if(len>=minLen&&(!best||len>best.len))best={start,end,len};
        start=-1;
      }
    }
    return best;
  }

  function backgroundRect(src){
    const ctx=src.getContext('2d',{willReadFrequently:true}),w=src.width,h=src.height;
    const yMax=Math.max(1,Math.floor(h*.78)),im=ctx.getImageData(0,0,w,yMax),p=im.data;
    const row=new Array(yMax).fill(0),stepX=Math.max(1,Math.floor(w/220));
    for(let y=0;y<yMax;y++){
      let hit=0,total=0;
      for(let x=0;x<w;x+=stepX){const i=(y*w+x)*4;total++;if(!pixelBlank(p[i],p[i+1],p[i+2],p[i+3]))hit++}
      row[y]=total?hit/total:0;
    }
    let yr=longestRun(row,.48,Math.max(8,Math.floor(h*.12)))||longestRun(row,.28,Math.max(8,Math.floor(h*.12)));
    if(!yr)return null;
    const col=new Array(w).fill(0),stepY=Math.max(1,Math.floor((yr.len)/180));
    for(let x=0;x<w;x++){
      let hit=0,total=0;
      for(let y=yr.start;y<=yr.end;y+=stepY){const i=(y*w+x)*4;total++;if(!pixelBlank(p[i],p[i+1],p[i+2],p[i+3]))hit++}
      col[x]=total?hit/total:0;
    }
    let xr=longestRun(col,.35,Math.max(8,Math.floor(w*.18)))||longestRun(col,.18,Math.max(8,Math.floor(w*.18)));
    if(!xr)return null;
    const padX=Math.max(2,Math.floor(w*.008)),padY=Math.max(2,Math.floor(h*.008));
    return{x:Math.max(0,xr.start-padX),y:Math.max(0,yr.start-padY),w:Math.min(w-1,xr.end+padX)-Math.max(0,xr.start-padX)+1,h:Math.min(yMax-1,yr.end+padY)-Math.max(0,yr.start-padY)+1};
  }

  function foregroundRect(src){
    const ctx=src.getContext('2d',{willReadFrequently:true}),w=src.width,h=src.height;
    const y0=Math.floor(h*.055),y1=Math.max(y0+1,Math.floor(h*.70)),step=Math.max(2,Math.round(Math.max(w,h)/180));
    const gw=Math.ceil(w/step),gh=Math.ceil((y1-y0)/step),mask=new Uint8Array(gw*gh);
    const im=ctx.getImageData(0,0,w,h),p=im.data;
    for(let gy=0;gy<gh;gy++)for(let gx=0;gx<gw;gx++){
      let on=false;
      const sx=gx*step,sy=y0+gy*step;
      for(let yy=0;yy<step&&!on;yy+=Math.max(1,step-1))for(let xx=0;xx<step;xx+=Math.max(1,step-1)){
        const x=Math.min(w-1,sx+xx),y=Math.min(h-1,sy+yy),i=(y*w+x)*4;
        if(!pixelBlank(p[i],p[i+1],p[i+2],p[i+3])){on=true;break}
      }
      if(on)mask[gy*gw+gx]=1;
    }
    const seen=new Uint8Array(mask.length),dirs=[-1,0,1];let best=null;
    for(let gy=0;gy<gh;gy++)for(let gx=0;gx<gw;gx++){
      const root=gy*gw+gx;if(!mask[root]||seen[root])continue;
      const stack=[root];seen[root]=1;let count=0,minX=gx,maxX=gx,minY=gy,maxY=gy;
      while(stack.length){const n=stack.pop(),cy=Math.floor(n/gw),cx=n-cy*gw;count++;minX=Math.min(minX,cx);maxX=Math.max(maxX,cx);minY=Math.min(minY,cy);maxY=Math.max(maxY,cy);
        for(const dy of dirs)for(const dx of dirs){if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=gw||ny>=gh)continue;const ni=ny*gw+nx;if(mask[ni]&&!seen[ni]){seen[ni]=1;stack.push(ni)}}
      }
      const bw=maxX-minX+1,bh=maxY-minY+1;if(bw<2||bh<2)continue;
      const aspect=Math.max(bw/bh,bh/bw),thinPenalty=aspect>7?.18:aspect>4?.52:1;
      const cx=(minX+maxX+1)/(2*gw),cy=(minY+maxY+1)/(2*gh),centerPenalty=.78+.22*(1-Math.min(1,Math.hypot(cx-.5,cy-.48)));
      const score=count*thinPenalty*centerPenalty;
      if(!best||score>best.score)best={score,minX,maxX,minY,maxY,count};
    }
    if(!best||best.count<4)return null;
    const pad=Math.max(4,step*2),x=Math.max(0,best.minX*step-pad),y=Math.max(y0,y0+best.minY*step-pad),x2=Math.min(w-1,(best.maxX+1)*step+pad),y2=Math.min(y1-1,y0+(best.maxY+1)*step+pad);
    return{x,y,w:x2-x+1,h:y2-y+1};
  }

  function copyRect(src,r,transparent){
    const out=document.createElement('canvas');out.width=Math.max(1,Math.round(r.w));out.height=Math.max(1,Math.round(r.h));
    const c=out.getContext('2d',{willReadFrequently:true});c.drawImage(src,r.x,r.y,r.w,r.h,0,0,out.width,out.height);
    if(transparent){
      const im=c.getImageData(0,0,out.width,out.height),v=im.data;
      for(let i=0;i<v.length;i+=4){const mx=Math.max(v[i],v[i+1],v[i+2]),mn=Math.min(v[i],v[i+1],v[i+2]);if(mx>226&&mx-mn<22)v[i+3]=Math.max(0,255-(mx-226)*9)}
      c.putImageData(im,0,0);
    }
    return out;
  }

  if(typeof cell==='function'){
    crop=function(img,d,transparent=true){
      try{
        const src=cell(img,d),r=transparent?foregroundRect(src):backgroundRect(src);
        if(r&&r.w>4&&r.h>4)return copyRect(src,r,transparent);
      }catch{}
      return originalCrop?originalCrop(img,d,transparent):cell(img,d);
    };
  }

  function lineCount(w){
    if(!w||w.simple)return 0;const s=w.shot||{},q=w.seq||{};
    return qArr(q.dialogue).length+qArr(q.dialogues).length+qArr(q.lines).length+qArr(s.dialogue).length+qArr(s.dialogues).length+qArr(s.lines).length;
  }
  function truthFor(w){
    if(!w)return{authored:0,inferred:0,notes:[]};
    if(w.simple){
      const b=w.beat||{},visible=qArr(b.visible),actions=qArr(b.actions);
      const authored=visible.length+actions.length+(b.camera?1:0)+(b.storyClaim?1:0)+(b.evidence?1:0);
      const inferred=visible.filter(v=>v.enterFrom||v.exitTo||v.state||v.motion||v.movement).length+actions.filter(a=>a.type&&!['hold','dialogue'].includes(qLow(a.type))).length+(b.camera?.movement?1:0);
      return{authored,inferred,notes:['Simple Script values are author data. Motion between authored states may be browser-inferred.']};
    }
    const s=w.shot||{},q=w.seq||{},actors=[...qArr(q.actorActions),...qArr(s.actorActions)],effects=[...qArr(q.effects),...qArr(s.effects)],cams=[...qArr(q.cameraActions),...qArr(s.cameraActions)],lines=[...qArr(q.dialogue),...qArr(q.dialogues),...qArr(q.lines),...qArr(s.dialogue),...qArr(s.dialogues),...qArr(s.lines)];
    const authoredActors=actors.filter(a=>!a?.previewInference).length;
    const authoredEffects=effects.filter(e=>!e?.previewInference).length;
    const authoredLines=lines.filter(l=>!l?.previewInference).length;
    const authoredCams=cams.filter(c=>!c?.previewInference).length;
    const authoredBg=(s.backgroundAssetId&&!s.__previewInferredBackground)?1:0;
    const authored=authoredActors+authoredEffects+authoredCams+authoredLines+authoredBg+(s.intention?1:0);
    const inferred=actors.filter(a=>a?.previewInference||a?.movement||a?.animation||a?.emotion).length+effects.filter(e=>e?.previewInference||e?.animation||e?.kind).length+lines.filter(l=>l?.previewInference).length+(s.__previewInferredBackground?1:0)+(s.__previewInferredCamera?1:0)+(!cams.length&&s.cameraIntent&&!s.__previewInferredCamera?1:0);
    const notes=[];
    if(s.__previewHydrated)notes.push('Flat PREVIEW_SAFE metadata was hydrated by the browser for visualization only.');
    notes.push('Authored = fields present in the original JSON. Browser inference = motion/timing/temporary visual structure derived from semantic fields.');
    return{authored,inferred,notes};
  }

  function appendTruth(){
    if(typeof diag==='undefined'||!diag||typeof items==='undefined'||!items.length)return;
    const old=diag.querySelector('[data-truth-box]');if(old)old.remove();
    const t=truthFor(items[idx]),box=document.createElement('div');box.className='truthBox';box.dataset.truthBox='1';
    box.innerHTML=`<b>Preview Truth</b><div class="truthRow truthAuth">✓ AUTHORED DATA: ${t.authored}</div><div class="truthRow truthInfer">◐ BROWSER INFERENCE: ${t.inferred}</div><div class="truthRow truthUnity">? UNITY RUNTIME: NOT RUN</div><div class="truthRow" style="color:#9faac0">${esc(t.notes.join(' '))}</div>`;
    diag.appendChild(box);
  }

  if(typeof renderV5==='function'){
    const prev=renderV5;renderV5=function(w){const r=prev(w);appendTruth();return r};
  }
  if(typeof renderSimple==='function'){
    const prev=renderSimple;renderSimple=function(w){const r=prev(w);appendTruth();return r};
  }
  if(typeof seek==='function'){
    const prev=seek;seek=function(t){const r=prev(t);appendTruth();return r};
  }

  console.info('[CUTSCENE_PREVIEW] quality/truth patch ready');
})();