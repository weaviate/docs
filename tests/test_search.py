import pytest
import utils
import subprocess
from pathlib import Path


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/howto/search.basics.py",
        "./_includes/code/howto/search.similarity.py",
        # "./_includes/code/howto/search.image.py",  # Needs an easily reproducible dataset / imports
        "./_includes/code/howto/search.bm25.py",
        "./_includes/code/howto/search.hybrid.py",
        "./_includes/code/howto/search.filters.py",
        "./_includes/code/howto/search.aggregate.py",
        "./_includes/code/howto/search.generative.py",
        "./_includes/code/howto/search.rerank.py",
        "./_includes/code/howto/search.multi-target-v4.py"
    ],
)
def test_pyv4(empty_weaviates, script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(
        script_loc,
        lang="py",
        custom_replace_pairs=utils.edu_readonly_replacements
    )
    utils.execute_py_script_as_module(temp_proc_script_loc.read_text(), Path(script_loc).stem)


@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/howto/search.basics.ts",
        "./_includes/code/howto/search.similarity.ts",
        "./_includes/code/howto/search.bm25.ts",
        "./_includes/code/howto/search.hybrid.ts",
        "./_includes/code/howto/search.filters.ts",
        "./_includes/code/howto/search.aggregate.ts",
        "./_includes/code/howto/search.generative.ts",
        "./_includes/code/howto/search.rerank.ts",
    ],
)
def test_ts(empty_weaviates, script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(script_loc, lang="ts")
    command = ["npx", "tsx", temp_proc_script_loc]

    try:
        utils.run_script(command, script_loc)
    except Exception as e:
        pytest.fail(str(e))
