---
title: Data structure
sidebar_position: 10
description: "Core data object concepts, schema design, and data organization principles in Weaviate."
image: og/docs/concepts.jpg
---

import SkipLink from '/src/components/SkipValidationLink'

## Data object concepts

Each data object in Weaviate belongs to a `collection` and has one or more `properties`.

Weaviate stores `data objects` in class-based collections. Data objects are represented as JSON-documents. Objects normally include a `vector` that is derived from a machine learning model. The vector is also called an `embedding` or a `vector embedding`.

Each collection contains objects of the same `class`. The objects are defined by a common `schema`.

```mermaid
flowchart LR

    subgraph Collection["🗄️ Collection"]
        direction LR
        CollectionConfig["Collection Configuration <br/><br/>(e.g. data schema, <br/>embedding model integration, <br/>index configurations, <br/>replication config, etc.)"]
    end

    subgraph search ["Indexes"]
        direction LR
        Indexes["Indexes"]

        subgraph vector ["Vector Search"]
            direction TB
            VectorIndex["Vector Index"]
            IndexStructure["Index Structure"]
            VectorCache["Vector Cache"]
        end

        subgraph text ["Filtering / Text Search"]
            direction LR
            InvertedIndex["Inverted Index"]
            BM25Index["BM25 Index"]
            FilterIndex["Filter Index"]
        end
    end

    subgraph storage ["Data Storage"]
        direction TB
        ObjectStore["Object Store"]
        ObjectData["Object Data / Metadata"]
        VectorData["Vector Data"]
    end

    %% Connections
    Collection --> Indexes
    Collection --> ObjectStore

    Indexes --> VectorIndex
    Indexes --> InvertedIndex

    VectorIndex --> IndexStructure
    VectorIndex --> VectorCache

    InvertedIndex --> BM25Index
    InvertedIndex --> FilterIndex

    ObjectStore --> ObjectData
    ObjectStore --> VectorData

    %% Style Collection node
    style Collection fill:#ffffff,stroke:#130C49,color:#130C49,stroke-width:2px

    %% Style Config components (purple color)
    style CollectionConfig fill:#f5f5f5,stroke:#9575CD,color:#130C49

    %% Style Memory components (warm color)
    style Indexes fill:#FFF3E0,stroke:#FFB74D,color:#130C49
    style VectorIndex fill:#FFF3E0,stroke:#FFB74D,color:#130C49
    style InvertedIndex fill:#FFF3E0,stroke:#FFB74D,color:#130C49
    style VectorCache fill:#FFF3E0,stroke:#FFB74D,color:#130C49
    style IndexStructure fill:#FFF3E0,stroke:#FFB74D,color:#130C49
    style BM25Index fill:#FFF3E0,stroke:#FFB74D,color:#130C49
    style FilterIndex fill:#FFF3E0,stroke:#FFB74D,color:#130C49

    %% Style Disk components (cool color)
    style ObjectStore fill:#E3F2FD,stroke:#64B5F6,color:#130C49
    style ObjectData fill:#E3F2FD,stroke:#64B5F6,color:#130C49
    style VectorData fill:#E3F2FD,stroke:#64B5F6,color:#130C49

    %% Style subgraphs
    style search fill:#ffffff,stroke:#7AD6EB,stroke-width:2px,color:#130C49
    style vector fill:#ffffff,stroke:#61BD73,stroke-width:2px,color:#130C49
    style text fill:#ffffff,stroke:#61BD73,stroke-width:2px,color:#130C49
    style storage fill:#ffffff,stroke:#7AD6EB,stroke-width:2px,color:#130C49
```

import InitialCaps from '/_includes/schemas/initial-capitalization.md'

<InitialCaps />

### JSON documents as objects

Imagine we need to store information about an author named Alice Munro. In JSON format the data looks like this:

```json
{
    "name": "Alice Munro",
    "age": 91,
    "born": "1931-07-10T00:00:00.0Z",
    "wonNobelPrize": true,
    "description": "Alice Ann Munro is a Canadian short story writer who won the Nobel Prize in Literature in 2013. Munro's work has been described as revolutionizing the architecture of short stories, especially in its tendency to move forward and backward in time."
}
```

### Vectors

You can also attach `vector` representations to your data objects. Vectors are arrays of numbers that are stored under the `"vector"` property.

