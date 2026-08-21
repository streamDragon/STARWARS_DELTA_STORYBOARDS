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
  - already distinguishes blocking asset issues from deterministic Preview recoveries
- `MY_CutsceneAssetResolutionService`
  - already restricts Actor preview replacement to canonical/identity-related candidates
- V3 spatial staging already exposes `requestedScreenHeightFraction` and bounded semantic scale checks
- `MY_CutsceneV3PrincipalSetStager` already measures enabled Renderer bounds through `Camera.WorldToViewportPoint`
- Cinemachine materialization already applies orthographic camera lens state
- `MY_CutsceneValidator` already blocks distinct Person cast members that collapse onto the same Actor identity

Therefore this project does NOT need a second full compiler, a second fallback system or a second scale engine.

## The new boundary

`CUTSCENE_SCRIPT_V1` is intentionally smaller than both V3 Semantic IR and V5.

ChatGPT owns:

- story beats
- visible evidence
- semantic handles
- narrative cast identity
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

## Fail-soft first

The normal authoring/import path should be:

```text
BUILD UNLESS A REAL SEMANTIC CONTRADICTION MAKES BUILDING DISHONEST OR IMPOSSIBLE
```

Recoverable/defaultable details should not block Editable Preview.

Typical yellow/recoverable cases:

- deterministic dialogue portrait/body Preview fallback for the SAME narrative identity
- missing optional presentation polish
- deterministic defaults owned by CURRENT rules
- non-principal preview visual gap where the system already has a safe recovery

Typical red blockers:

- stale/mixed CURRENT
- unknown semantic handle with no legal deterministic route
- wrong destination capability
- incompatible animation
- principal world Actor that cannot materialize
- two distinct narrative characters collapsing to one canonical Actor identity
- illegal timing/ownership contradiction
- requested physical story beat with no honest legal representation

The system must never eliminate a yellow warning by changing story identity.

## Narrative identity and presentation are separate

This is a hard architectural invariant.

A cast member has a narrative identity. A portrait/body/world visual is a presentation choice for that identity.

The Simple Script therefore uses:

```text
id                  local narrative cast ID
identityHandle      semantic/canonical identity request
presentationHandle  optional preferred visual presentation
sameIdentityAs      explicit opt-in for intentional shared identity/clone
```

Different cast IDs / different named people are distinct identities by default.

### Never repair presentation by merging identities

This is valid and should flow:

```text
Control One
identity A
exact portrait A

Control Two
identity B
deterministic Preview fallback for B
```

This is NOT a valid repair:

```text
Control One
identity A
portrait A

Control Two
identity A
portrait A
```

when Control One and Control Two are intended to be different people.

A yellow Preview fallback for a dialogue-only participant is preferable to a red `DISTINCT_CAST_MEMBERS_SHARE_ACTOR_IDENTITY` identity collapse.

### Same-identity fallback only

A deterministic presentation fallback may change the portrait/body/presentation source only when the existing CURRENT mapping proves that the fallback still represents the same narrative/canonical identity.

A fallback must not borrow another cast member's exact visual just because it resolves more cleanly.

### Intentional clones/shared identity

Sharing a canonical identity is legal only when explicitly authored through `sameIdentityAs` or an equivalent existing V3 identity/clone relation.

Absence of that declaration means identities remain distinct.

## Diagnostics must explain the difference

Diagnostics shown to ChatGPT/designer should distinguish:

```text
EXACT_VISUAL_RESOLUTION
PREVIEW_VISUAL_FALLBACK
CANONICAL_ACTOR_IDENTITY
INTENTIONALLY_SHARED_IDENTITY
IDENTITY_COLLAPSE_BLOCKER
```

A yellow Preview fallback diagnostic should explicitly say that identity is preserved and that the authoring agent should NOT reuse another character's visual to eliminate the warning.

This keeps a recovery warning from becoming bait for a worse automatic repair.

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

For an Actor handle, `runtimeId` is the canonical/preferred Actor identity when CURRENT provides it.

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

The existing V3 implementation already supports the important half of this contract through `requestedScreenHeightFraction`, bounded semantic scale checks and real viewport measurement. The adapter should reuse it.

The authoritative runtime check is the existing projection path:

```text
Renderer bounds
-> active Cinemachine/output Camera
-> Camera.WorldToViewportPoint
-> measured viewport occupancy
```

Do not create a competing approximation when the actual camera is available.

If `screenWidthFraction` is supplied, the adapter may convert it using actual Renderer aspect + camera aspect, or carry it until a width-aware request is added. Do not derive it from prose or arbitrary raw scale.

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
   - all required identity/presentation/visual handles resolve to legal CURRENT routes
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
-> resolve identity/presentation/visual handles
-> preserve distinct narrative identities before any preview fallback
-> create V3 Semantic package / beat structures
-> map screen-relative sizing into existing V3 spatial requests
-> call existing semantic production/compiler path
-> continue through existing Studio flow
```

The adapter must not implement a new fallback stack. It asks existing resolution/validation owners to resolve legal presentation, and it carries enough identity information that a fallback cannot silently merge two people.

Do not create:

- another Catalog
- another V5 validator
- another asset resolver
- another Timeline generator
- another camera system
- another materializer
- another independent scale normalizer

The point of this layer is to delete author-facing complexity, not duplicate backend complexity.

## CURRENT ownership

The Simple Script contains no CURRENT fingerprints.

The active Unity/Studio environment owns CURRENT identity and injects/validates the current envelope through the existing compiler/import path.

The web `AUTHORING_HANDLES.json` is stamped with `requiredCurrent` so the browser can reject stale handle data, but ChatGPT never serializes those fingerprints into the Simple Script.

## Web preview

`cutscene-preview.html` should support both:

- existing V5 packages
- `CUTSCENE_SCRIPT_V1`

For Simple Script it loads CURRENT `AUTHORING_HANDLES.json` and renders semantic composition directly.

Pre-Unity diagnostics should include at least:

- unknown handle
- unsupported route/action
- distinct cast identity collapse
- exact presentation vs same-identity Preview fallback
- count/plurality mismatch
- missing visible evidence
- invalid frame fraction
- unresolved visual preview
- obvious overlap/off-frame composition
- story claim whose visible state never changes

The browser is a fast authoring check. Unity remains final runtime/materialization authority.

## Migration strategy

Do not rewrite old films and do not remove V5 support.

Transition gradually:

```text
old path: V5 -> Studio -> Timeline
new path: CUTSCENE_SCRIPT_V1 -> existing V3/CURRENT compiler -> V5 -> Studio -> Timeline
```

Both can coexist until the Simple Script path is proven.

## Definition of done for the simplification layer

A normal ChatGPT-authored film should no longer need to know GUIDs, runtime routes, CURRENT fingerprints or raw world scale.

The system should be able to answer:

```text
Who is this narrative person/entity?
How should that identity be presented right now?
What should the audience see?
What semantic asset is requested?
How large should it appear in this camera view?
What changes during the beat?
```

and deterministically translate that intent into the existing V5/Timeline backend while keeping recoverable presentation gaps yellow, preserving identity, and reserving red blockers for real semantic contradictions.
