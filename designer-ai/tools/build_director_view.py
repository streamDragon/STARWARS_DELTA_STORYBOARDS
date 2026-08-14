#!/usr/bin/env python3
import json
import os
import pathlib
import shutil
import tempfile
import urllib.request
import zipfile
from collections import Counter, defaultdict

REPO = os.environ["REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]
ROOT = pathlib.Path("_open_current_stage")
CURRENT_PATH = pathlib.Path("designer-ai/current.json")
PAGES_BASE = "https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current"


def get_json(url):
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {TOKEN}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "STARWARS-DELTA-director-view-builder",
    }
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.load(response)


def download(url, destination):
    request = urllib.request.Request(url, headers={"User-Agent": "STARWARS-DELTA-director-view-builder"})
    with urllib.request.urlopen(request, timeout=600) as response, open(destination, "wb") as output:
        shutil.copyfileobj(response, output)


def safe_extract(archive, destination):
    destination = destination.resolve()
    for member in archive.infolist():
        target = (destination / member.filename).resolve()
        if target != destination and not str(target).startswith(str(destination) + os.sep):
            raise SystemExit(f"Unsafe ZIP path: {member.filename}")
    archive.extractall(destination)


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path, payload, compact=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    if compact:
        text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    else:
        text = json.dumps(payload, indent=2, ensure_ascii=False)
    path.write_text(text + "\n", encoding="utf-8")


def primary_use(record):
    return str(record.get("cutscenePrimaryUse") or "")


def record_type(record):
    return str(record.get("type") or record.get("kind") or "")


def is_safe(record):
    return bool(record.get("cutsceneSafeForPreview")) and primary_use(record).lower() != "unsafe"


def union_values(records, key):
    values = []
    seen = set()
    for record in records:
        raw = record.get(key)
        if raw in (None, "", [], {}):
            continue
        items = raw if isinstance(raw, list) else [raw]
        for value in items:
            marker = json.dumps(value, sort_keys=True, ensure_ascii=False) if isinstance(value, (dict, list)) else str(value)
            if marker in seen:
                continue
            seen.add(marker)
            values.append(value)
    return values


def best_text(records, key):
    values = [str(record.get(key) or "").strip() for record in records]
    values = [value for value in values if value]
    return max(values, key=len) if values else ""


def actor_canonical_id(record, by_id):
    preferred = str(record.get("preferredActorAssetId") or "")
    preferred_record = by_id.get(preferred)
    if preferred_record and primary_use(preferred_record).lower() == "actor" and is_safe(preferred_record):
        return preferred
    return str(record.get("assetId") or "")


def choose_authoring_record(category, records, by_id):
    expected = category.lower()
    candidates = [record for record in records if primary_use(record).lower() == expected and is_safe(record)]
    if not candidates:
        return None

    if expected == "actor":
        preferred_records = [record for record in candidates if bool(record.get("isPreferredActorIdentity"))]
        if preferred_records:
            return sorted(preferred_records, key=lambda record: str(record.get("assetId")))[0]
        preferred_ids = []
        for record in candidates:
            preferred = str(record.get("preferredActorAssetId") or "")
            preferred_record = by_id.get(preferred)
            if preferred_record and primary_use(preferred_record).lower() == "actor" and is_safe(preferred_record):
                preferred_ids.append(preferred_record)
        if preferred_ids:
            return sorted(preferred_ids, key=lambda record: str(record.get("assetId")))[0]

    preference = {"Sprite": 0, "Prefab": 1, "Texture": 2}
    return sorted(
        candidates,
        key=lambda record: (
            preference.get(record_type(record), 9),
            0 if str(record.get("visionReviewState") or "").lower() == "reviewed" else 1,
            str(record.get("displayName") or "").lower(),
            str(record.get("assetId") or ""),
        ),
    )[0]


def visual_runtime_form(category, authoring_record):
    if not authoring_record:
        return "Unavailable"
    kind = record_type(authoring_record)
    if category == "Actor":
        return "CanonicalActor" if kind == "Prefab" else "SpriteActor"
    if kind == "Prefab":
        return "PreviewSafeVisualComposite"
    if kind == "Sprite":
        return "Sprite"
    return kind or "VisualAsset"


