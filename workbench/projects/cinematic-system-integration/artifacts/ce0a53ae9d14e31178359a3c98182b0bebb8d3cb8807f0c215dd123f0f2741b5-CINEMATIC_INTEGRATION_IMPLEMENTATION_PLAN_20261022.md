# Cinematic Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make the existing cinematic tools one recoverable movie-authoring workflow, with a per-film dossier, truthful asset discovery, recipe-based direction, ordinary V1 import/build, and attributable camera/Film QA evidence.

**Architecture:** Extend existing Studio, CURRENT projections and the existing storyboards website. Editorial state is a detached sidecar keyed by ProjectId; CUTSCENE_SCRIPT_V1 stays the only movie input. One MAIN integration owner writes source and operates Unity; workers prepare exact scoped changes outside Assets.

**Tech Stack:** Unity Editor C#, Newtonsoft.Json, Timeline, Cinemachine, existing native Unity CLI/Test Runner, existing PowerShell publisher, static HTML/JavaScript and Node's built-in test runner.

**Spec:** C:/Users/nlpis/wkspaces/STARWARS_DELTA_WORK/qa/CINEMATIC_INTEGRATION_DESIGN_20261022.html — approved by the user on 2026-10-22.

**Status:** PLAN FOR REVIEW. Source inspection and read-only CLI discovery completed. No product source changes, native compilation, tests, publication or check-in performed by this planning turn.

## Global Constraints

- P = C:/Users/nlpis/wkspaces/STARWARS_DELTA, canonical Plastic MAIN.
- W = C:/Users/nlpis/wkspaces/STARWARS_DELTA_WORK, preparation and evidence.
- E = P/Assets/WISDOM/CutsceneStudio/Editor.
- C = P/Assets/_Game/MY_Core/MY_Scripts/HAGGAI_STUFF/Cutscenes.
- T = P/Assets/_Game/MY_Core/MY_Scripts/HAGGAI_STUFF/Editor/Tests.
- Q = P/Assets/_Game/MY_Core/MY_Scripts/HAGGAI_STUFF/Editor/V2/DesignerAiPublisher.
- V4 = E/V4_CURRENT_ASSET_CATALOG_CHATGPT_EXPORT_PROJECTIONS_AND_PUBLISHER.
- SITE = streamDragon/STARWARS_DELTA_STORYBOARDS, existing GitHub website repository; its Git checkout is not another Unity workspace.
- Unity version follows ProjectSettings/ProjectVersion.txt; expected project baseline 6000.7.0b5. Do not upgrade/downgrade.
- Keep com.unity.pipeline at 0.7.0-exp.1. No PackageCache edits.
- One V1 authoring contract and one ordinary Lint/Import/Build path. System 4 is orchestration, not a new movie schema.
- Only unreadable input or inability to create/save any basic Unity movie may stop creation. Recoverable asset, duration, presentation and binding gaps produce warnings/placeholders and retain the original request.
- No persistent recipe attachment, regeneration authority, drift warnings or overwrite of later manual edits.
- Keep Anime Emotion, Dialogue and MOVES separate in implementation ownership.
- No extra production Unity Editor/workspace, retired queue/mailbox, background scan, automatic publish or check-in.
- Preserve existing asset GUID/meta identities; never raw-read/edit live .unity/.asset files. Use Unity APIs.
- One heavy native operation at a time. Respect user/manual work. Stop for memory alone only below 307200 KiB available RAM, per current AGENTS.md.
- Recheck exact file claims and source hashes before applying each prepared batch. A timeout is UNKNOWN until the original result is inspected.
- Website publication and Plastic integration/check-in remain explicit scoped stages after reviewable outputs exist. A completed scan must not publish by itself.

## Review Focus

1. Agent loss during submitted build: retain the original operation identity, show recovery/revalidation, and never silently replay generation. Owned by A1/A2 tests.
2. Same movie name, renamed movie, stale/missing CURRENT: group by ProjectId and preserve exact source/request fingerprints; unresolved data stays visible. Owned by A1/A3/B1 tests.
3. Main art absent from compact selection: distinguish six coverage stages and full discovery from currently legal handles; no fabricated identities. Owned by C1 tests.
4. Tiny requested durations, missing muzzle and cross-shot projectile continuity: preserve requested input, fit all action intervals, warn about pacing/fidelity, and do not duplicate a volley. Owned by B1/B2 tests.
5. Captured frames, browser approximation and component tests mistaken for runtime acceptance: evidence statuses stay separate; preview does not publish; manual edits survive reopening. Owned by A2/A3/D1/D2 tests.

## Execution and review units

