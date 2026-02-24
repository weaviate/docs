import pytest
import utils
from pathlib import Path


@pytest.mark.engram
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/engram/_includes/quickstart.py",
        "./docs/engram/_includes/store_memories.py",
        "./docs/engram/_includes/search_memories.py",
        "./docs/engram/_includes/manage_memories.py",
        "./docs/engram/_includes/check_run_status.py",
    ],
)
def test_engram(script_loc):
    proc_script = utils.load_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)
