# CASE 004 - Ship animations were guessed instead of proven

Status: REAL FAILURE / FAIL-SOFT LESSON

Observed in a long cinematic test:
Several enemy fighter, bomber, frigate and dreadnought PlayAnimation actions were rejected because the exact animation IDs were not proven compatible with the selected Actor records. Preview replaced those actions with Hold.

BAD
Choose a ship animation because the asset name, pack or folder looks like the same ship family.

GOOD
Use PlayAnimation only if the exact animationAssetId occurs in the exact Actor record's compatibleAnimationIds.

SAFE FALLBACK
Ships can still Enter, Move, Exit, Formation, Turn or Hold without a PlayAnimation clip. Preserve the story and motion instead of inventing compatibility.
