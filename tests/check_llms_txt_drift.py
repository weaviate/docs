#!/usr/bin/env python3
"""Advisory PR check: warn when a snippet change strands a block in llms.txt.

`llms.txt` is hand-maintained in the **weaviate-io** repo (`static/llms.txt`), but its
code blocks must appear verbatim between `START`/`END` markers in this repo's snippet
files. The only thing enforcing that today is the weekly
`test_llms_txt_code.py::test_llms_txt_snippets_are_covered` job, so a snippet change
here can break the published `llms.txt` days before anyone notices.

This script answers one question at PR time: once this PR merges, which `llms.txt` code
blocks would that weekly coverage test no longer find? Those blocks, and only those, are
the ones `weaviate-io/static/llms.txt` has to update in lockstep.

It is deliberately advisory: **once it runs it never fails the job**, because every
reporting path exits 0. (Only a malformed invocation, such as omitting `--base`, exits
non-zero, and that comes from argparse before any checking happens.) A legitimate snippet
PR cannot have a matching live `llms.txt` yet, because weaviate-io has not merged or
deployed, so a blocking check here would fail every honest PR and get routinely
overridden. Findings are reported as GitHub warning annotations plus a job summary
instead.

Usage:

    python tests/check_llms_txt_drift.py --base <git-ref>

The pre-change state is read with `git show <ref>:<path>`; the post-change state is read
from the working tree, so the changed-file set is `git diff --name-only <ref>`. That also
makes the script easy to exercise locally: edit a snippet file and run it with
`--base HEAD`.

Honors `LLMS_TXT_PATH` exactly like the guard tests do, so it can be pointed at a local
weaviate-io checkout instead of the live https://weaviate.io/llms.txt.
"""
import argparse
import os
import subprocess
import sys
from dataclasses import dataclass
from fnmatch import fnmatch
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Reuse the guard test's matching logic (SNIPPET_GLOBS, marker/fence regexes,
# normalization, llms.txt loading) so this check and the weekly job can never
# disagree about what "matches" means.
import test_llms_txt_code as guard  # noqa: E402

LLMS_TXT_SOURCE = "weaviate-io/static/llms.txt"

# guard._load_llms_txt() calls pytest.skip() when the fetch fails, and Skipped derives
# from BaseException, so a bare `except Exception` would let it through.
_LOAD_FAILURES = (Exception, guard.pytest.skip.Exception)


@dataclass
class Finding:
    """A marked region that exists at the base ref but not after the change."""

    path: str
    language: str
    marker: str
    old_code: str
    new_code: Optional[str]  # same marker's code after the change, if it still exists
    new_line: Optional[int]  # 1-based line of the surviving `START` marker


def _git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, check=False)


def _repo_root():
    result = _git("rev-parse", "--show-toplevel")
    return result.stdout.strip() if result.returncode == 0 else None


def _snippet_patterns():
    return [(lang, pattern) for lang, patterns in guard.SNIPPET_GLOBS.items() for pattern in patterns]


def _language_for(path):
    for language, pattern in _snippet_patterns():
        if fnmatch(path, pattern):
            return language
    return None


def _changed_snippet_files(base):
    """Paths matching SNIPPET_GLOBS that differ between `base` and the working tree."""
    result = _git("diff", "--name-only", base)
    if result.returncode != 0:
        return None, result.stderr.strip() or f"git diff against {base} failed"
    changed = [path for path in result.stdout.splitlines() if _language_for(path)]
    return sorted(changed), None


def _regions(text):
    """[(marker, normalized code, 1-based START line)] for each region in `text`."""
    found = []
    for match in guard.MARKER_RE.finditer(text):
        line = text.count("\n", 0, match.start()) + 1
        found.append((match.group(1), guard._normalize(match.group(2)), line))
    return found


def _blob_at(ref, path):
    """File contents at `ref`, or None if the file did not exist there."""
    result = _git("show", f"{ref}:{path}")
    return result.stdout if result.returncode == 0 else None


def _working_tree_text(path):
    if not os.path.exists(path):
        return ""  # file deleted by the change
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def _lost_regions(base, changed_paths):
    """Regions present at `base` whose exact code no longer exists anywhere in the repo.

    Comparing against every snippet file (not just the changed one) means a region that
    was merely moved or renamed is correctly treated as still covered.
    """
    surviving = guard._collect_marked_regions()
    lost = []
    for path in changed_paths:
        language = _language_for(path)
        base_text = _blob_at(base, path)
        if base_text is None:
            continue  # new file: nothing can be stranded
        head_regions = {marker: (code, line) for marker, code, line in _regions(_working_tree_text(path))}
        for marker, code, _ in _regions(base_text):
            if code in surviving[language]:
                continue
            new_code, new_line = head_regions.get(marker, (None, None))
            lost.append(Finding(path, language, marker, code, new_code, new_line))
    return lost


def _llms_txt_blocks():
    """({language: {normalized code}}, None), or (None, reason) if llms.txt is unreadable."""
    try:
        content = guard._load_llms_txt()
    except _LOAD_FAILURES as exc:
        return None, str(exc)
    blocks = {language: set() for language in guard.SNIPPET_GLOBS}
    for match in guard.FENCE_RE.finditer(content):
        language = guard.LANG_ALIASES.get(match.group(1).lower())
        if language is not None:
            blocks[language].add(guard._normalize(match.group(2)))
    return blocks, None


