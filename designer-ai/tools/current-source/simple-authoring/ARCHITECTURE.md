# STARWARS_DELTA Simple Cutscene Authoring Architecture

This is maintainer guidance, not a second authoring contract.

## Production path

```text
Devora / ChatGPT
-> CUTSCENE_SCRIPT_V1
-> existing Simple Adapter
-> existing V3 semantic / narrative beat / cinematic feature owners
-> existing V5
-> existing Validator / Materializer / Timeline
-> Editable Preview
```

Do not create a replacement V3/V5 pipeline, Catalog, validator, materializer, Timeline system, camera stack, audio engine, projectile runtime or actor-motion runtime.

## Canonical source and published truth

Publisher/engineering source for Simple V1 lives only under:

- `designer-ai/tools/current-source/simple-authoring/`

The public authoring contract for a published CURRENT is only the matching atomic projection under `designer-ai/open-current/`, especially:

- `open-current/CHATGPT_START.txt`
- `open-current/simple-authoring/CUTSCENE_SCRIPT_V1.schema.json`
- `open-current/simple-authoring/AUTHORING_HANDLES.json`
- `open-current/simple-authoring/AUTHORING_RULES_CURRENT.json`
- `open-current/EMOTIONAL_DIALOGUE_CURRENT.json`
- `open-current/CUTSCENE_VALIDATION_CURRENT.json`

Do not maintain duplicate Simple source files at `designer-ai/tools/current-source/` root and do not manually edit generated `open-current/**` as cleanup.

## Authoring boundary

ChatGPT authors semantic film intent only:

- beats and audience-observable evidence
- exact CURRENT handles
- visible quantity and frame-relative composition
- dialogue text and exact curated dialogue identity/expression
- semantic camera intent
- semantic actor motion intent
- explicit legal Audio handles
- exact closed-world Cutscene projectile IDs

Unity owns runtime IDs, CURRENT fingerprints, route resolution, materialization, Timeline bindings, technical defaults and final validation.

## Native-first Timeline ownership

Native-first means use a native Timeline owner when it correctly owns the capability. It does not mean native-only.

One capability has one execution owner for the same interval.

| Capability / runtime form | Preferred single owner |
|---|---|
| Compatible `AnimationClip` playback | Native `AnimationTrack` |
| Semantic/procedural flyby, orbit, pursuit, formation and screen-space actor motion | Existing single semantic-motion owner |
| Existing instantiated GameObject/Sprite needing bounded visibility | Native `ActivationTrack` |
| Prefab, `ParticleSystem` or nested `PlayableDirector` whose lifecycle/evaluation Timeline can own | Native `ControlTrack` |
| Effect requiring project-specific screen composition, sorting/interpolation or renderer behavior | One existing custom Visual/VFX clip owner |
| Real audio clip | Native `AudioTrack` |
| Cinemachine shot | Native Cinemachine Timeline representation |
| Projectile or instantaneous command | Typed Timeline marker / notification receiver |
| Dialogue, transition and project-specific layer semantics | Existing corresponding custom track |

Do not generate two competing owners for the same capability. In particular, do not pair Activation + Control for one Effect, native camera + competing custom camera for the same shot, or baked AnimationClip motion + procedural transform motion for the same actor interval.

## Visible obligations and Effect lowering

Every legal expanded `visible[]` item is an audience-visible obligation. `visible[].count` is real quantity and must not be silently reduced or deduplicated by asset handle.

For route=`Effect`:

- a legal visible Effect must receive a beat-bounded generated representation even when no explicit Effect action exists;
- an explicit compatible action may refine the Effect semantics but is not a secret activation requirement merely to make the Effect exist;
- multiple instances using the same exact handle remain distinct instances;
- backend instance identity must preserve source beat + visible id + expanded instance index;
- projectile/impact semantics do not satisfy unrelated visible Effect obligations.

This rule exists so a clean legal film cannot validate successfully and then silently lose requested Effects during Simple -> V5 -> Timeline lowering.

## Binding-aware materialization coverage

Candidate acceptance verifies the complete chain for each obligation:

