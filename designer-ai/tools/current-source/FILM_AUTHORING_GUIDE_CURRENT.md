# STARWARS_DELTA Film Authoring Guide CURRENT

This is the filmmaking layer for Designer AI / Devora authoring. It complements the atomic CURRENT Director, Catalog contract, Instruction Book and Simple Authoring rules. It does not replace exact IDs, compatibility or Unity validation.

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
- Effect -> visual effect/accent
- Ui -> interface/dialogue presentation where legal
- Animation -> exact compatible animation
- Audio -> exact Audio handle

A source/member ID appearing inside a projection does not inherit the projection's capability.

## 7. Cast identity, visible representation and animation

Cast is identity. Animation frames are not new people. Sprite frames are not Actor identities.

For world Actors these authoring concepts are separate and must stay separate:

```text
cast[].id
= logical Actor id used by actions/dialogue/continuity

cast[].identityHandle
= exact canonical/preferred CURRENT route=Actor authoring identity

visible[].handle
= exact visible representation handle for the shot

actions[].subject
= cast[].id

animationIntent / performanceIntent
= semantic request such as walk / look_up
```

Do not put a Sprite frame, Texture, portrait frame, animation frame or raw AnimationClip handle into `cast[].identityHandle` merely because it visually depicts the character.

A visual/frame record may belong to a canonical Actor family without becoming the Actor identity itself. The backend may canonicalize legacy visual handles for compatibility, but authoring must prefer the published canonical Actor handle.

Distinct named people require distinct canonical/preferred identities unless intentionally representing the same identity/clone.

Compatible real `AnimationClip` playback belongs to the native Animation Timeline path. Raw AnimationClip ids remain backend-only and must not be authored in Simple V1. Semantic/procedural movement such as flyby, orbit, formation and pursuit remains owned by the single procedural motion owner. Do not create a second transform owner merely to make a feature look more native.

For moving characters, combine compatible animation + movement when available. Move alone can slide a mannequin; animation alone can exercise heroically in place.

If CURRENT does not expose a legal canonical Actor identity for a required world character, do not infer one from filenames, folders, frame names, sprites or old JSON. Treat that world Actor as unavailable until CURRENT exposes it.

## 8. Frame-relative proportions

Use Simple V1 frame-relative composition fields when available: `screenX`, `screenY`, `screenWidthFraction`, `screenHeightFraction`, saliency and depth.

Do not use extreme raw Unity scale to compensate for wrong asset selection, source PNG dimensions, bad framing or missing background coverage.

The active camera/frustum is the cinematic scale reference. The editor Stage rectangle is not the truth for apparent on-screen size or travel distance.

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

FullFrame fitting is renderer-specific: each unique intended background renderer is fit against the overlapping camera states from a stable baseline. Repeated cross-product refitting and multiplicative scale drift are engine defects, not authoring techniques.

## 10. Semantic camera subject versus physical target

Camera subject is directing truth; physical Transform target is an execution detail.

Current rules:

- a `Hold` shot may preserve a semantic non-Actor composition subject with no physical world target;
- curated dialogue participants may be semantic/dialogue composition subjects without spawning WorldActors;
- Follow/Track and other genuinely target-dependent operations may physically bind an active legal WorldActor when the current Cinemachine representation supports it;
- when native Cinemachine owns the shot, do not generate a competing custom camera owner for the same interval;
- do not manufacture a physical target merely to satisfy a semantic subject.

Camera orbit is a separate 2D/2.5D parallax concept and must never invent unseen 3D geometry.

## 11. Dialogue is a closed-world presentation system

Dialogue identity comes only from matching `EMOTIONAL_DIALOGUE_CURRENT` / CharacterPack authoring-ready characters.

Dialogue-only participants use `DialoguePortrait` with `spawnWorldActor=false`.

Exact CharacterPack portrait/expression legality is authoritative. Generic Catalog metadata does not create or replace curated dialogue presentation.

Locked dialogue uses legal static/cut-based framing. Do not keep speaker/listener as simultaneous world actors inside the same locked portrait window unless CURRENT explicitly declares the presentation overlay-safe.

### Dialogue defaults

Background, frame and raw shot preset are backend presentation mechanics when deterministically derivable.

The backend should project those defaults before early validation where possible. Authors should not stuff low-level stage IDs into Simple V1 merely to silence warnings for values Preview already supplies deterministically.

### Dialogue may need world evidence

Do not default every speaking beat to portrait-only presentation. If the audience must still see a blockade, damaged ship, radar target, convoy or environmental threat, choose a legal radio/monitor/environment presentation that preserves the world evidence.

