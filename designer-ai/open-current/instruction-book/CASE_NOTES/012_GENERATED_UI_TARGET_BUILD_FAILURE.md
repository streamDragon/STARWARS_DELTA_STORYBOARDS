# REAL LEARNING CASE: generated UI target blocked build

## Source
Learning Case Inbox case `case_10373cc597a4b6d0`, captured during the first Instruction Book V2 cold test.

## What passed
The package passed JSON parsing, schema validation, catalog revision handling, exact asset resolution, animation compatibility, dialogue compatible tuples, and Preview normalization.

## Actual blocker
Editable Preview generation failed after build validation with:

`ShowUi/HideUi event seq04_show_radar has no explicit generated presentation target.`

## Root cause
The V2 exported authoring rule said ShowUi creates a generated UI presentation and HideUi targets the ShowUi eventId. Runtime projection already creates a UI item keyed by ShowUi.eventId, but post-build validation still required ShowUi.targetEntityId explicitly. In addition, the legacy projection uses ShowUi.floatValue as UI visibility duration, while the generic event rule described events as point actions.

## Core fix
Unity now owns the mechanical bridge:
1. Missing ShowUi.targetEntityId is normalized to ShowUi.eventId.
2. A matching later HideUi can define the ShowUi visibility duration.
3. Without a matching HideUi, a zero-duration ShowUi remains visible to the end of its owner.
4. HideUi with an invalid target is omitted with a yellow warning rather than destroying the Preview.
5. The exported contract now documents that UI event targetEntityId is a generated-UI reference, not a cast reference.

## Reusable lesson
Do not make ChatGPT satisfy internal generated-object bookkeeping that Unity can derive deterministically.
