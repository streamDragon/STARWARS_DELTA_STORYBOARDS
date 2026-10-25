# GRADIUS 1985 Stage 1 Volcano | Live verification 2026-10-25

## Verified state
- Web workbench index: `level-gradius-volcano-stage1-1985`, stage `ASSETS`, revision 1 at inspection.
- Active project on desktop: `C:\Users\nlpis\wkspaces\STARWARS_DELTA`; Unity 6000.7.0b5 editor PID 60348, currently `SCENE_Cutscene_Workshop`.
- Requested new scene `Assets/_Game/MY_Core/MY_Scenes/HAGGAI_STUFF/GRADIUS_VOLCANO_01.unity`: absent (full directory listing).
- Dedicated local draft: `C:\Users\nlpis\wkspaces\STARWARS_DELTA_WORK\GRADIUS_STAGE1_VOLCANO_20261025`, containing code generator, a non-importable Layer0 preview and `GRADIUS_VOLCANO_01_WAVES.json` with **15 proposed waves**.
- Unity asset probe exists and shows existing art, prefab candidates, profiles. Existence/serialized content does NOT establish that they run.
- Published `level-qa/index.json`: six runs, **none for GRADIUS_VOLCANO_01**.
- Plastic `cm status --short --noheaders`: a different active modified file, `Assets/Tests/WaveSpawnPlacementLivePlayModeTests.cs`. Never check in unrelated changes.
- No fresh scene-specific Level Builder V6 context, no import receipt, no imported waves, no actual Play QA, no completed Big Core or volcano gameplay evidence.

## Important defects found in local draft
- Level Builder generator presently defines `GUN` under `.../MY_TURRET_ENEMY/_TowerBases/TOWER_MISSILES_CUTE.prefab`; confirm against actual prefab/catalog and correct before execution. Its proposed boss is explicitly a **proxy** and not an implemented Big Core.
- Proposed stage length 210 KM and sections 0-20, 20-65, 65-115, 115-154, 154-184, 184-210 are **design approximations**, not original measurements.
- The wave JSON uses old scene-specific spline/spawn paths from First_5_Level. Must generate from fresh GRADIUS scene via Reverse Wave Authoring and test actual trajectories.
- The `fire_volacno.prefab` is FX, not a verified timed rock-volley gameplay controller.
- Workbench Level Studio can correctly show this dossier but cannot synthesize a Layer 0 or wave timeline from drafts. A blank map is an evidence gap, not a site rendering success.

## Mandatory next sequence
1. Preserve/save current `SCENE_Cutscene_Workshop` user edits without silently dismissing unsaved changes; use an available safe Unity Editor session.
2. Inspect candidate Big Core parts/laser/shield and volcano emitter, launchpoint, prefabs with exact scene/prefab references. Implement missing gameplay behavior and prove in a focused sandbox scene. Produce `ASSETS_READY` receipt with IDs only on successful tests.
3. Via canonical Level Builder create a new dedicated `GRADIUS_VOLCANO_01` scene and export fresh V6 request/context. No fabricated IDs.
4. Repair generator against current asset catalog, produce/import new Layer0, check continuous floor/ceiling and camera/colliders.
5. Import/test waves through Reverse Wave Authoring. Replace any proxy boss wave with confirmed Big Core gameplay.
6. Run full stage Play QA to victory, publish Scene/Game View screenshots and timeline, then Plastic MAIN check-in and RunSmartPublish. Do not claim completion before those receipts.

**Result of this audit: ASSETS BLOCKED, GAMEPLAY NOT TESTED.** This report is documentary evidence only.


## Continuation: generator repair verified
- Confirmed actual `TOWER_MISSILES_CUTE.prefab` at `Assets/_Game/MY_Prefabs/EnemyPrefabs/MY_TURRET_ENEMY/TOWER_MISSILES_CUTE.prefab`; corrected bad `_TowerBases/` path in staging generator `GRADIUS_STAGE1_VOLCANO_20261025/build_from_levelbuilder_context.py`.
- Added fail-closed protection: if mandatory tower prefabs are absent from the fresh CURRENT Builder catalog, generator throws an explicit error **before producing import JSON**. No silent omission.
- Ran `python -m py_compile build_from_levelbuilder_context.py` PASS; ran generator without LevelBuilder context PASS; parsed generated draft `GRADIUS_VOLCANO_01_WAVES.json`: 15 entries. **No Unity import, real Big Core or Play pass claimed.**
- Plastic workspace `/main@STARWARS_DELTA@firebird721@cloud` changeset 9509; unrelated modified `Assets/Tests/WaveSpawnPlacementLivePlayModeTests.cs` remains untouched.
