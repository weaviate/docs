---
title: Filters
sidebar_position: 90
image: og/docs/howto.jpg
description: "Apply conditional filters to search results with code examples in Python, TypeScript, Go, Java, and C#."
# tags: ['how to', 'apply conditional filters']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/search.filters.py';
import PyCodeNested from '!!raw-loader!/\_includes/code/howto/search.filters.nested.py';
import PyCodeV3 from '!!raw-loader!/\_includes/code/howto/search.filters-v3.py';
import JavaScriptCode from '!!raw-loader!/\_includes/code/howto/search.filters.ts';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/mainpkg/search-filters_test.go';
import JavaV6Code from "!!raw-loader!/\_includes/code/java-v6/src/test/java/SearchFiltersTest.java";
import CSharpCode from "!!raw-loader!/\_includes/code/csharp/SearchFiltersTest.cs";

Filters let you include, or exclude, particular objects from your result set based on provided conditions.<br/>
For a list of filter operators, see the [API reference page](../api/graphql/filters.md#filter-structure).

## Filter with one condition

Add a `filter` to your query, to limit the result set.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# SingleFilterPython"
      endMarker="# END SingleFilterPython"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// searchSingleFilter"
      endMarker="// END searchSingleFilter"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START SingleFilter"
      endMarker="// END SingleFilter"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START SingleFilter"
      endMarker="// END SingleFilter"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START SingleFilter"
      endMarker="// END SingleFilter"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# SingleFilterGraphQL"
      endMarker="# END SingleFilterGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected SingleFilter results"
  endMarker="# END Expected SingleFilter results"
  language="json"
/>

</details>

## Filter with multiple conditions

To filter with two or more conditions, use `And`, `Or` and `Not` to define the relationship between the conditions.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">

The `v4` Python client API provides filtering by `any_of`, or `all_of`, as well as using `&` or `|` operators.
<br/>

  <ul>
    <li>Use <code>any_of</code> or <code>all_of</code> for filtering by any, or all of a list of provided filters.</li>
    <li>Use <code>&</code> or <code>|</code> for filtering by pairs of provided filters.</li>
  </ul>

  <br/>

#### Filter with `&` or `|`

<FilteredTextBlock
    text={PyCode}
    startMarker="# MultipleFiltersAndPython"
    endMarker="# END MultipleFiltersAndPython"
    language="python"
  />

#### Filter with `any of`

<FilteredTextBlock
    text={PyCode}
    startMarker="# MultipleFiltersAnyOfPython"
    endMarker="# END MultipleFiltersAnyOfPython"
    language="python"
  />

#### Filter with `all of`

<FilteredTextBlock
    text={PyCode}
    startMarker="# MultipleFiltersAllOfPython"
    endMarker="# END MultipleFiltersAllOfPython"
    language="python"
  />

  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">

  Use `Filters.and` and `Filters.or` methods to combine filters in the JS/TS `v3` API. `Filters.not` is used to negate a filter using the logical NOT operator.
  <br/>

These methods take variadic arguments (e.g. `Filters.and(f1, f2, f3, ...)`). To pass an array (e.g. `fs`) as an argument, provide it like so: `Filters.and(...fs)` which will spread the array into its elements.
<br/>

<FilteredTextBlock
    text={JavaScriptCode}
    startMarker="// searchMultipleFiltersAnd"
    endMarker="// END searchMultipleFiltersAnd"
    language="ts"
  />
</TabItem>
<TabItem value="go" label="Go">
<FilteredTextBlock
      text={GoCode}
      startMarker="// START MultipleFiltersAnd"
      endMarker="// END MultipleFiltersAnd"
      language="gonew"
    />
</TabItem>
<TabItem value="java" label="Java">
<FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MultipleFiltersAnd"
      endMarker="// END MultipleFiltersAnd"
      language="java"
    />
</TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MultipleFiltersAnd"
      endMarker="// END MultipleFiltersAnd"
      language="csharp"
    />
  </TabItem>
<TabItem value="graphql" label="GraphQL">
<FilteredTextBlock
      text={PyCodeV3}
      startMarker="# MultipleFiltersAndGraphQL"
      endMarker="# END MultipleFiltersAndGraphQL"
      language="graphql"
    />
</TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected MultipleFiltersAnd results"
  endMarker="# END Expected MultipleFiltersAnd results"
  language="json"
/>

</details>

## Combine filters with `And` or `Or`

Group and nest filter conditions with `And` and `Or` operators to express compound logic.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# MultipleFiltersNestedPython"
      endMarker="# END MultipleFiltersNestedPython"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// searchMultipleFiltersNested"
      endMarker="// END searchMultipleFiltersNested"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START MultipleFiltersNested"
      endMarker="// END MultipleFiltersNested"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MultipleFiltersNested"
      endMarker="// END MultipleFiltersNested"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MultipleFiltersNested"
      endMarker="// END MultipleFiltersNested"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# MultipleFiltersNestedGraphQL"
      endMarker="# END MultipleFiltersNestedGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected MultipleFiltersNested results"
  endMarker="# END Expected MultipleFiltersNested results"
  language="json"
/>

</details>

<details>
  <summary>
    Additional information
  </summary>

To create a nested filter, follow these steps.

- Set the outer `operator` equal to `And` or `Or`.
- Add `operands`.
- Inside an `operand` expression, set `operator` equal to `And` or `Or` to add the nested group.
- Add `operands` to the nested group as needed.

</details>

## Combine filters and search operators

Filters work with search operators like `nearXXX`, `hybrid`, and `bm25`.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# SingleFilterNearTextPython"
      endMarker="# END SingleFilterNearTextPython"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// searchFilterNearText"
      endMarker="// END searchFilterNearText"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START searchFilterNearText"
      endMarker="// END searchFilterNearText"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START NearTextSingleFilter"
      endMarker="// END NearTextSingleFilter"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START NearTextSingleFilter"
      endMarker="// END NearTextSingleFilter"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# SingleFilterNearTextGraphQL"
      endMarker="# END SingleFilterNearTextGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected SingleFilterNearText results"
  endMarker="# END Expected SingleFilterNearText results"
  language="json"
/>

</details>

## `ContainsAny` Filter

The `ContainsAny` operator works on text properties and take an array of values as input. It will match objects where the property **contains any (i.e. one or more)** of the values in the array.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# ContainsAnyFilter"
      endMarker="# END ContainsAnyFilter"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// ContainsAnyFilter"
      endMarker="// END ContainsAnyFilter"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START ContainsAnyFilter"
      endMarker="// END ContainsAnyFilter"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START ContainsAnyFilter"
      endMarker="// END ContainsAnyFilter"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START ContainsAnyFilter"
      endMarker="// END ContainsAnyFilter"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GraphQLContainsAnyFilter"
      endMarker="# END GraphQLContainsAnyFilter"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected ContainsAnyFilter results"
  endMarker="# END Expected ContainsAnyFilter results"
  language="json"
/>

</details>

## `ContainsAll` Filter

The `ContainsAll` operator works on text properties and take an array of values as input. It will match objects where the property **contains all** of the values in the array.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# ContainsAllFilter"
      endMarker="# END ContainsAllFilter"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// ContainsAllFilter"
      endMarker="// END ContainsAllFilter"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START ContainsAllFilter"
      endMarker="// END ContainsAllFilter"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START ContainsAllFilter"
      endMarker="// END ContainsAllFilter"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START ContainsAllFilter"
      endMarker="// END ContainsAllFilter"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GraphQLContainsAllFilter"
      endMarker="# END GraphQLContainsAllFilter"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected ContainsAllFilter results"
  endMarker="# END Expected ContainsAllFilter results"
  language="json"
/>

</details>

## `ContainsNone` Filter

The `ContainsNone` operator works on text properties and take an array of values as input. It will match objects where the property **contains none** of the values in the array.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ContainsNoneFilter"
      endMarker="# END ContainsNoneFilter"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// START ContainsNoneFilter"
      endMarker="// END ContainsNoneFilter"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START ContainsNoneFilter"
      endMarker="// END ContainsNoneFilter"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START ContainsNoneFilter"
      endMarker="// END ContainsNoneFilter"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START ContainsNoneFilter"
      endMarker="// END ContainsNoneFilter"
      language="csharp"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

```json
{
  "data": {
    "Get": {
      "JeopardyQuestion": [
        {
          "answer": "Frank Lloyd Wright",
          "hasCategory": [
            {
              "title": "PEOPLE"
            }
          ],
          "question": "In 1939 this famous architect polished off his Johnson Wax Building in Racine, Wisconsin"
        },
        {
          "answer": "a luffa",
          "hasCategory": [
            {
              "title": "FOOD"
            }
          ],
          "question": "When it's young & tender, this gourd used in the bathtub can be eaten like a squash"
        },
        {
          "answer": "a snail",
          "hasCategory": [
            {
              "title": "SCIENCE & NATURE"
            }
          ],
          "question": "Like an escargot, the abalone is an edible one of these gastropods"
        }
      ]
    }
  }
}
```

</details>

## `ContainsAny`, `ContainsAll` and `ContainsNone` with batch delete

If you want to do a batch delete, see [Delete objects](../manage-objects/delete.mdx#containsany--containsall--containsnone).

## Filter text on partial matches

If the object property is a `text`, or `text`-like data type such as object ID, use `Like` to filter on partial text matches.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# LikeFilterPython"
      endMarker="# END LikeFilterPython"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// searchLikeFilter"
      endMarker="// END searchLikeFilter"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START LikeFilter"
      endMarker="// END LikeFilter"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START LikeFilter"
      endMarker="// END LikeFilter"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START LikeFilter"
      endMarker="// END LikeFilter"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# LikeFilterGraphQL"
      endMarker="# END LikeFilterGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected LikeFilter results"
  endMarker="# END Expected LikeFilter results"
  language="json"
/>

</details>

<details>
  <summary>
    Additional information
  </summary>

The `*` wildcard operator matches zero or more characters. The `?` operator matches exactly one character.
<br/>

Currently, the `Like` filter is not able to match wildcard characters (`?` and `*`) as literal characters ([read more](../api/graphql/filters.md#wildcard-literal-matches-with-like)).

</details>

## Filter using cross-references

import CrossReferencePerformanceNote from '/\_includes/cross-reference-performance-note.mdx';

<CrossReferencePerformanceNote />

To filter on properties from a cross-referenced object, add the collection name to the filter.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# CrossReferencePython"
      endMarker="# END CrossReferencePython"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// searchCrossReference"
      endMarker="// END searchCrossReference"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START CrossReference"
      endMarker="// END CrossReference"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START CrossReference"
      endMarker="// END CrossReference"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START CrossReference"
      endMarker="// END CrossReference"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# CrossReferenceGraphQL"
      endMarker="# END CrossReferenceGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected CrossReferencePython results"
  endMarker="# END Expected CrossReferencePython results"
  language="json"
/>

</details>

## By geo-coordinates

import GeoLimitations from '/\_includes/geo-limitations.mdx';

<GeoLimitations/>

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterbyGeolocation"
      endMarker="# END FilterbyGeolocation"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterbyGeolocation"
      endMarker="// END FilterbyGeolocation"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterbyGeolocation"
      endMarker="// END FilterbyGeolocation"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START FilterbyGeolocation"
      endMarker="// END FilterbyGeolocation"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START FilterbyGeolocation"
      endMarker="// END FilterbyGeolocation"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START GQLFilterbyGeolocation"
      endMarker="# END GQLFilterbyGeolocation"
      language="graphql"
    />
  </TabItem>
</Tabs>

## By `DATE` datatype

To filter by a `DATE` datatype property, specify the date/time as an [RFC 3339](https://datatracker.ietf.org/doc/rfc3339/) timestamp, or a client library-compatible type such as a Python `datetime` object.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterByDateDatatype"
      endMarker="# END FilterByDateDatatype"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterByDateDatatype"
      endMarker="// END FilterByDateDatatype"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterByDateDatatype"
      endMarker="// END FilterByDateDatatype"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START FilterByDateDatatype"
      endMarker="// END FilterByDateDatatype"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START FilterByDateDatatype"
      endMarker="// END FilterByDateDatatype"
      language="csharp"
    />
  </TabItem>
</Tabs>

## Filter by metadata

Filters also work with metadata properties such as object id, property length, and timestamp.

For the full list, see [API references: Filters](../api/graphql/filters.md#special-cases).

### By object `id`

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterById"
      endMarker="# END FilterById"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// filterById"
      endMarker="// END filterById"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterById"
      endMarker="// END FilterById"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START FilterById"
      endMarker="// END FilterById"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START FilterById"
      endMarker="// END FilterById"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GQLFilterById"
      endMarker="# END GQLFilterById"
      language="graphql"
    />
  </TabItem>
</Tabs>

### By object timestamp

This filter requires the [property timestamp](../config-refs/indexing/inverted-index.mdx#indextimestamps) to [be indexed](../manage-collections/inverted-index.mdx#set-inverted-index-parameters).

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterByTimestamp"
      endMarker="# END FilterByTimestamp"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterByTimestamp"
      endMarker="// END FilterByTimestamp"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterByTimestamp"
      endMarker="// END FilterByTimestamp"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START FilterByTimestamp"
      endMarker="// END FilterByTimestamp"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START FilterByTimestamp"
      endMarker="// END FilterByTimestamp"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GQLFilterByTimestamp"
      endMarker="# END GQLFilterByTimestamp"
      language="graphql"
    />
  </TabItem>
</Tabs>

### By object property length

This filter requires the [property length](../config-refs/indexing/inverted-index.mdx#indexpropertylength) to [be indexed](../manage-collections/inverted-index.mdx#set-inverted-index-parameters).

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterByPropertyLength"
      endMarker="# END FilterByPropertyLength"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterByPropertyLength"
      endMarker="// END FilterByPropertyLength"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterByPropertyLength"
      endMarker="// END FilterByPropertyLength"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START FilterByPropertyLength"
      endMarker="// END FilterByPropertyLength"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START FilterByPropertyLength"
      endMarker="// END FilterByPropertyLength"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GQLFilterByPropertyLength"
      endMarker="# END GQLFilterByPropertyLength"
      language="graphql"
    />
  </TabItem>
</Tabs>

### By object null state

This filter requires the [property null state](../config-refs/indexing/inverted-index.mdx#indexnullstate) to [be indexed](../manage-collections/inverted-index.mdx#set-inverted-index-parameters).

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilterByPropertyNullState"
      endMarker="# END FilterByPropertyNullState"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={JavaScriptCode}
      startMarker="// FilterByPropertyNullState"
      endMarker="// END FilterByPropertyNullState"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START FilterByPropertyNullState"
      endMarker="// END FilterByPropertyNullState"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START FilterByPropertyNullState"
      endMarker="// END FilterByPropertyNullState"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START FilterByPropertyNullState"
      endMarker="// END FilterByPropertyNullState"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GQLFilterByPropertyNullState"
      endMarker="# END GQLFilterByPropertyNullState"
      language="graphql"
    />
  </TabItem>
</Tabs>

## Filter on nested object properties

:::caution Preview feature

Available from Weaviate `v1.38` as a preview, gated by the `WEAVIATE_PREVIEW_NESTED_FILTERING=on` environment variable on the server. The path syntax and operator semantics are stable, but the on-disk encoding may change before GA — don't rely on persistent state from preview clusters carrying over to the GA release. The env var is removed at GA and the feature is enabled unconditionally.

:::

[`object` and `object[]` properties](../config-refs/datatypes.md#object) carry their own nested schemas. To filter on a value inside a nested object, use a single dotted path naming the path from the parent property down to the leaf you want to compare.

Given a collection like this:

<FilteredTextBlock
  text={PyCodeNested}
  startMarker="client.collections.create("
  endMarker="docs = client.collections.use"
  includeStartMarker="true"
  language="python"
/>

The filter property is a single dotted path. The dot is the only separator. An optional `[N]` after any segment pins that segment to an array index (0-based).

| Path | Meaning |
|---|---|
| `cars.make` | Any car's `make` (matches if **any** element of the `cars` array has it) |
| `cars[0].make` | The first car's `make` (positional) |
| `cars.tires.width` | Any tire on any car (recursive across two `object[]` levels) |
| `cars[1].tires[2].brand` | The second car's third tire's `brand` (positional through nesting) |

`[N]` on a segment requires that segment to be an `object[]` (array). Every intermediate segment must be `object` or `object[]` — you cannot pivot through a scalar. The leaf may be any supported scalar type.

### Match any element (default)

A path without `[N]` markers matches if **any** element in the parent array satisfies the condition.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeNested}
      startMarker="# START NestedExistential"
      endMarker="# END NestedExistential"
      language="python"
    />
  </TabItem>
</Tabs>

### Match by position

Use `[N]` to pin a path segment to a specific array index. Indices are 0-based.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeNested}
      startMarker="# START NestedPositional"
      endMarker="# END NestedPositional"
      language="python"
    />
  </TabItem>
</Tabs>

### Same-element correlation across leaves

Combining two leaf filters with `And` matches when **the same element** in the parent array satisfies both. A document with one car `(Toyota, blue)` and another `(Honda, red)` would not match `cars.make = "Toyota" AND cars.color = "red"` — both conditions must hold on the **same** car.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeNested}
      startMarker="# START NestedSameElementAnd"
      endMarker="# END NestedSameElementAnd"
      language="python"
    />
  </TabItem>
</Tabs>

### Deep / recursive paths

`object[]` can nest inside `object[]` to any depth. Each segment in the dotted path traverses one level.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeNested}
      startMarker="# START NestedRecursive"
      endMarker="# END NestedRecursive"
      language="python"
    />
  </TabItem>
</Tabs>

### Check whether a nested object is absent

Pointing a path at an `object` or `object[]` segment (rather than a scalar leaf) is only valid with `IsNull`, which asks whether that whole sub-object is present.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeNested}
      startMarker="# START NestedIsNull"
      endMarker="# END NestedIsNull"
      language="python"
    />
  </TabItem>
</Tabs>

### Limitations

:::note

- **Allowed leaf data types**: `text`, `int`, `number`, `boolean`, `date`, `uuid`, and their array variants. `blob`, `blobHash`, `geoCoordinates`, `phoneNumber`, and cross-references (`cref`) are not allowed inside nested objects for nested filtering.
- **`IndexFilterable` is required**: nested filtering uses the filterable inverted index on each leaf. `IndexRangeFilters` and `IndexSearchable` flags exist on nested-property definitions but are not yet exercised by the nested searcher — range filters on nested numeric leaves currently use the filterable bucket.
- **Tokenization matters**: nested `text` leaves use the same tokenization options as flat properties. For exact-match filters on names, codes, or identifiers, set `tokenization: field` on the leaf so the value is stored as a single token.
- **Reference-path vs nested-path**: a reference-path filter is a multi-element `Path` (`["inCity", "City", "name"]`) traversing cross-references; a nested-path filter is a **single-element** path with dots inside it (`["cars.make"]`).

:::

## Filter considerations

### Tokenization

import TokenizationNote from '/\_includes/tokenization.mdx'

<TokenizationNote />

### Improve filter performance

If you encounter slow filter performance, consider adding a `limit` parameter or additional `where` operators to restrict the size of your data set.

## List of filter operators

For a list of filter operators, see [the reference page](../api/graphql/filters.md#filter-structure).

## Related pages

- [Connect to Weaviate](/weaviate/connections/index.mdx)
- [API References: Filters](../api/graphql/filters.md)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
