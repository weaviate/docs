import io.weaviate.client6.v1.api.Authentication;
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.rbac.AliasesPermission;
import io.weaviate.client6.v1.api.rbac.BackupsPermission;
import io.weaviate.client6.v1.api.rbac.ClusterPermission;
import io.weaviate.client6.v1.api.rbac.CollectionsPermission;
import io.weaviate.client6.v1.api.rbac.DataPermission;
import io.weaviate.client6.v1.api.rbac.GroupsPermission;
import io.weaviate.client6.v1.api.rbac.NodesPermission;
import io.weaviate.client6.v1.api.rbac.Permission;
import io.weaviate.client6.v1.api.rbac.ReplicatePermission;
import io.weaviate.client6.v1.api.rbac.Role;
import io.weaviate.client6.v1.api.rbac.RolesPermission;
import io.weaviate.client6.v1.api.rbac.TenantsPermission;
import io.weaviate.client6.v1.api.rbac.UsersPermission;
import io.weaviate.client6.v1.api.rbac.groups.GroupType;
import io.weaviate.client6.v1.api.rbac.users.DbUser;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RBACTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    // START AdminClient
    // Connect to Weaviate as root user
    client = WeaviateClient.connectToLocal(config -> config
        // END AdminClient
        // Use custom port defined in tests/docker-compose-rbac.yml
        .port(8580)
        .grpcPort(50551)
        // START AdminClient
        .authentication(Authentication.apiKey("root-user-key")));
    // END AdminClient
    cleanup();
  }

  @AfterAll
  public static void afterAll() throws Exception {
    if (client != null) {
      client.close();
    }
  }

  public static void cleanup() throws IOException {
    // Clean up all test roles
    List<String> builtInRoles = List.of("admin", "root", "viewer", "read-only");
    var allRoles = client.roles.list();
    System.out.println(allRoles);
    for (Role role : allRoles) {
      if (!builtInRoles.contains(role.name())) {
        client.roles.delete(role.name());
      }
    }
    // Clean up all test users
    var allUsers = client.users.db.list();
    System.out.println("num of users:" + allUsers);
    for (DbUser user : allUsers) {
      if (!user.id().equals("root-user")) {
        client.users.db.delete(user.id());
      }
    }
  }

  @Test
  void testRolePermissionTypes() throws IOException {
    // START AddManageRolesPermission
    Permission[] rolesPermissions =
        new Permission[] {Permission.roles("testRole*", // Applies to all roles starting with "testRole"
            RolesPermission.Scope.MATCH, // Only allow role management with the current user's permission level
            // RolesPermission.Scope.ALL,  // Allow role management with all permissions
            RolesPermission.Action.CREATE, // Allow creating roles
            RolesPermission.Action.READ, // Allow reading roles
            RolesPermission.Action.UPDATE, // Allow updating roles
            RolesPermission.Action.DELETE // Allow deleting roles
        )};

    client.roles.create("testRole_ManageRoles", rolesPermissions);
    // END AddManageRolesPermission
    assertThat(client.roles.exists("testRole_ManageRoles")).isTrue();


    // START AddManageUsersPermission
    Permission[] usersPermissions =
        new Permission[] {Permission.users("testUser*", // Applies to all users starting with "testUser"
            UsersPermission.Action.CREATE, // Allow creating users
            UsersPermission.Action.READ, // Allow reading user info
            UsersPermission.Action.UPDATE, // Allow rotating user API key
            UsersPermission.Action.DELETE, // Allow deleting users
            UsersPermission.Action.ASSIGN_AND_REVOKE // Allow assigning and revoking roles to and from users
        )};

    client.roles.create("testRole_ManageUsers", usersPermissions);
    // END AddManageUsersPermission
    assertThat(client.roles.exists("testRole_ManageUsers")).isTrue();


    // START AddCollectionsPermission
    Permission[] collectionsPermissions =
        new Permission[] {Permission.collections("TargetCollection*", // Applies to all collections starting with "TargetCollection"
            CollectionsPermission.Action.CREATE, // Allow creating new collections
            CollectionsPermission.Action.READ, // Allow reading collection info/metadata
            CollectionsPermission.Action.UPDATE, // Allow updating collection configuration
            CollectionsPermission.Action.DELETE // Allow deleting collections
        ),};

    client.roles.create("testRole_ManageCollections", collectionsPermissions);
    // END AddCollectionsPermission
    assertThat(client.roles.exists("testRole_ManageCollections")).isTrue();


    // START AddTenantPermission
    Permission[] tenantsPermissions =
        new Permission[] {Permission.tenants("TargetCollection*", // Applies to all collections starting with "TargetCollection"
            "TargetTenant*", // Applies to all tenants starting with "TargetTenant"
            TenantsPermission.Action.CREATE, // Allow creating new tenants
            TenantsPermission.Action.READ, // Allow reading tenant info/metadata
            TenantsPermission.Action.UPDATE, // Allow updating tenant states
            TenantsPermission.Action.DELETE // Allow deleting tenants
        ),};

    client.roles.create("testRole_ManageTenants", tenantsPermissions);
    // END AddTenantPermission
    assertThat(client.roles.exists("testRole_ManageTenants")).isTrue();

    // TODO[g-despot] Tenants missing from Permission.data
    // START AddDataObjectPermission
    Permission[] dataPermissions =
        new Permission[] {Permission.data("TargetCollection*", // Applies to all collections starting with "TargetCollection"
            // "TargetTenant*", // Applies to all tenants starting with "TargetTenant"
            DataPermission.Action.CREATE, // Allow data inserts
            DataPermission.Action.READ, // Allow query and fetch operations
            DataPermission.Action.UPDATE, // Allow data updates
            DataPermission.Action.DELETE // Allow data deletes (set to false in example)
        ),};

    client.roles.create("testRole_ManageData", dataPermissions);
    // END AddDataObjectPermission
    assertThat(client.roles.exists("testRole_ManageData")).isTrue();


    // START AddBackupPermission
    Permission[] backupPermissions =
        new Permission[] {Permission.backups("TargetCollection*", // Applies to all collections starting with "TargetCollection"
            BackupsPermission.Action.MANAGE // Allow managing backups
        ),};

    client.roles.create("testRole_ManageBackups", backupPermissions);
    // END AddBackupPermission
    assertThat(client.roles.exists("testRole_ManageBackups")).isTrue();


    // START AddClusterPermission
    Permission[] clusterPermissions =
        new Permission[] {Permission.cluster(ClusterPermission.Action.READ), // Allow reading cluster data
        };

    client.roles.create("testRole_ReadCluster", clusterPermissions);
    // END AddClusterPermission
    assertThat(client.roles.exists("testRole_ReadCluster")).isTrue();


    // START AddNodesPermission
    Permission[] verbosePermissions =
        new Permission[] {Permission.nodes("TargetCollection*", // Applies to all collections starting with "TargetCollection"
            NodesPermission.Action.READ // Allow reading node metadata
        ),};

    // The `minimal` verbosity level is not exposed, use the standard one
    // which corresponds to 'verbose'
    client.roles.create("testRole_ReadNodes", verbosePermissions);
    // END AddNodesPermission
    assertThat(client.roles.exists("testRole_ReadNodes")).isTrue();


    // START AddAliasPermission
    Permission[] aliasPermissions =
        new Permission[] {Permission.aliases("TargetAlias*", // Applies to all aliases starting with "TargetAlias"
            "TargetCollection*", // Applies to all collections starting with "TargetCollection"
            AliasesPermission.Action.CREATE, // Allow alias creation
            AliasesPermission.Action.READ, // Allow listing aliases
            AliasesPermission.Action.UPDATE // Allow updating aliases
        // Delete is false in example
        ),};

    client.roles.create("testRole_ManageAliases", aliasPermissions);
    // END AddAliasPermission
    assertThat(client.roles.exists("testRole_ManageAliases")).isTrue();


    // START AddReplicationsPermission
    Permission[] replicatePermissions =
        new Permission[] {Permission.replicate("TargetCollection*", // Applies to all collections starting with "TargetCollection"
            "TargetShard*", // Applies to all shards starting with "TargetShard"
            ReplicatePermission.Action.CREATE, // Allow replica movement operations
            ReplicatePermission.Action.READ, // Allow retrieving replication status
            ReplicatePermission.Action.UPDATE // Allow cancelling replication operations
        // Delete is false in example
        ),};

    client.roles.create("testRole_ManageReplicas", replicatePermissions);
    // END AddReplicationsPermission
    assertThat(client.roles.exists("testRole_ManageReplicas")).isTrue();


    // START AddGroupsPermission
    Permission[] groupsPermissions =
        new Permission[] {Permission.groups("TargetGroup*", // Applies to all groups starting with "TargetGroup"
            GroupType.OIDC, GroupsPermission.Action.READ, // Allow reading group information
            GroupsPermission.Action.ASSIGN_AND_REVOKE // Allow assigning and revoking group memberships
        ),};

    client.roles.create("testRole_ManageGroups", groupsPermissions);
    // END AddGroupsPermission
    assertThat(client.roles.exists("testRole_ManageGroups")).isTrue();
  }

  @Test
  void testRoleLifecycle() throws IOException {
    String testRole = "testRole";
    String testUser = "custom-user";

    Permission[] initialPermissions = new Permission[] {Permission
        .collections("TargetCollection*", CollectionsPermission.Action.READ)};
    client.roles.create(testRole, initialPermissions);

    // START AddRoles
    Permission[] additionalPermissions = new Permission[] {
        Permission.data("TargetCollection*", DataPermission.Action.CREATE)};
    client.roles.addPermissions(testRole, additionalPermissions);
    // END AddRoles

    // START CheckRoleExists
    boolean exists = client.roles.exists(testRole);
    System.out.println(exists); // Returns True or False
    // END CheckRoleExists
    assertThat(exists).isTrue();

    // START InspectRole
    Role testRoleData = client.roles.get(testRole).orElse(null);
    System.out.println(testRoleData);
    System.out.println(testRoleData.permissions()); // Combined list
    // END InspectRole
    assertThat(testRoleData.permissions()).hasSize(2);
    assertThat(testRoleData.permissions()).contains(initialPermissions[0],
        additionalPermissions[0]);

    client.users.db.create(testUser);
    client.users.db.assignRoles(testUser, testRole);

    // START AssignedUsers
    var assignedUsers = client.roles.assignedUserIds(testRole);
    for (String user : assignedUsers) {
      System.out.println(user);
    }
    // END AssignedUsers
    assertThat(assignedUsers).contains(testUser);

    // START ListAllRoles
    List<Role> allRoles = client.roles.list();
    for (Role role : allRoles) {
      System.out.println(role.name() + " " + role);
    }
    // END ListAllRoles
    assertThat(allRoles).anyMatch(r -> r.name().equals(testRole));

    // START RemovePermissions
    Permission[] permissionsToRemove = new Permission[] {
        Permission.collections("TargetCollection*",
            CollectionsPermission.Action.READ),
        Permission.data("TargetCollection*", DataPermission.Action.CREATE),};
    client.roles.removePermissions(testRole, permissionsToRemove);
    // END RemovePermissions
    assertThat(client.roles.get(testRole).get().permissions()).isEmpty();

    // START DeleteRole
    client.roles.delete(testRole);
    // END DeleteRole
    assertThat(client.roles.exists(testRole)).isFalse();
  }

  @Test
  void testRoleExamples() throws IOException {
    String testUser = "custom-user";
    client.users.db.create(testUser);

    // START ReadWritePermissionDefinition
    // Define permissions (example confers read+write rights to collections starting with "TargetCollection")
    Permission[] rwPermissions = new Permission[] {
        // Collection level permissions
        Permission.collections("TargetCollection*",
            CollectionsPermission.Action.CREATE, // Allow creating new collections
            CollectionsPermission.Action.READ, // Allow reading collection info/metadata
            CollectionsPermission.Action.UPDATE, // Allow updating collection configuration
            CollectionsPermission.Action.DELETE // Allow deleting collections
        ),
        // Collection data level permissions
        Permission.data("TargetCollection*", DataPermission.Action.CREATE, // Allow data inserts
            DataPermission.Action.READ, // Allow query and fetch operations
            DataPermission.Action.UPDATE, // Allow data updates
            DataPermission.Action.DELETE // Allow data deletes (set to false in example)
        ),
        Permission.backups("TargetCollection*",
            BackupsPermission.Action.MANAGE),
        Permission.nodes("TargetCollection*", NodesPermission.Action.READ),
        Permission.cluster(ClusterPermission.Action.READ),};

    // Create a new role
    client.roles.create("rw_role", rwPermissions);
    // END ReadWritePermissionDefinition

    // START ReadWritePermissionAssignment
    // Assign the role to a user
    client.users.db.assignRoles(testUser, "rw_role");
    // END ReadWritePermissionAssignment

    var userRoles = client.users.db.assignedRoles(testUser);
    assertThat(userRoles).anyMatch(r -> r.name().equals("rw_role"));
    client.users.db.revokeRoles(testUser, "rw_role"); // Clean up for next assignment

    // START ViewerPermissionDefinition
    // Define permissions (example confers viewer rights to collections starting with "TargetCollection")
    Permission[] viewerPermissions = new Permission[] {
        Permission.collections("TargetCollection*",
            CollectionsPermission.Action.READ),
        Permission.data("TargetCollection*", DataPermission.Action.READ),};

    // Create a new role
    client.roles.create("viewer_role", viewerPermissions);
    // END ViewerPermissionDefinition

    // START ViewerPermissionAssignment
    // Assign the role to a user
    client.users.db.assignRoles(testUser, "viewer_role");
    // END ViewerPermissionAssignment
    userRoles = client.users.db.assignedRoles(testUser);
    assertThat(userRoles).anyMatch(r -> r.name().equals("viewer_role"));
    client.users.db.revokeRoles(testUser, "viewer_role"); // Clean up for next assignment

    // START MTPermissionsExample
    Permission[] mtPermissions =
        new Permission[] {Permission.tenants("TargetCollection*", // Applies to all collections starting with "TargetCollection"
            "TargetTenant*", // Applies to all tenants starting with "TargetTenant"
            TenantsPermission.Action.CREATE, // Allow creating new tenants
            TenantsPermission.Action.READ, // Allow reading tenant info/metadata
            TenantsPermission.Action.UPDATE, // Allow updating tenant states
            TenantsPermission.Action.DELETE // Allow deleting tenants
        ), Permission.data("TargetCollection*", // Applies to all collections starting with "TargetCollection"
            // "TargetTenant*", // Applies to all tenants starting with "TargetTenant"
            DataPermission.Action.CREATE, // Allow data inserts
            DataPermission.Action.READ, // Allow query and fetch operations
            DataPermission.Action.UPDATE, // Allow data updates
            DataPermission.Action.DELETE // Allow data deletes
        ),};

    // Create a new role
    client.roles.create("tenant_manager", mtPermissions);
    // END MTPermissionsExample

    // START MTPermissionsAssignment
    // Assign the role to a user
    client.users.db.assignRoles(testUser, "tenant_manager");
    // END MTPermissionsAssignment
    userRoles = client.users.db.assignedRoles(testUser);
    assertThat(userRoles).anyMatch(r -> r.name().equals("tenant_manager"));
  }

  @Test
  void testUserLifecycle() throws IOException {
    String testUser = "custom-user";
    String testRole = "testRole";

    client.users.db.delete(testUser);
    // START CreateUser
    String userApiKey = client.users.db.create(testUser);
    System.out.println(userApiKey);
    // END CreateUser
    assertThat(userApiKey).isNotNull().isNotEmpty();

    // START RotateApiKey
    String newApiKey = client.users.db.rotateKey(testUser);
    System.out.println(newApiKey);
    // END RotateApiKey
    assertThat(newApiKey).isNotNull().isNotEmpty().isNotEqualTo(userApiKey);

    Permission[] permissions = new Permission[] {Permission
        .collections("TargetCollection*", CollectionsPermission.Action.READ),};
    client.roles.create(testRole, permissions);

    // START AssignRole
    client.users.db.assignRoles(testUser, testRole, "viewer");
    // END AssignRole
    var roles = client.users.db.assignedRoles(testUser);
    assertThat(roles).extracting(Role::name).contains(testRole, "viewer");

    // START ListAllUsers
    var allUsers = client.users.db.list();
    System.out.println(allUsers);
    // END ListAllUsers
    assertThat(allUsers).anyMatch(u -> u.id().equals(testUser));

    // START ListUserRoles
    var userRoles = client.users.db.assignedRoles(testUser);
    for (Role role : userRoles) {
      System.out.println(role.name());
    }
    // END ListUserRoles
    assertThat(userRoles).extracting(Role::name).contains(testRole, "viewer");

    // START RevokeRoles
    client.users.db.revokeRoles(testUser, testRole);
    // END RevokeRoles
    roles = client.users.db.assignedRoles(testUser);
    assertThat(roles).extracting(Role::name)
        .doesNotContain(testRole)
        .contains("viewer");

    // START DeleteUser
    client.users.db.delete(testUser);
    // END DeleteUser
    assertThat(client.users.db.byName(testUser)).isEmpty();
  }
}
