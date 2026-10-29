/**
 * Docusaurus plugin that writes a Markdown version of every docs page into the
 * build output.
 *
 * After `docusaurus build` renders the HTML, the plugin converts each route's
 * page with `convertDocPage` and writes the result to
 * `<outDir><markdownPathForRoute(route)>`. For example, `/weaviate/search/basics`
 * gets `build/weaviate/search/basics.md`. Routes without a docs body, such as
 * tag listings, get no file. The plugin takes no options and does not change
 * any HTML page or the sitemap.
 *
 * A conversion error fails the build and names the route. Otherwise the page's
 * `<link rel="alternate" type="text/markdown">` would point to a missing file.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { convertDocPage } from "./html-to-markdown.mjs";
import { markdownPathForRoute } from "./markdown-path.mjs";

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function markdownExportPlugin(context) {
  return {
    name: "markdown-export",

    /**
     * @param {import('@docusaurus/types').Props} props Provides `outDir`,
     *   `routesPaths` and `siteConfig`.
     */
    async postBuild({ outDir, routesPaths, siteConfig }) {
      const startedAt = Date.now();
      const siteUrl = siteConfig.url.replace(/\/+$/, "");
      let written = 0;
      let skipped = 0;

      for (const routePath of new Set(routesPaths)) {
        const htmlFile = await findHtmlFile(outDir, routePath);
        const markdown = htmlFile
          ? convertDocPage({ html: await fs.readFile(htmlFile, "utf8"), pageUrl: siteUrl + routePath, siteUrl })
          : null;
        if (markdown === null) {
          skipped += 1;
          continue;
        }

        const markdownFile = path.join(outDir, markdownPathForRoute(routePath));
        await fs.mkdir(path.dirname(markdownFile), { recursive: true });
        await fs.writeFile(markdownFile, markdown);
        written += 1;
      }

      const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
      console.log(
        `[markdown-export] Wrote ${written} Markdown files in ${seconds}s; skipped ${skipped} routes without a docs body.`,
      );
    },
  };
}

// Docusaurus writes /a/b as a/b.html when trailingSlash is false and as
// a/b/index.html when it is true (and always / as index.html). Try the layout
// the route's own trailing slash implies first. Routes such as /404.html have
// neither file and are skipped.
async function findHtmlFile(outDir, routePath) {
  const base = routePath.replace(/\/+$/, "");
  const candidates = routePath.endsWith("/")
    ? [`${base}/index.html`, `${base}.html`]
    : [`${base}.html`, `${base}/index.html`];
  for (const candidate of candidates) {
    const file = path.join(outDir, candidate);
    try {
      if ((await fs.stat(file)).isFile()) return file;
    } catch {
      // Not written for this layout; try the next candidate.
    }
  }
  return null;
}
