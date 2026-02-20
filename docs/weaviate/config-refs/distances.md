---
title: Distance metrics
description: "Distance metric options for vector similarity calculations and search result ranking algorithms."
image: og/docs/configuration.jpg
---

import SkipLink from '/src/components/SkipValidationLink'

## Available distance metrics

If not specified explicitly, the default distance metric in Weaviate is
`cosine`. It can be [set in the vectorIndexConfig](/weaviate/config-refs/indexing/vector-index.mdx#hnsw-index) field as part of the schema ([example](../manage-collections/vector-config.mdx#specify-a-distance-metric)) to any of the following types:

:::tip Comparing distances
In all cases, larger distance values indicate lower similarity. Conversely, smaller distance values indicate higher similarity.
:::

<!-- TODO: Consider removing {:.text-nowrap} -->

| Name                                                       | Description                                                                                                                        | Definition                                                                             | Range                                                         | Examples                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| <span style={{ whiteSpace: 'nowrap' }}>`cosine`</span>     | Cosine (angular) distance. <br/><sub>[See note 1 below]</sub>                                                                      | <span style={{ whiteSpace: 'nowrap' }}>`1 - cosine_sim(a,b)`</span>                    | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d <= 2`</span>   | `0`: identical vectors<br/><br/> `2`: Opposing vectors.           |
| <span style={{ whiteSpace: 'nowrap' }}>`dot`</span>        | A dot product-based indication of distance. <br/><br/>More precisely, the negative dot product. <br/><sub>[See note 2 below]</sub> | <span style={{ whiteSpace: 'nowrap' }}>`-dot(a,b)`</span>                              | <span style={{ whiteSpace: 'nowrap' }}>`-∞ < d < ∞`</span>    | `-3`: more similar than `-2` <br/><br/>`2`: more similar than `5` |
| <span style={{ whiteSpace: 'nowrap' }}>`l2-squared`</span> | The squared euclidean distance between two vectors.                                                                                | <span style={{ whiteSpace: 'nowrap' }}>`sum((a_i - b_i)^2)`</span>                     | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d < ∞`</span>    | `0`: identical vectors                                            |
| <span style={{ whiteSpace: 'nowrap' }}>`hamming`</span>    | Number of differences between vectors at each dimensions.                                                                          | <span style={{ whiteSpace: 'nowrap' }}><code>sum(&#124;a_i != b_i&#124;)</code></span> | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d < dims`</span> | `0`: identical vectors                                            |
| <span style={{ whiteSpace: 'nowrap' }}>`manhattan`</span>  | The distance between two vector dimensions measured along axes at right angles.                                                    | <span style={{ whiteSpace: 'nowrap' }}><code>sum(&#124;a_i - b_i&#124;)</code></span>  | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d < ∞`</span>    | `0`: identical vectors                                            |

If you're missing your favorite distance type and would like to contribute it to Weaviate, we'd be happy to review your [PR](https://github.com/weaviate/weaviate).

:::note Additional notes

1. If `cosine` is chosen, all vectors are normalized to length 1 at read time and dot product is used to calculate the distance for computational efficiency.
2. Dot Product on its own is a similarity metric, not a distance metric. As a result, Weaviate returns the negative dot product to stick with the intuition that a smaller value of a distance indicates a more similar result and a higher distance value indicates a less similar result.
3. The [HFresh index](/weaviate/config-refs/indexing/vector-index.mdx#hfresh-index) only supports `cosine` and `l2-squared` distance metrics.

:::

## Distance implementations and optimizations

On a typical Weaviate use case the largest portion of CPU time is spent calculating vector distances. Even with an approximate nearest neighbor index - which leads to far fewer calculations - the efficiency of distance calculations has a major impact on [overall performance](/weaviate/benchmarks/ann.md).

Weaviate uses SIMD (Single Instruction, Multiple Data) instructions for the following distance metrics and architectures. The available optimizations are resolved in the shown order (e.g. SVE -> Neon).

| Distance                      | `arm64`     | `amd64`                                       |
| ----------------------------- | ----------- | --------------------------------------------- |
| `cosine`, `dot`, `l2-squared` | SVE or Neon | Sapphire Rapids with AVX512, or Any with AVX2 |
| `hamming`, `manhattan`        | No SIMD     | No SIMD                                       |

If you like dealing with Assembly programming, SIMD, and vector instruction sets we would love to receive your contribution for one of the combinations that have not yet received an SIMD-specific optimization.

## Distance fields in the APIs

The `distance` is exposed in the APIs in two ways:

- Whenever a [vector search](../search/similarity.md#set-a-similarity-threshold) is involved, the distance can be displayed as part of the results, for example using <span style={{ whiteSpace: 'nowrap' }}>`_additional { distance }`</span>
- Whenever a [vector search](../search/similarity.md#set-a-similarity-threshold) is involved, the distance can be specified as a limiting criterion, for example using <span style={{ whiteSpace: 'nowrap' }}>`nearVector({distance: 1.5, vector: ... })`</span>

## Distance vs Certainty

Prior to version `v1.14` only `certainty` was available in the APIs. The
original ideas behind certainty was to normalize the distance score into a
value between `0 <= certainty <= 1`, where 1 would represent identical vectors
and 0 would represent opposite vectors.

This concept is however unique to `cosine` distance. With other distance
metrics, scores may be unbounded. As a result the preferred way is to use
`distance` in favor of `certainty`.

For backward compatibility, `certainty` can still be used when the distance is
`cosine`. If any other distance is selected `certainty` cannot be used.

See also [Search API: Additional properties (metadata)](../api/graphql/additional-properties.md).

## Further resources

- [How-to: Manage collections](../manage-collections/index.mdx)
- <SkipLink href="/weaviate/api/rest#tag/schema">REST API: Collection definition (schema)</SkipLink>
- [Concepts: Data structure](../concepts/data.md)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
