# STARWARS_DELTA V5 Emotional Dialogue — Implementation Specification

Status: IMPLEMENTATION/HANDOFF DRAFT. This document is not an alternate Rule Registry, Contract or CURRENT authoring source. It becomes authoring truth only after the matching Unity/Plastic implementation is published through the normal CURRENT pipeline.

## Goal

Create one focused cinematic dialogue mode that behaves like a small 2D film scene:

- one curated dialogue location;
- one or two curated emotional dialogue characters;
- background and fixed staging;
- expression and pose changes;
- two-shot, speaker-focus and reaction coverage;
- optional monitor, alert and environmental presentation layers;
- dialogue text/UI;
- no gameplay/world-actor dependency.

This extends the existing V5 Dialogue Stage route. It must not create a second dialogue system, second materializer, second Catalog or second Timeline pipeline.

## Hard boundary: closed-world dialogue

Emotional Dialogue is a closed system.

Only characters explicitly registered in the curated Emotional Dialogue Library are legal `speakerActorId` / `listenerActorId` values for an Emotional Dialogue scene.

Normal gameplay/world Actors, ships, robots, civilians, effects, layers and arbitrary Catalog records are not eligible dialogue participants merely because they have a visible sprite.

A normal Actor is not auto-promoted into Emotional Dialogue.

There is no fuzzy matching, visual-similarity fallback, nearest-name lookup or Catalog-wide attempt to locate a substitute emotional face.

Conceptually:

```text
WORLD / GAMEPLAY ACTORS
    remain unchanged
    never acquire emotional-dialogue capability implicitly

EMOTIONAL DIALOGUE CHARACTERS
    explicit curated library only
    complete dialogue presentation packs
    legal participants in Emotional Dialogue Stage
```

## WorldActor is not part of this mode

An Emotional Dialogue character is a dialogue participant identity, not a requirement to create a WorldActor.

For this mode:

```text
spawnWorldActor = false
presentationMode = DialoguePortrait / EmotionalDialogue
```

must remain legal.

Do not fix presentation by:

- forcing `spawnWorldActor=true`;
- spawning invisible/dummy WorldActors;
- resolving a portrait through gameplay Actor instances;
- turning a portrait asset into an Actor identity;
- routing a normal Catalog Actor into the Emotional Dialogue Library automatically.

## Curated library

Unity should own one explicit library, proposed production type:

```text
MY_EmotionalDialogueLibrary
```

The library contains only two curated collections:

```text
Characters
Locations
```

No global Catalog scan is needed at runtime for participant selection.

### Characters

Each entry resolves one stable `actorId` to one character pack.

Proposed type:

```text
MY_EmotionalDialogueCharacterPack
```

Minimum data:

```text
actorId
displayName
visualMode
defaultExpression
expression map
optional pose map
optional gesture/body map
```

The first implemented visual mode is:

```text
FullPortrait
```

A future optional mode may be:

```text
Layered2D
```

Do not implement Layered2D in the first production slice.

### Golden character

The first pack is:

```text
FEMALE_COMMS_01
```

The existing named sprites are:

```text
CHR_FEMALE_COMMS_01_EXPR_Neutral
CHR_FEMALE_COMMS_01_EXPR_Listening
CHR_FEMALE_COMMS_01_EXPR_Concerned
CHR_FEMALE_COMMS_01_EXPR_Shocked
CHR_FEMALE_COMMS_01_EXPR_Urgent
CHR_FEMALE_COMMS_01_EXPR_ControlledGrief
CHR_FEMALE_COMMS_01_EXPR_Determined
CHR_FEMALE_COMMS_01_EXPR_Exhausted
CHR_FEMALE_COMMS_01_EXPR_Relieved
CHR_FEMALE_COMMS_01_EXPR_Defiant
```

Expression resolution is deterministic:

```text
actorId + expression
-> exact CharacterPack
-> exact registered Sprite
```

