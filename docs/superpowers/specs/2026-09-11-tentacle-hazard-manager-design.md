# Tentacle / Hazard Manager — Design

Date: 2026-09-11
Project: STARWARS_DELTA
Status: Approved for implementation

## Goal

Create one reusable 2D hazard subsystem for GRADIUS / R-Type style organic and energy hazards. The authoring model is intentionally simple:

**Preset -> Spawn -> automatic shape, collision, damage, visuals, lifetime and cleanup.**

The first implementation must support hazards such as solar flames, wall tentacles, organic arms, growing vines and energy whips without creating separate bespoke gameplay systems for each one.

It must also support reusable environmental forces such as wind, fans, suction and vortices so hazards and their particles can react to the level without requiring a full rope-physics package.

## Design principles

1. Gameplay shape is authoritative; visual particles are presentation only.
2. The system uses Unity 6000.6-native 2D components and current package APIs.
3. SpriteShape/Spline provides the editable body/path when a curved growing body is needed.
4. EdgeCollider2D or PolygonCollider2D represents the dangerous gameplay volume.
5. Existing STARWARS_DELTA collision/damage logic remains the single owner of damage semantics. The new manager adapts into that path instead of duplicating shield/hull rules.
6. Particle collision may be used for visual contact behavior, but individual particles are not required to own gameplay damage.
7. Presets contain data. Runtime controllers contain behavior. Visual effects do not decide gameplay.
8. External forces are sampled through a small common interface. A spline does not know what a fan or vortex is.
9. The system must be usable both by level content and future procedural/cinematic authoring.
10. Do not add third-party rope/tentacle dependencies for milestone 1.

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
- force response profile
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
- Sample environmental forces when enabled.
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

External force influence is applied as an offset to sampled/control points. The shape driver asks for `Vector2 force = SampleForce(worldPosition)` and does not contain special cases for wind, fan, suction or vortex.

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

Particle Systems may enable External Forces and react to Unity `ParticleSystemForceField` components. The visual driver must not duplicate the custom shape-force solver; it should use Unity's particle force facilities where possible.

## Environment force fields

### MY_HazardForceField

Reusable level component representing an environmental force that can affect tentacle shapes and optionally other gameplay actors.

Initial modes:
- `Directional` — constant wind/current.
- `Fan` — directional force within a finite zone with configurable falloff.
- `Attract` — suction toward a point.
- `Repel` — radial push away from a point.
- `Vortex` — tangential rotation around a point, optionally combined with inward/outward force.
- `Pulse` — any of the above multiplied by a periodic curve.
- `Turbulence` — low-frequency deterministic noise added to a base force.

Core settings:
- force mode
- strength
- local direction
- radius/box extent
- falloff curve
- pulse frequency/curve
- turbulence frequency/amplitude
- influence mask
- affect tentacle shapes
- affect particles
- affect player/enemies/projectiles only when explicitly enabled

### MY_HazardForceFieldRegistry

Small runtime registry for active `MY_HazardForceField` instances.

Responsibilities:
- register/unregister enabled fields
- sample the summed force at a world point for a requested influence category
- perform cheap bounds rejection before detailed falloff math
- avoid per-frame allocation

Conceptual API:

`Vector2 SampleForce(Vector2 worldPosition, MY_HazardForceTarget target)`

The force registry does not move objects itself. Consumers decide how the sampled force affects their own state.

### Unity-native force integration

Use Unity-native systems where they are already a better fit:
- `ParticleSystemForceField` + Particle System External Forces for fire/smoke/sparks.
- `AreaEffector2D` for simple rectangular gameplay wind/current affecting Rigidbody2D objects.
- `PointEffector2D` for simple radial attraction/repulsion affecting Rigidbody2D objects.

`MY_HazardForceField` exists primarily to deform non-Rigidbody spline hazards and to provide one authoring vocabulary. When practical, an authoring component may configure a Unity native force component alongside the custom sampler rather than reimplement particle/Rigidbody physics.

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
- easy reaction to arcade-style wind/fans without full soft-body physics

### Physics tentacle

