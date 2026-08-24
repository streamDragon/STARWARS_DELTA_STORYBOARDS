# STARWARS_DELTA Cinematic Intent Survival Repair

## Status

Implementation handoff for the canonical Unity/Plastic workspace.

This document does **not** authorize a V5 redesign, a new Catalog, a new Director, a new Materializer, a new Timeline system, a second actor-motion engine, or manual repair of one generated film.

The existing production path remains:

```text
CUTSCENE_SCRIPT_V1
-> Simple Adapter
-> existing V3 Semantic / Narrative Beat / Cinematic Feature path
-> existing V5 actorActions / cameraActions
-> existing Validator / Materializer / Timeline
-> Editable Preview
```

The repair target is information loss between authored cinematic intent and final V5 presentation. Runtime capability must be described honestly: semantic vocabulary may be richer than the currently implemented Timeline behavior.

---

# GOAL

Make authored cinematic intent survive the complete production path without pretending that unimplemented target-relative movement already exists.

The same storyboard should visibly preserve:

- fine-grained emotional intent;
- valid focal/composition subjects;
- valid physical camera targets only when required;
- continuity subjects and travel direction;
- semantic actor motion lowered into existing V5 ActorAction types;
- important world evidence during dialogue;
- explicit visual evidence for physical story claims.

Do not manually repair generated V5 output. Treat generated packages as regression evidence.

---

# P0.1 — Fine-Grained Expression Is the Dialogue Visual Source of Truth

Fine-grained visual state is the semantic source. Coarse stage/delivery values may be projected where the existing V5 contract requires them, but defaults must not overwrite an explicit fine-grained expression.

For curated dialogue participants, `EMOTIONAL_DIALOGUE_CURRENT` / CharacterPack is the closed-world identity and portrait-expression authority. Generic Actor/Ui Catalog discovery and generic `closeUpSuitable` metadata do not replace an exact legal curated portrait route.

Dialogue-only participants remain `DialoguePortrait`, `spawnWorldActor=false`. They are not WorldActors merely because they are people.

---

# P0.2 — Composition Subject and Physical Camera Target Are Different

A generated composition subject must be selected from something the shot can actually present.

Legal candidates, in priority order:

```text
1. explicit authored visual/composition subject
2. visible primary actor
3. visible curated dialogue participant for dialogue-led shots
4. explicit reveal/location/threat subject
5. no entity subject
```

Do not fall back automatically to the hero when the hero is absent.

A semantic composition subject does not automatically imply a physical Transform target.

Important current cases:

- `Hold` may preserve a semantic non-Actor subject with physical `targetEntityId` empty.
- curated dialogue participants should bind directly to dialogue/composition targeting; do not create a physical world camera target only so Ironclad removes it later.
- Follow / Track / other truly target-dependent camera operations keep their real physical-target requirements.

Validation should be time-aware: a target may be legal when it enters/reveals during the action interval.

---

# P0.3 — Source Provenance Must Survive

Once Simple V1 resolves a handle through an authoritative route, downstream code must preserve that proof.

```text
Simple V1 Actor route proven
-> SimpleVisibleActor / generated instances
-> downstream remains Actor-capable
```

Do not re-infer the identity from legacy `role`, filename, display name or weak metadata.

Count-expanded instances inherit the exact source route/provenance.

If a known exact CURRENT Actor later fails only in Preview materialization, that is ENGINE-owned degradation, not permission to change the source identity.

---

# P0.4 — Dialogue Backend Defaults Must Be Visible to Validation

Dialogue Stage background/frame/preset defaults are backend-owned mechanics.

If the backend already deterministically supplies a legal background/frame later in the same pipeline, project that same result early enough that validation sees it. Do not emit repeated line-level "missing background/frame" warnings and then immediately render those exact defaults in Preview.

Prefer one owning beat/stage correction diagnostic when a default was genuinely required.

Locked dialogue still owns static/legal framing. Do not weaken locked-dialogue invariants.

---

