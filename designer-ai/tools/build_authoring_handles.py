#!/usr/bin/env python3
import hashlib
import json
import pathlib
import re
import shutil
from collections import Counter

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

REQUIRED_CURRENT_KEYS = (
    "catalogRevision",
    "contractRevision",
    "schemaHash",
    "snapshotContentHash",
    "authoringRuleRegistryRevision",
)


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def semantic_required_current(payload, label):
    source = payload.get("requiredCurrent") or payload.get("atomicIdentity") or {}
    identity = {key: source.get(key) for key in REQUIRED_CURRENT_KEYS}
    missing = [key for key, value in identity.items() if value is None or str(value).strip() == ""]
    if missing:
        raise SystemExit(
            "AUTHORING_HANDLES_IDENTITY_INCOMPLETE: "
            + label
            + " missing "
            + ", ".join(missing)
        )
    return identity


def slug(text):
    value = re.sub(r"[^a-z0-9]+", "_", str(text or "").lower()).strip("_")
    return value or "asset"


def runtime_id(entry, route):
    if route == "Actor":
        return entry.get("canonicalActorAssetId") or entry.get("authoringAssetId")
    if route == "Audio":
        # Audio Director projection owns an exact assetId but historically did not
        # expose authoringAssetId. The exact CURRENT assetId is therefore the
        # deterministic runtime identity used by the Simple V1 handle contract.
        return entry.get("authoringAssetId") or entry.get("assetId") or entry.get("audioId")
    return entry.get("authoringAssetId")


def runtime_hash(value):
    return hashlib.sha1(str(value or "").encode("utf-8")).hexdigest()[:8]


def stable_handle(display, rid):
    # The human-readable prefix is intentionally non-authoritative. Unity resolves
    # the exact local CURRENT runtime identity from the short SHA-1 suffix. This
    # keeps handles stable even if Director display labels are later improved.
    return f"{slug(display)}__{runtime_hash(rid)}"