The design spans four independently testable subprojects. Implement A first; C and B preparation can proceed independently after interfaces below are reviewed; integrate all Unity source serially. D camera integration is separate from dossier work.

The user already requested subagents. Preserve that execution method: workers prepare exact batches; a separate reviewer checks each batch; the root integrates MAIN. Do not ask the user to choose a method again.

No task authorizes broad refactoring of StudioWindow, the publisher or the runtime. New helper classes below have one editorial/projection responsibility.

## Shared interfaces and evidence contract

New editorial types live under E/Authoring/Dossier; they are not serialized into V1.

- MY_FilmDossier: int Version=1; string ProjectId; int Revision; int ApprovedTargetRevision; string DisplayName; string StoryIdea; string Stage; string SourceSha256; string CurrentIdentity; string LastCompletedAction; string NextAction; MY_FilmOperation InFlightAction; List<MY_FilmTarget> Targets; List<MY_FilmStoryboardShot> Storyboard; List<MY_FilmAsset> Assets; List<MY_FilmRequirement> Requirements; List<MY_FilmDecision> Decisions; List<MY_FilmRun> Runs.
- MY_FilmTarget: int Revision; string ApprovalDecisionId (empty means unapproved); List<MY_FilmArtifact> Artifacts. The panel only records approval from an explicit user decision, never from a build result.
- MY_FilmArtifact: string Path; string Sha256; string Kind (INSPIRATION, ASSET_COMPOSITION, ACTUAL_CAPTURE, SOURCE, REPORT); string RunId; string EvidenceState.
- MY_FilmStoryboardShot: string ShotId; double StartSeconds; double DurationSeconds; string Purpose; string ProtocolId; string CauseEventId; string ConsequenceEventId; string SourceActorId; string TargetActorId; string ReactionActorId; string ScreenDirection; string Scale; string CameraIntent; string AudioIntent; List<MY_FilmArtifact> References.
- MY_FilmOperation: string OperationId; string Kind; string State; string SubmittedUtc; string SourceSha256; string ResultPath. States: SUBMITTED, COMPLETED, FAILED, UNKNOWN, REVALIDATION_REQUIRED.
- MY_FilmRun: string RunId; string SourceSha256; string CurrentIdentity; string ScenePath; string CaptureMode; string CaptureStatus; string TechnicalStatus; string CinematicStatus; string RuntimeStatus; string ReportPath; list ArtifactPaths.
- MY_FilmAsset: requestedIdentity/path, resolvedIdentity/path, sourceFolder, sourceKind, evidenceKind, factual prefab-animation owner, selected/current-handle availability, and explicit substitution reason. Candidate IDs are discovery metadata, not V1 actor handles.
- MY_FilmRequirement: stable ID, shotId/time, requested capability or asset, temporary result, expected replacement and current disposition.
- MY_FilmDecision: decision ID, target revision, exact text, author/source, recorded time. Import does not manufacture a user approval.
- SourceSha256 hashes the immutable source artifact bytes, including original BOM and line endings when captured from a file. A Studio text-buffer capture has its own exact UTF-8 encoding recorded as sourceKind=TEXT_BUFFER and must not claim byte identity with an unavailable original file. Browser cursor state is a separate source/run-keyed record.
- Evidence status must distinguish NOT_RUN, UNKNOWN, FAILED, WARNINGS, COMPLETED and ACCEPTED. Do not derive cinematic/runtime acceptance from technical completion.
- Store editorial data in W/qa/film-dossiers/{ProjectId}/. Save revisions as immutable numbered files plus an atomically replaced latest pointer. This is a process log, not scene authority.
- Optimistic write: TrySave(dossier, expectedRevision, out error) rejects concurrent editorial replacement without overwriting either proposal. Source-hash mismatch affects evidence attribution, never marks Unity edits as recipe drift.

# Subproject A — Movie dossier, website history and continuation

### A1. Persist an editorial dossier before the first build

**Files**
- Create E/Authoring/Dossier/MY_CutsceneFilmDossier.cs.
- Create E/Authoring/Dossier/MY_CutsceneFilmDossierStore.cs.
- Create E/Authoring/Dossier/MY_CutsceneFilmDossierCopy.cs.
- Create T/MY_CutsceneFilmDossierTests.cs.
- Reuse E/Authoring/MY_CutsceneProject.cs ProjectId, StoryIdea, AuthoringSourceJson and PackageRevision; do not duplicate the Project asset.

**Interfaces**
- Store.TryLoad(string projectId, out MY_FilmDossier dossier, out string error): bool.
- Store.TrySave(MY_FilmDossier dossier, int expectedRevision, out string error): bool.
- Copy.BuildForChat(MY_FilmDossier dossier, string originalV1): string.
- Copy.BuildForQa(MY_FilmDossier dossier, string runId): string.

