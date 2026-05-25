# Testing `llms.txt`

The `llms.txt` file lives in the **`weaviate-io`** repo (`static/llms.txt`, served at
`https://weaviate.io/llms.txt`). It contains Python, TypeScript, Java, and C# code
snippets, recommended versions, and inline links. This directory tests all of that
so the published file cannot drift from working code or current releases.

## Why

`llms.txt` is hand-maintained in a different repo. Untested content rots: APIs
change, releases ship, marketing pages move. Real bugs already caught this way
include re-declared `const`s, swapped function arguments, a vectorizer that
silently returns no results, version recommendations stuck two minor releases
behind, and a 404 on one of the linked LLM-twin pages.

## How it works — two layers

1. **Execution tests** — every snippet is duplicated in this repo as a runnable
   script/test and run against a live Weaviate in the normal language CI jobs.
2. **`test_llms_txt_code.py`** — three guard tests that compare the *live*
   `llms.txt` against the rest of the world:
   - **Snippet coverage** — every code block in `llms.txt` exists verbatim
     between `START`/`END` markers in a tested snippet file.
   - **Version freshness** — every recommended library version matches the
     latest release on the corresponding `weaviate/*` GitHub repo.
   - **Link validity** — every URL in `llms.txt` (outside code blocks)
     resolves to a 2xx/3xx response.

`llms.txt` is the source of truth for *what users see*; the docs-repo snippets
are the source of truth for *what is verified*; the GitHub Releases API is the
source of truth for *what's current*. The three guard tests force these in sync.

## File layout

```
_includes/code/llms-txt/python/*.py           # one file per section
_includes/code/llms-txt/typescript/*.ts       # one file per section
_includes/code/java-v6/src/test/java/LlmsTxtTest.java   # one @Test per section
_includes/code/csharp/LlmsTxtTest.cs          # one [Fact] per section
tests/test_python.py / test_typescript.py / test_java.py / test_csharp.py
                                              # `test_llms_txt*` wires snippets in
tests/test_llms_txt_code.py                   # snippet coverage + version + link tests
```

Sections covered: local connection, CRUD, queries (near_text/bm25), filtering,
multi-tenancy, named vectors, aggregations, generative search, RBAC, quickstart,
Query Agent.

- **Quickstart** and **Query Agent** are Python/TypeScript only — Query Agent has
  no Java/C# SDK; the quickstart runs against Weaviate Cloud.
- Java and C# therefore have 9 snippets each; Python and TypeScript have 11.

## Snippet markers

Each runnable file wraps the exact `llms.txt` block between markers:

```python
# START llms_multi_tenancy
... code identical to the llms.txt block ...
# END llms_multi_tenancy
```

