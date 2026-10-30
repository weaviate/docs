// Run with: node --test "src/plugins/markdown-export/*.test.mjs"
//
// Fixtures are trimmed copies of real `docusaurus build` output, so these
// tests break when the rendered markup they rely on changes.
import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, test } from "node:test";
import { convertDocPage } from "./html-to-markdown.mjs";
import { codePagePath, markdownPathForRoute } from "./markdown-path.mjs";

const SITE_URL = "https://docs.weaviate.io";

// The landing page and code pages: { markdown, codePages: { [language]: markdown } }.
function convertFixturePages(name, pageUrl = `${SITE_URL}/fixture`) {
  const html = fs.readFileSync(new URL(`./fixtures/${name}.html`, import.meta.url), "utf8");
  const page = convertDocPage({ html, pageUrl, siteUrl: SITE_URL });
  if (page === null) return null;
  return { markdown: page.markdown, codePages: Object.fromEntries(page.codePages.map((code) => [code.language, code.markdown])) };
}

// The landing page only.
function convertFixture(name, pageUrl) {
  return convertFixturePages(name, pageUrl)?.markdown ?? null;
}

describe("convertDocPage", () => {
  test("writes front matter from the page", () => {
    const markdown = convertFixture("code-tabs", `${SITE_URL}/weaviate/search/basics`);

    assert.ok(
      markdown.startsWith(
        [
          "---",
          'title: "Search patterns and basics"',
          'description: "Basic search operations: listing objects, retrieving properties and metadata with code in Python, TypeScript, Go, Java, and C#."',
          "url: https://docs.weaviate.io/weaviate/search/basics",
          "---",
          "",
          "# Search patterns and basics",
        ].join("\n"),
      ),
    );
  });

  test("omits description when the page has none", () => {
    const markdown = convertFixture("admonition-details-table");

    assert.match(markdown, /^---\ntitle: "Authorization"\nurl: /);
  });

  test("keeps the Python variant of a code tab group and moves the others to code pages, with their fence languages", () => {
    const { markdown, codePages } = convertFixturePages("code-tabs", `${SITE_URL}/weaviate/search/basics`);

    assert.match(markdown, /\n\nPython shown\. Other languages: \[JS\/TS\]\(\/weaviate\/search\/basics\.typescript\.md#list-objects\) · .+\n\n```py\njeopardy = client\.collections\.use\("JeopardyQuestion"\)\n/);
    assert.ok(!markdown.includes("```ts"));
    assert.deepEqual(Object.keys(codePages), ["python", "typescript", "go", "go-v5", "java", "csharp", "graphql"]);
    assert.match(codePages.typescript, /## \[List objects\]\(\/weaviate\/search\/basics\.md#list-objects\)\n\n```ts\n/);
    assert.match(codePages["go-v5"], /```go\nresponse, err := client\.GraphQL\(\)/);
    assert.match(codePages.go, /```go\njeopardy := client\.Collections\.Use/);
    assert.match(codePages.java, /```java\n/);
    assert.match(codePages.csharp, /```csharp\n/);
  });

  test("keeps code line breaks without doubling them", () => {
    const markdown = convertFixture("code-tabs");

    assert.match(markdown, /```py\n.+\n.+\n\nfor o in response\.objects:\n {4}print\(o\.properties\)\n```/);
  });

  test("leaves out page chrome and interactive UI text", () => {
    const markdown = convertFixture("code-tabs");

    for (const uiText of ["Site navigation", "Breadcrumbs", "Footer", "API docs", "More info", "Direct link to", "<!--"]) {
      assert.ok(!markdown.includes(uiText), `found ${JSON.stringify(uiText)}`);
    }
  });

  test("labels every default tab panel with an h4", () => {
    const markdown = convertFixture("default-tabs");

    assert.match(markdown, /#### pip\n\n```bash\npip install weaviate-engram\n```\n\n#### uv\n\n```bash\nuv add weaviate-engram\n```/);
  });

  test("turns admonitions into GitHub alerts with their title", () => {
    const tip = convertFixture("code-tabs");
    const info = convertFixture("admonition-details-table");

    assert.match(tip, /> \[!TIP\]\n>\n> \*\*Prefer natural language queries\?\*\*\n>\n> The \[Query Agent\]/);
    assert.match(info, /> \[!NOTE\]\n>\n> \*\*Authentication and authorization\*\*/);
  });

  test("keeps links in an admonition title", () => {
    const markdown = convertFixture("cards-and-cells");

    assert.match(markdown, /> \*\*Requires a \[generative model integration\]\(https:\/\/docs\.weaviate\.io\/weaviate\/model-providers\)\*\*/);
  });

  test("does not nest bold inside a bold title", () => {
    const markdown = convertFixture("cards-and-cells");

    assert.match(markdown, /^\*\*Step 0: Set up a collection\*\*$/m);
  });

  test("expands details under a bold summary", () => {
    const markdown = convertFixture("admonition-details-table");

    assert.match(markdown, /\*\*Example output\*\*\n\n```text\n/);
  });

  test("keeps tables as GFM tables", () => {
    const markdown = convertFixture("admonition-details-table");

    assert.match(markdown, /^\| .+ \|\n\| -+/m);
  });

  test("does not pad table cells to the column width", () => {
    const markdown = convertFixture("admonition-details-table");
    const tableLines = markdown.split("\n").filter((line) => line.startsWith("|"));

    assert.ok(tableLines.length > 0);
    assert.deepEqual(tableLines.filter((line) => /\S {2,}\||\| {2,}\S/.test(line)), []);
  });

  test("shortens vector literals in code and says so after the block", () => {
    const vector = Array.from({ length: 1536 }, (_, i) => (i % 7 === 0 ? -0.0125 : 0.0042)).join(", ");
    const html =
      '<html><body><div class="theme-doc-markdown"><h1>Vectors</h1>' +
      `<pre><code class="language-py">response = jeopardy.query.near_vector(\n    near_vector=[${vector}],\n    limit=2,\n)\n</code></pre>` +
      '<pre><code class="language-py">ids = [1, 2, 3, 4]</code></pre></div></body></html>';

    const { markdown } = convertDocPage({ html, pageUrl: `${SITE_URL}/vectors`, siteUrl: SITE_URL });

    assert.match(markdown, /near_vector=\[-0\.0125, 0\.0042, 0\.0042, \.\.\.\],\n/);
    assert.match(markdown, /```\n\n\*This example's 1,536-number vector is shortened to its first 3 values\. The HTML page has the full vector\.\*\n/);
    assert.match(markdown, /ids = \[1, 2, 3, 4\]\n```\n$/);
  });

  test("puts each block in a table cell on its own line", () => {
    const markdown = convertFixture("cards-and-cells");

    assert.match(markdown, /\| Create roles<br>Read role info<br>Update role permissions<br>Delete roles \|/);
    assert.match(markdown, /\| Role name filter:<br>• `string or regex`: specifies which roles can be managed<br>Role scope:<br>• `all`: /);
  });

  test("turns a card that is one big link into its content plus one link", () => {
    const markdown = convertFixture("cards-and-cells");

    assert.match(
      markdown,
      /\nWeaviate Cloud\n\n- From evaluation \(free tier\) to production\n- Shared Cloud \(infrastructure managed by Weaviate\)\n\n\[Set up a WCD instance\]\(https:\/\/docs\.weaviate\.io\/cloud\/manage-clusters\/create\)\n/,
    );
    assert.ok(!markdown.includes("Evaluation"), "stage tabs are marked data-copy-exclude");
  });

  test("turns a title-and-description card into one link and its description", () => {
    const markdown = convertFixture("cards-and-cells");

    // The empty Font Awesome <i> in the title is dropped; it once became `**`.
    assert.match(markdown, /^\[New to Weaviate\?\]\(https:\/\/docs\.weaviate\.io\/weaviate\/quickstart\): Start with the Quickstart tutorial$/m);
  });

  test("turns a row of badge links into one See also line", () => {
    const markdown = convertFixture("cards-and-cells");

    assert.match(
      markdown,
      /^See also: \[\.connect\\_to\\_weaviate\\_cloud\]\(https:\/\/weaviate-python-client\.readthedocs\.io\/[^)]+\), \[\.Auth\]\(https:\/\/[^)]+#weaviate\.auth\.Auth\)$/m,
    );
  });

  test("keeps the text of a button inside a sentence", () => {
    const markdown = convertFixture("cards-and-cells");

    assert.match(markdown, /use the Ask AI feature\./);
  });

  test("prefixes fragment links with the page URL", () => {
    const markdown = convertFixture("cards-and-cells", `${SITE_URL}/weaviate/config-refs/collections`);

    assert.match(markdown, /\[Collections without a vector\]\(https:\/\/docs\.weaviate\.io\/weaviate\/config-refs\/collections#no-vector\)/);
  });

  test("replaces embedded iframes with a link", () => {
    const markdown = convertFixture("default-tabs");

    assert.match(markdown, /\[Embedded content\]\(https:\/\/app\.guideflow\.com\/embed\/xrg3yooiwk\)/);
  });

  test("keeps KaTeX as LaTeX source", () => {
    const markdown = convertFixture("math-and-images");

    assert.match(markdown, /The total number of buckets will be \$2\^\{ksim\}\$\./);
  });

  test("links images to their original files, dropping decorative and dark-theme copies", () => {
    const markdown = convertFixture("math-and-images");

    assert.match(markdown, /!\[DBPedia OpenAI Benchmark results\]\(https:\/\/docs\.weaviate\.io\/img\/benchmark\/dbpedia-openai-1000k-angular-light\.svg\)/);
    assert.ok(!markdown.includes("-dark.svg"));
    assert.match(markdown, /!\[Weaviate Engram architecture\]\(https:\/\/docs\.weaviate\.io\/assets\/images\/architecture-[0-9a-f]+\.png\)/);
    assert.match(markdown, /!\[\]\(https:\/\/github\.com\/weaviate\/recipes\/.+multimodal-rag-diagram\.png\?raw=1\)/);
    assert.match(markdown, /\[!\[Open In Google Colab\]\(https:\/\/img\.shields\.io\/.+\)\]\(https:\/\/colab\.research\.google\.com\/.+\)/);
    assert.match(markdown, /^Cloud only feature\.$/m);
    assert.ok(!markdown.includes("cloud-icon.svg"));
  });

  test("makes root-relative links absolute and keeps them on HTML pages", () => {
    const markdown = convertFixture("code-tabs");

    assert.match(markdown, /\[keyword search\]\(https:\/\/docs\.weaviate\.io\/weaviate\/search\/bm25\)/);
  });

  test("renders Mermaid source marked for the export as a mermaid fence", () => {
    const markdown = convertFixture("mermaid");

    assert.match(markdown, /```mermaid\nflowchart TB\n {4}User\(\["Authenticated User"\]\) --> AuthScheme/);
  });

  test("keeps a literal <br> in Mermaid source", () => {
    // The rspack minifier unescaped this text to a real <br> element when the
    // source was the <pre>'s text, so the source now travels URI-encoded.
    const source = 'flowchart LR\n    core["💾 Data &<br> vector store"]';
    const html = `<html><body><div class="theme-doc-markdown"><h1>M</h1><pre hidden data-markdown-source=mermaid data-markdown-content="${encodeURIComponent(source)}"></pre></div></body></html>`;

    const { markdown } = convertDocPage({ html, pageUrl: `${SITE_URL}/m`, siteUrl: SITE_URL });

    assert.ok(markdown.includes("```mermaid\n" + source + "\n```"));
  });

  test("returns null for a page without a docs body", () => {
    assert.equal(convertFixture("no-docs-body"), null);
  });

  test("names the page when conversion fails", () => {
    // Making the link absolute reads siteUrl, which throws mid-conversion.
    const html = '<html><body><div class="theme-doc-markdown"><h1>Broken</h1><a href="/x">x</a></div></body></html>';
    const brokenSiteUrl = { toString() { throw new Error("boom"); } };

    assert.throws(
      () => convertDocPage({ html, pageUrl: `${SITE_URL}/broken`, siteUrl: brokenSiteUrl }),
      /Markdown export failed for https:\/\/docs\.weaviate\.io\/broken: /,
    );
  });
});

describe("code pages", () => {
  const IMPORT_URL = `${SITE_URL}/weaviate/manage-objects/import`;

  test("link every code page after the landing page title", () => {
    const { markdown } = convertFixturePages("language-tabs", IMPORT_URL);

    assert.match(
      markdown,
      /\n# Batch import\n\nCode examples by language: \[Python\]\(\/weaviate\/manage-objects\/import\.python\.md\) · \[JS\/TS\]\(\/weaviate\/manage-objects\/import\.typescript\.md\) · \[Go\]\(\/weaviate\/manage-objects\/import\.go\.md\) · \[Go v5\]\(\/weaviate\/manage-objects\/import\.go-v5\.md\) · \[Java\]\(\/weaviate\/manage-objects\/import\.java\.md\) · \[C#\]\(\/weaviate\/manage-objects\/import\.csharp\.md\)\n\nImport objects in batches\.\n/,
    );
  });

  test("keep Python from a code tab group under a line that links the other languages", () => {
    const { markdown, codePages } = convertFixturePages("language-tabs", IMPORT_URL);

    assert.match(
      markdown,
      /Let the server choose the batch size\.\n\nPython shown\. Other languages: \[JS\/TS\]\(\/weaviate\/manage-objects\/import\.typescript\.md#server-side-batching\) · \[Go\]\(\/weaviate\/manage-objects\/import\.go\.md#server-side-batching\) · \[Java\]\(\/weaviate\/manage-objects\/import\.java\.md#server-side-batching\)\n\n```py\nwith collection\.batch\.experimental\(\) as batch:\n/,
    );
    assert.ok(!markdown.includes("insertMany"));
    assert.match(codePages.java, /## \[Server-side batching\]\(\/weaviate\/manage-objects\/import\.md#server-side-batching\)\n\n```java\ncollection\.batch\.experimental\(\);\n```/);
  });

  test("map default tabs labelled with languages, keeping prose inside a panel", () => {
    const { markdown, codePages } = convertFixturePages("language-tabs", IMPORT_URL);

    assert.match(
      markdown,
      /## Accent folding\n\nPython shown\. Other languages: \[JS\/TS\]\(\/weaviate\/manage-objects\/import\.typescript\.md#accent-folding\) · \[Java\]\(\/weaviate\/manage-objects\/import\.java\.md#accent-folding\) · \[C#\]\(\/weaviate\/manage-objects\/import\.csharp\.md#accent-folding\)\n\n```py\nTokenization\.WORD\n```\n\n## Go clients/,
    );
    assert.ok(!markdown.includes("#### Python"));
    assert.match(codePages.java, /## \[Accent folding\]\(\/weaviate\/manage-objects\/import\.md#accent-folding\)\n\nThe Java client sets folding on the property\.\n\n```java\n/);
    assert.match(codePages.csharp, /## \[Accent folding\]\(\/weaviate\/manage-objects\/import\.md#accent-folding\)\n\n```csharp\nTokenization = PropertyTokenization\.Word\n```/);
  });

  test("write a group without a language panel inline, as before", () => {
    const { markdown } = convertFixturePages("language-tabs", IMPORT_URL);

    assert.match(markdown, /#### Docker\n\n```bash\ndocker compose up -d\n```\n\n#### Kubernetes\n\n```bash\nhelm install /);
    assert.match(markdown, /\*\*Bash\*\*\n\n```bash\nexport WEAVIATE_URL=localhost\n```\n\n\*\*Windows PowerShell\*\*\n\n```powershell\n/);
  });

  test("show the first language in link order when a group has no Python", () => {
    const { markdown, codePages } = convertFixturePages("language-tabs", IMPORT_URL);

    assert.match(
      markdown,
      /## Go clients\n\nGo \(v6\) shown\. Other languages: \[Go v5\]\(\/weaviate\/manage-objects\/import\.go-v5\.md#go-clients\)\n\n```go\ncollection\.Batch\.Experimental\(\)\n```\n\n## Example/,
    );
    assert.match(codePages["go-v5"], /## \[Go clients\]\(\/weaviate\/manage-objects\/import\.md#go-clients\)\n\n```go\nclient\.Batch\(\)\.ObjectsBatcher\(\)\n```/);
    assert.match(codePages.python, /## Sections without a Python example\n\n- \[Go clients\]\(\/weaviate\/manage-objects\/import\.md#go-clients\)\n$/);
  });

  test("number repeated section anchors on a code page", () => {
    const { markdown, codePages } = convertFixturePages("language-tabs", IMPORT_URL);

    // Two groups under one heading, and two headings with the same text.
    assert.match(markdown, /Then check for errors\.\n\nPython shown\. Other languages: \[JS\/TS\]\(\/weaviate\/manage-objects\/import\.typescript\.md#server-side-batching-2\)\n/);
    assert.match(markdown, /## Example\n\nPython shown\. Other languages: \[JS\/TS\]\(\/weaviate\/manage-objects\/import\.typescript\.md#example-2\)\n/);
    assert.match(codePages.typescript, /## \[Example\]\(\/weaviate\/manage-objects\/import\.md#example\)\n\n```ts\n.+\n```\n\n## \[Example\]\(\/weaviate\/manage-objects\/import\.md#example-1\)\n/);
  });

  test("label each panel when a language has several in one group", () => {
    const { markdown, codePages } = convertFixturePages("language-tabs", IMPORT_URL);

    assert.match(markdown, /Python and Python \(Async\) shown\. Other languages: \[JS\/TS\]\(\/weaviate\/manage-objects\/import\.typescript\.md#example\)\n\n\*\*Python\*\*\n\n```py\n.+\n```\n\n\*\*Python \(Async\)\*\*\n/);
    assert.match(codePages.python, /## \[Example\]\(\/weaviate\/manage-objects\/import\.md#example\)\n\n### Python\n\n```py\nclient\.memories\.add\(content\)\n```\n\n### Python \(Async\)\n\n```py\nawait /);
  });

  test("start each code page with its title, links, and end with the sections it lacks", () => {
    const { codePages } = convertFixturePages("language-tabs", IMPORT_URL);

    assert.ok(
      codePages.go.startsWith(
        "# Batch import: Go code examples\n\n" +
          "Full page: [Batch import](/weaviate/manage-objects/import.md). Other languages: [Python](/weaviate/manage-objects/import.python.md) · [JS/TS](/weaviate/manage-objects/import.typescript.md) · [Go v5](/weaviate/manage-objects/import.go-v5.md) · [Java](/weaviate/manage-objects/import.java.md) · [C#](/weaviate/manage-objects/import.csharp.md)\n\n" +
          "## [Server-side batching](/weaviate/manage-objects/import.md#server-side-batching)\n",
      ),
    );
    assert.match(
      codePages.go,
      /\n## Sections without a Go example\n\n- \[Accent folding\]\(\/weaviate\/manage-objects\/import\.md#accent-folding\)\n- \[Example\]\(\/weaviate\/manage-objects\/import\.md#example\)\n- \[Example\]\(\/weaviate\/manage-objects\/import\.md#example-1\)\n$/,
    );
  });

  test("are not written for a page without a language group", () => {
    assert.deepEqual(convertFixturePages("default-tabs").codePages, {});
  });
});

describe("markdownPathForRoute", () => {
  test("appends .md and ignores a trailing slash", () => {
    assert.equal(markdownPathForRoute("/weaviate/search/basics"), "/weaviate/search/basics.md");
    assert.equal(markdownPathForRoute("/weaviate/search/basics/"), "/weaviate/search/basics.md");
  });

  test("maps the site root to /index.md", () => {
    assert.equal(markdownPathForRoute("/"), "/index.md");
  });
});

describe("codePagePath", () => {
  test("puts the language before .md", () => {
    assert.equal(codePagePath("/weaviate/manage-objects/import.md", "go-v5"), "/weaviate/manage-objects/import.go-v5.md");
    assert.equal(codePagePath("/index.md", "python"), "/index.python.md");
  });
});
