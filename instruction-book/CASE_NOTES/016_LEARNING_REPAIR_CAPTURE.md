# CASE 016 - LEARNING REPAIR CAPTURE

A fail-soft Preview correctly auto-replaced an unavailable Effect asset, but the raw Learning Case contained duplicate AUTO_REPLACED warnings while automaticCorrections was empty.

GOOD:
- Deduplicate repair issues by stable code/path/entity/actual replacement.
- Derive technicalAutomaticCorrections from successful auto-repair issues.
- Include those corrections in the general automaticCorrections list too.
- Keep raw cases evidence-only until curated into lessons or GOLDEN examples.
