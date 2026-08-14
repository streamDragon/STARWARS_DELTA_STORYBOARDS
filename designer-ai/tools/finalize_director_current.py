#!/usr/bin/env python3
import json
import os
import pathlib
import tempfile
import zipfile

ROOT = pathlib.Path("_open_current_stage")
PAGES_BASE = "https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current"
PACK_NAME = "STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path, payload, compact=False):
    text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False) if compact else json.dumps(payload, indent=2, ensure_ascii=False)
    path.write_text(text + "\n", encoding="utf-8")


def eligibility_signals(entry):
    reasons = []
    paths = [str(value or "").replace("\\", "/").lower() for value in entry.get("sourcePaths", [])]
    name = str(entry.get("displayName") or "").strip().lower()

    path_rules = (
        ("sample_or_demo_path", ("/samples/", "/sample/", "/examples/", "/example/", "/demos/", "/demo/")),
        ("editor_test_or_debug_path", ("/editor/", "/tests/", "/test/", "/debug/")),
        ("generated_cutscene_output", ("/cutscenes/generated/",)),
    )
    for reason, needles in path_rules:
        if any(any(needle in path for needle in needles) for path in paths):
            reasons.append(reason)

    technical_names = {
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
    }
    if name in technical_names:
        reasons.append("generic_technical_name")

    return reasons


def atomic_identity(director):
    return {
        "publishTransactionId": director.get("publishTransactionId"),
        "catalogRevision": director.get("catalogRevision"),
        "snapshotContentHash": director.get("snapshotContentHash"),
        "contractRevision": director.get("contractRevision"),
        "schemaHash": director.get("schemaHash"),
    }


