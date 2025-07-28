# Testing Weaviate docs code snippets

This directory contains the setup for executing code snippets used in Weaviate docs. They can either be run [locally]() or through a [GitHub workflow](#workflow).

## 🚀 GitHub workflow {#workflow}

This GitHub Actions workflow provides automated testing for the `testing-ci` branch with a comprehensive setup that includes Python environments, Docker services (Weaviate and Ollama), and various AI/ML model integrations.

The CI workflow is executed:

- **Periodically**: Every Sunday at midnight CET
- When code is pushed to the `testing-ci` branch
- Manually triggered via workflow dispatch

**Runtime**: ~30 minutes maximum (with timeout protection)
**Runner**: Ubuntu Latest

## 🛠 Software versions

| Component  | Version                             | Purpose                        |
| ---------- | ----------------------------------- | ------------------------------ |
| Python     | 3.10                                | Core runtime environment       |
| Weaviate   | 1.32.0                              | Vector database for embeddings |
| Ollama     | 0.9.6                               | Local LLM inference server     |
| CLIP Model | sentence-transformers-clip-ViT-B-32 | Vision-language model          |

## 🔧 Environment variables & secrets

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
# OpenAI
OPENAI_APIKEY             # OpenAI API key (legacy format)
OPENAI_API_KEY            # OpenAI API key (standard format)

# Cohere
COHERE_APIKEY             # Cohere API key (legacy format)
COHERE_API_KEY            # Cohere API key (standard format)

# Other Services
HUGGINGFACE_APIKEY        # Hugging Face API key
ANTHROPIC_APIKEY          # Anthropic API key
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

## 🧪 Test Execution Details

### Test Command

```bash
pytest -m pyv4 -v --tb=short --durations=10
```

### Command Breakdown

- `-m pyv4`: Only run tests marked with the `pyv4` marker
- `-v`: Verbose output showing individual test names
- `--tb=short`: Display concise traceback on failures
- `--durations=10`: Show timing for the 10 slowest tests

### Test Requirements

Tests are installed from `tests/requirements.txt` and run within a Python virtual environment.

## 🌐 Service Ports & Health Checks

The workflow monitors multiple Weaviate instances on different ports:

| Port | Service             | Purpose                   |
| ---- | ------------------- | ------------------------- |
| 8099 | Weaviate Main       | Primary Weaviate instance |
| 8580 | Weaviate gRPC       | gRPC endpoint             |
| 8080 | Weaviate Instance 1 | Additional instance       |
| 8090 | Weaviate Instance 2 | Additional instance       |
| 8280 | Weaviate Instance 3 | Additional instance       |
| 8180 | Weaviate Instance 4 | Additional instance       |
| 8181 | Weaviate Instance 5 | Additional instance       |
| 8182 | Weaviate Instance 6 | Additional instance       |

All services are checked for readiness via their `/v1/.well-known/ready` endpoints.

## 📁 Cached Components

To improve performance, the workflow caches:

1. **Python Dependencies**: Virtual environment and pip cache
2. **Docker Images**: Weaviate, CLIP, and Ollama base images
3. **Ollama Models**: Downloaded AI models for faster subsequent runs

## 🔍 Troubleshooting

### Common Issues

**Disk Space**: The workflow automatically frees up disk space, but very large models might still cause issues.

**Service Startup**: Services are checked for readiness, but network issues might cause timeouts.

**API Limits**: Make sure all API keys have sufficient quota/limits for test execution.

### Failure Artifacts

When tests fail, the workflow uploads:

- `pytest-results.xml` - JUnit-style test results
- `.pytest_cache/` - Pytest cache directory

These artifacts are retained for 7 days for debugging purposes.

## 🖥️ Local testing {#local}

### Purpose

The test suite validates code examples throughout the site to ensure they remain robust and up-to-date. Tests cover multiple programming languages and API versions.

### Local setup

```bash
# From the repo root directory
python3 -m venv .venv              # Create virtual environment
source .venv/bin/activate          # Activate virtual environment
pip install -r requirements.txt    # Install dependencies
```

### Running tests locally

The test runner automatically:

1. Executes start-weaviate.sh to spin up Docker containers
2. Starts multiple Weaviate instances via docker-compose.yml files
3. Runs tests against ephemeral or permanent WCD instances

```bash
# From repo root - runs all tests
pytest
```

#### Test markers

Tests are organized using pytest markers for different languages and API versions:

| Marker | Description                             |
| ------ | --------------------------------------- |
| `pyv4` | Python snippets using v4 client library |
| `pyv3` | Python snippets using v3 client library |
| `ts`   | JavaScript/TypeScript snippets          |
| `java` | Java code snippets                      |
| `go`   | Go code snippets                        |
