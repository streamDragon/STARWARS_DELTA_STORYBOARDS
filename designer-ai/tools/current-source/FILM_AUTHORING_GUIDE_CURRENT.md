# STARWARS_DELTA Film Authoring Guide CURRENT

This is the filmmaking layer for Devora / Designer AI authoring. It complements the canonical Simple V1 CURRENT surface. It does not create a second contract and it does not replace Unity runtime validation.

## Authority

Use only the matching CURRENT:

- Public CURRENT entrypoint: `/designer-ai/open-current/OPEN_CURRENT.json`
- Compact navigation first: `/designer-ai/open-current/CHATGPT_AUTHORING_INDEX.json`
- Inside a downloaded CURRENT bundle, the same manifest is named `OPEN_CURRENT.json`
- `simple-authoring/CUTSCENE_SCRIPT_V1.schema.json`
- `simple-authoring/AUTHORING_HANDLES.json` for exact legal handles
- `simple-authoring/AUTHORING_RULES_CURRENT.json`
- `simple-authoring/CINEMATIC_INTENT_QA_RULES.json`
- `EMOTIONAL_DIALOGUE_CURRENT.json` when dialogue is used
- direct `previewUrl` evidence on the matching CURRENT entry when present; Atlas page/slot is secondary browsing evidence

Unity/Plastic is canonical for runtime implementation and runtime proof. Git CURRENT is canonical for authoring/publishing guidance.

`CUTSCENE_SCRIPT_V1` is the only normal public authoring format. V3/V5, Timeline, Cinemachine wiring, generated IDs, bindings and test-runner details are backend implementation.

## Closed-enum lock

CHATGPT_AUTHORING_INDEX.schemaClosedEnums is generated directly from the exact matching CUTSCENE_SCRIPT_V1.schema.json.

For every field published there:
- copy one exact literal;
- never invent a synonym or "close enough" semantic label;
- never reuse a token from a different field merely because the English meaning feels similar;
- if a desired idea has no legal token, express it through storyClaim, actions, camera, visible composition, or another legal field rather than corrupting the enum.

This projection is publication data, not a second schema. The schema remains canonical; the projection exists so ChatGPT cannot conveniently forget what it just read.
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

Production authoring uses exact published asset handles and their actual preview pixels.

The default kit is a curated selection: CINEMATIC_MAIN, or Cutscene Ready before MAIN is configured. Animation frames remain technical dependencies. Request additional exact assets on demand. Optional Atlas/PDF exports are available only when the published entry supplies their URL. Saved movies are checked for the assets, actions and MOVES they actually use; old publication fingerprints alone do not invalidate them.

Do not redraw, restyle, invent an unseen angle, infer a missing object or select an asset because the filename sounds useful.

Metadata helps search. Pixels prove appearance.

For important visual choices preserve:

```text
OBSERVED PIXELS
-> direct previewUrl from the matching CURRENT entry when present
-> otherwise Atlas page/slot as secondary evidence; if no pixel evidence exists, appearance remains unverified
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
- cuts, push/pull, follow/track, pan/drift/shake and depth parallax when dramatically useful;
- Actor Orbit through legal actor motion intent when a fixed-center orbit is desired.

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
= canonical CURRENT persistent Actor identity. Required for identity-sensitive checks and dialogue.

cast[].materialHandle
= exact CURRENT movie-local visual material for a technically legal Sprite or direct simple SpriteSequence/Animation performer. It does not create persistent Actor identity and is not valid for dialogue participants.

visible[].handle
= visible representation

actions[].subject
= cast[].id

performanceIntent
= descriptive directing/performance request only; it never selects or guarantees an Animation clip

animationHandle
= exact CURRENT direct Animation material. This is the primary visible Sprite-animation selector. Choose it from directAnimationMaterials / ANIMATION_RETRIEVAL_INDEX using previewUrl and semanticFacets. Direct simple-Sprite materials do not require Actor ownership. Once explicitly selected for a cast subject, it remains that subject's active visible animation across later consecutive beats while the same subject remains visible, until another explicit animationHandle replaces it. For QA fixtures it is acceptable to repeat the same animationHandle on every visible beat to make the intended state obvious.

animationIntent
= legacy/secondary semantic selector. Omit it unless the matching CURRENT explicitly publishes a supported relationship for the exact use.
```

