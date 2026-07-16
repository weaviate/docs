"""
Docs Functionalities Test Suite

Browser-based checks that live-site UI features work end to end. Currently
covers the documentation "Copy page" button (ContextualMenu): clicking it must
convert the rendered page to clean Markdown and write it to the clipboard.

Runs headless Chromium via Playwright (sync API) against the live docs site,
overridable with the DOCS_BASE_URL environment variable. Targets
https://docs.weaviate.io by default; point DOCS_BASE_URL at a Netlify deploy
preview to validate a change before it ships.

NOTE:
- Requires the Playwright browser binaries: `playwright install chromium`
  (CI runs `uv run playwright install --with-deps chromium`).
- This suite is EXPECTED TO BE RED against the live site until the copy-page
  fix (PR #460) is deployed — the old button copies page chrome + plaintext, so
  the "Source: https://" / no-"Edit this page" assertions below fail. It is a
  scheduled / manual-dispatch check, NOT a PR gate.
"""

import os
import re

import pytest
from playwright.sync_api import expect, sync_playwright

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_URL = os.environ.get("DOCS_BASE_URL", "https://docs.weaviate.io")

# Representative pages: code-heavy, with varied content (tabs, tables, prose).
TEST_PAGES = [
    "/weaviate/quickstart",
    "/weaviate/search/bm25",
]

# Accessible name (aria-label) of the docs "Copy page" button. On success its
# inner <span aria-live="polite"> text flips to SUCCESS_LABEL while the
# accessible name stays the same.
COPY_BUTTON_NAME = "Copy page as markdown"
SUCCESS_LABEL = "Copied!"

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="session")
def page():
    """A headless Chromium page with clipboard permissions granted for BASE_URL."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        # Needed so navigator.clipboard.read/writeText works inside the test.
        context.grant_permissions(
            ["clipboard-read", "clipboard-write"], origin=BASE_URL
        )
        pg = context.new_page()
        try:
            yield pg
        finally:
            context.close()
            browser.close()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.functionalities
@pytest.mark.parametrize("path", TEST_PAGES)
def test_copy_page_button_writes_markdown(page, path):
    """The 'Copy page' button copies clean Markdown of the page to the clipboard."""
    url = f"{BASE_URL}{path}"
    page.goto(url, wait_until="domcontentloaded", timeout=60_000)

    # The button is React-rendered after hydration; wait for it to appear.
    button = page.get_by_role("button", name=COPY_BUTTON_NAME)
    expect(button).to_be_visible(timeout=30_000)

    # The button is server-rendered, so Playwright reports it "visible" BEFORE
    # React hydrates and attaches its onClick handler. A click landing in that
    # gap is silently dropped: the handler never runs, so the label stays on
    # "Copy page" and never reports success. That race — not a clipboard issue
    # (permissions are granted above and the Clipboard API works here) — is what
    # made this suite red on the slower headless CI runners, deterministically
    # on the heavier pages. Fix: wait for the page's JS to finish loading
    # (hydration), then retry the click so an early one can't leave us red.
    try:
        page.wait_for_load_state("networkidle", timeout=15_000)
    except Exception:
        pass  # a chatty live page may never fully idle; the retry below covers it

    # Success signal: the inner aria-live span text becomes "Copied!".
    def clicked_and_copied():
        for _ in range(5):
            button.click()
            try:
                expect(button).to_contain_text(SUCCESS_LABEL, timeout=3_000)
                return True
            except AssertionError:
                continue
        return False

    if not clicked_and_copied():
        pytest.fail(
            f"{path}: copy button never showed '{SUCCESS_LABEL}' after retries "
            f"(current button text: {button.inner_text()!r})."
        )

    markdown = page.evaluate("() => navigator.clipboard.readText()")

    if not markdown:
        pytest.fail(
            f"{path}: clipboard was empty after clicking Copy page. The button "
            "may not have written to the clipboard (check secure context / "
            "clipboard permissions)."
        )

    snippet = markdown[:200]

    assert len(markdown) > 300, (
        f"{path}: copied markdown suspiciously short "
        f"({len(markdown)} chars). Snippet: {snippet!r}"
    )
    assert markdown.startswith(f"Source: {url}"), (
        f"{path}: expected markdown to start with 'Source: {url}'. "
        f"Snippet: {snippet!r}"
    )
    assert "\n---\n" in markdown, (
        f"{path}: missing the '---' header separator. Snippet: {snippet!r}"
    )
    assert re.search(r"```", markdown), (
        f"{path}: no fenced code block (```) found in the copied markdown. "
        f"Snippet: {snippet!r}"
    )

    # Chrome-free regression canaries: heading hash-links and the page footer
    # must NOT leak into the copied markdown.
    assert "Direct link to" not in markdown, (
        f"{path}: heading hash-link chrome leaked ('Direct link to' present)."
    )
    assert "Edit this page" not in markdown, (
        f"{path}: page-footer chrome leaked ('Edit this page' present)."
    )
