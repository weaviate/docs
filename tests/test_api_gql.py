import pytest
import utils
from pathlib import Path


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/graphql.get.simple.py",
        "./_includes/code/graphql.additional.py",
        "./_includes/code/graphql.filters.py",
        "./_includes/code/graphql.metadata.py",
        "./_includes/code/graphql.search-operators.py",
        "./_includes/code/graphql.filters.nearText.py",
        "./_includes/code/graphql.filters.nearText.generic.py",
        "./_includes/code/graphql.aggregate.simple.py",
    ],
)
def test_pyv4(empty_weaviates, script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)


@pytest.mark.pyv3
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/graphql.get.beacon.v3.py",
    ],
)
def test_pyv3(empty_weaviates, script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    exec(proc_script)