In this example, the `Alice Munro` data object has a small vector. The vector is some information about Alice, maybe a story or an image, that a machine learning model has transformed into an array of numerical values.

```json
{
    "id": "779c8970-0594-301c-bff5-d12907414002",
    "class": "Author",
    "properties": {
        "name": "Alice Munro",
        (...)
    },
    "vector": [
        -0.16147631,
        -0.065765485,
        -0.06546908
    ]
}
```

To generate vectors for your data, use one of Weaviate's vectorizer [modules](./modules.md). You can also use your own vectorizer.

### Collections

Collections are groups of objects that share a schema definition.

In this example, the `Author` collection holds objects that represent different authors.

<!-- [Alice Munro
Born: July 10, 1931 (age 91)
Nobel Prize Winner

"Alice Ann Munro is a Canadian short story writer who won the Nobel Prize in Literature in 2013. Munro's work has been described as revolutionizing the architecture of short stories, especially in its tendency to move forward and backward in time...."
]

[Paul Krugman
Born: February 28, 1953 (age 69)
Nobel Prize Winner

"Paul Robin Krugman is an American economist and public intellectual, who is..."
] -->

The collection looks like this:

```json
[{
    "id": "dedd462a-23c8-32d0-9412-6fcf9c1e8149",
    "class": "Author",
    "properties": {
        "name": "Alice Munro",
        "age": 91,
        "born": "1931-07-10T00:00:00.0Z",
        "wonNobelPrize": true,
        "description": "Alice Ann Munro is a Canadian short story writer who won the Nobel Prize in Literature in 2013. Munro's work has been described as revolutionizing the architecture of short stories, especially in its tendency to move forward and backward in time."
    },
    "vector": [
        -0.16147631,
        -0.065765485,
        -0.06546908
    ]
}, {
    "id": "779c8970-0594-301c-bff5-d12907414002",
    "class": "Author",
    "properties": {
        "name": "Paul Krugman",
        "age": 69,
        "born": "1953-02-28T00:00:00.0Z",
        "wonNobelPrize": true,
        "description": "Paul Robin Krugman is an American economist and public intellectual, who is Distinguished Professor of Economics at the Graduate Center of the City University of New York, and a columnist for The New York Times. In 2008, Krugman was the winner of the Nobel Memorial Prize in Economic Sciences for his contributions to New Trade Theory and New Economic Geography."
    },
    "vector": [
        -0.93070928,
        -0.03782172,
        -0.56288009
    ]
}]
```

Every collection has its own vector space. This means that different collections can have different embeddings of the same object.

### UUIDs

Every object stored in Weaviate has a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier). The UUID guarantees uniqueness across all collections.

