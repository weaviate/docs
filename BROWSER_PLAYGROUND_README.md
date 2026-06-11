# Browser Playground

This document explains how executable code snippets run in the reader's browser and how to maintain the setup.

## What It Is

Executable docs snippets run directly in the reader's browser. There is no execution server. Python code runs on Pyodide, which is CPython compiled to WebAssembly, and TypeScript code is transpiled in the browser and executed as a native ES module. Pyodide is loaded from the jsDelivr CDN, pinned to version 0.29.4. The pin matters because dependencies with native code (pydantic-core, cryptography) only exist as WebAssembly builds inside the Pyodide distribution, so the bundled pydantic version must satisfy the client wheel's pydantic floor. Check the new `pyodide-lock.json` before bumping either side.

## How It Works

`src/theme/Tabs/pyodideRunner.js` lazy-loads Pyodide the first time a reader clicks **Run**. It then installs the two wheels from `static/wheels/` with micropip and runs the snippet with top-level `await` support. The interpreter is a module-level singleton that survives client-side page navigation, so imports, variables, and the connected client carry over between runs, even on different pages.

The two wheels must be installed in a single `micropip.install()` call. The grpc-web wheel declares an unpinned dependency on `weaviate-client`, and installing both together lets the local client wheel satisfy that dependency instead of pulling a release from PyPI.

## The TypeScript Client

TypeScript snippets are handled by `src/theme/Tabs/tsRunner.js`. It loads the TypeScript compiler from jsDelivr (pinned to 5.9.3) on the first Run click, transpiles the snippet, rewrites its `weaviate-client` import to the browser bundle served from `static/playground/weaviate-client.web.js`, and runs the result as a native ES module through a Blob URL. Each run is a fresh module, so unlike Python nothing persists between runs.

The bundle is built from typescript-client PR #437 (grpc-web transport, browser shims for Node built-ins). To rebuild it:

```bash
cd ~/dev/typescript-client && git fetch origin pull/437/head && git worktree add /tmp/tsc-437 FETCH_HEAD
cd /tmp/tsc-437 && npm ci && npm run build:web
cp dist/web/index.web.js <docs repo>/static/playground/weaviate-client.web.js
```

**Note:** The bundle from `typescript-client` contains bare imports (e.g., `import 'long'`) that browsers cannot resolve. You **must** run the following command in the docs repo to finalize the bundle (this requires `nice-grpc-web` to be installed in the docs repo):

```bash
yarn build:playground-client
```

The bundle's web entry (`connectToCustom`, `connectToWeaviateCloud`) speaks grpc-web on the main host with the default path prefix `/grpc-web`, matching the Python snippet's connection defaults.

## Reader Credentials

The **Connect** button next to **Run** stores the reader's Weaviate Cloud cluster URL and API key in `localStorage` (`src/theme/Tabs/playgroundCredentials.js`). Before each run the runner injects them as the `WEAVIATE_URL` (normalized to a bare host) and `WEAVIATE_API_KEY` environment variables — `os.environ` for Python, a `process.env` shim for TypeScript — and removes them when cleared. Snippets read them with `os.environ.get(...)` and fall back to `localhost` when unset. The values never leave the reader's browser except in the requests the snippet itself makes to their Weaviate instance.

Hitting **Run** with no stored connection details does not execute. Instead it opens the Connect panel in prompt mode, which explains that the snippet runs against the reader's own cluster, links to creating a free Weaviate Cloud cluster, and offers **Save and run** (starts the run once a cluster URL is saved) plus a **Use local instance** escape hatch for readers with a local grpc-web-fronted Weaviate. The local choice is remembered in `localStorage` (`weaviatePlayground.useLocalInstance`) so subsequent runs go straight through; clearing credentials also forgets it. This prompt is an interim flow — once docs can provision an ephemeral Weaviate Cloud cluster dynamically, it will be replaced by one-click provisioning.

## The Python Client

The wheels are built from weaviate-python-client PR #2056 (branch `feat/grpc-web-wasm-transport`). Only the async client works under WebAssembly, the sync client raises an error. gRPC calls are routed over grpc-web using `fetch`. The companion package also reroutes the client's REST calls (httpx) through `fetch`, since httpx normally opens raw sockets that do not exist in the browser.

