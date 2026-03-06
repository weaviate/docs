"""
Docs Indexability Test Suite

Validates that AI agents and web crawlers can access all documentation content
from the live docs site. Tests cover:
1. HTML structure (tabs, collapsibles, code snippets visible in source)
2. Claude web_fetch tool access
3. ChatGPT web_search_preview tool access
4. llms.txt and sitemap.xml accessibility
"""

import os
import time
from functools import lru_cache

import pytest
import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_URL = "https://docs.weaviate.io"

# Representative pages with expected features
TEST_PAGES = [
    ("/weaviate/manage-collections/collection-operations", {"tabs", "code", "details"}),
    ("/weaviate/search/similarity", {"tabs", "code"}),
    ("/weaviate/search/hybrid", {"tabs", "code"}),
    ("/weaviate/connections/connect-cloud", {"tabs", "code"}),
    ("/weaviate/config-refs/collections", {"details", "table"}),
    ("/weaviate/concepts/data-import", {"images"}),
    ("/cloud/quickstart", {"code", "images"}),
    ("/cloud/manage-clusters/create", {"images"}),
    ("/agents/query/tutorial-ecommerce", {"code"}),
    ("/weaviate/search", set()),  # landing page
]

ALL_PATHS = [path for path, _ in TEST_PAGES]

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

_page_cache: dict[str, requests.Response] = {}
_last_fetch_time: float = 0


def _fetch_page(path: str) -> requests.Response:
    """Fetch a page with caching and 1-second rate limiting."""
    global _last_fetch_time

    if path in _page_cache:
        return _page_cache[path]

    elapsed = time.time() - _last_fetch_time
    if elapsed < 1:
        time.sleep(1 - elapsed)

    url = f"{BASE_URL}{path}"
    resp = requests.get(url, timeout=30, headers={"User-Agent": "WeaviateDocsIndexabilityTest/1.0"})
    _last_fetch_time = time.time()
    _page_cache[path] = resp
    return resp


def _get_soup(path: str) -> BeautifulSoup:
    resp = _fetch_page(path)
    return BeautifulSoup(resp.text, "html.parser")


def _features_for(path: str) -> set[str]:
    for p, features in TEST_PAGES:
        if p == path:
            return features
    return set()


# ---------------------------------------------------------------------------
# Part 1: HTML Structure Tests (no API keys needed)
# ---------------------------------------------------------------------------


@pytest.mark.indexability
@pytest.mark.parametrize("path", ALL_PATHS)
def test_page_returns_200(path):
    """All doc pages return HTTP 200."""
    resp = _fetch_page(path)
    assert resp.status_code == 200, f"{path} returned {resp.status_code}"


@pytest.mark.indexability
@pytest.mark.parametrize("path", ALL_PATHS)
def test_meta_tags(path):
    """Pages have essential meta tags for SEO and social sharing."""
    soup = _get_soup(path)

    title = soup.find("title")
    assert title and title.string and len(title.string.strip()) > 0, f"{path}: missing <title>"

    desc = soup.find("meta", attrs={"name": "description"})
    assert desc and desc.get("content"), f"{path}: missing meta description"

    og_title = soup.find("meta", attrs={"property": "og:title"})
    assert og_title and og_title.get("content"), f"{path}: missing og:title"

    og_desc = soup.find("meta", attrs={"property": "og:description"})
    assert og_desc and og_desc.get("content"), f"{path}: missing og:description"


@pytest.mark.indexability
@pytest.mark.parametrize("path", ALL_PATHS)
def test_heading_hierarchy(path):
    """Pages have exactly 1 h1 and content pages have h2s."""
    soup = _get_soup(path)

    h1s = soup.find_all("h1")
    assert len(h1s) == 1, f"{path}: expected 1 h1, found {len(h1s)}"

    # Content pages (not landing pages) should have h2s
    features = _features_for(path)
    if features:  # non-empty features means it's a content page
        h2s = soup.find_all("h2")
        assert len(h2s) > 0, f"{path}: content page has no h2 headings"


@pytest.mark.indexability
@pytest.mark.parametrize(
    "path",
    [p for p, f in TEST_PAGES if "tabs" in f],
    ids=[p for p, f in TEST_PAGES if "tabs" in f],
)
def test_tabbed_code_blocks_all_present(path):
    """ALL tab panels have content in HTML (not just the active tab)."""
    soup = _get_soup(path)

    # Docusaurus tabs use role="tabpanel" inside a tabs container
    tab_panels = soup.find_all(attrs={"role": "tabpanel"})
    assert len(tab_panels) > 0, f"{path}: no tab panels found"

    # Check that tab panels have content (even hidden ones should be in DOM)
    # Docusaurus renders all tab content in HTML but hides inactive with CSS
    panels_with_content = [
        panel for panel in tab_panels
        if panel.get_text(strip=True)
    ]
    assert len(panels_with_content) >= 2, (
        f"{path}: expected multiple tab panels with content, "
        f"found {len(panels_with_content)} of {len(tab_panels)}"
    )


