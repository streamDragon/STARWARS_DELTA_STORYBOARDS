# STARWARS_DELTA Cinematic Intent Survival Repair

## Status

Implementation handoff for the canonical Unity/Plastic workspace.

This document does **not** authorize a V5 redesign, a new Catalog, a new Director, a new Materializer, a new Timeline system, or manual repair of one generated film.

The existing production path remains:

```text
CUTSCENE_SCRIPT_V1
-> Simple Adapter
-> existing V3 Semantic / Narrative Beat / Cinematic Feature path
-> existing V5
-> existing Validator / Materializer / Timeline
-> Editable Preview
```

The repair target is the information loss that currently occurs between authored cinematic intent and final V5 presentation.

---

# GOAL

Make authored cinematic intent survive the complete production path.

The same storyboard should compile again after these changes and visibly preserve:

- fine-grained emotional intent;
- valid focal subject selection;
- valid camera targets;
- continuity subjects and travel direction;
- semantic cinematic movement rather than flat endpoint movement;
- important world evidence during dialogue;
- explicit visual evidence for physical story claims.

Do not manually repair the generated 80-second V5 JSON. Treat it as regression evidence.

---

# P0.1 — Fine-Grained Expression Is the Dialogue Visual Source of Truth

There are several related fields today:

```text
speakerExpression
listenerExpression
stage.speakerEmotion
stage.listenerEmotion
delivery.emotion
reaction.expression
```

They do **not** represent one identical enum.

## Required model

Fine-grained visual state is the semantic source:

```text
Urgent
Defiant
Concerned
ControlledGrief
Suspicious
Resolute
...
```

Projection then derives coarse stage/delivery values where the existing V5 contract still requires them:

```text
Concerned      -> Perplexed
Shocked        -> Shock
Defiant        -> Anger
ControlledGrief -> Sad
Relieved       -> Happy
Urgent         -> Serious
Resolute       -> Serious
```

The projection must be centralized and deterministic.

Do not allow Normalizer/defaults to overwrite an explicit fine-grained expression with a generic default.

Reaction expression remains an independently authored/reactive visual state when explicitly supplied. It may default from the listener's current fine-grained state only when no explicit reaction exists.

## Regression requirement

If Simple Script authors `Urgent`, the resulting V5 must still contain a fine-grained `Urgent` visual expression even if stage/delivery are projected to coarse `Serious`.

Do not require all emotion-related fields to contain the same literal value.

---

# P0.2 — Focal / Composition Target Must Be Presentable

A generated `compositionTargetId` must be selected from a subject that can actually be presented by the shot.

Legal candidates, in priority order:

```text
1. explicit authored visual subject / attention target
2. visible primary actor
3. visible dialogue speaker/listener when the shot is dialogue-led
4. explicit reveal/location/threat target
5. no entity target
```

Do not fall back automatically to the hero when the hero is absent.

If no legal entity target exists:

```text
compositionTargetId = ""
```

is preferable to a false target.

## Time-aware visibility

A target may be valid when it is initially off-screen but explicitly enters/reveals during the shot.

Validation must therefore ask:

```text
Is this target visible or scheduled to become visible during the camera action interval?
```

not merely:

```text
Is this target visible at shot start?
```

---

# P0.3 — Camera Target Must Be Presentable During Its Action Interval

For Follow / Track / Push / Focus or other target-bound camera actions:

```text
cameraAction.targetEntityId
```

must refer to an entity that is visible or explicitly entering/revealing during that action's time interval.

A target that has already exited or is never presented is invalid.

Do not silently retarget to the hero.

---

# P0.4 — Continuity Must Carry Actual Subjects and State

`preserveScreenDirection = true` with no meaningful subject/state does not preserve continuity.

The V3 semantic/directing state should retain, where relevant:

```text
continuitySubjects
travelDirection
screenSide
previousShotEndState
nextShotStartState
```

Examples:

```text
convoy travelDirection = LEFT_TO_RIGHT
hero screenSide = LEFT
threat screenSide = RIGHT
```

The next shot should consume the previous end state when the same continuity subject persists.

## Important qualification

Do **not** require `matchedEntityIds` to be non-empty for every shot.

Only warn when:

```text
preserveScreenDirection = true
AND the shot/transition actually has continuity-bearing participants
AND matchedEntityIds is empty
```

A location-only establishing shot can legally have no continuity subject.