Optional later mode for hazards that must physically flop, wrap or collide with scenery.

Use Rigidbody2D/joint/segment physics as the physical skeleton and render a smooth SpriteShape over its points.

A third-party physics backend such as Obi may be evaluated only when a concrete gameplay requirement proves the shape backend insufficient. It is deliberately not required for the first FireStar/GRADIUS-style milestone.

## FireStar migration

FireStar should become a preset/consumer of this subsystem rather than remain a special collision-presentation system.

Target simplification:
- gameplay volume comes from the hazard shape/collider
- existing damage entry point handles player damage
- fire particles supply the animated flame surface and contact breakup
- redundant visual contact dedupe is removed if Unity particle collision already supplies the desired presentation
- reconstructed/fake contact normals are removed when real collision normals/intersections are available
- old FireStar-only components that become unused after migration are removed rather than kept as parallel owners
- wind/fan response is configured through the shared force-field layer, not FireStar-specific code

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
8. Wind-Bent Flame — Solar Flame plus Directional/Fan force response.
9. Vortex Tendril — curved hazard reacting to Vortex force.
10. Physics Chain — deferred/optional preset family, only after the non-physics system is proven.

## Authoring contract

A level-authoring caller should need only:
- preset
- spawn transform/origin
- direction
- optional overrides such as length, duration or target

A force-field author should need only:
- force preset/mode
- transform/zone
- strength and optional falloff/pulse overrides

All component setup must be automatic or validated by the prefab/preset.

Invalid presets should fail loudly in editor validation rather than generate half-working hazards at runtime.

## Performance

- Pool repeated hazard instances where spawning frequency makes it worthwhile.
- Keep spline control point counts low and intentional.
- Collider detail may be lower than visual detail.
- Rebuild collision only when shape changes require it.
- Avoid per-particle gameplay damage ownership for dense fire effects.
- Avoid allocating collision collections every frame.
- Force sampling must reject fields by bounds before evaluating curves/noise.
- Prefer deterministic low-frequency noise over expensive per-point physics.
- Use Unity-native effectors/particle force fields for Rigidbody2D/ParticleSystem consumers when possible.

## Testing

### EditMode

- Preset validation.
- Shape generation produces expected endpoints/bounds.
- lifecycle transitions are deterministic.
- damage adapter routes the contacted collider through the existing damage entry point.
- no duplicate damage owner is introduced.
- Directional/Fan/Attract/Repel/Vortex force samples have deterministic expected vectors.
- influence masks prevent unrelated systems from receiving force.

### PlayMode

- grow/hold/retract lifecycle.
- moving collider stays synchronized with visible body.
- player can visibly dodge under/around a Solar Flame preset.
- contact damages the correct target through existing shield/hull rules.
- repeated particle contacts do not suppress unrelated visual particle response.
- pooled instance resets fully before reuse.
- a Fan bends a spline hazard while matching fire particles move in the same general direction.
- disabling the Fan restores the hazard toward its base animated shape rather than leaving permanent deformation.

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

Force-field acceptance requires one captured sequence showing:
- identical Solar Flame with force field disabled;
- Fan enabled and the visible body bends;
- particles respond in the same general direction;
- gameplay collider remains aligned with the bent body.

## Non-goals for milestone 1

- Full rope/tentacle soft-body simulation.
- IK-based creature limbs.
- Per-particle damage ownership.
- A new shield/hull damage model.
- A generic replacement for every projectile in the game.
- Third-party rope/tentacle package dependency.
- Dozens of presets before the base behavior is proven.

## Definition of done

The subsystem is complete for milestone 1 when:
- one manager can spawn all initial non-physics presets;
- one existing damage pathway owns collision damage;
- FireStar runs on the new subsystem;
- at least one wall tentacle and one Solar Flame demonstrate grow/hold/retract behavior;
- one Fan/Directional field visibly bends a hazard and influences its particles;
- collider and visible body remain aligned during deformation;
- focused automated tests pass;
- visual verification confirms contact, dodgeability, force response and cleanup;
- obsolete FireStar-only collision/presentation code has been removed where it has no remaining owner.
