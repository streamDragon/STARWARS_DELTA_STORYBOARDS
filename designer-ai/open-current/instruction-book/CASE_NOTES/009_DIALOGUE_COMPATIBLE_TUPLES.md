# BAD -> GOOD: Dialogue compatibility is a tuple

## Real failure
RADIO_COMMUNICATION used a grammar and camera preset that were each listed as legal for the preset, but the pair itself was rejected by the real validator.

## BAD
Pick layout, shotGrammar and cameraPreset independently from three separate legal-value lists.

## GOOD
Choose one exact compatibleTuples entry exported for the selected presentationPreset.

## Lesson
A list of individually legal values is not enough when the validator enforces cross-field compatibility.
