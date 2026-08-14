# BAD -> GOOD: ShowUi / HideUi generated presentation targeting

## Earlier failure
A stress-test used Ui assets on ShowUi/HideUi but the generic event route treated them incorrectly. V2 fixed asset ownership to Ui.

## New real failure from Learning Case Inbox
The first V2 cold test then passed JSON/schema/catalog checks but failed during Editable Preview build:

`ShowUi/HideUi event seq04_show_radar has no explicit generated presentation target.`

The underlying compiler already creates a generated UI record from ShowUi, but the post-build validator expected ShowUi.targetEntityId even though the exported V2 authoring rule said only HideUi needed to target the ShowUi event.

## BAD
Treat ShowUi and HideUi as generic zero-duration point events or require ChatGPT to invent a second generated target ID.

## GOOD
- ShowUi.assetId is exact Ui-primary.
- ShowUi.eventId is the generated presentation identity. Unity binds targetEntityId to that same eventId when omitted.
- A later HideUi in the same owner targets that ShowUi eventId and normally omits assetId.
- If ShowUi.floatValue is not positive, Unity derives the visible duration from the matching HideUi; without HideUi it uses the remaining owner duration.

## Principle
Mechanical generated-presentation bookkeeping belongs to Unity, not to ChatGPT.
