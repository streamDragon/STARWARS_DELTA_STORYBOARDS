# STARWARS_DELTA Simple Cutscene Authoring

## Goal

Remove most runtime/linker complexity from ChatGPT authoring without rewriting the existing V5, V3, Studio, Catalog, Validator, Materializer or Timeline systems.

The simplification layer must make the system flow smoothly: deterministic/recoverable presentation problems stay yellow and Editable Preview continues; real semantic contradictions stay red. Semantic directing layers are added on top of this stable path, not used to compensate for a brittle import path.

Normal authoring path:

```text
DEVORA THE QUEEN / ChatGPT
        |
        v
CUTSCENE_SCRIPT_V1
        |
        v
Simple Authoring Resolver / Adapter
        |
        +--> existing V3 Narrative Beat + Cinematic Feature path for multi-entity cinematic beats
        |
        +--> existing V3 Semantic Production Entry only for shapes it can represent faithfully
        |
        v
CURRENT V5 package
        |
        v
Existing migration / normalization / Catalog resolution / validation
        |
        v
Editable Preview / Timeline
```

V5 remains the runtime/backend contract. ChatGPT should stop authoring V5 directly for normal NEW film authoring once the adapter is available.

The adapter is intentionally small, but it is NOT a blind `CUTSCENE_SCRIPT_V1 -> old Semantic IR` serializer. The uploaded Unity source proves the old Semantic IR is narrower than the new authoring language and would recreate several of the exact bugs this layer exists to remove.

## What already exists in Unity

The project already contains the hard middle/backend pieces:

- `MY_CutsceneV3SemanticProductionEntry`
- `MY_CutsceneV3SemanticCurrentCompiler`
- `MY_CutsceneStudioWindow`
- `MY_CutsceneV3BeatSequenceDirector`
- `MY_CutsceneV3CinematicFeatureCompiler`
- `MY_CutsceneV3IntegratedImportRouter`
- V3 spatial staging / semantic size requests
- Cinemachine materialization
- current V5 `actorActions` and Timeline writers

Therefore this project does NOT need a second full compiler, motion engine, scale engine, camera system or Timeline generator.

## Important limitation discovered in the old V3 Semantic IR

The existing `STARWARS_DELTA_CUTSCENE_V3_SEMANTIC_IR` is useful, but it is not a universal intermediate representation for `CUTSCENE_SCRIPT_V1`.

It is narrower in several important ways, including exact technical authoring fields, narrow shot/motion shapes and legacy cast materialization assumptions. In particular, dialogue-only participants or route-sensitive transient content must not be forced into WorldActor semantics merely because a legacy IR is convenient.

Therefore:

**Use the existing Semantic Production Entry where the simple beat is faithfully representable. Use the existing Narrative Beat / Cinematic Feature path for richer multi-participant composition and route-sensitive beats. Never force the simple script through one legacy shape merely to avoid writing a small adapter.**

## The new boundary

`CUTSCENE_SCRIPT_V1` is intentionally smaller than both V3 internal representations and V5.

ChatGPT owns:

- story beats
- visible evidence
- semantic handles
- visible quantity
- dialogue text and dramatic intent
- frame-relative position
- frame-relative size
- camera purpose/framing
- semantic camera subject when authored
- semantic actor motion intent
- explicit story state changes

ChatGPT does NOT own:

- GUID/runtime asset IDs
- `catalogRevision`
- `contractRevision`
- `schemaHash`
- `snapshotContentHash`
- `authoringRuleRegistryRevision`
- Actor vs Effect vs Layer runtime routing
- canonical Actor resolution
- compatible animation IDs
- dialogue world/portrait materialization mechanics
- mechanical V5 defaults such as raw dialogue shot presets
- raw Unity world scale
- arbitrary materialization fallbacks

Those are deterministic system responsibilities.

## AUTHORING_HANDLES

`AUTHORING_HANDLES.json` is generated from the matching CURRENT Director.

A handle carries the runtime/linker facts hidden from normal ChatGPT authoring. ChatGPT serializes the handle; the adapter resolves the exact runtime identity.

An unknown handle is a direct error. The adapter must never guess a similar runtime asset.

The route is authoritative. A handle resolved as Effect is never promoted into cast merely because it moves. A Layer is never promoted into Actor because it depicts a ship. An Actor identity is never inferred from a visual/source membership ID.

## Adapter routing policy

For each `CUTSCENE_SCRIPT_V1` beat, the adapter first resolves all handles and classifies the beat before selecting an existing V3 backend path.