## 12. Actor motion: semantic authoring, viewport-proportional execution

Simple V1 authors semantic actor motion. The adapter lowers it into the existing V5 actor-action / Timeline path.

Semantic source intents may include flyby, approach, pursuit, intercept, escort, formation break, bank-away, landing, takeoff, escape and orbit.

The semantic word itself is not proof of a sophisticated solver. Author only what current execution can honestly represent.

### Camera-relative travel

Cinematic movement is composed against the active camera viewport/frustum, not a small arbitrary Stage rectangle.

Therefore:

- edge-to-edge flybys should traverse a meaningful fraction of the visible frame;
- a bottom-right -> top-left diagonal should remain a real diagonal across the frame even if camera size changes;
- formation members preserve distinct frame-relative X/Y offsets;
- curve/control-point amplitude scales with the visible frame;
- default Orbit radii are proportional to visible camera width/height rather than a tiny fixed world-unit radius.

Author the intent with legal screen position, entry/exit, direction, trajectory and semantic speed. Do not invent world-unit distances or movement-scale escape hatches.

### Orbit

`motionIntent = orbit` lowers to the current Actor Orbit owner.

Actor Orbit remains fixed-center while the matching runtime requires it. The center/target actor must remain stationary during the Orbit interval. A moving-center Orbit is not silently implied by the semantic name.

### Pursuit / Escort / Intercept

These are valid semantic concepts, but do not describe them as per-frame moving-target tracking unless an actual current runtime component implements that behavior.

## 13. Semantic speed and safe numeric parsing

Simple V1 speed vocabulary includes:

```text
slow
medium
fast
burst
```

These are semantic strings. They are not numeric Unity units per second and must not be used to determine how much of the screen a supposedly edge-to-edge path traverses.

Path geometry comes from composition intent; semantic speed controls pacing within that path.

## 14. Quantity: many means many, but one grouped image is already many

`visible[].count` is a real visual obligation.

Use either:

1. multiple instances of a true reusable single-entity visual;
2. one exact grouped/fleet/crowd asset whose inspected pixels already contain the required plurality;
3. an explicit gap/reframed composition.

Do not take a precomposed fleet image and then count-expand it as though it were one ship. That multiplies groups by groups and produces a glorious but incorrect interstellar traffic jam.

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

## 16. Projectiles, visible Effects and audio

### Cutscene projectiles are closed-world

Simple V1 projectile fire uses `type = fire` with the dedicated `projectileId` field. Unity owns launcher, muzzle attachment, movement and cadence mechanics.

Use only the exact projectile IDs exported by the matching CURRENT schema. Do not substitute gameplay projectile names, filenames, Catalog lookalikes, `effectHandle` or `viaHandle`.

A projectile burst does not automatically prove impact/destruction; author separate visible evidence when the story requires it.

### Visible Effects are real obligations

A legal route=`Effect` entry in `visible[]` requests beat-bounded audience visibility even when there is no explicit Effect action.

Do not add a meaningless `reveal` merely to wake up the backend.

Use an explicit supported Effect action only when the film needs explicit event semantics beyond ordinary beat visibility.

Three authored visible instances using the same exact Effect handle are still three distinct instances. Do not deduplicate them by handle.

The backend selects one correct Timeline owner according to resolved runtime form: native Activation where bounded visibility is sufficient, native Control where prefab/Particle/nested-director lifecycle is correctly owned by Timeline, or one existing custom visual/VFX clip where project-specific composition behavior truly requires it.

### Audio

Audio is first-class and non-visual. Exact legal Audio handles lower to the native audio execution path. Generated aliases such as `simple_audio_*` are not authoring identities.

A visual Effect does not automatically supply sound.

## 17. Binding-aware materialization coverage

A legal authored request is not complete merely because some clip was generated.

Candidate acceptance must verify:

```text
source obligation
-> exact CURRENT runtime identity
-> distinct generated instance
-> exact Timeline representation
-> valid binding / receiver
-> correct active interval
```

Wrong/missing bindings, shared instances, wrong assets, orphan clips and interval bleed are materialization failures.

Silent drop is forbidden. If authored Actors are dropped, the system should preserve the source request and diagnose identity/resolution loss explicitly rather than pretending the black Preview is exact success.

An engine-safe placeholder or visually empty/black Preview may be useful diagnostic evidence, but it is a degradation, not exact success.

## 18. Actor lifetime and location ownership

Old actors from a previous location must not leak into the next location. Dialogue-only cast must not spawn world actors. Effects/UI end with their owning interval unless deliberately transferred.

