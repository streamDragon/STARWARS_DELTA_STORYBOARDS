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

## Phase 2: Enlarged 800×600 secondary screenshots

| Image | Observation | Status |
|---|---|---|
| https://stat.ameba.jp/user_images/20221231/09/dbh-washi/90/2f/p/o1320098615223422177.png?caw=800 | Hatch-like devices at [736,29,799,100] on ceiling and [737,497,799,566] on floor, both cropped by right frame edge | Screenshot annotations only, not Arcade-world coordinates |
| https://stat.ameba.jp/user_images/20221231/10/dbh-washi/01/80/p/o1320098615223422833.png?caw=800 | Armed floating rock fires horizontal laser beams; floor-mounted turret-like unit [568,518,624,567] | Classification and time pending |
| https://stat.ameba.jp/user_images/20221231/10/dbh-washi/ef/23/p/o1320098615223422835.png?caw=800 | Two volcano peaks and numerous orange flying rocks | Velocity / onset / gravity cannot be deduced from one still |

No camera-offset calibration or overlapping-frame stitching established. The three-local-hatch claim (one top, two bottom) in Japanese walkthrough https://yuugikyo-rerise.net/gradius_stage1-4/ is a supported **section description**, not a count of all stage hatches. Full original map still unavailable; all source map X/Y remain null.


## Phase 3 — continuous primary video (opening to volcano)

The primary full motion source was retrieved as a 640x360 30fps video-only file, original recording interval 00:20–02:25 (125 seconds). Sampled frames at original video seconds 20, 24, ..., 140; each image was visually inspected. Original movie URL: https://www.youtube.com/watch?v=WJu9xSRh02g. A segment sample gives only a *time bracket*, never an exact onset unless higher-frequency transition frames are verified. Japanese-arcade ROM identity still requires provenance cross-check.

| Original recording seconds | Direct observation |
|---|---|
| 20–36 | space-only, several aerial enemies, no terrain in 4-second samples |
| 36–40 | upper and lower geometry first visible between sampled frames |
| 40–68 | fixed defensive objects at both upper and lower surfaces, multiple aerial formations |
| 68–88 | terrain corridor, upper mounted objects and lower ground enemies; distinct turret count not yet reliable |
| 88–96 | ceiling and floor hatch-like fixtures visible at successive samples |
| 96–104 | large floating armed rock and horizontal laser beams |
| 104–112 | two mounds come into view, scene background changes red near eruption |
| 112–124 | twin red peaks, flying orange rock hazards |
| 124–128 | first observed Big Core between samples; not in recreation scope |

Main gains: initial aerial phase, terrain entry, terrain encounters, launcher corridor, armed rock, both volcanoes and out-of-scope Big Core are all now covered by contiguous extracted video. 640x360 capture is scaled/padded and **not** the original world coordinate system. Full-game object-count and placement mapping still require per-frame matching, and no invented turret inventory or wave counts have been inserted.


## Phase 4 full-clip follow-through

The missing opening interval 00:00–00:21 was obtained as 640×360/30fps and 21 one-second frames were extracted. The existing 00:20–02:25 clip yielded 125 sequential one-second samples. This establishes media availability for the **whole defined interval** but is not the same as verifying every wave and turret instance. Review of source frames approximately 40, 50, 65, 70, 80, 88, 92, 97, 104, 112, 118 and 123 seconds added nine stable-ID screen-space visual annotations to OBJECTS. These are approximate ROI boxes, not original map placement measurements.

Two terrain edge-strip correlation passes were attempted. Earlier than 110s, repeating textures and video framing give ambiguous 0px and ~48px motions; those pixel-scroll rates have been **rejected**. Around ~112 to ~133s a strong zero-shift match of terrain edges supports a paused volcano interval, with precise start still UNKNOWN; scroll-pause onset bracket currently 110–113s subject to closer visual proof. Frame evidence: https://www.youtube.com/watch?v=WJu9xSRh02g&t=112s .

Unresolved: complete physical turret census, stable identities across all scrolling frames, reconstruction of all spawns and routes, exact scroll scale/camera map, full 2304×256 source map access. Original source-map spatial positions remain zero VERIFIED_MAP_PIXEL.


## Phase 5 — 5fps horizontal camera shift calibration (2026-10-26)

