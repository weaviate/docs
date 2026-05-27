---
title: Namespaces
sidebar_position: 8
image: og/docs/concepts.jpg
description: Namespaces in Weaviate provide cluster-level tenant isolation — every collection and alias belongs to exactly one namespace. One physical cluster can host many isolated logical "customer clusters" with separate users, schemas, and quotas.
# tags: ['namespaces', 'multi-tenancy', 'isolation']
---

import NamespacesPreview from '/_includes/feature-notes/namespaces.mdx';

<NamespacesPreview/>

A **namespace** is a cluster-level isolation boundary. Every collection and alias on a namespace-enabled cluster belongs to **exactly one** namespace. Tenants see short names like `Movies`; the cluster stores qualified names like `customer1:Movies`. One physical Weaviate cluster can host many isolated logical "customer clusters" — each with its own collections, aliases, quotas, and authenticated principals — without anything leaking between them.

## Namespaces vs multi-tenancy

These are **two different features** that sound similar. They are orthogonal and you can use both at once.

|   | Namespaces | Multi-tenancy |
|---|---|---|
| **Scope** | The whole cluster | A single collection |
| **What it isolates** | Collections, aliases, principals, quotas | Object data within one collection |
| **Naming** | Short names map to `namespace:CollectionName` storage | All tenants share the same collection name |
| **Use case** | "One Weaviate cluster, many customer environments" | "One collection, many end-users with isolated rows" |
| **Enabled by** | `NAMESPACES_ENABLED=true` cluster-wide | `MultiTenancyConfig` on the collection |

A multi-tenant collection inside a namespace works exactly as before — namespace scopes the *collection*; multi-tenancy scopes the *data within the collection*.

## Phase status

| Phase | Status | What's in it |
|---|---|---|
| Phase 1 | **Available in `v1.38` Preview** | Collections + aliases scoped per namespace. Operator-managed DB users. The `:` separator is reserved cluster-wide. |
| Phase 2 | Designed, not yet shipped | Namespace-local roles and namespace-scoped role assignment. Namespaced principals creating sub-users. |
| Phase 3 | Deferred | Suspend-on-idle for inactive namespaces. |

This page reflects Phase 1 behavior.

## Mental model

A namespace is a control-plane entity stored in RAFT. It exposes:

- A **name** (`customer1`) — immutable, lowercase ASCII + digits + hyphens, 3–36 chars.
- A **home node** — every collection in the namespace pins all its shards to this node.
- A **state** — `active` or `deleting`.

On a namespace-enabled cluster, the `:` character is **reserved**. Collection, alias, role, and user IDs cannot contain it; the split between namespace and short name is always unambiguous.

## Cluster prerequisites

Namespace mode is opt-in and only supported on newly bootstrapped clusters. Three server-level invariants are checked at startup:

| Setting | Required value | Why |
|---|---|---|
| `NAMESPACES_ENABLED` | `true` | Master switch. Off by default. |
| `DISABLE_GRAPHQL` | `true` | GraphQL introspection cannot be safely scoped per namespace. The two flags are validated together at boot. |
| `REPLICATION_MAXIMUM_FACTOR` | `1` | Every collection in a namespace runs at RF=1 on its single home node. Multi-replica namespaces are out of scope for this preview. |

The server refuses to start if:

- `NAMESPACES_ENABLED=true` is set on a cluster that already has non-namespaced collections.
- `NAMESPACES_ENABLED=false` is set on a cluster that already has namespace entities or namespace-qualified collections.

:::warning Downgrade is not supported

A cluster that has ever run with `NAMESPACES_ENABLED=true` cannot be downgraded to a pre-namespace binary. Plan accordingly.

:::

## Principals: namespaced vs global

Every authenticated request on a namespace-enabled cluster resolves to **exactly one** of two principal kinds:

| Source | Classification |
|---|---|
| **Dynamic DB user** — created via `POST /v1/users/db/{user_id}` | Always **namespaced**. The target namespace is set at create time and cannot change. |
| **Static API key** — configured via `AUTHENTICATION_APIKEY_USERS` + `_ALLOWED_KEYS` | Always **global**. Operator/bootstrap only — not exposed to tenants in managed deployments. |
| **OIDC user** | Classified by token claims — see below. |

### OIDC classification

Two server env vars name the claims used to classify OIDC tokens:

- `OIDC_NAMESPACE_CLAIM` — the claim holding the namespace string.
- `OIDC_GLOBAL_PRINCIPAL_CLAIM` — the claim holding the global-principal boolean.

The token must select exactly one classification:

| Token shape | Result |
|---|---|
| Namespace claim non-empty AND no global claim (or `false`) | Accepted as **namespaced**. |
| Global claim `true` AND no namespace claim (or empty) | Accepted as **global**. |
| Both claims set | **Rejected.** Combining is ambiguous. |
| Neither claim set | **Rejected** on namespace-enabled clusters. |
| Namespace claim names a non-existent namespace | **Rejected.** Weaviate never auto-creates namespaces. |
| Token would otherwise carry `root` (via `AUTHORIZATION_RBAC_ROOT_GROUPS` / `_USERS`) AND a namespace claim | **Rejected with 401.** `root` is cluster-global and cannot coexist with a namespace. |

On clusters with `NAMESPACES_ENABLED=false`, presence of either claim in the token causes the request to be rejected.

### What each kind can do

