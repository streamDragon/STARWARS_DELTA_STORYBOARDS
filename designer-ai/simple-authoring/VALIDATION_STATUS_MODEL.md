# STARWARS_DELTA CUTSCENE VALIDATION STATUS MODEL

## Purpose

This is the systemic severity/ownership model for Simple V1 authoring, Unity validation, Editable Preview and downstream materialization.

It exists to stop valid authored films from being rejected because a backend/editor implementation detail failed later in the pipeline.

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

### ORANGE — SEMANTIC DEVIATION / DEGRADED PREVIEW

The cutscene can continue honestly, but the visible result or preview differs materially from authored intent.

Examples:

- a legal requested cinematic move must be downgraded to another legal move
- a valid exact CURRENT WorldActor exists but Editable Preview materialization cannot currently realize it
- a legal exact dialogue expression lacks pixel evidence in the preview mirror
- a requested visible count/presentation cannot be fully realized while the remainder of the cutscene is still meaningful

Rules:

- Editable Preview continues
- show an explicit diagnostic placeholder or omission where necessary
- preserve the exact authored identity in diagnostics
- NEVER select a replacement asset merely to silence the diagnostic
- do not rewrite accepted source JSON just because Unity/editor plumbing is incomplete
- ORANGE blocks a claim of final exact readiness, but does not block preview/review

### RED — CANNOT SAFELY PRODUCE

There is no honest legal result that can continue without inventing, substituting, violating CURRENT, or accepting unrecoverable semantic corruption.

Examples:

- unknown/ambiguous/stale CURRENT identity
- illegal destination/capability with no legal resolution
- unsupported Emotional Dialogue speaker/listener/identityHandle/expression
- invented asset/evidence
- schema/semantic corruption with no deterministic legal repair
- no legal Dialogue Stage at all

Rules:

- Editable Preview blocked
- source or authoritative data must be corrected
- no fuzzy fallback

## Ownership

Every diagnostic should also identify an owner.

### AUTHORING

The JSON/CURRENT authoring choice is invalid and ChatGPT/Devora can correct it from published authoring truth.

Typical color: RED.

### BACKEND

The authored intent is legal and the backend owns a deterministic normalization/default.

Typical color: YELLOW.

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

## Accepted JSON freeze rule

Once a Simple V1 script has passed authoring integrity:

- schema valid
- exact CURRENT identities valid
- legal role/capability choices
- Emotional Dialogue identities/expressions valid
- no invented assets/evidence

then downstream BACKEND/ENGINE YELLOW or ORANGE findings do not require regenerating the JSON.

That JSON becomes the fixture. Fix the backend/editor against the same fixture until preview/materialization improves.

## Current smoke-test implication

For the 207-second smoke test, exact WorldActor identities that are present in CURRENT and marked preview-safe must not be reported as authoring RED merely because `MY_CutsceneExecutionPlan.ResolveAsset(...)` later returns no usable preview object.

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

This model does not weaken identity safety.

Unknown actors, wrong CURRENT handles, unsupported explicit dialogue expressions, stale CURRENT identities and invented assets remain RED.

The purpose is not to make everything pass. The purpose is to let a valid film run far enough to be reviewed while implementation gaps remain visible and attributable.
