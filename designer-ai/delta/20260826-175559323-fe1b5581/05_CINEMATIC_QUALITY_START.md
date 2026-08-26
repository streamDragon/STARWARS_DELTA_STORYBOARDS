# STARWARS_DELTA CINEMATIC QUALITY START V1

## Purpose

This file is the mandatory directing contract for any ChatGPT instance authoring a STARWARS_DELTA
CUTSCENE_SCRIPT_V1 from this package.

The base CURRENT defines what exists and what is legal.
This cinematic overlay defines how to choose and stage the legal material so the result reads as a film,
not as a pile of individually valid sprites.

The overlay never expands capability. If this document asks for something the base schema/handles do not
support, the base CURRENT wins and the unsupported idea must be simplified.

## The proven visual target

The Unity proof included in this package established a much stronger baseline:

- full-frame photographic/painted location plates stay visually full-frame;
- one readable ship or one readable threat owns an action shot;
- actor motion, not random background movement, carries travel/action;
- dialogue is a dedicated Dialogue Stage composition, not portraits floating over unrelated world action;
- local VFX stay local;
- projectiles remain small, directional support evidence;
- the frame has a clear focal hierarchy;
- the sequence keeps one coherent world-style family.

Use `authoring/CUTSCENE_SCRIPT_V1_CINEMATIC_REFERENCE_PROVEN_V2.json` as the quality reference.
Use the normal canonical example only for schema shape.

## Non-negotiable directing rules

### 1. One beat = one shot idea

Every beat must be understandable as one sentence of visible cinema.

Good:
- establish Earth;
- hero ship flies through frame;
- enemy threat enters;
- cut to comms;
- hero closes distance;
- hero fires;
- impact;
- reaction;
- mothership reveal;
- escape;
- aftermath.

Bad:
- establish location + two portraits + a giant effect + three unrelated actors + tactical UI in one beat.

If a second visual idea is needed, cut to a new beat.

### 2. One primary focal subject

Default:
- maximum 1 primary focal subject;
- maximum 1 co-primary/support subject.

Background, UI, VFX and audio must support the focal idea instead of competing with it.

### 3. Full-frame location ownership

`locationHandle` is the environment plate for the beat.

For opaque photographic/painted full-frame locations:
- let the location own the complete frame;
- do not place the same or another full-frame location as a partial rectangular insert;
- do not use a location plate as an explosion/effect;
- do not author fake background motion to create camera movement;
- do not compensate for engine framing by manually inventing giant scale values.

Full-frame cover is engine-owned. The current local engine refits Simple V1 location plates after V3 camera
materialization.

### 4. Prefer the Cinematic Gold Set

Before choosing a direct visual handle, read:
`authoring/CINEMATIC_GOLD_SET_CURRENT.json`.

Default selection order:
1. GOLD
2. GOLD_STYLE_SPECIFIC when its style matches the sequence
3. GOLD_RESTRICTED only for its documented purpose
4. CONTEXTUAL only after explicit Atlas inspection and visual justification

Do not use `EXCLUDE_DEFAULT` as a normal creative choice.

`SUPPORT_ONLY`, `PARALLAX_ONLY` and `CONSEQUENCE_ONLY` must never silently become the primary hero subject.

### 5. Lock the world-style family

Choose one world-style family per sequence and keep it coherent.

A realistic-space plate should normally use ships/effects that read as the same visual world.
Do not randomly mix:
- realistic photographic space,
- flat test sprites,
- cartoon world art,
- vendor demo UI,
- sprite sheets,
- placeholder geometry.

Curated anime dialogue portraits are allowed in a dedicated Dialogue Stage, monitor or clean communication
cutaway. They do not redefine the world-style family.

### 6. Dialogue is a cut, not clutter

Major portrait dialogue and major world-action choreography should normally be adjacent beats, not
simultaneous primaries.

For normal dialogue:
- use the Emotional Dialogue closed world;
- give portraits a dedicated Dialogue Stage composition;
- prefer camera HOLD;
- keep the background visually quiet;
- after the line, cut back to world action.

Never place a raw portrait over a battle merely because both elements are legal.

### 7. Scale by shot meaning

Human world-actor screen-height guidance:
- extreme wide: 0.08–0.18
- wide: 0.12–0.28
- medium: 0.28–0.48
- close: 0.45–0.72

