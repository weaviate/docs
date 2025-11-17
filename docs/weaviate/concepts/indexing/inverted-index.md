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

1. **Tokenization**: The text is first tokenized according to the [tokenization method](#tokenization) configured for that property.
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

## Tokenization

Tokenization is the process of breaking text into smaller units called tokens. This process is fundamental to how inverted indexes work - the tokens produced determine what can be searched and how matching occurs.

### How tokenization works

When you add an object to Weaviate, text in each property is tokenized according to that property's configured tokenization method. For example, the text:

'"Ankh-Morpork's police captain"' could be tokenized using different tokenization methods:

1. `'word'`: `["ankh", "morpork", "s", "police", "captain"]` - splits on non-alphanumeric characters, lowercased
2. `'lowercase'`: `["ankh-morpork's", "police", "captain"]` - splits on whitespace only, lowercased
3. `'whitespace'`: `["Ankh-Morpork's", "police", "captain"]` - splits on whitespace, preserves case
4. `'field'`: `["Ankh-Morpork's police captain"]` - treats entire text as single token

Each tokenization method serves different use cases and directly impacts search and filter behavior.

### Tokenization and the inverted index

The inverted index maps each token to the objects containing it. When you perform a keyword search or filter:

1. Your query/filter text is tokenized using the **same method** as the indexed property
2. The inverted index looks up which objects contain those tokens
3. For searches, BM25f ranks results based on token matches
4. For filters, exact token matches determine inclusion

This means the tokenization method controls the "granularity" of matching. For example, with `word` tokenization, searching for `"clark"` will match an object containing `"Clark:"` because both tokenize to `["clark"]`. With `field` tokenization, only exact matches succeed.

### Available tokenization methods

Weaviate provides several tokenization methods optimized for different data types:

**Standard methods:**
- **`word`** (default): Splits on non-alphanumeric characters, lowercases. Best for typical text.
- **`lowercase`**: Splits on whitespace, lowercases. Preserves symbols like `@`, `_`, `-`.
- **`whitespace`**: Splits on whitespace, preserves case and symbols. For case-sensitive data.
- **`field`**: No splitting - entire value is one token. For exact matching.

**Language-specific methods** (for languages without word boundaries):
- **`gse`**: Chinese text segmentation using Jieba algorithm
- **`trigram`**: Splits into character trigrams for CJK languages
- **`kagome_ja`**: Japanese morphological analysis
- **`kagome_kr`**: Korean morphological analysis

See the [tokenization configuration reference](../../config-refs/collections#tokenization) for detailed specifications and behavior examples.

### Impact on search and filtering

#### Filters

Filters perform binary matching - an object either matches or doesn't. Tokenization determines what counts as a match:

| Query | Indexed text | `word` | `lowercase` | `whitespace` | `field` |
|-------|--------------|--------|-------------|--------------|---------|
| `"clark"` | `"Clark:"` | ✅ | ❌ | ❌ | ❌ |
| `"variable_name"` | `"variable_name"` | ✅ | ✅ | ✅ | ✅ |
| `"variable_name"` | `"variable_new_name"` | ✅ | ❌ | ❌ | ❌ |

With `word` tokenization, `"variable_name"` matches `"variable_new_name"` because both contain the tokens `["variable", "name"]`.

#### Keyword searches

Keyword searches use BM25f to rank results. Tokenization affects:

1. **Result inclusion**: Only objects with matching tokens appear
2. **Ranking scores**: More matching tokens = higher scores

For example, searching for `"lois clark"` with `word` tokenization will rank objects containing both words higher than those with just one.

### Stop words

Stop words are common words (like "a", "the", "is") that are typically ignored during search. By default, Weaviate uses a standard English stop words list.

After tokenization, stop words in queries behave as if they're not present for matching purposes:
- Filter for `"a computer mouse"` behaves like `"computer mouse"`
- Stop words still affect BM25f ranking scores

You can [configure custom stop words](../../config-refs/indexing/inverted-index.mdx#stopwords) in your collection definition.

**Note**: With `field` tokenization, stop words don't apply since the entire field is one token.

### Choosing a tokenization method

The choice of tokenization method should match your data characteristics and search requirements. Here are some general guidelines:

- **General text** (articles, descriptions): Use `word` (default)
- **Technical data with symbols** (code, emails): Use `lowercase`
- **Case-sensitive data** (names, acronyms): Use `whitespace`
- **Unique identifiers** (URLs, IDs): Use `field`
- **CJK languages**: Use language-specific methods

For detailed guidance and practical examples, see the [tokenization tutorial](../../tutorials/tokenization.md).

## Further resources

:::info Related pages

- [Configuration: Inverted index](../../config-refs/indexing/inverted-index.mdx)
- [How-to: Configure collections](../../manage-collections/vector-config.mdx#property-level-settings)
- [Configuration: Tokenization](../../config-refs/collections.mdx#tokenization)
- [Tutorial: Configure tokenization](../../tutorials/tokenization.md)

:::

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
