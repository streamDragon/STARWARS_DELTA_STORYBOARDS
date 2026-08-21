# STARWARS_DELTA Gemini Dialogue Art Generator

Purpose: generate consistent ORIGINAL retro space-opera dialogue portraits and pose sprites for the cutscene system, with deterministic names suitable for Unity import.

## What it generates

For each character:

- one base portrait reference
- 10 expression portraits:
  - Neutral
  - Listening
  - Concerned
  - Shocked
  - Urgent
  - ControlledGrief
  - Determined
  - Exhausted
  - Relieved
  - Defiant
- 5 half-body pose images:
  - IdleListening
  - Speaking
  - WorkingAtConsole
  - RunningAction
  - BracingAlert
- one portrait sprite sheet
- one pose sprite sheet
- one JSON manifest mapping exact Unity-facing names to PNG files

Default characters:

- `FEMALE_COMMS_01` — original young female communications/radar officer
- `COMMANDER_MALE_01` — original mature male command officer
- `PILOT_MALE_01` — original male field pilot
- `FEMALE_BRIDGE_02` — original second female bridge/tactical officer

All characters are ORIGINAL. The style prompt asks for classic late-70s/early-80s retro space-opera anime language without copying a specific copyrighted character.

## Setup

Install Python 3.11+ and then:

```bash
pip install -r requirements.txt
```

Set the Gemini API key in the environment:

Windows CMD:

```cmd
set GEMINI_API_KEY=YOUR_KEY_HERE
```

PowerShell:

```powershell
$env:GEMINI_API_KEY="YOUR_KEY_HERE"
```

Do not commit the key.

## Run

```bash
python generate_dialogue_art.py
```

Optional:

```bash
python generate_dialogue_art.py --character FEMALE_COMMS_01
python generate_dialogue_art.py --output C:/Temp/STARWARS_DELTA_DialogueArt
```

## Output naming

Example:

```text
FEMALE_COMMS_01/
  reference/
    CHR_FEMALE_COMMS_01_REFERENCE.png
  expressions/
    CHR_FEMALE_COMMS_01_EXPR_Neutral.png
    CHR_FEMALE_COMMS_01_EXPR_Listening.png
    CHR_FEMALE_COMMS_01_EXPR_Concerned.png
    ...
  poses/
    CHR_FEMALE_COMMS_01_POSE_IdleListening.png
    CHR_FEMALE_COMMS_01_POSE_Speaking.png
    ...
  sheets/
    CHR_FEMALE_COMMS_01_EXPRESSIONS_5x2.png
    CHR_FEMALE_COMMS_01_POSES_5x1.png
  CHR_FEMALE_COMMS_01_MANIFEST.json
```

The script writes the exact emotion and pose names expected by the current cutscene vocabulary. It does not invent aliases.

## Transparency

The generator explicitly asks for isolated character art on a flat chroma background for reliable cleanup. The script then removes that background and writes RGBA PNGs. This is deliberate: relying on image models to return perfect alpha every time is charming optimism, not a pipeline.

## Important limitation

Image models may still drift slightly in face shape/costume between edits. The script always uses the generated reference image as the input reference for each expression and pose request to minimize drift. Review the generated set before importing it as canonical character identity.
