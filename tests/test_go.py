import subprocess
import pytest
import shlex
import os


GO_V6_CWD = "_includes/code/go-v6"


def run_go_suite():
    # -count=1 disables the test cache so each run actually hits Weaviate.
    # No -run filter: t.Skip (not a run pattern) is the selection mechanism, so
    # every test WITHOUT a t.Skip executes and every test WITH one is excluded.
    command = shlex.split("go test ./... -v -count=1")
    env = dict(os.environ)

    try:
        result = subprocess.run(
            command, cwd=GO_V6_CWD, env=env,
            capture_output=True, text=True, check=True,
        )
    except subprocess.CalledProcessError as error:
        details = [f"Go tests failed (exit code {error.returncode})"]
        if error.stdout:
            details.append(f"\n--- STDOUT (last 80 lines) ---\n{chr(10).join(error.stdout.splitlines()[-80:])}")
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
