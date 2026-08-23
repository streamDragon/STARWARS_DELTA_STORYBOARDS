# STARWARS_DELTA Unity CURRENT Truth Synchronization Handoff

## GOAL

Make Unity Publish CURRENT the only producer of authoritative Cutscene authoring truth and remove the remaining contradictions discovered in the published Devora Context Pack.

Do not redesign the Cutscene architecture.

Do not create another source-of-truth layer.

Inspect the existing publisher, Catalog scan/filtering, Authoring Rule Registry, Director projection, AUTHORING_HANDLES generation, Emotional Dialogue projection and Context Pack builder before editing.

Make the smallest direct changes required.

The intended ownership model is documented in:

`designer-ai/simple-authoring/CURRENT_TRUTH_MODEL.md`

## P0-1 GENERATED ROOT MUST HARD-BLOCK CURRENT

The audited CURRENT still reported 4,231 Generated Cutscene records in the authoritative Catalog source while the Rule Registry already contains `GENERATED_ROOT_EXCLUSION` as a Blocker.

This cannot remain a warning.

Before publishing CURRENT, ensure generated Cutscene output roots are excluded from the authoritative Catalog input.

A CURRENT publish must require:

```text
generatedRootRecordCount == 0
```

If generated records remain, stop the publish with one root blocker such as:

```text
GENERATED_ROOT_CONTAMINATES_CURRENT
```

Include the count and the excluded/generated root path(s) in the diagnostic.

Do not continue to Director, Context Pack or remote publish with a contaminated authoritative Catalog.

Do not delete generated Cutscene output. Exclude it from authoritative Catalog source scanning.

## P0-2 AUTHORING RULE REGISTRY MUST MATCH CLOSED-WORLD DIALOGUE

The published Authoring Rule Registry still contains old dialogue semantics that conflict with the new Emotional Dialogue closed world.

In particular, inspect and update/deprecate rules equivalent to:

- `DIALOGUE_SAME_IDENTITY_PORTRAIT_DEFAULT`
- old `DIALOGUE_SYSTEM_STAGE_DEFAULTS` Actor-primary identity semantics
- any rule that permits dialogue portrait discovery from general Actor/Ui/Catalog data
- any rule that permits expression fallback to Neutral when an explicit unsupported expression was requested

The new authoritative dialogue rules are:

```text
speaker/listener actorId
-> MY_EmotionalDialogueLibrary authoring-ready character
-> exact CharacterPack identity
-> exact supported expression
-> CharacterPack-owned presentation
-> existing Dialogue Stage
```

Forbidden for dialogue identity/presentation discovery:

- General Actor Resolver
- Actor Catalog
- Ui Catalog
- AUTHORING_HANDLES Actor route
- Director actor/ui projection
- Visual Atlas
- filename/displayName/alias search
- visual similarity
- WorldActor fallback

Required root blockers:

```text
DIALOGUE_CHARACTER_OUTSIDE_REPERTOIRE
DIALOGUE_EXPRESSION_OUTSIDE_REPERTOIRE
```

After changing registry semantics, regenerate/bump `authoringRuleRegistryRevision` normally. Do not preserve the old revision hash for changed rules.

## P0-3 ALL REVISION/FINGERPRINT VALUES ARE STRINGS

The audited Context Pack proved precision loss:

```text
correct catalogRevision:
7625021116463057315

lossy copy observed in generated Context/Director JSON:
7625021116463057000
```

Treat every revision/fingerprint field as an opaque string end-to-end.

Especially:

```text
catalogRevision
contractRevision
schemaHash
snapshotContentHash
authoringRuleRegistryRevision
```

Do not serialize `catalogRevision` as a JSON number anywhere in Publisher, Open CURRENT, Director, Context Pack or browser-generated pack metadata.

Do not pass it through JavaScript `Number`, floating point or another lossy numeric representation.

Where a Context Pack claims to include an exact published artifact, prefer copying the exact source bytes rather than parse + stringify.

Add a focused invariant that fails if any requiredCurrent value differs textually between CURRENT surfaces.

