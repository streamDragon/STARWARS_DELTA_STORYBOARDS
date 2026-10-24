# FLEET 30s — visual and native QA handoff
Status: SOURCE AUDIT COMPLETE / UNITY NOT RUN / NO NEW FILM ACCEPTED.
Source: workbench/projects/fleet30-camera/artifacts/fleet-last-volley-30s-v1-20261023-repaired.json
Source blob: e29adaaf2f97d4b96dff1c3e5ce817403c3a8bba
Target storyboard: https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/storyboard.html?session=fleet30-camera
CURRENT: read OPEN_CURRENT and CHATGPT_AUTHORING_INDEX freshly before building. Never invent new schema keys.

## Source inspection — exact failures
1. Eight authored beat durations are 5,4,4,4,4,4,3,2 (30s). Gun DETAIL at 5–9 and CHARGE at 9–13 are two beats, both with transition.style=cut. The requested uninterrupted 5–15 tracking shot is NOT represented by the source.
2. Fire beat is 13–17 and contains exactly three fire actions at offsets 0.35, 0.82, 1.29. Do not mistake these for three volleys. Their source target is fleet_target and projectile is CS_PROJECTILE_BLUE_BOLT.
3. Target travel beat is 17–21; impact beat is 21–25 and has three impact actions at offsets 0.3, 0.95, 1.6 on fleet_target. These are independently authored impacts, not evidence that the same projectile instances hit.
4. Anime Emotion MARK_VENTURE_01 occurs at t=10 for 0.6s with framing EYES and motionStyle SNAP_ZOOM; this can steal the camera during the intended gun-follow. FEMALE_COMMS_01 at t=24.2 is inside the impact beat, not a dedicated aftermath reaction.
5. Aftermath beat is 25–28 but camera.subject=fleet_battlecruiser rather than fleet_target; no persistent burn/smoke action is authored. Final wide is 28–30.
6. The native target prefab CS_FLEET_Invasion exists at Assets/_Game/MY_Core/MY_Cutscenes/Kits/EnemyFleet/CS_FLEET_Invasion.prefab, GUID 7d4f6ce180230ba4281025f5008d37c4. Existence was confirmed by Unity asset query earlier; its muzzle-child Transform binding has NOT been confirmed.

## Required native implementation (copy source; do not rewrite or delete the original)
A. Resolve a REAL gun child transform in CS_FLEET_Invasion and record exact hierarchyPath, world motion and orientation. Bind Cinemachine follow/look-at to that transform, not a proxy ship center.
B. Use one continuous camera track across 5–15. A single 10-second beat may be safer than two beats if the existing Studio writer creates a cut at every beat boundary. If splitting, test that CameraPlan and effective Timeline do NOT add a second camera shot at t=9 or t=11. No automatic slow zoom in place of the hard cut at t=5.
C. Move MARK_VENTURE_01 eyes to an editorial cut before 5 or after 15, or prove the overlay does not interrupt the continuous gun camera. Check identity handle, actual emotion pose and source portrait visually.
D. Keep exactly three fire actions from existing valid handles. Align the authored firing window with storyboard target 15–17. Check 3 distinct muzzle-origin events and the same fleet_target identity; count actual launches in frame.
E. Align flight 17–20, impacts 20–23, emotional reaction 23–26, aftermath 26–28, wide 28–30. Source has only 8 beats, target has 8 shots with a 10-second follow and separate reaction; do not merely change durations and call it done. Reauthor structure using legal V1 beats and verify total duration 30.
F. For every impact, preserve enemy state: impact point on target hull, smoke/burn/damage persists in 26–28 and 28–30. A flash alone is a failure.
G. Record Game View frames at t=0, 5, 9, 10, 14.9, 15, 16, 17, 20, 21, 22, 23, 24, 26, 28, 30, plus a 10s 5–15 clip. Save native capture provenance, project path, Unity version, source SHA, run ID.
H. QA must evaluate viewer comprehension with labels off: who is in danger, who decides, who fires, who is hit, what changed. Compare actual footage to approved target; report failures individually and iterate.
I. No source V1 change, Unity build, native frame capture, Cinemachine fix or visual acceptance was performed in this audit. STARWARS_DELTA Unity Pipeline was offline on latest check. Do not report BUILD PASS from this note.

## Agent handoff
Open AGENTS.md in canonical MAIN, resolve active integration owner and uncommitted scene state, then inspect the original prefab and Studio camera writer. Continue the native film only after this. Never overwrite an unsaved scene or alter GemaraGameDemo. Publish via the existing RunSmartPublish workflow when applicable.