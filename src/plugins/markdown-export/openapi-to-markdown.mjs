/**
 * Converts the OpenAPI description behind a Scalar API reference page to
 * Markdown for agents and LLM tools.
 *
 * Scalar renders these pages in the browser, so the built HTML has no content
 * for convertDocPage to read. The Markdown comes from the same committed spec
 * file instead, rendered by Scalar's own converter.
 */
import { createOpenApiMarkdownRenderer } from "@scalar/openapi-to-markdown";
import { formatFrontMatter } from "./html-to-markdown.mjs";
import { markdownPathForRoute } from "./markdown-path.mjs";

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

/**
 * Converts one OpenAPI description to the Markdown files for its reference page.
 *
 * A description that declares tags (a top-level `tags` list) is split,
 * because the whole Weaviate reference is about 490 KB:
 *
 * - `markdownPathForRoute(routePath)` is an index: the introduction, servers
 *   and authentication, then for each tag its description, a link to the tag's
 *   file, and its operations (`` - `GET /schema`: Get all collection definitions ``).
 * - `<routePath>/<tag>.md` is the full reference for one tag: every operation
 *   with its parameters, request and response schemas, and examples. Each file
 *   repeats the introduction so it can be read on its own.
 *
 * Tags that operations use but the `tags` list omits come after the declared
 * ones. A description that declares no tags, such as Engram's 30 KB
 * reference, gets the whole reference in the index file.
 *
 * Every file starts with the same front matter as a docs page; `url` is the
 * reference page. The links to tag files point to `.md` URLs, because tag
 * files have no HTML page.
 *
 * @param {object} page
 * @param {object} page.spec Parsed OpenAPI 2.0, 3.0 or 3.1 document. Scalar's
 *   converter migrates older versions, so the output says OpenAPI 3.2.
 * @param {string} page.routePath Route of the Scalar page, such as "/weaviate/api/rest".
 * @param {string} page.siteUrl `siteConfig.url`, without a trailing slash.
 * @returns {Promise<Array<{ path: string, markdown: string }>>} Files to write,
 *   with paths from the site root, such as "/weaviate/api/rest/schema.md".
 */
export async function convertOpenApiPage({ spec, routePath, siteUrl }) {
  const renderer = await createOpenApiMarkdownRenderer(spec);
  const pageUrl = siteUrl + routePath;
  const title = spec.info?.title ?? routePath;
  const operations = operationsByTag(spec);
  const declared = spec.tags ?? [];

  if (!declared.length) {
    return [{ path: markdownPathForRoute(routePath), markdown: formatFrontMatter({ title, url: pageUrl }) + "\n" + (await renderer.render()) }];
  }

  // Operations may use tags the document never declares, such as "experimental".
  const undeclared = [...operations.keys()].filter((name) => !declared.some((tag) => tag.name === name));
  const tags = [...declared, ...undeclared.map((name) => ({ name }))];
  const tagFiles = [];
  const index = [await renderer.render({ introduction: true }), "## Operations by tag", ""];
  for (const tag of tags) {
    const tagPath = `${routePath.replace(/\/+$/, "")}/${tagSlug(tag.name)}.md`;
    index.push(`### ${tag.name}`, "");
    if (tag.description) index.push(tag.description, "");
    index.push(`Full reference: <${siteUrl}${tagPath}>`, "");
    index.push(...(operations.get(tag.name) ?? []).map(({ method, path, summary }) => `- \`${method} ${path}\`: ${summary}`), "");

    const frontMatter = formatFrontMatter({ title: `${title}: ${tag.name}`, description: tag.description, url: pageUrl });
    tagFiles.push({ path: tagPath, markdown: frontMatter + "\n" + (await renderer.render({ tag: tag.name })) });
  }

  return [
    { path: markdownPathForRoute(routePath), markdown: formatFrontMatter({ title, url: pageUrl }) + "\n" + index.join("\n") },
    ...tagFiles,
  ];
}

// Tag name -> [{ method: "GET", path: "/schema", summary }], in document order.
function operationsByTag(spec) {
  const byTag = new Map();
  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) continue;
      const summary = operation.summary ?? operation.operationId ?? "";
      for (const tag of operation.tags ?? []) {
        if (!byTag.has(tag)) byTag.set(tag, []);
        byTag.get(tag).push({ method: method.toUpperCase(), path, summary });
      }
    }
  }
  return byTag;
}

function tagSlug(name) {
  return encodeURIComponent(name.trim().replace(/\s+/g, "-"));
}
