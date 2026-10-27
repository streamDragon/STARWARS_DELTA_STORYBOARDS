# GRADIUS Stage 1 — target blueprint for enlarged STARWARS_DELTA scene

Date: 2026-10-27
State: **VISUAL TARGET DESIGN ONLY — NOT YET APPLIED TO UNITY**.

## Non-negotiable corrections from the owner

1. The two volcano peaks are **tower Prefabs with a volcano-shaped SpriteRenderer, animations, independent launch/crater mechanisms and local colliders**. They are **not** mountain silhouettes sculpted into the continuous SpriteShape ground.
2. A **separate large blockade spaceship** enters the late level and **halts progression of the kilometer counter/world scroll** during a special encounter. Do not treat this as Konami's original Big Core or add Big Core as the final boss. Gameplay, ship motion, firing, collision and volcano effects should continue while level distance is paused; do not globally set Time.timeScale to zero.
3. The new game view/world is larger than the 1985 arcade view. Preserve the recognizable source encounter order and anchor forms, but add authored *interstitial* gameplay spaces instead of stretching each original map pixel or leaving empty dead zones.
4. **Layer 0 exclusively**: continuous upper/lower SpriteShape terrain, colliders and traversable surfaces. Separately placed object Prefabs: turrets, SILO ship hatch launchers, floating armed rock, two volcano towers and the blockade spaceship.
5. Source Stage 1 scope: opening open space → terrain corridor → hatch/turrets → armed floating rock → two volcano event. Exclude Big Core. All source anchors remain provisional until calibrated; do not claim this diagram is a measured world-X map.
6. Reuse a single family of base tower Prefabs with variants; reuse WavesManager, existing travel/camera scroll logic and source-confirmed current assets. No duplicate tower/spawner frameworks or backward compatibility layers.

## Blueprint: scrolling left to right

| Order | Region | Origin/extension | Geometry | Gameplay |
|---:|---|---|---|---|
| 1 | Open-space start | Original | No ground or ceiling | Player, first small fighter groups, teach firing |
| 2 | Asteroid drift | **New connective region** | No continuous floor | Destructible rock fragments and a weaving flight squadron |
| 3 | First shallow ridges | Original anchor | Low-profile SpriteShape floor and thin irregular ceiling | Floor/ceiling CUTE turrets, surface robot intro |
| 4 | Industrial border post | **New connective region** | Thin SpriteShape, mild ramps / short gaps without breaking routes | Compact bunkers, temporary obstacle, controlled enemy formation |
| 5 | Suspended armed rock | Original anchor | Keep the rock as a separate object, not part of road | Multidirectional shooting hazard in corridor |
| 6 | Fighter patrol stretch | **New connective region** | Wide safe air volume, varied gentle floor / roof outline | Formation dogfights with readable entry / exit timing |
| 7 | Hatch corridor | Original anchor | Narrower but safe terrain corridor | One floor SILO, one ceiling SILO, CUTE placements |
| 8 | Blockade spaceship | **New special encounter** | Maintain playable corridor | Big ship arrives, locks km/world scroll, continues to animate/fight, then unlocks on defined completion |
| 9 | Twin-volcano encounter | Original anchor, new graphic treatment | Near-continuous floor stays shallow; **no built-in conical peaks** | Two separately animated volcano-shaped tower sprites erupt simultaneously with flying rocks; after resolution scroll resumes/level ends |

## Camera and progress clock

- Use scrolling camera/current WavesManager kilometer authority as the single progression truth.
- At blockade encounter: deliberate state transition `SCROLLING → BLOCKED_BY_SHIP → VOLCANO_ERUPTION → RELEASE/END`.
- During BLOCKED: stop world-X scroll and km advancement, **not Unity global time**, so ships, volcano animation, projectiles and player remain interactive.
- Distinguish source measured timestamps (stop approx 110.6–110.8s in one video; visual eruption 110.8333–110.8667s) from local level-km gates. These source times are not transferable 1:1 to the expanded new world.

## Graphics and authored scene

- Proposed original-art palette: black cosmic negative space, thin ember-rock edges, occasional turquoise enemy/navigation signals, orange muzzle flashes, molten lava red during eruption.
- Volcano tower visual should have idle brown, ignition, opening crater, erupting red and cool-down/destroyed states; actual SpriteRenderer can use existing art or newly authored original frames.
- Tower placement must be relative to moving Layer0/terrain source anchors so manual drags update launch points, never based on stale world coordinates.
- Yellow player bounds lines are Unity Scene gizmos; do not delete Colliders or Confiner to hide them.

## Gates and order

1. User reviews **blueprint** first. Do not replace the user scene while this proposal is under review.
2. Refine existing Layer0 via SpriteShape to match source silhouette without volcano cones.
3. Place existing prefabs and add creative connector encounters without replacing the source-order anchors.
4. Separate volcano sprites from ground terrain; position large ship and connect to existing kilometer stop/resume authority.
5. Rewrite WavesManager JSON to fit new extended world, preserving robot attach and relative spawn semantics.
6. Full Play QA: both SILOs, robots on ground/ceiling, ship stops km while action continues, volcanoes erupt, then successful exit and source-fidelity comparisons.
7. Check in changes to Plastic MAIN and publish QA through RunSmartPublish only when actual source edits and tests succeeded.

**Do not represent this design spec as completed gameplay or a source-pixel-perfect map.**
