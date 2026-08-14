# STARWARS_DELTA Mars Cafe Fix Work Packets CURRENT

This is the coordination sheet for the post-Mars-Cafe proof repair. Do not make all agents touch the same subsystem.

## Dependency order

`WP1 Studio/runtime` and `WP2 Director metadata` can run in parallel.

`WP3 authoring guidance` can run in parallel on Git/Pages, but Unity Instruction Book source changes should be finalized after WP1/WP2 invariants are known.

`WP4 regression/GOLDEN` starts with BAD fixture preservation immediately, but GOLDEN promotion waits for WP1-WP3.

## WP1 - Unity Studio representative-preview invariants

GitHub issue: #2

Owner scope:
- Cutscene Studio import/validation boundary
- generator/materializer
- layout/background Cover
- semantic proportions
- preview QA status
- diagnostic placeholder policy
- Effect materialization proof

Do not edit:
- Director publisher metadata projection except where a minimal runtime contract adapter is required
- Debora site
- generated `open-current`

Done when:
- invalid Hero capability blocks before build
- principal yellow fallback cannot be GREEN
- system-managed actors normalize from authored scale 1.0
- backgrounds keep >=95% coverage through camera motion
- focused tests pass

## WP2 - Director filmmaking metadata / runtime readiness

GitHub issue: #3

Owner scope:
- Catalog/Director source projection
- presentation metadata
- style/perspective/location continuity fields
- role/runtime suitability
- materialization confidence where source evidence exists

Do not edit:
- Studio runtime fallback policy
- Debora site
- generated `open-current` by hand

Done when:
- Director provides enough metadata to reject top-down/pixel vs eye-level painterly mismatches before JSON
- role/runtime suitability is explicit
- exact animation compatibility remains intact
- new atomic publish includes source changes

## WP3 - Debora / ChatGPT film authoring guidance

GitHub issue: #4

Git-side work already implemented:
- `FILM_AUTHORING_GUIDE_CURRENT.md`
- `CHATGPT_START.txt`
- `chatgpt-current.json`
- `debora.html`

Unity-side remaining:
- promote recurring Mars lessons into Instruction Book source/curation
- keep raw BAD evidence separate
- do not add duplicate lessons when an existing invariant can be strengthened

Done when:
- normal COPY FOR CHAT carries film preflight
- Instruction Book source contains durable lessons
- narrative authoring requires visual + audio passes

## WP4 - Mars Cafe regression / GOLDEN gate

GitHub issue: #5

Owner scope:
- preserve BAD evidence
- focused automated regressions
- final manual canonical visual acceptance checklist

Do not edit the BAD fixture into correctness. Make a separate corrected artifact later.

Done when:
- all regressions from issue #5 pass
- corrected Mars Cafe visual proof passes canonical review
- only then create/promote separate GOLDEN case

## Shared rules

- Never create a new workspace or Unity clone. Use canonical workspace plus the existing QA clone only.
- Preserve unrelated concurrent work. Refresh Plastic status before any check-in.
- Do not fix scene/build-profile/shared-scene-list archaeology automatically; report it to Haggai.
- Do not edit vendor/Library content as a project fix.
- Do not patch generated `designer-ai/open-current/**` to hide Unity defects.
- Run one inspection pass, one implementation batch, one compile, one focused test run, then report.
- For repeated similar changes, prove one representative case first and then batch the pattern.

## Final integration gate

Before the next corrected Mars Cafe JSON is authored:
1. WP1 compile/tests are green.
2. WP2 has a new atomic Director/Catalog publish or explicitly reports what cannot yet be represented.
3. WP3 Instruction Book source is updated and the public Debora guidance is live.
4. WP4 BAD fixture is preserved and regression suite is ready.

Only then generate the corrected 60-second Mars Cafe film JSON and use it as the next end-to-end visual acceptance proof.
