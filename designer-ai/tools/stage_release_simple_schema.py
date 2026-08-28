#!/usr/bin/env python3
"""Stage the canonical Simple V1 schema from the already-published CURRENT release.

The Unity publisher owns the Simple authoring contract. GitHub must not silently
replace that contract with an older repo-static mirror while projecting
open-current. This helper searches the release artifacts belonging to
`designer-ai/current.json`, including nested ZIPs, and copies the exact released
schema bytes into the builder mirror before the FULL projection runs.

Fail closed: if the matching release does not contain exactly one canonical
schema payload (allowing byte-identical duplicates), nothing is overwritten.
"""

import hashlib
import io
import json
import os
import pathlib
import urllib.parse
import urllib.request
import zipfile

CURRENT_PATH = pathlib.Path("designer-ai/current.json")
TARGET_PATH = pathlib.Path(
    "designer-ai/tools/current-source/simple-authoring/CUTSCENE_SCRIPT_V1.schema.json"
)
TARGET_BASENAME = "CUTSCENE_SCRIPT_V1.schema.json"
TARGET_ID = "STARWARS_DELTA_CUTSCENE_SCRIPT_V1"
MAX_DOWNLOAD_BYTES = 80 * 1024 * 1024
MAX_NESTED_ENTRY_BYTES = 40 * 1024 * 1024
MAX_DEPTH = 4


def request_bytes(url, token, timeout=180):
    headers = {
        "Accept": "application/octet-stream",
        "User-Agent": "STARWARS-DELTA-release-authoring-source",
    }
    if token:
        headers["Authorization"] = "Bearer " + token
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        length = response.headers.get("Content-Length")
        if length and int(length) > MAX_DOWNLOAD_BYTES:
            raise RuntimeError(f"RELEASE_SOURCE_ASSET_TOO_LARGE: {url} bytes={length}")
        data = response.read(MAX_DOWNLOAD_BYTES + 1)
    if len(data) > MAX_DOWNLOAD_BYTES:
        raise RuntimeError(f"RELEASE_SOURCE_ASSET_TOO_LARGE: {url} bytes>{MAX_DOWNLOAD_BYTES}")
    return data


def request_json(url, token):
    raw = request_bytes(url, token)
    return json.loads(raw.decode("utf-8-sig"))


def validate_schema(raw, label):
    try:
        text = raw.decode("utf-8-sig")
        payload = json.loads(text)
    except Exception:
        return None, "not-json"

    if not isinstance(payload, dict) or payload.get("$id") != TARGET_ID:
        return None, "wrong-schema-id"

    visible = (
        payload.get("$defs", {})
        .get("visibleElement", {})
        .get("properties", {})
    )
    if not isinstance(visible, dict):
        return None, "visibleElement-properties-missing"
    if "startOffsetSeconds" not in visible:
        return None, "visibleElement.startOffsetSeconds-missing"
    if "durationSeconds" not in visible:
        return None, "visibleElement.durationSeconds-missing"

    start = visible.get("startOffsetSeconds") or {}
    duration = visible.get("durationSeconds") or {}
    if start.get("type") != "number" or start.get("minimum") != 0:
        return None, "visibleElement.startOffsetSeconds-constraint-invalid"
    if duration.get("type") != "number" or duration.get("exclusiveMinimum") != 0:
        return None, "visibleElement.durationSeconds-constraint-invalid"

    digest = hashlib.sha256(raw).hexdigest()
    return {
        "label": label,
        "raw": raw,
        "sha256": digest,
    }, None


def scan_blob(label, raw, depth, valid, rejected, seen_archives):
    candidate, reason = validate_schema(raw, label)
    if candidate:
        valid.append(candidate)
    elif label.rsplit("/", 1)[-1].lower() == TARGET_BASENAME.lower():
        rejected.append((label, reason))

    if depth >= MAX_DEPTH:
        return

    stream = io.BytesIO(raw)
    if not zipfile.is_zipfile(stream):
        return

    archive_digest = hashlib.sha256(raw).hexdigest()
    if archive_digest in seen_archives:
        return
    seen_archives.add(archive_digest)

    stream.seek(0)
    with zipfile.ZipFile(stream) as archive:
        for info in archive.infolist():
            if info.is_dir() or info.file_size > MAX_NESTED_ENTRY_BYTES:
                continue
            name = info.filename.replace("\\", "/")
            lower = name.lower()
            interesting = (
                lower.endswith(".zip")
                or lower.endswith(".json")
                or lower.endswith(".schema")
                or lower.endswith(".txt")
                or lower.endswith(".md")
            )
            if not interesting:
                continue
            try:
                nested = archive.read(info)
            except Exception as exc:
                print(f"RELEASE_SOURCE_ENTRY_SKIP label={label}!{name} error={exc}")
                continue
            scan_blob(f"{label}!{name}", nested, depth + 1, valid, rejected, seen_archives)


