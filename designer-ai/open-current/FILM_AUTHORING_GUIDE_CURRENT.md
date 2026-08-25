# STARWARS_DELTA Film Authoring Guide CURRENT

This is the filmmaking layer for Designer AI / Debora authoring. It complements the atomic CURRENT Director, Catalog contract, Instruction Book and Simple Authoring rules. It does not replace exact IDs, compatibility or Unity validation.

## Core principle

A technically valid cutscene is not automatically a good or representative film.

Author in this order:

**Story -> CURRENT search -> real-pixel inspection -> exact-asset shot plan/storyboard -> semantic action and composition -> dialogue/VFX/audio -> film preflight -> JSON -> Unity Validate -> Editable Preview.**

The storyboard and JSON are one film expressed twice. They must not become independently invented versions.

## 1. Story first

Write the dramatic progression in plain language before building JSON. Define beginning state, change, ending state and what the audience should understand or feel.

Use variable shot duration according to dramatic purpose. Long duration creates a content obligation; it is not permission to clone static shots until the clock gives up.

## 2. Production storyboard means exact game assets

A STARWARS_DELTA production storyboard is not concept art.

Every visible principal object must come from matching CURRENT visual evidence and legal authoring identity. Use the real source pixels. Do not redraw, beautify, restyle, change view angle or synthesize a missing object.

AI-generated/redrawn art is CONCEPT / REFERENCE ART only and cannot predict Unity output.

If a requested visual does not exist, change the composition, choose another genuinely suitable exact CURRENT asset, or record an explicit gap.

## 3. Visual verification chain

Metadata is search evidence, not proof of appearance.

For important visual choices preserve:

```text
OBSERVED PIXELS
-> EXACT ATLAS PAGE/SLOT / visualReferenceId
-> EXACT DIRECTOR ENTRY
-> EXACT AUTHORING/CANONICAL RUNTIME ID
-> LEGAL DESTINATION/CAPABILITY
```

If the public Visual Atlas cannot actually be rendered, stop visually grounded production authoring and ask only for the single `STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_CURRENT.pdf`.

## 4. Build one coherent 2D visual world

STARWARS_DELTA is 2D. Do not force flat assets into fake 3D with arbitrary perspective rotation or invented viewpoints.

Use cuts, close/medium/wide variation, real foreground/midground/background depth, screen direction, parallax, reaction shots, monitor communication and side-view action when the actual assets support it.

Camera motion needs a purpose. If the purpose is unclear, Hold is better than movement performed mainly to prove that code exists.

## 5. Search CURRENT broadly

Do not repeatedly reuse one familiar ship or background because its handle is easy to remember. Search CURRENT and inspect multiple legal candidates.

Names/tags are search prompts, never permission. Exact route/capability and actual pixels decide.

## 6. Recommendation and route legality

Normal creative selection requires `recommendationStatus = RECOMMENDABLE` unless the user deliberately chooses otherwise with explicit evidence.

Destination capability beats visual resemblance:

- Actor -> world/cast identity
- Layer -> environment/scenery
- Effect -> effect
- Ui -> interface/dialogue presentation where legal
- Animation -> exact compatible animation
- Audio -> exact Audio handle

A source/member ID appearing inside a projection does not inherit the projection's capability.

## 7. Cast identity and animation

Cast is identity. Animation frames are not new people.

Distinct named people require distinct canonical/preferred identities unless intentionally representing the same identity/clone.

`PlayAnimation` is legal only when the exact animation ID is compatible with the exact Actor.

For moving characters, combine compatible animation + movement when available. Move alone can slide a mannequin; animation alone can exercise heroically in place.

## 8. System-managed proportions

When `systemManagedProportions=true`, authored scale stays near semantic baseline, normally 1.0. Do not use extreme scale to compensate for wrong asset selection, source PNG dimensions, bad framing or missing background coverage.

## 9. Backgrounds and depth

Background/FarBackground art must actually function as the intended environment.

A useful visual stack is:

```text
FarBackground
-> Background
-> distant world actors
-> principal world actors
-> foreground actors/effects
-> Foreground
-> dialogue portraits/frame/text
-> overlays
```

A Timeline that plays with postage-stamp backgrounds, black borders or unreadable principal subjects is still a failed movie.

## 10. Semantic camera subject versus physical target

Camera subject is directing truth; physical Transform target is an execution detail.

Current proven rules:

- a `Hold` shot may preserve a semantic non-Actor composition subject with no physical world target;
- curated dialogue participants may be semantic/dialogue composition subjects without spawning WorldActors;
- Follow/Track and other genuinely target-dependent camera operations retain their runtime target requirements;
- do not manufacture a physical target only to have a later normalizer remove it.

Camera orbit is a separate 2D/2.5D parallax concept and must never invent unseen 3D geometry.

## 11. Dialogue is a closed-world presentation system

Dialogue identity comes only from matching `EMOTIONAL_DIALOGUE_CURRENT` / CharacterPack authoring-ready characters.

Dialogue-only participants use `DialoguePortrait` with `spawnWorldActor=false`.

Exact CharacterPack portrait/expression legality is authoritative. Generic Catalog `closeUpSuitable` metadata does not create or replace curated dialogue presentation.

Unsupported explicit expression remains a blocker.

Locked dialogue uses legal static/cut-based framing. Do not keep speaker/listener as simultaneous world actors inside the same locked portrait window.

### Dialogue defaults

Background, frame and raw shot preset are backend presentation mechanics when deterministically derivable.

The backend should project those defaults before early validation where possible. Authors should not stuff low-level stage IDs into Simple V1 merely to silence warnings for values Preview already supplies deterministically.

### Dialogue may need world evidence

Do not default every speaking beat to portrait-only presentation. If the audience must still see a blockade, damaged ship, radar target, convoy or environmental threat, choose a legal radio/monitor/environment presentation that preserves the world evidence.

## 12. Actor motion: semantic authoring, existing V5 execution

Simple V1 authors semantic actor motion. The adapter lowers it into the existing V5 `actorActions` / Timeline path.

Current supported execution forms include:

```text
Move
Enter
Exit
Formation
Hold
Orbit
VisualWeaponAction
Deactivate
```

Semantic source intents may include flyby, approach, pursuit, intercept, escort, formation break, bank-away, landing, takeoff, escape and orbit.

The semantic word itself is not proof of a sophisticated runtime solver. Author only what current execution can honestly represent.

### Orbit

`motionIntent = orbit` lowers to a real V5 Actor `Orbit`, not generic Move.

**Current Actor Orbit v1 is fixed-center.** The Timeline writer samples a static ellipse and does not follow a moving target Transform every frame.

Therefore an actor cannot currently Orbit another actor while that center actor is simultaneously moving. `CUTSCENE_ORBIT_CENTER_MOVES` is a real RED blocker.

Legal choreography today:

- hold the Orbit center stationary during the Orbit interval;
- finish the center's landing/approach/movement before Orbit begins;
- move the center after Orbit ends;
- or use another supported composition.

Do not claim older V4 moving-center Orbit exists; current project trace found no such runtime implementation to reuse.

### Pursuit / Escort / Intercept

These are valid semantic concepts, but do not describe them as per-frame moving-target tracking unless an actual runtime component implements that behavior. Current trace found no older target-relative V4 runtime for Pursuit/Escort/Intercept that can simply be reconnected.

## 13. Semantic speed and safe numeric parsing

Simple V1 speed vocabulary includes:

```text
slow
medium
fast
burst
```

These are semantic strings. They must be resolved through the adapter's deterministic speed mapping, never parsed directly as floats.

Other numeric motion fields must be read tolerantly. Bad input should become validation/default behavior, not an uncaught `FormatException` that makes Studio Validate appear dead.

## 14. Quantity: many means many, but one grouped image is already many

`visible[].count` is a real visual obligation.

Use either:

1. multiple instances of a true reusable single-actor visual;
2. one exact grouped/fleet/crowd asset whose inspected pixels already contain the required plurality;
3. an explicit gap/reframed composition.

