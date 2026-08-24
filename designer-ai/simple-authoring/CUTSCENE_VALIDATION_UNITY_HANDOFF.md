# STARWARS_DELTA CUTSCENE VALIDATION CURRENT - UNITY HANDOFF

## Goal

Project the existing Unity Cutscene validation truth into the public authoring contract without creating a second validator, and use the same truth inside Studio to distinguish authoring failure from backend/engine degradation.

Public contract:

`designer-ai/simple-authoring/CUTSCENE_VALIDATION_CURRENT.schema.json`

Unity eventually publishes:

`CUTSCENE_VALIDATION_CURRENT.json`

through the existing user-controlled **PUBLISH AUTHORING SYNC CURRENT** transaction.

Do not Publish during implementation/testing.

## Systemic model

The validation model is no longer a binary warning/error presentation.

**Color describes what happens to the film. Owner describes who can fix it. Only RED blocks Editable Preview.**

```text
GREEN  = exact authored intent
YELLOW = deterministic backend repair/minor, preview continues
ORANGE = visible semantic/preview degradation, preview continues
RED    = cannot safely produce, preview blocked
```

Owners:

```text
AUTHORING = source/CURRENT authoring choice must change
BACKEND   = backend owns deterministic repair/default
ENGINE    = legal authored truth exists but editor/runtime execution failed
```

See `VALIDATION_STATUS_MODEL.md` for the authoritative human-readable policy.

## Required architecture

One Unity validation truth source:

```text
existing Unity validation rules/diagnostics
        |
        +--> existing runtime/Studio validator behavior
        |
        +--> authoring-facing metadata projection
                |
                +--> CUTSCENE_VALIDATION_CURRENT.json
```

Do NOT hand-maintain a second rule engine for ChatGPT.

Use the smallest existing projection/metadata seam.

## Required rule metadata

Keep legacy fields for compatibility where useful, and add/derive:

```json
{
  "code": "EXACT_DIAGNOSTIC_CODE",
  "severity": "Warning",
  "statusColor": "Yellow",
  "owner": "BACKEND",
  "blocksCompilation": false,
  "blocksEditablePreview": false,
  "blocksFinalReadiness": false,
  "authoringRequirement": "MAY_OMIT_BACKEND_DEFAULT",
  "description": "..."
}
```

Allowed colors:

- Green
- Yellow
- Orange
- Red

Allowed owners:

- AUTHORING
- BACKEND
- ENGINE

## Editable Preview gate

Studio should conceptually gate on:

```text
exists diagnostic where statusColor == Red && blocksEditablePreview == true
```

not simply on "any error-like diagnostic exists".

YELLOW and ORANGE continue to Editable Preview.

If ORANGE represents a failed visual materialization, continue with an explicit diagnostic placeholder or omission and preserve the exact authored identity. Never select a replacement identity simply to make Preview green.

## GREEN

The authored intent can be represented exactly.

Preview allowed. Final readiness allowed.

## YELLOW

Use for deterministic low-level repair/default that does not materially change visible semantic intent.

Required examples include:

```text
DIALOGUE_STAGE_BACKGROUND_DEFAULTED
DIALOGUE_STAGE_FRAME_DEFAULTED
DIALOGUE_CAMERA_DEFAULTED_FOR_LOCKED_STAGE
```

These are non-blocking.

The locked-dialogue camera invariant remains unchanged. Simple V1 backend-selected Push/Pull may be normalized before V3 validation to legal Hold and reported once per affected beat.

## ORANGE

Use when the cutscene can continue honestly but the visible result/preview differs materially from authored intent.

Important systemic case:

A WorldActor exact identity is already proven to be:

- present in authoritative Catalog/CURRENT
- legal for Actor route/capability
- safeForPreview=true
- exact identity preserved

but a later editor/materializer call such as `MY_CutsceneExecutionPlan.ResolveAsset(...)` cannot produce a usable preview object.

That is ENGINE-owned preview degradation, not proof that the JSON identity is invalid.

Preferred diagnostic:

```text
EXACT_ASSET_PREVIEW_MATERIALIZATION_FAILED
severity = Orange
statusColor = Orange
owner = ENGINE
blocksEditablePreview = false
blocksFinalReadiness = true
```

Include the exact authored ID and failure stage. Do not substitute another asset.

Other ORANGE examples may include a legal camera/presentation intent that must visibly downgrade, or exact legal dialogue presentation lacking preview pixel evidence.

## RED

Keep RED for failures where no honest legal result can continue, including:

- unknown or ambiguous CURRENT identity/handle
- stale/incompatible CURRENT identity
- illegal route/capability with no honest legal resolution
- unsupported Emotional Dialogue actor/listener/identityHandle/expression
- schema/semantic corruption with no deterministic legal repair
- invented visual/3D evidence contradicting CURRENT
- no legal Dialogue Stage at all

These remain blocking.

Do not use ORANGE to hide a real identity failure.

## Accepted JSON freeze

Once a Simple V1 script passes authoring integrity, downstream BACKEND/ENGINE YELLOW/ORANGE findings do not require regenerated source JSON.

The accepted normalized JSON becomes a fixture.

Fix the backend/editor against the same fixture until exactness improves.

This prevents the workflow from repeatedly rewriting a legal film to work around implementation bugs.

## Current 207-second fixture

Use the existing persisted learning case:

`Library/STARWARS_DELTA/CutsceneLearningCases/Inbox/case_7c433896e62875db/`

with:

- `NORMALIZED.json`
- `REPORT.txt`

Doctor Sane is dialogue-only in the normalized package and is not one of the actual principal-actor blocker paths. Do not treat Doctor as the representative WorldActor failure without new evidence.

For exact preview-safe genuine WorldActors that fail only at/under `ResolveAsset` materialization, the desired result is ORANGE engine diagnostics and continued Editable Preview, not authoring RED.

## Public projection

On the next user-controlled Publish, `CUTSCENE_VALIDATION_CURRENT.json` should carry the same atomic CURRENT identity as the surrounding package:

- publishTransactionId
- catalogRevision
- contractRevision
- schemaHash
- snapshotContentHash
- authoringRuleRegistryRevision

Do not create another manual Publish command.

## Fast pre-publish check

Extend the existing FAST PRE-PUBLISH CHECK only enough to confirm the validation projection can be built and contains compatible four-state metadata.

Useful output:

```text
Cutscene Validation CURRENT Publisher: READY
Authoring-facing rules: <N>
Editable Preview blocks only on RED: YES
Four-state validation metadata: READY
```

Do not run Publish.

## Constraints

Do NOT:

- run Catalog Scan
- run Vision Batch
- run Audit
- run Publish
- create Generated Cutscenes
- modify CharacterPacks
- modify Emotional Dialogue repertoire
- redesign V3/V5
- create a second validator
- add fuzzy fallback
- choose replacement identities for ORANGE engine failures

Prefer the smallest direct change in existing validator/Studio/materializer/projector code.

## Done when

Without running Publish:

1. Unity compiles with no new errors.
2. Studio exposes GREEN/YELLOW/ORANGE/RED semantics or equivalent metadata.
3. Only RED blocks Editable Preview.
4. Existing deterministic backend repairs are YELLOW.
5. Exact legal CURRENT visual identities that fail only downstream preview materialization can surface as ENGINE ORANGE and do not block the rest of Editable Preview.
6. Genuine invalid identity/expression/route failures remain RED.
7. The current accepted fixture does not need source regeneration merely because ENGINE ORANGE exists.
8. The next user-controlled Publish is wired to project compatible validation metadata.

For implementation details use:

`CODEX_SYSTEMIC_PREVIEW_RECOVERY.md`
