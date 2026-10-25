(function(){'use strict';
const REPO='https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/';
const SITE='https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/';
const stages=['BRIEF','STORYBOARD','ASSETS','TARGET_REVIEW','AUTHORING','UNITY_BUILD','QA','COMPLETE'];
const labels={BRIEF:'הגדרת הרעיון',STORYBOARD:'תכנון השוטים',ASSETS:'בחירת נכסים',TARGET_REVIEW:'סקירת היעד',AUTHORING:'הכנת הסרט',UNITY_BUILD:'בנייה ב־Unity',QA:'בדיקות וצילום',COMPLETE:'סרט גמור'};
const $=id=>document.getElementById(id);
const qs=new URLSearchParams(location.search);
let index=null,session=null,base=null,request=0;
const el=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n};
const set=(id,txt)=>{$(id).textContent=txt};
const status=(txt,bad=false)=>{set('notice',txt);$('notice').className=bad?'notice error':'notice'};
const previewUrl=s=>{
 const a=(s.targetArtifacts||[]).filter(x=>x&&x.kind==='preview'&&x.url).slice(-1)[0];
 if(a&&/^https:\/\/streamdragon\.github\.io\/STARWARS_DELTA_STORYBOARDS\/films\/[a-z0-9-]+\.html$/i.test(a.url))return a.url;
 return s.id==='fleet30-camera'?SITE+'films/fleet-v7-continuity.html':null;
};
const sitePath=url=>{try{const u=new URL(url,location.href);return u.origin===location.origin?u.href:u.origin===new URL(SITE).origin?u.href:null}catch{return null}};
const repoLink=path=>typeof path==='string'&&/^[a-zA-Z0-9_./-]+$/.test(path)&&!path.includes('..')?'https://github.com/streamDragon/STARWARS_DELTA_STORYBOARDS/blob/main/'+path:null;
function emptyFrame(message){$('film-preview').removeAttribute('src');$('film-preview').srcdoc='<html lang="he" dir="rtl"><body style="background:#06111c;color:#d9ebf3;display:grid;place-items:center;height:100%;font:20px system-ui;text-align:center"><p>'+message+'</p></body></html>'}
async function headBase(){
 const local=['localhost','127.0.0.1'].includes(location.hostname);
 if(local)return new URL('.',location.href).href;
 const u='https://api.github.com/repos/streamDragon/STARWARS_DELTA_STORYBOARDS/git/ref/heads/main?nocache='+Date.now();
 const r=await fetch(u,{cache:'no-store'});
 if(!r.ok)throw Error('GitHub API '+r.status);
 const j=await r.json();
 if(j.ref!=='refs/heads/main'||j.object?.type!=='commit'||!/^[0-9a-f]{40}$/.test(j.object?.sha||''))throw Error('HEAD אינו תקין');
 return REPO+j.object.sha+'/';
}
async function json(path,from){if(!/^[a-zA-Z0-9_./-]+$/.test(path)||path.includes('..'))throw Error('נתיב קובץ לא תקין');const url=new URL(path,from);url.searchParams.set('_',Date.now());const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('קריאת '+path+' נכשלה: '+r.status);return r.json()}
function actionText(s){
 const pending=s.inFlightAction;
 if(pending&&['UNKNOWN','SUBMITTED','QUEUED','RUNNING','SCHEDULED'].includes(String(pending.status||'').toUpperCase())){
  const identity=pending.requestId||pending.id||pending.resultPath||'ללא מזהה מתועד';
  return {title:'לבדוק את הפעולה שכבר נשלחה ל־Unity',description:'בקשה קיימת: '+identity+'. יש לבדוק את התוצאה והיומן של אותה בקשה. אין לשלוח בנייה או יבוא נוספים לפני בירור התוצאה.'};
 }
 if(typeof s.nextAction==='string'&&s.nextAction.trim())return {title:'המשך העבודה לפי תיק הסרט',description:s.nextAction.trim()};
 const byStage={
  BRIEF:['להשלים את רעיון הסרט','להגדיר מה קורה, מי הדמויות ומה התוצאה שהצופה אמור להבין.'],
  STORYBOARD:['להשלים את תכנון השוטים','לתעד כל שוט, את הזמנים ואת מעבר המצלמה.'],
  ASSETS:['לחבר את הנכסים האמיתיים','לבדוק מה זמין בקטלוג ומה חסר.'],
  TARGET_REVIEW:['לבדוק את תמונת היעד','להשוות בין התכנון לחומרי האמנות לפני הבנייה.'],
  AUTHORING:['להכין תסריט V1 לבנייה','לאמת תזמונים ונכסים לפני יבוא לסטודיו.'],
  UNITY_BUILD:['לבנות ולצלם ב־Unity','לייבא לסטודיו, לבדוק קומפילציה ולהפיק ראיות מצולמות.'],
  QA:['לבדוק את התוצאה המצולמת','לבחור ריצה מדויקת ולהשוות את הצילום לתכנון.'],
  COMPLETE:['להציג את התוצר המאושר','סיום מחייב אישור מפורש ותיעוד.']
 };
 const a=byStage[s.stage]||['לברר את השלב הנוכחי','הפרטים זמינים בחלק הטכני למטה.'];return {title:a[0],description:a[1]}
}
function runStatus(run,key){
 if(!run)return 'NOT_RUN';
 return run[key]??run[({capture:'captureStatus',technical:'technicalVisualQa',cinematic:'cinematicQa',runtime:'runtimeQa'})[key]]??'NOT_RUN';
}
function readinessItems(s){
 const runs=Array.isArray(s.runs)?s.runs:[];
 const capture=runs.some(r=>['CAPTURED','COMPLETED'].includes(runStatus(r,'capture'))&&(r.artifacts||[]).some(a=>a.kind==='capture'&&a.evidenceStatus==='CAPTURED'&&a.runId===(r.id||r.runId)&&a.runId&&(a.path||a.url)));
 const build=runs.some(r=>['PASS','COMPLETED'].includes(r.build||r.buildStatus));
 const preview=!!previewUrl(s);
 return [
  {title:'תכנון השוטים',detail:(s.storyboard||[]).length+' שוטים מתועדים',done:(s.storyboard||[]).length>0},
  {title:'תצוגת הכנה',detail:preview?'זמינה · אינה צילום Unity':'טרם צורפה',done:preview},
  {title:'סרט בנוי ב־Unity',detail:build?'בנייה מוצלחת תועדה בריצה':'בנייה מוצלחת לא תועדה בריצה',done:build},
  {title:'צילום מתוך Unity',detail:capture?'צורפה ראיה מצולמת':'אין עדיין ראיה מצולמת של הריצה',done:capture}
 ];
}
function renderReadiness(s){
 const host=$('readiness');host.replaceChildren();
 for(const item of readinessItems(s)){
  const row=el('div',undefined,'milestone'),icon=el('span',item.done?'✓':'○','m-icon '+(item.done?'done':'wait')),body=el('div');
  body.append(el('strong',item.title),el('small',item.detail));row.append(icon,body);host.append(row);
 }
}
function statusHebrew(v){
 const m={NOT_RUN:'לא בוצע',NOT_TESTED:'לא נבדק',NOT_ACCEPTED:'לא אושר',SCHEMA_PENDING:'תסריט טרם אומת',NOT_RECHECKED:'לא נבדק מחדש',PENDING:'ממתין',PASS:'עבר',PASS_CLEAN:'עבר',STRICT_PASS_CLEAN:'עבר',CAPTURED:'צולם',COMPLETED:'הושלם',FAILED:'נכשל',FAIL:'נכשל',ERROR:'שגיאה',WARNINGS:'עם הערות'};
 return m[v]||((v||'').includes('PENDING')?'ממתין לבדיקה':'טרם אומת');
}
function renderQA(s){
 const runs=Array.isArray(s.runs)?s.runs:[],run=runs[runs.length-1];
 const fields=[['צילום מתוך Unity','capture'],['תקינות טכנית','technical'],['איכות קולנועית','cinematic'],['התנהגות בהרצה','runtime']];
 const host=$('qa-cards');host.replaceChildren();
 for(const [title,key] of fields){const card=el('div',undefined,'qa-card'),strong=el('strong',title),val=runStatus(run,key),v=el('span',statusHebrew(val));if(['PASS','PASS_CLEAN','STRICT_PASS_CLEAN','CAPTURED','COMPLETED'].includes(val))v.style.color='#9df4dc';card.append(strong,v);host.append(card)}
 const note=run?.id?'ריצה אחרונה שתועדה: '+run.id+'. ':'';
 document.querySelector('.qa-warning').textContent=note+'תצוגת דפדפן אינה צילום מתוך Unity. PASS ייחשב ראיה רק אם מצורפים קבצי צילום של אותה ריצה.';
}
function renderShots(s){
 const host=$('shot-list');host.replaceChildren();const shots=Array.isArray(s.storyboard)?s.storyboard:[];
 if(!shots.length){host.append(el('p','טרם הוכנו שוטים לסרט הזה.','loading-card'));return}
 shots.forEach((sh,i)=>{
  const card=el('a',undefined,'shot');card.href='storyboard.html?session='+encodeURIComponent(s.id)+'#shot-'+encodeURIComponent(sh.id||i);
  const imageNames=['shot_01.jpg','shot_02.jpg','shot_04.jpg','shot_05.jpg','shot_06.jpg','reaction_shocked.jpg','shot_07.jpg','shot_08.jpg'];
  if(s.id==='fleet30-camera'&&i<imageNames.length){const im=el('img');im.className='shot-thumb';im.alt='תכנון שוט '+(i+1)+' · לא צילום Unity';im.loading='lazy';im.src='films/assets/fleet-v7/'+imageNames[i];im.addEventListener('error',()=>{im.replaceWith(el('span','תמונת התכנון לא זמינה','image-error'))});card.append(im)}
  card.append(el('span','שוט '+String(i+1).padStart(2,'0'),'shot-num'));
  const time=Number.isFinite(sh.startSeconds)&&Number.isFinite(sh.endSeconds)?sh.startSeconds+'–'+sh.endSeconds+' שניות':'ללא זמן';
  card.append(el('span',time,'time'),el('strong',sh.label||sh.title||sh.id||'שוט'));
  const summary=sh.description||sh.summary||'עדיין אין תיאור חזותי.';
  card.append(el('span',summary.length>180?summary.slice(0,177)+'…':summary,'summary'));
  card.append(el('span','לפתיחת פרטי השוט ↗','action'));host.append(card);
 })
}
function renderSources(s){
 const host=$('sources');host.replaceChildren();
 const sources=[...(s.sourceArtifacts||[]),...(s.targetArtifacts||[])];
 const seen=new Set();
 for(const a of sources){
  const key=a.path||a.url;if(!key||seen.has(key))continue;seen.add(key);
  const box=el('div',undefined,'tech-item'),href=a.url?sitePath(a.url):repoLink(a.path);
  const name=a.label||a.path||a.url||'קובץ';
  if(href){const link=el('a',name);link.href=href;link.target='_blank';link.rel='noopener';box.append(link)}else box.append(el('strong',name));
  box.append(el('p',a.evidenceStatus||'מצב לא תועד'));host.append(box)
 }
 if(!seen.size)host.append(el('p','טרם צורפו קבצים.'))
 const gaps=$('gaps');gaps.replaceChildren();const open=(s.gaps||[]).filter(g=>!['CLOSED','FIXED','RESOLVED','COMPLETE'].includes(String(g.status||'').toUpperCase()));
 open.slice(-7).forEach(g=>{const box=el('div',undefined,'tech-item');box.append(el('strong',g.request||g.title||'פער פתוח'));box.append(el('p',g.replacementAction||g.note||'דורש טיפול'));gaps.append(box)});
 if(!open.length)gaps.append(el('p','אין פערים מתועדים.'))
 set('technical-state','תיק '+s.id+' · גרסה '+s.revision+' · '+s.stage+' · '+(s.status||'לא ידוע')+' · '+(s.runs||[]).length+' ריצות מתועדות');
 set('agent-instructions',JSON.stringify({sessionPath:index?.projects.find(p=>p.id===s.id)?.sessionPath,currentSourcePath:s.currentSourcePath,lastCompletedAction:s.lastCompletedAction,nextAction:s.nextAction,inFlightAction:s.inFlightAction},null,2))
}
function buildCopyText(s){
 const next=actionText(s);
 return ['המשך עבודה על סרט STARWARS_DELTA מתוך תיק העבודה המעודכן.','מאגר: streamDragon/STARWARS_DELTA_STORYBOARDS, branch main','קרא workbench/AGENT_PROTOCOL.md ו־workbench/index.json.','תיק: '+s.id+' · גרסה '+s.revision+' · שלב '+s.stage,'קרא את '+(index?.projects.find(p=>p.id===s.id)?.sessionPath||'תיק הפרויקט'),'המשימה הבאה: '+next.title,next.description,'קרא את lastCompletedAction, nextAction, runs, gaps ו־inFlightAction לפני כל פעולה.','אל תדרוס עבודה מקומית או סצנה פתוחה. השתמש רק ב־CUTSCENE_SCRIPT_V1, CURRENT, ובנה/צלם ב־Unity.','אין להציג אנימטיק בדפדפן כהוכחת צילום Unity.'].join('\n')
}
async function copyText(t){
 try{await navigator.clipboard.writeText(t);status('הוראות ההמשך הועתקו לסוכן.')}catch{
  const box=el('textarea');box.value=t;box.rows=8;box.style.width='100%';const note=$('notice');note.replaceChildren(el('span','העתקה אוטומטית לא זמינה. אפשר להעתיק מהתיבה: '),box);box.select()
 }
}

function renderNativeReview(s){
 const pending=$('pending-native');
 const action=s.inFlightAction;
 const outstanding=action&&['QUEUED','SUBMITTED','RUNNING','UNKNOWN','SCHEDULED'].includes(String(action.status||'').toUpperCase());
 if(outstanding){
   pending.hidden=false;
   pending.textContent='פעולת Unity קיימת ממתינה לבדיקה: '+(action.requestId||action.id||'ללא מזהה')+'. יש לבדוק את התוצאה המקורית לפני הפעלת בנייה נוספת.';
 }else pending.hidden=true;
 const panel=$('native-review'),host=$('native-review-images');
 host.replaceChildren();
 const runs=Array.isArray(s.runs)?s.runs:[];
 const captureRuns=runs.filter(r=>['COMPLETED','CAPTURED'].includes(String(runStatus(r,'capture')).toUpperCase())&&(r.artifacts||[]).some(a=>a.kind==='capture'&&a.runId===r.id&&a.path));
 const run=captureRuns[captureRuns.length-1];
 if(!run){panel.hidden=true;return;}
 const captures=(run.artifacts||[]).filter(a=>a.kind==='capture'&&a.runId===run.id&&typeof a.path==='string'&&a.path.startsWith('film-qa/')&&!a.path.includes('..'));
 if(!captures.length){panel.hidden=true;return}
 const sorted=captures.slice().sort((a,b)=>(Number(a.timeSeconds)||0)-(Number(b.timeSeconds)||0));
 function nearest(seconds,exclude){
   return sorted.reduce((best,cur)=>{
      if(exclude&&cur.path===exclude.path)return best;
      if(!best)return cur;
      return Math.abs((cur.timeSeconds||0)-seconds)<Math.abs((best.timeSeconds||0)-seconds)?cur:best;
   },null);
 }
 const first=nearest(10),second=nearest(14,first);
 const images=[];
 if(first)images.push({path:first.path,label:'צילום Unity · t='+Number(first.timeSeconds).toFixed(2)+'s',description:'צילום אמיתי של הריצה '+run.id,kind:'native'});
 if(second)images.push({path:second.path,label:'צילום Unity · t='+Number(second.timeSeconds).toFixed(2)+'s',description:'אותה ריצה, זמן שונה',kind:'native'});
 if(s.id==='fleet30-camera')images.push({path:'films/fleet-stills-v7/02-YAM_02_GUN_FOLLOW.png',label:'תמונת יעד · אנימטיק V7',description:'תכנון בלבד. לא פריים מ־Unity',kind:'plan'});
 for(const item of images){
   const fig=el('figure',undefined,'native-evidence'),link=el('a');
   link.href=item.path;link.target='_blank';link.rel='noopener';
   const image=el('img');image.src=item.path;image.alt=item.label;image.loading='lazy';
   link.append(image);
   const cap=el('figcaption');cap.append(el('strong',item.label),el('span',item.description));
   fig.append(link,cap);host.append(fig);
 }
 const report=(run.artifacts||[]).find(a=>a.kind==='report'&&typeof a.path==='string'&&a.path.startsWith('film-qa/')&&a.path.endsWith('/report.json')&&!a.path.includes('..'));
 const reportLink=$('native-review-report');reportLink.hidden=!report;if(report)reportLink.href=report.path;
 $('native-review-text').textContent='צילומי מקור מ־Unity מאותה ריצה: '+run.id+'. תמונת האנימטיק היא ייחוס חזותי בלבד.';
 const failed=['FAILED','FAIL','NOT_ACCEPTED'].includes(String(run.cinematic||'').toUpperCase());
 $('native-review-verdict').textContent=failed?'הריצה הזו לא אושרה':'הריצה הזו דורשת סקירה';
 const findings=run.review?.findings;
 $('native-review-findings').textContent=Array.isArray(findings)&&findings.length?findings.join(' • '):'עדיין נדרשת השוואה חזותית לתכנון לפני אישור.';
 panel.hidden=false;
}

function render(s){
 session=s;set('film-title',s.title||s.id);set('film-type',(s.id==='fleet30-camera'?'FLEET · 30 שניות':'סרט · תיק עבודה')+' · '+(s.storyboard||[]).length+' שוטים');
 const a=actionText(s);set('current-stage',labels[s.stage]||s.stage);set('stage-explanation',s.id==='fleet30-camera'?'תכנון ואנימטיק קיימים. הסרט עצמו עדיין דורש בנייה, צילום ובדיקות ב־Unity.':'שלב העבודה הנוכחי: '+(labels[s.stage]||s.stage)+'. המצב נקבע לפי היומן, לא לפי הדמיה.');
 set('film-subtitle',s.id==='fleet30-camera'?'V7 זמין לצפייה · צילום Unity עדיין לא הושלם.':'מצב הסרט לפי תיק העבודה המעודכן.');
 set('phase-pill',(labels[s.stage]||s.stage)+' · '+(stages.includes(s.stage)?(stages.indexOf(s.stage)+1)+'/8':''));
 const date=new Date(s.updatedUtc);set('last-updated','גרסה '+s.revision+(Number.isFinite(date.getTime())?' · עודכן '+date.toLocaleString('he-IL',{timeZone:'Asia/Jerusalem',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''));
 set('next-title',a.title);set('next-description',a.description);
 $('copy-next').onclick=()=>copyText(buildCopyText(s));
 const pv=previewUrl(s),preview=$('film-preview'),link=$('open-preview');
 if(pv){preview.removeAttribute('srcdoc');preview.src=pv+(pv.includes('?')?'&':'?')+'embed=1';link.href=pv;link.hidden=false;set('preview-state','תצוגת הכנה · לא צילום Unity')}
 else{emptyFrame('עדיין לא נוצר אנימטיק לצפייה בסרט הזה.');link.hidden=true;set('preview-state','אין תצוגה מצולמת זמינה')}
 const sb='storyboard.html?session='+encodeURIComponent(s.id);$('storyboard-link').href=sb;$('full-storyboard').href=sb;
 renderReadiness(s);renderShots(s);renderQA(s);renderNativeReview(s);renderSources(s);
 const select=$('project-select');select.value=s.id;
 const url=new URL(location.href);url.searchParams.set('id',s.id);history.replaceState(null,'',url);
 status('נתוני התיק נטענו בהצלחה · גרסה '+s.revision+' · מקור: '+(base?.includes('raw.githubusercontent')?'GitHub MAIN':'האתר'));
}
async function loadProject(id,version=++request){
 const p=index?.projects.find(p=>p.id===id&&p.kind==='film');if(!p){status('תיק הסרט לא נמצא באינדקס.',true);return}
 status('קורא את תיק '+(p.title||p.id)+'…');
 try{const s=await json(p.sessionPath,base);if(version!==request)return;if(s.id!==p.id||s.kind!=='film'||s.revision!==p.revision)throw Error('גרסת האינדקס אינה תואמת לתיק');render(s)}
 catch(e){if(version!==request)return;status('שגיאה בקריאת התיק: '+e.message+'. נסה לרענן.',true);set('stage-explanation','התיק לא נטען. אין להסיק שהסרט הושלם.')}
}
async function reload(){
 const version=++request;status('מאמת את גרסת MAIN וקורא את רשימת הסרטים…');
 try{
  let fallback=false;
  try{base=await headBase();index=await json('workbench/index.json',base)}
  catch(e){fallback=true;base=new URL('.',location.href).href;index=await json('workbench/index.json',base)}
  if(version!==request)return;
  if(index.schema!=='STARWARS_DELTA_AUTHORING_WORKBENCH'||!Array.isArray(index.projects))throw Error('אינדקס לא תקין');
  const films=index.projects.filter(p=>p.kind==='film').sort((a,b)=>(b.id==='fleet30-camera')-(a.id==='fleet30-camera')||new Date(b.updatedUtc||0)-new Date(a.updatedUtc||0));const select=$('project-select');select.replaceChildren();
  films.forEach(p=>{const opt=el('option',p.title||p.id);opt.value=p.id;select.append(opt)});
  select.onchange=()=>loadProject(select.value);
  const requested=qs.get('id');const id=films.some(p=>p.id===requested)?requested:(index.activeByKind?.film||films[0]?.id);
  if(!id)throw Error('אין תיקי סרטים במאגר');
  if(fallback)status('לא הצלחתי לאמת HEAD דרך GitHub; מציג את הגרסה האחרונה הזמינה באתר.');
  await loadProject(id,version)
 }catch(e){if(version!==request)return;status('לא ניתן לטעון את מרכז הסרטים: '+e.message,true)}
}
// The film animatic has a fixed 960x540 authoring viewport. Scale the entire
// document at small widths rather than clipping its artwork and controls.
function resizePlayer(){const frame=$('film-preview');if(frame){frame.style.transform='none';frame.style.transformOrigin='center';}}
if(typeof ResizeObserver==='function')new ResizeObserver(resizePlayer).observe(document.querySelector('.screen'));
else window.addEventListener('resize',resizePlayer);
$('refresh').onclick=reload;
resizePlayer();
reload();
})();
