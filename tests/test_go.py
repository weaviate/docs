import subprocess
import pytest
import shlex
import os


GO_V6_CWD = "_includes/code/go-v6"


def run_go_test(run_pattern, empty_weaviates):
    # -count=1 disables the test cache so each run actually hits Weaviate.
    command = shlex.split(f"go test ./... -run {run_pattern} -v -count=1")
    env = dict(os.environ)

    try:
        result = subprocess.run(
            command, cwd=GO_V6_CWD, env=env,
            capture_output=True, text=True, check=True,
        )
    except subprocess.CalledProcessError as error:
        details = [f"Go tests matching {run_pattern!r} failed (exit code {error.returncode})"]
        if error.stdout:
            details.append(f"\n--- STDOUT (last 80 lines) ---\n{chr(10).join(error.stdout.splitlines()[-80:])}")
        if error.stderr:
            details.append(f"\n--- STDERR (last 40 lines) ---\n{chr(10).join(error.stderr.splitlines()[-40:])}")
        pytest.fail("\n".join(details))


# Smoke set for the Go v6 client. Each op is a standalone `go test` target so a
# failure points at the exact snippet. The cloud connection case skips itself
# when WEAVIATE_URL / WEAVIATE_API_KEY are unset; every other test dials the
# local docker stack on :8080 / :50051.
@pytest.mark.go
@pytest.mark.parametrize(
    "run_pattern",
    [
        "TestConnectLocal|TestConnectCloud",
    ],
)
def test_connection(empty_weaviates, run_pattern):
    run_go_test(run_pattern, empty_weaviates)


@pytest.mark.go
@pytest.mark.parametrize(
    "run_pattern",
    [
        "TestCreateCollection$",
    ],
)
def test_manage_collections(empty_weaviates, run_pattern):
    run_go_test(run_pattern, empty_weaviates)


@pytest.mark.go
@pytest.mark.parametrize(
    "run_pattern",
    [
        "TestCreateObject",
    ],
)
def test_manage_objects(empty_weaviates, run_pattern):
    run_go_test(run_pattern, empty_weaviates)


@pytest.mark.go
@pytest.mark.parametrize(
    "run_pattern",
    [
        "TestBasicQuery",
    ],
)
def test_search(empty_weaviates, run_pattern):
    run_go_test(run_pattern, empty_weaviates)
