---
title: Contextual AI + Weaviate
sidebar_position: 10
image: og/docs/integrations/provider_integrations_generic.jpg
---

Contextual AI provides GLM and reranker models. Weaviate integrates these via the `generative-contextualai` and `reranker-contextualai` modules.

## Integrations with Contextual AI

- Generative AI models for RAG: See the generative guide.
- Reranker models: See the reranker guide.

## Requirements

- Enable the corresponding module(s) in Weaviate: `generative-contextualai` and/or `reranker-contextualai`.
- Provide a Contextual AI API key: set `CONTEXTUAL_API_KEY` for the Weaviate process, or pass at runtime via the `X-Contextual-Api-Key` header.

Optional: Override the base URL via `X-Contextual-Baseurl`.

## Links

- Generative: ./generative.md
- Reranker: ./reranker.md

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


