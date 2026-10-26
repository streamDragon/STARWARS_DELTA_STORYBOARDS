# GRADIUS Arcade Stage 1 — source-research evidence (2026-10-26)

## Scope and restrictions
Arcade Japan 1985 Stage 1 only, ending at twin-volcano event. The original Big Core is excluded from recreation. Only source-research/ was modified. No Unity/editor testing claimed. No original sprite sheet is redistributed.

## Directly inspected evidence
| ID | Source | Method | Observation | Evidence level |
|---|---|---|---|---|
| MAP-01 | https://www.spriters-resource.com/arcade/gradius/asset/615475/ | Page and image access attempt | Map metadata says 2304×256; actual sprite image HTTP 403; no verified map pixels | UNKNOWN |
| VID-01 | https://www.youtube.com/watch?v=WJu9xSRh02g | Extracted official YouTube storyboard L3/M0-M1, 320×180 thumbnails, 10s nominal samples; SHA256 M0: 956deee58aa9ce74551e84c8d8e8700e8c9ca6347c874b4dc24135d49abb5504; M1: 815fd9e8239a018a407b4a71d364f0e8db6cf1984e391b710fdaf9ee67217fc5 | Original Stage 1 landmarks visible | VERIFIED_VIDEO_FRAME (preview only) |
| VID-40 | https://www.youtube.com/watch?v=WJu9xSRh02g&t=40s | Storyboard nominal 40 s | Upper/lower terrain visible | VERIFIED_VIDEO_FRAME |
| VID-100 | https://www.youtube.com/watch?v=WJu9xSRh02g&t=100s | Storyboard nominal 100 s | Large armed floating rock appears | VERIFIED_VIDEO_FRAME |
| VID-110 | https://www.youtube.com/watch?v=WJu9xSRh02g&t=110s | Storyboard nominal 110 s | Two volcanic peaks visible | VERIFIED_VIDEO_FRAME |
| VID-120 | https://www.youtube.com/watch?v=WJu9xSRh02g&t=120s | Storyboard nominal 120 s | Red peaks erupt and multiple rocks visible | VERIFIED_VIDEO_FRAME |
| VID-130 | https://www.youtube.com/watch?v=WJu9xSRh02g&t=130s | Storyboard nominal 130 s | Original Big Core appears after eruption sample | VERIFIED_VIDEO_FRAME |
| RULES-03 | https://yuugikyo-rerise.net/gradius_stage1-4/ | Textual arcade gameplay description (baseline research dossier) | Turrets, hatches, Ducker/Jumper and rock encounter mechanics | SUPPORTED_MECHANIC |
| RULES-04 | https://ameblo.jp/dbh-washi/entry-12781896346.html | Secondary Japanese writeup (baseline research dossier) | Five weapon ports reported on armed rock; locations unverified | SUPPORTED_MECHANIC |

## Preview frames and timing caveat
YouTube generated 320×180 thumbnails, arranged as 3×3 tiles on 960×540 images. L3/M0 and L3/M1 cover nominal timeline samples 0..170 seconds, with 10-second spacing. Preview samples and their aspect-ratio/letterboxing are not original Arcade 256×224 pixel captures. Transitions between samples cannot be assigned exact start or end times. Thumbnail image URLs use short-lived YouTube signatures; video links with `&t=Ns` are the durable inspectable references. To reproduce previews, inspect YouTube player storyboard metadata and sheet M0/M1.

## Gaps and required measurements
- 0 verified source-map X/Y object anchors. The original arcade map pixels were unavailable (HTTP 403). Do not import map boundaries or claimed dimensions as coordinates.
- 0 exact timestamped spawns; no ship formation counts, fire cadence, hatch-door animation durations, jump arcs or rank calibration.
- The volcano event is **active by a nominal 120s sample**, but its exact onset, scroll pause and cessation are unmeasured. Big Core is shown by a nominal 130s sample; that does not prove the exact moment eruption ends.
- Terrain geometry, all individual turret/hatch placements, crater positions and five rock ports require verified original map/frame measurements.
- Unity coordinate conversion is blocked on camera/scroll calibration; never interpret video time as world position or infer KM from image length.

## Project system mapping
Turrets → TOWER_MISSILES_CUTE; hatches → TOWER_SHIP_SPAWNER_WHITE; volcano rocks → MLB_Gravitation; top/bottom terrain → SpriteShape; timed enemies → WavesManager + Reverse Wave Authoring; level import remains owned by main agent (Level Builder V6). This folder supplies evidence only.
