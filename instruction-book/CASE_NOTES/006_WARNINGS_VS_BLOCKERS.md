# CASE 006 - Optional warnings versus real blockers

Status: UX / AUTHORING LESSON

Observed result:
The Studio could report many optional yellow details while a smaller number of true dialogue semantic errors blocked Editable Preview.

COMMON YELLOW NOTES
- missing voice clip, timed text still works;
- portrait not marked closeUpSuitable, fallback exists;
- human-review Catalog note;
- optional visual fallback.

REAL BLOCKER EXAMPLE
- presentationPreset/layout/shotGrammar/camera combination violates the current dialogue semantics contract.

LESSON
Do not regenerate a whole Cutscene because of yellow notes. Fix or simplify true blockers first. The product UI should also make the blocker count visible separately from optional warnings.
