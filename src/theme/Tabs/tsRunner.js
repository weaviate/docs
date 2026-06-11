// src/theme/Tabs/tsRunner.js
// In-browser TypeScript execution.
//
// Snippets are transpiled with the TypeScript compiler (loaded from a CDN on
// first use), their `weaviate-client` import is rewritten to the browser
// bundle served from /playground/ (built from typescript-client PR #437,
// gRPC over grpc-web), and the result runs as a native ES module via a Blob
// URL. Each run is a fresh module — unlike the Python runner, no state
// persists between runs.
//
// This module is SSR-safe: it never touches window/document at the top level
// because Docusaurus server-renders pages.

import { loadCredentials } from "./playgroundCredentials";

const TYPESCRIPT_VERSION = "5.9.3";
const TYPESCRIPT_COMPILER_URL = `https://cdn.jsdelivr.net/npm/typescript@${TYPESCRIPT_VERSION}/lib/typescript.min.js`;

// Browser ESM bundle of the TypeScript client, built from
// typescript-client PR #437 (`npm run build:web` → dist/web/index.web.js).
const CLIENT_BUNDLE_PATH = "/playground/weaviate-client.web.js";

// Same deadline rationale as pyodideRunner.js: snippets are editable and can
// hang forever, so orphan the run and free the queue after this long.
const RUN_TIMEOUT_MS = 60000;

let compilerPromise = null;
let runChain = Promise.resolve();

// Monotonic run id so an orphaned (timed-out) run cannot restore the console
// out from under the run that now owns it.
let currentRunId = 0;

const noop = () => {};

// Injects the TypeScript compiler script, resolving once window.ts exists.
function loadTypeScriptCompiler() {
  if (!compilerPromise) {
    compilerPromise = new Promise((resolve, reject) => {
      if (window.ts) {
        resolve(window.ts);
        return;
      }
      const script = document.createElement("script");
      script.src = TYPESCRIPT_COMPILER_URL;
      script.onload = () => resolve(window.ts);
      script.onerror = () => {
        // Reset so a later Run click can retry
        compilerPromise = null;
        reject(new Error(`Failed to load the TypeScript compiler from ${script.src}`));
      };
      document.head.appendChild(script);
    });
  }
  return compilerPromise;
}

function transpile(ts, code) {
  return ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

// Maps the snippet's `from "weaviate-client"` to the served browser bundle.
function rewriteClientImport(jsCode) {
  const bundleUrl = new URL(CLIENT_BUNDLE_PATH, window.location.origin).href;
  return jsCode.replace(/from\s*(['"])weaviate-client\1/g, `from "${bundleUrl}"`);
}

// Browsers have no process.env — snippets read the Connect button's
// credentials through this shim, mirroring the Node convention.
function applyCredentialsEnv() {
  const { url, apiKey } = loadCredentials();
  const proc = (globalThis.process = globalThis.process || {});
  proc.env = proc.env || {};
  if (url) {
    proc.env.WEAVIATE_URL = url;
  } else {
    delete proc.env.WEAVIATE_URL;
  }
  if (apiKey) {
    proc.env.WEAVIATE_API_KEY = apiKey;
  } else {
    delete proc.env.WEAVIATE_API_KEY;
  }
}

function formatConsoleArg(arg) {
  if (typeof arg === "string") return arg;
  if (arg instanceof Error) return arg.message;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

const CAPTURED_METHODS = ["log", "info", "warn", "error", "debug"];

async function executeSnippet(code, onStatus) {
  let ts;
  try {
    onStatus("Loading the TypeScript compiler…");
    ts = await loadTypeScriptCompiler();
  } catch (err) {
    return { output: "", error: err && err.message ? err.message : String(err) };
  }

  onStatus("Running code…");

  let jsCode;
  try {
    jsCode = rewriteClientImport(transpile(ts, code));
  } catch (err) {
    return { output: "", error: err && err.message ? err.message : String(err) };
  }

  applyCredentialsEnv();

  const myRunId = ++currentRunId;
  const outputLines = [];
  const original = {};
  for (const method of CAPTURED_METHODS) {
    original[method] = console[method];
    console[method] = (...args) => {
      if (myRunId === currentRunId) {
        outputLines.push(args.map(formatConsoleArg).join(" "));
      }
      original[method](...args);
    };
  }

  const blobUrl = URL.createObjectURL(new Blob([jsCode], { type: "text/javascript" }));
  try {
    // webpackIgnore keeps webpack from rewriting this into its chunk loader —
    // it must stay a native dynamic import of the Blob module.
    await import(/* webpackIgnore: true */ blobUrl);
    return { output: outputLines.join("\n"), error: null };
  } catch (err) {
    return {
      output: outputLines.join("\n"),
      error: err && err.message ? err.message : String(err),
    };
  } finally {
    URL.revokeObjectURL(blobUrl);
    // Restore the console — unless a newer run owns it by now (this run
    // timed out and was orphaned).
    if (myRunId === currentRunId) {
      for (const method of CAPTURED_METHODS) {
        console[method] = original[method];
      }
    }
  }
}

// Runs TypeScript code in the browser. Runs are serialized through an
// internal promise chain. Resolves to { output: string, error: string|null }
// and never rejects.
export function runTypeScriptCode(code, { onStatus = noop } = {}) {
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
      if (runChain === run) {
        runChain = Promise.resolve();
      }
      resolve({
        output: "",
        error: `Execution timed out after ${
          RUN_TIMEOUT_MS / 1000
        } seconds. Reload the page to reset the session.`,
      });
    }, RUN_TIMEOUT_MS);
  });

  return Promise.race([run.finally(() => clearTimeout(timer)), timeout]);
}