**Measured locally** from contiguous primary arcade-labeled run: `https://www.youtube.com/watch?v=WJu9xSRh02g`, video capture at 640×360, sub-region x=114..525. Sampled 625 images at 5Hz for t=20..145s, applying a terrain color mask and horizontally shifting the preceding frame against the next. Typical displacement: **10 video-display pixels per 0.2 seconds**, equivalent to **approximately 50 video pixels/s** while terrain scrolls (especially t=44..110s). Repeated terrain transitions and particle effects degrade local matching, so record this as observed video camera-space rate, **not** native arcade pixel rate, not exact world X.

At t≈110.0..112.0s, sequential matching shifts from ~10px/sample to 0px/sample, and from 112s onward the top/bottom terrain compares at stable zero-shift across many samples. **Stop onset bracket around 110.4..111.2s** from 5fps matching, pending exact direct frame/time verification. The precise stop time field remains null because the derived range has not been matched back against 30fps camera motion.

**Important:** screenshot-derived object ROIs in 640×360 video remain preliminary; deduplication, object counts and a verified physical source-map offset still require review. Source-map x/y not assigned.


## Phase 7 — projected relative video coordinates, NOT placement-certified

Using the previously measured aggregate scroll rate of 50.2 display px/s, observations with manually annotated 640x360 video bounding boxes were projected into a reference coordinate frame at video t=40s: `X_relative = bbox.centerX + 50.2*(t-40)`. This is a deterministic **candidate projection** for locating objects in a preliminary stitched timeline; uncertain video timestamps (±1s), approximate ROI centers, repeated terrain, and lack of independent feature tracks prevent promoting these coordinates to `VERIFIED_MAP_PIXEL`. Each candidate retains `original_x=null` and `original_y=null`, explicit error floor 75 video px and the source time/link. The source viewport 640×360 is scaled/cropped from the native arcade; conversion to arcade pixels is still unverified.

Measured-video scroll calibration can support draft placement assistance, but candidates are not canonical coordinates. The central agent should only put them on an editable guide layer and independently validate the exact instance with video-frame matching before placing final tower prefabs.


## Phase 8 — Repeat-frame tracked positions and border-connected terrain trace (2026-10-26)

OpenCV template matching was run against 625 frames sampled at 5 Hz from the original-recording interval 00:20–02:25. Each anchor was searched in a scroll-predicted neighborhood and accepted only when at least 7 independently sampled video frames matched at normalized correlation ≥0.78 and the median absolute deviation of camera-corrected X was ≤2 video pixels. This yielded **8 repeat-frame verified VIDEO-relative objects**, not map-pixel objects. One early ground fixture candidate failed the cross-frame stability gate; it remains pending.

| Track | Candidate class | Matched frames | Median relative X (video px at t=40 reference) | MAD video px |
|---|---|---:|---:|---:|
| F40_GROUND | ground_hatch_or_turret | 5 | 465.5 | 7 |
| F50_CEILING | ceiling_hatch | 17 | 748 | 2 |
| F50_FLOOR | floor_hatch_or_turret | 9 | 872.5 | 0 |
| F65_FLOOR | floor_hatch | 15 | 1572 | 1 |
| F92_CEILING | ceiling_hatch | 11 | 2986 | 1 |
| F92_FLOOR | floor_hatch | 7 | 2985 | 0 |
| F97_ROCK | floating_rock | 14 | 3193.5 | 1 |
| F110_LEFT_MOUNTAIN | volcano_orange | 23 | 3584.5 | 1 |
| F110_RIGHT_MOUNTAIN | volcano_orange | 23 | 3764.5 | 1 |

A separate border-connected terrain color mask aligned 72 one-second video frames to a relative pixel grid and produced 564 ceiling and 562 floor preliminary polyline points, downsampled in the published JSON. Native-viewport conversion assumes gameplay occupies crop x=114..525 of 640x360 and scales to 256x224. This is a working model, not a verified original-map stitch and **must not be mistaken for exact Arcade source-map absolute X**. Vegetation, rocks, pipes, and hatch caps are not SpriteShape collision surfaces and remain separate. Measurements are useful as an editable guide for the central agent, not an automatic final placement authority.


## Phase 9: visual turret census corrections

Direct visual inspection of enlarged top/bottom strips of sampled frames at t=45,50,65,70,90,92,96s shows multiple angled floor/ceiling gun fixtures in the vicinity of hatch domes. **Do not classify every dome-plus-gun template as a ship spawner.** At video ~50s two angled floor guns are visible beside a dome; ~65s two angled floor guns; ~90s three floor guns; ~92s two ceiling guns. These are **per-screen concurrent minimums**, NOT the level's distinct turret counts because the camera scrolls. Evidence: https://www.youtube.com/watch?v=WJu9xSRh02g . The previous class assignment in `frameTrackedInstances` may include turret+dome regions and is flagged as mixed, pending per-frame segmentation.

