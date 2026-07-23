import subprocess
import pytest
import shlex
import os
import re


GO_V6_CWD = "_includes/code/go-v6"


def _failing_test_names(lines):
    # `go test -v` prints a `--- FAIL: TestName (0.00s)` line per failed test.
    names = []
    for line in lines:
        m = re.match(r"\s*--- FAIL:\s+(\S+)", line)
        if m and m.group(1) not in names:
            names.append(m.group(1))
    return names


def _fail_block(lines, name):
    # Extract a failing test's own output: from its `=== RUN   TestName` line to
    # its `--- FAIL: TestName` line. Walking back from the FAIL line means the
    # block is captured no matter where in the run the test executed, so an early
    # test's error is not lost to the last-N-lines tail.
    fail_idx = None
    for i, line in enumerate(lines):
        s = line.strip()
        if s == f"--- FAIL: {name}" or s.startswith(f"--- FAIL: {name} "):
            fail_idx = i  # keep the last occurrence
    if fail_idx is None:
        return None
    run_idx = 0
    for j in range(fail_idx, -1, -1):
        if lines[j].strip() == f"=== RUN   {name}":
            run_idx = j
            break
    return "\n".join(lines[run_idx:fail_idx + 1])


def run_go_suite():
    # -count=1 disables the test cache so each run actually hits Weaviate.
    # No -run filter: t.Skip (not a run pattern) is the selection mechanism, so
    # every test WITHOUT a t.Skip executes and every test WITH one is excluded.
    command = shlex.split("go test ./... -v -count=1")
    env = dict(os.environ)

    try:
        subprocess.run(
            command, cwd=GO_V6_CWD, env=env,
            capture_output=True, text=True, check=True,
        )
    except subprocess.CalledProcessError as error:
        details = [f"Go tests failed (exit code {error.returncode})"]

        stdout = error.stdout or ""
        lines = stdout.splitlines()

        # Surface the COMPLETE set of failing tests first. `go test -v` prints a
        # `--- FAIL: TestName` line per failure, but those can scroll off the top
        # of the tail below, hiding failures that occurred early in the run.
        # Grepping the full captured stdout guarantees every failure is listed.
        names = _failing_test_names(lines)
        if names:
            details.append(f"\n--- FAILING TESTS ({len(names)}) ---\n" + "\n".join(names))

        # Then include each failing test's own RUN..FAIL block, so every
        # failure's real error is visible regardless of where it ran, even if the
        # error scrolled out of the tail below (e.g. the aggregate tests run first).
        for name in names:
            block = _fail_block(lines, name)
            if block:
                details.append(f"\n--- FAILURE: {name} ---\n{block}")

        if stdout:
            details.append(f"\n--- STDOUT (last 200 lines) ---\n{chr(10).join(lines[-200:])}")
        if error.stderr:
            details.append(f"\n--- STDERR (last 40 lines) ---\n{chr(10).join(error.stderr.splitlines()[-40:])}")
        pytest.fail("\n".join(details))


# Run the whole Go v6 snippet suite live. Selection is by t.Skip, not a `-run`
# pattern: every test without a t.Skip executes against the local docker stack on
# :8080 / :50051 and self-seeds via helpers like setupArticle / setupJeopardy /
# setupJeopardySearch (bring-your-own vectors, no vectorizer). Tests that need
# provisioning not yet available in this CI tier (auth, a vectorizer, or an
# external seed) guard themselves with t.Skip and are excluded; the cloud, OIDC,
# and third-party-key connection snippets self-skip when their env vars are unset.
@pytest.mark.go
def test_go_v6_suite(empty_weaviates):
    run_go_suite()
