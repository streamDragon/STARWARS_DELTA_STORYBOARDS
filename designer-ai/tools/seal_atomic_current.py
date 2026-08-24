#!/usr/bin/env python3
import json
import os
import pathlib
import shutil
import tempfile
import zipfile

ROOT = pathlib.Path("_open_current_stage")
CURRENT_PATH = pathlib.Path("designer-ai/current.json")
SOURCE_SIMPLE = pathlib.Path("designer-ai/simple-authoring")
PACK_NAME = "STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip"

REQUIRED_CURRENT_KEYS = (
    "catalogRevision",
    "contractRevision",
    "schemaHash",
    "snapshotContentHash",
    "authoringRuleRegistryRevision",
)

SIMPLE_V1_FILES = (
    "CUTSCENE_SCRIPT_V1.schema.json",
    "CUTSCENE_SCRIPT_V1_CANONICAL_EXAMPLE.json",
    "CUTSCENE_VALIDATION_CURRENT.schema.json",
    "CINEMATIC_INTENT_QA_RULES.json",
    "SEMANTIC_CINEMATIC_AUTHORING_GUIDE.md",
    "EMOTIONAL_DIALOGUE_AUTHORING_POLICY.json",
    "ARCHITECTURE.md",
    "AUTHORING_PACK_GATE_POLICY.md",
)

AUTHORING_RULES = [
    {
        "id": "CURRENT_ONLY",
        "blocks": True,
        "instruction": "Use only values published in this CURRENT. Absence from CURRENT means unavailable; never infer a handle or identity.",
    },
    {
        "id": "HANDLE_ONLY",
        "blocks": True,
        "instruction": "For locationHandle, visible.handle, effectHandle, viaHandle and audio.handle use an exact CURRENT Simple V1 authoring handle. Never serialize a raw Catalog asset ID.",
    },
    {
        "id": "ANIMATION_SEMANTIC_ONLY",
        "blocks": True,
        "instruction": "Author animation/performance in CUTSCENE_SCRIPT_V1 through semantic animationIntent or performanceIntent fields. Do not serialize a raw animation asset ID merely because Animation identities exist in CURRENT for backend compatibility and validation.",
    },
    {
        "id": "DIALOGUE_CLOSED_WORLD",
        "blocks": True,
        "instruction": "Every dialogue speaker/listener must be an authoringReady actorId from EMOTIONAL_DIALOGUE_CURRENT.json and match cast[].id exactly.",
    },
    {
        "id": "DIALOGUE_IDENTITY",
        "blocks": True,
        "instruction": "For dialogue cast, cast[].identityHandle must exactly equal that character's published identityHandle. Do not substitute Actor, UI, Atlas or portrait handles.",
    },
    {
        "id": "DIALOGUE_EXPRESSION",
        "blocks": True,
        "instruction": "expressionIntent, when present, must exactly match a supported expression for that speaker. Omit expressionIntent to request the published defaultExpression. Never fall back to Neutral for an unsupported explicit expression.",
    },
    {
        "id": "DIALOGUE_LOCKED_STAGING",
        "blocks": True,
        "instruction": "Do not combine locked portrait dialogue with explicit world movement for the same participant in the same beat. Put world movement in a separate beat when needed.",
    },
    {
        "id": "ONE_PRESENTATION_SOURCE",
        "blocks": True,
        "instruction": "A cast participant has one narrative identity and at most one optional presentationHandle. presentationHandle never creates or changes identity.",
    },
    {
        "id": "VISUAL_EVIDENCE",
        "blocks": False,
        "instruction": "Before selecting a visual handle, inspect its published Atlas pixels. Metadata alone is not visual proof.",
    },
    {
        "id": "BACKEND_FIELDS_OMITTED",
        "blocks": False,
        "instruction": "Do not author V3/V5 bookkeeping such as lifetime ownership, mechanical IDs, fixed Dialogue Stage mechanics, project font defaults, deterministic scale defaults or raw presentation modes. Those remain backend-owned unless represented by a Simple V1 field.",
    },
    {
        "id": "WARNING_FIRST",
        "blocks": False,
        "instruction": "Recoverable system-owned presentation or staging omissions remain warnings when the backend can resolve a legal deterministic default. Do not invent assets or backend fields to silence them. Real identity, CURRENT, capability or unsupported-expression failures remain blockers.",
    },
    {
        "id": "SCHEMA_ONLY",
        "blocks": True,
        "instruction": "Serialize only fields defined by CUTSCENE_SCRIPT_V1.schema.json. Do not invent noncanonical fields.",
    },
]


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path, payload, compact=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False) if compact else json.dumps(payload, indent=2, ensure_ascii=False)
    path.write_text(text + "\n", encoding="utf-8")


