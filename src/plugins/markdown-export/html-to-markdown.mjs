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
import { codeTabLanguage, languageGroup, splitCodePages, tabLabelLanguage } from "./code-pages.mjs";
import { markdownPathForRoute } from "./markdown-path.mjs";

/**
 * Marks an element that exists only so the Markdown export can read it.
 *
 * The element must also carry `hidden`. Its value names the content kind, and
 * MARKDOWN_CONTENT_ATTRIBUTE holds the content, URI-encoded. "mermaid" is the
 * only kind: the Mermaid theme wrapper renders the diagram source as
 * `<pre hidden data-markdown-source="mermaid" data-markdown-content="flowchart%20TB...">`,
 * because the diagram itself is drawn in the browser and is absent from the
 * built HTML.
 */
export const MARKDOWN_SOURCE_ATTRIBUTE = "data-markdown-source";

/**
 * The URI-encoded content of a MARKDOWN_SOURCE_ATTRIBUTE element.
 *
 * Content travels in an attribute because the HTML minifier may unescape text:
 * a literal `&<br>` in Mermaid source would become a <br> element.
 */
export const MARKDOWN_CONTENT_ATTRIBUTE = "data-markdown-content";

/**
 * Converts the HTML of one built page to a Markdown landing page and one code
 * page per language.
 *
 * Reads only the docs body (`.theme-doc-markdown`), so the navbar, sidebar,
 * breadcrumbs, table of contents and footer are left out. The landing page
 * (`markdown`) is:
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
 * - Language tab groups: a code tab group whose `<option value>`s, or a
 *   default tab group whose labels, all name a language, with at least two
 *   languages (`py` and `ts`; "Python" and "Java v6"). The landing page keeps
 *   the Python panels under a line that links each other language's code
 *   page; the code pages hold the rest. Layout and the value and label
 *   mapping: `splitCodePages` and `LANGUAGES` in code-pages.mjs.
 * - Other code tab groups: every variant, each fence preceded by its dropdown
 *   label in bold (`**Windows PowerShell**`), with the fence language from the
 *   rendered block.
 * - Vector literals in code: a bracketed list of 16 or more numbers keeps its
 *   first three values and `...` (`[0.0042, -0.0215, 0.0118, ...]`), and an
 *   italic sentence after the block gives the full length. The HTML page keeps
 *   the full vector.
 * - Other default Docusaurus tabs: every panel, under an `####` heading with
 *   the tab label.
 * - Admonitions: GitHub alert blockquotes (`> [!TIP]`), with the admonition
 *   title in bold when it differs from the type. Links in the title are kept.
 * - `<details>`: the summary in bold, followed by the expanded body.
 * - Tables: GFM tables, without padding cells to the column width. A cell
 *   with block content puts each block on its own line, separated by `<br>`,
 *   with list items marked `• `.
 * - A link that wraps a list or button (a deployment card): the card content,
 *   followed by one link labelled with the button text.
 * - Any other link that wraps blocks (a card with a title and description):
 *   `[Title](url): Description`.
 * - A row of badge links under a code block: `See also: [View full example
 *   code](url), [.Auth](url)`.
 * - KaTeX: the LaTeX source, as `$...$` or `$$...$$`.
 * - Mermaid (`[data-markdown-source="mermaid"]`): a `mermaid` fence.
 * - Embedded iframes: a link to the embed URL.
 * - Images: `![alt](url)` linking to the original image file, so an agent can
 *   fetch it. An image inside a link stays linked (`[![alt](url)](href)`).
 *   Themed light/dark pairs keep only the light variant. Images with an
 *   explicit empty `alt=""` are decorative (such as the Cloud-only icon) and
 *   are removed; images with no `alt` attribute are kept.
 * - Root-relative links and image sources: absolute, prefixed with `siteUrl`.
 *   Fragment links (`#no-vector`) are prefixed with `pageUrl`, because
 *   Markdown headings do not keep custom heading IDs. Links point to the HTML
 *   pages, not to their `.md` versions.
 * - Removed: elements marked `[data-copy-exclude]`, heading anchor links,
 *   buttons (except the text of a button inside a paragraph), `<select>`, SVG and Font Awesome icons, scripts, and React SSR
 *   comments.
 *
 * @param {object} page
 * @param {string} page.html Complete HTML document written by `docusaurus build`.
 * @param {string} page.pageUrl Absolute URL of the HTML page; written as `url`.
 * @param {string} page.siteUrl `siteConfig.url`, without a trailing slash.
 * Code pages start at their `#` title, without front matter, and convert
 * panel content by the same rules.
 *
 * @returns {{ markdown: string, codePages: Array<{ language: string, markdown: string }> } | null}
 *   The landing page and the code pages, with `language` a key from
 *   `LANGUAGES` (write each at `codePagePath(markdownPath, language)`).
 *   `codePages` is empty when the page has no language group. `null` when
 *   the HTML has no docs body, as on tag listings, the 404 page and the
 *   Scalar API reference.
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

    rewriteForMarkdown(docsBody, { pageUrl, siteUrl });
    const landingFile = markdownPathForRoute(new URL(pageUrl).pathname).split("/").at(-1);
    const codePages = splitCodePages(docsBody, { title: frontMatter.title, landingFile });

    return {
      markdown: `${formatFrontMatter(frontMatter)}\n${toMarkdown({ type: "root", children: [docsBody] })}`,
      codePages: codePages.map(({ language, tree }) => ({ language, markdown: toMarkdown(tree) })),
    };
  } catch (error) {
    throw new Error(`Markdown export failed for ${pageUrl}: ${error.message}`, { cause: error });
  }
}

function toMarkdown(hast) {
  const mdast = unified()
    .use(rehypeRemark, { handlers: { [ALERT_TAG]: alertHandler, [LINE_BREAK_TAG]: lineBreakHandler } })
    .runSync(hast);
  shortenVectorLiterals(mdast);
  // Aligned pipes pad every cell to its column's widest cell, which was
  // half of release-notes.md and 7% of the whole export.
  return unified()
    .use(remarkGfm, { tablePipeAlign: false })
    .use(remarkStringify, { bullet: "-", fences: true, rule: "-" })
    .stringify(mdast);
}

const NUMBER = String.raw`-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?`;
// An embedding vector written out in a code example. Across the built site,
// 16 or more numbers in one list match only the 300- and 1,536-number
// vectors, and no other array.
const VECTOR_LITERAL = new RegExp(String.raw`\[\s*(?:${NUMBER}\s*,\s*){15,}${NUMBER}\s*,?\s*\]`, "g");
const KEPT_VECTOR_VALUES = 3;

// Shortens each vector literal in the page's code blocks and adds a sentence
// after the block that says so. The snippets under _includes/ run as tests
// against a live instance, so the full vectors stay in the source and HTML.
function shortenVectorLiterals(mdast) {
  visit(mdast, "code", (node, index, parent) => {
    const lengths = [];
    node.value = node.value.replace(VECTOR_LITERAL, (literal) => {
      const values = literal.match(new RegExp(NUMBER, "g"));
      lengths.push(values.length.toLocaleString("en-US"));
      return `[${values.slice(0, KEPT_VECTOR_VALUES).join(", ")}, ...]`;
    });
    if (!lengths.length || !parent) return;
    const note =
      lengths.length === 1
        ? `This example's ${lengths[0]}-number vector is shortened to its first ${KEPT_VECTOR_VALUES} values.`
        : `This example's vectors (${lengths.join(", ")} numbers) are shortened to their first ${KEPT_VECTOR_VALUES} values.`;
    parent.children.splice(index + 1, 0, {
      type: "paragraph",
      children: [{ type: "emphasis", children: [{ type: "text", value: `${note} The HTML page has the full vector.` }] }],
    });
    return index + 2;
  });
}

// The page title is the docs body's <h1>. og:title carries the same text plus
// a " | Weaviate Documentation" suffix, so it is only a fallback.
function readTitle(document, docsBody) {
  const h1 = select("h1", docsBody);
  if (h1) return toText(h1).trim();
  const ogTitle = select('meta[property="og:title"]', document)?.properties.content ?? "";
  return String(ogTitle).replace(/ \| [^|]*$/, "");
}

/**
 * The front matter block that starts every exported Markdown file, followed by
 * a blank line. `description` is omitted when empty; strings are JSON-quoted.
 */
