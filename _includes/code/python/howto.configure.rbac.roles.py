from weaviate.classes.rbac import Permissions

# START AdminClient
import weaviate
from weaviate.classes.init import Auth

# Connect to Weaviate as root user
client = weaviate.connect_to_local(
    # END AdminClient
    # Use custom port defined in tests/docker-compose-rbac.yml (without showing the user)
    port=8580,
    grpc_port=50551,
    # START AdminClient
    auth_credentials=Auth.api_key("root-user-key"),
)
# END AdminClient

all_roles = client.roles.list_all()
for role_name, _ in all_roles.items():
    if role_name not in ["viewer", "root", "admin"]:
        client.roles.delete(role_name=role_name)

# # START CreateRole
# client.roles.create(role_name="testRole")
# # END CreateRole

# START AddManageRolesPermission
from weaviate.classes.rbac import Permissions, RoleScope

permissions = [
    Permissions.roles(
        role="testRole*",  # Applies to all roles starting with "testRole"
        scope=RoleScope.MATCH,  # Only allow role management with the current user's permission level
        # scope=RoleScope.ALL   # Allow role management with all permissions
        create=True,  # Allow creating roles
        read=True,  # Allow reading roles
        update=True,  # Allow updating roles
        delete=True,  # Allow deleting roles
    )
]

client.roles.create(role_name="testRole", permissions=permissions)
# END AddManageRolesPermission

assert "testRole" in client.roles.list_all().keys()

client.roles.delete("testRole")

# START AddManageUsersPermission
from weaviate.classes.rbac import Permissions

permissions = [
    Permissions.users(
        user="testUser*",  # Applies to all users starting with "testUser"
        create=True,  # Allow creating users
        read=True,  # Allow reading user info
        update=True,  # Allow rotating user API key
        delete=True,  # Allow deleting users
        assign_and_revoke=True,  # Allow assigning and revoking roles to and from users
    )
]

client.roles.create(role_name="testRole", permissions=permissions)
# END AddManageUsersPermission

assert "testRole" in client.roles.list_all().keys()

client.roles.delete("testRole")

# START AddCollectionsPermission
from weaviate.classes.rbac import Permissions

permissions = [
    Permissions.collections(
        collection="TargetCollection*",  # Applies to all collections starting with "TargetCollection"
        create_collection=True,  # Allow creating new collections
        read_config=True,  # Allow reading collection info/metadata
        update_config=True,  # Allow updating collection configuration, i.e. update schema properties, when inserting data with new properties
        delete_collection=True,  # Allow deleting collections
    ),
]

client.roles.create(role_name="testRole", permissions=permissions)
# END AddCollectionsPermission
permissions = client.roles.get(role_name="testRole")
assert any(
    permission.collection == "TargetCollection*"
    for permission in permissions.collections_permissions
)

client.roles.delete("testRole")

# START AddTenantPermission
from weaviate.classes.rbac import Permissions

permissions = [
    Permissions.tenants(
        collection="TargetCollection*",  # Applies to all collections starting with "TargetCollection"
        tenant="TargetTenant*",  # Applies to all tenants starting with "TargetTenant"
        create=True,  # Allow creating new tenants
        read=True,  # Allow reading tenant info/metadata
        update=True,  # Allow updating tenant states
        delete=True,  # Allow deleting tenants
    ),
]

client.roles.create(role_name="testRole", permissions=permissions)
# END AddTenantPermission
permissions = client.roles.get(role_name="testRole")
assert any(
    permission.collection == "TargetCollection*"
    for permission in permissions.tenants_permissions
)

client.roles.delete("testRole")

# START AddDataObjectPermission
from weaviate.classes.rbac import Permissions

permissions = [
    Permissions.data(
        collection="TargetCollection*",  # Applies to all collections starting with "TargetCollection"
        tenant="TargetTenant*",  # Applies to all tenants starting with "TargetTenant"
        create=True,  # Allow data inserts
        read=True,  # Allow query and fetch operations
        update=True,  # Allow data updates
        delete=False,  # Allow data deletes
    ),
]

client.roles.create(role_name="testRole", permissions=permissions)
# END AddDataObjectPermission
permissions = client.roles.get(role_name="testRole")
assert any(
    permission.collection == "TargetCollection*"
    for permission in permissions.data_permissions
)

client.roles.delete("testRole")

# START AddBackupPermission
from weaviate.classes.rbac import Permissions

permissions = [
    Permissions.backup(
        collection="TargetCollection*",  # Applies to all collections starting with "TargetCollection"
        manage=True,  # Allow managing backups
    ),
]

