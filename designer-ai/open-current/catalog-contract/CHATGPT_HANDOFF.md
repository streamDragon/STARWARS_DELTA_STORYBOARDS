# STARWARS_DELTA Designer AI Catalog Knowledge Package

This ZIP is the permanent authoring contract for ChatGPT and Cutscene Studio.
Read `00_CHATGPT_READ_FIRST.txt` first. It is the required ChatGPT entrypoint; then use catalog records and supporting schema files.

- Scope: `FULLCATALOG`
- Catalog revision: `7625035885705746207`
- Exported records: `18718`

IRONCLAD RULE: `cutscenePrimaryUse` is the authoritative placement of each asset.
Do not infer placement from the filename, path, picture, general capabilities, or creative intention.
- Contract revision: 1B658F7C600D197BE3BD50BF7D75DACB038B64A20F5AFB8464AACF6363F336E2
- Schema hash: F88BFADB2D6919F798C83D880D0DBFB8C9A5A53E10F25EF563C640B88E044AAE
- Semantic classification revision: ENTITY_KIND_GENERIC_V1
For Actor records, entityKind is semantic metadata only. It never decides whether an item belongs in cast, layers, effects, or ui; use cutscenePrimaryUse for ownership.
Unknown is legal when evidence is insufficient or contradictory. Do not guess from broad filename or description keywords.
Classification counts, source counts, confidence bands, review states and the prioritized entityKindReviewQueue are in catalog_summary.json.
Use exact `assetId` values only. Write only exact enum `canonicalValues` from `CUTSCENE_ENUMS_V5.json`; never abbreviate names, invent synonyms, use import-only aliases, or write numeric enum values. A normal transition is `HardCut`, never `Cut`.
`cutsceneNeedsHumanReview` remains a compatibility/publish-gate signal. Treat `cutsceneReviewSeverity=MetadataUncertain` and its `cutsceneReviewReasons` as the actionable yellow designer warning; `PublishCertification` does not block a Preview.
A record with `cutsceneSafeForPreview=false` must not be used.