export function formatFrontMatter({ title, description, url }) {
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
function rewriteForMarkdown(docsBody, { pageUrl, siteUrl }) {
  // React SSR emits <!-- --> between adjacent text nodes.
  removeNodes(docsBody, (node) => node.type === "comment");

  rewriteElements(docsBody, (node) => node.properties[toPropertyName(MARKDOWN_SOURCE_ATTRIBUTE)] === "mermaid", (node) => {
    const source = decodeURIComponent(node.properties[toPropertyName(MARKDOWN_CONTENT_ATTRIBUTE)] ?? "");
    return element("pre", { className: ["language-mermaid"] }, [text(source)]);
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
    const options = selectAll("option", node).filter((option) => !option.properties.disabled);
    const labels = options.map((option) => toText(option).trim());
    const panels = selectAll('[role="tabpanel"]', node);
    const group = languageGroup(
      "code",
      panels.map((panel, index) => ({
        language: codeTabLanguage(String(options[index]?.properties.value ?? "")),
        label: labels[index] ?? "",
        children: panel.children,
      })),
    );
    node.children = group
      ? [group]
      : panels.flatMap((panel, index) => [
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
    const group = languageGroup(
      "tabs",
      panels.map((panel, index) => ({
        language: labels[index] ? tabLabelLanguage(labels[index]) : undefined,
        label: labels[index] ?? "",
        children: panel.children,
      })),
    );
    node.children = group
      ? [group]
      : panels.flatMap((panel, index) => [
          ...(labels[index] ? [element("h4", {}, [text(labels[index])])] : []),
          ...panel.children,
        ]);
  });

  rewriteElements(docsBody, (node) => hasClass(node, /^theme-admonition$/), (node) => {
    const type = [...classList(node)].map((name) => name.match(/^theme-admonition-(\w+)$/)?.[1]).find(Boolean) ?? "note";
    const heading = node.children.find((child) => hasClass(child, /admonitionHeading/));
    const content = node.children.find((child) => hasClass(child, /admonitionContent/));
    const title = heading ? toText(heading).trim() : "";
    // Keep the heading's children, not its text, so links in a custom title survive.
    const titleParagraph = title && title.toLowerCase() !== type ? [boldParagraph(heading.children)] : [];
    return element(ALERT_TAG, { alertType: GITHUB_ALERT_TYPES[type] ?? "NOTE" }, [
      ...titleParagraph,
      ...(content?.children ?? []),
    ]);
  });

  rewriteElements(docsBody, (node) => node.tagName === "details", (node) => {
    const summary = node.children.find((child) => child.tagName === "summary");
    return element("div", {}, [
      ...(summary ? [boldParagraph(summary.children)] : []),
      ...node.children.filter((child) => child !== summary),
    ]);
  });

  rewriteElements(docsBody, (node) => node.tagName === "iframe" && typeof node.properties.src === "string", (node) =>
    element("p", {}, [element("a", { href: node.properties.src }, [text(node.properties.title || "Embedded content")])]),
  );

  // A card that is one big link (src/components/DeploymentCards) wraps a list
  // and a button. Inside a link, rehype-remark flattens the list into the link
  // text. Keep the card's content as blocks and add a single link, labelled
  // with the button text. Runs before removal, which drops the button.
  rewriteElements(docsBody, (node) => node.tagName === "a" && select("ul, ol, button", node), (node) => {
    const button = select("button", node);
    const label = button ? toText(button).trim() : node.properties.href;
    return element("div", {}, [
      ...node.children,
      element("p", {}, [element("a", { href: node.properties.href }, [text(label)])]),
    ]);
  });

  // Any other link that wraps blocks is a card (src/components/CardsSection):
  // a title block, then a description. As one link, rehype-remark makes each
  // block a separate link to the same URL.
  rewriteElements(docsBody, (node) => node.tagName === "a" && node.children.some(isBlock), (node) => {
    const [title = [], ...description] = cellLines(node.children);
    const separator = description.length ? [text(": ")] : [];
    return element("p", {}, [
      element("a", { href: node.properties.href }, title),
      ...separator,
      ...description.flatMap((line, index) => (index ? [text(" "), ...line] : line)),
    ]);
  });

  // FilteredTextBlock renders a row of badge links (GitHub source, client API
  // docs) under a code block. Their labels start with &nbsp; and nothing
  // separates them.
  rewriteElements(
    docsBody,
    (node) => node.children.length > 0 && node.children.every((child) => child.tagName === "a" && hasClass(child, /^badge$/)),
    (node) =>
      element("p", {}, [
        text("See also: "),
        ...node.children.flatMap((badge, index) => [
          ...(index ? [text(", ")] : []),
          element("a", { href: badge.properties.href }, [text(toText(badge).replace(/\s+/g, " ").trim())]),
        ]),
      ]),
  );

  // A button inside a paragraph is part of the sentence: KapaAI renders "use
  // the <button>Ask AI</button> feature". Keep its text; other buttons are
  // controls and are removed below.
  replaceElements(docsBody, (node, parent) => node.tagName === "button" && parent.tagName === "p", (node) => text(toText(node)));

  removeNodes(
    docsBody,
    (node) =>
      node.type === "element" &&
      (node.properties.dataCopyExclude !== undefined ||
        REMOVED_TAGS.has(node.tagName) ||
        hasClass(node, /^hash-link$/) ||
        // Font Awesome icons are empty <i> elements, which would become `**`.
        (node.tagName === "i" && toText(node).trim() === "") ||
        (node.tagName === "img" && (node.properties.alt === "" || hasClass(node, /themedComponent--dark/)))),
  );

  // GFM table cells hold one line, so rehype-remark runs block content
  // together ("Create rolesRead role info"). Put each block on its own line,
  // separated by a literal <br>, with list items marked "• ".
  visitElements(docsBody, (node) => ["td", "th"].includes(node.tagName) && node.children.some(isBlock), (node) => {
    node.children = cellLines(node.children).flatMap((line, index) => (index ? [element(LINE_BREAK_TAG, {}, []), ...line] : line));
  });

  visitElements(docsBody, () => true, (node) => {
    for (const attribute of ["href", "src"]) {
      const value = node.properties[attribute];
      if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
        node.properties[attribute] = siteUrl + value;
      } else if (attribute === "href" && typeof value === "string" && value.startsWith("#")) {
        node.properties[attribute] = pageUrl + value;
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

// A temporary hast element for a line break inside a table cell, emitted as a
// raw <br>. rehype-remark turns a real <br> in a cell into a space.
const LINE_BREAK_TAG = "markdown-line-break";

function lineBreakHandler(state, node) {
  const result = { type: "html", value: "<br>" };
  state.patch(node, result);
  return result;
}

const BLOCK_TAGS = new Set(["blockquote", "div", "dl", "dd", "dt", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ol", "p", "pre", "ul"]);

function isBlock(node) {
  return node.type === "element" && BLOCK_TAGS.has(node.tagName);
}

// Splits a table cell's content into lines of inline nodes: one line per
// block, with whitespace-only lines dropped.
function cellLines(children) {
  const lines = [[]];
  for (const child of children) {
    if (!isBlock(child)) {
      lines.at(-1).push(child);
      continue;
    }
    const inner = cellLines(child.children);
    if (child.tagName === "li" && inner.length) inner[0].unshift(text("• "));
    lines.push(...inner, []);
  }
  return lines.filter((line) => line.some((node) => node.type !== "text" || node.value.trim()));
}

// A title paragraph in bold. Bold inside the title is unwrapped: nested, it
// would print as `****TIP:** ...**`.
function boldParagraph(children) {
  const unwrapBold = (nodes) =>
    nodes.flatMap((node) => (["strong", "b"].includes(node.tagName) ? unwrapBold(node.children) : [node]));
  return element("p", {}, [element("strong", {}, unwrapBold(children))]);
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
// `test` also receives the parent. Nothing inside a replaced element is visited.
function replaceElements(tree, test, replace) {
  visit(tree, "element", (node, index, parent) => {
    if (!parent || !test(node, parent)) return;
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
