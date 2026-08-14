# STARWARS_DELTA Film Authoring Guide CURRENT

This is the filmmaking layer for Designer AI / Debora authoring. It complements the atomic CURRENT Director, Catalog contract and Instruction Book. It does not replace exact IDs, compatibility or schema validation.

## Core principle

A technically valid cutscene is not automatically a good or representative film.

Before producing final JSON, author in this order:

**Story -> visual world -> shot grammar -> exact asset selection -> semantic depth -> dialogue presentation -> VFX and audio pass -> film preflight -> contract validation -> JSON.**

Do not start by filling schema fields mechanically.

## 1. Story first

Write the dramatic progression in plain language before building JSON. The story should still read clearly if all asset IDs are removed.

For a narrative cutscene, define:
- beginning state
- change / dramatic beat
- ending state
- what the audience should understand or feel

Use variable shot duration according to dramatic purpose. Do not default to equal-duration blocks such as 10/10/10/10/10/10 unless the request is explicitly a technical timing test.

## 2. Build one coherent visual world

Exact visual identity is necessary but not sufficient.

For every important visual choice, inspect the real Atlas pixels and evaluate:
- art style
- camera/view angle
- perspective
- lighting and time of day
- world/location continuity
- scale relationship to neighboring elements
- whether the asset is concept/reference art or a usable world actor

Prefer a slightly less literal asset that belongs to the same visual world over a keyword-perfect asset that breaks perspective or style.

Example: a top-down shooter ship is usually a bad grounded eye-level landing asset beside a painterly street cafe, even if both are individually valid and visible.

## 3. Use only normal Director recommendations

The Director may retain questionable identities as evidence without recommending them for ordinary filmmaking.

Normal creative selection requires:

`recommendationStatus = RECOMMENDABLE`

Do not normally select:
- `PIXEL_COMPLETION_REQUIRED`
- `DO_NOT_RECOMMEND_PENDING_SOURCE_REVIEW`

Those are engineering states. The completion queue and eligibility audit belong to the Unity/publisher pipeline, not to the designer.

A `RECOMMENDABLE` entry still needs:
- the right role/capability
- the right runtime form
- actual pixel inspection for important visual choices
- compatibility with the surrounding visual world

## 4. Respect runtime form and role capability

Do not equate a visible image with a valid cast identity.

Before assigning Hero, SupportingCharacter or another world role:
- verify the selected Director entry supports the required capability
- verify `authoringRuntimeForm` is appropriate
- prefer CanonicalActor / proven world-actor forms for principal world actors
- do not use a concept/reference sprite as a Hero world actor merely because it depicts the desired identity

If the role requirement and capability disagree, choose another asset or report the gap. Do not rely on Preview fallback.

A UI portrait is not an Actor-primary cast identity. A visual evidence ID is not automatically a runtime ID.

## 5. Narrative role must match the actual pixels

Catalog metadata is evidence, not permission to ignore what the asset visibly is.

For principal roles such as fighter, asteroid, mothership, commander, robot, turret or structure:
- inspect the actual CURRENT pixels
- confirm the silhouette and perspective match the narrative role
- map the visual evidence to the exact legal runtime ID
- reject an unrelated visual even when its name or old metadata sounds plausible

Examples:
- a robot is not a fighter
- a vertical runway/structure is not a mothership
- a turret is not an asteroid
- a portrait is not a world Actor identity
- a Preview-safe asset may still be narratively wrong

If the actual pixels contradict the requested role, choose another verified CURRENT asset or report the gap. Never let a stale ID silently become an unrelated principal visual.

## 6. System-managed proportions

When an Actor has `systemManagedProportions=true`:
- authored `scaleX` and `scaleY` default to `1.0`
- authored scale is only a small deliberate multiplier around the semantic baseline
- never use scale to compensate for source PNG dimensions
- let Unity normalize the Actor into its semantic screen-space band

As an authoring sanity rule, values outside roughly `0.75-1.35` require a specific cinematic reason and should trigger review.

A giant/clipped actor is a RED preview failure even if a warning was logged and the Timeline continued playing.

## 7. Backgrounds are composition, not texture dimensions

For Background / FarBackground layers:
- choose a visual that fits the location and shot
- describe composition intent
- do not manually fix source image dimensions with arbitrary scale
- Unity owns Cover / framing and must keep coverage through camera motion

A location plate intended as the environment must cover the active frame. A small centered rectangle surrounded by black is a RED preview failure, not a harmless source-dimension issue.

Do not approve postage-stamp locations and do not compensate by manually scaling generated scene objects.

## 8. Plan the semantic depth stack

What appears above or below another element is part of the direction.

