# TOWER_ANIMATION_REFERENCE · Gradius Arcade Stage 1

This file is reference behavior only; prefab inheritance and weapon scripts belong to the central Unity agent.

## CUTE stationary turret

| State | Arcade evidence | Calibration |
|---|---|---|
| IDLE | Fixed terrain-mounted turret class, supported by Japanese gameplay guide | Duration UNKNOWN |
| AIM | Exact player-tracking or fixed muzzle rotation UNVERIFIED | Rotation/rate UNKNOWN |
| FIRE | Enemy projectiles supported by gameplay | Frame, cadence, direction UNKNOWN |
| FLASH | Visible-frame source not obtained | Presence/length UNKNOWN |
| RECOIL | No original motion proof | Presence/length UNKNOWN |
| RETURN | Cosmetic upgrade option, not arcade-proven | UNKNOWN |
| DESTROY | May require separate durability tests | Health/destruction animation UNKNOWN |

Source: https://yuugikyo-rerise.net/gradius_stage1-4/ . Existing `TOWER_MISSILES_CUTE` remains authoritative.

## SHIP SPAWNER hatch

Two hatch-like mounted devices are co-visible in https://stat.ameba.jp/user_images/20221231/09/dbh-washi/90/2f/p/o1320098615223422177.png?caw=800, one attached to ceiling, one to floor. A Japanese stage walkthrough describes one ceiling plus two floor launchers in a section; the third is not independently anchored.

| State | Original behavior and confidence | Source timing |
|---|---|---|
| CLOSED | Attached to terrain | UNKNOWN |
| OPEN | Hatch/door operation reported; precise geometry and cycle UNKNOWN | UNKNOWN |
| FIRST_SHIP | Must emerge relative to local hatch, not from global screen bounds | UNKNOWN |
| REPEAT | Formation count and launch separation UNKNOWN | UNKNOWN |
| OUTBOUND | Move outward roughly normal to mounted surface, supported by guide | Speed UNKNOWN |
| TURN | Adjust toward player's vertical position after initial departure, supported by guide | Delay/angle UNKNOWN |
| CLOSE | Ends local cycle | UNKNOWN |

Source: https://yuugikyo-rerise.net/gradius_stage1-4/ . This does not specify new scripts or prefab changes; no invented animation frame counts.
