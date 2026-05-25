"""Coverage + freshness + link-validity tests for weaviate-io's llms.txt.

Three things are checked here:

1. Every Python/TypeScript/Java/C# code block in llms.txt appears verbatim
   between `START`/`END` markers in a docs snippet file that the language
   test suites actually run.
2. The recommended Weaviate / client / agents versions called out in llms.txt
   match the latest releases published on the corresponding `weaviate/*`
   GitHub repos.
3. Every link in llms.txt (outside code blocks) resolves — i.e. HEAD or GET
   returns a 2xx/3xx status.

By default the live https://weaviate.io/llms.txt is fetched. Set LLMS_TXT_PATH
to validate a local copy instead (e.g. an un-deployed weaviate-io checkout).
Set GH_API_TOKEN to a GitHub PAT to raise the GitHub API rate limit (60/hr
unauthenticated → 5000/hr authenticated) — useful in CI.
"""
import glob
import json
import os
import re
import textwrap
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import pytest

LLMS_TXT_URL = "https://weaviate.io/llms.txt"

# Snippet files whose START/END regions back the llms.txt code blocks.
SNIPPET_GLOBS = {
    "python": ["_includes/code/llms-txt/python/*.py"],
    "typescript": ["_includes/code/llms-txt/typescript/*.ts"],
    "java": ["_includes/code/java-v6/src/test/java/LlmsTxtTest.java"],
    "csharp": ["_includes/code/csharp/LlmsTxtTest.cs"],
}

# Maps an llms.txt code-fence tag to a canonical language.
LANG_ALIASES = {
    "py": "python", "python": "python",
    "ts": "typescript", "typescript": "typescript",
    "java": "java",
    "cs": "csharp", "csharp": "csharp",
}

MARKER_RE = re.compile(r"(?:#|//)\s*START\s+(\w+)\n(.*?)\n[ \t]*(?:#|//)\s*END\s+\1", re.S)
FENCE_RE = re.compile(r"```(\w+)\n(.*?)\n```", re.S)


# Test scripts use per-language, per-test collection names (e.g.
# `Movie__CrudPy`, `Restaurant__FilteringCs`) so the four language test jobs
# can run in parallel against the same WCD cluster without racing on shared
# collection state. llms.txt keeps the canonical names (`Movie`, `Restaurant`,
# `Docs`, `Article`, …). This regex strips the `__Suffix` part during
# comparison so the script marker and llms.txt block match.
_TEST_COLLECTION_SUFFIX_RE = re.compile(r"\b(\w+)__[A-Za-z][A-Za-z0-9]*\b")


def _normalize(code):
    """Dedent, drop trailing whitespace, strip blank edges, and canonicalize
    per-test collection-name suffixes (Movie__CrudPy → Movie) for comparison.
    """
    dedented = textwrap.dedent(code).strip("\n")
    canonical = _TEST_COLLECTION_SUFFIX_RE.sub(r"\1", dedented)
    return "\n".join(line.rstrip() for line in canonical.split("\n")).strip()


def _load_llms_txt():
    local = os.environ.get("LLMS_TXT_PATH")
    if local:
        with open(local, encoding="utf-8") as handle:
            return handle.read()
    try:
        request = urllib.request.Request(LLMS_TXT_URL, headers={"User-Agent": "weaviate-docs-tests"})
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.read().decode("utf-8")
    except Exception as exc:  # network failure must not flake the suite
        pytest.skip(f"Could not fetch {LLMS_TXT_URL}: {exc}")


def _collect_marked_regions():
    """Return {language: set of normalized START/END regions} from the snippet files."""
    regions = {lang: set() for lang in SNIPPET_GLOBS}
    for lang, patterns in SNIPPET_GLOBS.items():
        for pattern in patterns:
            for path in glob.glob(pattern):
                with open(path, encoding="utf-8") as handle:
                    text = handle.read()
                for match in MARKER_RE.finditer(text):
                    regions[lang].add(_normalize(match.group(2)))
    return regions


