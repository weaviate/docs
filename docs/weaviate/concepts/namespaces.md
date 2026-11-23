---
title: Namespaces
sidebar_position: 31
image: og/docs/concepts.jpg
description: Namespaces are cluster-level containers. Each one owns its own collections, aliases, database users, and roles, so a single Weaviate cluster can host many isolated environments.
# tags: ['namespaces', 'multi-tenancy', 'isolation']
---

import NamespacesNote from '/_includes/feature-notes/namespaces.mdx';

<NamespacesNote/>

A **namespace** is a cluster-level container. It owns collections, aliases, database users, and RBAC roles, so one Weaviate cluster can host many separate environments.

For example, a user in the namespace `customer1` creates a collection called `Movies`. The cluster stores it under the qualified name `customer1:Movies`, but that user only ever sees the short name `Movies`. A user in another namespace can create their own `Movies` collection without a collision.

A Weaviate namespace is unrelated to a Kubernetes namespace. A Weaviate namespace groups database objects inside one cluster.

To enable namespaces and manage them, see [Manage namespaces](../configuration/namespaces.mdx).

## Namespaces vs multi-tenancy

Namespaces and [multi-tenancy](../manage-collections/multi-tenancy.mdx) solve different problems. You can use both at once.

|   | Namespaces | Multi-tenancy |
|---|---|---|
| **Scope** | The whole cluster | A single collection |
| **What it separates** | Collections, aliases, database users, and roles | Object data within one collection |
| **Enabled by** | `NAMESPACES_ENABLED` on the cluster | `multiTenancyConfig` on the collection |

Multi-tenancy works the same inside a namespace. Tenant shards are placed on the namespace's home nodes like any other shard.

## Namespace names

A namespace name must be:

- 3 to 36 characters long.
- Lowercase ASCII letters, digits, and hyphens only, starting and ending with a letter or a digit.
- Not one of the reserved names: `admin`, `system`, `default`, `internal`, `weaviate`, `global`, `public`.

On a namespace-enabled cluster, `:` separates a namespace from a short name, so collection and alias names can't contain it.

## Principals and name resolution {#principals}

Every authenticated request on a namespace-enabled cluster comes from either a namespaced or a global principal.

- A **namespaced principal** is bound to one namespace. It is a database user created in that namespace, or an OIDC identity whose token carries the namespace claim. It sends and receives short names, such as `Movies`. Weaviate adds and removes the namespace prefix. It can't send a qualified name. A namespaced principal can't hold the `root` role.
- A **global principal** is not bound to a namespace. It sends and receives qualified names, such as `customer1:Movies`. Operators who create and manage namespaces are global principals.

A reference can't cross namespaces. Weaviate resolves a reference target in the namespace of the source collection.

## Home nodes

Every shard of every collection in a namespace, including tenant shards, is placed on the namespace's home nodes. A namespace-enabled cluster requires `REPLICATION_MAXIMUM_FACTOR=1`, so every namespaced collection has a replication factor of `1`. A new collection or tenant goes on the first available home node in the `home_nodes` list, so later entries act as fallbacks. If you create a namespace without `home_nodes`, Weaviate picks one node.

TODO(Ivan): confirm with core whether the `REPLICATION_MAXIMUM_FACTOR=1` requirement stays for v1.41.0 GA.

<!-- TODO(Ivan): confirm with core whether the REPLICATION_MAXIMUM_FACTOR=1 requirement stays for v1.41.0 GA (adapters/handlers/rest/configure_api.go:1278-1283 at 3507945a). -->

When you change a namespace's home nodes, only future placements use the new list. That covers new collections, new tenants, and reactivated tenants. Existing shards stay where they are.

## Namespace lifecycle

A namespace is `active`, `suspended`, or `deleting`.

### What suspension does

While a namespace is suspended:

- Its database users can't log in with an API key or OIDC.
- New collections, aliases, users, roles, and role assignments in the namespace are refused.
- Changes to the namespace's collection definitions, properties, and indexes are refused.
- Data requests to the namespace's collections are refused.
- Replica movements for the namespace's shards are refused.
- A background job on every node unloads the namespace's shards to free their memory. It runs every [`SUSPEND_RECONCILE_INTERVAL`](/deploy/configuration/env-vars/index.md#SUSPEND_RECONCILE_INTERVAL).

Weaviate keeps everything the namespace owns. Nothing is deleted.

Refused logins, and refused database user creation and import, don't name the namespace. They read `instance suspended`. To replace that text, set [`NAMESPACE_SUSPENDED_MESSAGE`](/deploy/configuration/env-vars/index.md#NAMESPACE_SUSPENDED_MESSAGE).

For the status codes of refused requests, see [Errors](../configuration/namespaces.mdx#errors).

### Deletion is asynchronous

Deleting a namespace marks it `deleting` and returns at once. A background job on the cluster leader then removes the namespace's database users, aliases, collections, and roles, and finally the namespace itself. The job runs every [`NAMESPACE_CLEANUP_INTERVAL`](/deploy/configuration/env-vars/index.md#NAMESPACE_CLEANUP_INTERVAL) and retries until the namespace is empty.

## Limits

| Limit | Behavior on a namespace-enabled cluster |
|---|---|
| **Shards per collection** | `1`. A collection can't set a `desiredCount` other than `1`. |
| **GraphQL** | Unavailable. Use the REST and gRPC APIs. |
| **gRPC** | Carries short collection names. gRPC has no namespace field. You manage namespaces over REST only. |
| **Node removal** | You can't remove a node from the cluster while it is a home node of any namespace. |

## Further resources

- [Manage namespaces](../configuration/namespaces.mdx)
- [Weaviate Enterprise Editions](/deploy/enterprise)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
