package io.weaviate.docs;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.rbac.model.*;
import io.weaviate.client.v1.users.model.UserDb;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class UserManagementTest {

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
    // Clean up test user before each test
    client.users().db().deleter().withUserId("custom-user").run();

    // Clean up test role
    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldCreateUser() {
    // START CreateUser
    Result<String> userApiKeyResult = client.users().db().creator()
        .withUserId("custom-user")
        .run();
    String userApiKey = userApiKeyResult.getResult();
    System.out.println(userApiKey);
    // END CreateUser

    assertThat(userApiKeyResult.getError()).isNull();
    assertNotNull(userApiKey);
    assertTrue(userApiKey.length() > 0);

    // Cleanup
    client.users().db().deleter().withUserId("custom-user").run();
  }

  @Test
  public void shouldRotateApiKey() {
    // Create user first
    Result<String> createResult = client.users().db().creator()
        .withUserId("custom-user")
        .run();
    String userApiKey = createResult.getResult();

    // START RotateApiKey
    Result<String> rotateResult = client.users().db().keyRotator()
        .withUserId("custom-user")
        .run();
    String newApiKey = rotateResult.getResult();
    System.out.println(newApiKey);
    // END RotateApiKey

    assertThat(rotateResult.getError()).isNull();
    assertNotNull(newApiKey);
    assertTrue(newApiKey.length() > 0);
    assertNotEquals(userApiKey, newApiKey);

    // Cleanup
    client.users().db().deleter().withUserId("custom-user").run();
  }

  // TODO[g-despot]: Check if this works without .includePermissions(true)
  @Test
  public void shouldAssignRoles() {
    // Setup: Create user and role
    client.users().db().creator().withUserId("custom-user").run();

    Permission<?>[] permissions = new Permission<?>[] {
        Permission.collections(
            "TargetCollection*",
            CollectionsPermission.Action.READ,
            CollectionsPermission.Action.CREATE),
        Permission.data(
            "TargetCollection*",
            DataPermission.Action.READ,
            DataPermission.Action.CREATE)
    };

    client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();

    // START AssignRole
    Result<?> assignResult = client.users().db().assigner()
        .withUserId("custom-user")
        .witRoles("testRole", "viewer")
        .run();
    // END AssignRole

    assertThat(assignResult.getError()).isNull();

    // Verify roles were assigned
    Result<List<Role>> rolesResult = client.users().db().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(true)
        .run();
    List<Role> assignedRoles = rolesResult.getResult();

    assertTrue(assignedRoles.stream().anyMatch(r -> r.getName().equals("testRole")));
    assertTrue(assignedRoles.stream().anyMatch(r -> r.getName().equals("viewer")));

    // Cleanup
    client.users().db().deleter().withUserId("custom-user").run();
    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldListAllUsers() {
    // Create a test user first
    client.users().db().creator().withUserId("custom-user").run();

    // START ListAllUsers
    Result<List<UserDb>> allUsersResult = client.users().db().allGetter().run();
    List<UserDb> allUsers = allUsersResult.getResult();
    System.out.println(allUsers);
    // END ListAllUsers

    assertThat(allUsersResult.getError()).isNull();
    assertNotNull(allUsers);
    assertTrue(allUsers.stream().anyMatch(u -> u.getUserId().equals("custom-user")));

    // Cleanup
    client.users().db().deleter().withUserId("custom-user").run();
  }

  @Test
  public void shouldListUserRoles() {
    // Setup: Create user and assign roles
    client.users().db().creator().withUserId("custom-user").run();

    Permission<?>[] permissions = new Permission<?>[] {
        Permission.collections("TargetCollection*", CollectionsPermission.Action.READ)
    };

    client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();

    client.users().db().assigner()
        .withUserId("custom-user")
        .witRoles("testRole", "viewer")
        .run();

    // START ListUserRoles
    Result<List<Role>> userRolesResult = client.users().db().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(true)
        .run();
    List<Role> userRoles = userRolesResult.getResult();

    for (Role role : userRoles) {
      System.out.println(role.getName());
    }
    // END ListUserRoles

    assertThat(userRolesResult.getError()).isNull();
    assertTrue(userRoles.stream().anyMatch(r -> r.getName().equals("testRole")));
    assertTrue(userRoles.stream().anyMatch(r -> r.getName().equals("viewer")));

    // Cleanup
    client.users().db().deleter().withUserId("custom-user").run();
    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldRevokeRoles() {
    // Setup: Create user, role, and assign roles
    client.users().db().creator().withUserId("custom-user").run();

    Permission<?>[] permissions = new Permission<?>[] {
        Permission.collections("TargetCollection*", CollectionsPermission.Action.READ)
    };

    client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();

    client.users().db().assigner()
        .withUserId("custom-user")
        .witRoles("testRole", "viewer")
        .run();

    // START RevokeRoles
    Result<?> revokeResult = client.users().db().revoker()
        .withUserId("custom-user")
        .witRoles("testRole")
        .run();
    // END RevokeRoles

    assertThat(revokeResult.getError()).isNull();

    // Verify role was revoked
    Result<List<Role>> rolesResult = client.users().db().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(true)
        .run();
    List<Role> remainingRoles = rolesResult.getResult();

    assertFalse(remainingRoles.stream().anyMatch(r -> r.getName().equals("testRole")));

    // Cleanup
    client.users().db().deleter().withUserId("custom-user").run();
    client.roles().deleter().withName("testRole").run();
  }

  @Test
  public void shouldDeleteUser() {
    // Create user first
    client.users().db().creator().withUserId("custom-user").run();

    // START DeleteUser
    Result<Boolean> deleteResult = client.users().db().deleter()
        .withUserId("custom-user")
        .run();
    // END DeleteUser

    assertThat(deleteResult.getError()).isNull();
    assertTrue(deleteResult.getResult());

    // Verify user was deleted
    Result<List<UserDb>> allUsersResult = client.users().db().allGetter().run();
    List<UserDb> allUsers = allUsersResult.getResult();

    assertFalse(allUsers.stream().anyMatch(u -> u.getUserId().equals("custom-user")),
        "custom-user not deleted");
  }

  @Test
  public void shouldCompleteUserLifecycle() {
    // This test combines all operations in sequence similar to the Python script

    // Create user
    Result<String> createResult = client.users().db().creator()
        .withUserId("custom-user")
        .run();
    String userApiKey = createResult.getResult();
    assertNotNull(userApiKey);
    assertTrue(userApiKey.length() > 0);

    // Rotate API key
    Result<String> rotateResult = client.users().db().keyRotator()
        .withUserId("custom-user")
        .run();
    String newApiKey = rotateResult.getResult();
    assertNotEquals(userApiKey, newApiKey);

    // Create role for assignment
    Permission<?>[] permissions = new Permission<?>[] {
        Permission.collections(
            "TargetCollection*",
            CollectionsPermission.Action.READ,
            CollectionsPermission.Action.CREATE),
        Permission.data(
            "TargetCollection*",
            DataPermission.Action.READ,
            DataPermission.Action.CREATE)
    };

    client.roles().creator()
        .withName("testRole")
        .withPermissions(permissions)
        .run();

    // Assign roles
    client.users().db().assigner()
        .withUserId("custom-user")
        .witRoles("testRole", "viewer")
        .run();

    // Verify roles assigned
    Result<List<Role>> rolesResult = client.users().db().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(true)
        .run();
    List<Role> assignedRoles = rolesResult.getResult();
    assertTrue(assignedRoles.stream().anyMatch(r -> r.getName().equals("testRole")));
    assertTrue(assignedRoles.stream().anyMatch(r -> r.getName().equals("viewer")));

    // List all users
    Result<List<UserDb>> allUsersResult = client.users().db().allGetter().run();
    assertTrue(allUsersResult.getResult().stream()
        .anyMatch(u -> u.getUserId().equals("custom-user")));

    // Revoke one role
    client.users().db().revoker()
        .withUserId("custom-user")
        .witRoles("testRole")
        .run();

    // Verify role revoked
    rolesResult = client.users().db().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(true)
        .run();
    List<Role> remainingRoles = rolesResult.getResult();
    assertFalse(remainingRoles.stream().anyMatch(r -> r.getName().equals("testRole")));

    // Delete user
    Result<Boolean> deleteResult = client.users().db().deleter()
        .withUserId("custom-user")
        .run();
    assertTrue(deleteResult.getResult());

    // Verify user deleted
    allUsersResult = client.users().db().allGetter().run();
    assertFalse(allUsersResult.getResult().stream()
        .anyMatch(u -> u.getUserId().equals("custom-user")));

    // Cleanup role
    client.roles().deleter().withName("testRole").run();
  }
}