Do not take a precomposed fleet image and then `count`-expand it as though it were one ship. That multiplies groups by groups and produces a glorious but incorrect interstellar traffic jam.

Count-expanded semantic instances inherit the same source identity/route and should receive deterministic source actions.

## 15. Story claims require visible proof

Every major non-verbal story claim must map to serialized visible evidence:

```text
STORY CLAIM
-> VISIBLE ELEMENTS
-> START STATE
-> ACTION / CHANGE
-> CONSEQUENCE
-> FINAL STATE
```

Dialogue saying that an explosion happened does not visually implement an explosion. A sequence named `FLEET_ARRIVES` does not make one stationary ship a fleet arrival.

## 16. Projectiles, impacts, VFX and audio

### Cutscene projectiles are a closed-world visual system

Simple V1 projectile fire uses `type = fire` with the dedicated `projectileId` field. The author chooses what is fired; Unity owns the launcher, muzzle attachment, muzzle position/rotation, projectile movement and backend cadence mechanics.

The prepared Cutscene V1 projectile repertoire is exactly:

```text
CS_PROJECTILE_BLUE_BOLT
CS_PROJECTILE_PURPLE_BOLT
CS_PROJECTILE_POWERBALL
```

Use the matching CURRENT export as final authority. Do not invent aliases such as `laser`, `rocket`, `axe`, `missile`, `blue` or `power_ball`.

Visual intent:

- `CS_PROJECTILE_BLUE_BOLT` -> small/fast blue energy bolt; good for fighter fire and rapid friendly-looking bursts.
- `CS_PROJECTILE_PURPLE_BOLT` -> purple energy bolt; good for hostile/alien fire or visually distinct opposing fire.
- `CS_PROJECTILE_POWERBALL` -> larger animated energy projectile; good for heavy, threatening or boss-style fire.

These are Cutscene-only visual projectiles. Do not resolve or substitute gameplay weapon/projectile prefabs, Playniax projectile names, filenames, Catalog lookalikes, `effectHandle`, or `viaHandle`.

An explicit unsupported projectile ID is a blocker:

```text
CUTSCENE_PROJECTILE_NOT_AUTHORING_READY
```

`count` maps to the launcher burst count. Simple V1 does not author local muzzle coordinates or rotation. Simple V1 also does not author `interval` unless a future matching CURRENT schema explicitly exposes a cadence field. The exact cadence/default remains Unity/backend-owned and should not be duplicated in author-facing guidance.

`target` is cinematic firing intent used by the Cutscene backend for staging/orientation where supported. It does not turn the visual projectile into gameplay homing/target logic.

### Projectile examples

Friendly blue burst:

```json
{
  "type": "fire",
  "subject": "hero",
  "target": "enemy",
  "projectileId": "CS_PROJECTILE_BLUE_BOLT",
  "count": 6
}
```

Hostile purple burst:

```json
{
  "type": "fire",
  "subject": "enemy",
  "target": "hero",
  "projectileId": "CS_PROJECTILE_PURPLE_BOLT",
  "count": 3
}
```

Heavy animated powerball:

```json
{
  "type": "fire",
  "subject": "boss",
  "target": "hero",
  "projectileId": "CS_PROJECTILE_POWERBALL",
  "count": 1
}
```

Do not author this:

```json
{
  "type": "fire",
  "subject": "hero",
  "effectHandle": "some_laser_sprite",
  "count": 5
}
```

`effectHandle` remains for Effect/impact authoring where legal. Projectile identity belongs only in `projectileId`.

Impacts/explosions remain separate visible evidence. A projectile burst does not automatically prove a target was hit or destroyed; author the impact/destruction evidence when the story requires it.

Effects need legal route, purpose, timing, depth and bounded lifetime.

Audio is first-class and non-visual. Do not count Audio as a Visual Atlas gap.

## 17. Actor lifetime and location ownership

Old actors from a previous location must not leak into the next location. Dialogue-only cast must not spawn world actors. Effects/UI end with their owning interval unless deliberately transferred.

