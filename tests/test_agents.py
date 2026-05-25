import pytest
import utils
from pathlib import Path


@pytest.mark.pyv4
@pytest.mark.agents
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/agents/_includes/code/additional_filters.py",
        "./docs/agents/_includes/code/advanced_collections.py",
        "./docs/agents/_includes/code/ask_mode.py",
        "./docs/agents/_includes/code/conversations.py",
        "./docs/agents/_includes/code/instantiation.py",
        "./docs/agents/_includes/code/introduction.py",
        "./docs/agents/_includes/code/query_agent.py",
        "./docs/agents/_includes/code/quickstart.py",
        "./docs/agents/_includes/code/search_mode.py",
        "./docs/agents/_includes/code/suggest_queries.py",
        "./docs/agents/_includes/code/system_prompt.py",
    ],
)
def test_on_blank_instance_pyv4(script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)


@pytest.mark.ts
@pytest.mark.agents
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/agents/_includes/code/additional_filters.mts",
        "./docs/agents/_includes/code/advanced_collections.mts",
        "./docs/agents/_includes/code/ask_mode.mts",
        "./docs/agents/_includes/code/conversations.mts",
        "./docs/agents/_includes/code/instantiation.mts",
        "./docs/agents/_includes/code/introduction.mts",
        "./docs/agents/_includes/code/query_agent.mts",
        "./docs/agents/_includes/code/quickstart.mts",
        "./docs/agents/_includes/code/search_mode.mts",
        "./docs/agents/_includes/code/suggest_queries.mts",
        "./docs/agents/_includes/code/system_prompt.mts",
    ],
)
def test_ts(script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(script_loc, lang="ts")
    command = ["npx", "tsx", temp_proc_script_loc]

    try:
        utils.run_script(command, script_loc)
    except Exception as e:
        pytest.fail(str(e))