You can [use a deterministic UUID](../manage-objects/import.mdx#specify-an-id-value) to ensure that the same object always has the same UUID. This is useful when you want to update an object without changing its UUID.

If you don't specify an ID, Weaviate generates a random UUID for you.

In requests without any other ordering specified, Weaviate processes them in ascending UUID order. This means that requests to [list objects](../search/basics.md#list-objects), use of the [cursor API](../manage-objects/read-all-objects.mdx), or requests to [delete objects](../manage-objects/delete.mdx#delete-multiple-objects-by-id), without any other ordering specified, will be processed in ascending UUID order.

### Cross-references

import CrossReferencePerformanceNote from '/_includes/cross-reference-performance-note.mdx';

<CrossReferencePerformanceNote />

If data objects are related, you can use [cross-references](../manage-collections/cross-references.mdx) to represent the relationships. Cross-references in Weaviate are like links that help you retrieve related information. Cross-references capture relationships, but they do not change the vectors of the underlying objects.

To create a reference, use a property from one collection to specify the value of a related property in the other collection.

#### Cross-reference example

For example, *"Paul Krugman writes for the New York Times"* describes a relationship between Paul Krugman and the New York Times. To capture that relationship, create a cross-reference between the `Publication` object that represents the New York Times and the `Author` object that represents Paul Krugman.

The New York Times `Publication` object looks like this. Note the UUID in the `"id"` field:

```json
{
    "id": "32d5a368-ace8-3bb7-ade7-9f7ff03eddb6",
    "class": "Publication",
    "properties": {
        "name": "The New York Times"
    },
    "vector": [...]
}
```

The Paul Krugman `Author` object adds a new property, `writesFor`, to capture the relationship.

```json
{
    "id": "779c8970-0594-301c-bff5-d12907414002",
    "class": "Author",
    "properties": {
        "name": "Paul Krugman",
        ...
// highlight-start
        "writesFor": [
            {
                "beacon": "weaviate://localhost/32d5a368-ace8-3bb7-ade7-9f7ff03eddb6",
                "href": "/v1/objects/32d5a368-ace8-3bb7-ade7-9f7ff03eddb6"
            }
        ],
// highlight-end
    },
    "vector": [...]
}
```

The value of the `beacon` sub-property is the `id` value from the New York Times `Publication` object.

Cross-reference relationships are directional. To make the link bi-directional, update the `Publication` collection to add a `hasAuthors` property points back to the `Author` collection.

### Multiple vector embeddings (named vectors)

import MultiVectorSupport from '/_includes/multi-vector-support.mdx';

<MultiVectorSupport />

#### Adding a named vector after collection creation

:::info Added in `v1.31`
:::

A named vector can be added to an existing collection definition after collection creation. This allows you to add new vector representations for objects without having to delete and recreate the collection.

When you add a new named vector to an existing collection definition, it's important to understand that **existing objects' new named vector will remain unpopulated**. Only objects created or updated after the named vector addition will receive these new vector embeddings.

This prevents any unintended side effects, such as incurring large vectorization time or costs for all existing objects in a collection.

If you want to populate the new named vector for existing objects, update the object with the existing object UUID and vectors. This will trigger the vectorization process for the new named vector.

<!-- TODO: I wonder we should show an example - maybe once the vectorizer syntax is updated with 1.32 -->

:::caution Not available for legacy (unnamed) vectorizers
The ability to add a named vector after collection creation is only available for collections configured with named vectors.
:::

## Data Schema

Weaviate requires a data schema before you add data. However, you don't have to create a data schema manually. If you don't provide one, Weaviate generates a schema based on the incoming data.

import SchemaDef from '/_includes/definition-schema.md';

<SchemaDef/>

:::note Schema vs. Taxonomy
A Weaviate data schema is slightly different from a taxonomy. A taxonomy has a hierarchy. Read more about how taxonomies, ontologies and schemas are related in this Weaviate [blog post](https://medium.com/semi-technologies/taxonomies-ontologies-and-schemas-how-do-they-relate-to-weaviate-9f76739fc695).
:::

Schemas fulfill several roles:

1. Schemas define collections and properties.
1. Schemas define cross-references that link collections, even collections that use different embeddings.
1. Schemas let you configure module behavior, ANN index settings, reverse indexes, and other features on a collection level.

For details on configuring your schema, see the [schema tutorial](../starter-guides/managing-collections/index.mdx) or [How-to: Manage collections](../manage-collections/index.mdx).

## Multi-tenancy

:::info Multi-tenancy availability
- Multi-tenancy added in `v1.20`
:::

To separate data within a cluster, use multi-tenancy. Weaviate partitions the cluster into shards. Each shard holds data for a single tenant.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'background': '#f5f5f5' }}}%%
flowchart TB
    subgraph MultiDB ["Multi-Tenant"]
        direction LR
        subgraph MTCollection["🗄️ Collection"]
            direction LR
            MTCollectionConfig["Collection Configuration <br/><br/>(e.g. data schema, <br/>embedding model integration, <br/>index configurations, <br/>replication config, etc.)"]
        end

        ShardA["Tenant A Shard"]
        IndexA["Indexes"]
        StoreA["Object Store"]

        ShardB["Tenant B Shard"]
        IndexB["Indexes"]
        StoreB["Object Store"]

        ShardC["Tenant C Shard"]
        IndexC["Indexes"]
        StoreC["Object Store"]

        MTCollection --> ShardA
        MTCollection --> ShardB
        MTCollection --> ShardC

        ShardA --> IndexA
        ShardA --> StoreA

        ShardB --> IndexB
        ShardB --> StoreB

        ShardC --> IndexC
        ShardC --> StoreC
    end

    subgraph SingleDB ["Single Collection"]
        direction LR
        subgraph SingleCollection["🗄️ Collection"]
            direction LR
            SingleCollectionConfig["Collection Configuration <br/><br/>(e.g. data schema, <br/>embedding model integration, <br/>index configurations, <br/>replication config, etc.)"]
        end

        SingleIndexes["Indexes"]
        SingleStore["Object Store"]

        SingleCollection --> SingleIndexes
        SingleCollection --> SingleStore
    end

    %% Style nodes - Single tenant
    style SingleCollection fill:#ffffff,stroke:#130C49,color:#130C49,stroke-width:2px
    style SingleIndexes fill:#FFF3E0,stroke:#FFB74D,color:#130C49
    style SingleStore fill:#E3F2FD,stroke:#64B5F6,color:#130C49

    %% Style nodes - Multi tenant
    style MTCollection fill:#ffffff,stroke:#130C49,color:#130C49,stroke-width:2px
    style ShardA fill:#ffffff,stroke:#130C49,color:#130C49,stroke-width:2px
    style ShardB fill:#ffffff,stroke:#130C49,color:#130C49,stroke-width:2px
    style ShardC fill:#ffffff,stroke:#130C49,color:#130C49,stroke-width:2px

    %% Style tenant resources
    style IndexA fill:#FFF3E0,stroke:#FFB74D,color:#130C49
    style IndexB fill:#FFF3E0,stroke:#FFB74D,color:#130C49
    style IndexC fill:#FFF3E0,stroke:#FFB74D,color:#130C49
    style StoreA fill:#E3F2FD,stroke:#64B5F6,color:#130C49
    style StoreB fill:#E3F2FD,stroke:#64B5F6,color:#130C49
    style StoreC fill:#E3F2FD,stroke:#64B5F6,color:#130C49

    %% Style subgraphs
    style SingleDB fill:transparent,stroke:#7AD6EB,stroke-width:2px,color:#130C49
    style MultiDB fill:transparent,stroke:#7AD6EB,stroke-width:2px,color:#130C49
    style MTCollectionConfig fill:#f5f5f5,stroke:#130C49,color:#130C49,stroke-width:2px
    style SingleCollectionConfig fill:#f5f5f5,stroke:#130C49,color:#130C49,stroke-width:2px