def visual_entry_from_source(source, pixel_status, by_id):
    catalog_ids = [str(value) for value in source.get("catalogAssetIds", []) if value]
    if not catalog_ids and source.get("assetId"):
        catalog_ids = [str(source.get("assetId"))]
    records = [by_id[asset_id] for asset_id in catalog_ids if asset_id in by_id]
    category = str(source.get("category") or "Other")
    authoring_record = choose_authoring_record(category, records, by_id)

    entity_records = [record for record in records if str(record.get("entityKind") or "").lower() not in ("", "unknown")]
    entity_records.sort(key=lambda record: float(record.get("entityKindConfidence") or 0), reverse=True)
    entity_kind = str(entity_records[0].get("entityKind")) if entity_records else str(source.get("entityClassification") or "Unknown")

    visual_reference_id = str(source.get("visualReferenceId") or "")
    animation_family = str(source.get("animationFamily") or "")
    if not animation_family:
        purposes = [str(value) for value in source.get("representativePurposes", [])]
        animation_purposes = [value.split("/", 1)[1] for value in purposes if value.startswith("Animation/") and "/" in value]
        if animation_purposes:
            animation_family = str(source.get("displayName") or "")

    warnings = union_values(records, "cutsceneWarnings")
    pixel_evidence = {
        "status": pixel_status,
        "visualReferenceId": visual_reference_id or None,
        "pageImageUrl": source.get("pageImageUrl"),
        "sheetUrl": source.get("sheetUrl"),
        "page": source.get("page"),
        "slot": source.get("slot"),
    }

    authoring_asset_id = str(authoring_record.get("assetId")) if authoring_record else ""
    canonical_actor_id = ""
    if category == "Actor" and authoring_record:
        canonical_actor_id = actor_canonical_id(authoring_record, by_id)
        authoring_asset_id = canonical_actor_id or authoring_asset_id

    return {
        "visualReferenceId": visual_reference_id or None,
        "displayName": source.get("displayName") or (authoring_record.get("displayName") if authoring_record else ""),
        "category": category,
        "authoringAssetId": authoring_asset_id or None,
        "canonicalActorAssetId": canonical_actor_id or None,
        "authoringRuntimeForm": visual_runtime_form(category, authoring_record),
        "recommendable": bool(authoring_record),
        "catalogAssetIds": catalog_ids,
        "visualEvidence": pixel_evidence,
        "animationFamily": animation_family or None,
        "description": best_text(records, "description") or str(source.get("visualDescription") or ""),
        "roles": union_values(records, "roles"),
        "tags": union_values(records, "tags"),
        "capabilities": union_values(records, "capabilities"),
        "families": union_values(records, "family"),
        "familyIds": union_values(records, "familyId"),
        "collections": union_values(records, "collections"),
        "semanticFacets": union_values(records, "cutsceneSemanticFacets"),
        "semanticStates": source.get("semanticStates", []),
        "entityKind": entity_kind,
        "compatibleAnimationIds": sorted(set(str(value) for value in union_values(records, "compatibleAnimationIds") + list(source.get("compatibleAnimationIds", [])) if value)),
        "compatibleDialogueVisualIds": sorted(set(str(value) for value in union_values(records, "compatibleDialogueVisualIds") if value)),
        "proportionClass": authoring_record.get("cutsceneProportionClass") if authoring_record else None,
        "targetScreenFraction": authoring_record.get("cutsceneTargetScreenFraction") if authoring_record else None,
        "scaleBasis": authoring_record.get("cutsceneScaleBasis") if authoring_record else None,
        "systemManagedProportions": bool(authoring_record.get("cutsceneSystemManagedProportions")) if authoring_record else False,
        "safeForPreview": bool(authoring_record and authoring_record.get("cutsceneSafeForPreview")),
        "safeForPublish": bool(authoring_record and authoring_record.get("cutsceneSafeForPublish")),
        "visionReviewStates": sorted(set(str(record.get("visionReviewState") or "Unreviewed") for record in records)),
        "needsHumanReview": any(bool(record.get("cutsceneNeedsHumanReview")) for record in records),
        "warnings": warnings,
        "sourceKinds": sorted(set(record_type(record) for record in records if record_type(record))),
        "sourcePaths": sorted(set(str(record.get("path")) for record in records if record.get("path"))),
    }


