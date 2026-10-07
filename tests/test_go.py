import glob
import json
import os
import re
import shlex
import subprocess

import pytest


# Absolute path to the Go v6 snippet module, derived from this file so both the
# import-time source scan and the runtime `go test` subprocess resolve it the
# same way regardless of pytest's working directory.
_HERE = os.path.dirname(os.path.abspath(__file__))
GO_V6_CWD = os.path.normpath(os.path.join(_HERE, "..", "_includes", "code", "go-v6"))


# --------------------------------------------------------------------------- #
# Name discovery (collection time)
# --------------------------------------------------------------------------- #
# One pytest case is collected per Go test function so CI reports the true
# pass/skip/fail breakdown (regression visibility) instead of one opaque case.
#
# Names are discovered by statically scanning the *_test.go sources rather than
# invoking the Go toolchain (`go test -list`). test_go.py is imported by EVERY
# pytest job (java, python, ...) — which then deselect by marker — so the
# parametrize argument must stay cheap and side-effect-free: a `go test -list`
# here would spawn the compiler (and fail on a not-yet-wired client) in jobs
# that have nothing to do with Go. The suite uses no subtests (no `t.Run`), so
# each top-level `func TestXxx(t *testing.T)` maps 1:1 to a `go test -json`
# result, making the source scan exact.
_TEST_FUNC_RE = re.compile(r"^func (Test\w*)\s*\(\s*\w+\s+\*testing\.T\s*\)")


def discover_test_names():
    names = []
    for path in sorted(glob.glob(os.path.join(GO_V6_CWD, "*_test.go"))):
        try:
            with open(path, encoding="utf-8") as fh:
                for line in fh:
                    match = _TEST_FUNC_RE.match(line)
                    if match:
                        names.append(match.group(1))
        except OSError:
            continue
    return sorted(set(names))


# --------------------------------------------------------------------------- #
# `go test -json` parsing
# --------------------------------------------------------------------------- #
_SKIP_MSG_RE = re.compile(r"^\s+[\w./-]+\.go:\d+:\s?(.*)$")


def parse_go_json(stdout):
    """Aggregate `go test -json` events into a per-top-level-test dict.

    Returns ``(results, build_output)`` where ``results`` maps each top-level
    test name to ``{"outcome": "pass"|"fail"|"skip"|None, "output": str}`` and
    ``build_output`` is the concatenated package-level output. Compiler errors
    land in ``build_output``: Go 1.24+ emits them as ``build-output`` events,
    older toolchains as package-level ``output`` events or plain non-JSON lines.
    """
    results = {}
    build_output = []
    for line in stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            # Not a JSON event: some Go toolchains print build errors as plain
            # text. Keep it so `run_go_suite` can report it.
            build_output.append(line + "\n")
            continue
        action = event.get("Action")
        test = event.get("Test")
        if not test:
            # Package-level event (start/pass/fail/output for the whole build).
            if action in ("output", "build-output"):
                build_output.append(event.get("Output", ""))
            continue
        # Roll subtests (TestFoo/case) up under their parent so reporting stays
        # at the test-function granularity even if subtests are added later.
        top = test.split("/", 1)[0]
        entry = results.setdefault(top, {"outcome": None, "output": []})
        if action == "output":
            entry["output"].append(event.get("Output", ""))
        elif action in ("pass", "fail", "skip") and test == top:
            # Only the parent's terminal event decides the reported outcome;
            # go already folds a failing subtest into the parent's "fail".
            entry["outcome"] = action
    for entry in results.values():
        entry["output"] = "".join(entry["output"])
    return results, "".join(build_output)


def _skip_reason(output):
    # A t.Skip("...") prints as a `    file.go:NN: <reason>` line in the test's
    # captured output; pull those out so the pytest SKIP shows the real reason.
    reasons = [m.group(1) for m in (_SKIP_MSG_RE.match(l) for l in output.splitlines()) if m]
    if reasons:
        return "\n".join(reasons)
    return "skipped (no reason captured)"


class GoBuildError(Exception):
    """Raised when `go test` failed in a way no parametrized case would report."""