- [ ] Write tests: SameNameDifferentProjectIds_AreSeparate; Rename_PreservesHistory; StaleRevision_DoesNotOverwrite; SourceBytes_AreUnchanged; UnknownOperation_IsNotReplayInstruction; OriginalRequestAndSubstitution_AppearInCopy; BeforeBuild_DossierCanBeSaved; BomAndLineEndings_OriginalDownloadUnchanged.
- [ ] Assert: two projects called FLEET load separate decisions; changed DisplayName retains RunId; expectedRevision=2 against revision=3 fails without changing stored bytes; CRLF source hashes differently from LF but neither is normalized; UNKNOWN remains UNKNOWN.
- [ ] Run the focused native fixture once to establish RED after adding tests; retrieve its original results.
- [ ] Implement JSON read/write and copy builders; write a temporary file then atomically update the pointer only after complete serialization. Loading/copying cannot call generator, AssetDatabase refresh, Play or publish.
- [ ] Run the same fixture to GREEN; review writes and meta creation. Record exact files/hashes, not a global check-in.

### A2. Connect Studio and Film QA to the same dossier

**Files**
- Create E/Authoring/Dossier/MY_CutsceneFilmDossierPanel.cs.
- Modify E/MY_CutsceneStudioWindow.cs only OnGUI/DrawBriefSection, existing copy methods and build completion/failure boundaries.
- Modify C/Editor/MY_CutsceneFilmQaScannerWindow.cs: WriteReport and WriteChatGptReviewBrief.
- Modify C/Editor/MY_CutsceneFilmQaSitePublisher.cs.
- Modify V4/MY_CutsceneRepairReport.cs for optional dossier provenance.
- Create T/MY_CutsceneFilmDossierIntegrationTests.cs; extend T/FilmQaScannerTests.cs.

**Interfaces**
- Panel.Draw(MY_CutsceneProject project): void, called after DrawBriefSection.
- Dossier recording consumes A1 and Studio's retained original rawAuthoringJson, not a reconstructed backend package.
- Existing Publisher.TryPublish(reportFolder, sceneName, projectId, result, generatedUtc, durationSeconds, frameCount, eventCount, reviewFlagCount, out publicPdfUrl, out message) remains supported.
- Add TryPublishDossier(string dossierFolder, string projectId, out string dossierUrl, out string message): bool for an explicitly requested prebuild dossier snapshot; it does not require a QA PDF.
- Report export adds dossier/source identity and separate statuses. No new compile/import path. At an explicit user visit, display an optional refresh request when the last recorded index timestamp is at least 14 days old; this display does not call ScanChanges or schedule work.

- [ ] Write tests: OpenDossier_DoesNotModifyMovie; BuildFailure_PreservesPreviousRun; PendingUnknownBuild_DoesNotReplay; RepairCopy_ContainsExactOriginalV1; ScanCompleted_DoesNotPublish; PrebuildDossier_DoesNotRequireQaPdf; IndexAge14Days_OffersRefreshWithoutRunning.
- [ ] Assert source and Timeline hashes stay unchanged on panel open/copy; UNKNOWN submitted operation is displayed with concrete inspect-next action; a successful scanner write invokes no public publisher; prior preview remains on failed materialization.
- [ ] Establish RED for affected fixture only; do not rerun unrelated full Studio suites.
- [ ] Implement explicit Save checkpoint, Copy for Chat and Copy QA actions. Append events at existing terminal build boundaries; retain SessionState recovery behavior. Remove automatic public publishing from scanner completion and retain an explicit publish action.
- [ ] Run focused tests and existing CutsceneStudioBusyBuildRegressionTests/CutsceneStudioWorkflowTests only if their behavior was touched. Independently review original-source retention and no scene mutation.

### A3. Extend the existing website into a per-film dossier

**Files**
- Modify SITE/film-qa.html.
- Modify SITE/designer-ai/simple-preview.html.
- Modify SITE/cutscene-preview.html.
- Create SITE/assets/film-dossier.js.
- Create SITE/assets/film-dossier.test.js.
- Modify P/tools/Publish-FilmQaToStoryboardsSite.ps1.
- Create P/tools/Publish-FilmQaToStoryboardsSite.Tests.ps1, using filesystem fixtures/mocked GitHub calls.
- SITE source must first be materialized from its exact existing repository revision; do not create a replacement website.

