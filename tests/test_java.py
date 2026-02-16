import subprocess
import pytest
import shlex
import os


def run_java_test(groups, empty_weaviates):
    command = shlex.split(f"mvn -Dgroups={groups} clean test")
    cwd = "_includes/code/howto/java"
    env = dict(os.environ, WEAVIATE_PORT="8099")

    try:
        subprocess.check_call(command, cwd=cwd, env=env)
    except subprocess.CalledProcessError as error:
        pytest.fail(f"Java {groups} tests failed with error: {error}")


@pytest.mark.java
@pytest.mark.crud
def test_manage_data(empty_weaviates):
    run_java_test("crud", empty_weaviates)


@pytest.mark.java
@pytest.mark.pq
def test_compression(empty_weaviates):
    run_java_test("pq", empty_weaviates)
