# Designer AI CURRENT Architecture

This document is maintainer guidance only. It does not define authoring rules.

## One production chain

```text
Unity / Plastic production source
-> user-controlled Publish candidate
-> designer-ai/current.json advances
-> guarded Git publication pipeline
-> designer-ai/open-current/**
-> Devora Context Pack / Simple Preview / ChatGPT
```

Normal authoring then follows:

```text
Devora / ChatGPT
-> CUTSCENE_SCRIPT_V1
-> existing Simple Adapter
-> existing V3 semantic / narrative beat / cinematic feature owners
-> existing V5
-> Validator / Materializer / Timeline
-> Editable Preview
```

V3/V5 are backend layers, not normal authoring formats.

## Public CURRENT truth

Normal users and ChatGPT consume only the matching published `designer-ai/open-current/**` surface.

The human entry point is:

- `designer-ai/devora.html`

The canonical ChatGPT instruction source is:

- `designer-ai/open-current/CHATGPT_START.txt`

Devora copies those exact bytes into the Context Pack as `01_CHATGPT_START.txt`. It does not maintain a shorter competing authoring specification.

The core Simple authoring contract is:

- `open-current/simple-authoring/CUTSCENE_SCRIPT_V1.schema.json`
- `open-current/simple-authoring/AUTHORING_HANDLES.json`
- `open-current/simple-authoring/AUTHORING_RULES_CURRENT.json`
- `open-current/EMOTIONAL_DIALOGUE_CURRENT.json`
- `open-current/CUTSCENE_VALIDATION_CURRENT.json`

Do not recreate root-level `OPEN_CURRENT.json`, `chatgpt-current.json`, duplicate instruction files, or version-specific aliases.

## Identity and compatibility

`requiredCurrent` carries the compatibility fingerprints:

- `catalogRevision`
- `contractRevision`
- `schemaHash`
- `snapshotContentHash`
- `authoringRuleRegistryRevision`

`publishTransactionId` is publication provenance. Generated artifacts may carry an atomic identity including it for publication-integrity checks.

Never mix artifacts from different CURRENT identities.

## Source versus generated publication

Repository files such as:

- `designer-ai/CHATGPT_START.txt`
- `designer-ai/FILM_AUTHORING_GUIDE_CURRENT.md`
- `designer-ai/simple-authoring/**`
- `designer-ai/tools/**`

are publisher/engineering source inputs. They are not alternate public CURRENTs.

`designer-ai/open-current/**` is generated publication output and must not be hand-edited to simulate a new CURRENT.

Source edits alone do not rebuild `open-current` under the existing transaction. The Git workflow runs only for an actual `designer-ai/current.json` advance or explicit manual dispatch, and blocks rebuilding the same `publishTransactionId`.

A later user-controlled Unity Publish is required to establish a new CURRENT after Unity-owned contract changes.

## Web preflight

`designer-ai/simple-preview.html` validates `CUTSCENE_SCRIPT_V1` against the matching published JSON Schema before CURRENT handle/dialogue checks.

Web states are limited to:

- `SCRIPT_INVALID`
- `CURRENT_INVALID`
- `AUTHORING_INVALID`
- `PREVIEWABLE`

The browser must not claim `UNITY_VALIDATED` or `PREVIEW_ACCEPTED`.

## Visual access

The Devora Context Pack includes direct pixel evidence:

- `visual-atlas/ACTOR_CURRENT.pdf`
- `visual-atlas/EFFECT_CURRENT.pdf`
- `visual-atlas/LAYER_CURRENT.pdf`
- `visual-atlas/UI_CURRENT.pdf`
- `visual-atlas/VISUAL_ATLAS_CURRENT.json`

Visual handles keep master `atlasPage` and `atlasSlot`. `VISUAL_ATLAS_CURRENT.json` owns category ranges used to translate to the category-local PDF page. The slot stays unchanged.

The large master Visual Atlas may remain available for engineering/manual use, but normal AI authoring should use the packaged category PDFs.

## Runtime truth must constrain guidance

Do not document stronger behavior than the runtime actually supports.

Important examples:

- explicit legal Simple Audio survives lowering; backend defaults are used only when authored audio is absent;
- Cutscene projectile IDs and default cadence are Unity-owned capability/runtime truth;
- actor Orbit v1 has a fixed center;
- semantic Pursuit/Escort/Intercept wording does not prove per-frame moving-target tracking;
- dialogue-only curated participants are dialogue/composition identities, not automatically WorldActors;
- semantic camera subject is not automatically a physical Transform target;
- automatic creative recommendation must honor existing Director eligibility.

If runtime capability expands, update Unity source truth first and publish the resulting authoring surface atomically.

## Repository hygiene

Keep:

1. active source/UI/publisher code;
2. the current atomic `open-current` projection;
3. active contract/policy/guidance;
4. unique regression fixtures and learning evidence.

Remove completed task packets, dead prototypes, stale redirects, duplicate CURRENT aliases and superseded handoffs after their durable requirements are in code, schema, rules or tests.
