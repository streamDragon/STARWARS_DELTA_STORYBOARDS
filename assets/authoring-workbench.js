(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AuthoringWorkbench=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const BASE='https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/';
const BOOTSTRAP=`Help with my film or level request in STARWARS_DELTA_STORYBOARDS. Freshly load workbench/AGENT_PROTOCOL.md and workbench/index.json using GitHub tools in streamDragon/STARWARS_DELTA_STORYBOARDS (main), or ${BASE}workbench/AGENT_PROTOCOL.md and ${BASE}workbench/index.json. For a new movie or level request, create a NEW dossier with a new stable ID and preserve my stated intent; never select activeByKind to replace a new idea. Continue a dossier only for an explicit existing-project or resume request. Resolve the requested ID, using activeByKind only for an explicit resume without an ID; clarify only genuinely ambiguous existing identity. Do not ask again for already specified intent. Read its sessionPath and immutable revision history, original brief, approved target, source identities, inFlightAction and nextAction before acting. Resume the exact recorded stage and nextAction; inspect submitted/UNKNOWN actions read-only before any new mutation. Film: use CURRENT sealed V1 with Anime Emotion, Dialogue, MOVES and Cinematic Director. Level: use existing Level Builder JSON, then Reverse waves. With Remote, follow canonical MAIN and AGENTS.md; without Remote, plan/author/update repository and mark actual Unity operations PENDING_REMOTE. Never claim built without evidence. Persist through the documented optimistic atomic update; no write access means export an unsynced JSON proposal.\n`;
const STAGES={film:['BRIEF','STORYBOARD','ASSETS','TARGET_REVIEW','AUTHORING','UNITY_BUILD','QA','REVISION','COMPLETE'],level:['BRIEF','DESIGN','ASSETS','TARGET_REVIEW','LEVEL_JSON','LEVEL_BUILD','LEVEL_QA','WAVES','GAMEPLAY_QA','COMPLETE']};
function id(value){if(typeof value!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)||value.length>100)throw Error('Invalid project id');return value;}
function repoPath(value){if(typeof value!=='string'||!value||value.startsWith('/')||/[\\:%?#\x00-\x1f]/.test(value)||value.split('/').some(x=>!x||x==='.'||x==='..'))throw Error('Unsafe repository path');return value;}
function safeUrl(value,base){if(typeof value!=='string'||!value.trim()||value!==value.trim()||value.startsWith('//')||/[\\\x00-\x20]/.test(value))return null;try{const u=new URL(value,base);if(u.protocol==='https:'||(u.protocol==='http:'&&u.origin===new URL(base).origin))return u.href;}catch{}return null;}
function validate(s){id(s.id);if(s.schema!=='STARWARS_DELTA_AUTHORING_SESSION'||s.version!==1)throw Error('Unsupported session schema');if(!STAGES[s.kind]?.includes(s.stage))throw Error('Invalid stage for project kind');if(!Number.isInteger(s.revision)||s.revision<1)throw Error('Invalid revision');for(const key of ['targetArtifacts','storyboard','assets','gaps','decisions','runs','history','sourceArtifacts'])if(!Array.isArray(s[key]))throw Error('Invalid '+key);if(s.stage==='COMPLETE'&&!s.decisions.some(d=>d.type==='USER_ACCEPTANCE'&&d.accepted===true&&typeof d.reference==='string'&&d.reference.trim()))throw Error('COMPLETE requires explicit user acceptance with reference');return s;}
function createSession(input){return validate({schema:'STARWARS_DELTA_AUTHORING_SESSION',version:1,id:id(input.id),kind:input.kind,title:input.title||input.id,revision:1,stage:'BRIEF',status:'PLANNING',updatedUtc:new Date().toISOString(),originalBrief:input.originalBrief||'',approvedTargetRevision:0,targetArtifacts:[],storyboard:[],assets:[],gaps:[],decisions:[],runs:[],history:[],lastCompletedAction:'Project initialized; target not approved',nextAction:input.kind==='level'?'Develop level design from originalBrief; identify CURRENT and Level Builder contract.':'Develop storyboard from originalBrief; identify CURRENT sealed V1 and verify assets.',inFlightAction:null,sourceArtifacts:[],currentIdentity:null});}
function updateSession(current,patch,expected){if(current.revision!==expected)throw Error('Revision conflict: current revision '+current.revision);if(!patch||typeof patch!=='object'||Array.isArray(patch))throw Error('Patch must be an object');for(const key of ['schema','version','id','kind','revision','history','updatedUtc'])if(Object.hasOwn(patch,key))throw Error('Protected field: '+key);const next={...current,...patch,revision:current.revision+1,updatedUtc:new Date().toISOString(),history:[...(current.history||[]),{revision:current.revision,stage:current.stage,status:current.status,updatedUtc:current.updatedUtc,snapshotPath:`workbench/projects/${id(current.id)}/revisions/${String(current.revision).padStart(6,'0')}.json`}]};return validate(next);}
function evidenceLabel(a){const kind=String(a?.kind||'').toLowerCase();if(['reference','inspiration'].includes(kind))return 'REFERENCE';if(['plan','storyboard','target'].includes(kind))return 'PLAN';if(['composition','asset-composition'].includes(kind))return 'ASSET_COMPOSITION';if(kind==='capture'&&a.evidenceStatus==='CAPTURED'&&a.runId)return 'ACTUAL_CAPTURE';return 'UNKNOWN';}
function runStatus(r,key){const fields={capture:'captureStatus',technical:'technicalVisualQa',cinematic:'cinematicQa',runtime:'runtimeQa'};return r[key]??r[fields[key]]??'NOT_TESTED';}
function runArtifacts(r) {
  const runId = r.id || r.runId;
  // Exact legacy Level QA provenance values; arbitrary camera/render words are not evidence.
  const captureSources = new Set(['level_urp_scene_camera_render', 'gameplay_camera_urp_offscreen_postprocessing', 'actual_editor_game_view_texture']);
  const compositionSources = new Set(['authoring_wave_projection', 'authored_wave_schedule']);
  const capturedRun = ['COMPLETED', 'PARTIAL'].includes(runStatus(r, 'capture'));
  const derived = [];
  for (const f of r.frames || []) {
    const knownCapture = captureSources.has(f.source);
    const kind = f.kind ?? (compositionSources.has(f.source) ? 'composition' : knownCapture ? 'capture' : 'unknown');
    const evidenceStatus = f.evidenceStatus ?? (kind === 'capture' && knownCapture && capturedRun ? 'CAPTURED' : 'UNKNOWN');
    derived.push({...f, kind, evidenceStatus, label: f.label || f.frameId || 'Frame', runId: f.runId || runId});
  }
  for (const frame of r.keyFrames || []) {
    const f = typeof frame === 'string' ? {path: frame} : frame;
    derived.push({...f, kind: f.kind ?? 'unknown', evidenceStatus: f.evidenceStatus ?? 'UNKNOWN', label: f.label || 'Archived QA key frame', runId: f.runId || runId});
  }
  for (const key of ['pdf', 'report', 'reviewBrief', 'audit', 'comparison', 'timelinePath', 'reviewUrl', 'contactSheet']) {
    if (r[key]) derived.push({path:r[key],kind:'report',label:key,evidenceStatus:'SOURCE_ATTACHED',runId});
  }
  return [...(r.artifacts || []), ...derived];
}
function qaText(s,runId){const r=s.runs.find(r=>(r.id||r.runId)===runId);if(!r)throw Error('Select an exact run');return [`Project: ${s.id} | session revision: ${s.revision}`,`Run: ${r.id||r.runId} | target revision: ${r.targetRevision??'UNKNOWN'}`, ...['capture','technical','cinematic','runtime'].map(k=>`${k}: ${runStatus(r,k)}`),`Approved target revision: ${s.approvedTargetRevision??0}`,`Evidence: ${JSON.stringify(runArtifacts(r))}`,`Gaps: ${JSON.stringify(s.gaps||[])}`].join('\n');}
return {BASE,BOOTSTRAP,STAGES,id,repoPath,safeUrl,validate,createSession,updateSession,evidenceLabel,qaText,runStatus,runArtifacts};
});