# P0.5 — Semantic Actor Motion Must Compile Into Existing V5 Actions

Simple V1 semantic actor motion must not disappear during adaptation.

The current production route lowers semantic actions into the existing V5 actor-action model, including:

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

Examples of semantic source intents include:

```text
Flyby
Approach
Orbit
Intercept
BankAway
Pursuit
Escort
FormationBreak
Landing
Takeoff
Escape
```

The semantic name belongs above V5. V5 receives the supported resolved action form.

`motionIntent = orbit` must lower to real V5 `Orbit`, even when the Simple source action type is `move`.

Count expansion must apply the action to all deterministic generated instances.

## Semantic speed and numeric safety

Simple V1 speed values are semantic strings:

```text
slow
medium
fast
burst
```

Never pass those strings directly through `Value<float>` / `Convert.ToSingle`.

Use the existing deterministic semantic-speed mapping. Numeric fields such as offsets, duration, position, rotation and Orbit geometry must be read tolerantly so malformed data reaches validation/default behavior instead of escaping as a `FormatException` and breaking Studio Validate.

---

# P0.6 — CURRENT ACTOR ORBIT V1 IS FIXED-CENTER

This is a proven runtime constraint, not an old assumption.

Current owner:

```text
MY_CutsceneValidator
MY_CutsceneTimelineWriters
```

Current V5 Actor Orbit v1 computes a fixed center from authored action state and samples a static ellipse. It does **not** resolve and sample a moving target Transform every frame.

Therefore:

```text
actor A Orbit around actor B
while actor B has overlapping movement
-> CUTSCENE_ORBIT_CENTER_MOVES
-> RED
```

Do not weaken that diagnostic.

Do not claim an older V4 moving-target Orbit exists: project trace found no runtime component that dynamically updates Orbit center from another moving actor.

Legal choreography today:

1. keep the Orbit center stationary during the Orbit interval;
2. move/land/reveal the center before or after Orbit;
3. use another supported motion composition.

A future moving-center Orbit is a new runtime capability and must update Timeline execution, validation and published authoring guidance together.

## Important semantic-vocabulary qualification

The presence of semantic names such as Pursuit, Escort, Intercept or CircleTarget does **not** prove per-frame target-relative runtime tracking.

Current investigation found no older V4 runtime for moving-target Pursuit/Escort/Intercept/Orbit that can simply be reconnected.

Do not document these words as dynamic target-following until concrete runtime code exists.

---

# P0.7 — Quantity and Grouped Visuals Must Match the Pixels

`visible[].count` is a real visual obligation.

Legal realization:

1. multiple generated instances of a true reusable single-actor handle;
2. one exact grouped/fleet visual whose inspected pixels already contain the desired plurality;
3. explicit gap/reframing if CURRENT cannot represent it.

Do **not** count-expand a precomposed fleet/group sprite as if that image were one single ship. That multiplies groups by groups and produces absurd fleets while technically satisfying `count`.

Pixel inspection decides whether a visual is a single reusable actor or an already-grouped composition.

---

# P0.8 — Dialogue Route Selection Must Preserve Important World Evidence

Dialogue is not automatically a portrait-stage scene.

Before selecting `FACE_TO_FACE_PORTRAITS`, ask whether the beat contains required world evidence such as blockade fleet, incoming threat, ship damage, planet reveal, radar target, convoy escape or active battle.

When world evidence is narratively required, use an existing legal monitor/radio/environment presentation that keeps that evidence visible.

`FACE_TO_FACE_PORTRAITS` remains correct when the directorial intent deliberately leaves the world context and focuses on the characters.

---

# P0.9 — Intention Must Have Visual Evidence

Treat this as a production invariant:

```text
INTENTION
-> REQUIRED VISIBLE EVIDENCE
-> SERIALIZED PRESENTATION
```

If intention claims a visible physical event, V5 must contain visible/action/effect/state evidence representing it. The sentence surviving in `intention` is not evidence.

---

# P1 — Focused QA Rules

