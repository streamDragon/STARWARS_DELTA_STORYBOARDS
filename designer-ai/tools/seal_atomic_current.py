#!/usr/bin/env python3
import json
import os
import pathlib
import tempfile
import zipfile

ROOT = pathlib.Path("_open_current_stage")
CURRENT_PATH = pathlib.Path("designer-ai/current.json")
PACK_NAME = "STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path, payload, compact=False):
    text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False) if compact else json.dumps(payload, indent=2, ensure_ascii=False)
    path.write_text(text + "\n", encoding="utf-8")


def replace_pack_entries(pack_path, changed_paths):
    changed = {
        str(path.relative_to(ROOT)).replace(os.sep, "/"): path
        for path in changed_paths
        if path.is_file()
    }
    with zipfile.ZipFile(pack_path, "r") as source:
        infos = source.infolist()
        old_bytes = {
            info.filename: source.read(info.filename)
            for info in infos
            if info.filename not in changed
        }

    fd, temp_raw = tempfile.mkstemp(prefix="director-current-", suffix=".zip", dir=str(pack_path.parent))
    os.close(fd)
    temp_path = pathlib.Path(temp_raw)
    try:
        with zipfile.ZipFile(temp_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=7) as target:
            written = set()
            for info in infos:
                name = info.filename
                if name in written:
                    continue
                written.add(name)
                if name in changed:
                    target.write(changed[name], name)
                else:
                    target.writestr(info, old_bytes[name])
            for name, path in sorted(changed.items()):
                if name not in written:
                    target.write(path, name)
        os.replace(temp_path, pack_path)
    finally:
        if temp_path.exists():
            temp_path.unlink()


def seal_chatgpt_start(path, revision):
    text = path.read_text(encoding="utf-8-sig")
    marker = "STARWARS_DELTA DESIGNER AI - FULL DIRECTOR CURRENT\n"
    revision_line = f"CURRENT AUTHORING RULE REGISTRY REVISION: {revision}\n"
    if revision_line not in text:
        if marker not in text:
            raise SystemExit("CHATGPT_START title marker is missing")
        text = text.replace(marker, marker + revision_line, 1)

    old_identity_block = """============================================================
CURRENT PACKAGE IDENTITY - ATOMIC
============================================================

Before any new JSON, dynamically read OPEN_CURRENT.json and treat all exported identity fields as one atomic CURRENT package:
- publishTransactionId when applicable
- catalogRevision
- snapshotContentHash
- contractRevision
- schemaHash
- schema/context identity exported by the contract

Never hardcode an old publish transaction into permanent guidance. Never assume schemaVersion=5 means CURRENT. Never combine IDs from two publishes even if a filename or catalogRevision looks familiar.
"""
    new_identity_block = """============================================================
CURRENT AUTHORING COMPATIBILITY - REQUIRED CURRENT
============================================================

Before any NEW, REVISE or REPAIR JSON, dynamically read OPEN_CURRENT.json and compare OPEN_CURRENT.requiredCurrent:
- catalogRevision
- contractRevision
- schemaHash
- snapshotContentHash
- authoringRuleRegistryRevision

All five compatibility fingerprints must match. publishTransactionId belongs to OPEN_CURRENT.provenance and is not part of the normal Studio authoring-compatibility gate. A republish of identical authoring content may have a different publishTransactionId without creating a different authoring universe.

Never hardcode an old publish transaction into permanent guidance. Never assume schemaVersion=5 means CURRENT. Never combine Catalog, Contract, Schema, snapshot or Rule Registry data from different requiredCurrent identities.
"""
    if old_identity_block in text:
        text = text.replace(old_identity_block, new_identity_block, 1)
    elif new_identity_block not in text:
        raise SystemExit("CHATGPT_START CURRENT identity block marker is missing")

    compatibility_guard = (
        "For Studio NEW/REVISE/REPAIR compatibility, compare OPEN_CURRENT.requiredCurrent only: "
        "catalogRevision, contractRevision, schemaHash, snapshotContentHash and authoringRuleRegistryRevision. "
        "publishTransactionId is publication provenance and must not invalidate an otherwise identical authoring CURRENT."
    )
    if compatibility_guard not in text:
        needle = "Never hardcode an old publish transaction into permanent guidance."
        if needle not in text:
            raise SystemExit("CHATGPT_START compatibility guard marker is missing")
        text = text.replace(needle, compatibility_guard + "\n\n" + needle, 1)

    registry_guard = (
        "The authoring Rule Registry revision must match OPEN_CURRENT.requiredCurrent.authoringRuleRegistryRevision. "
        "If it does not match, stop instead of mixing rules from another authoring CURRENT."
    )
    old_guard = (
        "The authoring Rule Registry revision is part of the atomic CURRENT identity. "
        "If it does not match OPEN_CURRENT.atomicIdentity.authoringRuleRegistryRevision, stop instead of mixing rules from another publish."
    )
    if old_guard in text:
        text = text.replace(old_guard, registry_guard, 1)
    elif registry_guard not in text:
        needle = compatibility_guard
        text = text.replace(needle, registry_guard + "\n\n" + needle, 1)

    path.write_text(text, encoding="utf-8")


