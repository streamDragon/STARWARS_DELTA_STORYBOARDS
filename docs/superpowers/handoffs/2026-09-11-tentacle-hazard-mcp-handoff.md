# Tentacle Hazard MCP Handoff

Workspace: `C:\Users\nlpis\wkspaces\STARWARS_DELTA`
Unity: `6000.6.0f1`

Read and execute:
- `docs/superpowers/specs/2026-09-11-tentacle-hazard-manager-design.md`
- `docs/superpowers/plans/2026-09-11-tentacle-hazard-manager-implementation.md`

Use live Unity/MCP and the project source as authority. Start with the plan's audit task: locate the real FireStar code, the existing projectile collision/damage entry point, current package versions, and test assemblies before changing production code.

Build milestone 1 as a shared preset-driven 2D system: one spawn creates body/shape, collider, lifecycle, visuals, existing damage integration, cleanup, and optional environment force response. Support wind/fan, attract/repel, vortex, pulse and turbulence. Particles are presentation; the actual contacted Collider2D remains authoritative for gameplay damage through the existing project damage owner.

Required preset family: WALL_TENTACLE, ORGANIC_ARM, SOLAR_FLAME_SWEEP, GROWING_VINE, ENERGY_WHIP, RETRACT_STRIKE, WIND_BENT_FLAME, VORTEX_TENDRIL.

Migrate FireStar onto the shared system after the base is tested. Preserve useful existing art and particle assets. Remove old special-case code only when the replacement is proven and no required usages remain.

Completion requires: clean Unity compile, focused EditMode/PlayMode tests, existing affected projectile damage tests, and real visual verification of Solar Flame contact/dodge behavior, Wall Tentacle grow/hold/retract, and Fan/Wind bending body plus particles. After verification, use the project's normal final VCS workflow and report the resulting identifier, exact test pass counts, visual evidence paths, and changed production files.