def _failure_detail(headline, build_output, stderr, extra=()):
    detail = [headline, *extra]
    build_tail = build_output.splitlines()[-200:]
    if build_tail:
        detail.append("\n--- BUILD OUTPUT ---\n" + "\n".join(build_tail))
    if stderr:
        detail.append("\n--- STDERR ---\n" + "\n".join(stderr.splitlines()[-200:]))
    return "\n".join(detail)


def _results_or_raise(returncode, stdout, stderr, reported_names=None):
    results, build_output = parse_go_json(stdout)
    if not results:
        # No per-test events at all => the suite never ran. Fail loudly with the
        # compiler output so the break is diagnosable, not an opaque "0 tests".
        raise GoBuildError(_failure_detail(
            f"Go suite produced no test results (go test exit code {returncode}); "
            "the suite likely failed to build.",
            build_output, stderr,
        ))
    if returncode != 0:
        # A nonzero exit must surface as a failing pytest case. Only tests that
        # get a case (reported_names) count, and a missing terminal event fails
        # its case too. Anything else, e.g. a sub-package that failed to build
        # or a test outside the discovered set, would otherwise pass silently.
        reported = set(results) if reported_names is None else set(reported_names)
        if not any(
            name in reported and entry["outcome"] in ("fail", None)
            for name, entry in results.items()
        ):
            unreported = [
                f"\n--- {name} ({entry['outcome'] or 'no terminal event'}) ---\n"
                + "\n".join(entry["output"].splitlines()[-50:])
                for name, entry in sorted(results.items())
                if entry["outcome"] in ("fail", None)
            ]
            raise GoBuildError(_failure_detail(
                f"go test exited with code {returncode} but no reported test "
                "failed; a package failed to build or a test outside the "
                "reported set failed.",
                build_output, stderr, unreported,
            ))
    return results


def run_go_suite():
    # Single invocation for the whole suite. -count=1 disables the test cache so
    # each run actually hits Weaviate; -json emits one event per test action so
    # we can report each test individually. Selection is by t.Skip (not a -run
    # pattern): every test without a t.Skip executes, every test with one is
    # reported as skipped with its reason.
    command = shlex.split("go test ./... -json -count=1")
    proc = subprocess.run(
        command, cwd=GO_V6_CWD, env=dict(os.environ),
        capture_output=True, text=True,
    )
    return _results_or_raise(
        proc.returncode, proc.stdout, proc.stderr, discover_test_names()
    )


# --------------------------------------------------------------------------- #
# Fixture + parametrized reporting
# --------------------------------------------------------------------------- #
@pytest.fixture(scope="session")
def go_suite_results(empty_weaviates):
    """Run the Go v6 snippet suite ONCE and return its parsed per-test results.

    Session-scoped so the ~150 parametrized cases below share a single
    `go test` invocation. Depends on empty_weaviates so the docker stack is up
    (a no-op in CI, where the workflow manages the containers).
    """
    return run_go_suite()


# Run the whole Go v6 snippet suite live against the local docker stack on
# :8080 / :50051; tests self-seed via helpers like setupArticle / setupJeopardy.
# Each Go test function is reported as its own pytest case (regression
# visibility): a pass passes, a t.Skip becomes a pytest SKIP carrying its
# reason, and a failure fails the case with that test's own captured output.
# Sentinel parameter for an empty discovery, so a moved or missing module fails.
_NO_TESTS_DISCOVERED = "<no Go tests discovered>"


@pytest.mark.go
@pytest.mark.parametrize("test_name", discover_test_names() or [_NO_TESTS_DISCOVERED])
def test_go_v6(request, test_name):
    if test_name == _NO_TESTS_DISCOVERED:
        pytest.fail(f"no Go tests discovered under {GO_V6_CWD} (no *_test.go files)")
    # Requested lazily so the sentinel fails without starting the stack or `go test`.
    result = request.getfixturevalue("go_suite_results").get(test_name)
    if result is None:
        pytest.fail(
            f"{test_name}: no result captured from `go test -json`. The test was "
            "discovered in the source but did not run — the suite may have failed "
            "to build, the function name drifted, or an earlier test panicked "
            "and aborted the package."
        )
    outcome = result["outcome"]
    output = result["output"]
    if outcome == "pass":
        return
    if outcome == "skip":
        pytest.skip(_skip_reason(output))
    # "fail" or a missing terminal event (e.g. a panic mid-test) => failure.
    pytest.fail(output or f"{test_name} failed with no captured output.")
