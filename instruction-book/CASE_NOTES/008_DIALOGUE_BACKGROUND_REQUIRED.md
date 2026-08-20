# BAD -> GOOD: Visual dialogue requires an explicit background

## Real failure
COMMAND_SCREEN and RADIO_COMMUNICATION lines passed JSON Schema but were blocked by the dialogue validator because stage.backgroundAssetId was omitted.

## BAD
Assume the dialogue renderer will always infer a usable background.

## GOOD
When the selected presentation preset exports backgroundRequired=true, author one exact Preview-safe Layer-primary stage.backgroundAssetId.

## Lesson
Schema validity does not satisfy conditional presentation requirements. Follow the current exported presentation semantics.
