# GRADIUS — SpriteShape profile integration, 28 October 2026

## Concrete Unity changes

- Inspected all existing SpriteShape controllers in `GRADIUS_VOLCANO_01.unity`: floor and ceiling each have 24 and 21 knots, shared `SSP_FIRE_RICH.asset`, and PolygonCollider2D. Five floating rock shapes use same profile.
- Current floor/ceiling were visually overthick. Modified **only the polygon back-cap points** (not player-facing contour):
  - GRADIUS_CONTINUOUS_FLOOR and (1): bottom two points local y -15 → -11.7 (four points).
  - GRADIUS_CONTINUOUS_CEILING and (1): top two points local y 18 → 11.7 (four points).
- Verified all four shapes kept SpriteShapeController + PolygonCollider2D; left the terrain-facing 22/19 contour knots and all SpriteShape profile references unchanged.
- Backed up saved scene to `STARWARS_DELTA_WORK/GRADIUS_STAGE1_VOLCANO_20261025/BACKUP_BEFORE_THIN_SPRITESHAPE_20261028.unity`.
- Saved Unity scene and completed scoped Plastic MAIN checkin **cs:9591**.
- Launched canonical level QA publisher with status **NOT_REVIEWED** after checkin; publication completion must be confirmed separately.

## Separation of terrain and actors

- Two volcanoes MUST remain independent volcano-shaped **tower Prefabs** with their own sprites and particle/rock fire animation; they must NOT be sculpted into the continuous SpriteShape.
- Large moving blockade ship will pause kilometers/world scroll during the encounter, not `Time.timeScale`. This behavior is in the design blueprint, NOT implemented yet.
- Additional intermediate authored terrain, props, enemies and parallax must be added with higher-quality authored assets, while preserving the classic source encounter order.

## Acceptance status

**Terrain cap edit saved and checked in, not yet a complete level redesign.** Pending sprite-shape collision Play check, visual QA approval, distinct volcano prefab animation, blockade ship kilometer-stop logic and continuous full-stage gameplay test. Do not claim pixel-perfect original map fidelity.
