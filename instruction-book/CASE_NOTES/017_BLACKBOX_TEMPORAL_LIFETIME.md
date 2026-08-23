# CASE 017 - Blackbox temporal lifetime leakage

## Observed
World actors and a station Layer leaked into later exterior shots when the JSON did not micromanage Exit/Deactivate. Other sequence-long layers were intentionally persistent.

## Architecture
Generated state is owner-bound. spawnWorldActor means an actor may exist, not that it is visible for the full Cutscene. Sequence Layer actions own sequence lifetime; shot-local Layer actions own shot lifetime unless they modify a sequence-owned layer.

## GOOD
Timeline activation is deterministic from current time. Actors begin hidden and become visible through Enter/Activate or the first documented visible world action. Exit/Deactivate hides. Owner end returns generated content to inactive.
