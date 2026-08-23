# STARWARS_DELTA Film Authoring Guide CURRENT

This is the filmmaking layer for Designer AI / Debora authoring. It complements the atomic CURRENT Director, Catalog contract and Instruction Book. It does not replace exact IDs, compatibility or schema validation.

## Core principle

A technically valid cutscene is not automatically a good or representative film.

Before producing final JSON, author in this order:

**Story -> CURRENT visual search -> real-pixel inspection -> exact-asset storyboard / shot plan -> exact runtime asset mapping -> semantic depth -> dialogue presentation -> VFX and audio -> film preflight -> contract validation -> JSON.**

The storyboard and JSON are one film expressed twice. They must not become two independently invented versions of the scene.

## 1. Story first

Write the dramatic progression in plain language before building JSON. The story should still read clearly if all asset IDs are removed. Define beginning state, change, ending state, and what the audience should understand or feel.

Use variable shot duration according to dramatic purpose. Do not default narrative work to mechanical equal-duration blocks merely because round numbers are comforting to software and humans alike.

## 2. Production storyboard means exact game assets

A STARWARS_DELTA production storyboard is not concept art.

`V3_EXACT_ASSET_STORYBOARD_REQUIRED`

Every visible principal object in a production storyboard must come from the CURRENT Catalog/Director and inspected CURRENT visual evidence. Compose with the real source visual. Do not redraw it, beautify it, restyle it, change its view angle, or replace it with a nicer interpretation.

`V3_GENERATED_STORYBOARD_ART_FORBIDDEN`

AI-generated or redrawn art may be used only when explicitly labelled **CONCEPT / REFERENCE ART - NOT CATALOG EVIDENCE**. It cannot be used to predict the Unity result or to claim that an asset exists.

`V3_MISSING_VISUAL_MUST_REMAIN_GAP`

If a requested visual does not exist, use another composition that works with available assets, use another exact CURRENT asset only when it genuinely serves the function without changing identity, or record `MISSING ASSET / GAP`. Never synthesize the missing object.

A small top-view fighter remains that top-view fighter. Do not redraw it as a cinematic side-view fighter. If there is no eye close-up, there is no eye close-up; use an available portrait/expression or change the shot.

## 3. Visual verification is a real four-link chain

Metadata is evidence for search, not proof of appearance. displayName, tags, description, source path, asset ID, atlas page, and atlas slot do not mean the pixels were seen.

A visually important selection is `VISUAL_VERIFIED` only when this chain is complete:

**OBSERVED PIXELS -> EXACT ATLAS PAGE/SLOT -> EXACT VISUAL REFERENCE ID -> EXACT CANONICAL/AUTHORING RUNTIME ID.**

If the public Atlas cannot actually be rendered by the current ChatGPT tool path, disclose that immediately. Ask the ordinary designer for only the single `STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_CURRENT.pdf` when pixel inspection is required. Do not turn Debora into a courier for Catalog ZIPs, category PDFs, source files or the giant Visual Library.

## 4. Build one coherent 2D visual world

For every important visual choice, inspect the real pixels and evaluate art style, source view angle, lighting, location continuity, scale relationship, and whether it is a usable runtime world actor or only reference/concept evidence.

Prefer visual-world coherence over a keyword-perfect mismatch. A top-down shooter ship is usually a poor grounded eye-level landing asset beside a painterly street environment unless that contrast is deliberately part of the film.

STARWARS_DELTA is 2D. Do not make flat assets pretend to be 3D with arbitrary perspective rotation, fake Y-axis orbit, or decorative camera gymnastics. Use cuts, close/medium/wide variation, screen direction, foreground/midground/background, parallax, reaction shots, monitor communication and side-view action when the real assets support it.

If camera purpose is unclear, HOLD is better than motion whose only achievement is proving the camera can move.

## 5. Search the real diversity of CURRENT

Do not repeatedly fall back to one familiar fighter and one asteroid field because those entries are easy to remember. Search the relevant CURRENT Director category and inspect multiple legal candidates.

Depending on CURRENT, useful families may include SHIP_STARBLAZERS, Dante Fighter, Delta7, side-view ships, Playniax Big Saucer, Cargo Ship, Crusher, Hunter, Jellyfish, robot families, Run-N-Gun material, Doc01/02/03 animation families, Cantro material, Commander Arden, Green Collar, Officer Auren, Bullet/Lazer projectiles, explosion/effect families and multiple Background/Layer collections.

