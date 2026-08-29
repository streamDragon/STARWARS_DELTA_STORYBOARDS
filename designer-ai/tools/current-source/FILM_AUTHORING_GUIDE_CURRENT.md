# STARWARS_DELTA Film Authoring Guide CURRENT

This is the filmmaking layer for Devora / Designer AI authoring. It complements the canonical Simple V1 CURRENT surface. It does not create a second contract and it does not replace Unity runtime validation.

## Authority

Use only the matching CURRENT:

- `OPEN_CURRENT.json`
- `simple-authoring/CUTSCENE_SCRIPT_V1.schema.json`
- `simple-authoring/AUTHORING_HANDLES.json`
- `simple-authoring/AUTHORING_RULES_CURRENT.json`
- `simple-authoring/CINEMATIC_INTENT_QA_RULES.json`
- `EMOTIONAL_DIALOGUE_CURRENT.json` when dialogue is used
- exact Atlas page/slot evidence on direct visual handles

Unity/Plastic is canonical for runtime implementation and runtime proof. Git CURRENT is canonical for authoring/publishing guidance.

`CUTSCENE_SCRIPT_V1` is the only normal public authoring format. V3/V5, Timeline, Cinemachine wiring, generated IDs, bindings and Golden runner details are backend implementation.

## Core principle

A technically valid cutscene is not automatically a good film.

Author in this order:

**Story -> CURRENT search -> real-pixel inspection -> exact-asset shot plan -> semantic choreography -> dialogue/VFX/audio -> schema/current self-check -> Unity Validate -> Editable Preview.**

The storyboard and JSON are one film expressed twice. Do not let them become independently invented versions.

## Story first

Define:

- beginning state;
- visible change;
- ending state;
- what the audience should understand or feel.

Long duration creates a content obligation. It is not permission to leave a shot visually inert.

## Real assets, not concept art

Production authoring uses exact CURRENT assets and exact published pixels.

Do not redraw, restyle, invent an unseen angle, infer a missing object or select an asset because the filename sounds useful.

Metadata helps search. Pixels prove appearance.

For important visual choices preserve:

```text
OBSERVED PIXELS
-> exact Atlas page/slot or visualReferenceId
-> exact direct CURRENT handle
-> legal route/capability
```

## One coherent 2D / 2.5D world

STARWARS_DELTA is primarily 2D / 2.5D. Compose with:

- FarBackground / Background;
- world Actors;
- Effects / particles;
- Foreground;
- UI / dialogue presentation;
- clear screen direction and depth;
- cuts, push/pull, follow/track, drift/orbit/shake when dramatically useful.

Do not fake 3D viewpoints that the actual art cannot support.

## Route legality

Destination capability beats resemblance:

- Actor -> world/cast identity
- Layer -> environment/scenery
- Effect -> particles/VFX/visible accents
- Ui -> interface/dialogue presentation
- Audio -> sound

Raw Animation identities remain backend compatibility data. Simple V1 authors animation semantically.

Raw Catalog IDs are not normal authoring handles.

## Identity, visible representation and performance

Keep these separate:

```text
cast[].id
= logical story identity

cast[].identityHandle
= canonical CURRENT Actor identity

visible[].handle
= visible representation

actions[].subject
= cast[].id

animationIntent / performanceIntent
= semantic performance request
```

A Sprite frame, portrait, Texture or animation frame does not become Actor identity merely because it depicts the character.

Distinct named people require distinct identities unless intentionally the same identity/clone.

## Animation and movement

Animation and movement are independent and may run simultaneously.

A convincing moving character normally needs both when compatible animation exists:

- animation supplies body performance;
- actor motion supplies world/screen travel.

Compatible real AnimationClip playback is Unity-owned native Timeline behavior. Authors request it semantically.

Do not author raw Animation IDs or create a second transform owner to imitate animation.

## Actor choreography and timing

Use schema-legal motion intents and path fields only.

Simple V1 supports:

- `actions[].startOffset`
- `actions[].duration`

Use them for legal staggering and concurrency.

`actions[]` array order is never hidden sequencing.

Use adjacent beats for distinct semantic locomotion phases unless one precise continuous path intentionally represents the entire movement.

### Precise paths

When exact screen geometry matters, use the matching schema's path fields such as `pathShape`, `pathPoints`, center/size/period/direction/easing where legal.

Author frame-relative geometry, not arbitrary Unity world distances.

### Orbit and relative motion

Actor Orbit remains fixed-center while the current runtime capability requires it.

Pursuit/Escort/Intercept are semantic directing concepts. Do not promise per-frame moving-target tracking unless the runtime actually provides it.

## Frame-relative composition

Use normalized screen semantics such as:

- `screenX`, `screenY`
- `screenWidthFraction`, `screenHeightFraction`
- `enterFrom`, `exitTo`
- `travelDirection`
- camera framing/movement/subject/direction/intensity

The active camera/frustum is the composition truth. The editor Stage rectangle is not the cinematic scale reference.

Do not compensate for wrong assets or camera scale with extreme raw Unity scale values.

## Camera directing

