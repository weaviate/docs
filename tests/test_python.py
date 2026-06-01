import os

import pytest
import utils
from pathlib import Path


def _client_supports_namespaces():
    """The namespace snippet needs the Python client from
    weaviate-python-client#2033: typed `client.namespaces` + `Permissions.namespaces`
    AND a `namespace=` argument on `users.db.create`. The API is still settling in the
    open PR, so require all of them — otherwise skip rather than hard-fail."""
    try:
        import inspect

        from weaviate.rbac.models import Permissions
        from weaviate.users.base import _UsersDBExecutor

        return (
            hasattr(Permissions, "namespaces")
            and "namespace" in inspect.signature(_UsersDBExecutor.create).parameters
        )
    except Exception:
        return False


def run_py_script(script_loc, custom_replace_pairs=None):
    if custom_replace_pairs:
        temp_proc_script_loc = utils.load_and_prep_temp_file(
            script_loc, lang="py", custom_replace_pairs=custom_replace_pairs
        )
        utils.execute_py_script_as_module(
            temp_proc_script_loc.read_text(), Path(script_loc).stem
        )
    else:
        proc_script = utils.load_and_prep_script(script_loc)
        utils.execute_py_script_as_module(proc_script, Path(script_loc).stem)


def run_pyv3_script(script_loc):
    proc_script = utils.load_and_prep_script(script_loc)
    exec(proc_script)


# ========== API / GraphQL ==========

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
def test_api_gql(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Client ==========

@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/connections/connect-python-v4.py",
        pytest.param(
            "./_includes/code/client-libraries/python_v4.py",
            marks=pytest.mark.xfail(
                reason="Flaky: gRPC search intermittently returns Deadline Exceeded in CI",
                strict=False,
            ),
        ),
        "./_includes/code/client-libraries/python_slow_connection.py",
        "./_includes/code/rest.well-known.py",
    ],
)
def test_client(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Compression ==========

@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/howto/configure.pq-compression.py",
        "./_includes/code/howto/configure.bq-compression.py",
        "./_includes/code/howto/configure-sq/sq-compression-v4.py",
        "./_includes/code/howto/configure-rq/rq-compression-v4.py",
    ],
)
def test_compression(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Configure ==========

@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/howto/configure.backups.py",
        "./_includes/code/howto/configure.export.py",
        "./_includes/code/python/howto.configure.rbac.permissions.py",
        "./_includes/code/python/howto.configure.rbac.roles.py",
    ],
)
def test_configure(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Datatypes ==========

@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/python/config-refs.datatypes.blob.py",
        "./_includes/code/python/config-refs.datatypes.date.py",
        "./_includes/code/python/config-refs.datatypes.geocoordinates.py",
        "./_includes/code/python/config-refs.datatypes.numerical.py",
        "./_includes/code/python/config-refs.datatypes.object.py",
        "./_includes/code/python/config-refs.datatypes.phonenumber.py",
        "./_includes/code/python/config-refs.datatypes.text.py",
        "./_includes/code/python/config-refs.datatypes.uuid.py",
    ],
)
def test_datatypes(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Install ==========

@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/install/embedded.py",
    ],
)
def test_install(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Manage Data ==========

@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/howto/manage-data.collections.py",
        "./_includes/code/howto/manage-data.create.py",
        "./_includes/code/howto/manage-data.import.py",
        "./_includes/code/howto/manage-data.update.py",
        "./_includes/code/howto/manage-data.delete.py",
        "./_includes/code/howto/manage-data.cross-refs.py",
        "./_includes/code/howto/manage-data.multi-tenancy.py",
        "./_includes/code/howto/manage-data.migrate.data.v4.py",
        "./_includes/code/config-refs/reference.collections.py",
        "./_includes/code/howto/manage-data.ttl.py",
    ],
)
def test_manage_data(empty_weaviates, script_loc):
    run_py_script(script_loc)


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/howto/manage-data.read.py",
        "./_includes/code/howto/manage-data.read-all-objects.py",
    ],
)
def test_manage_data_edu(empty_weaviates, script_loc):
    run_py_script(script_loc, custom_replace_pairs=utils.edu_readonly_replacements)


# ========== Modules ==========

@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/generative.groupedtask.examples.py",
        "./_includes/code/generative.singleprompt.examples.py",
    ],
)
def test_modules(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Namespaces ==========

@pytest.mark.pyv4
@pytest.mark.skipif(
    not _client_supports_namespaces(),
    reason="Installed weaviate-client lacks namespace support (needs weaviate-python-client#2033)",
)
def test_namespaces(empty_weaviates):
    # Runs against the namespace-enabled instance (docker-compose-namespaces.yml,
    # ports 8680/50651), connecting as the static-API-key operator (global) principal.
    os.environ["OPERATOR_API_KEY"] = "operator-api-key"
    run_py_script(
        "./_includes/code/howto/namespaces.py",
        custom_replace_pairs=[
            [
                "weaviate.connect_to_local(",
                "weaviate.connect_to_local(port=8680, grpc_port=50651, ",
            ],
        ],
    )


# ========== Search ==========

@pytest.mark.pyv4
@pytest.mark.wcd
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
def test_search(empty_weaviates, script_loc):
    run_py_script(script_loc, custom_replace_pairs=utils.edu_readonly_replacements)


@pytest.mark.pyv4
@pytest.mark.skip(
    reason="Diversity/MMR not yet in a released weaviate-client; unskip once "
    "https://github.com/weaviate/weaviate-python-client/pull/1997 ships"
)
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/howto/search.similarity.mmr.py",
    ],
)
def test_search_mmr(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Starter Guides ==========

@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/quickstart.byov.all.py",
        "./_includes/code/starter-guides/generative.py",
        "./_includes/code/starter-guides/schema.py",
    ],
)
def test_starter_guides(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Quickstart (WCD) ==========

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
def test_quickstart_wcd(script_loc):
    run_py_script(script_loc)


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
def test_quickstart_local(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Short Quickstart (WCD) ==========

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
def test_quickstart_short_wcd(script_loc):
    run_py_script(script_loc)


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
def test_quickstart_short_local(empty_weaviates, script_loc):
    run_py_script(script_loc)


# ========== Tutorials: Tokenization ==========

@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/tutorials/tokenization/create_collection.py",
        "./_includes/code/tutorials/tokenization/add_objects.py",
        "./_includes/code/tutorials/tokenization/filters.py",
        "./_includes/code/tutorials/tokenization/searches.py",
    ],
)
def test_tutorial_tokenization(empty_weaviates, script_loc):
    run_py_script(script_loc)


@pytest.mark.pyv4
@pytest.mark.parametrize(
    "script_loc",
    [
        "./_includes/code/tutorials/tokenization/accent_folding.py",
        "./_includes/code/tutorials/tokenization/custom_stopwords.py",
        "./_includes/code/tutorials/tokenization/tokenize_endpoint.py",
    ],
)
def test_tutorial_tokenization_v137(empty_weaviates, script_loc):
    run_py_script(script_loc)
