---
title: Sort and paginate
sidebar_position: 95
image: og/docs/howto.jpg
description: "Sort results by properties, paginate with offset and limit, and use cursor-based iteration with code examples."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/graphql.additional.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/graphql.additional-v3.py';
import TSCode from '!!raw-loader!/_includes/code/graphql.additional.ts';
import GoCode from '!!raw-loader!/_includes/code/graphql.additional.go';
import JavaCode from '!!raw-loader!/_includes/code/graphql.additional.java';
import CurlCode from '!!raw-loader!/_includes/code/graphql.additional.sh';

## Sorting

You can sort results by any primitive property, such as `text`, `number`, or `int`.

:::note
Sorting is available when fetching objects, but **unavailable when using search operators**. Search operators automatically rank results by relevance (e.g. distance or score).
:::

### Sort order

| Parameter | Required | Type            | Description                                               |
|-----------|----------|-----------------|-----------------------------------------------------------|
| `path`    | yes      | `text`        | A single-element array containing the field name. GraphQL supports specifying the field name directly. |
| `order`   | varies by client | `asc` or `desc` | The sort order, ascending (default) or descending. |

#### Boolean values

`false` is considered smaller than `true`. `false` comes before `true` in ascending order and after `true` in descending order.

#### Null values

`null` values are considered smaller than any non-`null` values. `null` values come first in ascending order and last in descending order.

#### Arrays

Arrays are compared element by element from the beginning. When an element in one array is smaller than its counterpart in the second array, the whole first array is considered smaller.

Arrays are equal if they have the same length and all elements are equal. A subset array is considered smaller.

Examples:
- `[1, 2, 3] = [1, 2, 3]`
- `[1, 2, 4] < [1, 3, 4]`
- `[2, 2] > [1, 2, 3, 4]`
- `[1, 2, 3] < [1, 2, 3, 4]`

### Sort by a single property

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START Sorting Python"
      endMarker="# END Sorting Python"
      language="py"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START Sorting"
      endMarker="// END Sorting"
      language="go"
    />
  </TabItem>
  <TabItem value="java" label="Java v5 (Deprecated)">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START Sorting"
      endMarker="// END Sorting"
      language="java"
    />
  </TabItem>
  <TabItem value="curl" label="Curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START Sorting"
      endMarker="# END Sorting"
      language="shell"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START Sorting GraphQL"
      endMarker="# END Sorting GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "JeopardyQuestion": [
        {
          "answer": "$5 (Lincoln Memorial in the background)",
          "points": 600,
          "question": "A sculpture by Daniel Chester French can be seen if you look carefully on the back of this current U.S. bill"
        },
        {
          "answer": "(1 of 2) Juneau, Alaska or Augusta, Maine",
          "points": 0,
          "question": "1 of the 2 U.S. state capitals that begin with the names of months"
        },
        {
          "answer": "(1 of 2) Juneau, Alaska or Honolulu, Hawaii",
          "points": 0,
          "question": "One of the 2 state capitals whose names end with the letter \"U\""
        }
      ]
    }
  }
}
```

</details>

### Sort by multiple properties

To sort by more than one property, pass an array of { `path`, `order` } objects to the sort function:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START MultiplePropSorting Python"
      endMarker="# END MultiplePropSorting Python"
      language="py"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START MultiplePropSorting"
      endMarker="// END MultiplePropSorting"
      language="go"
    />
  </TabItem>
  <TabItem value="java" label="Java v5 (Deprecated)">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START MultiplePropSorting"
      endMarker="// END MultiplePropSorting"
      language="java"
    />
  </TabItem>
  <TabItem value="curl" label="Curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START MultiplePropSorting"
      endMarker="# END MultiplePropSorting"
      language="shell"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START MultiplePropSorting GraphQL"
      endMarker="# END MultiplePropSorting GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

### Sort by metadata properties

To sort with metadata, add an underscore to the property name.

| Property Name | Sort Property Name |
| :- | :- |
| `id` | `_id` |
| `creationTimeUnix` | `_creationTimeUnix` |
| `lastUpdateTimeUnix` | `_lastUpdateTimeUnix` |

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START AdditionalPropSorting Python"
      endMarker="# END AdditionalPropSorting Python"
      language="py"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START AdditionalPropSorting"
      endMarker="// END AdditionalPropSorting"
      language="go"
    />
  </TabItem>
  <TabItem value="java" label="Java v5 (Deprecated)">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START AdditionalPropSorting"
      endMarker="// END AdditionalPropSorting"
      language="java"
    />
  </TabItem>
  <TabItem value="curl" label="Curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START AdditionalPropSorting"
      endMarker="# END AdditionalPropSorting"
      language="shell"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START AdditionalPropSorting GraphQL"
      endMarker="# END AdditionalPropSorting GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Python client v4 property names</summary>

| Property Name | Sort Property Name |
| :- | :- |
| `uuid` |`_id` |
| `creation_time` | `_creationTimeUnix` |
| `last_update_time` | `_lastUpdateTimeUnix` |

</details>

### Sorting considerations

Weaviate's sorting implementation does not lead to massive memory spikes &mdash; only the property values being sorted are kept in memory, not all object properties.

No sorting-specific data structures are used on disk. This works well for small-to-medium scales (hundreds of thousands to millions of objects), but can be expensive for very large collections (hundreds of millions+).

## Pagination with `offset`

Use `offset` and `limit` together to paginate through results.

For example, to list the first ten results, set `limit: 10` and `offset: 0`. To display the next ten, set `offset: 10`.

import GraphQLFiltersLimit from '/_includes/code/graphql.filters.limit.mdx';

<GraphQLFiltersLimit/>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Backs on the rack - Vast sums are wasted on treatments for back pain that make it worse"
        },
        {
          "title": "Graham calls for swift end to impeachment trial, warns Dems against calling witnesses"
        },
        {
          "title": "Through a cloud, brightly - Obituary: Paul Volcker died on December 8th"
        },
        {
          "title": "Google Stadia Reviewed \u2013 Against The Stream"
        },
        {
          "title": "Managing Supply Chain Risk"
        }
      ]
    }
  }
}
```

