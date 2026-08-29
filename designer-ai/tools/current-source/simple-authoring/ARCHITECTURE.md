# STARWARS_DELTA Simple Cutscene Authoring Architecture

This is maintainer guidance for the existing Cutscene Studio. It is not a second authoring contract.

## Source-of-truth boundary

### Unity / Plastic

The Unity/Plastic workspace is canonical for runtime implementation and runtime proof.

It owns:

- `MY_Cutscene*` production code;
- parser/compiler/resolver/materializer behavior;
- Timeline generation and bindings;
- Cinemachine integration;
- actor animation execution;
- projectile/effect execution;
- Workshop persistence and Editable Preview;
- regression runners;
- compile/runtime validation.

### Git

This repository owns authoring/publishing guidance and the maintained Designer AI source.

Canonical maintained authoring source lives under:

- `designer-ai/tools/current-source/CHATGPT_START.txt`
- `designer-ai/tools/current-source/FILM_AUTHORING_GUIDE_CURRENT.md`
- `designer-ai/tools/current-source/simple-authoring/**`

Generated `designer-ai/open-current/**` is publication output. Never hand-edit it as cleanup.

Do not mirror Unity runtime source into Git merely to make runtime work easier to inspect.

## Public authoring boundary

`CUTSCENE_SCRIPT_V1` is the only normal public movie-authoring format.

Normal production path:

```text
Devora / ChatGPT
-> CUTSCENE_SCRIPT_V1
-> existing Simple Adapter
-> existing semantic/compiler owners
-> final typed execution plan
-> existing Unity materializer
-> Timeline / Cinemachine / prefabs
-> Save / final Editable Preview / reopen
-> Unity evaluation
```

V3/V5 names, generated IDs, runtime GUIDs, Timeline bindings and Golden runner state are backend implementation and never normal authoring vocabulary.

Do not create V6/V7 or a parallel authoring/runtime stack during stabilization.

## Authoring responsibilities

ChatGPT/Devora authors semantic film intent only:

- beats and audience-observable evidence;
- exact CURRENT handles;
- visible quantity and frame-relative composition;
- dialogue text and exact curated dialogue identity/expression;
- semantic camera intent;
- semantic actor motion/animation intent;
- explicit legal Audio handles;
- exact schema-legal Cutscene projectile IDs;
- legal action/effect timing.

Unity owns runtime IDs, CURRENT fingerprints, route resolution, materialization, bindings, lifecycle, technical defaults and final runtime validation.

## Native-first Timeline ownership

Native-first means use a native Timeline owner when it correctly owns the capability. It does not mean native-only.

**One capability has one execution owner for the same interval.**

| Capability | Preferred owner |
|---|---|
| Compatible `AnimationClip` playback | Native `AnimationTrack` |
| Semantic/procedural actor motion | Existing single semantic-motion owner |
| Existing GameObject/Sprite bounded visibility | Native `ActivationTrack` when appropriate |
| Prefab / `ParticleSystem` / nested `PlayableDirector` lifecycle | Native `ControlTrack` when appropriate |
| Project-specific Effect composition/interpolation | One existing VFX owner |
| Real audio clip | Native `AudioTrack` |
| Cinemachine shot selection | Native Cinemachine Timeline representation |
| Projectile / instantaneous command | Existing typed marker/receiver route |
| Dialogue / transition / project-specific semantics | Existing corresponding owner |

Do not pair multiple competing owners for the same property/capability in the same interval.

## Visible obligations and Effects

Every legal expanded `visible[]` item is an audience-visible obligation.

For route=`Effect`:

- the Effect must receive a beat-bounded generated representation even without a separate activation action;
- an explicit compatible action may refine real semantics but is not a secret wake-up requirement;
- repeated identical handles remain distinct instances;
- backend instance identity preserves source beat + visible id + expanded instance index;
- projectile/impact semantics do not satisfy unrelated visible Effect obligations.

