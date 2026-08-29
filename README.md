# STARWARS_DELTA External Tools Hub - CURRENT

Use one permanent public URL only:
https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/

This repository is the shared home for STARWARS_DELTA tools and artifacts that live outside the Unity workspace.

Current areas:
- Storyboard shared library / deep-link viewer
- Cutscene Preview
- Designer AI / DEVORA CURRENT

## Storyboard ownership

There is exactly one normal Storyboard authoring UI: **Storyboard Director**.

The public Pages site is not a second Storyboard authoring application. It keeps only the shared published Storyboard library, the deep-link `viewer.html`, and published Storyboard data under `storyboards/`.

## Designer AI CURRENT

There is one live CURRENT projection:

- `designer-ai/current.json` - publish pointer/provenance
- `designer-ai/devora.html` - normal human entry point
- `designer-ai/simple-preview.html` - web preflight only
- `designer-ai/open-current/` - one atomic published CURRENT

Normal authoring must not use duplicate CURRENT trees or remembered copies.

The normal ChatGPT instruction source consumed by Devora is the sealed publish copy:

- `designer-ai/open-current/CHATGPT_START.txt`

Publisher/engineering source lives under:

- `designer-ai/tools/current-source/CHATGPT_START.txt`
- `designer-ai/tools/current-source/FILM_AUTHORING_GUIDE_CURRENT.md`
- `designer-ai/tools/current-source/simple-authoring/`

The Simple V1 source directory is the only source location for the schema, canonical example, architecture and Simple authoring policies. Do not recreate duplicate copies at `designer-ai/tools/current-source/` root.

For normal ChatGPT cutscene authoring use only the matching published CURRENT:

- `designer-ai/open-current/OPEN_CURRENT.json`
- `designer-ai/open-current/CHATGPT_START.txt`
- `designer-ai/open-current/simple-authoring/CUTSCENE_SCRIPT_V1.schema.json`
- `designer-ai/open-current/simple-authoring/AUTHORING_HANDLES.json`
- `designer-ai/open-current/simple-authoring/AUTHORING_RULES_CURRENT.json`
- `designer-ai/open-current/EMOTIONAL_DIALOGUE_CURRENT.json`
- `designer-ai/open-current/CUTSCENE_VALIDATION_CURRENT.json`
- the matching Director projection and visual evidence

`requiredCurrent` is the compatibility identity. `publishTransactionId` is provenance.

## FULL versus DELTA publish

FULL Publish rebuilds heavy source-truth projections when their fingerprints actually changed: Catalog/Director/Visual evidence/Atlas and the rest of the atomic CURRENT.

DELTA Publish is the fast authoring/guidance path. When `requiredCurrent` is unchanged it:

- reuses the existing `open-current` base;
- applies only declared changed authoring artifacts;
- does not rebuild Catalog, Director, Visual evidence or Atlas;
- does not re-upload the unchanged base bundle.

DELTA must refuse heavy/source-truth artifacts or a fingerprint mismatch and require FULL instead.

`designer-ai/tools/apply_delta_current.py` owns this fast path. `.github/workflows/publish-designer-ai-open-current.yml` selects FULL or DELTA from `designer-ai/current.json`.

## Runtime / Timeline authoring boundary

`CUTSCENE_SCRIPT_V1` remains the sole public authoring format. V3/V5 and Unity Timeline remain backend implementation.

Current durable execution invariants are documented in:

- `designer-ai/tools/current-source/simple-authoring/ARCHITECTURE.md`
- `designer-ai/tools/current-source/simple-authoring/CUTSCENE_GOLDEN_QA_POLICY.md`

Important consequences:

- every legal `visible[]` request is an audience-visible obligation;
- a legal visible Effect does not require a secret `reveal` action merely to exist;
- generated representation, binding and interval coverage must be complete for a candidate to be accepted;
- a bad new candidate must not destroy the last valid Editable Preview;
- cinematic movement is composed relative to the active camera viewport/frustum, not an arbitrary small Stage rectangle;
- native Timeline tracks are preferred where they are the correct single owner, while project-specific tracks remain where native Timeline cannot express the semantics.

The Unity/Plastic workspace remains canonical for the runtime implementation. This Git repository documents and publishes the authoring contract; it does not duplicate Unity runtime source.

## Plastic runtime / Git guidance boundary

The Unity project, Cutscene Studio implementation, Timeline/Cinemachine materialization, Workshop persistence, runtime bindings and Golden regression runner live in the canonical Plastic workspace.

This Git repository does not mirror those runtime sources. Its responsibility is the maintained authoring/publishing guidance and the controlled CURRENT publication surface.

Stable legal Golden fixtures are runtime specifications: when backend/engine execution is wrong, repair the system against the same fixture instead of rewriting legal authored JSON to make a broken path appear successful. Fixture names, beat IDs and timestamps must never become production special cases.

Compile-only success is not movie-quality proof. `PASS` for a Golden Cutscene requires actual Unity execution of the final saved/reopened Editable Preview. `SOURCE_READY` and `NOT_RUN` remain honest engineering states when runtime execution was not performed.

## Devora Context Pack

The normal Devora Context Pack is self-contained for authoring and includes the sealed start instructions, Simple V1 schema/handles/rules/canonical example, closed-world Emotional Dialogue CURRENT when published, Cutscene Validation CURRENT, Director projections, and matching Visual Atlas evidence.

The large engineering archives remain Release assets rather than normal ChatGPT downloads.

## Simple Preview

`designer-ai/simple-preview.html` is a web preflight/visual preview for `CUTSCENE_SCRIPT_V1`.

It may report:
- `SCRIPT_INVALID`
- `CURRENT_INVALID`
- `AUTHORING_INVALID`
- `PREVIEWABLE`

It must never claim `UNITY_VALIDATED` or `PREVIEW_ACCEPTED`; Unity remains final runtime authority.

## Repository hygiene policy

This repository is not a museum of abandoned CURRENT generations.

Keep only:
1. active production/UI/publisher sources;
2. the one current atomic `open-current` projection;
3. durable authoring/engineering guidance that is still referenced;
4. unique regression/learning evidence that still proves behavior;
5. published Storyboard data and the minimum viewer surface required to consume it.

Delete task-specific prompts, temporary QA pages, superseded handoff documents, stale baseline snapshots, duplicate CURRENT aliases, duplicate publisher-source copies and obsolete parallel UIs once their durable lesson has been absorbed into active guidance, tests or implementation.

Do not manually edit `designer-ai/open-current/**` as cleanup. It is a generated atomic publication surface and changes only through the controlled FULL/DELTA publish workflow.
