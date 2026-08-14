# 031 - Dialogue depth hierarchy and tactical data inset

## Evidence

Current V2 visual QA showed that dialogue reads better when the active speaker is visually foregrounded and the listener remains visible but secondary. The designer explicitly accepted this direction after reviewing the generated Workshop frame.

The same review established that radar/tactical information can be useful inside a conversation or briefing shot when it behaves as a compact data-support element rather than a dominant center-screen object.

## V2.7 rule

- The active speaker defaults nearer/larger than the listener in TWO_SHOT and SPEAKER_FOCUS staging.
- The listener remains readable but visually subordinate.
- Speaker body geometry renders above listener body geometry when their screen regions overlap.
- COMMAND_SCREEN keeps its monitor semantics; this change does not turn dialogue-only participants into world actors.
- Radar/tactical/scanner/targeting UI defaults to a compact upper-right data inset.
- Tactical UI may coexist with dialogue when it supports the beat, but it must not hide the active speaker or become the focal object by accident.

## Authoring guidance

Use an exact current legal dialogue compatible tuple first. Leave speakerDistance/listenerDistance empty unless a deliberate override is needed so Unity can apply the stable V2.7 hierarchy.

For radar/data UI, use an exact current Ui-primary asset and ShowUi/HideUi ownership. Do not author giant arbitrary width/height values unless the story explicitly requires a full-screen tactical display.
