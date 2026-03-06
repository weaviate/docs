# Docs Indexability Tests

This test suite validates that AI agents (Claude, ChatGPT) and web search crawlers can access all documentation content from the live docs site at [docs.weaviate.io](https://docs.weaviate.io).

## Why these tests exist

Documentation content that is hidden behind JavaScript interactions (tabs, collapsibles) or lazy-loaded may be invisible to AI agents and search crawlers. These tests verify that:

1. All HTML content is present in the server-rendered page (tabs, collapsibles, code snippets)
2. Claude can fetch and read page content via its `web_fetch` tool
3. ChatGPT can find and read page content via its `web_search_preview` tool
4. `llms.txt` and `sitemap.xml` are accessible and well-formed

## Test structure

| Part | Marker | API keys needed | Description |
|------|--------|-----------------|-------------|
| HTML structure | `indexability` | None | Fetches pages with `requests` + `beautifulsoup4` and checks HTML |
| Claude agent | `indexability_agents` | `ANTHROPIC_API_KEY` | Uses Anthropic API with `web_fetch` tool |
| ChatGPT agent | `indexability_agents` | `OPENAI_API_KEY` | Uses OpenAI Responses API with `web_search_preview` tool |

### HTML structure tests (Part 1)

These tests fetch ~11 representative pages from all doc sections and check:

| Test | What it checks |
|------|---------------|
| `test_page_returns_200` | All pages return HTTP 200 |
| `test_meta_tags` | `<title>`, `<meta description>`, `og:title`, `og:description` present |
| `test_heading_hierarchy` | Exactly 1 `<h1>`, content pages have `<h2>`s |
| `test_tabbed_code_blocks_all_present` | ALL tab panels have content in HTML (not just active tab) |
| `test_code_blocks_present` | Pages with code have non-empty `<pre><code>` blocks. For the quickstart page, also verifies the exact vectorizer config line for all 5 languages is present in the HTML. |
| `test_details_content_present` | `<details>` elements have body content (not lazy-loaded) |
| `test_images_have_alt_text` | Content images have alt text (excludes decorative SVGs/icons) |
| `test_llms_txt_accessible` | `/llms.txt` returns 200, has substantial content, mentions Weaviate |
| `test_sitemap_accessible` | `/sitemap.xml` returns 200, has 100+ URLs |

### Claude agent tests (Part 2)

Uses Claude Haiku with the `web_fetch` tool:

| Test | What it checks |
|------|---------------|
| `test_claude_can_fetch_code_tabs` | Fetches `/weaviate/quickstart` and extracts the exact vectorizer config line for all 5 languages (Python, TypeScript, Go, Java, C#) |
| `test_claude_can_fetch_collapsible_content` | Fetches `/weaviate/config-refs/collections` and finds `text2vec-contextionary` inside a `<details>` block |
| `test_claude_can_fetch_llms_txt` | Fetches `/llms.txt` and identifies all 3 top-level sections (`agents`, `cloud`, `weaviate`) plus multi-language code examples |

### ChatGPT agent tests (Part 3)

Uses GPT-4.1 Mini with the `web_search_preview` tool:

| Test | What it checks |
|------|---------------|
| `test_chatgpt_can_search_code_tabs` | Finds the quickstart URL, identifies 3+ languages, and checks for vectorizer config lines (requires 3/5) |
| `test_chatgpt_can_search_collapsible_content` | Finds the config-refs URL and `text2vec-contextionary` from the collapsible JSON block |
| `test_chatgpt_can_search_llms_txt` | Finds `/llms.txt` URL, identifies all 3 top-level sections (`agents`, `cloud`, `weaviate`), and multi-language code examples |

## Running the tests

```bash
# HTML structure tests only (no API keys needed)
uv run pytest -m indexability -v

# Agent tests only (requires ANTHROPIC_API_KEY and OPENAI_API_KEY)
uv run pytest -m indexability_agents -v

# All indexability tests
uv run pytest -m "indexability or indexability_agents" -v
```

## CI workflow

The tests run via `.github/workflows/indexability_tests.yml`:

- **Schedule**: Every Sunday at 22:00 UTC
- **Manual**: Via workflow dispatch
- **Branch**: Runs on push to `testing-ci`
- **Runtime**: ~15 minutes maximum

HTML structure tests always run. Agent tests only run if `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` secrets are configured.

## Test pages

The suite tests 11 representative URLs covering all doc sections:

| Page | Features tested |
|------|----------------|
| `/weaviate/quickstart` | tabs, code (with vectorizer line check) |
| `/weaviate/manage-collections/collection-operations` | tabs, code, details |
| `/weaviate/search/similarity` | tabs, code |
| `/weaviate/search/hybrid` | tabs, code |
| `/weaviate/connections/connect-cloud` | tabs, code |
| `/weaviate/config-refs/collections` | details, table |
| `/weaviate/concepts/data-import` | images |
| `/cloud/quickstart` | code, images |
| `/cloud/manage-clusters/create` | images |
| `/agents/query/tutorial-ecommerce` | code |
| `/weaviate/search` | landing page |

## Quickstart vectorizer lines

The quickstart page has tabbed code for 5 languages. The tests verify these exact lines are present in the HTML and readable by Claude:

| Language | Vectorizer config line |
|----------|----------------------|
| Python | `Configure.Vectors.text2vec_weaviate()` |
| TypeScript | `vectors.text2VecWeaviate()` |
| Go | `Vectorizer: "text2vec-weaviate"` |
| Java | `VectorConfig.text2vecWeaviate()` |
| C# | `v.Text2VecWeaviate()` |

## Dependencies

- `beautifulsoup4` — HTML parsing
- `requests` — HTTP fetching (already in project)
- `anthropic` — Claude API for agent tests
- `openai` — OpenAI API for agent tests

All are listed in the root `pyproject.toml`.

## Adding test pages

To test additional pages, add entries to the `TEST_PAGES` list in `tests/test_docs_indexability.py`:

```python
TEST_PAGES = [
    ("/path/to/page", {"tabs", "code", "details", "images", "table"}),
    # ...
]
```

Available feature tags: `tabs`, `code`, `details`, `images`, `table`. Pages are parametrized — each feature tag enables the corresponding structural test for that page.
