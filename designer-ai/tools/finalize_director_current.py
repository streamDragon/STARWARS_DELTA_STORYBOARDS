#!/usr/bin/env python3
import json
import os
import pathlib
import re
import shutil
import tempfile
import urllib.request
import zipfile
from collections import Counter

ROOT = pathlib.Path("_open_current_stage")
CURRENT_PATH = pathlib.Path("designer-ai/current.json")
PAGES_BASE = "https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current"
PACK_NAME = "STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip"
REPO = os.environ["REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path, payload, compact=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False) if compact else json.dumps(payload, indent=2, ensure_ascii=False)
    path.write_text(text + "\n", encoding="utf-8")


def get_json(url):
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {TOKEN}",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "STARWARS-DELTA-director-finalizer",
        },
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.load(response)


def download(url, destination):
    request = urllib.request.Request(url, headers={"User-Agent": "STARWARS-DELTA-director-finalizer"})
    with urllib.request.urlopen(request, timeout=600) as response, open(destination, "wb") as output:
        shutil.copyfileobj(response, output)


def load_catalog_records(current):
    tag = current["releaseUrl"].rsplit("/releases/tag/", 1)[1]
    release = get_json(f"https://api.github.com/repos/{REPO}/releases/tags/{tag}")
    assets = {asset["name"]: asset for asset in release.get("assets", [])}
    name = "STARWARS_DELTA_CHATGPT_CATALOG_CURRENT.zip"
    if name not in assets:
        raise SystemExit(f"Missing release asset: {name}")

    with tempfile.TemporaryDirectory() as temp_raw:
        archive_path = pathlib.Path(temp_raw) / name
        download(assets[name]["browser_download_url"], archive_path)
        with zipfile.ZipFile(archive_path) as archive:
            summary = json.loads(archive.read("catalog_summary.json").decode("utf-8-sig"))
            diagnostics = json.loads(archive.read("diagnostics_summary.json").decode("utf-8-sig"))
            records = []
            with archive.open("catalog_records.jsonl") as stream:
                for raw in stream:
                    raw = raw.strip()
                    if raw:
                        records.append(json.loads(raw.decode("utf-8-sig")))
    return records, summary, diagnostics


def atomic_identity(director):
    return {
        "publishTransactionId": director.get("publishTransactionId"),
        "catalogRevision": director.get("catalogRevision"),
        "snapshotContentHash": director.get("snapshotContentHash"),
        "contractRevision": director.get("contractRevision"),
        "schemaHash": director.get("schemaHash"),
    }


def unique(values):
    result = []
    seen = set()
    for value in values:
        if value in (None, "", [], {}):
            continue
        marker = json.dumps(value, sort_keys=True, ensure_ascii=False) if isinstance(value, (dict, list)) else str(value)
        if marker in seen:
            continue
        seen.add(marker)
        result.append(value)
    return result


def union_field(records, key):
    values = []
    for record in records:
        raw = record.get(key)
        if raw in (None, "", [], {}):
            continue
        values.extend(raw if isinstance(raw, list) else [raw])
    return unique(values)


def best_text(records, key):
    values = [str(record.get(key) or "").strip() for record in records]
    values = [value for value in values if value]
    return max(values, key=len) if values else ""


def first_value(record, keys):
    for key in keys:
        value = record.get(key)
        if value not in (None, "", [], {}):
            return value
    return None


def source_records_for_entry(entry, by_id):
    ids = []
    ids.extend(entry.get("catalogAssetIds", []) or [])
    ids.extend([entry.get("authoringAssetId"), entry.get("canonicalActorAssetId")])
    records = []
    seen = set()
    for asset_id in ids:
        asset_id = str(asset_id or "")
        if not asset_id or asset_id in seen or asset_id not in by_id:
            continue
        seen.add(asset_id)
        records.append(by_id[asset_id])
    return records


def build_visual_lookup(full_index):
    by_reference = {}
    by_asset = {}
    for entry in full_index.get("assets", []):
        refs = list(entry.get("visualReferenceIds", []) or [])
        if entry.get("visualReferenceId"):
            refs.append(entry["visualReferenceId"])
        for ref in refs:
            if ref:
                by_reference[str(ref)] = entry
        ids = list(entry.get("catalogAssetIds", []) or [])
        if entry.get("assetId"):
            ids.append(entry["assetId"])
        for asset_id in ids:
            if asset_id:
                by_asset[str(asset_id)] = entry
    return by_reference, by_asset


