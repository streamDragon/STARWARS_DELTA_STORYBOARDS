# 032 - V2.7 visual safety after real five-minute QA

## Evidence

The five-minute current-contract QA run proved that V2.6 full-frame Background/FarBackground fitting materially improved location readability. Keep it.

The same QA still showed recurring risk from oversized ships/capital actors, oversized world VFX, actor overlap, and tactical UI competing with the intended focal action.

## V2.7 rule

- Keep Background/FarBackground full-frame fitting from V2.6.
- Ordinary ships/fighters use a slightly more conservative semantic baseline.
- Capital/fleet actors remain larger than fighters but normally stay below half-frame height unless the author explicitly overrides scale for a deliberate extreme shot.
- Glow/MuzzleFlash/Sparks/Dust are accents and receive a smaller baseline.
- Explosion/Impact/Energy effects may be larger, but remain bounded.
- Explicit authored placement remains authoritative. V2.7 only changes safe defaults and semantic baselines.

## Boundary with V3

V2.7 prevents obviously bad default sizing and hierarchy. It does not implement cinematic choreography such as Pursuit, Flyby, Formation, Intercept, Rescue Approach or Capital Ship Reveal. Those remain V3 feature work.
