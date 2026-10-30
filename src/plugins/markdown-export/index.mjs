/**
 * Docusaurus plugin that writes a Markdown version of every docs page into the
 * build output.
 *
 * After `docusaurus build` renders the HTML, the plugin converts each route's
 * page with `convertDocPage` and writes the result to
 * `<outDir><markdownPathForRoute(route)>`. For example, `/weaviate/search/basics`
 * gets `build/weaviate/search/basics.md`. A page with language tab groups also
 * gets one code page per language next to it, at `codePagePath`:
 * `build/weaviate/search/basics.typescript.md`. Routes without a docs body,
 * such as tag listings, get no file.
 *
 * Scalar API reference pages (each `@scalar/docusaurus` entry in
 * `siteConfig.plugins` whose `configuration.spec.url` is a site path) are
 * converted from that spec file with `convertOpenApiPage` instead. Their HTML
 * gets two head links, which docs pages get from src/theme/DocItem/Layout:
 *
 *   <link rel="alternate" type="text/markdown" href="/weaviate/api/rest.md">
 *   <link rel="alternate" type="application/json" href="/specs/weaviate-openapi.json" title="OpenAPI description">
 *
 * The plugin takes no options and does not change the sitemap.
 *
 * A conversion error fails the build and names the route. Otherwise the page's
 * `<link rel="alternate" type="text/markdown">` would point to a missing file.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { convertDocPage } from "./html-to-markdown.mjs";
import { codePagePath, markdownPathForRoute } from "./markdown-path.mjs";
import { convertOpenApiPage } from "./openapi-to-markdown.mjs";

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
      let codePages = 0;
      let skipped = 0;

      for (const routePath of new Set(routesPaths)) {
        const htmlFile = await findHtmlFile(outDir, routePath);
        const page = htmlFile
          ? convertDocPage({ html: await fs.readFile(htmlFile, "utf8"), pageUrl: siteUrl + routePath, siteUrl })
          : null;
        if (page === null) {
          skipped += 1;
          continue;
        }

        const markdownPath = markdownPathForRoute(routePath);
        await writeSiteFile(outDir, markdownPath, page.markdown);
        for (const { language, markdown } of page.codePages) {
          await writeSiteFile(outDir, codePagePath(markdownPath, language), markdown);
        }
        written += 1;
        codePages += page.codePages.length;
      }

      const apiPages = scalarPages(siteConfig);
      let apiFiles = 0;
      for (const { routePath, specUrl } of apiPages) {
        const spec = JSON.parse(await fs.readFile(path.join(outDir, specUrl), "utf8"));
        const files = await convertOpenApiPage({ spec, routePath, siteUrl }).catch((error) => {
          throw new Error(`Markdown export failed for ${siteUrl + routePath}: ${error.message}`, { cause: error });
        });
        for (const file of files) await writeSiteFile(outDir, file.path, file.markdown);
        apiFiles += files.length;

        const htmlFile = await findHtmlFile(outDir, routePath);
        const html = await fs.readFile(htmlFile, "utf8");
        const headLinks =
          `<link rel="alternate" type="text/markdown" href="${markdownPathForRoute(routePath)}">` +
          `<link rel="alternate" type="application/json" href="${specUrl}" title="OpenAPI description">`;
        await fs.writeFile(htmlFile, html.replace("</head>", `${headLinks}</head>`));
      }

      const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
      console.log(
        `[markdown-export] Wrote ${written} Markdown files with ${codePages} code pages, and ${apiFiles} for ${apiPages.length} API reference pages in ${seconds}s; ` +
          `skipped ${skipped - apiPages.length} other routes without a docs body.`,
      );
    },
  };
}

// Scalar pages whose spec is served by this site, such as
// { routePath: "/weaviate/api/rest", specUrl: "/specs/weaviate-openapi.json" }.
function scalarPages(siteConfig) {
  return siteConfig.plugins
    .filter((plugin) => Array.isArray(plugin) && plugin[0] === "@scalar/docusaurus")
    .map(([, options]) => ({ routePath: options.route, specUrl: options.configuration?.spec?.url }))
    .filter(({ specUrl }) => typeof specUrl === "string" && specUrl.startsWith("/"));
}

async function writeSiteFile(outDir, sitePath, content) {
  const file = path.join(outDir, sitePath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
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
