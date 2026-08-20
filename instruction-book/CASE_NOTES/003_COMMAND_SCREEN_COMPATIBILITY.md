# CASE 003 - COMMAND_SCREEN compatibility matrix

Status: REAL BLOCKER / CORRECTED PATTERN

Observed failure:
A 60-second package passed JSON parsing, schema validation, Catalog revision and exact asset resolution, but Editable Preview was blocked by dialogue semantic errors.

The mistake was choosing individually legal enum values that were not legal together.

BAD EXAMPLES
- COMMAND_SCREEN + DialogueWide + RADIO_SCREEN
- COMMAND_SCREEN + SPEAKER_FOCUS + DialogueCloseup + CLOSE_UP_SPEAKER

CURRENT CONTRACT PATTERNS FOR COMMAND_SCREEN
Compatible layouts:
- COMMAND_SCREEN
- TWO_SHOT

Compatible shot grammar:
- DialogueWide
- DialogueTwoShot
- RevealWide

Compatible camera presets:
- COCKPIT_WIDE
- TWO_PORTRAIT_SHOT
- OBJECTIVE_REVEAL

PROVEN CORRECTIONS USED IN THE TEST
- COMMAND_SCREEN + COMMAND_SCREEN + DialogueWide + COCKPIT_WIDE
- COMMAND_SCREEN + COMMAND_SCREEN + DialogueWide + TWO_PORTRAIT_SHOT

LESSON
Do not treat presentationPreset, layout, shotGrammar and camera shotPreset as four independent dropdowns. Read their compatibility matrix from the current authoring contract.
