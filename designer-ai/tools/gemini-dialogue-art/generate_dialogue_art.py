import argparse
import base64
import io
import json
import os
from pathlib import Path

from PIL import Image
from google import genai
from google.genai import types

EXPRESSIONS = [
    "Neutral", "Listening", "Concerned", "Shocked", "Urgent",
    "ControlledGrief", "Determined", "Exhausted", "Relieved", "Defiant",
]
POSES = [
    "IdleListening", "Speaking", "WorkingAtConsole", "RunningAction", "BracingAlert",
]

CHARACTERS = {
    "FEMALE_COMMS_01": {
        "description": "original female communications and radar officer, mid-20s, intelligent, warm but disciplined, retro futuristic uniform, medium dark hair",
    },
    "COMMANDER_MALE_01": {
        "description": "original mature male fleet commander, calm authority, weathered but kind face, retro futuristic command uniform",
    },
    "PILOT_MALE_01": {
        "description": "original young male space fighter pilot, alert and courageous, open flight helmet and headset, retro futuristic pilot suit",
    },
    "FEMALE_BRIDGE_02": {
        "description": "original female tactical bridge officer, late-20s, focused, strong expressive eyes, short hair, retro futuristic tactical uniform",
    },
}

BASE_STYLE = (
    "ORIGINAL character. Classic late-1970s / early-1980s Japanese space-opera anime language, "
    "clean cel shading, expressive eyes, strong readable silhouette, production-ready 2D game art. "
    "Do not copy or reproduce any existing copyrighted character, costume, emblem, ship, or franchise design. "
    "No text, no logos. Keep anatomy, costume, hair, face proportions and palette highly consistent."
)


def image_from_part(part):
    data = getattr(part.inline_data, "data", None)
    if not data:
        return None
    if isinstance(data, str):
        data = base64.b64decode(data)
    return Image.open(io.BytesIO(data)).convert("RGBA")


def generate_image(client, prompt, reference=None):
    contents = [prompt]
    if reference is not None:
        buf = io.BytesIO()
        reference.convert("RGB").save(buf, format="PNG")
        contents.append(types.Part.from_bytes(data=buf.getvalue(), mime_type="image/png"))

    response = client.models.generate_content(
        model="gemini-2.5-flash-image-preview",
        contents=contents,
        config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
    )
    for candidate in response.candidates or []:
        for part in candidate.content.parts or []:
            if getattr(part, "inline_data", None):
                img = image_from_part(part)
                if img is not None:
                    return img
    raise RuntimeError("Gemini returned no image")


def remove_green_background(img, threshold=72):
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            green_score = g - max(r, b)
            if g > 110 and green_score > threshold:
                px[x, y] = (r, g, b, 0)
    return img


def fit_cell(img, size=1024):
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    copy = img.copy()
    copy.thumbnail((size, size), Image.Resampling.LANCZOS)
    x = (size - copy.width) // 2
    y = (size - copy.height) // 2
    canvas.alpha_composite(copy, (x, y))
    return canvas


