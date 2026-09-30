"""Tests for the OpenAPI spec pipeline in _build_scripts/openapi/.

No network, no API keys: everything runs against the committed files.
"""

import importlib.util
import json
from pathlib import Path

import pytest

pytestmark = pytest.mark.openapi

ROOT = Path(__file__).resolve().parents[2]
PIPELINE = ROOT / "_build_scripts" / "openapi"
UPSTREAM = PIPELINE / "upstream" / "schema.json"
OVERLAY = PIPELINE / "overlay.json"
LOCK = PIPELINE / "overlay.lock.json"
SPEC = ROOT / "static" / "specs" / "weaviate-openapi.json"
SOURCE = ROOT / "static" / "specs" / "weaviate-openapi.source.json"

_spec = importlib.util.spec_from_file_location("build_spec", PIPELINE / "build_spec.py")
bs = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bs)


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def render(data):
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


@pytest.fixture(scope="module")
def built():
    return bs.build(load(UPSTREAM), load(OVERLAY))


def iter_descriptions(node):
    if isinstance(node, dict):
        for key, value in node.items():
            if key in ("description", "summary") and isinstance(value, str):
                yield value
            else:
                yield from iter_descriptions(value)
    elif isinstance(node, list):
        for item in node:
            yield from iter_descriptions(item)


def iter_refs(node):
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "$ref" and isinstance(value, str):
                yield value
            else:
                yield from iter_refs(value)
    elif isinstance(node, list):
        for item in node:
            yield from iter_refs(item)


# --- The committed files agree ---------------------------------------------


def test_build_reproduces_committed_spec(built):
    assert render(built) == SPEC.read_text(encoding="utf-8"), (
        "static/specs/weaviate-openapi.json is not the build output. Rebuild it with "
        "build_spec.py instead of editing it (see static/specs/README.md)."
    )


def test_build_is_idempotent(built):
    assert bs.build(built, load(OVERLAY)) == built


def test_source_file_matches_overlay():
    source = load(SOURCE)
    assert source["overlay_sha256"] == bs.sha256_file(OVERLAY)
    assert source["rules_version"] == bs.RULES_VERSION
    assert source["tag"] and source["upstream_commit"] and source["fetched_at"]


def test_overlay_parents_exist_upstream():
    upstream = load(UPSTREAM)
    # Only the parent must exist: a `null` entry may target something already gone,
    # and new keys (like `servers`) are absent upstream by definition.
    for pointer, _ in bs.overlay_entries(load(OVERLAY)):
        parent = bs.parent_pointer(pointer)
        assert parent == "" or bs.resolve(upstream, parent) is not bs.MISSING, pointer


def test_lock_has_no_stale_or_unlocked_entries():
    # The nightly runs this after replacing upstream/schema.json without touching
    # the lock, so drift must pass here: it is reported, not fatal.
    upstream = bs.apply_rules(load(UPSTREAM))
    results = bs.classify(upstream, load(OVERLAY), load(LOCK))
    assert [r for r in results if r[1] in ("stale", "unlocked")] == []


def test_committed_tree_reports_all_ok():
    # Only true for the tree as committed. A nightly PR may legitimately drift.
    if load(LOCK)["tag"] != load(SOURCE)["tag"]:
        pytest.skip("upstream moved past the lock; drift is reported by the job")
    upstream = bs.apply_rules(load(UPSTREAM))
    results = bs.classify(upstream, load(OVERLAY), load(LOCK))
    assert len(results) == 11
    assert {status for _, status in results} == {"ok"}


# --- The output is a usable Swagger 2.0 document ---------------------------


def test_output_is_swagger_2(built):
    assert built["swagger"] == "2.0"
    assert built["info"]["version"] == load(SOURCE)["tag"].lstrip("v")
    assert len(built["paths"]) > 0


def test_every_ref_resolves(built):
    for ref in set(iter_refs(built)):
        section, _, name = ref.removeprefix("#/").partition("/")
        assert section in ("definitions", "parameters"), ref
        assert name in built[section], ref


def test_no_br_tags_left(built):
    assert not [d for d in iter_descriptions(built) if bs.BR.search(d)]


# --- merge_patch (RFC 7386) ------------------------------------------------


def test_merge_patch_nested_merge():
    target = {"a": {"b": 1, "c": 2}, "d": 3}
    assert bs.merge_patch(target, {"a": {"b": 9}}) == {"a": {"b": 9, "c": 2}, "d": 3}


def test_merge_patch_null_deletes():
    assert bs.merge_patch({"a": 1, "b": 2}, {"a": None}) == {"b": 2}
    assert bs.merge_patch({"a": 1}, {"missing": None}) == {"a": 1}


def test_merge_patch_array_replaces_whole():
    assert bs.merge_patch({"a": [1, 2, 3]}, {"a": [4]}) == {"a": [4]}


