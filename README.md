# STARWARS_DELTA External Tools Hub - CURRENT

Use one permanent URL only:
https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/

The repository is the shared home for STARWARS_DELTA tools and artifacts that live outside Unity.

Current main areas:
- Storyboards / Storyboard Viewer
- Designer AI / Cutscene Director CURRENT

`current.json` is fetched with cache disabled. The browser follows the currently published hub build, so team members should not bookmark version-specific URLs.

## Designer AI CURRENT

The authoritative Unity publish remains atomic. `designer-ai/current.json` advances only after the matching release assets are published successfully.

The single normal human entry point is:
- `designer-ai/debora.html`

The single normal ChatGPT instruction source consumed by Debora is the sealed publish copy:
- `designer-ai/open-current/CHATGPT_START.txt`

`designer-ai/CHATGPT_START.txt` remains the publisher source that is copied into the stage and sealed before publication. It is not a second runtime CURRENT.

For normal ChatGPT cutscene authoring, use the stable open CURRENT projection:
- `designer-ai/open-current/OPEN_CURRENT.json`
- `designer-ai/open-current/director-view/DIRECTOR_VIEW.json`
- Director category files for Actors, Layers, Effects, UI, Animations and Audio
- matching Catalog contract/schema
- matching Instruction Book
- the single CURRENT Visual Atlas PDF for real pixel inspection

`OPEN_CURRENT.json` exposes one atomic identity containing `publishTransactionId`, `catalogRevision`, `snapshotContentHash`, `contractRevision`, `schemaHash` and `authoringRuleRegistryRevision`. Publish validation fails if the Rule Registry revision is missing or does not match the Unity CURRENT Rule Registry.

The Director projection is not a second source of truth; exact IDs, compatibility and validation remain governed by the matching full Catalog, contract and Rule Registry.

The compact `STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip` is a fallback when direct Pages metadata access fails. Large engineering archives remain GitHub Release assets rather than normal ChatGPT downloads.

The Director completion queue reports genuine missing preview/metadata work. `director-view/eligibility-audit.json` separately flags obvious sample/demo/generated/technical signals for Unity source review before preview generation. GitHub intentionally does not delete or hide authoritative Catalog records merely to improve coverage numbers.

## Visual publication policy

There is one public production Visual Atlas PDF:
- `STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_CURRENT.pdf`

Per-category PDFs and per-category visual-index shards are build intermediates only and are stripped before publication. Per-page JPEGs remain transport/debug fallbacks. `FULL_VISUAL_INDEX.json` and `ASSET_VISUAL_LOOKUP.json` remain the public lookup layer.

## Repository hygiene policy

This repository is not a museum of old `CURRENT` files.

Keep only:
1. active production/UI/publisher sources;
2. the current atomic `open-current` projection and its generated artifacts;
3. durable authoring/engineering guidance that is still actively referenced;
4. unique unresolved engineering work in GitHub Issues or immutable learning evidence.

Delete task-specific prompts, temporary QA pages, superseded handoff documents, stale baseline snapshots, duplicate CURRENT aliases and duplicate instruction paths once their durable lessons are absorbed into the active guidance, Rule Registry, Instruction Book, tests or GitHub Issues.

A one-off work packet must not be named or retained as `CURRENT` after it is superseded. Open engineering work belongs in Issues/tests, not in another competing source-of-truth document.

Before deleting evidence, first verify that any still-relevant requirement is preserved in the active guidance, Instruction Book, Rule Registry, automated tests or an open Issue. After that, remove the obsolete wrapper instead of keeping it "just in case".

Existing storyboard data under `storyboards/` is preserved when the hub shell is upgraded.
