# Testing `llms.txt` code snippets

The `llms.txt` file lives in the **`weaviate-io`** repo (`static/llms.txt`, served at
`https://weaviate.io/llms.txt`). It contains Python, TypeScript, Java, and C# code
snippets. This directory tests those snippets so they cannot drift from working code.

## Why

`llms.txt` is hand-maintained in a different repo. Untested snippets rot: APIs
change, and an LLM consuming `llms.txt` then emits broken code. Several real bugs
were already found this way (re-declared `const`, wrong argument order, a
vectorizer that silently returns no results).

## How it works — two layers

1. **Execution tests** — every snippet is duplicated in this repo as a runnable
   script/test and run against a live Weaviate in the normal language CI jobs.
2. **Coverage test** (`test_llms_txt_code.py`) — fetches `llms.txt` and asserts
   every code block appears **verbatim** inside a tested snippet. This is what
   links the two repos.

`llms.txt` is the source of truth for *what users see*; the docs-repo snippets are
the source of truth for *what is verified*. The coverage test forces them equal.

## File layout

```
_includes/code/llms-txt/python/*.py           # one file per section
_includes/code/llms-txt/typescript/*.ts       # one file per section
_includes/code/java-v6/src/test/java/LlmsTxtTest.java   # one @Test per section
_includes/code/csharp/LlmsTxtTest.cs          # one [Fact] per section
tests/test_python.py / test_typescript.py / test_java.py / test_csharp.py
                                              # `test_llms_txt*` wires snippets in
tests/test_llms_txt_code.py                   # the coverage test
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

Start the test stack first: `tests/start-weaviate.sh`.

```bash
# Execution tests (per language)
uv run pytest tests/test_python.py     -k test_llms_txt
uv run pytest tests/test_typescript.py -k test_llms_txt
uv run pytest tests/test_java.py       -k test_llms_txt
uv run pytest tests/test_csharp.py     -k test_llms_txt

# Coverage test — fetches https://weaviate.io/llms.txt by default
uv run pytest tests/test_llms_txt_code.py

# Coverage test against a local (un-deployed) weaviate-io checkout
LLMS_TXT_PATH=/path/to/weaviate-io/static/llms.txt uv run pytest tests/test_llms_txt_code.py
```

`wcd`/`agents` snippets (quickstart, Query Agent) need `WEAVIATE_URL` and
`WEAVIATE_API_KEY` for a Weaviate Cloud cluster. The coverage test needs neither
Weaviate nor keys — it only parses text.

## Adding or changing a snippet

1. Edit (or add) the runnable file under `_includes/code/llms-txt/` (Python/TS) or
   `LlmsTxtTest.{java,cs}`, keeping the `llms.txt`-facing code between `START`/`END`
   markers.
2. Run that language's `test_llms_txt` and confirm it passes — **never** hand-write
   a snippet without running it.
3. Copy the verified marked region **verbatim** into `weaviate-io/static/llms.txt`.
4. New file? Add its path to the `test_llms_txt` parametrize list in the matching
   `tests/test_*.py`.

## Coverage test details

`test_llms_txt_code.py`:

- Fetches `https://weaviate.io/llms.txt`; **skips** (does not fail) on network
  error, so it cannot flake CI.
- `LLMS_TXT_PATH` overrides the source with a local file.
- Parses every ```` ```python / ```ts / ```java / ```csharp ```` block and requires
  an identical `START`/`END` region in the snippet files.
- Marked `@pytest.mark.llms_txt` (run with `-m llms_txt`).

## Cross-repo deploy ordering

The coverage test reads the **live** `llms.txt`, so it only passes once `weaviate-io`
**deploys** an `llms.txt` matching the snippet files in this repo. During the window
between updating the snippets here and deploying `weaviate-io`, the test reports the
drift — that is correct, not a bug.

When wiring the coverage test into CI: gate it normally only after the matching
`weaviate-io` change is live; otherwise mark it `@pytest.mark.xfail(strict=False)`
until the deploy, then remove the xfail.

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