Camera subject is semantic directing truth. Physical target binding is runtime implementation.

### Hold
Stable composition. No leaked motion from a previous shot.

### Push / Pull
Continuous within-shot framing change. A cut between static lens values is not Push/Pull.

### Follow / Track
When target-dependent runtime support exists, the camera must react to the authored legal subject through time. Merely activating a different CinemachineCamera is not enough.

### Drift
Visible 2D frame-relative displacement.

### Orbit
Visible 2D/2.5D movement around the authored subject, preserving direction. Do not invent unseen 3D geometry.

### Shake
Visible oscillation that returns to base.

### ImpactShake
Strong early impact, correction/decay, return to base.

### Quality rule
If strong camera motion is so subtle that a reviewer says "maybe it moved a little", it failed the film-quality gate.

## Backgrounds and coverage

Background/FarBackground art must actually cover the intended active camera composition.

A technically playing Timeline with postage-stamp scenery, black borders or unreadable focal subjects is still a failed movie.

FullFrame fitting is Unity-owned and should be renderer-specific and idempotent. Authors should not compensate with arbitrary scale hacks.

## Dialogue

Dialogue is closed-world through `EMOTIONAL_DIALOGUE_CURRENT.json`.

- speaker/listener are exact published actorIds matching cast[].id;
- identityHandle matches the published dialogue identity;
- expressionIntent is exact and case-sensitive;
- optional presentation may degrade only through legal deterministic system behavior;
- do not invent dialogue identity/expression from generic Catalog evidence.

Locked portrait dialogue should use stable legal coverage and avoid unsupported world locomotion/camera choreography in the same interval.

When the story requires environmental evidence during speech, use an appropriate supported radio/monitor/environment composition rather than hiding the world merely because portrait dialogue is convenient.

## Effects / particles

A legal route=`Effect` item in `visible[]` is already a visible obligation.

Do not add a meaningless `reveal`/`activate` action just to make the backend instantiate it.

Repeated identical Effect handles remain distinct authored instances.

Effect timing may use:

- `visible[].startOffsetSeconds`
- `visible[].durationSeconds`

when legal in the matching schema.

Projectile/impact semantics do not satisfy unrelated Effect obligations.

ParticleSystem/prefab lifecycle and Timeline Control/Activation ownership are Unity-owned implementation details.

## Projectiles / missiles

Cutscene projectile fire is closed-world.

Every `type=fire` action uses a schema-legal `projectileId` and authored `count`.

Do not substitute:

- Effect handles;
- filenames;
- gameplay projectile prefab names;
- fuzzy Catalog matches.

When authored, preserve target/anchor intent.

A convincing projectile sequence requires visible launch/travel and the intended impact/effect behavior. Marker count alone is not film proof.

A moving shooter must fire from its current moving origin, not a stale cached position.

## Audio

Use exact CURRENT Audio handles.

Visual Effects and projectiles do not automatically supply sound.

Repeated use of the same Audio handle is legal and remains separate authored occurrences.

## Quantity

`visible[].count` and projectile `count` are real audience-visible obligations.

Before count-expanding a visual, verify that the source image represents one reusable entity rather than an already grouped fleet/crowd composition.

Do not multiply a precomposed fleet as though it were one ship.

## Concurrency

Real films require overlap.

Legal examples include:

- moving actor + animation;
- animated bomber + Push;
- Doctor animation + Track;
- moving shooter + eight shots;
- two animated ships + Follow;
- two-way firefight + Shake;
- Push + a compatible perspective operation.

Do not serialize these merely to avoid ownership bugs. Instead keep one effective runtime owner per property/capability.

## Story claims require proof

Major non-verbal claims should map to visible/audible evidence:

```text
STORY CLAIM
-> visible/audible evidence
-> action/change
-> consequence/final state
```

A label or dialogue sentence does not implement an unseen event.

## Accepted fixtures and Golden QA

Once a legal authored fixture passes schema + CURRENT authoring integrity, backend/engine repair happens against that same fixture.

Do not rewrite legal beats, timing, camera intent, animation intent, projectile counts/types, targets, anchors or handles just to make broken Timeline/Preview code appear successful.

Golden regression fixtures and runner implementation live in Plastic. Production code must never special-case fixture names, beat IDs, actor IDs or exact fixture timestamps.

Runtime PASS requires actual Unity execution of the final saved/reopened Editable Preview. Compile-only success is not movie-quality proof.

## Final film-quality check

Before calling a movie exact success, verify:

1. important visual choices match inspected pixels;
2. world Actor identity and visible representation are not conflated;
3. animation visibly animates;
4. movement visibly travels;
5. strong camera moves are obvious;
6. projectiles visibly launch/travel in authored quantity;
7. Effects/particles visibly execute;
8. simultaneous operations genuinely overlap;
9. backgrounds cover the active camera;
10. no black frame, stale foreign Preview, lost binding or residual motion remains;
11. Save -> final Editable Preview -> reopen preserves behavior;
12. Unity actually ran before claiming runtime PASS.

The author writes the film. Unity performs the accounting and execution.
