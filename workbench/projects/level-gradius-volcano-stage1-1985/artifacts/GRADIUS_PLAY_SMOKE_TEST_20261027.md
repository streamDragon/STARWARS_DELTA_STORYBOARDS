# GRADIUS Play smoke test, 27 Oct 2026

## Result: opening runtime PASS; entire stage NOT YET PASS

**Unity:** STARWARS_DELTA Unity 6000.7.0b6, shared single-editor MAIN workspace.

## Actual actions and evidence

1. Preserved clean SCENE_Cutscene_Workshop with Unity's SaveScene(..., saveAsCopy=true) into `STARWARS_DELTA_WORK/GRADIUS_STAGE1_VOLCANO_20261025/PREPLAY_ACTIVE_SCENE_QA_20261027.unity`.
2. Stored prior `EditorSceneManager.playModeStartScene` (empty) in `PLAY_QA_RETURN_STATE_20261027.json`, and temporarily used `GRADIUS_VOLCANO_01.unity` as the Play start scene without replacing the stored Workshop scene.
3. Unity reported `GRADIUS_ISOLATED_PLAY_START`, backupCreated=true.
4. Native Unity Play runtime snapshot at time 0: active scene GRADIUS_VOLCANO_01; WavesManager present; both rooftop SILO instances active, one rotated 180°, each door closed, neither released ships yet; three robot authoring markers present. Initial network manager was not listening.
5. Second runtime snapshot at **Time.time=10.790741**: WavesManager km=6.89192438; NetworkManager **IsListening=true**; both SILOs still active and closed with release count 0. Their world X had decreased by about 8.29 units relative to time zero, demonstrating real scroll movement.
6. Before a later snapshot could be obtained, another editor action ended Play; next Unity call returned NOT_PLAYING and active scene was restored to SCENE_Cutscene_Workshop, clean.
7. Immediately restored `EditorSceneManager.playModeStartScene` from the recorded prior state: Unity confirmed oldStart=GRADIUS_VOLCANO_01, newStart empty, active SCENE_Cutscene_Workshop, dirty=false.
8. Read-only authored wave introspection returned NullReference, so no wave-count statement can be certified by that query.

## What was NOT demonstrated

- Actual flight from ceiling silo, its door clearance and collision-free descent: no launch occurred in the 10.79s sample before silo entered the camera.
- Robot SpriteShape traversal: only marker transforms observed, no live robot traversal proof.
- Complete video-source wave matching, complete turret census, precise source terrain positions or full stage play through mountain defeat.
- Runtime projectile pooling defect remains unconfirmed.

## Status

**OPENING_RUNTIME_SMOKE_PASS / FINAL_ACCEPTANCE_OPEN**. No new scene, Prefab or weapon files were changed; no new Plastic check-in is attributed to this attempt. Preserved other agents' scenes. Do not characterize this report as a full GRADIUS victory.
