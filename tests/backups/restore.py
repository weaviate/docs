#!/usr/bin/env python3
"""Restore the docs CI Weaviate Cloud (WCD) test cluster from a snapshot.

The snapshot under ``backup_<timestamp>/`` is a point-in-time export of every
collection's schema and objects (with stored vectors and UUIDs). The original
backup tool serialized config with ``str(...)``, which dropped structured
details (vectorizer config, cross-references, inverted-index flags), so a
faithful replay needs three stages:

  Stage 1 — restore     Recreate schemas + bulk-insert objects with their stored
                        vectors and UUIDs. Idempotent (skips collections that
                        already have objects). Leaves the vectorizer at "none",
                        so ``near_vector`` works but ``near_text``/``hybrid`` do
                        not. Needs WEAVIATE_URL + WEAVIATE_API_KEY only.

  Stage 2 — repopulate  Drop + recreate the 8 collections the docs tests
                        semantically search, pinning text2vec-openai (ada-002)
                        so query-time embedding lands in the same space as the
                        stored vectors, plus the cross-refs / inverted-index
                        flags the original tool lost. DESTRUCTIVE. Needs
                        OPENAI_API_KEY in addition.

  Stage 3 — jeopardy    Overwrite JeopardyQuestion + JeopardyCategory from the
                        canonical weaviate-demo-datasets package (the snapshot
                        lost the per-object hasCategory references). DESTRUCTIVE.
                        Does NOT read the snapshot. Needs OPENAI_API_KEY.

ECommerce / Weather / FinancialContracts are owned by the Query Agent tests
(``docs/agents/_includes/query_agent.*``) — they are skipped entirely here so
the snapshot can't shadow the tests' own ``text2vec-weaviate`` setup.

Usage
-----
    export WEAVIATE_URL="<cluster host, no scheme>"
    export WEAVIATE_API_KEY="<admin api key>"
    export OPENAI_API_KEY="<openai key>"        # stages 2 + 3 only

    uv run python tests/backups/restore.py              # all stages (default)
    uv run python tests/backups/restore.py --stage 1    # one stage
    uv run python tests/backups/restore.py --stage 2,3  # a subset

The snapshot directory is not committed (it is hundreds of MB). It is located
via $WEAVIATE_BACKUP_DIR, or by auto-detecting the newest ``backup_*`` directory
next to this script. See README.md for how to obtain it.
"""

import argparse
import glob
import json
import os
import sys

import weaviate
import weaviate.classes.config as wvc
from weaviate.classes.init import Auth
from weaviate.classes.tenants import Tenant


# ─────────────────────────────── Configuration ───────────────────────────────

# Backup "data_type" string → client DataType. Shared by stages 1 and 2.
DATA_TYPE_MAP = {
    "text": wvc.DataType.TEXT,
    "text[]": wvc.DataType.TEXT_ARRAY,
    "int": wvc.DataType.INT,
    "int[]": wvc.DataType.INT_ARRAY,
    "number": wvc.DataType.NUMBER,
    "number[]": wvc.DataType.NUMBER_ARRAY,
    "boolean": wvc.DataType.BOOL,
    "date": wvc.DataType.DATE,
    "uuid": wvc.DataType.UUID,
    "geoCoordinates": wvc.DataType.GEO_COORDINATES,
    "object[]": wvc.DataType.OBJECT_ARRAY,
}

# Python value type → DataType, used to infer object[] nested schemas (stage 1).
PYTHON_TO_DATATYPE = {
    str: wvc.DataType.TEXT,
    int: wvc.DataType.INT,
    float: wvc.DataType.NUMBER,
    bool: wvc.DataType.BOOL,
}

# Owned by the Query Agent tests, which create them with text2vec-weaviate named
# vectors and load their data from HuggingFace (only `if not exists`). The
# snapshot's lossy copies would shadow that and break named-vector queries
# (WEAVIATE_NAMED_VECTOR_ERROR / collection_vectors: []). Skipped in stage 1 and
# absent from COLLECTIONS_TO_FIX below. No non-agents test depends on them.
AGENTS_OWNED_COLLECTIONS = {"ECommerce", "Weather", "FinancialContracts"}

