---
title: Hybrid search
sidebar_position: 40
image: og/docs/howto.jpg
description: "Hybrid search combining vector and keyword search with code examples in Python, TypeScript, Go, Java, and C#."
# tags: ['how to', 'hybrid search']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/search.hybrid.py';
import PyCodeV3 from '!!raw-loader!/\_includes/code/howto/search.hybrid-v3.py';
import TSCode from '!!raw-loader!/\_includes/code/howto/search.hybrid.ts';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/mainpkg/search-hybrid_test.go';
import JavaV6Code from "!!raw-loader!/\_includes/code/java-v6/src/test/java/SearchHybridTest.java";
import CSharpCode from "!!raw-loader!/\_includes/code/csharp/SearchHybridTest.cs";
import GQLCode from '!!raw-loader!/\_includes/code/howto/search.hybrid.gql.py';

`Hybrid` search combines the results of a vector search and a keyword (BM25F) search by fusing the two result sets.

The [fusion method](#change-the-fusion-method) and the [relative weights](#balance-keyword-and-vector-search) are configurable.

import QueryAgentTip from '/_includes/query-agent-tip.mdx';

<QueryAgentTip/>

## Basic hybrid search

Combine the results of a vector search and a keyword search. The search uses a single query string.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridBasicPython"
  endMarker="# END HybridBasicPython"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridBasic"
  endMarker="// END searchHybridBasic"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START Basic"
      endMarker="// END Basic"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridBasic"
      endMarker="// END HybridBasic"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridBasic"
      endMarker="// END HybridBasic"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# HybridBasicGraphQL"
      endMarker="# END HybridBasicGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridBasic results"
  endMarker="# END Expected HybridBasic results"
  language="json"
/>

</details>

## Named vectors

:::info Added in `v1.24`
:::

A hybrid search on a collection that has [named vectors](../config-refs/collections.mdx#named-vectors) must specify a `target` vector. Weaviate uses the query vector to search the target vector space.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# NamedVectorHybridPython"
      endMarker="# END NamedVectorHybridPython"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// NamedVectorHybrid"
      endMarker="// END NamedVectorHybrid"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START NamedVectorHybrid"
      endMarker="// END NamedVectorHybrid"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START NamedVectorHybrid"
      endMarker="// END NamedVectorHybrid"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# NamedVectorHybridGraphQL"
      endMarker="# END NamedVectorHybridGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# START Expected NamedVectorNearText results"
  endMarker="# END Expected NamedVectorNearText results"
  language="json"
/>

</details>

## Explain the search results

To see the object rankings, set the `explain score` field in your query. The search rankings are part of the object metadata. Weaviate uses the score to order the search results.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithScorePython"
  endMarker="# END HybridWithScorePython"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithScore"
  endMarker="// END searchHybridWithScore"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithScore"
      endMarker="// END WithScore"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridWithScore"
      endMarker="// END HybridWithScore"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridWithScore"
      endMarker="// END HybridWithScore"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# HybridWithScoreGraphQL"
      endMarker="# END HybridWithScoreGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithScore results"
  endMarker="# END Expected HybridWithScore results"
  language="json"
/>

</details>

## Balance keyword and vector search

Hybrid search results can favor the keyword component or the vector component. To change the relative weights of the keyword and vector components, set the `alpha` value in your query.

- An `alpha` of `1` is a pure vector search.
- An `alpha` of `0` is a pure keyword search.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithAlphaPython"
  endMarker="# END HybridWithAlphaPython"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithAlpha"
  endMarker="// END searchHybridWithAlpha"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithAlpha"
      endMarker="// END WithAlpha"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridWithAlpha"
      endMarker="// END HybridWithAlpha"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridWithAlpha"
      endMarker="// END HybridWithAlpha"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# HybridWithAlphaGraphQL"
      endMarker="# END HybridWithAlphaGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithAlpha results"
  endMarker="# END Expected HybridWithAlpha results"
  language="json"
/>

</details>

## Change the fusion method

`Relative Score Fusion` is the default fusion method starting in `v1.24`.

- To use the keyword and vector search relative scores instead of the search rankings, use `Relative Score Fusion`.
- To use [`autocut`](../api/graphql/additional-operators.md#autocut) with the `hybrid` operator, use `Relative Score Fusion`.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithFusionTypePython"
  endMarker="# END HybridWithFusionTypePython"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithFusionType"
  endMarker="// END searchHybridWithFusionType"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithFusionType"
      endMarker="// END WithFusionType"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridWithFusionType"
      endMarker="// END HybridWithFusionType"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridWithFusionType"
      endMarker="// END HybridWithFusionType"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# HybridWithFusionTypeGraphQL"
      endMarker="# END HybridWithFusionTypeGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithFusionType results"
  endMarker="# END Expected HybridWithFusionType results"
  language="json"
/>

</details>

<details>
  <summary>
    Additional information
  </summary>

For a discussion of fusion methods, see [this blog post](https://weaviate.io/blog/hybrid-search-fusion-algorithms) and [this reference page](../api/graphql/search-operators.md#variables-2)

</details>

## Keyword search operators

:::info Added in `v1.31`
:::

Keyword (BM25) search operators define the minimum number of query [tokens](#tokenization) that must be present in the object to be returned. The options are `and`, or `or` (default).

### `or`

With the `or` operator, the search returns objects that contain at least `minimumOrTokensMatch` of the tokens in the search string.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START HybridWithBM25OperatorOrWithMin"
      endMarker="# END HybridWithBM25OperatorOrWithMin"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JS/TS">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START HybridWithBM25OperatorOrWithMin"
      endMarker="// END HybridWithBM25OperatorOrWithMin"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridWithBM25OperatorOrWithMin"
      endMarker="// END HybridWithBM25OperatorOrWithMin"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridWithBM25OperatorOrWithMin"
      endMarker="// END HybridWithBM25OperatorOrWithMin"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={GQLCode}
      startMarker="# START HybridWithBM25OperatorOrWithMin"
      endMarker="# END HybridWithBM25OperatorOrWithMin"
      language="python"
    />
  </TabItem>
</Tabs>

### `and`

With the `and` operator, the search returns objects that contain all tokens in the search string.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START HybridWithBM25OperatorAnd"
      endMarker="# END HybridWithBM25OperatorAnd"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JS/TS">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START HybridWithBM25OperatorAnd"
      endMarker="// END HybridWithBM25OperatorAnd"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridWithBM25OperatorAnd"
      endMarker="// END HybridWithBM25OperatorAnd"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridWithBM25OperatorAnd"
      endMarker="// END HybridWithBM25OperatorAnd"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={GQLCode}
      startMarker="# START HybridWithBM25OperatorAnd"
      endMarker="# END HybridWithBM25OperatorAnd"
      language="python"
    />
  </TabItem>
</Tabs>

## Specify keyword search properties

:::info Added in `v1.19.0`
:::

The keyword search portion of hybrid search can be directed to only search a subset of object properties. This does not affect the vector search portion.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithPropertiesPython"
  endMarker="# END HybridWithPropertiesPython"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithProperties"
  endMarker="// END searchHybridWithProperties"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithProperties"
      endMarker="// END WithProperties"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridWithProperties"
      endMarker="// END HybridWithProperties"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridWithProperties"
      endMarker="// END HybridWithProperties"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# HybridWithPropertiesGraphQL"
      endMarker="# END HybridWithPropertiesGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithProperties results"
  endMarker="# END Expected HybridWithProperties results"
  language="json"
/>

</details>

## Set weights on property values

Specify the relative value of an object's `properties` in the keyword search. Higher values increase the property's contribution to the search score.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithPropertyWeightingPython"
  endMarker="# END HybridWithPropertyWeightingPython"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithPropertyWeighting"
  endMarker="// END searchHybridWithPropertyWeighting"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithPropertyWeighting"
      endMarker="// END WithPropertyWeighting"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridWithPropertyWeighting"
      endMarker="// END HybridWithPropertyWeighting"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridWithPropertyWeighting"
      endMarker="// END HybridWithPropertyWeighting"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# HybridWithPropertyWeightingGraphQL"
      endMarker="# END HybridWithPropertyWeightingGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithPropertyWeighting results"
  endMarker="# END Expected HybridWithPropertyWeighting results"
  language="json"
/>

</details>

## Specify a search vector

The vector component of hybrid search can use a query string or a query vector. To specify a query vector instead of a query string, provide a query vector (for the vector search) and a query string (for the keyword search) in your query.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithVectorPython"
  endMarker="# END HybridWithVectorPython"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithVector"
  endMarker="// END searchHybridWithVector"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithVector"
      endMarker="// END WithVector"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridWithVector"
      endMarker="// END HybridWithVector"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridWithVector"
      endMarker="// END HybridWithVector"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# HybridWithVectorGraphQL"
      endMarker="# END HybridWithVectorGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithVector results"
  endMarker="# END Expected HybridWithVector results"
  language="json"
/>

</details>

## Vector search parameters

:::info Added in `v1.25`
Note that the hybrid threshold (`max_vector_distance`) was introduced later in `v1.26.3`.
:::

You can specify [vector similarity search](/weaviate/search/similarity) parameters similar to [near text](/weaviate/search/similarity.md#search-with-text) or [near vector](/weaviate/search/similarity.md#search-with-a-vector) searches, such as `group by` and `move to` / `move away`. An equivalent `distance` [threshold for vector search](./similarity.md#set-a-similarity-threshold) can be specified with the `max vector distance` parameter.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VectorParametersPython"
      endMarker="# END VectorParametersPython"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// VectorSimilarity"
      endMarker="// END VectorSimilarity"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START VectorParameters"
      endMarker="// END VectorParameters"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START VectorParameters"
      endMarker="// END VectorParameters"
      language="csharp"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected VectorSimilarityGraphQL results"
  endMarker="# END Expected VectorSimilarityGraphQL results"
  language="json"
/>

</details>

## Hybrid search thresholds

:::info Added in `v1.25`
:::

The only available search threshold is `max vector distance`, which will set the maximum allowable distance for the vector search component.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VectorSimilarityPython"
      endMarker="# END VectorSimilarityPython"
      language="python"
    />
  </TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START VectorSimilarityThreshold"
      endMarker="// END VectorSimilarityThreshold"
      language="ts"
    />
  </TabItem>
   <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START VectorSimilarity"
      endMarker="// END VectorSimilarity"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START VectorSimilarity"
      endMarker="// END VectorSimilarity"
      language="csharp"
    />
  </TabItem>
</Tabs>

## Group results

:::info Added in `v1.25`
:::

Define criteria to group search results.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START HybridGroupByPy4"
      endMarker="# END HybridGroupByPy4"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START HybridGroupBy"
      endMarker="// END HybridGroupBy"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridGroupBy"
      endMarker="// END HybridGroupBy"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridGroupBy"
      endMarker="// END HybridGroupBy"
      language="csharp"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The response is like this:

```
'Jeopardy!'
'Double Jeopardy!'
```

</details>

## `limit` & `offset`

Use `limit` to set a fixed maximum number of objects to return.

Optionally, use `offset` to paginate the results.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START limit Python"
      endMarker="# END limit Python"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START limit"
      endMarker="// END limit"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START limit"
      endMarker="// END limit"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START limit"
      endMarker="// END limit"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START limit"
      endMarker="// END limit"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START limit GraphQL"
      endMarker="# END limit GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

## Limit result groups

To limit results to groups with similar distances from the query, use the [`autocut`](../api/graphql/additional-operators.md#autocut) filter. Specify the `Relative Score Fusion` ranking method when you use autocut with hybrid search.

:::info

Autocut requires `Relative Score Fusion` method because it uses actual similarity scores to detect cutoff points. Autocut shouldn't be used with `Ranked Fusion` as this fusion method relies on ranking positions, not similarity scores.

To learn more about the different fusion algorithms, visit the [search operators reference page](/weaviate/api/graphql/search-operators#fusion-algorithms).

:::

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START autocut Python"
      endMarker="# END autocut Python"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START autocut"
      endMarker="// END autocut"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START autocut"
      endMarker="// END autocut"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START autocut"
      endMarker="// END autocut"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START autocut"
      endMarker="// END autocut"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START autocut GraphQL"
      endMarker="# END autocut GraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# START Expected autocut results"
  endMarker="# END Expected autocut results"
  language="json"
/>

</details>

## Filter results

To narrow your search results, use a [`filter`](../api/graphql/filters.md).

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# HybridWithFilterPython"
  endMarker="# END HybridWithFilterPython"
  language="python"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// searchHybridWithFilter"
  endMarker="// END searchHybridWithFilter"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START WithFilter"
      endMarker="// END WithFilter"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START HybridWithFilter"
      endMarker="// END HybridWithFilter"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START HybridWithFilter"
      endMarker="// END HybridWithFilter"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# HybridWithFilterGraphQL"
      endMarker="# END HybridWithFilterGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Expected HybridWithFilter results"
  endMarker="# END Expected HybridWithFilter results"
  language="json"
/>

</details>

### Tokenization

import TokenizationNote from '/\_includes/tokenization.mdx'

<TokenizationNote />

## Related pages

- [Connect to Weaviate](/weaviate/connections/index.mdx)
- [API References: Search operators # Hybrid](../api/graphql/search-operators.md#hybrid)
- About [hybrid fusion algorithms](https://weaviate.io/blog/hybrid-search-fusion-algorithms).
- For tutorials, see [Queries](/weaviate/tutorials/query.md)
- For search using the GraphQL API, see [GraphQL API](../api/graphql/get.md).

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