@pytest.mark.indexability
@pytest.mark.parametrize(
    "path",
    [p for p, f in TEST_PAGES if "code" in f],
    ids=[p for p, f in TEST_PAGES if "code" in f],
)
def test_code_blocks_present(path):
    """Pages with code feature have non-empty <pre><code> blocks."""
    soup = _get_soup(path)

    code_blocks = soup.find_all("pre")
    assert len(code_blocks) > 0, f"{path}: no <pre> code blocks found"

    non_empty = [
        block for block in code_blocks
        if block.get_text(strip=True)
    ]
    assert len(non_empty) > 0, f"{path}: all code blocks are empty"


@pytest.mark.indexability
@pytest.mark.parametrize(
    "path",
    [p for p, f in TEST_PAGES if "details" in f],
    ids=[p for p, f in TEST_PAGES if "details" in f],
)
def test_details_content_present(path):
    """<details> elements have visible content in HTML (not lazy-loaded)."""
    soup = _get_soup(path)

    details = soup.find_all("details")
    assert len(details) > 0, f"{path}: no <details> elements found"

    for i, detail in enumerate(details):
        content = detail.get_text(strip=True)
        # Subtract the summary text to check the body
        summary = detail.find("summary")
        summary_text = summary.get_text(strip=True) if summary else ""
        body_text = content.replace(summary_text, "", 1).strip()
        assert len(body_text) > 0, f"{path}: <details> #{i} has no body content"


@pytest.mark.indexability
@pytest.mark.parametrize(
    "path",
    [p for p, f in TEST_PAGES if "images" in f],
    ids=[p for p, f in TEST_PAGES if "images" in f],
)
def test_images_have_alt_text(path):
    """Content images have alt text (excludes SVG icons and badges)."""
    soup = _get_soup(path)

    # Find content images, excluding decorative ones
    images = soup.find_all("img")
    content_images = [
        img for img in images
        if not _is_decorative_image(img)
    ]

    assert len(content_images) > 0, f"{path}: no content images found"

    missing_alt = [
        img.get("src", "unknown")
        for img in content_images
        if not img.get("alt")
    ]
    assert len(missing_alt) == 0, (
        f"{path}: {len(missing_alt)} images missing alt text: {missing_alt[:5]}"
    )


def _is_decorative_image(img) -> bool:
    """Check if an image is decorative (SVG icon, badge, etc.)."""
    src = img.get("src", "")
    classes = img.get("class", [])

    # Skip SVG data URIs, badge images, tiny icons
    if src.startswith("data:image/svg"):
        return True
    if "badge" in src.lower() or "shield" in src.lower():
        return True
    if any(c in ("icon", "badge", "logo") for c in classes):
        return True
    # Skip language/site logo SVGs (e.g., /img/site/logo-py.svg)
    if src.endswith(".svg") and "/img/site/" in src:
        return True
    # Skip very small images (likely icons)
    width = img.get("width")
    if width and str(width).isdigit() and int(width) < 30:
        return True

    return False


@pytest.mark.indexability
def test_llms_txt_accessible():
    """/llms.txt returns 200, has substantial content, and mentions Weaviate."""
    resp = requests.get(
        f"{BASE_URL}/llms.txt",
        timeout=30,
        headers={"User-Agent": "WeaviateDocsIndexabilityTest/1.0"},
    )
    assert resp.status_code == 200, f"/llms.txt returned {resp.status_code}"
    assert len(resp.text) > 500, f"/llms.txt content too short ({len(resp.text)} chars)"
    assert "weaviate" in resp.text.lower(), "/llms.txt doesn't mention Weaviate"


@pytest.mark.indexability
def test_sitemap_accessible():
    """/sitemap.xml returns 200 and has 100+ URLs."""
    resp = requests.get(
        f"{BASE_URL}/sitemap.xml",
        timeout=30,
        headers={"User-Agent": "WeaviateDocsIndexabilityTest/1.0"},
    )
    assert resp.status_code == 200, f"/sitemap.xml returned {resp.status_code}"

    # Count <loc> entries (use html.parser — lxml may not be installed)
    import warnings
    from bs4 import XMLParsedAsHTMLWarning
    warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)
    soup = BeautifulSoup(resp.text, "html.parser")
    locs = soup.find_all("loc")
    assert len(locs) >= 100, f"/sitemap.xml has only {len(locs)} URLs (expected 100+)"


