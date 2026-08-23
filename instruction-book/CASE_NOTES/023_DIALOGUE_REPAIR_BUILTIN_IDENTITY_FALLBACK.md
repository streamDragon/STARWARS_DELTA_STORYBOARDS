# CASE 023 - Dialogue repair must not self-invalidate

Identity-safe repair removed borrowed portraits and left FACE_TO_FACE_PORTRAITS without legal participant visuals. Validator then blocked the repaired package.

## GOOD
Exact same-identity compatible visual -> explicitly allowed built-in participant fallback -> another exact compatible tuple/preset -> one clear blocker. Never silently downgrade to SUBTITLE_ONLY.
