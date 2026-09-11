# Tentacle / Hazard Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans task-by-task.

**Goal:** Build a reusable Unity 6000.6 2D hazard/tentacle subsystem where one preset spawn creates shape, collider, visuals, damage integration, lifecycle, force-field response and cleanup, then migrate FireStar onto it.

**Architecture:** A pure shape sampler creates a centerline. The same points drive the visible body and an EdgeCollider2D with edgeRadius as the authoritative gameplay volume. A narrow bridge calls the existing STARWARS_DELTA damage owner. Particles remain presentation. A force registry provides wind/fan/suction/vortex deformation without full rope physics.

**Tech Stack:** Unity 6000.6.0f1, C#, Physics2D, optional existing SpriteShape package, Particle System External Forces / ParticleSystemForceField, existing damage system, Unity Test Framework.

**Spec:** `docs/superpowers/specs/2026-09-11-tentacle-hazard-manager-design.md`

## Global constraints
- No third-party rope/tentacle dependency for milestone 1.
- Existing collision/damage code remains sole Shield/Hull authority.
- The contacted Collider2D is authoritative.
- Particle Systems are presentation, not dense per-particle gameplay damage owners.
- Do not final check-in until compile, tests and visual QA pass.
- Remove old FireStar special-case code only after replacement is proven and all usages are searched.

## Task 1 — Audit existing integration
Search `Assets` and `Packages` for `FireStar`, `ShotCollisionDamage`, `CollisionDamage`, `TryReservePlayerDamage`, `OnParticleCollision`, Shield/Hull contact code. Inspect `Packages/manifest.json` and `ProjectSettings/ProjectVersion.txt`.

Create `Assets/_Game/MY_Core/MY_Scripts/HAGGAI_STUFF/Hazards/Tentacles/TENTACLE_INTEGRATION_MAP.md` recording:
- exact existing damage owner and method signature;
- FireStar scripts and prefab paths;
- current SpriteShape/Splines package versions or absence;
- existing EditMode and PlayMode test locations.

Do not edit production code until this map is concrete.

## Task 2 — Core types and preset
Create under `Assets/_Game/MY_Core/MY_Scripts/HAGGAI_STUFF/Hazards/Tentacles/Runtime/`:
- `MY_TentacleHazardTypes.cs`
- `MY_TentacleHazardPreset.cs`

Types:
- `MY_TentacleShapeMode`: Straight, Arc, Sine, SegmentedBend, Tracking, Authored.
- `MY_TentacleLifecycleState`: Telegraph, Grow, Hold, Retract, Despawned.
- `MY_HazardForceMode`: Directional, Fan, Attract, Repel, Vortex, Pulse, Turbulence.
- `[Flags] MY_HazardForceTarget`: Tentacle, Particles, Player, Enemy, Projectile.
- `MY_TentacleSpawnRequest`: preset, origin, direction, optional target, lengthScale.

Preset fields: maxLength, width, shapePointCount, telegraph/grow/hold/retract durations, arcHeight, sineAmplitude, sineCycles, trackingStrength, forceResponse, forceReturnStrength, forceDamping, maxForceOffset, contactDamageInterval, forceTargets, runtimePrefab, optional particlePrefab.

Add `Validate(out string error)` rejecting invalid dimensions, point count, durations and missing runtime prefab. Write EditMode tests first.

## Task 3 — Environment force fields
Create:
- `MY_HazardForceField.cs`
- `MY_HazardForceFieldRegistry.cs`

Public API:
`Vector2 Sample(Vector2 worldPoint, MY_HazardForceTarget target, float time)`
`Vector2 SampleForce(Vector2 worldPoint, MY_HazardForceTarget target, float time)`

Implement Directional, Fan with box bounds/falloff, Attract, Repel, Vortex, Pulse and deterministic Turbulence. Register fields on enable/disable in a static list. No FindObjectsOfType during gameplay and no per-frame allocations.

Write deterministic EditMode tests for force direction, falloff and influence masks.

## Task 4 — Shape sampler and deformation
Create:
- `MY_TentacleShapeSampler.cs`
- `MY_TentacleForceDeformer.cs`

Sampler API:
`Sample(preset, origin, direction, target, length01, time, Vector2[] output)`

Implement:
- Straight centerline;
- Arc using perpendicular parabolic offset;
- Sine using perpendicular sine offset;
- continuous segmented bend;
- bounded target tracking without moving the base point.

Force deformer keeps point 0 pinned. For other points: sample registry force, integrate velocity, apply damping, spring return and max offset. This is arcade deformation, not soft-body physics.

