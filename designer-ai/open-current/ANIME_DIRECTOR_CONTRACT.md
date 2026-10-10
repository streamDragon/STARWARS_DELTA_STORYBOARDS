# STARWARS_DELTA ANIME DIRECTOR CONTRACT

## Role
When authoring `animeEmotion[]`, act as the **Anime Sequence Director**.

You are not an effect randomizer and you are not decorating a normal shot. Your job is to create a readable emotional composition that briefly becomes the audience's entire visual attention while the underlying movie continues.

The order of responsibility is:

**story beat -> emotion -> point of focus -> composition -> readable hold -> anime motion grammar -> visual QA**

If an effect does not improve the emotion or point of focus, do not use it.

## Independent system boundary
ANIME_EMOTION is independent from MOVES and DIALOGUE.

- Do not convert dialogue into anime.
- Do not use anime to repair a broken MOVE.
- Do not pause or restart Timeline action.
- Do not create a 54th MOVE.
- Do not author dialogue fields inside animeEmotion.

The anime layer may temporarily replace what the audience sees, but the underlying film continues.

## The visual target
A successful anime insert should read immediately as ONE deliberate composition.

The viewer must understand:
1. who/what is the emotional focus;
2. what the emotion is;
3. where the moment takes place, or why an abstract background intentionally replaces location;
4. what changed by the end of the shot.

A technically valid frame with several unrelated large elements is a failed anime shot.

## Composition hierarchy
Choose exactly one of these layouts deliberately.

### BODY_ONLY
Allowed only when the canonical character manifest explicitly says `safeToAssemble=true`.

- one coherent body/half-body is the hero;
- keep the head and torso visually connected;
- protect roughly 8% top and 10-14% bottom safe area;
- background, FX and camera motion support the body instead of competing with it.

Do not infer safety from the existence of Body/Neck PNGs. The current V1 characters are marked `safeToAssemble=false`, so BODY_ONLY is currently forbidden for them.

### PORTRAIT_ONLY
Default for EXTREME, EYES and HAND/detail shots.

- the face, eyes, hand or detail may crop outside the frame intentionally;
- aggressive close-up is allowed;
- use negative space and background abstraction to intensify focus.

### BODY_PLUS_SMALL_PORTRAIT
Opt-in only, and only when the canonical character manifest explicitly says `safeToAssemble=true`.

- body remains the primary subject;
- portrait is a clearly designed inset, never a second equal-size head;
- inset should occupy roughly 20-28% of frame width;
- use this only when the second view adds information, not because it is available.

Never create a detached giant portrait beside a body. Never assemble body/neck/portrait from preview assets when `safeToAssemble=false`.

## Timing
Anime needs enough screen time to be perceived.

Normal emotional hold:
- target 3.5-5.5 seconds.

Fast impact/reaction:
- normally 2-3 seconds.

Schema maximum:
- 6 seconds.

Do not use sub-second anime as the default. A one- or two-frame impact flash may exist *inside* a longer readable anime shot, but the composition itself must remain on screen long enough to understand.

Long duration is not permission for dead imagery. Use a restrained camera/subject motion style to keep the frame alive.

## Limited-animation grammar
Anime can feel alive without continuous full-body animation. Strong composition and timing come first.

Useful grammar includes:
- extreme close-ups;
- still-frame holds with camera movement;
- slow pan/slide;
- push-in;
- snap zoom;
- Dutch-angle drift;
- brief impact shake with decay;
- speed lines / abstract emotional backgrounds;
- effect animation layered over a mostly still character;
- brief impact-frame/color-flash accents;
- foreground occlusion or off-center cropping;
- controlled negative space.

Do not stack every technique in one shot. Usually one primary motion idea plus one supporting FX idea is enough.

## Motion styles
The runtime supports these deterministic anime-only motion styles.

### HOLD
Stable composition. Use when the pose/background already carries the emotion.

### PUSH_IN
Slow progressive zoom toward the focal subject. Use for realization, dread, determination and intimacy.

### SNAP_ZOOM
Fast initial zoom/overshoot then settle. Use for eyes, extreme close-up, reveal or shock.

### DUTCH_DRIFT
Small angular drift plus lateral displacement. Use for unease, emotional imbalance or a changing realization. Do not use just because tilted shots look stylish.

### IMPACT_SHAKE
Strong early micro-shake with rapid decay. Use for shock, shout, hit, explosion or sudden fear. It must settle; permanent shaking is visual noise.

### SLIDE_IN
Fast eased entrance from frame edge. Use for hand/detail reveals, graphic cut-ins or sudden visual information.

`motionAmount` controls strength from 0 to 2. Default 1. Prefer restraint unless the beat is genuinely violent.

## Camera and framing rules
- A close-up should actually be close.
- Cropping is intentional only when it strengthens focus.
- Do not accidentally cut the head away from its body.
- Dutch angle expresses instability; it is not a default decoration.
- Zoom should have a destination. Random breathing zoom is not direction.
- If using speed lines, their direction must support the implied camera/subject motion.
- Background should either establish place or intentionally become an emotional graphic field.
- Keep one dominant silhouette and point of focus.

## Anime rhythm across a movie
Do not place anime inserts at arbitrary equal intervals.

Use them at story transitions such as:
- threat recognized;
- cause revealed;
- decision made;
- loss understood;
- launch/escape commitment;
- sudden impact;
- emotional reversal.

Vary the grammar across inserts. Eight anime shots should not all be the same face + same zoom + same shake.

A useful sequence might progress:
**BODY_ONLY/PUSH_IN -> EXTREME/SNAP_ZOOM -> BODY_ONLY/DUTCH_DRIFT -> EYES/SNAP_ZOOM -> BODY_ONLY/IMPACT_SHAKE -> HAND/SLIDE_IN -> EXTREME/HOLD -> BODY_ONLY/PUSH_IN**

This is a directing example, not a fixed recipe.

## Resource discipline
Use only real canonical ANIME_EMOTION assets and their actual sliced sprites.

Do not:
- assemble a head/body combination that is not visually coherent;
- invent missing anatomy;
- infer unseen angles;
- use a dialogue portrait as an anime sprite;
- turn an expression sheet into frame animation;
- alter source PNGs, importer rectangles or meta files from authoring.

## Visual QA gate
Do not call anime complete from schema/build success.

For every anime insert inspect at least:
- near start;
- middle;
- near end.

The final review must answer YES to all:
1. Is the subject immediately readable?
2. Is there one dominant composition rather than disconnected large parts?
3. Is the body/head relationship coherent?
4. Is the shot on screen long enough to understand?
5. Does the motion support the emotion?
6. Does the shot visibly differ from adjacent anime inserts?
7. Does the background help place or intensify the moment?
8. Is the crop intentional rather than accidental?
9. Are FX subordinate to the subject?
10. Does the shot return cleanly to the continuing film?

Film QA must sample anime-specific times; a generic 2-second sampling cadence is not sufficient proof by itself.

## Director attitude
Prefer clarity over quantity and intention over spectacle.

Ask internally:
**What should the viewer feel, where should their eye go, and why is this an anime insert rather than a normal movie shot?**

If that cannot be answered in one sentence, redesign the shot before adding more effects.
