/**
 * Converts one built docs page from HTML to Markdown for agents and LLM tools.
 *
 * The input is the rendered HTML, not the MDX source: code examples come from
 * `_includes/` through raw-loader imports and partials, and only the rendered
 * page contains them.
 */
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { select, selectAll } from "hast-util-select";
import { toText } from "hast-util-to-text";
import { SKIP, visit } from "unist-util-visit";

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
  const document = unified().use(rehypeParse).parse(html);
  const docsBody = select(".theme-doc-markdown", document);
  if (!docsBody) return null;

  try {
    const frontMatter = {
      title: readTitle(document, docsBody),
      description: select('meta[name="description"]', document)?.properties.content,
      url: pageUrl,
    };

    rewriteForMarkdown(docsBody, siteUrl);

    const mdast = unified()
      .use(rehypeRemark, { handlers: { [ALERT_TAG]: alertHandler } })
      .runSync({ type: "root", children: [docsBody] });
    const body = unified()
      .use(remarkGfm)
      .use(remarkStringify, { bullet: "-", fences: true, rule: "-" })
      .stringify(mdast);

    return `${formatFrontMatter(frontMatter)}\n${body}`;
  } catch (error) {
    throw new Error(`Markdown export failed for ${pageUrl}: ${error.message}`, { cause: error });
  }
}

// The page title is the docs body's <h1>. og:title carries the same text plus
// a " | Weaviate Documentation" suffix, so it is only a fallback.
function readTitle(document, docsBody) {
  const h1 = select("h1", docsBody);
  if (h1) return toText(h1).trim();
  const ogTitle = select('meta[property="og:title"]', document)?.properties.content ?? "";
  return String(ogTitle).replace(/ \| [^|]*$/, "");
}

function formatFrontMatter({ title, description, url }) {
  const lines = ["---", `title: ${JSON.stringify(title)}`];
  if (description) lines.push(`description: ${JSON.stringify(String(description))}`);
  lines.push(`url: ${url}`, "---", "");
  return lines.join("\n");
}

// Rewrites rendered Docusaurus markup, in place, into plain elements whose
// rehype-remark conversion is the Markdown described in convertDocPage.
//
// Order matters: Mermaid and KaTeX are replaced before the generic code-block
// and removal passes would misread them, and code blocks are normalized before
// tab groups read their fence languages.
function rewriteForMarkdown(docsBody, siteUrl) {
  // React SSR emits <!-- --> between adjacent text nodes.
  removeNodes(docsBody, (node) => node.type === "comment");

  visitElements(docsBody, (node) => node.properties[toPropertyName(MARKDOWN_SOURCE_ATTRIBUTE)] === "mermaid", (node) => {
    node.tagName = "pre";
    node.properties = { className: ["language-mermaid"] };
  });

  // KaTeX renders MathML with the LaTeX source in an annotation, plus an
  // aria-hidden visual copy. Keep only the source.
  replaceElements(docsBody, (node) => hasClass(node, /^katex(-display)?$/), (node) => {
    const annotation = select('annotation[encoding="application/x-tex"]', node);
    if (!annotation) return node;
    const latex = toText(annotation).trim();
    return text(hasClass(node, /^katex-display$/) ? `$$${latex}$$` : `$${latex}$`);
  });

  // Prism renders each line as a .token-line span ending in <br>, and puts the
  // language class on <pre>. rehype-remark expects <pre><code class="language-x">.
  rewriteElements(docsBody, (node) => node.tagName === "pre", (node) => {
    const language = [...classList(node), ...classList(select("code", node))]
      .map((name) => name.match(/^language-([\w-]+)$/)?.[1])
      .find(Boolean);
    const lines = selectAll(".token-line", node);
    const source = lines.length
      ? lines.map((line) => toText(line, { whitespace: "pre" }).replace(/\n$/, "")).join("\n")
      : toText(node, { whitespace: "pre" });
    return element("pre", {}, [
      element("code", { className: language ? [`language-${language}`] : [] }, [text(source.replace(/\n+$/, ""))]),
    ]);
  });

  // Code tab groups (src/theme/Tabs) render every language panel, hiding all
  // but one, and label them only in the <select>. Its options come from the
  // same children as the panels, in order; a disabled option is appended only
  // when the reader's stored language has no panel.
  visitElements(docsBody, (node) => hasClass(node, /codeDropdownContainer/), (node) => {
    const labels = selectAll("option", node)
      .filter((option) => !option.properties.disabled)
      .map((option) => toText(option).trim());
    node.children = selectAll('[role="tabpanel"]', node).flatMap((panel, index) => [
      ...(labels[index] ? [element("p", {}, [element("strong", {}, [text(labels[index])])])] : []),
      ...panel.children,
    ]);
  });

  // Default Docusaurus tabs: a role="tablist" followed by a wrapper of panels,
  // all but one carrying `hidden`.
  visitElements(docsBody, (node) => node.children.some((child) => child.properties?.role === "tablist"), (node) => {
    const tablist = node.children.find((child) => child.properties?.role === "tablist");
    const labels = selectAll('[role="tab"]', tablist).map((tab) => toText(tab).trim());
    const panelWrapper = node.children[node.children.indexOf(tablist) + 1];
    const panels = (panelWrapper?.children ?? []).filter((child) => child.properties?.role === "tabpanel");
    node.children = panels.flatMap((panel, index) => [
      ...(labels[index] ? [element("h4", {}, [text(labels[index])])] : []),
      ...panel.children,
    ]);
  });

  rewriteElements(docsBody, (node) => hasClass(node, /^theme-admonition$/), (node) => {
    const type = [...classList(node)].map((name) => name.match(/^theme-admonition-(\w+)$/)?.[1]).find(Boolean) ?? "note";
    const heading = node.children.find((child) => hasClass(child, /admonitionHeading/));
    const content = node.children.find((child) => hasClass(child, /admonitionContent/));
    const title = heading ? toText(heading).trim() : "";
    const titleParagraph =
      title && title.toLowerCase() !== type ? [element("p", {}, [element("strong", {}, [text(title)])])] : [];
    return element(ALERT_TAG, { alertType: GITHUB_ALERT_TYPES[type] ?? "NOTE" }, [
      ...titleParagraph,
      ...(content?.children ?? []),
    ]);
  });

  rewriteElements(docsBody, (node) => node.tagName === "details", (node) => {
    const summary = node.children.find((child) => child.tagName === "summary");
    return element("div", {}, [
      ...(summary ? [element("p", {}, [element("strong", {}, [text(toText(summary).trim())])])] : []),
      ...node.children.filter((child) => child !== summary),
    ]);
  });

  rewriteElements(docsBody, (node) => node.tagName === "iframe" && typeof node.properties.src === "string", (node) =>
    element("p", {}, [element("a", { href: node.properties.src }, [text(node.properties.title || "Embedded content")])]),
  );

  removeNodes(
    docsBody,
    (node) =>
      node.type === "element" &&
      (node.properties.dataCopyExclude !== undefined ||
        REMOVED_TAGS.has(node.tagName) ||
        hasClass(node, /^hash-link$/) ||
        (node.tagName === "img" && (node.properties.alt === "" || hasClass(node, /themedComponent--dark/)))),
  );

  visitElements(docsBody, () => true, (node) => {
    for (const attribute of ["href", "src"]) {
      const value = node.properties[attribute];
      if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
        node.properties[attribute] = siteUrl + value;
      }
    }
  });
}

