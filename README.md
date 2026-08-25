# STARWARS_DELTA External Tools Hub - CURRENT

Use one permanent public URL only:
https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/

The repository is the shared home for STARWARS_DELTA tools and artifacts that live outside Unity.

Current main areas:
- Storyboard shared library / deep-link viewer
- Cutscene Preview
- Designer AI / DEVORA CURRENT

## Storyboard ownership

There is exactly one normal Storyboard authoring UI:
- **Storyboard Director**

The public GitHub Pages site is not a second Storyboard authoring application. It keeps only:
- the shared published Storyboard library;
- the deep-link `viewer.html` used to review published boards;
- existing Storyboard data under `storyboards/`.

Creating a Storyboard, importing an old project, managing local Storyboards and publishing belong to Storyboard Director only. Obsolete browser authoring UI assets are intentionally removed rather than maintained as another workflow.

`viewer.html` remains because published deep links depend on it. It is a viewer, not another Storyboard product/home screen.

## Designer AI CURRENT

The authoritative Unity publish remains atomic. `designer-ai/current.json` advances only after the matching release assets are published successfully.

The single normal human entry point is:
- `designer-ai/devora.html`

The single normal ChatGPT instruction source consumed by Devora is the sealed publish copy:
- `designer-ai/open-current/CHATGPT_START.txt`

`designer-ai/CHATGPT_START.txt` remains publisher source material that may be sealed by the publication pipeline. It is not a second runtime CURRENT. Devora does not maintain a shorter competing authoring specification; the Context Pack copies the sealed `open-current/CHATGPT_START.txt` bytes as `01_CHATGPT_START.txt`.

For normal ChatGPT cutscene authoring, use the stable open CURRENT projection:
- `designer-ai/open-current/OPEN_CURRENT.json`
- `designer-ai/open-current/simple-authoring/CUTSCENE_SCRIPT_V1.schema.json`
- `designer-ai/open-current/simple-authoring/AUTHORING_HANDLES.json`
- `designer-ai/open-current/simple-authoring/AUTHORING_RULES_CURRENT.json`
- `designer-ai/open-current/EMOTIONAL_DIALOGUE_CURRENT.json`
- `designer-ai/open-current/CUTSCENE_VALIDATION_CURRENT.json`
- matching Director projection and current visual evidence

`OPEN_CURRENT.json` exposes one atomic identity containing `publishTransactionId`, `catalogRevision`, `snapshotContentHash`, `contractRevision`, `schemaHash` and `authoringRuleRegistryRevision`.

The Director projection is not a second source of truth. Exact IDs, compatibility and validation remain governed by the matching CURRENT contract and Rule Registry.

The compact `STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip` is a fallback when direct Pages metadata access fails. Large engineering archives remain GitHub Release assets rather than normal ChatGPT downloads.

## Devora Context Pack

The normal Devora Context Pack is self-contained for authoring and includes:
- sealed `01_CHATGPT_START.txt` copied from `open-current/CHATGPT_START.txt`;
- Simple V1 schema, handles, rules and canonical example;
- closed-world Emotional Dialogue CURRENT when published;
- Cutscene Validation CURRENT when published;
- Director category projections required by the authoring workflow;
- `visual-atlas/VISUAL_ATLAS_CURRENT.json`;
- four AI-direct Visual Atlas PDFs:
  - `ACTOR_CURRENT.pdf`
  - `EFFECT_CURRENT.pdf`
  - `LAYER_CURRENT.pdf`
  - `UI_CURRENT.pdf`

Visual handles use master `atlasPage` / `atlasSlot`. `VISUAL_ATLAS_CURRENT.json` owns the category ranges used to translate master pages to the local page in the matching category PDF. `atlasSlot` is unchanged.

The large master Visual Atlas may remain available as an engineering/manual artifact, but normal AI authoring must not depend on separately uploading it when the four category PDFs are present.

## Simple Preview

`designer-ai/simple-preview.html` is a web preflight and visual preview for `CUTSCENE_SCRIPT_V1`.

It validates the loaded JSON against the matching published `CUTSCENE_SCRIPT_V1.schema.json` first, then checks matching CURRENT handles and closed-world dialogue identities. It may report:
- `SCRIPT_INVALID`
- `CURRENT_INVALID`
- `AUTHORING_INVALID`
- `PREVIEWABLE`

It must not claim `UNITY_VALIDATED` or `PREVIEW_ACCEPTED`; those remain Unity-owned outcomes.

## Repository hygiene policy

This repository is not a museum of old `CURRENT` files or abandoned UI generations.

Keep only:
1. active production/UI/publisher sources;
2. the current atomic `open-current` projection and generated artifacts;
3. durable authoring/engineering guidance still actively referenced;
4. unique regression fixtures or learning evidence that still prove behavior;
5. published Storyboard data and the minimum shared-library/viewer surface required to consume it.

Delete task-specific prompts, temporary QA pages, superseded handoff documents, duplicate Storyboard authoring interfaces, stale baseline snapshots, duplicate CURRENT aliases and duplicate instruction paths once their durable lessons are absorbed into active guidance, Rule Registry, tests or implementation.
