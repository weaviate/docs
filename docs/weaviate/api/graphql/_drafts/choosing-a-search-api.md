---
title: Choosing a search API
draft: true
---

**DRAFT, not published, pending sign-off.**

<!--
DRAFT, not published, pending sign-off.
This file lives under `_drafts/` so Docusaurus does not build it (underscore-prefixed
folders are excluded from the docs plugin). Do NOT add it to `sidebars.js`.
The near-text field casing, response shape, and merged-endpoint set below are confirmed
against shipped source (origin/stable/v1.38, which carries PR #12227). The gRPC-Web
TypeScript preview is an early-access branch install (`@weaviate/web`, TS PR #307) around
the 1.39 release, not yet a published package.
Companion proposal at the repo root: `search-api-docs-restructuring-proposal.md`.
-->

# Choosing a search API

## Which query API should I use, and why

Weaviate exposes the same search capabilities through more than one wire protocol. This
page is a decision aid: it tells you which one to reach for, and states plainly what each
one can and cannot do. The short version:

- If you can run one of the official client libraries, use it. It talks to Weaviate over
  gRPC and is the primary, full-parity path, with typed generated clients and strong
  on-the-wire performance.
- If your stack can only reach Weaviate over plain HTTP, the REST Search API is the
  fallback. It takes native-JSON request bodies with no URL encoding, and it is a
  deliberate subset that is experimental today.
- GraphQL is the established query API. It remains available and covers the full query
  surface. Use it where it already fits your stack.

## When to use which

| Path | Reach for it when | Coverage | Status |
|---|---|---|---|
| **Official client library over gRPC** | You can run one of the official clients (Python, JS/TS, Go, Java, C#), including edge and serverless JavaScript through the gRPC-Web preview. | Full parity. This is the primary path. | Stable, recommended default. |
| **REST Search API** | Your stack reaches Weaviate over plain HTTP and cannot use gRPC: no-code platforms, BI tools, and languages with no official client (for example PHP, Ruby). | Deliberate subset. This is a fallback. | Experimental, off by default. Near-text available now, more operators on the way. |
| **GraphQL** | You already query over GraphQL, or you want one flexible query language that covers the full surface today. | Established, full-featured. | Available. |

The gRPC-Web path for edge and serverless JavaScript is early access. Around the 1.39
release it is available by installing the `@weaviate/web` package from the gRPC-Web preview
branch, rather than as a published release. Treat it as preview until a package release
follows.

### What each path is good at

- **Official client over gRPC:** typed, generated clients (request and response shapes are
  code, not hand-built strings) and strong on-the-wire performance. This is the fastest
  path to correct, maintainable queries.
- **REST Search API:** native-JSON request bodies with no URL encoding of filters or
  queries, and reach into places gRPC cannot go (no-code platforms, BI tools, and
  HTTP-only languages).

## GraphQL to REST field mapping (near-text)

The REST Search API uses camelCase request-body fields. The near-text operator is available
now at `POST /v1/search/{collection}/near-text` (the collection sits in the middle of the
path, and the operator is kebab-case). The mapping from the GraphQL near-text form:

| GraphQL (near-text) | REST request-body field |
|---|---|
| nearText concepts ["x","y"] | "query": ["x", "y"] |
| nearText targetVectors ["title_vec"] | "targetVector": "title_vec" |
| where {WhereFilter} | "where": { same JSON, unencoded } |
| field selection title, hasAuthor.name | "returnProperties": ["title", "hasAuthor.name"] |
| _additional { distance score } | "returnMetadata": ["distance", "score"] |
| autocut | "autoLimit" |
| tenant | "tenant" |
| consistencyLevel | "consistencyLevel" |
| generate singleResult { prompt } / groupedResult { task } | "singlePrompt" / "groupedTask" |

Notes on the mapping:

- `id` is returned at the top level of each hit, not inside `returnMetadata`. Do not put
  `"id"` in `returnMetadata`.
- The metadata names available in `returnMetadata` (camelCase) are: `distance`,
  `certainty`, `score`, `explainScore`, `creationTime`, `lastUpdateTime`.
- `singlePrompt` and `groupedTask` are reserved: the retrieval-augmented generation (RAG)
  parameters are accepted in the schema but currently return `422` not-yet-supported.
- The bm25 and hybrid operators (with their query-properties, alpha, and fusion-type
  controls) arrive with those endpoints. Their exact request-field names are fixed when
  those endpoints land, so they are not listed here yet.

### Response shape

The REST response drops the GraphQL `data.Get.<Collection>` envelope. The top-level wrapper
is a `results` array plus a `tookMs` timing field, and each hit is an envelope:

```json
{
  "results": [
    {
      "id": "<uuid>",
      "properties": { },
      "references": { },
      "metadata": { }
    }
  ],
  "tookMs": 0
}
```

Selected data properties sit under `properties`, one hop of references under `references`,
and retrieval metadata under `metadata` (no leading underscore). `id` is always present at
the top level of each hit. Compared with GraphQL, `_additional` becomes `metadata`, and
there is no snake_case form anywhere: it is `metadata`, not `_metadata`, and `tookMs`, not
`took_ms`.

## What the REST Search API does not do

State these plainly to any reader evaluating REST as an alternative:

- It is **currently experimental and off by default**. Endpoints are opt-in.
- It is **POST-only** right now.
- It is **growing**. Near-text is available now; bm25, hybrid, near-object, and aggregate
  are on the way; the RAG parameters (`singlePrompt` / `groupedTask`) are reserved and
  currently return `422` not-yet-supported.
- It **deliberately does not cover** the following. These are intentional scope-outs, not
  bugs:
  - raw `nearVector`
  - media search (image, audio, and similar)
  - multi-target vector weighting
  - hybrid sub-searches
  - `moveTo` / `moveAway` on near-text
  - vectors returned in metadata
  - multi-hop references (only one hop of references is returned)
  - `Explore`

If you need raw-vector search or media search, use an official client. Those workloads
belong on the clients, not on the REST subset.

## Summary

Use an official client over gRPC when you can: it is the primary, full-parity path, with
typed clients and strong performance. Reach for the REST Search API when your stack cannot
speak gRPC, and expect a growing subset. GraphQL remains available as the established query
language for the cases where it already fits.
