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
 *   below. A missing file stays a 404.
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
  excludedPath: [
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
  throw new Error("Not implemented: prefersMarkdown");
}

/**
 * Copy of `markdownPathForRoute` in src/plugins/markdown-export/markdown-path.mjs,
 * kept here because Deno bundles this file on its own. A test checks that both
 * return the same result.
 */
export function markdownPathForRoute(routePath: string): string {
  throw new Error("Not implemented: markdownPathForRoute");
}

export default async (request: Request, context: any) => {
  throw new Error("Not implemented: markdown-negotiation");
};