A Sprite frame, portrait, Texture or animation frame does not become Actor identity merely because it depicts the character.

Distinct named persistent/dialogue people require distinct identities unless intentionally the same identity/clone. Non-dialogue movie-local performers may instead use legal materialHandle values and are not limited to the published persistent Actor identities.

When several cast entries intentionally represent repeated instances/clones of the same canonical Actor Identity, declare one root cast member and connect every additional instance with `sameIdentityAs` to that root (or to a valid chain ending at that root). Never repeat one `identityHandle` across independent cast IDs without this ownership chain. If the characters are actually distinct, choose distinct CURRENT `identityHandle` values.

Example:

```json
{
  "id": "blob_1",
  "identityHandle": "<CURRENT_BLOB_IDENTITY_HANDLE>"
},
{
  "id": "blob_2",
  "identityHandle": "<CURRENT_BLOB_IDENTITY_HANDLE>",
  "sameIdentityAs": "blob_1"
},
{
  "id": "blob_3",
  "identityHandle": "<CURRENT_BLOB_IDENTITY_HANDLE>",
  "sameIdentityAs": "blob_1"
}
```

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

## 53 first-class cinematic moves

`moves[]` is the single directing vocabulary of CUTSCENE_SCRIPT_V1. It exposes exactly 53 legal move IDs from the matching CURRENT. There is no parallel editingMoves vocabulary and no hidden V4 recipe vocabulary.

Each move references consecutive `beatIds` in film order. The number of referenced beats must exactly match the published phase count for that move. Author the beats themselves with legal V1 camera, action, visible, lighting, dialogue, audio and effect fields so the named move is visibly realized.

The backend move profile publishes `requiredRoles` for every move. In the referenced beats, author each required participant as a `visible[]` entry with the exact matching `role` and a stable actor `id`. Repeat a role across distinct IDs when the move requires multiple participants; use `count` only when one visible entry intentionally represents multiple same-role instances. The importer rejects a tagged move when its required role count is missing. Role labels must describe the depicted participants, not scenery or a placeholder actor.

The 53 move IDs are first-class authoring data. V2 compiles and validates them; V3 owns Unity implementation details. Backend primitive names are not additional authoring moves.

### Precise paths

When exact screen geometry matters, use the matching schema's path fields such as `pathShape`, `pathPoints`, center/size/period/direction/easing where legal.

`pathPoints[]` is not shorthand. Every point is an object with numeric `x` and `y`, for example `{"x": 0.1, "y": 0.3}`. Array/tuple points such as `[0.1, 0.3]` or `[x,y]` are forbidden.

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

### Pan / Tilt-style reveal
Use `camera.movement=pan` with left/right/up/down. Up/down is the current 2D tilt-style route for revealing something above or below the established frame.

### Parallax
Use `camera.parallax` only with legal physical scenery layers. Distant layers move less than nearer layers; UI/Overlay and locked dialogue do not inherit scenery parallax.

### Camera Orbit
Camera Orbit is not a legal Simple V1 camera movement in this CURRENT. For a fixed-center object/ship orbit use actor `motionIntent=orbit`. A future camera-orbit implementation must not invent unseen 3D geometry or alternate views.

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

## Three independent film systems: MOVES / ANIME_EMOTION / DIALOGUE

MOVES are world animation, camera, actions, shooting and physical ship hit effects. DIALOGUE is spoken character interaction including its own expression system; do not change it for reaction inserts. ANIME_EMOTION is a third, independent full-frame anime directing layer. Treat it as a short emotional sequence, not a flash decoration: normal holds are about 3.5-5.5 seconds and impact/reaction shots are normally 2-3 seconds. It never pauses the Timeline or restarts an actor animation. Before authoring it, read `ANIME_DIRECTOR_CONTRACT.md` and direct in the order story beat -> emotion -> focus -> composition -> readable hold -> anime motion grammar -> visual QA. An ANIME_EMOTION cutaway can be silent, with zero dialogue lines. Do not use the legacy EMOTIONANIME ship-impact recoil system as a face insert. Do not invent `emotionalIntent`, `performanceDirection.emotionalIntent`, or a 54th MOVE; only `animeEmotion[]` is an explicitly supported new optional V1 field, provided it appears in the matching CURRENT schema.

