# THE LAST EVACUATION, Semantic Director 4: Unity Integration Review (2026-10-22)

Source V1: THE_LAST_EVACUATION_D4_96S_DIRECTED_CUTSCENE_SCRIPT_V1.json
Project ID: 95ef217322be4f58af72c096aae03250
Film QA: C:\Users\nlpis\Downloads\STARWARS_DELTA_FILM_QA\THE_LAST_EVACUATION_-_D4_V1_ENGINE_TEST_20261022_061816

## Observed status
- Native Unity STRICT QA: PASS_CLEAN, blockers 0, warnings 0 (Info only).
- Native Cutscene Studio Import / BUILD: PASS. Generated Timeline 26 sequences, cast 6.
- Workshop open and Editable Preview open: PASS.
- Film QA editor Timeline capture: COMPLETED, 96s, 71 frames, zero black frames, 1 possible edge clip t=82s, 8 event markers photographed, zero event actions classified as visually OBSERVED. Event-marker capture is NOT proof of VFX.
- Visual human review samples: t=0,48,72,78.2,94. Existing galaxy layer, red/blue/orange fighter sprites are clear, but scene remains same apparent scale and largely static visual grammar. t=48 isolated red fighter; t=94 red fighter still on screen. 78.2 impact-marker photo contains three ordinary ships but no visually obvious blast.
- Seven quality suggestions from BUILD. Legacy Timeline camera is active: V3_CAMERA_PLAN_NOT_AUTHORED. No verified CineMachine spatial plan.
- Runtime Play Mode: NOT_TESTED.

## Genuine missing movie qualities
1. Giant-versus-fighter scale cannot be established by assigning normal fighter art as placeholder CAPITAL.
2. HUMAN_REACTION and INTERNAL_CHAOS cannot be accepted with ships as human faces / bridge visuals.
3. Existing 53 canonical MOVES resolved legitimate authoring syntax but the current visible staging does not achieve the semantic arc. Technical pass is insufficient.
4. Cause-effect and VFX need proof at native projectile/impact times (46.08, 57.44, 73.44, 78.2) and target-state changes, not just captured markers.
5. Final exit / sacrifice needs actor outside viewport at final frame, not a textual "exit" label.
6. Camera must do real wide-to-detail reframing and moving/rotating actor focus at intermediate times, not merely same static galaxy field.

## Minimal repair direction
- Do not modify MAIN engine, Publisher or 53 MOVES simply to force this demo green.
- First bind actual pixel-reviewed CURRENT giant-ship actor/art, cockpit/human cast with Animation, explosion/VFX and appropriate audio; retain exact identities.
- Reauthor only a new V1 candidate (do not overwrite the manually editable movie in Workshop). Explicit camera plan with subject, relative anchors and shot lenses where supported.
- Avoid secondary scripted planners in Assets: semantic planner outside Assets is preparation, normal V1 remains only public authoring.
- Recheck STRICT, then create a separate new film, Film QA at phase-boundary and impact times; separately Play Mode.
- Most urgent architecture item: make Studio show CINEMATIC QUALITY REVIEW_REQUIRED despite BUILD PASS, and explain reasons (scale, human reaction, event-not-observed, absent camera plan). No false PASS label for film quality.

## Scope / evidence
This report reflects editor film-frame samples and FILM_QA_3_AUDIT.json. It does not assert comprehensive visual proof for every 71 frames or runtime playback. No Publish or Check-in.