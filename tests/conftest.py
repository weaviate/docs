import pytest
import subprocess
import time


@pytest.fixture(scope="session")
def empty_weaviates(request):
    # Code to run at startup
    print("Spinning up Weaviate")
    try:
        result = subprocess.run(
            ["tests/start-weaviate.sh"],
            check=True,
            capture_output=True,
            text=True,
            timeout=360,
        )  # 6 minute timeout
        print("Start script output:", result.stdout)
        if result.stderr:
            print("Start script stderr:", result.stderr)
    except subprocess.CalledProcessError as e:
        print(f"Start script failed with return code {e.returncode}")
        print("stdout:", e.stdout)
        print("stderr:", e.stderr)
        raise
    except subprocess.TimeoutExpired as e:
        print("Start script timed out")
        raise

    time.sleep(10)  # Give extra time for all services to be fully ready

    def teardown():
        # Code to run at exit
        print("Shutting down Weaviate")
        try:
            subprocess.run(["tests/stop-weaviate.sh"], check=True, timeout=60)
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
            print(f"Stop script failed: {e}")

    request.addfinalizer(teardown)
