import pytest
import utils
from pathlib import Path


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/install/embedded.py",
    ],
)
def test_on_blank_instance_pyv4(empty_weaviates, script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)
