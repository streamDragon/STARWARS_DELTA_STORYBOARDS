# WISDOM Cutscene Studio - Fail-Soft Movie Authoring Policy

## Product invariant

The end user is making a movie, not debugging a compiler.

When the Cutscene system itself is healthy, **Editable Preview should continue to exist and remain usable even when authored input contains recoverable mistakes, unavailable optional capabilities, stale references, or imperfect artistic choices.**

Normal user-facing status is:

- **GREEN** - the requested behavior can materialize exactly.
- **YELLOW** - artistic, quality, readability, continuity, or directing advice. Preview continues.
- **ORANGE** - a technical repair, substitution, omission, placeholder, or degradation was required. Preview continues and the compromise is disclosed.
- **RED** - reserved for an unrecoverable system condition where no valid Preview can be produced or preserved.

RED must not be used as a normal authoring workflow state.

## Author strict, Studio tolerant

This policy has two complementary sides.

### ChatGPT / authoring output

ChatGPT must still return clean, schema-valid `CUTSCENE_SCRIPT_V1` and run the final self-check before delivery.

Fail-soft behavior is **not permission to emit invalid JSON**.

The author should use exact CURRENT handles, legal enum values, legal dialogue vocabulary, semantic animation intents, and the exact Cutscene projectile vocabulary.

### Studio / imported user input

Studio is the safety net.

If imported input contains a recoverable defect, Studio should normalize, repair, omit only the defective optional operation, or use an explicit diagnostic placeholder while keeping the rest of the movie buildable.

Never report a fallback as exact success.

## Repair order

Use this order for recoverable input:

1. **Deterministic repair** using CURRENT identity/capability truth.
2. **Safe supported fallback** using an already-supported representation.
3. **Omit only the unsupported optional operation** while preserving the rest of the shot.
4. **Diagnostic placeholder** when a visible object cannot be resolved but the shot can still exist.
5. **Preserve the last valid Preview** when a new import cannot be safely interpreted.

Only use RED when none of these can preserve a valid Preview because the system itself cannot continue.

## Required fail-soft cases

### Handle/reference problem

If a stale/raw/internal reference can be mapped uniquely to a CURRENT deterministic authoring identity:

- repair it internally;
- report `ORANGE AUTO_REPAIRED_HANDLE`;
- show requested and resolved friendly names under Details;
- continue Preview.

If no safe mapping exists:

- use a diagnostic placeholder for a visual object, or omit an optional non-visual cue;
- report ORANGE;
- continue Preview.

Do not make the user edit a runtime hash by hand.

### Unsupported animation

If an actor is valid but the requested animation/performance intent has no executable compatible animation:

- keep the valid actor visual;
- use a supported static/default pose or another explicitly supported safe fallback;
- report `ORANGE ANIMATION_FALLBACK`;
- continue Preview.

Example: requested `run`, available `walk` only. Preview may use fast walk only when that fallback is deterministic and must state the substitution. It must not claim RUN succeeded.

### Missing optional visual/VFX

- omit the optional effect or use a diagnostic placeholder where useful;
- report `ORANGE VFX_OMITTED` or `ORANGE VISUAL_PLACEHOLDER`;
- continue Preview.

### Missing optional audio

- use silence;
- report `ORANGE AUDIO_OMITTED`;
- continue Preview.

### Camera subject unavailable

- fall back to a safe Hold/default composition;
- report `ORANGE CAMERA_FALLBACK`;
- continue Preview.

### Dialogue presentation degradation

If identity is known but an optional requested presentation cannot materialize safely:

- use a legal published/default presentation when one exists, otherwise preserve the dialogue with the safest available presentation;
- report ORANGE;
- continue Preview.

Do not invent a dialogue identity or expression.

## Fire versus visual beam/VFX

This distinction is mandatory for authoring and must also be handled fail-soft on import.

A real Cutscene projectile uses:

```json
{
  "type": "fire",
  "subject": "enemy",
  "target": "hero",
  "projectileId": "CS_PROJECTILE_PURPLE_BOLT",
  "count": 1
}
```

