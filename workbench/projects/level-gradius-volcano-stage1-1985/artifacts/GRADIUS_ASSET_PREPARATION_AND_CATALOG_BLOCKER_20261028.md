# GRADIUS Stage 1 — asset preparation gate and catalog blocker
Date: 2026-10-28
Owner scope: Unity Level Builder, not Reverse Waves
Status: **ASSETS CREATED AND SAVED; LEVEL BUILDER IMPORT BLOCKED**

## User's mandatory procedure
1. Validate all required art and prefabs.
2. Create/reuse exactly the necessary SpriteShape profiles and tower variants.
3. Refresh official UnifiedAssetCatalog and get current Level Builder COPY FOR CHAT contract.
4. Produce version 6 Level Build JSON and import via standard Level Builder, one pass. **If a tool bug occurs, STOP and report; do not hand-build the scene as a workaround.**
5. Once Layer0 and matching QA succeed, stop and tell user; Reverse Waves is later.

## Verified assets
- 75 sliced source-art sprites already exist at `Assets/_Game/MY_Core/MY_Art/VOLCANO/` (three atlases with 10, 27 and 38 sprite subassets). Visually inspected contact sheets. No new generated image was required.
- Existing `GRADIUS_CUTE_BASE_VARIANT` has TowerWeaponBrain mode WeaponOnly, SceneTower, working gun controller and collider.
- Existing `GRADIUS_SILO_ROOF_VARIANT` has TowerShipLauncher, roof controller and collider.
- Existing `TENTACLE_10_MECH_WHIP_SHORT.prefab` and `TENTACLE_11_MECH_HEAVY_ARC.prefab` have extending hazard, damage adapters and colliders. Use ONLY mechanical visuals, not fire tentacles.
- Existing mountain boss crater contains one valid MY_WeaponCommand, MY_SpreadPattern and three MY_FireBullet components each referencing B_Gravitational.

## New prefabs/profiles created and verified through real Unity Editor APIs
- `Assets/_Game/MY_Core/MY_Data/LevelAuthoring/SpriteShapeProfiles/SSP_GRADIUS_MAGMA_ROCK.asset`: sliced original lava-rock edge sprites plus lava fill. Asset creation and serialized profile verification PASS.
- `Assets/_Game/MY_Core/MY_Data/LevelAuthoring/SpriteShapeProfiles/SSP_GRADIUS_DARK_MECHANICAL.asset`: sliced metal/rock edge sprites plus GRAD1 foundry metal fill. PASS.
- `Assets/_Game/MY_Prefabs/EnemyPrefabs/MY_TURRET_ENEMY/GRADIUS_VOLCANO_TOWER_A.prefab`: prefab variant of existing CUTE master, new volcano sprite, original gray visuals hidden, original gun disabled, copied crater command with three B_Gravitational emitters. Prefab variant and serialized references PASS; runtime fire untested.
- `Assets/_Game/MY_Prefabs/EnemyPrefabs/MY_TURRET_ENEMY/GRADIUS_VOLCANO_TOWER_B.prefab`: analogous independent second volcano variant. PASS structural, runtime untested.
- `Assets/_Game/MY_Prefabs/EnemyPrefabs/MY_TURRET_ENEMY/GRADIUS_BASALT_CUTE_TOWER.prefab`: basalt-rock visual, source tower gun tinted copper, same existing WeaponOnly mode. PASS structural, runtime untested.

**Plastic SCM**: explicitly added ten asset/meta files and checked in only these targeted paths to MAIN as **cs:9593**, successful exit code 0. No unrelated cutscene files committed. Existing active scene SCENE_Cutscene_Workshop was not changed.

## Actual blocker
After successful asset creation, invoked the existing `UnifiedAssetCatalogScanner.ScanPaths(exact five new asset paths, false)` once from Unity editor.
- Unity window subsequently showed **`Hold on (busy for 02:56)...`**; Unity MCP eval_file returned `Unity MCP tools/call timed out` (approximately 50 seconds).
- The STARWARS_DELTA `Logs/Editor.log` contains repeated `Pipeline: unhandled error serving POST /api/exec: System.InvalidOperationException: Cannot be changed after headers are sent`.
- Local LevelBuilderEligibleAssets cache was read following scan; revision changed, but searching it for the three new Gradius tower prefab paths returned **zero matching entries**. The eligible catalog projection / scan completion status for the newly prepared variants is therefore **NOT VERIFIED**.
- Without official current catalog assetIds and successful Refresh/ScanCompleted, ordinary Level Builder version 6 JSON placements must not use guessed IDs.

No Level Builder import or Layer0 replacement was attempted after this issue. No wave JSON edited. No publish/QA claim.

## Exact required correction / continuation
1. Diagnose Unity asset scanner / MCP `/api/exec` Pipeline hang; confirm the bounded ScanCompleted event and `MY_LevelBuilderLiveContext.LastSnapshot` includes all three new Tower Prefabs with valid roles and exact IDs, or report exact exclusion reason.
2. Obtain fresh current `MY_LevelChatRequestBuilder` COPY FOR CHAT from GRADIUS session to capture exact planId, blueprintId, catalogRevision, request and axis. Do not reuse stale `GRADIUS_VOLCANO_01_PREVIEW_DO_NOT_IMPORT.json`.
3. Produce ordinary `STARWARS_DELTA_LEVEL_BUILD` schemaVersion 6 JSON: Layer0 SpriteShape floor/ceiling with the two saved profiles, rock-island colliders, approved towers and mechanical tentacles, no mountains drawn in ground shapes. Use validated assets only.
4. Use `MY_LevelBuilderAutomation.TryImportAndBuildActiveSceneFile` / standard Level Builder. Stop on importer error, do not create a manual replacement pipeline.
5. Capture Level QA for actual saved scene (NOT_REVIEWED until approved), then leave Reverse Waves for subsequent task.

**This report records an actual tool failure, not a completed level build.**