@pytest.mark.llms_txt
def test_llms_txt_snippets_are_covered():
    content = _load_llms_txt()
    regions = _collect_marked_regions()
    assert any(regions.values()), "No llms.txt snippet files found — check SNIPPET_GLOBS"

    checked = 0
    uncovered = []
    for match in FENCE_RE.finditer(content):
        lang = LANG_ALIASES.get(match.group(1).lower())
        if lang is None:
            continue  # e.g. bash/shell blocks are not executable snippets
        checked += 1
        if _normalize(match.group(2)) not in regions[lang]:
            uncovered.append((lang, _normalize(match.group(2))))

    assert checked > 0, "No Python/TypeScript/Java/C# code blocks found in llms.txt"

    if uncovered:
        report = "\n\n".join(f"--- uncovered {lang} block ---\n{code}" for lang, code in uncovered)
        pytest.fail(
            f"{len(uncovered)} of {checked} llms.txt code block(s) have no matching tested "
            f"snippet. Each block must appear verbatim between START/END markers in a docs "
            f"snippet file (see tests/test_llms_txt_code.py):\n\n{report}"
        )


# Each library: (weaviate/* GitHub repo, regex matching the
# "**Library**: vX.Y.Z+" bullet in llms.txt). The regex anchors to the bullet's
# prefix so adding new libraries to llms.txt doesn't break it.
LIBRARY_SPECS = {
    "Weaviate Server":   ("weaviate",                      r"^\s*-\s*\*\*Weaviate Server[^*]*\*\*:\s*v?([0-9]+(?:\.[0-9]+)+)"),
    "Python client":     ("weaviate-python-client",        r"^\s*-\s*\*\*Python client[^*]*\*\*:\s*v?([0-9]+(?:\.[0-9]+)+)"),
    "TypeScript client": ("typescript-client",             r"^\s*-\s*\*\*TypeScript client[^*]*\*\*:\s*v?([0-9]+(?:\.[0-9]+)+)"),
    "Java client":       ("java-client",                   r"^\s*-\s*\*\*Java client[^*]*\*\*:\s*v?([0-9]+(?:\.[0-9]+)+)"),
    "C# client":         ("csharp-client",                 r"^\s*-\s*\*\*C# client[^*]*\*\*:\s*v?([0-9]+(?:\.[0-9]+)+)"),
    "Agents SDK":        ("weaviate-agents-python-client", r"^\s*-\s*\*\*Agents SDK[^*]*\*\*:\s*v?([0-9]+(?:\.[0-9]+)+)"),
}

_RELEASE_CACHE = {}


