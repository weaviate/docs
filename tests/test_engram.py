import pytest
import utils
from pathlib import Path


@pytest.mark.engram
@pytest.mark.engram_python
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/engram/_includes/quickstart.py",
        "./docs/engram/_includes/store_memories.py",
        "./docs/engram/_includes/search_memories.py",
        "./docs/engram/_includes/manage_memories.py",
        "./docs/engram/_includes/check_run_status.py",
        "./docs/engram/_includes/tutorial_memory_chat_app.py",
        "./docs/engram/_includes/tutorial_context_window_mgmt.py",
        "./docs/engram/_includes/tutorial_personalized_rag.py",
    ],
)
def test_engram(script_loc):
    proc_script = utils.load_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)


@pytest.mark.engram
@pytest.mark.engram_curl
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/engram/_includes/quickstart.sh",
        "./docs/engram/_includes/store_memories.sh",
        "./docs/engram/_includes/search_memories.sh",
        "./docs/engram/_includes/manage_memories.sh",
        "./docs/engram/_includes/check_run_status.sh",
    ],
)
def test_engram_curl(script_loc):
    utils.run_script(["bash", script_loc], script_loc)
