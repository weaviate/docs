---
title: Additional operators
sidebar_position: 40
description: "Syntax reference for additional operators that extend query functionality (limits, sorting, grouping, etc.)."
image: og/docs/api.jpg
# tags: ['graphql', 'additional operators']
---

Functions such as `limit`, `autocut`, and `sort` modify queries at the class level.

:::tip How-to guide
For sorting, pagination, and cursor usage examples with multi-language code snippets, see [Sort and paginate](../../search/sort-and-paginate.md).
:::

## Limit argument

The `limit` argument restricts the number of results. Supported by `Get`, `Explore`, and `Aggregate`.

import GraphQLFiltersLimit from '/_includes/code/graphql.filters.limit.mdx';

<GraphQLFiltersLimit/>


## Pagination with `offset`

To return sets of results, "pages", use `offset` and `limit` together to specify a sub-set of the query response.

For example, to list the first ten results, set `limit: 10` and `offset: 0`. To display the next ten results, set `offset: 10`. To continue iterating over the results, increase the offset again. For more details, see [performance considerations](./additional-operators.md#performance-considerations)

The `Get` and `Explore` functions support `offset`.

import GraphQLFiltersOffset from '/_includes/code/graphql.filters.offset.mdx';

<GraphQLFiltersOffset/>

### Performance considerations

Pagination is not a cursor-based implementation. This has the following implications:

- **Response time and system load increase as the number of pages grows**. As the offset grows, each additional page request requires a new, larger call against your collection. For example, if your `offset` and `limit` specify results from 21-30, Weaviate retrieves 30 objects and drops the first 20. On the next call, Weaviate retrieves 40 objects and drops the first 30.
- **Resource requirements are amplified in multi-shard configurations.** Each shard retrieves a full list of objects. Each shard also drops the objects before the offset. If you have 10 shards configured and ask for results 91-100, Weaviate retrieves 1000 objects (100 per shard) and drops 990 of them.
- **The number of objects you can retrieve is limited**. A single query returns up to `QUERY_MAXIMUM_RESULTS`. If the sum of `offset` and `limit` exceeds `QUERY_MAXIMUM_RESULTS`, Weaviate returns an error. To change the limit, edit the `QUERY_MAXIMUM_RESULTS` environment variable. If you increase `QUERY_MAXIMUM_RESULTS`, use the lowest value possible to avoid performance problems.
- **Pagination is not stateful**. If the database state changes between calls, your pages might miss results. An insertion or a deletion will change the object count. An update could change object order. However, if there are no writes the overall results set is the same if you retrieve a large single page or many smaller ones.

For large-scale sequential retrieval, use the [cursor API](#cursor-with-after).


## Autocut

The autocut function limits results based on discontinuities (jumps) in result metrics such as vector distance or search score.

Specify how many jumps to allow. The query stops returning results after that many jumps.

For example, with distances `[0.1899, 0.1901, 0.191, 0.21, 0.215, 0.23]`:

- `autocut: 1`: `[0.1899, 0.1901, 0.191]`
- `autocut: 2`:  `[0.1899, 0.1901, 0.191, 0.21, 0.215]`
- `autocut: 3`:  `[0.1899, 0.1901, 0.191, 0.21, 0.215, 0.23]`

Works with `nearXXX`, `bm25`, and `hybrid` (requires `relativeScoreFusion` for hybrid). Disabled by default; set to `0` or a negative value to explicitly disable.

If autocut is combined with the limit filter, autocut only considers the first objects returned up to the value of `limit`.

For client code examples:
- [Autocut with similarity search](../../search/similarity.md#limit-result-groups)
- [Autocut with BM25 search](../../search/bm25.md#limit-result-groups)
- [Autocut with hybrid search](../../search/hybrid.md#limit-result-groups)


## Cursor with `after`

The `after` operator retrieves objects sequentially using a cursor based on object IDs. Compatible with single-shard and multi-shard configurations.

`after` only works with list queries. It is **not** compatible with `where`, `near<Media>`, `bm25`, `hybrid`, or similar search operators. For those, use [pagination with `offset`](#pagination-with-offset).

import GraphQLFiltersAfter from '/_includes/code/graphql.filters.after.mdx';

<GraphQLFiltersAfter/>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "_additional": {
            "id": "00313a4c-4308-30b0-af4a-01773ad1752b"
          },
          "title": "Managing Supply Chain Risk"
        },
        {
          "_additional": {
            "id": "0042b9d0-20e4-334e-8f42-f297c150e8df"
          },
          "title": "Playing College Football In Madden"
        },
        {
          "_additional": {
            "id": "0047c049-cdd6-3f6e-bb89-84ae20b74f49"
          },
          "title": "The 50 best albums of 2019, No 3: Billie Eilish \u2013 When We All Fall Asleep, Where Do We Go?"
        },
        {
          "_additional": {
            "id": "00582185-cbf4-3cd6-8c59-c2d6ec979282"
          },
          "title": "How artificial intelligence is transforming the global battle against human trafficking"
        },
        {
          "_additional": {
            "id": "0061592e-b776-33f9-8109-88a5bd41df78"
          },
          "title": "Masculine, feminist or neutral? The language battle that has split Spain"
        }
      ]
    }
  }
}
```

</details>

## Sorting

Sort results by any primitive property (such as `text`, `number`, or `int`). Sorting is **unavailable when using search operators** (which rank by relevance).

### Sorting considerations

Sorting can be applied when fetching objects, but it's **unavailable when using search operators**. Search operators don’t support sorting because they automatically rank results according to factors such as [`certainty` or `distance`](./search-operators.md#vector-search-operators), which reflect the relevance of each result.

Weaviate's sorting implementation does not lead to massive memory spikes. Weaviate does not load all object properties into memory; only the property values being sorted are kept in memory.

Weaviate does not use any sorting-specific data structures on disk. When objects are sorted, Weaviate identifies the object and extracts the relevant properties. This works reasonably well for small scales (100s of thousand or millions of objects). It is expensive if you sort large lists of objects (100s of millions, billions). In the future, Weaviate may add a column-oriented storage mechanism to overcome this performance limitation.

### Sort order

#### Boolean values

`false` is considered smaller than `true`. `false` comes before `true` in ascending order and after `true` in descending order.

#### Null values

`null` values are considered smaller than any non-`null` values. `null` values come first in ascending order and last in descending order.

#### Arrays

Arrays are compared by each element separately. Elements at the same position are compared to each other, starting from the beginning of an array. When Weaviate finds an array element in one array that is smaller than its counterpart in the second array, Weaviate considers the whole first array to be smaller than the second one.

Arrays are equal if they have the same length and all elements are equal. If one array is subset of another array it is considered smaller.

Examples:
- `[1, 2, 3] = [1, 2, 3]`
- `[1, 2, 4] < [1, 3, 4]`
- `[2, 2] > [1, 2, 3, 4]`
- `[1, 2, 3] < [1, 2, 3, 4]`

### Sorting API


The sort function takes either an object, or an array of objects, that describe a property and a sort order.

| Parameter | Required | Type            | Description                                               |
|-----------|----------|-----------------|-----------------------------------------------------------|
| `path`    | yes      | `text`        | Single-element array containing the field name. GraphQL supports specifying the field name directly. |
| `order`   | varies by client | `asc` or `desc` | Sort order, ascending (default) or descending. |

Sorting can be performed by one or more properties. If the values for the first property are identical, Weaviate uses the second property to determine the order, and so on. To sort by more than one property, pass an array of `{ path, order }` objects to the sort function.

### Metadata properties

To sort with metadata, add an underscore to the property name.

| Property Name | Sort Property Name |
| :- | :- |
| `id` | `_id` |
| `creationTimeUnix` | `_creationTimeUnix` |
| `lastUpdateTimeUnix` | `_lastUpdateTimeUnix` |

For sorting code examples, see [Sort and paginate: Sorting](../../search/sort-and-paginate.md#sorting).

## Grouping

You can use a group to combine similar concepts (also known as _entity merging_). There are two ways of grouping semantically similar objects together, `closest` and `merge`. To return the closest concept, set `type: closest`. To combine similar entities into a single string, set `type: merge`.

When using `merge`, the central concept in the group leads the group. Related values follow in parentheses.

### Variables

| Variable | Required | Type | Description |
| --- | --- | --- | --- |
| `type` | yes | `string` | Either `closest` or `merge`. |
| `force` | yes | `float` | The force to apply for a particular movement. Must be between `0` and `1`. `0` is no movement. `1` is maximum movement. |

import GraphQLFiltersGroup from '/_includes/code/graphql.filters.group.mdx';

<GraphQLFiltersGroup/>

The query merges the results for `International New York Times`, `The New York Times Company` and `New York Times`.

The central concept in the group, `The New York Times Company`, leads the group. Related values follow in parentheses.

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Publication": [
        {
          "name": "Fox News"
        },
        {
          "name": "Wired"
        },
        {
          "name": "The New York Times Company (New York Times, International New York Times)"
        },
        {
          "name": "Game Informer"
        },
        {
          "name": "New Yorker"
        },
        {
          "name": "Wall Street Journal"
        },
        {
          "name": "Vogue"
        },
        {
          "name": "The Economist"
        },
        {
          "name": "Financial Times"
        },
        {
          "name": "The Guardian"
        },
        {
          "name": "CNN"
        }
      ]
    }
  }
}
```

</details>

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
