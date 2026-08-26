# Codex Implementation Handoff — Effect Sub-Beat Timing

## Goal

Implement Effect sub-beat timing directly in the current Unity source. Do not revive the failed V7/V7.1 installer approach.

## Why direct source work

The old hotfix failed because source/schema drift made literal/baseline patching unsafe. The current source is authoritative. Inspect and modify current owners in place.

## Required behavior

Add optional timing to visible Effect obligations:

- `startOffsetSeconds >= 0`
- `durationSeconds > 0` when supplied

Semantics:

```text
absoluteStart = beatStart + (startOffsetSeconds ?? 0)
absoluteEnd   = duration supplied
                ? min(beatEnd, absoluteStart + durationSeconds)
                : beatEnd
```

If `absoluteStart >= beatEnd`, validation blocks the obligation.

## Architecture constraint

Do not create a parallel V7 timing system.

Find the current chain and extend it once:

```text
CUTSCENE_SCRIPT_V1 visible obligation
-> Simple adapter/lowering
-> V3/V5 semantic representation
-> execution plan/materialization candidate
-> existing runtime-form resolver
-> existing Timeline owner
```

Compute/resolve the interval once at the narrowest shared semantic/execution-plan owner and pass it downstream.

## Preserve existing ownership

Do not unify Sprite and Particle implementations merely because they now share interval semantics.

- Sprite/static visual Effect keeps the current Activation/native visual path.
- ParticleSystem/prefab/nested-director Effect keeps the current Control/lifecycle path.
- Existing project-specific VFX clip remains only where the resolver already chooses it.

The timing interval is shared semantic data; the execution owner remains runtime-form specific.

## Generated instance identity

Never deduplicate generated Effects by handle.

Each authored `visible[]` entry is one obligation and one independently timed/placeable generated instance.

Source assets may be reused. Generated object/lifetime state may not.

## Backward compatibility

Old legal JSON with no new timing fields must remain valid and render the Effect for the full containing beat.

No migration should be required.

## Validation

Accept:

- omitted offset
- offset 0
- positive finite offset before beat end
- omitted duration
- positive finite explicit duration
- overlaps
- duplicate handles
- simultaneous Sprite + Particle

Block:

- negative/non-finite offset
- start at/after beat end
- zero/negative/non-finite explicit duration

An explicit duration that extends past beat end should be clamped consistently, not rejected solely for crossing the boundary.

## Timeline/materialization invariant

Every relevant downstream owner must consume the same resolved interval:

```text
clip.start
clip.duration
Activation interval
Control clip interval
Particle playback/lifetime
preview/evaluation helper
any generated GameObject active lifetime
```

No full-beat hidden fallback after a shorter interval was authored.

## Spatial regression guard

Timing work must not alter existing normalized camera/frustum placement:

- screenX/screenY
- screenWidthFraction/screenHeightFraction
- depth/saliency

## Tests

Add focused tests matching the nine candidate cases in `GOLDEN_CANDIDATE_MATRIX.md`, at minimum:

1. no fields -> full beat
2. offset + explicit duration
3. offset + omitted duration
4. near-end flash
5. sequential Effects
6. overlapping different Effects
7. three simultaneous same-handle instances
8. Sprite + Particle overlap
9. timing + screen placement/depth

Do not run Play Mode unless genuinely required. Compile/EditMode/static Timeline verification is preferred.

## Integration fixture

After focused tests pass, use the existing 32-second Effect + Particle Full Variety acceptance fixture. Do not rewrite the fixture to fit the implementation if it is already legal against the intended next schema.

## Publication boundary

Do not hand-edit generated public `designer-ai/open-current/**` output.

Update canonical Unity-side schema/exporter/rules/guidance sources so the next publisher run regenerates:

- CUTSCENE_SCRIPT_V1 schema
- canonical example where appropriate
- authoring rules/guides
- validation contract if exported
- Devora context contents

No Catalog rescan/Atlas rebuild is justified by timing-only source changes unless fingerprints genuinely changed for an unrelated reason.

## Final report

Report:

- files changed
- canonical timing owner
- schema -> adapter -> plan -> Timeline propagation
- Sprite behavior
- Particle behavior
- duplicate-handle behavior
- overlap behavior
- backward compatibility
- tests
- compile status
- whether the 32-second acceptance fixture loads/validates/builds unchanged
- any remaining blocker before the nine candidates can be human-reviewed for GOLDEN promotion
