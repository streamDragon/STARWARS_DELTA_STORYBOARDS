(function(root){
'use strict';
const stages={Goal:'מטרה',Direction:'כיוון חזותי',Assets:'מיפוי חומרים',ArtIntake:'קליטת ארט',Composition:'הרכבת יעד',JsonValidation:'בדיקת JSON',Build:'בנייה',VisualQa:'צילום וסקירה',Waves:'גלים',GameplayQa:'בדיקת משחק',FinalReview:'אישור סופי'};
const list=value=>Array.isArray(value)?value:[];
function validateJournal(value){
 if(!value||value.schema!=='STARWARS_DELTA_LEVEL_JOURNEY'||value.schemaVersion!==1)throw Error('Unsupported level journey');
 if(!/^[a-f0-9]{32}$/.test(value.levelId||''))throw Error('Invalid levelId');
 if(typeof value.scenePath!=='string'||!/^Assets\/.+\.unity$/.test(value.scenePath))throw Error('Invalid scenePath');
 if(!Number.isSafeInteger(value.revision)||value.revision<0)throw Error('Invalid revision');
 if(value.catalogRevision!=null&&typeof value.catalogRevision!=='string')throw Error('catalogRevision must be an exact string');
 return {...value,events:list(value.events),attempts:list(value.attempts),references:list(value.references),assets:list(value.assets),decisions:list(value.decisions)};
}
function safeReference(value,allowHttps=false){
 if(typeof value!=='string'||/[\\\x00-\x1f]/.test(value))return '';
 if(allowHttps&&value.startsWith('https://')){
  try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}
 }
 if(!/^(level-qa|designer-ai)\/[A-Za-z0-9_. /-]+$/.test(value))return '';
 if(value.split('/').some(p=>!p||p==='.'||p==='..'))return '';
 return value;
}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function buildViewModel(value,qaRuns){
 const j=validateJournal(value),events=j.events.filter(e=>e&&e.attemptId===j.currentAttemptId);
 const attempt=j.attempts.find(a=>a?.attemptId===j.currentAttemptId)||{attemptId:j.currentAttemptId||'',captureStatus:'NOT_RUN',visualReview:'NOT_REVIEWED',gameplayVerification:'NOT_VERIFIED',acceptanceStatus:'PENDING'};
 const latestCapture=events.filter(e=>e.kind==='Capture').at(-1);
 const captureRef=latestCapture?.outcome==='SUCCEEDED'?list(latestCapture.references).find(r=>r?.kind==='UNITY_CAPTURE'):null;
 const runs=list(qaRuns).filter(r=>r?.scenePath===j.scenePath);
 const currentCapture=captureRef?runs.find(r=>r.runId===captureRef.runId&&r.captureStatus==='COMPLETED')||null:null;
 const operations=new Map();for(const e of events)if(e.operationId)operations.set(e.operationId,e);
 const pendingOperation=[...operations.values()].reverse().find(e=>e.outcome==='RUNNING'||e.outcome==='UNKNOWN')||null;
 const closure=j.decisions.find(d=>d?.kind==='CLOSE'&&d.actor==='user'&&d.sourceReference&&d.attemptId===attempt.attemptId&&d.subjectHash&&d.subjectHash===attempt.subjectHash);
 return {journal:j,scenePath:j.scenePath,goal:j.originalGoal||'טרם תועדה מטרה',attempt,currentCapture,previousRuns:runs.filter(r=>r!==currentCapture),pendingOperation,canReplay:false,acceptanceStatus:closure?'CLOSED':attempt.acceptanceStatus==='CLOSED'?'PENDING':attempt.acceptanceStatus||'PENDING'};
}
function mergeLevels(qaRuns,index){
 const byScene=new Map();for(const r of list(qaRuns)){if(!r?.scenePath)continue;if(!byScene.has(r.scenePath))byScene.set(r.scenePath,{scenePath:r.scenePath,displayName:r.sceneName||r.scenePath,runs:[]});byScene.get(r.scenePath).runs.push(r);}
 if(index?.schema==='STARWARS_DELTA_LEVEL_JOURNEY_INDEX'&&index.schemaVersion===1)for(const j of list(index.levels)){
  if(!j?.scenePath||!/^[a-f0-9]{32}$/.test(j.levelId||''))continue;
  if(!byScene.has(j.scenePath))byScene.set(j.scenePath,{scenePath:j.scenePath,displayName:j.displayName||j.scenePath,runs:[]});
  byScene.get(j.scenePath).journey=j;
 }
 return [...byScene.values()];
}
function buildBootstrapText(url){return 'המשך את העבודה על הרמה מתוך הקישור הזה:\n'+url+'\nקרא באתר את המטרה המאושרת, החומרים, ההחלטות, הניסיון האחרון והפעולה הבאה. אמת את זהות הסצנה ואת מצב הכלים, והמשך מהשלב האחרון שהוכח. תעד תוצאות וחוסרים באותו יומן. אל תחזור על פעולה שמסומנת RUNNING או UNKNOWN לפני בירור תוצאתה. קרא AGENTS.md ו־level-builder-workflow לפני עבודה ב־Unity. הקפד על JSON חד־פעמי ותוצר Unity שניתן לעריכה; סיום דורש צילום אמיתי ואישור משתמש לגרסה המסוימת.';}
async function loadIndex(fetcher=root.fetch){
 try{const r=await fetcher('level-qa/journeys/index.json',{cache:'no-store'});if(r.status===404)return null;if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}catch{return null;}
}
function renderJournal(host,v,pageUrl){
 const doc=host.ownerDocument,el=(tag,text,cls)=>{const e=doc.createElement(tag);if(text!=null)e.textContent=String(text);if(cls)e.className=cls;return e;};
 host.replaceChildren();host.classList.add('journey');host.dir='rtl';
 host.append(el('p','LEVEL JOURNEY · גרסה '+v.journal.revision,'journey-eyebrow'),el('h3','מטרה, חומרים והמשך העבודה'));
 host.append(el('p',v.goal,'journey-goal'));
 const summary=el('div',null,'journey-summary');
 for(const [title,value] of [['שלב',stages[v.journal.stage]||v.journal.stage],['השלב האחרון שהוכח',v.journal.lastVerifiedStep||'טרם אומת'],['הפעולה הבאה',v.journal.nextAction||'תעד פעולה הבאה לפני המשך'],['צילום',v.attempt.captureStatus||'NOT_RUN'],['סקירה חזותית',v.attempt.visualReview||'NOT_REVIEWED'],['בדיקת משחק',v.attempt.gameplayVerification||'NOT_VERIFIED'],['אישור משתמש',v.acceptanceStatus]]){const item=el('div');item.append(el('strong',title),el('span',value));summary.append(item);}host.append(summary);
 if(v.pendingOperation)host.append(el('p','פעולה ללא תוצאה סופית: '+v.pendingOperation.operationId+' · '+v.pendingOperation.outcome+'. בדוק את תוצאת הפעולה המקורית לפני הפעלה חוזרת.','journey-warning'));
 const copy=el('button','העתק הוראות המשך לסוכן');copy.type='button';
 const copyStatus=el('span','','journey-copy-status');copyStatus.setAttribute('role','status');
 copy.addEventListener('click',async()=>{const text=buildBootstrapText(pageUrl);try{await root.navigator.clipboard.writeText(text);copyStatus.textContent='ההוראות הועתקו';}catch{const field=el('textarea',text);field.setAttribute('aria-label','הוראות המשך להעתקה');host.append(field);field.focus();field.select();copyStatus.textContent='אפשר להעתיק מהשדה שנפתח';}});host.append(copy,copyStatus);
 const refs=el('div',null,'journey-references');
 const refLabels={INSPIRATION:'השראה',ASSET_COMPOSITION:'הרכבה מנכסים אמיתיים',UNITY_CAPTURE:'צילום Unity',DOCUMENT:'מסמך'};
 for(const r of v.journal.references){const card=el('article');card.append(el('strong',refLabels[r.kind]||r.kind),el('p',r.label||r.source||''));const href=safeReference(r.repositoryPath);if(href){const a=el('a','פתיחת הראיה');a.href=href;a.target='_blank';a.rel='noopener';card.append(a);}else if(r.localPath)card.append(el('small','ראיה מקומית · זמינה במחשב העבודה בלבד'));if(r.runId)card.append(el('small','Run: '+r.runId));refs.append(card);}if(refs.children.length)host.append(refs);
 if(v.journal.assets.length){host.append(el('h4','החומרים שנבחרו'));const assets=el('div',null,'journey-assets');for(const a of v.journal.assets){const card=el('article'),href=safeReference(a.previewUrl,true);if(href){const img=el('img');img.src=href;img.alt=a.name||a.path;img.loading='lazy';img.addEventListener('error',()=>{img.hidden=true;card.append(el('p','התמונה לא זמינה · יש לבדוק Preview','journey-warning'));},{once:true});card.append(img);}card.append(el('strong',a.name||a.path),el('code',a.path),el('small',a.assetId),el('p','תפקידים: '+list(a.roles).join(', ')),el('small','Preview: '+(a.previewStatus||'NOT_VERIFIED')));assets.append(card);}host.append(assets);}
 const history=el('details'),heading=el('summary','ניסיונות והחלטות · '+v.journal.events.length+' אירועים');history.append(heading);
 for(const e of v.journal.events.slice().reverse()){const row=el('article');row.append(el('strong',(stages[e.stage]||e.stage)+' · '+e.kind+' · '+e.outcome),el('p',e.note||''),el('small',(e.utc||'')+' · '+(e.attemptId||'')+' · '+(e.actor||'')));if(e.nextAction)row.append(el('p','המשך: '+e.nextAction));history.append(row);}host.append(history);
 host.append(el('p','היומן מתעד עבודה. תמונת השראה או הרכבת נכסים אינה צילום מצב הסצנה. תרשים גלים הוא תכנון מחושב; הצלחת כלי אינה אישור חזותי או משחקי.','journey-note'));
}
async function mountLevelJourney(host,entry,qaRuns){
 const abort=new AbortController();host._dispose=()=>abort.abort();
 const path=safeReference(entry?.snapshotPath);if(!path||!/^level-qa\/journeys\//.test(path))throw Error('Invalid journey snapshot path');
 const r=await root.fetch(path,{cache:'no-store',signal:abort.signal});if(!r.ok)throw Error('Journey HTTP '+r.status);
 const bytes=await r.arrayBuffer(),hash=[...new Uint8Array(await root.crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==entry.snapshotSha256)throw Error('Journey snapshot hash mismatch');
 const j=validateJournal(JSON.parse(new TextDecoder().decode(bytes)));if(j.levelId!==entry.levelId||j.revision!==entry.revision)throw Error('Journey identity mismatch');
 if(!host.isConnected)return;
 const url=new URL('level-qa.html',root.location.href);url.hash=new URLSearchParams({level:j.scenePath}).toString();renderJournal(host,buildViewModel(j,qaRuns),url.href);
}
const api={validateJournal,buildViewModel,safeReference,escapeHtml,mergeLevels,buildBootstrapText,loadIndex,renderJournal};
if(typeof module!=='undefined')module.exports=api;root.LevelJourney=api;root.mountLevelJourney=mountLevelJourney;
})(globalThis);
