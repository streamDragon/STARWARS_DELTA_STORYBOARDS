// PR probe: intentionally no behavior change; this commit exists to exercise the Film QA workflow.
// synchronize probe 2
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const PREVIEW_URL = process.env.PREVIEW_URL || 'https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/cutscene-preview.html';
const OUT = process.env.QA_OUT || 'artifacts/cutscene-film-qa';
const MOVIE = process.env.MOVIE_BUTTON || 'GOLDEN 40S';
const DURATION = Number(process.env.EXPECTED_DURATION || 40);
const TIMES = (process.env.FRAME_TIMES || '0,2,4.2,8.2,13.2,18.2,24.2,29.2,35.2,39').split(',').map(Number).filter(Number.isFinite);
const SHA = process.env.GITHUB_SHA || Date.now().toString();
for (const d of ['', 'frames', 'full-page', 'video']) await fs.mkdir(path.join(OUT,d), {recursive:true});
const report={url:PREVIEW_URL,movieButton:MOVIE,buildSha:SHA,startedAt:new Date().toISOString(),consoleErrors:[],pageErrors:[],networkFailures:[],screenshots:[],checks:{},steps:[],summary:'RUNNING'};
const mark=s=>{console.log('QA_STEP',s);report.steps.push({at:new Date().toISOString(),step:s})};
const parseClock=t=>{const m=String(t||'').match(/([0-9]+(?:\.[0-9]+)?)\s*\/\s*([0-9]+(?:\.[0-9]+)?)s?/i);return m?{elapsed:+m[1],total:+m[2]}:null};

async function metrics(frame){return frame.locator('#stage').evaluate(el=>{
  const cs=[...el.querySelectorAll('canvas')], visible=cs.filter(c=>{const r=c.getBoundingClientRect(),s=getComputedStyle(c);return r.width>8&&r.height>8&&s.display!=='none'&&+(s.opacity||1)>.05});
  let nonDark=0;
  for(const c of visible){try{const x=c.getContext('2d');if(!x||!c.width||!c.height)continue;const sx=Math.max(1,Math.floor(c.width/10)),sy=Math.max(1,Math.floor(c.height/10));for(let y=0;y<c.height;y+=sy)for(let z=0;z<c.width;z+=sx){const p=x.getImageData(Math.min(z,c.width-1),Math.min(y,c.height-1),1,1).data;if(p[3]>20&&p[0]+p[1]+p[2]>45)nonDark++}}catch{}}
  return{canvasCount:cs.length,visibleCanvasCount:visible.length,placeholderCount:[...el.querySelectorAll('.ph')].filter(x=>getComputedStyle(x).display!=='none').length,sampledNonDark:nonDark,text:(el.innerText||'').slice(0,500)};
})}

