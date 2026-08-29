#!/usr/bin/env python3
import argparse
import json
import os
import pathlib
import tempfile
import zipfile

ROOT = pathlib.Path("_open_current_stage")
PACK_NAME = "STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip"

LEGACY_STAGE_DIRS = (
    "catalog-contract",
    "instruction-book",
)

LEGACY_STAGE_FILES = (
    "simple-authoring/CUTSCENE_GOLDEN_QA_POLICY.md",
    "simple-authoring/INTEGRATION_STATUS_CURRENT.md",
)

LEGACY_RULE_IDS = {
    "V4_RECIPES_ARE_AUTHORING_ONLY",
}

FORBIDDEN_PUBLIC_PHRASES = (
    "Create a current V5 package",
    "CURRENT AUTHORITATIVE RULES\nV2.7",
    "V4_RECIPES_ARE_AUTHORING_ONLY",
    "simple-authoring/CUTSCENE_GOLDEN_QA_POLICY.md",
)

TEXT_SUFFIXES = {".txt", ".md", ".json", ".html", ".js", ".css"}


def remove_path(path: pathlib.Path) -> None:
    if path.is_dir():
        import shutil
        shutil.rmtree(path)
    elif path.exists():
        path.unlink()


def sanitize_rules(root: pathlib.Path) -> None:
    path = root / "simple-authoring" / "AUTHORING_RULES_CURRENT.json"
    if not path.is_file():
        raise SystemExit("SANITIZE_RULES_MISSING: " + str(path))
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    rules = list(payload.get("rules") or [])
    payload["rules"] = [rule for rule in rules if str(rule.get("id") or "") not in LEGACY_RULE_IDS]
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def is_forbidden_archive_name(name: str) -> bool:
    normalized = name.replace("\\", "/")
    return any(normalized.startswith(prefix + "/") for prefix in LEGACY_STAGE_DIRS) or normalized in LEGACY_STAGE_FILES


def rewrite_pack(root: pathlib.Path) -> None:
    pack = root / PACK_NAME
    if not pack.is_file():
        raise SystemExit("SANITIZE_PACK_MISSING: " + str(pack))

    fd, temp_raw = tempfile.mkstemp(prefix="sanitized-director-current-", suffix=".zip", dir=str(pack.parent))
    os.close(fd)
    temp = pathlib.Path(temp_raw)
    try:
        with zipfile.ZipFile(pack, "r") as source, zipfile.ZipFile(temp, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=7) as target:
            written = set()
            for info in source.infolist():
                name = info.filename.replace("\\", "/")
                if name in written or is_forbidden_archive_name(name):
                    continue
                written.add(name)
                live = root / pathlib.PurePosixPath(name)
                if live.is_file():
                    target.write(live, name)
                else:
                    target.writestr(info, source.read(info.filename))

            canonical_additions = [
                root / "CHATGPT_READ_FIRST.txt",
                root / "CHATGPT_START.txt",
                root / "FILM_AUTHORING_GUIDE_CURRENT.md",
            ]
            canonical_additions.extend(sorted((root / "simple-authoring").glob("*")))
            for path in canonical_additions:
                if not path.is_file():
                    continue
                name = path.relative_to(root).as_posix()
                if name in written or is_forbidden_archive_name(name):
                    continue
                target.write(path, name)
                written.add(name)
        os.replace(temp, pack)
    finally:
        if temp.exists():
            temp.unlink()


def iter_public_text_files(root: pathlib.Path):
    for path in root.rglob("*"):
        if not path.is_file() or path.name == PACK_NAME:
            continue
        if any(part in LEGACY_STAGE_DIRS for part in path.relative_to(root).parts):
            continue
        if path.suffix.lower() in TEXT_SUFFIXES:
            yield path


def verify_surface(root: pathlib.Path) -> None:
    failures = []
    for name in LEGACY_STAGE_DIRS:
        if (root / name).exists():
            failures.append("legacy directory present: " + name)
    for name in LEGACY_STAGE_FILES:
        if (root / name).exists():
            failures.append("legacy file present: " + name)

    rules_path = root / "simple-authoring" / "AUTHORING_RULES_CURRENT.json"
    if rules_path.is_file():
        rules = json.loads(rules_path.read_text(encoding="utf-8-sig"))
        stale_ids = sorted(
            str(rule.get("id") or "")
            for rule in rules.get("rules") or []
            if str(rule.get("id") or "") in LEGACY_RULE_IDS
        )
        if stale_ids:
            failures.append("legacy rule ids present: " + ", ".join(stale_ids))

    for path in iter_public_text_files(root):
        text = path.read_text(encoding="utf-8-sig", errors="replace")
        for phrase in FORBIDDEN_PUBLIC_PHRASES:
            if phrase in text:
                failures.append(f"forbidden phrase in {path.relative_to(root)}: {phrase}")

    pack = root / PACK_NAME
    if pack.is_file():
        with zipfile.ZipFile(pack, "r") as archive:
            names = [name.replace("\\", "/") for name in archive.namelist()]
            stale = sorted(name for name in names if is_forbidden_archive_name(name))
            if stale:
                failures.append("legacy Director pack entries: " + ", ".join(stale[:20]))

    if failures:
        raise SystemExit("CURRENT_SURFACE_SANITIZE_FAIL\n" + "\n".join(failures))

    print("CURRENT_SURFACE_SANITIZE_PASS")
    print("LEGACY_CATALOG_CONTRACT=ABSENT")
    print("LEGACY_INSTRUCTION_BOOK=ABSENT")
    print("LEGACY_V4_RULE=ABSENT")


def sanitize(root: pathlib.Path) -> None:
    for name in LEGACY_STAGE_DIRS:
        remove_path(root / name)
    for name in LEGACY_STAGE_FILES:
        remove_path(root / name)
    sanitize_rules(root)
    rewrite_pack(root)
    verify_surface(root)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=str(ROOT))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    root = pathlib.Path(args.root)
    if not root.is_dir():
        raise SystemExit("CURRENT_SURFACE_ROOT_MISSING: " + str(root))
    if args.check:
        verify_surface(root)
    else:
        sanitize(root)


if __name__ == "__main__":
    main()
