#!/usr/bin/env python3
"""Build static/specs/weaviate-openapi.json from the upstream Weaviate spec.

    upstream schema.json -> rules -> overlay.json (RFC 7386 merge patch) -> output

The overlay carries the docs-specific content. overlay.lock.json records what
upstream had under every overlay entry, so an upstream change hidden by an
override shows up in the drift report. See static/specs/README.md.

Stdlib only. Examples:

    # build and write provenance
    python3 _build_scripts/openapi/build_spec.py \\
        --upstream _build_scripts/openapi/upstream/schema.json \\
        --overlay _build_scripts/openapi/overlay.json \\
        --lock _build_scripts/openapi/overlay.lock.json \\
        --out static/specs/weaviate-openapi.json \\
        --source-out static/specs/weaviate-openapi.source.json \\
        --tag v1.39.7 --upstream-commit <sha> --check-lock --report drift.md
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# Bump when apply_rules() changes what it produces.
RULES_VERSION = 1

ABSENT = "absent"  # lock value for "no value at this pointer"
MISSING = object()
TEXT_KEYS = ("description", "summary")
BR = re.compile(r"<br\s*/?>", re.IGNORECASE)


def apply_rules(node):
    """Return a copy of node with <br/> turned into newlines in every
    description and summary. Scalar renders Markdown, upstream writes <br/>."""
    if isinstance(node, dict):
        out = {}
        for key, value in node.items():
            if key in TEXT_KEYS and isinstance(value, str):
                out[key] = BR.sub("\n", value)
            else:
                out[key] = apply_rules(value)
        return out
    if isinstance(node, list):
        return [apply_rules(item) for item in node]
    return node


def merge_patch(target, patch):
    """RFC 7386: objects merge recursively, null deletes, anything else
    (arrays included) replaces the target whole. Keys new to the target are
    appended, so upstream key order survives."""
    if not isinstance(patch, dict):
        return copy.deepcopy(patch)
    result = dict(target) if isinstance(target, dict) else {}
    for key, value in patch.items():
        if value is None:
            result.pop(key, None)
        else:
            result[key] = merge_patch(result.get(key), value)
    return result


def build(upstream, overlay):
    return merge_patch(apply_rules(upstream), overlay)


# --- JSON pointers ---------------------------------------------------------


def escape(key: str) -> str:
    return key.replace("~", "~0").replace("/", "~1")


def unescape(token: str) -> str:
    return token.replace("~1", "/").replace("~0", "~")


def overlay_entries(patch, prefix=""):
    """Yield (pointer, value) for every leaf of a merge patch. A leaf is any
    value the patch sets or deletes, as opposed to an object it merges into."""
    for key, value in patch.items():
        pointer = f"{prefix}/{escape(key)}"
        if isinstance(value, dict) and value:
            yield from overlay_entries(value, pointer)
        else:
            yield pointer, value


def resolve(doc, pointer):
    """Value at pointer, or MISSING. Only walks objects: overlay pointers never
    index into arrays, because a merge patch cannot address array elements."""
    node = doc
    for token in pointer.split("/")[1:]:
        key = unescape(token)
        if not isinstance(node, dict) or key not in node:
            return MISSING
        node = node[key]
    return node


def parent_pointer(pointer: str) -> str:
    return pointer.rsplit("/", 1)[0]


# --- Lock and drift --------------------------------------------------------


def canonical(value) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def fingerprint(value) -> str:
    if value is MISSING:
        return ABSENT
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


def make_lock(upstream_ruled, overlay, tag=None):
    entries = {
        pointer: fingerprint(resolve(upstream_ruled, pointer))
        for pointer, _ in sorted(overlay_entries(overlay), key=lambda e: e[0])
    }
    return {"tag": tag, "rules_version": RULES_VERSION, "entries": entries}


def classify(upstream_ruled, overlay, lock):
    """Return [(pointer, status)] with status ok / drifted / stale / unlocked."""
    locked = lock.get("entries", {})
    results = []
    for pointer, value in sorted(overlay_entries(overlay), key=lambda e: e[0]):
        now = fingerprint(resolve(upstream_ruled, pointer))
        if value is not None and resolve(upstream_ruled, parent_pointer(pointer)) is MISSING:
            # Setting a key under a vanished parent would build a stub, for
            # example an operation with tags and no responses.
            status = "stale"
        elif pointer not in locked:
            status = "unlocked"
        elif value is None and now == ABSENT:
            status = "ok"  # deleting something already gone is harmless
        elif now == locked[pointer]:
            status = "ok"
        elif now == ABSENT:
            status = "stale"
        else:
            # Includes "absent at lock time, present now": upstream added a
            # value that the override hides.
            status = "drifted"
        results.append((pointer, status))
    return results


EXPLAIN = {
    "ok": "Upstream value unchanged since the lock.",
    "drifted": "Upstream changed the value under this override. Review the override, then run --update-lock.",
    "stale": "The target, or the object it is set in, no longer exists upstream. Remove or move the entry in overlay.json.",
    "unlocked": "No lock entry. Run --update-lock.",
}


def render_report(results, tag, lock_tag) -> str:
    counts = {s: sum(1 for _, r in results if r == s) for s in EXPLAIN}
    lines = [
        "## OpenAPI overlay drift report",
        "",
        f"Upstream `{tag or 'unknown'}` against the lock taken at `{lock_tag or 'unknown'}`.",
        "",
        " | ".join(f"{s}: {counts[s]}" for s in EXPLAIN),
        "",
    ]
    flagged = [(p, s) for p, s in results if s != "ok"]
    if not flagged:
        lines.append("Every overlay entry matches the lock.")
    else:
        lines += ["| Overlay entry | Status | Action |", "| :-- | :-- | :-- |"]
        lines += [f"| `{p}` | {s} | {EXPLAIN[s]} |" for p, s in flagged]
    return "\n".join(lines) + "\n"


# --- Files -----------------------------------------------------------------


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def dump(data, path):
    # Same layout as upstream, so the upstream-to-output diff stays small.
    Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def sha256_file(path) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--upstream", required=True, help="Pristine upstream schema.json")
    ap.add_argument("--overlay", required=True, help="overlay.json (RFC 7386 merge patch)")
    ap.add_argument("--lock", help="overlay.lock.json")
    ap.add_argument("--out", help="Where to write the built spec")
    ap.add_argument("--source-out", help="Where to write the provenance file")
    ap.add_argument("--tag", help="Upstream release tag, e.g. v1.39.7")
    ap.add_argument("--upstream-commit", help="Commit sha the tag points at")
    ap.add_argument("--report", help="Write the Markdown drift report here")
    ap.add_argument("--check-lock", action="store_true", help="Compare upstream against the lock")
    ap.add_argument("--update-lock", action="store_true", help="Rewrite the lock from upstream")
    args = ap.parse_args(argv)

    if (args.check_lock or args.update_lock) and not args.lock:
        ap.error("--check-lock and --update-lock need --lock")
    if args.source_out and not (args.tag and args.upstream_commit):
        ap.error("--source-out needs --tag and --upstream-commit")

    upstream_ruled = apply_rules(load(args.upstream))
    overlay = load(args.overlay)

    if args.check_lock:
        lock = load(args.lock)
        results = classify(upstream_ruled, overlay, lock)
        report = render_report(results, args.tag, lock.get("tag"))
        if args.report:
            Path(args.report).write_text(report, encoding="utf-8")
        print(report)
        if any(status == "stale" for _, status in results):
            print("error: stale overlay entries, nothing written", file=sys.stderr)
            return 1

    if args.update_lock:
        dump(make_lock(upstream_ruled, overlay, args.tag), args.lock)

    if args.out:
        dump(merge_patch(upstream_ruled, overlay), args.out)

    if args.source_out:
        dump(
            {
                "tag": args.tag,
                "upstream_commit": args.upstream_commit,
                "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "overlay_sha256": sha256_file(args.overlay),
                "rules_version": RULES_VERSION,
            },
            args.source_out,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