A visual-only laser/beam/muzzle Effect is not automatically a projectile action. Put the Effect in `visible[]` and activate/reveal it through a legal visual action.

Conceptual example:

```json
{
  "visible": [
    {
      "id": "beam_fx",
      "handle": "<exact CURRENT Effect handle>"
    }
  ],
  "actions": [
    {
      "type": "reveal",
      "subject": "beam_fx"
    }
  ]
}
```

Do not author:

```json
{
  "type": "fire",
  "subject": "enemy",
  "effectHandle": "<laser Effect handle>"
}
```

### Studio import behavior for malformed fire

If imported `type=fire` lacks `projectileId`:

- if the action contains enough exact Effect evidence for a deterministic visual-only interpretation, normalize only that action to the existing visual-effect path and report `ORANGE AUTO_REPAIRED_FIRE_TO_VFX`;
- otherwise omit only that fire action and report `ORANGE FIRE_OMITTED_NO_PROJECTILE`;
- keep the rest of the beat/movie buildable.

## Schema defects

The schema remains the canonical authoring contract. ChatGPT must not knowingly violate it.

Studio should distinguish:

### Recoverable structural defect

Examples:

- missing optional field;
- invalid optional enum with a deterministic default;
- malformed optional action that can be safely omitted;
- stale handle that can be repaired.

Result: ORANGE and Preview continues.

### Unrecoverable document defect

Examples:

- file is not parseable JSON and there is no previously valid Preview to preserve;
- root object/beat structure is so corrupt that no safe film representation can be recovered;
- internal generator/Timeline creation fails even after safe fallback handling.

Result: RED may be used because the system cannot produce a valid Preview.

When possible, preserve the last valid Preview and show the failed import as an ORANGE import note instead of replacing the working movie with a dead state.

## User-facing diagnostics

Primary UI should be human-readable.

Bad primary message:

`SIMPLE_ANIMATION_CAPABILITY_MISSING`

Good primary message:

> Animation unavailable. You asked for RUN. This character currently supports WALK. Preview uses WALK.

Technical diagnostic codes belong under Advanced / Details.

Every ORANGE should answer:

1. What was requested?
2. What could not be done exactly?
3. What did Studio do instead?
4. Does the film still build?

## Build invariant

**NO UNRECOVERABLE SYSTEM FAILURE => EDITABLE PREVIEW BUILDS OR THE LAST VALID PREVIEW IS PRESERVED.**

A single bad optional action, missing effect, unavailable animation, stale handle, missing camera subject, or artistic problem must not destroy the whole film.

## Storyboard / Director behavior

Storyboard Cards should display GREEN/YELLOW/ORANGE state per shot.

- GREEN: exact.
- YELLOW: director note.
- ORANGE: technical degradation/repair.

Cards remain playable when YELLOW/ORANGE.

`PLAY SHOT` and `PLAY FILM` remain available whenever a valid Preview exists.

## Ownership

- `CUTSCENE_SCRIPT_V1` remains the sole public authoring format.
- V3/V5 and Timeline remain backend implementation.
- This policy does not create a second schema, runtime identity system, gameplay system, or fallback asset catalog.
- Repairs must reuse existing CURRENT/Catalog/runtime owners.

## Regression expectations

At minimum keep fixtures for:

1. valid exact film -> GREEN -> builds;
2. unsupported animation -> ORANGE fallback -> builds;
3. missing optional VFX -> ORANGE omission -> builds;
4. stale but uniquely repairable handle -> ORANGE repair -> builds;
5. missing camera subject -> ORANGE Hold/default -> builds;
6. `fire` without `projectileId` but exact Effect evidence -> ORANGE visual repair -> builds;
7. `fire` without `projectileId` and no safe interpretation -> ORANGE fire omitted -> builds;
8. artistic/continuity problem -> YELLOW -> builds;
9. unparseable/corrupt film with no recoverable structure -> RED allowed;
10. true generator/Timeline failure -> RED allowed.

The purpose of these regressions is not to make invalid authoring desirable. It is to guarantee that a user mistake does not unnecessarily destroy the filmmaking session.