# Stage 2: collection name → list of named-vector specs. A spec is either a
# string (vector name; vectorizes from all text props) or a (name, [props])
# tuple. A single "default" spec means the legacy single-vector form.
COLLECTIONS_TO_FIX = {
    "JeopardyQuestion": ["default"],
    "Article": ["default"],
    "ArxivPapers": ["default"],
    "Publication": ["default"],
    "WineReview": ["default"],
    "WineReviewMT": ["default"],
    "GitBookChunk": ["default"],
    "WineReviewNV": [
        ("title", ["title"]),
        ("title_country", ["title", "country"]),
        ("review_body", ["review_body"]),
    ],
}

# Stage 2: schema details lost by the original backup script (str() of config
# objects), re-declared so collection-level features work post-recreate.
EXTRA_SCHEMA = {
    "Article": {
        "inverted_index_config": wvc.Configure.inverted_index(index_timestamps=True),
        "references": [
            wvc.ReferenceProperty(name="inPublication", target_collection="Publication"),
            wvc.ReferenceProperty(name="hasAuthors", target_collection="Author"),
        ],
    },
    "JeopardyQuestion": {
        "references": [
            wvc.ReferenceProperty(name="hasCategory", target_collection="JeopardyCategory"),
        ],
    },
    # WineReview-family tests filter on `IsNull` (e.g. country IS NULL), which
    # requires index_null_state=true on the inverted-index config.
    "WineReview": {
        "inverted_index_config": wvc.Configure.inverted_index(index_null_state=True),
    },
    "WineReviewMT": {
        "inverted_index_config": wvc.Configure.inverted_index(index_null_state=True),
    },
    "WineReviewNV": {
        "inverted_index_config": wvc.Configure.inverted_index(index_null_state=True),
    },
    "Publication": {
        "references": [
            wvc.ReferenceProperty(name="hasArticles", target_collection="Article"),
        ],
    },
}


# ──────────────────────────── Connection / env ───────────────────────────────

def _require_env(names):
    """Exit with a clear message if any required environment variable is unset."""
    missing = [n for n in names if not os.environ.get(n)]
    if missing:
        sys.exit(f"Missing required environment variable(s): {', '.join(missing)}")


def connect(with_openai):
    """Open a WCD client. The OpenAI header is attached when stages 2/3 run, so
    text2vec-openai can vectorize queries and the datasets upload can embed."""
    headers = None
    if with_openai:
        headers = {"X-OpenAI-Api-Key": os.environ["OPENAI_API_KEY"]}
    return weaviate.connect_to_weaviate_cloud(
        cluster_url=os.environ["WEAVIATE_URL"],
        auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
        headers=headers,
    )


def resolve_backup_dir():
    """Locate the snapshot directory: $WEAVIATE_BACKUP_DIR if set, else the
    newest ``backup_*`` directory next to this script."""
    env_dir = os.environ.get("WEAVIATE_BACKUP_DIR")
    if env_dir:
        if not os.path.isdir(env_dir):
            sys.exit(f"WEAVIATE_BACKUP_DIR is not a directory: {env_dir}")
        return env_dir

    here = os.path.dirname(os.path.abspath(__file__))
    candidates = sorted(d for d in glob.glob(os.path.join(here, "backup_*")) if os.path.isdir(d))
    if not candidates:
        sys.exit(
            "No snapshot found. The snapshot is not committed to the repo "
            "(it is hundreds of MB). Place a `backup_<timestamp>/` directory "
            "next to this script, or point $WEAVIATE_BACKUP_DIR at one. "
            "See tests/backups/README.md for how to obtain it."
        )
    return candidates[-1]


def load_metadata(backup_dir):
    with open(os.path.join(backup_dir, "backup_metadata.json")) as f:
        return json.load(f)


# ──────────────────────────── Stage 1: restore ───────────────────────────────

def infer_nested_properties(objects, prop_name):
    """Infer nested property schema from actual objects for object[] props."""
    seen = {}
    for obj in objects:
        items = obj.get("properties", {}).get(prop_name) or []
        for item in items:
            if not isinstance(item, dict):
                continue
            for k, v in item.items():
                if k not in seen and v is not None:
                    seen[k] = type(v)
    props = []
    for name, py_type in seen.items():
        dt = PYTHON_TO_DATATYPE.get(py_type, wvc.DataType.TEXT)
        props.append(wvc.Property(name=name, data_type=dt))
    return props