def main():
    current = read_json(CURRENT_PATH)
    registry_revision = str(current.get("authoringRuleRegistryRevision") or "").strip()
    registry = current.get("authoringRuleRegistry") or {}
    if not registry_revision:
        raise SystemExit("CURRENT is missing authoringRuleRegistryRevision")
    if str(registry.get("revision") or "").strip() != registry_revision:
        raise SystemExit("CURRENT authoringRuleRegistryRevision does not match authoringRuleRegistry.revision")

    open_path = ROOT / "OPEN_CURRENT.json"
    director_path = ROOT / "director-view" / "DIRECTOR_VIEW.json"
    manifest_path = ROOT / "DIRECTOR_PACK_MANIFEST.json"
    chatgpt_start_path = ROOT / "CHATGPT_START.txt"
    read_first_path = ROOT / "CHATGPT_READ_FIRST.txt"
    pack_path = ROOT / PACK_NAME

    required = [open_path, director_path, manifest_path, chatgpt_start_path, read_first_path, pack_path]
    missing = [str(path) for path in required if not path.is_file()]
    if missing:
        raise SystemExit("Atomic CURRENT stage is incomplete: " + ", ".join(missing))

    open_manifest = read_json(open_path)
    director = read_json(director_path)
    pack_manifest = read_json(manifest_path)

    if director.get("publishTransactionId") != current.get("publishTransactionId"):
        raise SystemExit("Director publishTransactionId does not match CURRENT")
    if director.get("contractRevision") != current.get("contractRevision"):
        raise SystemExit("Director contractRevision does not match CURRENT")
    if director.get("schemaHash") != current.get("schemaHash"):
        raise SystemExit("Director schemaHash does not match CURRENT")

    required_current = {
        "catalogRevision": director.get("catalogRevision"),
        "contractRevision": current.get("contractRevision"),
        "schemaHash": current.get("schemaHash"),
        "snapshotContentHash": director.get("snapshotContentHash"),
        "authoringRuleRegistryRevision": registry_revision,
    }
    provenance = {
        "publishTransactionId": current.get("publishTransactionId"),
        "publishedUtc": current.get("publishedUtc"),
        "publisherVersion": current.get("publisherVersion"),
    }
    bundle = current.get("bundle") or {}
    if bundle.get("sha256"):
        provenance["bundleIdentity"] = bundle.get("sha256")

    # Publication integrity remains strict: every generated artifact in one publish must
    # come from the same transaction. This is intentionally separate from Studio authoring
    # compatibility, which is defined only by required_current above.
    expected_identity = {
        "publishTransactionId": provenance["publishTransactionId"],
        **required_current,
    }
    if not provenance["publishTransactionId"] or required_current["catalogRevision"] is None or not required_current["snapshotContentHash"]:
        raise SystemExit("CURRENT identity is incomplete")
    if any(value in (None, "") for value in required_current.values()):
        raise SystemExit("requiredCurrent compatibility identity is incomplete")

    changed = []

    director["authoringRuleRegistryRevision"] = registry_revision
    director["requiredCurrent"] = required_current
    director["provenance"] = provenance
    director["atomicIdentity"] = expected_identity
    write_json(director_path, director)
    changed.append(director_path)

    open_manifest["authoringRuleRegistryRevision"] = registry_revision
    open_manifest["requiredCurrent"] = required_current
    open_manifest["provenance"] = provenance
    open_manifest["atomicIdentity"] = expected_identity
    usage = open_manifest.setdefault("usage", {})
    usage["currentCompatibility"] = (
        "Studio NEW/REVISE/REPAIR envelopes match only requiredCurrent: catalogRevision, contractRevision, schemaHash, "
        "snapshotContentHash and authoringRuleRegistryRevision. publishTransactionId is provenance only."
    )
    usage["atomicIdentity"] = (
        "atomicIdentity is strict publication-integrity metadata for one generated CURRENT transaction. "
        "Do not use publishTransactionId as the normal Studio authoring-compatibility gate; use requiredCurrent."
    )
    write_json(open_path, open_manifest)
    changed.append(open_path)

    pack_manifest["authoringRuleRegistryRevision"] = registry_revision
    pack_manifest["requiredCurrent"] = required_current
    pack_manifest["provenance"] = provenance
    pack_manifest["atomicIdentity"] = expected_identity
    write_json(manifest_path, pack_manifest)
    changed.append(manifest_path)

    for path in sorted((ROOT / "director-view").glob("*.json")):
        if path in (director_path,):
            continue
        payload = read_json(path)
        payload["authoringRuleRegistryRevision"] = registry_revision
        payload["requiredCurrent"] = required_current
        payload["provenance"] = provenance
        payload["atomicIdentity"] = expected_identity
        compact = path.name == "asset-lookup.json"
        write_json(path, payload, compact=compact)
        changed.append(path)

    seal_chatgpt_start(chatgpt_start_path, registry_revision)
    changed.append(chatgpt_start_path)

    read_first = read_first_path.read_text(encoding="utf-8-sig")
    revision_line = f"Atomic Rule Registry revision: {registry_revision}\n"
    if revision_line not in read_first:
        tx_line = f"Atomic publish transaction: {expected_identity['publishTransactionId']}\n"
        if tx_line in read_first:
            read_first = read_first.replace(tx_line, tx_line + revision_line, 1)
        else:
            read_first = revision_line + read_first
    compatibility_line = (
        "Authoring compatibility: compare requiredCurrent only; publishTransactionId is provenance.\n"
    )
    if compatibility_line not in read_first:
        read_first += "\n" + compatibility_line
    read_first_path.write_text(read_first, encoding="utf-8")
    changed.append(read_first_path)

    # The unified Visual Atlas is the only published PDF. Category PDFs and the
    # old per-category visual-index directory are build intermediates only.
    forbidden_pdfs = [ROOT / "full-visual-sheets" / f"{name}.pdf" for name in ("actor", "effect", "layer", "ui")]
    leaked = [str(path) for path in forbidden_pdfs if path.exists()]
    if (ROOT / "full-visual-index").exists():
        leaked.append(str(ROOT / "full-visual-index"))
    if leaked:
        raise SystemExit("Redundant visual publication artifacts leaked into CURRENT: " + ", ".join(leaked))

    replace_pack_entries(pack_path, changed)

    with zipfile.ZipFile(pack_path, "r") as archive:
        names = set(archive.namelist())
        forbidden = {
            "full-visual-sheets/actor.pdf",
            "full-visual-sheets/effect.pdf",
            "full-visual-sheets/layer.pdf",
            "full-visual-sheets/ui.pdf",
            "full-visual-index/actor.json",
            "full-visual-index/effect.json",
            "full-visual-index/layer.json",
            "full-visual-index/ui.json",
        }
        present = sorted(forbidden & names)
        if present:
            raise SystemExit("Director pack contains redundant visual artifacts: " + ", ".join(present))
        zip_open = json.loads(archive.read("OPEN_CURRENT.json").decode("utf-8-sig"))
        zip_director = json.loads(archive.read("director-view/DIRECTOR_VIEW.json").decode("utf-8-sig"))
        zip_manifest = json.loads(archive.read("DIRECTOR_PACK_MANIFEST.json").decode("utf-8-sig"))
        for label, payload in (("OPEN_CURRENT", zip_open), ("DIRECTOR_VIEW", zip_director), ("DIRECTOR_PACK_MANIFEST", zip_manifest)):
            if payload.get("atomicIdentity") != expected_identity:
                raise SystemExit(f"{label} in Director pack has stale atomic identity")
            if payload.get("requiredCurrent") != required_current:
                raise SystemExit(f"{label} in Director pack has stale requiredCurrent")
            if payload.get("provenance", {}).get("publishTransactionId") != provenance["publishTransactionId"]:
                raise SystemExit(f"{label} in Director pack has stale publication provenance")

    print("ATOMIC_CURRENT_SEALED")
    print("AUTHORING_RULE_REGISTRY_REVISION", registry_revision)
    print("REQUIRED_CURRENT", json.dumps(required_current, sort_keys=True))
    print("PUBLICATION_PROVENANCE", json.dumps(provenance, sort_keys=True))
    print("ATOMIC_IDENTITY", json.dumps(expected_identity, sort_keys=True))
    print("DIRECTOR_PACK_BYTES", pack_path.stat().st_size)


if __name__ == "__main__":
    main()
