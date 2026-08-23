# INVALID COMMON MISTAKES

These examples are deliberately wrong.

## Background treated as Actor

Invalid: a record whose `cutscenePrimaryUse` is `Layer` appears in `cast`.
Correct: place its exact assetId in `sequence.layers` or `shot.layerActions`.

## VFX treated as Actor

Invalid: smoke, engine fire, explosion or impact appears in `cast` and receives `actorActions`.
Correct: use an `effects` entry whose type is a string such as `Smoke`, `Fire`, `Impact` or `Explosion`.

## Numeric enums

Invalid: `type: 8`, `role: 0`, `framing: 3`.
Correct: use string names from `CUTSCENE_ENUMS_V5.json`, for example `type: Turn`.

## Duplicate technical IDs

Invalid: two shots or actions reuse the same `shotId` or `actionId`.
Correct: give every technical ID one globally unique value, such as `seq01_shot01_camera_hold`.

## Placeholder identity or stale Catalog revision

Invalid: copy `contextId: EXAMPLE_CONTEXT_REPLACE_FROM_REQUEST` or `catalogRevision: 0` into a new package.
Correct: do not ask the designer for bookkeeping IDs; Unity binds `NEW_CUTSCENE_CONTEXT` and the current Catalog revision at import.

## Forbidden gameplay events

Invalid: author `EnableGameplay` or `DisableGameplay` in a cinematic `events` list.
Correct: use the typed `handoff` for gameplay transfer; those event enum values are runtime/migration compatibility only.

## Locked staging with actor actions

Invalid: set `stage.lockStaging=true` while also adding `actorActions` in the same shot.
Correct: keep `actorActions` empty for locked dialogue staging and place movement in a separate unlocked shot.

## Animation without compatibility proof

Invalid: use `PlayAnimation` with an animation ID absent from the actor record's `compatibleAnimationIds`.
Correct: use only the exact compatible animation ID, or choose `Move`, `Turn` or `Hold`.

## Fake animation

Invalid: `PlayAnimation` with an empty `animationAssetId`, while rotation is used to imitate motion.
Correct: use `Turn` for rotation, `Move` for position, or supply one exact compatible Animation asset.

## Unsafe prefab

Invalid: a record with `cutsceneSafeForPreview=false` is referenced because its picture looks useful.
Correct: omit it, choose a safe visual record, or add a non-blocking `missingAssets` note.

## Dialogue UI treated as cast identity

Invalid: a portrait, head, body, frame or speech balloon whose `cutscenePrimaryUse` is `Ui` appears in `cast[].visualAssetId`.
Correct: cast identity uses an Actor-primary record; dialogue presentation fields use Ui-primary portrait/body/frame/bubble records.

## Random speech bubble

Invalid: a bubble is forced into every line or used as a background/world actor/effect.
Correct: choose a real explicitly-described Ui-primary side/tail variant only when the presentation needs one; otherwise use the canonical Dialogue Stage frame.