def detect_named_vectors(objects_file):
    """Return [(name, dim)] for any named vectors found in the first object."""
    with open(objects_file) as f:
        objects = json.load(f)
    if not objects:
        return []
    first_vec = objects[0].get("vector") or {}
    if not first_vec or list(first_vec.keys()) == ["default"]:
        return []
    return [(k, len(v)) for k, v in first_vec.items() if v]


def build_restore_properties(config, loaded_objects):
    """Build the property list for a snapshot collection, inferring nested
    schemas for object[] properties from the objects themselves."""
    obj_array_schemas = {}
    if loaded_objects:
        for p in config["properties"]:
            if p["data_type"] == "object[]":
                obj_array_schemas[p["name"]] = infer_nested_properties(loaded_objects, p["name"])
    # If any object[] prop has an empty inferred schema, borrow from a sibling.
    fallback = next((s for s in obj_array_schemas.values() if s), None)
    for k in list(obj_array_schemas):
        if not obj_array_schemas[k] and fallback:
            obj_array_schemas[k] = fallback

    properties = []
    for p in config["properties"]:
        dt = DATA_TYPE_MAP.get(p["data_type"])
        if dt is None:
            print(f"  WARNING: unknown data_type '{p['data_type']}' for {p['name']}, skipping")
            continue
        if p["data_type"] == "object[]":
            nested = obj_array_schemas.get(p["name"], [])
            if not nested:
                print(f"  WARNING: could not infer nested props for {p['name']}, skipping property")
                continue
            properties.append(wvc.Property(
                name=p["name"], data_type=dt, description=p.get("description"),
                nested_properties=nested,
            ))
            print(f"  Nested props for {p['name']}: {[n.name for n in nested]}")
        else:
            properties.append(wvc.Property(
                name=p["name"], data_type=dt, description=p.get("description"),
            ))
    return properties


def _already_populated(client, name, col_meta, existing):
    """For idempotency: True if the collection exists with objects (skip it);
    otherwise delete the empty/failed collection so it can be recreated."""
    if name not in existing:
        return False
    col = client.collections.get(name)
    if col_meta["is_multi_tenant"]:
        tenants = col.tenants.get()
        if tenants:
            first = list(tenants.keys())[0] if isinstance(tenants, dict) else tenants[0]
            try:
                tc = col.with_tenant(first if isinstance(first, str) else first.name)
                count = tc.aggregate.over_all(total_count=True).total_count
            except Exception:
                count = 0
            if count and count > 0:
                print(f"\nSkipping {name} (multi-tenant, has objects)")
                return True
    else:
        count = col.aggregate.over_all(total_count=True).total_count
        if count and count > 0:
            print(f"\nSkipping {name} ({count} objects already present)")
            return True
    print(f"\nDeleting empty/failed {name} to recreate")
    client.collections.delete(name)
    existing.discard(name)
    return False


def stage1_restore(client, backup_dir):
    print("\n========== Stage 1: restore (bulk replay) ==========")
    metadata = load_metadata(backup_dir)
    existing = set(client.collections.list_all().keys())
    print(f"Target cluster has {len(existing)} existing collections: {sorted(existing)}")

    for col_meta in metadata["collections"]:
        name = col_meta["name"]
        if name in AGENTS_OWNED_COLLECTIONS:
            print(f"\nSkipping {name} (agents-owned — created by the Query Agent tests, not the snapshot)")
            continue

        objects_file = os.path.join(backup_dir, col_meta["objects_file"]) if col_meta.get("objects_file") else ""
        with open(os.path.join(backup_dir, col_meta["config_file"])) as f:
            config = json.load(f)

        if _already_populated(client, name, col_meta, existing):
            continue

        print(f"\nRestoring collection: {name}")

        loaded_objects = None
        if os.path.exists(objects_file):
            with open(objects_file) as f:
                loaded_objects = json.load(f)

        properties = build_restore_properties(config, loaded_objects)

        gen_str = config.get("generative_config") or ""
        generative_config = wvc.Configure.Generative.openai() if "generative-openai" in gen_str else None

        mt_str = config.get("multi_tenancy_config") or ""
        mt_config = wvc.Configure.multi_tenancy(enabled=True) if "enabled=True" in mt_str else None

        # Reconstruct named-vector slots (without a vectorizer) when the snapshot
        # stored multiple named vectors. Single-vector collections stay legacy.
        named_vectors = None
        if not col_meta["is_multi_tenant"] and os.path.exists(objects_file):
            vec_info = detect_named_vectors(objects_file)
            if vec_info:
                named_vectors = [wvc.Configure.NamedVectors.none(name=n) for n, _ in vec_info]
                print(f"  Named vectors: {[n for n, _ in vec_info]}")

        client.collections.create(
            name=name,
            description=config.get("description"),
            properties=properties,
            generative_config=generative_config,
            multi_tenancy_config=mt_config,
            vectorizer_config=named_vectors if named_vectors else None,
        )
        print(f"  Created schema with {len(properties)} properties")

        collection = client.collections.get(name)
        _insert_objects(collection, col_meta, backup_dir, coerce=lambda v: v if v else None)

    print("\n✓ Stage 1 complete")


