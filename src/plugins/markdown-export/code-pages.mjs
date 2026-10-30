/**
 * Moves the code examples of a page's language tab groups into one code page
 * per language, and leaves the Python examples on the landing page.
 *
 * html-to-markdown.mjs marks each language group with `languageGroup` while it
 * rewrites the rendered tabs, and calls `splitCodePages` once the rest of the
 * page is rewritten. For `/weaviate/manage-objects/import`, the landing page
 * `import.md` keeps each group's Python panels under a line such as
 *
 *   Python shown. Other languages: [JS/TS](import.typescript.md#server-side-batching) · [Go](import.go.md#server-side-batching)
 *
 * and `import.typescript.md`, `import.go.md` and so on hold each language's
 * panels, one section per group, linked back to the landing page's heading.
 * Links between these files are relative to the landing file name, so they
 * resolve on any host.
 */
import { toText } from "hast-util-to-text";
import { SKIP, visit } from "unist-util-visit";
import { codePagePath } from "./markdown-path.mjs";

/**
 * Language page keys, in the order that link lines list them after Python,
 * with the name each link shows. The key is the code page's file name suffix:
 * `import.go-v5.md`.
 */
export const LANGUAGES = [
  { key: "python", name: "Python" },
  { key: "typescript", name: "JS/TS" },
  { key: "go", name: "Go" },
  { key: "go-v5", name: "Go v5" },
  { key: "java", name: "Java" },
  { key: "csharp", name: "C#" },
  { key: "curl", name: "curl" },
  { key: "graphql", name: "GraphQL" },
];

// Code tab groups (src/theme/Tabs) name each panel by its <option value>.
// Values outside this map, such as "bash" or "openai", make a group a
// non-language group.
const CODE_TAB_LANGUAGES = new Map([
  ["py", "python"],
  ["py_agents", "python"],
  ["py_engram", "python"],
  ["py_engram_async", "python"],
  ["ts", "typescript"],
  ["js", "typescript"],
  ["ts_agents", "typescript"],
  ["go", "go"],
  ["gov5", "go-v5"],
  ["java", "java"],
  ["csharp", "csharp"],
  ["curl", "curl"],
  ["graphql", "graphql"],
  ["gql", "graphql"],
]);

// Default Docusaurus tabs carry only a label. Matched case-insensitively.
const TAB_LABEL_LANGUAGES = new Map([
  ["python", "python"],
  ["python (agents)", "python"],
  ["python (async)", "python"],
  ["javascript/typescript", "typescript"],
  ["go", "go"],
  ["go (v5)", "go-v5"],
  ["java", "java"],
  ["java v6", "java"],
  ["c#", "csharp"],
  ["curl", "curl"],
  ["graphql", "graphql"],
]);

/** The language key of a code tab panel's `<option value>`, or undefined. */
export function codeTabLanguage(value) {
  return CODE_TAB_LANGUAGES.get(value);
}

/** The language key of a default tab's label, or undefined. */
export function tabLabelLanguage(label) {
  return TAB_LABEL_LANGUAGES.get(label.trim().toLowerCase());
}

const GROUP_TAG = "markdown-language-group";
const PANEL_TAG = "markdown-language-panel";

/**
 * Returns a placeholder element for a tab group whose panels are all in a
 * language and cover at least two languages, or null for any other group,
 * which the caller writes inline.
 *
 * The placeholder keeps each panel's children as hast children, so later
 * rewrite passes reach them. `splitCodePages` replaces it before conversion.
 *
 * @param {"code" | "tabs"} kind "code" for a code tab group, whose inline
 *   labels are bold, and "tabs" for default tabs, whose labels are `####`
 *   headings. A placeholder nested in another group's panel is written inline
 *   with these labels.
 * @param {Array<{ language: string | undefined, label: string, children: object[] }>} panels
 *   In page order. `language` is a key from LANGUAGES.
 * @returns {object | null} A hast element, or null.
 */
export function languageGroup(kind, panels) {
  const languages = new Set(panels.map((panel) => panel.language));
  if (languages.has(undefined) || languages.size < 2) return null;
  return element(
    GROUP_TAG,
    { kind },
    panels.map(({ language, label, children }) => element(PANEL_TAG, { language, label }, children)),
  );
}

