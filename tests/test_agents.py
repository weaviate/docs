import os
import pytest
import utils
from pathlib import Path


@pytest.mark.pyv4
@pytest.mark.agents
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/query-agent/_includes/code/additional_filters.py",
        "./docs/query-agent/_includes/code/advanced_collections.py",
        "./docs/query-agent/_includes/code/ask_mode.py",
        "./docs/query-agent/_includes/code/conversations.py",
        "./docs/query-agent/_includes/code/instantiation.py",
        "./docs/query-agent/_includes/code/introduction.py",
        "./docs/query-agent/_includes/code/query_agent.py",
        "./docs/query-agent/_includes/code/quickstart.py",
        "./docs/query-agent/_includes/code/search_mode.py",
        "./docs/query-agent/_includes/code/suggest_queries.py",
        "./docs/query-agent/_includes/code/system_prompt.py",
        # Recipe walkthroughs (Weaviate Cloud + Weaviate Embeddings only)
        "./docs/query-agent/_includes/code/query_agent_get_started.py",
        "./docs/query-agent/_includes/code/query_agent_ecommerce_assistant.py",
    ],
)
def test_on_blank_instance_pyv4(script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.retry_on_transient(
        lambda: utils.execute_py_script_as_module(proc_script, Path(script_loc).stem),
        label=str(script_loc),
    )


@pytest.mark.pyv4
@pytest.mark.agents
@pytest.mark.skipif(
    not os.environ.get("OPENAI_API_KEY"),
    reason="Query-Agent-vs-DIY recipe builds a DIY OpenAI pipeline; needs OPENAI_API_KEY.",
)
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/query-agent/_includes/code/query_agent_vs_diy.py",
    ],
)
def test_recipes_requiring_openai_pyv4(script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.retry_on_transient(
        lambda: utils.execute_py_script_as_module(proc_script, Path(script_loc).stem),
        label=str(script_loc),
    )


@pytest.mark.ts
@pytest.mark.agents
@pytest.mark.parametrize(
    "script_loc",
    [
        "./docs/query-agent/_includes/code/additional_filters.mts",
        "./docs/query-agent/_includes/code/advanced_collections.mts",
        "./docs/query-agent/_includes/code/ask_mode.mts",
        "./docs/query-agent/_includes/code/conversations.mts",
        "./docs/query-agent/_includes/code/instantiation.mts",
        "./docs/query-agent/_includes/code/introduction.mts",
        "./docs/query-agent/_includes/code/query_agent.mts",
        "./docs/query-agent/_includes/code/quickstart.mts",
        "./docs/query-agent/_includes/code/search_mode.mts",
        "./docs/query-agent/_includes/code/suggest_queries.mts",
        "./docs/query-agent/_includes/code/system_prompt.mts",
    ],
)
def test_ts(script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(script_loc, lang="ts")
    command = ["npx", "tsx", temp_proc_script_loc]

    try:
        utils.run_script(command, script_loc)
    except Exception as e:
        pytest.fail(str(e))
