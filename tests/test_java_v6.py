import subprocess
import pytest
import shlex
import os


JAVA_V6_CWD = "_includes/code/java-v6"


def run_java_v6_test(test_class, empty_weaviates):
    command = shlex.split(f"mvn test -Dtest={test_class} --batch-mode")
    env = dict(os.environ)

    try:
        subprocess.check_call(command, cwd=JAVA_V6_CWD, env=env)
    except subprocess.CalledProcessError as error:
        pytest.fail(f"Java v6 {test_class} failed with error: {error}")


@pytest.mark.java_v6
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
    run_java_v6_test(test_class, empty_weaviates)


@pytest.mark.java_v6
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
        "RerankerTest",
    ],
)
def test_search(empty_weaviates, test_class):
    run_java_v6_test(test_class, empty_weaviates)


@pytest.mark.java_v6
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
    run_java_v6_test(test_class, empty_weaviates)


@pytest.mark.java_v6
@pytest.mark.parametrize(
    "test_class",
    [
        "ConnectionTest",
        "BackupsTest",
        "RBACTest",
        "ModelProvidersTest",
        "GetStartedTest",
    ],
)
def test_configuration(empty_weaviates, test_class):
    run_java_v6_test(test_class, empty_weaviates)


@pytest.mark.java_v6
@pytest.mark.parametrize(
    "test_class",
    [
        "QuickstartTest",
        "QuickstartLocalTest",
    ],
)
def test_quickstart(empty_weaviates, test_class):
    run_java_v6_test(test_class, empty_weaviates)


@pytest.mark.java_v6
@pytest.mark.parametrize(
    "test_class",
    [
        "StarterGuidesCollectionsTest",
        "StarterGuidesCustomVectorsTest",
        "StarterGuidesGenerativeTest",
    ],
)
def test_starter_guides(empty_weaviates, test_class):
    run_java_v6_test(test_class, empty_weaviates)
