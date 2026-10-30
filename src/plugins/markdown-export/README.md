# Markdown export

Every docs page at `https://docs.weaviate.io/<route>` has a Markdown version at `https://docs.weaviate.io/<route>.md`, written at build time for agents and LLM tools. For example, `/weaviate/search/basics` has `/weaviate/search/basics.md`.

Each file starts with front matter (`title`, `description`, `url`), followed by the page body: headings, prose, tables, admonitions as GitHub alerts, the Python variant of each language tab group, every variant of other tab groups under its label, Mermaid source, and images linked to their original files. The full list of conversion rules is in the `convertDocPage` doc comment in [`html-to-markdown.mjs`](html-to-markdown.mjs).

## Code pages

A tab group is a language group when every panel maps to a language and it covers at least two languages: code tabs map by `<option value>` (`py`, `ts`, `gov5`), and default tabs by label ("Python", "Java v6"). The mapping is in [`code-pages.mjs`](code-pages.mjs). A tab group with any other panel, such as Docker/Kubernetes or Bash/PowerShell, stays inline with every variant.

For a page with language groups, the build also writes one code page per language next to the page's `.md`, at `<route>.<language>.md`. For `/weaviate/manage-objects/import`:

| File | Content |
|---|---|
| `import.md` | The page. After the title, a line links each code page. Each language group keeps its Python panels (or, without Python, the first language's) under a line such as `Python shown. Other languages: [JS/TS](import.typescript.md#server-side-batching) · [Go](import.go.md#server-side-batching)`. |
| `import.<language>.md` | One section per group with that language, headed by a link to the nearest preceding heading on `import.md`, then a list of the page's sections without an example in that language. The languages are `python`, `typescript`, `go`, `go-v5`, `java`, `csharp`, `curl` and `graphql`. |

Links between these files are relative to the file name, so they work on any host. The layout rules are in the `splitCodePages` doc comment.

## How agents find the Markdown

| Mechanism | Where |
|---|---|
| `<link rel="alternate" type="text/markdown" href="/<route>.md">` in each docs page's `<head>` | `MarkdownAlternate` in [`src/theme/DocItem/Layout/index.js`](../../theme/DocItem/Layout/index.js) |
| A visually hidden notice on each docs page that names the `.md` URL | Same component |
| A request for the normal page URL with `Accept: text/markdown` returns the Markdown | [`netlify/edge-functions/markdown-negotiation.ts`](../../../netlify/edge-functions/markdown-negotiation.ts), declared in `netlify.toml` |

The edge function also sets `Content-Type: text/markdown`, `X-Robots-Tag: noindex` and a canonical `Link` header on `.md` responses. A code page's canonical URL is its docs page. Claude Code's web fetch tool sends `Accept: text/markdown, text/html, */*`, so it gets Markdown from the normal page URL.

## Check the output locally

Build the site, then open a page's `.md` file in the build folder:

```bash
yarn build
less build/weaviate/search/basics.md
```

The build log reports the result:

```
[markdown-export] Wrote 393 Markdown files with 589 code pages, and 24 for 2 API reference pages in 5.8s; skipped 17 other routes without a docs body.
```

Routes without a docs body (tag listings, the 404 page) are skipped. If a page fails to convert, the build fails with an error that names the page URL.

## REST API reference pages

Scalar renders `/weaviate/api/rest` and `/engram/api/rest` in the browser, so their HTML has nothing to convert. The plugin finds each `@scalar/docusaurus` entry in `docusaurus.config.js` and converts its spec file (`static/specs/*.json`) with Scalar's [`@scalar/openapi-to-markdown`](https://www.npmjs.com/package/@scalar/openapi-to-markdown) instead:

| File | Content |
|---|---|
| `/weaviate/api/rest.md` | Introduction, servers and authentication, then each tag's operations and a link to its file |
| `/weaviate/api/rest/<tag>.md` | Every operation in one tag, with parameters, schemas and examples |
| `/engram/api/rest.md` | The whole reference. Its spec declares no tags, and at 30 KB it fits in one file. |

The plugin also adds two head links to each Scalar page: `type="text/markdown"` for the `.md`, and `type="application/json"` for the spec. The rules are in the `convertOpenApiPage` doc comment in [`openapi-to-markdown.mjs`](openapi-to-markdown.mjs). The converter requires Node 22.19 or later, which is why `package.json` sets `engines.node`.

## Run the tests

```bash
node --test "src/plugins/markdown-export/*.test.mjs"
```

They need Node 22.19 or later, the version `package.json` requires: the edge function tests import the `.ts` file directly, which Node supports from 22.18, and the Scalar converter needs 22.19. CI runs these in `.github/workflows/pull_requests.yaml`. The converter tests use HTML fixtures in [`fixtures/`](fixtures), which are trimmed copies of real build output. When a component's rendered markup changes, refresh the affected fixture from a new build so the tests keep matching what the site renders.

The edge function tests use a fake Netlify context. They cannot show that Netlify deploys the function; check that on a deploy preview with:

```bash
curl -sI -H "Accept: text/markdown" https://<preview>.netlify.app/weaviate/search/basics
```

The response should have `content-type: text/markdown; charset=utf-8`.

## Change the conversion

- **Remove UI text from the Markdown:** add `data-copy-exclude` to the element in its React component. The "Copy page" button in `src/components/ContextualMenu` honors the same marker. A Markdown heading cannot carry the attribute; [`src/remark/remark-exclude-feedback-heading.js`](../../remark/remark-exclude-feedback-heading.js) adds it to the "Questions and feedback" heading at build time.
- **Add content that only the Markdown needs:** render it as `<pre hidden data-markdown-source="<kind>" data-markdown-content="<URI-encoded content>">` and handle that kind in `html-to-markdown.mjs`. [`src/theme/Mermaid/index.js`](../../theme/Mermaid/index.js) does this for diagram source, because Mermaid draws diagrams in the browser and the built HTML has none. The content goes in an attribute because the HTML minifier unescapes text: `&amp;&lt;br>` in a `<pre>` became a real `<br>` element.
- **Make a visual layout readable as text:** if a component's DOM order only makes sense on screen, as in the `IdAnatomy` grid in `src/components/ErrorDocs`, mark the visual part `aria-hidden="true" data-copy-exclude=""` and render a visually hidden list next to it. Screen readers and the export both read the list.
- **Handle new rendered markup:** add a rewrite in `rewriteForMarkdown`, a fixture that contains the markup, and a test.

## Constraints

- The edge function keeps its own copy of `markdownPathForRoute` and of the code page language keys because Deno bundles it separately. Tests check that the copies match [`markdown-path.mjs`](markdown-path.mjs) and `LANGUAGES` in [`code-pages.mjs`](code-pages.mjs).
- `netlify deploy --no-build` deploys only edge functions declared in `netlify.toml`, and ignores the `config` export in the function file. A test checks that the `path` and `excludedPath` in both places match.
- [`src/theme/Mermaid/index.js`](../../theme/Mermaid/index.js) repeats the `data-markdown-source` and `data-markdown-content` attribute names instead of importing them: importing `html-to-markdown.mjs` would add its Markdown dependencies to the browser bundle.