---

# P0.5 — Semantic Cinematic Moves Must Compile to Trajectories

Existing semantic movement vocabulary includes concepts such as:

```text
Flyby
Approach
Orbit
Intercept
BankAway
Pursuit
Escort
FormationBreak
RescueApproach
CircleTarget
Landing
Takeoff
```

These must not collapse by default to one linear endpoint command:

```text
Move -> destination X/Y -> keyframes=[]
```

## Minimum deterministic recipe

A semantic cinematic move should compile to a small deterministic trajectory recipe, typically 2–4 meaningful phases/keyframes.

Example:

```text
BANK_AWAY
0.00 current pose
0.20 anticipation / slight inward bias
0.55 curved displacement + bank rotation
1.00 exit pose / velocity direction
```

No new physics system is required.

The existing ActorAction/Move/keyframe representation is sufficient if the adapter/compiler emits meaningful trajectory data.

## Ownership

The semantic move name belongs above V5.

V5 receives the resolved deterministic actions/keyframes.

Do not introduce a second runtime movement engine merely to preserve the semantic name.

---

# P0.6 — Dialogue Route Selection Must Preserve Important World Evidence

Dialogue is not automatically a portrait-stage scene.

Before selecting `FACE_TO_FACE_PORTRAITS`, the adapter/director must ask whether the beat contains required visual world evidence.

Examples of world evidence that may need to remain visible:

```text
blockade fleet
incoming threat
ship damage
planet reveal
radar target
convoy escape
active battle
important environmental hazard
```

When that evidence is narratively required, choose an existing presentation route capable of preserving it, for example conceptually:

```text
RADIO_OVERLAY
REMOTE_MONITOR_DIALOGUE
HERO_IN_ENVIRONMENT + dialogue UI
world shot + dialogue presentation
```

Use the exact existing legal route/preset that best represents the beat. Do not invent a production enum solely because a semantic label appears here.

`FACE_TO_FACE_PORTRAITS` remains correct when the directorial intent is explicitly to leave the world context and focus on the characters.

---

# P0.7 — Intention Must Have Visual Evidence

Treat this as a production invariant:

```text
INTENTION
-> REQUIRED VISIBLE EVIDENCE
-> SERIALIZED PRESENTATION
```

If intention claims a visible physical event such as:

```text
Mars appears
blockade appears
explosion
formation
fighter attack
convoy escape
character runs
dreadnought reveal
ship destroyed
```

then V5 must contain visible/action/effect/state evidence representing that claim.

The sentence surviving in `intention` is not evidence.

This extends the existing Story Evidence Gate already defined for Simple Authoring.

---

# P1 — Focused QA Rules

Add focused semantic/cinematic diagnostics. Reuse the existing validation/diagnostic system. Do not create another QA framework.

## FOCAL_TARGET_NOT_VISIBLE

Trigger when a composition target is never visible/revealed during the shot interval.

Severity: Error when the target drives composition and is impossible; Warning when the target is merely advisory and a legal targetless composition is possible.

## CAMERA_TARGET_NOT_VISIBLE

Trigger when a target-bound camera action refers to an entity not visible/entering during that action interval.

## EMOTION_ROUTE_CONFLICT

Trigger when fine-grained expression intent is lost or contradicted by projection.

Legal example:

```text
expression = Defiant
coarse stage emotion = Anger
```

This is **not** a conflict.

Illegal example:

```text
explicit expression = Defiant
normalizer overwrites expression = Neutral
```

## EMPTY_CONTINUITY_SUBJECTS

Trigger only when screen-direction continuity was requested for a shot with continuity-bearing entities and no subject binding exists.

## FLAT_ACTION_MOTION

Trigger for an action/cinematic beat that explicitly requested a semantic cinematic move but compiled to a single straight Move with no trajectory/keyframe evidence.

Do not warn for intentionally static/ordinary linear movement.

## DIALOGUE_WORLD_EVIDENCE_LOST

Trigger when the beat requires an important world visual subject but the selected dialogue presentation removes that evidence without an equivalent monitor/overlay/environment representation.

## PRESENTATION_REPETITION

Cinematic warning only.

Detect repeated dialogue presentation patterns across several consecutive beats, such as the same combination of:

```text
background
layout
framing
camera preset
transition
```

Do not make this a RED blocker.

---

# P1 — Dialogue Variation

