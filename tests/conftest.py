import pytest
import subprocess
import time
import sys
import os


@pytest.fixture(scope="session")
def empty_weaviates(request):
    # Check if we're running in GitHub Actions
    if os.environ.get("DOCS_GITHUB_ENV") == "true":
        print("Running in GitHub Actions - Docker containers managed by workflow")
        print("Skipping Docker startup/teardown in conftest.py")
        sys.stdout.flush()
        return  # Skip Docker management, containers are handled by GitHub Actions workflow

    # Code to run at startup (only for local development)
    print("Spinning up Weaviate")
    sys.stdout.flush()

    try:
        # Use Popen for real-time output streaming
        process = subprocess.Popen(
            ["tests/start-weaviate.sh"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,  # Merge stderr into stdout
            universal_newlines=True,
            bufsize=1,  # Line buffered
            env={**os.environ, "PYTHONUNBUFFERED": "1"},
        )

        # Stream output in real-time
        for line in process.stdout:
            print(f"[start-weaviate] {line.rstrip()}")
            sys.stdout.flush()

        # Wait for process to complete
        return_code = process.wait()

        if return_code != 0:
            print(f"Start script failed with return code {return_code}")
            sys.stdout.flush()
            raise subprocess.CalledProcessError(return_code, "tests/start-weaviate.sh")

        print("Weaviate startup completed successfully")
        sys.stdout.flush()

    except Exception as e:
        print(f"Failed to start Weaviate: {e}")
        sys.stdout.flush()
        raise

    time.sleep(5)  # Give extra time for services to be fully ready

    def teardown():
        # Only run teardown if we're not in GitHub Actions
        if os.environ.get("DOCS_GITHUB_ENV") == "true":
            print("Skipping Docker teardown - managed by GitHub Actions workflow")
            return

        # Code to run at exit (only for local development)
        print("Shutting down Weaviate")
        sys.stdout.flush()
        try:
            # Also stream teardown output
            process = subprocess.Popen(
                ["tests/stop-weaviate.sh"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1,
            )

            for line in process.stdout:
                print(f"[stop-weaviate] {line.rstrip()}")
                sys.stdout.flush()

            return_code = process.wait()
            if return_code != 0:
                print(f"Stop script failed with return code {return_code}")
                sys.stdout.flush()

        except Exception as e:
            print(f"Failed to stop Weaviate: {e}")
            sys.stdout.flush()

    request.addfinalizer(teardown)