def find_visual(entry, by_reference, by_asset):
    reference = str(entry.get("visualReferenceId") or entry.get("visualEvidence", {}).get("visualReferenceId") or "")
    if reference and reference in by_reference:
        return by_reference[reference]
    ids = list(entry.get("catalogAssetIds", []) or [])
    ids.extend([entry.get("authoringAssetId"), entry.get("canonicalActorAssetId")])
    for asset_id in ids:
        asset_id = str(asset_id or "")
        if asset_id and asset_id in by_asset:
            return by_asset[asset_id]
    return None


def enrich_visual_evidence(evidence, visual):
    evidence = dict(evidence or {})
    if visual:
        evidence.update(
            {
                "visualReferenceId": visual.get("visualReferenceId") or evidence.get("visualReferenceId"),
                "pageImageUrl": visual.get("pageImageUrl"),
                "sheetUrl": visual.get("sheetUrl"),
                "page": visual.get("page"),
                "slot": visual.get("slot"),
                "atlasPdfUrl": visual.get("atlasPdfUrl"),
                "atlasPage": visual.get("atlasPage"),
                "atlasSlot": visual.get("atlasSlot"),
            }
        )
    return evidence


def severity_rank(value):
    order = {
        "": 0,
        "none": 0,
        "metadatauncertain": 1,
        "publishcertification": 2,
        "warning": 2,
        "error": 3,
        "blocker": 4,
    }
    return order.get(str(value or "").replace("_", "").replace("-", "").lower(), 1)


def presentation_metadata(records):
    confidence = max((float(record.get("cutscenePresentationConfidence") or 0) for record in records), default=0.0)
    fit_modes = union_field(records, "cutsceneFitMode")
    coverage = union_field(records, "cutsceneBackgroundCoverage")
    location_types = union_field(records, "cutsceneLocationType")
    scene_states = union_field(records, "cutsceneSceneState")
    lighting = union_field(records, "cutsceneLightingMood")
    return {
        "description": best_text(records, "cutscenePresentationDescription") or None,
        "fitModes": fit_modes,
        "backgroundCoverage": coverage,
        "locationTypes": location_types,
        "sceneStates": scene_states,
        "lightingMoods": lighting,
        "confidence": confidence,
    }


def eligibility_signals(entry):
    reasons = []
    paths = [str(value or "").replace("\\", "/").lower() for value in entry.get("sourcePaths", [])]
    name = str(entry.get("displayName") or "").strip().lower()
    category = str(entry.get("category") or "")
    entity_kind = str(entry.get("entityKind") or "Unknown").lower()
    capabilities = {str(value).lower() for value in entry.get("capabilities", [])}
    roles = {str(value).lower() for value in entry.get("roles", [])}
    tags = {str(value).lower() for value in entry.get("tags", [])}
    all_semantics = capabilities | roles | tags

    path_rules = (
        ("sample_or_demo_path", ("/samples/", "/sample/", "/examples/", "/example/", "/demos/", "/demo/")),
        ("editor_test_or_debug_path", ("/editor/", "/tests/", "/test/", "/debug/", "/gizmos/")),
        ("generated_cutscene_output", ("/cutscenes/generated/",)),
        ("documentation_or_package_tooling_path", ("/documentation/", "/product navigator/")),
    )
    for reason, needles in path_rules:
        if any(any(needle in path for needle in needles) for path in paths):
            reasons.append(reason)

    exclusion_markers = {
        "authoring reference only",
        "referenceonly",
        "not direct cutscene content",
        "not for direct cutscene recommendation",
        "technicalsupport",
        "visual reference only",
        "editor resource",
        "test evidence",
    }
    if all_semantics & exclusion_markers:
        reasons.append("catalog_semantics_exclude_direct_authoring")

    exact_technical_names = {
        "lane",
        "capsule",
        "endwall",
        "end wall",
        "trigger",
        "spawnpoint",
        "spawn point",
        "waypoint",
        "camera zone",
        "spline",
        "helper",
        "debug",
        "square",
        "white 1x1",
        "white_1x1",
        "sphere uv",
        "step",
    }
    if name in exact_technical_names or re.match(r"^(square|cube|sphere|capsule|plane|quad|white[_ -]?1x1)(\b|[_ -])", name):
        reasons.append("generic_technical_or_primitive_identity")

    if category == "Actor" and entity_kind in ("", "unknown"):
        if any(token in name for token in ("laserbeam", "laser beam", "trail", "explosion", "flash", "aura", "fog", "smoke", "particle", "effect")):
            reasons.append("probable_effect_misclassified_as_actor")
        if any(token in name for token in ("letterbox", "dialogue frame", "hud", "button", "cursor", "badge", "ui frame")):
            reasons.append("probable_ui_misclassified_as_actor")
        if any(token in name for token in ("tileset", "background", "backdrop", "sky layer", "ground layer")):
            reasons.append("probable_layer_or_tileset_misclassified_as_actor")

    if category == "Ui" and any(token in name for token in ("explosion", "projectile", "trail", "flame", "smoke", "spark", "impact")):
        reasons.append("probable_effect_misclassified_as_ui")

    return unique(reasons)


