# CUTSCENE_SCRIPT_V1 Semantic Cinematic Authoring

## Purpose

This is active authoring guidance for `CUTSCENE_SCRIPT_V1`.

It does not create a new runtime layer and it does not replace V3 or V5.

Pipeline:

`Devora -> CUTSCENE_SCRIPT_V1 -> existing Simple adapter -> existing V3 semantic/beat/feature owners -> existing V5/runtime materialization`

## Source of truth

Use the matching CURRENT authoring artifacts only:

- `AUTHORING_HANDLES.json` for direct legal handles
- `AUTHORING_RULES_CURRENT.json` for authoring rules
- `CUTSCENE_SCRIPT_V1.schema.json` for exact field names and enums
- `EMOTIONAL_DIALOGUE_CURRENT.json` for dialogue eligibility
- `EMOTIONAL_DIALOGUE_AUTHORING_POLICY.json` for dialogue rules
- `CINEMATIC_INTENT_QA_RULES.json` for semantic QA policy
- Visual Atlas page/slot stored on each direct visual handle for real pixel evidence

Do not derive handles or identities from filenames, display names, old examples, memory, aliases or visual similarity.

## Validation severity

Simple V1 is an authoring format, not a low-level V5 accounting form.

Recoverable backend-owned presentation/staging omissions may remain Warning/Yellow when the existing backend can fill them deterministically without changing identity or inventing an asset.

RED is reserved for genuine integrity failures such as:

- unknown or ambiguous CURRENT handle
- stale/incompatible CURRENT identity
- illegal route/capability
- unsupported dialogue participant or explicit expression
- unsupported projectile identity
- impossible runtime constraint such as moving-center Actor Orbit
- schema corruption with no legal deterministic repair

Do not serialize backend-only fields merely to silence warnings.

## Emotional Dialogue closed world

Dialogue is a deliberate exception to general Actor discovery.

Only `authoringReady=true` characters from the matching `EMOTIONAL_DIALOGUE_CURRENT.json` are legal dialogue speakers/listeners.

Identity is exact and case-sensitive:

```text
repertoire.actorId
= CUTSCENE_SCRIPT_V1 cast[].id
= dialogue speaker/listener
```

For that same character:

```text
cast[].identityHandle
= repertoire.identityHandle
```

Never derive dialogue eligibility from Actor/UI/Atlas records, filenames, aliases, display names or visual similarity.

For each line:

- `speaker` and optional `listener` must be exact published actorIds and matching cast ids.
- `expressionIntent` applies to the speaker.
- if `expressionIntent` is omitted, the published `defaultExpression` is used.
- if explicitly authored, the expression must exactly match a published supported expression.
- unsupported explicit expressions are blockers. There is no Neutral fallback.
- dialogue-only participants may remain `spawnWorldActor=false`.

CharacterPack-owned dialogue presentation remains authoritative even when a generic UI/Actor projection has different safety metadata.

## Exact schema vocabulary

Use the schema literally.

Important examples:

- transition styles are exactly `cut`, `crossfade`, `fade_to_black`, `fade_from_black`.
- semantic speeds are exactly `slow`, `medium`, `fast`, `burst`.
- camera movement values come only from the matching schema.
- actor `motionIntent` values come only from the matching schema.
- every `type=fire` action requires a schema-legal `projectileId`.

Do not teach shorthand such as `fade` when the schema rejects it.

## Visual evidence

Metadata is search evidence. Pixels are appearance proof.

For important visual choices preserve the chain:

```text
OBSERVED PIXELS
-> exact Atlas page/slot or visualReferenceId
-> exact Director entry
-> exact authoring handle/runtime identity
-> legal route/capability
```

A technically legal handle is not automatically an artistically good choice. Prefer visually coherent assets that belong in the same 2D film world.

## Optional semantic fields

Useful beat-level fields include:

- `dramaticFunction`
- `energy`
- `cinematicMove`
- `relationships[]`
- `audio[]`
- `transition`
- `continuity`

Useful visible-element fields include:

- `saliency`
- `travelDirection`
- `facing`
- `performanceIntent`
- `animationIntent`
- `startState`
- `endState`

Useful action fields include:

- `motionIntent`
- `trajectory`
- `travelDirection`
- `speed`
- `performanceIntent`
- `animationIntent`

Use `performanceIntent` / `animationIntent` rather than raw Animation IDs.

## Camera

Camera authoring is semantic directing intent.

`camera.subject` is not automatically a physical Transform target.

