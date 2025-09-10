---
title: Inverted indexes
sidebar_position: 2
description: "Inverted index architecture for efficient keyword search and filtering with performance improvements."
image: og/docs/concepts.jpg
# tags: ['basics']
---

Inverted indexes in Weaviate map values (like words or numbers) to the objects that contain them, enabling fast keyword search and filtering operations.

## How Weaviate creates inverted indexes

Understanding Weaviate's indexing architecture is crucial for optimizing performance and resource usage. Weaviate creates **individual inverted indexes for each property and each index type**. This means:

- Each property in your collection gets its own dedicated inverted index(es)
- Meta properties (like creation timestamps) also get their own separate inverted indexes
- A single property can have multiple inverted indexes if it supports multiple index types
- All aggregations and combinations across properties happen at query time, not at index time

**Example**: A `title` property with both `indexFilterable: true` and `indexSearchable: true` will result in two separate inverted indexes - one optimized for search operations and another for filtering operations.

This architecture provides flexibility and performance optimization but also means that enabling multiple index types increases storage requirements and indexing overhead.

For `text` properties specifically, the indexing process follows these steps:

1. **Tokenization**: The text is first tokenized according to the [tokenization method](../../config-refs/collections.mdx#tokenization) configured for that property.
3. **Index entry creation**: Each processed token gets an entry in the inverted index, pointing to the object containing it.

This process ensures that your text searches and filters can quickly locate relevant objects based on the tokens they contain.

<details>
  <summary>Performance improvements added in Oct 2024</summary>

In Weaviate versions `v1.24.26`, `v1.25.20`, `v1.26.6` and `v1.27.0`, we introduced performance improvements and bugfixes for the BM25F scoring algorithm:

- The BM25 segment merging algorithm was made faster
- Improved WAND algorithm to remove exhausted terms from score computation and only do a full sort when necessary
- Solved a bug in BM25F multi-prop search that could lead to not summing all the query term score for all segments
- The BM25 scores are now calculated concurrently for multiple segments

As always, we recommend upgrading to the latest version of Weaviate to benefit from improvements such as these.

</details>

## BlockMax WAND algorithm

:::info Added in `v1.30`
:::

The BlockMax WAND algorithm is a variant of the WAND algorithm that is used to speed up BM25 and hybrid searches. It organizes the inverted index in blocks to enable skipping over blocks that are not relevant to the query. This can significantly reduce the number of documents that need to be scored, improving search performance.

If you are experiencing slow BM25 (or hybrid) searches and use a Weaviate version prior to `v1.30`, try migrating to a newer version that uses the BlockMax WAND algorithm to see if it improves performance. If you need to migrate existing data from a previous version of Weaviate, follow the [v1.30 migration guide](/deploy/migration/weaviate-1-30.md).

:::note Scoring changes with BlockMax WAND

Due to the nature of the BlockMax WAND algorithm, the scoring of BM25 and hybrid searches may differ slightly from the default WAND algorithm. Additionally BlockMax WAND scores on single and multiple property search may be different due to different IDF and property length normalization calculations. This is expected behavior and is not a bug.

:::

## Configure inverted indexes

There are three inverted index types in Weaviate:

- `indexSearchable` - a searchable index for BM25 or hybrid search
- `indexFilterable` - a match-based index for fast [filtering](../filtering.md) by matching criteria
- `indexRangeFilters` - a range-based index for [filtering](../filtering.md) by numerical ranges

Each inverted index can be set to `true` (on) or `false` (off) on a property level. The `indexSearchable` and `indexFilterable` indexes are on by default, while the `indexRangeFilters` index is off by default.

The filterable indexes are only capable of [filtering](../filtering.md), while the searchable index can be used for both searching and filtering (though not as fast as the filterable index).

So, setting `"indexFilterable": false` and `"indexSearchable": true` (or not setting it at all) will have the trade-off of worse filtering performance but faster imports (due to only needing to update one index) and lower disk usage.

See the [related how-to section](../../manage-collections/vector-config.mdx#property-level-settings) to learn how to enable or disable inverted indexes on a property level.

A rule of thumb to follow when determining whether to switch off indexing is: _if you will never perform queries based on this property, you can turn it off._

#### Inverted index types summary

import InvertedIndexTypesSummary from '/_includes/inverted-index-types-summary.mdx';

<InvertedIndexTypesSummary/>

- Enable one or both of `indexFilterable` and `indexRangeFilters` to index a property for faster filtering.
    - If only one is enabled, the respective index is used for filtering.
    - If both are enabled, `indexRangeFilters` is used for operations involving comparison operators, and `indexFilterable` is used for equality and inequality operations.

This chart shows which filter makes the comparison when one or both index type is `true` for an applicable property.

| Operator | `indexRangeFilters` only | `indexFilterable` only | Both enabled |
| :- | :- | :- | :- |
| Equal | `indexRangeFilters` | `indexFilterable` | `indexFilterable` |
| Not equal | `indexRangeFilters` | `indexFilterable` | `indexFilterable` |
| Greater than | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |
| Greater than equal | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |
| Less than | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |
| Less than equal | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |

#### Inverted index for timestamps

You can also enable an inverted index to search [based on timestamps](/weaviate/config-refs/indexing/inverted-index.mdx#indextimestamps).

Timestamps are currently indexed using the `indexFilterable` index.

## Collections without indexes

If you don't want to set an index at all, this is possible too. To create a collection without any indexes, skip indexing on the collection and on the properties.

<details>
  <summary>Example collection configuration without inverted indexes -  JSON object</summary>

An example of a complete collection object without inverted indexes:

```js
{
    "class": "Author",
    "description": "A description of this collection, in this case, it's about authors",
    "vectorIndexConfig": {
        "skip": true // <== disable vector index
    },
    "properties": [
        {
            "indexFilterable": false,  // <== disable filterable index for this property
            "indexSearchable": false,  // <== disable searchable index for this property
            "dataType": [
                "text"
            ],
            "description": "The name of the Author",
            "name": "name"
        },
        {
            "indexFilterable": false,  // <== disable filterable index for this property
            "dataType": [
                "int"
            ],
            "description": "The age of the Author",
            "name": "age"
        },
        {
            "indexFilterable": false,  // <== disable filterable index for this property
            "dataType": [
                "date"
            ],
            "description": "The date of birth of the Author",
            "name": "born"
        },
        {
            "indexFilterable": false,  // <== disable filterable index for this property
            "dataType": [
                "boolean"
            ],
            "description": "A boolean value if the Author won a nobel prize",
            "name": "wonNobelPrize"
        },
        {
            "indexFilterable": false,  // <== disable filterable index for this property
            "indexSearchable": false,  // <== disable searchable index for this property
            "dataType": [
                "text"
            ],
            "description": "A description of the author",
            "name": "description"
        }
    ]
}
```

</details>

## Further resources

:::info Related pages

- [Configuration: Inverted index](../../config-refs/indexing/inverted-index.mdx)
- [How-to: Configure collections](../../manage-collections/vector-config.mdx#property-level-settings)

:::

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
