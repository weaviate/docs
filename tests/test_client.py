import pytest
import utils
from pathlib import Path


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/connections/connect-python-v4.py",
        "./_includes/code/client-libraries/python_v4.py",
        "./_includes/code/client-libraries/python_slow_connection.py",
        "./_includes/code/rest.well-known.py",
    ],
)
def test_on_blank_instance_pyv4(empty_weaviates, script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)

@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    ["./_includes/code/connections/connect-ts-v3.ts"],
)
def test_ts(script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(script_loc, lang="ts")
    command = ["npx", "tsx", temp_proc_script_loc]

    try:
        utils.run_script(command, script_loc)
    except Exception as e:
        pytest.fail(str(e))