#!/usr/bin/env node
// Keeps the public QA site aligned with the authoritative Workbench index.
// Scoped deletions only: film-qa runs not owned/referenced by a Workbench film;
// level-qa runs for the two selected levels; retired level dossiers.
// GitHub ref is advanced once, without force; concurrent changes abort.
const REPO = process.env.GITHUB_REPOSITORY || 'streamDragon/STARWARS_DELTA_STORYBOARDS';
const BRANCH = process.env.CLEANUP_BRANCH || 'main';
const APPLY = process.argv.includes('--apply');
const KEEP_LEVEL_IDS = new Set(['level-grad9-golden-gameplay','level-gradius-volcano-stage1-1985']);
const KEEP_SCENES = new Set(['GRAD_9','GRADIUS_VOLCANO_01']);
const MAX_DELETE = 1200; // unexpected expansions are blocked
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const headers = {'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'starwars-workbench-cleanup'};
if (token) headers.Authorization='Bearer '+token;

async function call(path, options={}) {
  const response=await fetch('https://api.github.com'+path,{
    ...options,headers:{...headers,...(options.headers||{})}
  });
  const body=await response.text();
  if (!response.ok) throw Error('GitHub '+response.status+' '+path+': '+body.slice(0,350));
  return body ? JSON.parse(body) : {};
}
const resource=(p)=>'/repos/'+REPO+p;
const getPath=async(p,sha)=>{
 const response=await fetch('https://raw.githubusercontent.com/'+REPO+'/'+sha+'/'+p,{headers:{'User-Agent':'starwars-workbench-cleanup'},cache:'no-store'});
 if(!response.ok)throw Error('Cannot read '+p+' at '+sha+': '+response.status);
 return response.json();
};
const norm=(value)=>String(value||'').toLowerCase().replace(/^film-/, '');
const paths=(value,found)=>{
 if(typeof value==='string'){
   for(const match of value.matchAll(/film-qa\/[a-z0-9_./-]+/gi))
     found.add(match[0].replace(/[)'",;]+$/,''));
 }else if(Array.isArray(value))for(const v of value)paths(v,found);
 else if(value&&typeof value==='object')for(const v of Object.values(value))paths(v,found);
};
const isReferenced=(folder, refs)=>[...refs].some(p=>p===folder||p.startsWith(folder+'/')||folder.startsWith(p+'/'));
const captureTime=(run)=>Date.parse(run.publishedUtc||run.generatedUtc||'');
function safeAge(run){const time=captureTime(run);return Number.isFinite(time)&&Date.now()-time>48*60*60*1000;}

async function main(){
 const head=await call(resource('/git/ref/heads/'+BRANCH));
 const sha=head.object?.sha;
 if(!/^[a-f0-9]{40}$/.test(sha||''))throw Error('Unexpected branch HEAD');
 const [commit, treeResult, work, filmQA, levelQA]=await Promise.all([
  call(resource('/git/commits/'+sha)),
  call(resource('/git/trees/'+sha+'?recursive=1')),
  getPath('workbench/index.json',sha),
  getPath('film-qa/index.json',sha),
  getPath('level-qa/index.json',sha)
 ]);
 if(treeResult.truncated)throw Error('Git tree truncated. Refusing deletion');
 const tree=treeResult.tree.filter(x=>x.type==='blob');
 const byPath=new Map(tree.map(x=>[x.path,x]));
 const films=work.projects.filter(p=>p.kind==='film');
 const levels=work.projects.filter(p=>p.kind==='level');
 if(films.length<5||levels.length<2||!Array.isArray(filmQA.runs)||!Array.isArray(levelQA.runs))
   throw Error('Index sanity checks failed');
 for(const id of KEEP_LEVEL_IDS)if(!levels.some(p=>p.id===id))throw Error('Retained level missing: '+id);
 let pointer=0;const sessions=[];
 async function worker(){
  while(pointer<films.length){
   const project=films[pointer++];
   try{sessions.push({project,data:await getPath(project.sessionPath,sha)});}
   catch(error){throw Error('Film session read failed ('+project.id+'): '+error.message);}
  }
 }
 await Promise.all(Array.from({length:Math.min(8,films.length)},worker));
 const recognized=new Set(), references=new Set();
 for(const {project,data} of sessions){
   for(const key of [project.id,data.id,data.unityProjectId,data.currentIdentity?.unityProjectId,data.projectId])
     if(key)recognized.add(norm(key));
   paths(data,references);
 }
 // A run is retained if a Workbench film owns its project ID OR a Workbench
 // dossier explicitly links its QA folder. Unknown/incomplete identity fails closed.
 const retiredFilmRuns=filmQA.runs.filter(run=>{
   if(!run.projectId||!run.folder||!safeAge(run))return false;
   if(recognized.has(norm(run.projectId)))return false;
   if(isReferenced(run.folder,references))return false;
   return true;
 });
 // Keep historic level QA only when a retained Workbench dossier explicitly links it.
 const retainedLevelRefs=new Set();
 for(const p of levels.filter(p=>KEEP_LEVEL_IDS.has(p.id))){
   const session=await getPath(p.sessionPath,sha);
   const scanLevel=(v)=>{
     if(typeof v==='string'){
       for(const match of v.matchAll(new RegExp('level-qa/[a-z0-9_./-]+','gi')))
         retainedLevelRefs.add(match[0].replace(/[)'",;]+$/,''));
     }else if(Array.isArray(v))for(const x of v)scanLevel(x);
     else if(v&&typeof v==='object')for(const x of Object.values(v))scanLevel(x);
   };
   scanLevel(session);
 }
 const retiredLevelRuns=levelQA.runs.filter(run=>{
  if(!run.runId||!safeAge(run))return false;
  if(!KEEP_SCENES.has(run.sceneName))return true;
  const prefix='level-qa/'+run.runId;
  if(isReferenced(prefix,retainedLevelRefs))return false;
  const same=levelQA.runs.filter(x=>x.sceneName===run.sceneName).sort((a,b)=>String(b.generatedUtc||'').localeCompare(String(a.generatedUtc||'')));
  return same[0]?.runId!==run.runId;
 });
 const retiredProjects=levels.filter(p=>!KEEP_LEVEL_IDS.has(p.id));
 const deletion=new Set();
 const addFolder=(folder)=>{
   if(!folder||folder.includes('..')||folder.startsWith('/'))throw Error('Unsafe cleanup path '+folder);
   for(const item of tree)if(item.path.startsWith(folder+'/'))deletion.add(item.path);
 };
 for(const run of retiredFilmRuns){
   if(!run.folder.startsWith('film-qa/'))throw Error('Invalid film QA path');
   addFolder(run.folder);
 }
 for(const run of retiredLevelRuns){
   const prefix='level-qa/'+run.runId;
   if(!run.runId.startsWith('level-'))throw Error('Invalid level QA id');
   addFolder(prefix);
 }
 for(const p of retiredProjects){
   if(!p.id.startsWith('level-')||p.sessionPath!=='workbench/projects/'+p.id+'/session.json')
     throw Error('Invalid retired level dossier path');
   addFolder('workbench/projects/'+p.id);
 }
 const reserved=['workbench/index.json','film-qa/index.json','level-qa/index.json'];
 for(const p of reserved)if(deletion.has(p))throw Error('Attempted protected index deletion');
 if(deletion.size>MAX_DELETE)throw Error('Excessive deletion count: '+deletion.size);
 // If a QA folder is shared by a retained run, avoid deleting its contents.
 for(const run of filmQA.runs.filter(r=>!retiredFilmRuns.includes(r))){
    if(run.folder&&[...deletion].some(p=>p.startsWith(run.folder+'/')))
      throw Error('Shared QA folder still referenced: '+run.folder);
 }
 const now=new Date().toISOString();
 const nextWork={...work,projects:work.projects.filter(p=>p.kind!=='level'||KEEP_LEVEL_IDS.has(p.id)),updatedUtc:now,
  activeByKind:{...work.activeByKind,level:'level-gradius-volcano-stage1-1985'}};
 const nextFilm={...filmQA,runs:filmQA.runs.filter(r=>!retiredFilmRuns.includes(r)),generatedUtc:now};
 const nextLevel={...levelQA,runs:levelQA.runs.filter(r=>!retiredLevelRuns.includes(r))};
 const changed=retiredFilmRuns.length||retiredLevelRuns.length||retiredProjects.length;
 const report={head:sha,dryRun:!APPLY,filmsInWorkbench:films.length,levelsBefore:levels.map(p=>({id:p.id,title:p.title})),levelsAfter:nextWork.projects.filter(p=>p.kind==='level').map(p=>({id:p.id,title:p.title})),
  filmQaRunsBefore:filmQA.runs.length,filmQaRunsAfter:nextFilm.runs.length,
  levelQaRunsBefore:levelQA.runs.length,levelQaRunsAfter:nextLevel.runs.length,
  retiredFilmRuns:retiredFilmRuns.map(r=>({runId:r.id,projectId:r.projectId,folder:r.folder})),
  retiredLevelRuns:retiredLevelRuns.map(r=>({runId:r.runId,scene:r.sceneName})),
  retiredDossiers:retiredProjects.map(p=>p.id),removedFiles:deletion.size,sha:null};
 console.log(JSON.stringify(report,null,2));
 if(!APPLY||!changed)return;
 if(!token)throw Error('GITHUB_TOKEN required for apply');
 async function blob(content){return (await call(resource('/git/blobs'),{method:'POST',body:JSON.stringify({content:JSON.stringify(content,null,2)+'\n',encoding:'utf-8'})})).sha;}
 const [workBlob,filmBlob,levelBlob]=await Promise.all([blob(nextWork),blob(nextFilm),blob(nextLevel)]);
 const entries=[
  {path:'workbench/index.json',mode:'100644',type:'blob',sha:workBlob},
  {path:'film-qa/index.json',mode:'100644',type:'blob',sha:filmBlob},
  {path:'level-qa/index.json',mode:'100644',type:'blob',sha:levelBlob},
  ...[...deletion].sort().map(path=>({path,mode:'100644',type:'blob',sha:null}))
 ];
 const newTree=(await call(resource('/git/trees'),{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree:entries})})).sha;
 const newCommit=(await call(resource('/git/commits'),{method:'POST',body:JSON.stringify({message:'Cleanup QA artifacts absent from Workbench and retain two level dossiers',tree:newTree,parents:[sha]})})).sha;
 // Non-force update fails when a competing writer advanced main.
 await call(resource('/git/refs/heads/'+BRANCH),{method:'PATCH',body:JSON.stringify({sha:newCommit,force:false})});
 const verified=await call(resource('/git/ref/heads/'+BRANCH));
 if(verified.object.sha!==newCommit)throw Error('New ref not verified');
 console.log('CLEANUP_COMMIT '+newCommit);
}
main().catch(e=>{console.error('CLEANUP_ABORTED:',e.message);process.exitCode=1;});
