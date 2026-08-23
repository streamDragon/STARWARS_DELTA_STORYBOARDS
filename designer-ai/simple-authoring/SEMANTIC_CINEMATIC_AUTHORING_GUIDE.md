# CUTSCENE_SCRIPT_V1 Semantic Cinematic Authoring

## Purpose

This is a backward-compatible expansion of `CUTSCENE_SCRIPT_V1`. It does **not** create V2/V6/V7 and it does not replace V3 or V5.

Pipeline:

`Devora -> CUTSCENE_SCRIPT_V1 -> existing Simple adapter -> existing V3 semantic/beat/feature owners -> existing V5/runtime materialization`

## Source of truth

Use `authoring/AUTHORING_HANDLES.json` as the only authoring handle source. Director files explain meaning, capability and safety. Visual Atlas provides pixel evidence. Do not derive handles from filenames, display names or assetId.

## New optional semantic fields

### Beat level

- `dramaticFunction`: setup/build/reveal/reaction/pursuit/impact/escape/climax/aftermath/handoff/release
- `energy`: quiet/low/medium/high/peak
- `cinematicMove`: existing film-intent vocabulary such as `ship_flyby`, `pullback_reveal`, `pursuit`, `approach`, `impact`, `escape`, `aftermath`
- `relationships[]`: screen relationships such as `left_of`, `behind`, `faces`, `threatens`, `escorts`
- `audio[]`: direct CURRENT Audio handles
- `transition`: cut/crossfade/fade
- `continuity`: preserve screen direction and named continuity entities

### Visible element

Use `saliency`, `travelDirection`, `facing`, `performanceIntent`, `animationIntent`, `startState` and `endState` to express what the audience should perceive. These are semantic instructions. Unity resolves legal execution.

### Action

Keep the existing action `type`. Add `motionIntent` for cinematic movement such as `flyby`, `approach`, `orbit`, `intercept`, `pursuit`, `escort`, `rescue_approach`, `landing`, `takeoff`, `escape`, `run_to_safety` or `help`. Optional `trajectory`, `travelDirection` and `speed` refine the visible plan.

### Camera

Camera movement now officially includes `drift`, `shake`, `impact_shake` and `orbit` in addition to the existing hold/push/pull/follow/track/cut vocabulary.

`orbit` is deliberately **2D/2.5D semantic orbit-like parallax**. It may compile to track/follow/drift plus subject/layer movement or an existing legal orbit primitive. It must never invent an unseen 3D back/side/top view.

### Audio

`audio[]` is now a first-class Simple V1 field. Each cue requires an authoritative CURRENT Audio `handle`.

Example shape:

```json
{
  "kind": "music",
  "handle": "<exact CURRENT Audio handle>",
  "operation": "fade_in",
  "intent": "quiet dread building under the reveal",
  "volume": 0.55
}
```

Do not guess an Audio handle from a filename. If no legal CURRENT Audio handle exists, omit the cue and report the gap. `safeForPreview=true` does not override `safeForPublish=false`.

## Performance and animation

Use `performanceIntent` and `animationIntent` rather than raw animation asset IDs. The adapter must resolve them against the actor's compatible animation families. Examples: `urgent_locomotion`, `command`, `fear`, `injured`, `walk`, `run`, `interact`, `hit`.

## Continuity

A beat may state:

```json
"continuity": {
  "preserveScreenDirection": true,
  "matchedEntityIds": ["enemy_leader", "hero_ship"]
}
```

The V3 staging layer owns exact placement. The authoring layer owns audience-facing continuity intent.

## Cinematic move rule

A named `cinematicMove` is not decoration. It must be evidenced by composition, camera, visible subjects and actions. If the backend has an exact existing V3 feature, reuse it. If not, compile the visible intent from legal lower-level primitives rather than pretending an unsupported feature exists.

## What remains backend-only

- runtime assetId/GUID/catalogRevision/schemaHash/projectId
- V5 linker/materialization IDs
- exact world coordinates and raw Unity scale
- camera object wiring
- resolver fallback internals

The author writes a film. The backend performs accounting. Humanity has suffered enough from making those the same job.
