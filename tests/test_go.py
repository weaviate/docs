import subprocess
import pytest
import shlex
import os


@pytest.mark.go
@pytest.mark.crud
def test_manage_data(empty_weaviates):
    command = shlex.split("go test -v -run ^Test_ManageData ./...")
    cwd = "_includes/code/howto/go"
    env = dict(os.environ, WEAVIATE_PORT="8099")

    try:
        subprocess.check_call(command, cwd=cwd, env=env)
    except subprocess.CalledProcessError as error:
        pytest.fail(f"Go CRUD tests failed with error: {error}")
