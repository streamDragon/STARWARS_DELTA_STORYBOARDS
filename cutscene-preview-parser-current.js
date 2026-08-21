(()=>{
  const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const arr=v=>Array.isArray(v)?v:[];
  const keys=o=>isObj(o)?Object.keys(o):[];
  const hasAny=(o,names)=>isObj(o)&&names.some(k=>o[k]!=null);
  const beatish=o=>isObj(o)&&(hasAny(o,['durationSeconds','locationHandle','visible','storyClaim','evidence'])||String(o.type||'').toLowerCase()==='beat');
  const shotish=o=>isObj(o)&&hasAny(o,['shotId','duration','shotType','framing','cameraIntent','actorActions','cameraActions','backgroundAssetId']);
  const wrapSimple=a=>arr(a).filter(isObj).map(b=>({simple:true,beat:b}));
  const wrapShots=(a,seq=null)=>arr(a).filter(isObj).map(s=>({shot:s,seq}));

  function directCandidates(j){
    const out=[];
    const add=(kind,a,seq=null,path='')=>{if(Array.isArray(a)&&a.length)out.push({kind,a,seq,path})};
    if(Array.isArray(j)) add((j[0]&&beatish(j[0]))?'simple':'shots',j,null,'$');
    if(!isObj(j)) return out;
    add('simple',j.beats,null,'$.beats');
    add('shots',j.shots,null,'$.shots');
    if(isObj(j.storyboard)){add('simple',j.storyboard.beats,null,'$.storyboard.beats');add('shots',j.storyboard.shots,null,'$.storyboard.shots')}
    if(isObj(j.cutscene)){add('simple',j.cutscene.beats,null,'$.cutscene.beats');add('shots',j.cutscene.shots,null,'$.cutscene.shots')}
    if(isObj(j.script)){add('simple',j.script.beats,null,'$.script.beats');add('shots',j.script.shots,null,'$.script.shots')}
    if(isObj(j.data)){add('simple',j.data.beats,null,'$.data.beats');add('shots',j.data.shots,null,'$.data.shots')}
    for(const seq of arr(j.sequences)) add('shots',seq.shots,seq,'$.sequences[].shots');
    for(const seq of arr(j.storyboard?.sequences)) add('shots',seq.shots,seq,'$.storyboard.sequences[].shots');
    for(const seq of arr(j.cutscene?.sequences)) add('shots',seq.shots,seq,'$.cutscene.sequences[].shots');
    return out;
  }

  function scoreArray(a){
    if(!Array.isArray(a)||!a.length||!isObj(a[0]))return 0;
    const sample=a.slice(0,Math.min(a.length,8));
    let score=0;
    for(const o of sample){if(beatish(o))score+=5;if(shotish(o))score+=5;if(hasAny(o,['cast','assetId','visualAssetId'])&&!beatish(o)&&!shotish(o))score-=3}
    return score;
  }

  function deepCandidate(j){
    let best=null;
    const seen=new Set();
    function walk(v,path,depth){
      if(v==null||depth>6)return;
      if(Array.isArray(v)){
        const s=scoreArray(v);
        if(s>0&&(!best||s>best.score))best={a:v,path,score:s,kind:beatish(v[0])&&!shotish(v[0])?'simple':'shots'};
        for(let i=0;i<Math.min(v.length,12);i++)walk(v[i],`${path}[${i}]`,depth+1);
        return;
      }
      if(!isObj(v)||seen.has(v))return;seen.add(v);
      for(const [k,x] of Object.entries(v))walk(x,path?`${path}.${k}`:k,depth+1);
    }
    walk(j,'$',0);return best;
  }

  function chooseCandidate(j){
    const direct=directCandidates(j).filter(c=>scoreArray(c.a)>0);
    if(direct.length){
      direct.sort((a,b)=>scoreArray(b.a)-scoreArray(a.a));
      return direct[0];
    }
    return deepCandidate(j);
  }

  isSimple=function(j){
    if(j&&j.schema==='STARWARS_DELTA_CUTSCENE_SCRIPT')return true;
    const c=chooseCandidate(j);
    return !!c&&c.kind==='simple';
  };

  collect=function(j){
    const c=chooseCandidate(j);
    if(!c)return[];
    if(c.kind==='simple')return wrapSimple(c.a);
    if(c.seq)return wrapShots(c.a,c.seq);
    if(c.path&&c.path.includes('sequences')){
      // Preserve per-sequence context when the known sequence structures exist.
      if(Array.isArray(j?.sequences))return j.sequences.flatMap(q=>wrapShots(q.shots,q));
      if(Array.isArray(j?.storyboard?.sequences))return j.storyboard.sequences.flatMap(q=>wrapShots(q.shots,q));
      if(Array.isArray(j?.cutscene?.sequences))return j.cutscene.sequences.flatMap(q=>wrapShots(q.shots,q));
    }
    return wrapShots(c.a,null);
  };

  function castSources(j){
    const out=[];
    for(const x of [j?.cast,j?.actors,j?.storyboard?.cast,j?.cutscene?.cast,j?.script?.cast,j?.data?.cast])if(Array.isArray(x))out.push(...x);
    return out;
  }

  function describeRoot(j){
    if(Array.isArray(j))return `root array(${j.length})`;
    if(!isObj(j))return `root ${typeof j}`;
    return `root keys: ${keys(j).slice(0,18).join(', ')||'(none)'}`;
  }

  loadText=function(text,name){
    try{
      root=JSON.parse(text);
      const detected=chooseCandidate(root);
      items=collect(root);
      if(!items.length){
        const detail=describeRoot(root);
        throw Error(`No beats/shots found. ${detail}`);
      }
      mode=items[0]?.simple?'simple':'v5';
      cast.clear();
      for(const c of castSources(root)){
        const id=c?.entityId||c?.actorId||c?.id;
        if(id!=null)cast.set(String(id),c);
      }
      idx=0;elapsed=0;stop();buildTimeline();render();
      const path=detected?.path?` · source ${detected.path}`:'';
      drop.textContent=`Loaded ${name}: ${mode==='simple'?'Simple Script':'V5/Storyboard'} · ${items.length} beats/shots · ${total().toFixed(1)}s${path}`;
      play.disabled=prev.disabled=next.disabled=scrub.disabled=false;
      diag.insertAdjacentHTML('afterbegin',`<div><span class="tag ok">PARSER CURRENT</span><span class="tag ok">${esc(detected?.path||'auto-detected')}</span></div><br>`);
    }catch(e){
      items=[];idx=0;elapsed=0;stop();stage.innerHTML='';timeline.innerHTML='';raw.textContent='-';
      drop.textContent='Could not load JSON: '+e.message;
      diag.innerHTML=`<span class="bad">✕ ${esc(e.message)}</span><br><br><span class="warn">Parser accepts beats, shots, sequences[].shots, storyboard/cutscene/script/data wrappers, and nested storyboard arrays.</span>`;
      play.disabled=prev.disabled=next.disabled=scrub.disabled=true;clock();
    }
  };

  console.info('[CUTSCENE_PREVIEW] resilient parser patch ready');
})();