def _latest_github_release(repo):
    """Return the latest non-prerelease release tag (without leading 'v') for weaviate/<repo>."""
    if repo in _RELEASE_CACHE:
        return _RELEASE_CACHE[repo]
    url = f"https://api.github.com/repos/weaviate/{repo}/releases/latest"
    headers = {
        "User-Agent": "weaviate-docs-tests",
        "Accept": "application/vnd.github+json",
    }
    token = os.environ.get("GH_API_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        request = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code in (403, 429):
            pytest.skip(f"GitHub API rate-limited fetching {repo}: {exc}")
        pytest.skip(f"GitHub API error for {repo}: {exc}")
    except Exception as exc:  # network failure must not flake the suite
        pytest.skip(f"Could not fetch latest release for {repo}: {exc}")
    tag = payload.get("tag_name") or ""
    version = tag.lstrip("v")
    if not version:
        pytest.skip(f"GitHub returned no tag_name for {repo} (payload keys: {list(payload)})")
    _RELEASE_CACHE[repo] = version
    return version


@pytest.mark.llms_txt
def test_llms_txt_recommended_versions_are_current():
    """The 'Latest versions' bullets in llms.txt must match the latest releases
    published on the corresponding `weaviate/*` GitHub repos.

    Only versions *recommended* in llms.txt are checked — if a library isn't
    listed, nothing to verify. This enforces freshness without forcing llms.txt
    to enumerate every library, and reads the truth straight from GitHub so a
    stale `versions-config.json` can't mask drift.
    """
    content = _load_llms_txt()

    found = 0
    mismatches = []
    for label, (repo, pattern) in LIBRARY_SPECS.items():
        match = re.search(pattern, content, re.M)
        if match is None:
            continue  # library not recommended in llms.txt — skip
        found += 1
        llms_version = match.group(1)
        latest = _latest_github_release(repo)
        if llms_version != latest:
            mismatches.append(
                f"  {label} (weaviate/{repo}): llms.txt says v{llms_version}+, "
                f"latest release is v{latest}"
            )

    assert found > 0, (
        "No recommended-version bullets matched. The 'Latest versions' block in "
        "llms.txt may have been restructured — update LIBRARY_SPECS in this test."
    )
    if mismatches:
        pytest.fail(
            "llms.txt recommends out-of-date versions; bump them to the current "
            "GitHub releases:\n" + "\n".join(mismatches)
        )


# --------------------------- Link-validity test ----------------------------

LINK_TIMEOUT = 15
LINK_WORKERS = 12

# Treat these as "inconclusive" rather than broken — they commonly indicate
# bot-detection or rate-limiting against non-browser User-Agents, not a real
# broken link.
_INCONCLUSIVE_CODES = {401, 403, 429}

# A bare-URL pattern that stops at whitespace, brackets, quotes, and a few
# trailing punctuation marks. Markdown-link URLs are captured separately
# because their closing `)` would otherwise be eaten by this pattern.
_BARE_URL_RE = re.compile(r"https?://[^\s<>\"'()\[\]]+")
_MD_LINK_RE = re.compile(r"\[[^\]]*\]\((https?://[^)\s]+)\)")
_CODE_FENCE_RE = re.compile(r"```.*?```", re.S)


def _extract_links(content):
    """Return a sorted set of unique URLs in llms.txt, excluding code blocks."""
    body = _CODE_FENCE_RE.sub("", content)
    urls = set()
    for match in _MD_LINK_RE.finditer(body):
        urls.add(match.group(1))
    for match in _BARE_URL_RE.finditer(body):
        urls.add(match.group(0).rstrip(".,;:!?"))
    return sorted(urls)


def _check_link(url):
    """Return (url, status, detail) where status is 'ok', 'broken', or 'skipped'."""
    target = url.split("#", 1)[0]  # ignore fragment
    headers = {
        # Some CDNs (Cloudflare, etc.) 403 unfamiliar User-Agents — present
        # ourselves as a recent browser to cut down on false positives.
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "*/*",
    }
    for method in ("HEAD", "GET"):
        try:
            request = urllib.request.Request(target, method=method, headers=headers)
            with urllib.request.urlopen(request, timeout=LINK_TIMEOUT) as response:
                if 200 <= response.status < 400:
                    return (url, "ok", None)
                return (url, "broken", f"HTTP {response.status}")
        except urllib.error.HTTPError as exc:
            # Retry with GET if HEAD specifically isn't allowed.
            if method == "HEAD" and exc.code in (405, 501):
                continue
            if exc.code in _INCONCLUSIVE_CODES:
                return (url, "skipped", f"HTTP {exc.code} (likely bot-block)")
            return (url, "broken", f"HTTP {exc.code}")
        except Exception as exc:  # connection refused, DNS failure, timeout, etc.
            return (url, "skipped", f"{type(exc).__name__}: {exc}")
    return (url, "broken", "HEAD and GET both refused")


@pytest.mark.llms_txt
def test_llms_txt_links_resolve():
    """Every link in llms.txt outside code blocks must resolve to 2xx/3xx."""
    content = _load_llms_txt()
    links = _extract_links(content)
    assert links, "No links found in llms.txt — check the extractor."

    broken, skipped, ok = [], [], 0
    with ThreadPoolExecutor(max_workers=LINK_WORKERS) as pool:
        for url, status, detail in pool.map(_check_link, links):
            if status == "ok":
                ok += 1
            elif status == "broken":
                broken.append((url, detail))
            else:
                skipped.append((url, detail))

    if ok == 0 and skipped:
        # Everything was inconclusive — almost certainly a network outage.
        pytest.skip(
            f"None of {len(links)} link(s) resolved; assuming network issue. "
            f"First skip: {skipped[0]}"
        )

    if broken:
        report = "\n".join(f"  {url} — {detail}" for url, detail in broken)
        pytest.fail(
            f"{len(broken)} broken link(s) in llms.txt "
            f"(of {len(links)}: {ok} ok, {len(skipped)} inconclusive):\n{report}"
        )
