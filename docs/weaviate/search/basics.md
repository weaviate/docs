---
title: Search patterns and basics
sidebar_position: 10
image: og/docs/howto.jpg
description: "Basic search operations: listing objects, retrieving properties and metadata with code in Python, TypeScript, Go, Java, and C#."
# tags: ['how to', 'semantic search']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/search.basics.py';
import PyCodeV3 from '!!raw-loader!/\_includes/code/howto/search.basics-v3.py';
import TSCode from '!!raw-loader!/\_includes/code/howto/search.basics.ts';
import GoCode from '!!raw-loader!/\_includes/code/howto/go/docs/mainpkg/search-basic_test.go';
import JavaV6Code from "!!raw-loader!/\_includes/code/java-v6/src/test/java/SearchBasicTest.java";
import JavaCode from '!!raw-loader!/\_includes/code/howto/java/src/test/java/io/weaviate/docs/search/BasicSearchTest.java';
import CSharpCode from "!!raw-loader!/\_includes/code/csharp/SearchBasicTest.cs";

With Weaviate you can query your data using [vector similarity search](./similarity.md), [keyword search](./bm25.md), or a mix of both with [hybrid search](./hybrid.md). You can control what object [properties](#retrieve-object-properties) and [metadata](#retrieve-metadata-values) to return.

This page provides fundamental search syntax to get you started.

import QueryAgentTip from '/_includes/query-agent-tip.mdx';

<QueryAgentTip/>

## List objects

You can get objects without specifying any parameters. This returns objects in ascending UUID order.

<Tabs className="code" groupId="languages">
 <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# BasicGetPython"
      endMarker="# END BasicGetPython"
      language="py"
    />
  </TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// BasicGetJS"
  endMarker="// END BasicGetJS"
  language="ts"
/> 
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START BasicGet"
      endMarker="// END BasicGet"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START BasicGet"
      endMarker="// END BasicGet"
      language="java"
    />
  </TabItem>
  <TabItem value="java" label="Java v5 (Deprecated)">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START BasicGet"
    endMarker="// END BasicGet"
    language="java"
  />
</TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START BasicGet"
      endMarker="// END BasicGet"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# BasicGetGraphQL"
      endMarker="# END BasicGetGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// BasicGet Expected Results"
  endMarker="// END BasicGet Expected Results"
  language="json"
/>

</details>

<details>
  <summary>Additional information</summary>

Specify the information that you want your query to return. You can return object properties, object IDs, and object metadata.

</details>

## `limit` returned objects

Use `limit` to set a fixed maximum number of objects to return.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetWithLimitPython"
  endMarker="# END GetWithLimitPython"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithLimitJS"
  endMarker="// END GetWithLimitJS"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GetWithLimit"
      endMarker="// END GetWithLimit"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START GetWithLimit"
      endMarker="// END GetWithLimit"
      language="java"
    />
  </TabItem> 
  <TabItem value="java" label="Java v5 (Deprecated)">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetWithLimit"
    endMarker="// END GetWithLimit"
    language="java"
  />
</TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START GetWithLimit"
      endMarker="// END GetWithLimit"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GetWithLimitGraphQL"
      endMarker="# END GetWithLimitGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// GetWithLimit Expected Results"
  endMarker="// END GetWithLimit Expected Results"
  language="json"
/>

</details>

## Paginate with `limit` and `offset`

To start in the middle of your result set, define an `offset`. Set a `limit` to return objects starting at the offset.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetWithLimitOffsetPython"
  endMarker="# END GetWithLimitOffsetPython"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithLimitOffsetJS"
  endMarker="// END GetWithLimitOffsetJS"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GetWithOffset"
      endMarker="// END GetWithOffset"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START GetWithOffset"
      endMarker="// END GetWithOffset"
      language="java"
    />
  </TabItem>
  <TabItem value="java" label="Java v5 (Deprecated)">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetWithOffset"
    endMarker="// END GetWithOffset"
    language="java"
  />
</TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START GetWithOffset"
      endMarker="// END GetWithOffset"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GetWithLimitOffsetGraphQL"
      endMarker="# END GetWithLimitOffsetGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// GetWithLimitOffset Expected Results"
  endMarker="// END GetWithLimitOffset Expected Results"
  language="json"
/>

</details>

To paginate through the entire database, use a [cursor](../manage-objects/read-all-objects.mdx) instead of offset and limit.

## Retrieve object `properties`

You can specify which object properties to return. By default, all properties and object UUIDs are returned. Blob and reference properties are excluded unless specified otherwise (_this does not apply to the Go and Java v5 client libraries)_.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetPropertiesPython"
  endMarker="# END GetPropertiesPython"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetPropertiesJS"
  endMarker="// END GetPropertiesJS"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GetProperties"
      endMarker="// END GetProperties"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START GetProperties"
      endMarker="// END GetProperties"
      language="java"
    />
  </TabItem>
  <TabItem value="java" label="Java v5 (Deprecated)">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetProperties"
    endMarker="// END GetProperties"
    language="java"
  />
</TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START GetProperties"
      endMarker="// END GetProperties"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GetPropertiesGraphQL"
      endMarker="# END GetPropertiesGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// GetProperties Expected Results"
  endMarker="// END GetProperties Expected Results"
  language="json"
/>

</details>

## Retrieve the object `vector`

You can retrieve the object vector. (Also applicable where [named vectors](../config-refs/collections.mdx#named-vectors) are used.)

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetObjectVectorPython"
  endMarker="# END GetObjectVectorPython"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetObjectVectorJS"
  endMarker="// END GetObjectVectorJS"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GetObjectVector"
      endMarker="// END GetObjectVector"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START GetObjectVector"
      endMarker="// END GetObjectVector"
      language="java"
    />
  </TabItem>
  <TabItem value="java" label="Java v5 (Deprecated)">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetObjectVector"
    endMarker="// END GetObjectVector"
    language="java"
  />
</TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START GetObjectVector"
      endMarker="// END GetObjectVector"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GetObjectVectorGraphQL"
      endMarker="# END GetObjectVectorGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// GetObjectVector Expected Results"
  endMarker="// END GetObjectVector Expected Results"
  language="json"
/>

</details>

## Retrieve the object `id`

You can retrieve the object `id` (uuid).

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetObjectIdPython"
  endMarker="# END GetObjectIdPython"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetObjectIdJS"
  endMarker="// END GetObjectIdJS"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GetObjectId"
      endMarker="// END GetObjectId"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START GetObjectId"
      endMarker="// END GetObjectId"
      language="java"
    />
  </TabItem>
  <TabItem value="java" label="Java v5 (Deprecated)">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetObjectId"
    endMarker="// END GetObjectId"
    language="java"
  />
</TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START GetObjectId"
      endMarker="// END GetObjectId"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GetObjectIdGraphQL"
      endMarker="# END GetObjectIdGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="// GetObjectId Expected Results"
  endMarker="// END GetObjectId Expected Results"
  language="json"
/>

</details>

## Retrieve cross-referenced properties

import CrossReferencePerformanceNote from '/\_includes/cross-reference-performance-note.mdx';

<CrossReferencePerformanceNote />

To retrieve properties from cross-referenced objects, specify:

- The cross-reference property
- The target cross-referenced collection
- The properties to retrieve

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetWithCrossRefsPython"
  endMarker="# END GetWithCrossRefsPython"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
      <FilteredTextBlock
        text={TSCode}
        startMarker="// GetWithCrossRefs"
        endMarker="// END GetWithCrossRefs"
        language="ts"
      />
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GetWithCrossRefs"
      endMarker="// END GetWithCrossRefs"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START GetWithCrossRefs"
      endMarker="// END GetWithCrossRefs"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START GetWithCrossRefs"
      endMarker="// END GetWithCrossRefs"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GetWithCrossRefsGraphQL"
      endMarker="# END GetWithCrossRefsGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>Example response</summary>

The output is like this:

<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GetWithCrossRefs Expected Results"
  endMarker="# END GetWithCrossRefs Expected Results"
  language="json"
/>

</details>

## Retrieve metadata values

You can specify metadata fields to be returned.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GetWithMetadataPython"
  endMarker="# END GetWithMetadataPython"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// GetWithMetadataJS"
  endMarker="// END GetWithMetadataJS"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GetWithMetadata"
      endMarker="// END GetWithMetadata"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START GetWithMetadata"
      endMarker="// END GetWithMetadata"
      language="java"
    />
  </TabItem>
  <TabItem value="java" label="Java v5 (Deprecated)">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START GetWithMetadata"
    endMarker="// END GetWithMetadata"
    language="java"
  />
</TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START GetWithMetadata"
      endMarker="// END GetWithMetadata"
      language="csharp"
    />
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GetWithMetadataGraphQL"
      endMarker="# END GetWithMetadataGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

For a comprehensive list of metadata fields, see [GraphQL: Additional properties](../api/graphql/additional-properties.md).

## Multi-tenancy

If [multi-tenancy](../concepts/data.md#multi-tenancy) is enabled, specify the tenant parameter in each query.

<Tabs className="code" groupId="languages">
<TabItem value="py" label="Python">
<FilteredTextBlock
  text={PyCode}
  startMarker="# MultiTenancy"
  endMarker="# END MultiTenancy"
  language="py"
/>
</TabItem>
<TabItem value="ts" label="JavaScript/TypeScript">
<FilteredTextBlock
  text={TSCode}
  startMarker="// MultiTenancy"
  endMarker="// END MultiTenancy"
  language="ts"
/>
</TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START MultiTenancy"
      endMarker="// END MultiTenancy"
      language="go"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START MultiTenancy"
      endMarker="// END MultiTenancy"
      language="java"
    />
  </TabItem>
  <TabItem value="java" label="Java v5 (Deprecated)">
  <FilteredTextBlock
    text={JavaCode}
    startMarker="// START MultiTenancy"
    endMarker="// END MultiTenancy"
    language="java"
  />
</TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START MultiTenancy"
      endMarker="// END MultiTenancy"
      language="csharp"
    />
  </TabItem>
</Tabs>

## Replication

For collections with replication enabled, you can specify the consistency level in your queries. This applies to CRUD queries as well as searches.

import QueryReplication from '/\_includes/code/replication.get.object.by.id.mdx';

<QueryReplication/>

## Related pages

- [Connect to Weaviate](/weaviate/connections)
- [API References: GraphQL: Get](../api/graphql/get.md)
- For tutorials, see [Queries](/weaviate/tutorials/query.md)
- For search using the GraphQL API, see [GraphQL API](../api/graphql/get.md)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
