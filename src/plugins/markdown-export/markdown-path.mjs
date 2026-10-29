/**
 * Returns the URL path of the Markdown version of a docs page.
 *
 * The build writes each file at this path, and each page's
 * `<link rel="alternate" type="text/markdown">` points to it. The edge function
 * keeps its own copy of this mapping (netlify/edge-functions/markdown-negotiation.ts)
 * because it is bundled by Deno, and a test checks that the two agree.
 *
 * A trailing slash is ignored, so production (`trailingSlash: false`) and
 * `yarn build-dev` (`trailingSlash: true`) produce the same Markdown URL:
 *
 *   markdownPathForRoute("/weaviate/search/basics")  === "/weaviate/search/basics.md"
 *   markdownPathForRoute("/weaviate/search/basics/") === "/weaviate/search/basics.md"
 *   markdownPathForRoute("/")                        === "/index.md"
 *
 * @param {string} routePath Docusaurus route path. Starts with "/", has no query or hash.
 * @returns {string} Root-relative URL path ending in ".md".
 */
export function markdownPathForRoute(routePath) {
  return `${routePath.replace(/\/+$/, "") || "/index"}.md`;
}