# ---------------------------------------------------------------------------
# Part 2: Claude Agent Test (requires ANTHROPIC_API_KEY)
# ---------------------------------------------------------------------------


def _extract_text_from_response(response) -> str:
    """Extract all text content from an Anthropic API response."""
    texts = []
    for block in response.content:
        if hasattr(block, "text"):
            texts.append(block.text)
    return "\n".join(texts)


# Exact vectorizer configuration lines from the quickstart page.
# Each language tab has a distinctive line that configures the vectorizer.
# These are the verbatim lines from the source code files.
QUICKSTART_VECTORIZER_LINES = {
    "Python": "Configure.Vectors.text2vec_weaviate()",
    "TypeScript": "vectors.text2VecWeaviate()",
    "Go": 'Vectorizer: "text2vec-weaviate"',
    "Java": "VectorConfig.text2vecWeaviate()",
    "C#": "v.Text2VecWeaviate()",
}


@pytest.mark.indexability_agents
def test_claude_can_fetch_code_tabs():
    """Claude's web_fetch tool can retrieve quickstart vectorizer config for all languages."""
    anthropic = pytest.importorskip("anthropic")

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        pytest.skip("ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic()
    url = f"{BASE_URL}/weaviate/quickstart"

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        tools=[{
            "type": "web_fetch_20250910",
            "name": "web_fetch",
            "max_uses": 1,
            "allowed_domains": ["docs.weaviate.io"],
        }],
        messages=[{
            "role": "user",
            "content": (
                f"Fetch {url} and find the code that configures the vectorizer "
                "in the collection creation step. The page has tabs for Python, "
                "TypeScript, Go, Java, and C#. For EACH language, copy the exact "
                "line that sets up the vectorizer (e.g. text2vec_weaviate, "
                "text2VecWeaviate, etc.) verbatim from the code snippet. "
                "Format your response as:\n"
                "Python: <exact vectorizer config line>\n"
                "TypeScript: <exact vectorizer config line>\n"
                "Go: <exact vectorizer config line>\n"
                "Java: <exact vectorizer config line>\n"
                "C#: <exact vectorizer config line>"
            ),
        }],
    )

    text = _extract_text_from_response(response)

    missing = []
    for lang, line in QUICKSTART_VECTORIZER_LINES.items():
        if line not in text:
            missing.append(lang)

    assert len(missing) == 0, (
        f"Claude couldn't extract vectorizer config for: {', '.join(missing)}. "
        f"Response:\n{text[:2000]}"
    )


@pytest.mark.indexability_agents
def test_claude_can_fetch_collapsible_content():
    """Claude's web_fetch tool can read content inside collapsible sections."""
    anthropic = pytest.importorskip("anthropic")

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        pytest.skip("ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic()
    url = f"{BASE_URL}/weaviate/config-refs/collections"

    # The page has a collapsible section containing a full JSON config example
    # that includes this line (inside a <details> block):
    #   "vectorizer": "text2vec-contextionary",   // Vectorizer to use ...
    # Ask Claude to find and quote it to prove collapsible content is readable.
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        tools=[{
            "type": "web_fetch_20250910",
            "name": "web_fetch",
            "max_uses": 1,
            "allowed_domains": ["docs.weaviate.io"],
        }],
        messages=[{
            "role": "user",
            "content": (
                f"Fetch {url} and look for an expandable/collapsible section "
                "that contains a full JSON configuration example. "
                "Find the line that sets the vectorizer to 'text2vec-contextionary' "
                "and copy it verbatim. Also list 2-3 other configuration fields "
                "from that same JSON block."
            ),
        }],
    )

    text = _extract_text_from_response(response)
    assert "text2vec-contextionary" in text, (
        f"Claude couldn't find 'text2vec-contextionary' in collapsible content. "
        f"Response:\n{text[:1000]}"
    )