**Interfaces**
- JS readDossier(value) returns normalized editorial state plus warnings without changing original V1.
- JS selectRun(dossier, runId) returns the exact run or an unavailable outcome.
- JS buildChatPayload(dossier, originalV1) and buildQaPayload(dossier, runId) use A1 field names.
- JS resumeKey(projectId, runId, sourceSha256) isolates stored cursor/beat selection.
- Existing film-qa index version stays readable; optional dossier/source/sourceSha256/dossierSha256 links are added to new run entries.
- Publisher gains optional DossierFolder and DossierOnly switch; DossierOnly requires dossier/source assets, not QA PDF. Existing QA-publish invocation retains its parameters.

- [ ] Write Node tests: names collide but ProjectIds do not; rename retains history; source hash mismatch refuses evidence attribution; missing old fields remain readable; another source does not inherit time; unknown handle yields a labeled placeholder; browser approximation never produces runtime PASS.
- [ ] Add publisher tests: every contact-sheet dependency is included; zero public calls in staging-only test; old runs remain in index; path collisions cannot replace another ProjectId; dossier-only works before a first capture.
- [ ] Run node --test assets/film-dossier.test.js and Invoke-Pester -Path tools/Publish-FilmQaToStoryboardsSite.Tests.ps1 with public calls mocked; capture RED.
- [ ] Implement per-film page with approved target, storyboard, real assets, replacement ledger, selected/latest/latest-accepted run and next action. Forward dossier/run/source parameters through iframe. Use safe text rendering for user text. Preserve original bytes for download/copy.
- [ ] Align recoverable browser preview diagnostics with Unity placeholders; reserve hard failure for unreadable input. Label simulation approximate and show runtime NOT_TESTED.
- [ ] Publisher packages local index.html and all referenced images, or omits the Images link explicitly when unavailable. Use stable ProjectId in new storage paths. Produce a local review package first; public mutation is a later scoped action.
- [ ] Run Node/PowerShell fixtures to GREEN; browser-check deep link, reload/resume, RTL text, missing-image state and clipboard/download identity. Do not claim that these browser checks verify Unity.

# Subproject B — Director recipes into one legal V1 candidate

### B1. Lower one causal weapon recipe correctly

**Files**
- Install/extend E/Composer/MY_CinematicComposerModels.cs.
- Install/extend E/Composer/MY_CinematicComposerStoryPlanner.cs.
- Install/extend E/Composer/MY_CinematicComposerShotWriter.cs.
- Create E/Composer/MY_CinematicComposerProtocolRegistry.cs.
- Create E/Composer/MY_CinematicComposerCurrentAdapter.cs.
- Create E/Composer/MY_CinematicComposerCoordinator.cs.
- Create T/MY_CinematicComposerContractTests.cs.
- Original candidates: W/qa/cinematic_composer_20261022/source/. Treat them as unintegrated preparation, not accepted production code.
- Read existing P/Assets/WISDOM/CutsceneStudio/V1_MOVIE_AUTHORING_INPUT_AND_GUIDES/CINEMATIC_DIRECTOR_PROTOCOLS.json.

**Interfaces**
- Preserve StoryPlanner.TryPlan(MY_CinematicIdeaBrief brief, out MY_CinematicShotPlan plan, out MY_CinematicComposerDiagnostic[] diagnostics).
- Preserve ShotWriter.TryBuildBeats(MY_CinematicShotPlan plan, out List<MY_CinematicBeat> beats, out MY_CinematicComposerDiagnostic[] diagnostics).
- Registry.TryLoad(string protocolsJson, out MY_CinematicProtocolRegistry registry, out MY_CinematicComposerDiagnostic[] diagnostics): bool.
- CurrentAdapter.TryBind(plan, MY_CutsceneAuthoringContext context, out MY_CinematicAssetBindings bindings, out diagnostics): bool.
- Coordinator.TryCompose(brief, context, out MY_CinematicCompositionResult result): bool.
- CompositionResult holds V1Json, ContextIdentity, diagnostics, unresolved requirements and VisualVerified=false. Editorial requirements remain outside V1.
- First recipe FLEET_VOLLEY_22 binds actual IMPACT_WITH_CONSEQUENCE pattern; nominal shot durations 4,3,4,4,3,4 seconds. Scale to requested duration; short pacing is a warning, not an inability to create a basic movie.

