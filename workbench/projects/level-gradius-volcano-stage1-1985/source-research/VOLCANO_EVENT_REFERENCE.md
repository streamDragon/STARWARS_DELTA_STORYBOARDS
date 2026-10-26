# VOLCANO_EVENT_REFERENCE · Gradius 1985

Original: two visible volcanic peaks before Big Core. Adaptation: one stationary mountain boss with two MLB_Gravitation muzzle origins (project decision, not original Konami implementation).

Evidence: https://www.youtube.com/watch?v=WJu9xSRh02g (nominal 110s two peaks; nominal 120s active eruption; nominal 130s original Big Core), and https://stat.ameba.jp/user_images/20221231/10/dbh-washi/ef/23/p/o1320098615223422835.png?caw=800 (two red peaks, many orange projectiles). These are samples, not transitions.

| Phase | What is supported | Unknown |
|---|---|---|
| APPROACH | Twin peaks are visible | Enter-world X and camera offset |
| SCROLL_PAUSE | Described in secondary references | Start frame, duration, whether both peaks already visible |
| ERUPTION_ACTIVE | Orange rocks above both peaks | First spawn time, alternation, simultaneous release, emitted count |
| EVENT_CLEAR | Big Core appears after volcano encounter | Exact stop condition and elapsed time |

**Gravity and trajectories:** static screenshot alone cannot establish gravity or a ballistic arc. Require tracks of same projectile over at least three timestamps, compensating camera movement, then fit `x(t)=x0+vx*t`, `y(t)=y0+vy*t+0.5*g*t*t`. Current emitter X/Y, initial velocities, angles, g, firing rate, rock lifetime are all UNKNOWN.

Rocks are described as destructible by shooting in the Japanese guide https://yuugikyo-rerise.net/gradius_stage1-4/ (SUPPORTED_MECHANIC). End the game's adapted boss when emissions cease and active hazards resolve is a **DESIGN_TARGET**, not verified Arcade timing. Original Big Core is out of scope.

Use existing MLB_Gravitation and WavesManager; no additional gameplay tool authorized.


## Primary sequential frames: phase 4

Downloaded original opening clip (00:00–00:21, 30fps), and the previously obtained primary clip (00:20–02:25, 30fps). For the second clip, 125 frames were extracted at 1fps (on top of the earlier 31 four-second samples). Terrain-edge correlation in frame coordinates indicates a stable scroll-free eruption section from approximately 112 to 133 recording seconds, but multiple earlier matches are ambiguous because terrain pattern repeats. The stop window is therefore approximate 110–113s and **not a verified frame-accurate timestamp**. No gravity constant, simultaneous release interval, number of rocks launched or fire cadence can be computed reliably from these observations. Source: https://www.youtube.com/watch?v=WJu9xSRh02g&t=112s .
