# GOLDEN 9 Candidate Matrix — Effect Sub-Beat Timing

These are **GOLDEN CANDIDATES**, not promoted GOLDEN examples.

Promotion requires the existing GOLDEN gate:

1. LOAD succeeds.
2. NORMALIZE succeeds.
3. VALIDATE has no genuine red blocker.
4. BUILD EDITABLE PREVIEW succeeds.
5. Binding-aware timing/materialization inspection passes.
6. Human visual review accepts the result as a good teaching example.

The nine cases are intentionally small and orthogonal. One giant acceptance movie is useful later, but it must not replace focused diagnosis.

## G01 — Full-beat backward compatibility

Purpose: prove old source JSON remains unchanged in meaning.

Authoring:

```json
{
  "id": "fx_full_beat",
  "handle": "<legal Effect handle>"
}
```

Expected:

```text
start = beatStart
end   = beatEnd
```

Pass only if no migration or synthetic timing fields are required.

## G02 — Immediate explicit short duration

Purpose: prove `durationSeconds` alone creates a transient Effect from beat start without requiring an authored offset.

```json
{
  "id": "fx_immediate_burst",
  "handle": "<legal transient Effect handle>",
  "durationSeconds": 0.6
}
```

Expected:

```text
start = beatStart
end   = min(beatEnd, beatStart + 0.6)
```

This also proves omitted `startOffsetSeconds` defaults to zero.

## G03 — Offset with omitted duration

Purpose: prove omission means “until beat end”, not some prefab default duration and not full beat.

```json
{
  "id": "fx_rain_late",
  "handle": "<legal sustained Effect handle>",
  "startOffsetSeconds": 2.0
}
```

Expected:

```text
start = beatStart + 2.0
end   = beatEnd
```

## G04 — Near-end clamped burst

Purpose: catch writers that drop, stretch or spill late Effects into the next beat.

Example: 8-second beat, start offset 7.75, explicit duration 1.0.

Expected:

```text
start = beatStart + 7.75
end   = beatEnd
```

No bleed into the next beat.

## G05 — Sequential Effects in one beat

Purpose: prove one beat can contain choreography rather than one monolithic Effect lifetime.

Example intervals:

```text
A 0.5–1.2
B 1.4–2.1
C 2.3–3.0
D 3.2–4.0
```

Expected: four independent appearances, no need to split the beat.

## G06 — Overlapping different Effects

Purpose: prove overlap is legal and independently bound.

Example:

```text
smoke      0.0–6.0
explosion  1.0–2.0
shockwave  1.3–2.4
glow       1.5–4.5
```

Expected: all intended overlaps visible simultaneously where intervals intersect.

## G07 — Three simultaneous copies of the same handle

Purpose: prove obligation identity is not deduplicated by handle.

Author three `visible[]` entries with the same exact legal Effect handle, different `id`, position and size, overlapping in time.

Expected:

```text
source obligations: 3
generated instances: 3
independent transforms: 3
independent lifetimes: 3
```

Any singleton collapse fails this case.

## G08 — Sprite + ParticleSystem overlap

Purpose: prove the two existing runtime-form owners coexist without stealing lifetime/binding from each other.

Author a Sprite Effect and a real ParticleSystem-prefab Effect at the same approximate screen position with overlapping intervals.

Expected:

- Sprite follows its existing visual/Activation owner.
- Particle follows its existing Control/lifecycle owner.
- Both use the same interval semantics.
- Neither forces the other onto its track type.

## G09 — Spatial + timing stress

Purpose: prove the timing fix does not regress frame-relative composition.

Within one beat author timed Effects across:

- `foreground`
- `mid`
- `background`
- `far`
- distinct `screenX/screenY`
- distinct `screenWidthFraction/screenHeightFraction`

Include at least one sustained Effect and several transient overlapping Effects. Include at least one explicit delayed burst elsewhere in G05/G06/G09 so offset + explicit duration is also exercised.

Expected: correct interval **and** correct visible placement/scale/depth for every obligation.

## Negative regression cases

These are blockers, not GOLDEN candidates:

- negative `startOffsetSeconds`
- non-finite `startOffsetSeconds`
- zero/negative/non-finite explicit `durationSeconds`
- resolved start at or after beat end
- timing fields on a non-Effect route when CURRENT does not explicitly support them there

The implementation audit specifically found and fixed the first case: negative offset had been clamped to zero instead of rejected.

## 32-second integration candidate

After G01–G09 pass independently, run the existing 32-second Effect + Particle Full Variety acceptance movie as an integration candidate. Its intended coverage includes 4 beats, 40 visible obligations, 35 timed Effects, sequential and overlapping Effects, three copies of one handle, size variation, all depth bands, omitted duration, late-beat timing, Sprite+Particle overlap and multiple camera moves.

The integration candidate is not a substitute for G01–G09. It is the final “all owners together” proof.

## Promotion rule

Do not increase the Instruction Book GOLDEN count merely because these files exist or schema validation passes. Add a candidate to the curated `goldenExamples[]` source only after Unity and human review pass. Generated `instruction-book/GOLDEN/**` output must come from the normal publisher.