def enrich_visual_entry(entry, by_id, by_reference, by_asset):
    records = source_records_for_entry(entry, by_id)
    visual = find_visual(entry, by_reference, by_asset)
    entry["visualEvidence"] = enrich_visual_evidence(entry.get("visualEvidence"), visual)
    for variant in entry.get("visualVariants", []) or []:
        variant_visual = find_visual(variant, by_reference, by_asset)
        variant["visualEvidence"] = enrich_visual_evidence(variant.get("visualEvidence"), variant_visual)

    entry["sourceRecordCount"] = len(records)
    entry["sourceRecordIds"] = [record.get("assetId") for record in records if record.get("assetId")]
    entry["allowedUses"] = union_field(records, "cutsceneAllowedUses")
    entry["supportedActions"] = union_field(records, "cutsceneSupportedActions")
    entry["recommendedLayerRoles"] = union_field(records, "cutsceneRecommendedLayerRoles")
    entry["contractConfidence"] = max((float(record.get("cutsceneContractConfidence") or 0) for record in records), default=0.0)
    entry["reviewReasons"] = union_field(records, "cutsceneReviewReasons")
    severities = unique(record.get("cutsceneReviewSeverity") for record in records)
    entry["reviewSeverities"] = sorted(severities, key=severity_rank, reverse=True)
    entry["presentation"] = presentation_metadata(records)
    entry["entityKindCandidates"] = union_field(records, "entityKindCandidates")

    reasons = eligibility_signals(entry)
    entry["eligibilityStatus"] = "SOURCE_REVIEW_REQUIRED" if reasons else "GIT_AUDIT_CLEAR"
    entry["eligibilityReviewReasons"] = reasons
    pixel_status = str(entry.get("visualEvidence", {}).get("status") or "PIXELS_UNAVAILABLE")
    if reasons:
        entry["recommendationStatus"] = "DO_NOT_RECOMMEND_PENDING_SOURCE_REVIEW"
    elif pixel_status != "PIXELS_VERIFIED":
        entry["recommendationStatus"] = "PIXEL_COMPLETION_REQUIRED"
    else:
        entry["recommendationStatus"] = "RECOMMENDABLE"
    return entry


def visual_completion_item(entry):
    reasons = entry.get("eligibilityReviewReasons", [])
    if reasons:
        required_action = "REVIEW_SOURCE_ELIGIBILITY_BEFORE_PREVIEW"
        required_fix = (
            "Unity Catalog/publisher must first correct or confirm the source classification and cinematic eligibility. "
            "Generate a preview only if the asset remains a legitimate Director choice."
        )
    else:
        required_action = "GENERATE_DETERMINISTIC_PREVIEW"
        required_fix = (
            "Unity Visual Library publisher must export one deterministic, material-safe preview for this safe Director visual identity."
        )
    return {
        "kind": "VisualPreview",
        "priority": "High" if entry.get("category") in ("Actor", "Layer") else "Normal",
        "requiredAction": required_action,
        "visualReferenceId": entry.get("visualReferenceId"),
        "authoringAssetId": entry.get("authoringAssetId"),
        "displayName": entry.get("displayName"),
        "category": entry.get("category"),
        "sourceKinds": entry.get("sourceKinds"),
        "sourcePaths": entry.get("sourcePaths"),
        "eligibilityReviewReasons": reasons,
        "requiredFix": required_fix,
    }


