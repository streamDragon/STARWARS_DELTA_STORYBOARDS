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
- `designer-ai/tools/*`
- `.github/workflows/publish-designer-ai-open-current.yml`

`designer-ai/current.json` remains required by the publisher pipeline until that pipeline is deliberately redesigned. Do not expose it as the normal authoring source.

## Forbidden duplicate surfaces

Do not recreate public aliases such as:

- `designer-ai/OPEN_CURRENT.json`
- `designer-ai/chatgpt-current.json`

Do not add another CURRENT manifest, instruction path, package selector or compatibility pointer merely to preserve an old URL. Update callers to the single public `open-current` surface instead.

## Rule ownership

This file must not duplicate authoring business rules. Authoring behavior is owned by the matching Rule Registry, Contract and Instruction Book projection. The Film Guide is a checklist/guidance layer, not a competing rule source.

## UI policy

Normal Designer AI flow is intentionally small:

1. Open Debora.
2. COPY FOR CHAT.
3. Describe the cutscene.
4. If ChatGPT cannot inspect public pixels, use the single CURRENT Visual Atlas PDF fallback.

Director archives and completion/eligibility artifacts are advanced engineering tools, not part of the ordinary designer flow.
