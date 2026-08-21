(()=>{
  const style=document.createElement('style');
  style.textContent=`
  .filmCamera{position:absolute;inset:-4%;transform-origin:center center;will-change:transform;z-index:2}
  .filmClock{position:absolute;right:10px;top:10px;z-index:30;background:#070b12d9;border:1px solid #46516c;border-radius:999px;padding:3px 8px;font-size:9px;color:#dce5f5}
  .filmIntent{font-size:11px;color:#dce4f2;margin-top:5px;max-width:900px}
  .filmDialogue{margin-top:8px;background:#05070bee;border:1px solid #40475d;border-radius:8px;padding:8px 10px;max-width:900px;min-height:46px}
  .filmDialogue .speaker{color:#9eb3ff;font-weight:800;margin-right:7px}.filmDialogue .emotion{color:#f1ca70;font-size:10px;margin-left:5px}.filmDialogue .text{font-size:13px;margin-top:3px}
  .filmPortrait{position:absolute;top:13%;width:20%;max-height:47%;z-index:17;border:1px solid #4b5672;background:#080c15cc;border-radius:9px;overflow:hidden;filter:drop-shadow(0 10px 20px #000c)}
  .filmPortrait.left{left:3%}.filmPortrait.right{right:3%}.filmPortrait canvas{width:100%;height:auto;display:block}
  .filmFx{mix-blend-mode:screen;z-index:12!important;filter:drop-shadow(0 0 20px #fff6)!important}
  .filmShotBar{height:3px;background:#1e2637;position:absolute;left:0;right:0;bottom:0}.filmShotBar i{display:block;height:100%;width:0;background:#6f86ff}
  .shot{position:relative;overflow:hidden;padding-bottom:10px!important}
  `;
  document.head.appendChild(style);

  let filmScene=null;
  const fclamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const flerp=(a,b,t)=>a+(b-a)*t;
  const fease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const fnorm=v=>String(v??'').toLowerCase();

  crop=function(img,d,transparent=true){
    const src=cell(img,d), ctx=src.getContext('2d',{willReadFrequently:true});
    const maxY=Math.max(1,Math.floor(src.height*.67));
    const im=ctx.getImageData(0,0,src.width,maxY), p=im.data;
    let ax=src.width,ay=maxY,bx=-1,by=-1;
    for(let y=0;y<maxY;y++) for(let x=0;x<src.width;x++){
      const i=(y*src.width+x)*4, m=Math.max(p[i],p[i+1],p[i+2]), n=Math.min(p[i],p[i+1],p[i+2]);
      const blank=p[i+3]<22 || (m>238 && m-n<16);
      if(!blank){ax=Math.min(ax,x);ay=Math.min(ay,y);bx=Math.max(bx,x);by=Math.max(by,y)}
    }
    if(bx<0){ax=2;ay=2;bx=src.width-3;by=maxY-3}
    const pad=5;ax=Math.max(0,ax-pad);ay=Math.max(0,ay-pad);bx=Math.min(src.width-1,bx+pad);by=Math.min(maxY-1,by+pad);
    const out=document.createElement('canvas');out.width=Math.max(1,bx-ax+1);out.height=Math.max(1,by-ay+1);
    const c=out.getContext('2d',{willReadFrequently:true});c.drawImage(src,ax,ay,out.width,out.height,0,0,out.width,out.height);
    if(transparent){
      const dta=c.getImageData(0,0,out.width,out.height),v=dta.data;
      for(let i=0;i<v.length;i+=4){const m=Math.max(v[i],v[i+1],v[i+2]),n=Math.min(v[i],v[i+1],v[i+2]);if(m>226&&m-n<22)v[i+3]=Math.max(0,255-(m-226)*9)}
      c.putImageData(dta,0,0);
    }
    return out;
  };

  function findBackground(s,q){
    const direct=s.backgroundAssetId||s.locationAssetId||q.backgroundAssetId||q.locationAssetId;
    if(direct){const d=resolveVisual(direct);if(d)return {d,id:direct}}
    for(const a of [...(q.layers||[]),...(s.layerActions||[]),...(q.layerActions||[])]){
      const id=a.assetId||a.layerAssetId||a.backgroundAssetId;if(!id)continue;const d=resolveVisual(id);if(d)return{d,id};
    }
    return null;
  }
  function actorIds(s,q){
    const out=[];const add=v=>{if(v!=null&&!out.includes(String(v)))out.push(String(v))};
    for(const a of [...(q.actorActions||[]),...(s.actorActions||[])])add(a.actorId||a.entityId||a.subjectActorId);
    for(const d of [...(q.dialogue||[]),...(s.dialogue||[])]){add(d.speakerActorId);add(d.listenerActorId)}
    return out;
  }
  function actorAction(s,q,id){return [...(q.actorActions||[]),...(s.actorActions||[])].find(a=>String(a.actorId||a.entityId||a.subjectActorId||'')===String(id))||{}}
  function linesFor(s,q){const a=[...(q.dialogue||[]),...(s.dialogue||[])];return a.length?a:(Array.isArray(s.lines)?s.lines:[])}
  function effectsFor(s,q){const a=[...(q.effects||[]),...(s.effects||[])];if(s.effectAssetId&&!a.some(x=>(x.effectAssetId||x.assetId)===s.effectAssetId))a.push({effectAssetId:s.effectAssetId,kind:'Effect'});return a}
  function spreadActors(i,n){if(n<=1)return{x:0,y:0};if(n===2)return{x:i?.18:-.18,y:i?.02:-.02};if(n===3)return{x:(i-1)*.23,y:i===1?-.05:.03};return{x:(i-(n-1)/2)*.16,y:(i%2?.04:-.02)}}
  function isPortrait(c,d){const t=fnorm((c?.role||'')+' '+(d?.display||''));return /portrait|dialogue|civilianface|lookout/.test(t)}
  function frameWidth(s,c,d){const f=fnorm((s.framing||'')+' '+(s.shotType||'')),t=fnorm((c?.role||'')+' '+(d?.display||''));let w=f.includes('close')?.42:f.includes('medium')?.30:f.includes('extreme')?.16:.22;if(/supercarrier|mothership|capital|carrier/.test(t))w*=1.75;else if(/bus|vehicle|fighter|ship|delta|dante/.test(t))w*=1.18;else if(/robot/.test(t))w*=1.05;return fclamp(w,.10,.62)}
  function movement(a,p,bx,by){
    const t=fnorm((a.movement||'')+' '+(a.animation||'')+' '+(a.type||'')),e=fease(p);let x=bx,y=by,s=1,o=1,r=0,z=7;
    if(/left.?to.?right|rightward|drive_fast|drive_loop|sprint.*right/.test(t))x=flerp(-.08,Math.min(.94,bx+.38),e);
    else if(/right.?to.?left|leftward|exit.*left/.test(t))x=flerp(1.08,Math.max(.06,bx-.38),e);
    else if(/launch|climb|boost/.test(t)){x=flerp(bx-.22,bx+.34,e);y=flerp(by+.15,by-.19,e);s=flerp(.76,1.08,e)}
    else if(/bank_left|break.*left/.test(t)){x=bx-.20*e;y=by-.08*Math.sin(e*Math.PI);r=-10*e}
    else if(/bank_right|break.*right/.test(t)){x=bx+.20*e;y=by-.08*Math.sin(e*Math.PI);r=10*e}
    else if(/step|foreground|forward lean/.test(t)){s=flerp(.82,1.18,e);y=by+flerp(-.03,.07,e);z=10}
    else if(/emerge|reveal|activate/.test(t)){o=fclamp(p/.28,0,1);s=flerp(.68,1.05,fease(fclamp(p/.45,0,1)))}
    else if(/brake|slow_stop|stop/.test(t)){const q=fclamp(p/.42,0,1);x=flerp(bx-.30,bx,q)}
    else if(/pull_away|deactivate|destroy|break_apart|falls behind/.test(t)){const q=fclamp((p-.38)/.62,0,1);s=flerp(1,.58,q);o=flerp(1,0,q);y-=.10*q}
    else if(/impact|recoil|hit/.test(t)){const q=fclamp((p-.43)/.25,0,1);x+=Math.sin(q*Math.PI*8)*.015*(1-q);y-=Math.sin(q*Math.PI)*.05}
    else if(/hover|drift|breath|idle/.test(t)){x+=Math.sin(p*Math.PI*2)*.018;y+=Math.cos(p*Math.PI*2)*.012}
    else if(/turn|look|brace|hold|stationary/.test(t))y+=Math.sin(p*Math.PI*2)*.006;
    if(/fear|alarm|strained/.test(fnorm(a.emotion)))x+=Math.sin(p*Math.PI*18)*.004;
    return{x,y,s,o,r,z};
  }
  function camera(intent,p){const t=fnorm(intent),e=fease(p);let s=1,x=0,y=0,r=0;if(/push|zoom.?in/.test(t))s=flerp(1,1.13,e);else if(/pull|pullback|zoom.?out|reveal/.test(t))s=flerp(1.12,.98,e);else if(/track|follow/.test(t))x=flerp(1.8,-1.8,e);else if(/pan.?left/.test(t))x=flerp(3,-3,e);else if(/pan.?right/.test(t))x=flerp(-3,3,e);else if(/closing/.test(t))s=flerp(1,1.045,e);if(/impact|shake/.test(t)&&p>.42&&p<.68){const q=(p-.42)/.26,amp=(1-q)*.8;x+=Math.sin(q*Math.PI*22)*amp;y+=Math.cos(q*Math.PI*17)*amp*.55;r=Math.sin(q*Math.PI*13)*.16*amp}return{s,x,y,r}}
  function moveObj(o,p){const m=movement(o.action,p,o.x,o.y);o.el.style.left=(m.x*100)+'%';o.el.style.top=(m.y*100)+'%';o.el.style.width=(o.w*100)+'%';o.el.style.height='auto';o.el.style.opacity=m.o;o.el.style.zIndex=m.z;o.el.style.transform=`translate(-50%,-50%) scale(${m.s}) rotate(${m.r}deg)`}
  function currentDialogue(lines,p){if(!lines.length)return null;const n=lines.length,i=Math.min(n-1,Math.floor(fclamp(p,.001,.999)*n)),seg=p*n-i;return{line:lines[i],fade:fclamp(Math.min(seg*6,(1-seg)*6),0,1)}}
  function filmUpdate(){
    if(!filmScene||mode!=='v5')return;const p=local(),cam=camera(filmScene.intent,p);filmScene.camera.style.transform=`translate(${cam.x}%,${cam.y}%) scale(${cam.s}) rotate(${cam.r}deg)`;
    for(const o of filmScene.objects)moveObj(o,p);
    for(const fx of filmScene.effects){const q=fclamp((p-fx.start)/Math.max(.001,fx.end-fx.start),0,1),on=p>=fx.start&&p<=fx.end;fx.el.style.display=on?'block':'none';if(on){fx.el.style.opacity=fclamp(Math.sin(q*Math.PI)*1.25,0,1);fx.el.style.left=(fx.x*100)+'%';fx.el.style.top=(fx.y*100)+'%';fx.el.style.width=(fx.w*100)+'%';fx.el.style.transform=`translate(-50%,-50%) scale(${flerp(.28,1.35,fease(q))})`}}
    const d=currentDialogue(filmScene.lines,p);if(d){const l=d.line;filmScene.dialogue.style.display='block';filmScene.dialogue.style.opacity=d.fade;filmScene.dialogue.innerHTML=`<div><span class="speaker">${esc(l.speaker||l.name||'')}</span>${l.emotion?`<span class="emotion">${esc(l.emotion)}</span>`:''}</div><div class="text">${esc(l.text||l.line||l.content||'')}</div>`}else filmScene.dialogue.style.display='none';
    filmScene.clock.textContent=`${(p*filmScene.duration).toFixed(1)} / ${filmScene.duration.toFixed(1)}s`;
    const active=timeline.children[idx],bar=active&&active.querySelector('.filmShotBar i');if(bar)bar.style.width=(p*100)+'%';
  }

  const oldBuildTimeline=buildTimeline;
  buildTimeline=function(){oldBuildTimeline();[...timeline.children].forEach(e=>{if(!e.querySelector('.filmShotBar')){const b=document.createElement('div');b.className='filmShotBar';b.innerHTML='<i></i>';e.appendChild(b)}})};

  renderV5=function(w){
    const s=w.shot,q=w.seq||{},dur=duration(w);stage.innerHTML='';
    const cam=document.createElement('div');cam.className='filmCamera';stage.appendChild(cam);
    const bg=findBackground(s,q);if(bg){const el=draw(bg.d,{},true);cam.appendChild(el)}else{const p=ph('NO RESOLVED BACKGROUND',.5,.5,.45);cam.appendChild(p)}
    const ids=actorIds(s,q),world=[],portraits=[];
    for(const id of ids){const c=cast.get(String(id));if(!c)continue;const d=resolveVisual(c.visualAssetId||c.actorAssetId||c.assetId);(isPortrait(c,d)?portraits:world).push({id,c,d})}
    const objects=[];
    world.slice(0,5).forEach((x,i)=>{const sp=spreadActors(i,Math.min(world.length,5)),baseX=.5+sp.x,baseY=.49+sp.y,wid=frameWidth(s,x.c,x.d),a=actorAction(s,q,x.id);let el;if(x.d){el=draw(x.d,{left:baseX*100+'%',top:baseY*100+'%',width:wid*100+'%',height:'auto',zIndex:7});cam.appendChild(el)}else{el=ph(x.id+'\nUNRESOLVED ACTOR',baseX,1-baseY,wid);cam.appendChild(el)}objects.push({el,x:baseX,y:baseY,w:wid,action:a})});
    portraits.slice(0,2).forEach((x,i)=>{if(!x.d)return;const box=document.createElement('div');box.className='filmPortrait '+(i===0?'left':'right');const el=draw(x.d,{},false);box.appendChild(el);el.style.position='relative';el.style.left='0';el.style.top='0';el.style.width='100%';el.style.height='auto';el.style.transform='none';stage.appendChild(box)});
    const effects=[];effectsFor(s,q).slice(0,3).forEach((fx,i)=>{const d=resolveVisual(fx.effectAssetId||fx.assetId||fx.visualAssetId);if(!d)return;const el=draw(d,{left:'50%',top:'43%',width:'24%',height:'auto',display:'none'},false);el.classList.add('filmFx');cam.appendChild(el);const kind=fnorm((fx.kind||'')+' '+(fx.animation||'')+' '+(fx.effectId||'')),start=i===0?.42:.54+i*.06,end=Math.min(.94,start+(/explosion|shock/.test(kind)?.38:.24));effects.push({el,start,end,x:.5+(i-1)*.08,y:.43-i*.03,w:/explosion/.test(kind)?.38:.24})});
    const shade=document.createElement('div');shade.className='shade';stage.appendChild(shade);const clockEl=document.createElement('div');clockEl.className='filmClock';stage.appendChild(clockEl);const hud=document.createElement('div');hud.className='hud';hud.innerHTML=`<div class="title">${esc(label(w,idx))}</div><div class="meta"><span class="tag">2D FILM PREVIEW</span>${esc(s.shotType||'')} ${s.framing?' · '+esc(s.framing):''} · ${esc(s.cameraIntent||'Hold')} · ${dur.toFixed(1)}s</div>${s.intention?`<div class="filmIntent">${esc(s.intention)}</div>`:''}<div class="filmDialogue"></div>`;stage.appendChild(hud);const dlg=hud.querySelector('.filmDialogue');
    const lines=linesFor(s,q);filmScene={camera:cam,objects,effects,lines,dialogue:dlg,clock:clockEl,intent:s.cameraIntent||'Hold',duration:dur};
    const unresolved=ids.filter(id=>{const c=cast.get(String(id));return !c||!resolveVisual(c.visualAssetId||c.actorAssetId||c.assetId)});
    diag.innerHTML=`<span class="tag ok">V5 PARSED</span><span class="tag ${bg?'ok':'warn'}">BACKGROUND ${bg?'RESOLVED':'MISSING'}</span><span class="tag ${unresolved.length?'warn':'ok'}">ACTORS ${ids.length-unresolved.length}/${ids.length}</span><span class="tag warn">UNITY NOT RUN</span><br><br><b>2D camera intent:</b> ${esc(s.cameraIntent||'Hold')}<br><b>Actors in this shot:</b> ${ids.length}<br><b>Timed VFX:</b> ${effects.length}<br><b>Dialogue lines:</b> ${lines.length}${unresolved.length?`<br><span class="warn">Unresolved: ${esc(unresolved.join(', '))}</span>`:''}<br><br><span class="ok">Film mode interprets movement continuously inside the shot.</span>`;
    bounds.innerHTML=`<b>Storyboard player:</b> 2D only<br>X/Y travel · sprite scale · sorting · camera composition · timed VFX/dialogue.<br><span class="warn">No fake 3D orbit, perspective rotation or invented view angles.</span>`;
    filmUpdate();
  };

  tick=function(now){
    if(!playing)return;elapsed+=(now-last)/1000;last=now;if(elapsed>=total()){elapsed=total();if(mode==='v5')filmUpdate();else render();clock();stop();return}
    let a=0,newIdx=idx;for(let i=0;i<items.length;i++){a+=duration(items[i]);if(elapsed<a){newIdx=i;break}}
    if(newIdx!==idx){idx=newIdx;render()}else if(mode==='v5'){filmUpdate();clock()}else if(mode==='simple'){render()}else clock();
    raf=requestAnimationFrame(tick);
  };

  const oldSeek=seek;
  seek=function(t){const before=idx;oldSeek(t);if(mode==='v5'&&before===idx)filmUpdate()};
  console.info('[CUTSCENE_PREVIEW] 2D film patch ready');
})();