For ships:
- establishing/support ship: small enough to prove scale;
- hero flyby: clearly readable, usually larger than an establishing ship;
- threat reveal: large enough to register as the new idea;
- mothership reveal: may dominate the frame, but should remain a single readable silhouette.

Do not make a technically valid actor huge merely because no rule forbids it.

### 8. Preserve screen direction

For travel/action runs:
- establish a direction;
- preserve it through adjacent beats unless a reversal is a deliberate story event;
- leave negative space ahead of movement;
- enter from one edge and travel toward/through the opposite side when appropriate.

Avoid dead-center hovering when the story is travel, pursuit, escape or flyby.

### 9. Camera movement must have a reason

Camera is not decorative motion.

Default logic:
- Establishing: Hold or subtle motivated drift.
- Flyby: actor movement can carry the shot; camera may hold or track lightly.
- Threat reveal: Hold, subtle push or reveal move.
- Dialogue/reaction: Hold.
- Pursuit/attack: only move the camera if it improves readability.
- Aftermath: reduce motion.

Do not rotate/roll the camera unless the story explicitly needs disorientation or impact.
Do not use camera movement to compensate for poor actor blocking.

### 10. Current motion truth still applies

Pursuit/Escort/Intercept names do not guarantee per-frame target-relative tracking.
When readable relative motion matters, prefer a composition the current backend can guarantee:
- one moving subject + one stationary/readable target;
- or split locomotion phases into adjacent beats.

One primary locomotion phase per actor per beat remains the safe rule.

### 11. Effects stay in their lane

Local explosion/shield/impact:
- attach visually to the target/event area;
- remain support evidence;
- do not replace the whole location unless the authored effect is intentionally full-frame.

Full-frame overlays:
- fill the frame intentionally;
- are transitions/atmosphere, not fake local impacts.

### 12. Projectiles are directional support evidence

Use only the legal CURRENT Cutscene projectile IDs.

For fire:
- author `type=fire`;
- exact `projectileId`;
- explicit `count`;
- a visible source and target composition;
- keep the projectile burst readable instead of making it the primary image.

Projectile identity remains visual-only; add legal Audio separately when sound matters.

### 13. Audio is part of the shot

Use legal route=Audio handles deliberately:
- ambience/music for establishing/travel when useful;
- discrete SFX for fire/impact/explosion/alarm when available;
- keep dialogue clear.

Do not assume visual effects/projectiles supply sound.

## Shot grammar

Read `site-authoring/CINEMATIC_SHOT_GRAMMAR_CURRENT.json`.

Preferred shot vocabulary:
- ESTABLISH_LOCATION
- HERO_IN_ENVIRONMENT
- SHIP_FLYBY
- THREAT_REVEAL
- COMMAND_SCREEN_COMMUNICATION
- REACTION
- PURSUIT
- ATTACK_PASS
- IMPACT
- TACTICAL_INFO
- ESCAPE
- AFTERMATH

These are directing recipes, not schema enum values unless the base schema explicitly contains a matching
legal value. Expand the recipe into legal Simple V1 fields.

## Mandatory cinematic self-check

Before delivering JSON, verify:

1. Is every visual handle legal in AUTHORING_HANDLES?
2. Did I inspect the Atlas pixels for every important direct visual?
3. Did I prefer Gold over Contextual/Excluded material?
4. Does every beat communicate one shot idea?
5. Is there one clear primary focal subject?
6. Does the location own the full frame instead of appearing as a random rectangle?
7. Are portraits isolated in a deliberate Dialogue Stage/monitor composition?
8. Are world-style families coherent across adjacent beats?
9. Is actor scale appropriate for the framing?
10. Is motion direction readable and consistent?
11. Is camera movement motivated rather than automatic?
12. Are local effects local?
13. Are projectiles legal and readable?
14. Is audio authored explicitly where it materially helps?
15. Does every storyClaim have visible/audible evidence?
16. Does the final JSON still pass the base schema self-check in 01_CHATGPT_START.txt?

If any answer fails, revise before sending the JSON.

## Never solve backend problems by corrupting authoring

Do not:
- invent giant background scale values;
- invent hidden backend fields;
- duplicate the location as another layer;
- change legal projectile IDs to hide preview problems;
- turn dialogue portraits into WorldActors;
- add random camera motion to make a static composition feel "cinematic."

Author clean intent. The backend owns materialization.
