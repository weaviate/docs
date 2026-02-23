---
title: Multiple target vectors
sidebar_position: 50
image: og/docs/howto.jpg
description: "Search with multiple target vectors with code examples in Python, TypeScript, Go, Java, and C#."
# tags: ['how to', 'hybrid search']
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import FilteredTextBlock from "@site/src/components/Documentation/FilteredTextBlock";
import PyCodeV4 from "!!raw-loader!/\_includes/code/howto/search.multi-target-v4.py";
import TSCodeV3 from "!!raw-loader!/\_includes/code/howto/search.multi-target-v3.ts";
import GoCode from "!!raw-loader!/\_includes/code/howto/search.multi-target.go";
import JavaV6Code from "!!raw-loader!/\_includes/code/java-v6/src/test/java/SearchMultiTargetTest.java";
import CSharpCode from "!!raw-loader!/\_includes/code/csharp/SearchMultiTargetTest.cs";

:::info Added in `v1.26`
:::

In a multi-target vector search, Weaviate searches multiple target vector spaces concurrently. These results are combined using a ["join strategy"](#available-join-strategies) to produce a single set of search results.

There are multiple ways to specify the target vectors and query vectors, such as:

- [Specify target vector names only](#specify-target-vector-names-only)
- [Specify query vectors](#specify-query-vectors)
- [Specify target vector names and join strategy](#specify-target-vector-names-and-join-strategy)
- [Weight raw vector distances](#weight-raw-vector-distances)
- [Weight normalized vector distances](#weight-normalized-vector-distances)

<!-- TODO: Move most of the description/prose to a new "vector.md" page under concepts/search. -->

Multi-target vector search is available for `near_xxx` queries (from `v1.26`), as well as `hybrid` queries (from `v1.27`).

### Available join strategies.

- **minimum** (_default_) Use the minimum of all vector distances.
- **sum** Use the sum of the vector distances.
- **average** Use the average of the vector distances.
- **manual weights** Use the sum of weighted distances, where the weight is provided for each target vector.
- **relative score** Use the sum of weighted normalized distances, where the weight is provided for each target vector.

## Specify target vector names only

As a minimum, specify the target vector names as an array of named vectors. This will use the [default join strategy](#available-join-strategies).

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeV4}
      startMarker="# START MultiBasic"
      endMarker="# END MultiBasic"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCodeV3}
      startMarker="// START MultiBasic"
      endMarker="// END MultiBasic"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START MultiBasic"
      endMarker="// END MultiBasic"
      language="go"
    />
    <details>
      <summary>Complete code</summary>
      <FilteredTextBlock
        text={GoCode}
        startMarker="// START BasicFull"
        endMarker="// END BasicFull"
        language="go"
      />
    </details>
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MultiBasic"
      endMarker="// END MultiBasic"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MultiBasic"
      endMarker="// END MultiBasic"
      language="csharp"
    />
  </TabItem>
</Tabs>

## Specify query vectors

You can specify multiple query vectors in the search query with a `nearVector` search. This allows use of a different query vector for each corresponding target vector.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeV4}
      startMarker="# START MultiTargetNearVector"
      endMarker="# END MultiTargetNearVector"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCodeV3}
      startMarker="// START MultiTargetNearVector"
      endMarker="// END MultiTargetNearVector"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MultiTargetNearVector"
      endMarker="// END MultiTargetNearVector"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MultiTargetNearVector"
      endMarker="// END MultiTargetNearVector"
      language="csharp"
    />
  </TabItem>
</Tabs>

You can also specify the query vectors as an array of vectors. The array will be parsed according to the order of the specified target vectors.

### Specify array(s) of query vectors

:::info Added in `v1.27`
:::

You can also specify the same target vector multiple times with different query vectors. In other words, you can use multiple query vectors for the same target vector.

The query vectors in this case are specified as an array of vectors. There are multiple ways to specify the target vectors in this case:

#### Target vector names only

The target vectors can be specified as an array as shown here.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeV4}
      startMarker="# START MultiTargetMultipleNearVectorsV1"
      endMarker="# END MultiTargetMultipleNearVectorsV1"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCodeV3}
      startMarker="// START MultiTargetMultipleNearVectorsV1"
      endMarker="// END MultiTargetMultipleNearVectorsV1"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MultiTargetMultipleNearVectorsV1"
      endMarker="// END MultiTargetMultipleNearVectorsV1"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MultiTargetMultipleNearVectorsV1"
      endMarker="// END MultiTargetMultipleNearVectorsV1"
      language="csharp"
    />
  </TabItem>
</Tabs>

#### Target vectors and weights

If you want to provide weights for each target vector you can do it as shown here.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeV4}
      startMarker="# START MultiTargetMultipleNearVectorsV2"
      endMarker="# END MultiTargetMultipleNearVectorsV2"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCodeV3}
      startMarker="// START MultiTargetMultipleNearVectorsV2"
      endMarker="// END MultiTargetMultipleNearVectorsV2"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MultiTargetMultipleNearVectorsV2"
      endMarker="// END MultiTargetMultipleNearVectorsV2"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MultiTargetMultipleNearVectorsV2"
      endMarker="// END MultiTargetMultipleNearVectorsV2"
      language="csharp"
    />
  </TabItem>
