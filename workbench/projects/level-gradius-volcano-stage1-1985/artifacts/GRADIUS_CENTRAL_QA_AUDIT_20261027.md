# GRADIUS 01 | Central agent QA audit | 2026-10-27

## Result

**State: PARTIALLY PLAYABLE; NOT A COMPLETED 1:1 ARCADE REPRODUCTION.**

Unity 6000.7.0b6 editor MCP was reachable; the prior blocking Save Scenes modal is no longer present. The current active scene is SCENE_Cutscene_Workshop and is clean. GRADIUS_VOLCANO_01 was safely inspected additively, loaded without a dirty state, and not overwritten.

## Current in-scene objects (verified directly with Unity Editor API)

- GRADIUS_CONTINUOUS_FLOOR / GRADIUS_CONTINUOUS_CEILING: editable SpriteShapeController with 24 and 21 spline knots; separate armed rock shape with 4 control points, each solid with PolygonCollider2D.
- Four GRADIUS_CUTE_BASE_VARIANT instances, two floor and two ceiling, parented to local marker transforms under Layer0.
- Two GRADIUS_SILO_ROOF_VARIANT instances, one floor and one ceiling, with 3 polygon collider paths each.
- GRADIUS_VOLCANO_MOUNTAIN_BOSS instance at world (183,-6.4), within Layer0.
- Scene stored at Assets/_Game/MY_Core/MY_Scenes/HAGGAI_STUFF/GRADIUS_VOLCANO_01.unity.

## Existing Play evidence inspected

- PLAY6_KEYBOARD_FIRE_PROOF.json: player fire action pressed and one shot emitter records 3 spawn attempts with LastSpawnDiagnostic=spawned-local.
- boss_silo_play_20261026.json (128s sample): floor silo m_released=3, roof animator state Opened=true, second silo remained Closed. The same record shows boss gun emitters with SpawnAttemptSequence=9 and spawned-local for working points, but **some points report blocked-shot-missing-MY_ShotBase**. These require separate projectile cleanup/fix; do not claim every emitter is valid.
- PLAY6_BOSS_RESOLUTION_PROOF.json (309.7s): WavesManager km approximately 116.01; volcano boss becomes inactive, IsSpawned=false, state=DeadDespawned, BossPartHandler destroyed. Player can move/fire and has 10 health. This is evidence of boss resolution, not full arcade fidelity.
- PLAY6_CONSOLE_WARNINGS_ERRORS.json: editor ground truth compileFailed=false, compiling=false, consoleErrors=0, warnings=1. Warning describes FIRE_BIRD external exit cleanup. Historic event counter may contain older errors; use groundTruth rather than cumulative counts for the sampled moment.

## Remaining work and gates

1. Fix missing MY_ShotBase projectile bindings on the subset of boss emitters; re-run projectile QA.
2. Confirm both roof silos launch correctly, including ceiling orientation, real animation transitions, door clearance and authority.
3. Verify robots can traverse existing SpriteShape surfaces without NAV fallback.
4. Full level length and original arcade placements/waves are still not proven 1:1; source agent measurements remain separate.
5. Capture a continuous first-to-last Play test and update Level Studio status after verification.

Do not change unrelated user scenes or publish to CURRENT unless a valid RunSmartPublish execution succeeds.

## SVN/Plastic

Workspace observed on /main cs:9555. No new Plastic check-in is claimed in this audit; the scene was read-only inspected.

## Reporting

This is a QA audit, **not** a final completion certificate.
