# STARWARS_DELTA CUTSCENE VALIDATION CURRENT - UNITY HANDOFF

## GOAL

Connect the existing Unity Cutscene validation system to the already-defined public authoring contract:

`designer-ai/simple-authoring/CUTSCENE_VALIDATION_CURRENT.schema.json`

Unity must generate:

`CUTSCENE_VALIDATION_CURRENT.json`

as part of the existing **PUBLISH AUTHORING SYNC CURRENT** transaction.

The public contract exists so ChatGPT, Devora and Simple Preview know before authoring JSON:

- what MUST be authored;
- what MAY be omitted because the existing backend owns a deterministic default;
- what is only a Warning;
- what is a real blocking Error.

Do not redesign V3/V5, Dialogue Stage, Studio, or the validator architecture.

---

## CURRENT WEB/GIT SIDE IS ALREADY IMPLEMENTED

The repository already contains:

- `CUTSCENE_VALIDATION_CURRENT.schema.json`
- Devora support for loading the contract when present
- Context Pack support for including it at `validation/CUTSCENE_VALIDATION_CURRENT.json`
- Simple Preview support for consuming the same contract when present
- Git workflow support for carrying and validating the exact contract inside the same CURRENT snapshot

Until Unity publishes the contract, Devora/Preview intentionally report validation as DEGRADED rather than inventing one.

Do not change the public schema unless the existing Unity validator genuinely cannot project into it.

---

## REQUIRED ARCHITECTURE

One source of validation truth in Unity:

```text
existing Unity validation rule/source
        |
        +--> existing Unity Validator behavior
        |
        +--> authoring-facing projection
                |
                +--> CUTSCENE_VALIDATION_CURRENT.json
```

Do NOT maintain a second hand-written list of rules only for ChatGPT.

If the current validator does not expose reusable rule metadata cleanly, add the smallest possible authoring projection beside the existing rule definitions. Do not build a new validation framework.

---

## PUBLIC CONTRACT

Generate:

```json
{
  "schema": "STARWARS_DELTA_CUTSCENE_VALIDATION_CURRENT",
  "schemaVersion": 1,
  "status": "CURRENT_VERIFIED_CUTSCENE_VALIDATION",
  "publishTransactionId": "<same atomic publish transaction>",
  "generatedUtc": "<UTC>",
  "requiredCurrent": {
    "catalogRevision": "<same CURRENT>",
    "contractRevision": "<same CURRENT>",
    "schemaHash": "<same CURRENT>",
    "snapshotContentHash": "<same CURRENT>",
    "authoringRuleRegistryRevision": "<same CURRENT>"
  },
  "authoringPolicy": {
    "warningsBlockCompilation": false,
    "defaultRecoverableSeverity": "Warning",
    "redMeaning": "Cannot be materialized honestly without changing identity, inventing assets, violating CURRENT, or lacking a deterministic legal backend resolution.",
    "simpleV1Principle": "Simple V1 authors semantic intent and exact required identities; backend-owned deterministic presentation mechanics do not become mandatory author fields merely to silence validation."
  },
  "rules": []
}
```

Each exported rule must contain:

```json
{
  "code": "EXACT_DIAGNOSTIC_CODE",
  "diagnosticAliases": [],
  "scope": "dialogue",
  "appliesTo": ["FACE_TO_FACE_PORTRAITS"],
  "severity": "Warning",
  "blocksCompilation": false,
  "authoringRequirement": "MAY_OMIT_BACKEND_DEFAULT",
  "backendDefault": {
    "available": true,
    "owner": "DialogueStage",
    "behavior": "Existing deterministic legal stage default supplies this presentation mechanic."
  },
  "description": "Human-readable meaning.",
  "authorGuidance": "What ChatGPT should do before writing JSON."
}
```

Allowed `authoringRequirement` values are exactly:

- `MUST_AUTHOR`
- `MAY_OMIT_BACKEND_DEFAULT`
- `OPTIONAL`
- `NOT_AUTHORED_IN_SIMPLE_V1`

---

## SEVERITY POLICY

### RED / BLOCKING

Keep RED for failures that cannot be materialized honestly, including at minimum:

- unknown or ambiguous CURRENT identity/handle;
- stale/incompatible CURRENT identity;
- illegal destination route/capability with no legal resolution;
- Emotional Dialogue actor outside the curated repertoire;
- mismatched dialogue `identityHandle`;
- unsupported explicit `expressionIntent`;
- schema/semantic corruption with no deterministic legal repair;
- invented visual/3D evidence contradicting CURRENT;
- requested Dialogue Stage presentation for which no legal deterministic stage/background/frame can be resolved.

These export as:

```text
severity = Error
blocksCompilation = true
```

### WARNING / CONTINUE

Recoverable presentation omissions should normally export as:

```text
severity = Warning
blocksCompilation = false
```

when the existing backend has a deterministic legal resolution.

The first required concrete case is FACE_TO_FACE_PORTRAITS dialogue staging.

If the existing Dialogue Stage owner can deterministically provide the legal full-frame background/frame, then omitted explicit low-level fields are not real authoring blockers.

Project/alias the current diagnostics such as:

