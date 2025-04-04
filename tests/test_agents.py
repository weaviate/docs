import pytest
import utils


@pytest.mark.pyv4
@pytest.mark.agents
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/agents/_includes/query_agent.py",
        "./docs/agents/_includes/transformation_agent.py"
    ],
)
def test_on_blank_instance_pyv4(empty_weaviates, script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    exec(proc_script)