## P0-4 RECOMMENDABLE MUST HAVE AN AUTHORING HANDLE

The audited CURRENT had:

```text
Director RECOMMENDABLE visual entries: 645
AUTHORING_HANDLES: 641
```

Four observed RECOMMENDABLE Actor entries had no authoring handle:

```text
Bubble (1)
enemy5
player1
rocket0008
```

Do not special-case those names.

Fix the generic publisher invariant:

```text
Every automatically RECOMMENDABLE authorable Director entry
must resolve to exactly one legal AUTHORING_HANDLE.
```

If an entry cannot receive a legal handle, it must not be automatically RECOMMENDABLE.

Fail publishing or downgrade recommendation status according to the existing eligibility architecture. Do not let the Director advertise an automatically selectable item that Simple V1 cannot serialize.

Add one clear diagnostic such as:

```text
RECOMMENDABLE_WITHOUT_AUTHORING_HANDLE
```

## P1-1 ADD AUDIO TO AUTHORING_HANDLES

`CUTSCENE_SCRIPT_V1` authors:

```text
audio[].handle
```

The audited Director contains 224 Audio assets, but AUTHORING_HANDLES contains no Audio route.

Add the existing authoring-safe Audio vocabulary to AUTHORING_HANDLES.

Use the same deterministic handle/runtime identity conventions already used by Actor/Layer/Effect/Ui routes.

Audio does not require Atlas pixels.

For Audio handles, visual fields such as `atlasPage` / `atlasSlot` / visual reference may be null or omitted according to the existing schema.

Do not invent visual evidence for audio.

After this change, the rule must be true:

```text
Every handle field writable by CUTSCENE_SCRIPT_V1
has one authoritative published handle source.
```

Dialogue remains the deliberate separate closed world and does not use AUTHORING_HANDLES for participant discovery.

## P1-2 EMOTIONAL DIALOGUE PRESENTATION TRUTH

For each `authoringReady=true` Emotional Dialogue character, the published CharacterPack projection must make presentation truth deterministic.

At minimum keep/verify:

- `actorId`
- `identityHandle`
- `defaultExpression`
- `supportedExpressions`
- `defaultPresentationHandle`
- `spawnWorldActorDefault=false`

Prefer adding explicit presentation readiness if the existing model supports it cleanly, for example:

```text
presentationReady
visualReferenceId
```

An authoring-ready character must not require a browser or Unity consumer to search the general Ui/Actor Catalog for a substitute portrait.

The audit found `FEMALE_COMMS_01` authoring-ready while its published default presentation lacked direct browser visual evidence. Resolve this at CharacterPack/publisher truth, not by adding a preview fallback.

Important precedence:

```text
For dialogue eligibility:
EMOTIONAL_DIALOGUE_CURRENT.authoringReady owns truth.

General Director safeForPublish/safeForPreview metadata does not promote
or demote dialogue membership.
```

If presentation is incomplete, either make the CharacterPack presentation complete before `authoringReady=true`, or publish an explicit non-ready presentation state that blocks visual dialogue authoring. Do not silently borrow another asset.

## P1-3 CONTEXT PACK MUST PRESERVE ATOMIC ARTIFACT IDENTITY

The Context Pack currently contains semantically equivalent JSON copies whose bytes/line endings may differ from the published artifact while documentation calls them exact CURRENT artifacts.

Fix the Context Pack builder so authoritative files are byte-preserved when copied from the published CURRENT set.

The pack manifest should record for every authoritative included file:

```text
logicalArtifactId
packPath
webMirrorPath (when applicable)
sha256
sizeBytes
```

This is especially important for:

- CURRENT identity/control JSON
- OPEN_CURRENT
- AUTHORING_HANDLES
- EMOTIONAL_DIALOGUE_CURRENT
- schema/contract artifacts used as authoring authority

Do not use path names alone as identity.

On pack generation, recompute SHA-256/size from the bytes actually written into the ZIP and fail if they do not match the declared exact artifact identity.

## P1-4 REMOVE LEGACY DIALOGUE TEACHING FROM CURRENT EXPORTS

