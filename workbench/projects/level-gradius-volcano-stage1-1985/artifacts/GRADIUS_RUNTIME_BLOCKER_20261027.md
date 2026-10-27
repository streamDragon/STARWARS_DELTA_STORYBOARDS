# GRADIUS runtime integration: QA status (27 October 2026)

The primary Unity editor at PID 24256 has entered **Compiling Scripts** (observed with a title "Compiling Scripts (busy for 01:51)..."). Two native Unity MCP requests timed out, so no safe Scene or Play changes can be claimed.

Recorded facts from the previously saved Gradius scene and PLAY6:
- A floor SILO released three ships; the ceiling SILO was still closed with release count 0 at the boss-stage snapshot.
- Both SILOs have valid launch anchors, 5-knot splines, and 3 collider paths; the ceiling silo's launch direction is down.
- The actual `TowerShipLauncher.IsNearGameplayCamera` gates releases on viewport x [-0.12, 1.12], independent of the hatch's y position. The code also gates on `WavesManager.IsReadyForTowerReleases` and authority. Camera/frustum gating is a hypothesis, not a proven cause.
- Robot waves exist in the provisional mechanics authoring plan, but live robot movement is unverified.
- The current main workspace is /main cs:9580; changes currently belong to parallel Cutscene work. No Gradius edits or Plastic check-in were made.

Next concrete checks when Editor is responsive:
1. During actual runtime, sample each silo's viewport.x, IsNearGameplayCamera, m_armed, m_released, m_nextReleaseAt and waves readiness every few seconds around the first silo pass.
2. Use in-scene runtime evidence to decide whether to adjust only the ceiling placement ratio or the tower behavior; do not alter shared launcher logic on a hunch.
3. Verify actual spawned robot prefab and ground adhesion against the continuous SpriteShapes.
4. Run and capture complete first-to-last Play acceptance, then check in only targeted fixes.

**Status: BLOCKED_EDITOR_COMPILING; no runtime QA PASS this session.**