def enrich_animation(animation, by_id, actors_by_id, by_reference, by_asset):
    record = by_id.get(str(animation.get("assetId") or ""), {})
    animation["roles"] = record.get("roles", [])
    animation["semanticFacets"] = record.get("cutsceneSemanticFacets", [])
    animation["allowedUses"] = record.get("cutsceneAllowedUses", [])
    animation["supportedActions"] = record.get("cutsceneSupportedActions", [])
    animation["contractConfidence"] = float(record.get("cutsceneContractConfidence") or 0)
    animation["reviewReasons"] = record.get("cutsceneReviewReasons", [])
    animation["reviewSeverity"] = record.get("cutsceneReviewSeverity")
    animation["durationSeconds"] = first_value(record, ("durationSeconds", "animationDurationSeconds", "clipDurationSeconds"))
    animation["frameRate"] = first_value(record, ("frameRate", "animationFrameRate"))
    animation["semanticAction"] = first_value(record, ("semanticAction", "animationAction", "action"))

    representative = animation.get("representativeVisual")
    if representative:
        visual = find_visual(representative, by_reference, by_asset)
        representative["visualEvidence"] = enrich_visual_evidence(representative.get("visualEvidence"), visual)

    compatible = [str(value) for value in animation.get("compatibleActorAssetIds", []) if value]
    unknown = [asset_id for asset_id in compatible if asset_id not in actors_by_id]
    valid = [asset_id for asset_id in compatible if asset_id in actors_by_id]
    animation["compatibleActorAssetIds"] = valid
    animation["unknownCompatibleActorAssetIds"] = unknown

    fallback = None
    if valid:
        actor = actors_by_id[valid[0]]
        actor_evidence = actor.get("visualEvidence", {})
        if actor_evidence.get("status") == "PIXELS_VERIFIED":
            fallback = {
                "evidenceType": "ACTOR_APPEARANCE_ONLY",
                "actorAssetId": valid[0],
                "displayName": actor.get("displayName"),
                "visualEvidence": actor_evidence,
            }
    animation["actorAppearanceFallback"] = fallback

    representative_verified = bool(
        representative and representative.get("visualEvidence", {}).get("status") == "PIXELS_VERIFIED"
    )
    if representative_verified:
        animation["representativeStatus"] = "ANIMATION_FAMILY_PIXELS_VERIFIED"
    elif fallback:
        animation["representativeStatus"] = "ACTOR_APPEARANCE_ONLY_MOTION_PIXELS_MISSING"
    else:
        animation["representativeStatus"] = "REPRESENTATIVE_PIXELS_MISSING"

    blocking = []
    quality = []
    if not valid:
        blocking.append("compatibleActorAssetIds")
    if unknown:
        blocking.append("unknownCompatibleActorAssetIds")
    if not animation.get("description"):
        quality.append("description")
    if not animation.get("family"):
        quality.append("family")
    if not representative_verified:
        quality.append("representativePixels")
    if animation.get("durationSeconds") is None:
        quality.append("durationSeconds")
    if animation.get("semanticAction") in (None, ""):
        quality.append("semanticAction")
    animation["blockingCompletionNeeded"] = unique(blocking)
    animation["qualityCompletionNeeded"] = unique(quality)
    animation["metadataCompletionNeeded"] = unique(blocking + quality)
    animation["selectionStatus"] = "BLOCKED_COMPATIBILITY" if blocking else "CATALOG_COMPATIBLE"
    return animation


def enrich_audio(audio, by_id):
    record = by_id.get(str(audio.get("assetId") or ""), {})
    duration = first_value(record, ("durationSeconds", "audioDurationSeconds", "clipDurationSeconds"))
    loop_metadata = first_value(record, ("loopMetadata", "audioLoopMetadata"))
    if loop_metadata is None:
        loop_flag = first_value(record, ("isLooping", "loop", "loopable"))
        if loop_flag is not None:
            loop_metadata = {"isLooping": bool(loop_flag), "source": "CatalogField"}
        elif "loop" in {str(value).lower() for value in record.get("tags", [])}:
            loop_metadata = {"isLooping": True, "source": "CatalogTag"}

    audio["description"] = record.get("description") or audio.get("description") or ""
    audio["roles"] = record.get("roles", [])
    audio["collections"] = record.get("collections", [])
    audio["semanticFacets"] = record.get("cutsceneSemanticFacets", [])
    audio["allowedUses"] = record.get("cutsceneAllowedUses", [])
    audio["supportedActions"] = record.get("cutsceneSupportedActions", [])
    audio["contractConfidence"] = float(record.get("cutsceneContractConfidence") or 0)
    audio["reviewReasons"] = record.get("cutsceneReviewReasons", [])
    audio["reviewSeverity"] = record.get("cutsceneReviewSeverity")
    audio["durationSeconds"] = duration
    audio["loopMetadata"] = loop_metadata
    audio["mood"] = first_value(record, ("mood", "audioMood", "cutsceneMood"))
    audio["intensity"] = first_value(record, ("intensity", "audioIntensity"))

    quality = []
    if not audio.get("description"):
        quality.append("description")
    if duration is None:
        quality.append("durationSeconds")
    if loop_metadata is None:
        quality.append("loopMetadata")
    if audio.get("mood") in (None, ""):
        quality.append("mood")
    if audio.get("intensity") in (None, ""):
        quality.append("intensity")
    audio["blockingCompletionNeeded"] = []
    audio["qualityCompletionNeeded"] = quality
    audio["metadataCompletionNeeded"] = quality
    audio["selectionStatus"] = "CATALOG_VERIFIED_PREVIEW_SAFE" if audio.get("safeForPreview") else "NOT_PREVIEW_SAFE"
    return audio


