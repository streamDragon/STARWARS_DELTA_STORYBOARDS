# Simple V1 Authoring Pack Gate

This gate protects the existing Unity -> Publish -> Git CURRENT -> Devora Context Pack pipeline. It does not define a second publishing system.

A CURRENT projection must stop instead of silently publishing contradictory authoring data when any of these invariants fail:

- `requiredCurrent.catalogRevision` is serialized as a decimal string wherever the authoring/web layer consumes it. It must never depend on JavaScript Number precision.
- `CUTSCENE_VALIDATION_CURRENT.json` uses the published validation contract. `blocksCompilation=true` remains the authoritative hard-block signal; Warning rules never block compilation.
- `CUTSCENE_SCRIPT_V1` is the normal authoring surface. V3/V5 remain backend implementation layers.
- Devora-facing instructions never ask the author to serialize raw Catalog IDs, raw Animation IDs, V3 fields, V5 bookkeeping, lifetime ownership, mechanical IDs, or project-owned Dialogue Stage mechanics merely to silence a warning.
- Exact Animation identities may remain in CURRENT / `AUTHORING_HANDLES.json` as compatibility vocabulary. Simple V1 authors animation semantically through `animationIntent` / `performanceIntent`; Actor-Animation legality remains a backend pairing rule.
- A visual entry advertised as `RECOMMENDABLE` must not simultaneously require human review or carry explicit direct-use exclusions such as `do-not-use-container-directly` or `requires-assembly`.
- Direct visual choices must have exact CURRENT identity and usable pixel evidence before Devora makes a visual claim. Metadata alone is not visual proof.
- Audio remains a non-visual route. The existing exact-current Audio projection may certify authoring safety independently of Vision review while preserving the original source safety field.
- Dialogue remains closed-world. Speakers/listeners come only from `EMOTIONAL_DIALOGUE_CURRENT.json` authoring-ready characters, using exact identity and exact supported expressions. Unsupported explicit expressions never fall back to Neutral, Actor, UI, Atlas or visual similarity.
- Recoverable backend-owned presentation/staging omissions remain Warning/Yellow when a legal deterministic system default exists. RED is reserved for real identity, CURRENT, capability, compatibility or unresolvable integrity failures.

The full Director, exact Animation compatibility lists and backend validation remain available to engineering. Their presence does not turn those fields into Simple V1 authoring obligations.

This policy is intentionally count-free. Counts belong to the CURRENT being published and must be derived at build time rather than hardcoded into permanent guidance.
