---
title: Conditional filters
sidebar_position: 35
description: "GraphQL filtering reference: operator list, filter structure, path syntax, and value types."
image: og/docs/api.jpg
# tags: ['graphql', 'filters']
---

Conditional filters may be added to [`Object-level`](./get.md) and [`Aggregate`](./aggregate.md) queries, as well as [batch deletion](../../manage-objects/delete.mdx#delete-multiple-objects). The operator used for filtering is called a `where` filter.

:::tip How-to guide
For usage examples with multi-language code snippets, see [Filters](../../search/filters.md).
:::

## Filter structure

The `where` filter is an [algebraic object](https://en.wikipedia.org/wiki/Algebraic_structure) with the following arguments:

### Operators

| Operator | Description |
| --- | --- |
| `And` | All operands must match. |
| `Or` | At least one operand must match. |
| `Not` | Negate a condition. |
| `Equal` | Exact match. |
| `NotEqual` | Inverse of `Equal`. |
| `GreaterThan` | Greater than comparison. |
| `GreaterThanEqual` | Greater than or equal. |
| `LessThan` | Less than comparison. |
| `LessThanEqual` | Less than or equal. |
| `Like` | Partial text match with `?` (one char) and `*` (zero+ chars) wildcards. See [details](#like). |
| `WithinGeoRange` | Geo-coordinate radius search. |
| `IsNull` | Filter by null/non-null state. |
| `ContainsAny` | Array/text contains at least one of the values. See [details](#containsany--containsall--containsnone). |
| `ContainsAll` | Array/text contains all of the values. See [details](#containsany--containsall--containsnone). |
| `ContainsNone` | Array/text contains none of the values. See [details](#containsany--containsall--containsnone). |

If the operator is `And` or `Or`, the operands are a list of nested `where` filters.

### Path

A list of strings in [XPath](https://en.wikipedia.org/wiki/XPath#Abbreviated_syntax) style indicating the property name.

For cross-references, follow the path as a list. For example, an `inPublication` reference to a `Publication` collection targeting the `name` property: `["inPublication", "Publication", "name"]`.

### Value types

| valueType | Data types |
| --- | --- |
| `valueInt` | `int` |
| `valueBoolean` | `boolean` |
| `valueString` | `string` (deprecated) |
| `valueText` | `text`, `uuid`, `geoCoordinates`, `phoneNumber` |
| `valueNumber` | `number` |
| `valueDate` | `date` (ISO 8601 / [RFC 3339](https://datatracker.ietf.org/doc/rfc3339/) format) |

<details>
  <summary>Example filter structure (GraphQL)</summary>

```graphql
{
  Get {
    <Class>(where: {
        operator: <operator>,
        operands: [{
          path: [path],
          operator: <operator>
          <valueType>: <value>
        }, {
          path: [<matchPath>],
          operator: <operator>,
          <valueType>: <value>
        }]
      }) {
      <propertyWithBeacon> {
        <property>
        ... on <ClassOfWhereBeaconGoesTo> {
          <propertyOfClass>
        }
      }
    }
  }
}
```

</details>

### Filter behaviors

#### Multi-word queries in `Equal` filters

The behavior for the `Equal` operator on multi-word textual properties depends on the `tokenization` of the property. See [tokenization](../../config-refs/collections.mdx#tokenization).

#### Stopwords in `text` filters

You can configure your own [stopword lists](/weaviate/config-refs/indexing/inverted-index.mdx#stopwords).

## Filter operators

### `Like`

The `Like` operator filters `text` data based on partial matches. It can be used with the following wildcard characters:

- `?` -> exactly one unknown character
  - `car?` matches `cart`, `care`, but not `car`
- `*` -> zero, one or more unknown characters
  - `car*` matches `car`, `care`, `carpet`, etc
  - `*car*` matches `car`, `healthcare`, etc.

#### Performance of `Like`

Each `Like` filter iterates over the entire inverted index for that property. The search time will go up linearly with the dataset size, and may become slow for large datasets.

#### Wildcard literal matches with `Like`

Currently, the `Like` filter is not able to match wildcard characters (`?` and `*`) as literal characters. For example, it is currently not possible to only match the string `car*` and not `car`, `care` or `carpet`. This is a known limitation and may be addressed in future versions of Weaviate.


### `ContainsAny` / `ContainsAll` / `ContainsNone`

The `ContainsAny`, `ContainsAll` and `ContainsNone` operators filter objects using values of an array as criteria.

Both operators expect an array of values and return objects that match based on the input values.

:::note `ContainsAny`/`ContainsAll`/`ContainsNone` notes:
- The `ContainsAny`, `ContainsAll` and `ContainsNone` operators treat texts as an array. The text is split into an array of tokens based on the chosen tokenization scheme, and the search is performed on that array.
- When using `ContainsAny`, `ContainsAll` and `ContainsNone` with the REST api for [batch deletion](../../manage-objects/delete.mdx#delete-multiple-objects), the text array must be specified with the `valueTextArray` argument. This is different from the usage in search, where the `valueText` argument can be used.
:::

#### `ContainsAny`

`ContainsAny` returns objects where at least one of the values from the input array is present.

Consider a dataset of `Person`, where each object represents a person with a `languages_spoken` property with a `text` datatype.

A `ContainsAny` query on a path of `["languages_spoken"]` with a value of `["Chinese", "French", "English"]` will return objects where at least one of those languages is present in the `languages_spoken` array.

#### `ContainsAll`

`ContainsAll` returns objects where all the values from the input array are present.

Using the same dataset of `Person` objects as above, a `ContainsAll` query on a path of `["languages_spoken"]` with a value of `["Chinese", "French", "English"]` will return objects where all three of those languages are present in the `languages_spoken` array.

#### `ContainsNone`

`ContainsNone` returns objects where none of the values from the input array are present.

Using the same dataset of `Person` objects as above, a `ContainsNone` query on a path of `["languages_spoken"]` with a value of `["Chinese", "French", "English"]` will return objects where **none** of those languages are present in the `languages_spoken` array. For example, a person who speaks only Spanish would be returned, but a person who speaks English would be excluded.

## Filter performance

import RangeFilterPerformanceNote from '/_includes/range-filter-performance-note.mdx';

<RangeFilterPerformanceNote />

## Special cases

### By id

You can filter objects by their unique id or uuid, where you give the `id` as `valueText`.

### By timestamps

Filtering can be performed with internal timestamps as well, such as `creationTimeUnix` and `lastUpdateTimeUnix`. These values can be represented either as Unix epoch milliseconds, or as [RFC3339](https://datatracker.ietf.org/doc/rfc3339/) formatted datetimes. Note that epoch milliseconds should be passed in as a `valueText`, and an RFC3339 datetime should be a `valueDate`.

:::info
Filtering by timestamp requires the target class to be configured to index timestamps. See [here](/weaviate/config-refs/indexing/inverted-index.mdx#indextimestamps) for details.
:::

### By property length

Filter by the length of properties using `path: ["len(<property>)"]`. Supported operators: `Equal`, `NotEqual`, `GreaterThan`, `GreaterThanEqual`, `LessThan`, `LessThanEqual`. Values must be 0 or larger.

Length calculation:
- **Array types**: number of entries (null and empty = 0).
- **Strings/texts**: number of unicode characters.
- Numbers, booleans, geo-coordinates, phone-numbers, and data-blobs are not supported.

```graphql
{
  Get {
    Article(
      where: {
        operator: GreaterThan,
        valueInt: 10,
        path: ["len(title)"]
      }
    )
  }
}
```

:::note
Filtering by property length requires [indexing to be enabled](/weaviate/config-refs/indexing/inverted-index.mdx#indexpropertylength).
:::

### By cross-references

You can filter based on the value of a property of a cross-referenced object. The path should follow the cross-reference chain, e.g. `["inPublication", "Publication", "name"]`.

### By count of reference

You can filter by reference count using comparison operators (`Equal`, `LessThan`, `LessThanEqual`, `GreaterThan`, `GreaterThanEqual`) directly on the reference property. For example, to find all authors who wrote at least two articles, filter `writesFor` with `GreaterThanEqual` and `valueInt: 2`.

### By geo coordinates

The `WithinGeoRange` operator filters objects within a radius from a point. It requires a `geoCoordinates` property with `latitude` and `longitude`, and a `distance` with `max` in kilometers.

Note that `geoCoordinates` uses a vector index under the hood.

import GeoLimitations from '/_includes/geo-limitations.mdx';

<GeoLimitations/>

### By null state

Using the `IsNull` operator allows you to filter for objects where given properties are `null` or `not null`. Note that zero-length arrays and empty strings are equivalent to a null value.

```graphql
{
  Get {
    <Class>(where: {
        operator: IsNull,
        valueBoolean: <true/false>
        path: [<property>]
  }
}
```

:::note
Filtering by null state requires [indexing to be enabled](../../config-refs/indexing/inverted-index.mdx#indexnullstate).
:::

## Further resources

- [How-to: Filters](../../search/filters.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