def presentation_coverage(categories):
    result = {}
    for category, entries in categories.items():
        total = len(entries)
        counts = Counter()
        for entry in entries:
            presentation = entry.get("presentation", {})
            if presentation.get("description"):
                counts["description"] += 1
            if presentation.get("locationTypes"):
                counts["locationTypes"] += 1
            if presentation.get("sceneStates"):
                counts["sceneStates"] += 1
            if presentation.get("lightingMoods"):
                counts["lightingMoods"] += 1
            coverage = [str(value).lower() for value in presentation.get("backgroundCoverage", [])]
            if coverage and any(value not in ("unknown", "") for value in coverage):
                counts["backgroundCoverageKnown"] += 1
            if presentation.get("fitModes"):
                counts["fitModes"] += 1
        result[category] = {"total": total, **dict(counts)}
    return result


def rebuild_pack(modified_paths):
    pack = ROOT / PACK_NAME
    if not pack.is_file():
        raise SystemExit(f"Missing Director pack: {pack}")
    replacements = {str(path.relative_to(ROOT)).replace(os.sep, "/") for path in modified_paths}
    descriptor, temp_name = tempfile.mkstemp(prefix="director-current-", suffix=".zip", dir=str(ROOT))
    os.close(descriptor)
    temp_path = pathlib.Path(temp_name)
    try:
        with zipfile.ZipFile(pack, "r") as source, zipfile.ZipFile(temp_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=7) as target:
            for member in source.infolist():
                if member.filename in replacements:
                    continue
                target.writestr(member, source.read(member.filename))
            for path in modified_paths:
                target.write(path, str(path.relative_to(ROOT)).replace(os.sep, "/"))
        os.replace(temp_path, pack)
    finally:
        if temp_path.exists():
            temp_path.unlink()


