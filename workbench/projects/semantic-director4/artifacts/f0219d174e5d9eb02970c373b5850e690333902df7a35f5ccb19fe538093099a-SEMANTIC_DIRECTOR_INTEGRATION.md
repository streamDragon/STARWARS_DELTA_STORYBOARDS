# STARWARS_DELTA - Semantic Director 4 - Integration Record (2026-10-22)

## User goal
Convert dramatic ideas into visible, causally intelligible, emotional 2D cinema. The layer must orchestrate all 53 canonical V1 MOVES and reuse existing directing protocols, actor/CURRENT sources, Cutscene Studio, its strict lint, builder, Unity Timeline and Film QA. Never create alternate authoring schema/runtime or invent asset identities.

## What is implemented and checked
- `semantic-director-4.cjs`: runnable external semantic plan compiler, reading CURRENT V1 schema and 53-MOVE C# source on every execution.
- `SEMANTIC_DIRECTOR_4_REGISTRY.json`: generated source-verified 53 move definitions (ordinals, IDs, phases) plus eight semantic dramatic abilities.
- `EVACUATION_DRAMATIC_IDEA.json`: concrete eight-act source idea.
- `THE_LAST_EVACUATION_CINEMATIC_DIRECTOR_4_SEMANTIC_PLAN.json`: generated 96s eight-act/26-shot sequence.
- `V1_AUTHORING_HANDOFF_UNBOUND.json`: canonical move/beat linkage plan, with *explicit unresolved identities*. NOT a legal `CUTSCENE_SCRIPT_V1` and NOT safe to import.
- `test-semantic-director-4.cjs`: 53 canonical definitions, unique IDs+ordinals, eight abilities, coverage, timing, phase identity, no invented actor/animation handles. PASS.
- Advanced explicit dispatch of each of 53 move IDs through planner: 53/53 PASS in node. This is pre-Unity planner validation only.

## The semantic eight, grounded in user's Squadron 42 notes
1. ESTABLISH_SCALE: relative giant-vs-fighter readability, foreground/mid/far depth.
2. REVEAL_THREAT: suspense, silhouette, reveal, scale.
3. HUMAN_REACTION: concrete person noticing/responding.
4. TACTICAL_ORDER: command makes units change tactics.
5. WEAPON_CAUSE_EFFECT: charge/fire/impact/damage/change.
6. BREAK_FORMATION: intentional movement breaks fleet spacing.
7. INTERNAL_CHAOS: exterior damage triggers interior consequences.
8. SACRIFICE_DECISION: character decision has visible cost.

## Runtime fidelity gates (not yet proven)
1. Capture actual CURRENT assets: capital ship, small single ships, a person with reactions, bridge/interior, VFX and audio. Never replace valid requested identity silently.
2. Bind V1 legal `cast[]` and `visible[]`, establish scale and screen-space 2D layers, then populate `beats[]` with explicit action timing and `moves[].beatIds` matching canonical phases. The planner's V1 handoff is intentionally UNBOUND.
3. Run existing `CUTSCENE_SCRIPT_V1` STRICT lint with unchanged schema hash and authoring rules, then ordinary Cutscene Studio import/build, save/reopen and Film QA. Stop only for inability to read/save movie; preserve placeholders otherwise.
4. Prove camera follows a rotating/translating anchor at non-endpoint t=5s / 10s, with not-yet-finished path interpolation, not frozen final position.
5. Prove `BANK_AND_EXIT` and `ESCORT_PEEL_OFF` leave viewport physically by end frame; static 2D background camera tracking must not conceal the exit.
6. Prove 2D scale ratios with an exact fighter-size comparator.
7. Prove weapon causal chain and external/internal continuity from actual captured frames.
8. Prove human reactions from actual shot composition, not just authored MOVE text.
9. Run Play Mode runtime test separately; EDITOR_TIMELINE_EVALUATION is not runtime proof.

## Status and isolation
PREPARATION CODE + CONSISTENCY CHECKS = PASS.
UNITY SYSTEM-4 INTEGRATION = NOT STARTED.
CUTSCENE_SCRIPT_V1 EMITTED AND ACCEPTED = NO.
NEW CINEMATIC FILM VISUALLY ACCEPTED = NO.
No changes made to Assets, CURRENT, HandleResolver, 53-MOVE source, PackageCache, scene, or Plastic. Unity was busy importing at inspection; don't start concurrent import/build.

## Ownership
Integration owner of MAIN should review the detached files before any Unity Editor writes. Do not publish, check in, modify old movies, or create a second production Editor to run tests.
## 2026-10-22 ADDENDUM: directed V1 strict proof
- Created `THE_LAST_EVACUATION_D4_96S_DIRECTED_CUTSCENE_SCRIPT_V1.json`, 96s, eight first-class MOVES, 26 phases, 36 authored actions, six CURRENT Actor handles, background galaxy_06.
- Ran native Unity `MY_CutsceneV1CandidateLintAutomation.Schedule` on THIS directed candidate. Final output `THE_LAST_EVACUATION_DIRECTED_LINT.json`: **STRICT PASS**, blockers=0, warnings=0 (plus one Info about empty project story idea).
- Unity-local authoringRuleRegistryRevision is **DD86C108076E923DD28F7B9444B8EA5F389CE8A492B5E9012C74BDB72D7A8F54**, while public OPEN_CURRENT still states **E315C26FC5A7968D619512AA71D772703E0DD43F75CEB28BF6EC922752BB025A**. Directed V1 is verified against local Unity, not yet against newly published CURRENT. Do not silently claim portability or republish.
- Attempted canonical `MY_CutsceneStudioAutomation.Schedule` build. Result `THE_LAST_EVACUATION_D4_BUILD_RESULT.txt`: `SYSTEM|FAIL|code=EDITOR_BUSY` because Unity was compiling. This is an Editor availability failure, NOT a movie generation failure. Do not report Build PASS. Subsequent Editor status refused RPC while compiling/reloading. Do not start a second Editor, discard unsaved scenes or retrigger while busy.
- Assets for human face, interior bridge and genuinely giant capital vessel are not visually verified. Symbolic legal ship sprites are placeholders for authoring/engine QA only. Visual quality / Play Mode / Film QA still unverified.
- Next integration action: after Unity Ready and no competing agent run, retry existing Studio automation once on the **same V1**, inspect result path, then run Film QA and compare 0/5/10/end; no fresh V1 rewrite to hide engine faults.