def merge_actor_group(entries):
    entries = sorted(
        entries,
        key=lambda entry: (
            0 if entry["visualEvidence"]["status"] == "PIXELS_VERIFIED" else 1,
            0 if not entry.get("animationFamily") else 1,
            str(entry.get("displayName") or "").lower(),
        ),
    )
    primary = dict(entries[0])
    primary["visualVariants"] = [
        {
            "visualReferenceId": entry.get("visualReferenceId"),
            "displayName": entry.get("displayName"),
            "animationFamily": entry.get("animationFamily"),
            "visualEvidence": entry.get("visualEvidence"),
        }
        for entry in entries
    ]
    for key in ("roles", "tags", "capabilities", "families", "familyIds", "collections", "semanticFacets", "compatibleAnimationIds", "compatibleDialogueVisualIds", "warnings", "sourceKinds", "sourcePaths"):
        merged = []
        seen = set()
        for entry in entries:
            for value in entry.get(key, []):
                marker = json.dumps(value, sort_keys=True, ensure_ascii=False) if isinstance(value, (dict, list)) else str(value)
                if marker not in seen:
                    seen.add(marker)
                    merged.append(value)
        primary[key] = merged
    primary["needsHumanReview"] = any(entry.get("needsHumanReview") for entry in entries)
    primary["safeForPreview"] = any(entry.get("safeForPreview") for entry in entries)
    primary["safeForPublish"] = any(entry.get("safeForPublish") for entry in entries)
    return primary


def classify_audio(record):
    capabilities = set(str(value) for value in record.get("capabilities", []))
    tags = set(str(value).lower() for value in record.get("tags", []))
    if "Cutscene.Music" in capabilities or "music" in tags:
        return "Music"
    if "Cutscene.Ambience" in capabilities or "ambience" in tags or "ambient" in tags:
        return "Ambience"
    if "Cutscene.AlertAudio" in capabilities or "alert" in tags or "alarm" in tags:
        return "Alert"
    if "Cutscene.UiAudio" in capabilities or "ui" in tags:
        return "Ui"
    return "Sfx"


