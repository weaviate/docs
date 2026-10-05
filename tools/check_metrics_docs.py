#!/usr/bin/env python3
"""Check the monitoring page against a Weaviate metric catalog.

The catalog is built by the dashboards repo (weaviate/grafana-dashboard-weaviate)
from a live `/metrics` scrape plus a sweep of the Weaviate source, and maps every
metric name to its type, labels and help text:

    python3 tools/catalog.py --scrape http://localhost:2112/metrics --source ~/dev/weaviate
    # writes generator/catalog.json

Point this script at that file to confirm the docs still match the code:

    python3 tools/check_metrics_docs.py --catalog ~/dev/weaviate/grafana-dashboard-weaviate/generator/catalog.json

It reports metrics documented under a name nothing exposes, metrics the docs are
missing, and rows whose type or labels disagree with the catalog. Exits non-zero
on any of those.
"""

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

DEFAULT_PAGE = Path(__file__).resolve().parent.parent / "docs/deploy/configuration/monitoring.md"

# Go runtime and scrape-handler metrics. Prometheus exposes them from any Go
# process; they are not Weaviate's to document.
RUNTIME_PREFIXES = ("go_", "process_", "promhttp_")

# Metrics in the catalog that a running node never exposes, so they are
# deliberately absent from the page. Revisit whenever the catalog is rebuilt:
# once one of these starts being written, it should be documented instead.
EXPECTED_ABSENT = {
    # Created but never registered with the Prometheus registry.
    "weaviate_inflight_drain_failures_total",
    "weaviate_usage_s3_operation_latency_seconds",
    "weaviate_usage_gcs_operation_latency_seconds",
    # Declared but never written.
    "concurrent_goroutines",
    "lsm_segment_objects",
    "backup_restore_init_ms",
    "backup_restore_from_backend_ms",
    "tokenizer_requests_total",
}

ROW = re.compile(r"^\|\s*`([a-zA-Z_]\w*)`\s*\|(?P<desc>.*?)\|(?P<labels>[^|]*)\|\s*`(?P<type>\w+)`\s*\|\s*$")


def parse_page(path):
    """name -> (declared labels, declared type, line number)."""
    rows = {}
    order = []
    for n, line in enumerate(path.read_text().splitlines(), 1):
        m = ROW.match(line)
        if not m:
            continue
        name = m.group(1)
        labels = set(re.findall(r"`(\w+)`", m.group("labels")))
        rows[name] = (labels, m.group("type").lower(), n)
        order.append(name)
    return rows, order


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--catalog", required=True, type=Path, help="path to the dashboards repo's generator/catalog.json")
    ap.add_argument("--page", default=DEFAULT_PAGE, type=Path, help=f"page to check (default: {DEFAULT_PAGE.name})")
    ap.add_argument("--labels", action="store_true", help="also fail on label mismatches")
    args = ap.parse_args()

    catalog = json.loads(args.catalog.read_text())
    rows, order = parse_page(args.page)

    failures = []

    dupes = [n for n, c in Counter(order).items() if c > 1]
    if dupes:
        failures.append(("documented more than once", dupes))

    unknown = sorted(n for n in rows if n not in catalog)
    if unknown:
        failures.append(("documented under a name the catalog does not have", unknown))

    owned = {n for n in catalog if not n.startswith(RUNTIME_PREFIXES)}
    missing = sorted(owned - set(rows) - EXPECTED_ABSENT)
    if missing:
        failures.append(("in the catalog but not on the page", missing))

    stale = sorted(EXPECTED_ABSENT & set(rows))
    if stale:
        failures.append(("listed in EXPECTED_ABSENT but documented anyway", stale))

    wrong_type = []
    wrong_labels = []
    for name, (labels, typ, line) in sorted(rows.items()):
        entry = catalog.get(name)
        if not entry:
            continue
        if typ != entry["type"]:
            wrong_type.append(f"{name} (line {line}): page says {typ}, catalog says {entry['type']}")
        expected = set(entry["labels"])
        if labels != expected and args.labels:
            wrong_labels.append(f"{name} (line {line}): page says {sorted(labels) or 'none'}, "
                                f"catalog says {sorted(expected) or 'none'}")
    if wrong_type:
        failures.append(("wrong metric type", wrong_type))
    if wrong_labels:
        failures.append(("labels disagree with the catalog", wrong_labels))

    checked = len(rows)
    if not failures:
        print(f"OK: {checked} documented metrics match {args.catalog.name} "
              f"({len(owned)} Weaviate-owned metrics in the catalog, "
              f"{len(EXPECTED_ABSENT)} deliberately absent).")
        return 0

    for title, items in failures:
        print(f"\n{len(items)} {title}:", file=sys.stderr)
        for item in items:
            print(f"  {item}", file=sys.stderr)
    print(f"\nFAILED: {sum(len(i) for _, i in failures)} problems across {checked} documented metrics.",
          file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