async function shot(page,frame,t){
  const value=Math.max(0,Math.min(1000,Math.round(t/DURATION*1000)));
  await frame.locator('#scrub').evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}))},value);
  await page.waitForTimeout(900);
  const clockText=await frame.locator('#time').textContent();const m=await metrics(frame);const label=t.toFixed(1).padStart(4,'0');
  const stage=`frames/frame-${label}s.png`,full=`full-page/full-${label}s.png`;
  await frame.locator('#stage').screenshot({path:path.join(OUT,stage)});await page.screenshot({path:path.join(OUT,full),fullPage:true});
  report.screenshots.push({time:t,clock:parseClock(clockText),clockText,metrics:m,stage,full});
  console.log('QA_FRAME',t,clockText,JSON.stringify(m));
}

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1600,height:1000},recordVideo:{dir:path.join(OUT,'video'),size:{width:1600,height:1000}}});
const page=await context.newPage();
page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});page.on('pageerror',e=>report.pageErrors.push(String(e?.stack||e)));page.on('requestfailed',r=>report.networkFailures.push({url:r.url(),error:r.failure()?.errorText||'failed'}));
try{
  mark('goto');const u=new globalThis.URL(PREVIEW_URL);u.searchParams.set('qa',`${SHA}-${Date.now()}`);await page.goto(u.toString(),{waitUntil:'domcontentloaded',timeout:45000});
  mark('wait-app-frame');const frameEl=await page.locator('#app').elementHandle();if(!frameEl)throw new Error('Preview wrapper iframe #app not found');let frame=await frameEl.contentFrame();const frameDeadline=Date.now()+20000;while((!frame||!frame.url()||frame.url()==='about:blank')&&Date.now()<frameDeadline){await page.waitForTimeout(250);frame=await frameEl.contentFrame()}if(!frame)throw new Error('Preview iframe content frame not available');report.frameUrl=frame.url();
  mark('wait-stage');await frame.locator('#stage').waitFor({state:'visible',timeout:15000});await frame.getByRole('button',{name:MOVIE,exact:true}).waitFor({state:'visible',timeout:20000});
  mark('wait-current');await frame.waitForFunction(()=>{const s=document.querySelector('#status')?.textContent||'';return /CURRENT/i.test(s)&&!/Loading CURRENT/i.test(s)},{},{timeout:30000});
  mark('load-movie');await frame.getByRole('button',{name:MOVIE,exact:true}).click();await frame.waitForFunction(()=>/GOLDEN/i.test(document.querySelector('#drop')?.textContent||'')&&/\/\s*40(?:\.0)?s/i.test(document.querySelector('#time')?.textContent||''),{}, {timeout:30000});await page.waitForTimeout(1200);
  report.loadedBanner=await frame.locator('#drop').textContent();report.checks.movieLoaded=/GOLDEN/i.test(report.loadedBanner||'');report.checks.timelineHasEightBeats=await frame.locator('#timeline .shot').count()===8;
  mark('play-smoke');const before=parseClock(await frame.locator('#time').textContent())?.elapsed||0;await frame.getByRole('button',{name:'PLAY',exact:true}).click();await page.waitForTimeout(2600);const after=parseClock(await frame.locator('#time').textContent())?.elapsed||0;const playMetrics=await metrics(frame);report.playSmoke={before,after,metrics:playMetrics,health:(await frame.locator('.playHealth').textContent().catch(()=>''))||''};report.checks.playAdvanced=after-before>1.5;report.checks.playFrameVisible=playMetrics.visibleCanvasCount>0&&playMetrics.sampledNonDark>0;report.checks.playHealthOk=/PLAYBACK OK/i.test(report.playSmoke.health);
  const pause=frame.getByRole('button',{name:'PAUSE',exact:true});if(await pause.count())await pause.click();
  mark('frame-scan');for(const t of TIMES)await shot(page,frame,t);
  const diag=(await frame.locator('#diag').textContent())||'';report.checks.noUnknownHandle=!/UNKNOWN_HANDLE/i.test(diag);report.checks.noPageErrors=report.pageErrors.length===0;report.checks.framesVisible=report.screenshots.every(s=>s.metrics.visibleCanvasCount>0&&s.metrics.sampledNonDark>0);
  const critical=['movieLoaded','timelineHasEightBeats','playAdvanced','playFrameVisible','playHealthOk','framesVisible','noPageErrors'];const failed=critical.filter(k=>!report.checks[k]);report.summary=failed.length?`FAIL: ${failed.join(', ')}`:'PASS';
}catch(e){report.summary='ERROR';report.fatalError=String(e?.stack||e)}finally{
  mark('write-report');report.finishedAt=new Date().toISOString();await fs.writeFile(path.join(OUT,'report.json'),JSON.stringify(report,null,2));await fs.writeFile(path.join(OUT,'REPORT.md'),['# Cutscene Film QA','',`**Result:** ${report.summary}`,`**Movie:** ${MOVIE}`,'',`**Frame:** ${report.frameUrl||'unresolved'}`,'','## Checks',...Object.entries(report.checks).map(([k,v])=>`- ${v?'PASS':'FAIL'}: ${k}`),'',`Console errors: ${report.consoleErrors.length}`,`Page errors: ${report.pageErrors.length}`,`Network failures: ${report.networkFailures.length}`].join('\n'));await page.close().catch(()=>{});await context.close().catch(()=>{});await browser.close().catch(()=>{})
}
if(report.summary!=='PASS')process.exitCode=1;
