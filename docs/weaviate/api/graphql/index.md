---
title: GraphQL API (deprecated)
sidebar_position: 0
description: "Reference for Weaviate's deprecated GraphQL query API, and where to find its replacements."
image: og/docs/api.jpg
# tags: ['GraphQL references']
---

import GraphQLDeprecation from '/_includes/graphql-deprecation.mdx';

<GraphQLDeprecation />

## API

This section is the reference for Weaviate's [GraphQL](https://graphql.org/) query API. To search your data, use a Weaviate [client library](../../client-libraries/index.mdx). The current Python, TypeScript, Java and C# clients query over the [gRPC API](../grpc.md).

To move existing GraphQL queries to a client library, the web client or the REST Search API, see [Migrating from the GraphQL API](./migration.mdx).

## All references

All references have their individual subpages. Click on one of the references below for more information.

- [Object-level queries](./get.md)
- [Aggregate](./aggregate.md)
- [Search operators](./search-operators.md)
- [Conditional filters](./filters.md)
- [Additional operators](./additional-operators.md)
- [Additional properties](./additional-properties.md)
- [Explore](./explore.md)


## GraphQL API

:::tip GraphQL is case-sensitive
GraphQL is case-sensitive ([reference](https://spec.graphql.org/June2018/#sec-Names)), so make sure to use the correct casing when writing your queries.
:::

### Query structure

You can POST a GraphQL query to Weaviate as follows:

```bash
curl http://localhost/v1/graphql -X POST -H 'Content-type: application/json' -d '{GraphQL query}'
```

A GraphQL JSON object is defined as:

```json
{
    "query": "{ # GRAPHQL QUERY }"
}
```

GraphQL queries follow a defined structure. Queries are structured as follows:


```graphql
{
  <Function> {
      <Collection> {
        <property>
        _<underscore-property>
      }
  }
}
```

### Limitations

GraphQL _integer_ data currently only supports `int32`, and does not support `int64`. This means that currently _integer_ data fields in Weaviate with integer values larger than `int32`, will not be returned using GraphQL queries. We are working on solving this [issue](https://github.com/weaviate/weaviate/issues/1563). As current workaround is to use a `string` instead.

### Consistency level

GraphQL (`Get`) queries are run with a tunable [consistency level](../../concepts/replication-architecture/consistency.md#tunable-read-consistency).

## gRPC API

Starting with Weaviate v1.19.0, a gRPC interface is being progressively added to Weaviate.

gRPC is a high-performance, open-source universal RPC framework that is contract-based and can be used in any environment. It is based on HTTP/2 and Protocol Buffers, and is therefore very fast and efficient.

Read more about the gRPC API [here](../grpc.md).


## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
