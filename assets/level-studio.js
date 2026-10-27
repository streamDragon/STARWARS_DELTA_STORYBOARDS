(()=>{'use strict';const $=id=>document.getElementById(id),P=new URLSearchParams(location.search),repo='streamDragon/STARWARS_DELTA_STORYBOARDS';let root='',index,qa={runs:[]},session,recipe,copyEntries=[],copyError='',tab=['overview','layer0','waves','qa','files'].includes(P.get('tab'))?P.get('tab'):'overview',objs=[],waveRequest=0,waveHost=null;const E=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};const safe=p=>typeof p==='string'&&p.length>0&&!p.startsWith('/')&&!p.includes('..')&&!/[\\?#]/.test(p);const url=p=>safe(p)?root+p:null;const name=p=>String(p||'').split('/').pop();const status=(txt,error=false)=>{$('status').textContent=txt;$('status').className=error?'status-line error':'status-line';};const norm=s=>String(s||'').toLowerCase().replace(/[\s_-]/g,'');
const copyPrefix='designer-ai/copy-ai/';
const copyId=slug=>'copy-ai-'+slug;
const copyFile=(slug,file)=>root+copyPrefix+slug+'/CURRENT/'+file;
const copyScene=scene=>copyEntries.find(x=>norm(x.slug)===norm(scene))||null;
function copyTitle(slug){
 const spaced=slug.replace(/[_-]+/g,' ').replace(/\b[a-z]/g,c=>c.toUpperCase()).replace(/\bGrad\b/i,'GRAD');
 const mars=slug.match(/mars[_-]?0*(\d+)/i);
 return mars?'MARS '+Number(mars[1])+' · '+spaced:spaced;
}
function levelChoices(){
 const old=index.projects.filter(x=>x.kind==='level');
 const fresh=copyEntries.filter(e=>!old.some(p=>norm(p.title.split('|')[0].trim())===norm(e.slug)));
 const active=old.find(p=>p.id===index.activeByKind?.level);
 return [...(active?[active]:[]),...fresh,...old.filter(p=>p!==active)];
}
async function discoverCopyAi(){
 const url='https://api.github.com/repos/'+repo+'/contents/'+copyPrefix+'?ref=main&t='+Date.now();
 const r=await fetch(url,{cache:'no-store'});
 if(!r.ok)throw Error('רשימת COPY AI לא זמינה ('+r.status+')');
 const entries=await r.json();
 if(!Array.isArray(entries))throw Error('מבנה רשימת COPY AI אינו תקין');
 return entries.filter(x=>x.type==='dir'&&/^[a-z0-9_-]+$/.test(x.name)).map(x=>({
   id:copyId(x.name),kind:'level',stage:'COPY AI · CURRENT',copyAiOnly:true,
   slug:x.name,sceneName:x.name,title:copyTitle(x.name)
 }));
}
async function get(p){if(!safe(p))throw Error('נתיב לא תקין');const r=await fetch(root+p,{cache:'no-store'});if(!r.ok)throw Error('לא ניתן לקרוא '+p+' ('+r.status+')');return r.json();}
function tabs(t){tab=t;const page=new URL(location.href);page.searchParams.set('tab',t);history.replaceState({},'',page);document.querySelectorAll('.tabbar button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===t)));document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!==t);const dash=$('work-dashboard');if(dash)dash.hidden=t!=='overview';}
function list(){const d=$('level-list'),q=norm($('level-search').value),all=levelChoices();d.replaceChildren();const arr=all.filter(x=>norm(x.title+x.id).includes(q));const quick=$('level-quick-picker');const selected=session?.id||index.activeByKind?.level;quick.replaceChildren();for(const v of all){const o=E('option',v.title);o.value=v.id;quick.append(o);}if(all.some(v=>v.id===selected))quick.value=selected;$('level-count').textContent=arr.length+' תיקים';for(const v of arr){const b=E('button');b.append(E('strong',v.title),E('small',v.stage));b.setAttribute('aria-current',String(v.id===session?.id));b.onclick=()=>load(v.id);d.append(b);}}
async function init(){try{const r=await fetch('https://api.github.com/repos/'+repo+'/git/ref/heads/main?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('GitHub HEAD לא זמין');const h=(await r.json()).object.sha;if(!/^[a-f0-9]{40}$/.test(h))throw Error('HEAD לא תקין');root='https://raw.githubusercontent.com/'+repo+'/'+h+'/';index=await get('workbench/index.json');try{qa=await get('level-qa/index.json');}catch{}try{copyEntries=await discoverCopyAi();}catch(e){copyError=e.message;}const choices=levelChoices();const first=choices.find(x=>x.id===P.get('id'))||choices.find(x=>x.id===index.activeByKind?.level)||choices[0];list();if(first)await load(first.id);status('מאגר מאומת · '+h.slice(0,7)+' · '+copyEntries.length+' תיקיות COPY AI CURRENT'+(copyError?' · '+copyError:''));}catch(e){status(e.message,true);}}
async function load(id){try{
 const p=levelChoices().find(x=>x.id===id);
 if(!p)throw Error('הרמה לא נמצאה: '+id);
 if(p.copyAiOnly){
   session={id:p.id,kind:'level',title:p.title,revision:1,copyAiOnly:true,slug:p.slug,
     scenePath:p.sceneName+'.unity',runs:[],storyboard:[],sourceArtifacts:[],
     gaps:[{description:'מפות COPY AI מעודכנות. צילום QA אמיתי עדיין אינו מחובר.'}]};
   const select=$('scene-select');select.replaceChildren();
   const option=E('option',p.sceneName);option.value=p.sceneName;select.append(option);select.disabled=true;
   const u=new URL(location.href);u.searchParams.set('id',id);u.searchParams.set('kind','level');u.searchParams.set('scene',p.sceneName);history.replaceState({},'',u);
   list();recipe=null;render();return;
 }
 const v=await get(p.sessionPath);if(v.id!==p.id||v.revision!==p.revision)throw Error('גרסת היומן והאינדקס אינן תואמות');session=v;const names=[v.scenePath,...v.linkedScenePaths||[]].filter(Boolean).map(p=>name(p).replace(/\.unity$/,''));if(!names.length)names.push(v.runs?.[0]?.sceneName||v.title);const select=$('scene-select');select.replaceChildren();for(const n of new Set(names)){const o=E('option',n);o.value=n;select.append(o);}select.disabled=select.options.length<2;if(P.get('scene')&&names.includes(P.get('scene')))select.value=P.get('scene');const u=new URL(location.href);u.searchParams.set('id',id);u.searchParams.set('kind','level');u.searchParams.set('scene',select.value);history.replaceState({},'',u);list();await scene();}catch(e){status(e.message,true);}}
async function scene(){const v=$('scene-select').value,src=(session.sourceArtifacts||[]).find(a=>a.kind==='source'&&(v==='GRAD11'?name(a.path)==='GRAD11_BUILD_INPUT.json':v==='GRAD11_V2'?name(a.path)==='GRAD11_V2_BUILD_RECIPE.json':norm(name(a.path)).includes(norm(v))));recipe=null;if(src)try{const j=await get(src.path);if(j.schema==='STARWARS_DELTA_LEVEL_BUILD'&&j.schemaVersion===6)recipe=j;}catch(e){status(e.message,true);}render();}
function runMatch(x,s){return norm(x.sceneName)===norm(s)||name(x.scenePath)===s+'.unity';}
function render(){const researchShortcut=$('gradius-research-shortcut');if(researchShortcut)researchShortcut.hidden=session?.id!=='level-gradius-volcano-stage1-1985';const sceneName=$('scene-select').value,r=(session.runs||[]).find(x=>runMatch(x,sceneName));$('scene-title').textContent=sceneName;$('scene-context').textContent=session.title;$('scene-subtitle').textContent=(recipe?'Level Builder v6 · שכבת Layer 0 קיימת':'אין מתכון Layer 0 פומבי')+' · '+(r?r.reviewStatus:'QA חסר');const nums=[recipe?.segments?.length??session.storyboard?.length??0,recipe?.geometryOperations?.length,recipe?.visualPlacements?.length,recipe?.hazardPlacements?.length];[...$('metrics').children].forEach((x,i)=>x.querySelector('strong').textContent=nums[i]??'—');overview();map();waves();photos();files();renderCopyAi();if(window.LevelProgress?.render&&!session.copyAiOnly)window.LevelProgress.render({session,scene:sceneName,recipe,qa,root,navigate:t=>{tabs(t);document.querySelector('.tabbar')?.scrollIntoView({behavior:'smooth',block:'start'});}});else if(session.copyAiOnly)$('work-dashboard').replaceChildren(E('p','COPY AI CURRENT: מפת Unity ונתוני Spawn זמינים בלשוניות הרמה. צילום QA נשאר נפרד עד שיפורסם.'));tabs(tab);}
function overview(){const track=$('region-track'),cards=$('region-cards');track.replaceChildren();cards.replaceChildren();const regs=recipe?.segments||session.storyboard||[],total=Math.max(1,...regs.map(r=>r.endKm||0));regs.forEach((r,i)=>{const a=r.startKm||0,b=r.endKm||0,button=E('button',(r.displayName||r.name||String(i+1)).split(' ').slice(0,3).join(' '));button.style.width=Math.max(3,(b-a)/total*100)+'%';button.style.background=['#267181','#436f91','#695b91','#866444'][i%4];button.title=a+'–'+b+' km';button.onclick=()=>{tabs('layer0');$('region-filter').value=r.segmentId||'all';map();};track.append(button);const card=E('div',undefined,'region-card');card.append(E('h4',r.displayName||r.name),E('strong',a+'–'+b+' ק״מ'));if(recipe)card.append(E('p',recipe.visualPlacements.filter(x=>x.segmentId===r.segmentId).length+' אמנות · '+recipe.hazardPlacements.filter(x=>x.segmentId===r.segmentId).length+' מפגעים'));cards.append(card);});$('overview-provenance').textContent=recipe?'Level Builder JSON · תכנון':'יומן בלבד';$('overview-insight').replaceChildren(E('strong','עבודה פתוחה'),E('p',(session.gaps||[]).slice(0,5).map(x=>x.description||x.title).join(' · ')||'אין פירוט פערים.'));}
function map(){const svg=$('layer-map'),area=$('region-filter'),old=area.value||'all';svg.replaceChildren();area.replaceChildren();const a=E('option','כל הרמה');a.value='all';area.append(a);for(const r of recipe?.segments||[]){const o=E('option',r.displayName);o.value=r.segmentId;area.append(o);}area.value=[...area.options].some(x=>x.value===old)?old:'all';objs=recipe?[...(recipe.geometryOperations||[]).map(x=>({...x,type:'geometry',key:x.elementId})),...(recipe.visualPlacements||[]).map(x=>({...x,type:'visual',key:x.placementId})),...(recipe.hazardPlacements||[]).map(x=>({...x,type:'hazard',key:x.placementId}))]:[];const chosen=objs.filter(o=>(area.value==='all'||o.segmentId===area.value)&&(o.type==='geometry'?$('show-geometry').checked:o.type==='visual'?$('show-visuals').checked:$('show-hazards').checked));const q=norm($('object-search').value),results=chosen.filter(o=>norm(o.key).includes(q));$('object-count').textContent=results.length+' אובייקטים';$('objects').replaceChildren();for(const o of results.slice(0,130)){const b=E('button',o.key);b.onclick=()=>detail(o);$('objects').append(b);}if(!recipe){$('map-description').textContent='אין מתכון Layer 0 מקושר. ראו את QA או את יומן העבודה.';return;}const S='http://www.w3.org/2000/svg',add=(tag,attrs={},parent=svg)=>{const e=document.createElementNS(S,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e;};const seg=area.value==='all'?recipe.segments:recipe.segments.filter(x=>x.segmentId===area.value),total=Math.max(1,...seg.map(x=>x.endKm)),min=area.value==='all'?0:seg[0]?.startKm||0,z=Number($('map-zoom').value)||1,span=Math.max(1,(total-min)/z),start=min+(total-min-span)/2,X=x=>35+1120*(Math.abs(Number(x))/2.63-start)/span,Y=y=>370-(Number(y)+16)*6.2;svg.setAttribute('viewBox','0 0 1200 430');for(let i=0;i<=10;i++){const x=35+i*112;add('line',{x1:x,x2:x,y1:15,y2:400,stroke:'#274157'});add('text',{x,y:422}).textContent=Math.round(start+span*i/10)+' km';}for(const o of chosen){if(o.type==='geometry'){const points=(o.points||[]).map(p=>X(p.x)+','+Y(p.y)).join(' ');if(!points)continue;const el=add('polyline',{points,fill:'none',stroke:'#70dbea','stroke-width':3,class:'map-object',tabindex:0});el.onclick=()=>detail(o);}else{const x=X(o.position?.x),y=Y(o.position?.y);if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1200||y<0||y>430)continue;const el=add('circle',{cx:x,cy:y,r:o.type==='hazard'?5:3.5,fill:o.type==='hazard'?'#f4b16f':'#c1a3f7',class:'map-object',tabindex:0});el.onclick=()=>detail(o);add('title',{},el).textContent=o.key;}}$('map-description').textContent=recipe.sceneName+' · '+chosen.length+' אובייקטים במתכון · קנה מידה מקורב, לא צילום Unity.';}
function detail(o){const d=$('object-detail');d.replaceChildren(E('strong',o.key));const dl=E('dl');for(const [k,v]of [['סוג',o.type],['תפקיד',o.role],['X',o.position?.x??o.points?.[0]?.x],['Y',o.position?.y??o.points?.[0]?.y],['נכס',o.assetId||o.shapeProfilePath||'אין']]){dl.append(E('dt',k),E('dd',String(v??'לא ידוע')));}d.append(dl);}
async function waves(){
 const token=++waveRequest,sceneName=$('scene-select').value;
 if(waveHost?._dispose)waveHost._dispose();
 waveHost=null;
 const d=$('wave-summary'),viz=$('wave-viz'),rows=$('wave-rows');d.replaceChildren();viz.replaceChildren();rows.replaceChildren();
 const runs=(qa.runs||[]).filter(x=>runMatch(x,sceneName)&&typeof x.timelinePath==='string'&&/^level-qa\/[A-Za-z0-9_-]+\/timeline\.json$/.test(x.timelinePath)).sort((a,b)=>(Date.parse(b.generatedUtc)||0)-(Date.parse(a.generatedUtc)||0));
 if(!runs.length){
  const message=sceneName.startsWith('GRAD11')?'ל־'+sceneName+' עדיין לא פורסם Timeline עם גלים ומסלולים. מתכון Layer 0 אינו מערכת גלים. בנו גלים בכלי Reverse ב־Unity, צלמו ופרסמו QA תואם.':'לרמה הזו אין עדיין Timeline מצולם שפורסם. אין להמציא מסלולים מתוך מתכון Layer 0.';
  d.append(E('div',message,'notice-card'));
  const a=E('a','לבדיקות ולמקורות שפורסמו ↗','btn secondary');a.href='level-qa.html';rows.append(a);return;
 }
 const run=runs[0];let timeline;
 try{timeline=await get(run.timelinePath);}catch(e){if(token!==waveRequest)return;d.append(E('div','Timeline קיים באינדקס אך אינו זמין כרגע: '+e.message,'notice-card'));return;}
 if(token!==waveRequest||sceneName!==$('scene-select').value)return;
 if(timeline.version!=='LEVEL_QA_TIMELINE_V1'||!Array.isArray(timeline.waves)||!timeline.bounds||!runMatch(timeline,sceneName)||timeline.runId!==run.runId){d.append(E('div','זיהוי ה־Timeline לא תואם לריצה שנבחרה. התצוגה לא נטענה כדי למנוע ערבוב בין סצנות.','notice-card'));return;}
 const paths=timeline.waves.filter(w=>Array.isArray(w.path)&&w.path.length>1).length,roads=Array.isArray(timeline.roads)?timeline.roads.length:0,spawned=timeline.waves.filter(w=>w.spawn).length;
 const summary=E('div',undefined,'wave-source-summary');
 for(const [value,label]of[[timeline.waves.length,'גלים'],[paths,'מסלולי אויבים'],[roads,'דרכי SpriteShape'],[spawned,'Spawn מזוהה']]){const card=E('div',undefined,'wave-source-metric');card.append(E('strong',String(value)),E('span',label));summary.append(card);}
 d.append(summary);
 const notice=E('p','ריצה: '+run.runId+' · '+(run.reviewStatus||'NOT_REVIEWED')+' · '+(run.acceptanceStatus||'PENDING')+' · אלו נתוני תכנון/צילום, לא אימות תנועה בזמן משחק.','muted');d.append(notice);
 const host=E('section',undefined,'timeline integrated-timeline');host.id='level-wave-player';host.append(E('p','טוען את נגן הגלים ואת צילום Unity…','muted'));viz.append(host);waveHost=host;
 if(typeof window.mountLevelTimeline!=='function'){host.replaceChildren(E('p','מנוע LevelTimeline אינו זמין. אפשר לפתוח את Level QA.','muted'));return;}
 try{await window.mountLevelTimeline(host,root+run.timelinePath);}catch(e){if(token!==waveRequest||e.name==='AbortError')return;host.replaceChildren(E('p','לא ניתן לטעון את נגן הגלים: '+e.message,'muted'));}
 if(token!==waveRequest){if(host._dispose)host._dispose();return;}
 const actions=E('div',undefined,'wave-source-actions');
 const original=E('a','פתיחת הנגן המקורי ב־Level QA ↗','btn secondary');original.href='level-qa.html#'+new URLSearchParams({level:sceneName,run:run.runId}).toString();
 const data=E('a','פתיחת נתוני המסלולים (JSON) ↗','btn secondary');data.href=root+run.timelinePath;data.target='_blank';data.rel='noopener';
 actions.append(original,data);
 rows.append(actions);
 const note=E('p','זה אותו LevelTimeline של Level QA, לא מימוש שני. בכפתור ״כל נקודות ההופעה״ מוצגים גם מסלולי כל הגלים; בכפתור ״דרכי SpriteShape״ מוצגות דרכי הרמה בנפרד.','muted');rows.append(note);
}

function renderCopyAi(){
 const current=copyScene($('scene-select').value);
 let panel=$('copy-ai-layer-panel');
 if(!panel){panel=E('section',undefined,'notice-card');panel.id='copy-ai-layer-panel';$('layer0').insertBefore(panel,$('layer-controls'));}
 let summary=$('copy-ai-overview-panel');
 if(!summary){summary=E('section',undefined,'notice-card');summary.id='copy-ai-overview-panel';$('overview').insertBefore(summary,$('region-track'));}
 panel.replaceChildren();summary.replaceChildren();
 panel.hidden=!current;summary.hidden=!current;
 $('layer-map').hidden=!!current&&!recipe;
 $('layer-controls').hidden=!!current&&!recipe;
 if(!current)return;
 const slug=current.slug;
 const link=(file,label)=>{
  const a=E('a',label,'btn secondary');
  a.href=copyFile(slug,file);a.target='_blank';a.rel='noopener';return a;
 };
 const image=(file,label,allowFallback)=>{
  const a=E('a');a.href=copyFile(slug,file);a.target='_blank';a.rel='noopener';
  a.style.cssText='display:block;min-width:0;text-decoration:none';
  const img=E('img');img.src=a.href;img.alt=label;img.loading='lazy';
  img.style.cssText='display:block;width:100%;height:auto;max-height:420px;object-fit:contain;border-radius:8px;background:#0e1724';
  img.onerror=()=>{
   if(allowFallback&&img.src.indexOf('LAYER0_GAMEPLAY_VIEW.svg')!==-1){
    img.src=copyFile(slug,'LAYER0_SPATIAL_MAP.svg');
    a.href=img.src;return;
   }
   a.replaceChildren(E('p','לא פורסם קובץ '+file+' ברמה זו.','muted'));
  };
  a.append(img,E('span',label));return a;
 };
 const row=E('div');row.style.cssText='display:flex;gap:10px;flex-wrap:wrap;margin-top:12px';
 row.append(link('COPY_AI_CONTEXT.txt','הוראות לסוכן + קטלוג'),link('LAYER0_SPATIAL_SNAPSHOT.json','Spawn ונתוני הרמה JSON'),link('LAYER0_SPATIAL_MAP.svg','מפה הנדסית'));
 summary.append(E('h3','COPY AI · CURRENT של '+$('scene-select').value),
   E('p','מקור: ייצוא מהסצנה ב־Unity. המפות הן תרשימים מרחביים ולא צילומי QA. כל כניסה מציגה רק את CURRENT של הרמה.'));
 const hero=image('LAYER0_GAMEPLAY_VIEW.svg','מפת אזור המשחק · תצוגת Unity מרחבית',true);
 summary.append(hero,row);
 panel.append(E('h3','מפת רמה וגריד Spawn · COPY AI CURRENT'),
   E('p','התרשימים מקושרים לאותם נתוני מיקום. שמות הנקודות והקואורדינטות המדויקות נמצאים בקובץ JSON.'));
 const grid=E('div');grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:16px;margin:12px 0';
 grid.append(image('LAYER0_CLEAN_SCHEMATIC.svg','מפת כל הרמה',true),
             image('LAYER0_RELATIVE_SPAWN_GRID.svg','גריד נקודות יחסי'));
 panel.append(grid);
 const row2=E('div');row2.style.cssText='display:flex;gap:10px;flex-wrap:wrap';
 row2.append(link('LAYER0_SPATIAL_SNAPSHOT.json','כל ה־Spawn Points והקואורדינטות'),
   link('COPY_AI_CONTEXT.txt','הוראות COPY AI'),
   link('SPLINE_ATLAS_INDEX.json','קטלוג Spline'));
 panel.append(row2);
 if(!recipe)$('map-description').textContent='תרשימי COPY AI CURRENT מהסצנה הפעילה בעת הייצוא; אין מתכון Level Builder V6 מקושר.';
 const files=$('file-list');
 for(const [file,label] of [['COPY_AI_CONTEXT.txt','COPY AI · הוראות וקטלוגים'],['LAYER0_SPATIAL_SNAPSHOT.json','נתוני הרמה ונקודות Spawn'],['LAYER0_SPATIAL_MAP.svg','מפת Layer 0'],['LAYER0_GAMEPLAY_VIEW.svg','מפת אזור המשחק'],['LAYER0_RELATIVE_SPAWN_GRID.svg','גריד יחסי']]){
  const c=E('div',undefined,'file-row');c.append(E('strong',label),E('p','COPY AI CURRENT · '+file),link(file,'פתח קובץ ישיר'));files.append(c);
 }
 const q=$('qa-content');
 q.prepend(E('p','מפת COPY AI זמינה בלשונית Layer 0. אין להציג אותה כאילו היא צילום QA מתוך Game View.','muted'));
 if(session.copyAiOnly){
  $('scene-subtitle').textContent='COPY AI CURRENT קיים · מפות ונתוני Spawn זמינים · צילום QA טרם פורסם';
  $('overview-provenance').textContent='Unity Spatial COPY AI · CURRENT';
 }
}
function photos(){const d=$('qa-content');d.replaceChildren();const sceneName=$('scene-select').value,matches=(qa.runs||[]).filter(x=>runMatch(x,sceneName));if(!matches.length){d.append(E('div','אין תמונות QA מפורסמות של '+sceneName+'. ייתכנו צילומים מקומיים, אך הם אינם זמינים כאן.','notice-card'));for(const r of (session.runs||[]).filter(x=>runMatch(x,sceneName))){const c=E('div',undefined,'qa-card');c.append(E('strong','ריצה: '+(r.runId||r.id)),E('p','צילום: '+(r.captureStatus||'לא ידוע')+' · סקירה: '+(r.reviewStatus||'לא נבדק')+' · אישור: '+(r.acceptanceStatus||'ממתין')));const a=(r.artifacts||[]).find(x=>url(x.path));if(a){const l=E('a','פתיחת דוח הריצה ↗');l.href=url(a.path);l.target='_blank';l.rel='noopener';c.append(l);}d.append(c);}}else{const grid=E('div',undefined,'qa-grid');matches.slice(0,3).forEach(r=>{const c=E('div',undefined,'qa-card');c.append(E('strong',r.runId),E('p','Capture: '+r.captureStatus+' · Review: '+r.reviewStatus));(r.frames||[]).filter(f=>url(f.path)&&/\.(png|svg|jpg)$/i.test(f.path)).slice(0,3).forEach(f=>{const a=E('a');a.href=url(f.path);a.target='_blank';a.rel='noopener';const img=E('img');img.src=url(f.path);img.alt=f.frameId+' מ־Unity';img.loading='lazy';a.append(img,E('span',f.frameId));c.append(a);});grid.append(c);});d.append(grid);}}
function files(){const d=$('file-list');d.replaceChildren();for(const x of [...session.targetArtifacts||[],...session.sourceArtifacts||[]]){const c=E('div',undefined,'file-row');c.append(E('strong',x.label||name(x.path)),E('p',x.kind+' · '+(x.evidenceStatus||'לא מאומת')));if(url(x.path)){const a=E('a','פתיחת קובץ ↗');a.href=url(x.path);a.rel='noopener';a.target='_blank';c.append(a);}d.append(c);}}
function copy(){const c=copyScene($('scene-select').value);const t=c?'רמה: '+$('scene-select').value+'\nCOPY AI CURRENT: '+copyFile(c.slug,'COPY_AI_CONTEXT.txt')+'\nמפת אזור המשחק: '+copyFile(c.slug,'LAYER0_GAMEPLAY_VIEW.svg')+'\nגריד נקודות: '+copyFile(c.slug,'LAYER0_RELATIVE_SPAWN_GRID.svg')+'\nנתוני Spawn ושכבת 0: '+copyFile(c.slug,'LAYER0_SPATIAL_SNAPSHOT.json')+'\nקרא את המפה ואת הנקודות לפני תכנון גלים. אין להמציא קואורדינטות או להחליף את הנתונים הישירים במפה ישנה.': 'המשך רמה '+$('scene-select').value+' בתיק '+session.id+' revision '+session.revision+'. קרא פרוטוקול workbench/AGENT_PROTOCOL.md ונתוני CURRENT. יש להשתמש ב-Reverse Wave Authoring JSON רק לאחר QA של Layer0, מיפוי זמן וספאון. אין לדרוס Scene לאחר handoff. דווח על QA אמיתי ופרסם רק דרך RunSmartPublish.';navigator.clipboard?.writeText(t).then(()=>status('ההנחיות הועתקו לסוכן.')).catch(()=>status('העתקה לא זמינה.',true));}
document.querySelectorAll('.tabbar button').forEach(b=>b.onclick=()=>tabs(b.dataset.tab));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>tabs(b.dataset.go));$('level-search').oninput=list;$('level-quick-picker').onchange=()=>{const v=$('level-quick-picker').value;if(v&&v!==session?.id)load(v);};$('scene-select').onchange=()=>{const page=new URL(location.href);page.searchParams.set('scene',$('scene-select').value);history.replaceState({},'',page);scene();};for(const id of ['region-filter','show-geometry','show-visuals','show-hazards','map-zoom','object-search'])$(id).addEventListener(id==='object-search'?'input':'change',map);$('copy-wave').onclick=copy;$('local-file').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>3e6)throw Error('קובץ גדול מדי');const j=JSON.parse(await f.text());if(j.schema!=='STARWARS_DELTA_LEVEL_BUILD'||j.schemaVersion!==6||!Array.isArray(j.segments))throw Error('לא מתכון Level Builder v6');recipe=j;$('file-message').textContent='מתכון מקומי: '+f.name+'. אין שינוי ב־Unity או ב־GitHub.';render();tabs('layer0');}catch(err){$('file-message').textContent=err.message;}};init();})();