These names are search prompts, not permission. Exact CURRENT legality and actual pixels still decide the choice.

## 6. Director recommendation policy

Normal creative selection requires:

`recommendationStatus = RECOMMENDABLE`

Do not normally select `PIXEL_COMPLETION_REQUIRED` or `DO_NOT_RECOMMEND_PENDING_SOURCE_REVIEW`. Those are engineering states. The completion queue and eligibility audit belong to the Unity/publisher pipeline, not to the designer.

A RECOMMENDABLE entry still needs the correct role/capability, runtime form, exact compatibility and visual-world fit.

## 7. Runtime form and narrative role must both be right

Do not equate a visible image with a valid cast identity.

Before assigning Hero, SupportingCharacter or another world role, verify the selected Director entry supports the required capability and runtime form. A UI portrait is not an Actor-primary cast identity. A visual evidence ID is not automatically a runtime ID.

Principal narrative roles must also match the inspected pixels. A robot is not a fighter, a turret is not an asteroid, a structure is not a mothership, and a portrait is not a world Actor identity just because old metadata happens to sound useful.

## 8. Cast identity, distinct people and animation frames

Cast is identity. Animation frames are not new people.

Use canonical/preferred Actor identity for `cast[].visualAssetId` when CURRENT supplies one. Do not use Run, Hit, Death, Walk, Launch or another action frame as persistent identity merely because the scene asks for that action.

Distinct named Person cast members require distinct resolved preferred Actor identities unless the story intentionally represents the same identity/clone. Do not manufacture six differently named extras from six frames of one normalized Person identity. Use fewer distinct legal people or an explicit supported crowd/clone mechanism.

## 9. Animation compatibility is exact

`PlayAnimation` is legal only when the exact animation ID appears in the selected Actor's CURRENT `compatibleAnimationIds`.

Never select animation because the name sounds right or because another visually similar character has it. If no exact compatible animation exists, choose a compatible alternative, use a legal static/Move/Hold presentation, or report a gap.

For a running world character, combine exact compatible Run animation with Move when both are available. Move alone slides a mannequin; Run alone exercises enthusiastically in place.

## 10. System-managed proportions

When `systemManagedProportions=true`, authored scale defaults to 1.0. Use authored scale only as a small deliberate multiplier around semantic baseline. Never use extreme scale to compensate for PNG dimensions, wrong actor selection, missing background coverage or bad framing.

A giant/clipped principal actor is RED visual evidence even if Timeline continues playing.

## 11. Backgrounds are real environments

For Background / FarBackground layers, choose artwork that actually functions as the requested location. Do not use technical textures, tiny decorative sprites, UI panels or arbitrary keyword matches as physical rooms.

Prefer coherent full-frame environments and related parallax families. Unity owns Cover/framing through camera motion; ChatGPT owns selecting the right environment.

A postage-stamp location surrounded by black is RED preview evidence, not a harmless source-dimension detail.

## 12. Semantic depth stack

Plan what is above and below what before final JSON. A useful stack is:

**FarBackground -> Background -> distant world actors -> principal world actors -> foreground actors/effects -> Foreground -> dialogue portraits -> dialogue frame/text -> overlays.**

Verify which ship is behind which ship, whether a capital ship is a distant reveal or foreground threat, whether an explosion is behind/on/in front of its target, and whether portraits/text remain above world content. Do not trust old nested Prefab renderer order as cinematic direction.

## 13. Camera is semantic intent, not arbitrary numbers

Prefer Establishing/Wide/Medium/Close and Hold/Follow/Push/Pull/Dolly/Track only when the movement has a cinematic purpose: reveal scale, follow action, change attention or increase tension.

Useful coverage patterns include:

- DETAIL -> RELATIONSHIP -> WORLD
- ACTION -> IMPACT -> REACTION
- THREAT REVEAL
- MONITOR COMMUNICATION
- LAUNCH SEQUENCE
- FACE-OFF WITH DEPTH
- PULLBACK SCALE REVEAL
- SHIP FLYBY
- COMMAND ROOM ESCALATION

Do not default to equal shot lengths. Rhythm follows dramatic purpose.

## 14. Dialogue identity and presentation are separate systems

Cast identity remains Actor-primary/canonical. Portrait/body/frame assets are presentation sources.

