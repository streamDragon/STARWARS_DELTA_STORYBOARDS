# GRADIUS boss gun binding QA — 27 Oct 2026

Read-only Unity Editor asset inspection, with active unrelated scene left intact.

- GRADIUS_VOLCANO_MOUNTAIN_BOSS.prefab: LEFT_CRATER_MLB_GRAVITATION has 3 MY_FireBullet points, 0 missing Shot assets. RIGHT_CRATER_MLB_GRAVITATION has 3 MY_FireBullet points, 0 missing Shot assets. All six point to B_Gravitational.prefab.
- Shared MLB_Gravitation.prefab: 40 MY_FireBullet points, 0 missing Shot assets.
- Previous Play log includes cached runtime emitters with diagnostic blocked-shot-missing-MY_ShotBase alongside other points with spawned-local. This does NOT prove that the saved boss prefab has broken serialized references. It suggests a runtime/pooling lifecycle issue or stale cached instances, still unverified.
- No changes made to original MLB or GRADIUS boss prefab. Do not patch them blindly. Test runtime cached emitter creation/reuse separately.
- Prior Play6 established floor SILO released 3 ships and volcano boss ultimately reached DeadDespawned. Ceiling SILO and robot traversal not yet proven.
- Status: SERIALIZED_PROJECTILE_REFERENCES_PASS; RUNTIME_CACHED_EMITTER_QA_PENDING.
