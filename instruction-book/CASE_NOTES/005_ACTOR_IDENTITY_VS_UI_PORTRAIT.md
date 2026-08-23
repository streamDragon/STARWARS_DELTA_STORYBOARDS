# CASE 005 - Actor identity is not a dialogue portrait

Status: REAL AUTO-CORRECTION / PLACEMENT LESSON

Observed result:
A Commander Actor-primary identity was used in a dialogue portrait field. The system auto-replaced it with a Ui-primary record from the same source.

BAD
- cast[].visualAssetId = Ui portrait/body/head
- speakerPortraitAssetId = Actor world identity

GOOD
- cast[].visualAssetId uses Actor-primary identity.
- speakerPortraitAssetId/listenerPortraitAssetId/body/frame fields use Ui-primary presentation records.

LESSON
The same character can have multiple Catalog records serving different destinations. Character identity and dialogue presentation are separate roles.
