import pytest


# These tests read local files only. Override the parent conftest's autouse
# session fixtures so `pytest -m openapi` does not start the Weaviate stack.
@pytest.fixture(scope="session")
def empty_weaviates():
    return None


@pytest.fixture(scope="session", autouse=True)
def oidc_env():
    return None