client.roles.create(role_name="testRole", permissions=permissions)
# END AddBackupPermission
permissions = client.roles.get(role_name="testRole")
assert any(
    permission.collection == "TargetCollection*"
    for permission in permissions.backups_permissions
)

client.roles.delete("testRole")

# START AddClusterPermission
from weaviate.classes.rbac import Permissions

permissions = [
    Permissions.cluster(read=True),  # Allow reading cluster data
]

client.roles.create(role_name="testRole", permissions=permissions)
# END AddClusterPermission
permissions = client.roles.get(role_name="testRole")
assert permissions.cluster_permissions

client.roles.delete("testRole")

# START AddNodesPermission
from weaviate.classes.rbac import Permissions

verbose_permissions = [
    Permissions.Nodes.verbose(
        collection="TargetCollection*",  # Applies to all collections starting with "TargetCollection"
        read=True,  # Allow reading node metadata
    ),
]

# The `minimal` verbosity level applies to all collections unlike
# the `verbose` level where you specify the collection name filter
minimal_permissions = [
    Permissions.Nodes.minimal(
        read=True,  # Allow reading node metadata
    ),
]

client.roles.create(
    role_name="testRole", permissions=verbose_permissions
)  # or `minimal_permissions`
# END AddNodesPermission

permissions = client.roles.get(role_name="testRole")
assert any(
    permission.collection == "TargetCollection*"
    for permission in permissions.nodes_permissions
)

client.roles.delete("testRole")

# START AddAliasPermission
from weaviate.classes.rbac import Permissions

permissions = [
    Permissions.alias(
        alias="TargetAlias*",  # Applies to all aliases starting with "TargetAlias"
        collection="TargetCollection*",  # Applies to all collections starting with "TargetCollection"
        create=True,  # Allow alias creation
        read=True,  # Allow listing aliases
        update=True,  # Allow updating aliases
        delete=False,  # Allow deleting aliases
    ),
]

client.roles.create(role_name="testRole", permissions=permissions)
# END AddAliasPermission

permissions = client.roles.get(role_name="testRole")
assert any(
    permission.alias == "TargetAlias*"
    for permission in permissions.alias_permissions
)

client.roles.delete("testRole")

# START AddReplicationsPermission
from weaviate.classes.rbac import Permissions

permissions = [
    Permissions.replicate(
        collection="TargetCollection*",  # Applies to all collections starting with "TargetCollection"
        shard="TargetShard*",  # Applies to all shards starting with "TargetShard"
        create=True,  # Allow replica movement operations
        read=True,  # Allow retrieving replication status
        update=True,  # Allow cancelling replication operations
        delete=False,  # Allow deleting replication operations
    ),
]

client.roles.create(role_name="testRole", permissions=permissions)
# END AddReplicationsPermission

permissions = client.roles.get(role_name="testRole")
assert any(
    permission.collection == "TargetCollection*" and
    permission.shard == "TargetShard*"
    for permission in permissions.replicate_permissions
)

client.roles.delete("testRole")

permissions = [
    Permissions.collections(
        collection="TargetCollection*",
        read_config=True,
    ),
]

client.roles.create(role_name="testRole", permissions=permissions)

# START AddRoles
from weaviate.classes.rbac import Permissions

permissions = [
    Permissions.data(collection="TargetCollection*", create=True),
]

client.roles.add_permissions(permissions=permissions, role_name="testRole")
# END AddRoles

# START CheckRoleExists
print(client.roles.exists(role_name="testRole"))  # Returns True or False
# END CheckRoleExists

# START InspectRole
test_role = client.roles.get(role_name="testRole")

print(test_role)
print(test_role.collections_permissions)
print(test_role.data_permissions)
# END InspectRole

client.users.db.delete(user_id="custom-user")
client.users.db.create(user_id="custom-user")
client.users.db.assign_roles(user_id="custom-user", role_names=["testRole"])
# START AssignedUsers
assigned_users = client.roles.get_user_assignments(role_name="testRole")

for user in assigned_users:
    print(user)
# END AssignedUsers
assert any(u.user_id == "custom-user" for u in assigned_users)

# START ListAllRoles
all_roles = client.roles.list_all()

for role_name, role in all_roles.items():
    print(role_name, role)
# END ListAllRoles

# START RemovePermissions
from weaviate.classes.rbac import Permissions

permissions = [
    Permissions.collections(
        collection="TargetCollection*",
        read_config=True,
        create_collection=True,
        delete_collection=True,
    ),
    Permissions.data(collection="TargetCollection*", read=True, create=False),
]

client.roles.remove_permissions(role_name="testRole", permissions=permissions)
# END RemovePermissions

# START DeleteRole
client.roles.delete(role_name="testRole")
# END DeleteRole

client.close()