Location changes must visibly change location, not merely rename a field.

## 18. Validation colors and ownership

Use the current four-state model:

```text
GREEN  exact
YELLOW deterministic backend repair/minor
ORANGE honest visible/engine degradation, Preview continues
RED    cannot safely produce, Preview blocked
```

Owner is separate:

```text
AUTHORING
BACKEND
ENGINE
```

A legal exact CURRENT identity that later fails Preview materialization is typically ENGINE ORANGE, not permission to substitute identity.

A genuine current runtime limit such as moving-center Actor Orbit is RED, not an inconvenience to downgrade away.

## 19. Accepted JSON freeze

Once authoring integrity is accepted, downstream BACKEND/ENGINE Yellow/Orange findings should normally be fixed against the same fixture rather than repeatedly rewriting legal source JSON.

The freeze does not protect newly discovered genuine RED representation conflicts. If the current runtime cannot represent the choreography, either change choreography deliberately or implement the missing capability.

## 20. CURRENT and publication discipline

Normal authoring uses only the matching public `open-current` atomic set. Compatibility is the five-field `requiredCurrent`; `publishTransactionId` is provenance.

Source guidance in Git may be prepared for the next publication, but generated `designer-ai/open-current/**` files must not be hand-edited to pretend a new CURRENT exists.

Unity Publish CURRENT is the truth freeze. Git/Pages mirror it.

## 21. Film preflight before delivery

Before final JSON/delivery confirm at least:

1. requiredCurrent matches.
2. story reads coherently without IDs.
3. important visual choices were inspected as real CURRENT pixels.
4. every field uses the correct legal destination/handle.
5. cast identities and animation compatibility are exact.
6. dialogue participants/expressions are inside the closed-world repertoire.
7. dialogue route preserves required world evidence.
8. backgrounds are real environments and fill the intended frame.
9. semantic depth and occlusion are intentional.
10. quantity/grouping matches the actual pixels.
11. every major non-verbal claim has serialized visible evidence.
12. semantic actor motion maps to current supported V5 execution.
13. Actor Orbit centers are stationary during Orbit under current Orbit v1.
14. every fire action uses an exact legal Cutscene `projectileId`; impacts/destruction are separately evidenced when required.
15. effects/projectiles/audio are legal and timed.
16. actor lifetime/location transitions are coherent.
17. expected genuine RED blockers = 0.

## 22. Pre-publish proof

Do not Publish because Unity merely compiled.

Before a user-controlled Publish, run a representative fixture through:

```text
compile
-> Validate
-> zero genuine RED
-> Build Editable Preview
-> inspect representative actor motion
-> inspect fixed-center Orbit
-> inspect landing/count expansion
-> inspect curated dialogue portraits/background/frame
-> inspect projectile fire path
-> inspect principal materialization
```

Only then is manual Publish justified.

## 23. Learning cases

Historical BAD cases remain useful evidence:

- Mars Cafe: visual-world mismatch, scale/background/materialization issues.
- Asteroid Wave / Mothership / Command Room: tiny backgrounds, clipped actors, occlusion, missing portraits/effects.
- generated exact-asset storyboard art: visually attractive but invalid as Unity evidence.
- distinct people collapsed to one canonical identity: names do not manufacture new persons.

Current additional learning:

- Simple actor motion can vanish if adapter action types are not mapped; verify generated `actorActions` rather than assuming semantic intent survived.
- a semantic speed string can crash Validate if read as float; adapter parsing is part of production reliability.
- an Orbit action reaching V5 can still be invalid when its center moves; reaching the right action type and satisfying runtime constraints are separate checks.
- a fleet sprite used as one actor and then count-expanded creates visually wrong multiplicative fleets even when quantity code itself works.
- projectile identity belongs in the closed Cutscene `projectileId` vocabulary; using an Effect handle or gameplay projectile route is not an equivalent representation.

A repaired result becomes GOLDEN only after normal Unity Validate + representative Preview proves it.
