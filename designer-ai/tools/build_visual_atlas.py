#!/usr/bin/env python3
import json
import pathlib

from pypdf import PdfReader, PdfWriter

ROOT = pathlib.Path("_open_current_stage")
PAGES_BASE = "https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current"
ATLAS_NAME = "STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_CURRENT.pdf"
ATLAS_RELATIVE = f"full-visual-sheets/{ATLAS_NAME}"
ATLAS_MANIFEST_RELATIVE = "full-visual-sheets/VISUAL_ATLAS_CURRENT.json"
ATLAS_URL = f"{PAGES_BASE}/{ATLAS_RELATIVE}"
ATLAS_MANIFEST_URL = f"{PAGES_BASE}/{ATLAS_MANIFEST_RELATIVE}"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def augment_visual_entry(entry, offsets):
    category = str(entry.get("category") or "")
    page = entry.get("page")
    slot = entry.get("slot")
    if category not in offsets or not isinstance(page, int) or page < 1:
        return False
    entry["atlasPdfFile"] = ATLAS_RELATIVE
    entry["atlasPdfUrl"] = ATLAS_URL
    entry["atlasPage"] = offsets[category] + page
    entry["atlasSlot"] = slot
    return True


def main():
    full_index_path = ROOT / "FULL_VISUAL_INDEX.json"
    open_current_path = ROOT / "OPEN_CURRENT.json"
    if not full_index_path.is_file() or not open_current_path.is_file():
        raise SystemExit("Open CURRENT stage is incomplete before visual atlas build")

    full_index = read_json(full_index_path)
    open_current = read_json(open_current_path)
    transaction_id = full_index.get("publishTransactionId")
    if not transaction_id or transaction_id != open_current.get("publishTransactionId"):
        raise SystemExit("Visual atlas atomic publishTransactionId mismatch")

    sheets = full_index.get("sheets", [])
    if not sheets:
        raise SystemExit("FULL_VISUAL_INDEX contains no visual sheets")

    writer = PdfWriter()
    offsets = {}
    ranges = []
    atlas_page_count = 0

    for sheet in sheets:
        category = str(sheet.get("category") or "")
        source_file = str(sheet.get("file") or "")
        if not category or not source_file:
            raise SystemExit("Visual sheet is missing category or file")
        source_path = ROOT / source_file
        if not source_path.is_file():
            raise SystemExit(f"Visual sheet PDF is missing: {source_file}")

        reader = PdfReader(str(source_path))
        page_count = len(reader.pages)
        expected_pages = int(sheet.get("pages") or 0)
        if expected_pages and page_count != expected_pages:
            raise SystemExit(
                f"Visual sheet page count mismatch for {category}: expected {expected_pages}, got {page_count}"
            )

        offsets[category] = atlas_page_count
        start_page = atlas_page_count + 1
        for page in reader.pages:
            writer.add_page(page)
        atlas_page_count += page_count
        end_page = atlas_page_count

        sheet["atlasPdfFile"] = ATLAS_RELATIVE
        sheet["atlasPdfUrl"] = ATLAS_URL
        sheet["atlasStartPage"] = start_page
        sheet["atlasEndPage"] = end_page
        ranges.append(
            {
                "category": category,
                "sourcePdfFile": source_file,
                "sourcePdfUrl": sheet.get("url"),
                "sourcePageCount": page_count,
                "atlasStartPage": start_page,
                "atlasEndPage": end_page,
            }
        )

    atlas_path = ROOT / ATLAS_RELATIVE
    atlas_path.parent.mkdir(parents=True, exist_ok=True)
    with atlas_path.open("wb") as stream:
        writer.write(stream)

    if not atlas_path.is_file() or atlas_path.stat().st_size <= 0:
        raise SystemExit("Visual atlas PDF was not created")
    atlas_bytes = atlas_path.stat().st_size

    augmented = 0
    for entry in full_index.get("assets", []):
        if augment_visual_entry(entry, offsets):
            augmented += 1

    representative_count = int(full_index.get("representativeCount") or 0)
    if representative_count and augmented != representative_count:
        raise SystemExit(
            f"Visual atlas mapping incomplete: augmented {augmented} of {representative_count} representatives"
        )

    atlas_summary = {
        "schema": "STARWARS_DELTA_CHATGPT_VISUAL_ATLAS",
        "schemaVersion": 2,
        "status": "CURRENT_VERIFIED_VISUAL_ATLAS",
        "publishTransactionId": transaction_id,
        "pdfFile": ATLAS_RELATIVE,
        "pdfFileName": ATLAS_NAME,
        "pdfUrl": ATLAS_URL,
        "manifestUrl": ATLAS_MANIFEST_URL,
        "fileSizeBytes": atlas_bytes,
        "totalPages": atlas_page_count,
        "representativeCount": augmented,
        "sourceVisualIdentityCount": full_index.get("sourceVisualIdentityCount"),
        "contains": [
            "Actor visual sheets: characters, robots, ships and other world actors",
            "Effect visual sheets: explosions, flashes, atmosphere and VFX",
            "Layer visual sheets: backgrounds, environments and scenery",
            "Ui visual sheets: portraits, dialogue frames, screens and interface visuals",
        ],
        "doesNotNeedPixelSheets": [
            "Animations use exact Director compatibility IDs with representative family visuals",
            "Audio is selected from Director metadata and is non-visual",
        ],
        "categoryRanges": ranges,
        "lookup": {
            "fullVisualIndexFile": "FULL_VISUAL_INDEX.json",
            "fullVisualIndexUrl": f"{PAGES_BASE}/FULL_VISUAL_INDEX.json",
            "assetLookupFile": full_index.get("assetLookupFile"),
            "assetLookupUrl": full_index.get("assetLookupUrl"),
        },
        "usage": (
            "Use Director metadata to shortlist assets, resolve the asset in FULL_VISUAL_INDEX.json, "
            "then inspect the real pixels in this PDF at atlasPage and atlasSlot before any visual claim, "
            "asset choice or storyboard."
        ),
        "visualAccessFallback": {
            "rule": (
                "If ChatGPT cannot actually render and inspect this PDF from the public URL, it must not guess from metadata. "
                "Ask the user to download this single PDF from the Debora page and upload it directly to the chat, then continue "
                "using the same CURRENT Director metadata and asset IDs."
            ),
            "userFileToUpload": ATLAS_NAME,
            "doNotRequest": [
                "Catalog ZIP for ordinary visual access",
                "Instruction Book ZIP for ordinary visual access",
                "Full Visual Library archive for ordinary visual access",
                "Multiple category PDFs when the unified Atlas PDF is available",
            ],
        },
    }

    full_index["schemaVersion"] = max(int(full_index.get("schemaVersion", 0)), 4)
    full_index["visualAtlas"] = atlas_summary
    write_json(full_index_path, full_index)

    for category_index in full_index.get("categoryIndexes", []):
        relative = category_index.get("file")
        if not relative:
            continue
        category_path = ROOT / relative
        if not category_path.is_file():
            raise SystemExit(f"Missing visual category index: {relative}")
        payload = read_json(category_path)
        category_augmented = 0
        for entry in payload.get("assets", []):
            if augment_visual_entry(entry, offsets):
                category_augmented += 1
        payload["schemaVersion"] = max(int(payload.get("schemaVersion", 0)), 3)
        payload["visualAtlas"] = {
            "pdfFile": ATLAS_RELATIVE,
            "pdfUrl": ATLAS_URL,
            "manifestUrl": ATLAS_MANIFEST_URL,
            "category": payload.get("category"),
            "categoryRange": next(
                (item for item in ranges if item["category"] == payload.get("category")), None
            ),
        }
        write_json(category_path, payload)
        category_index["atlasMappedCount"] = category_augmented

    write_json(ROOT / ATLAS_MANIFEST_RELATIVE, atlas_summary)

    open_current["schemaVersion"] = max(int(open_current.get("schemaVersion", 0)), 10)
    open_current["visualAtlas"] = atlas_summary
    usage = open_current.setdefault("usage", {})
    usage["rule"] = (
        "Author from the full Director View. For visual decisions, resolve the chosen asset in FULL_VISUAL_INDEX.json "
        "and inspect the actual pixels in STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_CURRENT.pdf at atlasPage/atlasSlot."
    )
    usage["preferredVisualFormat"] = (
        "Use the single CURRENT Visual Atlas PDF for pixel inspection. JPEG sheets remain transport/debug fallbacks only."
    )
    usage["visualAccessFallback"] = (
        "If ChatGPT cannot render the Atlas URL as pixels, do not guess. Ask the user to download and upload the single CURRENT "
        "Visual Atlas PDF from the Debora page. Continue with the same CURRENT Director after upload."
    )
    usage["normalUserDownload"] = (
        "No download is normally required. If ChatGPT asks for visual access, the only normal user download is the single CURRENT "
        "Visual Atlas PDF. The Director ZIP is advanced metadata fallback, not the normal visual-access download."
    )
    write_json(open_current_path, open_current)

    print("VISUAL_ATLAS_FILE", ATLAS_RELATIVE)
    print("VISUAL_ATLAS_PAGES", atlas_page_count)
    print("VISUAL_ATLAS_REPRESENTATIVES", augmented)
    print("VISUAL_ATLAS_BYTES", atlas_bytes)


if __name__ == "__main__":
    main()
