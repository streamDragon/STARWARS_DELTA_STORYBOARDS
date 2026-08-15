# STARWARS_DELTA JSON Authoring Lessons CURRENT

This is the practical failure-prevention layer for ChatGPT / Designer AI Cutscene V5 authoring. Read it together with `FILM_AUTHORING_GUIDE_CURRENT.md`, the atomic CURRENT Director, the Catalog contract, and the Instruction Book.

The purpose is simple: make creative JSON that is not merely parseable, but reaches Editable Preview with **zero red blockers**, preserves the intended story, and gives Unity a legal materialization path for every important visual.

## 1. Red-blocker gate before delivery

Before returning final JSON, perform a blocker-oriented preflight. Yellow Preview review notes may be acceptable. Red blockers are not.

The final package should satisfy all of these before delivery:

1. JSON parses and schema validates.
2. CURRENT package identity is atomic: `catalogRevision`, `snapshotContentHash`, `contractRevision`, `schemaHash`, and current context/project bookkeeping are not mixed with an old publish.
3. Every technical ID is globally unique.
4. Every destination uses the legal primary use/capability: Actor -> cast/world actor, Layer -> background/layer, Ui -> dialogue/UI, Effect -> effect, Animation -> animation reference, Audio -> audio.
5. Every `cast[].visualAssetId` is a legal Actor identity, preferably the exported `preferredActorAssetId` when present.
6. Distinct named Person characters do not resolve to the same preferred Actor identity unless they intentionally represent the same narrative identity/clone.
7. `PlayAnimation` uses only an exact animation ID exported as compatible with that exact Actor identity.
8. Dialogue presentation has an identity-safe legal route for every required visible participant.
9. Any `ShowUi` asset is actually legal for `Cutscene.UI`; looking like a portrait or sharing a source texture is not enough.
10. `HideUi` targets a real preceding `ShowUi` event and temporary UI has a bounded lifetime.
11. Closed enums use exact contract spellings.
12. Shot/action/event timing stays inside its owner interval and the whole sequence/package duration remains coherent.
13. Locked dialogue does not contain world `actorActions`.
14. Required backgrounds/layers have a legal layer route and important world actors have a legal materialization route.
15. The expected result is zero real blockers. Do not knowingly hand the designer a package that depends on automatic repair to become valid.

## 2. Cast identity is not an animation frame

**Cast = identity. Animation/action frame != identity.**

If an Actor record exports `preferredActorAssetId`, use that exact preferred identity for `cast[].visualAssetId` unless the story explicitly requires another canonical identity state.

Do not use `Run`, `Hit`, `Death`, `Jump`, `Walk`, launch frames, or an arbitrary sprite sub-frame as the persistent cast identity merely because that frame visually matches the requested action.

Put motion in `animationAssetId`; put identity in `cast[].visualAssetId`.

The normalizer may be able to recover a bad frame into a preferred identity, but authoring should not deliberately create work for the normalizer.

## 3. Distinct people require distinct identities

A recurring hard failure is creating several differently named people from the same Actor family.

Bad pattern:

- `Launch Doctor Extra 01` -> Doctor 03 identity
- `Launch Doctor Extra 02` -> Doctor 03 identity
- `Launch Doctor Extra 03` -> Doctor 03 identity

Even if different sprite frames are supplied, normalization can resolve them to the same preferred Actor identity. The validator is correct to block this when the JSON claims they are different narrative people.

Rule:

> Distinct named Person cast members require distinct resolved preferred Actor identities unless the story intentionally says they are the same identity/clone.

For crowds/extras, do not manufacture six different names around one identity. Prefer a small number of distinct canonical people, or use an explicitly supported clone/crowd mechanism when the contract provides one. If CURRENT only proves three distinct doctor identities, three legal doctors are better than six blocked pseudo-people.

## 4. Crowd beats must still obey identity safety

A storyboard can say "many doctors run across the launch pad," but the JSON still has to represent that crowd legally.

Authoring order for a running crowd:

1. Choose distinct Actor identities first.
2. For each identity, find its exact compatible Run animation.
3. Use `PlayAnimation(Run)` for visual motion.
4. Use `Move` for world displacement.
5. Stagger start time, y-position, speed, or screen lane for readable crowd motion.
6. Keep people grounded in the environment. Do not replace a grounded crowd beat with floating portrait UI.

If there are not enough distinct legal identities, simplify the crowd rather than creating identity collisions.

## 5. Move and PlayAnimation are different responsibilities

`Move` changes world position. `PlayAnimation` changes the visual character animation.

A running person normally needs both:

- exact compatible `PlayAnimation(Run)`
- `Move(...)`

