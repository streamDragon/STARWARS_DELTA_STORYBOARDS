# STARWARS_DELTA Unity Handoff - Emotional Dialogue Closed World

## GOAL

Make Emotional Dialogue a hard closed-world system across Unity publish, Simple Adapter and Studio validation.

Normal gameplay Actors, portraits, Ui sprites, Catalog records and Visual Atlas entries must never become dialogue participants implicitly.

Only characters explicitly registered in `MY_EmotionalDialogueLibrary` and published as `authoringReady=true` may be used as `speaker` / `listener` in authored dialogue.

Do not redesign the Cutscene architecture. Reuse the existing V5 Dialogue Stage, existing Presenter, existing Simple Adapter path, existing Studio validation and normal CURRENT publisher.

## REQUIRED UNITY CHANGES

### 1. Publish one authoritative repertoire

Extend the normal atomic CURRENT publish to export:

`EMOTIONAL_DIALOGUE_CURRENT.json`

The file must be generated directly from `MY_EmotionalDialogueLibrary`.

Do not infer entries from Catalog scans, filenames, portraits, tags or `Cutscene.Character` capability.

Required shape:

```json
{
  "schema": "STARWARS_DELTA_EMOTIONAL_DIALOGUE_CURRENT",
  "schemaVersion": 1,
  "status": "CURRENT_VERIFIED_EMOTIONAL_DIALOGUE",
  "publishTransactionId": "<same atomic publish>",
  "requiredCurrent": {
    "catalogRevision": "...",
    "contractRevision": "...",
    "schemaHash": "...",
    "snapshotContentHash": "...",
    "authoringRuleRegistryRevision": "..."
  },
  "characters": [
    {
      "actorId": "FEMALE_COMMS_01",
      "displayName": "...",
      "authoringReady": true,
      "identityHandle": "<stable published dialogue identity handle>",
      "visualMode": "FullPortrait",
      "defaultExpression": "Neutral",
      "supportedExpressions": ["Neutral", "Listening", "Concerned", "Shocked", "Determined"],
      "supportedPoses": [],
      "defaultPresentationHandle": "<optional presentation handle>",
      "spawnWorldActorDefault": false
    }
  ],
  "locations": []
}
```

The Git-side contract schema is `designer-ai/simple-authoring/EMOTIONAL_DIALOGUE_CURRENT.schema.json`.

A character may be exported with `authoringReady=true` only when its curated CharacterPack is complete enough for authored dialogue.

Minimum readiness:

- stable actorId
- stable dialogue identity handle
- FullPortrait presentation route
- default expression
- explicit expression map
- Dialogue Stage compatibility
- no WorldActor requirement

Incomplete packs are omitted from the authoring-ready repertoire or published with `authoringReady=false`.

### 2. Simple Adapter must resolve dialogue only through the repertoire

When a `CUTSCENE_SCRIPT_V1` beat contains `dialogue[]`:

1. Resolve `speaker` / `listener` to `cast[].id`.
2. Resolve that cast identity against the published Emotional Dialogue repertoire.
3. Reject the line if the cast identity is not an `authoringReady=true` repertoire character.
4. Resolve `expressionIntent` only through that character pack's supported expression map.
5. Route the participant to the existing Dialogue Stage / Presenter with `spawnWorldActor=false` for dialogue-only characters.

Do not fall back to:

- general Actor Catalog
- Ui Catalog
- portrait asset search
- filename search
- visual similarity
- nearest display name
- another character
- dummy WorldActor

### 3. Studio validation must fail at the repertoire boundary

Add one root validation diagnostic:

`DIALOGUE_CHARACTER_OUTSIDE_REPERTOIRE`

Use it when a `speaker` / `listener` resolves to a cast id but that cast identity is not an authoring-ready Emotional Dialogue character.

Do not cascade this into repeated `UNKNOWN SPEAKER` errors.

Recommended behavior:

```text
DIALOGUE_CHARACTER_OUTSIDE_REPERTOIRE
speaker 'commander_arden' exists in cast, but is not an authoring-ready Emotional Dialogue character in CURRENT.
```

If the cast id itself truly does not exist, keep the existing unknown-speaker diagnostic.

For unsupported expression on a valid repertoire character:

- warning or existing contract policy
- use the existing deterministic expression fallback only if the current Rule Registry already permits it
- never search arbitrary portrait assets

### 4. Publisher must keep the repertoire atomic with CURRENT

`EMOTIONAL_DIALOGUE_CURRENT.json` must carry the same five `requiredCurrent` fingerprints as the rest of the publish.

The web/ChatGPT authoring side will disable dialogue if:

- the file is missing
- status is not `CURRENT_VERIFIED_EMOTIONAL_DIALOGUE`
- requiredCurrent differs from OPEN_CURRENT
- publish provenance is stale/nonmatching when the publisher uses transaction-level atomicity
- there are zero `authoringReady=true` characters

### 5. Do not convert portrait assets into Actor identity

Portrait/body/expression sprites remain presentation resources.

A Ui portrait record must not become a cast identity merely because it has `Cutscene.Actor`, `Cutscene.Character` or `Cutscene.Portrait` metadata.

Dialogue identity comes only from the curated Emotional Dialogue library entry.

## CONSTRAINTS

- Do not create a second dialogue materializer.
- Do not create a second Timeline pipeline.
- Do not add Catalog-wide runtime scanning.
- Do not auto-promote normal Actors into Emotional Dialogue.
- Do not add dummy/invisible WorldActors.
- Do not weaken current route/capability validation.
- Do not build Layered2D now.
- Do not add new test architecture or QA framework.
- Keep the implementation small and direct.

## DONE WHEN

1. Unity publishes `EMOTIONAL_DIALOGUE_CURRENT.json` from `MY_EmotionalDialogueLibrary` in the normal CURRENT publish.
2. Only explicitly curated `authoringReady=true` characters appear as legal dialogue choices.
3. A Simple V1 dialogue with a non-repertoire character receives `DIALOGUE_CHARACTER_OUTSIDE_REPERTOIRE` before materialization.
4. The validator does not produce a cascade of `UNKNOWN SPEAKER` errors for a cast id that exists but failed repertoire validation.
5. A valid repertoire character can speak with `spawnWorldActor=false` through the existing V5 Dialogue Stage.
6. Requested expressions resolve only through the curated CharacterPack.
7. Republish CURRENT and verify the web Context Pack receives the repertoire atomically.

## STOP POINT

Stop after the above path works end-to-end. Do not expand the repertoire or redesign dialogue presentation as part of this task.
