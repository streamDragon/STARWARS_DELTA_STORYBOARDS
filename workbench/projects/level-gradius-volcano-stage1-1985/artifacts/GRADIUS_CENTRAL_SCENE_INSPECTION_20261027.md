# GRADIUS main agent: current Unity scene inspection (27 Oct 2026)

## Verified directly from Unity 6000.7.0b6
- Editor is not playing, compiling or updating; active scene SCENE_Cutscene_Workshop was clean.
- Inspected GRADIUS_VOLCANO_01 additively; scene was clean and closed after inspection, with no modifications to another workstream.
- GRADIUS_CONTINUOUS_FLOOR has 24 SpriteShape spline points and a PolygonCollider2D.
- GRADIUS_CONTINUOUS_CEILING has 21 SpriteShape spline points and a PolygonCollider2D.
- Four GRADIUS_CUTE_BASE_VARIANT prefab instances exist in floor and ceiling markers.
- GRADIUS_SILO_ROOF_VARIANT floor launcher at (116.22,-5.80) and ceiling launcher at (105.78,4.76). Each has 3 collider paths and a 5-knot spline.
- Floor SILO orientation 0°; its launch anchor is (116.22,-3.96). Ceiling SILO orientation 180°; its launch anchor is (105.78,2.93) and points down. This is structurally appropriate for a ceiling hatch but needs actual Play verification.
- Three spawn marker objects: REL_REQUEST_GRADIUS_MECH_ROBOT_45 at (64.35,-8.01), REL_REQUEST_GRADIUS_MECH_ROBOT_63 at (83.59,7.73), REL_REQUEST_GRADIUS_MECH_ROBOT_102 at (123.91,-6.43). These are authoring markers, not live robots.
- No original-arcade accurate coordinates are claimed. Current scene terrain and placements remain provisional. The source agent's newer panoramic atlas and precise 110.8333–110.8667s eruption visual transition are available.

## Gaps
- Real ceiling silo launch and collision-clearance Play test not yet passed.
- Robot traversal on SpriteShape is not yet proved.
- Full ordered wave census and stage-complete Play run are not certified.
- One attempted introspection of WavesManager's authored stage internals failed with a null reference and was read-only. No gameplay edits were applied.
- Previous Play6 evidence establishes floor silo released 3 ships, player fire, boss death and 0 compilation errors in that QA session; this is not 1:1 arcade fidelity proof.

No Plastic SCM check-in was necessary or performed in this read-only inspection. GitHub dossier updated to reflect sceneExists=true, levelBuild as built provisional, and partial Play evidence instead of the stale false/NOT_RUN values.
