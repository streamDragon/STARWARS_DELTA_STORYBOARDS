# CASE 015 - BLACK-BOX IDENTITY AND PROPORTIONS

Observed in a fresh anonymous authoring test:
- A Doctor Run frame was selected as persistent cast identity.
- Two Doc01 Actor identities were paired with unrelated Kodai/Yuki dialogue portraits.
- A rescue ship with dramatic role SupportingCharacter was incorrectly treated like a human Character role.
- A locked dialogue camera targeted a cast identity that was not a world actor.
- Raw scale=1 across humans and ships did not encode believable relative proportions.

GOOD:
1. Prefer preferredActorAssetId for persistent cast identity.
2. Use compatibleDialogueVisualIds for speaker/listener portraits; never borrow a face from another identity.
3. Hero/SupportingCharacter/Antagonist are dramatic roles. entityKind and cutscenePrimaryUse define physical semantics.
4. Locked dialogue presentation owns its camera unless a real world actor is explicitly spawned.
5. Unity normalizes ordinary proportions by semantic class. Keep scale near 1 unless the story deliberately changes size.

PROPORTION BASELINES (composition, not meters):
- Human: about 48% of frame height in ordinary wide world staging.
- Robot: about 40% of frame height unless story evidence says otherwise.
- Fighter/interceptor: about 22% of frame width.
- General ship/rescue craft: about 32% of frame width.
- Capital ship/carrier/cruiser/fleet: about 48% of frame width.
- Rocks/projectiles/weapons use smaller width-based classes.

These are automatic baselines. Authored scale is a modest hint, not a replacement for source-pixel normalization.
