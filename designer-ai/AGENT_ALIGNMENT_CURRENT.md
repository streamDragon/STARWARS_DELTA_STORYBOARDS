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

### 72-second fixture

Manual broad Preview BUILDS and OPENS.

Confirmed working / materially improved:

- Editable Preview build/readback passes after removing invalid custom proof MonoBehaviour materialization.
- Civilian animation uses native Unity `AnimationTrack` materialization.
- `walk` resolves to real animation assets with `candidateCount > 0` and `result=RESOLVED`.
- `look_up` resolves to real animation assets with `candidateCount > 0` and `result=RESOLVED`.
- Manual Preview visibly shows animation changes.
- Motion materialization works independently from semantic animation selection.
- Dialogue UI is no longer the Missing Script blocker.
- Projectile Preview route binds and reports authoring-ready projectile assets.

Important implementation correction:

- Removed `MY_CutsceneGeneratedAnimationProofMetadata` from generated civilian actors.
- Proof/diagnostic calculation may remain editor-side, but generated actors must not depend on a custom proof MonoBehaviour for playback.
- Animation execution target is: `animationIntent -> resolved AnimationClip -> native Timeline AnimationTrack -> PlayableDirector binding`.

### 296-second CURRENT Mega Component Gauntlet V2

The Mega Gauntlet now reaches the full manual Preview path and OPENS successfully after the canonical Actor identity/materialization mismatch was repaired.

The earlier `M004_doctor` / `M005_doctor` binding-aware coverage failure is therefore obsolete as the current blocker.

Current manual visual findings:

1. Doctor walk-cycle leg animation is visually good, but the Doctor currently faces/walks visually opposite to the authored left-to-right travel direction.
2. Other sprite animations visibly work but occasionally show visual popping/jumping between frames. This still needs root-cause classification: pivot/bounds discontinuity, visual-child/root binding, clip timing, or late asset substitution. Do not assume which one without reading live code/assets.
3. A V3 authoring correction has been prepared externally for the Mega Gauntlet that adds explicit `facing=right` to Doctor visuals in M004 and M005. It has not yet been used as proof. If explicit facing fixes the Doctor, treat this as authoring intent, not an engine defect. If not, the Studio facing/materialization contract is incomplete.
4. Projectile Preview is bound and activates at the authored cue. Current logs show POWERBALL expected=2/actual=2, but BLUE_BOLT expected=5/actual=2 and PURPLE_BOLT expected=4/actual=2 at the sampled active time. This is a separate later stabilization item, not an Animation pass prerequisite.
5. Dialogue portrait assignment/rendering is working for multiple closed-world identities and expressions in the Mega Gauntlet.
6. A Unity `ConsoleWindow` GUILayout/InvalidCast exception appeared after heavy logging. Treat it as Editor UI noise unless reproduced independently from the Console window; do not fold it into Cutscene runtime architecture.

## Current next stabilization task

Do NOT redesign animation.

First classify only the remaining animation quality issues:

1. explicit facing vs travel direction,
2. stable feet/grounding and Sprite pivot/bounds continuity,
3. clip duration/loop/timeScale vs authored action interval,
4. actor/visual continuity between beats,
5. whether any exact animation choice changes after the initial semantic selection.

The old blanket assumption `candidateCount=0 / ACTOR_HAS_NO_ANIMATION_CAPABILITY` is obsolete for the current working civilian cases.

## Ownership / boundaries

- User/ChatGPT owns movie JSON and creative authoring.
- Codex/Unity code owns parser/compiler/resolver/materializer/runtime implementation.
- Do not modify user JSON to hide a proven Studio defect.
- Conversely, do not modify Studio code when the authoring JSON simply omitted a supported intent such as explicit facing.
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
