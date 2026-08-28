# STARWARS_DELTA — Authoring Validation Gate

Updated: 2026-08-28
Status: mandatory coordination guidance for ChatGPT, Codex, and other authoring agents.

## Why this exists

A Cutscene JSON can be valid against `CUTSCENE_SCRIPT_V1.schema.json` and still be rejected by Cutscene Studio semantic preflight.

Reproduced example:

- A solo Captain portrait-expression fixture was schema-valid.
- Actor identities and expression enums were valid against CURRENT.
- Cutscene Studio still rejected 12 lines with `CUTSCENE_DIALOGUE_PORTRAIT_COUNT_INVALID` because the selected portrait presentation required an acceptable fixed participant composition or an identity-safe fallback.

Therefore:

**SCHEMA_VALID != STUDIO_VALID**

## Mandatory three-gate rule

Never describe a generated Cutscene JSON as simply `valid`, `ready`, `safe`, or `PASS` unless the exact gate is named.

Track these separately:

1. `SCHEMA_PASS`
   - JSON parses.
   - JSON conforms to `CUTSCENE_SCRIPT_V1.schema.json`.
   - enums and structural constraints pass.

2. `CURRENT_CONTRACT_PASS`
   - handles exist in the published CURRENT surface.
   - identities, expressions, routes, and authoring rules are legal according to the published contract.
   - no aliases or unsupported values are invented.

3. `STUDIO_PREFLIGHT_PASS`
   - the actual current Cutscene Studio semantic validator/preflight accepts the JSON with zero RED blockers.
   - only this gate proves the current Unity implementation accepts the authored semantics.

A file may be called `READY_TO_BUILD` only after gate 3 passes.

## Authoring agent behavior

When producing a JSON outside Unity:

- Run every validation available from the published CURRENT bundle.
- Report `SCHEMA_PASS` and `CURRENT_CONTRACT_PASS` honestly.
- Do **not** claim `STUDIO_PREFLIGHT_PASS` unless the real Studio preflight was actually run.
- If Studio preflight has not been run, state `STUDIO_PREFLIGHT=NOT_RUN`.
- Do not silently infer unpublished Studio-only semantic rules.

When a JSON passes CURRENT but fails Studio preflight:

1. classify the failure;
2. determine whether it is:
   - authoring JSON defect,
   - missing/ambiguous published contract rule,
   - or Unity/Studio implementation defect;
3. fix the correct layer;
4. if the rule is legitimate but absent from CURRENT, report it for canonical contract publication so future agents can know it before Unity validation.

Do not train future authoring around hidden validator behavior by patching examples one by one.

## Portrait/dialogue rule learned from the 2026-08-28 gauntlet

For `portrait` dialogue presentation, do not assume a solo line is Studio-safe merely because the schema allows an optional listener.

Until the canonical contract explicitly publishes the full participant/preset rule:

- prefer an explicit valid listener when the dialogue is semantically two-party;
- otherwise treat solo portrait composition as requiring Studio preflight verification;
- never claim solo portrait fixtures are Studio-ready from schema validation alone.

This is coordination guidance, not a replacement for the canonical contract. If the Studio rule is intended as permanent authoring behavior, it should be published through the canonical authoring contract/publisher rather than living only here.

## Required reporting format for generated acceptance movies

Use at least:

`SCHEMA_PASS=PASS|FAIL`
`CURRENT_CONTRACT_PASS=PASS|FAIL`
`STUDIO_PREFLIGHT=PASS|FAIL|NOT_RUN`
`RED_BLOCKERS=<count|unknown>`

Only after real Unity validation:

`READY_TO_BUILD=YES|NO`

## Principle

**CURRENT should contain authoring rules. Studio should enforce them. Agents should not have to discover secret rules by crashing into validators.**
