# Codex Implementation Handoff — Effect Sub-Beat Timing

## Goal

Implement Effect sub-beat timing directly in the CURRENT Unity source. Do not revive the failed V7/V7.1 installer approach.

The old hotfix is obsolete because source/schema drift made literal/baseline patching unsafe. CURRENT source wins.

## Non-negotiable scope

Add optional timing only to `visible[]` obligations that resolve to route `Effect`:

- `startOffsetSeconds >= 0`
- `durationSeconds > 0` when supplied

Do not broaden this change into actor lifetime, dialogue timing, projectile timing, camera timing, audio timing, or a generic visibility state machine.

If the fields are authored on a non-Effect visible obligation and CURRENT does not already explicitly support them there, emit a clear validation blocker. Do not silently ignore them.

## Exact semantics

```text
absoluteStart = beatStart + (startOffsetSeconds ?? 0)
absoluteEnd   = durationSeconds supplied
                ? min(beatEnd, absoluteStart + durationSeconds)
                : beatEnd
```

Rules:

1. No fields means the existing full-beat Effect lifetime.
2. Offset only means delayed start through beat end.
3. Duration only means beat-start burst for that duration.
4. Duration may extend past beat end; clamp the resolved end to beat end.
5. `absoluteStart >= beatEnd` is invalid authoring.
6. Negative/non-finite offset is invalid.
7. Zero/negative/non-finite explicit duration is invalid.
8. Never rebase a legal delayed Effect back to beat start.
9. Never let an Effect spill into the next beat because of an overlong duration.

## Architecture constraint

Do not create a parallel V7 timing system, compatibility wrapper, BAT installer, whole-file SHA patch, or fallback representation.

Inspect CURRENT first, then extend the existing chain once:

```text
CUTSCENE_SCRIPT_V1 visible obligation
-> Simple schema/parser/normalizer
-> Simple adapter/lowering
-> current semantic representation
-> execution plan/materialization candidate
-> existing runtime-form resolver
-> existing Timeline owner
```

Likely CURRENT files/owners to inspect include, but paths and line numbers must be verified before editing:

- `Assets/WISDOM/CutsceneStudio/Editor/MY_CutsceneSimpleProductionEntry.cs`
- `Assets/WISDOM/CutsceneStudio/Editor/Materialization/MY_CutsceneExecutionPlan.cs`
- `Assets/WISDOM/CutsceneStudio/Editor/Timeline/MY_CutsceneTimelineWriters.cs`
- current validator/validation pipeline
- current CUTSCENE_SCRIPT_V1 schema/export source
- current authoring-rules / Film Guide / Instruction Book exporter source
- existing Sprite Effect materializer
- existing prefab/ParticleSystem Effect materializer

Do not assume these names are exhaustive. Follow actual CURRENT ownership rather than creating new files merely because this handoff names a concept.

## One timing owner

Resolve the absolute interval once at the narrowest shared execution-plan/materialization owner and pass it downstream.

Validator, writer, Sprite route, Particle route, preview/evaluation and generated-object lifetime must agree on the same interval semantics. They may validate or consume it, but must not invent competing clocks.

## Preserve existing runtime ownership

Do not unify Sprite and Particle implementations just because they share interval semantics.

- Sprite/static visual Effect keeps the CURRENT Activation/native visual owner.
- ParticleSystem/prefab/nested-director Effect keeps the CURRENT Control/lifecycle owner.
- Existing project-specific VFX clip remains only where CURRENT already selects it.

The interval is shared semantic data. The execution owner remains runtime-form specific.

## Generated instance identity

Never deduplicate generated Effects by handle.

`visible[].id` is obligation identity. `handle` selects a source asset.

Three authored entries using one exact handle must produce three independently timed/placeable instances with independent bindings and transforms. Source asset reuse is fine; generated instance/lifetime reuse is not.

## Timeline/materialization invariant

Where applicable, every downstream owner must reflect the same resolved interval in:

```text
clip.start
clip.duration
Activation interval
Control clip interval
Particle playback/lifetime
preview/evaluation helper
generated GameObject active lifetime
```

No hidden full-beat fallback is allowed after a shorter interval was authored.

Backward scrubbing and `PlayableDirector.Evaluate()` must derive state from Timeline time plus authored ownership, not callback history.

## Spatial regression guard

Timing work must not alter existing placement semantics:

- `screenX` / `screenY`
- `screenWidthFraction` / `screenHeightFraction`
- depth / saliency
- foreground/mid/background/far composition
- active camera/frustum sizing reference

A timing fix that moves or resizes an Effect is a regression.

## Backward compatibility

Old legal CUTSCENE_SCRIPT_V1 JSON with no new fields remains legal and means full containing-beat visibility. No migration, rewrite, compatibility mode, or synthetic authored fields are required.

## Validation diagnostics

Use existing naming/style where possible, but diagnostics must identify beat, `visible[].id`, field path/value and reason.

Required failure classes:

- invalid negative/non-finite `startOffsetSeconds`
- invalid zero/negative/non-finite `durationSeconds`
- resolved start at/after beat end
- timing fields on non-Effect route

Do not reject overlap or repeated handles. Those are valid authoring.

## Tests: Golden Candidate 9

Add the smallest focused EditMode/unit/static Timeline tests that prove the cases in `GOLDEN_CANDIDATE_09_ACCEPTANCE_SPEC.json`:

1. G01 no fields -> full beat
2. G02 offset 0 + short explicit duration
3. G03 delayed start + omitted duration -> beat end
4. G04 near-end overlong duration -> clamp at beat end
5. G05 sequential Effects
6. G06 overlapping Effects
7. G07 three simultaneous same-handle instances
8. G08 Sprite + Particle/prefab overlap with distinct existing owners
9. G09 timing plus independent placement/size/depth under camera Hold/Push/Drift/Pull

Also add negative tests for invalid offset, invalid duration, outside-beat start and non-Effect field use.

Do not run Play Mode merely to satisfy the report. Prefer compile, EditMode, execution-plan and Timeline/binding verification. If visual runtime was not actually run, state `RUNTIME VISUAL ACCEPTANCE: NOT VERIFIED` rather than inventing success.

## 32-second integration fixture

After focused cases pass, use the existing 32-second Effect + Particle Full Variety acceptance fixture as the integration proof.

Expected coverage:

- 4 beats
- 40 visible obligations
- 35 timed Effects
- real ParticleSystem prefabs
- Sprite Effects
- ControlTrack vs ActivationTrack
- sequential and overlapping Effects
- three simultaneous instances of one exact Effect handle at different positions
- different sizes
- both screenWidthFraction and screenHeightFraction
- foreground/mid/background/far
- Effect starting at beat offset 0 with no authored startOffsetSeconds
- Effect with startOffsetSeconds but no durationSeconds extending to beat end
- near-end Effect
- Particle + Sprite at same place without owner trampling
- camera Hold/Push/Drift/Pull

Do not rewrite the fixture to hide an implementation failure if it is legal against the intended next schema.

## Publication boundary

Do not hand-edit generated `designer-ai/open-current/**` output.

Update the canonical Unity-side schema/exporter/rules/guidance sources so the normal publisher later regenerates, as applicable:

- `CUTSCENE_SCRIPT_V1.schema.json`
- canonical V1 example
- `AUTHORING_RULES_CURRENT.json`
- semantic/film authoring guide text
- validation contract/export
- Instruction Book guidance
- Devora/CURRENT context contents

Timing-only changes do not justify Catalog Full Scan, Atlas rebuild, or unrelated asset fingerprint churn.

## Golden promotion boundary

The nine repository cases are candidates, not already-GOLDEN examples.

Promotion requires:

1. LOAD succeeds.
2. NORMALIZE succeeds.
3. VALIDATE has no genuine red blocker.
4. BUILD EDITABLE PREVIEW succeeds.
5. Binding-aware interval/materialization verification passes.
6. Human visual review accepts the example as good teaching material.

Only then should the canonical curated Golden source be updated and publisher-generated CURRENT output change.

## Final report

Return a concise implementation report containing:

- exact files changed
- exact schema field path and validation rules
- canonical interval-resolution owner
- schema -> adapter -> plan -> Timeline propagation
- Sprite owner behavior
- Particle/prefab owner behavior
- duplicate-handle behavior
- overlap behavior
- backward compatibility
- focused tests and results
- compile/EditMode status
- whether the existing 32-second fixture LOADS / NORMALIZES / VALIDATES / BUILDS unchanged
- `RUNTIME VISUAL ACCEPTANCE: VERIFIED` or `NOT VERIFIED`
- any remaining blocker before Golden promotion

Do not report success for stages you did not actually execute.
