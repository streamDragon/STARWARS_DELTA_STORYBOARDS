# STARWARS_DELTA Designer AI Catalog Knowledge Package

This ZIP is the permanent authoring contract for ChatGPT and Cutscene Studio.
Read `00_CHATGPT_READ_FIRST.txt` first. It is the required ChatGPT entrypoint; then use catalog records and supporting schema files.

- Scope: `FULLCATALOG`
- Catalog revision: `7625687720571785059`
- Exported records: `19711`

IRONCLAD RULE: `cutscenePrimaryUse` is the authoritative placement of each asset.
Do not infer placement from the filename, path, picture, general capabilities, or creative intention.
- Contract revision: 771AD65DED1F8CB93F7137F1884E3AAD3837928DA5605A65828453B5A38646D9
- Schema hash: B64AE9C01736B2FD40CB3591869E0F8A49C07A81C9631FE62E14F215A50EF308
- Semantic classification revision: ENTITY_KIND_V1
For Actor records, entityKind is semantic metadata only. It never decides whether an item belongs in cast, layers, effects, or ui; use cutscenePrimaryUse for ownership.
Unknown is legal when evidence is insufficient or contradictory. Do not guess from broad filename or description keywords.
Classification counts, source counts, confidence bands, review states and the prioritized entityKindReviewQueue are in catalog_summary.json.
Use exact `assetId` values only. Write only exact enum `canonicalValues` from `CUTSCENE_ENUMS_V5.json`; never abbreviate names, invent synonyms, use import-only aliases, or write numeric enum values. A normal transition is `HardCut`, never `Cut`.
`cutsceneNeedsHumanReview` remains a compatibility/publish-gate signal. Treat `cutsceneReviewSeverity=MetadataUncertain` and its `cutsceneReviewReasons` as the actionable yellow designer warning; `PublishCertification` does not block a Preview.
A record with `cutsceneSafeForPreview=false` must not be used.