`visible[].count` is real quantity and must not be silently reduced or deduplicated by handle.

## Binding-aware materialization coverage

Candidate acceptance verifies the complete chain:

```text
source obligation
-> exact CURRENT runtime identity
-> distinct generated instance/event
-> exact Timeline representation
-> valid binding / receiver / exposed reference
-> correct active interval
-> Save
-> final Editable Preview
-> reopen
-> observed evaluation
```

A track/clip/marker count alone is not proof.

Wrong bindings, wrong assets, shared instances, orphan clips, missing receivers, stale references or interval bleed count as failed materialization.

Legal unresolved obligations must never disappear silently.

## Fail-soft candidate preservation

Strict candidate acceptance and tolerant user experience are complementary:

```text
BAD NEW CANDIDATE != DESTROY LAST GOOD PREVIEW
```

When a newly generated candidate fails required materialization/persistence, reject that candidate and preserve the last valid Editable Preview where possible. Report BACKEND/ENGINE failure honestly instead of rewriting legal authoring.

## Final Editable Preview is execution truth

Generation-time objects are not enough.

Correctness must survive:

```text
Build
-> Save
-> final Editable Preview
-> reopen
-> Timeline evaluation
```

This includes:

- Timeline generic bindings;
- Cinemachine exposed references;
- generated AnimationClips required for playback;
- actor Animator bindings;
- camera-motion bindings;
- projectile receivers;
- target/anchor/collider references;
- active intervals.

A candidate that only works before Save is incomplete.

## Camera execution contract

STARWARS_DELTA is a 2D / 2.5D orthographic project. Camera execution must therefore be visibly meaningful in the active 2D composition.

### Shot selection

Preferred route:

```text
CinemachineTrack
-> CinemachineBrain
-> CinemachineCamera
```

The selected Editable Preview has one authoritative camera route. Sibling generated revisions/projects may exist but must not participate in the selected Preview.

Open Preview begins at authored time zero and must not inherit stale camera/director state from another project or revision.

### Continuous camera motion

Shot activation and continuous motion are separate obligations.

For authored within-shot motion:

- **Push/Pull**: continuous visible framing/lens change inside the same shot, not a static cut;
- **Track/Follow**: camera state must respond to the authored legal target when the runtime supports target-dependent execution;
- **Orbit**: preserve authored target + direction and produce meaningful 2D/2.5D composition change;
- **Drift**: visible frame-relative displacement;
- **Shake**: visible oscillation that returns to base;
- **ImpactShake**: strong early hit followed by decay to base;
- **Hold**: no leaked motion from previous intervals.

Strong motion that is technically non-zero but visually imperceptible is not exact success.

Implementation may evolve in Plastic, but continuous camera motion must have one effective writer for the property being animated.

## Actor animation execution contract

For compatible actor animation, success is:

```text
semantic animation intent
-> resolved compatible AnimationClip
-> native AnimationTrack
-> final cloned visual Animator binding
-> correct interval
-> observed state/frame change
```

A generated clip/track count is not enough. A null final generic binding is a BACKEND/ENGINE failure even if source materialization looked correct earlier.

Animation and actor motion remain separate and may run concurrently when legal.

## Actor motion and timing

Simple V1 supports explicit action timing:

- `actions[].startOffset`
- `actions[].duration`

`actions[]` array order is never hidden sequencing.

Use explicit intervals for legal staggering/concurrency. Distinct semantic locomotion phases should normally use adjacent beats unless one continuous precise path intentionally represents the complete movement.

Precise path geometry uses only fields published by the matching schema. It lowers through the existing semantic-motion owner; it does not create a second actor movement engine.

Actor Orbit remains fixed/stationary-center only while the current runtime requires that limitation. Pursuit/Escort/Intercept names do not promise per-frame moving-target tracking unless runtime implementation actually provides it.

## Projectile execution contract

Authored projectile quantity is an audience-visible obligation.

Acceptance requires:

```text
source fire action
-> exact projectileId
-> distinct generated event/instance
-> Timeline representation
-> valid receiver/binding
-> correct launch interval
-> visible travel
-> target/anchor resolution where authored
-> impact/effect behavior where authored
```

Validate exact type/count, moving-shooter origin, target/anchor, collider resolution and concurrency with actor/camera motion.

A projectile emitted from a stale cached shooter position while the shooter moves is a failure.

## Audio

Explicit legal Simple `audio[]` handles survive lowering as their source CURRENT identity and become the existing appropriate Timeline audio representation.

Generated aliases such as `simple_audio_*`, `simple_actor_*`, `generated_*` or `preview_*` are backend identities only and never authoring handles.

## Stable Golden regression workflow

Once a legal fixture passes schema + CURRENT authoring integrity, backend/engine repair uses that same fixture.

Do not keep rewriting legal source JSON to chase downstream failures.

Production code must never special-case fixture names, beat IDs, actor IDs or exact fixture timestamps.

Closed-loop engineering workflow:

```text
compile
-> run the same Golden QA fixture through normal production APIs
-> find the first real failure
-> trace to the first wrong owner/stage
-> fix production code
-> compile
-> rerun the same fixture
-> repeat
```

A representative full-integration Golden fixture should exercise, where legal:

- actor animation;
- Push/Pull/Track/Follow/Drift/Orbit/Shake/ImpactShake;
- perspective operations;
- projectile types/counts;
- explosions/effects;
- target anchors and collider resolution;
- moving shooter + fire;
- reverse animation;
- simultaneous actor animation + camera motion;
- simultaneous firefight + camera motion;
- repeated operations after unrelated activity;
- final clean Hold with no leaked state.

The exact fixture and runner live in Plastic. Git documents only the invariant.

`PASS` requires actual Unity execution of the final saved/reopened Preview. `SOURCE_READY` and `NOT_RUN` are valid engineering states. Compile-only success is not movie-quality proof.

## Quality gate

A technically non-zero result is not automatically a successful film.

Exact Golden-quality success requires:

- animation visibly animates;
- strong camera motion is immediately legible;
- projectiles visibly travel;
- impacts/effects visibly execute;
- simultaneous operations genuinely overlap;
- backgrounds cover the active camera composition;
- no black frames, stale foreign Preview, lost bindings or residual motion.

If a reviewer has to say "maybe it moved a little", strong movement failed.

## Camera / frame-relative composition

The active camera/frustum is cinematic composition truth. Authoring remains frame-relative through schema fields such as `screenX`, `screenY`, `screenWidthFraction`, `screenHeightFraction`, entry/exit and direction semantics.

Do not expose raw Unity world distances or Stage-scale tuning in Simple V1 merely to compensate for camera size.

`camera.subject` is semantic composition intent by default. Target-dependent operations may physically bind an active legal WorldActor when supported. Do not manufacture a WorldActor merely to satisfy a semantic subject.

## FullFrame coverage

FullFrame fitting is renderer-specific and idempotent:

- resolve the exact intended renderer;
- process each unique renderer from a stable baseline;
- fit it against relevant overlapping camera states;
- do not repeatedly multiply already-expanded scale;
- do not refit renderer A while iterating unrelated logical layer B.

## Preview authority

Web Simple Preview is preflight only. It must never claim Unity runtime acceptance.

Unity remains final runtime/materialization authority.

## Publication boundary

`open-current/**` is atomic generated publication output.

- **FULL** rebuilds heavy/source-truth projections when fingerprints change.
- **DELTA/lightweight guidance** reuses unchanged heavy CURRENT data and republishes maintained authoring/guidance artifacts.
- guidance-only edits do not require Catalog Full Scan or Visual/Vision rebuild.

The publisher must sanitize obsolete authoring surfaces so old Catalog-contract/Instruction-Book/V5-era guidance cannot reappear as a competing CURRENT authority.
