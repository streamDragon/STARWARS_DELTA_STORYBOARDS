# Exact-asset production storyboard: BAD evidence and GOLDEN rule

Case ID: `EXACT_ASSET_STORYBOARD_AI_REDRAW_BAD_20260815`

Status: `CURRENT_REUSABLE_LESSON`

## BAD evidence

ChatGPT correctly identified/inspected real CURRENT Catalog + Visual Atlas assets, then described those assets to an image-generation model and used the generated result as a supposed production storyboard.

The generated storyboard:

- redesigned ships instead of using their source pixels;
- invented a hangar / architecture that did not exist in CURRENT;
- invented facial and eye close-ups that did not exist;
- changed character visual identity;
- converted the real 2D game art into polished anime-style concept art; and
- therefore could not meaningfully predict the Unity result.

The failure was not that the generated art looked bad. The failure was that it stopped being evidence.

## GOLDEN rule

`V3_EXACT_ASSET_STORYBOARD_REQUIRED`

A production storyboard intended to predict Unity uses the original CURRENT visual evidence itself, with provenance from observed pixels -> Atlas page/slot -> visualReferenceId -> canonical authoring/runtime ID.

`V3_GENERATED_STORYBOARD_ART_FORBIDDEN`

Generated or redrawn imagery is allowed only as explicitly labelled `CONCEPT / REFERENCE ART - NOT CATALOG EVIDENCE`.

`V3_MISSING_VISUAL_MUST_REMAIN_GAP`

When a requested visual does not exist, change the composition, use another exact CURRENT asset only when it genuinely serves the function without changing identity, or record an explicit Asset Gap. Never synthesize the missing object.

## Storyboard -> JSON invariant

`V3_STORYBOARD_JSON_ASSET_MISMATCH`

A principal production-storyboard identity and the corresponding final JSON identity must match. The storyboard and JSON are two representations of the same film, not independent reinterpretations.
