# WCD test-cluster restore

Tooling to rebuild the Weaviate Cloud (WCD) cluster the docs CI runs against,
from a point-in-time snapshot of every collection's schema and objects (with
their stored vectors and UUIDs).

## What's here

```
restore.py            # single entrypoint — runs stages 1–3 (see --stage)
README.md             # this file
backup_<timestamp>/   # the snapshot — NOT committed (see "The snapshot")
```

`restore.py` is the only script; the three restore stages are flags on it
(`--stage`). The snapshot directory is **not committed** — it is hundreds of MB
(one objects file alone is ~470 MB), so it is gitignored and obtained
separately (see below).

## The snapshot

A snapshot is a directory named `backup_<timestamp>/` with this layout:

| File pattern                         | Content                                          |
|--------------------------------------|--------------------------------------------------|
| `backup_metadata.json`               | Index: every collection's name, MT flag, tenants |
| `<Collection>_config.json`           | Schema (properties, generative/MT config, …)     |
| `<Collection>_objects.json`          | Objects, UUIDs, and stored vectors               |
| `<Collection>_<tenant>_objects.json` | MT objects, one file per tenant                  |

The current baseline, `backup_20251126_164527/`, was taken on 2025-11-26 and
contains 23 collections (one multi-tenant). Because it is gitignored, it is
**not in a clean checkout** — ask another maintainer for a copy, or restore from
wherever your team stores it, and drop it next to `restore.py`.

`restore.py` locates the snapshot in this order:

1. `$WEAVIATE_BACKUP_DIR`, if set, or
2. the newest `backup_*` directory next to `restore.py`.

Stages 1 and 2 read the snapshot; stage 3 does not (it uses the canonical
dataset package), so a stage-3-only run needs no snapshot.

### Collections owned by the agents tests

`restore.py` **skips** `ECommerce`, `Weather`, and `FinancialContracts` (the
`AGENTS_OWNED_COLLECTIONS` set). They are owned by the Query Agent tests
(`docs/agents/_includes/query_agent.*`), which create them with
`text2vec-weaviate` named vectors and load their data from HuggingFace — but
only `if not collections.exists(...)`. The snapshot's lossy copies (no
vectorizer config) would shadow that and break named-vector queries
(`WEAVIATE_NAMED_VECTOR_ERROR` / `collection_vectors: []`). So a restore rebuilds
**20** collections; the agents tests manage the other three. No non-agents test
depends on the snapshot versions.

## Why three stages

The original backup tool serialized config via `str(...)`, which dropped
structured details: vectorizer config, cross-references, inverted-index flags.
Stage 1 alone gives a cluster with all the *data* back, but `near_text`/`hybrid`
are silently broken because the vectorizer is unset — queries can't be embedded
at runtime. Stage 2 plugs that hole for the 8 collections the docs tests
actually search. Stage 3 reseeds Jeopardy from the canonical package because the
snapshot lost `JeopardyQuestion.hasCategory` too.

```
--stage 1   restore (bulk replay)
  ├─ recreates schemas from *_config.json
  ├─ batch-inserts objects with stored vectors + UUIDs
  ├─ idempotent (skips collections with objects, recreates empty ones)
  └─ vectorizer left at "none" → near_vector works, near_text does not

--stage 2   repopulate            (drops + recreates 8 specific collections)
  ├─ adds text2vec-openai (ada-002) so near_text/hybrid work
  ├─ adds cross-references + inverted-index flags the original tool lost
  └─ re-imports preserving stored vectors (no re-embedding cost)

--stage 3   jeopardy reseed       (overwrites Jeopardy from canonical pkg)
  ├─ ignores the snapshot for JeopardyQuestion + JeopardyCategory
  └─ uploads weaviate_datasets.JeopardyQuestions10k() with overwrite=True
```

## Running the restore

```bash
export WEAVIATE_URL="<cluster host without scheme>"
export WEAVIATE_API_KEY="<admin api key>"
export OPENAI_API_KEY="<openai key>"        # stages 2 + 3 only

uv run python tests/backups/restore.py              # all stages (default)
uv run python tests/backups/restore.py --stage 1    # one stage
uv run python tests/backups/restore.py --stage 2,3  # a subset
```

A clean restore on an empty cluster takes a few minutes; stage 1 is the slowest
because of the 10k-object `JeopardyQuestion` batch insert.

- **Stage 1 is idempotent** — re-running it skips collections that already have
  objects (and recreates empty/failed ones).
- **Stages 2 and 3 are destructive** — they delete and recreate the collections
  they touch.

Stage 1 needs only `WEAVIATE_URL` + `WEAVIATE_API_KEY`. Stages 2 and 3 also need
`OPENAI_API_KEY` because the recreated collections use `text2vec-openai` as the
vectorizer (passed via the `X-OpenAI-Api-Key` header). `restore.py` validates
that the variables required by the selected stages are set before connecting.

## Why ada-002 specifically (don't change this)

The stored vectors in the snapshot are 1536-d `text-embedding-ada-002`. Stage 2
pins the vectorizer to `text-embedding-ada-002` so that **query-time** embedding
lands in the same space as the **stored** vectors. Using v4's current default
(`text-embedding-3-small`) would silently return semantically wrong results —
the embedding spaces don't overlap.

