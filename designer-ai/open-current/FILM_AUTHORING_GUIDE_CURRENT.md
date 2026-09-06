# CUTSCENE AI AUTHORING GUIDE - IRONCLAD

Required entrypoint: read `00_CHATGPT_READ_FIRST.txt` before this guide or any catalog record.

## Goal
Create a useful editable first pass from zero to roughly sixty percent. Do not chase perfection and do not start a repair dialogue for visual uncertainty.

## Authoritative asset placement
For every asset, read `cutscenePrimaryUse` in `catalog_records.jsonl`:
- `Actor`: use only in `cast`, then control it with `actorActions`.
- `Layer`: use only in `sequence.layers`, `shot.layerActions`, or the exact layer destination documented by the field resolver.
- `Ui`: use only in dedicated UI/dialogue presentation fields. A layer role of `Overlay` or `Ui` does not make a Ui-primary record legal in a Layer field.
- `Effect`: use only in `effects`.
- `Audio`: use only in `audio` or voice fields.
- `Animation`: use only as `animationAssetId` or in `animationAssetIds`.
- `Kit`: use only in `selectedKits` with exact IDs from a usable Kit contract.
- `Unsafe`: never use in a Cutscene package.

`cutsceneAllowedUses` is informative. `cutscenePrimaryUse` is the default that prevents ambiguity.
`cutsceneSupportedActions` lists the legal authoring vocabulary for that record.
Use `cutsceneReviewSeverity=MetadataUncertain` with `cutsceneReviewReasons` for an actionable yellow note. `cutsceneNeedsHumanReview` remains compatible publish-gate metadata and does not by itself make a Preview asset unusable.

## CINEMATIC MULTI-PLANE COMPOSITION
For Establishing, Exterior, Action and Reveal beats, prefer a coherent multi-plane composition when the Catalog provides materially useful planes. Aim for roughly three useful planes, not an arbitrary layer count.
Use reviewed Layer-primary records with roles such as FarBackground, Background, Midground, Foreground or Layer-primary Atmosphere when those roles materially improve depth. Prefer one coherent familyId or collection; mix only when compatible planes are genuinely missing.
Layer-primary Atmosphere records belong only in Layer fields. stage.atmosphereVfxAssetIds requires Effect-primary assets. Effect-primary smoke, fire and VFX never belong in sequence.layers.
Space example: starfield or planet at FarBackground, horizon or set at Background, ship/architecture at Midground or Foreground, and restrained haze when useful. Planet and interior scenes follow the same depth logic: distant world or window, readable set, actor support, and optional framing plane.
Do not flatten every Layer-primary record to Background. The destination field still requires `cutscenePrimaryUse=Layer`; `role=Overlay` or `role=Ui` never overrides that placement rule.
FarBackground and Background use sortingOrder < 0. Keep the relative order deterministic, keep Foreground framing from obscuring the focal actor, and let UI/transitions own their canonical presentation order.
Move or Parallax consumes `parallaxFactor` as a multiplier: 0=no displacement, 1=full authored delta, intermediate values=partial motion. Scroll consumes scrollUnitsPerSecond. Distant planes generally move less than nearer planes; do not animate every plane.
Locked dialogue is line/stage-driven: one explicit stage.backgroundAssetId plus portraits/bodies/UI and optional Effect-primary atmosphere VFX. Keep `lockStaging=true` dialogue free of actorActions and parallax movement; use a separate establishing/action shot for rich multi-plane motion.
Each shot has one dominant intention. Set compositionTargetId for the focal entity. Choose one dominant base camera action (Hold, Push, Pull, Pan, Track, Follow, Focus or Drift); Shake, ImpactShake and Recoil are additive beat support. Use HardCut for a genuine framing reset.

