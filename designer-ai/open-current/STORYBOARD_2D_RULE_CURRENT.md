# STARWARS_DELTA Storyboard 2D Rule CURRENT

## Status

MANDATORY for every storyboard, shot plan, cinematic staging request, cutscene composition, storyboard-derived JSON, and any ChatGPT/Designer AI film authoring for STARWARS_DELTA.

## Core rule

STARWARS_DELTA is a **2D game**. Think in 2D from the beginning.

Do not design a scene as if it were a 3D world and then try to flatten it afterward. Every storyboard frame and every camera/staging instruction must predict something the real 2D game can actually show with CURRENT assets and supported runtime behavior.

## Allowed 2D cinematic vocabulary

Use:

- X/Y screen position and movement
- sprite scale within supported/system-managed proportions
- left/right/up/down screen direction
- foreground, midground and background as 2D compositing/sorting layers
- semantic depth through layer order and relative scale, not geometry
- cuts and reaction cuts
- Wide / Medium / Close framing
- Hold / Follow / Track / Push / Pull / Pan when they operate on the 2D composition
- supported parallax
- side-view or top-view action only when the real asset pixels support that view
- dialogue portraits, overlays and monitor communication
- exact supported sprite/animation changes
- exact supported VFX, projectiles, flashes and explosions

## Forbidden 3D assumptions

Do not author or imply:

- camera orbit around an actor or object
- arbitrary perspective/Y-axis rotation of a flat sprite
- changing a sprite to a view angle that does not exist in CURRENT pixels
- moving the camera physically around or behind a flat object as if it had 3D geometry
- occlusion or blocking that depends on a true Z-axis volume
- depth-of-field logic that assumes real 3D distance
- a dolly/orbit/crane move whose visual result requires 3D geometry rather than 2D framing/parallax
- invented front/side/back views of an asset
- fake 3D staging used to compensate for a missing visual asset

## Storyboard reasoning rule

When the user asks for a storyboard, first translate the dramatic idea into a legal 2D composition:

**story beat -> exact CURRENT pixels -> 2D screen composition -> 2D movement/layering -> camera/framing intent -> storyboard -> JSON**

Never use this order:

**imagined 3D movie -> flatten it -> hope Unity can fake it**

If an idea works only in 3D, redesign the shot in 2D. Use cuts, scale changes, parallax, screen direction, reaction shots, portrait inserts, foreground silhouettes, background reveals, effect timing, or a different exact asset rather than inventing geometry the game does not have.

## Depth clarification

Foreground / midground / background remain useful cinematic concepts, but in STARWARS_DELTA they mean **2D layer/sorting/composition relationships**. They are not permission to assume a true 3D scene.

A capital ship can feel distant because it is smaller, behind other layers, slower, partially obscured by a foreground layer, or revealed by a pullback. It must not require the camera to circle around it.

## Acceptance rule

Before delivering a storyboard or final JSON, ask:

**Could this exact shot be represented by the game's real 2D assets without inventing a new view angle or 3D geometry?**

If the answer is no, redesign the shot before delivery.