```text
source obligation
-> exact CURRENT runtime identity
-> distinct generated instance
-> exact Timeline track / clip / marker
-> valid binding / receiver
-> correct active interval
```

A clip count alone is not materialization proof. Wrong bindings, wrong assets, shared instances, orphan clips or interval bleed count as missing materialization.

Legal unresolved obligations must never disappear silently. A deterministic engine-safe placeholder may count as materialized but is explicitly `DEGRADED`, not exact success.

A candidate with incomplete required materialization is rejected before it replaces the currently valid Editable Preview.

## Fail-soft candidate preservation

Strict internal candidate acceptance and tolerant user experience are complementary:

```text
BAD NEW CANDIDATE != DESTROY LAST GOOD PREVIEW
```

When a newly generated candidate fails materialization/binding/interval coverage, reject that candidate and preserve the last valid Editable Preview when one exists. Report the exact ENGINE/BACKEND degradation/failure rather than clearing the working film.

See `FAIL_SOFT_MOVIE_AUTHORING_POLICY.md` for the full user-facing policy.

## Camera and viewport-proportional composition

The active camera/frustum is the cinematic composition truth. The editor Stage rectangle is not the scale reference for cinematic motion.

Authoring remains frame-relative through fields such as `screenX`, `screenY`, `screenWidthFraction`, `screenHeightFraction`, `enterFrom`, `exitTo` and `travelDirection`.

The backend maps these semantics through the matching active camera so that:

- edge-to-edge flybys traverse a meaningful fraction of the visible frame;
- diagonals can travel from one viewport edge/corner to the opposite edge/corner instead of collapsing into a few world units;
- formation offsets preserve distinct screen-space Y/X composition;
- curve amplitude scales with the visible frame;
- Orbit radius is proportional to visible camera width/height rather than a tiny fixed Unity-unit radius.

Do not expose numeric world-distance or Stage-scale tuning in Simple V1 merely to compensate for camera size.

`camera.subject` remains semantic composition intent by default. Target-dependent Follow/Track operations may physically bind an active legal WorldActor when the current runtime representation supports it. Do not manufacture a WorldActor merely to satisfy a semantic subject.

## Current actor-motion limits

- Actor Orbit remains fixed/stationary-center unless matching runtime support says otherwise.
- Pursuit/Escort/Intercept names do not promise per-frame moving-target tracking unless the runtime actually implements it.
- Simple V1 has no per-action timing/order; sequential locomotion phases belong in adjacent beats.
- Semantic speed values remain authoring intent. They are not raw Unity-units-per-second authoring.

## FullFrame coverage

FullFrame fitting is renderer-specific and idempotent:

- resolve the exact generated layer/renderer identity;
- process each unique renderer once for the camera states overlapping its active interval;
- calculate an absolute target from a stored pre-refit baseline scale;
- do not repeatedly multiply an already-expanded scale;
- do not refit renderer A while iterating an unrelated logical layer B.

The expected invariant is that every visible camera corner is inside the intended FullFrame renderer without cross-product scale growth.

## Audio / generated identity provenance

Explicit legal Simple `audio[]` handles survive lowering as their source CURRENT identity and become the appropriate native Timeline audio representation. Generated aliases such as `simple_audio_*`, `simple_actor_*`, `generated_*` or `preview_*` are backend identities only and never authoring handles.

## Preview truth

Web Simple Preview is preflight only. Allowed web states are:

```text
SCRIPT_INVALID
CURRENT_INVALID
AUTHORING_INVALID
PREVIEWABLE
```

Web Preview must never claim `UNITY_VALIDATED` or `PREVIEW_ACCEPTED`.

Unity remains the final runtime/materialization authority.

## Publication boundary

Generated `open-current/**` is an atomic publication surface.

FULL Publish rebuilds source-truth projections when their fingerprints change.

DELTA Publish is the fast authoring/guidance path when `requiredCurrent` is unchanged. It reuses the existing base CURRENT, applies declared lightweight artifacts, and does not rebuild Catalog, Director, Visual evidence or Atlas.

Source edits do not silently rewrite an existing published CURRENT under the same transaction. The controlled FULL/DELTA publisher establishes the next projection.
