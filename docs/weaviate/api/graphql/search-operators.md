---
title: Search operators
sidebar_position: 20
description: "GraphQL search operators reference: variable tables, operator availability, and type definitions."
image: og/docs/api.jpg
# tags: ['graphql', 'search operators']
---

import SearchOperators from '/_includes/feature-notes/search-operators.mdx';

This page covers the search operators that can be used in queries, such as vector search operators (`nearText`, `nearVector`, `nearObject`, etc), keyword search operator (`bm25`), hybrid search operator (`hybrid`).

Only one search operator can be added to queries on the collection level.

## Operator availability

### Built-in operators

These operators are available in all Weaviate instances regardless of configuration.

* [nearVector](#nearvector)
* [nearObject](#nearobject)
* [hybrid](#hybrid)
* [bm25](#bm25)

### Module-specific operators

By adding relevant modules, you can use the following operators:
* [nearText](#neartext)
* [Multimodal search](#multimodal-search)
* [ask](#ask)

## Vector search operators

`nearXXX` operators find data objects based on vector similarity. The query can be a raw vector (`nearVector`), an object UUID (`nearObject`), a text query (`nearText`), an image (`nearImage`), or another media input.

All vector search operators support `certainty` or `distance` thresholds, as well as [`limit`](./additional-operators.md#limit-argument) and [`autocut`](./additional-operators.md#autocut).

:::tip How-to guide
For usage examples with multi-language code snippets, see [Vector similarity search](../../search/similarity.md).
:::


### nearVector

`nearVector` finds data objects closest to an input vector.

| Variable | Required | Type | Description |
| --- | --- | --- | --- |
| `vector` | yes | `[float]` | An array of floats matching the collection vector length. |
| `distance` | no | `float` | The maximum allowed distance to the provided search input. Cannot be used together with the `certainty` variable. The interpretation of the value of the distance field depends on the [distance metric used](/weaviate/config-refs/distances.md). |
| `certainty` | no | `float` | Normalized Distance between the result item and the search vector. Normalized to be between 0 (perfect opposite) and 1 (identical vectors). Can't be used together with the `distance` variable. |


### nearObject

`nearObject` finds data objects closest to an existing object in the same collection, specified by UUID.

* Note: You can specify an object's `id` or `beacon` in the argument, along with a desired `certainty`.
* Note that the first result will always be the object used for search.

| Variable | Required | Type | Description |
| --- | --- | --- | --- |
| `id` | yes | `UUID` | Data object identifier in the uuid format. |
| `beacon` | no | `url` | Data object identifier in the beacon URL format. E.g., `weaviate://<hostname>/<kind>/id`. |
| `distance` | no | `float` | The maximum allowed distance to the provided search input. Cannot be used together with the `certainty` variable. The interpretation of the value of the distance field depends on the [distance metric used](/weaviate/config-refs/distances.md). |
| `certainty` | no | `float` | Normalized Distance between the result item and the search vector. Normalized to be between 0 (perfect opposite) and 1 (identical vectors). Can't be used together with the `distance` variable. |


### nearText

`nearText` finds data objects based on vector similarity to a natural language query. Requires a compatible vectorizer module (`text2vec` or `multi2vec`).

| Variable | Required | Type | Description |
| --- | --- | --- | --- |
| `concepts` | yes | `[string]` | An array of strings that can be natural language queries, or single words. If multiple strings are used, a centroid is calculated and used. Learn more about how the concepts are parsed [here](#concept-parsing). |
| `distance` | no | `float` | The maximum allowed distance to the provided search input. Cannot be used together with the `certainty` variable. The interpretation of the value of the distance field depends on the [distance metric used](/weaviate/config-refs/distances.md). |
| `certainty` | no | `float` | Normalized Distance between the result item and the search vector. Normalized to be between 0 (perfect opposite) and 1 (identical vectors). Can't be used together with the `distance` variable. |
| `autocorrect` | no | `boolean` | Autocorrect input text values. Requires the [`text-spellcheck` module](../../modules/spellcheck.md) to be present & enabled.  |
| `moveTo` | no | `object{}` | Move your search term closer to another vector described by keywords |
| `moveTo{concepts}`| no | `[string]` | An array of strings - natural language queries or single words. If multiple strings are used, a centroid is calculated and used. |
| `moveTo{objects}`| no | `[UUID]` | Object IDs to move the results to. This is used to "bias" NLP search results into a certain direction in vector space. |
| `moveTo{force}`| no | `float` | The force to apply to a particular movement. Must be between 0 and 1 where 0 is equivalent to no movement and 1 is equivalent to largest movement possible. |
| `moveAwayFrom` | no | `object{}` | Move your search term away from another vector described by keywords |
| `moveAwayFrom{concepts}`| no | `[string]` | An array of strings - natural language queries or single words. If multiple strings are used, a centroid is calculated and used. |
| `moveAwayFrom{objects}`| no | `[UUID]` | Object IDs to move the results from. This is used to "bias" NLP search results into a certain direction in vector space. |
| `moveAwayFrom{force}`| no | `float` | The force to apply to a particular movement. Must be between 0 and 1 where 0 is equivalent to no movement and 1 is equivalent to largest movement possible. |

For `moveTo`/`moveAwayFrom` usage examples, see [Bias results with moveTo / moveAwayFrom](../../search/similarity.md#bias-results-with-moveto--moveawayfrom).

#### Concept parsing

A `nearText` query interprets each term in the array input as a distinct string to be vectorized. If multiple strings are passed, the query vector will be an average vector of the individual string vectors.

- `["New York Times"]` = one vector position is determined based on the occurrences of the words
- `["New", "York", "Times"]` = all concepts have a similar weight.
- `["New York", "Times"]` = a combination of the two above.

A practical example would be: `concepts: ["beatles", "John Lennon"]`

#### Semantic Path

*Only available with the `txt2vec-contextionary` module.*

The semantic path returns an array of concepts from the query to the data object, showing which steps Weaviate took and how the query and data object are interpreted.

| Property | Description |
| --- | --- |
| `concept` | the concept that is found in this step. |
| `distanceToNext` | the distance to the next step (null for the last step). |
| `distanceToPrevious` | this distance to the previous step (null for the first step). |
| `distanceToQuery` | the distance of this step to the query. |
| `distanceToResult` | the distance of the step to this result. |

_Note: Building a semantic path is only possible if a [`nearText: {}` operator](#neartext) is set as the explore term represents the beginning of the path and each search result represents the end of the path. Since `nearText: {}` queries are currently exclusively possible in GraphQL, the `semanticPath` is therefore not available in the REST API._

### Multimodal search

Depending on the vectorizer module, you can use additional modalities such as images, audio, or video as the query.

Some modules, such as `multi2vec-clip` and `multi2vec-bind` allow you to search across modalities. For example, you can search for images using a text query, or search for text using an image query.

For more information on which modules support multimodal search, see the [Model provider integrations](../../model-providers/index.md#model-provider-integrations)


## hybrid

Combines [BM25](#bm25) and vector search results using a fusion algorithm.

:::tip How-to guide
For usage examples, fusion algorithm details, and multi-language code snippets, see [Hybrid search](../../search/hybrid.md).
:::

### Variables

| Variable    | Required | Type       | Description                                                                 |
|--------------|----------|------------|-----------------------------------------------------------------------------|
| `query`      | yes      | `string`   | Search query.                                                                |
| `alpha`      | no       | `float`    | Weighting for each search algorithm, default 0.75.                           |
| `vector`     | no       | `[float]`  | Optional custom vector.                                          |
| `properties` | no       | `[string]` | List of properties to limit the BM25 search to. Default: all text properties. |
| `fusionType` | no       | `string` | `rankedFusion` or `relativeScoreFusion` (v1.20.0+).              |
| `bm25SearchOperator` | no | `object` | Token match requirements for the BM25 portion (v1.31.0+). |

* Notes:
    * `alpha` can be any number from 0 to 1, defaulting to 0.75.
        * `alpha` = 0 forces using a pure **keyword** search method (BM25)
        * `alpha` = 1 forces using a pure **vector** search method
        * `alpha` = 0.5 weighs the BM25 and vector methods evenly
    * `fusionType` can be `rankedFusion` or `relativeScoreFusion`
        * `rankedFusion` (default) adds inverted ranks of the BM25 and vector search methods
        * `relativeScoreFusion` adds normalized scores of the BM25 and vector search methods

### Fusion algorithms

#### Ranked fusion

The `rankedFusion` algorithm is Weaviate's original hybrid fusion algorithm.

In this algorithm, each object is scored according to its position in the results for that search (vector or keyword). The top-ranked objects in each search get the highest scores. Scores decrease going from top to least ranked. The total score is calculated by adding the rank-based scores from the vector and keyword searches. The score is equal to `1/(RANK + 60)`.

#### Relative score fusion

In `relativeScoreFusion` the vector search and keyword search scores are scaled between `0` and `1`. The highest raw score becomes `1` in the scaled scores. The lowest value is assigned `0`. The remaining values are ranked between `0` and `1`. The total score is a scaled sum of the normalized vector similarity and normalized BM25 scores.

For a fuller discussion of fusion methods, see [this blog post](https://weaviate.io/blog/hybrid-search-fusion-algorithms).

### Oversearch with `relativeScoreFusion`

When `relativeScoreFusion` is used as the `fusionType` with a small search `limit`, a result set can be very sensitive to the limit parameter due to the normalization of the scores.

To mitigate this effect, Weaviate automatically performs a search with a higher limit (100) and then trims the results down to the requested limit.

### BM25 search operator

<SearchOperators/>

Use `bm25SearchOperator` to set how many of the query tokens must be present in the target object for it to be considered a match in the keyword (bm25) search portion of the hybrid search.

The available options are `And`, or `Or`. If `Or` is set, an additional parameter `minimumOrTokensMatch` must be specified, which defines how many of the query tokens must match for the object to be considered a match.

If not set, the keyword search will behave as if `Or` was set with `minimumOrTokensMatch` equal to 1.

### Metadata response

Hybrid results include a fused `score` and optional `explainScore` metadata.


## BM25

The `bm25` operator performs a keyword (sparse vector) search using the BM25F ranking function. The search is case-insensitive, stop words are removed. [Stemming is not supported yet](https://github.com/weaviate/weaviate/issues/2439).

:::tip How-to guide
For usage examples and multi-language code snippets, see [Keyword search](../../search/bm25.md).
:::

### Variables

| Variable | Required | Description |
| --- | --- | --- |
| `query`   | yes      | The keyword search query. |
| `properties` | no    | Properties to search in. Default: all text properties. Supports boosting (e.g. `"title^3"`). |
| `searchOperator` | no | Token match requirements (v1.31.0+). |

### Schema configuration

The free parameters [`k1` and `b`](https://en.wikipedia.org/wiki/Okapi_BM25#The_ranking_function) are configurable. See the [inverted index reference](../../config-refs/indexing/inverted-index.mdx#bm25).

### Metadata response

The BM25F `score` metadata can be retrieved in the response. A higher score indicates higher relevance.

### Search operator

<SearchOperators/>

Use `searchOperator` to set how many of the query tokens must be present in the target object for it to be considered a match.

The available options are `And`, or `Or`. If `Or` is set, an additional parameter `minimumOrTokensMatch` must be specified, which defines how many of the query tokens must match for the object to be considered a match.

If not set, the keyword search will behave as if `Or` was set with `minimumOrTokensMatch` equal to 1.

:::info Boosting properties
Specific properties can be boosted by a factor specified as a number after the caret sign, for example `properties: ["title^3", "summary"]`.
:::


## ask (legacy)

:::caution Outdated
The `ask` operator is a legacy feature. For question answering over your Weaviate data, use the [Weaviate Query Agent](/agents/query) instead.
:::

<details>
  <summary><code>ask</code> operator reference</summary>

Enabled by the module: [Question Answering](/weaviate/modules/qna-transformers.md).

This operator allows you to return answers to questions by running the results through a Q&A model.

#### Variables

| Variable | Required | Type | Description |
| --- | --- | --- | --- |
| `question` | yes | `string` | The question to be answered. |
| `certainty` | no | `float` | Desired minimal certainty or confidence of answer to the question. The higher the value, the stricter the search becomes. The lower the value, the fuzzier the search becomes. If no certainty is set, any answer that could be extracted will be returned. |
| `properties` | no | `[string]` | The properties of the queries collection which contains text. If no properties are set, all are considered. |
| `rerank` | no | `boolean` | If enabled, the qna module will rerank the result based on the answer score. For example, if the 3rd result - as determined by the previous (semantic) search contained the most likely answer, result 3 will be pushed to position 1, etc. |

#### Metadata response

The `answer` and a `certainty` can be retrieved.

</details>


## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