- [ ] Write tests: UsesProtocolPattern; WeightedTiming22s_Equals4_3_4_4_3_4; ThreeSecondRequest_FitsIntervalsAndWarns; FireTravel_DoesNotRelaunchVolley; SameTarget_AcrossFireImpactAftermath; OnlyCurrentV1Properties; LegalDramaticFunctions; Compose_DoesNotModifyUnityAssets.
- [ ] Assert every action start >=0 and start+duration <= its beat duration; FIRE emits three projectile events and TRAVEL zero new emissions; stable source/target IDs persist across observation cuts.
- [ ] Establish RED against staged defects: anticipation/attack/travel are illegal dramaticFunction values; current fixed offsets exceed short beats; current writer emits six projectiles for a described three-shot volley.
- [ ] Implement legal enum lowering (build/build/pursuit as applicable), normalized action timing, one causal event identity, real context fingerprints and existing resolver boundaries. Never serialize Start/VisualRequirements/NeedsMuzzle/semantic labels as unknown V1 fields.
- [ ] For unavailable content, preserve requested identity in original/sidecar and allow existing Studio warning/placeholder recovery. Do not invent legal handles, claim a sprite proxy is the requested Prefab, or add approval gates for already authorized placeholders.
- [ ] Run focused contract fixture and existing Director audit regression; validate candidate against the exact context schema and existing strict lint, retaining diagnostic/build distinction.

### B2. Wire the Composer to the ordinary Studio entry and dossier

**Files**
- Create E/Composer/MY_CinematicComposerPanel.cs.
- Modify E/MY_CutsceneStudioWindow.cs at DrawBriefSection to call the small panel.
- Create T/MY_CinematicComposerStudioIntegrationTests.cs.
- Extend dossier model only with already approved generic story/requirements data.

**Interfaces**
- ComposerPanel.Draw(MY_CutsceneProject project, MY_FilmDossier dossier): void.
- Existing MY_CutsceneStudioWindow.ImportJsonForAutomation(selectedProject, completeJson, out message, out retainedReport) remains the only importer boundary.
- Existing TryPrepareCurrentJson(simpleJson, project, context, out result) and GenerateValidatedPending(project, retainedReport, raw, out generatedRoot, out message) remain authoritative.
- TryCompose returns candidate/diagnostics; GenerateValidatedPending is only called through normal Studio controls or established automation.

- [ ] Write tests: ComposeCandidate_UsesNormalImporter; RetainedReport_ReachesBuild; UnknownAsset_ReachesEditablePlaceholder; OriginalRequest_AppearsInDossierAndRepairCopy; UnacceptedTarget_IsNotMarkedApproved.
- [ ] Assert one import path and zero direct generator calls from pure composition; retainedReport identity belongs to candidate source/context; a missing muzzle is a visible requirement with VisualVerified=false.
- [ ] Establish RED, then implement candidate preview/import handoff and dossier links without broad Studio UI restructuring.
- [ ] Run targeted integration tests; create a local candidate through normal tools and confirm it can be saved with warnings before trying visual fidelity.
- [ ] Independent review checks no alternate public movie schema, no compile bypass and no permanent source attachment.

### B3. Apply the existing eight editorial recipes and human intercuts

**Files**
- Modify the six Composer files from B1 and E/Composer/MY_CinematicComposerPanel.cs.
- Create T/MY_CinematicComposerRecipeTests.cs.
- Read existing protocols rather than editing 53-MOVE definitions.
- Leave W/qa/semantic_director_4_20261022/semantic-director-4.cjs as a planning/reference utility; do not introduce another production V1 exporter.

**Interfaces**
- IdeaBrief gains ordered DramaticArc entries: protocolId, source/target/speaker/listener references, requested duration/weight and explicit story consequence.
- Registry exposes source-defined recipe identities/phases. Planner resolves entries through existing MOVES, Dialogue and Anime Emotion fields.
- Unmapped prose/unsupported semantic intent returns a visible planning requirement plus existing ordinary V1 authoring route; it cannot disable general film creation.

- [ ] Write one data-driven test per actual source protocol: chase/human intercut, exterior/interior pressure, threat reveal, hero reveal, impact/consequence, dialogue under threat, discovery/decision, rescue.
- [ ] Assert changing order/target changes visible action references; reaction links to the actual event; tactical order precedes changed action; durations differ by recipe needs; no unsupported current enums are emitted.
- [ ] Add a short-cut test with two 0.5s inserts in one causal chain; mark readability NOT_REVIEWED until rendered evidence exists.
- [ ] Implement recipe-driven phase selection and beat allocation, preserving canonical phase identities. No blanket first-eligible MOVE or equal-act splitting.
- [ ] Run recipe tests and V1 schema/native lint checks. Render acceptance is D2, not a consequence of these tests.

# Subproject C — Full discovery visibility and existing prefab animation

### C1. Show selection loss and all catalog candidates without fake authorable handles