Preferred routing:

```text
simple beat
-> resolve exact CURRENT handles and routes
-> expand requested visible quantity into stable semantic entity instances where needed
-> construct participant relationships and visible start/end state
-> preserve source semantic provenance
-> bind camera subject to the generated semantic entity/participant
-> compile semantic actor actions into existing V5 ActorAction types
-> choose existing V3 representation that preserves those semantics
```

Use Narrative Beat / Cinematic Feature planning when the beat contains multiple visible participants, explicit quantity, dialogue presentation, reveals, formations, continuity or route-sensitive staging.

The old Semantic IR may remain useful for narrow linear cases it can express exactly. It is not the mandatory bottleneck.

## Source provenance is authoritative downstream

Once Simple V1 has resolved a source handle through an authoritative route, generated backend state must retain that semantic provenance instead of re-inferring a different legacy role later.

Examples:

```text
Simple V1 Actor
-> route Actor proven
-> generated SimpleVisibleActor / SimpleIdentity
-> downstream capability remains Cutscene.Actor
```

Never reinterpret that generated entry as `Prop` merely because a legacy structural field says `role=Prop`.

Curated Emotional Dialogue entries remain `EmotionalDialogueCharacter` presentation participants. A `DialoguePortrait` with `spawnWorldActor=false` is not required to satisfy generic WorldActor Character/Crew materialization merely because a legacy role heuristic sees a character-like label.

Count-expanded instances inherit the exact same source provenance and route as their source visible entry. They are semantic instances, not independently re-authored Catalog identities.

## Camera subject preservation

Camera subject is semantic directing truth, not a technical V3 ID authored by ChatGPT.

When Simple V1 provides `camera.subject = hero_ship`, bind the generated V3 semantic camera subject to that exact generated entity before V3 validation.

When the subject is a curated dialogue participant, bind the camera to the Dialogue Stage / participant semantic anchor. Do not spawn a WorldActor just to satisfy camera subject validation.

For dialogue-only curated participants, write the semantic subject directly into the composition/dialogue target and leave the physical world camera target empty. Do not create an illegal WorldActor target and then repair it away.

For a `Hold` camera action, a semantic non-Actor composition subject may remain valid with no physical Transform target. Hold does not require a world target merely because it has a semantic subject.

Target-dependent camera moves remain subject to their existing runtime/validator requirements.

Quantity expansion must preserve source relationships. Subject and relationship binding must use source semantic provenance, not brittle post-expansion string guessing.

If Simple V1 omits a camera subject and there is exactly one deterministic primary visible subject, the backend may supply it as a YELLOW default. If no unambiguous legal subject exists, do not guess silently.

## Dialogue backend defaults

Simple V1 authors dialogue presentation semantically and does not author raw backend shot-preset enums merely to satisfy V5 mechanics.

When a generated dialogue `cameraCue.shotPreset` is blank/missing, the backend owns deterministic normalization before contract validation.

Locked dialogue works similarly: when the backend itself selects locked staging and an authored camera move is incompatible, normalize to legal Hold before V3 validation and report the backend repair. Do not weaken the locked-dialogue invariant.

Dialogue Stage background and frame defaults are also backend-owned. If the owning beat/location already determines a legal background/frame, the normalized stage should expose the same deterministic result before validation instead of first warning that it is missing and supplying it later.

For curated dialogue characters, the CharacterPack/Emotional Dialogue route is authoritative for portrait presentation. Generic Catalog `closeUpSuitable` metadata must not override a legal exact curated portrait/expression mapping.

Unsupported explicit expression remains strict.

## Semantic actor motion compilation

Simple V1 semantic actor motion is compiled into the existing V5 `actorActions` model. Do not create a second runtime movement system.

The current mapping supports existing V5 action forms including:

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

Semantic source forms such as `move`, `approach`, `escape`, `pursuit`, `intercept`, `pass_camera`, `flyby`, `takeoff`, `landing`, `bank_away`, `formation`, `escort`, `formation_break`, `hold`, `fire`, `attack` and `destroy` lower into those existing action types.

`motionIntent = orbit` must compile to a real V5 `Orbit` action even when the Simple V1 source action type is `move`.

Count-expanded source IDs must apply motion to every generated deterministic instance, not only the first member.

### Semantic speed

Simple V1 speed is semantic, not necessarily numeric. The currently supported source values are:

```text
slow
medium
fast
burst
```

The adapter must parse them through the current deterministic mapping and must never throw a `FormatException` by attempting to parse the semantic string directly as `float`.