```

Sharding has several benefits:

- Data isolation
- Fast, efficient querying
- Easy and robust setup and clean up

Tenant shards are more lightweight. You can easily have 50,000, or more, active shards per node. This means that you can support 1M concurrently active tenants with just 20 or so nodes.

Multi-tenancy is especially useful when you want to store data for multiple customers, or when you want to store data for multiple projects.

:::caution Tenant deletion == Tenant data deletion
Deleting a tenant deletes the associated shard. As a result, deleting a tenant also deletes all of its objects.
:::

### Tenant states

:::info Multi-tenancy availability
- Tenant activity status setting added in `v1.21`
- `OFFLOADED` status added in `v1.26`
:::

Tenants have an activity status (also called a tenant state) that reflects their availability and storage location. A tenant can be `ACTIVE`, `INACTIVE`, `OFFLOADED`, `OFFLOADING`, or `ONLOADING`.

- `ACTIVE` tenants are loaded and available for read and write operations.
- In all other states, the tenant is not available for read or write access. Access attempts return an error message.
    - `INACTIVE` tenants are stored on local disk storage for quick activation.
    - `OFFLOADED` tenants are stored on cloud storage. This status is useful for long-term storage for tenants that are not frequently accessed.
    - `OFFLOADING` tenants are being moved to cloud storage. This is a transient status, and therefore not user-specifiable.
    - `ONLOADING` tenants are being loaded from cloud storage. This is a transient status, and therefore not user-specifiable. An `ONLOADING` tenant may be being warmed to a `ACTIVE` status or a `INACTIVE` status.

For more details on managing tenants, see [Multi-tenancy operations](../manage-collections/multi-tenancy.mdx).

| Status | Available | Description | User-specifiable |
| :-- | :-- | :-- | :-- |
| `ACTIVE` | Yes | Loaded and available for read/write operations. | Yes |
| `INACTIVE` | No | On local disk storage, no read / write access. Access attempts return an error message. | Yes |
| `OFFLOADED` | No | On cloud storage, no read / write access. Access attempts return an error message. | Yes |
| `OFFLOADING` | No | Being moved to cloud storage, no read / write access. Access attempts return an error message. | No |
| `ONLOADING` | No | Being loaded from cloud storage, no read / write access. Access attempts return an error message. | No |

:::info Tenant status renamed in `v1.26`
In `v1.26`, the `HOT` status was renamed to `ACTIVE` and the `COLD` status was renamed to `INACTIVE`.
:::

:::info Tenant state propagation
A tenant state change may take some time to propagate across a cluster, especially a multi-node cluster.

<br/>

For example, data may not be immediately available after reactivating an offloaded tenant. Similarly, data may not be immediately unavailable after offloading a tenant. This is because the [tenant states are eventually consistent](../concepts/replication-architecture/consistency.md#tenant-states-and-data-objects), and the change must be propagated to all nodes in the cluster.
:::

#### Offloaded tenants

:::info Added in `v1.26.0`
:::

import OffloadingLimitation from '/_includes/offloading-limitation.mdx';

<OffloadingLimitation/>

Offloading tenants requires the relevant `offload-<storage>` module to be [enabled](../configuration/modules.md) in the Weaviate cluster.

When a tenant is offloaded, the entire tenant shard is moved to cloud storage. This is useful for long-term storage of tenants that are not frequently accessed. Offloaded tenants are not available for read or write operations until they are loaded back into the cluster.

### Backups

:::caution Backups do not include inactive or offloaded tenants
Backups of multi-tenant collections will only include `active` tenants, and not `inactive` or `offloaded` tenants. [Activate tenants](../manage-collections/multi-tenancy.mdx#manage-tenant-states) before creating a backup to ensure all data is included.
:::

### Tenancy and IDs

Each tenancy is like a namespace, so different tenants could, in theory, have objects with the same IDs. To avoid naming problems, object IDs in multi-tenant clusters combine the tenant ID and the object ID to create an ID that is unique across tenants.

### Tenancy and cross-references

Multi-tenancy supports some cross-references.

Cross-references like these are supported:

- From a multi-tenancy object to a non-multi-tenancy object.
- From a multi-tenancy object to another multi-tenancy object, as long as they belong to the same tenant.

Cross-references like these are not supported:

- From a non-multi-tenancy object to a multi-tenancy object.
- From a multi-tenancy object to another multi-tenancy object if they belong to different tenants.

### Key features

- Each tenant has a dedicated, high-performance vector index. Dedicated indexes mean faster query speeds. Instead of searching a shared index space, each tenant responds as if it was the only user on the cluster.
- Each tenant's data is isolated on a dedicated shard. This means that deletes are fast and do not affect other tenants.
- To scale out, add a new node to your cluster. Weaviate does not redistribute existing tenants, however Weaviate adds new tenants to the node with the least resource usage.

:::info Related pages
- [How-to: Manage Data | Multi-tenancy operations](../manage-collections/multi-tenancy.mdx)
- [Multi-tenancy blog](https://weaviate.io/blog/multi-tenancy-vector-search)
:::

### Monitoring metrics

To group tenants together for monitoring, set [`PROMETHEUS_MONITORING_GROUP = true`](/deploy/configuration/env-vars/index.md) in your system configuration file.

### Number of tenants per node

The number of tenants per node is limited by operating system constraints. The number of tenants cannot exceed the Linux open file limit per process.

For example, a 9-node test cluster built on `n1-standard-8` machines holds around 170k active tenants. There are 18,000 to 19,000 tenants per node.

Note that these numbers relate to active tenants only. If you [set unused tenants as `inactive`](../manage-collections/multi-tenancy.mdx#manage-tenant-states), the open file per process limit does not apply.

## Related pages

For more information, see the following:

- [How-to: Multi-tenancy operations](../manage-collections/multi-tenancy.mdx)
- <SkipLink href="/weaviate/api/rest#tag/schema">References: REST API: Schema</SkipLink>
- [How-to: Manage collections](../manage-collections/index.mdx)

## Summary

* The schema defines collections and properties.
* Collections contain data objects that are describe in JSON documents.
* Data objects can contain a vector and properties.
* Vectors come from machine learning models.
* Different collections represent different vector spaces.
* Cross-references link objects between schemas.
* Multi-tenancy isolates data for each tenant.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
