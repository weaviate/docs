/**
 * Serves the Markdown version of a docs page to clients that ask for Markdown.
 *
 * Agents such as Claude Code's web fetch tool send
 * `Accept: text/markdown, text/html, *\/*`. For those requests this function
 * returns `/<route>.md` from the normal page URL, so the agent gets Markdown
 * without needing to know that `.md` URLs exist. Browsers never list
 * `text/markdown` and always get HTML.
 *
 * Behavior by request:
 *
 * - Path ends in `.md`: the static file, with the Markdown response headers
 *   below. A missing file stays a 404. This includes a page's code pages,
 *   such as `/weaviate/manage-objects/import.go-v5.md`.
 * - `prefersMarkdown(Accept)` and a `.md` file exists for the path: that file
 *   with the Markdown response headers, status 200.
 * - `prefersMarkdown(Accept)` and no `.md` file exists (redirected or
 *   non-doc URLs): the normal response, so redirect rules and 404s still apply.
 *   An agent that follows a 301 asks again with the same Accept header at the
 *   new URL.
 * - Anything else: the normal response, unchanged.
 *
 * Markdown response headers:
 *
 *   Content-Type: text/markdown; charset=utf-8
 *   Vary: Accept
 *   X-Robots-Tag: noindex
 *   Link: <https://docs.weaviate.io/<route>>; rel="canonical"
 *
 * A code page's canonical URL is its docs page: `/<route>.go-v5.md` gives
 * `/<route>`.
 *
 * `noindex` keeps the `.md` copies out of search results while still letting
 * crawlers that obey robots.txt fetch them.
 *
 * DEPLOYMENT: like error-link-src.ts, this function is deployed only when
 * netlify.toml declares it under [[edge_functions]]. The `config` export below
 * documents the intended scope but is ignored by `netlify deploy --no-build`.
 */

export const config = {
  path: "/*",
  // Static assets never have a Markdown version; skip invoking the function.
  // /e/* belongs to error-link-src.ts. Keep in sync with netlify.toml.
  excludedPath: [
    "/e/*",
    "/assets/*",
    "/img/*",
    "/fonts/*",
    "/js/*",
    "/og/*",
    "/specs/*",
    "/config/*",
    "/prompts/*",
  ],
  // A thrown error serves the normal response instead of a 500.
  onError: "bypass",
};

/**
 * Returns true when the Accept header ranks `text/markdown` at or above
 * `text/html`.
 *
 * Uses q-values (default 1). A type with `q=0` counts as not accepted, and an
 * absent `text/html` counts as `q=0`. Wildcards (`*\/*`, `text/*`) never select
 * Markdown on their own. Matching is case-insensitive.
 *
 *   prefersMarkdown("text/markdown, text/html, *\/*")               === true
 *   prefersMarkdown("text/html,application/xhtml+xml,*\/*;q=0.8")   === false
 *   prefersMarkdown("text/html, text/markdown;q=0.5")               === false
 *   prefersMarkdown(null)                                          === false
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  const quality = new Map<string, number>();
  for (const entry of accept.toLowerCase().split(",")) {
    const [mediaType, ...parameters] = entry.split(";").map((part) => part.trim());
    const q = parameters.find((parameter) => parameter.startsWith("q="));
    const value = q === undefined ? 1 : Number(q.slice(2));
    quality.set(mediaType, Number.isFinite(value) ? value : 0);
  }

  const markdown = quality.get("text/markdown") ?? 0;
  return markdown > 0 && markdown >= (quality.get("text/html") ?? 0);
}

/**
 * Copy of `markdownPathForRoute` in src/plugins/markdown-export/markdown-path.mjs,
 * kept here because Deno bundles this file on its own. A test checks that both
 * return the same result.
 */
export function markdownPathForRoute(routePath: string): string {
  return `${routePath.replace(/\/+$/, "") || "/index"}.md`;
}

/**
 * Language keys of code pages (`LANGUAGES` in
 * src/plugins/markdown-export/code-pages.mjs), kept here for the same reason as
 * `markdownPathForRoute`. A test checks that both list the same keys.
 */
export const CODE_PAGE_LANGUAGES = ["python", "typescript", "go", "go-v5", "java", "csharp", "curl", "graphql"];

const CODE_PAGE_SUFFIX = new RegExp(`\\.(?:${CODE_PAGE_LANGUAGES.join("|")})$`);

export default async (request: Request, context: any) => {
  const url = new URL(request.url);

  if (url.pathname.endsWith(".md")) {
    const response = await context.next();
    if (!response.ok) return response;
    const pagePath = url.pathname
      .slice(0, -".md".length)
      .replace(CODE_PAGE_SUFFIX, "")
      .replace(/^\/index$/, "/");
    return withMarkdownHeaders(response, new URL(pagePath, url.origin));
  }

  if (!["GET", "HEAD"].includes(request.method) || !prefersMarkdown(request.headers.get("accept"))) {
    return context.next();
  }

  // Fetch rather than rewrite, so a missing .md (a redirected or non-doc URL)
  // can fall back to the normal response and its redirect rules. The
  // subrequest passes through this function's .md branch above.
  //
  // redirect: "manual", because the .md path of a moved page can match a
  // wildcard redirect: /weaviate/schema/datatypes.md matches /weaviate/schema/*.
  // Following it would return another page's HTML, labelled as Markdown.
  const markdown = await fetch(new URL(markdownPathForRoute(url.pathname), url.origin), {
    method: request.method,
    redirect: "manual",
  });
  if (!markdown.ok) return context.next();
  return withMarkdownHeaders(markdown, new URL(url.pathname, url.origin));
};

function withMarkdownHeaders(response: Response, pageUrl: URL): Response {
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Vary", "Accept");
  headers.set("X-Robots-Tag", "noindex");
  headers.set("Link", `<${pageUrl.href}>; rel="canonical"`);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
