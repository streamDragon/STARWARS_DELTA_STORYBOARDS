# CASE 001 - Doctor Run + Move worked

Status: VERIFIED TECHNICAL + VISUAL MOTION PATTERN

Observed result:
- A short Preview using Doctor 03 with an exact verified Run animation plus Move built successfully.
- The character visibly animated while travelling across the world instead of sliding as a static image.

GOOD PATTERN
1. Choose the Actor-primary identity.
2. Confirm the exact Run animationAssetId is present in that Actor's compatibleAnimationIds.
3. Author PlayAnimation(Run) and Move over the intended overlapping time range.
4. If Run is not verified, keep Move and omit PlayAnimation.

This case verifies the locomotion pattern only. The same short test also exposed a poor background choice, documented separately in CASE 002.
