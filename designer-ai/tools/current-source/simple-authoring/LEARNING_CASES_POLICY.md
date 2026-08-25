# STARWARS_DELTA Learning Cases Policy

Learning Cases are engineering evidence, not authoring truth.

## Hard boundary

Raw Learning Cases MUST NOT be injected into normal NEW, REVISE or REPAIR ChatGPT prompts as creative constraints, suggested choices, active lessons or required fixes.

A raw case may contain data from an older Catalog, schema, rule registry, adapter implementation or runtime behavior. Replaying it as current instruction can corrupt otherwise valid CURRENT authoring.

## Storage model

Keep raw cases immutable for engineering diagnosis. They may be archived, deduplicated or moved out of the active inbox, but their original evidence must never be rewritten into a new meaning.

The normal authoring pipeline reads only CURRENT:

- `OPEN_CURRENT.json`
- `AUTHORING_HANDLES.json`
- `AUTHORING_RULES_CURRENT.json`
- `CUTSCENE_SCRIPT_V1.schema.json`
- `CINEMATIC_INTENT_QA_RULES.json`
- `EMOTIONAL_DIALOGUE_CURRENT.json` when dialogue is used
- `CUTSCENE_VALIDATION_CURRENT.json`

Learning Case storage is not a source for these artifacts.

## Classification before curation

Every case is classified against the current `requiredCurrent` fingerprint, not merely a Catalog revision or transaction id.

Classification values:

- `CURRENT_EXACT`: all requiredCurrent fields match the active CURRENT.
- `HISTORICAL`: one or more requiredCurrent fields differ.
- `UNKNOWN`: required fingerprint evidence is incomplete.

Historical and unknown cases can be used for engineering research only. They cannot become active authoring guidance without re-verification against CURRENT.

## Curation rule

Even a `CURRENT_EXACT` raw case is not an active lesson automatically.

Only a separately curated, human/engineering-approved rule may enter authoring guidance. A curated rule must state:

- stable rule id
- owner: AUTHORING, BACKEND or ENGINE
- BAD -> GOOD example or deterministic system behavior
- schema/rule-registry applicability
- regression test id

If the rule depends on a schema shape, route contract or runtime limitation that later changes, the curated rule must become inactive until re-verified.

## Repair request rule

A REPAIR request sent to ChatGPT must contain the original failed `CUTSCENE_SCRIPT_V1` JSON, or a lossless reference/attachment to it.

If the source JSON is unavailable, emit `REPAIR_SOURCE_JSON_UNAVAILABLE` and do not ask ChatGPT to reconstruct a film from diagnostics.

The REPAIR envelope uses the active CURRENT as its target `requiredCurrent`.

Historical source identity may be preserved separately as `sourceAuthoredAgainst`, but it must never replace the active target CURRENT.

## Diagnostic compression

Do not place one string per warning into `creativeConstraints`.

Diagnostics must be normalized into root-cause groups containing:

- diagnostic code
- owner
- severity/status color
- occurrence count
- up to three sample JSON paths
- whether the source authoring is still valid
- whether ChatGPT can legally fix it

Duplicate downstream symptoms from one source defect count as one root-cause group.

Examples:

- 41 generated `simple_audio_*` cues producing two validator warnings each are one backend Audio provenance/materialization defect, not 82 authoring edits.
- deterministic projectile duration expansion is AUTO_REPAIRED/technical information, not a creative constraint.
- locked-dialogue Push/Pull -> Hold is a deterministic staging repair when supported by the backend; do not ask ChatGPT to rewrite a valid film solely to remove that diagnostic.

## Generated identity rule

Generated runtime aliases such as `simple_audio_*`, `simple_actor_*`, `generated_*` and `preview_*` are backend identities only.

They must never be exported as authoring handles or recommended back to ChatGPT.

When an exact legal CURRENT source handle later fails after adaptation/materialization, preserve the source handle and classify the failure as BACKEND or ENGINE unless the original handle itself is invalid.

## Suggested choices

Do not expose raw Catalog asset ids as `suggestedCandidates` to a ChatGPT authoring request.

ChatGPT-facing suggestions must be exact direct Simple V1 handles, grouped by route when useful.

If the user explicitly selected a raw Catalog asset, translate it through the CURRENT authoring projection before building the request. If no legal direct handle exists, report that fact instead of leaking the raw id into authoring.

## Animation intent rule

Do not infer `animationIntent` from an actor/display-name state such as WALK_RIGHT.

Author `animationIntent` only when the selected CURRENT Actor handle explicitly exposes compatible animation support. A static visual/state variant may still move through actor locomotion without claiming an unavailable animation clip.

Unsupported animation intent is a visible quality degradation, not proof that the actor handle itself is invalid.

## Inbox maintenance

The active Learning Case inbox should remain small and current enough for engineering work.

After a major CURRENT/schema/adapter transition, archive historical raw cases out of the active inbox. Do not delete Git/history or immutable evidence merely to make counters smaller.

Normal ChatGPT/Devora authoring must behave identically whether the raw Learning Case inbox contains 0 cases or 10,000 cases.
