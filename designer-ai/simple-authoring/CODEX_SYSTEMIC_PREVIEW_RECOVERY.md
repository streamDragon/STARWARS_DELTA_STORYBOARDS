# CODEX TASK — SYSTEMIC VALIDATION + EDITABLE PREVIEW RECOVERY

## Goal

Stop treating every downstream Unity/editor/materialization failure as an authoring RED.

Implement the existing four-state policy in the current Unity Cutscene Studio path so valid Simple V1 films can reach Editable Preview even when some engine-owned visuals cannot yet materialize perfectly.

Do not redesign V3/V5, Dialogue Stage, Catalog, Simple V1, Studio, or the validator architecture.

Use the existing pipeline:

```text
CUTSCENE_SCRIPT_V1
-> Simple Adapter
-> V3 semantic pipeline
-> V5/backend
-> validation
-> StagePendingPackage
-> GeneratePending
-> Editable Preview/materialization
```

## Status model

Color describes what happens to the film. Owner describes who can fix it.

```text
GREEN  = exact
YELLOW = deterministic backend repair/minor, preview continues
ORANGE = visible semantic/preview deviation, preview continues
RED    = cannot safely produce, preview blocked
```

Only RED blocks Editable Preview.

Owners:

```text
AUTHORING = source/CURRENT authoring truth must change
BACKEND   = backend owns deterministic repair/default
ENGINE    = legal authored truth exists but editor/runtime execution failed
```

## Critical systemic rule

If an exact authored identity has already been proven to be:

- present in the authoritative Catalog/CURRENT
- legal for the requested route/capability
- safeForPreview=true
- exact identity preserved

and a later editor/materialization step fails to resolve or instantiate it,

that later failure is **ENGINE ORANGE**, not AUTHORING RED.

Do not ask ChatGPT to rewrite a valid JSON to hide an engine failure.

Do not select a replacement asset.

Do not change identity.

Editable Preview must continue with an explicit diagnostic placeholder/omission for that failed element while all other legal elements continue.

Final exact readiness remains false until the engine failure is fixed.

## Existing smoke-test evidence

Use the persisted learning case:

```text
Library/STARWARS_DELTA/CutsceneLearningCases/Inbox/case_7c433896e62875db/
NORMALIZED.json
REPORT.txt
```

Actual principal actor blocker paths are:

```text
$.cast[18]
$.cast[27]
$.cast[30]
$.cast[38]
$.cast[39]
$.cast[40]
$.cast[41]
$.cast[42]
$.cast[60]
$.cast[64]
```

DOCTOR_SANE_01 is NOT one of those blockers.

Doctor normalized state is valid dialogue-only state:

```text
presentationMode = DialoguePortrait
spawnWorldActor = false
useGameplayObject = false
entitySubKind = EmotionalDialogueCharacter
ShouldSpawnWorldActor = false
```

Do not reopen Doctor as a WorldActor bug unless new runtime evidence proves otherwise.

Known genuine WorldActor identities include:

```text
ce379ea25ebdf1549931b80f18dfa5fb:21300000
EVAC_CITY_SHIP_V1.png

 da841e0ed6399bd4695ebcfa661935f8:21300000
2DShipsMissilesTorpedoesAtlas.png

 ea47199b715e6c047909c1486562c340:21300020
2DShipsStandardWeaponsAtlas.png
```

The authoritative Catalog records for these are exact Actor/Sprite identities and preview-safe.

## Required implementation

### 1. Add/centralize diagnostic outcome metadata in the EXISTING validation path

Do not create a second validator.

For authoring-facing diagnostics expose or derive:

```text
statusColor: Green | Yellow | Orange | Red
owner: AUTHORING | BACKEND | ENGINE
blocksEditablePreview: bool
blocksFinalReadiness: bool
```

Keep existing severity/error fields for compatibility if needed.

Map existing diagnostics through the smallest existing rule/projection seam.

### 2. Editable Preview gate

Change the existing Studio gate from conceptually:

```text
any error/blocker -> preview disabled
```

to:

```text
any RED with blocksEditablePreview=true -> preview disabled
otherwise -> preview enabled
```

YELLOW and ORANGE must not block Editable Preview.

Do not globally ignore errors. Classify them correctly.

### 3. Exact asset materialization failure

In/around:

```text
MY_CutsceneExecutionPlan
ResolveAsset(...)
CUTSCENE_PRINCIPAL_ACTOR_EXACT_ASSET_UNRESOLVED
```

preserve hard RED when the exact identity itself is invalid/unavailable/illegal.

But when upstream exact Catalog/CURRENT validation already proves the authored asset is a legal preview-safe Actor and the later resolver/materializer returns no usable object:

emit/translate to an engine-owned ORANGE diagnostic, preferably:

```text
EXACT_ASSET_PREVIEW_MATERIALIZATION_FAILED
statusColor = Orange
owner = ENGINE
blocksEditablePreview = false
blocksFinalReadiness = true
```