def normalized_required_current(current):
    source = dict(current.get("requiredCurrent") or {})
    missing = [
        key for key in REQUIRED_CURRENT_KEYS
        if source.get(key) is None or str(source.get(key)).strip() == ""
    ]
    if missing:
        raise SystemExit("CURRENT requiredCurrent is incomplete: " + ", ".join(missing))

    # This value is an opaque 64-bit identity. JS Number cannot preserve it.
    source["catalogRevision"] = str(source["catalogRevision"])
    for key in REQUIRED_CURRENT_KEYS[1:]:
        source[key] = str(source[key])
    return source


def normalize_catalog_revision(payload, required_current):
    if "catalogRevision" in payload and payload.get("catalogRevision") is not None:
        payload["catalogRevision"] = str(payload["catalogRevision"])
    if isinstance(payload.get("requiredCurrent"), dict):
        payload["requiredCurrent"]["catalogRevision"] = str(
            payload["requiredCurrent"].get("catalogRevision", required_current["catalogRevision"])
        )
    if isinstance(payload.get("atomicIdentity"), dict) and payload["atomicIdentity"].get("catalogRevision") is not None:
        payload["atomicIdentity"]["catalogRevision"] = str(payload["atomicIdentity"]["catalogRevision"])
    return payload


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


def stage_simple_v1_files(required_current):
    out_dir = ROOT / "simple-authoring"
    out_dir.mkdir(parents=True, exist_ok=True)
    changed = []

    for name in SIMPLE_V1_FILES:
        source = SOURCE_SIMPLE / name
        if source.is_file():
            destination = out_dir / name
            shutil.copy2(source, destination)
            changed.append(destination)

    rules_path = out_dir / "AUTHORING_RULES_CURRENT.json"
    write_json(
        rules_path,
        {
            "schema": "STARWARS_DELTA_SIMPLE_V1_AUTHORING_RULES_CURRENT",
            "schemaVersion": 2,
            "requiredCurrent": required_current,
            "purpose": "Author-facing rules for CUTSCENE_SCRIPT_V1 only. Backend/internal rules are intentionally omitted.",
            "rules": AUTHORING_RULES,
        },
    )
    changed.append(rules_path)
    return changed


def seal_chatgpt_start(path, revision):
    text = path.read_text(encoding="utf-8-sig").strip()
    title = "STARWARS_DELTA DEVORA - SIMPLE V1 CURRENT"
    if not text.startswith(title):
        raise SystemExit("CHATGPT_START is not the Simple V1 CURRENT front door")
    if "CUTSCENE_SCRIPT_V1" not in text or "V3/V5" not in text:
        raise SystemExit("CHATGPT_START is missing the Simple V1/backend boundary")

    lines = [
        line for line in text.splitlines()
        if not line.startswith("CURRENT AUTHORING RULE REGISTRY REVISION:")
    ]
    lines.insert(1, "CURRENT AUTHORING RULE REGISTRY REVISION: " + revision)
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def write_read_first(path, transaction_id, revision):
    path.write_text(
        "STARWARS_DELTA DEVORA - SIMPLE V1 CURRENT\n"
        f"Atomic publish transaction: {transaction_id}\n"
        f"Atomic Rule Registry revision: {revision}\n\n"
        "CURRENT beats memory. Absence from CURRENT means unavailable.\n"
        "Start with OPEN_CURRENT.json, then simple-authoring/AUTHORING_RULES_CURRENT.json and simple-authoring/AUTHORING_HANDLES.json.\n"
        "Author CUTSCENE_SCRIPT_V1 only. V3/V5 remain backend layers.\n"
        "Use exact CURRENT handles and the closed-world Emotional Dialogue repertoire.\n"
        "Inspect actual Atlas pixels before visual claims.\n"
        "Warnings do not require invented backend fields; blocksCompilation=true remains a real blocker.\n"
        "Authoring compatibility compares requiredCurrent only; publishTransactionId is provenance.\n",
        encoding="utf-8",
    )


