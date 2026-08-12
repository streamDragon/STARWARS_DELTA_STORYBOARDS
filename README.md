# STARWARS_DELTA External Tools Hub - CURRENT

Use one permanent URL only:
https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/

The repository now serves as the shared home for STARWARS_DELTA tools and artifacts that live outside Unity.

Current main areas:
- Storyboards / Storyboard Viewer (1.8)
- Designer AI: current Cutscene Catalog + Instruction Book downloads

`current.json` is fetched with cache disabled. The browser automatically follows the currently published hub build, so team members should not bookmark version-specific URLs.

Designer AI uses `designer-ai/current.json` as a small atomic manifest. Large Catalog packages belong in GitHub Release assets, not in the Pages repository. A publish candidate updates the manifest only after the release assets are uploaded successfully, preserving the last known-good CURRENT on failure.

Existing storyboard data under `storyboards/` is preserved when the hub shell is upgraded.
