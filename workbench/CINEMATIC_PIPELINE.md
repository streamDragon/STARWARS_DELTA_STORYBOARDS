# Cinematic Director: capability, inference and execution contract

Audit date: 2026-10-22. Scope: shared directing structure and read-only pipeline review; another agent owns movie production. This update creates no movie, changes no Unity source or manual scene, and supplies no new native acceptance result. The stable START_HERE is unchanged.

## The structure

The Director decides what the audience should understand and which shot supplies the evidence. MOVES, Dialogue and Anime Emotion supply existing performance and editorial vocabulary. The optional Composer assists composition; it is not a mandatory dependency for manually authoring a valid V1. Native code already contains a MOVE visual-plan compiler and Director inspection/navigation/export UI. Do not replace those with a second planner or import format.

| Stage | Input → output | Authority and check |
| --- | --- | --- |
| Intention | Original brief → intended audience inference | Preserve original request; distinguish what is shown from what is inferred. |
| Coverage | Storyboard → subject, shot size, duration, cut and visible evidence | Existing journal storyboard/target artifacts. Record the identity connecting ship, pilot and weapon. |
| Selection | Fresh sealed CURRENT → exact actors, MOVE phases, animation/effect/audio handles | Featured recommendations are not the inventory. Record missing face/weapon artwork explicitly. |
| Authoring | Coverage → one CUTSCENE_SCRIPT_V1 | Existing beats, moves, camera, transition, continuity, storyClaim and evidence fields; no invented public properties. |
| Lowering | V1 → effective MOVE beats → package and camera plan | Inspect the effective result, not only original beat count or a MOVE label. Preserve deliberate cuts and timing. |
| Execution | Package → editable Scene/Prefab/Timeline/Cinemachine | One owner per animated property. Timeline selects shots; Cinemachine composes/follows; generated camera animation owns its assigned lens/transform curves. |
| Verification | Exact generated result → captures and separate QA outcomes | Associate project/source hash/scene/run. Capture and compilation are separate from visible causality and runtime proof. |
| Finish | Generated result → human refinement | Scene/Prefab/Timeline becomes manual truth. Do not regenerate over human changes. |

## What is straightforward now

“Straightforward” means an existing authoring route with resolved assets, not a promise that this audit played it successfully. CURRENT at repository e5da4dc625a5444fed57005366ad49e974c54a92 declares 53 MOVES: 31 EDITOR_RUNTIME_VERIFIED, 10 CODE_QA_VERIFIED_RUNTIME_VISUAL_PENDING, 12 CODE_QA_VERIFIED_EDITORIAL_RUNTIME_VISUAL_PENDING. These are published readiness claims, not fresh runtime results from this review. Current legal actors total 169; the 32 featured actors are only a selection.

| Desired result | Existing route | Practical limit |
| --- | --- | --- |
| Flyby, pursuit, escort, formation spread/escape | CROSSING_FLYBY, PURSUIT_LANES, ESCORT_COLUMN, FORMATION_SPREAD, CONVOY_ESCAPE | Resolved actors, motion lanes and screen direction still need matching capture. |
| Giant ship reveal / foreground occlusion | SCALE_REVEAL, PASS_BY_REVEAL, SCREEN_CROSS_REVEAL | These have code/published contracts; giant framing and occlusion are not newly visually accepted here. |
| Face → object → same face | LOOK_TARGET_LOOK, WATCHER_SUBJECT_WATCHER | These MOVES already implement editorial association. Correct portrait, gaze and contextual meaning are asset/QA responsibilities. |
| Meaningful object → face → same object | OBJECT_MEMORY_FACE | Context and the returning object's identity must remain clear. |
| Weapon → target → same weapon fires | WEAPON_TARGET_FIRE, AIM_TARGET_CONFIRM | A weapon role is not proof of an independently bound rotating muzzle or detailed cannon sprite. |
| Cause → effect → reaction | CAUSE_EFFECT_REACTION, THREAT_REACTION_THREAT, MISSILE_TARGET_IMPACT | Existing compiler code; editorial MOVES 42–53 remain visually pending in CURRENT. |
| Close/detail shot or abrupt size change | camera.framing + transition.style=cut; explicit camera.movement=cut is already legal | Distinguish the cut from subsequent hold/follow. Trace both through lowering; never rely on a default blend. |
| Zoom in, out or in-and-back | camera.movement=zoom_in / zoom_out / zoom_in_out; zoomMultiplier, zoomReturnMultiplier, zoomHoldSeconds | Ratios describe orthographic size, not actor scale. No general independent snap-duration or child-anchor property exists in the inspected public camera schema. |
| Emotional dialogue | Existing Dialogue + Anime Emotion, CURRENT dialogue characters | Reuse canonical identity/portrait mappings. SNAP_ZOOM on an anime frame does not prove a physical weapon camera. |

## Three independent camera decisions