Do not resolve expressions by searching filenames during playback.

### Character-pack content convention

Curated production character art is stored under:

```text
Assets/_Game/MY_Core/MY_Art/CharacterSpriteSheets_6x5/<CHARACTER_ID>/
```

Expected content can include:

```text
MASTER/
INDIVIDUAL/
MANIFEST.json
```

The content-generation workflow may produce 6x5 master sheets and individual PNGs, but Unity runtime should consume the registered character pack rather than infer identity from arbitrary files.

## Curated dialogue locations

Proposed production type:

```text
MY_EmotionalDialogueLocationPack
```

A location is a small pre-authored cinematic set, not merely a background PNG.

Minimum location data:

```text
locationId
background visual
left participant slot
right participant slot
dialogue safe area
monitor slot (optional)
supportsMonitor
supportsRedAlert
framing/layout defaults
```

Initial example:

```text
RADAR_ROOM
```

Other future curated locations may include:

```text
COMMAND_BRIDGE
MEDICAL_BAY
PILOT_COCKPIT
MARS_COMMAND
EARTH_BUNKER
```

The location owns its deterministic layout. Normal authoring should not specify arbitrary Unity world coordinates for the portraits.

## Stage composition

An Emotional Dialogue Stage has fixed conceptual layers:

```text
BACKGROUND
OPTIONAL ENVIRONMENT / MONITOR / ALERT / FX
LEFT CHARACTER
RIGHT CHARACTER
DIALOGUE UI
```

Only LEFT CHARACTER and RIGHT CHARACTER are dialogue participants.

Monitor images, red alert, radar, warning overlays, sparks, smoke and similar content are visual presentation layers. They are never speaker/listener identities.

## Existing V5 data to reuse

The existing V5 dialogue route already has the important semantic vocabulary and should be reused rather than replaced:

```text
speakerActorId
listenerActorId
speakerExpression
listenerExpression
stage.layout
stage.speakerSlot
stage.listenerSlot
stage.backgroundAssetId
performance.speakerPose
performance.listenerPose
cameraCue.shotPreset
cameraCue.transition
reaction.actorId
reaction.expression
reaction.shotPreset
```

The implementation should add only the minimum identification required for the closed curated mode, for example:

```text
presentationPreset = EMOTIONAL_DIALOGUE
stage.locationId = RADAR_ROOM
```

Exact field names remain owned by the Unity Contract/Rule Registry implementation. Do not create a parallel JSON format solely for this feature.

## Presentation presets and cinematic grammar

Reuse existing V5 dialogue framing vocabulary where it already exists.

Required first-slice coverage:

```text
TWO_SHOT
speaker focus / portrait close coverage
REACTION_CLOSE_UP
```

Do not author raw transform coordinates when an existing layout/framing preset can express the shot.

The film effect should come from editorial changes between stable 2D compositions:

```text
two-shot
-> speaker focus
-> listener reaction
-> two-shot
```

rather than arbitrary camera motion over flat portraits.

## Expression switching

During playback, the Presenter resolves each requested expression through the participant's CharacterPack.

Example:

```text
speakerActorId = FEMALE_COMMS_01
speakerExpression = Concerned

FEMALE_COMMS_01
-> CharacterPack
-> Concerned
-> CHR_FEMALE_COMMS_01_EXPR_Concerned
-> visible portrait slot
```

Expression transition defaults may use a short crossfade where supported. Impact states such as Shocked/Urgent may use a hard visual change when the existing shot/transition vocabulary requests it.

Do not create one Timeline track per expression. Keep stable participant presentation lanes and change state within the existing dialogue presentation route.

## Pose/body states

Character packs may later expose curated pose/body states such as:

```text
SpeakingCalm
SpeakingFirm
Commanding
Reassuring
Warning
Thinking
Pointing
HandRaised
ArmsCrossed
ConsoleWork
BracingAlert
Vulnerable
```

