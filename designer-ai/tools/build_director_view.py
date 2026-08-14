#!/usr/bin/env python3
import json
import os
import pathlib
import shutil
import tempfile
import urllib.request
import zipfile
from collections import defaultdict

REPO = os.environ["REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]
ROOT = pathlib.Path("_open_current_stage")
CURRENT_PATH = pathlib.Path("designer-ai/current.json")
PAGES_BASE = "https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current"
DOWNLOAD_NAME = "STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip"
LEGACY_DOWNLOAD_NAME = "STARWARS_DELTA_CHATGPT_VISUAL_CURRENT.zip"


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
    text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False) if compact else json.dumps(payload, indent=2, ensure_ascii=False)
    path.write_text(text + "\n", encoding="utf-8")


def primary_use(record):
    return str(record.get("cutscenePrimaryUse") or "")


def record_type(record):
    return str(record.get("type") or record.get("kind") or "")


def is_safe(record):
    return bool(record.get("cutsceneSafeForPreview")) and primary_use(record).lower() != "unsafe"


def is_direct_visual_record(record):
    return (
        is_safe(record)
        and primary_use(record).lower() in {"actor", "layer", "effect", "ui"}
        and record_type(record).lower() in {"sprite", "prefab", "gameobject"}
    )


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

    preference = {"Sprite": 0, "Prefab": 1, "GameObject": 1, "Texture": 2}
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
        return "CanonicalActor" if kind in ("Prefab", "GameObject") else "SpriteActor"
    if kind in ("Prefab", "GameObject"):
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
        if any(value.startswith("Animation/") for value in purposes):
            animation_family = str(source.get("displayName") or "")

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
        "visualEvidence": {
            "status": pixel_status,
            "visualReferenceId": visual_reference_id or None,
            "pageImageUrl": source.get("pageImageUrl"),
            "sheetUrl": source.get("sheetUrl"),
            "page": source.get("page"),
            "slot": source.get("slot"),
        },
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
        "compatibleAnimationIds": sorted(
            set(
                str(value)
                for value in union_values(records, "compatibleAnimationIds") + list(source.get("compatibleAnimationIds", []))
                if value
            )
        ),
        "compatibleDialogueVisualIds": sorted(set(str(value) for value in union_values(records, "compatibleDialogueVisualIds") if value)),
        "proportionClass": authoring_record.get("cutsceneProportionClass") if authoring_record else None,
        "targetScreenFraction": authoring_record.get("cutsceneTargetScreenFraction") if authoring_record else None,
        "scaleBasis": authoring_record.get("cutsceneScaleBasis") if authoring_record else None,
        "systemManagedProportions": bool(authoring_record.get("cutsceneSystemManagedProportions")) if authoring_record else False,
        "safeForPreview": bool(authoring_record and authoring_record.get("cutsceneSafeForPreview")),
        "safeForPublish": bool(authoring_record and authoring_record.get("cutsceneSafeForPublish")),
        "visionReviewStates": sorted(set(str(record.get("visionReviewState") or "Unreviewed") for record in records)),
        "needsHumanReview": any(bool(record.get("cutsceneNeedsHumanReview")) for record in records),
        "warnings": union_values(records, "cutsceneWarnings"),
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
    for key in (
        "catalogAssetIds",
        "roles",
        "tags",
        "capabilities",
        "families",
        "familyIds",
        "collections",
        "semanticFacets",
        "compatibleAnimationIds",
        "compatibleDialogueVisualIds",
        "warnings",
        "sourceKinds",
        "sourcePaths",
    ):
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


def completion_visual(entry):
    return {
        "kind": "VisualPreview",
        "priority": "High" if entry.get("category") in ("Actor", "Layer") else "Normal",
        "visualReferenceId": entry.get("visualReferenceId"),
        "authoringAssetId": entry.get("authoringAssetId"),
        "displayName": entry.get("displayName"),
        "category": entry.get("category"),
        "sourceKinds": entry.get("sourceKinds"),
        "sourcePaths": entry.get("sourcePaths"),
        "requiredFix": "Unity Visual Library publisher must export one deterministic preview for this safe Director visual identity.",
    }


