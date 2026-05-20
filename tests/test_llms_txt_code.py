"""Coverage test for the code snippets in weaviate-io's llms.txt.

Every Python/TypeScript/Java/C# code block in llms.txt must appear verbatim
between `START`/`END` markers in a docs snippet file that the language test
suites actually run. This keeps the (hand-maintained) llms.txt snippets from
drifting away from tested, working code.

By default the live https://weaviate.io/llms.txt is fetched. Set LLMS_TXT_PATH
to validate a local copy instead (e.g. an un-deployed weaviate-io checkout).
"""
import glob
import os
import re
import textwrap
import urllib.request

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


def _normalize(code):
    """Dedent, drop trailing whitespace, and strip blank edges for comparison."""
    dedented = textwrap.dedent(code).strip("\n")
    return "\n".join(line.rstrip() for line in dedented.split("\n")).strip()


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
