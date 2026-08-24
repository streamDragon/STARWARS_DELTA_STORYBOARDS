# STARWARS_DELTA V4 Cinematic Move Recipes

Source guidance for the NEXT authoring layer. This file is intentionally not a new runtime system and is not a public CURRENT until the normal Unity Publish flow republishes it.

## Principle

A recipe is a directing pattern that expands into existing `CUTSCENE_SCRIPT_V1` fields. The recipe name itself is never serialized into production JSON.

The runtime remains the existing V5 ActorAction / Timeline path.

Use recipes to make films less mechanical without pretending that semantic words are new engine capabilities.

## Hard runtime truth

- Actor Orbit v1 is fixed-center only.
- Moving-center Orbit is not implemented.
- Pursuit / Escort / Intercept are semantic choreography concepts; current runtime does not guarantee per-frame target-relative tracking.
- `slow`, `medium`, `fast`, `burst` are semantic speed labels.
- Count expansion is appropriate only for true reusable single-instance visuals, not precomposed fleet/group art.
- Prefer readable 2D screen motion, depth and timing over invented 3D geometry.

## Recipe families

### Pass / entrance

- `CROSSING_FLYBY`: Enter -> pass_camera -> Exit.
- `HERO_SWEEP`: Flyby -> pass_camera arc -> bank_away -> Exit.
- `SCREEN_CROSS_REVEAL`: foreground actor crosses frame to reveal a stationary subject behind it.

### Combat

- `ATTACK_RUN`: approach -> fire -> pass_camera -> bank_away.
- `BOOM_AND_BREAK`: attack/impact -> formation_break -> bank_away.
- `DOUBLE_INTERCEPT`: split formation -> intercept lane -> Hold.
- `FLANK_LEFT` / `FLANK_RIGHT`: formation break -> arc into side lane.

### Chase

- `PURSUIT_LANES`: staggered formation -> pursuit movement across depth lanes.
- `CHASE_THROUGH_FRAME`: target crosses first, pursuers follow in same screen direction.

### Formation

- `ESCORT_COLUMN`: escort formation -> convoy movement.
- `ESCORT_PEEL_OFF`: escort -> formation_break -> bank_away -> Exit.
- `FORMATION_SPREAD`: tight group -> formation_break -> readable Hold.
- `FORMATION_CONVERGE`: separated actors -> approach -> escort formation -> Hold.

### Retreat / survival

- `BANK_AND_EXIT`: bank_away -> Exit.
- `FORMATION_RETREAT`: formation_break -> escape -> Exit.
- `DAMAGED_WITHDRAWAL`: react -> brief Hold -> slow drift escape -> Exit.

### Launch / landing

- `TAKEOFF_ESCORT`: takeoff -> escort formation -> departure.
- `LAUNCH_WAVE`: staggered takeoff -> travel -> formation.
- `LANDING_APPROACH`: approach -> landing -> Hold.
- `LAND_THEN_GUARD_ORBIT`: landing completes -> stationary Hold -> guards Orbit.

### Orbit

- `STATIC_CENTER_ORBIT_REVEAL`: stationary center + support Orbit + camera reveal.
- `ORBIT_THEN_BREAK`: fixed-center Orbit -> formation_break -> bank_away.

### Rescue / convoy

- `RESCUE_PASS`: rescue_approach -> Hold -> escort -> escape.
- `CONVOY_ESCAPE`: escort -> convoy movement -> escape, with preserved screen direction.

### Reveal / release

- `THREAT_REVEAL_PASS`: stationary threat reveal while smaller craft cross for scale.
- `VICTORY_FLYBY`: clean pass -> formation break -> exit.
- `QUIET_DRIFT_OUT`: slow drift -> soft exit.

### Rhythm

- `HOLD_THEN_BURST`: anticipation Hold -> fast move/attack.
- `ARRIVE_SETTLE_HOLD`: arrival -> deceleration -> Hold.
- `CROSS_TRAFFIC`: independent motion lanes at different depths.

## Authoring rule

When choosing a recipe, expand it to the existing legal action vocabulary. Do not add a `recipeName` property to production JSON.

Example conceptually:

```text
ATTACK_RUN
-> move / approach
-> fire
-> move / pass_camera
-> move / bank_away
```

This gives ChatGPT / Debora a richer cinematic vocabulary while keeping Unity ignorant of recipe names, which is exactly where Unity is happiest.

## Selection guidance

Choose recipes based on dramatic function, not variety for its own sake:

- reveal scale: `THREAT_REVEAL_PASS`, `STATIC_CENTER_ORBIT_REVEAL`
- increase danger: `ATTACK_RUN`, `DOUBLE_INTERCEPT`, `PURSUIT_LANES`
- show organized force: `ESCORT_COLUMN`, `FORMATION_CONVERGE`
- show chaos: `BOOM_AND_BREAK`, `FORMATION_RETREAT`, `CROSS_TRAFFIC`
- show safety/release: `LANDING_APPROACH`, `VICTORY_FLYBY`, `QUIET_DRIFT_OUT`
- create anticipation: `HOLD_THEN_BURST`, `ARRIVE_SETTLE_HOLD`

Do not chain five recipes into every beat. One clear move with readable staging beats a choreography spreadsheet having a nervous breakdown.
