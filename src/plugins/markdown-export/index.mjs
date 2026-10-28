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
 *
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
    async postBuild(props) {
      // For each route path:
      //   locate the HTML file Docusaurus wrote for it (depends on trailingSlash),
      //   markdown = convertDocPage({ html, pageUrl, siteUrl })
      //   if markdown is null, skip the route
      //   write markdown to outDir + markdownPathForRoute(routePath)
      // Then log the number of files written and the number of routes skipped.
      throw new Error("Not implemented: markdown-export postBuild");
    },
  };
}