The audited Context Pack still contained 2D authoring guidance that used Green/Red pilot dialogue examples.

Those examples are not legal CURRENT dialogue examples unless those identities are actually present as `authoringReady=true` in EMOTIONAL_DIALOGUE_CURRENT.

Do not delete historical source unnecessarily.

Exclude/demote legacy examples from CURRENT Devora/ChatGPT teaching exports.

Replace any dialogue teaching example with characters from the actual current Emotional Dialogue repertoire, or use abstract labels that do not imply a non-repertoire character can speak.

Camera guidance may still teach near/far composition, but it must not accidentally teach illegal dialogue identity.

Also make the 2D camera vocabulary agree with the current Simple V1 semantic schema, including the supported semantic meanings of:

- hold
- push
- pull
- follow
- track
- drift
- shake
- impact_shake
- orbit
- cut

`orbit` remains semantic 2D/2.5D parallax/orbit-like motion. It must not imply unsupported 3D camera geometry.

## SOURCE-OF-TRUTH LANGUAGE

Generated instructions and Context Pack documentation must use this hierarchy consistently:

```text
Unity Publish CURRENT = truth producer
requiredCurrent = atomic compatibility identity
AUTHORING_HANDLES = legal Simple V1 visual/audio handle vocabulary
EMOTIONAL_DIALOGUE_CURRENT = complete dialogue closed world
Director = semantic/search projection
Visual Atlas = pixel evidence
Git main = committed distribution mirror
GitHub Pages = delivery mirror
```

Do not describe Git main, Director or Atlas as an independent authoring truth producer.

## CONSTRAINTS

Do not:

- redesign V3 or V5
- replace the Simple Adapter
- create another registry
- create another Catalog
- create another dialogue resolver
- add fallback layers
- build a new test framework
- perform unrelated cleanup
- manually patch published Git CURRENT as the fix
- run remote Publish unless the user explicitly asks after local verification

Use the existing Publisher, Catalog, Director, Rule Registry, Simple Authoring and Emotional Dialogue systems.

Prefer direct invariants and hard blockers over recovery logic.

## FOCUSED VERIFICATION

Run only focused compile / existing EditMode checks needed for the changed code.

Verify locally that a newly generated CURRENT candidate satisfies:

```text
generatedRootRecordCount == 0
```

and:

```text
requiredCurrent values are byte/text exact across generated surfaces
```

and:

```text
RECOMMENDABLE authorable entries -> exactly one AUTHORING_HANDLE
```

and:

```text
AUTHORING_HANDLES includes Audio vocabulary needed by Simple V1
```

and:

```text
Authoring Rule Registry contains no dialogue rule that can bypass
EMOTIONAL_DIALOGUE_CURRENT closed-world identity/expression rules
```

and:

```text
Context Pack authoritative-file manifest hashes/sizes match the bytes in the ZIP
```

## DONE WHEN

The local generated CURRENT candidate has one coherent truth chain:

```text
Unity curated/project truth
-> Publish CURRENT
-> one exact requiredCurrent
-> legal AUTHORING_HANDLES including Audio
-> closed EMOTIONAL_DIALOGUE_CURRENT
-> Director projection
-> Visual evidence
-> byte-verified Context Pack
```

with:

- zero Generated-root contamination
- no 64-bit revision precision loss
- no RECOMMENDABLE item without an authoring handle
- no legacy dialogue fallback rule in the current registry
- no current teaching example that promotes a non-repertoire dialogue character

## REPORT BACK

At completion report only:

1. files changed
2. exact root causes fixed
3. old vs new publisher invariants
4. new `authoringRuleRegistryRevision`
5. generated-root count
6. Director RECOMMENDABLE count vs AUTHORING_HANDLES coverage
7. Audio handle count
8. Emotional Dialogue authoring-ready character count and presentation readiness
9. exact requiredCurrent values from the generated candidate
10. Context Pack hash/size verification result
11. focused compile/EditMode result
12. any genuine blocker remaining

Do not pad the report with architecture proposals or speculative follow-up work.
