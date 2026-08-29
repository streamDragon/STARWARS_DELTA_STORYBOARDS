# Cutscene Golden QA Instruction Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align all maintained STARWARS_DELTA Cutscene authoring/publishing guidance with the current Plastic-first runtime ownership model and stable Golden QA workflow without duplicating Unity source or claiming unverified runtime success.

**Architecture:** Plastic remains canonical for Unity runtime implementation and runtime proof. Git remains canonical for external authoring/publishing guidance. The maintained source guidance is updated at its owning layers, while generated `designer-ai/open-current/**` remains untouched and publication continues through the existing DELTA/FULL workflow.

**Tech Stack:** GitHub Pages/static repository guidance, Designer AI CURRENT source files, JSON policy files, Markdown/text instruction sources.

**Spec:** `docs/superpowers/specs/2026-08-29-cutscene-golden-qa-instruction-alignment-design.md`

## Global Constraints

- Unity/Plastic workspace is the runtime source of truth.
- Git must not mirror Unity runtime source.
- `CUTSCENE_SCRIPT_V1` remains the only public authoring format.
- Do not manually edit `designer-ai/open-current/**`.
- Preserve native-first / one-owner execution rules.
- Do not claim runtime PASS without actual Unity execution.
- Accepted legal fixtures stay fixed while backend/engine defects are repaired.
- Prefer DELTA Publish when only lightweight guidance changes and `requiredCurrent` is unchanged.

---

### Task 1: Align repository boundary guidance

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: existing repository ownership and FULL/DELTA publication rules.
- Produces: explicit Plastic-vs-Git boundary and Golden QA summary referenced by maintainers.

- [ ] Add a concise `Plastic runtime / Git guidance boundary` section.
- [ ] State that Golden fixtures and regression runner live in Plastic, not this Git repo.
- [ ] State that stable Golden fixtures are not rewritten to hide backend/engine failures.
- [ ] State that runtime PASS requires actual Unity execution.
- [ ] Preserve existing FULL/DELTA and `open-current/**` rules.
- [ ] Verify no wording implies Unity runtime source belongs in Git.

### Task 2: Align author-facing start instructions

**Files:**
- Modify: `designer-ai/tools/current-source/CHATGPT_START.txt`

**Interfaces:**
- Consumes: accepted JSON freeze policy and backend/engine ownership model.
- Produces: author-facing rule that legal accepted source remains stable during backend repair.

- [ ] Add a short `ACCEPTED FIXTURE / BACKEND REPAIR DISCIPLINE` section.
- [ ] Require authors to preserve legal accepted JSON when downstream execution fails.
- [ ] Forbid changing camera/projectile/animation semantics merely to satisfy a broken runtime path.
- [ ] Clarify that generated Timeline/Preview/bindings remain Unity-owned.
- [ ] Clarify that runtime Golden QA is engineering evidence, not an authoring field.
- [ ] Keep the existing final JSON self-check intact.

### Task 3: Align film-quality guidance

**Files:**
- Modify: `designer-ai/tools/current-source/FILM_AUTHORING_GUIDE_CURRENT.md`

**Interfaces:**
- Consumes: existing film-quality, binding-aware materialization and accepted JSON freeze sections.
- Produces: explicit Golden film quality gate and observable-execution rules.

- [ ] Add a `Golden integration film` section near accepted JSON / pre-publish proof.
- [ ] Define stable fixture / moving-system debugging discipline.
- [ ] Define observable success for camera, animation, projectile/effect and simultaneous operations.
- [ ] State that strong motion requiring “maybe it moved” is a failure.
- [ ] State that final saved/reopened Editable Preview is execution truth.
- [ ] Keep web preview preflight-only.

### Task 4: Align runtime architecture guidance

**Files:**
- Modify: `designer-ai/tools/current-source/simple-authoring/ARCHITECTURE.md`

**Interfaces:**
- Consumes: existing native-first one-owner table, fail-soft candidate preservation and Preview truth.
- Produces: durable runtime invariants for camera continuous motion, actor animation persistence, projectile execution and Golden closed-loop repair.

- [ ] Add a `Final Editable Preview persistence` section.
- [ ] Add a `Camera execution proof` section separating shot selection from within-shot motion.
- [ ] Add an `Actor animation execution proof` section.
- [ ] Add a `Projectile/effect execution proof` section.
- [ ] Add a `Stable Golden regression workflow` section.
- [ ] Keep implementation details generic enough that Plastic may evolve without Git becoming a second runtime spec.

### Task 5: Align pre-Unity QA policy without leaking runtime implementation

**Files:**
- Modify: `designer-ai/tools/current-source/simple-authoring/CINEMATIC_INTENT_QA_RULES.json`

**Interfaces:**
- Consumes: current AUTHORING/BACKEND/ENGINE ownership model.
- Produces: policy statements that legal source survives downstream execution failure, without pretending pre-Unity QA can certify runtime behavior.

- [ ] Increment schemaVersion by one because maintained policy content changes.
- [ ] Add a simple semantic statement for accepted-fixture stability.
- [ ] Add a hard invariant that runtime Golden status is not authored data and does not rewrite legal source.
- [ ] Add an Orange backend/engine rule for `FINAL_PREVIEW_EXECUTION_LOST` or equivalent, describing lost binding/reference/interval after legal materialization.
- [ ] Do not encode per-shot camera-track implementation details.
- [ ] Verify valid JSON.

### Task 6: Correct current integration status

**Files:**
- Modify: `designer-ai/tools/current-source/simple-authoring/INTEGRATION_STATUS_CURRENT.md`

**Interfaces:**
- Consumes: current verified engineering state from recent repair work.
- Produces: honest status separating verified principles from unverified runtime PASS.

- [ ] Add `Plastic / Git authority` section.
- [ ] Replace the old “next representative proof” framing with stable Golden QA status.
- [ ] Record that stable Golden regression is the current verification target, not a completed PASS.
- [ ] Record that camera/animation/projectile final persistence must be verified after save/reopen.
- [ ] Explicitly state that no Golden PASS is claimed until actual Unity execution succeeds.
- [ ] Avoid claiming implementation details that have not been runtime verified.

### Task 7: Repository-wide consistency review

**Files:**
- Review all six modified instruction files plus the design spec.

**Interfaces:**
- Consumes: tasks 1-6.
- Produces: one coherent instruction system with no duplicate runtime source of truth.

- [ ] Search maintained source for conflicting claims that Git contains Unity runtime source.
- [ ] Search maintained source for claims that compile-only means movie success.
- [ ] Search maintained source for instructions to rewrite legal source JSON after backend/engine failure.
- [ ] Search maintained source for manual-edit instructions targeting `open-current/**`.
- [ ] Verify all files consistently preserve Plastic runtime authority, Unity final validation, stable fixtures and controlled publication.
- [ ] Verify JSON policy parses conceptually and no duplicate policy code is introduced.

### Task 8: Commit and handoff

**Files:**
- Commit all modified maintained-source guidance and docs.

**Interfaces:**
- Produces: Git main aligned for the next controlled DELTA/FULL publication decision.

- [ ] Commit the instruction-alignment changes.
- [ ] Do not publish `open-current/**` manually.
- [ ] Report whether changes are guidance-only and therefore DELTA-eligible assuming `requiredCurrent` is unchanged.
