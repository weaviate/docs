// Run with: node --test "src/plugins/markdown-export/*.test.mjs"
//
// Tests netlify/edge-functions/markdown-negotiation.ts with a fake Netlify
// context and a stubbed fetch. Node imports the .ts file by stripping its
// types (Node 22.18+). These tests cannot show that Netlify deploys the
// function or routes requests to it; only a deploy preview can.
import assert from "node:assert/strict";
import fs from "node:fs";
import { afterEach, describe, test } from "node:test";
import handler, {
  config,
  markdownPathForRoute as edgeMarkdownPathForRoute,
  prefersMarkdown,
} from "../../../netlify/edge-functions/markdown-negotiation.ts";
import { markdownPathForRoute } from "./markdown-path.mjs";

const AGENT_ACCEPT = "text/markdown, text/html, */*"; // Claude Code's web fetch
const BROWSER_ACCEPT = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";

// The normal response Netlify would serve for the request: the static file,
// or whatever the redirect rules produce.
function fakeContext(response = new Response("<html>page</html>", { headers: { "Content-Type": "text/html" } })) {
  const context = {
    nextCalls: 0,
    async next() {
      context.nextCalls += 1;
      return response;
    },
  };
  return context;
}

function request(path, { accept, method = "GET" } = {}) {
  return new Request(`https://docs.weaviate.io${path}`, { method, headers: accept ? { Accept: accept } : {} });
}

const realFetch = globalThis.fetch;
const fetchedUrls = [];
function stubFetch(respond) {
  globalThis.fetch = async (url, init = {}) => {
    fetchedUrls.push(String(url));
    return respond(String(url), init);
  };
}
afterEach(() => {
  globalThis.fetch = realFetch;
  fetchedUrls.length = 0;
});

describe("prefersMarkdown", () => {
  test("accepts a header that lists text/markdown at or above text/html", () => {
    assert.equal(prefersMarkdown(AGENT_ACCEPT), true);
    assert.equal(prefersMarkdown("text/markdown"), true);
    assert.equal(prefersMarkdown("Text/Markdown;q=0.9, text/html;q=0.9"), true);
  });

  test("rejects browsers, lower-ranked markdown, q=0 and wildcards", () => {
    assert.equal(prefersMarkdown(BROWSER_ACCEPT), false);
    assert.equal(prefersMarkdown("text/html, text/markdown;q=0.5"), false);
    assert.equal(prefersMarkdown("text/markdown;q=0"), false);
    assert.equal(prefersMarkdown("*/*"), false);
    assert.equal(prefersMarkdown("text/*"), false);
    assert.equal(prefersMarkdown(null), false);
  });
});

test("the edge function's path mapping matches the build's", () => {
  for (const route of ["/", "/weaviate", "/weaviate/search/basics", "/weaviate/search/basics/"]) {
    assert.equal(edgeMarkdownPathForRoute(route), markdownPathForRoute(route), route);
  }
});

// netlify.toml is what deploys the function (the in-file config is ignored by
// `netlify deploy --no-build`), so the two declarations must not drift.
test("netlify.toml declares the function with the in-file path and exclusions", () => {
  const toml = fs.readFileSync(new URL("../../../netlify.toml", import.meta.url), "utf8");
  const block = toml.match(/\[\[edge_functions\]\]\n {2}path = "([^"]+)"\n {2}excludedPath = \[([^\]]*)\]\n {2}function = "markdown-negotiation"/);

  assert.ok(block, "no [[edge_functions]] block for markdown-negotiation");
  assert.equal(block[1], config.path);
  assert.deepEqual(JSON.parse(`[${block[2]}]`), config.excludedPath);
});

