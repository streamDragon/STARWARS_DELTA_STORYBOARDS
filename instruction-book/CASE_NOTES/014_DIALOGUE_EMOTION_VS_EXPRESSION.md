# CASE 014 - Dialogue emotion is not expression

## Observed
A smoke test was blocked when an acting word such as `Determined` reached a dialogue emotion field.

## GOOD
Emotion fields use only:
- Serious
- Shock
- Anger
- Perplexed
- Sad
- Happy

Expression/reaction fields carry acting choices such as Determined, Concerned, Shocked or Relieved.

V2.2 also accepts a small set of unambiguous emotion aliases at the import boundary and normalizes them to canonical values, but new ChatGPT output should use the canonical vocabulary.
