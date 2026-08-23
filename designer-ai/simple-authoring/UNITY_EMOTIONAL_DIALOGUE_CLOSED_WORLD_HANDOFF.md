# STARWARS_DELTA Unity Handoff - Emotional Dialogue Closed World

## GOAL

Make `MY_EmotionalDialogueLibrary` the single source of truth for authored dialogue and publish one atomic `EMOTIONAL_DIALOGUE_CURRENT.json` projection from it.

Dialogue identity is curated and portrait-only when appropriate. It is not Actor Catalog identity, not Ui identity and not a WorldActor requirement.

Do not redesign the Cutscene architecture. Reuse the existing Simple Adapter, V3 semantic path, V5 Dialogue Stage, Presenter, Studio validation and normal Designer AI CURRENT publisher.

## LOCKED IDENTITY RULE

For an Emotional Dialogue character:

```text
actorId
= CUTSCENE_SCRIPT_V1 cast[].id
= dialogue speaker/listener value
```

No aliases. No display-name matching.

`identityHandle` is a stable logical Emotional Dialogue identity owned by the curated library. It is not an Actor/Ui Catalog handle.

Portrait/expression/body assets are presentation resources only.

Dialogue-only characters are legal with:

```text
presentationMode = DialoguePortrait
spawnWorldActor = false
```

## CHARACTER PACK TRUTH

Extend `MY_EmotionalDialogueCharacterPack` with explicit authoring truth:

- `authoringReady`
- `identityHandle`
- `defaultExpression`
- `visualMode = FullPortrait`
- `defaultPresentationHandle`
- `spawnWorldActorDefault = false`
- deterministic expression helpers
- deterministic pose helpers

There is no implicit Neutral fallback.

A pack is `authoringReady=true` only when it has:

- stable actorId
- stable identityHandle
- existing default-expression Sprite
- at least one explicit supported expression
- complete FullPortrait presentation
- Dialogue Stage compatibility
- no WorldActor requirement

Incomplete packs stay `authoringReady=false`. Catalog metadata must never promote them.

## ONE SHARED PROJECTION

Build one small deterministic projection directly from `MY_EmotionalDialogueLibrary` and reuse the same projection object for:

1. `MY_DesignerAiPublisher.PublishCurrent`
2. Unity COPY FOR CHAT / creative context
3. Simple Adapter dialogue preflight
4. Studio validation where practical

Do not maintain a second repertoire definition.

## PUBLISH CONTRACT

Publish:

`EMOTIONAL_DIALOGUE_CURRENT.json`

The exact external schema is:

`designer-ai/simple-authoring/EMOTIONAL_DIALOGUE_CURRENT.schema.json`

Required atomic semantics:

- same `publishTransactionId` as CURRENT
- same five `requiredCurrent` fingerprints
- included in bundle
- included in bundle manifest
- included in `current.json` metadata
- included in release validation
- included in publish metadata

Missing or zero-ready repertoire is not replaced by Catalog discovery. Publish the disabled state and make authoring instructions state:

`DIALOGUE AUTHORING DISABLED`

## SIMPLE ADAPTER PREFLIGHT

In `MY_CutsceneSimpleProductionEntry`, immediately after parse and before `BuildDeclaredCast`:

1. collect every dialogue `speaker` and `listener`;
2. distinguish missing cast id from cast-present-but-outside-repertoire;
3. keep `SIMPLE_DIALOGUE_SPEAKER_UNKNOWN` only when the cast id truly does not exist;
4. emit one root `DIALOGUE_CHARACTER_OUTSIDE_REPERTOIRE` blocker for each existing cast identity that is not authoring-ready;
5. include the available authoring-ready repertoire in the diagnostic;
6. stop before HandleResolver, V3 and materialization when this gate fails.

Do not cascade one repertoire failure into repeated unknown-speaker errors.

## EXPRESSION RULE

For a legal participant:

- line `expressionIntent` applies to the speaker only;
- if omitted, use the character's published `defaultExpression`;
- listener uses its published `defaultExpression`;
- unsupported expression emits `DIALOGUE_EXPRESSION_OUTSIDE_REPERTOIRE`;
- no Neutral fallback;
- no portrait search;
- no filename search;
- no nearest expression.

## V3 / V5 LOWERING

Pass a curated portrait-only identity into V3 semantic IR.

Add only the narrow V3 compiler support needed so an Emotional Dialogue cast entry can materialize as:

```text
DialoguePortrait
spawnWorldActor = false
```

without Actor-primary validation and without converting a Ui Sprite into Actor identity.

All non-dialogue cast continues through the existing Catalog Actor path unchanged.

The existing V5 Dialogue Stage receives the exact expression Sprite from the same CharacterPack.

`MY_EmotionalDialogueRuntime` must not replace a missing/unsupported expression with Neutral.

## CREATIVE CONTEXT

Add the same shared projection to `MY_CutsceneCreativeContextV3Builder`.

When repertoire is available, expose:

- exact actorId
- displayName
- identityHandle
- defaultExpression
- supportedExpressions
- supportedPoses
- legal curated locations
- explicit closed-world instructions

When missing or empty:

```text
dialogueAuthoringEnabled = false
```

Do not include generic dialogue examples using characters outside the repertoire.

## FORBIDDEN FALLBACKS

Never derive dialogue participants from:

- general Actor Catalog
- Ui Catalog
- Director actor projection
- Director ui projection
- Visual Atlas
- filename
- displayName
- tags/capabilities
- visual similarity

Never silently substitute another character.

Never create a dummy/invisible WorldActor.

## TESTS

Focused compile + EditMode tests only.

Required coverage:

- serialization matches `EMOTIONAL_DIALOGUE_CURRENT.schema.json`;
- deterministic ordering;
- exact requiredCurrent fingerprints;
- bundle/manifest/release gates include the repertoire file;
- missing cast -> existing unknown-speaker diagnostic;
- cast exists outside repertoire -> one root repertoire blocker, no cascade;
- unsupported expression -> explicit expression blocker with supported list;
- legal curated character -> V5 Dialogue Stage, exact expression, `DialoguePortrait`, `spawnWorldActor=false`;
- Simple V1 without dialogue remains unchanged;
- creative context includes repertoire when available;
- missing/empty repertoire disables dialogue only.

Do not run remote Publish and do not modify GitHub as part of the Unity task.

## DELIVERY BACK TO GIT AGENT

At the end provide:

- Unity files changed;
- exact emitted `EMOTIONAL_DIALOGUE_CURRENT.json` shape;
- bundle entry and manifest node names;
- fingerprints/status to verify;
- actual authoring-ready characters published;
- any field/path names that differ from this contract;
- focused compile/EditMode results.

## DONE WHEN

```text
MY_EmotionalDialogueLibrary
-> one shared curated projection
-> atomic EMOTIONAL_DIALOGUE_CURRENT.json
-> Simple dialogue preflight
-> V3 curated DialoguePortrait identity
-> existing V5 Dialogue Stage
-> exact CharacterPack expression
-> spawnWorldActor=false
```

works end-to-end without Catalog promotion, silent fallback or parallel dialogue architecture.
