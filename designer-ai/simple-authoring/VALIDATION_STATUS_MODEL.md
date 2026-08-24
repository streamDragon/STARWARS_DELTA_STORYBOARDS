# STARWARS_DELTA CUTSCENE VALIDATION STATUS MODEL

## Purpose

This is the systemic severity/ownership model for Simple V1 authoring, Unity validation, Editable Preview and downstream materialization.

It exists to stop valid authored films from being rejected because a backend/editor implementation detail failed later in the pipeline, while keeping genuine runtime-representation limits RED.

The rule is deliberately simple:

**Color describes what happens to the film. Owner describes who can fix it. Only RED blocks Editable Preview.**

## Four colors

### GREEN — EXACT

The authored intent can be represented as requested.

- no visible semantic loss
- no repair required
- Editable Preview allowed
- final readiness allowed

### YELLOW — AUTO-REPAIRED / MINOR

The backend supplied or changed a deterministic low-level mechanic without materially changing what the audience is meant to perceive.

Examples:

- backend-selected locked dialogue normalizes semantic Push/Pull to legal Hold
- deterministic Dialogue Stage frame/background default
- harmless continuity or presentation normalization

Rules:

- keep the source JSON unchanged
- preserve authored semantic intent in diagnostics
- no identity substitution
- Editable Preview allowed
- final readiness allowed unless another rule says otherwise
- prefer one owning correction diagnostic instead of repeated "missing" warnings when the backend already supplies the same deterministic value later

### ORANGE — SEMANTIC DEVIATION / DEGRADED PREVIEW

The cutscene can continue honestly, but the visible result or preview differs materially from authored intent.

Examples:

- a legal requested cinematic move must be downgraded to another legal move
- a valid exact CURRENT WorldActor exists but Editable Preview materialization cannot currently realize it
- a legal exact dialogue expression lacks pixel evidence in the preview mirror
- a requested visible count/presentation cannot be fully realized while the remainder of the cutscene is still meaningful
- a legal Simple V1 Actor route is preserved but downstream backend canonical proof is incomplete

Rules:

- Editable Preview continues
- show an explicit diagnostic placeholder or omission where necessary
- preserve the exact authored identity in diagnostics
- NEVER select a replacement asset merely to silence the diagnostic
- do not rewrite accepted source JSON just because Unity/editor plumbing is incomplete
- ORANGE blocks a claim of final exact readiness, but does not block preview/review

### RED — CANNOT SAFELY PRODUCE

There is no honest legal result that can continue without inventing, substituting, violating CURRENT, exceeding current runtime representation, or accepting unrecoverable semantic corruption.

Examples:

- unknown/ambiguous/stale CURRENT identity
- illegal destination/capability with no legal resolution
- unsupported Emotional Dialogue speaker/listener/identityHandle/expression
- invented asset/evidence
- schema/semantic corruption with no deterministic legal repair
- no legal Dialogue Stage at all
- current actor Orbit v1 asked to orbit a center actor that is moving during the same interval

Rules:

- Editable Preview blocked
- source, choreography or authoritative data must be corrected
- no fuzzy fallback

## Ownership

Every diagnostic should also identify an owner.

### AUTHORING

The JSON/CURRENT authoring choice is invalid or unrepresentable with the current published/runtime contract and ChatGPT/Devora can correct it from published authoring truth.

Typical color: RED.

### BACKEND

The authored intent is legal and the backend owns a deterministic normalization/default or provenance projection.

Typical color: YELLOW, sometimes ORANGE when visible semantics degrade.

### ENGINE

The authored identity/intent is legal, but Unity/editor/runtime execution cannot currently realize it.

Typical color: ORANGE for Editable Preview.

A known exact CURRENT identity that later fails resolver/materialization is ENGINE-owned. It is not automatically an authoring RED.

## Editable Preview gate

The gate is:

```text
RED > 0   -> BLOCK EDITABLE PREVIEW
RED = 0   -> ALLOW EDITABLE PREVIEW
```

