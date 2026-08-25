#!/usr/bin/env python3
import json
import pathlib
import zipfile
from collections import Counter, defaultdict

ROOT = pathlib.Path("_open_current_stage")
DIRECTOR_ROOT = ROOT / "director-view"
CURRENT_PATH = pathlib.Path("designer-ai/current.json")
REPORT_NAME = "VISUAL_SCAN_REPORT.json"
REPORT_PATH = DIRECTOR_ROOT / REPORT_NAME
PACK_NAME = "STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip"
PAGES_BASE = "https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current"
CATEGORY_FILES = ("actors.json", "layers.json", "effects.json", "ui.json")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def unique(values):
    result = []
    seen = set()
    for value in values:
        if value in (None, "", [], {}):
            continue
        marker = str(value)
        if marker in seen:
            continue
        seen.add(marker)
        result.append(value)
    return result


def source_paths(entry):
    values = []
    for key in ("authoringSourcePath", "canonicalActorSourcePath"):
        value = entry.get(key)
        if value:
            values.append(str(value).replace("\\", "/"))
    values.extend(str(value).replace("\\", "/") for value in entry.get("sourcePaths", []) or [] if value)
    return unique(values)


def primary_path(entry):
    paths = source_paths(entry)
    return paths[0] if paths else ""


def status_for(entry):
    recommendation = str(entry.get("recommendationStatus") or "")
    pixel_status = str((entry.get("visualEvidence") or {}).get("status") or "")
    reasons = entry.get("eligibilityReviewReasons") or []
    if recommendation == "DO_NOT_RECOMMEND_PENDING_SOURCE_REVIEW" or reasons:
        return "PENDING_SOURCE_REVIEW"
    if recommendation == "PIXEL_COMPLETION_REQUIRED":
        return "PREVIEW_GENERATION_REQUIRED"
    if recommendation == "RECOMMENDABLE" and pixel_status == "PIXELS_VERIFIED":
        return "INCLUDED_IN_ATLAS"
    if pixel_status == "PIXELS_VERIFIED":
        return "INCLUDED_NOT_RECOMMENDABLE"
    if not primary_path(entry):
        return "TRUE_UNEXPLAINED_MISS"
    return "TRUE_UNEXPLAINED_MISS"


def child_record(entry, status):
    asset_id = str(entry.get("authoringAssetId") or entry.get("canonicalActorAssetId") or "")
    guid = ""
    local_id = ""
    if ":" in asset_id:
        guid, local_id = asset_id.split(":", 1)
    evidence = entry.get("visualEvidence") or {}
    return {
        "displayName": entry.get("displayName"),
        "category": entry.get("category"),
        "status": status,
        "authoringAssetId": asset_id or None,
        "guid": guid or None,
        "localId": local_id or None,
        "visualReferenceId": entry.get("visualReferenceId"),
        "recommendationStatus": entry.get("recommendationStatus"),
        "eligibilityStatus": entry.get("eligibilityStatus"),
        "reasons": unique(entry.get("eligibilityReviewReasons") or entry.get("reviewReasons") or []),
        "atlasPage": evidence.get("atlasPage"),
        "atlasSlot": evidence.get("atlasSlot"),
        "pageImageUrl": evidence.get("pageImageUrl"),
    }


def rebuild_pack_with_report():
    pack = ROOT / PACK_NAME
    if not pack.is_file():
        return
    temp = pack.with_suffix(".tmp.zip")
    with zipfile.ZipFile(pack, "r") as source, zipfile.ZipFile(temp, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=7) as target:
        for item in source.infolist():
            if item.filename == f"director-view/{REPORT_NAME}":
                continue
            target.writestr(item, source.read(item.filename))
        target.write(REPORT_PATH, f"director-view/{REPORT_NAME}")
    temp.replace(pack)


