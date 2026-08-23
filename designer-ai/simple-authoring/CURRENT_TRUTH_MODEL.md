# STARWARS_DELTA CURRENT Truth Model

## Purpose

There is one truth producer for Cutscene authoring data:

```text
Unity Publish CURRENT
```

Everything published to GitHub, Pages, Context Packs, Director projections and visual evidence is a projection or mirror of that Unity-owned CURRENT.

Do not create another authority in Git, the browser, Devora, ChatGPT or the Web Preview.

## Authority hierarchy

```text
Unity project source + curated authoring data
        |
        v
Unity Publish CURRENT
        |
        +--> requiredCurrent
        |      atomic authoring compatibility identity
        |
        +--> AUTHORING_HANDLES
        |      legal CUTSCENE_SCRIPT_V1 visual/audio vocabulary
        |
        +--> EMOTIONAL_DIALOGUE_CURRENT
        |      complete closed-world dialogue universe
        |
        +--> Director View
        |      semantic/search projection only
        |
        +--> Visual Atlas
        |      pixel evidence only
        |
        v
Git main
        committed distribution mirror
        |
        v
GitHub Pages / downloads / Devora Context Pack
        delivery surfaces only
```

## Scope ownership

### Unity Publish CURRENT

Owns whether an artifact is CURRENT and may be distributed.

It must produce one atomic set whose compatibility identity is the five-field `requiredCurrent` object.

### requiredCurrent

The compatibility identity is exactly:

- `catalogRevision`
- `contractRevision`
- `schemaHash`
- `snapshotContentHash`
- `authoringRuleRegistryRevision`

All values are opaque strings. They must never be converted to JavaScript numeric values or any other lossy numeric type.

`publishTransactionId` is provenance for one publication transaction. It is not a substitute for `requiredCurrent` compatibility.

### AUTHORING_HANDLES

This is the writable vocabulary for normal `CUTSCENE_SCRIPT_V1` handles.

A model may not invent a handle from a filename, display name, Catalog record, Director entry, Atlas label or visual similarity.

Every automatically RECOMMENDABLE authorable Director item must resolve to exactly one legal authoring handle.

Audio used by `CUTSCENE_SCRIPT_V1 audio[].handle` belongs in this vocabulary as an Audio route even though audio has no Atlas pixels.

### EMOTIONAL_DIALOGUE_CURRENT

This is a separate CLOSED WORLD.

It is the complete dialogue participant universe.

Only `authoringReady=true` characters may speak or listen in authored dialogue.

Dialogue identity and supported expressions must never be discovered from AUTHORING_HANDLES, Actor Catalog, Ui Catalog, Director, Visual Atlas, filenames or visual similarity.

### Director View

Director is a rich semantic/search projection used to understand available material and shortlist choices.

Director does not create identity and does not override authoring eligibility owned by the authoritative source for that destination.

For dialogue, `EMOTIONAL_DIALOGUE_CURRENT` wins.

For Simple V1 handles, `AUTHORING_HANDLES` wins.

### Visual Atlas

The Atlas proves pixels and visual meaning.

It never creates identity, legality or dialogue membership.

One representative image per animation family is intentional.

### Git main

Git main is the committed distribution mirror of Unity Publish CURRENT.

It is useful for verifying exactly what was published and for preventing GitHub Pages propagation delay from masquerading as a newer CURRENT.

Git main must not be described as an independent authoring truth producer.

### GitHub Pages / Devora Context Pack / Web Preview

These are consumers and delivery surfaces.

They may validate atomic identity and reject stale/missing data.

They must not repair authority gaps by inventing IDs, promoting Catalog records, substituting portraits or silently selecting older data.

## Publication invariants

A fresh Unity Publish CURRENT is valid only when all of the following hold:

1. Generated Cutscene output is excluded from authoritative Catalog input.
2. `generatedRootRecordCount == 0` for the published authoring Catalog source.
3. The Authoring Rule Registry agrees with the current closed-world Emotional Dialogue policy.
4. Every `requiredCurrent` value is serialized losslessly as a string.
5. Every automatically RECOMMENDABLE authorable Director item has exactly one authoring handle.
6. Audio handles required by Simple V1 are published in AUTHORING_HANDLES.
7. Every `authoringReady` Emotional Dialogue character has a deterministic CharacterPack-owned presentation contract.
8. Context Pack files preserve the exact published artifact bytes when they claim to contain the exact artifact.
9. Context Pack manifest records SHA-256 and byte size for every included authoritative file.
10. Legacy dialogue examples outside the CURRENT Emotional Dialogue repertoire are not exported as Golden/current authoring guidance.

## Failure policy

Authority failures are red blockers, not fallback opportunities.

Examples:

```text
GENERATED_ROOT_CONTAMINATES_CURRENT
DIALOGUE_CHARACTER_OUTSIDE_REPERTOIRE
DIALOGUE_EXPRESSION_OUTSIDE_REPERTOIRE
RECOMMENDABLE_WITHOUT_AUTHORING_HANDLE
CURRENT_FINGERPRINT_PRECISION_LOSS
CONTEXT_ARTIFACT_HASH_MISMATCH
```

One useful root diagnostic is preferred over a cascade of secondary errors.

## Core rule

```text
Unity decides truth.
Publish freezes it.
Git mirrors it.
Devora authors only from it.
Preview checks it.
Unity validates it again.
```
