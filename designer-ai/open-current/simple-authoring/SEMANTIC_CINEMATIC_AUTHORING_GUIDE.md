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

Recoverable backend-owned presentation/staging omissions may remain Warning/Yellow or Orange when the backend can repair/degrade them deterministically without changing identity or inventing an asset.

RED is reserved for genuine integrity/system failures where no valid candidate or preserved Preview can safely remain.

A black or visually empty Preview may be useful diagnostic evidence, but it is not exact success when authored visible obligations were dropped.

Do not serialize backend-only fields merely to silence diagnostics.

## World Actor identity contract

For world Actors, identity, representation and performance are distinct authoring concepts:

```text
cast[].id
= logical Actor id used by actions/dialogue/continuity

cast[].identityHandle
= exact canonical/preferred CURRENT route=Actor authoring identity

visible[].handle
= exact visible representation handle used for the shot

actions[].subject
= cast[].id

animationIntent / performanceIntent
= semantic performance request such as walk / look_up
```

Rules:

- `cast[].identityHandle` must be a legal canonical/preferred Actor identity with `authorableInSimpleV1=true`.
- Do not substitute a Sprite frame, Texture, portrait frame, animation frame or raw AnimationClip handle for Actor identity.
- A visual/frame record may belong to an Actor family without becoming that Actor identity.
- `visible[].handle` may select a distinct legal visual representation when CURRENT exposes one.
- `actions[].subject` references `cast[].id`, never an asset handle.
- Use semantic `animationIntent` / `performanceIntent`; raw AnimationClip identities are backend-only.
- If CURRENT does not expose a legal canonical Actor identity, do not infer one from filenames/folders/frame names or old JSON. Treat the world Actor as unavailable for authoring until CURRENT exposes it.
- Candidate/recommendation output for stories that require a world Actor must expose a usable canonical Actor authoring identity, not only Sprite/animation-frame representatives.

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

Do not teach shorthand when the schema rejects it.

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

## Visible items are audience-visible obligations

A legal `visible[]` item means the audience is supposed to see that item during the owning beat.

This is especially important for route=`Effect`:

- placing a legal Effect in `visible[]` is sufficient to request beat-bounded visibility;
- do not add a meaningless `reveal` action merely as a backend workaround to make the Effect exist;
- add an explicit legal Effect action only when the shot actually needs explicit event semantics such as reveal/impact/other supported behavior;
- multiple authored instances using the same Effect handle are still multiple visual obligations and must remain distinct;
- projectiles/impacts do not implicitly satisfy unrelated visible Effect requests.

If a legal visible Effect later disappears during lowering/materialization, that is BACKEND/ENGINE-owned evidence. Do not corrupt a valid source handle to silence it.

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

## Camera and frame-relative composition

Camera authoring is semantic directing intent.

The active camera/frustum is the cinematic composition truth. The author should think in frame-relative terms, not Unity world units or the size of an editor Stage rectangle.

Use fields such as:

- `screenX` / `screenY`
- `screenWidthFraction` / `screenHeightFraction`
- `enterFrom` / `exitTo`
- `travelDirection`
- `camera.framing` / `camera.movement`

The backend maps these to the matching camera so an edge-to-edge flyby, diagonal, formation or orbit remains visually proportional even when the camera size changes.

Do not invent numeric world distances or runtime scale multipliers in authoring JSON.

`camera.subject` is semantic composition intent by default. Target-dependent Follow/Track may physically bind an active legal WorldActor when the matching runtime representation supports that operation. Do not manufacture a WorldActor merely to satisfy a semantic subject.

Camera `orbit` is a 2D/2.5D composition/parallax concept and must not invent unseen 3D geometry.

## Actor motion runtime truth

Simple V1 semantic motion lowers into the existing V5 actor-action / Timeline path.

Important runtime truths:

- authored cinematic paths are interpreted proportionally to the active camera viewport/frustum rather than an arbitrary tiny Stage scale;
- edge/corner entry/exit intent should produce meaningful screen travel;
- authored formation screen offsets should remain distinct instead of collapsing actors onto one horizontal line;
- curve amplitude and default orbit radius are frame-proportional backend concerns;
- Actor Orbit remains fixed-center unless matching runtime support explicitly changes that capability;
- Pursuit/Escort/Intercept are valid semantic choreography concepts but do not automatically promise per-frame moving-target tracking;
- semantic speed strings are resolved by the backend and are not raw numeric Unity speed values.

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

Projectile visuals, Effects and audio are separate authoring concerns.

A projectile does not automatically prove impact/destruction.

A visual Effect does not automatically supply sound.

Use exact CURRENT Audio handles for important audible events when suitable legal audio exists.

Silence may be intentional, but battle/destruction beats should not become accidentally silent because the visual route happened to work.

## Materialization truth and fail-soft behavior

Authoring should never depend on generated backend aliases or Timeline implementation details.

Internally, a legal request is expected to survive as the correct generated instance, Timeline representation, binding and interval. If the backend cannot do that, it must diagnose the failure rather than silently dropping the request.

If an authored world Actor is dropped during lowering/materialization, preserve the legal source request and diagnose the original identity handle, normal resolution result, canonical Actor resolution result and final keep/drop result. Do not rewrite cast identity to a Sprite/frame just to make Preview non-black.

A failed new candidate should not destroy the last valid Editable Preview. This is a Studio/backend safety invariant, not a reason for ChatGPT to emit sloppy JSON.

## What remains backend-owned

Examples include:

- runtime GUIDs / raw Catalog IDs
- CURRENT fingerprints
- V3/V5 bookkeeping IDs
- exact world coordinates and raw Unity scale
- viewport-to-world conversion and motion amplitude
- Timeline track/clip/binding selection
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
6. every cast[].identityHandle is a canonical/preferred legal Actor handle, not a Sprite/frame/Texture/Animation record
7. every Actor action subject references cast[].id
8. animationIntent/performanceIntent are semantic and no raw AnimationClip identity is authored
9. every dialogue participant/expression is exact CURRENT dialogue vocabulary
10. every fire action has a schema-legal projectileId
11. every audio cue uses an exact legal Audio handle
12. no raw Animation/Catalog/V3/V5 identities were authored
13. sequential locomotion phases were split across adjacent beats
14. Actor Orbit centers remain stationary when current runtime still requires fixed-center Orbit
15. visible Effects are not given meaningless actions merely to force backend existence
16. frame composition is expressed through legal screen/direction semantics, not invented world units
17. no unknown properties or remembered legacy field names remain

Unity remains authoritative for final runtime validation and Editable Preview acceptance.