`Move` alone creates a sliding mannequin. `PlayAnimation` alone creates a runner going nowhere. Use both when the Catalog proves the animation compatibility.

If no verified Run exists, use `Move` without inventing a Run animation and keep Preview valid.

## 6. Destination capability beats visual resemblance

A picture that looks like UI is not automatically legal UI.

A previous 401-second test blocked because Commander portrait-like records were sent through `ShowUi`, but those exact records did not have the required `Cutscene.UI` capability.

Rule:

> Validate the exact destination capability, not the filename, source family, visual resemblance, or old use.

For `ShowUi`, use an exact Ui-primary / `Cutscene.UI`-legal record. If no identity-safe UI route exists, deliberately choose another legal presentation or explicitly author `SUBTITLE_ONLY` when that is the intended design. Do not borrow another person just to satisfy the field.

## 7. Dialogue presentation must be legal before it is pretty

For portrait/dialogue presets, choose the visual route before writing the line presentation.

For presets requiring fixed participant visuals:

- use exact same-identity compatible dialogue visuals, or
- use a compatible tuple that explicitly supports the exported built-in participant fallback.

Do not choose `FACE_TO_FACE_PORTRAITS` first and hope repair will discover portraits later.

Do not let repair create an internally contradictory package such as "portrait preset with no legal portraits." If the selected preset cannot be satisfied, choose another compatible tuple/preset before final JSON.

Do not silently borrow a portrait from another character because it looks plausible.

## 8. Dialogue visuals are not world actors

Portraits, heads, dialogue bodies, monitor faces, frames, and speech balloons are UI/presentation assets. They do not become world actors merely because the shot is a close-up.

A visual storyboard close-up does not automatically mean `ShowUi` over the existing world background.

If using a portrait on top of a launch pad would create a giant floating human head, that is a staging error even if the JSON is technically valid.

Translate storyboard intention into the appropriate runtime grammar:

- grounded action -> world Actor + camera/staging
- comms/monitor dialogue -> legal dialogue/UI presentation
- subtitle beat -> deliberate subtitle presentation

Do not confuse a storyboard annotation with a literal runtime layer.

## 9. Locked dialogue rules remain strict

If any line in a shot has `stage.lockStaging=true`:

- owning shot `actorActions` must be empty
- no Hold, Enter, Exit, Move, FreezePose, or PlayAnimation is used to keep participants static
- dialogue visuals are controlled by dialogue presentation fields
- camera remains Hold or supported cut-based Snap/presentation according to the contract

Put world action in a separate shot before or after the locked dialogue beat.

## 10. Layer-only objects do not become cast because they move

Do not put an asteroid, rock, debris plate, or other Layer-only record into `cast[]` merely because you want it to travel across the screen.

Use Layer `Move` / `Parallax` for scenery and debris when the record is Layer-primary.

Use actor actions only when CURRENT proves an Actor-primary movable identity with the required capabilities.

`entityKind`, name, and visual appearance do not override `cutscenePrimaryUse`.

## 11. Effects need a declared legal route

Some effects may be procedural built-ins and intentionally omit `assetId`. Other effects require exact Effect-primary assets.

Never leave this ambiguous in the final package.

For every effect:

- confirm whether the current contract defines it as procedural or asset-backed
- if asset-backed, use an exact Effect-primary record
- keep timing and lifetime bounded
- define target/anchor and dramatic depth when supported

Do not use a Ui-primary support sprite in an Effect field merely because it visually resembles a flash/vignette/speed-line texture.

## 12. CURRENT identity is more than catalogRevision

Do not decide two exports are equivalent because `catalogRevision` happens to match.

Treat the following as one atomic authoring identity:

- `publishTransactionId` when applicable
- `catalogRevision`
- `snapshotContentHash`
- `contractRevision`
- `schemaHash`
- current context/project identity when supplied

Old JSON is failure/migration evidence, not a source of current IDs or current contract behavior.

## 13. Prefer explicit valid authoring over automatic correction

IRONCLAD/repair is a safety net, not an authoring strategy.

Good repair behavior includes deterministic project binding, safe same-source replacement, legal lifetime derivation, and rejecting unsafe identity borrowing.

But final authoring should avoid known repair triggers when the canonical answer is already known.

Examples:

- use the Ui-primary record directly instead of relying on `AUTO REPLACED`
- use preferred Actor identity directly instead of a Run frame
- select a satisfiable dialogue tuple directly instead of waiting for dialogue downgrade

Automatic recovery is valuable for old/bad input. New ChatGPT output should aim to be canonical on first validation.

## 14. Yellow notes and red blockers are different

Preview-safe, not-human-reviewed records may generate yellow notes. That does not automatically make a useful Preview invalid.

