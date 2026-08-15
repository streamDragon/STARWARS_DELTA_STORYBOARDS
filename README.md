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

The single normal ChatGPT instruction source is:
- `designer-ai/CHATGPT_START.txt`

For normal ChatGPT cutscene authoring, use the stable open CURRENT projection:
- `designer-ai/open-current/OPEN_CURRENT.json`
- `designer-ai/open-current/director-view/DIRECTOR_VIEW.json`
- Director category files for Actors, Layers, Effects, UI, Animations and Audio
- matching Catalog contract/schema
- matching Instruction Book
- the single CURRENT Visual Atlas PDF for real pixel inspection

`OPEN_CURRENT.json` exposes one atomic identity containing `publishTransactionId`, `catalogRevision`, `snapshotContentHash`, `contractRevision` and `schemaHash`. The Director projection is not a second source of truth; exact IDs, compatibility and validation remain governed by the matching full Catalog and contract.

The compact `STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip` is a fallback when direct Pages metadata access fails. Large engineering archives remain GitHub Release assets rather than normal ChatGPT downloads.

The Director completion queue reports genuine missing preview/metadata work. `director-view/eligibility-audit.json` separately flags obvious sample/demo/generated/technical signals for Unity source review before preview generation. GitHub intentionally does not delete or hide authoritative Catalog records merely to improve coverage numbers.

## Repository hygiene policy

This repository is not a museum of old `CURRENT` files.

Keep only:
1. active production/UI/publisher sources;
2. the current atomic `open-current` projection and its generated artifacts;
3. durable authoring/engineering guidance that is still actively referenced;
4. unique unresolved engineering work in GitHub Issues or immutable learning evidence.

Delete task-specific prompts, temporary QA pages, superseded handoff documents, stale baseline snapshots and duplicate instruction files once their durable lessons are absorbed into the active guidance, Instruction Book, tests or GitHub Issues.

A one-off work packet must not be named or retained as `CURRENT` after it is superseded. Open engineering work belongs in Issues/tests, not in another competing source-of-truth document.

Before deleting evidence, first verify that any still-relevant requirement is preserved in the active guidance, Instruction Book, automated tests or an open Issue. After that, remove the obsolete wrapper instead of keeping it 'just in case'.

Existing storyboard data under `storyboards/` is preserved when the hub shell is upgraded.