Authoritative art folder (and ONLY art source for this system): `Assets/_Game/MY_Core/MY_Art/ANIME_EMOTION/STARWARS_DELTA_ANIME_EMOTIONS_V1/`. The art and Sprite slicing are owned by another agent: never alter their PNG files, texture importers, sprite rectangles or `.meta` files here. Each separately sliced face/expression is its own catalog entry; a PNG sheet's different expressions must NOT be played in sequence as animation frames. Select only an actual Sprite subasset, never a guessed sheet filename or a dialogue portrait. Its stable identity is Unity asset GUID plus sprite local file ID.

Editor preview setup: `STARWARS DELTA/Cinematics/ANIME_EMOTION/Open Library` lets a director select a generated cutscene root, a real sliced expression, and an exact start time/duration; `Show Catalog` lists the available entries. The visual layer is `MY_AnimeReactionCutaway`, independent of dialogue, MOVES, hit damage and authoring scene geometry. V1 source supports optional root `animeEmotion[]` in the matching updated schema only. Each item uses exact `characterId`, uppercase `expression`, `startSeconds`, optional `durationSeconds` (default 4s, legal 0.1..6s), optional `layout`, framing/zoom/angle/offset/background fields, and optional anime-only `motionStyle` + `motionAmount`. Layout is manifest-gated: BODY_ONLY/BODY_PLUS_SMALL_PORTRAIT require `safeToAssemble=true`; the current four V1 characters are portrait-only and HAND/TORSO are unavailable until safe modular art is published. Example: `{\"characterId\":\"ANIME_SPACE_PILOT_01\",\"expression\":\"SHOCKED\",\"framing\":\"CLOSE\",\"layout\":\"BODY_ONLY\",\"startSeconds\":4.1,\"durationSeconds\":4.2,\"motionStyle\":\"IMPACT_SHAKE\"}`. This is silent and does not require dialogue or change MOVES. Use exact names from the same published ANIME_EMOTION catalog; invented, missing, ambiguous or overlapping expressions are blocking errors. Unity maps the selected sprite to its stable GUID:localFileId before building the candidate. The layer is materialized before candidate validation. Do not call anime complete until actual rendered frames at start/middle/end of every insert pass visual QA.

## Dialogue

Dialogue is closed-world through `EMOTIONAL_DIALOGUE_CURRENT.json`.

- speaker/listener reference an existing local `cast[].id` exactly;
- resolve that cast entry first, then validate its canonical `identityHandle` against `EMOTIONAL_DIALOGUE_CURRENT.json`;
- `cast[].id` does not need to equal the published dialogue `actorId` or `identityHandle`;
- unknown or misspelled speaker/listener aliases are errors; never fuzzy-match or silently reinterpret them as direct identities;
- identityHandle matches the published dialogue identity;
- `expressionIntent` is opt-in, not a per-line default. Omit it for ordinary dialogue so the CharacterPack `defaultExpression` is used. Add it only for a deliberate visible acting beat, after resolving the local speaker to its exact authoringReady dialogue identity and confirming that the token appears literally in that character `supportedExpressions`; never auto-derive an expression from dialogue wording/mood/delivery, and if the desired expression is unavailable omit `expressionIntent` instead of substituting `Neutral`;
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

## Accepted fixtures and runtime QA

Once a legal authored fixture passes schema + CURRENT authoring integrity, backend/engine repair happens against that same fixture.

Do not rewrite legal beats, timing, camera intent, animation intent, projectile counts/types, targets, anchors or handles just to make broken Timeline/Preview code appear successful.

Regression fixtures and runner implementation are engineering-only evidence in Plastic, never authoring authority. Production code must never special-case fixture names, beat IDs, actor IDs or exact fixture timestamps.

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