Write tests showing correct endpoints and that points return toward base shape when force disappears.

## Task 5 — Body and visuals
Create:
- `MY_TentacleBody2D.cs`
- `MY_TentacleVisualDriver.cs`

The body takes the same world points used by visuals, converts them to local space and updates one cached EdgeCollider2D point set. Set `edgeRadius = width * 0.5f`. Collider disabled in Telegraph/Despawned and enabled while active.

If SpriteShape is already installed and used, drive its spline from the same points. The explicit EdgeCollider2D remains damage authority. If SpriteShape is absent, do not install it blindly; use the project’s existing line/trail/body rendering and record the package gap.

Particles use External Forces / ParticleSystemForceField where possible. No custom per-particle C# solver.

## Task 6 — Lifecycle and manager
Create:
- `MY_TentacleHazardInstance.cs`
- `MY_TentacleHazardManager.cs`

Public API:
`MY_TentacleHazardInstance Spawn(in MY_TentacleSpawnRequest request)`
`void RetractNow()`

Lifecycle: Telegraph -> Grow -> Hold -> Retract -> Despawned.
Use explicit state and elapsed time, not coroutine chains. Each active frame: sample base points -> apply force deformation -> update body -> update visuals.

Add PlayMode tests for deterministic state order and collider enable/disable behavior.

## Task 7 — Existing damage integration
Create:
- `MY_ITentacleDamageBridge.cs`
- `MY_TentacleCollisionAdapter.cs`

Bridge contract:
`bool TryApplyDamage(Collider2D contactedCollider, GameObject source, Vector2 contactPoint, Vector2 contactNormal)`

The adapter passes the exact contacted collider. It must not resolve to root or reimplement Shield/Hull routing. Reuse the exact existing damage method discovered in Task 1. Damage cadence may be delegated to the existing owner; otherwise keep only minimal per-contact cooldown here. Never use damage dedupe to suppress particle visuals.

Run existing projectile damage tests plus new tentacle contact tests.

## Task 8 — Fan/wind integration
A force field may optionally configure Unity-native helpers:
- ParticleSystemForceField for particles;
- AreaEffector2D for directional Rigidbody2D gameplay wind;
- PointEffector2D for radial Rigidbody2D push/pull.

The custom force registry remains the deformation source for spline/body points. Build one test scene/prefab with a Solar Flame-style hazard crossing a Fan field. Verify numerically: body bends with fan on and returns toward base shape after fan off; particles move in the same general direction.

## Task 9 — Preset library
Create data presets, all using shared runtime code:
- `WALL_TENTACLE`
- `ORGANIC_ARM`
- `SOLAR_FLAME_SWEEP`
- `GROWING_VINE`
- `ENERGY_WHIP`
- `RETRACT_STRIKE`
- `WIND_BENT_FLAME`
- `VORTEX_TENDRIL`

Create `MY_TentacleHazardPresetEditor.cs` showing validation errors and a compact summary. Smoke-spawn each preset in PlayMode and ensure it reaches Despawned without exceptions.

## Task 10 — FireStar migration
Use the integration map to migrate the real FireStar prefab/scripts.

Target state:
- FireStar spawns/uses a hazard instance with the Solar Flame preset;
- gameplay volume is the shared EdgeCollider2D body;
- existing damage owner receives the exact contacted collider;
- fire particles provide animated surface/contact breakup;
- fake normal reconstruction and special visual dedupe are removed if no longer required;
- wind/fan response comes from the shared force layer.

Before deleting any old FireStar class, search all Assets for its exact class name. Delete only if truly unused after migration.

## Task 11 — Verification and final check-in
Required automated verification:
- all new EditMode tests;
- all new PlayMode tests;
- FireStar focused tests;
- existing shot/laser collision-damage tests affected by the bridge.

Required visual verification in real gameplay:
1. Solar Flame grows from source and can be intentionally dodged.
2. On contact, fire does not visually appear to pass through the ship unchanged.
3. Damage occurs only while gameplay-body contact exists.
4. Wall Tentacle shows Telegraph -> Grow -> Hold -> Retract with collider aligned to the body.
5. Fan bends both body and particles in the same general direction; disabling the fan shows recovery toward the base shape.

Only after compile + tests + visual evidence pass: review changed files for unrelated edits and perform the final project VCS check-in. Report changeset/check-in ID, exact pass counts, and visual evidence paths.

## Deferred milestone
Full rope/soft-body behavior, wrapping around scenery, joint chains and third-party physics backends are explicitly deferred until a real gameplay case proves deterministic shape deformation insufficient.