def main():
    current = read_json(CURRENT_PATH)
    tx = current.get("publishTransactionId")
    entries = []
    for filename in CATEGORY_FILES:
        path = DIRECTOR_ROOT / filename
        if not path.is_file():
            raise SystemExit(f"Missing Director category file: {path}")
        payload = read_json(path)
        for entry in payload.get("assets", []) or []:
            item = dict(entry)
            item.setdefault("category", payload.get("category"))
            entries.append(item)

    grouped = defaultdict(list)
    entry_status_counts = Counter()
    path_statuses = defaultdict(set)
    no_path = []

    for entry in entries:
        status = status_for(entry)
        entry_status_counts[status] += 1
        path = primary_path(entry)
        child = child_record(entry, status)
        if not path:
            no_path.append(child)
            continue
        grouped[path].append(child)
        path_statuses[status].add(path)

    groups = []
    for path, children in grouped.items():
        statuses = sorted(set(child["status"] for child in children))
        categories = sorted(set(str(child.get("category") or "") for child in children if child.get("category")))
        reasons = unique(reason for child in children for reason in child.get("reasons", []) or [])
        groups.append(
            {
                "assetPath": path,
                "statuses": statuses,
                "categories": categories,
                "entryCount": len(children),
                "reasons": reasons,
                "children": children,
                "unityActions": {
                    "ping": "AssetDatabase.LoadMainAssetAtPath(assetPath) + EditorGUIUtility.PingObject",
                    "open": "AssetDatabase.OpenAsset(AssetDatabase.LoadMainAssetAtPath(assetPath))",
                    "copyPath": "EditorGUIUtility.systemCopyBuffer = assetPath",
                    "reveal": "EditorUtility.RevealInFinder(assetPath)",
                },
            }
        )

    status_order = {
        "TRUE_UNEXPLAINED_MISS": 0,
        "PREVIEW_GENERATION_REQUIRED": 1,
        "PENDING_SOURCE_REVIEW": 2,
        "INCLUDED_NOT_RECOMMENDABLE": 3,
        "INCLUDED_IN_ATLAS": 4,
    }
    groups.sort(key=lambda group: (min(status_order.get(value, 99) for value in group["statuses"]), group["assetPath"].lower()))

    report = {
        "schema": "STARWARS_DELTA_VISUAL_SCAN_REPORT",
        "schemaVersion": 1,
        "status": "CURRENT_VISUAL_SCAN_EXPLICIT",
        "publishTransactionId": tx,
        "requiredCurrent": current.get("requiredCurrent"),
        "purpose": "Engineering audit of Director visual entries grouped by real Unity source asset path. Entry counts and unique source-file counts are reported separately so sprite sub-assets are not misrepresented as separate missing files.",
        "summary": {
            "directorVisualEntryCount": len(entries),
            "uniqueSourcePathCount": len(grouped),
            "entriesWithoutSourcePath": len(no_path),
            "entryCountsByStatus": dict(sorted(entry_status_counts.items())),
            "uniqueSourcePathsByStatus": {status: len(paths) for status, paths in sorted(path_statuses.items())},
            "trueUnexplainedMissEntryCount": entry_status_counts.get("TRUE_UNEXPLAINED_MISS", 0),
            "trueUnexplainedMissUniquePathCount": len(path_statuses.get("TRUE_UNEXPLAINED_MISS", set())),
        },
        "statusDefinitions": {
            "INCLUDED_IN_ATLAS": "Source is represented by verified CURRENT atlas pixels.",
            "INCLUDED_NOT_RECOMMENDABLE": "Pixels exist, but the source is not a normal creative recommendation.",
            "PENDING_SOURCE_REVIEW": "Source exists and has a path; eligibility/classification must be reviewed before preview work.",
            "PREVIEW_GENERATION_REQUIRED": "Source is eligible but needs deterministic Visual Library/Atlas preview generation.",
            "TRUE_UNEXPLAINED_MISS": "No explicit supported reason explains why a Director visual lacks usable CURRENT pixel evidence. Treat as RED engineering investigation.",
        },
        "uiContract": {
            "groupBy": "assetPath",
            "requiredColumns": ["status", "categories", "assetPath", "entryCount", "reasons"],
            "requiredButtons": ["PING", "OPEN", "COPY PATH", "REVEAL"],
            "requiredFilters": ["ALL", "IN ATLAS", "MISSING", "REVIEW", "PREVIEW NEEDED", "UNEXPLAINED"],
            "bulkActions": ["COPY ALL FILTERED PATHS", "EXPORT FILTERED JSON"],
        },
        "sourceGroups": groups,
        "entriesWithoutSourcePath": no_path,
    }
    write_json(REPORT_PATH, report)

    director_path = DIRECTOR_ROOT / "DIRECTOR_VIEW.json"
    director = read_json(director_path)
    director["visualScanReportUrl"] = f"{PAGES_BASE}/director-view/{REPORT_NAME}"
    director["visualScanSummary"] = report["summary"]
    write_json(director_path, director)

    open_path = ROOT / "OPEN_CURRENT.json"
    open_current = read_json(open_path)
    open_current["visualScanReport"] = {
        "status": "CURRENT_VISUAL_SCAN_EXPLICIT",
        "url": f"{PAGES_BASE}/director-view/{REPORT_NAME}",
        "summary": report["summary"],
        "rule": "Use source-path groups, not raw projected entry count, when diagnosing what the scanner or Visual Library missed.",
    }
    self_contained = open_current.setdefault("download", {}).setdefault("selfContainedFiles", [])
    if f"director-view/{REPORT_NAME}" not in self_contained:
        self_contained.append(f"director-view/{REPORT_NAME}")
    write_json(open_path, open_current)

    manifest_path = ROOT / "DIRECTOR_PACK_MANIFEST.json"
    manifest = read_json(manifest_path)
    manifest["visualScanReport"] = f"director-view/{REPORT_NAME}"
    write_json(manifest_path, manifest)

    rebuild_pack_with_report()

    print("VISUAL_SCAN_ENTRIES", len(entries))
    print("VISUAL_SCAN_UNIQUE_SOURCE_PATHS", len(grouped))
    for status, count in sorted(entry_status_counts.items()):
        print("VISUAL_SCAN_STATUS", status, count, "entries", len(path_statuses.get(status, set())), "paths")


if __name__ == "__main__":
    main()
