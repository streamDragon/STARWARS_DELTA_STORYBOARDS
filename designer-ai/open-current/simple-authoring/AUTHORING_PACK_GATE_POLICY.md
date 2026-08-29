# Simple V1 Authoring Pack Gate

This gate protects the canonical Unity -> Publish -> Git CURRENT -> Open CURRENT -> Devora authoring pipeline. It does not define a second publishing or runtime system.

## Authority

- Unity/Plastic is canonical for runtime implementation and runtime proof.
- Git `designer-ai/tools/current-source/**` is the maintained authoring/publishing source.
- `designer-ai/open-current/**` is generated publication output and must not be hand-edited.
- `CUTSCENE_SCRIPT_V1` is the only normal public movie-authoring format. V3/V5 remain backend implementation.

## Required CURRENT invariants

A CURRENT authoring projection must stop instead of publishing contradictory data when any of these invariants fail:

- `requiredCurrent.catalogRevision` is serialized as a decimal string wherever the web/authoring layer consumes it.
- `CUTSCENE_VALIDATION_CURRENT.json` conforms to its published schema. `blocksCompilation=true` is the authoritative hard-block signal; Warning rules never block compilation.
- The only legal Simple V1 root header is `schema = STARWARS_DELTA_CUTSCENE_SCRIPT` and `schemaVersion = 1`.
- Every production beat carries `durationSeconds` and non-empty `evidence`.
- Simple V1 field names are literal. Do not emit remembered aliases.
- `visible[]` entries are structured objects with `id` + exact CURRENT `handle`.
- `audio[]` entries are structured objects with `kind` + exact CURRENT Audio `handle`.
- `AUTHORING_HANDLES.json` is the direct Simple V1 selection surface and every exposed entry has `authorableInSimpleV1=true`.
- Raw Animation identities may remain in Director/backend compatibility data but are never direct Simple V1 handles. Authors use `animationIntent` / `performanceIntent`.
- Devora-facing instructions never ask authors to serialize raw Catalog IDs, raw Animation IDs, V3/V5 bookkeeping, runtime GUIDs, project-owned Timeline bindings or Golden QA data.
- Direct visual handles expose exact CURRENT visual identity plus positive `atlasPage` and `atlasSlot` where visual evidence exists.
- Dialogue remains closed-world through `EMOTIONAL_DIALOGUE_CURRENT.json`.
- Every `type=fire` action carries a schema-legal `projectileId`; projectile identity is never inferred from an Effect handle, filename or gameplay prefab.

## Timing and concurrency

Simple V1 supports explicit action timing.

- `actions[].startOffset` is optional seconds from beat start.
- `actions[].duration` is optional action duration.
- explicit intervals must be finite, legal and remain inside the owning beat.
- `actions[]` array order is never hidden sequencing.
- staggered or concurrent behavior is authored through legal overlapping/non-overlapping intervals.
- distinct semantic locomotion phases should normally use adjacent beats unless one continuous precise path intentionally represents them.

Visible Effects use their own timing fields:

- `visible[].startOffsetSeconds`
- `visible[].durationSeconds`

These apply only to Effect obligations, not generic actions. Repeated identical Effect handles remain distinct instances and may overlap.

## Motion and camera authoring

- Semantic speed values are only `slow`, `medium`, `fast`, `burst`.
- Precise actor motion uses only fields and shapes actually present in the matching `CUTSCENE_SCRIPT_V1.schema.json`.
- `camera.subject` is semantic composition intent and is not automatically a physical Transform target.
- Camera movement values come only from the matching schema.
- Backend/runtime implementation details for Cinemachine, AnimationTrack, camera-motion curves and Preview evaluation never become authored fields.

## Catalog and visual evidence

- CURRENT handles are the normal authoring vocabulary.
- Raw Catalog IDs remain engineering/runtime identity evidence, not direct Simple V1 authoring values.
- `FULL_VISUAL_INDEX` and `ASSET_VISUAL_LOOKUP` are engineering/debug evidence, not mandatory authoring hops.
- Do not expose an ordinary direct visual choice when source evidence says it is unsafe, pending review, source-sheet-only, requires assembly, or otherwise excluded from direct use.
- Asset counts belong to the CURRENT being built and must not be hardcoded into permanent guidance.

## Accepted fixture discipline

Once a legal authored fixture has passed schema + CURRENT authoring integrity, downstream BACKEND/ENGINE defects are repaired against the same fixture.

Do not rewrite legal beats, timing, camera intent, animation intent, projectile count/type, target, anchor or other authored semantics merely to hide Timeline/Preview failures.

Golden regression identity, runner state, Timeline bindings and runtime PASS/FAIL remain Plastic-owned engineering evidence.

## Final authoring self-check

Before ChatGPT/Devora delivers final JSON, verify at minimum:

1. exact root header;
2. coherent root/beat durations;
3. required beat fields and audience-observable evidence;
4. exact CURRENT handles and dialogue vocabulary;
5. exact schema field names;
6. schema-legal projectile IDs and counts;
7. legal action/effect timing;
8. no unknown properties or backend/runtime identities;
9. no reliance on array order as sequencing;
10. no authored Golden QA, Timeline, binding or runtime probe fields.

## Publication rule

Guidance-only changes use the controlled lightweight/DELTA path when `requiredCurrent` and heavy source-truth fingerprints are unchanged. FULL Publish is reserved for actual heavy/source-truth changes.

A guidance cleanup does not require an unrelated Catalog Full Scan or Vision Batch.
