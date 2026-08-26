# STARWARS_DELTA Cutscene Integration Status

This file records durable engineering conclusions only. It is not a second authoring contract and it does not override the published atomic `open-current/**` schema or handles.

## Particle Effects

Targeted Particle discovery is supported as a Cutscene Catalog enrichment step.

A prefab is eligible for the direct Particle Effect route only when it is genuinely Particle-only for Cutscene purposes. Mixed gameplay/content prefabs that also contain gameplay actors, sprite/gameplay ownership, directors or other unrelated execution components must not be promoted merely because a nested `ParticleSystem` exists.

The targeted Particle scan is intentionally narrower than a full Catalog scan. Re-running a full Catalog scan is not required merely to discover or refresh Particle-only Effect candidates.

A legal Particle Effect must still materialize through one existing Timeline execution owner. Prefer native `ControlTrack` when Timeline can correctly own prefab/Particle lifecycle; otherwise use the one existing custom visual/VFX owner when project-specific composition behavior requires it. Do not create a parallel particle runtime.

## Vision annotations

Vision annotation import updates visual/semantic metadata for existing Catalog identities. It is not a reason to perform an unrelated full Catalog rescan.

Annotation import must preserve exact entry identity (`entryId`, GUID, asset path/source identity and work class as applicable) and must not silently replace already authoritative vision data unless the import contract explicitly requests replacement.

Individual uncertain assets may remain `NeedsReview`; one unresolved item is not a reason to block unrelated Cutscene authoring or to manually rename/reclassify the entire Particle set.

## 2D camera and background coverage

STARWARS_DELTA Cutscene composition is 2D / 2.5D. Camera motion may create cinematic movement, parallax, push/pull, tracking and other screen-space effects, but it must not invent unseen 3D viewpoints or reveal space outside the intended 2D environment.

For every camera interval, the visible camera viewport/frustum must remain covered by the active background/layer composition. A move that exposes black borders, empty world, missing art or regions outside the intended FullFrame background is a failed camera composition even if the Timeline and Cinemachine clip are technically valid.

Camera limits must be derived from the actual active 2D background coverage and active viewport, not from an arbitrary editor Stage rectangle. When a desired move would exceed coverage, reduce/reframe the move or use a cut/hold rather than exposing non-existent scenery.

## Geometric path loops

The geometric-loop extension belongs to the existing semantic-motion owner and lowers through existing V5 `FollowPath`. It must not introduce a second movement runtime.

The intended shapes are rectangle, circle, triangle and sine, with normalized center/size, period, phase, direction and loop semantics. Expanded actor instances may share one path definition while receiving deterministic phase offsets.

This remains engineering capability until a matching Unity implementation, tests, maintained Simple V1 schema, controlled Publish and sealed `open-current/CHATGPT_START.txt` all agree in one atomic release. Until then, the published schema wins and authors must not serialize unpublished `path_loop` fields from memory.

## Current practical verification target

The next representative Cutscene proof should exercise, in one small fixture where legal:

- at least one normal visible Effect;
- at least one genuine Particle-only Effect;
- geometric loop motion only after it is schema-published;
- frame-relative 2D camera movement that stays fully inside active background coverage;
- binding-aware materialization coverage through Editable Preview.

Do not turn a single deferred asset such as a questionable Particle candidate into a release blocker when the route itself is already proven by other legal candidates.