def test_merge_patch_rfc7386_appendix_a():
    target = {"title": "Goodbye!", "author": {"givenName": "John", "familyName": "Doe"},
              "tags": ["example", "sample"], "content": "This will be unchanged"}
    patch = {"title": "Hello!", "phoneNumber": "+01-123-456-7890",
             "author": {"familyName": None}, "tags": ["example"]}
    assert bs.merge_patch(target, patch) == {
        "title": "Hello!", "author": {"givenName": "John"}, "tags": ["example"],
        "content": "This will be unchanged", "phoneNumber": "+01-123-456-7890"}


def test_merge_patch_does_not_mutate_inputs():
    target, patch = {"a": {"b": 1}}, {"a": {"c": 2}}
    bs.merge_patch(target, patch)
    assert target == {"a": {"b": 1}} and patch == {"a": {"c": 2}}


# --- Rules -----------------------------------------------------------------


def test_rule_replaces_br_in_description_and_summary_only():
    doc = {"description": "a<br/>b<br>c", "summary": "x<BR />y", "example": "keep<br/>"}
    assert bs.apply_rules(doc) == {"description": "a\nb\nc", "summary": "x\ny", "example": "keep<br/>"}


# --- Lock classification ---------------------------------------------------


def test_lock_classification():
    old = {"paths": {"/a": {"get": {"description": "A"}}, "/b": {"get": {"description": "B"}},
                     "/c": {"get": {"description": "C"}}}}
    overlay = {"paths": {"/a": {"get": {"description": "A docs"}},
                         "/b": {"get": {"description": "B docs"}},
                         "/c": {"get": {"description": "C docs"}}}}
    lock = bs.make_lock(old, overlay)
    lock["entries"].pop("/paths/~1c/get/description")

    new = {"paths": {"/a": {"get": {"description": "A"}}, "/b": {"get": {"description": "B changed"}},
                     "/c": {"get": {"description": "C"}}}}
    assert dict(bs.classify(new, overlay, lock)) == {
        "/paths/~1a/get/description": "ok",
        "/paths/~1b/get/description": "drifted",
        "/paths/~1c/get/description": "unlocked",
    }

    gone = {"paths": {"/a": {"get": {}}, "/b": {"get": {"description": "B"}}}}
    assert dict(bs.classify(gone, overlay, lock))["/paths/~1a/get/description"] == "stale"


def test_check_lock_exits_nonzero_on_stale(tmp_path):
    upstream = tmp_path / "up.json"
    overlay = tmp_path / "overlay.json"
    lock = tmp_path / "lock.json"
    report = tmp_path / "report.md"
    out = tmp_path / "out.json"
    overlay.write_text(json.dumps({"info": {"description": "docs"}}))
    upstream.write_text(json.dumps({"info": {"description": "up"}}))
    args = ["--upstream", str(upstream), "--overlay", str(overlay), "--lock", str(lock)]
    assert bs.main(args + ["--update-lock"]) == 0

    upstream.write_text(json.dumps({"info": {}}))
    assert bs.main(args + ["--check-lock", "--report", str(report), "--out", str(out)]) == 1
    assert "stale" in report.read_text()
    assert not out.exists()


def _run_check(tmp_path, upstream_before, upstream_after, overlay_doc):
    upstream = tmp_path / "up.json"
    overlay = tmp_path / "overlay.json"
    lock = tmp_path / "lock.json"
    report = tmp_path / "report.md"
    overlay.write_text(json.dumps(overlay_doc))
    upstream.write_text(json.dumps(upstream_before))
    args = ["--upstream", str(upstream), "--overlay", str(overlay), "--lock", str(lock)]
    assert bs.main(args + ["--update-lock"]) == 0
    upstream.write_text(json.dumps(upstream_after))
    code = bs.main(args + ["--check-lock", "--report", str(report)])
    results = dict(bs.classify(bs.apply_rules(upstream_after), overlay_doc, load(lock)))
    return code, results


def test_null_entry_with_absent_target_is_ok(tmp_path):
    code, results = _run_check(
        tmp_path,
        {"basePath": "/v1", "swagger": "2.0"},
        {"swagger": "2.0"},
        {"basePath": None},
    )
    assert results == {"/basePath": "ok"}
    assert code == 0


def test_entry_under_removed_parent_is_stale(tmp_path):
    before = {"paths": {"/.well-known/live": {"get": {"responses": {}}}, "/x": {}}}
    after = {"paths": {"/x": {}}}
    overlay = {"paths": {"/.well-known/live": {"get": {"tags": ["well-known"]}}}}
    code, results = _run_check(tmp_path, before, after, overlay)
    assert results == {"/paths/~1.well-known~1live/get/tags": "stale"}
    assert code == 1
