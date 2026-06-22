# How-to: Manage namespaces — Python examples.
#
# Requires Weaviate v1.38.0+ with NAMESPACES_ENABLED=true, and the Python
# client release that adds namespace support (PR
# weaviate/weaviate-python-client#2033). Examples connect as a global
# (operator) principal; the `client.namespaces.*` endpoints are
# operator-only.

import os
import time

import weaviate
from weaviate.auth import Auth
from weaviate.rbac.models import Permissions


# ==========================================
# ===== Connect as the operator =====
# ==========================================

# START Connect
client = weaviate.connect_to_local(
    auth_credentials=Auth.api_key(os.environ["OPERATOR_API_KEY"]),
)
# END Connect

# Clean up any leftovers from a previous run so the script is idempotent.
for cleanup_ns in ("customer1",):
    existing = client.namespaces.get(name=cleanup_ns)
    if existing is not None and existing.state != "deleting":
        client.namespaces.delete(name=cleanup_ns)
    # Wait for the two-phase cascade cleanup to finish.
    deadline = time.time() + 60
    while client.namespaces.get(name=cleanup_ns) is not None and time.time() < deadline:
        time.sleep(0.5)
for cleanup_role in ("namespaceUser", "namespace_admin", "all_namespace_admin"):
    try:
        client.roles.delete(role_name=cleanup_role)
    except Exception:
        pass


# ==========================================
# ===== Create a namespace =====
# ==========================================

# START CreateNamespace
# Omit home_node to let the cluster pick automatically. To pin the
# namespace's shards to a specific node, pass home_node="<node-name>"
# where <node-name> is a current storage candidate from
# client.cluster.nodes().
ns = client.namespaces.create(name="customer1")
print(ns.name, ns.home_node, ns.state)
# → customer1 <pinned-node> active
# END CreateNamespace


# ==========================================
# ===== Get a single namespace =====
# ==========================================

# START GetNamespace
ns = client.namespaces.get(name="customer1")
if ns is None:
    print("not found")
else:
    print(ns.name, ns.home_node, ns.state)
# END GetNamespace


# ==========================================
# ===== List all namespaces =====
# ==========================================

# START ListNamespaces
for ns in client.namespaces.list_all():
    print(ns.name, ns.state)
# END ListNamespaces


# ==========================================
# ===== Update the home node =====
# ==========================================

# START UpdateNamespace
# Updating home_node only affects future shard placements — existing
# shards are not moved. Pick a storage candidate from
# client.cluster.nodes().
target_node = client.cluster.nodes()[0].name
client.namespaces.update(name="customer1", home_node=target_node)
# END UpdateNamespace


# ==========================================
# ===== Create a role for namespaced principals =====
# ==========================================

# START NamespaceUserRole
# Define the role once at the global level — the RBAC matcher fans the
# collection pattern out per caller's namespace at request time. Do NOT
# hard-code `customer1:` into role definitions.
client.roles.create(
    role_name="namespaceUser",
    permissions=(
        Permissions.collections(
            collection="*",
            create_collection=True,
            read_config=True,
            update_config=True,
            delete_collection=True,
        )
        + Permissions.data(
            collection="*", create=True, read=True, update=True, delete=True
        )
    ),
)
# END NamespaceUserRole


# ==========================================
# ===== Create a namespaced DB user =====
# ==========================================

# START CreateNamespacedUser
# Bind the new DB user to a namespace via the `namespace=` argument. The user
# is stored internally as `customer1:api_user` and can only see resources in
# `customer1`.
api_key = client.users.db.create(user_id="api_user", namespace="customer1")
print(api_key)
# END CreateNamespacedUser


# ==========================================
# ===== Assign the role to the namespaced user =====
# ==========================================

# START AssignNamespaceUserRole
# Address the namespaced user by its fully-qualified internal name.
client.users.db.assign_roles(
    user_id="customer1:api_user", role_names=["namespaceUser"]
)
# END AssignNamespaceUserRole


# ==========================================
# ===== What the namespaced user sees =====
# ==========================================

# START NamespacedUserView
# Connect as the namespaced user (using the api_key from when the user
# was created) and create a collection with a SHORT name — no
# `customer1:` prefix.
ns_client = weaviate.connect_to_local(
    auth_credentials=Auth.api_key(api_key),
)
ns_client.collections.create(name="Movies")

# Listing the schema strips the namespace prefix:
for name in ns_client.collections.list_all():
    print(name)
# → Movies

ns_client.close()
# END NamespacedUserView


# ==========================================
# ===== Define a role with namespace-management permissions =====
# ==========================================

# START NamespacePermissions
# `manage_namespaces` is the operator-only RBAC permission for
# /v1/namespaces CRUD. Scope it to a specific namespace or to all (`*`).
client.roles.create(
    role_name="namespace_admin",
    permissions=Permissions.namespaces(namespace="customer1", manage=True),
)

# Wildcard — manage any namespace
client.roles.create(
    role_name="all_namespace_admin",
    permissions=Permissions.namespaces(namespace="*", manage=True),
)
# END NamespacePermissions


# ==========================================
# ===== Delete a namespace =====
# ==========================================

# START DeleteNamespace
# Two-phase: the namespace flips to `state: deleting`, then a background
# cascade removes its DB users, aliases, and collections. Idempotent —
# repeated calls during cleanup return without error.
client.namespaces.delete(name="customer1")
# END DeleteNamespace


client.close()
