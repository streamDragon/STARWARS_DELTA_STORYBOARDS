# Effect Sub-Beat Timing — NEXT CURRENT

Status: design/acceptance source for the next publication. This directory is intentionally outside `designer-ai/open-current/**` because CURRENT is generated atomically and must not be hand-edited.

## Problem

A visible `Effect` is already a real authoring obligation, but CURRENT only gives it beat-wide lifetime. That makes sequential bursts, overlap, late-beat flashes and multiple simultaneous copies of the same Effect impossible to express faithfully.

## Decision

Add optional timing directly to each authored `visible[]` obligation:

- `startOffsetSeconds >= 0`
- `durationSeconds > 0` when present

Resolved interval:

```text
start = beatStart + startOffsetSeconds(default 0)
end   = min(beatEnd, start + durationSeconds) when duration is authored
end   = beatEnd when duration is omitted
```

Each visible obligation remains an independent instance even when several entries use the same `handle`.

## Ownership

Authoring owns timing intent. The Simple adapter preserves it. The execution plan owns the resolved absolute interval. Timeline/materialization consumes that interval. There must not be a second timing owner hidden in Sprite, Particle or preview code.

Runtime-form ownership remains unchanged:

- Sprite/static visual Effect: existing activation/native visual owner.
- Prefab/Particle/nested-director Effect: existing Control/lifecycle owner.
- Project-specific visual/VFX clip: only where CURRENT already requires it.

## Files in this proposal

- `EFFECT_SUBBEAT_AUTHORING_CONTRACT.md` — normative behavior.
- `CODEX_IMPLEMENTATION_HANDOFF.md` — direct Unity implementation brief.
- `GOLDEN_CANDIDATE_MATRIX.md` — nine acceptance cases required before promotion.

## GOLDEN discipline

Nothing in this directory is automatically GOLDEN. Promotion still requires LOAD, NORMALIZE, zero genuine red blockers, BUILD EDITABLE PREVIEW, binding-aware interval verification and human visual acceptance. Schema-valid alone is not enough.

After the Unity implementation passes, the publisher should regenerate schema/rules/guides/examples from the canonical source and then publish a new atomic CURRENT. Do not copy these files into `open-current` by hand.