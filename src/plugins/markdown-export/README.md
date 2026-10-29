# Markdown export

Every docs page at `https://docs.weaviate.io/<route>` has a Markdown version at `https://docs.weaviate.io/<route>.md`, written at build time for agents and LLM tools. For example, `/weaviate/search/basics` has `/weaviate/search/basics.md`.

Each file starts with front matter (`title`, `description`, `url`), followed by the page body: headings, prose, tables, admonitions as GitHub alerts, every code tab variant under its label, Mermaid source, and images linked to their original files. The full list of conversion rules is in the `convertDocPage` doc comment in [`html-to-markdown.mjs`](html-to-markdown.mjs).

## How agents find the Markdown

| Mechanism | Where |
|---|---|
| `<link rel="alternate" type="text/markdown" href="/<route>.md">` in each docs page's `<head>` | `MarkdownAlternate` in [`src/theme/DocItem/Layout/index.js`](../../theme/DocItem/Layout/index.js) |
| A visually hidden notice on each docs page that names the `.md` URL | Same component |
| A request for the normal page URL with `Accept: text/markdown` returns the Markdown | [`netlify/edge-functions/markdown-negotiation.ts`](../../../netlify/edge-functions/markdown-negotiation.ts), declared in `netlify.toml` |

The edge function also sets `Content-Type: text/markdown`, `X-Robots-Tag: noindex` and a canonical `Link` header on `.md` responses. Claude Code's web fetch tool sends `Accept: text/markdown, text/html, */*`, so it gets Markdown from the normal page URL.

## Check the output locally

Build the site, then open a page's `.md` file in the build folder:

```bash
yarn build
less build/weaviate/search/basics.md
```

The build log reports the result:

```
[markdown-export] Wrote 393 Markdown files in 6.7s; skipped 19 routes without a docs body.
```

Routes without a docs body (tag listings, the 404 page, the REST API reference) are skipped. If a docs page fails to convert, the build fails with an error that names the page URL.

## Run the tests

```bash
node --test "src/plugins/markdown-export/*.test.mjs"
```

CI runs these in `.github/workflows/pull_requests.yaml`. The converter tests use HTML fixtures in [`fixtures/`](fixtures), which are trimmed copies of real build output. When a component's rendered markup changes, refresh the affected fixture from a new build so the tests keep matching what the site renders.

The edge function tests use a fake Netlify context. They cannot show that Netlify deploys the function; check that on a deploy preview with:

```bash
curl -sI -H "Accept: text/markdown" https://<preview>.netlify.app/weaviate/search/basics
```

The response should have `content-type: text/markdown; charset=utf-8`.

## Change the conversion

- **Remove UI text from the Markdown:** add `data-copy-exclude` to the element in its React component. The "Copy page" button in `src/components/ContextualMenu` honors the same marker.
- **Add content that only the Markdown needs:** render it as `<pre hidden data-markdown-source="<kind>">` and handle that kind in `html-to-markdown.mjs`. [`src/theme/Mermaid/index.js`](../../theme/Mermaid/index.js) does this for diagram source, because Mermaid draws diagrams in the browser and the built HTML has none.
- **Handle new rendered markup:** add a rewrite in `rewriteForMarkdown`, a fixture that contains the markup, and a test.

## Constraints

- The edge function keeps its own copy of `markdownPathForRoute` because Deno bundles it separately. A test checks that the copy matches [`markdown-path.mjs`](markdown-path.mjs).
- `netlify deploy --no-build` deploys only edge functions declared in `netlify.toml`, and ignores the `config` export in the function file. A test checks that the `path` and `excludedPath` in both places match.
- [`src/theme/Mermaid/index.js`](../../theme/Mermaid/index.js) repeats the `data-markdown-source` attribute name instead of importing it: importing `html-to-markdown.mjs` would add its Markdown dependencies to the browser bundle.
