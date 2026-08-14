# STARWARS_DELTA Designer AI - Unity Source Requirements CURRENT

This document is an engineering handoff for the Unity-side implementation agent. It is **not** a second Catalog, not an authoring source, and not a substitute for the atomic Unity publish.

## Current baseline

- `publishTransactionId`: `20260813-212754773-ff89e3c3`
- Public `OPEN_CURRENT`: `CURRENT_VERIFIED_OPEN`
- Director projection source: **22,506 Catalog records**
- Director categories currently published: **548 Actors, 100 Layers, 363 Effects, 247 UI, 566 AnimationClips, 237 AudioClips**
- Raw Visual Library identities: **1,340**
- Direct pixel evidence: **1,061**
- Raw direct-preview gaps: **279**
- Director visual completion entries after Actor canonical merging: **278**
- Animation metadata completion entries: **566**
- Audio metadata completion entries: **237**

The public GitHub/Pages pipeline is intentionally reporting these gaps rather than fabricating data.

## Important interpretation

`1,061 / 1,340` is only the Visual Library direct-preview metric. It is **not** total Catalog coverage and it is **not** total Director readiness. Audio is non-visual. Animation availability is represented by exact AnimationClip IDs plus representative family evidence.

## Unity-side requirements for the next atomic publish

### 1. Fix Director eligibility at the Catalog/publisher source

Do not blindly render previews for all 278 current completion entries. First classify whether each candidate is actually legitimate cinematic content.

The current completion queue still contains obvious examples of source-classification leakage such as Cinemachine/sample or generic helper content, including entries such as `Animated Cameron`, `Lane`, `Capsule`, and `EndWall`. These should not be silently treated as missing film assets just because the current Catalog marks them preview-safe.

The Unity source projection should provide deterministic eligibility/exclusion reasons for:

- sample/demo content (`Assets/Samples/**` and equivalent package sample roots)
- Editor/test/debug helpers
- generated Cutscene output
- generic geometry/helpers/camera zones/spline helpers
- gameplay-only Prefabs
- technical textures/material dependencies
- unsafe or non-deterministic Prefabs

Legitimate cinematic Particle/VFX Prefabs must remain eligible when they can be sanitized and rendered deterministically.

### 2. Complete deterministic pixel evidence for eligible visuals

For every Director-eligible Actor, Layer, Effect or UI visual identity, export one deterministic representative preview unless it intentionally shares one representative animation-family frame.

Requirements:

- real pixels, not filename inference
- readable framing and scale
- deterministic ParticleSystem sampling and random seeds
- no active gameplay scripts/colliders/physics/network logic in preview instances
- transparent/neutral preview background where appropriate
- invalid/magenta principal render is a blocker, not an acceptable preview
- one representative image per animation family, not every frame

### 3. Complete AnimationClip metadata

The current Director projection exposes all **566** current AnimationClip IDs, but the completion queue still flags metadata gaps across the set.

Unity should export, where available and verified:

- exact compatible Actor IDs
- semantic action/family
- duration and frame rate
- loop/start/end/one-shot phase
- representative visual-family evidence
- review state and uncertainty

Compatibility must remain exact: `Actor -> compatibleAnimationIds -> AnimationClip`.

### 4. Complete Audio metadata

The current Director projection exposes all **237** AudioClip IDs, but current Catalog metadata does not provide the Director fields needed for useful selection.

Unity should export directly from source/import metadata where possible:

- duration
- channels / frequency
- loop metadata / loop recommendation
- purpose: Music / Ambience / Sfx / Alert / Ui / Voice where applicable
- description
- mood / intensity with explicit uncertainty when semantic evidence is weak

Audio must never be counted as a visual gap.

### 5. Complete presentation metadata for eligible film assets

The current Catalog has useful descriptions/tags/roles/families, but Director presentation fields are still largely unpopulated. Prioritize Director-eligible visuals rather than annotating every technical asset.

Needed fields include the equivalent of:

- presentation description
- location type
- scene/environment state
- lighting mood
- background coverage
- fit/composition guidance
- foreground / midground / background role
- portrait/world presentation suitability

Avoid a global `Stretch`-style fallback when the visual requires semantic framing.

### 6. Keep Generated output out of the source Catalog

A clean rebuild must explicitly exclude generated Cutscene output roots before the next baseline is considered clean. Do not let generated films recursively become authoring source assets.

### 7. Republish atomically

After source fixes and annotation completion, build a new atomic Designer AI publish. Do not update timestamps on the old content and call it new.

The next publish must keep the Catalog, Visual Library, Instruction Book/contract, hashes and `publishTransactionId` coherent. Only after that publish succeeds should `designer-ai/current.json` advance.

## Git-side contract already in place

The GitHub side now expects and publishes:

- `OPEN_CURRENT.json`
- `director-view/DIRECTOR_VIEW.json`
- Actor / Layer / Effect / UI / Animation / Audio Director category files
- `director-view/completion-queue.json`
- current Catalog contract/schema
- current Instruction Book
- full representative visual index/sheets
- compact `STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip`

The old request-scoped 717-record candidate package is not the general authoring source anymore.

Do **not** manually edit generated `open-current` output to hide Unity source defects. Fix the Unity source/publisher, create a new atomic CURRENT, and let the Git workflow regenerate the projection.

## Acceptance signal for this document

This handoff can be retired when a newer atomic CURRENT is public and verified, Director eligibility no longer leaks obvious sample/technical junk, legitimate visual completion gaps are materially reduced, Animation and Audio metadata are populated, and presentation metadata is useful for filmmaking.
