# Markdown export: implementation plan

This file tracks the work on branch `feat/markdown-export`. Delete it before merge; the last checkpoint replaces it with a README for this directory.

## Outcome

After `yarn build`, every docs page at `/<route>` has a Markdown version at `/<route>.md`. The Markdown keeps the page's headings, prose, tables, admonitions, every code tab variant with its label, and Mermaid diagram source. Agents find it in three ways:

- a `<link rel="alternate" type="text/markdown">` tag in each docs page's `<head>`;
- a visually hidden notice on each docs page that names the `.md` URL;
- on Netlify, a request for the normal page URL with `Accept: text/markdown`.

Elastic uses the same `.md` URL scheme, head link and `Accept` handling: `https://www.elastic.co/docs/get-started.md`.

### Non-goals

- Generating `/llms.txt` or `llms-full.txt`. The redirect from `/llms.txt` to `https://weaviate.io/llms.txt` stays.
- Changing the "Copy page" button in `src/components/ContextualMenu`.
- Front matter for Enterprise Edition or Cloud-only badges.
- Markdown files filtered to one code language.
- Pushing the branch, opening a PR, or deploying.

### Must-have behaviors

| ID | Behavior |
|---|---|
| B1 | The build writes one `.md` per docs route, following the contract in `html-to-markdown.mjs`, with no UI text from tooltips, dropdowns, buttons or heading anchors. |
| B2 | Mermaid diagrams appear as `mermaid` fences, and the HTML page still renders the diagram. |
| B3 | Docs pages include the head link and the hidden notice. Pages without a docs body (tags, 404, REST API reference) include neither. |
| B4 | The edge function follows the contract in `netlify/edge-functions/markdown-negotiation.ts`. |
| B5 | The existing pull request checks pass: `validate-redirects.js`, `yarn build-dev` and `validate-links-pr.js`. |

### Exit predicate

On a local `yarn build`, every docs route has a `.md` file. A scan of the output finds no UI text. The 14 pages that use Mermaid contain `mermaid` fences. The fixture tests and edge function tests pass, and B5 passes.

Local checks cannot show that Netlify runs the edge function or sends the response headers. That needs a deploy preview, which requires pushing the branch.

## Interface under review (checkpoint 1)

| File | Contract |
|---|---|
| `markdown-path.mjs` | `markdownPathForRoute(routePath)`: the `.md` URL for a route. Used by the plugin and the head link. |
| `html-to-markdown.mjs` | `convertDocPage({ html, pageUrl, siteUrl })`: output format, conversion rules, `null` for pages without a docs body, and errors. `MARKDOWN_SOURCE_ATTRIBUTE`: the marker for content that exists only for the export. |
| `index.mjs` | The Docusaurus plugin: what `postBuild` writes, which routes it skips, and why a conversion error fails the build. |
| `netlify/edge-functions/markdown-negotiation.ts` | Behavior for each kind of request, the response headers, `prefersMarkdown(accept)`, and the deployment scope. |

Two changes have no new interface, so they are described here instead of scaffolded. A scaffold file under `src/theme/` would take effect as soon as it exists.

**Mermaid wrapper, `src/theme/Mermaid/index.js`.** This wraps `@theme-original/Mermaid` and renders the original component followed by:

```jsx
<pre hidden data-markdown-source="mermaid">{props.value}</pre>
```

The "Copy page" button already removes `[hidden]` elements, so its output does not change.

**Discovery in `src/theme/DocItem/Layout/index.js`.** This adds the following, with `mdPath = markdownPathForRoute(metadata.permalink)`:

```jsx
<Head>
  <link rel="alternate" type="text/markdown" href={mdPath} />
</Head>
```

It also adds a visually hidden notice, outside `.theme-doc-markdown` and styled like the existing notice in `src/theme/Root.js`:

> LLM/AI agent notice: A Markdown version of this page is at https://docs.weaviate.io/weaviate/search/basics.md. Requests for any docs page with `Accept: text/markdown` return Markdown.

## Decisions

Reviewed after checkpoint 1. D2, D3 and D6 were approved. D1, D4 and D5 had no preference, so the recommendation stands.

