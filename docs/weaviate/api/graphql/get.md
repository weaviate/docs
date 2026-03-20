---
title: Object-level queries (Get)
sidebar_position: 10
description: "Fetch data from Weaviate with GraphQL's get queries for efficient retrieval."
image: og/docs/api.jpg
# tags: ['graphql', 'get{}']
---

import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';

This page covers object-level query functions. They are collectively referred to as `Get` queries within.

### Parameters

A `Get` query requires the target collection to be specified.

- In GraphQL calls, the properties to be retrieved to be must be specified explicitly.
- In gRPC calls, all properties are fetched by default.

- Metadata retrieval is optional in both GraphQL and gRPC calls.

#### Available arguments

Each `Get` query can include any of the following types of arguments:

| Argument                                          | Description                                                      | Required                                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Collection                                        | Also called "class". The object collection to be retrieved from. | Yes                                                                                                        |
| Properties                                        | Properties to be retrieved                                       | Yes (GraphQL) <br/> (No if using gRPC API)                                                                 |
| Cross-references                                  | Cross-references to be retrieved                                 | No                                                                                                         |
| [Metadata](./additional-properties.md)            | Metadata (additional properties) to be retrieved                 | No                                                                                                         |
| [Conditional filters](./filters.md)               | Filter the objects to be retrieved                               | No                                                                                                         |
| [Search operators](./search-operators.md)         | Specify the search strategy (e.g. near text, hybrid, bm25)       | No                                                                                                         |
| [Additional operators](./additional-operators.md) | Specify additional operators (e.g. limit, offset, sort)          | No                                                                                                         |
| [Tenant name](#multi-tenancy)                     | Specify the tenant name                                          | Yes, if multi-tenancy enabled. ([Read more: what is multi-tenancy?](../../concepts/data.md#multi-tenancy)) |
| [Consistency level](#consistency-levels)          | Specify the consistency level                                    | No                                                                                                         |

#### Example usage

import GraphQLGetSimple from '/\_includes/code/graphql.get.simple.mdx';

<GraphQLGetSimple/>

<details>
  <summary>Example response</summary>

The above query will result in something like the following:

```
{'points': 400.0, 'answer': 'Refrigerator Car', 'air_date': '1997-02-14', 'hasCategory': 'TRANSPORTATION', 'question': 'In the 19th century Gustavus Swift developed this type of railway car to preserve his packed meat', 'round': 'Jeopardy!'}
{'points': 800.0, 'hasCategory': 'FICTIONAL CHARACTERS', 'answer': 'Forsyte', 'air_date': '1998-05-27', 'question': 'Last name of Soames & Irene, the 2 principal characters in John Galsworthy\'s 3 novel "saga"', 'round': 'Double Jeopardy!'}
{'points': 500.0, 'answer': 'Duluth', 'air_date': '1996-12-17', 'hasCategory': 'MUSEUMS', 'question': 'This eastern Minnesota city is home to the Lake Superior Museum of Transportation', 'round': 'Jeopardy!'}
{'points': 1000.0, 'answer': 'Ear', 'air_date': '1988-11-16', 'hasCategory': 'HISTORY', 'round': 'Double Jeopardy!', 'question': "An eighteenth-century war was named for this part of Robert Jenkins' body, reputedly cut off by Spaniards"}
{'points': 400.0, 'answer': 'Bonnie Blair', 'air_date': '1997-02-28', 'hasCategory': 'SPORTS', 'round': 'Jeopardy!', 'question': "At the 1994 Olympics, this U.S. woman speed skater surpassed Eric Heiden's medal total"}
{'points': 1600.0, 'answer': 'Turkish', 'air_date': '2008-03-24', 'hasCategory': 'LANGUAGES', 'question': 'In the 1920s this language of Anatolia switched from the Arabic to the Latin alphabet', 'round': 'Double Jeopardy!'}
{'points': 100.0, 'answer': 'Ireland', 'air_date': '1998-10-01', 'hasCategory': 'POTPOURRI', 'round': 'Jeopardy!', 'question': "Country in which you'd find the Book of Kells"}
{'points': 800.0, 'answer': 'Ichabod Crane', 'air_date': '2008-01-03', 'hasCategory': 'LITERATURE', 'round': 'Double Jeopardy!', 'question': 'Washington Irving based this character on his friend Jesse Merwin, a schoolteacher'}
{'points': 300.0, 'air_date': '1997-12-05', 'hasCategory': 'LITERATURE', 'answer': '"The Prince and the Pauper"', 'question': 'Tom Canty, born in a slum called Offal Court, & Edward Tudor are the title characters in this Twain novel', 'round': 'Jeopardy!'}
{'points': 500.0, 'answer': 'Seattle', 'air_date': '1999-05-10', 'hasCategory': 'U.S. CITIES', 'round': 'Jeopardy!', 'question': "The site of the World's Fair in 1962, it's flanked on the west by Puget Sound & on the east by Lake Washington"}
```

</details>

<details>
  <summary>Order of retrieved objects</summary>

Without any arguments, the objects are retrieved according to their ID.

Accordingly, such a `Get` query is not suitable for a substantive object retrieval strategy. Consider the [Cursor API](./additional-operators.md#cursor-with-after) for that purpose.

</details>

:::tip Read more

- [How-to: Query & Search - Search patterns and basics](../../search/basics.md)
  :::

### `Get` groupBy

You can group objects that match a query by property. The number of groups and objects per group can be limited.

import GroupbyLimitations from '/\_includes/groupby-limitations.mdx';

<GroupbyLimitations />

#### Syntax

```graphql
{
  Get{
    <Class>(
      <vectorSearchOperator>  # e.g. nearVector, nearObject, nearText
      groupBy:{
        path: [<propertyName>]  # Property to group by (only one property or cross-reference)
        groups: <number>  # Max. number of groups
        objectsPerGroup: <number>  # Max. number of objects per group
      }
    ) {
      _additional {
        group {
          id  # An identifier for the group in this search
          groupedBy{ value path }  # Value and path of the property grouped by
          count  # Count of objects in this group
          maxDistance  # Maximum distance from the group to the query vector
          minDistance  # Minimum distance from the group to the query vector
          hits {  # Where the actual properties for each grouped objects will be
            <properties>  # Properties of the individual object
            _additional {
              id  # UUID of the individual object
              vector  # The vector of the individual object
              distance  # The distance from the individual object to the query vector
            }
          }
        }
      }
    }
  }
}
```

For usage examples, see [How-to: Query & Search - Group results by property](../../search/basics.md#group-results-by-property).

### Consistency levels

Where replication is enabled, you can specify a `consistency` argument. Options: `ONE`, `QUORUM` (default), `ALL`. Read more about [consistency levels](../../concepts/replication-architecture/consistency.md).

### Multi-tenancy

In a multi-tenancy collection, each `Get` query must specify a tenant.

import GraphQLGetMT from '/\_includes/code/graphql.get.multitenancy.mdx';

<GraphQLGetMT/>

:::tip Read more

- [How-to manage data: Multi-tenancy operations](../../manage-collections/multi-tenancy.mdx)
  :::

## Cross-references

import CrossReferencePerformanceNote from '/\_includes/cross-reference-performance-note.mdx';

<CrossReferencePerformanceNote />

Weaviate supports cross-references between objects. Each cross-reference behaves like a property.

You can retrieve cross-referenced properties with a `Get` query.

import GraphQLGetBeacon from '/\_includes/code/graphql.get.beacon.mdx';

<GraphQLGetBeacon/>

import GraphQLGetBeaconUnfiltered from '!!raw-loader!/\_includes/code/graphql.get.beacon.v3.py';

<details>
  <summary>Expected response</summary>

<FilteredTextBlock
  text={GraphQLGetBeaconUnfiltered}
  startMarker="// ===== EXPECTED RESULT ====="
  endMarker="// ===== END EXPECTED RESULT ====="
  language="json"
/>

</details>

:::tip Read more

- [How-to: Query & Search - Retrieve cross-referenced properties](../../search/basics.md#retrieve-cross-referenced-properties)
  :::

## Additional properties / metadata

Various metadata properties may be retrieved with `Get{}` requests. They include:

| Property             | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| `id`                 | Object id                                                              |
| `vector`             | Object vector                                                          |
| `generate`           | Generative module outputs                                              |
| `rerank`             | Reranker module outputs                                                |
| `creationTimeUnix`   | Object creation time                                                   |
| `lastUpdateTimeUnix` | Object last updated time                                               |
| `distance`           | Vector distance to query (vector search only)                          |
| `certainty`          | Vector distance to query, normalized to certainty (vector search only) |
| `score`              | Search score (BM25 and hybrid only)                                    |
| `explainScore`       | Explanation of the score (BM25 and hybrid only)                        |
| `classification`     | Classification outputs                                                 |
| `featureProjection`  | Feature projection outputs                                             |

They are returned through the `_additional` properties in the response.

For further information see:

:::tip Read more

- [References: GraphQL: Additional properties](./additional-properties.md)
- [How-to: Query & Search: Specify fetched properties](../../search/basics.md#retrieve-object-properties)
  :::

## Search operators

The following search operators are available.

| Argument     | Description                            | Required integration type   | Learn more                                          |
| ------------ | -------------------------------------- | --------------------------- | --------------------------------------------------- |
| `nearObject` | Vector search using a Weaviate object  | _none_                      | [Learn more](./search-operators.md#nearobject)      |
| `nearVector` | Vector search using a raw vector       | _none_                      | [Learn more](./search-operators.md#nearvector)      |
| `nearText`   | Vector search using a text query       | Text embedding model        |                                                     |
| `nearImage`  | Vector search using an image           | Multi-modal embedding model |
| `hybrid`     | Combine vector and BM25 search results | _none_                      | [Learn more](../graphql/search-operators.md#hybrid) |
| `bm25`       | Keyword search with BM25F ranking      | _none_                      | [Learn more](../graphql/search-operators.md#bm25)   |

For further information see:

:::tip Read more

- [References: GraphQL: Search operators](./search-operators.md)
- [How-to: Query & Search: Similarity search](../../search/similarity.md)
- [How-to: Query & Search: Image search](../../search/image.md)
- [How-to: Query & Search: BM25 search](../../search/bm25.md)
- [How-to: Query & Search: Hybrid search](../../search/hybrid.md)
  :::

## Conditional filters

`Get{}` queries can be combined with a conditional filter.

For further information see:

:::tip Read more

- [References: GraphQL: Conditional Filters](./filters.md)
- [How-to: Query & Search: Filters](../../search/filters.md)
  :::

## Additional operators

`Get{}` queries can be combined with additional operators such as `limit`, `offset`, `autocut`, `after` or `sort`.

For further information see:

:::tip Read more

- [References: GraphQL: Additional Operators](./additional-operators.md)
  :::

## Further resources

- [How-to: Query & Search - Search patterns and basics](../../search/basics.md)
- [How-to: Query & Search - Similarity search](../../search/similarity.md)
- [How-to: Query & Search - Image search](../../search/image.md)
- [How-to: Query & Search - BM25 search](../../search/bm25.md)
- [How-to: Query & Search - Hybrid search](../../search/hybrid.md)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