## JSON rules that are not negotiable
- Use schema `STARWARS_DELTA_CUTSCENE_PACKAGE`, schemaVersion 5 and contextVersion 3.
- Before FINAL JSON, verify every enum against `CUTSCENE_ENUMS_V5.json` `canonicalValues`. Never abbreviate names, invent synonyms, write an import-only alias, or write `type: 8`, `role: 0`, or any other numeric enum. A normal transition is `HardCut`, never `Cut`.
- Use exact asset IDs from this package. Never invent a GUID, local file ID, path or object name.
- Do not place a background, planet, flower field, smoke, fire or explosion in `cast` unless its record explicitly says `Actor`.
- `VERIFIED COMPATIBLE ANIMATIONS`: when an Actor record includes `compatibleAnimationOptions`, prefer the exact verified Run, Walk, Hit or Idle animation that matches the requested action.
- `PlayAnimation` is allowed only when the exact animationAssetId appears in the actor record's exported `compatibleAnimationIds` list. Never infer compatibility from filename, folder, naming or visual similarity; without proof use `Turn`, `Move`, `Hold` or another non-animation action.
- Move controls world movement and PlayAnimation controls visual character animation. A running person normally uses PlayAnimation(Run) plus Move(...). If no verified Run exists, use Move without PlayAnimation and keep Preview working.
- When any dialogue line in a shot has stage.lockStaging=true, the owning shot.actorActions MUST be empty. Do not use Hold, FreezePose, Enter, Exit, Move, PlayAnimation, or any other world-actor action to keep a dialogue actor static. Dialogue visuals are controlled by the dialogue presentation fields only; place world-actor activity in a separate action shot before or after the locked dialogue shot.
- CAST IDENTITY is `cast[].visualAssetId`: an Actor-primary world/character identity record only. DIALOGUE PRESENTATION uses Ui-primary portrait/body/frame/balloon records only.
- A selected Ui-primary DialogueBubble / SpeechBalloon asset belongs in `$.sequences[].shots[].dialogue[].dialogueFrameAssetId`; do not invent `dialogueBubbleAssetId`. The existing `stage.uiForm` field selects the presentation layout.
- Speech balloons are optional. Use an exact Preview-safe Ui-primary balloon only when its tail matches the speaker position and the selected presentation supports it: left -> `LeftSpeaker` / `TailLeft`, right -> `RightSpeaker` / `TailRight`, center/monologue -> `CenterSpeaker` / `TailDown`. Otherwise use the canonical Dialogue Stage frame.
- Never invent `NearSpeaker`, `FarSpeaker`, `RadioSpeech`, `ThoughtBubble` or `ShoutBubble` semantics unless the exact meaning is exported for that asset.
- Gameplay events are forbidden. The typed `handoff` owns gameplay transfer.
- Missing decoration is non-blocking. Omit it or add `missingAssets` with `blocking=false`.
- Author `cameraActions`, target IDs and permitted Kit camera presets only. Unity creates exactly one active `CUTSCENE_CAMERA` on Display 1 for the selected generated layer and owns renderer visibility and root activation. Never invent a Camera asset, Display value or renderer setup.

Every newly authored cast entry must include entityKind using the canonical values. Use Unknown when the kind is not proven; entitySubKind is optional.
Keep these five fields separate: entityId is unique instance identity; displayName is human-readable instance text; role is dramatic function; entityKind is physical in-story kind; visualAssetId is the exact visual record. entitySubKind is optional PascalCase descriptive metadata.
entityKind describes what an Actor is. It is not a layer role and must never be used to classify ownership. Visual depth belongs to shot/layer composition and sortingOrder.

## Working with the designer
Discuss story, shots, pacing and asset choices freely. Produce FINAL JSON only when explicitly requested. Then return one complete JSON object with no Markdown or explanation.

## Examples
- `VALID_MINIMAL_V5.json`: asset-free timing and package shape.
- `VALID_60_PERCENT_PREVIEW_V5.json`: Actor + Layer + Effect + Audio using exact records selected from this Catalog export.
- `VALID_CINEMATIC_MULTILAYER_V5.json`: a no-dialogue, two-shot establishing/action composition using three coherent Layer-primary planes, deterministic sorting and authored parallax factors. Use this when teaching cinematic depth; the 60 percent example intentionally stays compact.
- `VALID_CROWD_REUSE_V5.json`: multiple cast instances reusing one approved Actor asset with unique entity IDs.
- `VALID_SAFE_FALLBACKS_V5.json`: optional missing content and an assetless built-in effect without blocking Preview.
- `VALID_DIALOGUE_TWO_PERSON_V5.json`: Actor-primary cast identities with Ui-primary portraits/frame and locked two-person staging.
- `VALID_DIALOGUE_THREE_CHARACTER_CONVERSATION_V5.json`: three Actor identities rotating through speaker/listener pairs with at most two visible participants.
- `INVALID_COMMON_MISTAKES.md`: category, enum, animation and unsafe-prefab mistakes that must never be repeated.

Catalog revision for this package: `7624471883407822870`.
