# FLEET 30s REV3 source test receipt

- NEW film source: `FLEET_YAMATO_CAMERA_30S_REV3_V1.json`, derived from earlier proxy-only V1; old films untouched.
- Scene beats [5,4,4,4,4,4,3,2] = 30 seconds; 3 fire actions in beat 4 with offsets 0.35,0.82,1.29, from two authored actors toward one target; 3 target-anchored impact actions in beat 6 at offsets 0.30,0.95,1.60. Target appears in aftermath shots 7 and 8. These are authored actions, not observed visual effects.
- TDD: initial test RED due absent source; generated candidate; source-level test GREEN. AJV first RED due illegal `saliency=secondary`, corrected to valid `support`; second run AJV 8.20.0 schema PASS, errors 0; source-level test PASS.
- Native lint attempt `unity command eval_file lint_rev3.eval.cs 14000 ... --timeout 23` failed as a transport timeout after 23000ms; no native lint PASS/FAIL established. Do not retry while shared Editor is busy.
- Native Import/Build, Cinemachine moving barrel, muzzle flash/charge, target-specific visible damage, playback captures, Film QA, save/reopen remain NOT RUN.
- FLEET prefab remains a separate original real asset; candidate cast still uses temporary blue sprite proxy. No original FLEET instance binding proven.
- No MAIN Assets edit, Publish or Plastic check-in.
