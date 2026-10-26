# GRADIUS VOLCANO 01: isolated Unity scene bootstrap

**Date:** 2026-10-26
**Plastic main:** cs:9533, specifically the 6 new level-scene/LevelBuilder plan asset files, not unrelated changes.
**Scene:** `Assets/_Game/MY_Core/MY_Scenes/HAGGAI_STUFF/GRADIUS_VOLCANO_01.unity`
**Plan:** `Assets/_Game/MY_Core/MY_Data/LevelAuthoring/GRADIUS_VOLCANO_01_MasterPlan.asset`
**Blueprint:** `Assets/_Game/MY_Core/MY_Data/LevelAuthoring/GRADIUS_VOLCANO_01_Layer0Blueprint.asset`

## Direct confirmation
After calling canonical `MY_LevelBuilderSceneWorkflow.TryInitializeNewCleanScene` through Unity editor, Unity MCP timed out; follow-up filesystem inspection confirmed the scene file (30,928 bytes), its .meta, the plan and blueprint assets, with the following root names serialized:
- `L0_GAMEPLAY_SOLID`
- `L0_KM_MARKERS`
- `L0_SCROLLING_CONTENT`
- `L0_CAMERA_GUIDES`
- `L0_NAVMESH_BOUNDARY`
- `L0_STATIC_AUTHORING`
- `L0_SPAWN_ANCHORS`
- `L0_REWARD_MARKERS`

These are the framework skeleton only. **No SpriteShape segments, robot routes, turrets or waves have yet been inserted**. No Play QA exists. The Gradius scene was created additively to avoid overwriting other editors' dirty scenes.

## Next main agent work
- Create real editable floor/ceiling `SpriteShapeController` terrain through canonical Blueprint / Layer0 with native spline colliders and NavMesh-friendly walkable edge conditions.
- Use existing GRADIUS CUTE and roof-opening SILO variants, plus two-peak boss, placed as provisional (not source-certified), then refine from research agent's measurements.
- Run robot terrain traversal and Play QA without disturbing other unsaved open scenes.
- Do NOT import obsolete 210KM draft as 1:1 recreation.

**Status:** BOOTSTRAP_CHECKED_IN; LEVEL_GEOMETRY_PENDING.
