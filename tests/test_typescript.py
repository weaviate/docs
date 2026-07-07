import pytest
import utils


def run_ts_script(script_loc, custom_replace_pairs=None):
    temp_proc_script_loc = utils.load_and_prep_temp_file(
        script_loc, lang="ts", custom_replace_pairs=custom_replace_pairs or []
    )
    command = ["npx", "tsx", temp_proc_script_loc]

    try:
        utils.retry_on_transient(
            lambda: utils.run_script(command, script_loc), label=str(script_loc)
        )
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


# ========== llms.txt code snippets ==========

# Local-only — local_connection is just the connect call; rbac uses the
# local RBAC instance on :8580.
@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/llms-txt/typescript/local_connection.ts",
        "./_includes/code/llms-txt/typescript/rbac.ts",
    ],
)
def test_llms_txt(empty_weaviates, script_loc):
    run_ts_script(script_loc)


# WCD-only — llms.txt recommends text2vec-weaviate (Weaviate Embeddings),
# which needs a Cloud cluster. These scripts connect via WEAVIATE_URL /
# WEAVIATE_API_KEY; generative.ts also needs OPENAI_API_KEY for the
# generative-openai module.
@pytest.mark.ts
@pytest.mark.wcd
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/llms-txt/typescript/quickstart.ts",
        "./_includes/code/llms-txt/typescript/crud.ts",
        "./_includes/code/llms-txt/typescript/queries.ts",
        "./_includes/code/llms-txt/typescript/filtering.ts",
        "./_includes/code/llms-txt/typescript/multi_tenancy.ts",
        "./_includes/code/llms-txt/typescript/named_vectors.ts",
        "./_includes/code/llms-txt/typescript/aggregations.ts",
        "./_includes/code/llms-txt/typescript/generative.ts",
    ],
)
def test_llms_txt_wcd(script_loc):
    run_ts_script(script_loc)


@pytest.mark.ts
@pytest.mark.agents
@pytest.mark.parametrize(
    "script_loc",
    ["./_includes/code/llms-txt/typescript/query_agent.ts"],
)
def test_llms_txt_agents(script_loc):
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
    # search.generative.ts loads `./koala.jpg`; the snippet is run as
    # tests/temp.ts at test time, so rewrite the path to point at the
    # actual bundled image in the docs repo.
    custom = None
    if "search.generative.ts" in script_loc:
        custom = [("./koala.jpg", "_includes/code/howto/koala.jpg")]
    run_ts_script(script_loc, custom_replace_pairs=custom)


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


# ========== Tokenization (v1.37) ==========

@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/tutorials/tokenization/accent_folding.ts",
        "./_includes/code/tutorials/tokenization/custom_stopwords.ts",
        "./_includes/code/tutorials/tokenization/tokenize_endpoint.ts",
    ],
)
def test_tokenization(empty_weaviates, script_loc):
    run_ts_script(script_loc)


# ========== Query profile (v1.37) ==========

@pytest.mark.ts
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/howto/search.profile.ts",
    ],
)
def test_search_profile(empty_weaviates, script_loc):
    run_ts_script(script_loc)
