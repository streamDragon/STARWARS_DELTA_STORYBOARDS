# Effect Sub-Beat Timing — NEXT CURRENT

Status: implementation-audit / acceptance source for the next publication. This directory is intentionally outside `designer-ai/open-current/**` because CURRENT is generated atomically and must not be hand-edited.

## CURRENT finding

The CURRENT Unity source already implements Effect sub-beat timing. The implementation audit found one contract violation: negative `startOffsetSeconds` was clamped to zero instead of being rejected.

The direct CURRENT fix was made in `MY_CutsceneSimpleProductionEntry.TryResolveEffectInterval`, with focused negative-offset test coverage added. No parallel timing subsystem, BAT installer, compatibility layer, Catalog scan or Atlas rebuild is required.

## Contract

Optional timing belongs to each authored `visible[]` obligation that resolves to route `Effect`:

- `startOffsetSeconds >= 0` and finite when present
- `durationSeconds > 0` and finite when present

Resolved interval:

```text
start = beatStart + startOffsetSeconds(default 0)
end   = min(beatEnd, start + durationSeconds) when duration is authored
end   = beatEnd when duration is omitted
```

`start >= beatEnd` is invalid. Overlong duration clamps to beat end. Missing timing fields preserve full-beat behavior.

Each visible obligation remains an independent instance even when several entries use the same `handle`.

## Ownership

CURRENT resolves the interval in the existing Effect path and propagates it through the existing semantic/materialization/Timeline chain. Runtime-form ownership remains unchanged:

- Sprite/static visual Effect: existing Activation/native visual owner.
- Prefab/Particle/nested-director Effect: existing Control/lifecycle owner.

Do not add a second clock or generic Effect runtime merely to support these fields.

## Verification status

Reported source changes:

- `Assets/WISDOM/CutsceneStudio/Editor/MY_CutsceneSimpleProductionEntry.cs`
- `Assets/_Game/MY_Core/MY_Scripts/HAGGAI_STUFF/Editor/Tests/CutsceneSimpleGeometricLoopTests.cs`

Reported focused G01–G09 coverage exists, plus explicit negative-offset rejection coverage.

Not yet verified in Unity:

- compile
- EditMode execution
- Timeline/binding assertions in a real Unity run
- the existing 32-second integration fixture
- human visual acceptance

Therefore this work is not yet promoted to GOLDEN and generated CURRENT must not be edited by hand.

## Files in this proposal

- `EFFECT_SUBBEAT_AUTHORING_CONTRACT.md` — normative behavior.
- `CODEX_IMPLEMENTATION_HANDOFF.md` — CURRENT implementation finding and remaining verification brief.
- `GOLDEN_CANDIDATE_MATRIX.md` — nine focused acceptance cases.
- `GOLDEN_CANDIDATE_09_ACCEPTANCE_SPEC.json` — machine-readable acceptance matrix.
- `AUTHORING_GUIDANCE_PATCH.md` — guidance to fold into canonical publisher-owned authoring sources after verification.

## GOLDEN discipline

Nothing in this directory is automatically GOLDEN. Promotion still requires LOAD, NORMALIZE, no genuine validation blocker, BUILD EDITABLE PREVIEW, binding-aware interval verification and human visual acceptance.

After verification passes, update the canonical Unity-side schema/rule/guide/export sources as needed and let the normal publisher regenerate a new atomic CURRENT. Do not copy these files into `open-current` by hand.