1. **Coverage:** subject and framing. Choose ship, pilot or cannon as the actual resolved subject, and wide/medium/close/detail as its framing. A cannon anchor is not created merely by writing its name.
2. **Edit boundary:** incoming cut or intentionally authored transition. For an abrupt exterior → face → cannon sequence, author transition.style=cut and durationSeconds=0. Keep Cinemachine Shot clips contiguous with no overlap/ease across the cut. Evaluate the incoming camera at that time; verify its first displayed frame already has the intended framing. Damping inside an incoming shot must not produce an unintended approach from the old view.
3. **Motion inside a shot:** hold, follow, push, pull, zoom, track or shake. Follow may be smooth inside the shot even when its entrance is a cut. In 2D orthographic projection, a smaller OrthographicSize makes the subject larger; moving camera Z alone does not create a perspective zoom. Do not animate actor scale just to substitute for camera framing.

Unity's documentation specifies that Timeline Cinemachine Shot overlap controls its blend duration; Brain Default/Custom Blend does not override those overlaps. Activation Track camera switching follows the Brain blend rules instead. Inspect the actual execution route. V1 crossfade and a Cinemachine camera blend are not automatically the same operation; verify the lowering before claiming support for a particular effect. Public V1 does not have a generic camera-blend-duration field.

For the first shot in a generated sequence, prove the intended state is visible immediately. An entrance from a previously active camera is a separate boundary. At sequence end, inspect the handoff back to the host camera too. Never fix one shot by globally disabling all Cinemachine smoothing in the game.

## Audience completion: make an inference possible, not mandatory

The audience need not see every metre of travel or every mechanical step. It does need enough stable evidence to connect the shots. The following fields belong to the journal's storyboard/QA notes; they are not additional V1 properties:

| Record for each beat or linked sequence | Meaning |
| --- | --- |
| What is visible | Exact subject/action, with real source handle or marked placeholder. |
| What the viewer should infer | For example: this pilot has noticed the enemy; this gun is firing at that ship. |
| Evidence before and after the cut | Gaze/aim, matched identity, target position/direction, launch sound, impact, changed state. |
| What is omitted | Flight segment, loading mechanism, interior transit; specify the omission deliberately. |
| What must persist | Same pilot/ship/weapon/target, firing direction, damage or formation state. |
| What would make it ambiguous | New unrelated target, wrong screen side, second launch, undamaged return, caption carrying an otherwise invisible event. |
| What to verify | Exact frame/interval/run showing the connection, plus the reviewer's actual conclusion. |

Use V1 storyClaim for the intended story statement and evidence for the visible evidence specification. Text in evidence is a plan, not a measured observation. A reaction must link to a cause the character could know; deliberately showing the reaction first is supported by REACTION_BEFORE_CAUSE, with the cause revealed afterwards. Do not force a cause-first template on suspense, discovery, memory or crosscutting. Do not force faster cutting everywhere: a hold can build anticipation and a wide can restore orientation.

**Two distinct continuity contracts:** (a) editorial ellipsis: launch → cut away → impact, with compatible identity/direction/time, can imply omitted travel; (b) literal continuous flight across a cut: prove the same projectile instances continue without respawning. The second is stronger and is not established by the first. The inspected V1 fire contract requires each flight to finish inside its containing beat, so splitting a flight into separate beats is not a proven public route for persistent projectiles. Keep a supported event within its beat, deliberately use ellipsis, or record an integration gap. Do not emit a second volley to impersonate the first.

Sound may strengthen the bridge but must use legal timing in the existing audio contract. This review did not establish arbitrary cross-beat J/L cuts. Do not invent negative offsets or new audio properties. Check dialogue readability; a half-second visual insert does not imply readable subtitles or a completed spoken line.

## Findings that must remain visible to the film/tool owner

| ID | Bounded source observation | Required response / proof |
| --- | --- | --- |
| DIRECTED_PHASE_PRESERVATION | TryBuildEffectiveBeats is called with preserveAuthoredMovePhases=true, but HasDeliberateAuthoredShotPlan requires at least one non-hold camera.movement. It does not count a framing change or transition.style=cut alone. An all-hold, deliberately cut sequence can fall into generated MOVE expansion. | Record authored and effective IDs/durations/subjects/transitions. Add a focused native regression case for static wide → close → detail cuts before changing this heuristic; do not describe this read as a reproduced runtime failure. Explicit movement=cut already qualifies as a camera change, but do not fabricate camera motion just to satisfy the heuristic. |
| SHORT_SHOT_TIMING | MOVE expansion normalizes generated phase durations and scales timed children. The separate staged Composer has fixed offsets already found unsafe for shortened briefs. | Check action intervals after every expansion. For fire: effectiveStart + (count−1)×0.08 + flightDuration ≤ beatDuration; CURRENT projectile interval must be rechecked if CURRENT changes. Preserve original authored data; diagnose recoverable execution-copy fallbacks visibly. |
| CUT_EXECUTION | V1 import records authoredHardCut from transition.style=cut. The inspected Cinemachine materializer gives non-blended clips zero ease and blended clips a fixed 0.25s ease; it does not show per-boundary overlap construction in the inspected loop. | Trace the actual generated CameraPlan and resulting Timeline. A fixed ease value alone does not prove an intended blend. Verify first/last frame and cuts with the active writer, not a dormant camera branch. |
| MOVING_SUBJECT_FRAME | Existing camera source resolves subject and renderer-derived framing, uses Follow and PositionComposer; staged measured-anchor fixes are separate. | Verify a moving AND rotating ship at the midpoint and after zoom completion; hull-only bounds must not expand because of trails/particles. Independently bind the actual cannon/face target or show the exact placeholder limitation. |
| EVIDENCE_AUTHORITY | Existing DirectorMode inspects storyboard cards, continuity/reaction timing, exports sheets and opens Timeline/QA. It does not by itself prove that eight directing recipes generate a film. | Record planned, compiled, installed, captured, reviewed and runtime-tested separately. Existing code and stale run labels cannot close visual acceptance. |