Diagnostic must include:

- cast/beat identity
- exact asset ID
- Catalog path if known
- expected runtime form/type
- failure stage
- original diagnostic code as alias/source if useful

### 4. Preview placeholder / omission

When such an ORANGE exact visual cannot be materialized:

- keep the exact identity
- do NOT search/select a replacement
- do NOT substitute nearest/main texture/random Sprite
- do NOT change the source JSON
- continue building the rest of Editable Preview
- insert the smallest existing diagnostic placeholder if the preview system already supports one
- if no placeholder mechanism exists, omit that visual and surface the diagnostic in Studio/preview UI

Do not build a new rendering framework just to make a placeholder.

### 5. Preserve YELLOW auto-repair

Keep the already implemented locked-dialogue camera behavior:

```text
backend-selected locked dialogue
Push -> Hold
Pull -> Hold
DIALOGUE_CAMERA_DEFAULTED_FOR_LOCKED_STAGE
```

one beat-level warning/repair, non-blocking.

Do not weaken the V3 invariant itself.

### 6. Preserve real RED

These remain blocking:

- unknown/ambiguous/stale CURRENT identity
- illegal route/capability with no legal resolution
- unsupported Emotional Dialogue speaker/listener
- invalid dialogue identityHandle
- unsupported explicit expression
- invented asset/evidence
- schema/semantic corruption with no legal repair
- no legal Dialogue Stage at all

No fuzzy fallback.

### 7. Add ORANGE for visible semantic degradation

Where the existing system already knows it is continuing with a materially different visible result, classify that as ORANGE rather than YELLOW or RED.

Examples:

- requested legal semantic camera move must visibly downgrade to a different move
- requested visible count/presentation cannot be fully realized
- exact legal presentation lacks preview evidence

Do not create speculative new diagnostics everywhere. Only classify existing real cases encountered by the pipeline.

### 8. Studio legend

Use the existing Studio UI. Add a compact legend/status summary:

```text
GREEN  Exact
YELLOW Auto-repaired / minor
ORANGE Preview/semantic deviation — build continues
RED    Cannot safely produce — build blocked
```

Show ownership where available:

```text
AUTHORING
BACKEND
ENGINE
```

A useful summary is:

```text
Exact: N
Auto-repaired: N
Semantic/engine deviations: N
Blocking errors: N
```

Do not redesign the whole Studio window.

## Accepted JSON freeze behavior

Once the Simple V1 source has passed authoring integrity, downstream BACKEND/ENGINE YELLOW/ORANGE findings must not trigger a workflow that asks for a regenerated source JSON.

The normalized source remains the fixture.

The user should be able to build/review an imperfect Editable Preview and then fix engine gaps against the same fixture.

## Verification

Use the existing persisted 207-second learning case. Do not generate a new cutscene.

Before this systemic change the historical report has 10 principal actor blockers.

After the change, for exact preview-safe WorldActor identities whose only failure is downstream `ResolveAsset`/materialization:

```text
RED principal-actor authoring blockers -> 0 for those engine-owned cases
ORANGE EXACT_ASSET_PREVIEW_MATERIALIZATION_FAILED -> corresponding entries
BUILD EDITABLE PREVIEW -> enabled if no unrelated RED exists
```

The preview may contain explicit missing visual diagnostics. That is acceptable for this task. The purpose is to get the whole film through the pipeline for review instead of stopping at the first engine imperfection.

Also verify one genuinely invalid identity remains RED and blocks preview.

## Public contract alignment

The Git/public side defines the same model in:

```text
designer-ai/simple-authoring/VALIDATION_STATUS_MODEL.md
designer-ai/simple-authoring/CINEMATIC_INTENT_QA_RULES.json
designer-ai/simple-authoring/CUTSCENE_VALIDATION_CURRENT.schema.json
```

Update the existing Unity validation CURRENT projection so the next user-controlled Publish can expose compatible fields. Do not require Publish to test the local Studio behavior.

Backward compatibility is preferred: existing severity/blocksCompilation consumers may remain while the new color/owner/preview-gate metadata is added.

## Do not run

Do NOT run:

- Publish
- Catalog Scan
- Audit
- Vision Batch
- Cutscene generation
- CURRENT switch
- replacement selection

Do not modify CharacterPacks or dialogue repertoire.

## Stop condition

Do not chase every individual Sprite resolver bug in this task.

The systemic task is done when a valid authoring fixture can reach Editable Preview despite engine-owned ORANGE gaps, while true authoring/integrity RED still blocks.

Then STOP and report:

1. files changed
2. diagnostic metadata seam used
3. Studio preview gate before/after
4. how `CUTSCENE_PRINCIPAL_ACTOR_EXACT_ASSET_UNRESOLVED` is classified when exact CURRENT truth is already proven
5. ORANGE placeholder/omission behavior
6. 207-second case RED/YELLOW/ORANGE counts before/after
7. whether Build Editable Preview is enabled
8. compile errors
9. Publish NOT RUN
