// Run with: node --test "src/plugins/markdown-export/*.test.mjs"
//
// Fixtures are trimmed copies of real `docusaurus build` output, so these
// tests break when the rendered markup they rely on changes.
import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, test } from "node:test";
import { convertDocPage } from "./html-to-markdown.mjs";
import { markdownPathForRoute } from "./markdown-path.mjs";

const SITE_URL = "https://docs.weaviate.io";

function convertFixture(name, pageUrl = `${SITE_URL}/fixture`) {
  const html = fs.readFileSync(new URL(`./fixtures/${name}.html`, import.meta.url), "utf8");
  return convertDocPage({ html, pageUrl, siteUrl: SITE_URL });
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

  test("keeps every code tab variant, labelled, with its fence language", () => {
    const markdown = convertFixture("code-tabs");

    assert.match(markdown, /\*\*Python\*\*\n\n```py\njeopardy = client\.collections\.use\("JeopardyQuestion"\)\n/);
    assert.match(markdown, /\*\*JavaScript\/TypeScript\*\*\n\n```ts\n/);
    assert.match(markdown, /\*\*Go \(v5\)\*\*\n\n```go\nresponse, err := client\.GraphQL\(\)/);
    assert.match(markdown, /\*\*Go\*\*\n\n```go\njeopardy := client\.Collections\.Use/);
    assert.match(markdown, /\*\*Java\*\*\n\n```java\n/);
    assert.match(markdown, /\*\*C#\*\*\n\n```csharp\n/);
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

  test("drops Font Awesome icons instead of leaving empty emphasis", () => {
    const markdown = convertFixture("cards-and-cells");

    // Previously `[**New to Weaviate?](...)`: the empty <i> became `**`.
    assert.match(markdown, /^\[New to Weaviate\?\]\(https:\/\/docs\.weaviate\.io\/weaviate\/quickstart\)$/m);
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

    const markdown = convertDocPage({ html, pageUrl: `${SITE_URL}/m`, siteUrl: SITE_URL });

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

describe("markdownPathForRoute", () => {
  test("appends .md and ignores a trailing slash", () => {
    assert.equal(markdownPathForRoute("/weaviate/search/basics"), "/weaviate/search/basics.md");
    assert.equal(markdownPathForRoute("/weaviate/search/basics/"), "/weaviate/search/basics.md");
  });

  test("maps the site root to /index.md", () => {
    assert.equal(markdownPathForRoute("/"), "/index.md");
  });
});
