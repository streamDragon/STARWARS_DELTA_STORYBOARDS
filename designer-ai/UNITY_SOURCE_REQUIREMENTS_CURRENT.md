# STARWARS_DELTA Designer AI - Unity Source Requirements CURRENT

This document is the Unity-side engineering handoff. It is not a second Catalog and must not be used to patch generated `open-current` output by hand.

## Current atomic baseline

Public CURRENT verified on 2026-08-14:

- `publishTransactionId`: `20260814-120406075-d1d97323`
- `catalogRevision`: `7625331408923133048`
- `snapshotContentHash`: `C16953971274B89AB99AA31E14CF4DB4CFA7EA39A2D226C10D98E9D0A25F70C4`
- `contractRevision`: `3BE709BD8B9143E9E6F52BDADAF1671F15B60805CC7DB33D34A2AC38D08072A1`
- `schemaHash`: `F7CA124AA3417E02F078796144AF0274284D91CA721DD311C6432587ED54193F`
- Catalog source: 22,506 records
- Director: 505 Actors, 90 Layers, 275 Effects, 223 UI, 523 Animations, 225 Audio
- Visual identities: 1,173
- Direct pixel evidence: 999
- Direct preview gaps: 174
- Director pixel-verified visual entries: 987
- eligibility audit currently flags 25 Director visual entries and 0 completion entries

The unified Visual Atlas is active and was successfully used to inspect real pixels before authoring.

## New evidence: Mars Cafe homecoming proof

A real 60-second V5 cutscene was authored from CURRENT Atlas pixels and exact IDs. The normal Studio path accepted the JSON and materialized several real assets, including Mars environments and the cafe exterior/interior. This proves the core chain works:

`CURRENT -> Director -> Atlas pixels -> exact IDs -> Studio validation -> materializer -> Unity preview`.

The same proof exposed representative-preview failures that must now be fixed at source/runtime rather than worked around in JSON.

## Work packets

The GitHub issues are the authoritative engineering split:

- **WP1 / Issue #2 - Unity Studio representative-preview invariants**
- **WP2 / Issue #3 - Director filmmaking metadata and runtime-readiness projection**
- **WP3 / Issue #4 - Debora / ChatGPT cinematic authoring preflight**
- **WP4 / Issue #5 - Mars Cafe regression fixture and GOLDEN promotion gate**

WP3 has already begun on the Git/Pages side through `FILM_AUTHORING_GUIDE_CURRENT.md`, `CHATGPT_START.txt`, `chatgpt-current.json` and `debora.html`. Unity-owned Instruction Book source/curation still needs the corresponding source-side lesson updates before the next atomic publish.

## Priority 1 - Studio representative-preview invariants

### Role capability must be enforced before Build Editable Preview

The Mars proof accepted a visual as `role=Hero` even though its Director capability set did not provide the required `Cutscene.Actor` capability.

Required behavior:
- validate cast role against exact Director capability/runtime form at import boundary
- block invalid Hero/Supporting role assignments before generation
- do not rely on runtime fallback to reveal this error

### Principal fallback is not GREEN

`MediumStarship Blue 01/02` appeared as yellow diagnostic squares in normal Designer Preview.

Required preview states:
- GREEN: representative principal visuals, sane coverage/proportions, no required diagnostic fallback
- YELLOW: optional/non-principal degradation only
- RED: principal/required actor fallback, invalid role capability, broken location-critical background, missing required materialization

Diagnostic yellow placeholders should be Advanced/Debug only in the normal designer path.

### Semantic proportions must be owned by Unity

The preview reported a system-managed ship at roughly `3.9%` screen-space. For `systemManagedProportions=true`:
- authored scale is a multiplier around `1.0`
- Unity normalizes to semantic size
- do not run ordinary screen-band QA on a diagnostic fallback square as if it were the intended renderer
- emit a dedicated materialization-fallback diagnostic first

Add a validation warning/blocker for extreme authored multipliers (roughly outside 0.75-1.35) unless an explicit deliberate reason is supported.

### Background Cover must survive camera motion

Mars backgrounds rendered as postage-stamp rectangles with black around them in Game view.

Background/FarBackground must cover at least 95% of the active camera frame through Hold and camera motion, including Push/Pull/zoom. Compute coverage for the largest required camera view, not only initial materialization.

### Effect materialization must be proven

The Mars JSON authored distant explosion effects, but screenshots did not prove visible effect materialization. Add focused tests and explicit degraded status when a required VFX cannot materialize.

## Priority 2 - Director filmmaking metadata

Exact pixels and IDs are necessary but insufficient for film selection. Export machine-readable presentation evidence for Director-eligible assets where verified or explicitly uncertain:

- `visualStyle`
- `viewAngle` / camera perspective
- orientation
- `locationType` / environment family
- scene state / lighting mood
- foreground/midground/background role
- `authoringRuntimeForm`
- role capability suitability
- background fit/coverage guidance
- system-managed proportions / target screen fraction / scale basis
- materialization confidence or known fallback risk where source evidence supports it

Selection should prefer location/style/perspective continuity over literal filename matching. A top-down concept/reference ship should not rank as an equal grounded eye-level Hero simply because it has the desired identity name.

## Priority 3 - Audio and camera semantics

Audio remains first-class. Continue completing Director audio metadata and require narrative authoring to perform an Audio pass when suitable clips exist.

For V3, preserve the existing architecture:

`Performance/Blocking -> Camera Intent -> V3 Cinemachine Planner -> Cinemachine/Timeline`.

Authoring should expose semantic purpose/composition rather than forcing ChatGPT to micromanage raw orthographic values.

For VFX, add semantic depth/purpose when the contract evolves, e.g. Background/Midground/Foreground or `DistantBattle`, so authors do not fake depth only through tiny scale values.

## Priority 4 - Regression and learning

Preserve the first Mars Cafe proof as immutable BAD evidence, conceptually `MARS_CAFE_HOMECOMING_V1_BAD`.

Regression coverage must include:
- invalid Hero role capability rejected
- Blue ship actors materialize as real renderers or explicit degraded/blocked status
- background coverage >=95% through camera motion
- system-managed actor with authored multiplier 1.0 lands inside semantic band
- successful normal preview contains no diagnostic placeholders
- required VFX materialization is proven or degraded explicitly
- importer continues through the normal Studio path

Do not convert the BAD case in place. Create a separate corrected GOLDEN only after automated invariants and a manual canonical visual review pass.

## Existing source requirements still apply

- keep sample/demo/editor/test/debug/generated/technical helpers out of normal Director eligibility
- keep Generated cutscene output out of the Catalog source
- complete deterministic preview evidence for legitimate visual assets
- preserve exact Actor -> compatibleAnimationIds -> AnimationClip compatibility
- continue Animation and Audio metadata completion
- do not expose prefab scripts/colliders/physics as authoring vocabulary
- republish atomically after Unity source fixes; do not update timestamps on old content

## Acceptance for the next atomic publish

A new publish is ready for Mars Cafe re-authoring only when:

1. WP1 representative-preview invariants compile and focused tests pass.
2. Principal diagnostic fallback cannot appear as normal GREEN success.
3. Background Cover survives camera motion.
4. Role capability is enforced before generation.
5. Director exposes materially better filmmaking/runtime-readiness metadata.
6. Instruction Book source includes the recurring Mars lessons without overwriting raw BAD evidence.
7. Catalog/Director/Atlas/contract/book are published atomically under one new transaction.

Only after that should the corrected Mars Cafe JSON be used as the next visual acceptance proof.
