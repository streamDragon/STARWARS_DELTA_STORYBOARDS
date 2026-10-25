(()=>{
'use strict';
const $=(id)=>document.getElementById(id);
const el=(tag,text,cl)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cl)n.className=cl;return n;};
const text=(str)=>String(str==null?'':str);
const date=(value)=>{const d=new Date(value||0);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('he-IL',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jerusalem'}).format(d):'לא ידוע';};
const smallPath=(p)=>text(p).split('/').pop();
const safePath=(p)=>typeof p==='string'&&p.length>0&&!p.startsWith('/')&&!p.includes('..')&&!/[\\?#]/.test(p);
const link=(parent,label,href,cls)=>{const a=el('a',label,cls);a.href=href;parent.append(a);return a;};
const sameScene=(run,scene)=>run&&((run.sceneName===scene)||(smallPath(run.scenePath)===scene+'.unity'));
const englishState=(s)=>({'COMPLETE':'הושלם ואומת','PASS':'עבר בדיקה','PARTIAL':'בוצע חלקית','OPEN':'פתוח','PENDING':'ממתין','NOT_REVIEWED':'טרם נבדק','BLOCKED':'חסום','IN_PROGRESS':'בטיפול'}[s]||text(s));
const createFact=(parent,flag,title,detail)=>{
 const item=el('div',undefined,'fact-item '+(flag==='verified'?'fact-verified':flag==='pending'?'fact-pending':'fact-neutral'));
 const marker=el('span',flag==='verified'?'✓':flag==='pending'?'!':'·','fact-marker');
 const content=el('div');content.append(el('strong',title),el('p',detail));
 item.append(marker,content);parent.append(item);
};
const buildAgentPrompt=({session,scene,root,hasRecipe,run,work,qaPresent})=>{
 const url=(p)=>safePath(p)?root+p:'לא זמין';
 const id=session.id;
 const lines=[
 'המשך את רמת '+scene+' בפרויקט STARWARS_DELTA. אל תתחיל רמה חדשה ואל תבצע Replace של סצנה שנערכה ידנית.',
 'תיק עבודה קבוע: '+id+' | revision '+session.revision+' | stage '+session.stage+' | status '+session.status,
 'מקורות חובה לקריאה טרייה:',
 '1. '+url('workbench/AGENT_PROTOCOL.md'),
 '2. '+url('workbench/projects/'+id+'/session.json'),
 '3. '+url('workbench/index.json'),
 '4. '+url('workbench/projects/'+id+'/artifacts/GRAD11_NATIVE_FIX_AND_PLAY_QA_20261024.md'),
 'Unity scene: '+(scene==='GRAD11'?session.scenePath:(session.linkedScenePaths||[]).find(p=>smallPath(p)===scene+'.unity')||'בדוק בתיק'),
 'מתכון Level Builder: '+(hasRecipe?'קיים בתיק באתר; קרא sourceArtifacts לפי הסצנה':'לא אושר מתכון לסצנה זו'),
 'ריצת QA מתועדת: '+(run?run.runId+' ('+(run.reviewStatus||'UNKNOWN')+')':'לא נמצאה'),
 'צילומי QA פומביים תואמים: '+(qaPresent?'קיימים באינדקס Level QA':'לא פורסמו'),
 'תוצאה אחרונה: '+text(session.lastCompletedAction),
 'משימה הבאה הרשמית: '+text(session.nextAction)
 ];
 if(work&&work.scene===scene){
  lines.push('Plastic SCM: MAIN cs:'+text(work.plastic?.changeset)+' (מצב אחרון שתועד; בדוק HEAD חי לפני עריכה).');
  lines.push('התקדמות וכשלים:');
  for(const t of work.tasks||[])lines.push(' - '+t.title+': '+t.detail+'; קבלה: '+t.acceptance);
  lines.push('ראיות לא פומביות: '+(work.localEvidence||[]).map(a=>a.path+' ('+a.status+')').join('; '));
 }
 lines.push('כללי ביצוע: קרא את AGENTS.md ואת skill של Level Builder ב-MAIN; בדוק מצב Unity ו-Plastic מחדש; אל תדרוס שינויים/QA. השתמש במערכות Layer0, Level QA ו-Reverse Wave Authoring הקיימות, לא בכלי חדש. בדוק Play Mode וצילום אמיתי, ציין מה לא אומת; בצע צק-אין ממוקד ל-MAIN; פרסם רק דרך RunSmartPublish; עדכן את אותה session.json ואת index.json ברוויזיה חדשה ב-commit אטומי.');
 return lines.join('\n');
};
function render({session,scene,recipe,qa,root,navigate}){
 const host=$('work-dashboard');if(!host)return;host.replaceChildren();
 if(!session)return;
 const run=(session.runs||[]).find(x=>sameScene(x,scene));
 const published=(qa?.runs||[]).filter(x=>sameScene(x,scene));
 const work=(session.workStatus?.scene===scene)?session.workStatus:null;
 const isV2=session.id==='level-grad11-asteroid-forge'&&scene==='GRAD11_V2';
 const isGrad11=session.id==='level-grad11-asteroid-forge'&&scene==='GRAD11';
 const modified=work?.verifiedAt||session.updatedUtc;
 const head=el('div',undefined,'state-top');
 const intro=el('div',undefined,'state-top-text');intro.append(
  el('p','תמונת מצב · מידע מתועד, לא חיבור חי ל־Unity','state-eyebrow'),
  el('h3',isGrad11?'GRAD11: השלד נבנה, הרמה עוד לא הושלמה':isV2?'GRAD11_V2: גרסת בנייה נפרדת':scene+': מצב העבודה המתועד'),
  el('p',isGrad11?'הסצנה נשמרה ונבדקה בהפעלה ראשונית. עדיין חסרים גלים, רצפה תקינה באזור B ובדיקת משחק מלאה.':isV2?'זוהי גרסה נפרדת. התיקון והצ׳ק־אין האחרונים בוצעו ב־GRAD11, ולא ב־V2.':work?.summary||'המידע שלפניך הוא התיעוד האחרון בפרויקט. בדיקות שלא פורסמו אינן מוצגות כאילו עברו.')
 );
 const state=el('div',undefined,'state-stamp');state.append(el('span','עודכן בתיק העבודה','stamp-label'),el('strong',date(modified),'stamp-time'),el('small','רוויזיה '+session.revision+' · נתונים מהמאגר המאומת'));
 head.append(intro,state);host.append(head);

 // Visual proof is part of the working status, not buried under technical tabs.
 if(published.length){
  const q=published[0];
  const gallery=el('section',undefined,'evidence-gallery');
  const heading=el('div',undefined,'evidence-gallery-heading');
  const desc=el('div');
  desc.append(el('h4','כך נראתה הרמה בצילומי Unity'),el('p','צילום היסטורי מ־'+date(q.generatedUtc)+' · '+(q.reviewStatus==='NOT_REVIEWED'?'טרם נבדק':'מצב סקירה: '+q.reviewStatus)+' · אינו צילום חי או אישור משחק.'));
  heading.append(desc);
  const all=el('button','לכל הצילומים והבדיקות','btn secondary');all.type='button';all.onclick=()=>navigate('qa');heading.append(all);
  gallery.append(heading);
  const imgs=el('div',undefined,'evidence-images');
  const frameSpecs=[['game_view','Game View · המראה במשחק'],['scene_overview','Scene · מבנה הרמה'],['spatial_schematic','Layer 0 · מסלולים ותכנון']];
  for(const [kind,title]of frameSpecs){
   const frame=(q.frames||[]).find(f=>f.frameId===kind&&safePath(f.path));
   if(!frame)continue;
   const anchor=el('a',undefined,'evidence-image');
   anchor.href=root+frame.path;anchor.target='_blank';anchor.rel='noopener';
   const img=el('img');img.src=root+frame.path;img.alt=title+' מתוך ריצת '+q.runId;img.loading='eager';img.decoding='async';
   anchor.append(img,el('strong',title));imgs.append(anchor);
  }
  gallery.append(imgs);
  gallery.append(el('p','מקור: '+q.runId+' · בדיקת תמונה בלבד. '+(isGrad11?'צ׳ק־אין 9493 מאוחר מהצילום הזה; תיקוני 24.10 אינם מוצגים כאן.':'גרסה זו נפרדת מצ׳ק־אין GRAD11 הראשית.'),'evidence-warning'));

  if(q.regionalViewsPath&&safePath(q.regionalViewsPath)){
   const regionMount=el('section',undefined,'region-viewer');
   regionMount.setAttribute('aria-label','מפת ארבעת אזורי הרמה עם תמונות מקור');
   regionMount.append(el('p','טוען צילומי אזורים מתוך Unity…','region-loading'));
   const oldQA=el('details',undefined,'qa-extra');
   oldQA.append(el('summary','צילומי QA הכלליים, מפת Layer 0 ו־Game View'));
   oldQA.append(gallery);
   host.append(regionMount,oldQA);
   fetch(root+q.regionalViewsPath,{cache:'no-store'}).then(response=>{
    if(!response.ok)throw Error('קובץ האזורים אינו זמין (HTTP '+response.status+')');
    return response.json();
   }).then(data=>{
    if(!regionMount.isConnected||!host.contains(regionMount))return;
    if(data.schema!=='LEVEL_QA_REGIONAL_VIEWS_V1'||data.runId!==q.runId||
       data.scenePath!==q.scenePath||data.source!=='unity_editor_camera_render'||
       data.regionViewType!=='independent_historical_camera_samples_not_runtime_or_manifest_frames'||
       !Array.isArray(data.frames)||data.frames.length!==4||
       ['A','B','C','D'].some(k=>data.frames.filter(f=>f.region===k).length!==1)){
      throw Error('נתוני האזורים אינם תואמים לריצה שנבחרה');
    }
    const fileFor=frame=>{
      const f=frame?.filename;
      if(!f||!/^0[1-4]_[A-Z0-9_]+\.png$/.test(f))return null;
      return root+q.regionalViewsPath.slice(0,q.regionalViewsPath.lastIndexOf('/')+1)+'regional_views/'+f;
    };
    regionMount.replaceChildren();
    const titles={
      A:'A · הכניסה הסלעית',
      B:'B · מפעל ומסועים',
      C:'C · מכרה הגבישים',
      D:'D · אולם הכור'
    };
    const issues=isGrad11?{
      A:'סלעים ומקבצי בלוקים קיימים, אבל הפתח עדיין אינו מתפקד כמנהרה רציפה.',
      B:'מבנה תעשייתי ומסועים קיימים. בולט פס תאורה צהוב ורצפת B_OUTER_FLOOR עדיין דורשת תיקון SpriteShape.',
      C:'נראים גבישים, מקטעי קרקע ומכשולים. הרציפות בין הנתיבים עוד לא הוכחה.',
      D:'רואים כור ומבנה האנגר. הכור עדיין דורש שילוב במבנה, ושינויי 24.10 מאוחרים מהצילום.'
    }:{
      A:'ב־V2 נראים בעיקר חלל פתוח, מכשולים ומקטעי סלע. תיעוד בלבד, לא אישור.',
      B:'ב־V2 נראים מסועים ומתקנים, אבל עדיין יש חללים גדולים ופס צהוב חריג.',
      C:'ב־V2 יש גבישים ומכשולים על רקע פתוח מאוד. נדרש חיבור חזותי.',
      D:'ב־V2 נראות טבעות כור גדולות ומקטעי מבנה נפרדים. טרם אומתה קומפוזיציה סופית.'
    };
    const head=el('div',undefined,'region-viewer-heading');
    const intro=el('div');
    intro.append(el('p','צילומי אזורים · Unity · מקור מתועד','region-eyebrow'));
    intro.append(el('h4','ארבעה אזורים, ארבע תמונות שונות'));
    intro.append(el('p','בחר אזור כדי להגדיל את התמונה ולראות מה קיים ומה לא עובד. צולם ב־21–22.10, לפני השינויים האחרונים, ולא ב־Play Mode.','region-caption'));
    head.append(intro);
    const altSelect=el('button',scene==='GRAD11'?'השוואה עם GRAD11_V2':'חזרה ל־GRAD11','btn secondary');
    altSelect.type='button';
    altSelect.onclick=()=>{
      const control=document.getElementById('scene-select');
      if(control){
        control.value=scene==='GRAD11'?'GRAD11_V2':'GRAD11';
        control.dispatchEvent(new Event('change',{bubbles:true}));
      }
    };
    head.append(altSelect);
    const cards=el('div',undefined,'region-thumbnails');
    cards.setAttribute('role','tablist');cards.setAttribute('aria-label','ארבעת אזורי הרמה');
    const buttons=[];
    const stage=el('div',undefined,'region-stage');
    const photo=el('a',undefined,'region-full-link');photo.target='_blank';photo.rel='noopener';photo.setAttribute('aria-label','פתיחת צילום האזור בגודל מלא');
    const mainImg=el('img');mainImg.alt='צילום אזור מהסצנה';mainImg.loading='eager';mainImg.decoding='async';photo.append(mainImg);
    const detail=el('div',undefined,'region-detail');
    stage.append(photo,detail);
    const choose=code=>{
      const f=data.frames.find(x=>x.region===code);
      const imgUrl=fileFor(f);
      if(!imgUrl)return;
      photo.href=imgUrl;mainImg.src=imgUrl;mainImg.alt=titles[code]+' בצילום Unity היסטורי של '+scene;
      detail.replaceChildren(el('strong',titles[code]));
      const kms=el('p',f.plannedKmStart+'–'+f.plannedKmEnd+' ק״מ בתכנון','region-km');detail.append(kms);
      detail.append(el('p',issues[code],'region-findings'));
      const captured=el('p','צולם: '+date(f.capturedUtc)+' · מצלמה X='+f.cameraWorldX+' · ביקורת: '+(q.reviewStatus==='NOT_REVIEWED'?'טרם נבדק':q.reviewStatus),'region-provenance');
      detail.append(captured);
      const warn=el('p',isGrad11?'תיקוני צ׳ק־אין 9493 מאוחרים לצילום הזה.':'זוהי V2, ולא הסצנה שהשתנתה ב־cs9493.','region-provenance');
      detail.append(warn);
      buttons.forEach(button=>{
        const active=button.dataset.region===code;
        button.setAttribute('aria-selected',String(active));
        button.tabIndex=active?0:-1;
      });
      const page=new URL(location.href);
      page.searchParams.set('region',code);
      history.replaceState({},'',page);
    };
    const codes=['A','B','C','D'];
    for(let i=0;i<codes.length;i++){
      const key=codes[i],f=data.frames.find(x=>x.region===key);
      const button=el('button',undefined,'region-thumb');
      button.type='button';button.dataset.region=key;button.setAttribute('role','tab');
      button.setAttribute('aria-label',titles[key]);
      const image=el('img');image.src=fileFor(f)||'';image.alt='צילום '+titles[key];image.loading='eager';image.decoding='async';
      button.append(image,el('strong',titles[key]),el('small',f.plannedKmStart+'–'+f.plannedKmEnd+' ק״מ'));
      button.onclick=()=>choose(key);
      button.onkeydown=e=>{
        const dir=e.key==='ArrowLeft'?1:e.key==='ArrowRight'?-1:0;
        if(!dir)return;
        e.preventDefault();
        const next=(i+dir+codes.length)%codes.length;buttons[next].focus();choose(codes[next]);
      };
      buttons.push(button);cards.append(button);
    }
    regionMount.append(head,cards,stage);
    const selected=new URLSearchParams(location.search).get('region');
    choose(codes.includes(selected)?selected:'A');
   }).catch(error=>{
    if(!regionMount.isConnected||!host.contains(regionMount))return;
    regionMount.replaceChildren(el('p','תמונות האזורים לא נטענו: '+error.message+' · צילומי QA הכלליים זמינים להלן.','region-loading'));
    oldQA.open=true;
   });
  }else host.append(gallery);
 }else{
  const missing=el('div',undefined,'evidence-missing');
  missing.append(el('strong','אין צילום רמה מפורסם לסצנה שנבחרה'),el('p','יש נתוני תכנון או דוחות, אבל אין תמונה שאפשר להציג כראיה. לחץ על בדיקות וצילומים לפרטים.'));host.append(missing);
 }
 const short=el('div',undefined,'reality-facts');
 const count=recipe?.segments?.length??session.storyboard?.length??null;
 createFact(short,recipe?'verified':'neutral',recipe?'Layer 0: מתכון קיים':'Layer 0: אין מתכון נגיש',recipe?'תכנון של '+count+' אזורים. אינו צילום Game View.':'בדוק את קובצי המקור בתיק.');
 if(isGrad11){
  createFact(short,'verified','Unity: שמור ב־MAIN, cs:9493','הופעל Play Mode לבדיקה ראשונית; לא בדיקת משחק מלאה.');
  createFact(short,'pending','גלים: 0','WavesManager קיים, אך stages ריק.');
 }else if(isV2){
  createFact(short,'neutral','V2: מתכון ובדיקת עבר','אין הוכחה שצ׳ק־אין 9493 שינה את הסצנה הזו.');
  createFact(short,'pending','גלים: לא אומתו','לא נמצאו גלים פומביים לריצה זו.');
 }else{
  createFact(short,run?'verified':'neutral',run?'ריצת QA מתועדת':'ריצת QA לא נמצאה',run?'צילום '+(run.captureStatus||'UNKNOWN')+', סקירה '+(run.reviewStatus||'לא ידוע'):'אין תיעוד בדיקה בתיק.');
  createFact(short,published.length?'verified':'pending',published.length?'נתונים מפורסמים ב־QA':'אין QA פומבי תואם',published.length+' ריצות זמינות באתר QA.');
 }
 createFact(short,published.length?'verified':'pending',published.length?'צילומים פומביים: קיימים':'צילומים פומביים: חסרים',published.length?'פתח את לשונית QA כדי לראות אותם.':'ייתכנו צילומים מקומיים, אך אין להציג אותם כאילו פורסמו.');
 host.append(short);
 const steps=el('div',undefined,'work-phases');steps.append(el('h4','שלבי העבודה ומה באמת אומת'));
 const phases=isGrad11?[
 ['01','מבנה / Layer 0','נבנה, דורש תיקוני גאומטריה','active'],
 ['02','משחק בסיסי','Play Mode קצר עבר; מגדלים לא נבדקו','partial'],
 ['03','גלים ומסלולים','טרם נבנו לרמה 11','waiting'],
 ['04','QA ואישור',published.length?'צילום היסטורי פורסם לבדיקה, טרם אושר':'צילום מקומי בלבד, טרם אושר','waiting']
 ]:isV2?[
 ['01','מתכון / Layer 0',recipe?'קיים במאגר':'לא נמצא','partial'],
 ['02','סצנה ב־Unity','יש ריצה מתועדת; תוצאתה לא נבדקה','partial'],
 ['03','גלים','אין פרסום מאומת','waiting'],
 ['04','QA סופי','לא אושר','waiting']
 ]:[
 ['01','תכנון ומתכון',recipe?'קיים':'תיעוד חלקי',recipe?'partial':'waiting'],
 ['02','סצנה','מצב אחרון: '+(run?.captureStatus||'לא ידוע'),'partial'],
 ['03','גלים',published.some(r=>r.timelinePath)?'נתוני מסלולים מפורסמים':'לא פורסם Timeline',published.some(r=>r.timelinePath)?'partial':'waiting'],
 ['04','QA סופי',run?.reviewStatus==='PASS'?'סקירה עברה':'אישור סופי לא תועד','waiting']
 ];
 const phaseList=el('div',undefined,'phase-list');for(const [number,label,description,stateClass]of phases){
  const item=el('div',undefined,'phase-item phase-'+stateClass);item.append(el('span',number,'phase-index'));
  const content=el('div');content.append(el('strong',label),el('p',description));item.append(content);phaseList.append(item);
 }steps.append(phaseList);host.append(steps);
 const next=el('section',undefined,'next-work');
 next.append(el('h4','מה עושים עכשיו?'));
 const tasks=work?.tasks||(
  isV2?[{title:'לבדוק בנפרד את GRAD11_V2',detail:'לפתוח את הסצנה ב־Unity ולהשוות למתכון ולצילום המקורי.',acceptance:'לשמור דוח QA המתייחס במפורש ל־V2.'},{title:'לברר אם V2 היא הרמה שנמשיך לפתח',detail:'אין להעביר אליה אוטומטית תיקוני GRAD11 או להחליף אותה במקומה.',acceptance:'הבחירה תתועד בתיק לפני בנייה.'}]:
  [{title:'להמשיך מן הפעולה הבאה בתיק',detail:session.nextAction||'לא צוינה פעולה הבאה.',acceptance:'לתעד בדיקה אמיתית ולעדכן רוויזיה.'}]
 );
 const taskList=el('ol',undefined,'action-list');
 for(const task of tasks){const li=el('li');const h=el('strong',task.title);li.append(h,el('p',task.detail||''));if(task.acceptance){const a=el('p',undefined,'acceptance');a.append(el('b','איך יודעים שהצליח: '),document.createTextNode(task.acceptance));li.append(a);}taskList.append(li);}
 next.append(taskList);host.append(next);
 const guide=el('div',undefined,'view-guide');guide.append(el('h4','מה רואים כאן, ומה לא?'));
 const where=el('div',undefined,'guide-cols');const yes=el('div'),no=el('div');
 yes.append(el('strong','מוצג כאן'),el('p','מתכון הרמה, תיעוד מצבי העבודה, תוצאות שנשמרו במאגר ונתוני QA שפורסמו.'));
 no.append(el('strong','לא מוצג בזמן אמת'),el('p','מסך Unity החי, תמונות שנותרו רק במחשב, ותוצאות Play Mode שלא צולמו ופורסמו.'));
 where.append(yes,no);guide.append(where);
 const evidenceActions=el('div',undefined,'progress-actions');
 for(const [label,key]of[['מפת Layer 0','layer0'],['גלים ומסלולים','waves'],['בדיקות וצילומים','qa'],['קבצי עבודה','files']]){const b=el('button',label,'btn secondary');b.type='button';b.onclick=()=>navigate(key);evidenceActions.append(b);}
 guide.append(evidenceActions);
 if(isGrad11){const note=el('p',undefined,'local-note');note.append(el('strong','קיים צילום Play Mode חדש יותר. '),document.createTextNode('הצילום מ־24.10 עדיין מקומי. התמונות באתר הן מ־22.10, לפני צ׳ק־אין 9493, ומסומנות לבדיקה בלבד.'));guide.append(note);}
 host.append(guide);
 const handoff=el('section',undefined,'agent-handoff');const left=el('div');
 left.append(el('h4','סוכן חדש? ממשיכים מאותה נקודה'),el('p','הכפתור מעתיק את מזהה התיק, מצב העבודה המאומת, מקורות המידע והמשימות הבאות. אין צורך להסביר מחדש מה בנינו.'));
 const b=el('button','העתקת הוראות ההמשך לסוכן','btn primary');b.type='button';
 const output=el('p','','copy-feedback');output.setAttribute('aria-live','polite');
 const prompt=buildAgentPrompt({session,scene,root,hasRecipe:!!recipe,run,work,qaPresent:published.length>0});
 const box=el('textarea',undefined,'handoff-text');box.value=prompt;box.readOnly=true;box.rows=8;box.hidden=true;box.setAttribute('aria-label','הוראות ההמשך להעתקה ידנית');
 b.onclick=async()=>{try{if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');await navigator.clipboard.writeText(prompt);output.textContent='ההוראות הועתקו. אפשר להדביק אותן בשיחה עם הסוכן.';}catch(e){box.hidden=false;box.focus();box.select();output.textContent='הדפדפן חסם העתקה אוטומטית. ההוראות מוצגות כאן לבחירה ולהעתקה ידנית.';}};
 const technical=el('details',undefined,'technical-link');technical.append(el('summary','לסוכנים ומפתחים: מקורות ויומן טכני'));
 const l=el('div',undefined,'tech-links');const dossier=safePath('workbench/projects/'+session.id+'/session.json')?root+'workbench/projects/'+session.id+'/session.json':null;
 if(dossier){const a=link(l,'יומן הפרויקט (JSON) ↗',dossier);a.target='_blank';a.rel='noopener';}
 const a=link(l,'פרוטוקול הסוכנים ↗',root+'workbench/AGENT_PROTOCOL.md');a.target='_blank';a.rel='noopener';
 const tr=link(l,'כל רישומי ה־Workbench ↗','workbench.html?kind=level&technical=1&id='+encodeURIComponent(session.id));tr.target='_blank';tr.rel='noopener';
 technical.append(l);
 handoff.append(left,b,output,box,technical);host.append(handoff);
}
window.LevelProgress={render};
})();