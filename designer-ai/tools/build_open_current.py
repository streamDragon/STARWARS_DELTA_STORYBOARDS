#!/usr/bin/env python3
import io
import json
import os
import pathlib
import re
import shutil
import tempfile
import urllib.request
import zipfile
from collections import defaultdict

from PIL import Image, ImageDraw, ImageFont, ImageOps

REPO = os.environ["REPOSITORY"]
TOKEN = os.environ["GITHUB_TOKEN"]
ROOT = pathlib.Path("_open_current_stage")
CURRENT_PATH = pathlib.Path("designer-ai/current.json")
PAGES_BASE = "https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current"


def load_current():
    current = json.loads(CURRENT_PATH.read_text(encoding="utf-8"))
    if current.get("status") != "CURRENT_VERIFIED":
        raise SystemExit("designer-ai/current.json is not CURRENT_VERIFIED")
    if not current.get("publishTransactionId") or "/releases/tag/" not in current.get("releaseUrl", ""):
        raise SystemExit("CURRENT is missing publishTransactionId or releaseUrl")
    return current


def get_json(url):
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {TOKEN}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "STARWARS-DELTA-open-current-publisher",
    }
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.load(response)


def download(url, destination):
    request = urllib.request.Request(url, headers={"User-Agent": "STARWARS-DELTA-open-current-publisher"})
    with urllib.request.urlopen(request, timeout=600) as response, open(destination, "wb") as output:
        shutil.copyfileobj(response, output)


def slug(value):
    result = re.sub(r"[^A-Za-z0-9._-]+", "-", str(value)).strip("-").lower()
    return result or "other"


def animation_family_name(asset):
    name = str(asset.get("displayName") or "").strip()
    purposes = [str(value).lower() for value in asset.get("representativePurposes", [])]
    is_animation = bool(asset.get("representativeFrames")) or any("animation" in purpose for purpose in purposes)
    if not is_animation:
        return None
    collapsed = re.sub(r"(?:[ _-]+)\d{1,4}$", "", name).strip()
    return collapsed or name


def fonts():
    base = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    return {
        "title": ImageFont.truetype(bold, 24),
        "name": ImageFont.truetype(bold, 13),
        "meta": ImageFont.truetype(base, 9),
    }


