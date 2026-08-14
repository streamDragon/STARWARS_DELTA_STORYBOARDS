# STARWARS_DELTA Film Authoring Guide CURRENT

This is the filmmaking layer for Designer AI / Debora authoring. It complements the atomic CURRENT Director, Catalog contract and Instruction Book. It does not replace exact IDs, compatibility or schema validation.

## Core principle

A technically valid cutscene is not automatically a good or representative film.

Before producing final JSON, author in this order:

**Story -> visual world -> shot grammar -> exact asset selection -> audio pass -> film preflight -> contract validation -> JSON.**

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

## 3. Respect runtime form and role capability

Do not equate `recommendable` with valid for every cast role.

Before assigning Hero, SupportingCharacter or other cast roles:
- verify the selected Director entry supports the required capability
- verify `authoringRuntimeForm` is appropriate
- prefer CanonicalActor / proven world-actor forms for principal world actors
- do not use a concept/reference sprite as a Hero world actor merely because it depicts the desired identity

If the role requirement and capability disagree, choose another asset or report the gap. Do not rely on Preview fallback.

## 4. System-managed proportions

When an Actor has `systemManagedProportions=true`:
- authored `scaleX` and `scaleY` default to `1.0`
- authored scale is only a small deliberate multiplier around the semantic baseline
- never use scale to compensate for source PNG dimensions
- let Unity normalize the Actor into its semantic screen-space band

As an authoring sanity rule, values outside roughly `0.75-1.35` require a specific cinematic reason and should trigger review.

## 5. Backgrounds are composition, not texture dimensions

For Background / FarBackground layers:
- choose a visual that fits the location and shot
- describe composition intent
- do not manually fix source image dimensions with arbitrary scale
- Unity owns Cover / framing and must keep coverage through camera motion

A representative preview should not show postage-stamp backgrounds surrounded by black unless that framing is deliberately requested.

## 6. Camera: express intent before numbers

Prefer semantic camera intent:
- Establishing / Wide / Medium / Close
- Hold / Follow / Push / Pull / Orbit / Dolly
- subject / target group
- camera purpose
- composition
- intensity
- transition

Where V3 Cinematic Camera Director is available, let it translate intent into Cinemachine. Avoid raw orthographic-size micromanagement unless required by the current production contract.

Locked dialogue remains static Hold or cut-based Snap according to existing invariants.

## 7. Effects need dramatic depth

For VFX, distinguish the dramatic layer:
- distant/background battle
- midground environmental effect
- foreground impact

Do not fake distance only by shrinking the effect. Until semantic depth is supported directly by the contract, keep the intention explicit and treat unproven effect materialization as a preview quality issue.

## 8. Audio is first-class

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

## 9. Preview must be representative

A successful JSON import is not the same as a representative Preview.

Treat preview states conceptually as:
- **GREEN** - principal visuals materialized, backgrounds cover, proportions are sane, no required diagnostic fallback
- **YELLOW** - optional/non-principal degradation only
- **RED** - principal actor fallback, invalid role capability, broken location-critical background, missing required materialization, or other failure that changes what the film means

Diagnostic yellow squares are debugging evidence, not acceptable principal art in a normal designer preview.

## 10. FILM PREFLIGHT - mandatory before final JSON

Before delivering final JSON, confirm all of the following:

1. The story reads coherently without JSON.
2. Shot rhythm follows dramatic purpose rather than equal mechanical blocks.
3. Location continuity is intentional.
4. Important assets were inspected as pixels.
5. Style, perspective and composition are compatible across the shot.
6. Cast roles match Director capabilities and runtime form.
7. System-managed actors use scale 1.0 by default.
8. Background coverage is delegated to Unity, not source-size compensation.
9. Principal visuals have a proven materialization path; diagnostic fallback does not count as success.
10. An Audio pass was performed for narrative scenes.
11. Camera instructions express semantic intent.
12. Effects have a clear foreground/midground/background dramatic purpose.
13. The final package validates against the exact CURRENT contract and atomic identity.

If one of these fails, fix the plan before producing the final package.

## Mars Cafe learning case - 2026-08-14

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
