/**
 * Converts one built docs page from HTML to Markdown for agents and LLM tools.
 *
 * The input is the rendered HTML, not the MDX source: code examples come from
 * `_includes/` through raw-loader imports and partials, and only the rendered
 * page contains them.
 */

/**
 * Marks an element that exists only so the Markdown export can read it.
 *
 * The element must also carry `hidden`. Its value names the content kind.
 * "mermaid" is the only kind: the Mermaid theme wrapper renders the diagram
 * source as `<pre hidden data-markdown-source="mermaid">`, because the diagram
 * itself is drawn in the browser and is absent from the built HTML.
 */
export const MARKDOWN_SOURCE_ATTRIBUTE = "data-markdown-source";

/**
 * Converts the HTML of one built page to a Markdown document.
 *
 * Reads only the docs body (`.theme-doc-markdown`), so the navbar, sidebar,
 * breadcrumbs, table of contents and footer are left out. The returned
 * document is:
 *
 *   ---
 *   title: "Search patterns and basics"
 *   description: "Basic search operations: ..."     (omitted when the page has none)
 *   url: https://docs.weaviate.io/weaviate/search/basics
 *   ---
 *
 *   # Search patterns and basics
 *   ...
 *
 * Body conversion rules:
 * - Code tab groups: every variant, each fence preceded by its dropdown label
 *   in bold (`**Go (v5)**`), with the fence language from the rendered block.
 * - Default Docusaurus tabs: every panel, under an `####` heading with the tab label.
 * - Admonitions: GitHub alert blockquotes (`> [!TIP]`), with the admonition
 *   title in bold when it differs from the type.
 * - `<details>`: the summary in bold, followed by the expanded body.
 * - KaTeX: the LaTeX source, as `$...$` or `$$...$$`.
 * - Mermaid (`[data-markdown-source="mermaid"]`): a `mermaid` fence.
 * - Embedded iframes: a link to the embed URL.
 * - Images: `![alt](url)` linking to the original image file, so an agent can
 *   fetch it. An image inside a link stays linked (`[![alt](url)](href)`).
 *   Themed light/dark pairs keep only the light variant. Images with an
 *   explicit empty `alt=""` are decorative (such as the Cloud-only icon) and
 *   are removed; images with no `alt` attribute are kept.
 * - Root-relative links and image sources: absolute, prefixed with `siteUrl`.
 *   Links point to the HTML pages, not to their `.md` versions.
 * - Removed: elements marked `[data-copy-exclude]`, heading anchor links,
 *   buttons, `<select>`, SVG icons, scripts, and React SSR comments.
 *
 * @param {object} page
 * @param {string} page.html Complete HTML document written by `docusaurus build`.
 * @param {string} page.pageUrl Absolute URL of the HTML page; written as `url`.
 * @param {string} page.siteUrl `siteConfig.url`, without a trailing slash.
 * @returns {string | null} The Markdown document, or `null` when the HTML has
 *   no docs body, as on tag listings, the 404 page and the Scalar API reference.
 * @throws {Error} When the page has a docs body but conversion fails. The
 *   message names `pageUrl`.
 */
export function convertDocPage({ html, pageUrl, siteUrl }) {
  throw new Error("Not implemented: convertDocPage");
}