def main():
    current = read_json(CURRENT_PATH)
    transaction_id = current["publishTransactionId"]
    tag = current["releaseUrl"].rsplit("/releases/tag/", 1)[1]
    release = get_json(f"https://api.github.com/repos/{REPO}/releases/tags/{tag}")
    release_assets = {asset["name"]: asset for asset in release.get("assets", [])}
    catalog_name = "STARWARS_DELTA_CHATGPT_CATALOG_CURRENT.zip"
    instruction_name = "STARWARS_DELTA_CUTSCENE_INSTRUCTION_BOOK_CURRENT.zip"
    for required in (catalog_name, instruction_name):
        if required not in release_assets:
            raise SystemExit(f"Required release asset is missing: {required}")

    full_visual_index = read_json(ROOT / "FULL_VISUAL_INDEX.json")
    unavailable = read_json(ROOT / "VISUAL_UNAVAILABLE.json")

    with tempfile.TemporaryDirectory() as temp_raw:
        temp = pathlib.Path(temp_raw)
        catalog_zip = temp / catalog_name
        instruction_zip = temp / instruction_name
        download(release_assets[catalog_name]["browser_download_url"], catalog_zip)
        download(release_assets[instruction_name]["browser_download_url"], instruction_zip)

        with zipfile.ZipFile(catalog_zip) as archive:
            catalog_summary = json.loads(archive.read("catalog_summary.json").decode("utf-8-sig"))
            diagnostics = json.loads(archive.read("diagnostics_summary.json").decode("utf-8-sig"))
            records = []
            with archive.open("catalog_records.jsonl") as stream:
                for raw in stream:
                    raw = raw.strip()
                    if raw:
                        records.append(json.loads(raw.decode("utf-8-sig")))

            catalog_contract_root = ROOT / "catalog-contract"
            if catalog_contract_root.exists():
                shutil.rmtree(catalog_contract_root)
            catalog_contract_root.mkdir(parents=True)
            allowed_prefixes = ("EXAMPLES/",)
            allowed_names = {
                "00_CHATGPT_READ_FIRST.txt",
                "CUTSCENE_AUTHORING_CONTRACT.json",
                "CUTSCENE_PACKAGE_SCHEMA_V5.json",
                "CUTSCENE_ENUMS_V5.json",
                "CUTSCENE_TIME_RULES_V5.json",
                "CUTSCENE_ASSET_RULES_V5.json",
                "CUTSCENE_ACTION_RULES_V5.json",
                "CUTSCENE_VALIDATION_RULES_V5.json",
                "CUTSCENE_KIT_CONTRACTS_V5.json",
                "catalog_summary.json",
                "diagnostics_summary.json",
                "collections.json",
                "capabilities.json",
                "families.json",
            }
            for member in archive.infolist():
                if member.filename in allowed_names or member.filename.startswith(allowed_prefixes):
                    target = catalog_contract_root / member.filename
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(archive.read(member.filename))

        instruction_root = ROOT / "instruction-book"
        if instruction_root.exists():
            shutil.rmtree(instruction_root)
        instruction_root.mkdir(parents=True)
        with zipfile.ZipFile(instruction_zip) as archive:
            safe_extract(archive, instruction_root)

    by_id = {str(record.get("assetId")): record for record in records if record.get("assetId")}

    source_visuals = []
    for source in full_visual_index.get("assets", []):
        source_visuals.append(visual_entry_from_source(source, "PIXELS_VERIFIED", by_id))
    pixel_visual_refs = set(entry.get("visualReferenceId") for entry in source_visuals if entry.get("visualReferenceId"))
    for source in unavailable.get("assets", []):
        if source.get("visualReferenceId") in pixel_visual_refs:
            continue
        source_visuals.append(visual_entry_from_source(source, "PIXELS_UNAVAILABLE", by_id))

    actor_groups = defaultdict(list)
    layers = []
    effects = []
    ui_assets = []
    completion_visuals = []
    for entry in source_visuals:
        category = entry.get("category")
        if entry.get("recommendable") and entry["visualEvidence"]["status"] != "PIXELS_VERIFIED":
            completion_visuals.append(
                {
                    "kind": "VisualPreview",
                    "priority": "High" if category in ("Actor", "Layer") else "Normal",
                    "visualReferenceId": entry.get("visualReferenceId"),
                    "authoringAssetId": entry.get("authoringAssetId"),
                    "displayName": entry.get("displayName"),
                    "category": category,
                    "sourceKinds": entry.get("sourceKinds"),
                    "sourcePaths": entry.get("sourcePaths"),
                    "requiredFix": "Unity Visual Library publisher must export one deterministic preview for this safe Director visual identity.",
                }
            )

        if category == "Actor":
            key = entry.get("canonicalActorAssetId") or entry.get("authoringAssetId") or entry.get("visualReferenceId")
            if key:
                actor_groups[str(key)].append(entry)
        elif category == "Layer":
            layers.append(entry)
        elif category == "Effect":
            effects.append(entry)
        elif category == "Ui":
            ui_assets.append(entry)

    actors = [merge_actor_group(entries) for entries in actor_groups.values()]
    actors.sort(key=lambda entry: str(entry.get("displayName") or "").lower())
    layers.sort(key=lambda entry: str(entry.get("displayName") or "").lower())
    effects.sort(key=lambda entry: str(entry.get("displayName") or "").lower())
    ui_assets.sort(key=lambda entry: str(entry.get("displayName") or "").lower())

    reverse_animation_actors = defaultdict(set)
    for record in records:
        if primary_use(record).lower() != "actor" or not is_safe(record):
            continue
        actor_id = actor_canonical_id(record, by_id)
        for animation_id in record.get("compatibleAnimationIds", []) or []:
            if actor_id:
                reverse_animation_actors[str(animation_id)].add(actor_id)

    visual_by_animation = defaultdict(list)
    for entry in source_visuals:
        for animation_id in entry.get("compatibleAnimationIds", []):
            visual_by_animation[str(animation_id)].append(entry)

    animations = []
    completion_animations = []
    for record in records:
        if primary_use(record).lower() != "animation":
            continue
        animation_id = str(record.get("assetId") or "")
        visual_candidates = sorted(
            visual_by_animation.get(animation_id, []),
            key=lambda entry: (
                0 if entry.get("animationFamily") else 1,
                0 if entry.get("visualEvidence", {}).get("status") == "PIXELS_VERIFIED" else 1,
                str(entry.get("displayName") or "").lower(),
            ),
        )
        representative = None
        if visual_candidates:
            candidate = visual_candidates[0]
            representative = {
                "visualReferenceId": candidate.get("visualReferenceId"),
                "displayName": candidate.get("displayName"),
                "animationFamily": candidate.get("animationFamily"),
                "visualEvidence": candidate.get("visualEvidence"),
            }
        compatible_actors = sorted(reverse_animation_actors.get(animation_id, set()))
        description = str(record.get("description") or "")
        family = str(record.get("family") or "")
        needs = []
        if not description:
            needs.append("description")
        if not family:
            needs.append("family")
        if not compatible_actors:
            needs.append("compatibleActorIds")
        if not representative or representative.get("visualEvidence", {}).get("status") != "PIXELS_VERIFIED":
            needs.append("representativePixels")
        animation = {
            "assetId": animation_id,
            "displayName": record.get("displayName"),
            "description": description,
            "path": record.get("path"),
            "tags": record.get("tags", []),
            "capabilities": record.get("capabilities", []),
            "family": family or None,
            "familyId": record.get("familyId") or None,
            "collections": record.get("collections", []),
            "loopSuggested": "loop" in [str(value).lower() for value in record.get("tags", [])],
            "compatibleActorAssetIds": compatible_actors,
            "representativeVisual": representative,
            "safeForPreview": bool(record.get("cutsceneSafeForPreview")),
            "safeForPublish": bool(record.get("cutsceneSafeForPublish")),
            "visionReviewState": record.get("visionReviewState"),
            "warnings": record.get("cutsceneWarnings", []),
            "metadataCompletionNeeded": needs,
        }
        animations.append(animation)
        if needs:
            completion_animations.append(
                {
                    "kind": "AnimationMetadata",
                    "priority": "High" if "compatibleActorIds" in needs or "representativePixels" in needs else "Normal",
                    "assetId": animation_id,
                    "displayName": record.get("displayName"),
                    "missing": needs,
                    "requiredFix": "Unity Catalog/Director publisher must export exact actor compatibility, semantic motion metadata, and one representative frame-family visual.",
                }
            )
    animations.sort(key=lambda entry: str(entry.get("displayName") or "").lower())

    audio_assets = []
    completion_audio = []
    for record in records:
        if primary_use(record).lower() != "audio":
            continue
        audio_id = str(record.get("assetId") or "")
        missing = []
        if not record.get("description"):
            missing.append("description")
        missing.extend(["durationSeconds", "loopMetadata", "mood", "intensity"])
        audio = {
            "assetId": audio_id,
            "displayName": record.get("displayName"),
            "path": record.get("path"),
            "purpose": classify_audio(record),
            "description": record.get("description") or "",
            "tags": record.get("tags", []),
            "capabilities": record.get("capabilities", []),
            "durationSeconds": None,
            "loopMetadata": None,
            "mood": None,
            "intensity": None,
            "safeForPreview": bool(record.get("cutsceneSafeForPreview")),
            "safeForPublish": bool(record.get("cutsceneSafeForPublish")),
            "warnings": record.get("cutsceneWarnings", []),
            "metadataCompletionNeeded": missing,
        }
        audio_assets.append(audio)
        completion_audio.append(
            {
                "kind": "AudioMetadata",
                "priority": "Normal",
                "assetId": audio_id,
                "displayName": record.get("displayName"),
                "missing": missing,
                "requiredFix": "Unity Audio Director exporter must provide duration, loop behavior, purpose, mood and intensity without requiring visual evidence.",
            }
        )
    audio_assets.sort(key=lambda entry: str(entry.get("displayName") or "").lower())

    director_root = ROOT / "director-view"
    if director_root.exists():
        shutil.rmtree(director_root)
    director_root.mkdir(parents=True)

    category_payloads = {
        "actors.json": ("Actor", actors),
        "layers.json": ("Layer", layers),
        "effects.json": ("Effect", effects),
        "ui.json": ("Ui", ui_assets),
        "animations.json": ("Animation", animations),
        "audio.json": ("Audio", audio_assets),
    }
    category_files = []
    for filename, (category, assets_list) in category_payloads.items():
        payload = {
            "schema": "STARWARS_DELTA_DIRECTOR_CATEGORY",
            "schemaVersion": 1,
            "status": "CURRENT_FULL_CATALOG_PROJECTION",
            "publishTransactionId": transaction_id,
            "catalogRevision": catalog_summary.get("catalogRevision"),
            "snapshotContentHash": catalog_summary.get("snapshotContentHash"),
            "category": category,
            "count": len(assets_list),
            "assets": assets_list,
        }
        write_json(director_root / filename, payload)
        category_files.append(
            {
                "category": category,
                "count": len(assets_list),
                "file": f"director-view/{filename}",
                "url": f"{PAGES_BASE}/director-view/{filename}",
            }
        )

    completion_queue = {
        "schema": "STARWARS_DELTA_DIRECTOR_COMPLETION_QUEUE",
        "schemaVersion": 1,
        "status": "CURRENT_GAPS_EXPLICIT",
        "publishTransactionId": transaction_id,
        "visualPreviewCount": len(completion_visuals),
        "animationMetadataCount": len(completion_animations),
        "audioMetadataCount": len(completion_audio),
        "presentationMetadata": {
            "currentState": "Catalog presentationDescription/locationType/sceneState/lightingMood remain largely unpopulated in the current snapshot.",
            "requiredFix": "Populate Director semantic presentation metadata in Unity and republish the same atomic Current pipeline.",
        },
        "visualPreviews": completion_visuals,
        "animations": completion_animations,
        "audio": completion_audio,
    }
    write_json(director_root / "completion-queue.json", completion_queue)

    asset_lookup = {}
    for category, assets_list in (("Actor", actors), ("Layer", layers), ("Effect", effects), ("Ui", ui_assets)):
        for index, entry in enumerate(assets_list):
            for asset_id in entry.get("catalogAssetIds", []):
                asset_lookup[str(asset_id)] = {"category": category, "index": index}
            if entry.get("authoringAssetId"):
                asset_lookup[str(entry["authoringAssetId"])] = {"category": category, "index": index}
    for index, entry in enumerate(animations):
        asset_lookup[str(entry["assetId"])] = {"category": "Animation", "index": index}
    for index, entry in enumerate(audio_assets):
        asset_lookup[str(entry["assetId"])] = {"category": "Audio", "index": index}
    write_json(
        director_root / "asset-lookup.json",
        {
            "schema": "STARWARS_DELTA_DIRECTOR_ASSET_LOOKUP",
            "schemaVersion": 1,
            "status": "CURRENT_FULL_CATALOG_PROJECTION",
            "publishTransactionId": transaction_id,
            "assetIdToDirectorEntry": asset_lookup,
        },
        compact=True,
    )

    recommendable_visuals = [entry for entry in source_visuals if entry.get("recommendable")]
    verified_visuals = [entry for entry in recommendable_visuals if entry.get("visualEvidence", {}).get("status") == "PIXELS_VERIFIED"]
    summary = {
        "schema": "STARWARS_DELTA_DIRECTOR_VIEW",
        "schemaVersion": 1,
        "status": "CURRENT_FULL_CATALOG_PROJECTION",
        "sourceOfTruth": "Projection only. The atomic full Catalog remains authoritative for exact asset IDs, compatibility and validation.",
        "publishTransactionId": transaction_id,
        "publishedUtc": current.get("publishedUtc"),
        "catalogRevision": catalog_summary.get("catalogRevision"),
        "snapshotContentHash": catalog_summary.get("snapshotContentHash"),
        "contractRevision": current.get("contractRevision"),
        "schemaHash": current.get("schemaHash"),
        "lastCompletedScanUtc": catalog_summary.get("lastCompletedScanUtc"),
        "catalogGeneratedUtc": catalog_summary.get("generatedUtc"),
        "sourceCatalogRecordCount": len(records),
        "diagnostics": {
            "annotated": diagnostics.get("annotated"),
            "reviewed": diagnostics.get("reviewed"),
            "needsReview": diagnostics.get("needsReview"),
            "stale": diagnostics.get("stale"),
            "cutsceneReady": diagnostics.get("cutsceneReady"),
        },
        "counts": {
            "actors": len(actors),
            "layers": len(layers),
            "effects": len(effects),
            "ui": len(ui_assets),
            "animations": len(animations),
            "audio": len(audio_assets),
            "recommendableVisualIdentities": len(recommendable_visuals),
            "pixelVerifiedVisualIdentities": len(verified_visuals),
            "pixelMissingRecommendableVisualIdentities": len(recommendable_visuals) - len(verified_visuals),
        },
        "policies": {
            "visuals": "Use one Director visual identity, enriched from all mapped Catalog records. Inspect pixel evidence before visual claims.",
            "animations": "Use every exact AnimationClip asset ID, but only one representative image per animation family. Never require every frame.",
            "audio": "Audio is a first-class Director input and does not require visual evidence.",
            "prefabs": "Prefab internals are not authoring vocabulary. Preview-safe Prefabs may appear only as CanonicalActor or PreviewSafeVisualComposite; gameplay, scripts and physics are not exposed to the director.",
            "unsafe": "Unsafe Catalog records are excluded from Director recommendations.",
        },
        "categoryFiles": category_files,
        "assetLookupUrl": f"{PAGES_BASE}/director-view/asset-lookup.json",
        "completionQueueUrl": f"{PAGES_BASE}/director-view/completion-queue.json",
        "visualIndexUrl": f"{PAGES_BASE}/FULL_VISUAL_INDEX.json",
        "instructionBookRootUrl": f"{PAGES_BASE}/instruction-book/",
        "catalogContractRootUrl": f"{PAGES_BASE}/catalog-contract/",
    }
    write_json(director_root / "DIRECTOR_VIEW.json", summary)

    # Remove the old request-scoped package from the public open-current payload.
    for obsolete in (ROOT / "authoring", ROOT / "visual-proof", ROOT / "CHATGPT_VISUAL_INDEX.json"):
        if obsolete.is_dir():
            shutil.rmtree(obsolete)
        elif obsolete.exists():
            obsolete.unlink()

    open_path = ROOT / "OPEN_CURRENT.json"
    open_manifest = read_json(open_path)
    open_manifest["schemaVersion"] = max(int(open_manifest.get("schemaVersion", 0)), 6)
    open_manifest["status"] = "CURRENT_VERIFIED_OPEN"
    open_manifest.pop("chatgptVisualIndexPath", None)
    open_manifest.pop("groups", None)
    open_manifest["directorView"] = {
        "status": "CURRENT_FULL_CATALOG_PROJECTION",
        "url": f"{PAGES_BASE}/director-view/DIRECTOR_VIEW.json",
        "root": f"{PAGES_BASE}/director-view/",
        "counts": summary["counts"],
        "sourceCatalogRecordCount": len(records),
        "requestScoped": False,
    }
    open_manifest["instructionBook"] = {
        "rootUrl": f"{PAGES_BASE}/instruction-book/",
        "sourceReleaseAsset": instruction_name,
    }
    open_manifest["catalogContract"] = {
        "rootUrl": f"{PAGES_BASE}/catalog-contract/",
        "sourceReleaseAsset": catalog_name,
        "fullCatalogReleaseUrl": release_assets[catalog_name]["browser_download_url"],
    }
    open_manifest["deprecations"] = [
        "The old 717-record CURRENT_VISUAL_PROOF_CANDIDATES subset is request-scoped evidence, not the general authoring Catalog, and is no longer published as the primary direct source.",
        "The 300MB Visual Library is an archive/evidence source, not the normal Debora or ChatGPT download.",
    ]
    open_manifest.setdefault("usage", {})["director"] = (
        "Start with director-view/DIRECTOR_VIEW.json. Use category files for search, then inspect the exact visual page pixels and validate exact IDs against the current contract."
    )
    open_manifest["usage"]["audio"] = "Use director-view/audio.json. Audio is non-visual and must not be treated as a visual coverage gap."
    open_manifest["usage"]["animations"] = "Use director-view/animations.json. One representative image per animation family is intentional."
    write_json(open_path, open_manifest)

    print("DIRECTOR_ACTORS", len(actors))
    print("DIRECTOR_LAYERS", len(layers))
    print("DIRECTOR_EFFECTS", len(effects))
    print("DIRECTOR_UI", len(ui_assets))
    print("DIRECTOR_ANIMATIONS", len(animations))
    print("DIRECTOR_AUDIO", len(audio_assets))
    print("DIRECTOR_VISUAL_GAPS", len(completion_visuals))


if __name__ == "__main__":
    main()
