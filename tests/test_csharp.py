import subprocess
import pytest
import os


CSHARP_CSPROJ = "_includes/code/csharp/WeaviateProject.Tests.csproj"


def run_csharp_test(test_class, empty_weaviates):
    command = [
        "dotnet", "test", CSHARP_CSPROJ,
        "--filter", f"FullyQualifiedName~{test_class}",
        "-v", "normal",
    ]
    env = dict(os.environ)

    try:
        subprocess.check_call(command, env=env)
    except subprocess.CalledProcessError as error:
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
        "RBACTest",
        "ReplicationTest",
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