**Files**
- Modify Q/MY_DesignerAiVisualReferencePublisher.cs at SelectAuthoringRecords.
- Modify Q/MY_DesignerAiAuthoringSelectionCoverageGate.cs.
- Create Q/MY_DesignerAiAssetDiscoveryProjection.cs.
- Modify V4/MY_DesignerAiAuthoringHandlesProjection.cs.
- Modify V4/MY_DesignerAiChatGptAuthoringIndexProjection.cs.
- Extend T/MY_DesignerAiAuthoringSelectionCoverageGateTests.cs.
- Extend T/MY_DesignerAiChatGptAuthoringIndexTests.cs.
- Create T/MY_DesignerAiAssetDiscoveryProjectionTests.cs.

**Interfaces**
- Preserve SelectAuthoringRecords(IReadOnlyList<CatalogAssetRecord> records, IEnumerable<string> requestedAssetIds=null).
- Preserve WriteAuthoringHandles(outputPath, finalizedDirector, requiredCurrent, publishTransactionId, visualAtlasManifestPath=null).
- Preserve Index.Build(handles, emotionalDialogue=null), Write(directory, handles, emotionalDialogue=null), Validate(index, handles, emotionalDialogue=null).
- New DiscoveryProjection.Build(records, selectedRecords, emittedHandles, transactionId, scannerEvidence): JObject.
- New DiscoveryProjection.Write(directory, projection): string writes 32-entry paged metadata plus manifest. Each candidate distinguishes catalog record identity from a current authored handle.
- Report discovered/cataloged/eligible/selected/emitted/surfaced with explicit units. Missing terminal full-scan evidence means discovered=unavailable; targeted scan scope never claims whole-project coverage.
- Group by normalized folders/routes using existing eligibility rules, not pack-specific exceptions. No new discovery scan from projection code.

- [ ] Write fixture with 700 eligible records across source folders, compact selection omitting relevant records but preserving every route, 24 featured cards and 32-entry pages.
- [ ] Assert all 700 catalog candidates are retrievable through discovery pages; selected count is truthful; unselected candidate has no fabricated V1 handle; featured counts cannot masquerade as discovery counts; transaction identity matches.
- [ ] Assert unavailable discovered count remains unavailable and a targeted scan is labeled targeted. Folder omission produces coverage information, not a build blocker.
- [ ] Establish RED; implement candidate manifest and bounded coverage links in existing index. Keep compact preview/selected animation integrity unchanged.
- [ ] Explain supported next action for candidate outside CURRENT: inspect real asset and use explicit requestedAssetIds/supported intake at the authorized refresh boundary, or keep a marked placeholder. Do not claim it is currently authorable.
- [ ] Run affected projection/coverage fixtures. Independently inspect candidate 699 via pagination and verify current compact byte limits remain respected.

### C2. Prove built-in visual animation survives normal materialization

**Files**
- Extend T/CutsceneTimelineWriterIntegrationTests.cs and T/MY_CutsceneDirectSpriteAnimationTests.cs.
- Inspect C/Editor/MY_CutsceneGenerator.cs CreateActor and MY_CutsceneCinematicProxySanitizer.cs Sanitize(GameObject root,bool preserveAnimator).
- Modify those two production files only if the new regression reproduces actual loss.
- Do not add another generic animation system or relax ACTOR_ANIMATION_METADATA_FORBIDDEN by accident.

**Interfaces**
- Existing CreateActor(...) preserves VISUAL_ANIMATION_ROOT and separate motion/framing wrappers.
- Existing Sanitize(root,true) preserves Animator; keep gameplay behaviors/physics sanitization.
- Factual playback/ownership evidence belongs to the dossier asset descriptor, not actor animationIntents in compact index.
- Explicit animation actions still use existing V3 timeline writers.

- [ ] Write regression for root/nested controller with looping sprite and local Transform animation, no authored animation action, simultaneous wrapper world movement.
- [ ] Assert enabled original Animator/controller, no duplicate visual AnimationTrack, distinct wrapper/visual roots, preserved clip references after save/reopen.
- [ ] Run against current implementation; if GREEN, record evidence and make no production changes. If RED, isolate the exact materialization/sanitizer defect and repair only that path.
- [ ] Verify native Play animation with actual frames separately from timeline scrub. If deterministic scrub is unsupported, label it rather than adding a hidden redundant track.
- [ ] Run affected integration tests and independently review visual child preservation and manual edits.

# Subproject D — Camera ownership and film acceptance

### D1. Integrate only the consolidated READY camera patch

**Files**
- Modify C/Editor/V3_UNITY_BACKEND_DIRECTORS_CAMERA_PERFORMANCE_STAGING_AND_MATERIALIZATION/MY_CutsceneV3CinemachineMaterializer.cs.
- Add C/Runtime/MY_CutsceneFrameAnchor.cs from P/tools/cinematic_camera_staging/.
- Add C/Runtime/MY_CutsceneFrameMath.cs from the same staging directory.
- Add C/Runtime/MY_CutsceneMeasuredCinemachineExtension.cs from READY extension.
- Add T/MY_CutsceneMeasuredCinemachineLiveOwnershipTests.cs from READY focused fixture.
- READY directory: W/qa/cinematic_director_completion_20261021/cinemachine_owner_fix_20261021/CAMERA_OWNER_INTEGRATION_READY.

