import pytest
import utils
from pathlib import Path


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
        "./_includes/code/client-libraries/python_v4.py",
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
