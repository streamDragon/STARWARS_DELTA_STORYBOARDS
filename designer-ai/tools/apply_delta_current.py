#!/usr/bin/env python3
import copy
import hashlib
import json
import os
import pathlib
import shutil
import urllib.parse
import urllib.request

ROOT = pathlib.Path("designer-ai")
LIVE = ROOT / "open-current"
STAGE = pathlib.Path("_open_current_stage")
SOURCE = ROOT / "current.json"
CURRENT_SOURCE = ROOT / "tools" / "current-source"
REQUIRED_KEYS = (
    "catalogRevision",
    "contractRevision",
    "schemaHash",
    "snapshotContentHash",
    "authoringRuleRegistryRevision",
)
FORBIDDEN_EXACT = {
    "OPEN_CURRENT.json",
    "SOURCE_CURRENT.json",
    "ASSET_VISUAL_LOOKUP.json",
    "FULL_VISUAL_INDEX.json",
    "VISUAL_UNAVAILABLE.json",
    "CUTSCENE_VALIDATION_CURRENT.json",
    "EMOTIONAL_DIALOGUE_CURRENT.json",
    "DIRECTOR_PACK_MANIFEST.json",
    "STARWARS_DELTA_CHATGPT_DIRECTOR_CURRENT.zip",
    "simple-authoring/AUTHORING_HANDLES.json",
    "simple-authoring/AUTHORING_RULES_CURRENT.json",
    "simple-authoring/CUTSCENE_SCRIPT_V1.schema.json",
}
FORBIDDEN_PREFIXES = (
    "director-view/",
    "full-visual-sheets/",
    "catalog-contract/",
)
RESTAMP_JSON = (
    "ASSET_VISUAL_LOOKUP.json",
    "EMOTIONAL_DIALOGUE_CURRENT.json",
    "CUTSCENE_VALIDATION_CURRENT.json",
    "DIRECTOR_PACK_MANIFEST.json",
    "VISUAL_UNAVAILABLE.json",
    "director-view/DIRECTOR_VIEW.json",
    "director-view/VISUAL_SCAN_REPORT.json",
    "full-visual-sheets/VISUAL_ATLAS_CURRENT.json",
)


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def normalize_required(payload, label):
    source = payload.get("requiredCurrent") or {}
    result = {}
    for key in REQUIRED_KEYS:
        value = source.get(key)
        if value is None or str(value).strip() == "":
            raise SystemExit(f"DELTA_REQUIRED_CURRENT_INCOMPLETE: {label} missing {key}")
        result[key] = str(value)
    return result


def normalize_rel(value):
    rel = str(value or "").replace("\\", "/").strip()
    for prefix in ("designer-ai/open-current/", "open-current/"):
        if rel.startswith(prefix):
            rel = rel[len(prefix):]
    rel = rel.lstrip("/")
    parts = pathlib.PurePosixPath(rel).parts
    if not rel or ".." in parts or pathlib.PurePosixPath(rel).is_absolute():
        raise SystemExit("DELTA_ARTIFACT_PATH_INVALID: " + rel)
    if rel in FORBIDDEN_EXACT or any(rel.startswith(prefix) for prefix in FORBIDDEN_PREFIXES):
        raise SystemExit("DELTA_FULL_PUBLISH_REQUIRED: heavy/source-truth artifact requested in DELTA: " + rel)
    return rel


