# BAD -> GOOD: Location transition cleanup

## Real failure
A valid Preview moved from a corridor/hangar beat into space, but the previous corridor, Doctor and robot remained visible over the space background.

## BAD
Activate the next location and keep previous location layers/world actors alive by accident.

## GOOD
For a genuine location change, explicitly end the old composition before the new one becomes readable:
- Exit or Deactivate world actors that do not continue.
- Deactivate/replace old location layers.
- Then activate the new location and its continuing actors.

## Lesson
Location continuity is semantic state, not just a new background asset.
