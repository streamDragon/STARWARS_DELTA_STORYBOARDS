(function(){'use strict';
const c=window.AuthoringWorkbench,p=window.AuthoringPresentation,$=id=>document.getElementById(id);let index=null,session=null,lane=new URLSearchParams(location.search).get('kind')==='level'?'level':'film',generation=0,indexBase=null;
const pageUrl = new URL(location.href);
const projectPicker=$('project-picker');if(projectPicker&&window.matchMedia?.('(max-width:700px)').matches)projectPicker.open=false;
const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(pageUrl.hostname);
const dataBase = loopback ? new URL('.', pageUrl).href : c.BASE;
let freshness=0;
const freshEpoch=()=>Date.now().toString(36)+'-'+(++freshness)+'-'+Math.random().toString(36).slice(2);
const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
function notice(text,error=false){$('notice').textContent=text;$('notice').className=error?'error':'';}
async function resolveBase(epoch){if(loopback)return dataBase;const url=new URL('https://api.github.com/repos/streamDragon/STARWARS_DELTA_STORYBOARDS/git/ref/heads/main');url.searchParams.set('_fresh',epoch);const response=await fetch(url.href,{cache:'no-store'});if(!response.ok)throw Error(`לא ניתן לאמת HEAD עדכני ב־GitHub (${response.status}; ייתכן שחרגנו ממגבלת הבקשות)`);const ref=await response.json();if(ref.ref!=='refs/heads/main'||ref.object?.type!=='commit'||!/^[0-9a-f]{40}$/.test(ref.object?.sha||''))throw Error('GitHub HEAD אינו מצביע על commit תקין');return c.BASE.replace('/main/','/'+ref.object.sha+'/');}
async function get(p,epoch,base){c.repoPath(p);const url=new URL(p,base);url.searchParams.set('_fresh',epoch);const response=await fetch(url.href,{cache:'no-store'});if(!response.ok)throw Error(`לא ניתן לקרוא ${p} (${response.status})`);return response.json();}
async function copy(text){try{await navigator.clipboard.writeText(text);notice('הועתק ללוח.');}catch{notice('ההעתקה לא זמינה. ניתן להוריד את קובץ ההוראות או להעתיק מהתיבה.',true);const box=node('textarea');box.value=text;box.rows=8;box.style.width='100%';$('notice').append(box);box.select();}}
function section(title,parent=$('project')){const el=node('section');el.append(node('h2',title));parent.append(el);return el;}
function record(parent,value){
 const el=node('div',undefined,'record');
 if(typeof value==='string')el.append(node('p',value));
 else if(value&&typeof value==='object'){
  const title=value.label||value.title||value.displayName||value.request||value.name||value.shotId||value.id; if(title)el.append(node('h3',String(title)));
  if(value.status)el.append(node('span',p.statusLabel(value.status),'badge'));
  if(Number.isFinite(value.startSeconds)&&Number.isFinite(value.endSeconds))el.append(node('p',value.startSeconds+'–'+value.endSeconds+' שניות','muted'));
  if(value.camera&&typeof value.camera==='object'){const frame=({extreme_wide:'רחב מאוד',wide:'רחב',medium:'בינוני',close:'תקריב',detail:'תקריב של פרט'})[value.camera.framing],move=({hold:'מצלמה קבועה',cut:'חיתוך חד',follow:'מעקב',track:'מעקב',push:'התקרבות',pull:'התרחקות',zoom_in:'זום פנימה',zoom_out:'זום החוצה',zoom_in_out:'זום פנימה וחזרה'})[value.camera.movement];el.append(node('p','מצלמה: '+[frame,move].filter(Boolean).join(' · '),'muted'));}
  for(const [key,label]of [['summary','סיכום'],['description','תיאור'],['replacementAction','מה עושים'],['result','תוצאה'],['note','הערה'],['text','תוכן'],['purpose','מטרה']])if(typeof value[key]==='string'&&value[key])el.append(node('p',label+': '+value[key]));
  const details=node('details',undefined,'technical-data');details.append(node('summary','הנתונים המקוריים'),node('pre',JSON.stringify(value,null,2)));el.append(details);
 }else el.append(node('p','לא תועד מידע.','muted'));
 parent.append(el);return el;
}
function artifact(parent,a){
 if(!a||typeof a!=='object'){record(parent,'לא תועד מידע על הקובץ.');return;}
 const card=node('div',undefined,'record artifact-card'),type=c.evidenceLabel(a);
 card.append(node('span',p.evidenceName(type),'badge'),node('h3',a.label||'קובץ מצורף'));
 const source=a.url||a.path,url=c.safeUrl(source,dataBase);
 if(url){
  if(['REFERENCE','PLAN','ASSET_COMPOSITION','ACTUAL_CAPTURE'].includes(type)&&/\.(png|jpe?g|webp|gif)(\?|$)/i.test(url)){const img=node('img');img.src=url;img.alt=p.evidenceName(type)+': '+(a.label||'קובץ מצורף');img.loading='lazy';img.addEventListener('error',()=>{img.remove();card.append(node('p','התמונה אינה זמינה. אפשר לפתוח את המקור.'));});card.append(img);}
  const link=node('a','פתיחת הקובץ');link.href=url;link.target='_blank';link.rel='noopener';card.append(link);
 }else card.append(node('p','הקובץ נמצא במחשב העבודה ואינו נגיש ישירות בדפדפן.','muted'));
 const details=node('details',undefined,'technical-data');details.append(node('summary','פרטי המקור והזיהוי'),node('p',source||'לא נמסר נתיב'),node('p','סוג ראיה: '+(a.evidenceStatus||'UNKNOWN')),node('p','ריצה: '+(a.runId||'UNKNOWN')),node('p','SHA256: '+(a.sha256||'UNKNOWN'),'meta'));card.append(details);parent.append(card);
}
function list(title,items){const body=disclosure(title+' ('+(Array.isArray(items)?items.length:0)+')',$('project'));if(!Array.isArray(items)||!items.length)body.append(node('p','טרם תועדו פריטים.','muted'));else items.forEach(v=>record(body,v));return body;}
function projects(){const panel=$('projects');panel.replaceChildren();const query=$('project-search').value.trim().toLocaleLowerCase();for(const item of(index?.projects||[]).filter(item=>item.kind===lane&&(!query||((item.title||'')+' '+item.id).toLocaleLowerCase().includes(query))).sort((a,b)=>Number(b.id===session?.id)-Number(a.id===session?.id))){const button=node('button',item.title||item.id);button.setAttribute('aria-current',String(session?.id===item.id));button.title=item.id;button.append(node('small',p.stageLabel(item.stage)+(session?.id===item.id?' · נבחר':''),'project-stage'));button.onclick=()=>loadProject(item);panel.append(button);}if(!panel.childNodes.length)panel.append(node('p',query?'לא נמצאו פרויקטים בחיפוש הזה.':'עדיין אין פרויקטים במסלול הזה.','muted'));}
function disclosure(title,parent,open=false){const el=node('details',undefined,'disclosure');el.open=open;el.append(node('summary',title));const body=node('div',undefined,'disclosure-body');body.disclosure=el;el.append(body);parent.append(el);return body;}
function render(s){
 const main=$('project');main.replaceChildren();const openTargets={};
 const head=node('header',undefined,'project-head');
 head.append(node('p',(s.kind==='film'?'סרט':'שלב')+' · '+p.stageLabel(s.stage),'eyebrow'),node('h2',s.title||s.id));
 let date='מועד עדכון לא ידוע';try{const d=new Date(s.updatedUtc);if(!Number.isNaN(d.getTime()))date='עודכן '+d.toLocaleString('he-IL',{timeZone:'Asia/Jerusalem',day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit'});}catch{}
 head.append(node('p',p.statusLabel(s.status)+' · '+date,'muted'));
 const actions=node('div',undefined,'project-actions');
 const resume=node('button','העתקת הוראות לסוכן');resume.className='primary';resume.onclick=()=>copy(c.BOOTSTRAP);
 const preview=node('a',s.kind==='film'?'פתיחת תצוגה מקדימה':'פתיחת בדיקות שלבים');
 preview.href=s.kind==='film'?'cutscene-preview.html?session='+encodeURIComponent(c.id(s.id)):'level-qa.html';
 actions.append(resume,preview);head.append(actions);main.append(head);
 const stages=node('ol',undefined,'timeline');stages.setAttribute('aria-label','שלבי העבודה');
 (c.STAGES[s.kind]||[]).forEach(label=>{const item=node('li',p.stageLabel(label));if(s.stage===label)item.setAttribute('aria-current','step');stages.append(item);});main.append(stages);
 const advisor=section('מה כדאי לעשות עכשיו?');advisor.classList.add('advisor');
 const advisory=node('div');advisor.append(advisory);
 function guide(run){advisory.replaceChildren();const a=p.advice(s,run);advisory.append(node('h3',a.title),node('p',a.body));const link=node('a','פתיחת הפרטים המתאימים ←');link.href='#'+({qa:'qa-section',evidence:'evidence-section',decisions:'decisions-section',operation:'operation-section',details:'agent-section'}[a.target]||'agent-section');link.onclick=()=>{if(openTargets[a.target])openTargets[a.target].open=true;};advisory.append(link,node('p','הכוונה לפי היומן; זו אינה בדיקה חדשה של התוצאה.','muted'));}guide();
 const overview=node('div',undefined,'summary-grid');
 for(const [label,value]of [['איפה אנחנו',p.stageLabel(s.stage)],['נקודות פתוחות',String(p.openGaps(s.gaps))],['גרסת היעד',s.approvedTargetRevision?'אושרה גרסה '+s.approvedTargetRevision:'טרם אושרה']]){const card=node('div',undefined,'summary-card');card.append(node('span',label,'muted'),node('strong',value));overview.append(card);}main.append(overview);
 if(s.inFlightAction){const pending=section('פעולה שממתינה לבירור');pending.id='operation-section';pending.classList.add('warning');pending.append(node('p','לפני המשך, הסוכן צריך לבדוק מה הייתה תוצאת הפעולה שנשלחה.'));record(pending,s.inFlightAction);}
 const intent=disclosure('הרעיון ותמונת היעד',main,(s.targetArtifacts||[]).length>0);intent.append(node('p',s.originalBrief||'טרם תועד הרעיון המקורי.'));(s.targetArtifacts||[]).forEach(a=>artifact(intent,a));
 const qa=section('בדיקות ותוצאה');qa.id='qa-section';const runs=Array.isArray(s.runs)?s.runs:[];
 if(runs.length){
  const label=node('label','איזו ריצה רוצים לבדוק?');label.htmlFor='qa-run';const select=node('select');select.id='qa-run';select.setAttribute('aria-label','ריצת QA מדויקת');
  const prompt=node('option','בחרו ריצה — הבדיקות מוצגות בנפרד לכל ריצה');prompt.value='';select.append(prompt);
  runs.forEach((r,i)=>{const option=node('option',r.label||r.title||r.id||r.runId||'ריצה ללא שם');option.value=String(i);select.append(option);});select.value='';
  const display=node('div',undefined,'status-grid'),runEvidence=node('div');
  const copyQa=node('button','העתקת הבדיקה לסוכן');copyQa.disabled=true;
  const show=()=>{display.replaceChildren();runEvidence.replaceChildren();const r=select.value===''?null:runs[Number(select.value)];copyQa.disabled=!r;guide(r);
   if(!r){display.append(node('p','בחרו ריצה כדי לראות מה צולם, מה נבדק ומה עדיין פתוח.','muted'));return;}
   for(const [key,label]of [['capture','צילום'],['technical','תקינות טכנית'],['cinematic',s.kind==='film'?'איכות קולנועית':'איכות חזותית'],['runtime','התנהגות בהרצה']]){const card=node('div',undefined,'qa-state');card.append(node('span',label,'muted'),node('strong',p.statusLabel(c.runStatus(r,key))));display.append(card);}
   const meta=disclosure('זהות הריצה והסטטוסים המקוריים',runEvidence);record(meta,r);
   const items=c.runArtifacts(r);if(items.length){const body=disclosure('צילומים וקבצים של הריצה שנבחרה ('+items.length+')',runEvidence,true);items.forEach(a=>artifact(body,a));}else runEvidence.append(node('p','לריצה הזאת לא צורפו קבצים נגישים.','muted'));
  };
  select.onchange=show;copyQa.onclick=()=>{const r=select.value===''?null:runs[Number(select.value)];if(!r)return;try{copy(c.qaText(s,r.id||r.runId));}catch(e){notice(e.message,true);}};
  qa.append(label,select,display,copyQa,runEvidence);show();
 }else qa.append(node('p','עדיין אין בדיקה מתועדת. לאחר הבנייה מצרפים צילום ותוצאות של אותה ריצה.','muted'));
 list(s.kind==='film'?'תכנון השוטים':'תכנון השלב',s.storyboard);
 list('חומרים ואנימציות',s.assets);
 list('מה חסר ומה צריך להשלים',s.gaps);
 const decisions=list('החלטות ואישורים',s.decisions);decisions.disclosure.id='decisions-section';openTargets.decisions=decisions.disclosure;
 const evidence=node('div');evidence.id='evidence-section';main.append(evidence);
 const sources=disclosure('מקורות וקבצים מצורפים ('+(s.sourceArtifacts||[]).length+')',evidence);openTargets.evidence=sources.disclosure;
 if(!(s.sourceArtifacts||[]).length)sources.append(node('p','טרם צורפו מקורות או צילומים.','muted'));(s.sourceArtifacts||[]).forEach(a=>artifact(sources,a));
 const technical=node('div');technical.id='agent-section';main.append(technical);
 const agent=disclosure('פרטי המשך לסוכן · הוראות מדויקות ונתונים טכניים',technical);openTargets.details=agent.disclosure;
 agent.append(node('h3','הפעולה הבאה'),node('p',s.nextAction||'לא נמסרה פעולה הבאה.'),node('h3','הפעולה האחרונה שתועדה'),node('p',s.lastCompletedAction||'לא תועד.'));
 record(agent,{id:s.id,revision:s.revision,stage:s.stage,status:s.status,currentIdentity:s.currentIdentity??'UNKNOWN'});
 const history=disclosure('היסטוריית גרסאות',main);const revisions=[...(s.history||[]),{revision:s.revision,snapshotPath:'workbench/projects/'+s.id+'/revisions/'+String(s.revision).padStart(6,'0')+'.json',stage:s.stage}];
 revisions.slice().reverse().forEach(h=>{const row=node('p');const url=c.safeUrl(h.snapshotPath,dataBase);if(url&&h.snapshotPath){const link=node('a','גרסה '+h.revision+' · '+p.stageLabel(h.stage));link.href=url;row.append(link);}history.append(row);});
}
async function loadProject(p,request=++generation,epoch=freshEpoch(),base=indexBase){notice('קורא את תיק הפרויקט…');$('project').replaceChildren(node('p','טוען…'));try{const s=await get(c.repoPath(p.sessionPath),epoch,base);if(request!==generation)return;if(s.id!==p.id||s.kind!==p.kind)throw Error('זהות התיק אינה תואמת לאינדקס');if(!Number.isInteger(p.revision)||s.revision!==p.revision)throw Error('אי־התאמת גרסאות (revision) בין האינדקס לתיק; נדרש רענון');session=s;lane=s.kind;if(projectPicker&&window.matchMedia?.('(max-width:700px)').matches)projectPicker.open=false;const url=new URL(location.href);url.searchParams.set('id',s.id);history.replaceState(null,'',url);render(s);projects();tabs();notice(`נטענה גרסה ${s.revision??'UNKNOWN'} מהמאגר${loopback?'':' · '+new URL(base).pathname.split('/')[3].slice(0,7)}.`);}catch(e){if(request!==generation)return;session=null;notice(e.message+' · לחצו על רענון כדי לנסות שוב.',true);$('project').replaceChildren(node('p','התיק לא נטען. הנתונים אינם זמינים.','error'));}}
function tabs(){for(const kind of ['film','level'])$(kind+'-tab').setAttribute('aria-pressed',String(lane===kind));}
async function reload(){const request=++generation,epoch=freshEpoch();session=null;notice('קורא אינדקס עדכני…');$('project').replaceChildren(node('p','טוען…'));try{const base=await resolveBase(epoch);if(request!==generation)return;const data=await get('workbench/index.json',epoch,base);if(request!==generation)return;if(data.schema!=='STARWARS_DELTA_AUTHORING_WORKBENCH'||data.version!==1||!Array.isArray(data.projects))throw Error('אינדקס לא נתמך');index=data;indexBase=base;const requested=new URL(location.href).searchParams.get('id');const p=data.projects.find(p=>p.id===requested)||(!requested&&data.projects.find(p=>p.id===data.activeByKind?.[lane]));projects();tabs();if(p)await loadProject(p,request,epoch,base);else{session=null;$('project').replaceChildren(node('div',requested?'הפרויקט שבקישור לא נמצא. בחרו פרויקט או רעננו.':'עדיין אין תיק פעיל. העתיקו את הוראות הפתיחה ובקשו מהסוכן ליצור פרויקט.','empty'));notice('האינדקס נטען.');}}catch(e){if(request!==generation)return;index=null;indexBase=null;projects();$('project').replaceChildren(node('p','לא ניתן לאמת את מצב המאגר העדכני.','error'));notice(e.message+' · לחצו על רענון כדי לנסות שוב.',true);}}
$('project-search').oninput=projects;
$('copy-start').onclick=()=>copy(c.BOOTSTRAP);$('reload').onclick=reload;for(const kind of ['film','level'])$(kind+'-tab').onclick=()=>{lane=kind;session=null;generation++;const u=new URL(location.href);u.searchParams.delete('id');u.searchParams.set('kind',kind);history.replaceState(null,'',u);projects();tabs();const p=index?.projects.find(p=>p.id===index.activeByKind?.[kind]);if(p)loadProject(p);else $('project').replaceChildren(node('div','אין תיק פעיל במסלול הזה. בקשו מהסוכן ליצור פרויקט.','empty'));};reload();
})();
