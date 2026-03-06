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

These tests fetch ~10 representative pages from all doc sections and check:

| Test | What it checks |
|------|---------------|
| `test_page_returns_200` | All pages return HTTP 200 |
| `test_meta_tags` | `<title>`, `<meta description>`, `og:title`, `og:description` present |
| `test_heading_hierarchy` | Exactly 1 `<h1>`, content pages have `<h2>`s |
| `test_tabbed_code_blocks_all_present` | ALL tab panels have content in HTML (not just active tab) |
| `test_code_blocks_present` | Pages with code have non-empty `<pre><code>` blocks |
| `test_details_content_present` | `<details>` elements have body content (not lazy-loaded) |
| `test_images_have_alt_text` | Content images have alt text (excludes decorative SVGs/icons) |
| `test_llms_txt_accessible` | `/llms.txt` returns 200, has substantial content, mentions Weaviate |
| `test_sitemap_accessible` | `/sitemap.xml` returns 200, has 100+ URLs |

### Claude agent tests (Part 2)

Uses Claude Haiku with the `web_fetch` tool to verify Claude can:

- **Fetch quickstart code tabs** — fetches `/weaviate/quickstart` and must extract actual code lines for all 5 languages (Python, TypeScript, Go, Java, C#). Asserts on language-specific code tokens like `near_text` (Python), `nearText` (TS), `NearTextArgBuilder` (Go), etc.
- Fetch a page with collapsible sections and read the content
- Fetch `/llms.txt` and identify it as Weaviate documentation

### ChatGPT agent tests (Part 3)

Uses GPT-4.1 Mini with the `web_search_preview` tool to verify ChatGPT can:

- **Search quickstart code tabs** — searches for `/weaviate/quickstart` and must extract actual code lines for all 5 languages. Uses the same language-specific code token assertions as the Claude test.
- Search for and read Weaviate Cloud quickstart docs
- Search for and read Weaviate Agents docs

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

The suite tests ~10 representative URLs covering all doc sections:

| Page | Features tested |
|------|----------------|
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