(`//` for TS/Java/C#.) Everything outside the markers — connection setup, seed
data, assertions, cleanup — is test scaffolding and is **not** in `llms.txt`. The
coverage test compares only the marked region, after whitespace normalization.

## The vectorizer rule

`text2vec-weaviate` (Weaviate Embeddings) needs a hosted-service token and cannot
run on the local/CI instance. So:

- **Local-instance snippets** use `text2vec-ollama` (and `generative-ollama`)
  pointed at `http://ollama:11434` — keyless, runs in CI.
- **The Cloud quickstart** keeps `text2vec-weaviate`, since it connects to
  Weaviate Cloud where Embeddings is available.

The snippet files and the `llms.txt` blocks must match, so both use `text2vec-ollama`
for local examples. Do not "fix" `llms.txt` back to `text2vec-weaviate`.

## Running the tests

Start the local test stack first: `tests/start-weaviate.sh`.

```bash
# Execution tests (per language) — run the snippet code against live Weaviate
uv run pytest tests/test_python.py     -k test_llms_txt
uv run pytest tests/test_typescript.py -k test_llms_txt
uv run pytest tests/test_java.py       -k test_llms_txt
uv run pytest tests/test_csharp.py     -k test_llms_txt

# Three guard tests — fetch https://weaviate.io/llms.txt by default
uv run pytest tests/test_llms_txt_code.py -m llms_txt

# Validate a local (un-deployed) weaviate-io checkout instead of the live file
LLMS_TXT_PATH=/path/to/weaviate-io/static/llms.txt \
    uv run pytest tests/test_llms_txt_code.py -m llms_txt
```

`wcd` / `agents` execution snippets (quickstart, Query Agent) need `WEAVIATE_URL`
and `WEAVIATE_API_KEY` for a Weaviate Cloud cluster. The three guard tests need
no Weaviate cluster.

### Environment variables

| Variable | What it does | Used by |
|---|---|---|
| `LLMS_TXT_PATH` | Read `llms.txt` from a local file instead of fetching the live URL | all three guards |
| `GH_API_TOKEN` | GitHub Personal Access Token. Raises GitHub's anonymous rate limit (60/hr → 5000/hr) for the version freshness test | `test_llms_txt_recommended_versions_are_current` |
| `WEAVIATE_URL`, `WEAVIATE_API_KEY` | Cloud cluster the quickstart + Query Agent execution snippets connect to | execution tests only |

## Adding or changing a snippet

1. Edit (or add) the runnable file under `_includes/code/llms-txt/` (Python/TS) or
   `LlmsTxtTest.{java,cs}`, keeping the `llms.txt`-facing code between `START`/`END`
   markers.
2. Run that language's `test_llms_txt` and confirm it passes — **never** hand-write
   a snippet without running it.
3. Copy the verified marked region **verbatim** into `weaviate-io/static/llms.txt`.
4. New file? Add its path to the `test_llms_txt` parametrize list in the matching
   `tests/test_*.py`.

## What `test_llms_txt_code.py` checks

All three tests are marked `@pytest.mark.llms_txt` and read `llms.txt` from the
live URL by default (or `LLMS_TXT_PATH` if set). Network failure on any of them
results in `pytest.skip(...)` rather than a failure — they can't flake CI.

### 1. `test_llms_txt_snippets_are_covered`

Parses every ```` ```python / ```ts / ```java / ```csharp ```` block out of
`llms.txt`, normalizes whitespace, and requires an identical `START`/`END`
region in the matching snippet file. Failure message lists each uncovered block
so you can see exactly which snippet drifted.

### 2. `test_llms_txt_recommended_versions_are_current`

Parses each `- **Library**: vX.Y.Z+` bullet under *Latest versions* and compares
the captured version to the `tag_name` from
`https://api.github.com/repos/weaviate/<repo>/releases/latest`. Mapping today:

| `llms.txt` label | GitHub repo |
|---|---|
| `Weaviate Server` | `weaviate/weaviate` |
| `Python client` | `weaviate/weaviate-python-client` |
| `TypeScript client` | `weaviate/typescript-client` |
| `Java client` | `weaviate/java-client` |
| `C# client` | `weaviate/csharp-client` |
| `Agents SDK` | `weaviate/weaviate-agents-python-client` |

`/releases/latest` already filters out pre-releases and drafts, so a single API
call per repo is enough. Only libraries actually listed in `llms.txt` are
checked — adding a new bullet there extends coverage automatically once the
label is added to `LIBRARY_SPECS`. `versions-config.json` is **not** consulted
(it's a manually-maintained build-time fallback that goes stale).

### 3. `test_llms_txt_links_resolve`

Strips ` ``` ... ``` ` code fences, extracts every markdown link (`[t](u)`) and
bare `https?://...` URL, then HEAD-checks them in parallel (12 worker threads,
15-second timeout). Falls back to GET on `405`/`501`. Status categories:

- **ok** — 2xx / 3xx
- **broken** — 404, 5xx, etc. — fails the test
- **skipped** — 401/403/429 (bot-block or rate-limit) and network exceptions —
  not a failure

If *every* URL was skipped (no successes anywhere) the whole test skips on the
assumption that the network is down. Uses a browser-style `User-Agent` to keep
Cloudflare-style false positives low.

## Cross-repo deploy ordering

The three guard tests all read the **live** `llms.txt`. That means they only go
green once `weaviate-io` **deploys** changes that match the docs-repo snippet
files / current releases / current URLs. During the window between updating
content and the next `weaviate-io` deploy, the tests correctly report the
drift — that's the design, not a bug.

When wiring these into a CI job, the same window applies: gate normally only
after the matching `weaviate-io` change is live; otherwise mark with
`@pytest.mark.xfail(strict=False)` until the deploy, then remove the xfail.

## CI

Two separate workflows cover this directory:

| Workflow | What it runs |
|---|---|
| `.github/workflows/docs_tests.yml` | Per-language **execution** tests — `test_llms_txt*` in `test_python.py`, `test_typescript.py`, `test_java.py`, `test_csharp.py`. Rides the existing `pyv4` / `ts` / `java` / `csharp` / `agents` markers, so no separate job for these. |
| `.github/workflows/llms_txt_tests.yml` | The three **guard tests** in `test_llms_txt_code.py` — snippet coverage, version freshness, link validity. Single job `test-llms-txt`, runs `uv run pytest tests/test_llms_txt_code.py -m "llms_txt"`. |

The guard workflow triggers on:

- **Schedule** — Sundays 23:00 UTC (offset 1h from `indexability_tests.yml`).
- **Push** to `testing-ci` or `llms-txt`.
- **`workflow_dispatch`** for manual runs.

It exports `GH_API_TOKEN: ${{ secrets.GITHUB_TOKEN }}` so the version-freshness
test gets GitHub's authenticated rate limit (5000/hr instead of 60/hr). No
Weaviate cluster, no Docker, no language toolchains — just Python + network,
so the job is fast (≈ 30-60s end-to-end).

Results post to Slack via the shared `./.github/actions/handle-test-results`
composite under `test-type: 'llms.txt'`, with `continue-on-error: true` on the
pytest step so the notification still fires when a guard fails.

## Per-language gotchas

- **Python** — `text2vec_ollama` / `generative_ollama` take `api_endpoint` and
  `model`. Generative uses a longer client `Timeout` (Ollama on CPU is slow).
- **TypeScript** — runs via `npx tsx`. `permissions.collections()` returns an
  **array** (spread it: `[...collections(...), ...data(...)]`); `assignRoles` is
  `(roleNames, userId)`. Use distinct `const` names per query.
- **Java** (`client6`) — `VectorConfig.text2vecOllama(...)` returns a
  `Map.Entry`, not a `VectorConfig`. `Target.text` is `(vectorName, query)`. The
  generative provider is passed per query, not on the collection.
- **C#** — verified against the `1.1.0` client. `Query.NearText`/`Generate.NearText`
  default-vector calls must use the plain-string overload; the builder-lambda's
  `INearTextBuilder` does not convert to `NearTextInput` (compiles, throws at
  runtime). Named-vector queries use the lambda + `.TargetVectorsMinimum(...)`.