def build_full_visual_sheets(visual_zip, transaction_id):
    with zipfile.ZipFile(visual_zip) as archive:
        manifest = json.loads(archive.read("visual_library_manifest.json").decode("utf-8-sig"))
        source_assets = manifest.get("assets", [])
        archive_names = set(archive.namelist())

        grouped = {}
        merged_ids = defaultdict(list)
        merged_visual_refs = defaultdict(list)

        for asset in source_assets:
            family = animation_family_name(asset)
            if family:
                key = ("animation", str(asset.get("category") or "Other"), family.lower())
            else:
                key = ("visual", str(asset.get("visualReferenceId") or asset.get("assetId") or id(asset)))

            merged_ids[key].extend(asset.get("catalogAssetIds") or ([asset.get("assetId")] if asset.get("assetId") else []))
            if asset.get("visualReferenceId"):
                merged_visual_refs[key].append(asset["visualReferenceId"])

            preview = asset.get("primaryPreview") or asset.get("thumbnailPath")
            preview_exists = bool(preview and preview in archive_names)
            if key not in grouped or (preview_exists and not grouped[key].get("_previewExists")):
                representative = dict(asset)
                representative["_previewExists"] = preview_exists
                representative["_animationFamily"] = family
                grouped[key] = representative

        representatives = []
        for key, asset in grouped.items():
            preview = asset.get("primaryPreview") or asset.get("thumbnailPath")
            if not preview or preview not in archive_names:
                continue
            asset["_allCatalogAssetIds"] = sorted(set(value for value in merged_ids[key] if value))
            asset["_allVisualReferenceIds"] = sorted(set(merged_visual_refs[key]))
            representatives.append(asset)

        representatives.sort(
            key=lambda asset: (
                str(asset.get("category") or "Other").lower(),
                str(asset.get("_animationFamily") or asset.get("displayName") or "").lower(),
            )
        )

        by_category = defaultdict(list)
        for asset in representatives:
            by_category[str(asset.get("category") or "Other")].append(asset)

        sheets_root = ROOT / "full-visual-sheets"
        sheets_root.mkdir(parents=True, exist_ok=True)
        page_w, page_h = 1240, 1754
        margin, cols, rows = 44, 3, 4
        per_page = cols * rows
        cell_w = (page_w - margin * 2) // cols
        cell_h = (page_h - margin * 2 - 72) // rows
        face = fonts()
        index_entries = []
        sheet_manifest = []

        for category, items in sorted(by_category.items(), key=lambda pair: pair[0].lower()):
            category_slug = slug(category)
            category_root = sheets_root / category_slug
            category_root.mkdir(parents=True, exist_ok=True)
            pdf_path = sheets_root / f"{category_slug}.pdf"
            pages = []

            for offset in range(0, len(items), per_page):
                page_number = len(pages) + 1
                page = Image.new("RGB", (page_w, page_h), "white")
                draw = ImageDraw.Draw(page)
                draw.text(
                    (margin, 22),
                    f"STARWARS_DELTA | {category} | CURRENT {transaction_id} | page {page_number}",
                    fill="black",
                    font=face["title"],
                )
                batch = items[offset : offset + per_page]

                for slot, asset in enumerate(batch):
                    row, col = divmod(slot, cols)
                    x = margin + col * cell_w
                    y = margin + 58 + row * cell_h
                    draw.rectangle((x, y, x + cell_w - 10, y + cell_h - 10), outline="black", width=1)
                    preview_path = asset.get("primaryPreview") or asset.get("thumbnailPath")

                    try:
                        with Image.open(io.BytesIO(archive.read(preview_path))) as source:
                            source = source.convert("RGBA")
                            background = Image.new("RGBA", source.size, "white")
                            background.alpha_composite(source)
                            thumbnail = ImageOps.contain(
                                background.convert("RGB"),
                                (cell_w - 28, cell_h - 78),
                                Image.Resampling.LANCZOS,
                            )
                            page.paste(thumbnail, (x + (cell_w - 10 - thumbnail.width) // 2, y + 8))
                    except Exception:
                        draw.text((x + 8, y + 25), "Preview unavailable", fill="black", font=face["meta"])

                    label = str(asset.get("_animationFamily") or asset.get("displayName") or "(unnamed)")[:46]
                    text_y = y + cell_h - 68
                    draw.text((x + 7, text_y), label, fill="black", font=face["name"])
                    purposes = ", ".join(str(value) for value in asset.get("representativePurposes", [])[:2])
                    draw.text((x + 7, text_y + 18), purposes[:52], fill="black", font=face["meta"])
                    draw.text((x + 7, text_y + 31), str(asset.get("assetId") or "")[:52], fill="black", font=face["meta"])

                    page_image_file = f"full-visual-sheets/{category_slug}/page-{page_number:03d}.jpg"
                    index_entries.append(
                        {
                            "visualReferenceId": asset.get("visualReferenceId"),
                            "visualReferenceIds": asset["_allVisualReferenceIds"],
                            "assetId": asset.get("assetId"),
                            "catalogAssetIds": asset["_allCatalogAssetIds"],
                            "displayName": asset.get("displayName"),
                            "animationFamily": asset.get("_animationFamily"),
                            "category": category,
                            "entityClassification": asset.get("entityClassification"),
                            "cutscenePrimaryUse": asset.get("cutscenePrimaryUse"),
                            "representativePurposes": asset.get("representativePurposes", []),
                            "semanticStates": asset.get("semanticStates", []),
                            "compatibleAnimationIds": asset.get("compatibleAnimationIds", []),
                            "sourceKind": asset.get("sourceKind"),
                            "visualDescription": asset.get("visualDescription"),
                            "sheetFile": f"full-visual-sheets/{category_slug}.pdf",
                            "sheetUrl": f"{PAGES_BASE}/full-visual-sheets/{category_slug}.pdf",
                            "pageImageFile": page_image_file,
                            "pageImageUrl": f"{PAGES_BASE}/{page_image_file}",
                            "page": page_number,
                            "slot": slot + 1,
                        }
                    )

                page_jpeg = category_root / f"page-{page_number:03d}.jpg"
                page.save(page_jpeg, "JPEG", quality=78, optimize=True, progressive=True)
                pages.append(page)

            if pages:
                pages[0].save(pdf_path, "PDF", resolution=120, save_all=True, append_images=pages[1:], quality=78)
                sheet_manifest.append(
                    {
                        "category": category,
                        "file": f"full-visual-sheets/{category_slug}.pdf",
                        "url": f"{PAGES_BASE}/full-visual-sheets/{category_slug}.pdf",
                        "pageImageRoot": f"{PAGES_BASE}/full-visual-sheets/{category_slug}/",
                        "pages": len(pages),
                        "representatives": len(items),
                    }
                )

        asset_lookup = {}
        for index, entry in enumerate(index_entries):
            for asset_id in entry["catalogAssetIds"]:
                asset_lookup[asset_id] = index

        by_category_index = defaultdict(list)
        for entry in index_entries:
            by_category_index[entry["category"]].append(entry)

        index_root = ROOT / "full-visual-index"
        index_root.mkdir(parents=True, exist_ok=True)
        category_indexes = []
        for category, entries in sorted(by_category_index.items(), key=lambda pair: pair[0].lower()):
            category_slug = slug(category)
            filename = f"full-visual-index/{category_slug}.json"
            payload = {
                "schema": "STARWARS_DELTA_CHATGPT_VISUAL_CATEGORY_INDEX",
                "schemaVersion": 2,
                "status": "CURRENT_VERIFIED_OPEN",
                "publishTransactionId": transaction_id,
                "category": category,
                "representativeCount": len(entries),
                "assets": entries,
            }
            (ROOT / filename).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            category_indexes.append(
                {
                    "category": category,
                    "file": filename,
                    "url": f"{PAGES_BASE}/{filename}",
                    "representativeCount": len(entries),
                }
            )

        lookup_file = "ASSET_VISUAL_LOOKUP.json"
        lookup_payload = {
            "schema": "STARWARS_DELTA_CHATGPT_ASSET_VISUAL_LOOKUP",
            "schemaVersion": 2,
            "status": "CURRENT_VERIFIED_OPEN",
            "publishTransactionId": transaction_id,
            "assetIdToEntryIndex": asset_lookup,
        }
        (ROOT / lookup_file).write_text(json.dumps(lookup_payload, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8")

        full_index = {
            "schema": "STARWARS_DELTA_CHATGPT_FULL_VISUAL_INDEX",
            "schemaVersion": 3,
            "status": "CURRENT_VERIFIED_OPEN",
            "publishTransactionId": transaction_id,
            "sourceVisualIdentityCount": manifest.get("visualIdentityCount"),
            "sourceCatalogRecordCount": manifest.get("catalogRecordCount"),
            "representativeCount": len(index_entries),
            "animationPolicy": "One representative image per animation family; trailing frame numbers are collapsed. Non-animation content uses one image per Visual Library identity.",
            "scopeRule": "This is pixel evidence, not the complete authoring Catalog. Use the generated Director View for authoring and exact Catalog IDs.",
            "sheets": sheet_manifest,
            "categoryIndexes": category_indexes,
            "assetLookupFile": lookup_file,
            "assetLookupUrl": f"{PAGES_BASE}/{lookup_file}",
            "assets": index_entries,
        }
        (ROOT / "FULL_VISUAL_INDEX.json").write_text(json.dumps(full_index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        return full_index


def main():
    current = load_current()
    transaction_id = current["publishTransactionId"]
    tag = current["releaseUrl"].rsplit("/releases/tag/", 1)[1]
    release = get_json(f"https://api.github.com/repos/{REPO}/releases/tags/{tag}")
    release_assets = {asset["name"]: asset for asset in release.get("assets", [])}
    visual_library_name = "STARWARS_DELTA_DESIGNER_AI_VISUAL_LIBRARY_CURRENT.zip"
    if visual_library_name not in release_assets:
        raise SystemExit(f"Missing release asset: {visual_library_name}")

    if ROOT.exists():
        shutil.rmtree(ROOT)
    ROOT.mkdir(parents=True)

    with tempfile.TemporaryDirectory() as temp_raw:
        visual_zip = pathlib.Path(temp_raw) / visual_library_name
        download(release_assets[visual_library_name]["browser_download_url"], visual_zip)
        full_index = build_full_visual_sheets(visual_zip, transaction_id)

    (ROOT / "SOURCE_CURRENT.json").write_text(json.dumps(current, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    open_manifest = {
        "schema": "STARWARS_DELTA_DESIGNER_AI_OPEN_CURRENT",
        "schemaVersion": 6,
        "status": "CURRENT_VERIFIED_OPEN",
        "publishTransactionId": transaction_id,
        "publishedUtc": current.get("publishedUtc"),
        "releaseUrl": current.get("releaseUrl"),
        "contractRevision": current.get("contractRevision"),
        "schemaHash": current.get("schemaHash"),
        "sourceCurrentPath": "SOURCE_CURRENT.json",
        "fullVisualIndexPath": "FULL_VISUAL_INDEX.json",
        "fullVisualIndexUrl": f"{PAGES_BASE}/FULL_VISUAL_INDEX.json",
        "assetVisualLookupUrl": f"{PAGES_BASE}/ASSET_VISUAL_LOOKUP.json",
        "fullVisualSheetsRoot": f"{PAGES_BASE}/full-visual-sheets/",
        "usage": {
            "rule": "The visual index is evidence only. Build authoring choices from the full Director View, then inspect pageImageUrl pixels before visual claims.",
            "animation": "One representative image per animation family is intentional; do not require every frame.",
            "preferredVisualFormat": "Open pageImageUrl JPEG first. PDF is a secondary archive/fallback format.",
        },
    }
    (ROOT / "OPEN_CURRENT.json").write_text(json.dumps(open_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print("SOURCE_VISUAL_IDENTITIES", full_index["sourceVisualIdentityCount"])
    print("PUBLISHED_REPRESENTATIVES", full_index["representativeCount"])
    print("SHEET_COUNT", len(full_index["sheets"]))
    print("DIRECT_PAGE_IMAGES", sum(sheet["pages"] for sheet in full_index["sheets"]))


if __name__ == "__main__":
    main()
