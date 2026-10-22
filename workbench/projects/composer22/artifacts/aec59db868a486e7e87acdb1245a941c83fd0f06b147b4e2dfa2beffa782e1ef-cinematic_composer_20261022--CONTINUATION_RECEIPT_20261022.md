# Cinematic Composer continuation | 2026-10-22

Scope: isolated Composer preparation under STARWARS_DELTA_WORK. Canonical Unity MAIN and public site are not mutated by this code patch.

## Existing state recovered
- GitHub workbench cinematic-system-integration session revision 5; last completed action was 37/37 web tests and a coherent HEAD-pinned public reader.
- Workbench site: https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/workbench.html?id=cinematic-system-integration
- Native CAMERA D1 still PREPARED_NOT_INSTALLED. Last fresh native status report had an unsaved GRAD1 dialog id32, no supported native dismissal.
- Composer source was only staged. Six-shot FLEET_VOLLEY_22 writer launched three fire actions in FIRE and three *additional* fire actions in TRAVEL.
- Existing isolated 15/15 tests were green but asserted six projectiles, accepting the duplicate volley.

## Changes implemented in WORK staging
1. source/MY_CinematicComposerShotWriter.cs: removed three duplicate fire actions from TRAVEL; TRAVEL now declares explicit continuity of the three earlier projectiles and real source-to-target flight as visual requirements. This is authoring-planner intent only and does not itself create persistent runtime projectile identities.
2. tests/Program.cs: count exactly 3 fire actions; assert TRAVEL has no new fire and requires continuity; ensure attack precedes travel and target impact.
3. Test command: C:/Program Files/Unity/Hub/Editor/6000.7.0b5/Editor/Data/DotNetSdk/dotnet.exe run --project WORK/qa/cinematic_composer_20261022/tests/ComposerCoreTests.csproj --no-restore.
4. Original result: 15 PASS, 0 FAIL. After patch result: 15 PASS, 0 FAIL. This is isolated .NET code, not Unity Editor EditMode/Test Runner, native STRICT, Game View, or film acceptance.

## Native caveat and exact next action
The canonical CUTSCENE_SCRIPT_V1 film materializer may end live projectiles at beat boundaries. Merely recording continuity in VisualRequirements cannot prove the same projectile instances survive FIRE->TRAVEL. Do not emit a finished V1 or mark native PASS from this fix. Next implement actual CURRENT bindings and canonical V1 lowering; make one new native 22s candidate; after Unity ownership and dialog resolution, verify the same projectile IDs/positions over the shot boundary, barrel follow at t=5.5, hit and aftermath in actual Game View, and manual save/reopen. All runtime/capture/acceptance remain NOT_RUN.
