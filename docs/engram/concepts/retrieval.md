---
title: Retrieval
sidebar_position: 7
description: "Engram retrieval types: vector, BM25, and hybrid search strategies."
---

Engram supports three search strategies for finding relevant memories:

| Type | Description | Best for |
|------|-------------|----------|
| `vector` | Pure semantic search using embeddings | Finding conceptually related memories |
| `bm25` | Full-text keyword search | Exact term matching |
| `hybrid` | Combination of vector and BM25 | General-purpose search (recommended) |

You specify the retrieval type in the `retrieval_config` when searching.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
