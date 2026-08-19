#!/usr/bin/env python3
import importlib.util
import json
import os
import pathlib
import re
import shutil
import zipfile
from collections import Counter

TOOLS = pathlib.Path(__file__).resolve().parent
BASE_PATH = TOOLS / "finalize_director_current.py"
SPEC = importlib.util.spec_from_file_location("starwars_delta_director_finalizer_base", BASE_PATH)
BASE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BASE)

ORIGINAL_ENRICH_VISUAL_ENTRY = BASE.enrich_visual_entry
ORIGINAL_ENRICH_ANIMATION = BASE.enrich_animation

ACTOR_DESCRIPTION_CONTRADICTION = "actor_description_contradicts_identity"
ACTOR_IDENTITY_TERMS = (
    "character",
    "person",
    "people",
    "human",
    "humanoid",
    "robot",
    "android",
    "alien",
    "creature",
    "monster",
    "pilot",
    "commander",
    "captain",
    "officer",
    "soldier",
    "figure",
    "cat",
    "dog",
    "ship",
    "spaceship",
    "spacecraft",
    "vehicle",
    "fighter",
    "bomber",
)
ACTOR_NON_IDENTITY_DESCRIPTION_PATTERNS = (
    re.compile(r"^(?:soft\s+pastel\s+)?(?:mountain\s+)?landscape\b.*\bbackground\b", re.I),
    re.compile(r"^(?:environment|scenery|background|backdrop|tileset)\b", re.I),
    re.compile(r"^(?:line\s+of\s+)?hanging\s+(?:garments|clothes|fabric)\b", re.I),
    re.compile(r"\bsuitable\s+as\s+(?:an?\s+)?(?:settlement[\s/]+)?environment\s+prop\b", re.I),
    re.compile(r"^(?:engine\s+trails?|explosion|impact\s+effect|muzzle\s+flash|laser\s+beam|particle\s+effect)\b", re.I),
)


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


def presentation_status_from_coverage(coverage):
    required_fields = (
        "description",
        "locationTypes",
        "sceneStates",
        "lightingMoods",
        "backgroundCoverageKnown",
        "fitModes",
    )
    missing_by_category = {}
    for category, counts in (coverage or {}).items():
        total = int(counts.get("total") or 0)
        missing = {}
        for field in required_fields:
            present = int(counts.get(field) or 0)
            if present < total:
                missing[field] = total - present
        if missing:
            missing_by_category[category] = missing

    if not missing_by_category:
        return {
            "complete": True,
            "currentState": "Director presentation metadata coverage is complete for all required visual fields.",
            "requiredFix": None,
            "missingByCategory": {},
        }

    summary = "; ".join(
        f"{category}: " + ", ".join(f"{field}={count}" for field, count in sorted(missing.items()))
        for category, missing in sorted(missing_by_category.items())
    )
    return {
        "complete": False,
        "currentState": f"Director presentation metadata has explicit coverage gaps: {summary}.",
        "requiredFix": (
            "Populate only the listed missing Director presentation metadata fields in Unity, then republish through the atomic CURRENT pipeline."
        ),
        "missingByCategory": missing_by_category,
    }


def union(records, key):
    values = []
    for record in records:
        value = record.get(key)
        if value in (None, "", [], {}):
            continue
        values.extend(value if isinstance(value, list) else [value])
    return unique(values)


def matches_path(path, needles):
    return any(needle in path for needle in needles)


def actor_description_contradicts_identity(entry):
    descriptions = []
    if entry.get("description"):
        descriptions.append(str(entry.get("description")))
    descriptions.extend(str(value) for value in entry.get("selectedDescriptions", []) if value)
    description = " ".join(unique(descriptions)).strip().lower()
    if not description:
        return False

    if any(re.search(rf"\b{re.escape(term)}\b", description, re.I) for term in ACTOR_IDENTITY_TERMS):
        return False

    return any(pattern.search(description) for pattern in ACTOR_NON_IDENTITY_DESCRIPTION_PATTERNS)


