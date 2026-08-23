# CASE 018 - Editor Evaluate must not play real audio

## Observed
GenerateAtomic calls PlayableDirector.Evaluate(). MY_CutsceneCinematicAudioBehaviour.ProcessFrame then called AudioSource.Play() and Unity logged `Can not play a disabled audio source`.

## GOOD
Evaluation/scrubbing may bind the clip and update deterministic time, but it never performs real audio playback. AudioSource.Play is reserved for actual runtime Playback evaluation on an active, enabled source.
