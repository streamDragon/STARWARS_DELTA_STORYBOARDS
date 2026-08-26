# LOCAL ENGINE UPGRADES AFTER BASE CURRENT PUBLISH

Base CURRENT publish: 20260825-064902734-6b6529d6

The following local engine fixes were implemented and visually proven after that remote publish:

1. Simple V1 `locationHandle` lowering no longer injects automatic `parallaxFactor=0.1`.
   The full-frame location plate uses zero authored parallax.

2. A post-V3 full-frame refit runs after final V3 camera materialization.
   It enlarges the exact Simple V1 full-frame environment plate only when required to cover the final
   camera envelope. It does not move the plate and does not reduce its scale.

3. Editable Preview visibly rendered the legal five-bolt `CS_PROJECTILE_BLUE_BOLT` burst in the proof film.

These are local engine facts for this upgraded package. They do not alter the base remote CURRENT identity.
Authoring implication: write clean cinematic intent. Do not encode background scale hacks, duplicate location
layers or projectile substitutions as workarounds.
