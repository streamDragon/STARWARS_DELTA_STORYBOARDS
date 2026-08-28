#!/usr/bin/env python3
"""Verify the canonical Simple V1 schema before a FULL publication.

Publication is intentionally read-only with respect to engineering source.
The canonical repository schema must already be correct before publishing.
If the matching Unity release exposes an exact Simple V1 schema, it must match
the canonical repository source byte-for-byte. Older releases that do not carry
that asset are accepted only when CURRENT contains the verified Effect timing
rule and the canonical source already implements the required schema contract.
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
CANONICAL_SCHEMA_PATH = pathlib.Path("designer-ai/tools/current-source/simple-authoring/CUTSCENE_SCRIPT_V1.schema.json")
TARGET_ID = "STARWARS_DELTA_CUTSCENE_SCRIPT_V1"
EFFECT_RULE_ID = "EFFECT_VISIBLE_SUBBEAT_TIMING"
MAX_DOWNLOAD_BYTES = 80 * 1024 * 1024
MAX_ENTRY_BYTES = 40 * 1024 * 1024
MAX_DEPTH = 4


def request_bytes(url, token, accept="application/octet-stream", timeout=180):
    headers = {
        "Accept": accept,
        "User-Agent": "STARWARS-DELTA-release-authoring-source",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as response:
        raw = response.read(MAX_DOWNLOAD_BYTES + 1)
    if len(raw) > MAX_DOWNLOAD_BYTES:
        raise RuntimeError("release asset exceeds scan limit")
    return raw


def request_json(url, token):
    return json.loads(request_bytes(url, token, "application/vnd.github+json").decode("utf-8-sig"))


def validate_schema(raw, label):
    try:
        payload = json.loads(raw.decode("utf-8-sig"))
    except Exception:
        return None
    if not isinstance(payload, dict) or payload.get("$id") != TARGET_ID:
        return None
    visible = (((payload.get("$defs") or {}).get("visibleElement") or {}).get("properties") or {})
    start = visible.get("startOffsetSeconds") or {}
    duration = visible.get("durationSeconds") or {}
    if start.get("type") != "number" or start.get("minimum") != 0:
        return None
    if duration.get("type") != "number" or duration.get("exclusiveMinimum") != 0:
        return None
    return {
        "raw": raw,
        "label": label,
        "sha256": hashlib.sha256(raw).hexdigest(),
    }


def scan_blob(label, raw, depth, found, seen):
    candidate = validate_schema(raw, label)
    if candidate:
        found.setdefault(candidate["sha256"], candidate)
    if depth >= MAX_DEPTH:
        return
    stream = io.BytesIO(raw)
    if not zipfile.is_zipfile(stream):
        return
    digest = hashlib.sha256(raw).hexdigest()
    if digest in seen:
        return
    seen.add(digest)
    stream.seek(0)
    with zipfile.ZipFile(stream) as archive:
        for info in archive.infolist():
            if info.is_dir() or info.file_size > MAX_ENTRY_BYTES:
                continue
            name = info.filename.replace("\\", "/")
            lower = name.lower()
            if not lower.endswith((".zip", ".json", ".schema", ".txt", ".md")):
                continue
            try:
                nested = archive.read(info)
            except Exception:
                continue
            scan_blob(label + "!" + name, nested, depth + 1, found, seen)


def asset_rank(name, transaction_id):
    preferred = [
        "CURRENT_CANONICAL_PACKAGE_TEMPLATE.json",
        "CURRENT_AUTHORING_PROFILE.json",
        "CURRENT_V3_SEMANTIC_AUTHORING_PROFILE.json",
        "STARWARS_DELTA_CUTSCENE_INSTRUCTION_BOOK_CURRENT.zip",
        "STARWARS_DELTA_CHATGPT_AUTHORING_PACKAGE_CURRENT.zip",
        "STARWARS_DELTA_CHATGPT_CATALOG_CURRENT.zip",
        f"STARWARS_DELTA_DESIGNER_AI_BUNDLE_{transaction_id}.zip",
    ]
    if name in preferred:
        return preferred.index(name)
    lower = name.lower()
    if "schema" in lower:
        return 20
    if "authoring" in lower or "instruction" in lower:
        return 30
    if "designer_ai_bundle" in lower:
        return 40
    return None


def verified_effect_rule(current):
    rules = ((current.get("authoringRuleRegistry") or {}).get("rules") or [])
    rule = next((r for r in rules if str(r.get("ruleId") or "") == EFFECT_RULE_ID), None)
    if not isinstance(rule, dict):
        return None
    default_policy = str(rule.get("defaultPolicy") or "")
    validation_policy = str(rule.get("validationPolicy") or "")
    auto_repair_policy = str(rule.get("autoRepairPolicy") or "")
    chat_instruction = str(rule.get("chatInstruction") or "")
    combined = "\n".join((default_policy, validation_policy, auto_repair_policy, chat_instruction))
    if "startOffsetSeconds" not in combined or "durationSeconds" not in combined:
        return None
    if "Overlap is legal" not in validation_policy:
        return None
    if "do not deduplicate repeated Effect handles" not in auto_repair_policy:
        return None
    if rule.get("owner") != "BACKEND" or rule.get("blocksCompilation") is not False:
        return None
    return rule


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

    if not CANONICAL_SCHEMA_PATH.is_file():
        raise SystemExit("CANONICAL_SIMPLE_SCHEMA_MISSING")
    canonical_raw = CANONICAL_SCHEMA_PATH.read_bytes()
    canonical = validate_schema(canonical_raw, "canonical-repo-source")
    if canonical is None:
        raise SystemExit("CANONICAL_SIMPLE_SCHEMA_INVALID")

    transaction_id = str(current.get("publishTransactionId") or "").strip()
    release_url = str(current.get("releaseUrl") or "").strip()
    if not transaction_id or "/releases/tag/" not in release_url:
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_CURRENT_IDENTITY_INCOMPLETE")
    tag = release_url.rsplit("/releases/tag/", 1)[1]
    api = "https://api.github.com/repos/" + repository + "/releases/tags/" + urllib.parse.quote(tag, safe="")
    release = request_json(api, token)
    if release.get("draft") is True or str(release.get("tag_name") or "") != tag:
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_RELEASE_INVALID")

    assets = []
    for asset in release.get("assets") or []:
        name = str(asset.get("name") or "")
        rank = asset_rank(name, transaction_id)
        if rank is not None:
            assets.append((rank, name, asset))
    assets.sort(key=lambda item: (item[0], item[1]))

    found = {}
    seen = set()
    for _, name, asset in assets:
        size = int(asset.get("size") or 0)
        if size > MAX_DOWNLOAD_BYTES:
            print(f"RELEASE_SOURCE_ASSET_SKIP name={name} bytes={size} reason=too-large")
            continue
        url = str(asset.get("browser_download_url") or "")
        if not url:
            continue
        print(f"RELEASE_SOURCE_ASSET_SCAN name={name} bytes={size}")
        try:
            raw = request_bytes(url, token, timeout=300)
        except Exception as exc:
            print(f"RELEASE_SOURCE_ASSET_ERROR name={name} error={exc}")
            continue
        scan_blob(name, raw, 0, found, seen)

    if len(found) > 1:
        raise SystemExit("RELEASE_SIMPLE_SCHEMA_AMBIGUOUS: " + ", ".join(sorted(found)))

    if found:
        released = next(iter(found.values()))
        if released["raw"] != canonical_raw:
            raise SystemExit(
                "RELEASE_SIMPLE_SCHEMA_SOURCE_DRIFT: "
                f"release={released['sha256']} canonical={canonical['sha256']}"
            )
        mode = "EXACT_RELEASE_MATCH"
    else:
        if verified_effect_rule(current) is None:
            raise SystemExit("RELEASE_SIMPLE_SCHEMA_NOT_FOUND_AND_VERIFIED_RULE_ABSENT")
        mode = "VERIFIED_CURRENT_RULE_WITH_CANONICAL_SOURCE"

    print(
        "CANONICAL_SIMPLE_SCHEMA_READ_ONLY_PASS"
        f" transaction={transaction_id} mode={mode}"
        f" sha256={canonical['sha256']} bytes={len(canonical_raw)}"
    )
    print("PUBLISH_SOURCE_MUTATION=NO")


if __name__ == "__main__":
    main()
