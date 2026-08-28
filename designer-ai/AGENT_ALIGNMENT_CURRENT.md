# STARWARS_DELTA — Agent Alignment Current

Updated: 2026-08-28
Purpose: shared runtime/stabilization handoff for all agents working on Cutscene Studio.

## Authority

- Authoring contract remains the published `designer-ai/open-current/**` surface.
- Current authoring publish transaction: `20260828-012447702-69161982`.
- Current authoring Rule Registry revision: `A215FB0F8D7648D3BAD5336EFA3189F5D011E8F5C8C218F93F0F2D8DA8D3A4DD`.
- `CURRENT beats memory. Absence from CURRENT means unavailable.`
- Do not hand-edit generated `designer-ai/open-current/**` files.
- FULL publish is read-only against canonical source; use the canonical Publisher path for future contract/catalog publication.

## Mandatory authoring validation gates

See `designer-ai/AUTHORING_VALIDATION_GATE.md`.

Never collapse these into one generic `VALID=PASS` claim:

1. `SCHEMA_PASS`
2. `CURRENT_CONTRACT_PASS`
3. `STUDIO_PREFLIGHT_PASS`

A JSON produced outside Unity may only claim gates 1-2 unless the real current Cutscene Studio preflight was actually run. If not run, report `STUDIO_PREFLIGHT=NOT_RUN`.

`READY_TO_BUILD` requires the real Studio preflight with zero RED blockers.

The 2026-08-28 gauntlet exposed a concrete hidden-rule failure: solo portrait-expression lines were schema-valid and CURRENT-valid but Studio rejected them with `CUTSCENE_DIALOGUE_PORTRAIT_COUNT_INVALID`. Legitimate permanent authoring rules of this kind should be published canonically rather than left as Studio-only knowledge.

## Unity baseline

- Unity `6000.6.0b10`.
- Current direction: UNITY FIRST. Custom code only where Unity cannot know the cinematic/semantic answer.

## Current Cutscene Studio stabilization state

Manual 72-second broad preview now BUILDS and OPENS.

Confirmed working / materially improved:

- Editable Preview build/readback passes after removing invalid custom proof MonoBehaviour materialization.
- Civilian animation now uses native Unity `AnimationTrack` materialization.
- `walk` resolves to real animation assets with `candidateCount > 0` and `result=RESOLVED`.
- `look_up` resolves to real animation assets with `candidateCount > 0` and `result=RESOLVED`.
- Manual preview visibly shows animation changes.
- Motion materialization works.
- Dialogue UI is no longer the Missing Script blocker.
- Projectile preview route binds and reports authoring-ready projectile assets.

Important implementation correction:

- Removed `MY_CutsceneGeneratedAnimationProofMetadata` from generated civilian actors.
- Proof/diagnostic calculation may remain editor-side, but generated actors must not depend on a custom proof MonoBehaviour for playback.
- Animation execution target is: `animationIntent -> resolved AnimationClip -> native Timeline AnimationTrack -> PlayableDirector binding`.

## Current next stabilization task

Do NOT redesign animation again.

Focus only on visual/playback quality:

1. walk animation duration/loop/timeScale vs actor motion,
2. stable feet/grounding and Sprite pivot/bounds continuity,
3. continuity between walk and look_up beats when the narrative actor is intended to persist,
4. remove the accidental empty Timeline track if its source is local and obvious.

The larger 296-second CURRENT mega-gauntlet now reaches `READY TO BUILD` after its portrait JSON correction, but its build currently fails later at `verifying materialization coverage` on an Actor obligation for `M004_doctor`. This is a Studio/materialization-coverage issue, not a schema/preflight blocker. Do not mutate the movie JSON merely to hide this failure.

## Ownership / boundaries

- User/ChatGPT owns movie JSON and creative authoring.
- Codex/Unity code owns parser/compiler/resolver/materializer/runtime implementation.
- Do not modify user JSON to hide a Studio defect.
- Do not create a new schema generation (`V6`, `V7`, `VNext`) during stabilization.
- Do not create broad QA frameworks/fixtures as a substitute for fixing a reproduced defect.
- Generated Cutscene output is disposable and must not become source of truth.

## Target architecture after stabilization

Keep the Studio as a thin cinematic compiler over Unity:

`CURRENT/authoring -> Semantic Resolver -> FINAL Execution Plan -> Unity Materializer`

The resolver may be smart. The materializer should be boring.

Prefer native Unity systems:

- Timeline / PlayableDirector
- AnimationTrack
- AudioTrack
- ActivationTrack / ControlTrack
- Signals / Markers
- Cinemachine where appropriate
- PrefabUtility / Unity serialization APIs

Do not build parallel engines for behavior Unity already owns.

## Stability gate before refinement

Do not call the Studio stable until multiple real movies pass:

`LOAD -> VALIDATE -> BUILD -> OPEN`

including a run after Unity restart and without code changes between successful movies.

## Publication note

This file is a coordination/runtime-status publication only. It intentionally does NOT replace or mutate the canonical authoring contract in `designer-ai/open-current/**`.
