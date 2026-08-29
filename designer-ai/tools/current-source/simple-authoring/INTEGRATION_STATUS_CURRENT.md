# STARWARS_DELTA Cutscene Integration Status

This file records durable engineering conclusions only. It is not a second authoring contract and it does not override the published atomic `open-current/**` schema or handles.

## Plastic / Git authority

The Unity/Plastic workspace is canonical for Cutscene Studio runtime implementation and runtime proof.

This Git repository is canonical for maintained external authoring/publishing guidance and the controlled Designer AI CURRENT source. It does not mirror Unity runtime source.

Generated `designer-ai/open-current/**` remains a publication product and is not hand-edited during runtime repair.

## Particle Effects

Targeted Particle discovery is supported as a Cutscene Catalog enrichment step.

A prefab is eligible for the direct Particle Effect route only when it is genuinely Particle-only for Cutscene purposes. Mixed gameplay/content prefabs that also contain gameplay actors, sprite/gameplay ownership, directors or other unrelated execution components must not be promoted merely because a nested `ParticleSystem` exists.

The targeted Particle scan is intentionally narrower than a full Catalog scan. Re-running a full Catalog scan is not required merely to discover or refresh Particle-only Effect candidates.

A legal Particle Effect must still materialize through one existing Timeline execution owner. Prefer native `ControlTrack` when Timeline can correctly own prefab/Particle lifecycle; otherwise use the one existing custom visual/VFX owner when project-specific composition behavior requires it. Do not create a parallel particle runtime.

Simple V1 Effect `visible[]` supports independent sub-beat scheduling through `startOffsetSeconds` and `durationSeconds`. Both values are local to the owning beat. Omitted start defaults to `0`; omitted duration means the remaining beat time. The interval must stay completely inside the beat. These timing fields are Effect-only: Actor, Layer and Ui visuals keep their existing route-specific lifetime semantics. Multiple Effect entries in one beat may therefore use independent positions, sizes and intervals without splitting the shot into artificial beats.

The backend lowers that exact authored interval into the existing V5 Effect action and into the binding-aware materialization obligation. Particle-only Effect prefabs continue to use the existing Timeline `ControlTrack` lifecycle owner; Sprite Effects keep the existing bounded visibility owner. Sub-beat timing does not introduce a parallel particle runtime or a second execution owner.

## Vision annotations

Vision annotation import updates visual/semantic metadata for existing Catalog identities. It is not a reason to perform an unrelated full Catalog rescan.

Annotation import must preserve exact entry identity (`entryId`, GUID, asset path/source identity and work class as applicable) and must not silently replace already authoritative vision data unless the import contract explicitly requests replacement.

Individual uncertain assets may remain `NeedsReview`; one unresolved item is not a reason to block unrelated Cutscene authoring or to manually rename/reclassify the entire Particle set.

## 2D camera and background coverage

STARWARS_DELTA Cutscene composition is 2D / 2.5D. Camera motion may create cinematic movement, parallax, push/pull, tracking and other screen-space effects, but it must not invent unseen 3D viewpoints or reveal space outside the intended 2D environment.

For every camera interval, the visible camera viewport/frustum must remain covered by the active background/layer composition. A move that exposes black borders, empty world, missing art or regions outside the intended FullFrame background is a failed camera composition even if the Timeline and Cinemachine clip are technically valid.

Camera limits must be derived from the actual active 2D background coverage and active viewport, not from an arbitrary editor Stage rectangle. When a desired move would exceed coverage, reduce/reframe the move or use a cut/hold rather than exposing non-existent scenery.

## Geometric path loops

The geometric-loop extension belongs to the existing semantic-motion owner and lowers through existing V5 `FollowPath`. It must not introduce a second movement runtime.

The intended shapes are rectangle, circle, triangle and sine, with normalized center/size, period, phase, direction and loop semantics. Expanded actor instances may share one path definition while receiving deterministic phase offsets.

This remains engineering capability until a matching Unity implementation, tests, maintained Simple V1 schema, controlled Publish and sealed `open-current/CHATGPT_START.txt` all agree in one atomic release. Until then, the published schema wins and authors must not serialize unpublished `path_loop` fields from memory.

## Stable Golden QA target

The current verification target is a stable Golden Cutscene regression in the canonical Plastic workspace, not a stream of disposable test movies.

The Golden policy is documented in:

- `CUTSCENE_GOLDEN_QA_POLICY.md`

The representative integration fixture should remain authored-stable while the backend/runtime is repaired against it. Production code must never special-case fixture names, beat IDs, actor IDs or exact fixture timestamps.

The representative Golden film should exercise, where legal:

- actor animation;
- camera Push/Pull/Track/Follow/Drift/Orbit/Shake/ImpactShake;
- perspective operations;
- exact projectile types/counts;
- explosions/effects;
- target anchors and collider resolution;
- moving shooter plus fire;
- reverse animation;
- simultaneous actor animation + camera motion;
- simultaneous firefight + camera motion;
- repeated camera operations after unrelated activity;
- a final clean Hold with no leaked motion/state.

The final saved/reopened Editable Preview is the execution truth. Generation-time objects alone do not prove success.

Camera/animation/projectile correctness must survive:

```text
Build
-> Save
-> final Editable Preview
-> reopen
-> Timeline evaluation
```

This includes final Timeline generic bindings, Cinemachine exposed references, required generated animation clips, actor Animator bindings, camera-motion bindings, target/anchor/collider references and active intervals.

No Golden runtime PASS is currently claimed by this status file merely because source code was changed or Unity compiled. `PASS` requires actual Unity execution of the Golden fixture. `SOURCE_READY` / `NOT_RUN` remain honest states when runtime execution has not occurred.

## Current practical verification target

Use the same Golden integration fixture and its normal production pipeline as the regression target.

The closed loop is:

```text
compile
-> run same Golden QA
-> find first real failure
-> trace to first wrong owner/stage
-> fix production code
-> compile
-> rerun same Golden QA
```

Do not rewrite legal fixture JSON to hide backend/engine failure. Do not create a new fixture for every symptom. Do not treat compile-only success as movie-quality validation.

Representative proof must still include binding-aware materialization coverage, 2D viewport/background coverage, actor animation state change, camera within-shot motion, projectile/effect execution, concurrency and last-good Preview preservation.

Do not turn a single deferred asset such as a questionable Particle candidate into a release blocker when the route itself is already proven by other legal candidates.