YELLOW and ORANGE do not block Editable Preview.

For ORANGE preview gaps, use an explicit visible diagnostic placeholder or omit the failed element while keeping the rest of the film playable. The placeholder must carry the exact identity and diagnostic reason. Never substitute another identity.

## Camera subject clarification

Semantic composition subject and physical camera Transform target are not the same thing.

- a `Hold` shot may preserve a semantic non-Actor subject while physical targetEntityId remains empty;
- curated dialogue participants with `presentationMode=DialoguePortrait` and `spawnWorldActor=false` remain dialogue/composition anchors, not WorldActors;
- target-dependent camera moves still obey their real runtime target requirements.

Do not manufacture a physical target and then warn about removing it when the semantic presentation never required one.

## Actor motion clarification

Simple V1 actor motion is lowered into the existing V5 `actorActions`/Timeline path.

Confirmed current behavior:

- semantic movement maps to existing V5 Move/Enter/Exit/Formation/Hold/Orbit/VisualWeaponAction/Deactivate forms;
- `motionIntent=orbit` lowers to real V5 Actor Orbit;
- count-expanded actor IDs inherit the source motion deterministically;
- semantic speed strings (`slow`, `medium`, `fast`, `burst`) must be parsed as semantic values, not directly converted to float;
- malformed numeric input must produce deterministic validation/default behavior, not an uncaught Studio `FormatException`.

### Orbit v1

Current V5 Actor Orbit v1 is fixed-center.

The Timeline writer samples a static ellipse from authored center state and does not sample a moving target Transform each frame.

Therefore:

```text
CUTSCENE_ORBIT_CENTER_MOVES
```

remains a genuine RED blocker when the Orbit target/center has overlapping movement.

Do not reclassify it merely because a higher semantic vocabulary includes Orbit/Pursuit/Escort/Intercept. Vocabulary is not runtime implementation.

A future moving-center runtime must update execution, validator and published authoring guidance together.

## Accepted JSON freeze rule

Once a Simple V1 script has passed authoring integrity:

- schema valid
- exact CURRENT identities valid
- legal role/capability choices
- Emotional Dialogue identities/expressions valid
- no invented assets/evidence

then downstream BACKEND/ENGINE YELLOW or ORANGE findings do not require regenerating the JSON.

That JSON becomes the fixture. Fix the backend/editor against the same fixture until preview/materialization improves.

This freeze does not apply to a newly proven genuine RED representation conflict such as moving-center Orbit under current Orbit v1. In that case, fix choreography or add the missing runtime capability deliberately.

## Quantity / grouped visual clarification

`visible[].count` is a real visual obligation.

Do not count-expand a precomposed fleet/group visual as if the source image represented one ordinary actor. Pixel inspection decides whether a handle is a reusable single actor or already contains a group. Use either multiple true single-actor instances or one verified grouped asset, not both multiplication mechanisms at once.

## Current smoke-test implication

Exact WorldActor identities that are present in CURRENT and marked preview-safe must not be reported as authoring RED merely because `MY_CutsceneExecutionPlan.ResolveAsset(...)` later returns no usable preview object.

If exact CURRENT validation already succeeded, classify that failure as:

```text
ORANGE
owner = ENGINE
code = EXACT_ASSET_PREVIEW_MATERIALIZATION_FAILED
blocksEditablePreview = false
blocksFinalReadiness = true
```

The preview may continue with an explicit missing-element diagnostic. Final exact readiness remains false until the materializer is fixed.

## Non-negotiable safety boundary

This model does not weaken identity safety or runtime truth.

Unknown actors, wrong CURRENT handles, unsupported explicit dialogue expressions, stale CURRENT identities, invented assets and genuinely unsupported runtime representations remain RED.

The purpose is not to make everything pass. The purpose is to let a valid film run far enough to be reviewed while implementation gaps remain visible and attributable.
