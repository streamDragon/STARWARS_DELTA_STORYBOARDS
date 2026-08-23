# CUTSCENE_SCRIPT_V1 Semantic Cinematic Authoring

## Purpose

This is a backward-compatible expansion of `CUTSCENE_SCRIPT_V1`. It does **not** create V2/V6/V7 and it does not replace V3 or V5.

Pipeline:

`Devora -> CUTSCENE_SCRIPT_V1 -> existing Simple adapter -> existing V3 semantic/beat/feature owners -> existing V5/runtime materialization`

## Source of truth

Use `authoring/AUTHORING_HANDLES.json` as the only general authoring handle source. Director files explain meaning, capability and safety. Visual Atlas provides pixel evidence. Do not derive handles from filenames, display names or assetId.

## EMOTIONAL DIALOGUE CLOSED WORLD - HARD GATE

Dialogue is the one deliberate exception to general Actor discovery.

For any beat containing `dialogue[]`, discover the Unity-published repertoire from:

`current.json.emotionalDialogue`

That metadata identifies the exact published `EMOTIONAL_DIALOGUE_CURRENT.json`, including its status, publish transaction, SHA-256, release URL and atomic bundle entry.

The normal atomic web path is:

`current.json.emotionalDialogue.bundleEntryName`

inside:

`open-current/STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip`

An `open-current/EMOTIONAL_DIALOGUE_CURRENT.json` file may exist as a convenience mirror, but it is optional. Its absence must **not** disable dialogue when the same verified repertoire is present in the CURRENT bundle.

Before enabling dialogue, the repertoire must satisfy all of these:

1. `schema == STARWARS_DELTA_EMOTIONAL_DIALOGUE_CURRENT`
2. `schemaVersion == 1`
3. `status == CURRENT_VERIFIED_EMOTIONAL_DIALOGUE`
4. `publishTransactionId` exactly matches the surrounding CURRENT
5. all five `requiredCurrent` fingerprints exactly match the surrounding CURRENT
6. at least one character has `authoringReady=true`

If any of those checks fail, dialogue authoring is disabled while non-dialogue cinematic authoring remains available.

Only characters explicitly present in that verified repertoire with `authoringReady=true` are legal `speaker` or `listener` participants.

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

Machine-readable policy: `EMOTIONAL_DIALOGUE_AUTHORING_POLICY.json`.
Publisher contract schema: `EMOTIONAL_DIALOGUE_CURRENT.schema.json`.

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

Camera movement officially includes `drift`, `shake`, `impact_shake` and `orbit` in addition to hold/push/pull/follow/track/cut.

`orbit` is deliberately **2D/2.5D semantic orbit-like parallax**. It may compile to track/follow/drift plus subject/layer movement or an existing legal orbit primitive. It must never invent an unseen 3D back/side/top view.

### Audio

`audio[]` is a first-class Simple V1 field. Each cue requires an authoritative CURRENT Audio `handle`.

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

Use `performanceIntent` and `animationIntent` rather than raw animation asset IDs. The adapter resolves them against the actor's compatible animation families. Examples: `urgent_locomotion`, `command`, `fear`, `injured`, `walk`, `run`, `interact`, `hit`.

## Continuity

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
