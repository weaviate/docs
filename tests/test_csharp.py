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
        "ConnectionTest",
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