For every shot, establish an ordered stack such as:

**FarBackground -> Background -> distant world actors -> principal world actors -> foreground actors/effects -> Foreground -> dialogue portraits -> dialogue frame/text -> overlays.**

Before final JSON, verify:
- which ship is behind which ship
- whether a capital ship is a distant reveal or a foreground threat
- whether an explosion is behind, on or in front of its target
- whether foreground scenery may cover part of a subject
- whether portraits and text remain above world content

Do not rely on source Prefab renderer order. Nested renderers and old sorting orders are not cinematic direction.

Principal subjects must remain readable. Unintentional full occlusion is a RED preview failure.

## 9. Camera: express intent before numbers

Prefer semantic camera intent:
- Establishing / Wide / Medium / Close
- Hold / Follow / Push / Pull / Orbit / Dolly
- subject / target group
- camera purpose
- composition
- intensity
- transition

Where V3 Cinematic Camera Director is available, let it translate intent into Cinemachine. Avoid raw orthographic-size micromanagement unless required by the current production contract.

Use movement only when it reveals scale, follows important action, changes attention or increases tension. A clear static composition is better than ornamental motion.

Locked dialogue remains static Hold or cut-based Snap according to existing invariants.

## 10. Dialogue portraits are required visual content

Portrait dialogue is not successful when only the background and text box appear.

For `FACE_TO_FACE_PORTRAITS` or another portrait-capable preset:
- cast identity remains Actor-primary
- participants use dialogue-only presentation with `presentationMode=DialoguePortrait` and `spawnWorldActor=false`, unless an explicit temporally isolated `Both` case is valid
- speaker and listener portraits resolve through a compatible current tuple
- a required portrait failure must not silently degrade to text-only
- portraits remain inside the safe area
- dialogue frame/text must not cover them

A static text box over an empty command-room background is RED when portraits were requested.

## 11. Dialogue distance and line-specific composition

Use current semantic dialogue distance values when supported:
- `NEAR`
- `MID`
- `FAR`

Distance should produce deterministic visible differences in scale, crop, slot and visual priority. Do not imitate distance with arbitrary screen coordinates.

For locked dialogue:
- `actorActions` remain empty
- each line is static during its interval
- layout changes use explicit hard cuts / Snap / supported preset switches
- TWO_SHOT visibly shows two participants
- SPEAKER_FOCUS visibly emphasizes the speaker
- reaction close-up visibly changes the composition

Line-specific presentation intent must materialize. A 16-second dialogue shot may contain multiple static line layouts, but they cannot collapse into one unchanged text-box composition.

## 12. Effects need dramatic depth and purpose

For VFX, distinguish:
- distant/background battle
- midground environmental effect
- foreground impact
- effect attached to a target

An explosion must have:
- a dramatic function
- exact timing
- a target/anchor when supported
- semantic depth
- readable screen occupancy
- valid materialization
- bounded lifetime
- audio support when appropriate

A random explosion pasted over a ship is not a directed action beat. Principal explosions must not accidentally obscure every subject or appear above dialogue UI.

Do not fake distance only by shrinking the effect. Until semantic depth is supported directly by the contract, keep the intention explicit and treat unproven effect materialization as a preview quality issue.

## 13. Audio is first-class

Narrative cutscenes require an Audio pass when suitable CURRENT audio exists.

Consider:
- ambience
- engines / movement
- impacts / explosions
- alerts / UI
- music
- voice / comms when applicable
- intentional silence

Sound should reinforce the story transition. For example, a war-ending sequence may move from distant blasts -> engines -> landing -> engines shutting down -> quiet room ambience.

Audio is non-visual and must never be counted as a visual coverage gap.

Missing duration/mood/loop metadata may reduce planning precision, but a Catalog-safe AudioClip remains distinct from a missing visual preview.

## 14. Actor lifetime and generated ownership

A cutscene must read as one controlled active revision.

Expect:
- one active generated revision
- one owned instance per cast identity unless the contract explicitly requests more
- Exit/Deactivate removes or hides the owned actor
- actors from a previous location do not leak into the next location
- dialogue-only cast never creates world actors
- effects end with their owning interval

Multiple old revision roots, duplicate actors or earlier-shot objects contributing to Game View are RED infrastructure failures.

## 15. Current package identity is part of authoring correctness

Do not use an old JSON as a template merely because it says schemaVersion 5.

Before authoring, copy the exact current values from the atomic CURRENT contract:
- canonical schema name
- schemaVersion
- contextVersion
- catalogRevision
- snapshotContentHash
- contractRevision
- schemaHash

An old package may be used only as explicit migration/failure evidence. The production importer must either migrate it deterministically or reject it with a precise blocker. It must not silently accept stale identity and resolve unrelated visuals.