**Source guards observed this planning turn**
- MAIN materializer before patch: 184FA408B4F3B5EB40E8B382D6FB142DC9120725EC068D8893BEBED2E4E5C28B.
- READY patch: B1BB259F9791D55B5CE2F707B12757EC62C643B9C8F72CC18EBB332DE1FD4520.
- Resulting materializer: F02F7A9435C5FF4945F071C3F9B25B3888D65E6FE041A236366CB22851A44FF8.
- Extension: E6040827F8870CF51D3312BF7FAF604851470C7663C7673ACD7D188E5FC1C60D.
- Focused tests: 85B4C022D6BF677C8881D33FECDE3FFBEB68ADA41C0613737F9DAF3A4B9D5959.
- FrameAnchor: 26843F6388F7481DC4510D651FAD8199105587CD95504902616F57C16E70FABF.
- FrameMath: 2D7CF4069E082E07AC75F060669905B6B41B013D57522B8B4F2C966F2F3C8F22.

**Interfaces**
- Keep the READY signatures unchanged. Opt-in measured static/follow framing owns camera while valid; disabled fallback PositionComposer remains available for opt-out.
- READY consolidates REV3 materializer plus REV4 extension/tests and adds initialization/restoration. REV4 is older than READY. Never stack revisions.

- [ ] Recheck all seven guards and current claims; confirm destinations do not already contain another agent's integrated implementation.
- [ ] Install three-test fixture/dependencies and record expected RED before materializer fix if the batch can compile; otherwise preserve prepatch failure evidence and test the complete compilable batch.
- [ ] Apply only READY batch by sole MAIN owner; preserve metas; run one native refresh and verify fresh compilation.
- [ ] Run StudioCameraPlan_RootSubjectUsesExplicitBarrel_AtFiveOfTenSeconds, InspectorLateAnchor_ReplacesComposerThenRestoresOriginalOwner, OffCenterSpritePivot_FlipMirrorsOnlyAuthoredBarrelNotHull.
- [ ] Require three original native passing results and independently review no competing enabled writer, valid orthographic lens and restored composer. Direct InternalUpdateCameraState tests do not establish live Timeline/Brain playback.
- [ ] Explicitly keep push/pull/orbit/shake outside automatic measured activation, per READY implementation. Any extension to those modes is a separate reproduced task.

### D2. Prove normal authoring, causal cinema and handover end to end

**Files/evidence**
- Create W/qa/film-dossiers/{ProjectId}/ fixtures through A/B normal tools.
- Use actual P/Assets/_Game/MY_Core/MY_Cutscenes/Kits/EnemyFleet/CS_FLEET_Invasion.prefab, 13 ship children.
- Reuse C/Editor/MY_CutsceneFilmQaScannerWindow.cs and existing native gameplay/camera tools.
- Add T/MY_CinematicDossierAcceptanceTests.cs only for repeatable data/identity assertions; inspect rendered frames independently.

**Interfaces**
- Input is normal V1 plus editorial dossier, with supported placeholders when needed.
- For camera proof one continuous FollowComposedShot spans Master 5–15s; inspect Master t=10 after real target translation/rotation, not progress=1.
- Artistic fixture story/duration must be selected from approved existing work or explicitly approved in its dossier; do not invent user approval for a new film.

- [ ] Build FLEET30 through normal Studio. Resolve the original failed-lint vs proxy-consequence handoff using current diagnostics; retain original request and actual Prefab binding requirement.
- [ ] Bind actual Battlecruiser/gun child through normal Inspector/native operations, verify art/pivot and anchor, then evaluate Master/Brain and uninterrupted playback.
- [ ] Capture wide, t=10 gun-follow, fire, impact and aftermath/end; verify same target, physical muzzle, visible persistent result, no unwanted roll or competing enabled camera writer.
- [ ] Build the approved integrated film with Anime Emotion, Dialogue, MOVES and Director recipes; inspect threat/reaction/order/action/consequence and 0.5s inserts only if selected by its storyboard.
- [ ] Run Film QA and separate Play verification, read exact matching images, keep capture/technical/cinematic/runtime decisions separate. A blank or unreviewed frame cannot close cinematic acceptance.
- [ ] Change framing manually, save and reopen without recipe regeneration; verify occupancy/target references and original prefab animation persist.
- [ ] Agent-handover test: A stops after storyboard, B continues assets, C inspects submitted build result and continues QA, each from dossier only. Require zero repeated generation and no user re-explanation.
- [ ] Export review package. Publish exact site/dossier outputs and check in scoped Plastic files only under their explicit authorized boundaries. Record final hashes/run IDs and user acceptance; unresolved artistic warnings stay visible.