| | Namespaced | Global |
|---|---|---|
| Create / list / delete collections | ✓ — via short names | ✗ — global principals cannot create collections on namespace-enabled clusters |
| Read / update / delete existing collections | ✓ — via short names in their own namespace | ✓ — via fully-qualified `ns:Name` only |
| `GET /v1/namespaces` | RBAC-filtered (typically empty) | ✓ |
| Create / delete namespaces | ✗ | ✓ (operator-only RBAC) |
| `/v1/backups`, `/v1/replication`, `/v1/nodes` | Blocked via RBAC | ✓ |
| GraphQL | Disabled cluster-wide | Disabled cluster-wide |

### Built-in roles on namespace-enabled clusters

The four built-in roles split into two classes:

- **`root`, `read-only`** — env-var-only operator roles. Not assignable through the role-assignment API. Reserved for explicit global principals.
- **`admin`, `viewer`** — tenant-safe assignable built-ins, narrowed to allowlists over objects/data, collections/schema, multi-tenancy. `viewer` = read/list; `admin` = CRUD within those families.

## Name resolution

```
       stored:  customer1:Movies

namespaced
principal:  → sees Movies
            → submits Movies (auto-qualified to customer1:Movies)
            → submitting customer1:Movies is rejected

global
principal:  → sees customer1:Movies (no stripping)
            → must submit customer1:Movies (short names fall through
                                            the not-found path)
```

For a namespaced caller, Weaviate strips the namespace prefix from responses **at the source** — the point where the response is built. Stripping applies to:

- `GET /v1/schema` and per-class schema responses (`class` + cross-reference target class names)
- Object responses (REST + batch) and `class` fields
- gRPC `SearchReply` (recursive through ref properties)
- Alias responses (alias name and target class name)
- Multi-target beacon URIs (`weaviate://localhost/{class}/{uuid}`)
- 4xx error messages that mention class names
- MCP tool replies that surface collection names
- `getOwnInfo` — a DB user inspecting itself

Stripping uses the caller's **own** namespace. A namespaced caller can never observe another namespace's prefix; the worst-case "leak" would be their own prefix surfacing in a missed strip site.

### References across namespaces don't work

Beacons store the **short** target name in payload — `weaviate://localhost/Movies/uuid`, not `customer1:Movies`. At read time the namespace is resolved from the **source collection**, not from the calling principal. Cross-namespace references therefore don't work: a reference from `customer1:Books → Movies` always resolves to `customer1:Movies`, even when a global principal navigates it.

## Limits

| Limit | Value | Notes |
|---|---|---|
| Replication factor | `1` per namespace | All shards land on the namespace's `home_node`. Updates to `home_node` apply only to *new* shards — existing shards are not moved. |
| Object count per namespace | Soft business control | Evaluated on the home node before write. Updates and deletes are always allowed regardless of quota. Quota is async — small overshoots are expected. |
| Collection count per namespace | Reinterprets `MAXIMUM_ALLOWED_COLLECTIONS_COUNT` as **per-namespace** on NS-enabled clusters | Checked at schema-create time. |
| Vector dimensions per namespace | Reserved in design | Not yet enforced in Phase 1. |

## Disabled and blocked surfaces

### Cluster-wide disabled

- **GraphQL** — required to be off (`DISABLE_GRAPHQL=true`). Use REST and gRPC instead.

### 410 Gone on namespace-enabled clusters

These endpoints lack a class-name path segment to namespace-qualify, are deprecated, or are GraphQL-only. They return `410 Gone` on a namespace-enabled cluster and remain available on non-namespaced clusters:

- Deprecated batch / object endpoints without `className` in the path — the `/objects/{id}` family
- `POST /v1/classifications/...`
- GraphQL endpoints

### Blocked via RBAC

These exist but are typically not granted to namespaced principals:

- `/v1/backups/...`, `/v1/export/...`
- `GET /v1/nodes`, `GET /v1/nodes/{className}`
- `/v1/replication/...`
- `GET /v1/cluster/statistics`
- `/v1/authz/...` role/user CRUD (Phase 1 — unblocks in Phase 2)

`/v1/authz/groups/...` is not applicable on namespace-enabled clusters — namespaces are DB-user / API-key only.

## Cross-feature interactions

| Feature | Behavior on namespace-enabled clusters |
|---|---|
| **Auto-schema** | A namespaced principal who triggers auto-schema creates the resulting class in their own namespace. |
| **Filter parser** | Class names in filter paths are resolved through the namespacing resolver — namespaced callers use short names. |
| **MCP server** | Both `weaviate-get-collection-config` and `weaviate-query-hybrid` resolve short names via the namespacing resolver. Namespaced principals can use MCP tools transparently. |
| **Multi-tenancy** | Orthogonal. A multi-tenant collection inside a namespace works as expected; per-tenant data isolation is preserved within the namespace's collection. |
| **Aliases** | Scoped to a namespace. An alias in `customer1` resolves to a collection in `customer1`. |
| **Audit logging** | Every operation includes the namespace in audit entries — emitted as separate `namespace=` and `collection=` fields (not concatenated), so downstream tooling can filter on namespace without string parsing. |

## Related pages

- [Manage namespaces](../configuration/namespaces.mdx) — operator how-to: enable, create, delete, bootstrap a DB user.
- [Multi-tenancy](../manage-collections/multi-tenancy.mdx) — per-collection tenant isolation (different feature).
- [RBAC](../configuration/rbac/index.mdx) — how the namespaced/global principal split affects roles.
- [Authentication](/deploy/configuration/authentication.md) and [OIDC](/deploy/configuration/oidc.md) — claim configuration for namespace classification.

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
