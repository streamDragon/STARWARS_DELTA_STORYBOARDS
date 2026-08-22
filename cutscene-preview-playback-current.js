(()=>{
  const style=document.createElement('style');
  style.textContent=`
  .playHealth{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:999px;border:1px solid #3d465a;font-size:8px;font-weight:800}
  .playHealth.ok{color:#74d99a;border-color:#3f7654;background:#08140d}.playHealth.bad{color:#ff8f98;border-color:#7b3f47;background:#17090b}.playHealth.wait{color:#f2c96e;border-color:#806b32;background:#171307}
  `;
  document.head.appendChild(style);

  let health=null,probeToken=0;
  function ensureHealth(){
    if(health&&health.isConnected)return health;
    health=document.createElement('span');health.className='playHealth';health.textContent='PLAY IDLE';
    play.insertAdjacentElement('afterend',health);return health;
  }
  function setHealth(text,kind=''){const h=ensureHealth();h.textContent=text;h.className='playHealth '+kind}

  function simpleMotionFor(v,t,b){
    let x=v.screenX==null?.5:clamp(num(v.screenX,.5),0,1),y=v.screenY==null?.5:clamp(num(v.screenY,.5),0,1),s=1,r=0,op=1;
    const state=norm(v.state),acts=(b.actions||[]).filter(a=>a.subject===v.id||a.target===v.id),actText=norm(acts.map(a=>`${a.type} ${a.result||''}`).join(' '));
    const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    if(/fall/.test(state)||/descend|drops?|falling/.test(actText)) y-=.34*e;
    if(/travell|moving|escaping|arriving|walking/.test(state)||/left-to-right|continue.*right|closes? the final gap/.test(actText)) x+=.18*e;
    if(/launch/.test(state)||/rises?|upward|lift/.test(actText)){y+=.38*e;s=1-.18*e}
    if(/depart/.test(state)||/formation|drift together|forward motion/.test(actText))x+=.14*e;
    if(/firing/.test(state)){x+=Math.sin(t*Math.PI*2)*.006;r=Math.sin(t*Math.PI*2)*1.2}
    if(/hit/.test(state)){const q=clamp((t-.38)/.28,0,1);x+=Math.sin(q*Math.PI*8)*.012*(1-q);s=1+.14*Math.sin(q*Math.PI)}
    if(/holding|waiting|aftermath|serious|relieved/.test(state))y+=Math.sin(t*Math.PI*2)*.004;
    if(v.enterFrom&&v.enterFrom!=='none'&&t<.2){const p=t/.2;if(v.enterFrom==='left')x=-.08+(x+.08)*p;if(v.enterFrom==='right')x=1.08+(x-1.08)*p;if(v.enterFrom==='top')y=1.08+(y-1.08)*p;if(v.enterFrom==='bottom')y=-.08+(y+.08)*p}
    const gone=v.exitTo==='destroy'||acts.some(a=>a.type==='destroy'&&(a.subject===v.id||a.target===v.id));if(gone&&t>.72)op=clamp(1-(t-.72)/.18,0,1);
    return{x,y,s,r,op};
  }

  function decorateSimpleObjects(w){
    if(!w?.simple)return;
    const b=w.beat,t=local(),canvases=[...stage.querySelectorAll('canvas.obj')];
    let ci=0;
    for(const v of b.visible||[]){
      const n=Math.max(1,Math.min(30,Math.round(num(v.count,1))));
      for(let i=0;i<n;i++){
        const c=canvases[ci++];if(!c)continue;
        const m=simpleMotionFor(v,t,b),f=clamp(num(v.screenWidthFraction,resolveHandle(v.handle)?.targetScreenFraction??.22),.025,1.5),o=spread(i,n);
        c.style.left=((m.x+o.x)*100)+'%';c.style.top=((1-(m.y-o.y))*100)+'%';c.style.width=(f*100)+'%';c.style.opacity=m.op;c.style.transform=`translate(-50%,-50%) scale(${m.s}) rotate(${m.r}deg)`;
      }
    }
    const movement=norm(b.camera?.movement);stage.style.transformOrigin='center center';
    if(movement==='push')stage.style.transform=`scale(${1+.08*t})`;
    else if(movement==='pull')stage.style.transform=`scale(${1.08-.08*t})`;
    else if(movement==='follow'||movement==='track')stage.style.transform=`translateX(${-1.2*t}%)`;
    else stage.style.transform='none';
  }

  // Manual seek / shot click still gets one complete render, then the same motion pose.
  if(typeof renderSimple==='function'){
    const prevRenderSimple=renderSimple;
    renderSimple=function(w){const r=prevRenderSimple(w);decorateSimpleObjects(w);return r};
  }

  // Critical fix: Simple playback must NOT rebuild stage DOM every animation frame.
  // draw() loads atlas images asynchronously; clearing stage on every RAF prevented those
  // canvases from surviving long enough for Image.onload to paint them.
  tick=function(now){
    if(!playing)return;
    elapsed+=(now-last)/1000;last=now;
    const end=total();
    if(elapsed>=end){
      elapsed=end;
      if(mode==='v5'&&typeof filmUpdate==='function')filmUpdate();
      else if(mode==='simple')decorateSimpleObjects(items[idx]);
      else render();
      clock();stop();return;
    }
    let a=0,newIdx=idx;
    for(let i=0;i<items.length;i++){a+=duration(items[i]);if(elapsed<a){newIdx=i;break}}
    if(newIdx!==idx){
      idx=newIdx;
      // Full rebuild exactly once at the cut. Async atlas images can now finish loading.
      render();
    }else if(mode==='v5'&&typeof filmUpdate==='function'){
      filmUpdate();clock();
    }else if(mode==='simple'){
      decorateSimpleObjects(items[idx]);clock();
    }else clock();
    raf=requestAnimationFrame(tick);
  };

  const oldStart=typeof start==='function'?start:null;
  if(oldStart){
    start=function(){
      const before=elapsed,token=++probeToken;setHealth('PLAY CHECK…','wait');
      const r=oldStart();
      setTimeout(()=>{
        if(token!==probeToken)return;
        if(!playing){setHealth('PLAY STOPPED','');return}
        const delta=elapsed-before;
        if(delta>.25)setHealth(`PLAYBACK OK +${delta.toFixed(1)}s`,'ok');
        else setHealth('PLAYBACK STALLED','bad');
      },850);
      return r;
    };
  }
  const oldStop=typeof stop==='function'?stop:null;
  if(oldStop){stop=function(){probeToken++;const r=oldStop();if(health&&!/STALLED/.test(health.textContent))setHealth('PLAY IDLE','');return r}}

  ensureHealth();
  console.info('[CUTSCENE_PREVIEW] stable Simple playback + PLAY health check ready');
})();