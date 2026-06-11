// Smoke test for the browser playground (see BROWSER_PLAYGROUND_README.md).
//
// Pyodide also runs under Node, so this validates the exact install path the
// browser uses — package preloads, micropip resolution of the local wheels,
// and the weaviate_grpc_web + weaviate import chain — without a browser.
// It does NOT validate the network path (grpc-web transcoder, CORS).
//
// Usage:
//   mkdir -p /tmp/pyodide-smoke && cd /tmp/pyodide-smoke
//   npm install pyodide@<version pinned in src/theme/Tabs/pyodideRunner.js>
//   node <docs repo>/_build_scripts/browser-playground-smoke.mjs
//
// The pyodide npm package is intentionally not a repo dependency, it caches
// ~30 MB of runtime wheels into node_modules on first run.

import { readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// Resolve pyodide from the directory the script is RUN from (the scratch dir
// where it was npm-installed), not from this script's location in the repo
const { loadPyodide } = createRequire(join(process.cwd(), "noop.js"))("pyodide");

const WHEELS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "static", "wheels");

// Must mirror the loadPackage list in src/theme/Tabs/pyodideRunner.js
const PRELOADS = ["micropip", "pydantic", "ssl", "cryptography", "anyio"];

const wheels = readdirSync(WHEELS_DIR).filter((f) => f.endsWith(".whl"));
if (wheels.length === 0) {
  throw new Error(`No wheels found in ${WHEELS_DIR}`);
}
console.log("wheels:", wheels.join(", "));

const py = await loadPyodide();
console.log("pyodide loaded:", py.runPython("import sys; sys.version"));

await py.loadPackage(PRELOADS);
console.log("preloads OK, pydantic:", py.runPython("import pydantic; pydantic.VERSION"));

// Node's fetch cannot load the http wheel URLs the browser uses, so write the
// wheels into the in-memory filesystem and install via emfs:
for (const w of wheels) {
  py.FS.writeFile(`/tmp/${w}`, readFileSync(join(WHEELS_DIR, w)));
}
const micropip = py.pyimport("micropip");
await micropip.install(wheels.map((w) => `emfs:/tmp/${w}`));
console.log("micropip install OK");

const result = await py.runPythonAsync(`
import sys
assert sys.platform == "emscripten", sys.platform
import weaviate_grpc_web  # must be imported before weaviate
import weaviate
from weaviate.classes.init import Auth

client = weaviate.use_async_with_custom(
    http_host="localhost", http_port=8080, http_secure=False,
    grpc_host="localhost", grpc_port=8080, grpc_secure=False,
    grpc_path_prefix="/grpc-web", skip_init_checks=True,
)
f"OK: {type(client).__name__}, weaviate {weaviate.__version__}"
`);
console.log("RESULT:", result);
process.exit(0);