The high-resolution Unity build is not constrained by the original game's small resolution. Only scale proportions, timing and relative alignment derive from arcade pixels; art and SpriteShape contours should be rendered at project quality.


## Phase 10 — contiguous video-derived atlas and six orange terrain components

At 5 Hz, the locally available 640x360 video clip was stitched into a 3970x360 **video-space** atlas for recording t=40.0–110.8s, crop x=114..525. Method: copy first observed world columns using a linear 50.2 video-pixel/s scroll model. The source footage is https://www.youtube.com/watch?v=WJu9xSRh02g . **Not a full verified native arcade source map**; dynamic enemies and animated scenery remain artifacts. The atlas was created on the connected desktop at `C:\Users\nlpis\AppData\Local\Temp\GRADIUS_STAGE1_SOURCE_RESEARCH_20261026\panorama_video_t40_110.png` and is not hosted by the website.

An orange-terrain connected-component pass found six major shapes in relative video-space X: 574–669, 1107–1171, 1781–2025, 3179–3310, **3556–3649** and **3741–3837**. Only the last two are the final paired volcano peaks. Their visible top coordinates are approximately **(3604,248)** and **(3789,248)** in video-relative pixel space; the separation is **185 video pixels**. These values supersede earlier approximate peak annotations when describing the final paired peaks, but not source-map pixel coordinates. Cropping/scroll-model systematic uncertainty is not quantified, and the rock ballistic event remains unmeasured.


## Phase 11 — measured scroll-stop transition from existing 5Hz frame-pair dataset

Re-examined `scroll_5fps.json` (624 adjacent 0.2s pairs). Measured static-terrain shifts: **110.4–110.6s: +10 video px**; **110.6–110.8s: +3 video px**; **110.8–111.0s and five subsequent pairs through 112.0s: 0 video px**. This brackets the video-capture camera stop in **110.6–110.8s**, sharper than the prior 110.4–111.2s interval. This is a `VERIFIED_VIDEO_FRAME` derived video-time bracket, not an exact native arcade game frame or Unity trigger. Source: https://www.youtube.com/watch?v=WJu9xSRh02g&t=110s . No enemy spawn/volcano rock rates are promoted by this measurement.


## Phase 12 — 1Hz volcano activity mask probe

Automated orange-particle detection was performed on video seconds 105–130. It detected 2 candidate regions at 111s and 12 at 112s, but classification was not specific to rocks. Consequently eruption onset, launch count, ballistic velocity and end trigger remain `UNKNOWN`; no unverified event has been promoted. The locally retained JSON is `volcano_color_activity_probe.json`. See https://www.youtube.com/watch?v=WJu9xSRh02g .


## Phase 12 | Published measurement evidence (2026-10-27)

The connected research environment produced a video-space panorama 3970x360 pixels spanning t=40 to 110.8 seconds, now published as [PANORAMA_VIDEO_T40_T110.png](https://github.com/streamDragon/STARWARS_DELTA_STORYBOARDS/blob/main/workbench/projects/level-gradius-volcano-stage1-1985/source-research/evidence/PANORAMA_VIDEO_T40_T110.png). This is a derived VIDEO panorama, NOT a verified native arcade map and not a direct Unity collider import.

A visual contact sheet of selected frames extracted from 30fps footage is published as [VOLCANO_30FPS_CONTACT.png](https://github.com/streamDragon/STARWARS_DELTA_STORYBOARDS/blob/main/workbench/projects/level-gradius-volcano-stage1-1985/source-research/evidence/VOLCANO_30FPS_CONTACT.png). Across 810 decoded frames (t=108 through 135s), the red-colored mountain area increases from 356 mask pixels at t=110.8333 to 2346 mask pixels at 110.8667s. This establishes the observed red/palette transition bracket [110.8333,110.8667] seconds, independent of the terrain scroll stop in [110.6,110.8] seconds. The color change is NOT proof of the first rock spawn. Rock counts remain unverified because orange connected-component detections include projectiles and false positives.

Source sheet: https://www.spriters-resource.com/arcade/gradius/asset/615475/ reports arcade 1985 Stage 1 asset size 2304x256 (uploaded October 4, 2026), but sheet pixels remain inaccessible. No NES replacement was used.

Unknowns: full distinct turret and launcher counts, absolute source-map anchors, full enemy routes, projectile velocities, damage states, exact emission cadence and event-clear condition. These are explicitly NOT CERTIFIED.