def candidate_asset_rank(name, transaction_id):
    lower = name.lower()
    exact_order = [
        "CURRENT_CANONICAL_PACKAGE_TEMPLATE.json",
        "CURRENT_AUTHORING_PROFILE.json",
        "CURRENT_V3_SEMANTIC_AUTHORING_PROFILE.json",
        "STARWARS_DELTA_CUTSCENE_INSTRUCTION_BOOK_CURRENT.zip",
        "STARWARS_DELTA_CHATGPT_AUTHORING_PACKAGE_CURRENT.zip",
        "STARWARS_DELTA_CHATGPT_CATALOG_CURRENT.zip",
        f"STARWARS_DELTA_DESIGNER_AI_BUNDLE_{transaction_id}.zip",
    ]
    for index, exact in enumerate(exact_order):
        if name == exact:
            return index
    if "schema" in lower:
        return 20
    if "authoring" in lower or "instruction" in lower:
        return 30
    if "designer_ai_bundle" in lower:
        return 40
    return None


def main():
    token = os.environ.get("GITHUB_TOKEN", "")
    repository = os.environ.get("GITHUB_REPOSITORY", "").strip()
    if not repository:
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_REPOSITORY_MISSING")

    current = json.loads(CURRENT_PATH.read_text(encoding="utf-8-sig"))
    if current.get("status") != "CURRENT_VERIFIED":
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_CURRENT_NOT_VERIFIED")
    if str(current.get("publishMode") or "FULL").upper() != "FULL":
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_REQUIRES_FULL_CURRENT")

    transaction_id = str(current.get("publishTransactionId") or "").strip()
    release_url = str(current.get("releaseUrl") or "").strip()
    if not transaction_id or "/releases/tag/" not in release_url:
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_CURRENT_IDENTITY_INCOMPLETE")

    tag = release_url.rsplit("/releases/tag/", 1)[1]
    api = (
        "https://api.github.com/repos/"
        + repository
        + "/releases/tags/"
        + urllib.parse.quote(tag, safe="")
    )
    release = request_json(api, token)
    if release.get("draft") is True:
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_RELEASE_IS_DRAFT")
    if str(release.get("tag_name") or "") != tag:
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_TAG_MISMATCH")

    ranked = []
    for asset in release.get("assets") or []:
        name = str(asset.get("name") or "")
        rank = candidate_asset_rank(name, transaction_id)
        if rank is None:
            continue
        ranked.append((rank, name, asset))
    ranked.sort(key=lambda item: (item[0], item[1]))
    if not ranked:
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_NO_CANDIDATE_ASSETS")

    valid = []
    rejected = []
    seen_archives = set()
    scanned_assets = []

    for _, name, asset in ranked:
        url = str(asset.get("browser_download_url") or "")
        if not url:
            continue
        size = int(asset.get("size") or 0)
        if size > MAX_DOWNLOAD_BYTES:
            print(f"RELEASE_SOURCE_ASSET_SKIP name={name} bytes={size} reason=too-large")
            continue
        print(f"RELEASE_SOURCE_ASSET_SCAN name={name} bytes={size}")
        try:
            raw = request_bytes(url, token, timeout=300)
        except Exception as exc:
            print(f"RELEASE_SOURCE_ASSET_ERROR name={name} error={exc}")
            continue
        scanned_assets.append(name)
        scan_blob(name, raw, 0, valid, rejected, seen_archives)

    by_digest = {}
    for candidate in valid:
        by_digest.setdefault(candidate["sha256"], candidate)

    if not by_digest:
        for label, reason in rejected:
            print(f"RELEASE_SIMPLE_SCHEMA_REJECTED source={label} reason={reason}")
        raise SystemExit(
            "RELEASE_SIMPLE_SCHEMA_NOT_FOUND: canonical timed Simple V1 schema absent from "
            + ", ".join(scanned_assets)
        )
    if len(by_digest) != 1:
        detail = ", ".join(
            f"{digest}:{candidate['label']}" for digest, candidate in sorted(by_digest.items())
        )
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_AMBIGUOUS: " + detail)

    selected = next(iter(by_digest.values()))
    TARGET_PATH.parent.mkdir(parents=True, exist_ok=True)
    TARGET_PATH.write_bytes(selected["raw"])

    print(
        "RELEASE_SIMPLE_SCHEMA_STAGED"
        f" transaction={transaction_id}"
        f" source={selected['label']}"
        f" sha256={selected['sha256']}"
        f" bytes={len(selected['raw'])}"
    )


if __name__ == "__main__":
    main()