A Hold shot or curated dialogue composition may preserve a semantic subject without manufacturing a WorldActor.

Target-dependent operations such as Follow/Track still retain their actual runtime requirements.

Camera `orbit` is a 2D/2.5D composition/parallax concept and must not invent unseen 3D geometry.

## Actor motion runtime truth

Simple V1 semantic motion lowers into the existing V5 actor action / Timeline path.

Important runtime limits:

- Actor Orbit v1 is fixed-center only.
- a moving Orbit center is not supported.
- Pursuit/Escort/Intercept are valid semantic choreography concepts but do not imply per-frame moving-target tracking.
- semantic speed strings are resolved by the adapter and must never be parsed directly as numeric floats.

## Sequential locomotion rule

Simple V1 actions do not have per-action timing/order.

Therefore multiple sequential locomotion phases for the same subject must be represented across adjacent beats.

Do NOT place this conceptual sequence into one beat and assume order:

```text
approach -> pass_camera -> bank_away -> exit
```

Instead author adjacent beats that make the order explicit.

One primary locomotion phase may coexist in the same beat with compatible fire, impact, reveal or reaction evidence when no ordering ambiguity is introduced.

## Cinematic move recipes

Recipe names are planning shorthand only. Never serialize a `recipeName` field.

Every recipe must expand into legal Simple V1 fields.

When a recipe implies sequential locomotion, expand it into adjacent beats.

Examples:

```text
ATTACK_RUN
Beat A: approach + optional fire
Beat B: pass_camera
Beat C: bank_away / exit
```

```text
LANDING_APPROACH
Beat A: approach
Beat B: landing
Beat C: hold
```

```text
ORBIT_THEN_BREAK
Beat A: fixed-center orbit while center remains stationary
Beat B: formation_break
Beat C: bank_away / exit
```

Use recipes to improve film rhythm, not to imply a runtime capability that does not exist.

## Quantity

`visible[].count` is a visual obligation.

Before count expansion determine whether the exact inspected pixels represent:

1. one reusable single entity; or
2. an already grouped/fleet/crowd visual.

Do not multiply a precomposed group as though it were one actor.

## Story claims require evidence

Every major non-verbal story claim must map to audience-observable evidence.

Conceptually:

```text
STORY CLAIM
-> VISIBLE / AUDIBLE EVIDENCE
-> ACTION OR CHANGE
-> CONSEQUENCE / FINAL STATE
```

A title or dialogue line saying that something happened does not implement the visual event.

## Projectiles

Cutscene projectiles are a closed-world visual capability.

The exact legal `projectileId` vocabulary is owned by the matching `CUTSCENE_SCRIPT_V1.schema.json` / Unity-published capability.

Do not maintain a separate remembered projectile list in this guide.

Rules:

- every `type=fire` action requires a legal `projectileId`.
- `effectHandle` and `viaHandle` are not projectile identity.
- gameplay projectile prefabs, filenames and fuzzy matching are not substitutes.
- `count` is the authored burst quantity within the schema-supported range.
- launcher attachment, muzzle transform, cadence and projectile mechanics remain Unity-owned unless a future matching schema explicitly exposes them.

## Effects and audio

Projectile visuals, effects and audio are separate authoring concerns.

A projectile does not automatically prove impact/destruction.

A visual Effect does not automatically supply sound.

Use exact CURRENT Audio handles for important audible events when suitable legal audio exists.

Silence may be intentional, but battle/destruction beats should not become accidentally silent because the visual route happened to work.

## What remains backend-owned

Examples include:

- runtime GUIDs / raw Catalog IDs
- CURRENT fingerprints
- V3/V5 bookkeeping IDs
- exact world coordinates and raw Unity scale
- launcher/muzzle mechanics
- raw camera wiring
- deterministic dialogue-stage mechanics when system-owned

The author writes the film. The backend performs the accounting.

## Final authoring check

Before delivering production JSON verify:

1. exact root schema/header and schemaVersion
2. root duration and beat durations are coherent
3. every required beat field exists
4. every storyClaim has evidence
5. every visual handle is exact CURRENT
6. every dialogue participant/expression is exact CURRENT dialogue vocabulary
7. every fire action has a schema-legal projectileId
8. every audio cue uses an exact legal Audio handle
9. no raw Animation/Catalog/V3/V5 identities were authored
10. sequential locomotion phases were split across adjacent beats
11. Actor Orbit centers remain stationary during the Orbit interval
12. no unknown properties or remembered legacy field names remain

Unity remains authoritative for final runtime validation and Editable Preview acceptance.