Semantic dialogue directing should be able to choose among existing legal presentation concepts such as:

```text
Speaker Close-Up
Listener Reaction
Two Shot
Radio / overlay presentation
Monitor communication
Environment + character presentation
Hero Close-Up
Threat reaction
```

The Simple author does not write raw V5 camera/layout enums.

The existing V3 Director/Feature path should resolve the semantic dialogue intent to legal CURRENT presentation.

Avoid a default in which every dialogue beat becomes:

```text
FACE_TO_FACE_PORTRAITS
+ TWO_SHOT
+ TWO_PORTRAIT_SHOT
+ Hold
```

---

# P1 — Formation / Multi-Actor Composition Recipes

For multi-actor beats, add/extend a small deterministic recipe set rather than raw author-authored X/Y placement.

Initial recipes:

```text
CONVOY
DIAMOND_ESCORT
STAGGERED_FORMATION
ENEMY_WALL
FLANKING
PURSUIT_LANES
```

Recipes produce normalized relationships/slots which the existing V3 spatial staging resolves into actual transforms.

Do not build a generalized optimization solver.

A handful of deterministic recipes is sufficient for the first production slice.

---

# P2 — Cinematic Quality After P0/P1

## Intra-shot timing

Semantic movement can resolve to phased timing such as:

```text
0.00 establish
0.25 accelerate
0.80 bank
1.25 pass
1.70 settle
```

## Camera

Use existing camera vocabulary deliberately:

```text
Push
Pull
Follow
Track
Drift
Shake
ImpactShake
Hold
```

Camera movement must serve a visible target or composition purpose.

Do not add camera motion merely to create activity.

## Background reuse

A single background may produce multiple cinematic compositions through existing presentation tools:

```text
crop / framing
scale
camera offset
parallax
foreground
lighting/tint
haze
VFX
silhouette
```

Do not require new background art for every shot before fixing composition variety.

---

# DO NOT DO

Do not:

- rewrite V5;
- replace Catalog;
- replace Director;
- replace Materializer;
- replace Timeline;
- create another full Cutscene architecture;
- manually repair thousands of generated V5 lines;
- add a giant parallel QA framework;
- build a large test suite before fixing the production path;
- introduce fallbacks that hide identity/route/evidence failures.

---

# IMPLEMENTATION ORDER

## PASS 1 — Emotional intent propagation

Centralize fine-expression -> coarse emotion projection and preserve explicit fine-grained expressions through V5/runtime.

## PASS 2 — Focal and camera target resolution

Resolve targets only from presentable subjects and add time-aware visibility validation.

## PASS 3 — Continuity state

Carry continuity subjects, travel direction and screen-side state across consecutive shots.

## PASS 4 — Dialogue presentation routing

Preserve critical world evidence instead of defaulting all dialogue to portrait-only presentation.

## PASS 5 — Cinematic move trajectory compilation

Compile semantic moves to deterministic phased keyframes/actions.

## PASS 6 — Focused regression diagnostics

Add only the diagnostics defined above using the existing validation/Studio diagnostic path.

---

# REGRESSION TEST CASE

Use the same existing ~80-second storyboard that exposed these problems.

Do not author a new cleaner test merely to make the result look better.

Compare pre-repair and post-repair V5/Preview.

---

# DONE WHEN

The same storyboard is recompiled through the normal path and all of the following hold:

1. Explicit fine-grained visual states such as `Urgent`, `Defiant` and `Concerned` survive to V5/runtime. Coarse emotion projection may differ when required by the existing V5 coarse contract, but may not erase the fine expression.
2. No composition target points to an entity that is never visible/revealed during the shot.
3. No target-bound camera action points to an entity that is never visible/revealed during that action interval.
4. Shots requesting screen-direction continuity with actual continuity-bearing participants have populated continuity subjects and preserved travel/screen state.
5. Significant semantic cinematic moves do not all collapse to one straight `Move` with empty keyframes.
6. Dialogue routing does not remove critical world evidence. The Captain/blockade case retains both the speaking character context and the threat/blockade evidence through a legal existing presentation route.
7. Physical story intentions have explicit serialized visual evidence.
8. The focused QA rules report regressions explicitly if any of the above failures return.
9. Existing V5, Catalog, Director, Validator, Materializer and Timeline remain the backend owners.
10. The repaired result continues through the normal Studio validation/preview path rather than through a special-case test-only route.
