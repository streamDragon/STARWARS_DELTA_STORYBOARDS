# Simple V1 Authoring Pack Gate

The Devora/ChatGPT authoring pack is an authoring API, not a copy of engineering CURRENT.

A publish is blocked unless all of the following are true:

- Every `catalogRevision` serialized to JSON is a decimal string, never a JavaScript number.
- `CUTSCENE_VALIDATION_CURRENT.json` validates against `CUTSCENE_VALIDATION_CURRENT.schema.json`.
- The canonical `CUTSCENE_SCRIPT_V1` example validates against `CUTSCENE_SCRIPT_V1.schema.json`.
- Direct Simple V1 handles exclude route `Animation`.
- Direct visual handles are `safeForPreview=true`, `safeForPublish=true`, `recommendable=true`, `needsHumanReview=false`, and do not carry `do-not-use-container-directly` or `requires-assembly`.
- Direct Audio handles are `safeForPreview=true` and `safeForPublish=true`.
- Every direct visual handle resolves to real Atlas page/slot coordinates.
- Devora-facing instructions never request raw Catalog IDs, raw animation IDs, V3 fields, V5 fields, lifetime bookkeeping, mechanical IDs, or project-owned Dialogue Stage mechanics.
- Dialogue remains closed-world and resolves only through `EMOTIONAL_DIALOGUE_CURRENT.json` authoring-ready characters and exact supported expressions.

The full Director, raw compatibility lists and backend validation remain available to engineering, but they are not authoring vocabulary.

Current audited projection from publish `20260824-061658229-302e70c5`: 574 direct Simple V1 handles: 97 Actor, 59 Layer, 115 Effect, 79 Ui, 224 Audio, 0 Animation.
