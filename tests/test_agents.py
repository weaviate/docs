import pytest
import utils
from pathlib import Path


@pytest.mark.pyv4
@pytest.mark.agents
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/agents/_includes/query_agent_tutorial_ecommerce.py",
        "./docs/agents/_includes/query_agent.py",
        "./docs/agents/_includes/transformation_agent.py",
        "./docs/agents/_includes/transformation_agent_tutorial_enrich_dataset.py",
        "./docs/agents/_includes/personalization_agent.py",
        "./docs/agents/_includes/personalization_agent_tutorial_food_recommender.py",
    ],
)
def test_on_blank_instance_pyv4(script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)


@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    ["./docs/agents/_includes/query_agent.mts"],
)
def test_ts(script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(script_loc, lang="ts")
    command = ["npx", "tsx", temp_proc_script_loc]

    try:
        utils.run_script(command, script_loc)
    except Exception as e:
        pytest.fail(str(e))
