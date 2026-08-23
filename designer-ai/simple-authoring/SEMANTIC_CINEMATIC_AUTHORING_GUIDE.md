# CUTSCENE_SCRIPT_V1 Semantic Cinematic Authoring

## Purpose

This is a backward-compatible expansion of `CUTSCENE_SCRIPT_V1`. It does **not** create V2/V6/V7 and it does not replace V3 or V5.

Pipeline:

`Devora -> CUTSCENE_SCRIPT_V1 -> existing Simple adapter -> existing V3 semantic/beat/feature owners -> existing V5/runtime materialization`

## Source of truth

Use `authoring/AUTHORING_HANDLES.json` as the only general authoring handle source. Director files explain meaning, capability and safety. Visual Atlas provides pixel evidence. Do not derive handles from filenames, display names or assetId.

## VALIDATION SEVERITY - WARNING FIRST, RED ONLY FOR REAL BLOCKERS

Simple V1 is an authoring format, not a low-level V5 accounting form. Ordinary cinematic incompleteness must not become a hard stop when the existing backend can repair it deterministically without changing identity, inventing an asset or lying about CURRENT.

**Default rule:** recoverable presentation/staging/camera/continuity omissions are **YELLOW / Warning** and compilation continues.

**RED / Error is reserved for integrity failures**, including:

- unknown or ambiguous CURRENT handle/identity;
- stale/incompatible CURRENT identity;
- an exact destination/capability mismatch that cannot be materialized legally;
- unsupported Emotional Dialogue speaker/listener/identityHandle/expression;
- schema/semantic corruption with no deterministic legal repair;
- invented visual evidence or fake 3D evidence that contradicts CURRENT.

Warnings may include presentation repetition, weak continuity evidence, camera polish, recoverable performance intent, optional story-evidence weakness, and missing low-level dialogue-stage mechanics that the existing dialogue-stage owner can supply deterministically.

Do **not** require ChatGPT/Devora to serialize backend-only details merely to silence a validator. If the backend already owns a deterministic default, warn and let that owner apply it.

### FACE_TO_FACE_PORTRAITS specifically

For semantic Simple V1 dialogue, ChatGPT authors the exact curated participants, dialogue text/expression intent, location/presentation intent and story context.

If FACE_TO_FACE_PORTRAITS requires a full-frame stage background and dialogue frame at V3/V5/runtime level:

- an omitted **explicit low-level background** is a Warning when the existing dialogue-stage owner has a deterministic legal background/default;
- an omitted **explicit dialogue frame** is a Warning when the existing dialogue-stage owner has a deterministic legal frame/default;
- the Adapter/Unity dialogue-stage owner should inject those system-managed mechanics and continue compilation;
- it becomes RED only if no legal deterministic stage/background/frame can be resolved.

Never cure a warning by choosing an arbitrary Layer/Ui asset, changing the speaker identity, substituting a portrait, or inventing a fallback outside CURRENT.

Machine-readable severity policy: `CINEMATIC_INTENT_QA_RULES.json`.

## EMOTIONAL DIALOGUE CLOSED WORLD - HARD GATE

Dialogue is the one deliberate exception to general Actor discovery.

For any beat containing `dialogue[]`, Devora reads exactly one web artifact:

`open-current/EMOTIONAL_DIALOGUE_CURRENT.json`

Unity Publish CURRENT owns this file. It must be the exact same verified Emotional Dialogue projection that Unity also places in the atomic CURRENT bundle/release metadata. The web consumers do not extract the large CURRENT ZIP and do not fetch GitHub Release assets just to decide whether dialogue is available.

Before enabling dialogue, the direct mirror must satisfy all of these:

1. `schema == STARWARS_DELTA_EMOTIONAL_DIALOGUE_CURRENT`
2. `schemaVersion == 1`
3. `status == CURRENT_VERIFIED_EMOTIONAL_DIALOGUE`
4. `publishTransactionId` exactly matches `current.json` and `OPEN_CURRENT.json`
5. all five `requiredCurrent` fingerprints exactly match the surrounding CURRENT
6. at least one character has `authoringReady=true`

If the mirror is missing or any check fails, dialogue authoring is disabled while non-dialogue cinematic authoring remains available.

Only characters explicitly present with `authoringReady=true` are legal `speaker` or `listener` participants.

The identity rule is exact and case-sensitive:

```text
repertoire.actorId
= CUTSCENE_SCRIPT_V1 cast[].id
= dialogue speaker/listener
```

No aliases and no display-name matching.

For the same character:

```text
cast[].identityHandle
= repertoire.identityHandle
```

That `identityHandle` is a curated logical Emotional Dialogue identity. It is not an Actor Catalog handle and it is not a Ui/portrait handle.