def is_eligible(entry, route):
    rid = runtime_id(entry, route)
    if not rid:
        return False

    allowed = set(entry.get("allowedUses") or [])
    if allowed and route not in allowed:
        return False

    if route == "Audio":
        # Audio is a non-visual Simple V1 route. It has no Atlas obligation and
        # currently uses Director selectionStatus instead of recommendationStatus.
        # Preview-safe CURRENT Audio is authorable even when publish certification
        # is still false; safeForPublish remains visible on the emitted handle.
        if entry.get("safeForPreview") is False:
            return False
        recommendation = str(entry.get("recommendationStatus") or "").strip()
        selection = str(entry.get("selectionStatus") or "").strip()
        return recommendation == "RECOMMENDABLE" or selection == "CATALOG_VERIFIED_PREVIEW_SAFE"

    if entry.get("recommendationStatus") != "RECOMMENDABLE":
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
    for name in ("CUTSCENE_SCRIPT_V1.schema.json", "EXAMPLE_FALSE_VICTORY.json", "ARCHITECTURE.md"):
        src = SOURCE_SIMPLE / name
        if src.is_file():
            shutil.copy2(src, OUT_DIR / name)

    current_path = ROOT / "OPEN_CURRENT.json"
    if not current_path.is_file():
        raise SystemExit("AUTHORING_HANDLES_CURRENT_MISSING: _open_current_stage/OPEN_CURRENT.json")
    current_payload = read_json(current_path)
    required_current = semantic_required_current(current_payload, "OPEN_CURRENT")

    entries = []
    used = set()
    eligible_runtime_ids = {route: set() for route in CATEGORY_ROUTES.values()}

    for filename, route in CATEGORY_ROUTES.items():
        path = DIRECTOR / filename
        if not path.is_file():
            continue
        payload = read_json(path)
        category_current = semantic_required_current(payload, filename)
        if category_current != required_current:
            raise SystemExit(
                "AUTHORING_HANDLES_IDENTITY_MISMATCH: "
                + filename
                + " does not match OPEN_CURRENT.requiredCurrent"
            )

        for entry in payload.get("assets") or []:
            if not is_eligible(entry, route):
                continue
            rid = runtime_id(entry, route)
            eligible_runtime_ids[route].add(rid)
            display = entry.get("displayName") or rid
            handle = stable_handle(display, rid)

            # Same runtime route/identity may be projected by more than one source
            # record. Publish one handle, not aliases that could make authoring
            # selection look ambiguous.
            identity_key = (route, rid)
            if identity_key in used:
                continue
            used.add(identity_key)

            visual = entry.get("visualEvidence") or {}
            entries.append({
                "handle": handle,
                "runtimeHash": runtime_hash(rid),
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
                "visualReferenceId": None if route == "Audio" else entry.get("visualReferenceId"),
                "atlasPage": None if route == "Audio" else visual.get("atlasPage"),
                "atlasSlot": None if route == "Audio" else visual.get("atlasSlot"),
                "pageImageUrl": None if route == "Audio" else visual.get("pageImageUrl"),
                "atlasPdfUrl": None if route == "Audio" else visual.get("atlasPdfUrl"),
                "compatibleAnimationIds": entry.get("compatibleAnimationIds") or [],
                "compatibleDialogueVisualIds": entry.get("compatibleDialogueVisualIds") or [],
            })

    counts_by_route = Counter(entry["route"] for entry in entries)

    # Builder-owned invariant: every eligible CURRENT runtime identity gets exactly
    # one handle on its route. Do not let Director claim authorability that the
    # Simple V1 vocabulary cannot express.
    for route, expected_ids in eligible_runtime_ids.items():
        actual_ids = {entry["runtimeId"] for entry in entries if entry["route"] == route}
        if actual_ids != expected_ids:
            missing = sorted(expected_ids - actual_ids)
            extra = sorted(actual_ids - expected_ids)
            raise SystemExit(
                "AUTHORING_HANDLES_ROUTE_COVERAGE_MISMATCH: "
                + route
                + " missing="
                + repr(missing[:10])
                + " extra="
                + repr(extra[:10])
            )

    # Hash suffixes are authoritative. A collision is therefore a real publishing
    # blocker, not something a consumer may guess through.
    hash_owner = {}
    handle_owner = {}
    for entry in entries:
        rid = entry["runtimeId"]
        h = entry["runtimeHash"]
        handle = entry["handle"]
        if h in hash_owner and hash_owner[h] != rid:
            raise SystemExit(
                "AUTHORING_HANDLES_RUNTIME_HASH_COLLISION: "
                + h
                + " maps to both "
                + hash_owner[h]
                + " and "
                + rid
            )
        hash_owner[h] = rid
        owner = (entry["route"], rid)
        if handle in handle_owner and handle_owner[handle] != owner:
            raise SystemExit(
                "AUTHORING_HANDLES_HANDLE_COLLISION: "
                + handle
                + " maps to multiple CURRENT identities"
            )
        handle_owner[handle] = owner

    if counts_by_route.get("Audio", 0) <= 0:
        raise SystemExit("AUTHORING_HANDLES_AUDIO_EMPTY: CURRENT exposes no legal Audio handles")

    payload = {
        "schema": "STARWARS_DELTA_AUTHORING_HANDLES",
        "schemaVersion": 2,
        "purpose": "Semantic authoring handles for CUTSCENE_SCRIPT_V1. ChatGPT uses handles; Unity/compiler owns runtime IDs and V5 serialization.",
        "handleContract": {
            "format": "<readable_slug>__<8-char lowercase sha1(runtimeId)>",
            "authoritativePart": "runtimeHash suffix",
            "resolution": "Unity recomputes the same short SHA-1 from exact local CURRENT runtime identities. It never fuzzy-matches the readable prefix.",
            "unknownHandle": "REAL BLOCKER",
            "ambiguousRuntimeHash": "REAL BLOCKER"
        },
        "requiredCurrent": required_current,
        "count": len(entries),
        "countsByRoute": {route: counts_by_route.get(route, 0) for route in CATEGORY_ROUTES.values()},
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
            "unityExistingBridge": "V3 already measures Renderer bounds through WorldToViewportPoint and supports requestedScreenHeightFraction/targetScreenHeightFraction. CUTSCENE_SCRIPT_V1 adapts into that existing spatial system instead of creating a second scale engine."
        }
    }
    OUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("AUTHORING_HANDLES_BUILT", len(entries))
    print("AUTHORING_HANDLES_COUNTS", json.dumps(payload["countsByRoute"], sort_keys=True))
    print("AUTHORING_HANDLES_PATH", OUT_PATH)


if __name__ == "__main__":
    main()
