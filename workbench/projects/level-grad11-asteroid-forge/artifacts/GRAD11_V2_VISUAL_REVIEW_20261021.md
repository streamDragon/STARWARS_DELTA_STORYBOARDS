# GRAD11 V2 | actual QA visual review and native correction decisions

Source run: level-GRAD11_V2-20261021134948198
Capture: COMPLETED; reviewStatus in source manifest remains NOT_REVIEWED; acceptance PENDING.
Matching scene: Assets/_Game/MY_Core/MY_Scenes/HAGGAI_STUFF/GRAD11_V2.unity
External captures inspected: qa/GRAD11/region_captures/{01_A_ROCK_MOUTH,02_B_CONVEYOR_FORGE,03_C_CRYSTAL_MINE,04_D_REACTOR_HANGAR}.png
NOTE: Region captures are separate supplementary camera captures; use source manifest and live QA when checking whether screenshots reflect the latest scene save.

## Visual findings (manual review of actual PNGs)
A entrance: upper ~55% of camera empty starfield; structures very small and only near bottom; GET READY text at oversized center/top; diggable gate is disconnected from mine structure. Needed: continuous cavern roof, architectural spans anchored to rocks and linked entry tunnel; preserve four-player flight lanes.
B factory: floating small catwalks, isolated columns and pressure vessels, no visual connected factory enclosure; large yellow vertical bar at x~365 px. Check source of yellow bar before changing. Needed: build connected pipe runs/trusses between structural anchors, maintain upper/middle/lower safe routes; align catwalks with supports, resize illumination.
C crystal: crystals almost exclusively at floor, little distinction from rocky area; gate detached at right. Needed: crystal structural mass/columns spanning lower and upper thirds with negative space for flight.
D reactor: oversized cropped circular frames at top; no visible central active core, no clear reactor mount in flight frame; hangar floating near bottom. Needed: fit core/ring in camera, relocate ring centers, layer existing animated clips only where supported, anchor hangar to metal structure.

## Repair mechanics
- This built scene is handoffComplete=true. Do NOT rerun Level Builder replace.
- For existing assets: use native Unity Editor prefab/Transform/Inspector commands, not .unity text edits, new scripts or a custom placement tool. This is ordinary 30% polish.
- Start with 1 camera slice in B and D. Inspect actual local/world transforms, sprite bounds and parent transforms before moving anything. Small batches with native Undo and explicit scene save, recapture each.
- Yellow region may be camera gizmo/confiner/bounds or real emitter. Do not delete blindly.
- Distinct MY tower components and colliders require Play Mode validation; a static screenshot is not evidence.
- After edits recapture exactly this scene via existing level QA, read manifest, and compare the newly captured PNGs.
- Reverse waves remain absent per manifest; author waves through Reverse JSON after geometry/QA approval.

## Immediate status
Native open_scene succeeded for GRAD11_V2 in the production Editor. Native find_gameobjects timed out because the Editor changed to "Running managed callbacks"; no scene-object edits were applied. Do not restart a mutating operation while native Editor is busy; inspect scene state on recovery.