def refined_eligibility_signals(entry):
    reasons = []
    merged_paths = [str(value or "").replace("\\", "/").lower() for value in entry.get("sourcePaths", []) if value]
    selected_paths = [
        str(value or "").replace("\\", "/").lower()
        for value in (entry.get("authoringSourcePath"), entry.get("canonicalActorSourcePath"))
        if value
    ]
    selected_paths = unique(selected_paths)
    name = str(entry.get("displayName") or "").strip().lower()
    category = str(entry.get("category") or "")
    entity_kind = str(entry.get("entityKind") or "Unknown").lower()

    selected_capabilities = {str(value).lower() for value in entry.get("selectedCapabilities", [])}
    selected_roles = {str(value).lower() for value in entry.get("selectedRoles", [])}
    selected_tags = {str(value).lower() for value in entry.get("selectedTags", [])}
    if selected_capabilities or selected_roles or selected_tags:
        semantics = selected_capabilities | selected_roles | selected_tags
    else:
        semantics = (
            {str(value).lower() for value in entry.get("capabilities", [])}
            | {str(value).lower() for value in entry.get("roles", [])}
            | {str(value).lower() for value in entry.get("tags", [])}
        )

    path_rules = (
        ("sample_or_demo_path", ("/samples/", "/sample/", "/examples/", "/example/", "/demos/", "/demo/")),
        ("editor_test_or_debug_path", ("/editor/", "/tests/", "/test/", "/debug/", "/gizmos/")),
        ("generated_cutscene_output", ("/cutscenes/generated/",)),
        ("documentation_or_package_tooling_path", ("/documentation/", "/product navigator/")),
    )
    for reason, needles in path_rules:
        selected_bad = selected_paths and any(matches_path(path, needles) for path in selected_paths)
        all_merged_bad = not selected_paths and merged_paths and all(matches_path(path, needles) for path in merged_paths)
        if selected_bad or all_merged_bad:
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
    if semantics & exclusion_markers:
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

    if category == "Actor" and actor_description_contradicts_identity(entry):
        reasons.append(ACTOR_DESCRIPTION_CONTRADICTION)

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


def validate_eligibility_regressions():
    cases = (
        (
            {
                "authoringAssetId": "c8630c61ccf71ef4491c95dfa85a41fe:-454151143",
                "displayName": "ALIEN 10 0",
                "category": "Actor",
                "entityKind": "Person",
                "description": "Soft pastel mountain landscape background with layered haze at sunrise or sunset.",
            },
            True,
        ),
        (
            {
                "authoringAssetId": "dbe3d2492500ad744b4a6582c8aafd4d:-1163873368",
                "displayName": "CAT 5 0",
                "category": "Actor",
                "entityKind": "Person",
                "description": "Line of hanging garments and fabric pieces, suitable as a settlement/environment prop.",
            },
            True,
        ),
        (
            {
                "authoringAssetId": "regression:legitimate-person",
                "displayName": "Pilot",
                "category": "Actor",
                "entityKind": "Person",
                "description": "Pilot character standing in front of a blue cockpit background.",
            },
            False,
        ),
    )
    for entry, expected in cases:
        actual = ACTOR_DESCRIPTION_CONTRADICTION in refined_eligibility_signals(entry)
        if actual != expected:
            raise SystemExit(
                f"Actor description eligibility regression failed for {entry.get('authoringAssetId')}: expected={expected} actual={actual}"
            )


def patched_enrich_visual_entry(entry, by_id, by_reference, by_asset):
    authoring_record = by_id.get(str(entry.get("authoringAssetId") or ""))
    canonical_record = by_id.get(str(entry.get("canonicalActorAssetId") or ""))
    selected_records = []
    for record in (authoring_record, canonical_record):
        if record and record not in selected_records:
            selected_records.append(record)

    entry["authoringSourcePath"] = authoring_record.get("path") if authoring_record else None
    entry["canonicalActorSourcePath"] = canonical_record.get("path") if canonical_record else None
    entry["selectedCapabilities"] = union(selected_records, "capabilities")
    entry["selectedRoles"] = union(selected_records, "roles")
    entry["selectedTags"] = union(selected_records, "tags")
    entry["selectedDescriptions"] = union(selected_records, "description")
    entry["sourceProjectionRecommendable"] = bool(entry.get("recommendable"))

    result = ORIGINAL_ENRICH_VISUAL_ENTRY(entry, by_id, by_reference, by_asset)
    result["recommendable"] = result.get("recommendationStatus") == "RECOMMENDABLE"
    return result