def _escape(value, is_property=False):
    escaped = value.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
    if is_property:
        escaped = escaped.replace(":", "%3A").replace(",", "%2C")
    return escaped


def _annotate(level, message, path=None, line=None, title=None):
    properties = []
    if path:
        properties.append(f"file={_escape(path, True)}")
    if line:
        properties.append(f"line={line}")
    if title:
        properties.append(f"title={_escape(title, True)}")
    joined = "," + ",".join(properties) if properties else ""
    print(f"::{level}{joined}::{_escape(message)}")


def _write_summary(markdown):
    print(markdown)
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as handle:
            handle.write(markdown + "\n")


def _report_in_sync(headline):
    _write_summary(f"## llms.txt snippet sync\n\n{headline}\n")


def _report_drift(findings):
    for finding in findings:
        if finding.new_code is None:
            detail = f"The `{finding.marker}` region was removed or renamed"
        else:
            detail = f"The `{finding.marker}` region changed"
        _annotate(
            "warning",
            f"{detail}, but {LLMS_TXT_SOURCE} still publishes the previous version. "
            f"Update {LLMS_TXT_SOURCE} in lockstep with this PR, or the weekly llms.txt "
            f"coverage job will fail once this merges.",
            path=finding.path,
            line=finding.new_line,
            title="llms.txt needs a matching update",
        )

    rows = "\n".join(
        f"| `{finding.path}` | `{finding.marker}` | "
        f"{'removed or renamed' if finding.new_code is None else 'changed'} |"
        for finding in findings
    )
    blocks = "\n\n".join(
        f"<details><summary><code>{finding.marker}</code> "
        f"({'no replacement in this repo' if finding.new_code is None else 'new block to copy into llms.txt'})"
        f"</summary>\n\n```{finding.language}\n"
        f"{finding.new_code if finding.new_code is not None else finding.old_code}\n```\n\n</details>"
        for finding in findings
    )
    plural = "block" if len(findings) == 1 else "blocks"
    _write_summary(
        "## llms.txt snippet sync\n\n"
        f"This PR strands {len(findings)} code {plural} that `{LLMS_TXT_SOURCE}` publishes "
        "verbatim. **`weaviate-io/static/llms.txt` must be updated in the same window**, "
        "otherwise the weekly llms.txt coverage job starts failing once this merges.\n\n"
        "| Snippet file | Marked region | What happened |\n"
        "|---|---|---|\n"
        f"{rows}\n\n"
        f"{blocks}\n\n"
        "This check never blocks the merge: weaviate-io cannot have shipped yet when a "
        "legitimate snippet PR is opened.\n"
    )


def main():
    parser = argparse.ArgumentParser(
        description="Warn when a PR strands an llms.txt code block.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--base",
        required=True,
        help="git ref holding the pre-change state (on a PR, the base commit)",
    )
    args = parser.parse_args()

    root = _repo_root()
    if root is None:
        _annotate("warning", "Not inside a git repository; skipping the llms.txt sync check.")
        return 0
    os.chdir(root)

    changed, error = _changed_snippet_files(args.base)
    if error is not None:
        _annotate(
            "warning",
            f"Could not diff against {args.base} ({error}), so the llms.txt sync check was "
            f"skipped. If this PR changes an llms.txt snippet, update {LLMS_TXT_SOURCE} too.",
            title="llms.txt sync check could not run",
        )
        return 0

    if not changed:
        _report_in_sync("No llms.txt-backed snippet files changed. Nothing to keep in sync.")
        return 0

    findings = _lost_regions(args.base, changed)
    if not findings:
        _report_in_sync(
            f"{len(changed)} llms.txt snippet file(s) changed, but no `START`/`END` region "
            f"lost its previous content, so `{LLMS_TXT_SOURCE}` stays valid."
        )
        return 0

    blocks, load_error = _llms_txt_blocks()
    if blocks is None:
        listed = ", ".join(f"`{path}`" for path in changed)
        _annotate(
            "warning",
            f"Changed llms.txt snippet regions, but the published llms.txt could not be read "
            f"({load_error}), so the comparison was skipped. Check {LLMS_TXT_SOURCE} by hand.",
            title="llms.txt sync check could not run",
        )
        _write_summary(
            "## llms.txt snippet sync\n\n"
            f"Could not read the published llms.txt ({load_error}). These files changed a "
            f"marked region and may need a matching `{LLMS_TXT_SOURCE}` update: {listed}\n"
        )
        return 0

    stranded = [finding for finding in findings if finding.old_code in blocks[finding.language]]
    if not stranded:
        shipped = [
            finding
            for finding in findings
            if finding.new_code is not None and finding.new_code in blocks[finding.language]
        ]
        if shipped:
            markers = ", ".join(f"`{finding.marker}`" for finding in shipped)
            _report_in_sync(
                f"`{LLMS_TXT_SOURCE}` already publishes the updated {markers} block(s). "
                "weaviate-io shipped first, so there is nothing to do."
            )
        else:
            _report_in_sync(
                f"Marked regions changed, but `{LLMS_TXT_SOURCE}` does not publish any of "
                "their previous content, so nothing is stranded."
            )
        return 0

    _report_drift(stranded)
    return 0


if __name__ == "__main__":
    sys.exit(main())
