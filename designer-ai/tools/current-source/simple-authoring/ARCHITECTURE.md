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

The single maintained publisher/engineering source for Simple V1 lives under:

- `designer-ai/tools/current-source/simple-authoring/`

Do not keep duplicate copies of those files in `designer-ai/tools/current-source/` or elsewhere. Generated `open-current/**` is a publication artifact, not a second editable source tree.

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

## Geometric loop extension lifecycle

A geometric loop extension is being implemented through the existing Simple Adapter -> V5 `FollowPath` route. The intended semantic family is one general loop capability with shapes such as rectangle, circle, triangle and sine, plus period/phase/loop parameters. It must not create a parallel actor-motion runtime.

This note is engineering context only. `path_loop` is legal authoring vocabulary only after all of the following are true in the same published CURRENT:

1. Unity implementation and tests pass.
2. the maintained source `CUTSCENE_SCRIPT_V1.schema.json` exposes the fields/enums;
3. publication produces a new atomic CURRENT containing that schema;
4. `open-current/CHATGPT_START.txt` and authoring guidance are sealed from the same source revision.

Until then, the live published schema wins and authors must not emit unpublished geometric-loop fields from memory or from a patch note.

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