Reuse the existing validation/diagnostic system. Do not create another QA framework.

Useful focused diagnostics include:

- `FOCAL_TARGET_NOT_VISIBLE`
- `CAMERA_TARGET_NOT_VISIBLE`
- `EMOTION_ROUTE_CONFLICT`
- `EMPTY_CONTINUITY_SUBJECTS`
- `FLAT_ACTION_MOTION` where a supported semantic move lost all meaningful execution
- `DIALOGUE_WORLD_EVIDENCE_LOST`
- `PRESENTATION_REPETITION` as non-blocking cinematic warning
- `CUTSCENE_ORBIT_CENTER_MOVES` as RED under current Orbit v1
- grouped/fleet visual multiplied as a single actor, when detected

Do not create speculative diagnostics for semantics the runtime does not yet implement.

---

# P1 — Formation / Multi-Actor Composition

Prefer a small deterministic recipe set over raw hand-authored coordinates where existing staging supports it, for example convoy, escort, staggered formation, enemy wall or pursuit lanes.

These recipes create spatial relationships/slots. They are not proof of dynamic target-relative following.

Do not build a generalized optimizer.

---

# P2 — Cinematic Quality

Use current camera vocabulary deliberately: Push, Pull, Follow, Track, Drift, Shake, ImpactShake, Hold.

Camera movement must serve a visible target or composition purpose.

A single background may support multiple compositions through framing, camera offset, parallax, foreground, haze, VFX and silhouette. Do not require new background art for every shot before fixing composition variety.

---

# PRE-PUBLISH PROOF

Compilation alone is not enough to declare the next CURRENT ready.

Before user-controlled Publish:

```text
Unity compile
-> Validate
-> zero genuine RED blockers
-> Build Editable Preview
-> inspect representative actor motion
-> inspect fixed-center Orbit
-> inspect landing / count expansion
-> inspect curated dialogue portraits/background/frame
-> inspect principal materialization
-> manual Publish only after that
```

Do not Publish automatically from this handoff.

---

# DO NOT DO

Do not:

- rewrite V5;
- replace Catalog;
- replace Director;
- replace Materializer;
- replace Timeline;
- create another actor-motion runtime;
- weaken real RED rules merely to make a fixture pass;
- manually repair generated V5 packages;
- add a giant parallel QA framework;
- introduce fuzzy identity fallbacks;
- claim moving-center Orbit or dynamic target-relative pursuit/escort/intercept before runtime support exists.

---

# IMPLEMENTATION ORDER

1. Preserve emotional/CharacterPack intent.
2. Preserve composition subjects and separate them from physical camera targets.
3. Preserve Simple route/provenance to the first diagnostic source.
4. Project deterministic dialogue stage defaults before early validation.
5. Preserve semantic actor motion into existing V5 actorActions.
6. Keep Orbit v1 fixed-center validation aligned with Timeline truth.
7. Validate quantity/grouped visual semantics against inspected pixels.
8. Add only focused regression diagnostics through the existing system.

---

# DONE WHEN

1. Explicit curated expressions survive correctly and unsupported expressions remain blockers.
2. Hold/dialogue composition subjects do not require fake WorldActors.
3. SimpleVisibleActor route proof is not lost and re-inferred from legacy role fields.
4. Deterministic dialogue background/frame defaults do not generate avoidable warning cascades.
5. Significant Simple actor motion reaches real V5 actorActions and visibly moves in Preview.
6. `motionIntent=orbit` reaches real V5 Orbit.
7. Orbit around a moving center remains RED until a moving-center runtime actually exists.
8. Semantic speed input cannot crash Validate through numeric parsing.
9. Count expansion creates the intended number of actual actors and does not multiply grouped fleet artwork.
10. Physical story intentions have explicit serialized visual evidence.
11. Existing V5, Catalog, Director, Validator, Materializer and Timeline remain backend owners.
12. A representative fixture reaches normal Validate/Editable Preview with zero genuine RED before manual Publish.
