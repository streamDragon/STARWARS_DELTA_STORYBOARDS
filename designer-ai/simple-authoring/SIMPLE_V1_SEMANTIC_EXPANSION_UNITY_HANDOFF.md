# Unity handoff: Simple V1 semantic expansion

## Goal

Extend the existing `MY_CutsceneSimple*` bridge only. Do not create a new cutscene engine, a new Catalog, another validator, or a V7 layer.

Keep the existing production route:

`CUTSCENE_SCRIPT_V1 -> MY_CutsceneSimpleProductionEntry -> existing V3 Beat/Feature/Spatial owners -> existing normalization/validation -> existing V5 Timeline/materialization`

## DTO additions

Mirror the new optional schema fields in the existing Simple DTOs:

Beat: `dramaticFunction`, `energy`, `cinematicMove`, `relationships[]`, `audio[]`, `transition`, `continuity`.

Visible: `startState`, `endState`, `saliency`, `travelDirection`, `facing`, `performanceIntent`, `animationIntent`.

Action: `motionIntent`, `trajectory`, `travelDirection`, `speed`, `performanceIntent`, `animationIntent`.

Dialogue: `expressionIntent`, `performanceIntent`, `delivery`, `presentation`.

Camera: `drift`, `shake`, `impact_shake`, `orbit`, plus direction/intensity/parallax.

Audio cue: `kind`, `handle`, `operation`, `intent`, timing, loop, volume, intensity.

## Mapping rules

### cinematicMove

Map to existing V3 Beat/Feature vocabulary only when exact. Reuse owners such as BeatSequenceDirector and CinematicFeatureCompiler. Unsupported cinematicMove must be preserved as visible intent and lowered through legal actions/camera/staging, never replaced with a vaguely similar feature just to compile.

### motionIntent

Use existing semantic motion/staging paths. Actor `orbit` may use an existing Orbit capability when the resolved handle supports it. Otherwise use legal curve/follow-path/parallax evidence. Do not change route: Effect remains Effect, Layer remains Layer.

### camera orbit

Camera `orbit` is not a new 3D camera system. Compile it as a 2D/2.5D screen-space parallax move using existing Track/Follow/Drift/camera state plus foreground/mid/background motion where appropriate. No unseen sprite sides may be synthesized.

### performanceIntent / animationIntent

Resolve semantic intent only through the existing compatibility projection for the exact Actor identity. Do not accept raw animation IDs from Simple V1. If no compatible family exists, keep the existing deterministic fallback/warning policy; identity ambiguity remains RED.

### relationships and continuity

Feed existing V3 spatial relationship and continuity owners. `left_of/right_of/ahead_of/behind/faces/threatens/follows/escorts/protects` are audience-state constraints, not raw coordinates.

### audio

Resolve `audio[].handle` through the same local CURRENT handle semantics and require route `Audio`. Map operations to existing Play/FadeIn/FadeOut/Stop/volume behavior. Preview may warn on `safeForPublish=false`; a publish-ready result must not claim readiness while any referenced Audio is not publish-ready. Never auto-select a substitute audio file.

### transitions

Map cut/crossfade/fade to existing transition behavior. Do not add a second transition subsystem.

## Validation additions

Reuse the existing Simple preflight surface and add only narrow checks:

- unknown/ambiguous semantic handle -> RED
- Audio handle on non-Audio route -> RED
- fake 3D orbit/view invention -> RED
- declared cinematicMove with no realizable evidence -> warning/block according to existing story-evidence policy
- performance/animation intent with no compatible resolution -> existing deterministic warning/block policy
- continuity direction contradiction -> warning unless explicitly authored

## DONE WHEN

A schema-valid Simple V1 using `cinematicMove`, orbit-like 2D camera motion, semantic performance/animation intent, relationships, continuity, transitions and legal Audio handles reaches the normal existing V5 pipeline without introducing any new runtime identity source or backend architecture.

This repository contains the authoring contract and handoff. Runtime C# remains owned by the canonical Unity/Plastic workspace.