In the first slice, pose support is optional. Expression switching through the Golden Character is the acceptance gate.

Layered head/body/hand compositing is explicitly deferred until FullPortrait works end-to-end.

## Environmental presentation

Optional scene presentation can include:

```text
RED_ALERT_ON / OFF
MONITOR_SHOW_*
MONITOR_STATIC
LIGHT_FLICKER
SPARKS / SMOKE
```

These should reuse existing legal Layer/Effect/UI presentation routes where possible.

They must never be registered as Emotional Dialogue participants.

## Validation policy

Once this feature is implemented and owned by CURRENT, the intended validation semantics are:

```text
Emotional Dialogue participant not registered in curated library
-> RED

Emotional Dialogue location not registered
-> RED

normal WorldActor used as Emotional Dialogue participant
-> RED

known curated character requests unsupported expression
-> YELLOW
-> Neutral or previous valid expression

optional monitor/effect unavailable
-> YELLOW when the story remains valid
```

A valid `speakerActorId` / `listenerActorId` becoming `unknown actor` in the runtime Presenter is a binding defect, not a valid fallback.

## Authoring surface policy

Do not expose Emotional Dialogue choices to Debora/ChatGPT until Unity publishes the matching capability through normal CURRENT.

When published, ordinary authoring should expose a small curated projection only:

```text
AVAILABLE EMOTIONAL DIALOGUE CHARACTERS
- actorId
- displayName
- supported expressions
- supported poses

AVAILABLE EMOTIONAL DIALOGUE LOCATIONS
- locationId
- supported monitor/alert/environment options
- supported framing/layout options
```

Do not expose the entire Actor Catalog as candidate participants for this mode.

## Catalog/publisher projection

The Catalog/Director may expose the curated capability for discovery, but the curated library remains authoritative for Emotional Dialogue eligibility.

Suggested projection concepts:

```text
capability: EmotionalDialogue
emotionalDialogueActorId
supportedExpressions
supportedPoses
```

The publisher should project only the explicitly curated set, not infer it from sprite naming patterns.

## Browser preview

The web preview should eventually render the same semantic composition:

```text
location background
left curated participant
right curated participant
expression state
framing preset
optional monitor/alert layer
dialogue text
```

Browser preview remains representational. Unity remains authoritative for runtime materialization and validation.

## First production slice

Implement only:

1. `MY_EmotionalDialogueLibrary`.
2. `MY_EmotionalDialogueCharacterPack`.
3. `MY_EmotionalDialogueLocationPack`.
4. Golden Character `FEMALE_COMMS_01`.
5. Golden Location `RADAR_ROOM`.
6. Existing Dialogue Stage resolves the participant by actorId without WorldActor.
7. Existing Presenter changes FullPortrait Sprite for at least:
   - Neutral
   - Listening
   - Concerned
   - Shocked
   - Determined
8. Existing two-shot and reaction framing remains intact.

Do not build the remaining character packs in this slice.

## Golden proof

After a second curated character exists, use a 20–30 second proof scene:

```text
RADAR_ROOM
FEMALE_COMMS_01
CHARACTER_02
```

The proof should visibly include:

- stable background;
- both portraits;
- two-shot;
- speaker focus/reaction coverage;
- at least five expression changes;
- red alert presentation;
- monitor content change;
- dialogue text;
- no WorldActor spawn;
- no `unknown actor` for valid participants;
- zero RED BLOCKERS.

Do not use the 200-second stress film as the first acceptance test for the new curated layer.

## DONE WHEN for the architecture

The system is considered structurally complete when:

```text
curated Character Pack content
-> curated Emotional Dialogue Library
-> V5 existing dialogue semantics
-> existing Dialogue Timeline/Behaviour
-> existing Presenter
-> curated portrait slots/expression state
-> existing Studio validation/preview
```

works without a parallel dialogue implementation and without routing ordinary WorldActors into the closed emotional-dialogue world.