/**
 * Turns every language group placeholder in `docsBody` into its landing page
 * form, in place, and returns the code pages as hast trees.
 *
 * Landing page, for each group: one line naming the shown panels and linking
 * to the group's section on each other language's code page, then the Python
 * panels (or, without Python, the panels of the first language in LANGUAGES
 * order). When the page has a group, a line after the `<h1>` links every code
 * page.
 *
 * Code page for each language on the page, Python included:
 *
 *   # <title>: <name> code examples
 *   Full page: [<title>](import.md). Other languages: [Python](import.python.md) · ...
 *   ## [<nearest preceding heading>](import.md#<heading id>)       one per group with this language
 *   <the language's panels; each under a ### label when there are several>
 *   ## Sections without a <name> example                          when any
 *   - [<heading>](import.md#<heading id>)
 *
 * The nearest preceding heading is the last `<h2>`-`<h6>` with an `id` before
 * the group, outside other groups; before any, the page title, linked without
 * a fragment. A section anchor is the GitHub-style slug of its heading text,
 * with `-2`, `-3` appended when the text repeats on that code page.
 *
 * @param {object} docsBody The rewritten `.theme-doc-markdown` element.
 * @param {object} page
 * @param {string} page.title The page title, used in code page titles.
 * @param {string} page.landingFile The landing page's file name, such as
 *   `import.md`. Every link between the files is relative to it.
 * @returns {Array<{ language: string, tree: object }>} One hast root per
 *   language key on the page, in LANGUAGES order. Empty when the page has no
 *   language group, and then `docsBody` is unchanged.
 */
export function splitCodePages(docsBody, { title, landingFile }) {
  const groups = collectGroups(docsBody);
  if (!groups.length) return [];

  const languages = LANGUAGES.filter(({ key }) => groups.some((group) => group.languages.has(key)));
  const anchors = sectionAnchors(groups, languages, title);
  const fileFor = (language) => codePagePath(landingFile, language);

  for (const group of groups) {
    const shownLanguage = LANGUAGES.find(({ key }) => group.languages.has(key)).key;
    const shown = group.panels.filter((panel) => panel.language === shownLanguage);
    const others = languages.filter(({ key }) => key !== shownLanguage && group.languages.has(key));
    const shownLabels = [...new Set(shown.map((panel) => panel.label || languageName(shownLanguage)))];
    const linkLine = element("p", {}, [
      text(`${shownLabels.join(" and ")} shown. Other languages: `),
      ...joinLinks(others.map(({ key, name }) => link(`${fileFor(key)}#${anchors.get(group).get(key)}`, [text(name)]))),
    ]);
    Object.assign(group.node, {
      tagName: "div",
      properties: {},
      children: [linkLine, ...panelContent(shown, (label) => element("p", {}, [element("strong", {}, [text(label)])]))],
    });
  }

  insertAfterTitle(
    docsBody,
    element("p", {}, [
      text("Code examples by language: "),
      ...joinLinks(languages.map(({ key, name }) => link(fileFor(key), [text(name)]))),
    ]),
  );

  return languages.map(({ key, name }) => ({
    language: key,
    tree: codePageTree({ language: key, name, groups, languages, anchors, title, landingFile, fileFor }),
  }));
}

// Top-level groups in page order, each with its nearest preceding heading.
// Groups nested in another group's panel are written inline (iter1 form),
// because their section would have no heading of its own.
function collectGroups(docsBody) {
  const groups = [];
  let heading = null;
  visit(docsBody, "element", (node) => {
    if (/^h[2-6]$/.test(node.tagName) && node.properties.id) heading = node;
    if (node.tagName !== GROUP_TAG) return;

    const panels = node.children.map((panel) => ({
      language: panel.properties.language,
      label: panel.properties.label,
      children: panel.children,
    }));
    for (const panel of panels) visit({ type: "root", children: panel.children }, "element", inlineNestedGroup);
    groups.push({ node, heading, panels, languages: new Set(panels.map((panel) => panel.language)) });
    return SKIP;
  });
  return groups;
}

