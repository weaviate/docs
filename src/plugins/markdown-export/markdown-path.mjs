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

/**
 * Returns the path of a page's code page for one language: the Markdown path
 * with `.md` replaced by `.<language>.md`.
 *
 *   codePagePath("/weaviate/manage-objects/import.md", "go-v5") === "/weaviate/manage-objects/import.go-v5.md"
 *   codePagePath("import.md", "python")                         === "import.python.md"
 *
 * @param {string} markdownPath A path or file name from `markdownPathForRoute`.
 * @param {string} language A language key from `LANGUAGES` in code-pages.mjs.
 * @returns {string}
 */
export function codePagePath(markdownPath, language) {
  return markdownPath.replace(/\.md$/, `.${language}.md`);
}