@pytest.mark.indexability_agents
def test_claude_can_fetch_llms_txt():
    """Claude's web_fetch tool can read /llms.txt."""
    anthropic = pytest.importorskip("anthropic")

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        pytest.skip("ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic()
    url = f"{BASE_URL}/llms.txt"

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        tools=[{
            "type": "web_fetch_20250910",
            "name": "web_fetch",
            "max_uses": 1,
            "allowed_domains": ["docs.weaviate.io"],
        }],
        messages=[{
            "role": "user",
            "content": (
                f"Fetch {url} and tell me: "
                "1) What is this file? "
                "2) What product/company is it about? "
                "3) List some of the documentation sections mentioned. Be concise."
            ),
        }],
    )

    text = _extract_text_from_response(response)
    assert "weaviate" in text.lower(), (
        f"Claude couldn't identify Weaviate in llms.txt. Response: {text[:500]}"
    )


# ---------------------------------------------------------------------------
# Part 3: ChatGPT Agent Test (requires OPENAI_API_KEY)
# ---------------------------------------------------------------------------


@pytest.mark.indexability_agents
def test_chatgpt_can_search_code_tabs():
    """ChatGPT's web_search can find the quickstart and identify vectorizer config."""
    openai = pytest.importorskip("openai")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    client = openai.OpenAI()

    # web_search_preview searches the web but can't guarantee extracting
    # verbatim code. We verify ChatGPT finds the correct URL and identifies
    # the vectorizer configuration from the code tabs.
    response = client.responses.create(
        model="gpt-4.1-mini",
        tools=[{
            "type": "web_search_preview",
            "search_context_size": "high",
        }],
        input=(
            "Search for the Weaviate quickstart guide at docs.weaviate.io. "
            "The page creates a 'Movie' collection and has code tabs for "
            "Python, TypeScript, Go, Java, and C#. "
            "Tell me: 1) The exact URL you found "
            "2) What programming languages have code examples "
            "3) For each language, what is the exact vectorizer configuration "
            "line from the code in the quickstart (e.g. text2vec_weaviate, text2VecWeaviate, etc.)"
        ),
    )

    text = response.output_text
    text_lower = text.lower()

    # Must find the correct quickstart URL
    assert "docs.weaviate.io/weaviate/quickstart" in text, (
        f"ChatGPT didn't find the quickstart URL. Response:\n{text[:1000]}"
    )

    # Must identify multiple programming languages from the code tabs
    langs_found = sum(
        1 for lang in ["python", "typescript", "go", "java", "c#"]
        if lang in text_lower
    )
    assert langs_found >= 3, (
        f"ChatGPT only found {langs_found} languages (expected 3+). "
        f"Response:\n{text[:1000]}"
    )

    # Must find at least 3 of the 5 exact vectorizer config lines.
    # web_search_preview may not extract all tabs verbatim, but should
    # get most of them from the indexed page content.
    vectorizer_found = sum(
        1 for line in QUICKSTART_VECTORIZER_LINES.values()
        if line in text
    )
    assert vectorizer_found >= 3, (
        f"ChatGPT only found {vectorizer_found}/5 vectorizer lines (expected 3+). "
        f"Response:\n{text[:2000]}"
    )


@pytest.mark.indexability_agents
def test_chatgpt_can_search_cloud_docs():
    """ChatGPT's web_search can find and read Weaviate Cloud docs."""
    openai = pytest.importorskip("openai")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    client = openai.OpenAI()

    response = client.responses.create(
        model="gpt-4.1-mini",
        tools=[{
            "type": "web_search_preview",
            "search_context_size": "medium",
        }],
        input=(
            "Search for the Weaviate Cloud quickstart documentation at docs.weaviate.io. "
            "List: 1) The page title "
            "2) The main steps described "
            "3) Any code examples you find. Be concise."
        ),
    )

    text = response.output_text
    assert any(kw in text.lower() for kw in ["cloud", "quickstart", "cluster", "weaviate"]), (
        f"ChatGPT couldn't read cloud docs. Response: {text[:500]}"
    )


@pytest.mark.indexability_agents
def test_chatgpt_can_search_agents_docs():
    """ChatGPT's web_search can find and read Weaviate Agents docs."""
    openai = pytest.importorskip("openai")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    client = openai.OpenAI()

    response = client.responses.create(
        model="gpt-4.1-mini",
        tools=[{
            "type": "web_search_preview",
            "search_context_size": "medium",
        }],
        input=(
            "Search for the Weaviate query agent tutorial at docs.weaviate.io/agents. "
            "List: 1) The page title "
            "2) What the tutorial covers "
            "3) Any code snippets you find. Be concise."
        ),
    )

    text = response.output_text
    assert any(kw in text.lower() for kw in ["agent", "query", "weaviate"]), (
        f"ChatGPT couldn't read agents docs. Response: {text[:500]}"
    )