def actor_alias_map(actors_by_id):
    expanded = dict(actors_by_id)
    actors = []
    seen = set()
    for actor in actors_by_id.values():
        marker = id(actor)
        if marker in seen:
            continue
        seen.add(marker)
        actors.append(actor)

    for actor in actors:
        aliases = []
        aliases.extend(actor.get("catalogAssetIds", []) or [])
        aliases.extend(actor.get("sourceRecordIds", []) or [])
        aliases.extend([actor.get("authoringAssetId"), actor.get("canonicalActorAssetId")])
        for variant in actor.get("visualVariants", []) or []:
            aliases.extend(variant.get("catalogAssetIds", []) or [])
            aliases.extend([variant.get("authoringAssetId"), variant.get("canonicalActorAssetId"), variant.get("assetId")])
        for alias in aliases:
            if alias:
                expanded[str(alias)] = actor
    return expanded


def patched_enrich_animation(animation, by_id, actors_by_id, by_reference, by_asset):
    expanded = actor_alias_map(actors_by_id)
    result = ORIGINAL_ENRICH_ANIMATION(animation, by_id, expanded, by_reference, by_asset)

    compatible = [str(value) for value in result.get("compatibleActorAssetIds", []) if value]
    recommendable = [
        asset_id
        for asset_id in compatible
        if expanded.get(asset_id, {}).get("recommendationStatus") == "RECOMMENDABLE"
    ]
    blocked = [asset_id for asset_id in compatible if asset_id not in recommendable]
    result["recommendableCompatibleActorAssetIds"] = unique(recommendable)
    result["blockedCompatibleActorAssetIds"] = unique(blocked)

    fallback = None
    for asset_id in recommendable:
        actor = expanded.get(asset_id)
        evidence = (actor or {}).get("visualEvidence", {})
        if evidence.get("status") == "PIXELS_VERIFIED":
            fallback = {
                "evidenceType": "ACTOR_APPEARANCE_ONLY",
                "actorAssetId": asset_id,
                "displayName": actor.get("displayName"),
                "visualEvidence": evidence,
            }
            break
    result["actorAppearanceFallback"] = fallback

    blocking = list(result.get("blockingCompletionNeeded", []))
    if compatible and not recommendable:
        blocking.append("recommendableCompatibleActorAssetIds")
    result["blockingCompletionNeeded"] = unique(blocking)
    result["metadataCompletionNeeded"] = unique(blocking + list(result.get("qualityCompletionNeeded", [])))
    result["selectionStatus"] = "BLOCKED_COMPATIBILITY" if blocking else "CATALOG_COMPATIBLE_RECOMMENDABLE"
    return result