def main():
    current = read_json(CURRENT_PATH)
    registry_revision = str(current.get("authoringRuleRegistryRevision") or "").strip()
    registry = current.get("authoringRuleRegistry") or {}
    if not registry_revision:
        raise SystemExit("CURRENT is missing authoringRuleRegistryRevision")
    if str(registry.get("revision") or "").strip() != registry_revision:
        raise SystemExit("CURRENT authoringRuleRegistryRevision does not match authoringRuleRegistry.revision")

    authoring_profile = current.get("authoringProfile") or {}
    canonical_template = current.get("canonicalTemplate") or {}
    if not authoring_profile.get("downloadUrl") or not canonical_template.get("downloadUrl"):
        raise SystemExit("CURRENT is missing authoringProfile/canonicalTemplate release URLs")

    required_current = normalized_required_current(current)
    if required_current["authoringRuleRegistryRevision"] != registry_revision:
        raise SystemExit("Rule Registry revision does not match CURRENT requiredCurrent")

    open_path = ROOT / "OPEN_CURRENT.json"
    director_path = ROOT / "director-view" / "DIRECTOR_VIEW.json"
    manifest_path = ROOT / "DIRECTOR_PACK_MANIFEST.json"
    chatgpt_start_path = ROOT / "CHATGPT_START.txt"
    read_first_path = ROOT / "CHATGPT_READ_FIRST.txt"
    pack_path = ROOT / PACK_NAME

    required_paths = [open_path, director_path, manifest_path, chatgpt_start_path, read_first_path, pack_path]
    missing_paths = [str(path) for path in required_paths if not path.is_file()]
    if missing_paths:
        raise SystemExit("Atomic CURRENT stage is incomplete: " + ", ".join(missing_paths))

    open_manifest = read_json(open_path)
    director = read_json(director_path)
    pack_manifest = read_json(manifest_path)

    if director.get("publishTransactionId") != current.get("publishTransactionId"):
        raise SystemExit("Director publishTransactionId does not match CURRENT")
    if str(director.get("catalogRevision")) != required_current["catalogRevision"]:
        raise SystemExit("Director catalogRevision does not match CURRENT requiredCurrent")
    if director.get("contractRevision") != required_current["contractRevision"]:
        raise SystemExit("Director contractRevision does not match CURRENT requiredCurrent")
    if director.get("schemaHash") != required_current["schemaHash"]:
        raise SystemExit("Director schemaHash does not match CURRENT requiredCurrent")
    if director.get("snapshotContentHash") != required_current["snapshotContentHash"]:
        raise SystemExit("Director snapshotContentHash does not match CURRENT requiredCurrent")

    provenance = {
        "publishTransactionId": current.get("publishTransactionId"),
        "publishedUtc": current.get("publishedUtc"),
        "publisherVersion": current.get("publisherVersion"),
    }
    bundle = current.get("bundle") or {}
    if bundle.get("sha256"):
        provenance["bundleIdentity"] = bundle.get("sha256")
    if not provenance["publishTransactionId"]:
        raise SystemExit("CURRENT publishTransactionId is missing")

    expected_identity = {"publishTransactionId": provenance["publishTransactionId"], **required_current}
    changed = []

    for payload in (director, open_manifest, pack_manifest):
        normalize_catalog_revision(payload, required_current)
        payload["authoringRuleRegistryRevision"] = registry_revision
        payload["requiredCurrent"] = required_current
        payload["provenance"] = provenance
        payload["atomicIdentity"] = expected_identity

    # Preserve the existing backend metadata/API exactly. Simple V1 is added as
    # the author-facing front door, not substituted for the backend contracts.
    open_manifest["authoringProfile"] = authoring_profile
    open_manifest["canonicalTemplate"] = canonical_template
    pack_manifest["authoringProfile"] = authoring_profile
    pack_manifest["canonicalTemplate"] = canonical_template

    open_manifest["simpleAuthoring"] = {
        "format": "CUTSCENE_SCRIPT_V1",
        "schemaPath": "simple-authoring/CUTSCENE_SCRIPT_V1.schema.json",
        "rulesPath": "simple-authoring/AUTHORING_RULES_CURRENT.json",
        "handlesPath": "simple-authoring/AUTHORING_HANDLES.json",
        "canonicalExamplePath": "simple-authoring/CUTSCENE_SCRIPT_V1_CANONICAL_EXAMPLE.json",
        "backend": "Existing V3/V5 pipeline remains implementation only.",
    }
    usage = open_manifest.setdefault("usage", {})
    usage["currentCompatibility"] = (
        "Studio NEW/REVISE/REPAIR compares requiredCurrent only: catalogRevision, contractRevision, schemaHash, "
        "snapshotContentHash and authoringRuleRegistryRevision. publishTransactionId is provenance only."
    )
    usage["atomicIdentity"] = (
        "atomicIdentity is strict publication-integrity metadata for one generated CURRENT transaction. "
        "Do not use publishTransactionId as the normal Studio authoring-compatibility gate; use requiredCurrent."
    )
    usage["authoringShape"] = (
        "Author CUTSCENE_SCRIPT_V1 using simple-authoring/CUTSCENE_SCRIPT_V1.schema.json, AUTHORING_RULES_CURRENT.json "
        "and AUTHORING_HANDLES.json. V3/V5 remain backend layers; their existing profile/template metadata remains available to engineering."
    )
    usage["validation"] = (
        "Read CUTSCENE_VALIDATION_CURRENT.json before final JSON. blocksCompilation=true is a real blocker; "
        "recoverable backend-owned defaults and warnings do not require invented fields."
    )

    write_json(director_path, director)
    write_json(open_path, open_manifest)
    write_json(manifest_path, pack_manifest)
    changed.extend([director_path, open_path, manifest_path])

    for path in sorted((ROOT / "director-view").glob("*.json")):
        if path == director_path:
            continue
        payload = read_json(path)
        normalize_catalog_revision(payload, required_current)
        payload["authoringRuleRegistryRevision"] = registry_revision
        payload["requiredCurrent"] = required_current
        payload["provenance"] = provenance
        payload["atomicIdentity"] = expected_identity
        write_json(path, payload, compact=path.name == "asset-lookup.json")
        changed.append(path)

    changed.extend(stage_simple_v1_files(required_current))

    seal_chatgpt_start(chatgpt_start_path, registry_revision)
    write_read_first(read_first_path, provenance["publishTransactionId"], registry_revision)
    changed.extend([chatgpt_start_path, read_first_path])

    # Preserve the existing redundancy guard. The unified Atlas is the visual
    # publication surface; category PDFs/index directories must not leak back in.
    forbidden_pdfs = [ROOT / "full-visual-sheets" / f"{name}.pdf" for name in ("actor", "effect", "layer", "ui")]
    leaked = [str(path) for path in forbidden_pdfs if path.exists()]
    if (ROOT / "full-visual-index").exists():
        leaked.append(str(ROOT / "full-visual-index"))
    if leaked:
        raise SystemExit("Redundant visual publication artifacts leaked into CURRENT: " + ", ".join(leaked))

    replace_pack_entries(pack_path, changed)

    with zipfile.ZipFile(pack_path, "r") as archive:
        for required_name in (
            "OPEN_CURRENT.json",
            "director-view/DIRECTOR_VIEW.json",
            "DIRECTOR_PACK_MANIFEST.json",
            "simple-authoring/AUTHORING_RULES_CURRENT.json",
            "simple-authoring/CUTSCENE_SCRIPT_V1_CANONICAL_EXAMPLE.json",
        ):
            if required_name not in archive.namelist():
                raise SystemExit("Director pack is missing sealed Simple V1 artifact: " + required_name)

        zip_open = json.loads(archive.read("OPEN_CURRENT.json").decode("utf-8-sig"))
        zip_director = json.loads(archive.read("director-view/DIRECTOR_VIEW.json").decode("utf-8-sig"))
        zip_manifest = json.loads(archive.read("DIRECTOR_PACK_MANIFEST.json").decode("utf-8-sig"))
        zip_rules = json.loads(archive.read("simple-authoring/AUTHORING_RULES_CURRENT.json").decode("utf-8-sig"))
        for label, payload in (
            ("OPEN_CURRENT", zip_open),
            ("DIRECTOR_VIEW", zip_director),
            ("DIRECTOR_PACK_MANIFEST", zip_manifest),
        ):
            if payload.get("atomicIdentity") != expected_identity:
                raise SystemExit(f"{label} in Director pack has stale atomic identity")
            if payload.get("requiredCurrent") != required_current:
                raise SystemExit(f"{label} in Director pack has stale requiredCurrent")
            if payload.get("provenance", {}).get("publishTransactionId") != provenance["publishTransactionId"]:
                raise SystemExit(f"{label} in Director pack has stale publication provenance")
        if zip_rules.get("requiredCurrent") != required_current:
            raise SystemExit("AUTHORING_RULES_CURRENT in Director pack has stale requiredCurrent")

    print("ATOMIC_CURRENT_SEALED")
    print("SIMPLE_V1_FRONT_DOOR_SEALED")
    print("REQUIRED_CURRENT", json.dumps(required_current, sort_keys=True))
    print("ATOMIC_IDENTITY", json.dumps(expected_identity, sort_keys=True))


if __name__ == "__main__":
    main()