# ─────────────────────────── Stage 2: repopulate ─────────────────────────────

def build_vectorizer_config(specs):
    """Legacy Vectorizer config (single 'default' spec) or a list of
    NamedVectors. Pinned to ada-002 to match the snapshot's stored 1536-d
    vectors — the v4 default (text-embedding-3-small) would query in a different
    embedding space and return semantically wrong results."""
    if len(specs) == 1 and specs[0] == "default":
        return wvc.Configure.Vectorizer.text2vec_openai(model="ada", model_version="002")
    configs = []
    for spec in specs:
        if isinstance(spec, str):
            configs.append(wvc.Configure.NamedVectors.text2vec_openai(
                name=spec, model="ada", model_version="002"))
        else:
            name, source_props = spec
            configs.append(wvc.Configure.NamedVectors.text2vec_openai(
                name=name, source_properties=source_props, model="ada", model_version="002"))
    return configs


def build_repopulate_properties(config):
    """Property list for a repopulated collection. object[] props are skipped —
    the searchable collections don't use them."""
    props = []
    for p in config["properties"]:
        dt = DATA_TYPE_MAP.get(p["data_type"])
        if dt is None or p["data_type"] == "object[]":
            print(f"  Skipping property {p['name']} (data_type={p['data_type']})")
            continue
        props.append(wvc.Property(name=p["name"], data_type=dt, description=p.get("description")))
    return props


def stage2_repopulate(client, backup_dir):
    print("\n========== Stage 2: repopulate (vectorizer + schema repair) ==========")
    metadata = load_metadata(backup_dir)

    for col_meta in metadata["collections"]:
        name = col_meta["name"]
        if name not in COLLECTIONS_TO_FIX:
            continue

        print(f"\n=== Fixing {name} ===")
        with open(os.path.join(backup_dir, col_meta["config_file"])) as f:
            config = json.load(f)

        properties = build_repopulate_properties(config)
        vectorizer_config = build_vectorizer_config(COLLECTIONS_TO_FIX[name])

        gen_str = config.get("generative_config") or ""
        generative_config = wvc.Configure.Generative.openai() if "generative-openai" in gen_str else None

        mt_str = config.get("multi_tenancy_config") or ""
        mt_config = wvc.Configure.multi_tenancy(enabled=True) if "enabled=True" in mt_str else None

        if client.collections.exists(name):
            print(f"  Deleting existing {name}")
            client.collections.delete(name)

        extra = EXTRA_SCHEMA.get(name, {})
        client.collections.create(
            name=name,
            description=config.get("description"),
            properties=properties,
            references=extra.get("references"),
            inverted_index_config=extra.get("inverted_index_config"),
            vectorizer_config=vectorizer_config,
            generative_config=generative_config,
            multi_tenancy_config=mt_config,
        )
        vec_names = [s if isinstance(s, str) else s[0] for s in COLLECTIONS_TO_FIX[name]]
        print(f"  Created with text2vec-openai for vectors: {vec_names}")

        # Legacy single vectorizer expects an unnamed vector, not the
        # {"default": [...]} dict the snapshot stores — unwrap it on insert.
        uses_legacy = len(COLLECTIONS_TO_FIX[name]) == 1 and COLLECTIONS_TO_FIX[name][0] == "default"

        def coerce(vec):
            if not vec:
                return None
            if uses_legacy and isinstance(vec, dict):
                return vec.get("default") or None
            return vec

        collection = client.collections.get(name)
        _insert_objects(collection, col_meta, backup_dir, coerce=coerce)

    print("\n✓ Stage 2 complete")


# ──────────────────────────── Stage 3: jeopardy ──────────────────────────────