</details>

import GraphQLFiltersOffset from '/_includes/code/graphql.filters.offset.mdx';

<GraphQLFiltersOffset/>

<details>
  <summary>Expected response</summary>

```json
{
  "data": {
    "Get": {
      "Article": [
        {
          "title": "Through a cloud, brightly - Obituary: Paul Volcker died on December 8th"
        },
        {
          "title": "Google Stadia Reviewed \u2013 Against The Stream"
        },
        {
          "title": "Managing Supply Chain Risk"
        },
        {
          "title": "Playing College Football In Madden"
        },
        {
          "title": "The 50 best albums of 2019, No 3: Billie Eilish \u2013 When We All Fall Asleep, Where Do We Go?"
        }
      ]
    }
  }
}
```

</details>

### Performance considerations

Pagination is not cursor-based. This has the following implications:

- **Response time increases with the offset.** Each page request requires a new, larger call. For example, requesting results 21&ndash;30 means Weaviate retrieves 30 objects and drops the first 20.
- **Multi-shard configurations amplify resource usage.** Each shard retrieves a full list and drops the objects before the offset. With 10 shards and results 91&ndash;100, Weaviate retrieves 1000 objects (100 per shard) and drops 990.
- **A maximum result limit applies.** If `offset + limit` exceeds `QUERY_MAXIMUM_RESULTS`, Weaviate returns an error. Edit the `QUERY_MAXIMUM_RESULTS` environment variable to change this limit.
- **Pagination is not stateful.** Database changes between calls can cause pages to miss or duplicate results. However, if there are no writes the result set is consistent.

For large-scale sequential retrieval, use the [cursor API](#cursor-with-after) instead.

## Cursor with `after`

The `after` operator retrieves objects sequentially using a cursor based on object IDs. Unlike offset pagination, it performs consistently regardless of position in the result set.

`after` is compatible with single-shard and multi-shard configurations, but only works with list queries. It is **not** compatible with `where`, `near<Media>`, `bm25`, `hybrid`, or similar search operators. For those, use [pagination with `offset`](#pagination-with-offset).

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

## Related pages

- [API reference: Additional operators](../api/graphql/additional-operators.md)
- [Query basics: `limit` returned objects](./basics.md#limit-returned-objects)
- [Query basics: Paginate with `limit` and `offset`](./basics.md#paginate-with-limit-and-offset)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