- `DIALOGUE_PRESENTATION_BACKGROUND_REQUIRED`
- `CUTSCENE_DIALOGUE_BACKGROUND_REQUIRED`
- `CUTSCENE_DIALOGUE_FRAME_REQUIRED`

into warning-first authoring rules when recoverable.

Preferred public rules:

```text
DIALOGUE_STAGE_BACKGROUND_DEFAULTED
severity=Warning
blocksCompilation=false
authoringRequirement=MAY_OMIT_BACKEND_DEFAULT
backendDefault.owner=DialogueStage
```

```text
DIALOGUE_STAGE_FRAME_DEFAULTED
severity=Warning
blocksCompilation=false
authoringRequirement=MAY_OMIT_BACKEND_DEFAULT
backendDefault.owner=DialogueStage
```

If the stage really cannot resolve legally:

```text
DIALOGUE_STAGE_UNRESOLVABLE
severity=Error
blocksCompilation=true
```

Do not merely suppress diagnostics. The backend must actually own and resolve the deterministic default.

---

## SIMPLE V1 BOUNDARY

Do not make ChatGPT/Simple V1 author raw V5 presentation IDs solely to satisfy lower-level mechanics.

Simple V1 should author semantic dialogue and exact required identity/expression truth.

If an existing backend owner already controls a deterministic mechanic, export that rule as `MAY_OMIT_BACKEND_DEFAULT` or `NOT_AUTHORED_IN_SIMPLE_V1` as appropriate.

Never use this contract to weaken closed-world identity rules.

No:

- Neutral fallback for unsupported explicit expression;
- Actor fallback for dialogue identity;
- UI/Atlas similarity fallback;
- filename/name matching;
- arbitrary background/frame search;
- unrelated asset substitution.

---

## PUBLISH INTEGRATION

Integrate generation into the existing **PUBLISH AUTHORING SYNC CURRENT** flow.

Required order conceptually:

```text
build/freeze CURRENT inputs
build validation projection
validate validation projection
include it in the same atomic CURRENT payload
switch CURRENT last
```

The generated artifact must carry the exact same:

- `publishTransactionId`
- `catalogRevision`
- `contractRevision`
- `schemaHash`
- `snapshotContentHash`
- `authoringRuleRegistryRevision`

as the surrounding atomic CURRENT.

The artifact should be placed wherever the existing Publisher already stages Simple Authoring artifacts so the final public mirror becomes:

`designer-ai/open-current/CUTSCENE_VALIDATION_CURRENT.json`

Do not create a separate manual Publish command.

Do not Publish during this task.

---

## VALIDATION OF THE VALIDATION CONTRACT

Before the existing publish transaction is allowed to switch CURRENT, verify:

1. schema/status/version exact;
2. same transaction and all five `requiredCurrent` fingerprints;
3. at least one exported authoring-facing rule;
4. unique `code` values;
5. severity is Info/Warning/Error;
6. every rule has explicit `blocksCompilation`;
7. every rule has one allowed `authoringRequirement`;
8. Warning rules intended as recoverable defaults do not block compilation;
9. Error rules that represent real integrity failures do block compilation;
10. any `MAY_OMIT_BACKEND_DEFAULT` rule claiming a backend default actually maps to an existing deterministic backend owner/path.

---

## FAST PRE-PUBLISH CHECK

Extend the existing FAST PRE-PUBLISH CHECK only enough to report Validation CURRENT publisher readiness.

It should verify publisher wiring/projection readiness without running Publish.

Do not add a new QA framework.

Expected line:

```text
Cutscene Validation CURRENT Publisher: READY
Authoring-facing rules: <N>
Warnings block compilation: NO
```

If the projection cannot be built from current Unity sources, FAST PRE-PUBLISH CHECK should fail honestly.

---

## CONSTRAINTS

Do NOT:

- run Catalog Scan;
- run Vision Batch;
- run Audit;
- run Publish;
- create Generated Cutscenes;
- modify CharacterPacks;
- modify the Emotional Dialogue repertoire;
- redesign V3/V5;
- create a second validator;
- add broad tests/QA infrastructure;
- hand-maintain a duplicate list that can drift from the actual validator;
- make ordinary warnings block compilation merely to achieve zero diagnostics.

Prefer the smallest direct implementation in existing publisher/validator code.

---

## DONE WHEN

Without running Publish:

1. Unity compiles with no new errors.
2. The validation projection can be built in memory/local output for the current project state.
3. The output validates against `CUTSCENE_VALIDATION_CURRENT.schema.json` semantics.
4. Dialogue background/frame omissions that have an existing deterministic Dialogue Stage default project as Warning + non-blocking.
5. Invalid actor/identity/expression and genuinely unresolvable stage cases remain Error + blocking.
6. Existing PUBLISH AUTHORING SYNC CURRENT is wired to include this artifact automatically on the next user-run Publish.
7. FAST PRE-PUBLISH CHECK reports the validation publisher READY.

Return only:

- root cause / existing rule source found;
- files changed;
- exported rule count;
- examples of Warning rules;
- examples of blocking rules;
- publish wiring location;
- FAST PRE-PUBLISH result if run;
- compile errors.

Do not Publish.

STOP.