describe("markdown-negotiation", () => {
  test("serves the .md file to a client that prefers Markdown", async () => {
    stubFetch(() => new Response("# Search patterns and basics", { headers: { "Content-Type": "application/octet-stream" } }));
    const context = fakeContext();

    const response = await handler(request("/weaviate/search/basics", { accept: AGENT_ACCEPT }), context);

    assert.deepEqual(fetchedUrls, ["https://docs.weaviate.io/weaviate/search/basics.md"]);
    assert.equal(context.nextCalls, 0);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "# Search patterns and basics");
    assert.equal(response.headers.get("Content-Type"), "text/markdown; charset=utf-8");
    assert.equal(response.headers.get("Vary"), "Accept");
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex");
    assert.equal(response.headers.get("Link"), '<https://docs.weaviate.io/weaviate/search/basics>; rel="canonical"');
  });

  test("falls back to the normal response when no .md exists", async () => {
    stubFetch(() => new Response("Not found", { status: 404 }));
    const redirect = new Response(null, { status: 301, headers: { Location: "/cloud/faq" } });
    const context = fakeContext(redirect);

    const response = await handler(request("/cloud/troubleshooting", { accept: AGENT_ACCEPT }), context);

    assert.equal(context.nextCalls, 1);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get("Location"), "/cloud/faq");
    assert.equal(response.headers.get("Vary"), "Accept");
  });

  test("falls back to the page's own redirect when the .md path is redirected", async () => {
    // netlify.toml redirects /weaviate/schema/* to /weaviate/manage-collections,
    // so the .md lookup is redirected too. A followed redirect returns that
    // page's HTML with status 200.
    stubFetch((url, init) =>
      init.redirect === "manual"
        ? new Response(null, { status: 301, headers: { Location: "/weaviate/manage-collections" } })
        : new Response("<html>manage collections</html>", { headers: { "Content-Type": "text/html" } }),
    );
    const redirect = new Response(null, { status: 301, headers: { Location: "/weaviate/config-refs/datatypes" } });
    const context = fakeContext(redirect);

    const response = await handler(request("/weaviate/schema/datatypes", { accept: AGENT_ACCEPT }), context);

    assert.equal(context.nextCalls, 1);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get("Location"), "/weaviate/config-refs/datatypes");
  });

  // A path starting with // must stay a path on this origin. Parsed as a URL
  // reference, //evil.example/x.md resolves to https://evil.example/x.md.
  test("keeps the .md lookup for a //host path on this origin", async () => {
    stubFetch(() => new Response("Not found", { status: 404 }));
    const context = fakeContext(new Response("Not found", { status: 404 }));

    const response = await handler(request("//evil.example/x", { accept: AGENT_ACCEPT }), context);

    assert.deepEqual(fetchedUrls, ["https://docs.weaviate.io//evil.example/x.md"]);
    assert.equal(context.nextCalls, 1);
    assert.equal(response.status, 404);
  });

  test("keeps the canonical link for a //host path on this origin", async () => {
    const context = fakeContext(new Response("# Page", { headers: { "Content-Type": "application/octet-stream" } }));

    const response = await handler(request("//evil.example/x.md"), context);

    assert.equal(response.headers.get("Link"), '<https://docs.weaviate.io//evil.example/x>; rel="canonical"');
  });

  test("passes browser requests through without fetching", async () => {
    stubFetch(() => assert.fail("fetch should not run"));
    const context = fakeContext();

    const response = await handler(request("/weaviate/search/basics", { accept: BROWSER_ACCEPT }), context);

    assert.equal(context.nextCalls, 1);
    assert.equal(response.headers.get("Content-Type"), "text/html");
  });

  // A shared cache keys a stored response on the URL plus the headers its Vary
  // names. If the HTML omitted Accept, a cached HTML copy would be returned to
  // a client asking for Markdown.
  test("adds Accept to the HTML response's Vary header", async () => {
    const html = new Response("<html>page</html>", { headers: { "Content-Type": "text/html", Vary: "Accept-Encoding" } });
    const context = fakeContext(html);

    const response = await handler(request("/weaviate/search/basics", { accept: BROWSER_ACCEPT }), context);

    assert.equal(response.headers.get("Vary"), "Accept-Encoding, Accept");
  });

  test("passes non-GET requests through", async () => {
    stubFetch(() => assert.fail("fetch should not run"));
    const context = fakeContext();

    await handler(request("/weaviate/search/basics", { accept: AGENT_ACCEPT, method: "POST" }), context);

    assert.equal(context.nextCalls, 1);
  });

  test("adds Markdown headers to direct .md requests", async () => {
    const context = fakeContext(new Response("# Home", { headers: { "Content-Type": "application/octet-stream" } }));

    const response = await handler(request("/index.md"), context);

    assert.equal(response.headers.get("Content-Type"), "text/markdown; charset=utf-8");
    assert.equal(response.headers.get("Link"), '<https://docs.weaviate.io/>; rel="canonical"');
  });

  test("leaves a missing .md as a 404", async () => {
    const context = fakeContext(new Response("Not found", { status: 404, headers: { "Content-Type": "text/html" } }));

    const response = await handler(request("/no-such-page.md"), context);

    assert.equal(response.status, 404);
    assert.equal(response.headers.get("Content-Type"), "text/html");
  });
});
