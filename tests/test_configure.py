import subprocess
import pytest
import utils
from pathlib import Path


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/howto/configure.backups.py",
        "./_includes/code/python/howto.configure.rbac.permissions.py",
        "./_includes/code/python/howto.configure.rbac.roles.py",
    ],
)
def test_pyv4(empty_weaviates, script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)
