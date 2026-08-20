# CASE 030 - V2.6 visual QA stabilization

## Evidence
The first broad rendered Visual QA captured 39 real frames across 13 usable Cutscene previews. The dominant machine flag was actor overlap, while human review also found postage-stamp backgrounds, oversized Midground/Foreground elements, oversized world VFX, and inconsistent relative scale between people, fighters and larger ships.

## V2.6 rule
V2 keeps its existing authoring model, but routine visual safety belongs to Unity rather than raw source-pixel scale:

- Background and FarBackground use full-frame cover with a small overscan margin.
- Midground and Foreground are bounded accents; they do not inherit full-frame dominance.
- Human, Robot, Fighter/Ship, Large/Capital and generic Actor classes use conservative semantic screen-size baselines.
- World-space VFX use smaller effect-type-aware baselines so Glow/MuzzleFlash do not become the focal object by accident.
- If several generated world actors all have the default zero spawn position, Unity spreads those defaults into deterministic lanes. Any non-zero authored position remains authoritative.
- Authored scale remains a modest multiplier near 1.0, not a workaround for PNG dimensions.

## Boundary
This is stabilization, not the future cinematic-feature system. Reusable Flyby, Formation, Pursuit, Reveal, Rescue, Dialogue and camera choreography belongs to V3 after visual evidence is reviewed.