Location changes must visibly change location, not merely rename a field.

One capability has one execution owner for the same interval. Avoid duplicate native/custom execution of the same audio, camera, effect or transform behavior.

## 19. Validation colors and ownership

Normal user-facing states:

```text
GREEN  exact
YELLOW artistic/quality/continuity note
ORANGE technical repair/degradation; usable Preview continues or last valid Preview is preserved
RED    unrecoverable condition where no valid candidate/Preview can safely be produced or preserved
```

Owner is separate:

```text
AUTHORING
BACKEND
ENGINE
```

A legal exact CURRENT identity that later fails materialization is BACKEND/ENGINE-owned evidence, not permission to substitute identity.

Strict candidate acceptance does not mean destroying the user's previous film:

```text
BAD NEW CANDIDATE != DESTROY LAST GOOD PREVIEW
```

## 20. Accepted JSON freeze

Once authoring integrity is accepted, downstream BACKEND/ENGINE findings should normally be fixed against the same fixture rather than repeatedly rewriting legal source JSON.

The freeze does not protect newly discovered genuine representation conflicts. If runtime truly cannot represent the choreography, either change choreography deliberately or implement the missing capability.

## 21. CURRENT and publication discipline

Normal authoring uses only the matching public `open-current` atomic set. Compatibility is `requiredCurrent`; `publishTransactionId` is provenance.

Source guidance in Git may be prepared for the next publication, but generated `designer-ai/open-current/**` files must not be hand-edited to pretend a new CURRENT exists.

FULL Publish rebuilds heavy source truth when fingerprints changed. DELTA Publish updates lightweight authoring/guidance artifacts when `requiredCurrent` is unchanged and must not rebuild/re-upload the unchanged heavy base.

## 22. Film preflight before delivery

Before final JSON/delivery confirm at least:

1. requiredCurrent matches.
2. story reads coherently without IDs.
3. important visual choices were inspected as real CURRENT pixels.
4. every field uses the correct legal destination/handle.
5. every cast[].identityHandle is a canonical/preferred legal Actor identity, separate from visible representation.
6. every Actor action subject references cast[].id, and animation/performance intent remains semantic rather than raw AnimationClip identity.
7. cast identities and animation compatibility are exact.
8. dialogue participants/expressions are inside the closed-world repertoire.
9. backgrounds are real environments and fill the intended frame.
10. semantic depth and occlusion are intentional.
11. quantity/grouping matches the actual pixels.
12. every major non-verbal claim has serialized visible evidence.
13. semantic actor motion maps to current supported execution and uses frame-relative composition intent.
14. Actor Orbit centers obey current fixed-center limits where applicable.
15. every fire action uses an exact legal Cutscene projectileId.
16. every legal visible Effect is authored as a visual obligation without a fake activation workaround.
17. effects/projectiles/audio are legal and timed.
18. actor lifetime/location transitions are coherent.
19. expected genuine unrecoverable blockers = 0.

## 23. Pre-publish proof

Do not Publish because Unity merely compiled.

Before a user-controlled Publish, run representative fixtures through:

```text
compile
-> Validate
-> Build Editable Preview
-> binding-aware materialization coverage
-> inspect viewport-proportional horizontal/diagonal/orbit/formation motion
-> inspect FullFrame coverage/idempotence
-> inspect curated dialogue presentation
-> inspect projectile path
-> inspect generic visible Effect path with no secret activation action
-> verify last-good Preview preservation on a rejected candidate
```

Only then is Publish justified.

## 24. Learning cases

Historical BAD cases remain engineering evidence, not normal authoring truth. See `simple-authoring/LEARNING_CASES_POLICY.md`.

Durable lessons include:

- semantic intent can be lost after authoring if lowering/materialization coverage is not verified;
- Actor identity and visible representation are distinct; a frame/sprite record must not silently replace canonical cast identity;
- generated aliases are backend identities and must never be recommended back as source handles;
- valid visible Effects must not depend on ChatGPT remembering a secret activation action;
- a generated Timeline clip without the right binding/interval is not materialization success;
- Stage-sized motion can make valid choreography visually microscopic; camera viewport/frustum is the correct cinematic scale reference;
- FullFrame fitting must be exact-renderer/idempotent, not a layer x renderer cross-product;
- a bad new candidate must not erase the last valid Preview;
- raw Learning Cases must remain quarantined from normal NEW/REVISE/REPAIR authoring until separately curated and re-verified.

A repaired result becomes GOLDEN only after normal Unity Validate + representative Preview proves it.
