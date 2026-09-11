# Codex Implementation Handoff — Effect Sub-Beat Timing

## CURRENT implementation finding

CURRENT Unity source already implements Effect sub-beat timing. The source audit found one concrete contract violation:

- negative `startOffsetSeconds` was clamped to zero;
- the contract requires negative offsets to be validation blockers.

The direct source fix was made in:

- `Assets/WISDOM/CutsceneStudio/Editor/MY_CutsceneSimpleProductionEntry.cs`

Focused regression coverage was added in:

- `Assets/_Game/MY_Core/MY_Scripts/HAGGAI_STUFF/Editor/Tests/CutsceneSimpleGeometricLoopTests.cs`

Do not create another V7/V7.1 installer, compatibility layer, BAT patcher, parallel timing subsystem or fallback representation.

## Canonical semantics

Timing applies only to `visible[]` obligations that resolve to route `Effect`.

```text
absoluteStart = beatStart + (startOffsetSeconds ?? 0)
absoluteEnd   = durationSeconds supplied
                ? min(beatEnd, absoluteStart + durationSeconds)
                : beatEnd
```

Rules:

1. Missing timing fields preserve the existing full-beat Effect lifetime.
2. `startOffsetSeconds`, when present, must be finite and `>= 0`.
3. `durationSeconds`, when present, must be finite and `> 0`.
4. `absoluteStart >= beatEnd` is invalid authoring.
5. Overlong duration clamps to the containing beat end.
6. Overlap is legal.
7. Repeated handles are legal and must not deduplicate generated obligation instances.
8. Timing does not alter position, size, depth or runtime-form ownership.

## CURRENT ownership

The audited CURRENT chain is:

```text
CUTSCENE_SCRIPT_V1 visible[]
-> Effect-only normalization / interval resolution
-> MY_CutsceneEffectActionSpecV5 startOffset/duration
-> materialization obligations
-> execution-plan validation
-> Timeline clip intervals
```

Canonical interval resolution is owned by:

`MY_CutsceneSimpleProductionEntry.TryResolveEffectInterval`

Do not add another timing owner downstream.

Existing runtime-form ownership remains unchanged:

- Sprite/static visual Effect keeps the existing Activation/native visual owner.
- ParticleSystem/prefab Effect keeps the existing Control/lifecycle owner.

Actors, Layers, Audio and other visible routes are not assigned Effect sub-beat semantics by this work.

## Instance identity

`visible[].id` is obligation identity. `handle` selects the source asset.

Three authored entries using one exact Effect handle must remain three independently bound/placeable/lifetimed instances. Never collapse them to one generated object because the source handle matches.

## Focused acceptance coverage

CURRENT tests reportedly cover G01–G09:

1. G01 missing timing fields -> full beat
2. G02 explicit short burst
3. G03 delayed start + omitted duration -> beat end
4. G04 near-end overlong duration -> clamp at beat end
5. G05 sequential Effects
6. G06 overlapping Effects
7. G07 three simultaneous same-handle obligations
8. G08 Sprite + Particle/prefab overlap with distinct existing owners
9. G09 timing plus independent placement/size/depth

Explicit negative-offset rejection coverage was added with the source fix.

## Remaining work: verification, not redesign

Do not keep changing architecture merely because Unity was unavailable in the implementation environment.

When Unity is available, verify the existing implementation in this order:

1. Compile.
2. Run the focused EditMode tests.
3. Confirm Timeline/materialization intervals and bindings.
4. Verify same-handle obligations remain separate instances.
5. Verify Sprite and Particle routes keep their existing owners.
6. Run the existing 32-second Effect + Particle acceptance fixture if it exists in CURRENT.
7. Perform human visual acceptance before GOLDEN promotion.

Do not run Play Mode merely for ceremony. If visual runtime is not actually executed, report `RUNTIME VISUAL ACCEPTANCE: NOT VERIFIED`.

Expected 32-second fixture coverage remains:

- 4 beats
- 40 visible obligations
- 35 timed Effects
- real ParticleSystem prefabs
- Sprite Effects
- ControlTrack vs ActivationTrack
- sequential and overlapping Effects
- three simultaneous instances of one exact Effect handle
- different positions and sizes
- screenWidthFraction and screenHeightFraction
- foreground/mid/background/far
- omitted start offset defaulting to beat start
- delayed Effect with omitted duration extending to beat end
- near-end clamping
- Particle + Sprite overlap without owner trampling
- camera Hold/Push/Drift/Pull

## Publication boundary

Do not hand-edit generated `designer-ai/open-current/**` output.

After Unity verification passes, update canonical Unity-side schema/rule/guide/export sources only where CURRENT publication actually requires it, then let the normal publisher regenerate atomic CURRENT.

A timing-only source fix does not justify Catalog Full Scan, Atlas rebuild or unrelated fingerprint churn.

## GOLDEN promotion boundary

The repository G01–G09 artifacts remain candidates until all required gates pass:

1. LOAD succeeds.
2. NORMALIZE succeeds.
3. VALIDATE has no genuine red blocker.
4. BUILD EDITABLE PREVIEW succeeds.
5. Binding-aware interval/materialization verification passes.
6. Human visual review accepts the example as good teaching material.

Only then may the curated GOLDEN source and publisher-generated CURRENT be updated.

## Final verification report

When Unity verification is performed, report only what actually ran:

- compile result
- focused EditMode result
- Timeline/binding result
- same-handle triple-instance result
- Sprite owner result
- Particle owner result
- 32-second fixture LOAD / NORMALIZE / VALIDATE / BUILD status
- `RUNTIME VISUAL ACCEPTANCE: VERIFIED` or `NOT VERIFIED`
- any remaining blocker before GOLDEN promotion