def postprocess_output():
    root = BASE.ROOT
    queue_path = root / "director-view" / "completion-queue.json"
    audit_path = root / "director-view" / "eligibility-audit.json"
    director_path = root / "director-view" / "DIRECTOR_VIEW.json"
    open_path = root / "OPEN_CURRENT.json"
    manifest_path = root / "DIRECTOR_PACK_MANIFEST.json"
    read_first_path = root / "CHATGPT_READ_FIRST.txt"

    queue = BASE.read_json(queue_path)
    audit = BASE.read_json(audit_path)
    director = BASE.read_json(director_path)
    open_manifest = BASE.read_json(open_path)
    pack_manifest = BASE.read_json(manifest_path)

    presentation_metadata = queue.setdefault("presentationMetadata", {})
    coverage = presentation_metadata.get("coverageByCategory", {})
    presentation_status = presentation_status_from_coverage(coverage)
    presentation_metadata.update(presentation_status)
    queue.setdefault("summary", {})["presentationMetadataComplete"] = presentation_status["complete"]

    audit.setdefault("signals", {})[ACTOR_DESCRIPTION_CONTRADICTION] = (
        "Actor classification conflicts with strong source-description evidence that the selected identity is a background, environment prop, or effect."
    )
    BASE.write_json(audit_path, audit)

    eligibility_reviews = []
    for item in audit.get("items", []):
        eligibility_reviews.append(
            {
                "kind": "SourceEligibilityReview",
                "priority": "High" if item.get("category") in ("Actor", "Layer") else "Normal",
                "category": item.get("category"),
                "displayName": item.get("displayName"),
                "authoringAssetId": item.get("authoringAssetId"),
                "canonicalActorAssetId": item.get("canonicalActorAssetId"),
                "visualReferenceId": item.get("visualReferenceId"),
                "sourcePaths": item.get("sourcePaths", []),
                "reasons": item.get("reasons", []),
                "requiredFix": (
                    "Unity Catalog/publisher must correct or explicitly confirm the source classification and cinematic eligibility, "
                    "then republish atomically. The designer must not be asked to solve this item."
                ),
            }
        )
    queue["eligibilityReviewCount"] = len(eligibility_reviews)
    queue["eligibilityReviews"] = eligibility_reviews
    queue.setdefault("summary", {})["sourceEligibilityReviewTotal"] = len(eligibility_reviews)
    BASE.write_json(queue_path, queue)

    source_instruction = pathlib.Path("designer-ai/CHATGPT_START.txt")
    source_guide = pathlib.Path("designer-ai/FILM_AUTHORING_GUIDE_CURRENT.md")
    staged_instruction = root / "CHATGPT_START.txt"
    staged_guide = root / "FILM_AUTHORING_GUIDE_CURRENT.md"
    if not source_instruction.is_file() or not source_guide.is_file():
        raise SystemExit("Authoring instruction sources are missing")
    shutil.copy2(source_instruction, staged_instruction)
    shutil.copy2(source_guide, staged_guide)

    pack_manifest["schemaVersion"] = max(int(pack_manifest.get("schemaVersion", 0)), 4)
    pack_manifest["chatgptInstructions"] = "CHATGPT_START.txt"
    pack_manifest["filmAuthoringGuide"] = "FILM_AUTHORING_GUIDE_CURRENT.md"
    pack_manifest["completionQueue"] = "director-view/completion-queue.json"
    BASE.write_json(manifest_path, pack_manifest)

    director.setdefault("policies", {})["designerResponsibility"] = (
        "The designer describes the film and optionally uploads the single Visual Atlas PDF when pixel access is unavailable. "
        "The designer never repairs the completion queue or source eligibility audit."
    )
    BASE.write_json(director_path, director)

    open_manifest.setdefault("download", {})["selfContainedFiles"] = [
        "CHATGPT_START.txt",
        "FILM_AUTHORING_GUIDE_CURRENT.md",
        "director-view/DIRECTOR_VIEW.json",
        "director-view/completion-queue.json",
        "director-view/eligibility-audit.json"
    ]
    BASE.write_json(open_path, open_manifest)

    read_first = read_first_path.read_text(encoding="utf-8")
    read_first += (
        "\nThis fallback also contains CHATGPT_START.txt and FILM_AUTHORING_GUIDE_CURRENT.md. "
        "The completion queue and eligibility audit are engineering work data, not a designer upload list.\n"
    )
    read_first_path.write_text(read_first, encoding="utf-8")

    modified = [
        queue_path,
        audit_path,
        director_path,
        open_path,
        manifest_path,
        read_first_path,
        staged_instruction,
        staged_guide,
    ]
    BASE.rebuild_pack(modified)

    pack = root / BASE.PACK_NAME
    with zipfile.ZipFile(pack, "r") as archive:
        names = set(archive.namelist())
        required = {
            "CHATGPT_START.txt",
            "FILM_AUTHORING_GUIDE_CURRENT.md",
            "director-view/completion-queue.json",
            "director-view/eligibility-audit.json",
        }
        missing = sorted(required - names)
        if missing:
            raise SystemExit(f"Self-contained Director pack is missing: {missing}")

    print("DIRECTOR_POLICY_PRESENTATION_COMPLETE", presentation_status["complete"])
    print("DIRECTOR_POLICY_ELIGIBILITY_REVIEW", len(eligibility_reviews))
    print("DIRECTOR_POLICY_SELF_CONTAINED_PACK", pack.stat().st_size)


def main():
    validate_eligibility_regressions()
    BASE.eligibility_signals = refined_eligibility_signals
    BASE.enrich_visual_entry = patched_enrich_visual_entry
    BASE.enrich_animation = patched_enrich_animation
    BASE.main()
    postprocess_output()


if __name__ == "__main__":
    main()