def stage3_jeopardy(client):
    """Re-ingest JeopardyQuestion + JeopardyCategory from the canonical
    weaviate-demo-datasets package. It ships clean ada-002 vectors AND the
    per-object hasCategory cross-references the snapshot lost. Overwrites
    whatever stages 1/2 produced for these two collections (intentional)."""
    print("\n========== Stage 3: canonical Jeopardy reseed ==========")
    import weaviate_datasets as wd

    ds = wd.JeopardyQuestions10k()
    ds.upload_dataset(client, overwrite=True, batch_size=200)

    for name in ("JeopardyQuestion", "JeopardyCategory"):
        count = client.collections.get(name).aggregate.over_all(total_count=True).total_count
        print(f"{name}: {count} objects")
    print("\n✓ Stage 3 complete")


# ──────────────────────────── Shared insert path ─────────────────────────────

def _insert_objects(collection, col_meta, backup_dir, coerce):
    """Batch-insert a collection's objects from the snapshot, applying `coerce`
    to each stored vector. Handles both multi-tenant and single-tenant layouts."""
    if col_meta["is_multi_tenant"]:
        tenants_info = col_meta.get("tenants", [])
        collection.tenants.create([Tenant(name=t["tenant_name"]) for t in tenants_info])
        print(f"  Created {len(tenants_info)} tenants")
        for tenant_info in tenants_info:
            tenant_name = tenant_info["tenant_name"]
            with open(os.path.join(backup_dir, tenant_info["objects_file"])) as f:
                objects = json.load(f)
            tenant_col = collection.with_tenant(tenant_name)
            with tenant_col.batch.dynamic() as batch:
                for obj in objects:
                    batch.add_object(
                        properties=obj["properties"],
                        uuid=obj["uuid"],
                        vector=coerce(obj.get("vector")),
                    )
            failed = tenant_col.batch.failed_objects
            print(f"  Tenant {tenant_name}: {len(objects)} objects ({len(failed)} batch errors)")
            for err in failed[:3]:
                print(f"    Error: {err.message}")
    else:
        with open(os.path.join(backup_dir, col_meta["objects_file"])) as f:
            objects = json.load(f)
        with collection.batch.dynamic() as batch:
            for i, obj in enumerate(objects):
                batch.add_object(
                    properties=obj["properties"],
                    uuid=obj["uuid"],
                    vector=coerce(obj.get("vector")),
                )
                if (i + 1) % 1000 == 0:
                    print(f"  {i+1}/{len(objects)} objects...")
        failed = collection.batch.failed_objects
        print(f"  Inserted {len(objects)} objects ({len(failed)} batch errors)")
        for err in failed[:3]:
            print(f"    Error: {err.message}")


# ─────────────────────────────────── CLI ─────────────────────────────────────

def parse_stages(value):
    """Parse --stage ('all' or a comma-separated subset of 1,2,3) → sorted list."""
    if value.strip().lower() == "all":
        return [1, 2, 3]
    stages = []
    for part in value.split(","):
        part = part.strip()
        if part not in {"1", "2", "3"}:
            raise argparse.ArgumentTypeError(f"invalid stage {part!r}; use 1, 2, 3, or 'all'")
        stages.append(int(part))
    return sorted(set(stages))


def main():
    parser = argparse.ArgumentParser(
        description="Restore the docs CI WCD test cluster from a snapshot.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--stage",
        type=parse_stages,
        default="all",
        help="Stages to run: 'all' (default), or a comma-separated subset, e.g. '1' or '2,3'.",
    )
    args = parser.parse_args()
    stages = args.stage if isinstance(args.stage, list) else parse_stages(args.stage)

    need_snapshot = bool({1, 2} & set(stages))
    need_openai = bool({2, 3} & set(stages))

    required = ["WEAVIATE_URL", "WEAVIATE_API_KEY"]
    if need_openai:
        required.append("OPENAI_API_KEY")
    _require_env(required)

    backup_dir = resolve_backup_dir() if need_snapshot else None
    if backup_dir:
        print(f"Using snapshot: {backup_dir}")
    print(f"Running stage(s): {', '.join(map(str, stages))}")

    client = connect(with_openai=need_openai)
    try:
        if 1 in stages:
            stage1_restore(client, backup_dir)
        if 2 in stages:
            stage2_repopulate(client, backup_dir)
        if 3 in stages:
            stage3_jeopardy(client)
        print("\n✓ Restore finished")
    finally:
        client.close()


if __name__ == "__main__":
    main()
