# Cutscene Golden QA Instruction Alignment Design

## Purpose

Align the public Git authoring/publishing guidance with the current STARWARS_DELTA Cutscene Studio runtime direction without duplicating Unity runtime code outside Plastic.

This document is an engineering design for instruction alignment. It is not a new authoring contract and it does not override the atomic published `designer-ai/open-current/**` projection.

## Source-of-truth boundary

### Plastic / Unity workspace

The Unity/Plastic workspace is canonical for runtime implementation and runtime proof.

It owns:

- `MY_Cutscene*` production code;
- Timeline generation and bindings;
- Cinemachine integration;
- actor animation materialization;
- projectile/effect execution;
- Workshop persistence and Editable Preview;
- Golden regression runner implementation;
- compile/runtime validation.

Git must not mirror Unity runtime source merely to make documentation easier to inspect.

### Git repository

`streamDragon/STARWARS_DELTA_STORYBOARDS` is canonical for external authoring/publishing guidance and the Designer AI CURRENT source used by the controlled publisher.

Maintained authoring guidance lives under:

- `designer-ai/tools/current-source/CHATGPT_START.txt`
- `designer-ai/tools/current-source/FILM_AUTHORING_GUIDE_CURRENT.md`
- `designer-ai/tools/current-source/simple-authoring/**`

Generated `designer-ai/open-current/**` remains a publication product and must never be hand-edited as part of instruction cleanup.

## Public authoring boundary

`CUTSCENE_SCRIPT_V1` remains the only public movie-authoring format.

V3, V5, Timeline tracks, Cinemachine components, runtime IDs, generated aliases, binding mechanics and Golden runner details remain backend implementation.

Authors express semantic film intent. Unity is responsible for realizing that intent and for reporting backend/engine failures honestly.

A legal accepted fixture is not to be repeatedly rewritten merely because backend execution is broken. Once authoring integrity is accepted, backend/engine repair should normally happen against the same authored fixture.

## Native-first, single-owner execution

The durable rule is:

> One capability has one execution owner for the same interval.

Preferred runtime ownership remains:

- compatible `AnimationClip` playback -> native `AnimationTrack`;
- Cinemachine shot selection -> native Cinemachine Timeline representation;
- real audio -> native `AudioTrack`;
- prefab / ParticleSystem / nested director lifecycle -> native `ControlTrack` where appropriate;
- projectile / instantaneous command -> typed Timeline marker / receiver;
- project-specific dialogue, transition and visual semantics -> the existing custom owner when native Timeline cannot express the semantics.

Do not add a parallel camera stack, parallel actor-motion runtime, parallel projectile runtime or duplicate execution owner merely to make a repair pass easier.

## Camera execution contract

STARWARS_DELTA is a 2D / 2.5D orthographic project. Camera execution must therefore be visibly meaningful in the active 2D composition.

### Shot selection

The intended native route is:

`CinemachineTrack -> CinemachineBrain -> CinemachineCamera`

The active selected Editable Preview must have one authoritative camera route. Sibling projects/revisions may exist but must not participate in the selected Preview.

Opening Preview must start from authored time zero and must not inherit a stale live camera from another project or revision.

### Continuous motion

A shot becoming active is not proof that authored motion executed.

For Push/Pull/Orbit/Drift/Shake/ImpactShake, success requires observable within-shot state change.

Durable requirements:

- Push/Pull are continuous within-shot framing changes, not static cuts between different lens sizes;
- Orbit is a 2D/2.5D composition operation around the authored target and must preserve direction;
- Drift produces visible frame-relative displacement;
- Shake produces visible oscillation and returns to base;
- ImpactShake produces an early strong hit followed by decay to base;
- Hold has no leaked camera motion from a previous interval;
- strong authored camera motion must be visually obvious, not merely technically non-zero.

Implementation may evolve inside Plastic, but it must preserve one owner for continuous motion and survive Save -> final Editable Preview -> reopen.

## Actor animation contract

A generated animation clip is not sufficient proof.

For compatible actor animation, the complete success chain is:

`semantic animation intent -> resolved compatible AnimationClip -> native AnimationTrack -> final cloned visual Animator binding -> correct interval -> observed state/frame change`

The binding must survive Save -> clone/final Editable Preview -> reopen.

A track whose final generic binding is null is a backend failure even if its source materialization was initially correct.

Animation and actor motion remain separate concepts and may run concurrently when legal.

## Projectile / effect contract

Authored quantity is an audience-visible obligation.

For projectiles/effects, acceptance requires more than marker/clip count:

`source obligation -> exact runtime identity -> distinct generated instance/event -> Timeline representation -> valid receiver/binding -> correct interval -> visible execution`

Projectile count, type, launch origin, target/anchor, travel, impact/effect and concurrency with actor/camera motion must remain correct.

A projectile emitted from a stale cached shooter position while its shooter is moving is a failure.

A projectile or impact does not implicitly satisfy an unrelated visible Effect obligation.

## Editable Preview and persistence

The final saved/reopened Editable Preview is the relevant execution truth, not only generation-time objects.

The selected Preview route must be scoped through the selected Workshop identity and its active generated content.

Correctness includes persistence of:

- Timeline generic bindings;
- Cinemachine exposed references;
- generated animation clips required for playback;
- actor Animator bindings;
- camera-motion bindings;
- target/anchor/collider references;
- active intervals.

A candidate that works only before Save is not complete.

