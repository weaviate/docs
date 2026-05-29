---
title: Namespaces
sidebar_position: 8
image: og/docs/concepts.jpg
description: Namespaces in Weaviate provide cluster-level isolation — every collection and alias belongs to exactly one namespace. One physical cluster can host many isolated logical "customer clusters" with separate users, schemas, and quotas.
# tags: ['namespaces', 'multi-tenancy', 'isolation']
---

import NamespacesPreview from '/_includes/feature-notes/namespaces.mdx';
import NamespacesOverview from '/_includes/namespaces-overview.mdx';

<NamespacesPreview/>

<NamespacesOverview/>

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

## Cluster prerequisites

Namespace mode is opt-in and only supported on new clusters. Three server-level invariants are checked at startup:

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

### Naming rules

- 3–36 characters
- `[a-z0-9][a-z0-9-]*[a-z0-9]` — lowercase ASCII, digits, hyphens; cannot start or end with a hyphen
- Cannot contain `:` (the namespace separator, reserved cluster-wide)
- Not in the reserved list: `admin`, `system`, `default`, `internal`, `weaviate`, `global`, `public`

The name is **immutable** after create. To rename, delete the namespace (which cascades to all its collections, aliases, and users) and create a new one.

## Principals: namespaced vs global

Every authenticated request on a namespace-enabled cluster resolves to **exactly one** of two principal kinds:

| Source | Classification |
|---|---|
| **Dynamic DB user** — created via `POST /v1/users/db/{user_id}` | Always **namespaced**. The target namespace is set at create time and cannot change. |
| **Static API key** — configured via `AUTHENTICATION_APIKEY_USERS` + `_ALLOWED_KEYS` | Always **global**. Operator/bootstrap only — not exposed to namespaced principals in managed deployments. |
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
- **`admin`, `viewer`** — assignable built-ins safe to grant to namespaced principals, narrowed to allowlists over objects/data, collections/schema, multi-tenancy. `viewer` = read/list; `admin` = CRUD within those families.

## Name resolution

Take a collection stored as `customer1:Movies`. A **namespaced principal** sees the short name `Movies`; it submits `Movies` (which Weaviate auto-qualifies to `customer1:Movies`), and submitting the qualified `customer1:Movies` directly is rejected. A **global principal** sees the qualified `customer1:Movies` with no stripping, and must submit `customer1:Movies` — short names fall through the not-found path.

For a namespaced caller, Weaviate strips the namespace prefix from responses **at the source** — the point where the response is built.
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

## Cross-feature interactions

| Feature | Behavior on namespace-enabled clusters |
|---|---|
| **Auto-schema** | A namespaced principal who triggers auto-schema creates the resulting collection in their own namespace. |
| **Filter parser** | Collection names in filter paths are resolved through the namespacing resolver — namespaced callers use short names. |
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