## What stage 2 fixes per collection

Stage 2 only touches the 8 collections the docs tests semantically search
(`COLLECTIONS_TO_FIX` in `restore.py`); everything else stays as stage 1
restored it.

| Collection           | Vectorizer                                            | Other repairs                                                     |
|----------------------|-------------------------------------------------------|-------------------------------------------------------------------|
| `JeopardyQuestion`   | `text2vec-openai` (ada-002), single                   | `hasCategory` cross-ref → `JeopardyCategory`                      |
| `Article`            | single                                                | `inPublication`, `hasAuthors` cross-refs; `index_timestamps=true` |
| `ArxivPapers`        | single                                                | —                                                                 |
| `Publication`        | single                                                | `hasArticles` cross-ref → `Article`                               |
| `WineReview`         | single                                                | `index_null_state=true` (tests filter `IsNull`)                   |
| `WineReviewMT`       | single (MT)                                           | `index_null_state=true`                                           |
| `GitBookChunk`       | single                                                | —                                                                 |
| `WineReviewNV`       | named vectors `title`, `title_country`, `review_body` | `index_null_state=true`                                           |

`WineReviewNV` is the only collection with multiple named vectors; everything
else uses the legacy single `"default"` vectorizer.

### A wire-format quirk worth knowing

When a collection uses the legacy single-vectorizer form (not named vectors),
inserts expect an **unnamed** vector. The snapshot stores it as
`{"default": [...]}` (the named-vector shape). The stage-2 `coerce` closure in
`restore.py` unwraps the `default` key before batch insert. Without that,
inserts to those collections fail with a wire-format error.

## Stage 3 — why Jeopardy gets its own path

The snapshot's `JeopardyQuestion` lost the `hasCategory` cross-reference (the
original backup tool didn't serialize references at all). Stage 2 declares the
reference, but the per-object reference data isn't in the snapshot, so reads
would still return empty for `hasCategory`. Stage 3 calls
`weaviate_datasets.JeopardyQuestions10k().upload_dataset(...)`, which ships clean
ada-002 vectors **and** the per-object `hasCategory` links wired up.

Stage 3 overwrites stage 2's Jeopardy work (`overwrite=True`). That's
intentional — stage 2 keeps Jeopardy in its loop because it's the simplest
re-import for the other 8 collections, and stage 3 then supersedes Jeopardy with
the canonical source. The cluster ends at exactly 10,000 Jeopardy objects
(stage 1 imports 10,004 from the snapshot; stage 3 finishes at 10,000).

## Verifying a restore worked

A few quick sanity checks against the restored cluster (run with the same env
vars):

```python
import os, weaviate
from weaviate.classes.init import Auth

c = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
    headers={"X-OpenAI-Api-Key": os.environ["OPENAI_API_KEY"]},
)
try:
    for name, expected in [("JeopardyQuestion", 10000), ("Article", 4403),
                           ("ArxivPapers", 2000), ("WineReview", 50)]:
        n = c.collections.get(name).aggregate.over_all(total_count=True).total_count
        print(f"{name}: {n}{' ✓' if n == expected else f' (expected {expected})'}")
    # Query-time vectorization works (proves stage 2 ran):
    r = c.collections.get("JeopardyQuestion").query.near_text("famous scientists", limit=1)
    print(f"near_text: {r.objects[0].properties.get('question')!r}")
finally:
    c.close()
```

Expected counts after a fresh restore (stages 1 → 2 → 3). `ECommerce`,
`Weather`, and `FinancialContracts` are intentionally absent — the agents tests
own them.

| Collection                      | Count             |
|---------------------------------|-------------------|
| `JeopardyQuestion`              | 10,000            |
| `Article`                       | 4,403             |
| `ArxivPapers`                   | 2,000             |
| `Recipes`                       | 100               |
| `WineReview` / `WineReviewNV`   | 50 / 50           |
| `WineReviewMT`                  | 50 per tenant × 2 |
| `GitBookChunk` / `JeopardyTiny` | 10 / 10           |
| `JeopardyCategory`              | 40                |
| `Movie`                         | 3                 |

## Taking a new snapshot

There is **no snapshot script here** — `restore.py` only *reads* a snapshot. The
current one was produced by a separate tool (iterating
`client.collections.list_all()` and dumping properties + objects + vectors per
collection). If you ever need a newer baseline:

1. Produce the same file layout (`backup_metadata.json` plus per-collection
   `_config.json` / `_objects.json`) in a new `backup_<timestamp>/` directory.
2. Be aware of the lossy fields the original tool didn't capture — the schema
   features in the `EXTRA_SCHEMA` map in `restore.py` (references,
   `index_timestamps`, `index_null_state`). Either fix the backup tool to
   serialize them properly, or extend `EXTRA_SCHEMA`.
3. `restore.py` auto-detects the newest `backup_*` directory, so no code change
   is needed; or point `$WEAVIATE_BACKUP_DIR` at the new directory explicitly.

## When to restore

- The CI test cluster gets wedged after a failed test run (collections in
  inconsistent states, half-deleted data, etc.).
- You're spinning up a fresh WCD cluster for testing and want the same baseline
  the docs CI uses.
- You suspect a flaky test is caused by cluster drift, not a real regression.
