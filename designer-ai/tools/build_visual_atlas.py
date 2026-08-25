#!/usr/bin/env python3
import json
import pathlib
import shutil

from pypdf import PdfReader, PdfWriter

ROOT = pathlib.Path("_open_current_stage")
PAGES_BASE = "https://streamDragon.github.io/STARWARS_DELTA_STORYBOARDS/designer-ai/open-current"
ATLAS_NAME = "STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_CURRENT.pdf"
ATLAS_RELATIVE = f"full-visual-sheets/{ATLAS_NAME}"
ATLAS_MANIFEST_RELATIVE = "full-visual-sheets/VISUAL_ATLAS_CURRENT.json"
ATLAS_URL = f"{PAGES_BASE}/{ATLAS_RELATIVE}"
ATLAS_MANIFEST_URL = f"{PAGES_BASE}/{ATLAS_MANIFEST_RELATIVE}"

# The unified Atlas remains the human/manual master. These smaller stable PDFs are
# the preferred direct multimodal transport for ChatGPT/Devora. The old pipeline
# already produced category PDFs as intermediates, then deleted them. Keep a
# deterministic published copy instead so model access does not depend on loading
# one ~13 MB PDF in a single request.
ATLAS_PART_NAMES = {
    "Actor": "STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_ACTOR_CURRENT.pdf",
    "Effect": "STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_EFFECT_CURRENT.pdf",
    "Layer": "STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_LAYER_CURRENT.pdf",
    "Ui": "STARWARS_DELTA_CHATGPT_VISUAL_ATLAS_UI_CURRENT.pdf",
}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def part_relative(category):
    name = ATLAS_PART_NAMES.get(category)
    if not name:
        raise SystemExit(f"Visual Atlas has no stable AI-direct PDF name for category: {category}")
    return f"full-visual-sheets/{name}"