## 16. Preview must be representative

A successful JSON import is not the same as a representative Preview.

Treat preview states conceptually as:
- **GREEN**: principal visuals materialized, backgrounds cover, proportions are sane, depth is readable, required portraits exist, no required diagnostic fallback
- **YELLOW**: optional/non-principal degradation only
- **RED**: principal fallback, wrong visual role, clipped/giant actor, black background margins, missing required portrait, broken depth/occlusion, stale identity substitution or missing required materialization

Diagnostic yellow squares are debugging evidence, not acceptable principal art in a normal designer preview.

A warning in the status bar does not convert a visibly broken frame into an acceptable preview. A Timeline that plays can still be a failed movie.

## 17. FILM PREFLIGHT: mandatory before final JSON

Before delivering final JSON, confirm all of the following:

1. The story reads coherently without JSON.
2. Shot rhythm follows dramatic purpose rather than equal mechanical blocks.
3. Location continuity is intentional.
4. Every normal creative choice has `recommendationStatus=RECOMMENDABLE`.
5. Important visual choices were inspected as actual pixels.
6. Style, perspective and composition are compatible across the shot.
7. Principal narrative roles match the inspected pixels.
8. Cast roles match Director capabilities and runtime form.
9. System-managed actors use scale 1.0 by default.
10. Background coverage is delegated to Unity and the intended location fills the frame.
11. Semantic depth/occlusion intent is explicit and principal subjects remain readable.
12. Principal visuals have a proven materialization path; diagnostic fallback does not count as success.
13. Portrait dialogue visibly includes required participants.
14. TWO_SHOT / SPEAKER_FOCUS / reaction layouts are visibly distinct.
15. NEAR/MID/FAR dialogue intent uses supported semantics.
16. An Audio pass was performed for narrative scenes.
17. Camera instructions express semantic intent.
18. Effects have timing, target/purpose and dramatic depth.
19. Actor lifetime and location transitions are coherent.
20. The final package uses the exact CURRENT package identity and validates against the current contract.

If one of these fails, fix the plan before producing the final package.

## 18. Mars Cafe learning case: BAD evidence, 2026-08-14

The first Mars Cafe homecoming proof was useful BAD evidence.

What worked:
- unified Visual Atlas pixel inspection
- exact CURRENT IDs
- V5 validation/import
- real Mars cafe exterior and interior selection
- working location transition

What failed or degraded:
- top-down/concept ships composited into an eye-level painterly cafe world
- manual ship scale used instead of semantic proportions
- principal blue ships fell back to yellow diagnostic squares
- system-managed screen-space warning was allowed to remain
- background Cover was not preserved in normal Game preview
- distant VFX were not visually proven
- no Audio pass
- mechanically equal shot timing
- a Hero-role capability mismatch passed validation

Do not rewrite this BAD evidence into GOLDEN. Promote only recurring lessons. A separate corrected Mars Cafe version may become GOLDEN after Unity/Studio invariants, Director metadata and visual QA all pass.

## 19. Asteroid Wave / Mothership / Command Room learning case: BAD evidence, 2026-08-14

The first asteroid-wave and mothership proof is BAD evidence even though Cutscene Studio generated a Timeline.

Observed failures:
- location backgrounds rendered as small centered rectangles with black borders
- giant/clipped principal actors exceeded semantic occupancy
- fighter/mothership/asteroid narrative roles did not match the actual pixels
- nested renderer/sorting relationships produced unreadable occlusion
- objects from different beats appeared to overlap without intentional depth planning
- dialogue portraits disappeared while background and text remained
- TWO_SHOT / SPEAKER_FOCUS / reaction dynamics were not visibly materialized
- NEAR/MID/FAR portrait distance was absent
- explosions appeared as unintegrated overlays rather than targeted cinematic events
- old package/contract identity and manual scale values were used as if they were current authoring

Recurring lessons:
- background Cover is a visual acceptance invariant
- principal narrative role requires pixel verification plus legal runtime identity
- semantic depth and overlap must be planned before actions
- nested Prefab renderer order cannot be trusted as cinematic sorting
- a portrait preset must fail visibly/strictly when required portraits are absent
- line-specific locked dialogue changes must use cut-based presentation
- meaningful VFX need target, depth, timing and scale
- a Timeline that plays can still be a RED movie preview

Do not promote this raw BAD evidence directly to GOLDEN. A corrected version may become GOLDEN only after the same story is regenerated through the production pipeline and the Game View proves full-frame backgrounds, correct assets, readable scale/depth, visible portraits, dialogue distance dynamics and directed explosions.
