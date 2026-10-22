# Units and evidence

## Coordinate contract

Resolve nominal progression cadence, authoring units per progression unit, signed runtime velocity, conversion origins/direction and the speed source used by the real scene. Inspect the current schema/code instead of inventing fields. runtimeWorldScrollVelocityX is a field reported in a previous authoring conversation; verify support before using it.

For constant speed, if progression is 1 km/second and authoring scale is 2.63 units/km:
- T = km / progression cadence.
- Authoring distance = km * 2.63.
- Runtime travel distance = abs(runtime velocity) * T.
- Distance conversion factor = runtime distance / authoring distance.

| Runtime speed magnitude | 200-km authoring distance | Runtime travel | Factor | Expected duration |
| --- | --- | --- | --- | --- |
| 0.4 | 526 | 80 | 0.1520912548 | 200 s |
| 0.8 | 526 | 160 | 0.3041825095 | 200 s |
| 1.2 | 526 | 240 | 0.4562737643 | 200 s |
| 1.6 | 526 | 320 | 0.6083650190 | 200 s |

These examples verify arithmetic under stated assumptions, not the implementation. At speed 1.2, an unconverted 80-runtime-unit layout takes about 66.67 seconds; treating 526 authoring units directly as runtime takes about 438.33 seconds. Convert between the intended spaces first.

Keep full precision internally; rounding is for display. Resolve absolute positions using the actual origins, travel direction, camera entry offsets and scene transforms. For a stationary entry boundary and constant world scroll v, an object scheduled to reach it after t starts at x_entry - v*t. Verify the real entry behavior before applying this relation.

The distance factor describes progression-axis distances. Sprite dimensions/PPU, height, camera and bounds need their declared rules. Do not apply an unexplained root Transform scale. Account for any scrolling/parallax behavior and avoid applying conversions twice. For variable speed, use the actual time/distance mapping.

Check geometry points, placement positions, towers, spawn/route anchors, preview and QA against the same resolved conversion. Preserve the existing WavesManager progression cadence unless the user changes it. A helper hardcoded to 0.4 under an explicit level speed of 1.2 is a focused tool-development issue; report it with a reproduction instead of claiming a JSON speed field fixed every consumer.

## Image and QA contract

| Artifact | Permitted claim |
| --- | --- |
| AI inspiration | Intended mood/design |
| Composition from inspected asset images | Feasible planning proposal with listed gaps |
| Actual matching QA capture | What that scene/run/frame shows |
| Play Mode test result | Only the behavior exercised by that test |

Bind current-state captures to the actual QA tool response/manifest, scene, run, timestamp and saved PNG. Read the actual image. Never manufacture a current image or silently reuse an old run. Keep an original capture when adding annotations; label annotations.

Captions such as collectible crystal or launch tower require verified game data/components. Neither a generated picture nor an asset filename establishes behavior. A nonblank overview is not visual acceptance. A pretty frame is not collider, digging, launch or shooting proof.
