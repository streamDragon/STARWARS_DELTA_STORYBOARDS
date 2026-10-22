# STARWARS DELTA authoring continuity protocol · version 1

The repository is the durable editorial record. The website is a reader and copy entrypoint, not a Unity executor or an authenticated editor. Never store credentials on the website. Use the same `START_HERE.txt` for every bootstrap; project progress belongs in records, not in the bootstrap.

## Open or resume

1. Fetch this protocol and `workbench/index.json` fresh from `streamDragon/STARWARS_DELTA_STORYBOARDS`, branch `main`, through GitHub tools or raw GitHub URLs. Do not rely on a cached chat summary.
2. For a new movie or level request, create a NEW dossier with a fresh stable ID and the supplied original brief. Never use `activeByKind` to hijack a new idea. Continue only for an explicit existing-project/resume request: resolve its stable ID (titles may repeat); use `activeByKind` only for an explicit resume without an ID, and clarify genuinely ambiguous existing identity. Do not repeat questions whose intent is already specified. Open the existing `sessionPath` and immutable history for resume.
3. Read originalBrief, current stage/status, approvedTargetRevision, decisions, targetArtifacts, exact source identity/hashes, storyboard, assets, gaps, runs, lastCompletedAction, nextAction and inFlightAction. Unknown/absent metadata remains UNKNOWN; do not invent it.
4. For any submitted or UNKNOWN operation, inspect the original request/run and actual result read-only. Do not replay a timed-out build or publisher mutation. Record UNKNOWN until evidence resolves it. Historical owner fields are not live locks.
5. Resume the recorded stage and concrete nextAction. Record the result and next concrete action at each action boundary. Preserve unknown user fields and original source bytes. No automatic deletion, rebuild, scene overwrite, source normalization or background polling.

## Existing authoring systems remain authoritative

Film uses the freshly resolved CURRENT sealed `CUTSCENE_SCRIPT_V1` contract and normal Studio route. Anime Emotion, Dialogue and MOVES retain their roles; Cinematic Director connects causality, reaction, shot purpose, camera, rhythm and editing. System 4 is not a new public import schema. Record CURRENT identity and exact V1/source artifact hashes. Consult the actual current guides and Director recipes before authoring; a semantic plan is not native V1 acceptance.

Level uses the existing Level Builder JSON workflow and Level QA; Reverse waves follows level creation. Do not replace these systems with a parallel format.

With Remote access, read canonical MAIN's AGENTS.md and applicable workflow skills before Unity operations. Respect the current integration owner and manual changes. Without Remote, author plans/JSON and update the repository; mark actual Unity operations `PENDING_REMOTE`. Do not claim built, played, captured or accepted from an offline plan, proxy or text export.

Search relevant ArtPack, Graphics, MY_Art and other requested sources using the current asset tools. A page of 24 recommendations is not a discovery limit: distinguish discovered, cataloged, eligible, handle-emitted and surfaced counts, and distinguish upstream candidate selection from UI paging. Record exact requested/resolved paths or handles, sourceFolder, builtInAnimation, property ownership and evidenceStatus. Check existing Animator/particles and writers before adding Timeline control. Gaps preserve the exact request, placeholder, replacementAction and status; no search result is not proof an asset does not exist.

## Record contract

Index: `schema=STARWARS_DELTA_AUTHORING_WORKBENCH`, `version=1`, `projects[]` with `{id,kind,title,sessionPath,revision,stage,updatedUtc}`, and `activeByKind`.

Session: `schema=STARWARS_DELTA_AUTHORING_SESSION`, `version=1`, stable slug `id`, `kind=film|level`, `title`, `revision>=1`, `stage`, `status`, `updatedUtc`, `originalBrief`, `approvedTargetRevision` (0 until approved), arrays `targetArtifacts`, `storyboard`, `assets`, `gaps`, `decisions`, `runs`, `history`, `sourceArtifacts`, and `lastCompletedAction`, `nextAction`, `inFlightAction|null`, `currentIdentity` (object/string/null). Unknown additional fields are preserved.

Film stages: BRIEF → STORYBOARD → ASSETS → TARGET_REVIEW → AUTHORING → UNITY_BUILD → QA → REVISION → COMPLETE.
Level stages: BRIEF → DESIGN → ASSETS → TARGET_REVIEW → LEVEL_JSON → LEVEL_BUILD → LEVEL_QA → WAVES → GAMEPLAY_QA → COMPLETE.
Stages describe work location; they do not infer quality. Revisions may revisit stages. COMPLETE requires a decision `{id,type:"USER_ACCEPTANCE",accepted:true,reference:"exact user message / approval reference"}`. Technical PASS or successful capture does not supply that decision. Never generate a user acceptance claim yourself.

