# GRADIUS — Main-agent integration audit, 2026-10-26

## Scope
The playable target is **the entire original Stage 1 sequence from its opening to the end of the twin-volcano eruption**, with new art and faithfully measured terrain, enemy and turret positions. The research agent owns measurements only. No retroactive claim of one-to-one reconstruction is allowed.

## Actual state
- Unity project STARWARS_DELTA, Unity 6000.7.0b5; open active scene is `SCENE_Cutscene_Workshop` with unsaved edits from another workstream. **Do not switch or save it.**
- Plastic `/main` head observed at cs:9527. This audit did not perform Plastic check-in.
- Existing created boss: `GRADIUS_VOLCANO_MOUNTAIN_BOSS.prefab` with two gravitation MLBs (structural inspection passed earlier, runtime firing untested).
- Both new, reloaded tower prefabs are verified Unity **Variants** of `TOWER_MASTER_BASE.prefab`:
  - `GRADIUS_CUTE_BASE_VARIANT.prefab`: `WeaponOnly`, one `MY_WeaponCommand`, `GRADIUS_CUTE_Gun.controller`. **Intentional user-approved behavior: the gun animation runs continuously and independently of projectile firing. This is not a defect.**
  - `GRADIUS_SILO_ROOF_VARIANT.prefab`: `ShipSpawner`, four roof animation states (Closed/Opening/Opened/Closing), three collider paths, `NetworkAnimator`, `SILO_LAUNCH_POINT`, five-knot `SILO_UPWARD_LAUNCH_SPLINE` and default `FIRE_BIRD_enemy`. **Actual ship launch and collision-clearance are not Play-tested**.
- Confirmed source `TowerShipLauncher.cs`: never launches until `WavesManager.IsReadyForTowerReleases`, gameplay camera proximity, authority, and `TowerWeaponBrain.AllowsShipRelease`. Door uses Open and Close triggers; nearest camera and server authority must be tested. `WavesManager.TowerRelease.cs` uses the tower's explicit spline and relative launch anchor; it refuses classification problems. This is why inspecting the Prefab is insufficient proof of release.
- Unity prefab classifier examined 11 available enemy assets; `FIRE_BIRD_enemy`, `Gradius_enemy`, `SPACESHIPGR`, `Red_Enemy`, `atom_enemy`, `Ship`, `Cube_Enemy` and several others are valid `Spline` class, `NetworkObject` present, and SpriteRenderer present. For Gradius-flavored appearance, `Gradius_enemy` / `SPACESHIPGR` exist, but no final ship selection without gameplay test. The source `FIRE_BIRD_enemy` is structurally valid for the current silo.
- The research agent's source-research `status.json` is now revision 3. It records source image still inaccessible, **0 world-map anchor measurements, 0 exact events and 0 routes**. There are two hatch screenshot observations and at least 5 supported source observations, but none are world-coordinate placements. Do not convert nominal 320x180 thumbnails into world X/Y.

## Required integration gates
1. **CUTE**: a Play test must observe `MY_FireBullet.SpawnAttemptSequence > 0`, `LastSpawnDiagnostic == spawned-local`, live projectile and continuously looping gun animation; event coupling is explicitly NOT required. Existing `TowerMissilesCuteRuntimeProofTests.cs` tests old original prefab with a different hierarchy and must be adapted for the new Variant.
2. **SILO**: a Play test must prove initial roof closed, Open before release, actual enemy spawned at `SILO_LAUNCH_POINT`, continuous vertical travel through an unobstructed roof, Close after release, authoritative network event. `FIRE_BIRD_enemy` passes structural prefab role classification but movement is unverified.
3. **Volcano boss**: two MLB gravitation shots, actual projectile collision/damage and boss defeat must be verified in Play Mode. Source animation timing pending research.
4. **Research handoff**: original terrain camera-scroll calibration, cannon counts and X/Y, hatch count/locations, exact enemy spawns/paths, stop-scroll start/end and timed twin eruptions. 15 local waves are not canonical.
5. **Level building**: use canonical Level Builder V6 and fresh scene-specific context after research; then Reverse Wave Authoring; then full Play QA from time 0 through the eruption. Never mark DONE using only a storyboard or prefab inspector.

## Site consistency
The site workbench remains the one project dossier. We must not create a separate level; reference this report under its sourceArtifacts. Keep all measurements in research-agent-owned `source-research/`.

**Acceptance state: ASSETS_PARTIAL, LEVEL_NOT_BUILT, PLAY_NOT_TESTED.**
