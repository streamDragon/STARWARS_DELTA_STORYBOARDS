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

### Avoid warning-before-default churn

If Preview deterministically receives a legal Dialogue Stage background/frame from existing backend state, project that same state before early dialogue validation where practical.

Do not emit several "required/missing" warnings per line and then immediately supply the exact deterministic value later in the same pipeline. Prefer one owning beat/stage correction diagnostic when a backend default was actually needed.

Similarly, Simple V1 curated dialogue semantic subjects should be written directly as dialogue/composition subjects with no physical world camera target. Do not deliberately create a world target only so Ironclad removes it and reports a warning.

For `Hold`, a semantic non-Actor composition subject does not by itself require a physical Transform target.

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

For `SimpleVisibleActor`, if the Actor route was already proven by the Simple resolver, preserve that source provenance to the first downstream identity diagnostic source. Do not repeatedly emit `CUTSCENE_ACTOR_IDENTITY_UNRESOLVED` because legacy backend fields lost proof that Simple V1 already established.

Direct V5 input without that provenance remains strict.

## RED

Keep RED for failures where no honest legal result can continue, including:

- unknown or ambiguous CURRENT identity/handle
- stale/incompatible CURRENT identity
- illegal route/capability with no honest legal resolution
- unsupported Emotional Dialogue actor/listener/identityHandle/expression
- schema/semantic corruption with no deterministic legal repair
- invented visual/3D evidence contradicting CURRENT
- no legal Dialogue Stage at all
- actor Orbit whose center moves during the same action interval while current V5 Orbit v1 requires a fixed/stationary center

Do not use ORANGE to hide a real runtime representation limit.

### `CUTSCENE_ORBIT_CENTER_MOVES`

Current runtime trace confirms that V5 Actor Orbit v1 is owned by the existing validator + Timeline writer and samples a static ellipse around fixed center state.

It does NOT sample a moving target Transform each frame.

Therefore `CUTSCENE_ORBIT_CENTER_MOVES` is currently a correct RED blocker when the target/center actor has overlapping movement.

Do not weaken this rule merely because Simple V1 contains semantic words such as Orbit, Pursuit, Escort or Intercept. Semantic vocabulary is not proof of target-relative runtime tracking.

A legal authoring fix may sequence the center movement before/after the Orbit interval or choose another supported choreography. A future moving-center runtime must update runtime, validator and published authoring rules together.

## Accepted JSON freeze

Once a Simple V1 script passes authoring integrity, downstream BACKEND/ENGINE YELLOW/ORANGE findings do not require regenerated source JSON.

The accepted normalized JSON becomes a fixture.

Fix the backend/editor against the same fixture until exactness improves.

A new genuine AUTHORING/runtime-representation RED, however, may require correcting the test choreography/source intent. The freeze rule is not permission to keep an unrepresentable moving-center Orbit.

## Semantic motion safety

Simple V1 semantic motion is lowered into existing V5 actor actions.

Current verified points:

- `motionIntent=orbit` must lower to real V5 `Orbit`, not generic `Move`.
- count-expanded source IDs must apply actions to all deterministic generated members.
- semantic speed strings (`slow`, `medium`, `fast`, `burst`) must use tolerant semantic parsing and never direct float conversion.
- malformed numeric action input must become deterministic validation/default behavior rather than escaping as a `FormatException` from Studio.
- a precomposed fleet/group visual must not be multiplied as if each image represented one single actor.

These are adapter/runtime truth items, not reasons to create another validator.

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

Extend/use the existing FAST PRE-PUBLISH CHECK only enough to confirm the validation projection can be built and contains compatible four-state metadata.

Useful output:

```text
Cutscene Validation CURRENT Publisher: READY
Authoring-facing rules: <N>
Editable Preview blocks only on RED: YES
Four-state validation metadata: READY
```

Do not run Publish automatically.

## Final pre-publish proof

Compilation alone is not enough.

Before the user manually Publishes the next CURRENT, run one representative fixture through:

```text
Unity compile
-> Validate
-> zero genuine RED blockers
-> Build Editable Preview
-> inspect representative dialogue + actor motion + Orbit + materialization
```

Only after that proof should the user decide to Publish.

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
- claim moving-center actor Orbit before an actual runtime exists

Prefer the smallest direct change in existing validator/Studio/materializer/projector code.

## Done when

Without running Publish:

1. Unity compiles with no new errors.
2. Studio exposes GREEN/YELLOW/ORANGE/RED semantics or equivalent metadata.
3. Only RED blocks Editable Preview.
4. Existing deterministic backend repairs are YELLOW and warning-before-default churn is minimized.
5. Exact legal CURRENT visual identities that fail only downstream preview materialization can surface as ENGINE ORANGE and do not block the rest of Editable Preview.
6. Genuine invalid identity/expression/route/runtime-representation failures remain RED.
7. SimpleVisibleActor provenance is preserved to the actual diagnostic source rather than re-inferred from legacy role fields.
8. Curated DialoguePortrait legality remains CharacterPack-owned; generic close-up metadata does not replace it.
9. `motionIntent=orbit` reaches real V5 Orbit, and moving-center overlap remains blocked until runtime support exists.
10. The accepted fixture does not need source regeneration merely because ENGINE ORANGE exists.
11. The next user-controlled Publish is wired to compatible validation metadata.

For implementation details use `CODEX_SYSTEMIC_PREVIEW_RECOVERY.md`, but treat this handoff and current runtime evidence as the newer constraint where older investigation text conflicts.
