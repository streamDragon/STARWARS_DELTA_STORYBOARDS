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

  function flatSlug(v){return String(v||'asset').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,42)||'asset'}
  function flatHash(v){let h=2166136261;for(const c of String(v||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')}
  function flatSection(text,label){
    const key=String(label).toUpperCase()+'=';
    for(const part of String(text||'').split('|')){const p=part.trim();if(p.toUpperCase().startsWith(key))return p.slice(key.length).trim()}
    return'';
  }
  function flatRefs(segment){
    const out=[],re=/([^;\[]+?)\s*\[([0-9a-f]{32}:-?\d+)\]/gi;let m;
    while((m=re.exec(String(segment||''))))out.push({name:m[1].trim().replace(/^;+|;+$/g,''),assetId:m[2].trim()});
    return out;
  }
  function flatVfx(segment){
    const refs=flatRefs(segment),known=new Set(refs.map(x=>x.name.toLowerCase()));
    for(const raw of String(segment||'').split(';')){const name=raw.replace(/\[[^\]]+\]/g,'').trim();if(name&&!known.has(name.toLowerCase()))refs.push({name,assetId:''})}
    return refs;
  }
  function flatMotion(text){
    const t=String(text||'').toLowerCase();
    if(/right[- ]to[- ]left|screen-left|moves? left|strafe.*left/.test(t))return'right_to_left';
    if(/screen-right|moves? right|advance|surge|convoy continues|cross.*right/.test(t))return'left_to_right';
    if(/launch|lift|climb|take.?off|powers? up/.test(t))return'launch';
    if(/bank.*left|turn.*left/.test(t))return'bank_left';
    if(/bank.*right|turn.*right/.test(t))return'bank_right';
    if(/dive|drop low/.test(t))return'right_to_left';
    if(/destroy|impact|is hit|taking fire/.test(t))return'impact';
    if(/hold|locks|formed|staging|fills the frame/.test(t))return'hold';
    return'idle';
  }
  function flatCamera(text){const raw=flatSection(text,'CAMERA');const m=raw.match(/^([A-Za-z]+)/);return m?m[1]:'Hold'}
  function flatDialogue(text){
    const raw=flatSection(text,'DIALOGUE');if(!raw)return null;
    const k=raw.indexOf(':'),speaker=k>=0?raw.slice(0,k).trim():'',line=k>=0?raw.slice(k+1).trim():raw.trim();
    return{speaker:speaker||'Dialogue',name:speaker||'Dialogue',text:line,emotion:flatSection(text,'EMOTION')||'',previewInference:true};
  }
  function backgroundCandidates(text){
    const t=String(text||'').toLowerCase();
    if(/dialogue=|comm portrait|command|officer|captain issues|damage report|tactical split|threat update/.test(t))return[['command','center'],['control','room'],['bridge'],['command']];
    if(/mars/.test(t))return[['mars'],['red','planet'],['planet'],['space']];
    if(/earth/.test(t))return[['earth'],['planet'],['space']];
    if(/orbit|fighter|ship|convoy|delta7|bomber|dreadnought/.test(t))return[['space'],['orbit'],['planet']];
    return[];
  }
  const bgMemo=new Map();
  function inferFlatBackground(text){
    const groups=backgroundCandidates(text);if(!groups.length||typeof visuals==='undefined')return'';
    const memoKey=groups.map(g=>g.join('+')).join('|');if(bgMemo.has(memoKey))return bgMemo.get(memoKey);
    let best='',bestScore=-1;const seen=new Set();
    for(const [k,d] of visuals.entries()){
      if(!d||seen.has(d))continue;seen.add(d);
      const hay=(String(k)+' '+String(d.display||'')).toLowerCase();
      if(!/background|\bbg\b|space|earth|mars|planet|command|control|bridge|cockpit|environment|scene/.test(hay))continue;
      for(let gi=0;gi<groups.length;gi++){
        const g=groups[gi];if(!g.every(term=>hay.includes(term)))continue;
        let score=100-gi*15;if(/background|\bbg\b/.test(hay))score+=16;if(/page|atlas|sheet/.test(hay))score-=12;
        if(score>bestScore){bestScore=score;best=k}
      }
    }
    if(!best){
      const command='560ce56e7f1b561c4b4615d1239494f:-1042355711',space='2d57d74ec12f4b34cb74995e4366f564:-1897235735';
      const t=String(text||'').toLowerCase();
      if(/dialogue=|command|officer/.test(t)&&typeof resolveVisual==='function'&&resolveVisual(command))best=command;
      else if(typeof resolveVisual==='function'&&resolveVisual(space))best=space;
    }
    bgMemo.set(memoKey,best||'');return best||'';
  }
  function allShotArrays(j){
    const out=[];const add=a=>{if(Array.isArray(a))out.push(a)};
    if(Array.isArray(j))add(j);if(!isObj(j))return out;
    add(j.shots);add(j.storyboard?.shots);add(j.cutscene?.shots);add(j.script?.shots);add(j.data?.shots);
    for(const seq of arr(j.sequences))add(seq.shots);for(const seq of arr(j.storyboard?.sequences))add(seq.shots);for(const seq of arr(j.cutscene?.sequences))add(seq.shots);
    return out;
  }
  function hydrateFlatShots(j){
    const stats={shots:0,actors:0,effects:0,dialogue:0,backgrounds:0,cameras:0};if(!isObj(j))return stats;
    if(!Array.isArray(j.cast))j.cast=[];
    const castIds=new Set(j.cast.map(c=>String(c?.entityId||c?.actorId||c?.id||'')));
    for(const list of allShotArrays(j))for(const s of list){
      if(!isObj(s))continue;const text=String(s.intention||'');
      if(!/ATLAS ASSETS=|VFX=|DIALOGUE=|CAMERA=/i.test(text))continue;
      stats.shots++;
      const actionText=flatSection(text,'ACTION'),refs=flatRefs(flatSection(text,'ATLAS ASSETS'));
      if(!Array.isArray(s.actorActions))s.actorActions=[];
      if(!s.actorActions.length&&refs.length){
        refs.forEach((r,i)=>{
          const id=`preview_${flatSlug(r.name)}_${flatHash(r.name+'|'+r.assetId)}`;
          if(!castIds.has(id)){j.cast.push({entityId:id,displayName:r.name,role:'PreviewActor',entityKind:'PreviewVisual',visualAssetId:r.assetId,spawnWorldActor:true,useGameplayObject:false,temporaryCinematicClone:true,presentationMode:'WorldActor',previewInference:true});castIds.add(id);stats.actors++}
          s.actorActions.push({actionId:`${s.shotId||'shot'}_preview_${i+1}`,type:'Move',actorId:id,startOffset:0,duration:Number(s.duration)||2,movement:flatMotion(actionText),visualOnly:true,previewInference:true});
        });
      }
      const vfx=flatVfx(flatSection(text,'VFX'));
      if(!Array.isArray(s.effects))s.effects=[];
      if(!s.effects.length&&vfx.length){vfx.forEach((v,i)=>s.effects.push({effectId:`${s.shotId||'shot'}_preview_fx_${i+1}`,type:v.name||'Effect',kind:v.name||'Effect',assetId:v.assetId||'',startOffset:.35+i*.18,duration:.35,visualOnly:true,previewInference:true}));stats.effects+=vfx.length}
      if(!Array.isArray(s.dialogue))s.dialogue=[];
      if(!s.dialogue.length){const d=flatDialogue(text);if(d){d.lineId=`${s.shotId||'shot'}_preview_dialogue`;d.startOffset=0;d.duration=Math.max(.5,(Number(s.duration)||2)*.92);s.dialogue.push(d);stats.dialogue++}}
      if(!s.cameraIntent){s.cameraIntent=flatCamera(text);s.__previewInferredCamera=true;stats.cameras++}
      const hasBg=s.backgroundAssetId||s.locationAssetId||arr(s.layerActions).some(a=>a?.assetId||a?.backgroundAssetId);
      if(!hasBg){const bg=inferFlatBackground(text);if(bg){s.backgroundAssetId=bg;s.__previewInferredBackground=true;stats.backgrounds++}}
      s.__previewHydrated=true;
    }
    j.__previewHydration=stats;return stats;
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
      const hydration=hydrateFlatShots(root);
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
      const hyd=hydration.shots?` · hydrated ${hydration.shots} flat shots`:'';
      drop.textContent=`Loaded ${name}: ${mode==='simple'?'Simple Script':'V5/Storyboard'} · ${items.length} beats/shots · ${total().toFixed(1)}s${path}${hyd}`;
      play.disabled=prev.disabled=next.disabled=scrub.disabled=false;
      diag.insertAdjacentHTML('afterbegin',`<div><span class="tag ok">PARSER CURRENT</span><span class="tag ok">${esc(detected?.path||'auto-detected')}</span>${hydration.shots?`<span class="tag warn">FLAT HYDRATION ${hydration.shots}</span>`:''}</div><br>`);
    }catch(e){
      items=[];idx=0;elapsed=0;stop();stage.innerHTML='';timeline.innerHTML='';raw.textContent='-';
      drop.textContent='Could not load JSON: '+e.message;
      diag.innerHTML=`<span class="bad">✕ ${esc(e.message)}</span><br><br><span class="warn">Parser accepts beats, shots, sequences[].shots, storyboard/cutscene/script/data wrappers, nested storyboard arrays, and PREVIEW_SAFE intention metadata.</span>`;
      play.disabled=prev.disabled=next.disabled=scrub.disabled=true;clock();
    }
  };

  console.info('[CUTSCENE_PREVIEW] resilient parser + flat storyboard hydration ready');
})();