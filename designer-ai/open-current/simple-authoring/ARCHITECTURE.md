# STARWARS_DELTA Simple Cutscene Authoring Architecture

This is maintainer guidance, not a second authoring contract.

## Production path

```text
Devora / ChatGPT
-> CUTSCENE_SCRIPT_V1
-> existing Simple Adapter
-> existing V3 semantic / narrative beat / cinematic feature owners
-> existing V5
-> existing Validator / Materializer / Timeline
-> Editable Preview
```

Do not create a replacement V3/V5 pipeline, Catalog, validator, materializer, Timeline system, camera system, audio engine, projectile runtime, or actor-motion runtime.

## Authoring boundary

ChatGPT authors semantic film intent only:

- beats and evidence
- exact CURRENT handles
- visible quantity and frame-relative composition
- dialogue text and exact curated dialogue identity/expression
- semantic camera intent
- semantic actor motion intent
- explicit legal Audio handles
- exact closed-world Cutscene projectile IDs

Unity owns runtime IDs, CURRENT fingerprints, route resolution, materialization details, technical defaults and final validation.

## Single truth surfaces

The public authoring contract for a published CURRENT is:

- `open-current/simple-authoring/CUTSCENE_SCRIPT_V1.schema.json`
- `open-current/simple-authoring/AUTHORING_HANDLES.json`
- `open-current/simple-authoring/AUTHORING_RULES_CURRENT.json`
- `open-current/EMOTIONAL_DIALOGUE_CURRENT.json`
- `open-current/CUTSCENE_VALIDATION_CURRENT.json`
- `open-current/CHATGPT_START.txt`

Source files under `designer-ai/simple-authoring/` are publisher/engineering inputs. They are not another public CURRENT.

## Important invariants

- Unknown handles block. No fuzzy identity substitution.
- Handle route is authoritative.
- Dialogue is closed-world. Exact actorId / identityHandle / explicit expression only.
- Explicit legal Simple `audio[]` survives lowering into the existing V5 audio route. Backend audio defaults apply only when authored audio is absent.
- Cutscene projectile IDs come from one Unity capability owner and are projected into the Simple schema.
- Effective Simple projectile cadence is backend-owned; Simple V1 does not author interval.
- `directorEligible=false` excludes an asset from automatic creative recommendation while preserving exact/manual engineering access where legal.
- `visible[].count` is a real visual obligation. Do not silently reduce requested quantity.
- Camera semantic subject is not automatically a physical Transform target.
- Actor Orbit v1 has a fixed/stationary center. A simultaneously moving orbit center remains unrepresentable until runtime support changes.
- Semantic Pursuit/Escort/Intercept names do not imply per-frame moving-target tracking unless the runtime actually implements it.

## Preview truth

Web Simple Preview validates the loaded script against the matching published JSON Schema first, then checks matching CURRENT handles and dialogue identity.

Allowed web states:

```text
SCRIPT_INVALID
CURRENT_INVALID
AUTHORING_INVALID
PREVIEWABLE
```

Web Preview must never claim `UNITY_VALIDATED` or `PREVIEW_ACCEPTED`.

## Publication boundary

Generated `open-current/**` is an atomic publication surface.

Source edits do not rewrite it under the same transaction. A later user-controlled Unity Publish establishes a new CURRENT after Unity-owned contract changes.

The publication pipeline must fail rather than mix source from different CURRENT identities or silently rebuild an existing transaction.