Artifacts contain `{path or url,kind,label,sha256,evidenceStatus,runId?}`. `attach` stores exact supplied bytes and SHA256, with SOURCE_ATTACHED; it never certifies capture. A text export's hash identifies export bytes, not the remote original file unless independently verified and recorded as such. Reference/inspiration, plan, asset composition and actual capture remain distinct. An actual capture needs kind=capture, evidenceStatus=CAPTURED, runId and provenance of the real run. Local Windows paths remain visible text, not browser images.

Each run has an exact id (or legacy runId), source identity/targetRevision when known, and separate capture, technical, cinematic and runtime statuses. Legacy captureStatus/technicalVisualQa/cinematicQa/runtimeQa are supported without converting PASS into ACCEPTED. Authoring wave projections are composition evidence, not runtime capture. Preserve failed attempts and review-required runs. The latest attempt does not replace the approved target or latest explicit acceptance.

## Persistence CLI

Node built-in modules only; authenticated `gh` provides GitHub transport. Run from this checkout:

```sh
node tools/authoring-session.mjs bootstrap
node tools/authoring-session.mjs init --id my-film --kind film --title 'My film' --brief-file /path/to/brief.txt
node tools/authoring-session.mjs read --id my-film
node tools/authoring-session.mjs update --id my-film --expected-revision 1 --patch /path/to/patch.json
node tools/authoring-session.mjs attach --id my-film --expected-revision 2 --file /path/to/exact-source.json --kind reference --label 'Source supplied by user'
node tools/authoring-session.mjs inspect-inflight --id my-film
```

Patch is a top-level JSON object of changed fields. Arrays are replacements: include all prior entries when extending them. Identity, schema/version, revision, history and updatedUtc are protected. Append decisions/runs; do not discard evidence. The CLI updates revision/time/history and activeByKind, preserves other fields, and writes the session, `revisions/000001.json` etc., index and optional attachment together in one Git tree commit/ref update. Existing revision snapshots cannot be replaced.

`--repo owner/repo --branch branch` overrides GitHub target. `--local-repo DIR` is an offline filesystem/test transport: exclusive writer lock, staged files, optimistic index guard; no network and no git commit. Its multi-file rename sequence is not crash-atomic across filesystem failure: interrupted local writes require read-only inspection and reconciliation before continuing. Production GitHub transport has a single atomic ref publication boundary.

GitHub writes use blobs → tree based on original commit tree → commit with original HEAD as its single parent → re-read HEAD → non-force PATCH ref. Revision and HEAD must both still match. There is no mutation retry. A conflict must stop; re-read session/HEAD, compare changes and prepare a new explicit patch. Ref failure/timeout may leave unreachable blobs/commits or an unknown publication result; inspect current ref/session before doing anything else. `inspect-inflight` is read-only and never resumes or clears operations automatically.

## Equivalent GitHub connector transaction

If the agent lacks CLI but has GitHub tree APIs: read branch HEAD SHA H, its tree and the current session/index at H; check expected session revision. Prepare the same revision snapshot, updated session and index plus exact-byte artifacts as blobs. Create ONE tree using H's tree as base, ONE commit with parent H, then guard that ref is still H and update non-force to that commit. A competing branch advance makes the new commit a sibling and must fail fast-forward. Do not use sequential Contents API updates for session/index/snapshot; do not force-push or retry. If a connector cannot create trees or atomically update the ref, export a JSON update proposal instead.

No authentication or no write permission: return an explicitly **UNSYNCED proposal** containing project ID, expected revision, patch/artifact manifest and nextAction. Never claim saved. The website has no authoritative localStorage session or editing endpoint.

Read full CURRENT catalog chunk paging before declaring missing art. Featured actors and recommendation cards are a selected subset of legal actors, not the inventory; inspect all relevant Actor/Layer/Effect/Audio/Ui/Animation chunks and record search coverage. Do not pin a historical CURRENT transaction in the stable bootstrap. Fresh canonical AGENTS.md and explicit user policy take precedence over older published startHere blocking claims: recoverable content gaps become warnings/placeholders while the original V1 is preserved; inability to read input or create/save a basic Unity product remains a blocker.

When the connected GitHub plugin exposes `create_blob`, `create_tree`, `create_commit` and `update_ref`, use that route directly even if local gh is unauthenticated. Concretely: read `heads/main` and session/index at its SHA H; `create_blob` for each exact artifact and JSON record; `create_tree(base_tree=H.tree, tree=[session,snapshot,index,artifacts])`; `create_commit(tree=newTree, parents=[H])`; then `update_ref(ref="heads/main", sha=newCommit, expected_sha=H, force=false)`. The explicit expected_sha compare-and-swap is required when available. Re-read ref/session on conflict, never overwrite. No CLI login or credential request is necessary when this connected route is sufficient. Local gh authentication is an optional prerequisite of the CLI GitHub mode, not a claim that the current host is authenticated.


## Concrete repository entrypoints

