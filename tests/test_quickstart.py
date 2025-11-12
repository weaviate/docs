import pytest
import utils
from pathlib import Path


@pytest.mark.pyv4
@pytest.mark.wcd
@pytest.mark.parametrize(
    "script_loc",
    [
        "_includes/code/python/quickstart.is_ready.py",
        "_includes/code/python/quickstart.create_collection.py",
        "_includes/code/python/quickstart.import_objects.py",
        "_includes/code/python/quickstart.query.neartext.py",
        "_includes/code/python/quickstart.query.rag.py",
    ],
)
def test_pyv4(script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "_includes/code/python/local.quickstart.is_ready.py",
        "_includes/code/python/local.quickstart.create_collection.py",
        "_includes/code/python/local.quickstart.import_objects.py",
        "_includes/code/python/local.quickstart.query.neartext.py",
        "_includes/code/python/local.quickstart.query.rag.py",
    ],
)
def test_pyv4_local(empty_weaviates, script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)


@pytest.mark.pyv4
@pytest.mark.wcd
@pytest.mark.parametrize(
    "script_loc",
    [
        "_includes/code/python/quickstart.short.create_collection.py",
        "_includes/code/python/quickstart.short.query.neartext.py",
        "_includes/code/python/quickstart.short.query.rag.py",
        "_includes/code/python/quickstart.short.import_vectors.create_collection.py",
        "_includes/code/python/quickstart.short.import_vectors.query.nearvector.py",
        "_includes/code/python/quickstart.short.import_vectors.query.rag.py",
    ],
)
def test_short_pyv4(script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "_includes/code/python/quickstart.short.local.create_collection.py",
        "_includes/code/python/quickstart.short.local.query.neartext.py",
        "_includes/code/python/quickstart.short.local.query.rag.py",
        "_includes/code/python/quickstart.short.local.import_vectors.create_collection.py",
        "_includes/code/python/quickstart.short.local.import_vectors.query.nearvector.py",
        "_includes/code/python/quickstart.short.local.import_vectors.query.rag.py",
    ],
)
def test_short_local_pyv4(empty_weaviates, script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)


@pytest.mark.ts
@pytest.mark.wcd
@pytest.mark.parametrize(
    "script_loc",
    [
        "_includes/code/typescript/quickstart.short.create_collection.ts",
        "_includes/code/typescript/quickstart.short.query.neartext.ts",
        "_includes/code/typescript/quickstart.short.query.rag.ts",
        "_includes/code/typescript/quickstart.short.import_vectors.create_collection.ts",
        "_includes/code/typescript/quickstart.short.import_vectors.query.nearvector.ts",
        "_includes/code/typescript/quickstart.short.import_vectors.query.rag.ts",
    ],
)
def test_short_ts(empty_weaviates, script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(script_loc, lang="ts")
    command = ["npx", "tsx", temp_proc_script_loc]
    try:
        utils.run_script(command, script_loc)
    except Exception as e:
        pytest.fail(str(e))


@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    [
        "_includes/code/typescript/quickstart.short.local.create_collection.ts",
        "_includes/code/typescript/quickstart.short.local.query.neartext.ts",
        "_includes/code/typescript/quickstart.short.local.query.rag.ts",
        "_includes/code/typescript/quickstart.short.local.import_vectors.create_collection.ts",
        "_includes/code/typescript/quickstart.short.local.import_vectors.query.nearvector.ts",
        "_includes/code/typescript/quickstart.short.local.import_vectors.query.rag.ts",
    ],
)
def test_short_local_ts(empty_weaviates, script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(script_loc, lang="ts")
    command = ["npx", "tsx", temp_proc_script_loc]
    try:
        utils.run_script(command, script_loc)
    except Exception as e:
        pytest.fail(str(e))


@pytest.mark.ts
@pytest.mark.wcd
@pytest.mark.parametrize(
    "script_loc",
    [
        "_includes/code/typescript/quickstart.is_ready.ts",
        "_includes/code/typescript/quickstart.create_collection.ts",
        "_includes/code/typescript/quickstart.import_objects.ts",
        "_includes/code/typescript/quickstart.query.neartext.ts",
        "_includes/code/typescript/quickstart.query.rag.ts",
    ],
)
def test_ts(empty_weaviates, script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(script_loc, lang="ts")
    command = ["npx", "tsx", temp_proc_script_loc]
    try:
        utils.run_script(command, script_loc)
    except Exception as e:
        pytest.fail(str(e))


@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    [
        "_includes/code/typescript/local.quickstart.is_ready.ts",
        "_includes/code/typescript/local.quickstart.create_collection.ts",
        "_includes/code/typescript/local.quickstart.import_objects.ts",
        "_includes/code/typescript/local.quickstart.query.neartext.ts",
        "_includes/code/typescript/local.quickstart.query.rag.ts",
    ],
)
def test_ts(empty_weaviates, script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(script_loc, lang="ts")
    command = ["npx", "tsx", temp_proc_script_loc]
    try:
        utils.run_script(command, script_loc)
    except Exception as e:
        pytest.fail(str(e))