| # | Decision | Recommendation | Trade-off |
|---|---|---|---|
| D1 | Link targets inside the Markdown | Absolute HTML URLs (`https://docs.weaviate.io/weaviate/search/bm25`) | Elastic does the same, and `Accept` handling serves Markdown at these URLs. Agents that never send the header would follow a link to an HTML page. |
| D2 | A conversion error on one page | Fail the build | Without the file, the page's head link 404s. A converter bug blocks a deploy until someone fixes it or excludes the route. |
| D3 | The edge function's path mapping | A copy, with a test that checks it matches `markdown-path.mjs` | Importing `src/` from a Deno-bundled edge function has not been tested with this site's `netlify deploy --no-build` path. |
| D4 | Module format | ESM (`.mjs`). The plugin is registered as `./src/plugins/markdown-export/index.mjs`. | `unified` and its plugins are ESM-only. `src/remark/remark-replace.js` is CommonJS, so this directory uses a different module format. |
| D5 | Test runner | `node --test`, which adds no dependency. CI runs it in `pull_requests.yaml`. | This is the repository's first JavaScript unit test. The existing JavaScript checks are standalone scripts such as `validate-redirects.js`. |
| D6 | Runtime dependencies | Add `unified`, `rehype-parse`, `rehype-remark`, `remark-gfm`, `remark-stringify`, `hast-util-select`, `hast-util-to-text` and `unist-util-visit` with `yarn add` | They are installed today only because `@signalwire/docusaurus-plugin-llms-txt` depends on them. That plugin is removed in checkpoint 6. |

## Checkpoints

| # | Kind | Primary assertion | Files |
|---|---|---|---|
| 1 | Interface scaffold | The four files above parse and state the contracts. No behavior. | This file, `markdown-path.mjs`, `html-to-markdown.mjs`, `index.mjs`, `netlify/edge-functions/markdown-negotiation.ts` |
| 2 | Production slice | `yarn build` writes `.md` files that meet B1. | `html-to-markdown.mjs`, `markdown-path.mjs`, `index.mjs`, `html-to-markdown.test.mjs`, `fixtures/*.html`, `docusaurus.config.js`, `package.json`, `yarn.lock` |
| 3 | Production slice | B2: Mermaid fences in the Markdown, and the diagram still renders. | `src/theme/Mermaid/index.js` |
| 4 | Production slice | B3: head link and notice on docs pages only. | `src/theme/DocItem/Layout/index.js` |
| 5 | Production slice | B4, tested with a fake Netlify context. | `markdown-negotiation.ts`, its test, `netlify.toml` |
| 6 | Cleanup and docs | B5. Remove the unused signalwire plugin and its commented-out config. | `package.json`, `yarn.lock`, `docusaurus.config.js`, `README.md` in this directory, `.github/workflows/pull_requests.yaml` |

## Permissions and budgets

- Allowed: local commits on `feat/markdown-export`; `yarn add` and `yarn remove` (network access to the npm registry); up to 4 runs of `yarn build` and 1 run of `yarn build-dev` with link validation; one Docker Playwright screenshot of a Mermaid page, served from inside the container.
- Not allowed: push, PR, Netlify deploy, or any other external service.
- Stop and ask when:
  - two iterations in a row make no progress;
  - one checkpoint needs a third repair attempt;
  - build time grows by more than 30 s;
  - `yarn add` changes unrelated entries in `yarn.lock`;
  - the Mermaid wrapper breaks rendering;
  - the output contains UI text that no in-scope rule can remove.

## Evidence

The conversion rules were tested in a throwaway prototype on the Oct 26 local build. It converted 391 pages in 4.5 s and skipped 19 pages without a docs body. A scan of the output found no UI text. The 48.0 MB of HTML became 5.5 MB of Markdown. Mermaid diagrams were missing from that output, which checkpoint 3 addresses.

## Status

| Checkpoint | Status |
|---|---|
| 1 | Reviewed; image rules added to the `convertDocPage` contract |
| 2–6 | Not started |