Never derive dialogue eligibility from:

- `AUTHORING_HANDLES` Actor routes
- `actors.json`
- `ui.json`
- Visual Atlas
- `Cutscene.Actor`
- `Cutscene.Character`
- `Cutscene.Portrait`
- display name
- filename
- aliases
- tags
- visual similarity
- Catalog-wide search

A portrait, expression sprite, body sprite or Ui entry is presentation evidence. It is **not** dialogue identity by itself.

If the requested character is not in the verified CURRENT Emotional Dialogue repertoire, **STOP BEFORE GENERATING JSON**. Tell the designer that the requested character is unavailable for dialogue and list only the `authoringReady=true` repertoire as alternatives. Never silently substitute another character.

For every authored dialogue line:

1. `speaker` and optional `listener` must be exact case-sensitive published `actorId` values and exact matching `cast[].id` values.
2. The matching cast entry must use the exact case-sensitive `identityHandle` published for that same `actorId`.
3. `expressionIntent` applies to the speaker only.
4. If `expressionIntent` is absent, null, empty or whitespace-only, Unity uses that character's published `defaultExpression`.
5. If `expressionIntent` is present, it must exactly and case-sensitively match one of that character's `supportedExpressions`.
6. Unsupported expressions are blockers. There is **no Neutral fallback**, filename search, visual-similarity search or nearest-expression substitution.
7. Listener presentation uses the listener's published `defaultExpression` unless a future CURRENT contract explicitly exposes listener-expression authoring.
8. Dialogue-only characters remain legal with `spawnWorldActor=false`; do not manufacture a dummy WorldActor.
9. `defaultPresentationHandle` is Unity's exact curated presentation asset identity. It is not replaced by a general Catalog/Atlas portrait if the web preview cannot display it.

Notice the boundary: **dialogue identity/expression legality is a real hard gate; dialogue stage decoration/mechanics are not automatically hard gates.** A missing system-managed frame is not equivalent to an unknown speaker.

Machine-readable policy: `EMOTIONAL_DIALOGUE_AUTHORING_POLICY.json`.
Publisher contract schema: `EMOTIONAL_DIALOGUE_CURRENT.schema.json`.

## Optional semantic fields

### Beat level

- `dramaticFunction`: setup/build/reveal/reaction/pursuit/impact/escape/climax/aftermath/handoff/release
- `energy`: quiet/low/medium/high/peak
- `cinematicMove`: film intent such as `ship_flyby`, `pullback_reveal`, `pursuit`, `approach`, `impact`, `escape`, `aftermath`
- `relationships[]`: screen relationships such as `left_of`, `behind`, `faces`, `threatens`, `escorts`
- `audio[]`: direct CURRENT Audio handles
- `transition`: cut/crossfade/fade
- `continuity`: preserve screen direction and named continuity entities

### Visible element

Use `saliency`, `travelDirection`, `facing`, `performanceIntent`, `animationIntent`, `startState` and `endState` to express what the audience should perceive. Unity resolves legal execution.

### Action

Keep the existing action `type`. Add `motionIntent` for cinematic movement such as `flyby`, `approach`, `orbit`, `intercept`, `pursuit`, `escort`, `rescue_approach`, `landing`, `takeoff`, `escape`, `run_to_safety` or `help`. Optional `trajectory`, `travelDirection` and `speed` refine the visible plan.

### Camera

Camera movement includes `drift`, `shake`, `impact_shake` and `orbit` in addition to hold/push/pull/follow/track/cut.

`orbit` is deliberately **2D/2.5D semantic orbit-like parallax**. It may compile to track/follow/drift plus subject/layer movement or an existing legal orbit primitive. It must never invent an unseen 3D back/side/top view.

### Audio

`audio[]` is a first-class Simple V1 field. Each cue requires an authoritative CURRENT Audio `handle`.

Do not guess an Audio handle from a filename. If no legal CURRENT Audio handle exists, omit the cue and report the gap. `safeForPreview=true` does not override `safeForPublish=false`.

## Performance and animation

Use `performanceIntent` and `animationIntent` rather than raw animation asset IDs. The adapter resolves them against the actor's compatible animation families.

## What remains backend-only

- runtime assetId/GUID/catalogRevision/schemaHash/projectId
- V5 linker/materialization IDs
- exact world coordinates and raw Unity scale
- camera object wiring
- dialogue-stage frame/background mechanics when they are deterministic system-owned defaults
- resolver fallback internals

The author writes a film. The backend performs accounting. If accounting can fill a deterministic presentation default, it should do so with a warning rather than demanding that the author become the accounting department.
