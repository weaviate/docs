import subprocess
import pytest
import os

import utils


CSHARP_CSPROJ = "_includes/code/csharp/WeaviateProject.Tests.csproj"


def run_csharp_test(test_class, empty_weaviates):
    command = [
        "dotnet", "test", CSHARP_CSPROJ,
        "--filter", f"FullyQualifiedName~{test_class}",
        "-v", "normal",
    ]
    env = dict(os.environ)

    def _run():
        result = subprocess.run(command, env=env, capture_output=True, text=True)
        if result.stdout.strip():
            print(result.stdout)
        if result.returncode != 0:
            raise Exception(
                f"C# {test_class} failed (exit {result.returncode})\n"
                f"--- STDERR ---\n{result.stderr}\n--- STDOUT ---\n{result.stdout}"
            )

    try:
        utils.retry_on_transient(_run, label=test_class)
    except Exception as error:
        pytest.fail(f"C# {test_class} failed with error: {error}")


# ConnectionTest runs first: its OIDC case authenticates with a bearer token
# fetched once at CI job start. That token has a short lifespan, and once it
# lapses the 1.1.0 client attempts a refresh that fails. Running it before the
# longer suites keeps it inside the token's valid window.
@pytest.mark.csharp
@pytest.mark.parametrize(
    "test_class",
    [
        "ConnectionTest",
    ],
)
def test_connection(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)


# Most LlmsTxtTest [Fact] methods connect to Weaviate Cloud (text2vec-weaviate
# requires Weaviate Embeddings, which only Cloud has). The wcd marker
# signals the dependency; TestLocalConnection + TestRbac inside the class
# still use the local stack on :8080 / :8580.
@pytest.mark.csharp
@pytest.mark.wcd
@pytest.mark.parametrize(
    "test_class",
    [
        "LlmsTxtTest",
    ],
)
def test_llms_txt(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)


@pytest.mark.csharp
@pytest.mark.parametrize(
    "test_class",
    [
        "ManageCollectionsTest",
        "ManageCollectionsAliasTest",
        "ManageCollectionsCrossReferencesTest",
        "ManageCollectionsMigrateDataTest",
        "ManageCollectionsMultiTenancyTest",
        "ManageObjectsCreateTest",
        "ManageObjectsDeleteTest",
        "ManageObjectsImportTest",
        "ManageObjectsReadTest",
        "ManageObjectsReadAllTest",
        "ManageObjectsUpdateTest",
    ],
)
def test_manage_data(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)


@pytest.mark.csharp
@pytest.mark.parametrize(
    "test_class",
    [
        "SearchBasicTest",
        "SearchSimilarityTest",
        "SearchKeywordTest",
        "SearchHybridTest",
        "SearchFiltersTest",
        "SearchAggregateTest",
        "SearchGenerativeTest",
        "SearchMultiTargetTest",
        "SearchImageTest",
    ],
)
def test_search(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)


@pytest.mark.csharp
@pytest.mark.parametrize(
    "test_class",
    [
        "ConfigurePQTest",
        "ConfigureBQTest",
        "ConfigureSQTest",
        "ConfigureRQTest",
    ],
)
def test_compression(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)


@pytest.mark.csharp
@pytest.mark.parametrize(
    "test_class",
    [
        "BackupsTest",
        pytest.param(
            "RBACTest",
            marks=pytest.mark.skip(
                reason="Released Java/C# clients can't deserialize the `namespaces` RBAC "
                "permission that Weaviate 1.35.0 emits in its built-in roles; unskip once a "
                "client release adds support."
            ),
        ),
        pytest.param(
            "ReplicationTest",
            marks=pytest.mark.skip(
                reason="Replication workflow needs a stable multi-node cluster; flaky in CI."
            ),
        ),
        "ModelProvidersTest",
        "GetStartedTest",
    ],
)
def test_configuration(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)


@pytest.mark.csharp
@pytest.mark.parametrize(
    "test_class",
    [
        "QuickstartTest",
        "QuickstartLocalTest",
    ],
)
def test_quickstart(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)


@pytest.mark.csharp
@pytest.mark.parametrize(
    "test_class",
    [
        "StarterGuidesCollectionsTest",
        "StarterGuidesCustomVectorsTest",
    ],
)
def test_starter_guides(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)


# ========== Tokenization (v1.37) ==========

@pytest.mark.csharp
@pytest.mark.parametrize(
    "test_class",
    [
        "TokenizationTest",
    ],
)
def test_tokenization(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)


# ========== Search profile (v1.36.10+) ==========

@pytest.mark.csharp
@pytest.mark.parametrize(
    "test_class",
    [
        "SearchProfileTest",
    ],
)
def test_search_profile(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)


# ========== Collection export (v1.37+) ==========

@pytest.mark.csharp
@pytest.mark.parametrize(
    "test_class",
    [
        "ManageDataExportTest",
    ],
)
def test_export(empty_weaviates, test_class):
    run_csharp_test(test_class, empty_weaviates)
