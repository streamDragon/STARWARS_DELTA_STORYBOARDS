# Designer AI CURRENT Architecture

This document is maintainer guidance only. It does not define authoring rules.

## Public runtime truth

Normal users, Debora and ChatGPT consume only:

- `designer-ai/open-current/OPEN_CURRENT.json`
- `designer-ai/open-current/CHATGPT_START.txt`
- the Director, Contract, Instruction Book and Visual Atlas referenced by that same published CURRENT

`designer-ai/debora.html` is the normal human entry point.

## Authoring compatibility identity

Studio NEW, REVISE and REPAIR envelopes compare only `requiredCurrent`:

- `catalogRevision`
- `contractRevision`
- `schemaHash`
- `snapshotContentHash`
- `authoringRuleRegistryRevision`

All five must match.

`publishTransactionId` is publication provenance. It identifies which publish produced an artifact, but it is not part of normal authoring compatibility. Republishing identical authoring content may legitimately produce a different transaction ID without creating a different authoring universe.

Public CURRENT therefore exposes both:

- `requiredCurrent`: the five compatibility fingerprints
- `provenance`: publish transaction and release/build provenance

Generated artifacts may also retain a strict `atomicIdentity` including `publishTransactionId` for publication-integrity checks inside one published transaction. Do not use that six-field publication identity as the Studio request compatibility gate.

Never mix Contract, Catalog, Schema, Rule Registry or snapshot content from different `requiredCurrent` identities.

## Internal publisher inputs

These repository files are publisher/build inputs and are not alternate public CURRENTs:

- `designer-ai/current.json`
- `designer-ai/CHATGPT_START.txt`
- `designer-ai/FILM_AUTHORING_GUIDE_CURRENT.md`
- `designer-ai/simple-authoring/*`
- `designer-ai/tools/*`
- `.github/workflows/publish-designer-ai-open-current.yml`

`designer-ai/current.json` remains required by the publisher pipeline until that pipeline is deliberately redesigned. Do not expose it as the normal authoring source.

## Git source edits versus published CURRENT

Git source guidance may be updated while Unity implementation work is in progress, but `designer-ai/open-current/**` is a generated atomic publication surface and must not be hand-edited to make it appear synchronized.

The ownership rule is:

```text
source guidance / Unity implementation changes
        -> local compile + Validate + Editable Preview proof
        -> user-controlled Publish CURRENT
        -> regenerated open-current artifacts + new compatible fingerprints
```

Do not manually copy a newer source instruction file into `open-current` while keeping the old `requiredCurrent` or Rule Registry fingerprint. That creates a mixed authoring universe even if the prose looks correct.

Recent runtime learning belongs first in the source guidance under `designer-ai/FILM_AUTHORING_GUIDE_CURRENT.md` and `designer-ai/simple-authoring/*`. It becomes official public CURRENT only through the normal user-owned Publish transaction.

## Runtime truth must constrain authoring guidance

Do not document semantic vocabulary as if the runtime already supports a stronger behavior than it actually does.

Current examples that must stay explicit in source guidance:

- Simple V1 semantic actor motion is compiled into existing V5 `actorActions`; it is not a second movement engine.
- actor `motionIntent=orbit` uses the existing V5 Orbit action, whose current Orbit v1 center is fixed/stationary.
- `CUTSCENE_ORBIT_CENTER_MOVES` remains a real blocker until a moving-center runtime exists.
- semantic Pursuit/Escort/Intercept wording does not by itself prove per-frame target-relative tracking; document only behavior implemented by the current Timeline writer.
- dialogue-only curated participants are composition/dialogue anchors, not WorldActors created merely for camera targeting.
- a Hold composition may preserve a semantic non-Actor subject without requiring a physical Transform target.

If runtime capability later expands, update the source guidance and validation truth together, then publish them atomically.

## Forbidden duplicate surfaces

Do not recreate public aliases such as:

- `designer-ai/OPEN_CURRENT.json`
- `designer-ai/chatgpt-current.json`

Do not add another CURRENT manifest, instruction path, package selector or compatibility pointer merely to preserve an old URL. Update callers to the single public `open-current` surface instead.

## Rule ownership

This file must not duplicate authoring business rules. Authoring behavior is owned by the matching Rule Registry, Contract and Instruction Book projection. The Film Guide is a checklist/guidance layer, not a competing rule source.

The files under `designer-ai/simple-authoring/` are engineering/source guidance for keeping the adapter, validation projection and public authoring model aligned. They must not be treated as a second public CURRENT.

## UI policy

Normal Designer AI flow is intentionally small:

1. Open Debora.
2. COPY FOR CHAT.
3. Describe the cutscene.
4. If ChatGPT cannot inspect public pixels, use the single CURRENT Visual Atlas PDF fallback.

Director archives and completion/eligibility artifacts are advanced engineering tools, not part of the ordinary designer flow.
