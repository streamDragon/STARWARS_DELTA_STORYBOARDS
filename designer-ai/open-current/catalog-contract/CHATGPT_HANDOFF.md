# STARWARS_DELTA Designer AI Catalog Knowledge Package

This ZIP is the permanent authoring contract for ChatGPT and Cutscene Studio.
Read `00_CHATGPT_READ_FIRST.txt` first. It is the required ChatGPT entrypoint; then use catalog records and supporting schema files.

- Scope: `FULLCATALOG`
- Catalog revision: `7624698995981318909`
- Exported records: `27886`

IRONCLAD RULE: `cutscenePrimaryUse` is the authoritative placement of each asset.
Do not infer placement from the filename, path, picture, general capabilities, or creative intention.
- Contract revision: 2F9CD64B0DD1AB1CF6D97BA46D32A5FA29199B46FCE0A41972C42655B3543CF8
- Schema hash: E404BDCE7936602B05FEAE284E25B86B558A92393312D5904CD1F3BC2B2B823F
- Semantic classification revision: ENTITY_KIND_GENERIC_V1
For Actor records, entityKind is semantic metadata only. It never decides whether an item belongs in cast, layers, effects, or ui; use cutscenePrimaryUse for ownership.
Unknown is legal when evidence is insufficient or contradictory. Do not guess from broad filename or description keywords.
Classification counts, source counts, confidence bands, review states and the prioritized entityKindReviewQueue are in catalog_summary.json.
Use exact `assetId` values only. Write only exact enum `canonicalValues` from `CUTSCENE_ENUMS_V5.json`; never abbreviate names, invent synonyms, use import-only aliases, or write numeric enum values. A normal transition is `HardCut`, never `Cut`.
`cutsceneNeedsHumanReview` remains a compatibility/publish-gate signal. Treat `cutsceneReviewSeverity=MetadataUncertain` and its `cutsceneReviewReasons` as the actionable yellow designer warning; `PublishCertification` does not block a Preview.
A record with `cutsceneSafeForPreview=false` must not be used.
