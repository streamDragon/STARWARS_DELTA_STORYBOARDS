# GRADIUS Arcade Stage 1 — Source Research Handoff (2026-10-26)

## Scope and ownership
Research-only delivery for the full stage opening through the end of the two-volcano event. No Unity scene, prefabs, gameplay, session.json, or website index changed. Original Big Core excluded from the intended remake. High-resolution Unity art is independent of source capture resolution.

## Delivered verified evidence and caveats
- 625 5Hz video samples from the available continuous recording, plus opening clip samples.
- Scroll model ~50.2 VIDEO display pixels per second before the apparent pause, approximately 110.4–111.2 recording seconds. This is not native arcade world velocity.
- Eight repeated-frame video-relative object anchors. None is a certified original arcade map coordinate. Visual census at seven timestamps indicates multiple guns near hatch-like fixtures, but no deduplicated total.
- 1,126 terrain trace points, of which 282 are represented as guide samples in the research JSON. Geometry is not collision-certified.
- Locally stitched video-derived panorama 3970×360 covering recording t=40.0–110.8s. It is not an original arcade map, and the panorama PNG is on the connected desktop, not hosted in GitHub.
- Final two volcanoes segmented at video-relative peak tops (3604,248) and (3789,248), separation 185 VIDEO pixels. Earlier mountains/rock overhang are separate geometry.

## What remains UNKNOWN and must not be fabricated
- Complete distinct turret and launcher count, exact source-map X/Y, exact entrance timings and per-enemy routes.
- Launcher opening/closing and firing cadence, frame-perfect rock counts/ballistics, exact stop/resume trigger, and the event-clear condition.
- Absolute video-to-original-arcade map origin and certified camera calibration.

## Authoritative research artifacts
- GRADIUS_ARCADE_STAGE1_TERRAIN_V1.json
- GRADIUS_ARCADE_STAGE1_OBJECTS_V1.json
- GRADIUS_ARCADE_STAGE1_EVENTS_V1.json
- GRADIUS_ARCADE_STAGE1_ROUTES_V1.json
- GRADIUS_ARCADE_STAGE1_EVIDENCE.md
- TOWER_ANIMATION_REFERENCE.md
- VOLCANO_EVENT_REFERENCE.md
- status.json

## Guidance for the main agent
Use measured video-relative anchors and the terrain polylines as EDITABLE reference guides for a high-resolution SpriteShape rebuild. Do not use approximate video positions as final original arcade map coordinates. Distinguish gun fixtures from ship-launch hatches and avoid including the original Big Core. Validate source and collision shape in Play QA before claiming fidelity.

## Status
Research handoff published, **not complete one-to-one reconstruction**. Research publication is not Unity Play QA. The user requested the report in the project research directory; this file is the final handoff summary for the main agent.

Source: https://www.youtube.com/watch?v=WJu9xSRh02g


## Handoff closeout, October 27, 2026

A source-derived panorama is now accessible at [video panorama](https://github.com/streamDragon/STARWARS_DELTA_STORYBOARDS/blob/main/workbench/projects/level-gradius-volcano-stage1-1985/source-research/evidence/PANORAMA_VIDEO_T40_T110.png), and exact selected volcano comparison frames at [contact sheet](https://github.com/streamDragon/STARWARS_DELTA_STORYBOARDS/blob/main/workbench/projects/level-gradius-volcano-stage1-1985/source-research/evidence/VOLCANO_30FPS_CONTACT.png). Independent 30fps inspection detected red eruption-state visual transition between **110.8333 and 110.8667 recording seconds**, after a separate camera-scroll pause at **110.6-110.8s**. This distinction is ready for the central agent's event authoring.

**Delivery state:** bounded source-research evidence and visual atlas delivered. Full original Arcade-map source-pixel placement, complete turret census and complete enemy-route timing still cannot be certified. Do not invent values. High-resolution Unity graphics are separate from historical measurement resolution. Original Big Core remains excluded.


## Phase 13: candidate fixtures

The visual 3970px panorama yielded 11 gun-like regions, 5 hatch-like regions, and 5 unresolved regions, published in GRADIUS_PANORAMA_FIXTURE_CANDIDATES.json. These are relative video-pixel intervals, not certified arcade-world positions. Counts must not be interpreted as authoritative distinct stage instances. The panorama source is the previous published evidence asset. No gameplay prefab, script, or Unity scene was changed.


## Phase 14 candidate verification audit

Added four inspectable five-frame contact sheets for all 21 fixture candidates. X predictions were back-projected through the measured display-space camera scroll (approximately 50.2 px/s). The user and main agent can inspect nearby shots and distinguish fixed terrain-mounted units from projectiles and moving enemies. Current **11 gun-like / 5 dome-like / 5 unresolved** counts remain *candidate visual classes*, and **none** is automatically promoted to a unique verified world-map placement or a certified final prefab count. No source map X/Y, emit timing, or route was fabricated.
