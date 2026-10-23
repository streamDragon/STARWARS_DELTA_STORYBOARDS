# ביקורת אמנותית: איך נולד שוט
Date: 2026-10-23
Dossier: `film-how-a-shot-is-made-20261023`
Status: **ART_DIRECTION_REJECTED / REVISION_REQUIRED**

## What the user actually saw
The three screenshots show:
- A static black sitting silhouette on a spaceship corridor rather than a readable expression of fear, loss or resolve.
- Flat, inconsistent low-resolution fighter sprites juxtaposed with more realistic/sci-fi backgrounds.
- A scene where the silhouette sits next to a miniature ship without believable spatial geography.
- Formation shots with disconnected sprites; little human cause, consequence or shared art direction.
The user explicitly rejected the result as visually unattractive and called out the ongoing habit of choosing ugly sprites despite art packs already being in the project.

## Verified source of the problem
The film page uses public CURRENT preview thumbnails as rendered actors. These are legal CURRENT identities, not a curated art style. Example: `man_1_0__79ff72e4` preview is an opaque black seated silhouette, which cannot show readable facial emotion. A featured public pixel doctor and coarse free-trial spaceships are not acceptable visual substitutes for cinematic characters and vessels. **ResolverVerified means resolvable, not artistically suitable.**

## Existing Unity art packs inspected on user's actual computer
Root: `Assets/_Game/MY_Core/MY_Art/`

| Location | Concrete evidence | Intended review |
| --- | --- | --- |
| `CharacterSpriteSheets_6x5/` | 229 PNG in subtree; master `STARWARS_DELTA_Commander_Arden_Cutscene_Master_6x5.png` (~13MB), `STARWARS_DELTA_Officer_Auren_Cutscene_Master_6x5.png` (~13MB), character 6x5 dialogue sheets for NOVA, MARK, SANDOR, CAPTAIN, DOCTOR and DESLOK | Inspect facial expressions and pose continuity; prepare slices with correct PPU |
| `ANIME_EMOTION/STARWARS_DELTA_ANIME_EMOTIONS_V1/` | 86 PNG, with `ANIME_SPACE_PILOT_01` and `ANIME_CIVILIAN_01` body/expression/cinematic elements | Preferred candidate emotional foreground cast |
| `CinematicAssets/` | 44 PNG, including `HUMAN_ACTION_CONTACT_SHEET.png`, `SHIP_INTERIORS_CONTACT_SHEET.png` and action/background packs | Use actual production frames rather than contact sheets; look for consistent ship bridge/crew |
| `Foozle_2DS0014_Void_EnemyFleet_3/` | 86 source sprite/aseprite files | Candidate coherent enemy fleet, visually approve first |
| `CutsceneV3/CinematicSpaceKitV1/` | 104 PNG | Candidate unified space backgrounds/effects |
| `CutsceneArtPack/` | 8 PNG | Review before use |
| `DGraphics/` | 249 PNG | Mixed category. Not approved wholesale |

I opened `HUMAN_ACTION_CONTACT_SHEET.png` via the remote image reader. It displays many small human action poses; its label explicitly says **CATALOG ONLY - NOT A PRODUCTION SPRITE SOURCE**. The sheet is proof assets exist, not itself a production source. Remote image reads of the large Arden/Auren master sheets were interrupted by connection resets, so their **art quality is NOT YET APPROVED**.

## Non-negotiable casting rules
1. Emotion-first: hero, loved one, and stakes, with at least neutral/afraid/determined or grief portraits. A faceless silhouette is an automatic failure for dialogue and reaction shots.
2. Choose ONE coherent visual direction before selecting individual images.
3. Read actual images from curated sprite sheets and animation states. Preview crop, transparency and expression must be checked.
4. Prefer the dedicated ANIME_EMOTION character packs and 6x5 emotional portrait masters for close-ups, subject to visual approval. Spaceships require their own coherent fleet selection.
5. Keep `ART_APPROVED` separate from `CURRENT_HANDLE_LEGAL`, `UNITY_MATERIALIZED` and `VISUAL_QA_PASS`. Non-published art needs the existing asset catalog/publishing flow, not invented handles.
6. Fail closed for artistic acceptance: if the required emotion or matched ship family is absent, show **ART_DIRECTION_REVIEW_REQUIRED** rather than substituting the first indexed image.
7. Build the story around the relationship, crisis, visible decision and irreversible consequence. MOVES are the grammar, not the subject.

## Next film revision
A mother/child separation during evacuation, or a pilot facing someone they cannot rescue, can give the action meaning. Open with a person and their relationship before showing giant fleets. In climax use face/action/cause/result. End by showing what the choice cost; do not overlay tutorial labels over the dramatic moment.

## Status
This review changes the documentary and acceptance process only. It does not claim Unity import, materialization, animation or native Play Mode proof. Previous page stays available as a **visually rejected draft** for comparison.