def main():
    current = read_json(CURRENT_PATH)
    records, catalog_summary, diagnostics = load_catalog_records(current)
    by_id = {str(record.get("assetId")): record for record in records if record.get("assetId")}

    open_path = ROOT / "OPEN_CURRENT.json"
    director_path = ROOT / "director-view" / "DIRECTOR_VIEW.json"
    manifest_path = ROOT / "DIRECTOR_PACK_MANIFEST.json"
    queue_path = ROOT / "director-view" / "completion-queue.json"
    audit_path = ROOT / "director-view" / "eligibility-audit.json"
    read_first_path = ROOT / "CHATGPT_READ_FIRST.txt"
    full_index_path = ROOT / "FULL_VISUAL_INDEX.json"

    open_manifest = read_json(open_path)
    director = read_json(director_path)
    pack_manifest = read_json(manifest_path)
    full_index = read_json(full_index_path)
    by_reference, by_asset = build_visual_lookup(full_index)

    identity = atomic_identity(director)
    if not identity["publishTransactionId"] or identity["catalogRevision"] is None or not identity["snapshotContentHash"]:
        raise SystemExit("Director atomic identity is incomplete")
    if identity["publishTransactionId"] != current.get("publishTransactionId"):
        raise SystemExit("Director publishTransactionId does not match CURRENT")
    if identity["catalogRevision"] != catalog_summary.get("catalogRevision"):
        raise SystemExit("Director catalogRevision does not match Catalog")
    if identity["snapshotContentHash"] != catalog_summary.get("snapshotContentHash"):
        raise SystemExit("Director snapshotContentHash does not match Catalog")

    category_files = {
        "Actor": ROOT / "director-view" / "actors.json",
        "Layer": ROOT / "director-view" / "layers.json",
        "Effect": ROOT / "director-view" / "effects.json",
        "Ui": ROOT / "director-view" / "ui.json",
    }
    category_payloads = {}
    category_entries = {}
    audit_items = []

    for category, path in category_files.items():
        payload = read_json(path)
        entries = []
        for raw in payload.get("assets", []):
            entry = enrich_visual_entry(raw, by_id, by_reference, by_asset)
            entries.append(entry)
            if entry.get("eligibilityReviewReasons"):
                audit_items.append(
                    {
                        "category": category,
                        "displayName": entry.get("displayName"),
                        "authoringAssetId": entry.get("authoringAssetId"),
                        "canonicalActorAssetId": entry.get("canonicalActorAssetId"),
                        "visualReferenceId": entry.get("visualReferenceId"),
                        "sourcePaths": entry.get("sourcePaths", []),
                        "reasons": entry.get("eligibilityReviewReasons", []),
                        "pixelStatus": entry.get("visualEvidence", {}).get("status"),
                        "recommendationStatus": entry.get("recommendationStatus"),
                    }
                )
        payload["schemaVersion"] = max(int(payload.get("schemaVersion", 0)), 4)
        payload["assets"] = entries
        payload["count"] = len(entries)
        category_payloads[category] = payload
        category_entries[category] = entries

    actors_by_id = {}
    for actor in category_entries["Actor"]:
        for asset_id in (actor.get("authoringAssetId"), actor.get("canonicalActorAssetId")):
            if asset_id:
                actors_by_id[str(asset_id)] = actor

    animations_path = ROOT / "director-view" / "animations.json"
    animations_payload = read_json(animations_path)
    animations = [
        enrich_animation(animation, by_id, actors_by_id, by_reference, by_asset)
        for animation in animations_payload.get("assets", [])
    ]
    animations_payload["schemaVersion"] = max(int(animations_payload.get("schemaVersion", 0)), 4)
    animations_payload["assets"] = animations
    animations_payload["count"] = len(animations)

    audio_path = ROOT / "director-view" / "audio.json"
    audio_payload = read_json(audio_path)
    audio_assets = [enrich_audio(audio, by_id) for audio in audio_payload.get("assets", [])]
    audio_payload["schemaVersion"] = max(int(audio_payload.get("schemaVersion", 0)), 4)
    audio_payload["assets"] = audio_assets
    audio_payload["count"] = len(audio_assets)

    visual_queue = []
    all_visual_entries = []
    for entries in category_entries.values():
        all_visual_entries.extend(entries)
    for entry in all_visual_entries:
        if entry.get("visualEvidence", {}).get("status") != "PIXELS_VERIFIED":
            visual_queue.append(visual_completion_item(entry))

    animation_queue = []
    for animation in animations:
        missing = animation.get("metadataCompletionNeeded", [])
        if not missing:
            continue
        animation_queue.append(
            {
                "kind": "AnimationMetadata",
                "priority": "High" if animation.get("blockingCompletionNeeded") else "Normal",
                "assetId": animation.get("assetId"),
                "displayName": animation.get("displayName"),
                "blockingMissing": animation.get("blockingCompletionNeeded", []),
                "qualityMissing": animation.get("qualityCompletionNeeded", []),
                "missing": missing,
                "requiredFix": (
                    "Unity Catalog/Director publisher must export exact canonical Actor compatibility, semantic motion metadata, "
                    "clip duration and one representative animation-family visual."
                ),
            }
        )

    audio_queue = []
    for audio in audio_assets:
        missing = audio.get("metadataCompletionNeeded", [])
        if not missing:
            continue
        audio_queue.append(
            {
                "kind": "AudioMetadata",
                "priority": "Normal",
                "assetId": audio.get("assetId"),
                "displayName": audio.get("displayName"),
                "blockingMissing": [],
                "qualityMissing": missing,
                "missing": missing,
                "requiredFix": (
                    "Unity Audio Director exporter must provide exact duration, loop behavior, purpose, description, mood and intensity. "
                    "Audio remains usable for Preview when Catalog-safe; these are metadata completion items, not visual gaps."
                ),
            }
        )

    visual_generation = [item for item in visual_queue if item.get("requiredAction") == "GENERATE_DETERMINISTIC_PREVIEW"]
    visual_review = [item for item in visual_queue if item.get("requiredAction") == "REVIEW_SOURCE_ELIGIBILITY_BEFORE_PREVIEW"]
    presentation = presentation_coverage(category_entries)
    queue = {
        "schema": "STARWARS_DELTA_DIRECTOR_COMPLETION_QUEUE",
        "schemaVersion": 4,
        "status": "CURRENT_GAPS_EXPLICIT",
        "publishTransactionId": identity["publishTransactionId"],
        "visualPreviewCount": len(visual_queue),
        "visualPreviewGenerationCount": len(visual_generation),
        "visualEligibilityReviewCount": len(visual_review),
        "animationMetadataCount": len(animation_queue),
        "audioMetadataCount": len(audio_queue),
        "presentationMetadata": {
            "coverageByCategory": presentation,
            "currentState": (
                "General semantic annotations are strong, but Director presentation metadata remains incomplete for location, scene state, "
                "lighting mood, coverage and framing."
            ),
            "requiredFix": (
                "Populate Director semantic presentation metadata in Unity for recommendable visual identities and republish through the same atomic CURRENT pipeline."
            ),
        },
        "summary": {
            "actionablePreviewGeneration": len(visual_generation),
            "sourceEligibilityReviewBeforePreview": len(visual_review),
            "animationBlockingItems": sum(1 for item in animation_queue if item.get("blockingMissing")),
            "animationQualityItems": sum(1 for item in animation_queue if item.get("qualityMissing")),
            "audioQualityItems": len(audio_queue),
        },
        "visualPreviews": visual_queue,
        "animations": animation_queue,
        "audio": audio_queue,
    }

    reason_counts = Counter(reason for item in audit_items for reason in item.get("reasons", []))
    audit = {
        "schema": "STARWARS_DELTA_DIRECTOR_ELIGIBILITY_AUDIT",
        "schemaVersion": 2,
        "status": "SOURCE_REVIEW_REQUIRED" if audit_items else "NO_OBVIOUS_GITHUB_SIDE_SIGNALS",
        "publishTransactionId": identity["publishTransactionId"],
        "catalogRevision": identity["catalogRevision"],
        "sourceCatalogRecordCount": director.get("sourceCatalogRecordCount"),
        "flaggedDirectorVisualCount": len(audit_items),
        "flaggedCompletionVisualCount": len(visual_review),
        "flaggedByCategory": dict(Counter(item.get("category") for item in audit_items)),
        "flaggedByReason": dict(reason_counts),
        "policy": (
            "This is a conservative Git-side audit. Flagged entries remain visible as evidence but must not be recommended by default. "
            "Unity must correct or confirm source eligibility and classification, then atomically republish."
        ),
        "signals": {
            "sample_or_demo_path": "Source path looks like sample, example or demo content.",
            "editor_test_or_debug_path": "Source path looks like Editor, test, debug or gizmo tooling.",
            "generated_cutscene_output": "Source path looks like generated Cutscene output and must not recursively become authoring source.",
            "documentation_or_package_tooling_path": "Source path looks like documentation or package tooling rather than film content.",
            "catalog_semantics_exclude_direct_authoring": "Catalog roles/capabilities explicitly describe reference or technical-only content.",
            "generic_technical_or_primitive_identity": "Identity looks like a generic helper or primitive and requires source review.",
            "probable_effect_misclassified_as_actor": "Actor classification conflicts with effect-like naming.",
            "probable_ui_misclassified_as_actor": "Actor classification conflicts with UI-like naming.",
            "probable_layer_or_tileset_misclassified_as_actor": "Actor classification conflicts with background/tileset naming.",
            "probable_effect_misclassified_as_ui": "UI classification conflicts with effect-like naming.",
        },
        "items": audit_items,
    }

    unknown_actor_links = sum(len(animation.get("unknownCompatibleActorAssetIds", [])) for animation in animations)
    verified_visuals = [entry for entry in all_visual_entries if entry.get("visualEvidence", {}).get("status") == "PIXELS_VERIFIED"]
    atlas_mapped_visuals = [
        entry
        for entry in verified_visuals
        if entry.get("visualEvidence", {}).get("atlasPage") and entry.get("visualEvidence", {}).get("atlasSlot")
    ]
    recommendation_counts = dict(Counter(entry.get("recommendationStatus") for entry in all_visual_entries))

    director["schemaVersion"] = max(int(director.get("schemaVersion", 0)), 4)
    director["atomicIdentity"] = identity
    director["catalogGeneratedUtc"] = catalog_summary.get("generatedUtc")
    director["lastCompletedScanUtc"] = catalog_summary.get("lastCompletedScanUtc")
    director["diagnostics"] = {
        "annotated": diagnostics.get("annotated"),
        "reviewed": diagnostics.get("reviewed"),
        "needsReview": diagnostics.get("needsReview"),
        "stale": diagnostics.get("stale"),
        "cutsceneReady": diagnostics.get("cutsceneReady"),
    }
    director["quality"] = {
        "verifiedVisualEntryCount": len(verified_visuals),
        "atlasMappedVerifiedVisualEntryCount": len(atlas_mapped_visuals),
        "missingVisualEntryCount": len(visual_queue),
        "actionablePreviewGenerationCount": len(visual_generation),
        "sourceEligibilityReviewBeforePreviewCount": len(visual_review),
        "recommendationStatusCounts": recommendation_counts,
        "animationUnknownActorLinkCount": unknown_actor_links,
        "animationCompletionCount": len(animation_queue),
        "audioCompletionCount": len(audio_queue),
        "presentationCoverageByCategory": presentation,
    }
    director["eligibilityAuditUrl"] = f"{PAGES_BASE}/director-view/eligibility-audit.json"
    director.setdefault("policies", {})["eligibility"] = (
        "Use recommendationStatus=RECOMMENDABLE by default. Entries pending source review or pixel completion remain evidence, not normal recommendations."
    )
    director["policies"]["completionQueue"] = (
        "The completion queue is engineering work data. It is not a list of assets the designer must gather or upload."
    )

    open_manifest["schemaVersion"] = max(int(open_manifest.get("schemaVersion", 0)), 11)
    open_manifest["catalogRevision"] = identity["catalogRevision"]
    open_manifest["snapshotContentHash"] = identity["snapshotContentHash"]
    open_manifest["atomicIdentity"] = identity
    open_manifest.setdefault("directorView", {})["quality"] = director["quality"]
    open_manifest["eligibilityAudit"] = {
        "url": f"{PAGES_BASE}/director-view/eligibility-audit.json",
        "flaggedDirectorVisualCount": len(audit_items),
        "flaggedCompletionVisualCount": len(visual_review),
        "policy": "Do not recommend flagged entries by default. Correct or confirm them at Unity source and republish.",
    }
    usage = open_manifest.setdefault("usage", {})
    usage["recommendation"] = (
        "Use only Director entries with recommendationStatus=RECOMMENDABLE by default. "
        "PIXEL_COMPLETION_REQUIRED and DO_NOT_RECOMMEND_PENDING_SOURCE_REVIEW are engineering states, not ordinary creative choices."
    )
    usage["completionQueue"] = (
        "The Director completion queue is for the Unity engineering pipeline. Do not ask Debora/the designer to solve or upload its items."
    )

    pack_manifest["schemaVersion"] = max(int(pack_manifest.get("schemaVersion", 0)), 3)
    pack_manifest["atomicIdentity"] = identity
    pack_manifest["sourceCatalogRecordCount"] = director.get("sourceCatalogRecordCount")
    pack_manifest["eligibilityAudit"] = "director-view/eligibility-audit.json"
    pack_manifest["quality"] = director["quality"]

    read_first = f"""STARWARS_DELTA CHATGPT DIRECTOR CURRENT

Atomic publish transaction: {identity['publishTransactionId']}
Start with OPEN_CURRENT.json, then director-view/DIRECTOR_VIEW.json.
Use the Director category files for Actors, Layers, Effects, UI, Animations and Audio.
Use only recommendationStatus=RECOMMENDABLE by default.
Do not use entries pending source eligibility review or pixel completion as ordinary recommendations.
Inspect actual Visual Atlas pixels before visual claims.
One representative image per animation family is intentional.
Audio is first-class and does not require an image.
Prefab internals, gameplay scripts, colliders and physics are not authoring vocabulary.
The completion queue is engineering work data, not a designer upload list.
Do not mix this package with older Catalog, Instruction Book or visual packages.
"""

    for category, path in category_files.items():
        write_json(path, category_payloads[category])
    write_json(animations_path, animations_payload)
    write_json(audio_path, audio_payload)
    write_json(queue_path, queue)
    write_json(audit_path, audit)
    write_json(director_path, director)
    write_json(open_path, open_manifest)
    write_json(manifest_path, pack_manifest)
    read_first_path.write_text(read_first, encoding="utf-8")

    modified = [
        *category_files.values(),
        animations_path,
        audio_path,
        queue_path,
        audit_path,
        director_path,
        open_path,
        manifest_path,
        read_first_path,
    ]
    rebuild_pack(modified)

    if len(atlas_mapped_visuals) != len(verified_visuals):
        raise SystemExit(
            f"Verified Director visual Atlas mapping incomplete: {len(atlas_mapped_visuals)} of {len(verified_visuals)}"
        )
    if unknown_actor_links:
        raise SystemExit(f"Animation compatibility references {unknown_actor_links} unknown canonical Actor IDs")

    with zipfile.ZipFile(ROOT / PACK_NAME, "r") as archive:
        names = set(archive.namelist())
        for path in modified:
            relative = str(path.relative_to(ROOT)).replace(os.sep, "/")
            if relative not in names:
                raise SystemExit(f"Finalized Director pack is missing {relative}")

    print("DIRECTOR_ATOMIC_IDENTITY", json.dumps(identity, separators=(",", ":")))
    print("DIRECTOR_ELIGIBILITY_REVIEW", len(audit_items))
    print("DIRECTOR_VISUAL_PREVIEW_GENERATION", len(visual_generation))
    print("DIRECTOR_VISUAL_ELIGIBILITY_BEFORE_PREVIEW", len(visual_review))
    print("DIRECTOR_VERIFIED_ATLAS_MAPPED", len(atlas_mapped_visuals))
    print("DIRECTOR_ANIMATION_COMPLETION", len(animation_queue))
    print("DIRECTOR_AUDIO_COMPLETION", len(audio_queue))
    print("DIRECTOR_PACK_BYTES_FINAL", (ROOT / PACK_NAME).stat().st_size)


if __name__ == "__main__":
    main()