function inlineNestedGroup(node) {
  if (node.tagName !== GROUP_TAG) return;
  const label =
    node.properties.kind === "code"
      ? (value) => element("p", {}, [element("strong", {}, [text(value)])])
      : (value) => element("h4", {}, [text(value)]);
  const children = node.children.flatMap((panel) => [
    ...(panel.properties.label ? [label(panel.properties.label)] : []),
    ...panel.children,
  ]);
  Object.assign(node, { tagName: "div", properties: {}, children });
}

// group -> language key -> anchor of that group's section on the code page.
function sectionAnchors(groups, languages, title) {
  const anchors = new Map(groups.map((group) => [group, new Map()]));
  for (const { key } of languages) {
    const seen = new Map();
    for (const group of groups) {
      if (!group.languages.has(key)) continue;
      const base = slug(group.heading ? toText(group.heading) : title);
      const count = (seen.get(base) ?? 0) + 1;
      seen.set(base, count);
      anchors.get(group).set(key, count === 1 ? base : `${base}-${count}`);
    }
  }
  return anchors;
}

function codePageTree({ language, name, groups, languages, anchors, title, landingFile, fileFor }) {
  const sectionLink = (heading) =>
    heading
      ? link(`${landingFile}#${heading.properties.id}`, headingContent(heading))
      : link(landingFile, [text(title)]);

  const children = [
    element("h1", {}, [text(`${title}: ${name} code examples`)]),
    element("p", {}, [
      text("Full page: "),
      link(landingFile, [text(title)]),
      text(". Other languages: "),
      ...joinLinks(languages.filter(({ key }) => key !== language).map(({ key, name: other }) => link(fileFor(key), [text(other)]))),
    ]),
  ];

  for (const group of groups) {
    if (!group.languages.has(language)) continue;
    const panels = group.panels.filter((panel) => panel.language === language);
    children.push(
      element("h2", {}, [sectionLink(group.heading)]),
      ...panelContent(panels, (label) => element("h3", {}, [text(label)])),
    );
  }

  // A section is a heading that at least one group falls under.
  const sections = [...new Set(groups.map((group) => group.heading))];
  const missing = sections.filter(
    (heading) => !groups.some((group) => group.heading === heading && group.languages.has(language)),
  );
  if (missing.length) {
    children.push(
      element("h2", {}, [text(`Sections without a ${name} example`)]),
      element("ul", {}, missing.map((heading) => element("li", {}, [sectionLink(heading)]))),
    );
  }

  return { type: "root", children };
}

// One panel's children as they are; several panels each under their label.
function panelContent(panels, labelElement) {
  if (panels.length === 1) return panels[0].children;
  return panels.flatMap((panel) => [
    ...(panel.label ? [labelElement(panel.label)] : []),
    ...panel.children,
  ]);
}

// A heading's inline content for use as link text. Text only when the heading
// itself contains a link, which cannot nest.
function headingContent(heading) {
  let hasLink = false;
  visit(heading, "element", (node) => {
    if (node.tagName === "a") hasLink = true;
  });
  return hasLink ? [text(toText(heading).trim())] : heading.children;
}

function insertAfterTitle(docsBody, node) {
  let inserted = false;
  visit(docsBody, "element", (child, index, parent) => {
    if (inserted || child.tagName !== "h1" || !parent) return;
    parent.children.splice(index + 1, 0, node);
    inserted = true;
    return SKIP;
  });
  if (!inserted) docsBody.children.unshift(node);
}

// GitHub's heading slug: lowercase, punctuation removed, spaces as hyphens.
function slug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
    .replace(/ /g, "-");
}

function languageName(key) {
  return LANGUAGES.find((language) => language.key === key).name;
}

function joinLinks(links) {
  return links.flatMap((node, index) => (index ? [text(" · "), node] : [node]));
}

function link(href, children) {
  return element("a", { href }, children);
}

function element(tagName, properties, children) {
  return { type: "element", tagName, properties, children };
}

function text(value) {
  return { type: "text", value };
}
