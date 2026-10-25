# Gradius 1985 Stage 1: asset and gameplay readiness, 25 October 2026

## Mandatory two-agent order
A. HUMAN-GUIDED ASSET/LEVEL DESIGN AGENT (Unity editor, no automatic JSON build): inspect EXISTING sprites, SpriteShape profiles, prefabs, animation controllers, muzzle points, damage/colliders, Big Core boss, volcano bursts, and prove real behavior. Create/fix only genuinely missing game-side prefabs or profiles. Publish an exact CURRENT asset-ID and READY receipt after inspection.
B. AUTOMATIC LEVEL BUILDER AGENT: only when A's complete receipt is READY. Consume live LevelBuilder V6 context for a NEW scene, compile Layer0 one-time JSON through the canonical importer. Never fabricate prefabs/asset IDs; never handbuild assets.
C. REVERSE WAVE AUTHORING: only after Layer0 scene is built, follow official COPY AI JSON; verify wave rhythm, enemy routes, power-ups and boss clear.
D. QA: gameplay beginning to victory, visual proof; no fake pass labels.

## Evidence from read-only desktop audit
- Sprites: Assets/_Game/MY_Core/MY_Art/Gradious (17 files: Gradius sprites, backgrounds, Tank_gradious_1.anim); MY_Art/DGraphics (GRADIUS_MOUNTAIN.png, GRADMT2.png, VOLCANO_LONG2.png, VOLCANO_EDGE.png, VOLCANO SKY.png, GRADIUSTURRETBG-removebg-preview.png, mountain backgrounds and rocks).
- FX: Assets/_Game/MY_Core/MY_Art/VOLCANO/fire_volacno.prefab
- Profiles: Assets/_Game/MY_Core/MY_Data/LevelAuthoring/SpriteShapeProfiles/SSP_FIRE_RICH.asset and SSP_FIRE.asset
- Gameplay prefab candidates: Assets/_Game/MY_Prefabs/EnemyPrefabs/ENEMY_SHIPS/Gradius_enemy.prefab; MY_TURRET_ENEMY/TOWER_MISSILES_CUTE.prefab and TOWER_AIRBASE_LAUNCHER.prefab / TOWER_SHIP_SPAWNER_WHITE.prefab
- Boss library includes MY_Big Dish Boss.prefab, MY_Cube_Boss.prefab, MY_Mini Boss.prefab. No exact 'Big Core' proven. Do NOT substitute another boss as a finished match.
- Existence of sprite/prefab is NOT visual/gameplay validation. Existing profile animation and importer catalog identifiers require current Unity inspection.

## Open acceptance gaps
1. Match stage source artwork to frame/geometry size and visual scale. Reuse assets first.
2. Verify floor/ceiling SpriteShape profile produces correct geometry and collision in Unity.
3. Verify ship launcher attached to hatch uses RELATIVE prefab launchpoint; WaveManager global spawn is separate.
4. Verify two timed volcano crater volleys with damageable rock projectiles, pooling, no unnecessary update loops.
5. Build Big Core behavior: front shield plates, center weak point, shooting, damage stages, death and stage-clear. Inspect existing components FIRST.
6. Confirm all prefabs, animations and IDs imported, no missing references, in a saved staging or test scene.
7. Freeze READY manifest with exact paths, catalog IDs, test screenshots and statuses. Only then unlock Builder.

## Technical constraint
At 25 October 2026, Unity Editor indicated [Warning] Scene(s) Have Been Modified for SCENE_Cutscene_Workshop; no dialog dismissed and no scene edited. A prior isolated preview recipe (NOT IMPORTABLE) and 15-wave prototype live only in C:\Users\nlpis\wkspaces\STARWARS_DELTA_WORK\GRADIUS_STAGE1_VOLCANO_20261025. Those are research drafts, NOT approved Builder input or runtime QA.

## Reference
1985 arcade stage Volcano. https://www.spriters-resource.com/arcade/gradius/asset/615475/ ; https://vgmaps.de/maps/view?m=2772 (NES comparison only).
