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

VISUAL_AUTHORING_ROUTES = {"Actor", "Layer", "Effect", "Ui"}

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
    if route == "Animation":
        return entry.get("authoringAssetId") or entry.get("assetId") or entry.get("animationId")
    if route == "Audio":
        return entry.get("authoringAssetId") or entry.get("assetId") or entry.get("audioId")
    return entry.get("authoringAssetId")


def runtime_hash(value):
    return hashlib.sha1(str(value or "").encode("utf-8")).hexdigest()[:8]


def stable_handle(display, rid):
    return f"{slug(display)}__{runtime_hash(rid)}"


def route_allowed(entry, route):
    allowed = set(entry.get("allowedUses") or [])
    return not allowed or route in allowed


def audio_authoring_publish_safe(entry):
    """Certify exact non-visual Audio without requiring visual review."""
    rid = runtime_id(entry, "Audio")
    if not rid or entry.get("safeForPreview") is not True or not route_allowed(entry, "Audio"):
        return False
    capabilities = set(entry.get("capabilities") or []) | set(entry.get("selectedCapabilities") or [])
    if "Cutscene.Audio" not in capabilities:
        return False
    severities = list(entry.get("reviewSeverities") or [])
    if entry.get("reviewSeverity") not in (None, ""):
        severities.append(entry.get("reviewSeverity"))
    return not any(str(value or "").strip().lower() in {"blocker", "error"} for value in severities)


def authoring_safe_for_publish(entry, route):
    if route == "Audio":
        return audio_authoring_publish_safe(entry)
    return bool(entry.get("safeForPublish"))


def is_eligible(entry, route):
    rid = runtime_id(entry, route)
    if not rid or not route_allowed(entry, route):
        return False

    if route == "Audio":
        if entry.get("safeForPreview") is False:
            return False
        recommendation = str(entry.get("recommendationStatus") or "").strip()
        selection = str(entry.get("selectionStatus") or "").strip()
        return recommendation == "RECOMMENDABLE" or selection in {
            "CATALOG_VERIFIED_PREVIEW_SAFE",
            "CATALOG_VERIFIED_PUBLISH_SAFE",
        }

    if route == "Animation":
        # An Animation handle names an exact CURRENT clip. Compatibility is a
        # relationship between that clip and the selected Actor, not a reason to
        # erase the clip from the vocabulary. Keep every exact preview-safe
        # Cutscene.Animation handle and publish the pairing evidence with it.
        if entry.get("safeForPreview") is not True:
            return False
        capabilities = set(entry.get("capabilities") or []) | set(entry.get("selectedCapabilities") or [])
        return "Cutscene.Animation" in capabilities

    if entry.get("recommendationStatus") != "RECOMMENDABLE":
        return False

    # Actor is a world-presentation route. Ships and props may legally occupy it.
    if route == "Actor" and entry.get("safeForPreview") is False:
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
    recommendable_runtime_ids = {route: set() for route in VISUAL_AUTHORING_ROUTES}

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
            rid = runtime_id(entry, route)
            if route in VISUAL_AUTHORING_ROUTES and entry.get("recommendationStatus") == "RECOMMENDABLE":
                if not rid:
                    raise SystemExit(
                        "AUTHORING_HANDLES_RECOMMENDABLE_ID_MISSING: "
                        + route
                        + " "
                        + str(entry.get("displayName") or "<unnamed>")
                    )
                if not route_allowed(entry, route) or entry.get("safeForPreview") is False:
                    raise SystemExit(
                        "AUTHORING_HANDLES_RECOMMENDABLE_ROUTE_ILLEGAL: "
                        + route
                        + " "
                        + str(entry.get("displayName") or rid)
                    )
                recommendable_runtime_ids[route].add(rid)

            if not is_eligible(entry, route):
                continue
            rid = runtime_id(entry, route)
            eligible_runtime_ids[route].add(rid)
            display = entry.get("displayName") or rid
            handle = stable_handle(display, rid)

            identity_key = (route, rid)
            if identity_key in used:
                continue
            used.add(identity_key)

            visual = entry.get("visualEvidence") or {}
            source_safe_for_publish = entry.get("safeForPublish")
            projected_safe_for_publish = authoring_safe_for_publish(entry, route)
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
                "safeForPublish": projected_safe_for_publish,
                "sourceSafeForPublish": source_safe_for_publish,
                "publishSafetySource": "AUDIO_NON_VISUAL_EXACT_CURRENT_ROUTE" if route == "Audio" else "DIRECTOR_CURRENT_CONTRACT",
                "selectionStatus": entry.get("selectionStatus"),
                "compatibilityRequirement": entry.get("compatibilityRequirement") if route == "Animation" else None,
                "compatibilityEvidenceStatus": entry.get("compatibilityEvidenceStatus") if route == "Animation" else None,
                "compatibleActorAssetIds": entry.get("compatibleActorAssetIds") or [] if route == "Animation" else [],
                "recommendableCompatibleActorAssetIds": entry.get("recommendableCompatibleActorAssetIds") or [] if route == "Animation" else [],
                "blockedCompatibleActorAssetIds": entry.get("blockedCompatibleActorAssetIds") or [] if route == "Animation" else [],
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

    for route, expected_ids in recommendable_runtime_ids.items():
        actual_ids = {entry["runtimeId"] for entry in entries if entry["route"] == route}
        missing = sorted(expected_ids - actual_ids)
        if missing:
            raise SystemExit(
                "AUTHORING_HANDLES_RECOMMENDABLE_WITHOUT_HANDLE: "
                + route
                + " missing="
                + repr(missing[:10])
            )

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

    if counts_by_route.get("Animation", 0) <= 0:
        raise SystemExit("AUTHORING_HANDLES_ANIMATION_EMPTY: CURRENT exposes no legal Animation handles")
    if counts_by_route.get("Audio", 0) <= 0:
        raise SystemExit("AUTHORING_HANDLES_AUDIO_EMPTY: CURRENT exposes no legal Audio handles")
    unsafe_audio = [
        entry["runtimeId"]
        for entry in entries
        if entry["route"] == "Audio" and entry.get("safeForPublish") is not True
    ]
    if unsafe_audio:
        raise SystemExit(
            "AUTHORING_HANDLES_AUDIO_NOT_PUBLISH_SAFE: "
            + repr(unsafe_audio[:10])
        )

    payload = {
        "schema": "STARWARS_DELTA_AUTHORING_HANDLES",
        "schemaVersion": 3,
        "purpose": "Semantic authoring handles for CUTSCENE_SCRIPT_V1. ChatGPT uses handles; Unity/compiler owns runtime IDs and V5 serialization.",
        "handleContract": {
            "format": "<readable_slug>__<8-char lowercase sha1(runtimeId)>",
            "authoritativePart": "runtimeHash suffix",
            "resolution": "Unity recomputes the same short SHA-1 from exact local CURRENT runtime identities. It never fuzzy-matches the readable prefix.",
            "unknownHandle": "REAL BLOCKER",
            "ambiguousRuntimeHash": "REAL BLOCKER",
            "recommendableCoverage": "Every RECOMMENDABLE visual Director identity must resolve to exactly one handle on its allowed route.",
            "animationCoverage": "Every exact preview-safe Cutscene.Animation identity remains addressable. Actor compatibility is validated as a pairing rule, never by deleting the animation handle.",
            "audioPublishSafety": "Audio is non-visual. Exact CURRENT identity + Audio allowedUse + Cutscene.Audio + preview safety + no blocker/error severity is publish-safe without Vision review. sourceSafeForPublish preserves the original Catalog projection."
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
