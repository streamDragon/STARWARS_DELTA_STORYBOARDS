(()=>{
  if(typeof resolveHandle!=='function'||typeof handles==='undefined')return;
  const originalResolveHandle=resolveHandle;
  const recoveries=new Map();
  const usedActorHandles=[];
  const low=v=>String(v??'').toLowerCase();
  const uniq=a=>[...new Set(a.filter(Boolean))];

  function routeFor(raw){
    const t=low(raw);
    if(/background|location|desert|mars|earth|space|orbit|room|bridge|command|layer/.test(t))return'Layer';
    if(/effect|vfx|explosion|flash|laser|impact|muzzle|smoke|particle/.test(t))return'Effect';
    if(/dialogue|portrait|frame|ui|hud/.test(t))return'Ui';
    if(/animation|anim|run|walk|idle|turn|hit/.test(t))return'Animation';
    if(/music|audio|ambience|sfx|sound/.test(t))return'Audio';
    return'Actor';
  }

  function tokensFor(raw){
    let t=low(raw).replace(/replace_with_current_handle/g,' ').replace(/[^a-z0-9]+/g,' ');
    const stop=new Set(['character','actor','world','asset','handle','current','replace','with','background','location','layer','visual','presentation','identity','a','b','c','one','two','the']);
    const base=t.split(/\s+/).filter(x=>x&&!stop.has(x)&&x.length>1);
    const extra=[];
    if(base.includes('desert'))extra.push('mars','red','mesa','dust','desert');
    if(base.includes('command'))extra.push('bridge','control','room','command');
    if(base.includes('space'))extra.push('orbit','space');
    return uniq([...base,...extra]);
  }

  function routeName(h){return String(h?.route||h?.category||'')}
  function score(raw,h,route,index){
    if(!h)return-9999;
    const hr=routeName(h),hay=low([h.handle,h.displayName,h.runtimeId,h.proportionClass,...(h.capabilities||[]),...(h.supports||[])].join(' '));
    let s=0;
    if(hr.toLowerCase()===route.toLowerCase())s+=55;else if(route==='Layer'&&/layer|background/.test(hr.toLowerCase()))s+=45;else if(route==='Actor'&&/actor/.test(hr.toLowerCase()))s+=45;else s-=25;
    const toks=tokensFor(raw);for(const tok of toks){if(hay.includes(tok))s+=tok.length>5?18:11}
    if(h.safeForPreview===true)s+=12;if(h.safeForPreview===false)s-=18;
    if(h.runtimeId&&typeof resolveVisual==='function'&&resolveVisual(h.runtimeId))s+=25;else s-=10;
    if(/generated|missing|deprecated|legacy|test/.test(hay))s-=12;
    if(route==='Layer'&&/background|environment|mars|desert|space|command|room|bridge|planet/.test(hay))s+=12;
    if(route==='Actor'&&/fighter|ship|robot|doctor|pilot|character|runner|civilian|officer|commander|captain/.test(hay))s+=7;
    if(route==='Actor'&&usedActorHandles.includes(h.handle))s-=38;
    s-=index*.0001;
    return s;
  }

  function recover(raw){
    const key=String(raw||'');if(recoveries.has(key))return recoveries.get(key);
    const route=routeFor(key);let best=null,bestScore=-9999,i=0;
    const seen=new Set();
    for(const h of handles.values()){
      if(!h||seen.has(h))continue;seen.add(h);const sc=score(key,h,route,i++);if(sc>bestScore){bestScore=sc;best=h}
    }
    if(!best||bestScore<20){recoveries.set(key,null);return null}
    const wrapped={...best,__previewRecovered:true,__sourcePlaceholder:key,__recoveryScore:Math.round(bestScore),__recoveryRoute:route};
    recoveries.set(key,wrapped);if(route==='Actor'&&!usedActorHandles.includes(best.handle))usedActorHandles.push(best.handle);return wrapped;
  }

  resolveHandle=function(id){
    const exact=originalResolveHandle(id);if(exact)return exact;
    const raw=String(id||'');
    if(!raw)return null;
    if(/REPLACE_WITH_CURRENT_HANDLE/i.test(raw)||/placeholder|unknown_handle/i.test(raw))return recover(raw);
    return null;
  };

  function recoveryRowsForBeat(b){
    const refs=[];
    if(b?.locationHandle)refs.push(b.locationHandle);
    for(const v of b?.visible||[])if(v?.handle)refs.push(v.handle);
    for(const a of b?.actions||[]){if(a?.viaHandle)refs.push(a.viaHandle);if(a?.effectHandle)refs.push(a.effectHandle)}
    return uniq(refs).map(src=>{const h=resolveHandle(src);return h?.__previewRecovered?{src,h}:null}).filter(Boolean);
  }

  if(typeof simpleDiag==='function'){
    const oldDiag=simpleDiag;
    simpleDiag=function(b){
      const d=oldDiag(b);const rec=recoveryRowsForBeat(b);
      if(rec.length){
        d.e=d.e.filter(x=>!rec.some(r=>x.includes(r.src)));
        for(const r of rec)d.w.push(`PREVIEW SUBSTITUTE: ${r.src} -> ${r.h.displayName||r.h.handle} [${r.h.__recoveryRoute}]`);
        d.info.push(`${rec.length} unfinished CURRENT handle(s) recovered for browser preview only`);
      }
      return d;
    };
  }

  if(typeof renderSimple==='function'){
    const oldRender=renderSimple;
    renderSimple=function(w){
      const r=oldRender(w);const rec=recoveryRowsForBeat(w?.beat);
      if(rec.length&&typeof diag!=='undefined'){
        const box=document.createElement('div');box.style.marginTop='8px';box.style.padding='7px';box.style.border='1px solid #806b32';box.style.borderRadius='7px';box.style.background='#171307';
        box.innerHTML=`<b style="color:#f6c85f">Preview Handle Recovery</b><br>${rec.map(x=>`<span class="warn">◐ ${esc(x.src)} → ${esc(x.h.displayName||x.h.handle)}</span>`).join('<br>')}<br><span style="color:#9fa8bd">Browser-only substitution. Source JSON still contains unfinished handles and is not Unity-safe.</span>`;
        diag.appendChild(box);
      }
      return r;
    };
  }

  console.info('[CUTSCENE_PREVIEW] preview handle recovery ready');
})();