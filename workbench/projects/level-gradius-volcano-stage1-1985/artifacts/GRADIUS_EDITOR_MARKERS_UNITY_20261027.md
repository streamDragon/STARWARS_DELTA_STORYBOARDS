# GRADIUS Unity panorama fixture guides, 27 October 2026

Source: source-research/GRADIUS_PANORAMA_FIXTURE_CANDIDATES.json, 21 candidate ranges (11 gun, 5 hatch, 5 unknown).

Unity 6000.7.0b6 editor evaluated a one-off script to author 21 **EditorOnly** labelled markers under GameSceneLayers/Layer0/GRADIUS_VIDEO_CANDIDATES_EDITOR_ONLY, in three lanes CUTE_CANDIDATE, SILO_CANDIDATE, UNKNOWN.

Unity returned: `PASS markers=21 editorOnly=true gameObjectTowersAdded=0`.

These are NOT gameplay tower placements. Video pixel X is scaled to a visual guide rail only, elevated outside the playable corridor. No source-map-to-Unity calibration is claimed. No additional enemies/waves/Prefab overrides were made.

Plastic workspace on /main advanced from cs:9564 to cs:9565 during work, and a path-scoped checkin returned `There are no changes in the workspace`. Therefore we **do not attribute cs:9565 to this script**; verify changeset content or saved scene object state before asserting that it is checked in. Editor reported SaveScene success and scene file remains under existing GRADIUS path.

Next: verification of marker persistence plus Play QA of ceiling silo and robots. Original Gradius one-to-one location measurement remains source agent's work.