const REMOVED_TAGS = new Set(["button", "select", "svg", "script", "style", "nav"]);

// Docusaurus admonition types mapped to GitHub alert types.
const GITHUB_ALERT_TYPES = {
  note: "NOTE",
  info: "NOTE",
  tip: "TIP",
  warning: "WARNING",
  caution: "WARNING",
  danger: "CAUTION",
};

// A temporary hast element for admonitions. Its handler emits the `[!TYPE]`
// marker as a raw mdast node; as text, remark-stringify would escape the `[`.
const ALERT_TAG = "markdown-alert";

function alertHandler(state, node) {
  const result = {
    type: "blockquote",
    children: [{ type: "html", value: `[!${node.properties.alertType}]` }, ...state.toFlow(state.all(node))],
  };
  state.patch(node, result);
  return result;
}

function element(tagName, properties, children) {
  return { type: "element", tagName, properties, children };
}

function text(value) {
  return { type: "text", value };
}

function classList(node) {
  return node?.properties?.className ?? [];
}

function hasClass(node, pattern) {
  return node?.type === "element" && classList(node).some((name) => pattern.test(name));
}

// hast stores data-foo-bar as properties.dataFooBar.
function toPropertyName(attribute) {
  return attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function visitElements(tree, test, mutate) {
  visit(tree, "element", (node) => {
    if (test(node)) mutate(node);
  });
}

// Turns each matching element into the returned element, in place. The
// traversal then continues into the new children, so nested matches (a
// <details> inside a <details>) are rewritten too.
function rewriteElements(tree, test, rewrite) {
  visit(tree, "element", (node) => {
    if (!test(node)) return;
    const { tagName, properties, children } = rewrite(node);
    Object.assign(node, { tagName, properties, children });
  });
}

// Replaces each matching element with the returned node, which may be text.
// Nothing inside a replaced element is visited.
function replaceElements(tree, test, replace) {
  visit(tree, "element", (node, index, parent) => {
    if (!parent || !test(node)) return;
    parent.children[index] = replace(node);
    return SKIP;
  });
}

function removeNodes(tree, test) {
  visit(tree, (node, index, parent) => {
    if (!parent || !test(node)) return;
    parent.children.splice(index, 1);
    return [SKIP, index];
  });
}