def add_tree_to_zip(bundle, directory, root):
    if not directory.exists():
        return
    for path in sorted(directory.rglob("*")):
        if path.is_file():
            bundle.write(path, str(path.relative_to(root)).replace(os.sep, "/"))


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
                "CHATGPT_HANDOFF.md",
                "CUTSCENE_AI_AUTHORING_GUIDE.md",
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
                "01_DEBORA_CUTSCENE_STARTER_INDEX.md",
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

    source_visuals = [
        visual_entry_from_source(source, "PIXELS_VERIFIED", by_id)
        for source in full_visual_index.get("assets", [])
    ]
    pixel_visual_refs = {entry.get("visualReferenceId") for entry in source_visuals if entry.get("visualReferenceId")}
    for source in unavailable.get("assets", []):
        if source.get("visualReferenceId") in pixel_visual_refs:
            continue
        source_visuals.append(visual_entry_from_source(source, "PIXELS_UNAVAILABLE", by_id))

    mapped_catalog_ids = {
        str(asset_id)
        for entry in source_visuals
        for asset_id in entry.get("catalogAssetIds", [])
        if asset_id
    }
    synthetic_catalog_visual_count = 0
    for record in records:
        asset_id = str(record.get("assetId") or "")
        if not asset_id or asset_id in mapped_catalog_ids or not is_direct_visual_record(record):
            continue
        source_visuals.append(
            visual_entry_from_source(
                {
                    "assetId": asset_id,
                    "catalogAssetIds": [asset_id],
                    "displayName": record.get("displayName"),
                    "category": primary_use(record),
                    "entityClassification": record.get("entityKind"),
                    "representativePurposes": [primary_use(record)],
                    "compatibleAnimationIds": record.get("compatibleAnimationIds", []),
                    "visualDescription": record.get("description"),
                },
                "PIXELS_UNAVAILABLE",
                by_id,
            )
        )
        mapped_catalog_ids.add(asset_id)
        synthetic_catalog_visual_count += 1

    actor_groups = defaultdict(list)
    layers = []
    effects = []
    ui_assets = []
    for entry in source_visuals:
        if not entry.get("recommendable"):
            continue
        category = entry.get("category")
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

    completion_visuals = []
    for actor in actors:
        if not any(
            variant.get("visualEvidence", {}).get("status") == "PIXELS_VERIFIED"
            for variant in actor.get("visualVariants", [])
        ):
            completion_visuals.append(completion_visual(actor))
    for entry in layers + effects + ui_assets:
        if entry.get("visualEvidence", {}).get("status") != "PIXELS_VERIFIED":
            completion_visuals.append(completion_visual(entry))

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
        if not entry.get("recommendable"):
            continue
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
        audio_assets.append(
            {
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
        )
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
        write_json(
            director_root / filename,
            {
                "schema": "STARWARS_DELTA_DIRECTOR_CATEGORY",
                "schemaVersion": 2,
                "status": "CURRENT_FULL_CATALOG_PROJECTION",
                "publishTransactionId": transaction_id,
                "catalogRevision": catalog_summary.get("catalogRevision"),
                "snapshotContentHash": catalog_summary.get("snapshotContentHash"),
                "category": category,
                "count": len(assets_list),
                "assets": assets_list,
            },
        )
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
        "schemaVersion": 2,
        "status": "CURRENT_GAPS_EXPLICIT",
        "publishTransactionId": transaction_id,
        "visualPreviewCount": len(completion_visuals),
        "animationMetadataCount": len(completion_animations),
        "audioMetadataCount": len(completion_audio),
        "presentationMetadata": {
            "currentState": "The current Catalog has strong general semantics but presentationDescription/locationType/sceneState/lightingMood are still largely unpopulated.",
            "requiredFix": "Populate Director semantic presentation metadata in Unity and republish through the same atomic CURRENT pipeline.",
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
            "schemaVersion": 2,
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
        "schemaVersion": 2,
        "status": "CURRENT_FULL_CATALOG_PROJECTION",
        "sourceOfTruth": "Projection only. The atomic full Catalog remains authoritative for exact IDs, compatibility and validation.",
        "publishTransactionId": transaction_id,
        "publishedUtc": current.get("publishedUtc"),
        "catalogRevision": catalog_summary.get("catalogRevision"),
        "snapshotContentHash": catalog_summary.get("snapshotContentHash"),
        "contractRevision": current.get("contractRevision"),
        "schemaHash": current.get("schemaHash"),
        "lastCompletedScanUtc": catalog_summary.get("lastCompletedScanUtc"),
        "catalogGeneratedUtc": catalog_summary.get("generatedUtc"),
        "sourceCatalogRecordCount": len(records),
        "requestScoped": False,
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
            "recommendableVisualEntriesBeforeActorCanonicalMerge": len(recommendable_visuals),
            "pixelVerifiedVisualEntries": len(verified_visuals),
            "pixelMissingRecommendableVisualEntries": len(recommendable_visuals) - len(verified_visuals),
            "syntheticCatalogVisualEntriesNotPresentInVisualLibrary": synthetic_catalog_visual_count,
        },
        "policies": {
            "visuals": "Use one Director visual identity enriched from all mapped Catalog records. Inspect pixel evidence before visual claims.",
            "animations": "Use every exact AnimationClip ID, but only one representative image per animation family. Never require every frame.",
            "audio": "Audio is a first-class Director input and does not require visual evidence.",
            "prefabs": "Prefab internals are not authoring vocabulary. Safe Prefabs appear only as CanonicalActor or PreviewSafeVisualComposite; gameplay scripts, colliders and physics are not exposed to the director.",
            "technicalAssets": "Materials, technical textures, fonts, gameplay helpers and unsafe records are dependencies or excluded evidence, not normal Director choices.",
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

    open_path = ROOT / "OPEN_CURRENT.json"
    open_manifest = read_json(open_path)
    open_manifest["schemaVersion"] = max(int(open_manifest.get("schemaVersion", 0)), 7)
    open_manifest["status"] = "CURRENT_VERIFIED_OPEN"
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
    open_manifest["download"] = {
        "chatgptDirectorCurrentZipUrl": f"{PAGES_BASE}/{DOWNLOAD_NAME}",
        "purpose": "Stable compact fallback containing the full Director projection, exact authoring contract, Instruction Book, visual indexes and representative sheets. It does not contain every animation frame or the 300MB Visual Library archive.",
    }
    open_manifest["deprecations"] = [
        "The old 717-record CURRENT_VISUAL_PROOF_CANDIDATES subset was request-scoped evidence, not a general authoring Catalog, and is no longer the primary direct source.",
        "The 300MB Visual Library remains an evidence archive. It is not the normal Debora or ChatGPT download.",
    ]
    open_manifest.setdefault("usage", {})["director"] = (
        "Start with director-view/DIRECTOR_VIEW.json. Search the relevant category file, inspect exact pageImageUrl pixels, then validate exact IDs against catalog-contract."
    )
    open_manifest["usage"]["audio"] = "Use director-view/audio.json. Audio is non-visual and must never be counted as a visual gap."
    open_manifest["usage"]["animations"] = "Use director-view/animations.json. One representative image per animation family is intentional."
    open_manifest["usage"]["fallback"] = f"Use {DOWNLOAD_NAME} only when direct Pages access genuinely fails."
    write_json(open_path, open_manifest)

    read_first = f"""STARWARS_DELTA CHATGPT DIRECTOR CURRENT

This is an atomic fallback for publish transaction {transaction_id}.
Start with OPEN_CURRENT.json, then director-view/DIRECTOR_VIEW.json.
Use the Director category files for Actors, Layers, Effects, UI, Animations and Audio.
Inspect actual visual sheet pixels before visual claims.
One representative image per animation family is intentional.
Audio is first-class and does not require an image.
Do not expose prefab internals, gameplay scripts, colliders or physics as authoring vocabulary.
Do not mix this package with older Catalog, Instruction Book or visual packages.
"""
    (ROOT / "CHATGPT_READ_FIRST.txt").write_text(read_first, encoding="utf-8")
    write_json(
        ROOT / "DIRECTOR_PACK_MANIFEST.json",
        {
            "schema": "STARWARS_DELTA_CHATGPT_DIRECTOR_PACK",
            "schemaVersion": 1,
            "status": "CURRENT_FULL_CATALOG_PROJECTION",
            "publishTransactionId": transaction_id,
            "catalogRevision": catalog_summary.get("catalogRevision"),
            "snapshotContentHash": catalog_summary.get("snapshotContentHash"),
            "contractRevision": current.get("contractRevision"),
            "schemaHash": current.get("schemaHash"),
            "counts": summary["counts"],
            "entrypoint": "CHATGPT_READ_FIRST.txt",
            "directorView": "director-view/DIRECTOR_VIEW.json",
        },
    )

    legacy_path = ROOT / LEGACY_DOWNLOAD_NAME
    if legacy_path.exists():
        legacy_path.unlink()
    bundle_path = ROOT / DOWNLOAD_NAME
    if bundle_path.exists():
        bundle_path.unlink()
    with zipfile.ZipFile(bundle_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=7) as bundle:
        for relative in (
            "CHATGPT_READ_FIRST.txt",
            "DIRECTOR_PACK_MANIFEST.json",
            "OPEN_CURRENT.json",
            "SOURCE_CURRENT.json",
            "FULL_VISUAL_INDEX.json",
            "ASSET_VISUAL_LOOKUP.json",
            "VISUAL_UNAVAILABLE.json",
        ):
            path = ROOT / relative
            if path.is_file():
                bundle.write(path, relative)
        for directory in (
            ROOT / "director-view",
            ROOT / "full-visual-index",
            ROOT / "full-visual-sheets",
            ROOT / "catalog-contract",
            ROOT / "instruction-book",
        ):
            add_tree_to_zip(bundle, directory, ROOT)

    print("DIRECTOR_ACTORS", len(actors))
    print("DIRECTOR_LAYERS", len(layers))
    print("DIRECTOR_EFFECTS", len(effects))
    print("DIRECTOR_UI", len(ui_assets))
    print("DIRECTOR_ANIMATIONS", len(animations))
    print("DIRECTOR_AUDIO", len(audio_assets))
    print("DIRECTOR_VISUAL_GAPS", len(completion_visuals))
    print("DIRECTOR_SYNTHETIC_CATALOG_VISUALS", synthetic_catalog_visual_count)
    print("DIRECTOR_PACK_BYTES", bundle_path.stat().st_size)


if __name__ == "__main__":
    main()
