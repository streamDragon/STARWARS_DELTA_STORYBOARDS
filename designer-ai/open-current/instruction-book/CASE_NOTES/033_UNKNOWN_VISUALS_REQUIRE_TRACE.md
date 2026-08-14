# 033 - Unknown generated visuals must be traced before they are "fixed"

## Evidence

Visual QA repeatedly exposed a large gray rectangle in generated frames. The selected Timeline track showed that tactical UI was active in at least one reviewed frame, but that does not prove the gray rectangle's exact source.

## Rule

Do not encode folklore into authoring rules from an unidentified visual artifact.

Before changing content or teaching ChatGPT a new rule, trace the object through existing generated debug metadata:

- generated GameObject
- category
- source action/event/entity ID
- requested assetId
- semantic type/preset
- owner
- placeholder/built-in state

Yellow unresolved placeholders are intentional diagnostics. A non-yellow unknown rectangle must be identified before a specific runtime/content fix is made.
