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

For normal ChatGPT cutscene authoring, use the stable open Director projection:
- `designer-ai/open-current/OPEN_CURRENT.json`
- `designer-ai/open-current/director-view/DIRECTOR_VIEW.json`
- Director category files for Actors, Layers, Effects, UI, Animations and Audio
- matching Catalog contract/schema
- matching Instruction Book
- representative visual evidence

`OPEN_CURRENT.json` exposes one atomic identity containing `publishTransactionId`, `catalogRevision`, `snapshotContentHash`, `contractRevision` and `schemaHash`. The Director projection is not a second source of truth; exact IDs, compatibility and validation remain governed by the matching full Catalog and contract.

The compact `STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip` is a stable fallback when direct Pages access fails. Large engineering archives remain GitHub Release assets rather than normal ChatGPT downloads.

The Director completion queue reports genuine missing preview/metadata work. `director-view/eligibility-audit.json` separately flags obvious sample/demo/generated/technical signals for Unity source review before preview generation. GitHub intentionally does not delete or hide authoritative Catalog records merely to improve coverage numbers.

Existing storyboard data under `storyboards/` is preserved when the hub shell is upgraded.