## Native verification commands

Read-only installed CLI discovery confirmed run_tests parameters: mode, filter, filter_type, include_explicit, async_tests, timeout. The following are execution-time commands; they were NOT run as tests during planning.

    unity command --project-path C:/Users/nlpis/wkspaces/STARWARS_DELTA run_tests mode=editor filter=MY_CutsceneFilmDossierTests filter_type=testName async_tests=true timeout=300 --format json
    unity command --project-path C:/Users/nlpis/wkspaces/STARWARS_DELTA test_status --format json
    unity command --project-path C:/Users/nlpis/wkspaces/STARWARS_DELTA recompile_status --format json
    unity command --project-path C:/Users/nlpis/wkspaces/STARWARS_DELTA console_status --format json

Use the same command with the exact fixture name from each task; do not launch all cohorts together. Correlate original result/run identity, no failures/skips/inconclusive, and source/Editor assembly times. Verify argument encoding against installed help at execution boundary.

Node verification runs in SITE root:

    node --test assets/film-dossier.test.js

Publisher verification uses Invoke-Pester -Path tools/Publish-FilmQaToStoryboardsSite.Tests.ps1 in P, with mocked GitHub writes and local fixture paths. Confirm Pester is already available before this command; if absent, use the same assertions in a standalone PowerShell fixture script rather than install a new dependency. Do not run the production publisher merely to test it.

## Source-backed changes since the design audit

1. Upstream compact selection exists: CompactFallbackPerCategory=24 and expansion target 500 + buffer25. All-handle projection covers selected records, not the full catalog.
2. Prefab visual preservation already exists: CreateActor wraps VISUAL_ANIMATION_ROOT and Sanitize(root,true) retains Animators. C2 therefore starts with evidence, not a replacement animation system.
3. Current authoring capture can invoke incremental ScanChanges on stale/missing catalog; do not add a second scanner.
4. Film QA WriteReport currently auto-publishes completed nonblack captures. A2 removes that automatic public side effect while preserving explicit publication.
5. Website simple preview exists, is approximate, file-drop only and hard-blocks unknown handles. A3 aligns placeholder behavior and adds provenance/history.
6. READY camera package is newer than REV4; current FrameAnchor/FrameMath differ from old preflight hashes.
7. Staged Composer contains illegal V1 purpose enums, fixed timing offsets and duplicated volley emission. B1 fixes these before adding broad UI.

## Existing source guards for the dossier/site tasks

These are planning observations, not authorization to overwrite later changes.

- P/tools/Publish-FilmQaToStoryboardsSite.ps1 SHA256 D9DF54E222BDBD7E8E1CCFC9E3D622B25056F201DE5C864A361385B67B96CC37.
- Scanner SHA256 4D402F63CA71B0A337FC7085F5EAD5E40F0C81F0501AF3A3BF758487DB431E43.
- FilmQaSitePublisher SHA256 F10AC67EF159B86C6C20777087D7C33DF208AA704EE3A6B7A961D77BDDBA576A.
- StudioWindow SHA256 A9E6E02DED9093A59CAB5BDA74989325FAE3DF0BC4077AD52F211A10F1E455E6.
- RepairReport SHA256 79673CE6444AD29EDFF44E3A677C60081E4BB53DDE6869FEF8067E6BAC6DB561.
- SITE film-qa.html blob SHA 3d7992c4b9c218ffbb7a8a5e595abc3aafe4991e.
- SITE designer-ai/simple-preview.html blob SHA 3d4d93bf401ed4079d690285bb167eca592b04e5.
- SITE cutscene-preview.html blob SHA 326e2fbc8ebdd93a5bf403af45f04e6c18ab7cf3.

## Self-review and handoff

- All twelve design sections map to A–D: entry/history/recovery A, language/causality B, discovery/animation C, camera/visual/persistence D.
- Refresh-age prompting is included in A2: show index age and an optional explicit refresh request at >=14 days; use existing capture/intake. No timer/automation was created and no recurring scan is authorized by this plan.
- Native tests and rendered acceptance remain separate; supported placeholders do not become technical blockers.
- Progress and proposals never become runtime authority. Opening website/dossier cannot mutate Unity.
- Do not change 26Report status or represent this plan as a replacement project-wide workboard.
- The approved design is complete. This implementation plan now awaits the required plan review before any product source mutation; the user's existing subagent method is preserved.
