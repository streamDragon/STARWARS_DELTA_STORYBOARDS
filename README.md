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

Normal authoring must not use duplicate CURRENT trees, archived contracts, Instruction Books, request-scoped candidate packs, old Catalog contracts or remembered copies.

The normal ChatGPT instruction source consumed by Devora is the sealed publish copy:

- `designer-ai/open-current/CHATGPT_START.txt`

There is no second `CHATGPT_READ_FIRST.txt` entrypoint, no legacy Director-pack authority and no request-scoped `context-pack` authority.

### Normal movie flow

1. The designer supplies the natural-language movie request.
2. Devora/ChatGPT reads the matching CURRENT and authors exactly one `CUTSCENE_SCRIPT_V1` JSON.
3. Unity lowers Simple V1 through the backend layers, validates it, builds the Editable Preview and runs it.
4. V3/V5, raw Actor IDs, raw Animation IDs and runtime bookkeeping are backend implementation, not NEW authoring vocabulary.
5. A Request Report / COPY REQUEST is **not** part of normal NEW authoring.
6. REPAIR begins only after Unity rejects a specific candidate and supplies diagnostics. A legal Simple V1 fixture is not rewritten merely to hide a backend/engine defect.

The Hub `COPY FOR CHAT` control is the normal handoff. It explicitly points ChatGPT to sealed CURRENT and asks for a real downloadable `.json` output.

Publisher/engineering source lives only under:

- `designer-ai/tools/current-source/CHATGPT_START.txt`
- `designer-ai/tools/current-source/FILM_AUTHORING_GUIDE_CURRENT.md`
- `designer-ai/tools/current-source/simple-authoring/`

The Simple V1 source directory is the only source location for schema, canonical example, architecture and maintained authoring policies. Sealed public guidance must be byte-identical to its maintained source counterpart; CI rejects drift.

For normal ChatGPT cutscene authoring use only the matching published CURRENT:

- `designer-ai/open-current/OPEN_CURRENT.json`
- `designer-ai/open-current/CHATGPT_START.txt`
- `designer-ai/open-current/FILM_AUTHORING_GUIDE_CURRENT.md`
- `designer-ai/open-current/simple-authoring/CUTSCENE_SCRIPT_V1.schema.json`
- `designer-ai/open-current/simple-authoring/AUTHORING_HANDLES.json`
- `designer-ai/open-current/simple-authoring/AUTHORING_RULES_CURRENT.json`
- `designer-ai/open-current/simple-authoring/CINEMATIC_INTENT_QA_RULES.json`
- `designer-ai/open-current/EMOTIONAL_DIALOGUE_CURRENT.json`
- `designer-ai/open-current/CUTSCENE_VALIDATION_CURRENT.json`
- the matching Director projection and visual evidence

`requiredCurrent` is compatibility identity. `publishTransactionId` is provenance.

### Downloadable authoring package safety

The previous release authoring ZIP was generated from a request-scoped legacy/debug context pack whose instructions still described NEW/REVISE/REPAIR envelopes and raw V5-style authoring. That package is therefore not exposed by the Hub as a normal authoring entry.

The Hub keeps `COPY FOR CHAT`, CURRENT, Visual Library and Atlas access available. `DOWNLOAD DEVORA AUTHORING PACKAGE` remains blocked until the Unity publisher produces a clean Simple V1 package from the maintained CURRENT sources above. A future package must not become authoritative merely because it exists; its guidance must match canonical Simple V1 CURRENT.

## FULL versus DELTA publish

FULL Publish rebuilds heavy source-truth projections when their fingerprints actually change: Catalog/Director/Visual evidence/Atlas and the rest of the atomic CURRENT.

DELTA/lightweight guidance publish is the fast path when `requiredCurrent` is unchanged. It:

- reuses the existing heavy `open-current` base;
- applies maintained authoring/guidance artifacts;
- does not rebuild Catalog, Director, Visual evidence or Atlas;
- sanitizes obsolete authoring surfaces before publication.

FULL is required only when heavy/source-truth artifacts or compatibility fingerprints actually changed.

A guidance cleanup does not require an unrelated Catalog Full Scan or Vision Batch.

## Runtime / Timeline boundary

