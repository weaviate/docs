// src/theme/Tabs/pyodideRunner.js
// In-browser Python execution via Pyodide (WebAssembly).
//
// Loads the Pyodide runtime from a CDN, installs the Weaviate Python client
// wheels (built from the grpc-web/WASM transport branch) via micropip, and
// runs user code snippets. The interpreter is a module-level singleton that
// persists across runs, like a notebook session.
//
// This module is SSR-safe: it never touches window/document at the top level
// because Docusaurus server-renders pages.

import { loadCredentials } from "./playgroundCredentials";

// Must be >= 0.29.2: the client needs pydantic >= 2.12 and binary packages
// (pydantic-core, cryptography) can only come from the Pyodide distribution —
// PyPI has no WASM wheels for this Python/ABI generation. 0.29.2+ bundles
// pydantic 2.12.5. When bumping, check the new lockfile still satisfies the
// client wheel's pydantic floor.
const PYODIDE_VERSION = "0.29.4";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// Snippets are editable, so a run can hang forever (e.g. awaiting an
// unresponsive host). After this deadline the run is orphaned and the queue
// reset so other Run buttons on the page keep working.
const RUN_TIMEOUT_MS = 60000;

// Wheels served from /static/wheels/, built from weaviate-python-client
// PR #2056 (feat/grpc-web-wasm-transport).
const WEAVIATE_CLIENT_WHEEL_PATH =
  "/wheels/weaviate_client-4.21.4.dev5-py3-none-any.whl";
const GRPC_WEB_SHIM_WHEEL_PATH =
  "/wheels/weaviate_python_grpc_web-0.0.1.dev0-py3-none-any.whl";

// Singleton promise for the initialized Pyodide instance.
let pyodidePromise = null;

// Internal chain that serializes runs so two Run clicks never interleave.
let runChain = Promise.resolve();

// Monotonic run id. A timed-out run is orphaned but keeps executing; the id
// lets it detect it no longer owns the interpreter's stdout/stderr, so its
// late output is discarded instead of landing in the next run's panel.
let currentRunId = 0;

const noop = () => {};

// Injects the Pyodide loader script, skipping injection if it is already
// available on window (e.g. from a previous page in the SPA session).
function loadPyodideScript() {
  if (window.loadPyodide) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${PYODIDE_BASE_URL}pyodide.js`;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load Pyodide from ${script.src}`));
    document.head.appendChild(script);
  });
}

// Returns the singleton Pyodide instance, initializing it on first call.
// onStatus receives short human-readable progress strings.
export function getPyodide(onStatus = noop) {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      try {
        onStatus("Loading Python runtime… (first run can take a while)");
        await loadPyodideScript();
        const pyodide = await window.loadPyodide({
          indexURL: PYODIDE_BASE_URL,
        });

        onStatus("Installing the Weaviate client…");
        // Pre-load the deps with native code from the Pyodide distribution.
        // Left to micropip's resolver, pydantic would be fetched from PyPI,
        // where pydantic-core has no wheel for this Pyodide ABI. ssl is an
        // unvendored stdlib module that httpx imports. anyio is imported by
        // authlib's httpx integration but httpx 0.28 stopped declaring it,
        // so the resolver never pulls it in.
        await pyodide.loadPackage([
          "micropip",
          "pydantic",
          "ssl",
          "cryptography",
          "anyio",
        ]);
        const micropip = pyodide.pyimport("micropip");
        // Both wheels MUST be installed in a single call: the grpc-web shim
        // declares an unpinned dependency on weaviate-client, and installing
        // them together lets the local client wheel satisfy it instead of
        // micropip fetching a release from PyPI.
        await micropip.install([
          new URL(WEAVIATE_CLIENT_WHEEL_PATH, window.location.origin).href,
          new URL(GRPC_WEB_SHIM_WHEEL_PATH, window.location.origin).href,
        ]);

        return pyodide;
      } catch (err) {
        // Reset the singleton so a later Run click can retry initialization.
        pyodidePromise = null;
        throw err;
      }
    })();
  }
  return pyodidePromise;
}

// Injects the stored Weaviate Cloud credentials into the interpreter's
// environment so snippets can read them via os.environ. Values are passed
// through Python globals (not string interpolation) so snippet-breaking
// characters in a key cannot inject code.
function applyCredentials(pyodide) {
  const { url, apiKey } = loadCredentials();
  pyodide.globals.set("__wcd_url", url || "");
  pyodide.globals.set("__wcd_api_key", apiKey || "");
  pyodide.runPython(`
import os
try:
    if __wcd_url:
        os.environ["WEAVIATE_URL"] = __wcd_url
    else:
        os.environ.pop("WEAVIATE_URL", None)
    if __wcd_api_key:
        os.environ["WEAVIATE_API_KEY"] = __wcd_api_key
    else:
        os.environ.pop("WEAVIATE_API_KEY", None)
finally:
    del __wcd_url, __wcd_api_key
`);
}

// Executes a single snippet against the shared interpreter, capturing
// stdout and stderr into one ordered buffer.
async function executeSnippet(code, onStatus) {
  let pyodide;
  try {
    pyodide = await getPyodide(onStatus);
    applyCredentials(pyodide);
  } catch (err) {
    return {
      output: "",
      error: err && err.message ? err.message : String(err),
    };
  }

  onStatus("Running code…");

  const myRunId = ++currentRunId;
  const outputLines = [];
  pyodide.setStdout({
    batched: (line) => {
      if (myRunId === currentRunId) outputLines.push(line);
    },
  });
  pyodide.setStderr({
    batched: (line) => {
      if (myRunId === currentRunId) outputLines.push(line);
    },
  });

  try {
    // runPythonAsync compiles with top-level-await allowed, so snippets may
    // use top-level `await` (required for the async Weaviate client).
    const result = await pyodide.runPythonAsync(code);
    // A snippet ending in a bare expression returns a PyProxy that would
    // otherwise leak for the lifetime of the page.
    if (result && typeof result.destroy === "function") {
      result.destroy();
    }
    return { output: outputLines.join("\n"), error: null };
  } catch (err) {
    // For PythonError, err.message contains the Python traceback.
    return {
      output: outputLines.join("\n"),
      error: err && err.message ? err.message : String(err),
    };
  } finally {
    // Restore the default streams — unless a newer run owns them by now
    // (this run timed out and was orphaned).
    if (myRunId === currentRunId) {
      pyodide.setStdout();
      pyodide.setStderr();
    }
  }
}

// Runs Python code in the browser. Runs are serialized through an internal
// promise chain. Resolves to { output: string, error: string|null } and
// never rejects.
export function runPythonCode(code, { onStatus = noop } = {}) {
  const run = runChain
    .then(() => executeSnippet(code, onStatus))
    .catch((err) => ({
      output: "",
      error: err && err.message ? err.message : String(err),
    }));
  runChain = run;

  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      // Only reset the queue if this run is still the tail of the chain —
      // a later run may already have replaced it. The orphaned run keeps the
      // interpreter; output it produces after the timeout is discarded.
      if (runChain === run) {
        runChain = Promise.resolve();
      }
      resolve({
        output: "",
        error: `Execution timed out after ${
          RUN_TIMEOUT_MS / 1000
        } seconds. Reload the page to reset the Python session.`,
      });
    }, RUN_TIMEOUT_MS);
  });

  return Promise.race([run.finally(() => clearTimeout(timer)), timeout]);
}
