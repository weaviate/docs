---
title: Aggregate data
sidebar_position: 85
image: og/docs/howto.jpg
description: "Aggregate data (count, sum, average) with code examples in Python, TypeScript, Go, Java, and C#."
# tags: ['how to', 'aggregate data']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/search.aggregate.py';
import PyCodeV3 from '!!raw-loader!/\_includes/code/howto/search.aggregate-v3.py';
import TSCode from '!!raw-loader!/\_includes/code/howto/search.aggregate.ts';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/mainpkg/search-aggregation_test.go';
import JavaV6Code from "!!raw-loader!/\_includes/code/java-v6/src/test/java/SearchAggregateTest.java";
import CSharpCode from "!!raw-loader!/\_includes/code/csharp/SearchAggregateTest.cs";

`Aggregate` queries process the result set to return calculated results. Use `aggregate` queries for groups of objects or the entire result set.

<details>
  <summary>
    Additional information
  </summary>

To run an `Aggregate` query, specify the following:

- A target collection to search
- One or more aggregated properties, such as:

  - A meta property
  - An object property
  - The `groupedBy` property

- Select at least one sub-property for each selected property

For details, see [Aggregate](/weaviate/api/graphql/aggregate).

</details>

## Retrieve the `count` meta property

Return the number of objects matched by the query.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# MetaCount Python"
      endMarker="# END MetaCount Python"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// MetaCount TS"
      endMarker="// END MetaCount TS"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START MetaCount"
      endMarker="// END MetaCount"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MetaCount"
      endMarker="// END MetaCount"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MetaCount"
      endMarker="// END MetaCount"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# MetaCount GraphQL"
      endMarker="# END MetaCount GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
    text={PyCodeV3}
    startMarker="# MetaCount Expected Results"
    endMarker="# END MetaCount Expected Results"
    language="json"
  />

</details>

## Aggregate `text` properties

This example counts occurrence frequencies:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# TextProp Python"
      endMarker="# END TextProp Python"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// TextProp TS"
      endMarker="// END TextProp TS"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START TextProp"
      endMarker="// END TextProp"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START TextProp"
      endMarker="// END TextProp"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START TextProp"
      endMarker="// END TextProp"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# TextProp GraphQL"
      endMarker="# END TextProp GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
    text={PyCodeV3}
    startMarker="# TextProp Expected Results"
    endMarker="# END TextProp Expected Results"
    language="json"
  />

</details>

## Aggregate `int` properties

This example shows aggregation with integers.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# IntProp Python"
      endMarker="# END IntProp Python"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// IntProp TS"
      endMarker="// END IntProp TS"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START IntProp"
      endMarker="// END IntProp"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START IntProp"
      endMarker="// END IntProp"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START IntProp"
      endMarker="// END IntProp"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# IntProp GraphQL"
      endMarker="# END IntProp GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
    text={PyCodeV3}
    startMarker="# IntProp Expected Results"
    endMarker="# END IntProp Expected Results"
    language="json"
  />

</details>

## Aggregate `groupedBy` properties

To group your results, use `groupBy` in the query.

To retrieve aggregate data for each group, use the `groupedBy` properties.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# groupBy Python"
      endMarker="# END groupBy Python"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// groupBy TS"
      endMarker="// END groupBy TS"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START groupBy"
      endMarker="// END groupBy"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START groupBy"
      endMarker="// END groupBy"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START groupBy"
      endMarker="// END groupBy"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# groupBy GraphQL"
      endMarker="# END groupBy GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
    text={PyCodeV3}
    startMarker="# groupBy Expected Results"
    endMarker="# END groupBy Expected Results"
    language="json"
  />

</details>

import GroupbyLimitations from '/\_includes/groupby-limitations.mdx';

<GroupbyLimitations />

## Aggregate with a `similarity search`

You can use `Aggregate` with a [similarity search](./similarity.md) operator (one of the `Near` operators).

<!-- Make sure to [limit your search results](../api/graphql/aggregate.md#limiting-the-search-space).<br/> -->

Use `objectLimit` to specify the maximum number of objects to aggregate.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# nearTextWithLimit Python"
      endMarker="# END nearTextWithLimit Python"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// nearTextWithLimit TS"
      endMarker="// END nearTextWithLimit TS"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START nearTextWithLimit"
      endMarker="// END nearTextWithLimit"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START nearTextWithLimit"
      endMarker="// END nearTextWithLimit"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START nearTextWithLimit"
      endMarker="// END nearTextWithLimit"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# nearTextWithLimit GraphQL"
      endMarker="# END nearTextWithLimit GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
    text={PyCodeV3}
    startMarker="# nearTextWithLimit Expected Results"
    endMarker="# END nearTextWithLimit Expected Results"
    language="json"
  />

</details>

### Set a similarity `distance`

You can use `Aggregate` with a [similarity search](./similarity.md) operator (one of the `Near` operators).

<!-- Make sure to [limit your search results](../api/graphql/aggregate.md#limiting-the-search-space).<br/> -->

Use `distance` to specify how similar the objects should be.

<!-- If you use `Aggregate` with a [similarity search](./similarity.md) operator (one of the `nearXXX` operators), [limit your search results](../api/graphql/aggregate.md#limiting-the-search-space). To specify how similar the objects should be, use the `distance` operator. -->

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# nearTextWithDistance Python"
      endMarker="# END nearTextWithDistance Python"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// nearTextWithDistance TS"
      endMarker="// END nearTextWithDistance TS"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START nearTextWithDistance"
      endMarker="// END nearTextWithDistance"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START nearTextWithDistance"
      endMarker="// END nearTextWithDistance"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START nearTextWithDistance"
      endMarker="// END nearTextWithDistance"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# nearTextWithDistance GraphQL"
      endMarker="# END nearTextWithDistance GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
    text={PyCodeV3}
    startMarker="# nearTextWithDistance Expected Results"
    endMarker="# END nearTextWithDistance Expected Results"
    language="json"
  />

</details>

## Aggregate with a `hybrid search`

You can use `Aggregate` with a [hybrid search](./hybrid.md) operator.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# HybridExample"
      endMarker="# END HybridExample"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// HybridExample"
      endMarker="// END HybridExample"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START nearTextWithLimit"
      endMarker="// END nearTextWithLimit"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridExample"
      endMarker="// END HybridExample"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridExample"
      endMarker="// END HybridExample"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GraphQLHybridExample"
      endMarker="# END GraphQLHybridExample"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
    text={PyCodeV3}
    startMarker="# ResultsHybridExample"
    endMarker="# END ResultsHybridExample"
    language="json"
  />

</details>

## Filter results

For more specific results, use a `filter` to narrow your search.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# whereFilter Python"
      endMarker="# END whereFilter Python"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// whereFilter TS"
      endMarker="// END whereFilter TS"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START whereFilter"
      endMarker="// END whereFilter"
      language="gonew"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START whereFilter"
      endMarker="// END whereFilter"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START whereFilter"
      endMarker="// END whereFilter"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# whereFilter GraphQL"
      endMarker="# END whereFilter GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
    text={PyCodeV3}
    startMarker="# whereFilter Expected Results"
    endMarker="# END whereFilter Expected Results"
    language="json"
  />

</details>

## Related pages

- [Connect to Weaviate](/weaviate/connections/index.mdx)
- [API References: GraphQL: Aggregate](../api/graphql/aggregate.md)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