`CUTSCENE_SCRIPT_V1` is the sole normal public movie-authoring format. V3/V5, Timeline, Cinemachine wiring, bindings, projectile receivers and Golden runner implementation remain backend/runtime implementation.

Durable execution architecture is maintained in:

- `designer-ai/tools/current-source/simple-authoring/ARCHITECTURE.md`

Important consequences:

- every legal `visible[]` request is an audience-visible obligation;
- a legal visible Effect/particle does not require a secret `reveal` action merely to exist;
- candidate acceptance requires correct generated representation, binding/receiver, interval, persistence and final Preview evaluation;
- a bad new candidate should not destroy the last valid Editable Preview;
- compatible animation uses the existing native AnimationTrack route;
- Cinemachine shot selection and continuous camera motion are separate proof obligations;
- projectile counts/types/targets are visible obligations, not marker-count bookkeeping;
- legal simultaneous operations must genuinely overlap;
- strong authored camera motion must be visually legible, not merely technically non-zero.

## Plastic runtime / Git guidance boundary

The Unity project, Cutscene Studio implementation, Timeline/Cinemachine materialization, Workshop persistence, runtime bindings and regression runners live in the canonical Plastic workspace.

This Git repository does not mirror those runtime sources. Its responsibility is maintained authoring/publishing guidance and the controlled CURRENT publication surface.

Stable legal Golden fixtures are runtime specifications: when backend/engine execution is wrong, repair the system against the same fixture instead of rewriting legal authored JSON. Fixture names, beat IDs, actor IDs and timestamps must never become production special cases.

Compile-only success is not movie-quality proof. Golden `PASS` requires actual Unity execution of the final saved/reopened Editable Preview.

## Catalog / Director / visual evidence

Catalog/Director/Atlas data remain exact project truth and engineering evidence, but normal Simple V1 authoring consumes direct CURRENT handles rather than raw Catalog IDs.

- `AUTHORING_HANDLES.json` is the normal direct authoring selection surface.
- Director/Atlas pixel evidence is used to verify appearance and suitability.
- raw Catalog IDs, raw Animation IDs, V3/V5 bookkeeping and generated aliases do not become authoring vocabulary.
- old `catalog-contract/**`, `instruction-book/**` and request-scoped `context-pack/**` trees are not public CURRENT authoring authorities and are removed by publication sanitization.

## Camera / animation / Effects / projectiles

The public authoring contract expresses semantic intent; Plastic owns execution.

- Camera: framing/movement/subject/direction/intensity only through the current schema; final runtime proof is Timeline/Cinemachine execution.
- Animation: semantic animation/performance intent -> compatible AnimationClip -> final native AnimationTrack binding.
- Effects/particles: route=`Effect` visible obligations materialize through the existing Effect owner; repeated handles remain distinct.
- Projectiles/missiles: `type=fire` uses only schema-legal closed `projectileId` values and real authored counts; launcher/muzzle/collider/receiver mechanics remain Unity-owned.
- Audio: exact CURRENT Audio handles; repeated cues remain separate events. If CURRENT exposes zero Audio handles, authors do not invent one from raw Catalog data.

## Simple Preview

`designer-ai/simple-preview.html` is web preflight/visual preview for `CUTSCENE_SCRIPT_V1`.

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
2. one current atomic `open-current` projection;
3. durable guidance still referenced by that projection;
4. unique regression/learning evidence that does not pretend to be CURRENT authoring truth;
5. published Storyboard data and the minimum viewer surface required to consume it.

Delete task-specific prompts, stale handoffs/status reports, superseded contracts, duplicate CURRENT aliases, obsolete parallel UIs and historical public authoring surfaces once their durable lesson has been absorbed into active guidance/tests.

Forbidden legacy surfaces in live `open-current` include `CHATGPT_READ_FIRST.txt`, `DIRECTOR_PACK_MANIFEST.json`, `SOURCE_CURRENT.json`, `STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip` and `context-pack/`. The CURRENT lint must fail if any of them reappear.

Do not manually edit `designer-ai/open-current/**` as routine cleanup. It is generated output and normally changes only through controlled publication; emergency removal of proven stale public artifacts must be followed by a source/lint gate that prevents regeneration.
