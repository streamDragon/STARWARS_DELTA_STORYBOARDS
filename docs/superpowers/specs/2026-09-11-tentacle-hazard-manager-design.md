# Tentacle / Hazard Manager — Design

Date: 2026-09-11
Project: STARWARS_DELTA
Status: Approved concept, design draft for implementation review

## Goal

Create one reusable 2D hazard subsystem for GRADIUS / R-Type style organic and energy hazards. The authoring model is intentionally simple:

**Preset -> Spawn -> automatic shape, collision, damage, visuals, lifetime and cleanup.**

The first implementation must support hazards such as solar flames, wall tentacles, organic arms, growing vines and energy whips without creating separate bespoke gameplay systems for each one.

## Design principles

1. Gameplay shape is authoritative; visual particles are presentation only.
2. The system uses Unity 6000.6-native 2D components and current package APIs.
3. SpriteShape/Spline provides the editable body/path when a curved growing body is needed.
4. EdgeCollider2D or PolygonCollider2D represents the dangerous gameplay volume.
5. Existing STARWARS_DELTA collision/damage logic remains the single owner of damage semantics. The new manager adapts into that path instead of duplicating shield/hull rules.
6. Particle collision may be used for visual contact behavior, but individual particles are not required to own gameplay damage.
7. Presets contain data. Runtime controllers contain behavior. Visual effects do not decide gameplay.
8. The system must be usable both by level content and future procedural/cinematic authoring.

## Runtime architecture

### MY_TentacleHazardManager

Single entry point for spawning and lifecycle management.

Responsibilities:
- Spawn a hazard from a preset.
- Apply position, direction and optional runtime overrides.
- Own pooling/reuse where appropriate.
- Return a runtime handle for stop/retract/despawn operations.
- Avoid embedding movement, damage or rendering details inside the manager.

Conceptual API:

`Spawn(preset, origin, direction, overrides)`

The caller should not need to manually create colliders, particle systems, spline points or damage relays.

### MY_TentacleHazardPreset

Data-only ScriptableObject describing one reusable hazard archetype.

Core fields:
- body mode
- length / max length
- width
- grow duration
- hold duration
- retract duration
- path deformation settings
- collision profile
- existing damage profile/reference
- visual profile
- particle profile
- warning/telegraph settings
- looping / one-shot policy

Presets provide named game-ready configurations such as:
- `GRADIUS_WALL_TENTACLE`
- `RTYPE_ORGANIC_ARM`
- `SOLAR_FLAME_SWEEP`
- `GROWING_VINE`
- `ENERGY_WHIP`
- `RETRACT_STRIKE`

Names are descriptive presets only; no external game assets or copyrighted content are required.

### MY_TentacleHazardInstance

Runtime owner for one spawned hazard.

Responsibilities:
- Execute lifecycle state.
- Drive body/path deformation.
- Keep collider synchronized with the gameplay shape.
- Start/stop visuals.
- Register/unregister with existing damage/collision path.
- Cleanly return to pool or destroy at the end.

Lifecycle:

`Telegraph -> Grow -> Hold/Attack -> Retract/Fade -> Despawn`

### MY_TentacleShapeDriver

Owns shape generation independently of visuals and damage.

Initial modes:
- Straight
- Arc
- Sine
- Segmented Bend
- Seek/Track target with bounded curvature
- Authored control points

The first implementation should prefer SpriteShape for curved 2D bodies because it can produce a smooth rendered body and synchronize a 2D collider. A simple collider-only path remains available for hazards that do not need a curved visible body.

Do not use a full physics tentacle unless a preset explicitly requires environmental physical interaction.

### MY_TentacleCollisionAdapter

Small adapter from the generated hazard collider into the existing STARWARS_DELTA damage system.

Rules:
- The collider actually contacted is authoritative.
- Do not duplicate Shield -> Hull routing.
- Do not infer a fake target root when the existing collision system already owns target resolution.
- Contact cooldown/damage cadence belongs to gameplay collision, not visual particle dedupe.

The adapter should reuse the same common damage entry point used by shots/lasers wherever possible.

### MY_TentacleVisualDriver

Presentation only.

May combine:
- SpriteShape body material/sprites
- Particle systems emitted along or around the path
- tip burst
- contact sparks/fire wisps
- warning glow
- dissolve/fade on retract