For dialogue-only participants use `presentationMode=DialoguePortrait` and `spawnWorldActor=false`. `Both` is allowed only when explicitly authored and world representation is temporally isolated from portrait representation.

FACE_TO_FACE participants cannot simultaneously remain world actors inside the same locked-dialogue window. One participant has one primary visual source at a time, portrait XOR body. SUBTITLE_ONLY cannot display portraits.

Locked dialogue requires `actorActions=[]` and static Hold, supported Snap, or supported cut-based presentation. Do not introduce continuous Push/Pull/Zoom/Pan/Follow/Track/Drift/Orbit to a locked dialogue shot.

Portrait close-ups, TWO_SHOT, SPEAKER_FOCUS and reaction cuts are legitimate 2D cinematic variety when legal visuals exist. Use them instead of inventing nonexistent facial close-ups.

## 15. Destination capability beats visual resemblance

A picture that looks like UI is not automatically legal UI. A rock that looks movable is not automatically an Actor.

ShowUi uses exact Ui-legal records. Layer scenery/debris uses Layer actions when Layer-primary. Asset-backed effects use Effect-primary records. Animation fields use Animation IDs. Audio fields use Audio records.

Automatic repair is a safety net for bad/legacy input, not the authoring strategy for new output. Prefer the canonical direct ID when CURRENT already proves it.

## 16. Projectiles and impacts are cinematic staging

A projectile can be represented with an actual CURRENT projectile sprite moved explicitly across frame. A clean action chain is:

**exact projectile visual -> Move -> target position -> exact impact/explosion visual activates -> optional supported ScreenFlash/ImpactShake -> reaction animation/action.**

This does not require gameplay projectile simulation. If the preferred ParticleSystem is not Catalog-exposed, an existing CURRENT explosion sprite/effect may be used explicitly. Never invent an explosion visual.

Effects need dramatic purpose, exact timing, legal route, target/anchor when supported, semantic depth, readable occupancy and bounded lifetime.

## 17. Audio is first-class

Narrative cutscenes require an Audio pass when suitable CURRENT audio exists. Consider ambience, engines/movement, impacts, alerts/UI, music, voice/comms and intentional silence.

Audio is non-visual and must never be counted as a visual coverage gap.

## 18. Actor lifetime and location ownership

A cutscene should read as one controlled active revision. Old actors from a previous location must not leak into the next one. Dialogue-only cast must not spawn world actors. Effects/UI must end with their owning interval unless the contract deliberately transfers ownership.

Location changes should cleanly remove or hide content that does not continue before establishing the next physical space.

## 19. CURRENT identity is atomic

Do not use an old JSON as a template merely because it says schemaVersion 5.

Before new authoring, dynamically copy and verify the exact CURRENT schema/context identity plus `publishTransactionId` when applicable, `catalogRevision`, `snapshotContentHash`, `contractRevision` and `schemaHash` from the atomic publish.

A recoverable/defaultable omission may be migrated deterministically. Wrong Actor identity, incompatible Animation, wrong asset role or stale CURRENT identity must not be silently repaired into unrelated content.

## 20. Preview must be representative

A successful JSON import is not the same as a representative Preview.

GREEN means principal visuals materialized, backgrounds cover, proportions are sane, depth is readable, required portraits exist and no required diagnostic fallback is visible. YELLOW means optional/non-principal degradation. RED includes wrong principal visual, clipped/giant actor, black margins, missing required portrait, broken depth, stale identity substitution, floating portrait over grounded action when unintended, principal diagnostic placeholder or missing required materialization.

A warning bar does not convert a visibly broken frame into an acceptable film. A Timeline that plays can still be a failed movie.

## 21. Storyboard-to-JSON fidelity pass

Before final JSON, compare every principal storyboard beat to the authored shot:

- same location
- same exact principal asset identities
- same world-vs-UI interpretation
- same approximate framing/coverage intention
- same action direction
- same entrance/exit/lifetime
- same foreground/background relationship
- same dialogue mode
- same important VFX beat

If a principal storyboard asset and JSON resolve to different identities, flag `V3_STORYBOARD_JSON_ASSET_MISMATCH` and repair it deliberately.

## 22. FILM PREFLIGHT: mandatory before final JSON

Before delivery confirm:

1. CURRENT atomic identity matches.
2. The story reads coherently without JSON.
3. Shot rhythm follows dramatic purpose.
4. Every normal creative selection is RECOMMENDABLE.
5. Principal visual choices were inspected as actual pixels.
6. Every production storyboard visual has CURRENT provenance; no generated/redrawn art is being treated as evidence.
7. Storyboard principal identities match final JSON identities.
8. Every cast Actor is a legal canonical identity and distinct named Persons do not accidentally collapse to one identity.
9. Every visual role uses the correct destination type/capability.
10. Every PlayAnimation exact ID is compatible with the exact selected Actor.
11. Dialogue presentation, single-source, presentationMode and locked-dialogue invariants hold.
12. Backgrounds are real environments, belong to the intended location and are delegated to Unity Cover/framing.
13. No generated-root artifact is being used as the authoring source.
14. No fake 3D view-angle/rotation trick is being used to repair a missing asset.
15. System-managed actors use scale 1.0 by default.
16. Semantic depth/occlusion is intentional and principal subjects remain readable.
17. Effects/projectiles have legal route, timing, purpose, target/depth when supported and bounded lifetime.
18. Camera instructions express semantic intent; no pointless motion.
19. Screen direction, continuity, actor lifetime and location transitions are coherent.
20. Technical IDs are globally unique and timing remains inside owner intervals.
21. JSON validates against CURRENT schema/contract.
22. Expected REAL BLOCKERS = 0 before handing the file to the designer.

If a known rule fails, fix the plan before producing the final package.

## 23. Mars Cafe learning case: BAD evidence, 2026-08-14

The first Mars Cafe homecoming proof is useful BAD evidence, not a GOLDEN example.

What worked: unified Visual Atlas inspection, exact CURRENT IDs, V5 import, real Mars cafe selection and working location transition.

What failed or degraded: top-down/concept ships composited into an eye-level painterly cafe world, manual ship scale instead of semantic proportions, principal diagnostic placeholders, broken background Cover, unproven distant VFX, no Audio pass, mechanically equal timing and a Hero-role capability mismatch.

Do not rewrite this BAD evidence into GOLDEN. A corrected version becomes GOLDEN only after the normal production pipeline and visual QA prove it.

## 24. Asteroid Wave / Mothership / Command Room learning case: BAD evidence, 2026-08-14

The first asteroid-wave/mothership proof is BAD even though Studio generated a Timeline.

Observed failures included postage-stamp backgrounds, giant/clipped actors, narrative roles that did not match pixels, unreadable occlusion, missing dialogue portraits, line-specific dialogue layouts that did not visibly materialize, absent NEAR/MID/FAR behavior, unintegrated explosions and stale/manual scale assumptions.

Recurring lesson: full-frame background coverage, exact role/pixel match, semantic depth, visible portrait presentation and directed effects are acceptance invariants, not optional polish.

## 25. Exact-asset storyboard learning case: BAD evidence, 2026-08-15

### BAD

ChatGPT correctly identified real Catalog/Visual Atlas assets, then sent descriptions of those assets into an image-generation model to create a supposedly predictive storyboard.

The generated storyboard redesigned ships, invented a hangar and architectural spaces that did not exist, invented facial close-ups, changed character identities and transformed the game's real 2D artwork into polished anime-style concept art. It looked more cinematic while becoming less useful, an impressively efficient way to defeat the entire point of a production storyboard.

The resulting storyboard could not meaningfully predict what Unity would build because its pixels and objects were not the game's assets.

### GOLDEN RULE

A production storyboard uses the original CURRENT visual evidence itself, with provenance. No redraw. No restyle. No synthesized missing object. Missing visuals remain composition changes or explicit Asset Gaps.

AI-generated reinterpretation is CONCEPT / REFERENCE ART only and must never be treated as Catalog evidence, Unity prediction or proof that an asset exists.

## 26. JSON blocker lesson: distinct people are distinct identities

A recent 401-second launch sequence used six differently named doctor extras that normalized to the same preferred Doctor identity. Studio correctly blocked Editable Preview because six names did not create six people.

Correct authoring starts from distinct canonical Person identities, then pairs each one with its exact compatible Run animation and world Move. When CURRENT only proves three distinct doctors, use three distinct doctors instead of manufacturing six pseudo-identities from action frames.

This is a reusable authoring lesson, not a one-file patch: **cast identity first, animation/action second.**
