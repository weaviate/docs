import pytest
import utils


def run_ts_script(script_loc):
    temp_proc_script_loc = utils.load_and_prep_temp_file(script_loc, lang="ts")
    command = ["npx", "tsx", temp_proc_script_loc]

    try:
        utils.run_script(command, script_loc)
    except Exception as e:
        pytest.fail(str(e))


# ========== Client ==========

@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    ["./_includes/code/connections/connect-ts-v3.ts"],
)
def test_client(script_loc):
    run_ts_script(script_loc)


# ========== Datatypes ==========

@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/typescript/config-refs.datatypes.blob.ts",
        "./_includes/code/typescript/config-refs.datatypes.date.ts",
        "./_includes/code/typescript/config-refs.datatypes.geocoordinates.ts",
        "./_includes/code/typescript/config-refs.datatypes.numerical.ts",
        "./_includes/code/typescript/config-refs.datatypes.object.ts",
        "./_includes/code/typescript/config-refs.datatypes.phonenumber.ts",
        "./_includes/code/typescript/config-refs.datatypes.text.ts",
        "./_includes/code/typescript/config-refs.datatypes.uuid.ts",
    ],
)
def test_datatypes(empty_weaviates, script_loc):
    run_ts_script(script_loc)


# ========== Manage Data ==========

@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/howto/manage-data.create.ts",
        # "./_includes/code/howto/manage-data.cross-refs.ts",  # Test currently not working - needs work to fix
        # "./_includes/code/howto/manage-data.import.ts",  # Test currently not working - needs work to fix
        "./_includes/code/howto/manage-data.delete.ts",
        "./_includes/code/howto/manage-data.update.ts",
        "./_includes/code/howto/manage-data.collections.ts",
        "./_includes/code/howto/manage-data.multi-tenancy.ts",
        "./_includes/code/howto/manage-data.ttl.ts",
    ],
)
def test_manage_data(empty_weaviates, script_loc):
    run_ts_script(script_loc)


# ========== Search ==========

@pytest.mark.ts
@pytest.mark.wcd
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
def test_search(empty_weaviates, script_loc):
    run_ts_script(script_loc)


# ========== Quickstart (WCD) ==========

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
def test_quickstart_wcd(empty_weaviates, script_loc):
    run_ts_script(script_loc)


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
def test_quickstart_local(empty_weaviates, script_loc):
    run_ts_script(script_loc)


# ========== Short Quickstart (WCD) ==========

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
def test_quickstart_short_wcd(empty_weaviates, script_loc):
    run_ts_script(script_loc)


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
def test_quickstart_short_local(empty_weaviates, script_loc):
    run_ts_script(script_loc)