But red blockers must be zero before Build Editable Preview.

Authoring should optimize in this order:

1. zero blockers
2. identity/capability correctness
3. storyboard fidelity and visual readability
4. reduce avoidable yellow warnings
5. publish certification later

Do not destroy a good creative composition merely to eliminate harmless metadata notes, but never dismiss a real blocker as warning noise.

## 15. Visual QA is part of JSON quality

A package can parse, validate, build, and still be a bad movie.

Compare generated Preview against the storyboard at several timestamps across the film.

RED visual failures include:

- essentially the same frame repeated through unrelated shots
- background/location not changing when storyboard changes location
- actor remaining centered while camera/staging instructions should change
- floating portrait over an action environment
- giant/clipped actor proportions
- principal actor hidden behind unintended occlusion
- requested portraits missing
- explosions pasted without a target/depth relationship
- old actors leaking into later locations

A Timeline that plays is not proof that V3/V2 cinematic realization succeeded.

When visual realization fails while JSON validation passes, save the result as runtime/materialization failure evidence instead of blindly rewriting asset IDs.

## 16. Storyboard-to-JSON fidelity pass

Before final JSON, compare each storyboard shot to the authored shot and answer:

- Same location?
- Same principal subjects?
- Same world-vs-UI interpretation?
- Same approximate framing?
- Same action direction?
- Same entrance/exit/lifetime?
- Same intended foreground/background relationship?
- Same dialogue mode?
- Same important VFX beat?

The JSON does not need to imitate annotation boxes from the storyboard. It must reproduce the cinematic intention using legal runtime grammar.

## 17. Technical ID discipline

All stable IDs must be globally unique across the complete package, including:

- `actionId`
- `transitionId`
- `eventId`
- `audioId`
- `lineId`
- layer/camera/effect/actor action IDs

Use scoped names such as:

`seq02_sh03_doc01_run_anim`

not generic IDs such as:

`move_1`

Do not reuse an ID merely because it occurs in another sequence.

## 18. Timing and ownership pass

Before delivery:

- sequence starts/durations fit the package duration
- shot intervals fit their sequence
- shot-local actions/events fit their shot
- temporary UI/VFX have bounded intervals
- sequence-owned content ends at sequence end unless explicitly handed off
- `HideUi` references the correct `ShowUi`
- no cleanup boilerplate is added merely to compensate for normal ownership rules

Timing bugs are easier to prevent in authoring than to diagnose after Timeline materialization.

## 19. Learning cases: preserve evidence, curate lessons

Raw failures are evidence, not automatic Instruction Book rules.

Keep occurrence identity precise enough that deduplication does not erase two separate failing dialogue lines or two separate JSON paths that share one error code.

Curate only recurring lessons into active authoring instructions. Keep old-contract cases labeled historical when their exact failure is no longer active.

A useful lesson records:

- source contract revision
- error code / visual failure class
- actual cause
- correct authoring rule
- whether the lesson is CURRENT, STILL_RELEVANT, or HISTORICAL/FIXED

## 20. No-error final checklist

Before returning a new Cutscene JSON, run this final mental/static checklist in order:

### Package
- CURRENT atomic identity matches.
- Schema/contract enums are exact.
- Required strings are present and valid.
- Technical IDs are globally unique.

### Assets
- Every exact ID exists in CURRENT.
- Every field uses the legal primary use/capability.
- Principal choices are RECOMMENDABLE and visually inspected when the task is visual.

### Cast
- Persistent cast identity is canonical/preferred, not an action frame.
- Distinct named Persons resolve to distinct identities.
- PresentationMode is intentional.
- System-managed scale stays near semantic baseline.

### Animation/action
- Exact animation is compatible with exact Actor.
- Running uses Run animation + Move when available.
- Layer-only objects are not smuggled into cast.

### Dialogue/UI
- Required participants have an identity-safe legal visual route.
- ShowUi uses legal UI records.
- Locked dialogue has no actorActions.
- World action is not replaced by accidental floating portrait UI.

### Effects/audio
- Effect route is legal and bounded.
- Audio uses exact Audio records.

### Timing
- Sequences, shots and actions stay inside owner intervals.
- UI/VFX lifetimes are bounded.

### Film
- Storyboard and runtime grammar agree shot by shot.
- Locations, camera intent, staging and actor visibility actually change where planned.
- Principal subjects remain readable.

### Delivery gate
- Expected REAL BLOCKERS = 0.
- Avoidable auto-repair triggers removed.
- Remaining warnings are understood and non-blocking.

If a known rule above fails, fix the JSON before delivering it. Do not make the designer discover a blocker that could have been caught from the same CURRENT evidence already available to ChatGPT.
