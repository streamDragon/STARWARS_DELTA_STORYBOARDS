# CASE 013 - Spatial composition: postage-stamp background / giant actor / centered UI

## Observed
A technically valid Preview built successfully, but a corridor appeared as a small rectangle inside a mostly empty camera frame, actor sizes were inconsistent, and tactical radar appeared centered with its machine identifier rendered as visible text.

## Root cause
The generator knew which assets were legal but treated source dimensions and raw author scale as final composition. The existing `MY_CutsceneLayoutPolicy` existed but was not wired into generation.

## GOOD
- Background and FarBackground layers use aspect-preserving Cover against the generated camera.
- Actor baseline scale is derived from renderer bounds plus semantic role/entity kind.
- Generated UI uses screen-space presets; tactical/radar defaults to top-right.
- Machine identifiers such as `TACTICAL_RADAR` remain semantic payloads instead of giant labels when a visual is present.

## Lesson
Do not ask ChatGPT to solve source texture dimensions with random transforms. Routine fit and scale belong to Unity.
