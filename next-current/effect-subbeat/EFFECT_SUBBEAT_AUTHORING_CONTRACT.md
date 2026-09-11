# Effect Sub-Beat Authoring Contract

## Scope

This contract applies to `visible[]` obligations whose exact legal CURRENT handle resolves through route `Effect`.

It does not create a new Effect system. It adds timing intent to the existing visible-Effect path.

## Authoring fields

Each `visible[]` entry may optionally contain:

```json
{
  "startOffsetSeconds": 1.25,
  "durationSeconds": 0.75
}
```

Both fields are relative to the containing beat.

### `startOffsetSeconds`

- optional
- default: `0`
- finite number
- minimum: `0`
- must resolve to a start strictly before the containing beat ends

### `durationSeconds`

- optional
- finite number
- exclusive minimum: `0`
- when omitted, the obligation remains active until the end of the containing beat
- when present, the resolved end is clamped to the containing beat end

## Interval resolution

For a beat with absolute interval `[beatStart, beatEnd)`:

```text
offset = startOffsetSeconds ?? 0
start  = beatStart + offset

if durationSeconds exists:
    end = min(beatEnd, start + durationSeconds)
else:
    end = beatEnd
```

Invalid authoring:

- negative offset
- zero/negative explicit duration
- non-finite numeric value
- offset whose resolved start is at or after beat end

A duration that extends past beat end is not a blocker by itself. Runtime clamps to the beat boundary so authoring, validation and Timeline agree.

## Instance identity

Array-entry identity wins over handle equality.

Three separate `visible[]` entries using one Effect handle are three obligations and must become three independently placeable, independently timed generated instances.

Forbidden optimization:

```text
Effect handle -> singleton instance
```

Required model:

```text
visible obligation -> generated instance
```

Handle reuse may reuse source assets, but never the generated instance or lifetime state.

## Overlap

Effect intervals may overlap freely, including:

- different handles
- identical handles
- Sprite + ParticleSystem
- foreground + background Effects
- several Effects at the same screen position

Overlap is normal cinematic authoring, not a validation conflict.

## Spatial semantics

Timing does not change existing frame-relative placement rules. During its active interval an Effect still obeys its authored/currently-supported:

- `screenX`
- `screenY`
- `screenWidthFraction`
- `screenHeightFraction`
- `depth`
- `saliency`

The active camera/frustum remains the cinematic size reference.

## Runtime-form ownership

The resolver decides the runtime form exactly as before. Timing is then applied to that existing owner.

### Sprite/static visual Effect

Use the existing visual/Activation-style owner. The generated object/clip is active only for the resolved Effect interval.

### Prefab / ParticleSystem / nested PlayableDirector Effect

Use the existing Control/lifecycle owner. The controlled prefab is alive/active only for the resolved Effect interval. Particle playback must not begin at beat start when the authored start is later.

### Project-specific Effect clip

Use only when the existing resolver already selects that representation. It consumes the same resolved interval.

## Single timing owner

The resolved absolute interval must be computed once in the execution-plan/materialization layer and passed downstream.

Do not independently recompute slightly different intervals in:

- validator
- Sprite writer
- Particle writer
- preview evaluator
- generated GameObject lifetime helper

All must consume the same semantic result.

## Backward compatibility

Existing V1 JSON without these fields remains valid and means full-beat visibility:

```text
startOffsetSeconds = 0
durationSeconds    = remaining beat duration
```

No migration is required for old legal source JSON.

## Failure ownership

A legal Effect handle plus legal timing that later fails to generate the correct distinct instance/binding/interval is BACKEND/ENGINE-owned evidence.

Do not repair that failure by changing the author-selected Effect identity or silently stretching the Effect to the whole beat.

## Materialization acceptance

Exact success requires this chain:

```text
visible obligation
-> exact CURRENT Effect identity
-> distinct generated instance
-> correct runtime-form owner
-> valid Timeline binding/receiver
-> resolved start/end interval
-> correct screen placement/size/depth
```

A clip that exists but starts at the wrong time is not success.
A ParticleSystem that plays the full beat is not success.
A reused singleton for three authored obligations is not success.

## Authoring guidance

Use explicit duration for transient cinematic events such as flashes, impacts, sparks and explosions.

Omit duration intentionally for atmospheric Effects that should continue from their authored offset to the beat end, such as rain, smoke, aura or background energy.

Do not split a beat merely to sequence Effects when sub-beat timing can express the intended choreography.