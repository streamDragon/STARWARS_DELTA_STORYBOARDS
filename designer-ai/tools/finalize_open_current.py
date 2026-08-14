#!/usr/bin/env python3
import json
import os
import pathlib
import shutil
import tempfile
import urllib.request
import zipfile

REPO = os.environ["REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]
ROOT = pathlib.Path("_open_current_stage")
CURRENT = json.loads(pathlib.Path("designer-ai/current.json").read_text(encoding="utf-8"))
PAGES_BASE = "https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current"


def get_json(url):
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {TOKEN}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "STARWARS-DELTA-open-current-finalizer",
    }
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.load(response)


def download(url, destination):
    request = urllib.request.Request(url, headers={"User-Agent": "STARWARS-DELTA-open-current-finalizer"})
    with urllib.request.urlopen(request, timeout=600) as response, open(destination, "wb") as output:
        shutil.copyfileobj(response, output)


def main():
    transaction_id = CURRENT["publishTransactionId"]
    tag = CURRENT["releaseUrl"].rsplit("/releases/tag/", 1)[1]
    release = get_json(f"https://api.github.com/repos/{REPO}/releases/tags/{tag}")
    release_assets = {asset["name"]: asset for asset in release.get("assets", [])}
    visual_asset_name = "STARWARS_DELTA_DESIGNER_AI_VISUAL_LIBRARY_CURRENT.zip"
    if visual_asset_name not in release_assets:
        raise SystemExit("Visual Library release asset is missing")

    full_index = json.loads((ROOT / "FULL_VISUAL_INDEX.json").read_text(encoding="utf-8"))
    represented_asset_ids = set()
    represented_visual_refs = set()
    for entry in full_index.get("assets", []):
        represented_asset_ids.update(value for value in entry.get("catalogAssetIds", []) if value)
        represented_visual_refs.update(value for value in entry.get("visualReferenceIds", []) if value)
        if entry.get("visualReferenceId"):
            represented_visual_refs.add(entry["visualReferenceId"])

    with tempfile.TemporaryDirectory() as temp_raw:
        visual_zip = pathlib.Path(temp_raw) / "visual-library.zip"
        download(release_assets[visual_asset_name]["browser_download_url"], visual_zip)
        with zipfile.ZipFile(visual_zip) as archive:
            manifest = json.loads(archive.read("visual_library_manifest.json").decode("utf-8-sig"))

    unavailable = []
    covered_visual_identity_count = 0
    for asset in manifest.get("assets", []):
        visual_ref = asset.get("visualReferenceId")
        catalog_ids = [value for value in asset.get("catalogAssetIds", []) if value]
        if not catalog_ids and asset.get("assetId"):
            catalog_ids = [asset["assetId"]]

        represented = bool(
            (visual_ref and visual_ref in represented_visual_refs)
            or any(asset_id in represented_asset_ids for asset_id in catalog_ids)
        )
        if represented:
            covered_visual_identity_count += 1
            continue

        unavailable.append(
            {
                "visualReferenceId": visual_ref,
                "assetId": asset.get("assetId"),
                "catalogAssetIds": catalog_ids,
                "displayName": asset.get("displayName"),
                "category": asset.get("category"),
                "entityClassification": asset.get("entityClassification"),
                "sourceKind": asset.get("sourceKind"),
                "sourcePath": asset.get("sourcePath"),
                "representativePurposes": asset.get("representativePurposes", []),
                "compatibleAnimationIds": asset.get("compatibleAnimationIds", []),
                "reason": "NO_DIRECT_PIXEL_EVIDENCE_EXPORTED",
                "interpretation": "This is a Visual Library preview gap only. It is not automatically a missing movie asset and must be reclassified by the Director View.",
                "requiredFix": "Unity Visual Library publisher should export one deterministic preview only when this is a safe, recommendable Director visual identity.",
            }
        )

    source_count = len(manifest.get("assets", []))
    coverage_percent = round((covered_visual_identity_count / source_count) * 100.0, 2) if source_count else 100.0
    unavailable_payload = {
        "schema": "STARWARS_DELTA_CHATGPT_VISUAL_UNAVAILABLE",
        "schemaVersion": 2,
        "status": "VISUAL_LIBRARY_DIRECT_PREVIEW_GAPS_REPORTED",
        "publishTransactionId": transaction_id,
        "sourceVisualIdentityCount": source_count,
        "directPixelEvidenceCount": covered_visual_identity_count,
        "directPixelEvidenceMissingCount": len(unavailable),
        "directPreviewCoveragePercent": coverage_percent,
        "scopeWarning": "This percentage measures direct previews inside the Visual Library only. It is not total Catalog coverage, not Director readiness, and not Audio or Animation availability.",
        "rule": "Never infer appearance from displayName or metadata. The Director View decides whether a gap is recommendable and sends only legitimate safe gaps to its completion queue.",
        "assets": unavailable,
    }
    (ROOT / "VISUAL_UNAVAILABLE.json").write_text(
        json.dumps(unavailable_payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    open_path = ROOT / "OPEN_CURRENT.json"
    open_manifest = json.loads(open_path.read_text(encoding="utf-8"))
    open_manifest["schemaVersion"] = max(int(open_manifest.get("schemaVersion", 0)), 6)
    open_manifest["visualLibraryPreviewCoverage"] = {
        "sourceVisualIdentityCount": source_count,
        "directPixelEvidenceCount": covered_visual_identity_count,
        "directPixelEvidenceMissingCount": len(unavailable),
        "directPreviewCoveragePercent": coverage_percent,
        "scopeWarning": "Visual Library direct-preview metric only; do not present it as total Director or Catalog coverage.",
        "unavailableManifestUrl": f"{PAGES_BASE}/VISUAL_UNAVAILABLE.json",
    }
    open_manifest.setdefault("usage", {})["missingPixels"] = (
        "VISUAL_UNAVAILABLE.json is raw evidence. Use the Director completion queue to decide which missing previews actually require a Unity fix."
    )
    open_path.write_text(json.dumps(open_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print("VISUAL_LIBRARY_IDENTITY_COUNT", source_count)
    print("DIRECT_PIXEL_EVIDENCE_COUNT", covered_visual_identity_count)
    print("DIRECT_PIXEL_EVIDENCE_MISSING", len(unavailable))
    print("DIRECT_PREVIEW_COVERAGE_PERCENT", coverage_percent)


if __name__ == "__main__":
    main()