def build_sheet(images, cols, rows, out_path, cell=1024):
    sheet = Image.new("RGBA", (cols * cell, rows * cell), (0, 0, 0, 0))
    for i, img in enumerate(images):
        x = (i % cols) * cell
        y = (i // cols) * cell
        sheet.alpha_composite(fit_cell(img, cell), (x, y))
    sheet.save(out_path)


def generate_character(client, character_id, spec, root):
    char_dir = root / character_id
    ref_dir = char_dir / "reference"
    expr_dir = char_dir / "expressions"
    pose_dir = char_dir / "poses"
    sheet_dir = char_dir / "sheets"
    for d in (ref_dir, expr_dir, pose_dir, sheet_dir):
        d.mkdir(parents=True, exist_ok=True)

    reference_prompt = f"""
{BASE_STYLE}
Create one canonical chest-up dialogue portrait of this character:
{spec['description']}.
Front three-quarter view, relaxed neutral face, centered, same framing we can reuse for many dialogue emotions.
Use a perfectly flat bright chroma green (#00FF00) background only, with no shadows or gradients on the background.
High resolution, clean separation around hair and shoulders.
"""
    reference = generate_image(client, reference_prompt)
    reference_clean = remove_green_background(reference.copy())
    ref_path = ref_dir / f"CHR_{character_id}_REFERENCE.png"
    reference_clean.save(ref_path)

    expression_imgs = []
    expression_manifest = {}
    for expression in EXPRESSIONS:
        prompt = f"""
{BASE_STYLE}
Edit the supplied reference into the SAME exact character.
Do not redesign the person. Keep identical hair, clothing, proportions, palette, camera angle, crop, head size and lighting.
Change ONLY the facial acting to the dialogue expression: {expression}.
Chest-up portrait. Flat pure chroma green (#00FF00) background only. No text.
Expression must be clearly readable at small UI portrait size.
"""
        img = generate_image(client, prompt, reference=reference)
        img = remove_green_background(img)
        filename = f"CHR_{character_id}_EXPR_{expression}.png"
        img.save(expr_dir / filename)
        expression_imgs.append(img)
        expression_manifest[expression] = f"expressions/{filename}"

    pose_imgs = []
    pose_manifest = {}
    for pose in POSES:
        prompt = f"""
{BASE_STYLE}
Use the supplied reference as strict identity reference for the SAME exact character.
Create a half-body dialogue pose named {pose}.
Keep identical face, hair, costume, colors and apparent age.
Pose meaning:
- IdleListening: calm attentive listening posture
- Speaking: natural conversational hand/body emphasis
- WorkingAtConsole: hands operating a futuristic console just below chest level
- RunningAction: dynamic urgent movement posture
- BracingAlert: body braced during alarm or impact
Use flat pure chroma green (#00FF00) background only. No text. Keep consistent half-body scale.
"""
        img = generate_image(client, prompt, reference=reference)
        img = remove_green_background(img)
        filename = f"CHR_{character_id}_POSE_{pose}.png"
        img.save(pose_dir / filename)
        pose_imgs.append(img)
        pose_manifest[pose] = f"poses/{filename}"

    expr_sheet = sheet_dir / f"CHR_{character_id}_EXPRESSIONS_5x2.png"
    pose_sheet = sheet_dir / f"CHR_{character_id}_POSES_5x1.png"
    build_sheet(expression_imgs, 5, 2, expr_sheet)
    build_sheet(pose_imgs, 5, 1, pose_sheet)

    manifest = {
        "schema": "STARWARS_DELTA_DIALOGUE_ART_V1",
        "characterId": character_id,
        "reference": f"reference/{ref_path.name}",
        "expressions": expression_manifest,
        "poses": pose_manifest,
        "sheets": {
            "expressions": f"sheets/{expr_sheet.name}",
            "poses": f"sheets/{pose_sheet.name}",
        },
        "unityVocabulary": {
            "expressions": EXPRESSIONS,
            "poses": POSES,
        },
    }
    with open(char_dir / f"CHR_{character_id}_MANIFEST.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--character", choices=sorted(CHARACTERS.keys()))
    parser.add_argument("--output", default="generated_dialogue_art")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise SystemExit("GEMINI_API_KEY is not set")

    client = genai.Client(api_key=api_key)
    root = Path(args.output).resolve()
    root.mkdir(parents=True, exist_ok=True)

    ids = [args.character] if args.character else list(CHARACTERS.keys())
    for character_id in ids:
        print(f"[GENERATE] {character_id}")
        generate_character(client, character_id, CHARACTERS[character_id], root)
        print(f"[DONE] {character_id}")

    print(f"\nOutput: {root}")
    print("Review identity consistency before promoting generated art into the Unity Catalog.")


if __name__ == "__main__":
    main()
