# NEXT CURRENT Authoring Guidance Patch — Timed Visible Effects

This file states the guidance that should be folded into the canonical Film/Simple authoring sources before the next publication. It is not a replacement for generated CURRENT files.

## Add to Film Authoring Guide: Visible Effects

A visible Effect obligation may be beat-wide or sub-beat timed.

Use `startOffsetSeconds` and `durationSeconds` on the exact `visible[]` obligation when the audience should see the Effect during only part of its containing beat.

Rules:

- Timing is relative to the containing beat.
- Omitted `startOffsetSeconds` means the Effect begins with the beat.
- Omitted `durationSeconds` means it remains visible from its resolved start until the beat ends.
- Explicit duration is for transient events such as explosion, impact, muzzle flash, shockwave, spark and short glow.
- Omitted duration is appropriate for sustained atmosphere such as rain, smoke, aura, portal ambience or persistent energy that intentionally lasts to beat end.
- Several Effects may overlap.
- Several entries may reuse one exact Effect handle and remain distinct instances.
- Do not split a beat merely to serialize Effect timing that belongs inside one dramatic beat.
- Do not add fake `reveal` actions to activate Effects.

Example:

```json
{
  "id": "impact_flash",
  "handle": "<exact legal Effect handle>",
  "screenX": 0.72,
  "screenY": 0.43,
  "screenWidthFraction": 0.18,
  "depth": "foreground",
  "startOffsetSeconds": 2.1,
  "durationSeconds": 0.3
}
```

The timing fields do not change route legality, visual identity, depth or frame-relative composition.

## Add to Film preflight

For timed visible Effects confirm:

1. every offset is inside the containing beat;
2. every explicit duration is positive;
3. omitted duration is intentional and means “until beat end”;
4. overlapping Effects are deliberate;
5. duplicate handles represent deliberate separate instances, not accidental duplication;
6. transient Effects do not bleed into later beats;
7. sustained Effects do not silently start at beat start when a later offset was authored;
8. Particle and Sprite Effects preserve their correct existing runtime owners;
9. screen placement/size/depth remains correct during the active interval.

## Add to learning lessons

Durable lesson:

> Beat membership is not sufficient temporal authoring for Effects. The same dramatic beat may require multiple independent visible Effect intervals. Timing must belong to the visible obligation and survive lowering/materialization without becoming a second execution owner.

## Canonical example policy

The next canonical Simple V1 example should demonstrate at least:

- one backward-compatible full-beat Effect with no timing fields;
- one delayed transient Effect with offset + explicit duration;
- one delayed sustained Effect with offset and omitted duration;
- two overlapping Effects;
- two separate visible entries that reuse one Effect handle but differ in position or interval.

Do not turn the canonical example into the entire 32-second stress fixture. The canonical example teaches syntax and semantics; the Golden candidates prove system behavior.

## Validation messaging

Prefer precise author-facing diagnostics, for example:

```text
CUTSCENE_EFFECT_OFFSET_OUTSIDE_BEAT
CUTSCENE_EFFECT_DURATION_INVALID
```

Do not emit warnings merely because Effects overlap or reuse a handle. Those are legal cinematic patterns.

## Publication

When Unity canonical sources are updated and verified, regenerate this guidance into the public atomic bundle through the normal publisher. Keep `requiredCurrent`/transaction provenance consistent. Do not perform a Catalog rescan or Atlas rebuild for a timing-only authoring change unless unrelated source fingerprints changed.