import subprocess
import pytest
import shlex
import os


JAVA_V6_CWD = "_includes/code/java-v6"


def run_java_v6_test(test_class, empty_weaviates):
    command = shlex.split(f"mvn test -Dtest={test_class} --batch-mode")
    env = dict(os.environ)

    try:
        result = subprocess.run(
            command, cwd=JAVA_V6_CWD, env=env,
            capture_output=True, text=True, check=True,
        )
    except subprocess.CalledProcessError as error:
        details = [f"Java v6 {test_class} failed (exit code {error.returncode})"]
        if error.stdout:
            details.append(f"\n--- STDOUT (last 80 lines) ---\n{chr(10).join(error.stdout.splitlines()[-80:])}")
        if error.stderr:
            details.append(f"\n--- STDERR (last 40 lines) ---\n{chr(10).join(error.stderr.splitlines()[-40:])}")
        pytest.fail("\n".join(details))


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
        "SearchFilterTest",
        "SearchAggregateTest",
        "GenerativeSearchTest",
        "MultiTargetSearchTest",
        "SearchImageTest",
        "RerankTest",
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
