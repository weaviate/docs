# Testing Weaviate docs code snippets

This directory contains the setup for executing code snippets used in Weaviate docs. They can either be run [locally](#local) or through a [GitHub workflow](#workflow).

## GitHub workflow {#workflow}

This GitHub Actions workflow provides automated testing for the `testing-ci` branch with a comprehensive setup that includes Python environments, Docker services (Weaviate and Ollama), and various AI/ML model integrations.

The CI workflow is executed:

- **Periodically**: Every Sunday at midnight CET
- When code is pushed to the `testing-ci` branch
- Manually triggered via workflow dispatch

**Runtime**: ~30 minutes maximum (with timeout protection per job)
**Runner**: Ubuntu Latest

### CI jobs

Each language runs in its own parallel job:

| Job | Marker(s) | Description |
| --- | --------- | ----------- |
| `test-agents` | `agents` | Query Agent tests |
| `test-python` | `(pyv4 or pyv3) and not agents` | Python client tests |
| `test-typescript` | `ts and not agents` | TypeScript client tests |
| `test-java` | `java` | Java client tests (with SNAPSHOT build) |
| `test-csharp` | `csharp` | C# client tests (clones csharp-client repo) |

## Software versions

| Component | Version | Purpose |
| --------- | ------- | ------- |
| Python | 3.10 | Core runtime environment |
| Weaviate | 1.35.0 | Vector database |
| Ollama | 0.9.6 | Local LLM inference server |
| Keycloak | 24.0.3 | OIDC provider for RBAC tests |
| CLIP Model | sentence-transformers-clip-ViT-B-32 | Vision-language model |

## Environment variables & secrets

### Weaviate configuration

```bash
WEAVIATE_URL              # Main Weaviate endpoint URL
WEAVIATE_HOST             # Weaviate host address
WEAVIATE_HOSTNAME         # Weaviate hostname
WEAVIATE_HTTP_HOST        # HTTP host for Weaviate
WEAVIATE_GRPC_HOST        # gRPC host for Weaviate
WEAVIATE_API_KEY          # API key for Weaviate access
WEAVIATE_LOCAL_API_KEY    # Local Weaviate API key
```

### AI Service API Keys

```bash
OPENAI_API_KEY            # OpenAI API key
COHERE_API_KEY            # Cohere API key
HUGGINGFACE_API_KEY       # Hugging Face API key
ANTHROPIC_API_KEY         # Anthropic API key
```

### Weaviate Cloud (WCD) credentials

```bash
WCD_USERNAME              # Weaviate Cloud username
WCD_PASSWORD              # Weaviate Cloud password
```

### Test setup environment variables

```bash
DOCS_GITHUB_ENV=true      # Indicates running in GitHub Actions
```

## Test files

Tests are organized by language, one file per language:

| File | Markers | Description |
| ---- | ------- | ----------- |
| `test_python.py` | `pyv4`, `pyv3` | Python v4 and v3 client tests |
| `test_typescript.py` | `ts` | TypeScript client tests |
| `test_java.py` | `java` | Java client tests (JUnit via Maven) |
| `test_csharp.py` | `csharp` | C# client tests (xUnit via dotnet) |
| `test_agents.py` | `agents` | Query Agent tests |

Supporting files:

| File | Description |
| ---- | ----------- |
| `conftest.py` | Pytest fixtures (e.g. `empty_weaviates` for Docker lifecycle) |
| `utils.py` | Shared helpers for script loading, preprocessing, and execution |

## Test markers

Tests are organized using pytest markers:

| Marker | Description |
| ------ | ----------- |
| `pyv4` | Python snippets using v4 client library |
| `pyv3` | Python snippets using v3 client library |
| `ts` | TypeScript snippets |
| `java` | Java client snippets |
| `csharp` | C# client snippets |
| `agents` | Query Agent snippets |
| `wcd` | Tests requiring a Weaviate Cloud instance |

### Running tests by marker

```bash
# Run all Python v4 tests
uv run pytest -m pyv4

# Run TypeScript tests (excluding agents)
uv run pytest -m "ts and not agents"

# Run all WCD-dependent tests
uv run pytest -m wcd

# Verbose output with timing info
uv run pytest -m pyv4 -v --tb=short --durations=10
```

## Service Ports & Health Checks

The workflow monitors multiple Weaviate instances on different ports:

| Port | Service | Purpose |
| ---- | ------- | ------- |
| 8099 | Weaviate Main | Primary Weaviate instance |
| 8580 | Weaviate RBAC | RBAC-enabled instance (requires Keycloak) |
| 8080 | Weaviate Instance 1 | Additional instance |
| 8090 | Weaviate Instance 2 | Additional instance |
| 8280 | Weaviate Instance 3 | Additional instance |
| 8180 | Weaviate Instance 4 | Additional instance |
| 8181 | Weaviate Instance 5 | Additional instance |
| 8182 | Weaviate Instance 6 | Additional instance |

All services are checked for readiness via their `/v1/.well-known/ready` endpoints.

## Failure Artifacts

When tests fail, the workflow uploads:

- `pytest-results.xml` - JUnit-style test results
- `.pytest_cache/` - Pytest cache directory

These artifacts are retained for 7 days for debugging purposes.

## Local testing {#local}

### Prerequisites

- Python 3.10+
- Node.js 22+ and yarn
- Docker (required for running Weaviate instances)
- API keys for vectorization services (`OPENAI_API_KEY`, `COHERE_API_KEY`, `HUGGINGFACE_API_KEY`)

Additional language-specific requirements:

| Language | Requirements |
| -------- | ------------ |
| Java | JDK 17+, Maven |
| C# | .NET 9.0 SDK |
| Go | Go 1.21+ |

### Setup

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# From the repo root directory
uv sync         # Python deps
yarn install    # Node deps (tsx + weaviate-client + sample-script deps)
```

Node deps live in a single root `package.json` / `yarn.lock` — there are no nested `package.json` files in `_includes/code/` or `tests/`. The TypeScript test harness shells out to `npx tsx`, which resolves modules from the root `node_modules/`.

### Running tests

The test runner automatically starts Weaviate Docker containers via `start-weaviate.sh`.

```bash
# Run all tests
uv run pytest

# Run a specific test file
uv run pytest tests/test_python.py

# Run a specific test function
uv run pytest tests/test_python.py::test_search
```

### Language-specific instructions

#### TypeScript

```bash
# Start Weaviate instances
tests/start-weaviate.sh

# Run all TypeScript tests via pytest (excluding agents)
uv run pytest -m "ts and not agents"

# Run a specific test
uv run pytest tests/test_typescript.py::test_tokenization

# Stop Weaviate instances
tests/stop-weaviate.sh
```

The harness writes a temporary `tests/temp.ts` and executes it with `npx tsx`, resolving imports from the root `node_modules/`. Make sure `yarn install` has been run (see [Setup](#setup)).

#### Java

```bash
# Start Weaviate instances
tests/start-weaviate.sh

# Navigate to Java examples
cd _includes/code/java-v6

# Run all tests
mvn clean test

# Run a specific test class
mvn test -Dtest=StarterGuidesGenerativeTest

# Stop Weaviate instances
tests/stop-weaviate.sh
```

#### Go

```bash
# Start Weaviate instances
tests/start-weaviate.sh

# Navigate to Go examples
cd _includes/code/howto/go/docs

# Update dependencies
go mod tidy

# Run all tests
go test

# Run a specific test
go test -v -run ^Test_ManageData ./...

# Stop Weaviate instances
tests/stop-weaviate.sh
```

#### C#

```bash
# Start Weaviate instances
tests/start-weaviate.sh

# Run all C# tests via pytest
uv run pytest -m csharp

# Or run directly via dotnet
dotnet test _includes/code/csharp/WeaviateProject.Tests.csproj

# Run a specific test class
dotnet test _includes/code/csharp/WeaviateProject.Tests.csproj --filter "FullyQualifiedName~GetStartedTests"

# Stop Weaviate instances
tests/stop-weaviate.sh
```

## Troubleshooting

- If tests fail to connect to Weaviate, ensure Docker is running and the Weaviate instances are up
- For API key issues, verify your environment variables are set correctly
- For RBAC test failures, ensure Keycloak is running and configured (the CI workflow does this automatically via `keycloak_helper_script.py`)
- If you encounter dependency issues, try running `uv sync` to reinstall dependencies
