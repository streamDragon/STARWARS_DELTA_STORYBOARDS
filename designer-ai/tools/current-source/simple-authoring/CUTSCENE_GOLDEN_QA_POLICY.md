# STARWARS_DELTA Cutscene Golden QA Policy

This is durable engineering guidance for the existing Cutscene Studio. It is not a second authoring contract and it does not override the published atomic `designer-ai/open-current/**` projection.

## Authority boundary

The Unity/Plastic workspace is the canonical source of truth for runtime implementation and runtime proof.

It owns:

- `MY_Cutscene*` production code;
- Timeline generation and bindings;
- Cinemachine integration;
- actor animation materialization;
- projectile/effect execution;
- Workshop persistence and Editable Preview;
- Golden regression runner implementation;
- compile/runtime validation.

This Git repository owns external authoring/publishing guidance and the maintained Designer AI CURRENT source. It must not duplicate Unity runtime source merely to make runtime work easier to inspect.

Generated `designer-ai/open-current/**` remains a controlled publication product. Never hand-edit it as part of a runtime or QA repair.

## Stable-fixture rule

Once a legal authored fixture has passed authoring integrity, backend/engine repair should normally happen against the same fixture.

Do not rewrite legal JSON merely because:

- a Timeline binding is lost;
- a Cinemachine reference is stale;
- a Preview opens the wrong revision;
- animation does not evaluate;
- a projectile/effect receiver fails;
- camera motion is visually ineffective;
- persistence breaks after Save -> reopen.

The fixture is the specification. The system must adapt to the fixture.

Fixture names, beat IDs, actor IDs and exact timestamps must never become production special cases.

## Closed-loop Golden workflow

The durable engineering loop is:

```text
compile
-> run the same Golden QA fixture
-> find the first real failure
-> trace to the first wrong owner/stage
-> fix production code
-> compile
-> rerun the same Golden QA fixture
```

Do not create a new disposable movie for every symptom.

Do not move the acceptance target while debugging.

Do not return runtime `PASS` unless actual Unity execution produced the proof.

`SOURCE_READY` and `NOT_RUN` are valid engineering states. Compile-only success is not movie-quality success.

## Golden integration target

The representative full-integration Golden film in Plastic should exercise, in one immutable production fixture where legal:

- actor animation;
- camera Push/Pull/Track/Follow/Drift/Orbit/Shake/ImpactShake;
- perspective operations;
- projectile types and exact counts;
- explosions/effects;
- target anchors and collider resolution;
- moving shooter plus fire;
- reverse animation;
- concurrent actor animation + camera motion;
- concurrent firefight + camera motion;
- repeated camera operations after unrelated activity;
- final clean Hold with no leaked state.

The exact fixture data and runner implementation remain in Plastic. Git documents the invariant, not a duplicate runtime fixture.

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
- generated animation clips required for playback;
- actor Animator bindings;
- camera-motion bindings;
- target/anchor/collider references;
- correct active intervals.

A candidate that works only before Save is incomplete.

A bad new candidate must not destroy the last valid Editable Preview where preservation is possible.

## Camera proof

Camera shot selection and continuous camera motion are separate obligations.

Native shot selection remains owned by the existing Cinemachine Timeline route.

A CinemachineCamera becoming active is not proof that authored motion executed.

For authored within-shot motion:

- Push/Pull must produce continuous visible framing change inside the shot, not only a cut between static lens sizes;
- Orbit must preserve authored target + direction and produce meaningful 2D/2.5D composition change;
- Drift must produce visible frame-relative displacement;
- Shake must produce visible oscillation and return to base;
- ImpactShake must produce an early strong hit followed by decay to base;
- Hold must contain no leaked motion from a prior interval;
- strong authored movement must be obviously visible to a human, not merely technically non-zero.

Implementation details may evolve inside Plastic, but one capability must still have one execution owner for the same interval.

## Actor animation proof

For compatible actor animation, success is the complete chain:

```text
semantic animation intent
-> resolved compatible AnimationClip
-> native AnimationTrack
-> final cloned visual Animator binding
-> correct interval
-> observed state/frame change
```

A generated clip or track count alone is not proof.

A final generic binding of `null` is a backend/engine failure even if source materialization was correct earlier.

Actor animation and actor motion remain separate concepts and may run concurrently when legal.

## Projectile and effect proof

Authored quantity is an audience-visible obligation.

Acceptance requires:

```text
source obligation
-> exact runtime identity
-> distinct generated instance/event
-> Timeline representation
-> valid receiver/binding
-> correct interval
-> visible execution
```

For projectiles, validate exact type/count, launch origin, travel, target/anchor, impact/effect and concurrency with actor/camera motion.

A projectile emitted from a stale cached shooter position while its shooter moves is failure.

A projectile or impact does not implicitly satisfy an unrelated visible Effect obligation.

## Quality gate

A technically non-zero result is not automatically a successful film.

For Golden QA:

- animation must visibly animate;
- strong camera motion must be immediately legible;
- projectiles must visibly travel;
- impacts/effects must visibly execute;
- simultaneous operations must genuinely overlap;
- backgrounds must cover the active camera composition;
- no black frame, `No cameras rendering`, stale foreign preview, lost binding or residual motion is exact success.

If a reviewer must say "maybe it moved a little", strong motion failed the quality gate.

## Ownership of failures

Keep the established distinction:

- `AUTHORING`: source JSON/CURRENT selection is invalid and repairable from published authoring truth;
- `BACKEND`: legal authored intent is lost, mis-lowered, mis-scoped or mis-bound before/during materialization;
- `ENGINE`: legal materialized intent cannot be executed correctly by Unity/editor/runtime.

Backend/engine failure is not permission to mutate a legal accepted fixture.

## Publication discipline

Maintain guidance only under `designer-ai/tools/current-source/**`.

Do not manually edit `designer-ai/open-current/**`.

When `requiredCurrent` and heavy source-truth fingerprints are unchanged and only lightweight guidance changed, use the existing DELTA Publish path.

Use FULL Publish only when heavy/source-truth artifacts or compatibility fingerprints actually changed.

Guidance changes do not require an unrelated full Catalog scan.
