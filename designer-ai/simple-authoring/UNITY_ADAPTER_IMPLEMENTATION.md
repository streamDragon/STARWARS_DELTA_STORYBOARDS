# CUTSCENE_SCRIPT_V1 -> Unity Adapter Implementation

## Goal

Implement the smallest possible Unity-side bridge from `CUTSCENE_SCRIPT_V1` into the existing V3/V5 production path.

This is NOT a new cutscene engine.

The adapter owns only the authoring-front-end responsibilities that currently force ChatGPT to behave like a runtime linker.

## Existing production owners to reuse

Use the existing project owners rather than replacing them:

- `MY_CutsceneStudioWindow`
- `MY_CutsceneV3SemanticProductionEntry`
- `MY_CutsceneV3SemanticCurrentCompiler`
- `MY_CutsceneV3BeatSequenceDirector`
- `MY_CutsceneV3CinematicFeatureCompiler`
- `MY_CutsceneV3SetSpatialGroundingDirector`
- `MY_CutsceneV3PrincipalSetStager`
- existing Catalog snapshot / authoring legality projection
- existing migration / normalization / validation pipeline
- existing V5 Timeline/materialization path

## New code surface

Prefer three small owners only:

```text
MY_CutsceneSimpleScriptContracts.cs
MY_CutsceneSimpleAuthoringResolver.cs
MY_CutsceneSimpleProductionEntry.cs
```

Do not create additional validators/materializers/catalogs/camera systems.

## 1. Simple contracts

Mirror `CUTSCENE_SCRIPT_V1.schema.json` with serializable C# DTOs.

Required root fields:

```text
schema = STARWARS_DELTA_CUTSCENE_SCRIPT
schemaVersion = 1
title
durationSeconds
cast[]
beats[]
```

Visible element authoring fields:

```text
id
handle
count
role
state
depth
screenX
screenY
screenWidthFraction
screenHeightFraction
enterFrom
exitTo
```

Action fields:

```text
type
subject
target
viaHandle
effectHandle
count
result
```

These contracts contain no runtime GUIDs and no CURRENT fingerprints.

## 2. Production entry

`MY_CutsceneSimpleProductionEntry` should mirror the shape of the existing semantic production boundary:

```text
IsSimpleScriptJson(rawJson)
TryPreflightEditablePreview(...)
TryPrepareCurrentJson(...)
```

Studio routing order should become conceptually:

```text
if Simple Script -> SimpleProductionEntry
else if V3 Semantic IR -> existing SemanticProductionEntry
else -> existing V5 import
```

The Simple entry returns the same kind of CURRENT V5 result that Studio already knows how to validate and preview.

## 3. CURRENT is injected, never authored

The adapter receives the active project, Catalog snapshot and expected Catalog revision from Studio.

It must derive/inject:

```text
catalogRevision
projectId
package/context/plan technical IDs where required
contractRevision
schemaHash
other deterministic CURRENT identity/defaults
```

from the existing local production owners.

A `CUTSCENE_SCRIPT_V1` document never contains or controls those values.

## 4. Handle resolution

The public `AUTHORING_HANDLES.json` is a ChatGPT/web projection. Unity must not depend on downloading that file at runtime.

Unity should resolve the same handle semantics from the active local Catalog/Director truth.

Implementation rule:

```text
handle
-> exactly one legal CURRENT authoring candidate
-> route + exact runtime identity
```

Resolution result should contain at least:

```text
handle
route
runtimeId
canonicalActorAssetId when Actor
allowedUses
capabilities
safeForPreview
safeForPublish
compatible animation/dialogue identities
proportion policy
```

If zero candidates resolve:

```text
SIMPLE_UNKNOWN_HANDLE
```

If more than one candidate is genuinely ambiguous:

```text
SIMPLE_AMBIGUOUS_HANDLE
```

Do not choose the first fuzzy match.

Do not silently substitute a related asset.

## 5. Route is authoritative

The resolved route controls materialization.

```text
Actor      -> Actor/cast path
Layer      -> Layer/environment path
Effect     -> Effect path
Ui         -> UI/dialogue presentation path
Animation  -> compatible animation path only
Audio      -> Audio path
```

Hard invariant:

**Movement does not imply Actor. Visual resemblance does not imply route.**

A projectile resolved as Effect remains Effect even when it visibly travels.

A background depicting a ship remains Layer if that is its exact CURRENT authoring route.

A portrait remains a dialogue/UI presentation source unless CURRENT provides a separate Actor identity.

## 6. Do not funnel all simple content through old Semantic cast

The old `MY_CutsceneV3SemanticCurrentCompiler.CopyCast` currently emits semantic cast entries as temporary world actors.

