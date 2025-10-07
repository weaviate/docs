package io.weaviate.docs;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.rbac.model.*;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class RbacManagementTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws AuthException {
    // START AdminClient
    String scheme = "http";
    String host = "localhost";
    String port = "8580"; // Custom port for RBAC testing

    Config config = new Config(scheme, host + ":" + port);

    client = WeaviateAuthClient.apiKey(config, "root-user-key");
    // END AdminClient
  }

  @BeforeEach
  public void cleanup() {
    // Clean up test roles before each test
    Result<List<Role>> roles = client.roles().allGetter().run();
    if (roles.getResult() != null) {
      for (Role role : roles.getResult()) {
        if (!Arrays.asList("viewer", "root", "admin", "read-only").contains(role.getName())) {
          client.roles().deleter().withName(role.getName()).run();
        }
      }
    }
  }

  @Test
  public void shouldAddManageRolesPermission() {
    // START AddManageRolesPermission
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.roles(
            "testRole*", // Applies to all roles starting with "testRole"
            RolesPermission.Action.CREATE, // Allow creating roles
            RolesPermission.Action.READ, // Allow reading roles
            RolesPermission.Action.UPDATE, // Allow updating roles
            RolesPermission.Action.DELETE // Allow deleting roles
        )
    };

    Result<Boolean> createResult = client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();
    // END AddManageRolesPermission

    assertThat(createResult.getError()).isNull();
    assertTrue(createResult.getResult());

    Result<Boolean> exists = client.roles().exists()
        .withName("testRole")
        .run();
    assertTrue(exists.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldAddManageUsersPermission() {
    // START AddManageUsersPermission
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.users(
            UsersPermission.Action.CREATE, // Allow creating users
            UsersPermission.Action.READ, // Allow reading user info
            UsersPermission.Action.UPDATE, // Allow rotating user API key
            UsersPermission.Action.DELETE, // Allow deleting users
            UsersPermission.Action.ASSIGN_AND_REVOKE // Allow assigning and revoking roles
        )
    };

    Result<Boolean> createResult = client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();
    // END AddManageUsersPermission

    assertThat(createResult.getError()).isNull();
    assertTrue(createResult.getResult());

    Result<Boolean> exists = client.roles().exists()
        .withName("testRole")
        .run();
    assertTrue(exists.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldAddCollectionsPermission() {
    // START AddCollectionsPermission
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.collections(
            "TargetCollection*", // Applies to all collections starting with "TargetCollection"
            CollectionsPermission.Action.CREATE, // Allow creating new collections
            CollectionsPermission.Action.READ, // Allow reading collection info/metadata
            CollectionsPermission.Action.UPDATE, // Allow updating collection configuration
            CollectionsPermission.Action.DELETE // Allow deleting collections
        )
    };

    Result<Boolean> createResult = client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();
    // END AddCollectionsPermission

    assertThat(createResult.getError()).isNull();
    assertTrue(createResult.getResult());

    Result<Role> role = client.roles().getter()
        .withName("testRole")
        .run();
    assertNotNull(role.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldAddTenantPermission() {
    // START AddTenantPermission
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.tenants(
            TenantsPermission.Action.CREATE, // Allow creating new tenants
            TenantsPermission.Action.READ, // Allow reading tenant info/metadata
            TenantsPermission.Action.UPDATE, // Allow updating tenant states
            TenantsPermission.Action.DELETE // Allow deleting tenants
        )
    };

    Result<Boolean> createResult = client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();
    // END AddTenantPermission

    assertThat(createResult.getError()).isNull();
    assertTrue(createResult.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldAddDataObjectPermission() {
    // START AddDataObjectPermission
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.data(
            "TargetCollection*", // Applies to all collections starting with "TargetCollection"
            DataPermission.Action.CREATE, // Allow data inserts
            DataPermission.Action.READ, // Allow query and fetch operations
            DataPermission.Action.UPDATE // Allow data updates
        // Note: DELETE is not included, similar to Python example
        )
    };

    Result<Boolean> createResult = client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();
    // END AddDataObjectPermission

    assertThat(createResult.getError()).isNull();
    assertTrue(createResult.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldAddBackupPermission() {
    // START AddBackupPermission
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.backups(
            "TargetCollection*", // Applies to all collections starting with "TargetCollection"
            BackupsPermission.Action.MANAGE // Allow managing backups
        )
    };

    Result<Boolean> createResult = client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();
    // END AddBackupPermission

    assertThat(createResult.getError()).isNull();
    assertTrue(createResult.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldAddClusterPermission() {
    // START AddClusterPermission
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.cluster(ClusterPermission.Action.READ) // Allow reading cluster data
    };

    Result<Boolean> createResult = client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();
    // END AddClusterPermission

    assertThat(createResult.getError()).isNull();
    assertTrue(createResult.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldAddNodesPermission() {
    // START AddNodesPermission
    // Verbose permissions - applies to specific collections
    Permission<?>[] verbosePermissions = new Permission<?>[] {
        Permission.nodes(
            "TargetCollection*", // Applies to all collections starting with "TargetCollection"
            NodesPermission.Action.READ // Allow reading node metadata
        )
    };

    // Minimal permissions - applies to all collections
    Permission<?>[] minimalPermissions = new Permission<?>[] {
        Permission.nodes(
            "*", // Applies to all collections
            NodesPermission.Action.READ // Allow reading node metadata
        )
    };

    Result<Boolean> createResult = client.roles().creator()
        .withName("testRole")
        .withPermissions(verbosePermissions) // or minimalPermissions
        .run();
    // END AddNodesPermission

    assertThat(createResult.getError()).isNull();
    assertTrue(createResult.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldAddAliasPermission() {
    // START AddAliasPermission
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.alias(
            "TargetAlias*", // Applies to all aliases starting with "TargetAlias"
            "TargetCollection*", // Applies to all collections starting with "TargetCollection"
            AliasPermission.Action.CREATE, // Allow alias creation
            AliasPermission.Action.READ, // Allow listing aliases
            AliasPermission.Action.UPDATE // Allow updating aliases
        // Note: DELETE is not included, similar to Python example
        )
    };

    Result<Boolean> createResult = client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();
    // END AddAliasPermission

    assertThat(createResult.getError()).isNull();
    assertTrue(createResult.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldAddReplicationsPermission() {
    // START AddReplicationsPermission
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.replicate(
            "TargetCollection*", // Applies to all collections starting with "TargetCollection"
            "TargetShard*", // Applies to all shards starting with "TargetShard"
            ReplicatePermission.Action.CREATE, // Allow replica movement operations
            ReplicatePermission.Action.READ, // Allow retrieving replication status
            ReplicatePermission.Action.UPDATE // Allow cancelling replication operations
        // Note: DELETE is not included, similar to Python example
        )
    };

    Result<Boolean> createResult = client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();
    // END AddReplicationsPermission

    assertThat(createResult.getError()).isNull();
    assertTrue(createResult.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  // @Test
  // public void shouldAddGroupsPermission() {
  // // START AddGroupsPermission
  // Permission<?>[] permissions = new Permission<?>[] {
  // Permission.groups(
  // "TargetGroup*", // Applies to all groups starting with "TargetGroup"
  // "oidc", // Group type (OIDC)
  // GroupsPermission.Action.READ, // Allow reading group information
  // GroupsPermission.Action.ASSIGN_AND_REVOKE // Allow assigning and revoking
  // group memberships
  // )
  // };

  // Result<Boolean> createResult = client.roles().creator()
  // .withName("testRole")
  // .withPermissions(permissions)
  // .run();
  // // END AddGroupsPermission

  // assertThat(createResult.getError()).isNull();
  // assertTrue(createResult.getResult());

  // client.roles().deleter().withName("testRole").run();
  // }

  @Test
  public void shouldAddPermissionsToExistingRole() {
    // Create initial role
    Permission<?>[] initialPermissions = new Permission<?>[] {
        Permission.collections("TargetCollection*", CollectionsPermission.Action.READ)
    };
    client.roles().creator()
        .withName("testRole")
        .withPermissions(initialPermissions)
        .run();

    // START AddRoles
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.data("TargetCollection*", DataPermission.Action.CREATE)
    };

    Result<?> addResult = client.roles().permissionAdder()
        .withRole("testRole")
        .withPermissions(permissions)
        .run();
    // END AddRoles

    assertThat(addResult.getError()).isNull();

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldCheckRoleExists() {
    client.roles().creator()
        .withName("testRole")
        .withPermissions(Permission.cluster(ClusterPermission.Action.READ))
        .run();

    // START CheckRoleExists
    Result<Boolean> exists = client.roles().exists()
        .withName("testRole")
        .run();
    System.out.println(exists.getResult()); // Returns true or false
    // END CheckRoleExists

    assertTrue(exists.getResult());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldInspectRole() {
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.collections("TargetCollection*", CollectionsPermission.Action.READ),
        Permission.data("TargetCollection*", DataPermission.Action.CREATE)
    };
    client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();

    // START InspectRole
    Result<Role> roleResult = client.roles().getter()
        .withName("testRole")
        .run();
    Role testRole = roleResult.getResult();

    System.out.println(testRole);
    System.out.println(testRole.getName());
    System.out.println(testRole.getPermissions());
    // END InspectRole

    assertNotNull(testRole);
    assertEquals("testRole", testRole.getName());

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldGetAssignedUsers() {
    client.roles().creator()
        .withName("testRole")
        .withPermissions(Permission.cluster(ClusterPermission.Action.READ))
        .run();

    // Create and assign user (assuming user management API exists)
    // client.users().db().creator().withUserId("custom-user").run();
    // client.users().db().roleAssigner().withUserId("custom-user").withRoles("testRole").run();

    // START AssignedUsers
    Result<List<UserAssignment>> assignmentsResult = client.roles()
        .userAssignmentsGetter()
        .withRole("testRole")
        .run();
    List<UserAssignment> assignedUsers = assignmentsResult.getResult();

    for (UserAssignment user : assignedUsers) {
      System.out.println(user.getUserId() + " - " + user.getUserType());
    }
    // END AssignedUsers

    assertNotNull(assignedUsers);

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldListAllRoles() {
    // START ListAllRoles
    Result<List<Role>> rolesResult = client.roles().allGetter().run();
    List<Role> allRoles = rolesResult.getResult();

    for (Role role : allRoles) {
      System.out.println(role.getName() + ": " + role.getPermissions());
    }
    // END ListAllRoles

    assertNotNull(allRoles);
    assertTrue(allRoles.size() >= 3); // At least viewer, root, admin
  }

  @Test
  public void shouldRemovePermissions() {
    // Create role with multiple permissions
    Permission<?>[] initialPermissions = new Permission<?>[] {
        Permission.collections("TargetCollection*",
            CollectionsPermission.Action.READ,
            CollectionsPermission.Action.CREATE,
            CollectionsPermission.Action.DELETE),
        Permission.data("TargetCollection*",
            DataPermission.Action.READ,
            DataPermission.Action.CREATE)
    };
    client.roles().creator()
        .withName("testRole")
        .withPermissions(initialPermissions)
        .run();

    // START RemovePermissions
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.collections("TargetCollection*",
            CollectionsPermission.Action.READ,
            CollectionsPermission.Action.CREATE,
            CollectionsPermission.Action.DELETE),
        Permission.data("TargetCollection*",
            DataPermission.Action.READ)
        // Note: CREATE is not removed, similar to Python example
    };

    Result<?> removeResult = client.roles().permissionRemover()
        .withRole("testRole")
        .withPermissions(permissions)
        .run();
    // END RemovePermissions

    assertThat(removeResult.getError()).isNull();

    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldDeleteRole() {
    client.roles().creator()
        .withName("testRole")
        .withPermissions(Permission.cluster(ClusterPermission.Action.READ))
        .run();

    // START DeleteRole
    client.roles().deleter()
        .withName("testRole")
        .run();
    // END DeleteRole

    Result<Boolean> exists = client.roles().exists()
        .withName("testRole")
        .run();
    assertFalse(exists.getResult());
  }
}