A bad new candidate must not destroy the last valid Editable Preview where preservation is possible.

## Golden regression policy

The project may maintain immutable authored Golden fixtures inside Plastic. These fixtures are specifications for runtime behavior, not special production inputs.

Golden fixtures must never be modified merely to hide a backend/runtime defect.

A Golden regression runner may know which project fixtures to run, but production code must not special-case fixture names, beat IDs, actor IDs or hardcoded times.

The durable full-integration Golden target is one representative 100-second Cutscene that exercises, in one immutable production fixture where legal:

- actor animation;
- camera Push/Pull/Track/Follow/Drift/Orbit/Shake/ImpactShake;
- perspective operations;
- projectile types/counts;
- explosions/effects;
- target anchors and collider resolution;
- moving shooter plus fire;
- reverse animation;
- concurrent actor animation + camera motion;
- concurrent firefight + camera motion;
- repeated camera operations after unrelated activity;
- final clean Hold with no leaked state.

The exact fixture data and runner implementation remain in Plastic. Git documents the invariant, not a duplicate runtime fixture.

The closed-loop engineering workflow is:

`compile -> run same Golden QA -> find first real failure -> trace to first wrong owner/stage -> fix production code -> compile -> rerun same Golden QA`

Do not create a new fixture for each symptom. Do not move the acceptance target while debugging.

## Runtime proof versus source readiness

Do not conflate source-level implementation with runtime PASS.

Allowed engineering statements:

- `SOURCE_READY` when source audit has no known TODO for the required route;
- `NOT_RUN` when Unity execution was not actually performed;
- `PASS` only after actual Unity execution proves the fixture.

A compile-only result is not movie-quality proof.

Web Simple Preview remains preflight-only and must never claim Unity validation.

## Quality gate

A technically non-zero result is not automatically a successful film.

For Golden QA:

- animation must visibly animate;
- strong camera motion must be immediately legible to a human;
- projectiles must visibly travel;
- impacts/effects must visibly execute;
- simultaneous operations must genuinely overlap;
- backgrounds must cover the active camera composition;
- no black frame, `No cameras rendering`, stale foreign preview, lost binding or residual motion is acceptable as exact success.

If a reviewer must say "maybe it moved a little", strong motion failed the quality gate.

## Status ownership

Preserve the current authoring/backend/engine distinction.

- `AUTHORING`: source JSON or CURRENT selection is invalid and can be repaired from published authoring truth.
- `BACKEND`: legal authored semantic intent is lost/mis-lowered/mis-bound before or during materialization.
- `ENGINE`: legal materialized intent cannot be executed correctly by Unity/editor/runtime.

Backend/engine failure is not permission to mutate a legal accepted fixture.

## Publication discipline

Instruction alignment changes are made only in maintained source under `designer-ai/tools/current-source/**`.

Do not hand-edit `designer-ai/open-current/**`.

Use DELTA Publish when `requiredCurrent` and heavy source-truth fingerprints are unchanged and only lightweight authoring/guidance artifacts changed.

Use FULL Publish only when a heavy/source-truth artifact or compatibility fingerprint actually changed.

This alignment should not trigger a Catalog full scan merely because guidance changed.

## Instruction files to align

The implementation pass should update only maintained guidance that materially carries these rules, primarily:

- `README.md` for the Plastic/Git boundary and Golden QA summary;
- `designer-ai/tools/current-source/CHATGPT_START.txt` for author-facing accepted-fixture/backend-repair discipline;
- `designer-ai/tools/current-source/FILM_AUTHORING_GUIDE_CURRENT.md` for film-quality and Golden QA expectations;
- `designer-ai/tools/current-source/simple-authoring/ARCHITECTURE.md` for runtime ownership, persistence and closed-loop Golden engineering guidance;
- `designer-ai/tools/current-source/simple-authoring/CINEMATIC_INTENT_QA_RULES.json` only where a rule is genuinely authoring/pre-Unity QA and not merely runtime implementation detail;
- `designer-ai/tools/current-source/simple-authoring/INTEGRATION_STATUS_CURRENT.md` for current engineering status without claiming unverified PASS.

Do not duplicate the same large policy paragraph into every file. Put each rule at its owning layer and cross-reference durable architecture where appropriate.

## Non-goals

This Git alignment does not:

- copy Unity/Plastic source into Git;
- implement or patch Unity runtime code;
- claim that the current Golden 100s fixture passes;
- manually mutate generated `open-current/**`;
- force a FULL Publish without a real heavy-fingerprint change;
- add a new public authoring schema field solely to accommodate current backend defects;
- create a second authoring contract.

## Acceptance criteria

The aligned Git guidance is complete when:

1. every maintained instruction surface agrees that Plastic is runtime source of truth and Git is authoring/publishing guidance;
2. `CUTSCENE_SCRIPT_V1` remains the only public authoring format;
3. accepted legal fixtures are frozen while backend/engine defects are repaired;
4. one-owner/native-first execution is preserved;
5. camera, animation, projectile/effect and persistence success are defined by final observable execution, not only generated representation count;
6. Golden QA is defined as a stable closed-loop regression target rather than a sequence of disposable test movies;
7. runtime PASS is never claimed without actual Unity execution;
8. `INTEGRATION_STATUS_CURRENT.md` records only verified current state and does not present target architecture as completed runtime fact;
9. publication instructions preserve source-only edits plus controlled DELTA/FULL publishing;
10. no generated `open-current/**` file is directly edited by this alignment pass.