Therefore the adapter MUST NOT put every simple visible element into old Semantic cast.

That would recreate:

```text
projectile -> world actor
portrait -> world actor
transient effect -> world actor
```

and reintroduce `CUTSCENE_PRINCIPAL_ACTOR_EXACT_ASSET_UNRESOLVED` under a new frontend.

Use the old Semantic Production Entry only for cases that exactly match its assumptions.

## 7. Multi-participant beats use the V3 Beat/Feature path

For richer beats construct a `MY_CutsceneV3NarrativeBeatPlan` plus entity bindings.

The existing Beat Director already owns:

- primary participant
- secondary participants
- attention target
- location/environment
- spatial relationships
- motion intent
- dialogue intent
- dramatic function
- energy
- continuity
- reaction requirements

Then call:

```text
MY_CutsceneV3BeatSequenceDirector.TryDirect(...)
```

which produces the existing `MY_CutsceneV3CinematicFeaturePlan`.

The existing Feature Compiler already validates participant roles/assets/presentation and creates deterministic staging:

```text
MY_CutsceneV3CinematicFeatureCompiler.TryCompile(...)
```

Reuse that boundary.

## 8. Beat mapping

Initial minimal mapping should be deliberately small.

```text
establishing / transition
-> FullFrameLocation / establish beat

arrival / launch
-> ShipFlyby or HeroInEnvironment depending participants

threat_reveal
-> PullbackReveal when hero/reference + threat exist

dialogue
-> CommandScreenCommunication when legal dialogue participants/location exist

battle / destruction / retreat / evacuation / custom
-> participant-rich Narrative Beat with explicit actions/state evidence
-> use existing feature vocabulary where it faithfully represents the beat
-> otherwise keep action evidence for the narrow V5 adapter step rather than lying about the feature
```

Do not map an unsupported beat to the nearest cinematic feature merely to make compilation succeed.

## 9. Quantity expansion

For `visible[].count > 1`, determine whether the handle represents:

```text
A. one grouped visual whose actual CURRENT evidence already depicts plurality
or
B. one reusable entity visual that must be instanced
```

If B, create deterministic semantic entity IDs:

```text
enemy_01
enemy_02
enemy_03
...
```

All instances resolve to the same legal runtime asset identity, but remain separate semantic entities for staging/state changes.

The adapter must preserve the requested quantity into the resulting visible plan.

It must never silently reduce plurality to one ordinary instance.

## 10. Story evidence preflight

Before calling downstream materialization, inspect every non-verbal beat.

Require:

```text
storyClaim
visible subject(s)
action/change when physical change is claimed
consequence/final state evidence
```

Examples of adapter-level errors:

```text
SIMPLE_STORY_EVIDENCE_MISSING
SIMPLE_PLURALITY_UNREALIZED
SIMPLE_ACTION_TARGET_MISSING
SIMPLE_DESTRUCTION_FINAL_STATE_MISSING
SIMPLE_LOCATION_VISUAL_MISSING
```

Dialogue reporting an unseen physical event does not satisfy the physical event.

## 11. CUTSCENE VIEW BOUNDS

Authoring coordinates remain normalized to the visible frame:

```text
screenX 0..1
screenY 0..1
screenWidthFraction
screenHeightFraction
```

Do not convert them using a fake global world rectangle.

At materialization/staging time use the actual active cutscene camera envelope.

Orthographic reference:

```text
visibleHeight = orthographicSize * 2
visibleWidth = visibleHeight * camera.aspect
```

The existing V3 system already owns:

- orthographic Cinemachine lens state
- `requestedScreenHeightFraction`
- viewport measurement through `Camera.WorldToViewportPoint`
- bounded semantic scale QA

Reuse it.

### Width fraction conversion

If only `screenWidthFraction` is supplied, convert to a target height fraction only after the exact visual bounds/aspect are known.

Conceptually:

```text
targetWorldWidth = visibleWorldWidth * requestedWidthFraction
targetScale = targetWorldWidth / naturalRendererWidth
resultingHeightFraction = (naturalRendererHeight * targetScale) / visibleWorldHeight
```

Clamp only through existing semantic proportion policy. Do not invent a second clamp table.

## 12. Position conversion

Normalized screen position maps through the actual camera view bounds:

```text
worldX = left + screenX * visibleWidth
worldY = bottom + screenY * visibleHeight
```

If an existing V3 normalized composition slot can faithfully represent the request, use it.

If exact normalized position is needed, preserve it until the existing spatial staging boundary rather than converting early with arbitrary fixed constants.

## 13. Dialogue presentation

Simple cast identity is not automatically world presence.

For dialogue beats:

- resolve Actor identity separately from portrait/body presentation;
- use existing dialogue compatibility mappings;
- dialogue-only participants must not be added to world cast merely to satisfy a generic participant list;
- preserve existing `DialoguePortrait`, `WorldActor`, `Both` and locked-dialogue invariants;
- use the existing Integrated Import Router behavior of creating dialogue anchors when a participant intentionally has no world actor.

### Dialogue participant identity invariant

A dialogue participant is a valid participant even when it has **no spawned WorldActor**.

The following is a legal and intentional production state:

```text
presentationMode = DialoguePortrait
spawnWorldActor = false
speakerActorId / listenerActorId = valid semantic actor identity
portrait/body presentation = available through Dialogue Stage
```

That actor identity must survive the full runtime presentation path:

```text
speakerActorId / listenerActorId
-> generated dialogue clip / playable
-> runtime dialogue line data
-> Dialogue Presenter
-> portrait/dialogue participant
-> expression / pose / portrait presentation
```

Do not use WorldActor lookup as the sole definition of whether a dialogue actor exists.

Hard requirements:

- supported expressions apply to the resolved dialogue participant even when there is no world actor;
- speaker/listener portrait identity and world-presence identity remain separate concepts;
- `backgroundAssetId`, portrait/body assets and expressions must flow through one coherent Dialogue Stage route;
- sequence-level and shot-level dialogue, when both are legal, must reach the same visual presentation/materialization path;
- a missing or unsupported expression may remain Yellow and fall back to Neutral/previous valid expression;
- a valid `speakerActorId` or `listenerActorId` becoming `unknown actor` at runtime is a production bug, not an authoring correction opportunity.

Forbidden workaround:

```text
DialoguePortrait participant
-> force spawnWorldActor=true
-> create hidden/invisible WorldActor just so expressions can resolve
```

Never do this. Fix participant binding at the existing Dialogue Stage boundary.

Tracked Unity/Plastic runtime work: GitHub Issue #12 in `STARWARS_DELTA_STORYBOARDS` is the external handoff only; the actual runtime change belongs in the canonical Unity/Plastic workspace.

## 14. Projectiles / transient visuals

`viaHandle` and `effectHandle` are route-sensitive.

Typical action:

```text
attacker
-> projectile/effect route
-> target
-> impact effect
-> target reaction / changed final state
```

Do not create persistent cast entries for projectile/effect handles unless CURRENT explicitly resolves that handle as Actor and the intended presentation genuinely requires a world actor.

## 15. Diagnostics / delivery truth

Keep the validity stages distinct:

```text
SCRIPT_VALID
HANDLE_RESOLVED
SEMANTIC_PREFLIGHT_PASS
UNITY_VALIDATED
PREVIEW_ACCEPTED
```

The Simple Production Entry may only claim `UNITY_VALIDATED` after the existing Studio validation pipeline returns zero red blockers.

Browser preview never claims Unity validation.

## 16. Fail-soft policy

Defaultable/recoverable mechanical omissions use existing normalizer/Rule Registry behavior and stay yellow where the project already defines a deterministic repair.

Remain RED for:

- unknown/ambiguous handle
- illegal route
- wrong Actor identity
- incompatible animation/dialogue mapping
- impossible quantity representation
- contradictory world/portrait ownership
- physical story claim with no realizable visible evidence
- stale/incompatible CURRENT at the Studio boundary

## 17. Studio integration

The final integration should be a narrow addition to the existing Paste & Validate path.

Pseudo-flow:

```text
rawJson

if MY_CutsceneSimpleProductionEntry.IsSimpleScriptJson(rawJson):
    result = TryPreflightEditablePreview(rawJson, activeProject, snapshot, catalogRevision)
    if result has real errors:
        show them
        block preview
    else:
        replace import payload with result.CurrentJson
        continue existing Studio V5 flow

else if MY_CutsceneV3SemanticProductionEntry.IsSemanticJson(rawJson):
    existing path

else:
    existing V5 path
```

Do not fork the Studio after this conversion point.

## DONE WHEN

The first implementation slice is complete when a `CUTSCENE_SCRIPT_V1` file can be pasted into normal Cutscene Studio and:

1. technical CURRENT fingerprints are never present in the input;
2. semantic handles resolve locally and deterministically;
3. Effect/Layer/UI handles cannot accidentally become world Actors;
4. `count` is visibly preserved or explicitly rejected;
5. frame-relative size maps through actual camera bounds;
6. Story Evidence errors are caught before materialization;
7. dialogue-only participants remain valid actors for portrait/expression presentation without requiring WorldActor spawn;
8. existing normalizer/validator/materializer/Timeline owners remain unchanged except for the narrow entry hook;
9. a successful result continues through the normal Studio flow with **0 RED BLOCKERS**.
