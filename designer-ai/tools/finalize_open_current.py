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
DOWNLOAD_NAME = "STARWARS_DELTA_CHATGPT_VISUAL_CURRENT.zip"


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
        temp = pathlib.Path(temp_raw)
        visual_zip = temp / "visual-library.zip"
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
                "reason": "NO_PIXEL_EVIDENCE_EXPORTED",
                "requiredFix": "Unity Designer AI Visual Library publisher must render/export one representative preview for this visual identity.",
            }
        )

    source_count = len(manifest.get("assets", []))
    coverage_percent = round((covered_visual_identity_count / source_count) * 100.0, 2) if source_count else 100.0
    unavailable_payload = {
        "schema": "STARWARS_DELTA_CHATGPT_VISUAL_UNAVAILABLE",
        "schemaVersion": 1,
        "status": "VISUAL_GAPS_REPORTED",
        "publishTransactionId": transaction_id,
        "sourceVisualIdentityCount": source_count,
        "coveredVisualIdentityCount": covered_visual_identity_count,
        "unavailableVisualIdentityCount": len(unavailable),
        "coveragePercent": coverage_percent,
        "rule": "Never infer appearance for these entries from displayName or metadata. They are visually unverified until the Unity publisher exports pixels.",
        "assets": unavailable,
    }
    (ROOT / "VISUAL_UNAVAILABLE.json").write_text(
        json.dumps(unavailable_payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    open_path = ROOT / "OPEN_CURRENT.json"
    open_manifest = json.loads(open_path.read_text(encoding="utf-8"))
    open_manifest["schemaVersion"] = max(int(open_manifest.get("schemaVersion", 0)), 5)
    open_manifest["visualCoverage"] = {
        "sourceVisualIdentityCount": source_count,
        "coveredVisualIdentityCount": covered_visual_identity_count,
        "unavailableVisualIdentityCount": len(unavailable),
        "coveragePercent": coverage_percent,
        "unavailableManifestUrl": f"{PAGES_BASE}/VISUAL_UNAVAILABLE.json",
    }
    open_manifest["download"] = {
        "chatgptVisualCurrentZipUrl": f"{PAGES_BASE}/{DOWNLOAD_NAME}",
        "purpose": "Fallback download for Debora/ChatGPT. Contains the compact current authoring data, visual indexes, and representative visual sheets. It intentionally does not contain every animation frame.",
    }
    open_manifest.setdefault("usage", {})["missingPixels"] = (
        "If an asset is listed in VISUAL_UNAVAILABLE.json, do not invent its appearance. Request/fix a new Unity Visual Library publish."
    )
    open_path.write_text(json.dumps(open_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    bundle_path = ROOT / DOWNLOAD_NAME
    include_roots = [
        "OPEN_CURRENT.json",
        "SOURCE_CURRENT.json",
        "CHATGPT_VISUAL_INDEX.json",
        "FULL_VISUAL_INDEX.json",
        "ASSET_VISUAL_LOOKUP.json",
        "VISUAL_UNAVAILABLE.json",
        "authoring/CATALOG_SUBSET.json",
        "authoring/INSTRUCTION_SUBSET.json",
        "authoring/VISUAL_PACK/proof_manifest.json",
    ]
    with zipfile.ZipFile(bundle_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=7) as bundle:
        for relative in include_roots:
            path = ROOT / relative
            if path.is_file():
                bundle.write(path, relative)
        for directory in (ROOT / "full-visual-index", ROOT / "full-visual-sheets"):
            if directory.exists():
                for path in sorted(directory.rglob("*")):
                    if path.is_file():
                        bundle.write(path, str(path.relative_to(ROOT)).replace(os.sep, "/"))

    print("VISUAL_SOURCE_COUNT", source_count)
    print("VISUAL_COVERED_COUNT", covered_visual_identity_count)
    print("VISUAL_UNAVAILABLE_COUNT", len(unavailable))
    print("VISUAL_COVERAGE_PERCENT", coverage_percent)
    print("DEBORA_DOWNLOAD_ZIP_BYTES", bundle_path.stat().st_size)


if __name__ == "__main__":
    main()
