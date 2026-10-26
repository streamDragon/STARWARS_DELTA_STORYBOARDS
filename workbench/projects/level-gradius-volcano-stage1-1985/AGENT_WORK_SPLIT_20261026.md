# GRADIUS ARCADE Stage 1 — parallel-agent working contract (2026-10-26)

## One source of truth
- Site dossier: https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/level-studio.html?id=level-gradius-volcano-stage1-1985
- Stage scope: Japanese Arcade Stage 1, until end of twin volcano event; art is original. **No original Big Core**.
- Source map: `workbench/projects/level-gradius-volcano-stage1-1985/ARCADE_STAGE1_SOURCE_MAPPING_V1.json` (baseline, currently no verified map coordinates).
- No runtime edits in source agent scope: Unity scene, prefabs and gameplay scripts are exclusively main agent work.

## Agent ownership and collision rules
| Domain | Research agent | Main agent |
|---|---|---|
| `workbench/projects/level-gradius-volcano-stage1-1985/source-research/` | **Sole writer**, checks source/camera/mob timings; updates status.json, evidence and observed JSON files | Reader only until handoff |
| `workbench/projects/level-gradius-volcano-stage1-1985/session.json`, `workbench/index.json` | **Read only** | Sole writer; index and session revisions must always match |
| `gradius-source-map.html`, `level-studio.html`, `assets/level-*.js` | **Read only** | Sole writer |
| Unity scene/prefab, LevelBuilder V6, Reverse Wave Authoring | Read only | Sole writer |
| `workbench/projects/level-gradius-volcano-stage1-1985/ARCADE_STAGE1_SOURCE_MAPPING_V1.json` | Read only; submit measured observations in source-research | Sole writer promotes verified measurements on evidence review |

If another writer appears in the same path: fetch the current blob SHA and merge instead of overwriting. Do not create other source-of-truth docs that contradict CURRENT or the project dossier.

## Research agent artifact contract
Write ONLY the following paths in this directory:
- `source-research/status.json` (schema below; update after new evidence, not before)
- `source-research/GRADIUS_ARCADE_STAGE1_TERRAIN_V1.json`
- `source-research/GRADIUS_ARCADE_STAGE1_OBJECTS_V1.json`
- `source-research/GRADIUS_ARCADE_STAGE1_EVENTS_V1.json`
- `source-research/GRADIUS_ARCADE_STAGE1_ROUTES_V1.json`
- `source-research/GRADIUS_ARCADE_STAGE1_EVIDENCE.md`

Each object/event has source_id, source_version, coordinate_space (`SOURCE_MAP_PIXEL` / `VIDEO_FRAME_PIXEL`), original_x/y only when measured, video_time_s only when verified, and an evidence reference with inspectable source URL and location/time. Never map a source video screenshot pixel directly to map pixel without camera/scroll calibration.

`status.json` fields: `schema`, `revision`, `updatedUtc`, `owner`, `researchState`, `sourceMapObtained`, `videoFrameSamplingDone`, `measuredObjectCount`, `measuredEventCount`, `measuredRouteCount`, `verifiedEvidenceCount`, `artifacts`, `blockingIssues`, `lastCommit`.

Valid evidence: VERIFIED_MAP_PIXEL, VERIFIED_VIDEO_FRAME, SUPPORTED_MECHANIC, USER_ANNOTATION_PENDING, UNKNOWN. Measured means coordinates or times actually extracted, not inferred from an encounter description.

The researcher may commit incrementally to MAIN in its **own** paths, preserving all metadata. If it cannot access the map due to 403, it must use another lawful public reference and document the source/version.

## Main-agent handoff
Main agent reads each research artifact, validates no invented X/Y and source/viewport consistency, promotes acceptable measurements into a Level Builder-ready placement plan, then performs canonical Level Builder V6 scene build. Waves are generated **after** the real scene and anchor IDs exist. Play QA must demonstrate original pacing, hatch animation, CUTE firing and two-peak volcano boss.

## Do not confuse evidence states
- Site project stage does not imply Unity scene is built.
- Source map viewer preview is a research visualization, not Layer 0 and not playable footage.
- `GRADIUS_VOLCANO_01_WAVES.json` with 15 local draft waves is NON-CANONICAL; measured source events supersede it.
- Completion requires successful Unity Play QA through the volcano sequence, then MAIN check-in and RunSmartPublish, not merely a dossier update.
