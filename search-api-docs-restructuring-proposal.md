<!--
DRAFT, not published, pending sign-off.
This file sits at the repository root, OUTSIDE the Docusaurus content root (`docs/docs/`),
so it is never built into the site. It is an internal planning document.
It describes changes; it does NOT implement them. Nothing here has been applied to
`sidebars.js` or to any published page.
-->

# DRAFT: Search API docs restructuring proposal

**DRAFT, not published, pending sign-off. Internal planning document. Implements nothing.**

## Purpose

Describe, without implementing, how the Weaviate search documentation could be restructured
so that the official clients (over gRPC) and the REST Search API become the primary,
front-and-center query paths, while the GraphQL reference is clearly scoped and
cross-linked rather than the default landing point.

The driver is positive: Weaviate now offers two strong query paths alongside GraphQL. The
official clients over gRPC give typed, generated clients and strong performance, and the
REST Search API gives native-JSON request bodies with reach into HTTP-only stacks that
gRPC cannot serve. The documentation should surface these as the primary choices. This is a
documentation-structure change. Any future change to GraphQL itself is a separate
leadership decision and is out of scope here.

Companion seed document (unbuilt draft):
`docs/weaviate/api/graphql/_drafts/choosing-a-search-api.md`.

## Target information architecture

Today the search reference is organized under a single category whose label leads with
GraphQL:

- `Search API - GraphQL/gRPC` (category)
  - Object-level queries (`get`)
  - Aggregate
  - Search operators
  - Conditional filters
  - Additional operators
  - Additional properties
  - Explore

The proposed end-state is a unified **Search** section where the client/gRPC path and the
REST Search API are primary, and GraphQL is a clearly labeled reference that is
cross-linked rather than the default:

- **Search** (category)
  - **Choosing a search API** (the decision aid; seeded from the `_drafts` comparison)
  - **Clients over gRPC** (primary; links to the client-libraries and gRPC references)
  - **REST Search API** (the HTTP-only alternative; labeled as a subset and, while it
    remains so, as experimental)
  - **GraphQL reference** (scoped; retains `get`, `aggregate`, `search-operators`,
    `filters`, `additional-operators`, `additional-properties`, `explore`, with a neutral
    cross-link up to "Choosing a search API")
  - **GraphQL to REST/gRPC migration** (the migration page; seeded from the cheat-sheet in
    the `_drafts` comparison)

The intent is ordering and framing, not deletion. Every existing GraphQL page keeps its URL
and its content in this end-state. The GraphQL reference is repositioned in prominence, not
removed.

## How `sidebars.js` WOULD change (description only; do NOT make this edit)

The relevant block today lives in `sidebars.js` inside the API sidebar, roughly:

```
{
  type: "category",
  label: "Search API - GraphQL/gRPC",
  link: { type: "doc", id: "weaviate/api/graphql/index" },
  items: [
    "weaviate/api/graphql/get",
    "weaviate/api/graphql/aggregate",
    "weaviate/api/graphql/search-operators",
    "weaviate/api/graphql/filters",
    "weaviate/api/graphql/additional-operators",
    "weaviate/api/graphql/additional-properties",
    "weaviate/api/graphql/explore",
  ],
},
```

The eventual edit (to be made later, under sign-off, not now) would:

1. Rename the category label from `Search API - GraphQL/gRPC` to a neutral `Search`.
2. Add, above the GraphQL items, entries for the new primary pages: the "Choosing a search
   API" decision aid, a "Clients over gRPC" entry, and a "REST Search API" entry.
3. Nest the existing GraphQL entries under a `GraphQL reference` sub-grouping so they read
   as one reference among several, rather than as the whole of search.
4. Add a `GraphQL to REST/gRPC migration` entry once that page exists.

No IDs are removed and no page files are moved in this plan, so the change stays reversible:
reverting the label and re-flattening the `items` array restores today's structure exactly.

This proposal does NOT make any of these edits. It only describes them.

## Future "GraphQL to REST/gRPC migration" page

A dedicated migration page would be seeded from the cheat-sheet already drafted in
`docs/weaviate/api/graphql/_drafts/choosing-a-search-api.md` (the near-text GraphQL to REST
field mapping table plus the response-shape note). That draft is the seed; the migration
page would expand it into worked before-and-after examples, and would grow the mapping as
the bm25, hybrid, near-object, and aggregate endpoints land.

## Staged, reversible rollout

Each phase is additive and reversible. No phase moves or deletes a published page.

**Phase 0 (now).** The two `_drafts` seeds stay unbuilt. Nothing is published, and
`sidebars.js` is untouched. This is a staging phase only.

**Phase 1 (at REST Search API GA).** Publish the "Choosing a search API" comparison and the
"GraphQL to REST/gRPC migration" page, and reframe the search sidebar so the clients over
gRPC and the REST Search API read as the primary paths and the GraphQL reference is scoped
and cross-linked. This is the phase where the `sidebars.js` reframe described above would
land. Existing GraphQL pages keep their URLs and content.

Any future change to GraphQL itself is a separate leadership decision and is out of scope
for this document.

## What must NOT be done yet

Until sign-off moves us past Phase 0, the following are explicitly out of bounds:

- **No sidebar reordering.** `sidebars.js` is not to be edited. The "how it would change"
  section above is a description, not a change.
- **No moving or renaming published pages.** Every current GraphQL reference page keeps its
  path and content.
- **No deprecation notices.** No "deprecated", "sunset", "end of life", or "will be
  removed" language on any published page, and no commentary on the future of GraphQL.
- **No publishing of the `_drafts` seeds.** They remain under an underscore-prefixed folder,
  excluded from the build, until sign-off.
- **No timeline claims.** No dates anywhere.

## Fact-check status of the seed draft

The near-text facts in the seed draft (`choosing-a-search-api.md`) are confirmed against
shipped source (origin/stable/v1.38, which carries PR #12227): camelCase request-body
fields; the endpoint `POST /v1/search/{collection}/near-text`; the response wrapper
`{ "results": [...], "tookMs": <number> }` with per-hit `id` / `properties` / `references`
/ `metadata` envelopes; near-text as the one merged operator with bm25, hybrid, near-object,
and aggregate on the way; and the gRPC-Web TypeScript preview as an early-access branch
install rather than a published package. No open verification markers remain in the seed
draft.
