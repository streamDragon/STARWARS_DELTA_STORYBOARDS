#!/usr/bin/env python3
import hashlib
import json
import pathlib
import re
import shutil

ROOT = pathlib.Path("_open_current_stage")
SOURCE_SIMPLE = pathlib.Path("designer-ai/simple-authoring")
DIRECTOR = ROOT / "director-view"
OUT_DIR = ROOT / "simple-authoring"
OUT_PATH = OUT_DIR / "AUTHORING_HANDLES.json"

CATEGORY_ROUTES = {
    "actors.json": "Actor",
    "layers.json": "Layer",
    "effects.json": "Effect",
    "ui.json": "Ui",
    "animations.json": "Animation",
    "audio.json": "Audio",
}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def slug(text):
    value = re.sub(r"[^a-z0-9]+", "_", str(text or "").lower()).strip("_")
    return value or "asset"


def runtime_id(entry, route):
    if route == "Actor":
        return entry.get("canonicalActorAssetId") or entry.get("authoringAssetId")
    return entry.get("authoringAssetId")


def is_eligible(entry, route):
    if entry.get("recommendationStatus") != "RECOMMENDABLE":
        return False
    rid = runtime_id(entry, route)
    if not rid:
        return False
    allowed = set(entry.get("allowedUses") or [])
    if allowed and route not in allowed:
        return False
    if route == "Actor":
        caps = set(entry.get("capabilities") or []) | set(entry.get("selectedCapabilities") or [])
        if "Cutscene.Actor" not in caps:
            return False
        if entry.get("safeForPreview") is False:
            return False
    return True


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name in ("CUTSCENE_SCRIPT_V1.schema.json", "EXAMPLE_FALSE_VICTORY.json"):
        src = SOURCE_SIMPLE / name
        if src.is_file():
            shutil.copy2(src, OUT_DIR / name)

    entries = []
    used = set()
    identity = None

    for filename, route in CATEGORY_ROUTES.items():
        path = DIRECTOR / filename
        if not path.is_file():
            continue
        payload = read_json(path)
        identity = identity or payload.get("requiredCurrent") or payload.get("atomicIdentity")
        for entry in payload.get("assets") or []:
            if not is_eligible(entry, route):
                continue
            rid = runtime_id(entry, route)
            display = entry.get("displayName") or rid
            base = slug(display)
            handle = base
            if handle in used:
                suffix = hashlib.sha1(str(rid).encode("utf-8")).hexdigest()[:8]
                handle = f"{base}_{suffix}"
            used.add(handle)
            visual = entry.get("visualEvidence") or {}
            entries.append({
                "handle": handle,
                "displayName": display,
                "route": route,
                "runtimeId": rid,
                "authoringRuntimeForm": entry.get("authoringRuntimeForm"),
                "supports": entry.get("supportedActions") or [],
                "capabilities": entry.get("capabilities") or entry.get("selectedCapabilities") or [],
                "allowedUses": entry.get("allowedUses") or [],
                "safeForPreview": entry.get("safeForPreview"),
                "safeForPublish": entry.get("safeForPublish"),
                "proportionClass": entry.get("proportionClass"),
                "targetScreenFraction": entry.get("targetScreenFraction"),
                "scaleBasis": entry.get("scaleBasis"),
                "systemManagedProportions": entry.get("systemManagedProportions"),
                "visualReferenceId": entry.get("visualReferenceId"),
                "atlasPage": visual.get("atlasPage"),
                "atlasSlot": visual.get("atlasSlot"),
                "pageImageUrl": visual.get("pageImageUrl"),
                "atlasPdfUrl": visual.get("atlasPdfUrl"),
                "compatibleAnimationIds": entry.get("compatibleAnimationIds") or [],
                "compatibleDialogueVisualIds": entry.get("compatibleDialogueVisualIds") or [],
            })

    payload = {
        "schema": "STARWARS_DELTA_AUTHORING_HANDLES",
        "schemaVersion": 1,
        "purpose": "Semantic authoring handles for CUTSCENE_SCRIPT_V1. ChatGPT uses handles; Unity/compiler owns runtime IDs and V5 serialization.",
        "requiredCurrent": identity,
        "count": len(entries),
        "handles": sorted(entries, key=lambda x: (x["route"], x["handle"])),
        "cutsceneViewBoundsContract": {
            "space": "Unity world space",
            "cameraOwned": True,
            "authoringCoordinates": {
                "screenX": "0..1 left to right",
                "screenY": "0..1 bottom to top",
                "screenWidthFraction": "visible width fraction of current cutscene camera view",
                "screenHeightFraction": "visible height fraction of current cutscene camera view"
            },
            "orthographicViewRule": {
                "visibleHeight": "orthographicSize * 2",
                "visibleWidth": "visibleHeight * cameraAspect",
                "left": "cameraX - visibleWidth / 2",
                "right": "cameraX + visibleWidth / 2",
                "bottom": "cameraY - visibleHeight / 2",
                "top": "cameraY + visibleHeight / 2"
            },
            "compilerRule": "Final world scale is derived from natural asset Renderer bounds + actual cutscene camera visible bounds + requested screen fraction. Do not interpret words such as giant/small as raw Unity scale values.",
            "unityExistingBridge": "V3 already measures Renderer bounds through WorldToViewportPoint and supports requestedScreenHeightFraction/targetScreenHeightFraction. CUTSCENE_SCRIPT_V1 should adapt into that existing spatial system instead of creating a second scale engine."
        }
    }
    OUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("AUTHORING_HANDLES_BUILT", len(entries))
    print("AUTHORING_HANDLES_PATH", OUT_PATH)


if __name__ == "__main__":
    main()