def augment_visual_entry(entry, offsets, parts_by_category):
    category = str(entry.get("category") or "")
    page = entry.get("page")
    slot = entry.get("slot")
    if category not in offsets or not isinstance(page, int) or page < 1:
        return False

    part = parts_by_category.get(category)
    if not part:
        raise SystemExit(f"Visual Atlas AI-direct PDF part missing for category: {category}")

    # Stable master coordinates remain globally unique across the unified Atlas.
    entry["atlasPdfFile"] = ATLAS_RELATIVE
    entry["atlasPdfUrl"] = ATLAS_URL
    entry["atlasPage"] = offsets[category] + page
    entry["atlasSlot"] = slot

    # Preferred direct model transport. atlasPartPage is category-local, so a
    # model can open one small PDF and inspect the exact page without downloading
    # or rendering the whole unified Atlas.
    entry["atlasPartPdfFile"] = part["pdfFile"]
    entry["atlasPartPdfUrl"] = part["pdfUrl"]
    entry["atlasPartPage"] = page
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
    source_pdf_paths = []
    parts_by_category = {}
    atlas_page_count = 0

    for sheet in sheets:
        category = str(sheet.get("category") or "")
        source_file = str(sheet.get("file") or "")
        if not category or not source_file:
            raise SystemExit("Visual sheet is missing category or file")
        if category not in ATLAS_PART_NAMES:
            raise SystemExit(f"Unexpected Visual Atlas category: {category}")

        source_path = ROOT / source_file
        if not source_path.is_file():
            raise SystemExit(f"Visual sheet PDF is missing: {source_file}")
        source_pdf_paths.append(source_path)

        reader = PdfReader(str(source_path))
        page_count = len(reader.pages)
        expected_pages = int(sheet.get("pages") or 0)
        if expected_pages and page_count != expected_pages:
            raise SystemExit(
                f"Visual sheet page count mismatch for {category}: expected {expected_pages}, got {page_count}"
            )

        # Preserve a deterministic, small, public category PDF for direct AI
        # visual inspection before the build-only source PDF is stripped.
        part_rel = part_relative(category)
        part_path = ROOT / part_rel
        part_path.parent.mkdir(parents=True, exist_ok=True)
        if source_path.resolve() != part_path.resolve():
            shutil.copy2(source_path, part_path)
        if not part_path.is_file() or part_path.stat().st_size <= 0:
            raise SystemExit(f"AI-direct Visual Atlas PDF part was not created: {part_rel}")
        part_reader = PdfReader(str(part_path))
        if len(part_reader.pages) != page_count:
            raise SystemExit(
                f"AI-direct Visual Atlas PDF page mismatch for {category}: expected {page_count}, got {len(part_reader.pages)}"
            )

        part_info = {
            "category": category,
            "pdfFile": part_rel,
            "pdfFileName": ATLAS_PART_NAMES[category],
            "pdfUrl": f"{PAGES_BASE}/{part_rel}",
            "totalPages": page_count,
            "fileSizeBytes": part_path.stat().st_size,
            "preferredForAiDirectAccess": True,
        }
        parts_by_category[category] = part_info

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
        sheet["atlasPartPdfFile"] = part_rel
        sheet["atlasPartPdfUrl"] = part_info["pdfUrl"]
        sheet["atlasPartStartPage"] = 1
        sheet["atlasPartEndPage"] = page_count
        sheet.pop("file", None)
        sheet.pop("url", None)
        ranges.append(
            {
                "category": category,
                "sourcePageCount": page_count,
                "atlasStartPage": start_page,
                "atlasEndPage": end_page,
                "pageImageRoot": sheet.get("pageImageRoot"),
                "aiDirectPdfFile": part_rel,
                "aiDirectPdfUrl": part_info["pdfUrl"],
                "aiDirectPdfStartPage": 1,
                "aiDirectPdfEndPage": page_count,
                "aiDirectPdfSizeBytes": part_info["fileSizeBytes"],
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
        if augment_visual_entry(entry, offsets, parts_by_category):
            augmented += 1
        # Legacy sheetFile/sheetUrl fields pointed at build intermediates. Stable
        # atlasPartPdf* fields above now own category-PDF access.
        entry.pop("sheetFile", None)
        entry.pop("sheetUrl", None)

    representative_count = int(full_index.get("representativeCount") or 0)
    if representative_count and augmented != representative_count:
        raise SystemExit(
            f"Visual atlas mapping incomplete: augmented {augmented} of {representative_count} representatives"
        )

    ai_direct_parts = [parts_by_category[c] for c in ATLAS_PART_NAMES if c in parts_by_category]
    if len(ai_direct_parts) != len(ATLAS_PART_NAMES):
        raise SystemExit(
            f"Visual Atlas AI-direct part coverage incomplete: expected {len(ATLAS_PART_NAMES)}, got {len(ai_direct_parts)}"
        )

    atlas_summary = {
        "schema": "STARWARS_DELTA_CHATGPT_VISUAL_ATLAS",
        "schemaVersion": 4,
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
        "aiDirectPdfParts": ai_direct_parts,
        "lookup": {
            "fullVisualIndexFile": "FULL_VISUAL_INDEX.json",
            "fullVisualIndexUrl": f"{PAGES_BASE}/FULL_VISUAL_INDEX.json",
            "assetLookupFile": full_index.get("assetLookupFile"),
            "assetLookupUrl": full_index.get("assetLookupUrl"),
        },
        "transportFallback": (
            "Preferred model transport is the category-specific AI-direct PDF in aiDirectPdfParts. "
            "The unified PDF remains the human/manual master. Per-page JPEG images remain a final transport/debug fallback."
        ),
        "usage": (
            "Use Director metadata to shortlist assets. For a direct visual handle, prefer atlasPartPdfUrl + atlasPartPage + atlasSlot "
            "to inspect the real pixels in a small category PDF. atlasPdfUrl + atlasPage remain the stable unified-master coordinates. "
            "If PDF transport is unavailable, use pageImageUrl. Do not make visual claims from metadata alone."
        ),
        "visualAccessFallback": {
            "rule": (
                "Do not ask the user to re-upload the unified Atlas merely because the full PDF is too large for one model request. "
                "First use the matching aiDirectPdfParts category PDF; if that transport also fails, use the published per-page JPEG. "
                "Only ask for a user upload when both public visual transports are genuinely unavailable."
            ),
            "preferredModelTransport": "AI_DIRECT_CATEGORY_PDF",
            "secondaryModelTransport": "PAGE_JPEG",
            "humanMasterFile": ATLAS_NAME,
            "doNotRequest": [
                "Catalog ZIP for ordinary visual access",
                "Instruction Book ZIP for ordinary visual access",
                "Full Visual Library archive for ordinary visual access",
                "Manual upload of the unified Atlas before trying the public AI-direct category PDF",
            ],
        },
    }

    full_index["schemaVersion"] = max(int(full_index.get("schemaVersion", 0)), 6)
    full_index["visualAtlas"] = atlas_summary
    # These JSON shards duplicate FULL_VISUAL_INDEX in the final CURRENT projection.
    full_index.pop("categoryIndexes", None)
    write_json(full_index_path, full_index)

    write_json(ROOT / ATLAS_MANIFEST_RELATIVE, atlas_summary)

    # Remove only build-intermediate category PDFs. Stable AI-direct category PDFs
    # are first-class published CURRENT artifacts and must survive.
    stable_part_paths = {str((ROOT / part["pdfFile"]).resolve()) for part in ai_direct_parts}
    intermediate_pdf_paths = []
    for source_path in source_pdf_paths:
        resolved = str(source_path.resolve())
        if resolved == str(atlas_path.resolve()) or resolved in stable_part_paths:
            continue
        intermediate_pdf_paths.append(source_path)
        if source_path.exists():
            source_path.unlink()

    category_index_root = ROOT / "full-visual-index"
    if category_index_root.exists():
        shutil.rmtree(category_index_root)

    open_current["schemaVersion"] = max(int(open_current.get("schemaVersion", 0)), 11)
    open_current["visualAtlas"] = atlas_summary
    usage = open_current.setdefault("usage", {})
    usage["rule"] = (
        "Author from the full Director View. For visual decisions, use the direct handle's atlasPartPdfUrl/atlasPartPage/atlasSlot "
        "when available and inspect the real pixels. The unified atlasPdfUrl/atlasPage remain stable master coordinates."
    )
    usage["preferredVisualFormat"] = (
        "AI/model: use the small category PDF from visualAtlas.aiDirectPdfParts or handle atlasPartPdfUrl. "
        "Human/manual: use the single unified CURRENT Visual Atlas PDF."
    )
    usage["visualAccessFallback"] = (
        "If the unified Atlas is too large for direct model rendering, do not guess and do not immediately ask the user to upload it. "
        "Use the matching public AI-direct category PDF first, then the per-page JPEG fallback. Ask for upload only if both fail."
    )
    usage["normalUserDownload"] = (
        "No visual upload is normally required. The public AI-direct category PDFs are the normal model transport. "
        "The unified Visual Atlas remains available for human inspection/download."
    )
    usage["publishedVisualArtifacts"] = (
        "One unified Visual Atlas PDF, four AI-direct category PDFs, FULL_VISUAL_INDEX/ASSET_VISUAL_LOOKUP, "
        "and per-page JPEG transport fallbacks. Build-only category source PDFs and category index shards are stripped."
    )
    write_json(open_current_path, open_current)

    for source_path in intermediate_pdf_paths:
        if source_path.exists():
            raise SystemExit(f"Build-only category PDF leaked into publish stage: {source_path}")
    if category_index_root.exists():
        raise SystemExit("Build-only category visual indexes leaked into publish stage")
    for part in ai_direct_parts:
        part_path = ROOT / part["pdfFile"]
        if not part_path.is_file() or part_path.stat().st_size <= 0:
            raise SystemExit(f"AI-direct Visual Atlas PDF part missing after cleanup: {part['pdfFile']}")

    print("VISUAL_ATLAS_FILE", ATLAS_RELATIVE)
    print("VISUAL_ATLAS_PAGES", atlas_page_count)
    print("VISUAL_ATLAS_REPRESENTATIVES", augmented)
    print("VISUAL_ATLAS_BYTES", atlas_bytes)
    for part in ai_direct_parts:
        print(
            "VISUAL_ATLAS_AI_DIRECT_PART",
            part["category"],
            part["pdfFile"],
            part["totalPages"],
            part["fileSizeBytes"],
        )
    print("VISUAL_BUILD_ONLY_ARTIFACTS_STRIPPED", len(intermediate_pdf_paths))


if __name__ == "__main__":
    main()