Snippets must import `weaviate_grpc_web` before `weaviate`, then connect with `weaviate.use_async_with_custom(...)` using `grpc_path_prefix="/grpc-web"` (which enables grpc-web and lets REST and gRPC share a host and port) and `skip_init_checks=True`.

### Rebuilding the wheels

```bash
cd ~/dev/weaviate-python-client && git fetch origin feat/grpc-web-wasm-transport && git worktree add /tmp/wpc-grpcweb FETCH_HEAD
cd /tmp/wpc-grpcweb && SETUPTOOLS_SCM_PRETEND_VERSION=4.21.4.dev5 uv build --wheel --out-dir /tmp/wheels .
cd packages/grpc-web && uv build --wheel --out-dir /tmp/wheels .
cp /tmp/wheels/*.whl <docs repo>/static/wheels/
```

The wheel filenames (`weaviate_client-4.21.4.dev5-py3-none-any.whl` and `weaviate_python_grpc_web-0.0.1.dev0-py3-none-any.whl`) are referenced in `src/theme/Tabs/pyodideRunner.js`. If a rebuild changes a filename, update both together.

## Server Requirements

Snippets need a Weaviate instance that speaks grpc-web. As of Weaviate 1.38 (verified on `1.38.0-rc.1`), grpc-web support is built in (weaviate/weaviate#11673): set `GRPC_WEB_ENABLED=true` and an in-process transcoder serves grpc-web on the REST port under `/grpc-web/` — no Envoy or external proxy needed. The built-in transcoder sends CORS headers (`*` by default, configurable via `CORS_ALLOW_ORIGIN`) and exposes the `grpc-status`/`grpc-message` response headers. Older Weaviate versions need an external grpc-web transcoder such as Envoy or connectrpc/vanguard-go with equivalent CORS treatment.

The snippet defaults assume REST and grpc-web share `localhost:8080` with the path prefix `/grpc-web` (Weaviate Cloud clusters use port 443). The local test instance in `tests/docker-compose-anon.yml` has `GRPC_WEB_ENABLED` set, so the playground's **Use local instance** path works against it with no credentials. One quirk: Weaviate's regular REST routes (`/v1/meta`, `/v1/schema`, …) send `Access-Control-Allow-Origin`, but `/v1/.well-known/ready` does not (the liveness/readiness middleware short-circuits before the CORS middleware), so browsers block `is_ready()` specifically — snippets should skip it (the movies snippet keeps it commented out for this reason). Chrome and Firefox allow `http://localhost` fetches from an https page, so a local instance works from the production docs site in those browsers. Safari blocks them, and Chrome's Private Network Access checks may require answering a preflight request.

## Limitations

- Async client only, the sync client does not work under WebAssembly.
- No `batch.stream()` or `batch.experimental()`, bidirectional streaming is not possible over grpc-web.
- Java, C#, and Go snippets cannot run in the browser.
- TypeScript runs each snippet as a fresh module, so no state carries over between runs the way it does for Python.
- A run times out after 60 seconds. After a timeout the page keeps working but the old run may still hold the interpreter, so reload the page for a clean session.

## Validating Without a Browser

Pyodide also runs under Node, so the install path can be tested locally with `_build_scripts/browser-playground-smoke.mjs` (usage instructions are in the script header). It exercises the package preloads, the micropip install of the local wheels, the import chain, and client construction. Run it after rebuilding the wheels or bumping the Pyodide version. The preload list in the script must mirror the one in `src/theme/Tabs/pyodideRunner.js`.

## Validation Status

Verified end to end under WebAssembly (via Node, June 2026) against a Weaviate Cloud dev cluster fronted by a grpc-web transcoder: dependency resolution, wheel install, the import chain, `is_ready()` over REST through the fetch transport, collection listing over REST, and a gRPC-web query that round-trips a clean server error. The only browser-specific leg Node cannot exercise is CORS, which the server must grant on both the grpc-web route and the REST passthrough.
