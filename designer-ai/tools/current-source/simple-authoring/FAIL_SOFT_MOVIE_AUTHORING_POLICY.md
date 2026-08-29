# WISDOM Cutscene Studio - Fail-Soft Movie Authoring Policy

## Product invariant

The end user is making a movie, not debugging a compiler.

When the Cutscene system itself is healthy, Editable Preview should remain usable through recoverable authoring or optional-content problems. A fallback is never reported as exact success.

User-facing status:

- **GREEN** - requested behavior is represented exactly.
- **YELLOW** - quality/directing advice or deterministic low-level repair with no material visible change.
- **ORANGE** - visible semantic degradation, omission, placeholder or substitution was required; Preview continues.
- **RED** - no honest legal Preview can be produced or preserved.

## Author strict, Studio tolerant

ChatGPT/Devora must still emit clean schema-valid `CUTSCENE_SCRIPT_V1` using exact CURRENT handles, legal enums, exact dialogue vocabulary, semantic animation/performance intent and the closed projectile vocabulary.

Fail-soft behavior is not permission to author invalid JSON.

Studio is the safety net. For recoverable defects it may, in order:

1. apply deterministic CURRENT-backed repair;
2. apply a safe supported fallback;
3. omit only the unsupported optional operation;
4. use an explicit diagnostic placeholder;
5. preserve the last valid Preview when a new candidate cannot be accepted.

Use RED only when none of those preserve an honest result.

## Ownership boundary

Keep AUTHORING, BACKEND and ENGINE distinct.

- **AUTHORING**: source JSON or CURRENT choice itself is illegal.
- **BACKEND**: legal source intent is lost, mis-lowered, mis-scoped, mis-bound or mis-persisted before final execution.
- **ENGINE**: legal materialized intent cannot execute correctly in Unity/editor/runtime.

A BACKEND/ENGINE failure is not permission to rewrite otherwise legal source JSON.

## Handles and identity

If a stale/internal reference can be mapped uniquely to an exact CURRENT authoring identity, Studio may repair it internally and disclose the repair.

If no unique legal mapping exists, use a placeholder/omission where the movie can still continue. Never ask the user to edit runtime hashes or infer identity from filenames, display names or visual similarity.

Generated runtime aliases are never authoring handles.

## Animation

If a valid Actor requests unsupported animation/performance intent:

- preserve the valid Actor identity/visual;
- use a deterministic supported static/default pose or explicitly supported fallback only when honest;
- report ORANGE when the visible performance differs materially;
- never claim the requested animation succeeded when it did not.

A generated `AnimationTrack` or clip count without the correct final Animator binding is a BACKEND/ENGINE failure, not authoring success.

## Visible Effects

A legal route=`Effect` entry in `visible[]` is already an audience-visible obligation.

Do **not** require a meaningless `reveal`, `activate` or other secret action merely to make that Effect exist.

Studio must materialize the visible Effect through the existing Effect owner for its authored interval. An explicit Effect action may refine real event semantics when the schema supports it, but it is not a wake-up switch.

If an optional Effect cannot materialize, omit only that Effect or show a diagnostic placeholder and report ORANGE. Repeated identical handles remain distinct obligations.

## Projectiles versus visual Effects

A real Cutscene projectile uses `type=fire` with a schema-legal `projectileId`.

A visual beam/muzzle/explosion Effect is not projectile identity. `effectHandle`, `viaHandle`, filenames and gameplay prefab names are never substitutes for `projectileId`.

Malformed `fire` without `projectileId` is an authoring defect unless the imported input can be deterministically interpreted by an already-supported recovery rule. Any recovery must be disclosed and must not silently invent projectile identity.

Projectile execution must preserve authored type/count, launch origin, target/anchor, timing, travel and impact/effect expectations through the final Preview.

## Camera

If a semantic camera subject is unavailable but a deterministic safe composition fallback exists, Preview may continue with disclosed degradation.

Do not weaken or rewrite legal camera intent merely because the current Timeline/Cinemachine route lost movement, target, direction or binding downstream.

A CinemachineCamera becoming active is not proof that authored Push/Pull/Orbit/Drift/Shake/ImpactShake executed.

## Dialogue

Dialogue identity/expression remain closed-world. Studio may degrade optional presentation mechanics only through existing legal defaults; it must never invent a speaker, listener, expression or unrelated visual identity.

## Schema defects

Recoverable structural defects may degrade only when the schema/runtime already defines a deterministic safe interpretation.

Unparseable/corrupt documents, irreconcilable identity ambiguity, or true generator/Timeline failure may be RED when no valid Preview can be produced or preserved.

## Candidate acceptance and persistence

A new candidate is accepted only when required obligations survive the complete chain:

`source -> resolution -> materialization -> binding/receiver -> interval -> Save -> final Editable Preview -> reopen -> evaluation`

A candidate that works only before Save is incomplete.

A bad new candidate should not destroy the last valid Preview when preservation is possible.

## Diagnostics

Primary diagnostics should be human-readable and answer:

1. what was requested;
2. what failed or changed;
3. what Studio did instead;
4. whether the film remains playable.

Technical codes belong in details/advanced output. Diagnostics must be bounded and grouped by root cause rather than flooding the Console every evaluation tick.

## Regression principle

Regression tests use normal production APIs. They do not create a parallel renderer or fixture-specific production behavior.

Once a legal fixture is accepted, backend/runtime repairs use that same fixture until it passes. Golden fixture identity, runner state and PASS/FAIL remain Plastic-owned engineering evidence, never Simple V1 authoring data.

## Ownership summary

- `CUTSCENE_SCRIPT_V1` is the sole public authoring format.
- V3/V5, Timeline, Cinemachine wiring, AnimationTrack bindings, projectile receivers and Preview persistence are backend/runtime implementation.
- This policy creates no second schema, fallback Catalog, camera engine, projectile runtime or animation system.