Always start with the fresh [OPEN_CURRENT.json](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/designer-ai/open-current/OPEN_CURRENT.json), verify CURRENT_VERIFIED and follow its matching identity. Then read the matching [CHATGPT_AUTHORING_INDEX.json](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/designer-ai/open-current/CHATGPT_AUTHORING_INDEX.json), [V1 schema](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/designer-ai/open-current/simple-authoring/CUTSCENE_SCRIPT_V1.schema.json), [legal handles](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/designer-ai/open-current/simple-authoring/AUTHORING_HANDLES.json), [authoring rules](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/designer-ai/open-current/simple-authoring/AUTHORING_RULES_CURRENT.json) and all relevant categoryChunks listed by that same starter. These URLs do not pin a transaction; verify matching identity on every request.

Current archive indexes: [Film QA](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/film-qa/index.json), [Level QA](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/level-qa/index.json). Their report/frame links establish provenance only to the extent actually recorded. The adapter recognizes exact Level QA source values `level_urp_scene_camera_render`, `gameplay_camera_urp_offscreen_postprocessing`, `actual_editor_game_view_texture` as capture provenance with COMPLETED/PARTIAL capture status; explicit kinds/statuses win. `authoring_wave_projection` and `authored_wave_schedule` are composition evidence. Bare keyFrames paths and arbitrary camera/render substrings remain UNKNOWN.

The [integration session](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/workbench/projects/cinematic-system-integration/session.json) records the following imported source exports. Read their recorded provenance and distinguish export hashes from original remote bytes. These snapshots aid continuity; fresh canonical MAIN/AGENTS and explicit user instructions govern current execution.

- [התכנון המאושר](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/workbench/projects/cinematic-system-integration/artifacts/45f543564a42ce9926e816c59bb59dc7e4734f9dd5b9f385a100590a01948fee-CINEMATIC_INTEGRATION_DESIGN_20261022.html)
- [תכנית מימוש וקבצים מדויקים](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/workbench/projects/cinematic-system-integration/artifacts/ce0a53ae9d14e31178359a3c98182b0bebb8d3cb8807f0c215dd123f0f2741b5-CINEMATIC_INTEGRATION_IMPLEMENTATION_PLAN_20261022.md)
- [PROJECT_AGENTS.md](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/workbench/projects/cinematic-system-integration/artifacts/e06f3596245d2af9265e6bc247d5dd14093f13736705055a311b5a8be6522803-PROJECT_AGENTS.md)
- [LEVEL_BUILDER_WORKFLOW.md](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/workbench/projects/cinematic-system-integration/artifacts/0d3fe25598635b8a8ad2d24aed88059c660294f01d4cdd68159c002455686df3-LEVEL_BUILDER_WORKFLOW.md)
- [LEVEL_UNITS_AND_EVIDENCE.md](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/workbench/projects/cinematic-system-integration/artifacts/b6f5122ffd3b1acc4d9a8c97691467df8bb5ad7e5344d303675c495d21092224-LEVEL_UNITS_AND_EVIDENCE.md)
- [ART_INTAKE.md](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/workbench/projects/cinematic-system-integration/artifacts/51c9327da3857421f2d4e75f175968cd97bacae5ffdf96f625cd9965b9919a90-ART_INTAKE.md)
- [CHATGPT_START_CURRENT.txt](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/workbench/projects/cinematic-system-integration/artifacts/43d9dfc6ad5f3b374274c3ae15d50271dff924d00f78f405a87d460b8bb71ee1-CHATGPT_START_CURRENT.txt)

The public workbench reads index/session/artifact/history URLs from raw GitHub main to avoid deployment lag; loopback previews read local files. A revision mismatch between index and session is a refresh error, never an authoritative last stage.

## Browser preview continuity

Selected films link to `cutscene-preview.html?session=<stable-id>`. Attach an explicit `kind: source` artifact with repository `path`, exact SHA256 and JSON schema `STARWARS_DELTA_CUTSCENE_SCRIPT` for attributed playback. Semantic plans are not V1. A missing native source requires materialization through the existing Unity V1 route; preserve original bytes. Browser playback and cursor are local conveniences marked `NOT_RUNTIME_PROOF`, never native acceptance or full MOVE coverage. Levels continue through Level Builder/Level QA, then Reverse waves.

Preview source selection is exact: `?run=<id>` must name an existing run and uses only its `artifacts`/`sourceArtifacts` source entries, references to session source paths/IDs, or session sources explicitly tagged with that runId. It never falls back to untagged global sources. `source` and `run` intersect. Session-only preview with several native sources requires an exact `?source=<path-or-id>` or explicit session `currentSourcePath`; array order is not current-source authority. If neither exists, preview reports SOURCE_AMBIGUOUS and links back to the dossier. A single verified V1 source remains usable without extra metadata.

For visual art discovery, also read the fresh shared [MY_Art policy](https://raw.githubusercontent.com/streamDragon/STARWARS_DELTA_STORYBOARDS/main/designer-ai/my-art-policy.txt), used by the catalog, Devora and Level Builder. Follow its configured paths and visual evidence; do not create a second competing inventory.
