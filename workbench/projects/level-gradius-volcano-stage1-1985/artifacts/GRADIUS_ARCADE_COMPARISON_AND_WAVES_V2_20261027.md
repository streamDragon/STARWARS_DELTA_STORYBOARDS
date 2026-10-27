# GRADIUS Stage 1 — visual comparison and wave integration, 27 October 2026

## Actual visual sources inspected
- Primary 30fps volcano contact sheet: `source-research/evidence/VOLCANO_30FPS_CONTACT.png`, notably frames 109–123s. Two brown peaks change to red, simultaneously ejecting many moving rocks.
- Independent 1080p60 video contact sheet: `source-research/evidence/SECONDARY_ROM_1080P60_CONTACT.jpg`. Shows open-air waves first, then irregular ground/ceiling geometry, terrain fixtures, floating rock. Different recording timing cannot be directly equated.
- Existing Unity QA screenshot: `runtime/visualqa/outputs/capture-slot-4/level-GRADIUS_VOLCANO_01-20261026122500100/overview.png`. Unity currently has thick orange horizontal bands; less interesting silhouette and less faithful than historical stage.

## Key discrepancy findings
1. Stage layout: arcade has comparatively thin irregular terrain boundaries and separated open space. Current Unity foreground has thick filled orange ceiling and floor bands.
2. Volcano moment: historical screen shows two distinct tall triangular peaks turning red together and emitting numerous scattered stones. Unity's current scene event needs explicit before/after color transition and a substantial particle/rock arc hazard.
3. Encounter density: original reference has continuing small aerial formations, while initial provisional waveplan had 13 widely separated waves and only two ships in ordinary groups.
4. Turrets: 21 video panorama candidate fixture ranges still contain overlaps/duplicates, so do not place all as confirmed.
5. Yellow lines in Unity Scene screenshots are editor gizmos and bounds, not a reason to delete gameplay colliders or confiner.

## Wave gameplay changes actually made
- Created `GRADIUS_STAGE1_SOURCE_INSPIRED_WAVES_V2_20261027.json` with **19 waves** (13 old, six additional air formations), retained three robot waves and mountain boss, and increased ordinary air formation counts/cadence.
- The first importer attempt failed validation on sixteen stale existing scene spawn marker paths.
- Removed the invalid explicit `spawnPoint` field only from non-robot waves; canonical dynamic/default spawn point resolves them at runtime.
- Subsequent canonical importer diagnostic reports `success: true`, `failureKind: none`, `Replaced all stages and saved 19 wave(s).`
- Saved Unity scene changed from 336941 to 392946 bytes. Scoped Plastic SCM MAIN check-in succeeded: **cs:9587**.
- Published the identical authoring JSON to `artifacts/GRADIUS_STAGE1_SOURCE_INSPIRED_WAVES_V2.json` (GitHub commit 55c8713).
- New Level QA capture attempted after wave import; still marked pending if publisher has not confirmed completion. A previously confirmed run `level-GRADIUS_VOLCANO_01-20261027191129096` exists in public QA for review.

## Acceptance status
**Improved encounter density/import PASS; source-accurate terrain, tower census, ceiling silo release, robot movement, volcano particle event and complete game acceptance NOT PASS.** V2 wave parameters are original authoring approximations, not directly measured Konami timings. Only publish QA frame as NOT_REVIEWED until manual user inspection.

## Manual QA entry
- Level studio: https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/level-studio.html?id=level-gradius-volcano-stage1-1985&tab=qa
- Published GRADIUS run: https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/level-qa.html#level=Assets%2F_Game%2FMY_Core%2FMY_Scenes%2FHAGGAI_STUFF%2FGRADIUS_VOLCANO_01.unity&run=level-GRADIUS_VOLCANO_01-20261027191129096
- Unity scene: `Assets/_Game/MY_Core/MY_Scenes/HAGGAI_STUFF/GRADIUS_VOLCANO_01.unity`; open and Play directly, check flying formation timings, floor/ceiling SILO, three robot encounter windows (45/63/102 km), volcano at approx 116 km, and exit.