This is a source review, not a complete native integration audit. No Editor status, compile, Test Runner, new build or playback was run in this lane. Do not present the historical busy/dialog observation as a current blocker. The other agent's film supplies the next integration evidence.

## Acceptance evidence to collect from that film

Use the existing Film QA tools, scoped to the film owner's exact source and run. No new demonstration is required from this architecture lane.

- **Intent:** write the story connection being tested; select only relevant MOVES, not all 53 for every movie.
- **Lowering:** compare requested/effective shot IDs, duration, subject, cut style and action timing; identify changed or placeholder values.
- **Cut:** for each fast boundary, capture previous frame, first incoming frame and the next frame at the actual output frame rate; a 0.5-second shot is 15 frames at 30fps or 12 at 24fps. Capture the whole short interval when motion matters, not only stills several seconds apart.
- **Camera:** test wide/close/detail, zoom-in/out and return; measure the subject's viewport bounds at the beginning, midpoint and end. Planned bounds and actual capture are different evidence. Reject a visually accepted label if the subject is cropped or the zoom is unobservable.
- **Events:** count actual launches once, follow the exact target, inspect impact and persistent consequence. Ellipsis and persistent-projectile claims get different verdicts.
- **Inference:** review the visual sequence with explanatory captions hidden, then audio muted as a diagnostic comparison; neither is a required delivery mode. A reviewer reports who saw what, who fired, what was hit, and what changed. Automated syntax checks cannot certify comprehension or emotion.
- **Resume:** attach source hash, exact run/frame paths, observed result and concrete next action to the same dossier. Never rename an older capture to match a newer source or rebuild a user's refined scene.

## Research comparison

These are primary research findings; the engineering actions are our proposed application, not experimentally validated results for this game. None establishes a universal 0.5-second edit duration or guarantees recognition of small stylized sprites.

| Source | Finding relevant here | Application to this pipeline |
| --- | --- | --- |
| Magliano & Zacks (2011), continuity and event segmentation | Action discontinuities affected perceived event boundaries more strongly than space/time changes in their study. | A camera cut need not restart the event. Preserve the causal action and target while changing viewpoint. |
| Smith (2012), Attentional Theory of Cinematic Continuity | Attention and matched perceptual expectations help explain continuity across discontinuous viewpoints. | Stage gaze, motion and the next subject so the viewer can find the relevant evidence after a cut; use a wide when orientation is lost. |
| Mullennix, Barber & Cory (2019), Kuleshov still-photo experiment | Context shifted emotion labels on neutral faces; valence/arousal findings were mixed. | Reuse a face plus meaningful context through existing association MOVES; do not assume every neutral portrait will express a precise requested emotion. |
| Calbi et al. (2019), Kuleshov EEG study | Face–context–face sequences showed contextual effects on judgments; neural findings do not justify a blanket claim that a neutral face becomes a different expression. | Separate displayed expression from inferred emotion. Link Anime Emotion choices to a visible cause. |
| Magliano, Dijkstra & Zwaan (1996), predictive inference in movies | Visual, auditory and discourse information can support predictions of later events. | Supply a clear preparation cue, pay it off, and avoid requiring captions to rescue an unseen action. |
| Bruckert, Christie & Le Meur (2021), movie gaze dataset | An annotated eye-tracking dataset relates editing and gaze behavior. | Actual frame/interval review of attention targets is more relevant than counting cuts; no eye-tracking measurement is claimed here. |

Primary links:

- https://doi.org/10.1111/j.1551-6709.2011.01202.x
- https://ualresearchonline.arts.ac.uk/id/eprint/21187/
- https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0224623
- https://www.nature.com/articles/s41598-018-37786-y
- https://doi.org/10.1080/01638539609544973
- https://arxiv.org/abs/2102.13378
- https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/ControllingAndCustomizingBlends.html
- https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/setup-timeline.html

## Decision

Keep the current V1/Studio/MOVE pipeline. Strengthen its directing contract and inspect the compiled result. Avoid a second public screenplay schema, a second camera writer, or automatic scene reconciliation. Native fixes must be grounded in a reproducible finding from the other agent's film or a focused regression fixture, with one serialized MAIN integration owner.
