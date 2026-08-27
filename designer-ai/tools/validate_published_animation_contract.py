#!/usr/bin/env python3
"""Validate the published Designer AI animation contract without touching Unity data.

This is intentionally read-only. It catches the class of failure where Unity/Director
publishes a seemingly valid CURRENT while backend Animation compatibility is empty or
no Actor owns any compatible animation.
"""

import argparse
import json
import pathlib
import sys


REQUIRED_CURRENT_KEYS = (
    "catalogRevision",
    "contractRevision",
    "schemaHash",
    "snapshotContentHash",
    "authoringRuleRegistryRevision",
)


def read_json(path: pathlib.Path):
    if not path.is_file():
        raise RuntimeError(f"missing required file: {path}")
    return json.loads(path.read_text(encoding="utf-8-sig"))


def required_current(payload):
    value = payload.get("requiredCurrent") or payload.get("atomicIdentity") or {}
    missing = [key for key in REQUIRED_CURRENT_KEYS if not str(value.get(key) or "").strip()]
    if missing:
        raise RuntimeError("requiredCurrent missing: " + ", ".join(missing))
    return {key: str(value[key]) for key in REQUIRED_CURRENT_KEYS}


def fail(errors, message):
    errors.append(message)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="repository root")
    args = parser.parse_args()

    root = pathlib.Path(args.root).resolve()
    open_current = root / "designer-ai" / "open-current"
    handles_path = open_current / "simple-authoring" / "AUTHORING_HANDLES.json"
    source_path = open_current / "SOURCE_CURRENT.json"
    director_animations_path = open_current / "director-view" / "animations.json"

    errors = []

    try:
        handles = read_json(handles_path)
        source = read_json(source_path)
    except Exception as exc:
        print("PUBLISHED_ANIMATION_CONTRACT FAIL")
        print("reason=", exc)
        return 1

    if handles.get("schema") != "STARWARS_DELTA_AUTHORING_HANDLES":
        fail(errors, "AUTHORING_HANDLES schema mismatch")

    try:
        handles_identity = required_current(handles)
        source_identity = required_current(source)
        for key in REQUIRED_CURRENT_KEYS:
            if handles_identity[key] != source_identity[key]:
                fail(errors, f"requiredCurrent mismatch for {key}")
    except Exception as exc:
        fail(errors, str(exc))

    direct_handles = list(handles.get("handles") or [])
    actor_handles = [entry for entry in direct_handles if entry.get("route") == "Actor"]
    direct_animation_handles = [entry for entry in direct_handles if entry.get("route") == "Animation"]

    backend_counts = handles.get("backendCompatibilityCounts") or {}
    backend_animation_count = int(backend_counts.get("Animation") or 0)

    if direct_animation_handles:
        fail(errors, "raw Animation identities leaked into direct Devora handles")

    raw_backend_keys = []
    for entry in direct_handles:
        for key in ("compatibleAnimationIds", "compatibleDialogueVisualIds"):
            if key in entry:
                raw_backend_keys.append((entry.get("handle"), key))
    if raw_backend_keys:
        fail(errors, "raw backend compatibility IDs leaked into direct handles")

    inconsistent_actor_flags = []
    animation_enabled_actors = []
    for actor in actor_handles:
        count = int(actor.get("compatibleAnimationCount") or 0)
        has_animation = actor.get("hasCompatibleAnimation") is True
        if has_animation != (count > 0):
            inconsistent_actor_flags.append(actor.get("handle") or actor.get("runtimeId"))
        if count > 0:
            animation_enabled_actors.append(actor)

    if inconsistent_actor_flags:
        fail(
            errors,
            "Actor hasCompatibleAnimation/compatibleAnimationCount mismatch: "
            + repr(inconsistent_actor_flags[:10]),
        )

    # This is the key guard. A published CURRENT with zero backend Animation
    # compatibility is not a healthy semantic-animation surface. It must not be
    # mistaken for a successful publish merely because the JSON/manifest exists.
    if backend_animation_count <= 0:
        fail(errors, "backendCompatibilityCounts.Animation is zero")

    if backend_animation_count > 0 and not animation_enabled_actors:
        fail(errors, "backend Animation exists but no Actor owns compatible animations")

    director_animation_asset_count = None
    if director_animations_path.is_file():
        try:
            director_animations = read_json(director_animations_path)
            director_animation_asset_count = len(director_animations.get("assets") or [])
            if director_animation_asset_count > 0 and backend_animation_count <= 0:
                fail(
                    errors,
                    "Director publishes Animation assets but AUTHORING_HANDLES backend count is zero",
                )
        except Exception as exc:
            fail(errors, "could not validate director-view/animations.json: " + str(exc))

    registry = source.get("authoringRuleRegistry") or {}
    rule_ids = {rule.get("ruleId") for rule in registry.get("rules") or []}
    for required_rule in ("ACTOR_PRIMARY_IDENTITY", "ANIMATION_COMPATIBILITY"):
        if required_rule not in rule_ids:
            fail(errors, f"required authoring rule missing: {required_rule}")

    print("PUBLISHED_ANIMATION_CONTRACT")
    print("actors=", len(actor_handles))
    print("backendAnimationCount=", backend_animation_count)
    print("actorsWithCompatibleAnimation=", len(animation_enabled_actors))
    if director_animation_asset_count is not None:
        print("directorAnimationAssets=", director_animation_asset_count)

    if animation_enabled_actors:
        print("sampleAnimationOwners=")
        for actor in animation_enabled_actors[:10]:
            print(
                "  ",
                actor.get("displayName") or actor.get("handle"),
                "count=",
                int(actor.get("compatibleAnimationCount") or 0),
                "runtimeId=",
                actor.get("runtimeId"),
            )

    if errors:
        print("result=FAIL")
        for error in errors:
            print("error=", error)
        return 1

    print("result=PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