Numeric action fields (`startOffset`, `duration`, positions, orbit geometry, rotation, etc.) must be read tolerantly. Invalid data should reach the validation/diagnostic path, not crash Studio.

### Orbit v1 runtime truth

Current V5 actor Orbit v1 uses a fixed/stationary center. The Timeline writer samples a static ellipse around fixed authored center state; it does not sample a moving target Transform each frame.

Therefore:

```text
moving actor A
+ Orbit around simultaneously moving actor B
= NOT REPRESENTABLE by current Orbit v1
```

`CUTSCENE_ORBIT_CENTER_MOVES` is a real RED blocker for that overlap and must not be weakened merely because the semantic vocabulary contains `orbit`.

Authoring/test choreography must either:

- keep the Orbit center stationary during the Orbit interval;
- sequence the center's movement before/after the Orbit;
- or use a different supported movement representation.

Do not document or imply moving-target pursuit/escort/intercept/orbit as per-frame target-relative runtime behavior unless an actual implementation exists. Semantic vocabulary is not proof of runtime tracking.

Camera `orbit` remains a separate semantic 2D/2.5D parallax concept and must never be confused with actor Orbit runtime or used to invent unseen 3D views.

## Quantity semantics

`visible[].count` is a real visual obligation.

The adapter must never reduce `count: 6` to one ordinary object because that is easier to serialize.

Legal realization is one of:

1. expand to stable instances of a legal reusable handle;
2. use one exact grouped CURRENT asset only when its inspected pixels genuinely represent the requested group and the authoring route allows it;
3. fail with an explicit quantity/capability gap.

A grouped/fleet visual must not be treated as a single-ship sprite and then multiplied by `count`, because that creates unintended exponential-looking fleets. Pixel inspection decides whether an asset is one actor or a precomposed group.

Generated instance IDs are semantic entity IDs, not new Catalog/runtime identities.

## CUTSCENE VIEW BOUNDS

Cutscene sizing is frame-relative, not adjective-relative.

The simple format uses normalized `screenX`, `screenY`, `screenWidthFraction` and `screenHeightFraction`; the backend derives world transforms using real camera and renderer bounds.

Browser preview and Unity must use the same normalized frame semantics. Browser preview is not permitted to invent a different sizing vocabulary merely because CSS percentages are convenient.

## Story evidence gate

Every major non-verbal beat must map to serialized visible evidence:

```text
STORY CLAIM
-> VISIBLE ELEMENTS
-> START STATE
-> ACTION / CHANGE
-> CONSEQUENCE
-> FINAL STATE
```

Schema-valid text describing an unseen physical event does not satisfy this gate.

## Preview states

Do not collapse all forms of validity into one word.

Use these states:

1. `SCRIPT_VALID`
2. `HANDLE_RESOLVED`
3. `SEMANTIC_PREFLIGHT_PASS`
4. `UNITY_VALIDATED`
5. `PREVIEW_ACCEPTED`

YELLOW backend repairs and ORANGE preview/engine degradation do not by themselves invalidate `UNITY_VALIDATED` for Editable Preview. They may still prevent a claim of final exact readiness.

A browser preview may prove composition/evidence intent, but cannot claim `UNITY_VALIDATED` without Unity.

## Minimal Unity work still required

Add/maintain one authoring-front-end adapter, not another engine:

```text
CUTSCENE_SCRIPT_V1
-> read matching local CURRENT automatically
-> resolve semantic handles to exact legal identities/routes
-> expand quantity into semantic entity instances or verified grouped assets
-> preserve source route/provenance through generated cast/entities
-> bind authored camera subjects to generated semantic entities/Dialogue Stage anchors
-> compile semantic actor motion into existing V5 actorActions
-> create V3 Narrative Beat / Feature contracts for rich beats
-> use existing Semantic Production Entry only for faithfully representable narrow cases
-> map frame-relative sizing into existing V3 spatial requests
-> call existing V3/V5 production path
-> continue through existing Studio validation and preview flow
```

The adapter must inject technical CURRENT identity from the active local Studio/Catalog state. ChatGPT never supplies or chooses those values in normal authoring.

Do not create:

- another Catalog
- another V5 validator
- another asset resolver
- another Timeline generator
- another camera system
- another materializer
- another independent scale normalizer
- another actor movement runtime

The point of this layer is to delete author-facing complexity, not duplicate backend complexity or hide the same route bugs behind a prettier JSON schema.
