# Simple V1 Authoring Pack Gate

This gate protects the existing Unity -> Publish -> Git CURRENT -> Open CURRENT rebuild -> Devora Context Pack pipeline. It does not define a second publishing system.

A CURRENT authoring projection must stop instead of silently publishing contradictory data when any of these invariants fail:

- `requiredCurrent.catalogRevision` is serialized as a decimal string wherever the authoring/web layer consumes it. It must never depend on JavaScript Number precision.
- `CUTSCENE_VALIDATION_CURRENT.json` conforms to the published validation schema vocabulary. `blocksCompilation=true` remains the authoritative hard-block signal; Warning rules never block compilation.
- `CUTSCENE_SCRIPT_V1` is the normal authoring surface. V3/V5 remain backend implementation layers.
- The only legal Simple V1 root header is exactly `schema = STARWARS_DELTA_CUTSCENE_SCRIPT` and `schemaVersion = 1`. A remembered/legacy label such as `CUTSCENE_SCRIPT_V1` is not a valid root schema value.
- Every production beat carries `durationSeconds` and non-empty `evidence`. `evidence` is audience-observable proof for the beat, not backend bookkeeping. A `storyClaim` without serialized evidence is not acceptable authoring output.
- Simple V1 field names are literal. Do not emit remembered aliases such as `start`, `duration`, `location`, `camera.shot`, `camera.move`, `action.actor`, or `dialogue.expression`. Use the exact schema names (`durationSeconds`, `locationHandle`, `camera.framing`, `camera.movement`, `action.subject`, `expressionIntent`, etc.).
- `visible[]` entries are structured objects with `id` + exact CURRENT `handle`; they are never shorthand strings. `audio[]` entries are structured objects with `kind` + exact CURRENT Audio `handle`; they are never shorthand strings.
- `AUTHORING_HANDLES.json` is a direct Simple V1 selection surface. Every exposed entry has `authorableInSimpleV1=true`.
- Raw Animation identities remain available in Director/CURRENT engineering compatibility data, but they are backend-only and are not exposed as direct Simple V1 handles. Simple V1 authors animation semantically through `animationIntent` / `performanceIntent`; Actor-Animation legality remains a backend pairing rule.
- Devora-facing instructions never ask the author to serialize raw Catalog IDs, raw Animation IDs, V3 fields, V5 bookkeeping, lifetime ownership, mechanical IDs, or project-owned Dialogue Stage mechanics merely to silence a warning.
- A visual entry is not exposed as an ordinary direct-authoring choice when it requires human review, is unsafe for publish, or carries explicit direct-use exclusions such as `do-not-use-container-directly`, `requires-assembly`, `source-sheet`, or `sprite-part`.
- Every direct visual handle on Actor/Layer/Effect/Ui has exact CURRENT visual identity plus positive integer `atlasPage` and `atlasSlot` derived from the published Director visual evidence. Normal authoring can therefore use Handle -> Atlas page/slot directly. FULL_VISUAL_INDEX and ASSET_VISUAL_LOOKUP remain engineering/debug evidence rather than mandatory authoring hops.
- Audio remains a non-visual route. The existing exact-current Audio projection may certify authoring safety independently of Vision review while preserving the original source safety field.
- Dialogue remains closed-world. Speakers/listeners come only from `EMOTIONAL_DIALOGUE_CURRENT.json` authoring-ready characters, using exact identity and exact supported expressions. Unsupported explicit expressions never fall back to Neutral, Actor, UI, Atlas or visual similarity.
- Every `type=fire` action authors an exact closed-world `projectileId`. The legal projectile vocabulary is owned by the matching `CUTSCENE_SCRIPT_V1.schema.json` / Unity-published capability and must not be independently maintained by this policy. For the matching CURRENT audited on 2026-08-24 the schema exposes `CS_PROJECTILE_BLUE_BOLT`, `CS_PROJECTILE_PURPLE_BOLT`, and `CS_PROJECTILE_POWERBALL`. `effectHandle`, `viaHandle`, gameplay projectile prefabs, filenames and fuzzy matching are never substitutes for projectile identity.
- Fire `count` remains the existing burst quantity field. Launcher attachment, muzzle transform, interval/cadence (unless a future schema explicitly exposes it), Rigidbody2D mechanics and projectile materialization remain Unity-owned.
- The canonical Simple V1 example is one production-shaped 30-60 second fixture. Before sealing the pack, its root header, summed duration, per-beat duration/evidence, schema vocabulary, handles, dialogue identities/expressions, projectile vocabulary and motion constraints are checked against the same CURRENT projection.
- Actor Orbit remains fixed-center only. A moving center during the Orbit interval is unsupported and remains a real blocker.
- Simple V1 actions do not carry per-action timing/order. Several sequential locomotion phases for the same subject must be split across adjacent beats. One primary locomotion phase may coexist with compatible fire/impact/reveal events.
- Semantic speed authoring uses only `slow`, `medium`, `fast`, `burst`.
- V4 move recipe names are directing guidance only and are never serialized. Recipes expand into legal Simple V1 beats/actions using the currently supported motion vocabulary.
- `camera.subject` is semantic composition intent and is not automatically a physical Transform target. DialoguePortrait participants do not become WorldActors merely to satisfy camera targeting.
- Recoverable backend-owned presentation/staging omissions remain Warning/Yellow when a legal deterministic system default exists. RED is reserved for real identity, CURRENT, capability, compatibility or unresolvable integrity failures.
- Before ChatGPT/Devora delivers final JSON, it must perform a literal schema self-check rather than relying on Unity Studio to discover basic shape mistakes one at a time. At minimum: exact root header; duration sum; required beat fields/evidence; structured visible/audio entries; exact schema field names; exact dialogue vocabulary; exact fire projectileId; no unknown properties/raw backend identities.

The full Director, raw Animation compatibility identities and backend validation remain available to engineering. Their presence does not turn those fields into Simple V1 authoring obligations.

This policy is intentionally count-free except for closed vocabulary membership. Asset counts belong to the CURRENT being rebuilt and must be derived at build time rather than hardcoded into permanent guidance.
