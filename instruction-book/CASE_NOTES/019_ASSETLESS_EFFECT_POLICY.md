# CASE 019 - Assetless built-in Effect policy

## Observed
Blackbox JSON used Vignette/SpeedLines/ScreenFlash with empty assetId while generated support sprites existed as Ui-primary records. Ambiguous fallback could present as an unexplained rectangle.

## GOOD
SpeedLines, Vignette, ScreenFlash, ColorFlash, Silhouette and Overlay are canonical procedural built-ins and omit assetId. Other effects use exact Effect-primary assets or a yellow self-identifying placeholder.
