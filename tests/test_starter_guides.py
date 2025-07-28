import subprocess
import pytest
import utils
from pathlib import Path


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/quickstart.byov.all.py",
        "./_includes/code/starter-guides/generative.py",
        "./_includes/code/starter-guides/schema.py",
    ],
)
def test_pyv4(empty_weaviates, script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)


@pytest.mark.pyv3
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/quickstart.byov.all_v3.py",

        # Note - 2024-Jan-23: This is falling over as generative search times out for some reason
        # TODO - investigate further and re-enable
        # "./_includes/code/starter-guides/generative_v3.py",
    ],
)
def test_pyv3(empty_weaviates, script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    exec(proc_script)