</Tabs>

## Specify target vector names and join strategy

Specify target vectors as an array of named vectors and how to join the result sets.

The `sum`, `average`, `minimum` join strategies only require the name of the strategy and the target vectors.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeV4}
      startMarker="# START MultiTargetWithSimpleJoin"
      endMarker="# END MultiTargetWithSimpleJoin"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCodeV3}
      startMarker="// START MultiTargetWithSimpleJoin"
      endMarker="// END MultiTargetWithSimpleJoin"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MultiTargetWithSimpleJoin"
      endMarker="// END MultiTargetWithSimpleJoin"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MultiTargetWithSimpleJoin"
      endMarker="// END MultiTargetWithSimpleJoin"
      language="csharp"
    />
  </TabItem>
</Tabs>

## Weight raw vector distances

Search by sums of weighted, **raw** distances to each target vector.

<details>
  <summary>The weighting in detail</summary>

Each distance between the query vector and the target vector is multiplied by the specified weight, then the resulting weighted distances are summed for each object to produce a combined distance. The search results are sorted by this combined distance.

</details>

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeV4}
      startMarker="# START MultiTargetManualWeights"
      endMarker="# END MultiTargetManualWeights"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCodeV3}
      startMarker="// START MultiTargetManualWeights"
      endMarker="// END MultiTargetManualWeights"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MultiTargetManualWeights"
      endMarker="// END MultiTargetManualWeights"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MultiTargetManualWeights"
      endMarker="// END MultiTargetManualWeights"
      language="csharp"
    />
  </TabItem>
</Tabs>

## Weight normalized vector distances

Search by sums of weighted, **normalized** distances to each target vector.

<details>
  <summary>The weighting in detail</summary>

Each distance is normalized against other results for that target vector. Each normalized distance between the query vector and the target vector is multiplied by the specified weight. The resulting weighted distances are summed for each object to produce a combined distance. The search results are sorted by this combined distance.

For a more detailed explanation of how scores are normalized, see the blog post on [hybrid relative score fusion](https://weaviate.io/blog/hybrid-search-fusion-algorithms#relative-score-fusion)

</details>

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeV4}
      startMarker="# START MultiTargetRelativeScore"
      endMarker="# END MultiTargetRelativeScore"
      language="python"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TSCodeV3}
      startMarker="// START MultiTargetRelativeScore"
      endMarker="// END MultiTargetRelativeScore"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MultiTargetRelativeScore"
      endMarker="// END MultiTargetRelativeScore"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MultiTargetRelativeScore"
      endMarker="// END MultiTargetRelativeScore"
      language="csharp"
    />
  </TabItem>
</Tabs>

## Related pages

- [Connect to Weaviate](/weaviate/connections/index.mdx)

## Questions and feedback

import DocsFeedback from "/\_includes/docs-feedback.mdx";

<DocsFeedback />