def request_json(url, token=""):
    headers = {"User-Agent": "STARWARS_DELTA_CURRENT"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def request_bytes(url, token=""):
    headers = {"User-Agent": "STARWARS_DELTA_CURRENT"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read()


def release_assets(source):
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    token = os.environ.get("GITHUB_TOKEN", "")
    release_url = str(source.get("releaseUrl") or "")
    if not repo or "/releases/tag/" not in release_url:
        return {}, token
    tag = release_url.rsplit("/releases/tag/", 1)[1]
    api = f"https://api.github.com/repos/{repo}/releases/tags/{urllib.parse.quote(tag, safe='')}"
    release = request_json(api, token)
    return {str(asset.get("name") or ""): asset for asset in (release.get("assets") or [])}, token


def extract_artifacts(source, assets, token):
    candidates = [
        (source.get("delta") or {}).get("changedArtifacts"),
        (source.get("delta") or {}).get("artifacts"),
        source.get("changedArtifacts"),
        (source.get("authoringOnlyOverlay") or {}).get("artifacts"),
    ]
    for value in candidates:
        if isinstance(value, list) and value:
            return value
    delta_asset = assets.get("DELTA.json")
    if delta_asset:
        payload = json.loads(request_bytes(delta_asset["browser_download_url"], token).decode("utf-8-sig"))
        if str(payload.get("publishMode") or "DELTA").upper() != "DELTA":
            raise SystemExit("DELTA_MANIFEST_MODE_INVALID")
        for key in ("changedArtifacts", "artifacts"):
            value = payload.get(key)
            if isinstance(value, list) and value:
                return value
    raise SystemExit("DELTA_ARTIFACTS_MISSING")


def read_artifact_bytes(item, rel, assets, token):
    expected = str(item.get("sha256") or "").lower()
    expected_size = item.get("sizeBytes")
    local = CURRENT_SOURCE / pathlib.PurePosixPath(rel)
    if local.is_file():
        raw = local.read_bytes()
        digest = hashlib.sha256(raw).hexdigest().lower()
        size_ok = expected_size in (None, "") or len(raw) == int(expected_size)
        hash_ok = not expected or digest == expected
        if hash_ok and size_ok:
            return raw, "CURRENT_SOURCE"

    explicit = str(item.get("assetName") or item.get("releaseAssetName") or "").strip()
    names = []
    if explicit:
        names.append(explicit)
    names.extend([pathlib.PurePosixPath(rel).name, rel.replace("/", "__")])
    seen = set()
    for name in names:
        if not name or name in seen:
            continue
        seen.add(name)
        asset = assets.get(name)
        if not asset:
            continue
        raw = request_bytes(asset["browser_download_url"], token)
        digest = hashlib.sha256(raw).hexdigest().lower()
        if expected and digest != expected:
            raise SystemExit("DELTA_ARTIFACT_HASH_MISMATCH: " + rel)
        if expected_size not in (None, "") and len(raw) != int(expected_size):
            raise SystemExit("DELTA_ARTIFACT_SIZE_MISMATCH: " + rel)
        return raw, "RELEASE"
    raise SystemExit("DELTA_ARTIFACT_MISSING: " + rel)


def restamp_projection(path, tx, required):
    if not path.is_file():
        return False
    try:
        payload = load_json(path)
    except Exception:
        return False
    if not isinstance(payload, dict):
        return False
    own_required = payload.get("requiredCurrent")
    if isinstance(own_required, dict):
        normalized = {key: str(own_required.get(key) or "") for key in REQUIRED_KEYS}
        if normalized != required:
            raise SystemExit("DELTA_FULL_PUBLISH_REQUIRED: reused projection fingerprint mismatch: " + str(path))
    if "publishTransactionId" in payload:
        payload["publishTransactionId"] = tx
        path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        return True
    return False


def main():
    source = load_json(SOURCE)
    if str(source.get("publishMode") or "").upper() != "DELTA":
        raise SystemExit("DELTA_FAST_PATH_REQUIRES_publishMode_DELTA")
    if not LIVE.is_dir():
        raise SystemExit("DELTA_BASE_OPEN_CURRENT_MISSING")

    live_open = load_json(LIVE / "OPEN_CURRENT.json")
    required = normalize_required(source, "SOURCE_CURRENT")
    live_required = normalize_required(live_open, "LIVE_OPEN_CURRENT")
    if required != live_required:
        mismatch = [key for key in REQUIRED_KEYS if required[key] != live_required[key]]
        raise SystemExit("DELTA_FULL_PUBLISH_REQUIRED: " + ",".join(mismatch))

    if STAGE.exists():
        shutil.rmtree(STAGE)
    shutil.copytree(LIVE, STAGE)

    assets, token = release_assets(source)
    artifacts = extract_artifacts(source, assets, token)
    applied = []
    sources = {"CURRENT_SOURCE": 0, "RELEASE": 0}
    for item in artifacts:
        rel = normalize_rel(item.get("path"))
        raw, origin = read_artifact_bytes(item, rel, assets, token)
        target = STAGE / pathlib.PurePosixPath(rel)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
        applied.append(rel)
        sources[origin] += 1

    tx = str(source.get("publishTransactionId") or "")
    if not tx:
        raise SystemExit("DELTA_TRANSACTION_MISSING")

    open_current = copy.deepcopy(live_open)
    for key in ("publishedUtc", "releaseUrl", "publisherVersion", "provenance"):
        if key in source:
            open_current[key] = copy.deepcopy(source[key])
    open_current["status"] = "CURRENT_VERIFIED"
    open_current["publishTransactionId"] = tx
    open_current["publishMode"] = "DELTA"
    open_current["requiredCurrent"] = dict(required)
    open_current["atomicIdentity"] = {"publishTransactionId": tx, **required}
    base_tx = source.get("baseFullPublishTransactionId") or (source.get("delta") or {}).get("baseFullPublishTransactionId") or live_open.get("baseFullPublishTransactionId") or live_open.get("publishTransactionId")
    open_current["baseFullPublishTransactionId"] = base_tx
    open_current["currentDeltaTransactionId"] = tx
    open_current["delta"] = {
        "publishMode": "DELTA",
        "baseFullPublishTransactionId": base_tx,
        "changedArtifactCount": len(applied),
        "changedArtifacts": applied,
    }
    (STAGE / "OPEN_CURRENT.json").write_text(json.dumps(open_current, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (STAGE / "SOURCE_CURRENT.json").write_text(json.dumps(source, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    restamped = 0
    for rel in RESTAMP_JSON:
        if restamp_projection(STAGE / rel, tx, required):
            restamped += 1

    for rel in (
        "director-view/DIRECTOR_VIEW.json",
        "simple-authoring/AUTHORING_HANDLES.json",
        "simple-authoring/AUTHORING_RULES_CURRENT.json",
        "full-visual-sheets/VISUAL_ATLAS_CURRENT.json",
        "EMOTIONAL_DIALOGUE_CURRENT.json",
        "CUTSCENE_VALIDATION_CURRENT.json",
        "CHATGPT_START.txt",
    ):
        if not (STAGE / rel).is_file():
            raise SystemExit("DELTA_CURRENT_REQUIRED_FILE_MISSING: " + rel)

    print("[DELTA_GITHUB_PATH]")
    print("visualEvidenceBuild=NOT_RUN")
    print("atlasBuild=NOT_RUN")
    print("directorBuild=NOT_RUN")
    print("catalogBuild=NOT_RUN")
    print("changedFiles=" + str(len(applied)))
    print("metadataRestamps=" + str(restamped))
    print("repoSourceFiles=" + str(sources["CURRENT_SOURCE"]))
    print("releaseSourceFiles=" + str(sources["RELEASE"]))
    print("result=PASS")


if __name__ == "__main__":
    main()
