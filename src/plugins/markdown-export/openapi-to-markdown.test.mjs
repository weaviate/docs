// Run with: node --test "src/plugins/markdown-export/*.test.mjs"
//
// These read the committed specs in static/specs, which the nightly spec
// workflow updates, so they assert structure rather than exact text.
import assert from "node:assert/strict";
import fs from "node:fs";
import { before, describe, test } from "node:test";
import { convertOpenApiPage } from "./openapi-to-markdown.mjs";

const SITE_URL = "https://docs.weaviate.io";

function readSpec(name) {
  return JSON.parse(fs.readFileSync(new URL(`../../../static/specs/${name}`, import.meta.url), "utf8"));
}

describe("convertOpenApiPage with tags (Weaviate)", () => {
  const spec = readSpec("weaviate-openapi.json");
  let files;
  before(async () => {
    files = await convertOpenApiPage({ spec, routePath: "/weaviate/api/rest", siteUrl: SITE_URL });
  });

  test("writes an index plus one file per tag, including undeclared tags", () => {
    const paths = files.map((file) => file.path);
    const operationTags = Object.values(spec.paths).flatMap((pathItem) => Object.values(pathItem).flatMap((operation) => operation?.tags ?? []));

    assert.equal(paths[0], "/weaviate/api/rest.md");
    for (const tag of new Set([...spec.tags.map((tag) => tag.name), ...operationTags])) {
      assert.ok(paths.includes(`/weaviate/api/rest/${tag}.md`), `no file for tag ${tag}`);
    }
  });

  test("starts every file with front matter that points at the reference page", () => {
    for (const { markdown } of files) {
      assert.match(markdown, /^---\ntitle: "Weaviate REST API.*"\n(description: .*\n)?url: https:\/\/docs\.weaviate\.io\/weaviate\/api\/rest\n---\n/);
    }
  });

  test("lists every operation in the index, and links each tag's file", () => {
    const index = files[0].markdown;
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (!operation?.tags) continue;
        assert.ok(index.includes(`- \`${method.toUpperCase()} ${path}\`: `), `${method} ${path} missing from the index`);
      }
    }
    assert.match(index, /Full reference: <https:\/\/docs\.weaviate\.io\/weaviate\/api\/rest\/schema\.md>/);
  });

  test("puts each operation's full reference in its tag's file", () => {
    const schema = files.find((file) => file.path.endsWith("/schema.md")).markdown;
    const getSchema = spec.paths["/schema"].get;

    // Scalar writes a non-breaking space after each bold label, hence \s.
    assert.match(schema, new RegExp(`- \\*\\*Operation ID:\\*\\*\\s\`${getSchema.operationId.replaceAll(".", "\\.")}\``));
    assert.ok(!schema.includes("- **Tags:** objects"), "an objects operation leaked into the schema file");
  });
});

describe("convertOpenApiPage without tags (Engram)", () => {
  test("writes the whole reference to one file", async () => {
    const spec = readSpec("engram-openapi.json");
    const files = await convertOpenApiPage({ spec, routePath: "/engram/api/rest", siteUrl: SITE_URL });

    assert.deepEqual(files.map((file) => file.path), ["/engram/api/rest.md"]);
    for (const path of Object.keys(spec.paths)) {
      assert.ok(files[0].markdown.includes(`**Path:**\u00a0\`${path}\``), `${path} missing`);
    }
  });
});
