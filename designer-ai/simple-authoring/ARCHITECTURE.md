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

The uploaded Unity source proves the project already contains the hard middle/backend pieces:

- `MY_CutsceneV3SemanticProductionEntry`
  - recognizes `STARWARS_DELTA_CUTSCENE_V3_SEMANTIC_IR`
  - compiles representable semantic input into CURRENT V5
  - runs migration and canonical parsing
  - exposes `TryPreflightEditablePreview`
- `MY_CutsceneV3SemanticCurrentCompiler`
  - validates semantic input against CURRENT legality
  - creates the existing `MY_CutscenePackage`
  - uses CURRENT contract/schema constants
- `MY_CutsceneStudioWindow`
  - already routes V3 Semantic JSON through `MY_CutsceneV3SemanticProductionEntry` before the normal V5 import flow
- `MY_CutsceneV3BeatSequenceDirector`
  - converts a `MY_CutsceneV3NarrativeBeatPlan` into V3 cinematic feature selections
  - owns narrative grammar, camera/energy policy, continuity and participant relationships
- `MY_CutsceneV3CinematicFeatureCompiler`
  - compiles participant-rich cinematic features into deterministic staging and the existing V3 materializer boundary
  - validates exact participant assets and presentation modes
  - contains no Catalog IDs in its feature definitions and no raw world-coordinate authoring requirement
- `MY_CutsceneV3IntegratedImportRouter`
  - already constructs `MY_CutsceneV3NarrativeBeatPlan` and `MY_CutsceneV3CinematicFeaturePlan` from imported package information
  - preserves dialogue-only participants as non-world anchors instead of forcing every participant to materialize as a world actor
- V3 spatial staging already exposes `requestedScreenHeightFraction` and bounded semantic scale checks
- `MY_CutsceneV3PrincipalSetStager` already measures enabled Renderer bounds through `Camera.WorldToViewportPoint`
- Cinemachine materialization already applies orthographic camera lens state

Therefore this project does NOT need a second full compiler or a second scale engine.

## Important limitation discovered in the old V3 Semantic IR

The existing `STARWARS_DELTA_CUTSCENE_V3_SEMANTIC_IR` is useful, but it is not a universal intermediate representation for `CUTSCENE_SCRIPT_V1`.

The current Semantic IR is narrower in several important ways:

- it requires technical authoring fields such as `catalogRevision`, `projectId`, `contextId` and `planId`;
- cast entries contain exact `visualAssetId` values;
- a semantic shot exposes a narrow single-motion shape rather than an arbitrary list of visible participants and actions;
- it does not naturally express a beat containing many separately staged visible elements;
- most importantly, the current `MY_CutsceneV3SemanticCurrentCompiler.CopyCast` materializes semantic cast entries as temporary `WorldActor` clones with `spawnWorldActor=true`.

That last behavior means a blind Simple -> Semantic IR conversion would again risk turning dialogue-only participants, projectile visuals or other transient/non-Actor content into world actors. That is precisely the class of error Simple Authoring is supposed to make architecturally impossible.

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
- mechanical V5 defaults
- raw Unity world scale
- arbitrary materialization fallbacks

Those are deterministic system responsibilities.

## AUTHORING_HANDLES

`AUTHORING_HANDLES.json` is generated from the matching CURRENT Director.

A handle carries the runtime/linker facts hidden from normal ChatGPT authoring:

```text
handle
route
runtimeId
authoringRuntimeForm
allowedUses
capabilities
supports
safeForPreview
safeForPublish
proportionClass
targetScreenFraction
systemManagedProportions
visualReferenceId
Atlas evidence
animation/dialogue compatibility
```

ChatGPT serializes the handle. The adapter resolves the exact runtime identity.

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
-> choose existing V3 representation that preserves those semantics
```

Use Narrative Beat / Cinematic Feature planning when the beat contains:

- multiple visible participants;
- a hero/target/threat/location relationship;
- a fleet, crowd, formation or other explicit quantity;
- command/dialogue presentation whose participants must not all spawn in world;
- reveal/pullback/flyby/location composition;
- staging that needs participant roles, spatial relationships or continuity.

The old Semantic IR may remain useful for narrow linear cases it can express exactly. It is not the mandatory bottleneck.

## Quantity semantics

`visible[].count` is a real visual obligation.

The adapter must never reduce `count: 6` to one ordinary object because that is easier to serialize.

Legal realization is one of:

1. expand to six stable instances of a legal reusable handle;
2. use one exact grouped CURRENT asset only when its inspected pixels genuinely represent the requested group and the authoring route allows it;
3. fail with an explicit quantity/capability gap.

Generated instance IDs should be deterministic, for example:

```text
enemy -> enemy_01, enemy_02, ... enemy_06
```

Those are semantic entity IDs, not new Catalog/runtime identities.

## CUTSCENE VIEW BOUNDS

Cutscene sizing is frame-relative, not adjective-relative.

The simple format uses:

```text
screenX              0..1
screenY              0..1
screenWidthFraction  fraction of visible camera width
screenHeightFraction fraction of visible camera height
```

For an orthographic camera:

```text
visibleHeight = orthographicSize * 2
visibleWidth  = visibleHeight * aspect
left   = cameraX - visibleWidth / 2
right  = cameraX + visibleWidth / 2
bottom = cameraY - visibleHeight / 2
top    = cameraY + visibleHeight / 2
```

These are the CUTSCENE VIEW BOUNDS for that camera state.

The adapter/compiler must derive final world scale from:

```text
actual natural Renderer bounds
+ actual Cutscene View Bounds
+ requested screen fraction
= deterministic Unity transform scale
```

Do not translate `giant`, `small`, `huge`, `tiny` directly into arbitrary Unity scale values.

The existing V3 implementation already supports the important half of this contract through `requestedScreenHeightFraction`, bounded semantic scale checks and viewport measurement. The adapter should reuse it.

If `screenWidthFraction` is supplied, the adapter should convert it using actual camera aspect and natural visual aspect once the resolved Renderer/visual bounds are known. Do not approximate it from prose.

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

Examples:

```text
fleet arrives
-> grouped fleet visual or multiple legal ship instances
-> offscreen/hidden
-> enter/reveal
-> formation becomes readable
-> fleet remains visibly present
```

```text
ship destroyed
-> attacker + target
-> target visible/intact
-> attack/projectile/impact
-> reaction/destruction
-> target absent/destroyed
```

Schema-valid text describing an unseen physical event does not satisfy this gate.

## Preview states

Do not collapse all forms of validity into one word.

Use these states:

1. `SCRIPT_VALID`
   - simple JSON parses and matches `CUTSCENE_SCRIPT_V1`
2. `HANDLE_RESOLVED`
   - all required handles resolve to legal CURRENT routes
3. `SEMANTIC_PREFLIGHT_PASS`
   - the selected existing V3 path accepts the resolved plan
4. `UNITY_VALIDATED`
   - normal Studio validation returns zero red blockers
5. `PREVIEW_ACCEPTED`
   - Editable Preview exists and visually agrees with the authored story evidence

A browser preview may prove composition/evidence intent, but cannot claim `UNITY_VALIDATED` without Unity.

## Minimal Unity work still required

Add one authoring-front-end adapter, not another engine:

```text
CUTSCENE_SCRIPT_V1
-> read matching local CURRENT automatically
-> resolve semantic handles to exact legal identities/routes
-> expand quantity into semantic entity instances or verified grouped assets
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

The point of this layer is to delete author-facing complexity, not duplicate backend complexity or hide the same route bugs behind a prettier JSON schema.
