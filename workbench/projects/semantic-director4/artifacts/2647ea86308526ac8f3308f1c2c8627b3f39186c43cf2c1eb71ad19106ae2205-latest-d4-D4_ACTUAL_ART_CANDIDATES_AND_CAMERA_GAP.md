# System 4: asset verification and camera-path gap, 2026-10-22

## Verified findings
- Native V1 public schema contains only `schema, schemaVersion, schemaHash, authoringRuleRegistryRevision, title, durationSeconds, creativeIntent, animeEmotion, moves, cast, beats` at root. There is no `cameraPlan`, `cameraSequence`, or `spatialPlan` root authoring field. Do NOT invent one in V1 and silently expect Cinemachine to work.
- The 96-second test movie emits `V3_CAMERA_PLAN_NOT_AUTHORED`; it runs the legacy Timeline camera track. Correct repair is in existing V1-to-backend camera routing and/or its supported per-beat camera input, once validated, not a new V1 schema.
- PUBLIC CURRENT 936-handle index contains `man_1_0__79ff72e4` and `man_2_0__e68f2d19`, both route Actor, ResolverVerified, Sprite, source `DGraphics/SPACESTATION`.
- A suitable *candidate* for giant-ship art is `nautolan_ship__battlecruiser__077dccca`, Actor Prefab from Foozle, but evidence status is `NeedsReview`, NOT ResolverVerified. Its base/shield variants are `AutoOnlyExcluded`. Do not substitute those without unity resolver evidence.
- Explosion candidate `evac_explosion_v1__4df82d70` is an Effect, ResolverVerified Sprite. It must be authored through a legal Effect role, never as an Actor cast identity.
- Existing tiny fighter `spaceship_p1__0abe8156` is ResolverVerified but is not evidence of giant size. Visual scale must compare in frame and across camera transitions.
- Runtime visual proof still requires actual Unity materialization, screenshot, 3D/sprite relative transform scale, explosion timing, person reactions, and PlayMode.

## Recommended next controlled candidate
1. Clone, do not overwrite, `THE_LAST_EVACUATION_D4_96S_DIRECTED_CUTSCENE_SCRIPT_V1.json`.
2. Bind only the actual verified human Sprite to the PILOT role first, preserving cinematic semantics; select role/story beats that actually show the person.
3. Probe battlecruiser source via Unity AssetDatabase and resolver; if unavailable, retain a visible placeholder with warning, do not silently use normal fighter.
4. Use per-beat camera fields that the present V1 schema supports, but first trace whether the backend consumes them into Cinemachine spatial plan. A V1 camera field does not itself guarantee camera tracking.
5. STRICT Lint, Build, Film QA comparisons at t=0/12/24/36/48/60/72/84/96, then PlayMode separately.

## State
Asset candidates researched from PUBLIC CURRENT. Unity engine integration and visual verification of these new candidates: PENDING. Do not mark a visual improvement achieved until new screenshot evidence exists.