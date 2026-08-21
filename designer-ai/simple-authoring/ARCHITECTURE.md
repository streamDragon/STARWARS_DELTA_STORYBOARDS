# STARWARS_DELTA Simple Cutscene Authoring

## Goal

Remove most runtime/linker complexity from ChatGPT authoring without rewriting the existing V5, V3, Studio, Catalog, Validator, Materializer or Timeline systems.

Normal authoring path:

```text
DEVORA THE QUEEN / ChatGPT
        |
        v
CUTSCENE_SCRIPT_V1
        |
        v
Simple -> V3 Semantic Adapter
        |
        v
MY_CutsceneV3SemanticCurrentCompiler
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

## What already exists in Unity

The uploaded Unity source proves the project already contains the hard middle/backend pieces:

- `MY_CutsceneV3SemanticProductionEntry`
  - recognizes `STARWARS_DELTA_CUTSCENE_V3_SEMANTIC_IR`
  - compiles semantic input into CURRENT V5
  - runs migration and canonical parsing
  - exposes `TryPreflightEditablePreview`
- `MY_CutsceneV3SemanticCurrentCompiler`
  - validates semantic input against CURRENT legality
  - creates the existing `MY_CutscenePackage`
  - uses CURRENT contract/schema constants
- `MY_CutsceneStudioWindow`
  - already routes semantic JSON through `MY_CutsceneV3SemanticProductionEntry` before the normal V5 import flow
- V3 spatial staging already exposes `requestedScreenHeightFraction` and bounded semantic scale checks
- `MY_CutsceneV3PrincipalSetStager` already measures enabled Renderer bounds through `Camera.WorldToViewportPoint`
- Cinemachine materialization already applies orthographic camera lens state

Therefore this project does NOT need a second full compiler or a second scale engine.

## The new boundary

`CUTSCENE_SCRIPT_V1` is intentionally smaller than both V3 Semantic IR and V5.

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

If `screenWidthFraction` is supplied, the adapter may convert it using the actual natural Renderer aspect and actual camera aspect, or preserve it in the adapter until a width-aware spatial request is added. Do not approximate it from prose.

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
   - adapter/V3 semantic compiler accepts the result
4. `UNITY_VALIDATED`
   - normal Studio validation returns zero red blockers
5. `PREVIEW_ACCEPTED`
   - Editable Preview exists and visually agrees with the authored story evidence

A browser preview may prove composition/evidence intent, but cannot claim `UNITY_VALIDATED` without Unity.

## Minimal Unity work still required

Only a narrow adapter should be added when Unity editing resumes:

```text
CUTSCENE_SCRIPT_V1
-> load matching local CURRENT
-> resolve handles
-> create V3 Semantic package / beat structures
-> map screen-relative sizing into existing V3 spatial requests
-> call existing semantic production/compiler path
-> continue through existing Studio flow
```

Do not create:

- another Catalog
- another V5 validator
- another asset resolver
- another Timeline generator
- another camera system
- another materializer
- another independent scale normalizer

The point of this layer is to delete author-facing complexity, not duplicate backend complexity.