def rebuild_pack(modified_paths):
    pack = ROOT / PACK_NAME
    if not pack.is_file():
        raise SystemExit(f"Missing Director pack: {pack}")

    replacements = {str(path.relative_to(ROOT)).replace(os.sep, "/") for path in modified_paths}
    fd, temp_name = tempfile.mkstemp(prefix="director-current-", suffix=".zip", dir=str(ROOT))
    os.close(fd)
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
    open_path = ROOT / "OPEN_CURRENT.json"
    director_path = ROOT / "director-view" / "DIRECTOR_VIEW.json"
    queue_path = ROOT / "director-view" / "completion-queue.json"
    manifest_path = ROOT / "DIRECTOR_PACK_MANIFEST.json"
    audit_path = ROOT / "director-view" / "eligibility-audit.json"

    open_manifest = read_json(open_path)
    director = read_json(director_path)
    queue = read_json(queue_path)
    pack_manifest = read_json(manifest_path)

    identity = atomic_identity(director)
    if not identity["publishTransactionId"] or identity["catalogRevision"] is None or not identity["snapshotContentHash"]:
        raise SystemExit("Director atomic identity is incomplete")

    if open_manifest.get("publishTransactionId") != identity["publishTransactionId"]:
        raise SystemExit("OPEN_CURRENT publishTransactionId does not match Director View")
    if open_manifest.get("contractRevision") != identity["contractRevision"]:
        raise SystemExit("OPEN_CURRENT contractRevision does not match Director View")
    if open_manifest.get("schemaHash") != identity["schemaHash"]:
        raise SystemExit("OPEN_CURRENT schemaHash does not match Director View")

    open_manifest["schemaVersion"] = max(int(open_manifest.get("schemaVersion", 0)), 8)
    open_manifest["catalogRevision"] = identity["catalogRevision"]
    open_manifest["snapshotContentHash"] = identity["snapshotContentHash"]
    open_manifest["atomicIdentity"] = identity

    categories = []
    for filename in ("actors.json", "layers.json", "effects.json", "ui.json"):
        payload = read_json(ROOT / "director-view" / filename)
        category = payload.get("category")
        for entry in payload.get("assets", []):
            reasons = eligibility_signals(entry)
            if reasons:
                categories.append(
                    {
                        "category": category,
                        "displayName": entry.get("displayName"),
                        "authoringAssetId": entry.get("authoringAssetId"),
                        "visualReferenceId": entry.get("visualReferenceId"),
                        "sourcePaths": entry.get("sourcePaths", []),
                        "reasons": reasons,
                        "pixelStatus": entry.get("visualEvidence", {}).get("status"),
                    }
                )

    flagged_keys = {
        (str(item.get("visualReferenceId") or ""), str(item.get("authoringAssetId") or "")): item.get("reasons", [])
        for item in categories
    }
    flagged_completion_count = 0
    for item in queue.get("visualPreviews", []):
        key = (str(item.get("visualReferenceId") or ""), str(item.get("authoringAssetId") or ""))
        reasons = flagged_keys.get(key)
        if not reasons:
            continue
        flagged_completion_count += 1
        item["eligibilityReviewRequired"] = True
        item["eligibilityReviewReasons"] = reasons
        item["requiredFix"] = (
            "Unity Catalog/publisher must first confirm this is legitimate cinematic content. "
            "Only then should the Visual Library publisher export a deterministic preview."
        )

    audit = {
        "schema": "STARWARS_DELTA_DIRECTOR_ELIGIBILITY_AUDIT",
        "schemaVersion": 1,
        "status": "SOURCE_REVIEW_REQUIRED" if categories else "NO_OBVIOUS_GITHUB_SIDE_SIGNALS",
        "publishTransactionId": identity["publishTransactionId"],
        "catalogRevision": identity["catalogRevision"],
        "sourceCatalogRecordCount": director.get("sourceCatalogRecordCount"),
        "flaggedDirectorVisualCount": len(categories),
        "flaggedCompletionVisualCount": flagged_completion_count,
        "policy": (
            "This is a conservative Git-side audit only. Flagged entries are not silently removed from the authoritative Catalog or Director projection. "
            "Unity must confirm eligibility/exclusion at source and atomically republish."
        ),
        "signals": {
            "sample_or_demo_path": "Source path looks like sample, example or demo content.",
            "editor_test_or_debug_path": "Source path looks like Editor, test or debug tooling.",
            "generated_cutscene_output": "Source path looks like generated Cutscene output and must not recursively become authoring source.",
            "generic_technical_name": "Display name is a generic helper/geometry term and needs source eligibility review.",
        },
        "items": categories,
    }
    write_json(audit_path, audit)

    queue["schemaVersion"] = max(int(queue.get("schemaVersion", 0)), 3)
    queue["eligibilityReviewCount"] = flagged_completion_count
    queue["eligibilityAuditUrl"] = f"{PAGES_BASE}/director-view/eligibility-audit.json"
    queue["eligibilityPolicy"] = (
        "Eligibility review precedes preview generation for flagged entries. Git does not hide or delete source records to make coverage metrics look better."
    )

    director["schemaVersion"] = max(int(director.get("schemaVersion", 0)), 3)
    director["atomicIdentity"] = identity
    director["eligibilityAuditUrl"] = f"{PAGES_BASE}/director-view/eligibility-audit.json"
    director.setdefault("policies", {})["eligibility"] = (
        "Obvious sample/demo/generated/technical signals are surfaced for Unity source review, never silently filtered on GitHub."
    )

    open_manifest["eligibilityAudit"] = {
        "url": f"{PAGES_BASE}/director-view/eligibility-audit.json",
        "flaggedDirectorVisualCount": len(categories),
        "flaggedCompletionVisualCount": flagged_completion_count,
        "policy": "Review at Unity source before preview generation; do not hide Catalog defects in the Git projection.",
    }

    pack_manifest["schemaVersion"] = max(int(pack_manifest.get("schemaVersion", 0)), 2)
    pack_manifest["atomicIdentity"] = identity
    pack_manifest["sourceCatalogRecordCount"] = director.get("sourceCatalogRecordCount")
    pack_manifest["eligibilityAudit"] = "director-view/eligibility-audit.json"

    write_json(open_path, open_manifest)
    write_json(queue_path, queue)
    write_json(director_path, director)
    write_json(manifest_path, pack_manifest)

    modified = [open_path, queue_path, director_path, manifest_path, audit_path]
    rebuild_pack(modified)

    with zipfile.ZipFile(ROOT / PACK_NAME, "r") as archive:
        names = set(archive.namelist())
        for required in (
            "OPEN_CURRENT.json",
            "DIRECTOR_PACK_MANIFEST.json",
            "director-view/DIRECTOR_VIEW.json",
            "director-view/completion-queue.json",
            "director-view/eligibility-audit.json",
        ):
            if required not in names:
                raise SystemExit(f"Finalized Director pack is missing {required}")

    print("DIRECTOR_ATOMIC_IDENTITY", json.dumps(identity, separators=(",", ":")))
    print("DIRECTOR_ELIGIBILITY_REVIEW", len(categories))
    print("DIRECTOR_ELIGIBILITY_COMPLETION_REVIEW", flagged_completion_count)
    print("DIRECTOR_PACK_BYTES_FINAL", (ROOT / PACK_NAME).stat().st_size)


if __name__ == "__main__":
    main()