Particle collision can use Unity 2D collision for contact response such as dampening, bounce, lifetime loss and bursts. Particle collision is not required to be the damage authority.

## Two execution families

### Shape hazard

Recommended default for gameplay hazards.

Examples:
- solar flame tongue
- wall tentacle
- energy whip
- organic arm

The generated SpriteShape/collider defines where the hazard exists. Particles decorate it.

Advantages:
- stable hit detection
- cheap damage logic
- clear dodge volume
- deterministic behavior
- easy authoring

### Physics tentacle

Optional later mode for hazards that must physically flop, wrap or collide with scenery.

Use Rigidbody2D/joint/segment physics as the physical skeleton and render a smooth SpriteShape over its points.

This mode is deliberately not required for the first FireStar/GRADIUS-style milestone.

## FireStar migration

FireStar should become a preset/consumer of this subsystem rather than remain a special collision-presentation system.

Target simplification:
- gameplay volume comes from the hazard shape/collider
- existing damage entry point handles player damage
- fire particles supply the animated flame surface and contact breakup
- redundant visual contact dedupe is removed if Unity particle collision already supplies the desired presentation
- reconstructed/fake contact normals are removed when real collision normals/intersections are available
- old FireStar-only components that become unused after migration are removed rather than kept as parallel owners

This migration must preserve current proven damage behavior while simplifying the visual contact path.

## Preset behavior library — first milestone

The first milestone should ship a compact set of reusable configurations rather than dozens of narrowly different scripts:

1. Wall Grow — emerges from wall, holds, retracts.
2. Sweep — long body sweeps across a lane.
3. Whip — grows, bends rapidly, returns.
4. Sine Reach — oscillating long hazard similar to classic shoot-em-up organic obstacles.
5. Tracking Reach — slowly follows player with limited turning rate so it remains dodgeable.
6. Solar Flame — wide fire tongue grows from a source, remains dangerous, then burns out/retracts.
7. Pulsing Segment — body expands/contracts in thickness while remaining on one path.
8. Physics Chain — deferred/optional preset family, only after the non-physics system is proven.

## Authoring contract

A level-authoring caller should need only:

- preset
- spawn transform/origin
- direction
- optional overrides such as length, duration or target

All component setup must be automatic or validated by the prefab/preset.

Invalid presets should fail loudly in editor validation rather than generate half-working hazards at runtime.

## Performance

- Pool repeated hazard instances where spawning frequency makes it worthwhile.
- Keep spline control point counts low and intentional.
- Collider detail may be lower than visual detail.
- Rebuild collision only when shape changes require it.
- Avoid per-particle gameplay damage ownership for dense fire effects.
- Avoid allocating collision collections every frame.

## Testing

### EditMode

- Preset validation.
- Shape generation produces expected endpoints/bounds.
- lifecycle transitions are deterministic.
- damage adapter routes the contacted collider through the existing damage entry point.
- no duplicate damage owner is introduced.

### PlayMode

- grow/hold/retract lifecycle.
- moving collider stays synchronized with visible body.
- player can visibly dodge under/around a Solar Flame preset.
- contact damages the correct target through existing shield/hull rules.
- repeated particle contacts do not suppress unrelated visual particle response.
- pooled instance resets fully before reuse.

### Visual acceptance

For each initial preset capture three states:
- telegraph/start
- active collision shape
- payoff/retract

FireStar acceptance specifically requires visible proof that:
- the flame does not visually stream straight through the player as if no contact happened;
- the dangerous body matches the visible flame envelope closely enough to feel fair;
- the player can intentionally avoid the attack by moving out of that envelope;
- damage occurs only while actual contact exists.

## Non-goals for milestone 1

- Full rope/tentacle soft-body simulation.
- IK-based creature limbs.
- Per-particle damage ownership.
- A new shield/hull damage model.
- A generic replacement for every projectile in the game.
- Dozens of presets before the base behavior is proven.

## Definition of done

The subsystem is complete for milestone 1 when:

- one manager can spawn all initial non-physics presets;
- one existing damage pathway owns collision damage;
- FireStar runs on the new subsystem;
- at least one wall tentacle and one Solar Flame demonstrate grow/hold/retract behavior;
- collider and visible body remain aligned during deformation;
- focused automated tests pass;
- visual verification confirms contact, dodgeability and cleanup;
- obsolete FireStar-only collision/presentation code has been removed where it has no remaining owner.
