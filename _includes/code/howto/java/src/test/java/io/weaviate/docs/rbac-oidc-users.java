package io.weaviate.docs;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.rbac.model.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class OidcUserManagementTest {

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
  public void setup() {
    // Clean up and create test role
    client.roles().deleter().withName("testRole").run();

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

    // Clean up any existing role assignments for the OIDC user
    try {
      client.users().oidc().revoker()
          .withUserId("custom-user")
          .witRoles("testRole", "viewer")
          .run();
    } catch (Exception e) {
      // Ignore if roles were not assigned
    }
  }

  @Test
  public void shouldAssignOidcUserRole() {
    // START AssignOidcUserRole
    Result<?> assignResult = client.users().oidc().assigner()
        .withUserId("custom-user")
        .witRoles("testRole", "viewer")
        .run();
    // END AssignOidcUserRole

    assertThat(assignResult.getError()).isNull();

    // Verify roles were assigned
    Result<List<Role>> rolesResult = client.users().oidc().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(false)
        .run();
    List<Role> assignedRoles = rolesResult.getResult();

    assertTrue(assignedRoles.stream().anyMatch(r -> r.getName().equals("testRole")));
    assertTrue(assignedRoles.stream().anyMatch(r -> r.getName().equals("viewer")));
  }

  @Test
  public void shouldListOidcUserRoles() {
    // Setup: Assign roles first
    client.users().oidc().assigner()
        .withUserId("custom-user")
        .witRoles("testRole", "viewer")
        .run();

    // START ListOidcUserRoles
    Result<List<Role>> userRolesResult = client.users().oidc().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(false)
        .run();
    List<Role> userRoles = userRolesResult.getResult();

    for (Role role : userRoles) {
      System.out.println(role.getName());
    }
    // END ListOidcUserRoles

    assertThat(userRolesResult.getError()).isNull();
    assertTrue(userRoles.stream().anyMatch(r -> r.getName().equals("testRole")));
    assertTrue(userRoles.stream().anyMatch(r -> r.getName().equals("viewer")));
  }

  @Test
  public void shouldRevokeOidcUserRoles() {
    // Setup: Assign roles first
    client.users().oidc().assigner()
        .withUserId("custom-user")
        .witRoles("testRole", "viewer")
        .run();

    // Verify roles were assigned
    Result<List<Role>> initialRolesResult = client.users().oidc().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(false)
        .run();
    assertTrue(initialRolesResult.getResult().stream()
        .anyMatch(r -> r.getName().equals("testRole")));

    // START RevokeOidcUserRoles
    Result<?> revokeResult = client.users().oidc().revoker()
        .withUserId("custom-user")
        .witRoles("testRole")
        .run();
    // END RevokeOidcUserRoles

    assertThat(revokeResult.getError()).isNull();

    // Verify role was revoked
    Result<List<Role>> rolesResult = client.users().oidc().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(false)
        .run();
    List<Role> remainingRoles = rolesResult.getResult();

    assertFalse(remainingRoles.stream().anyMatch(r -> r.getName().equals("testRole")));
  }

  @Test
  public void shouldCompleteOidcUserRoleLifecycle() {
    // This test combines all OIDC operations in sequence similar to the Python
    // script

    // Assign roles to OIDC user
    Result<?> assignResult = client.users().oidc().assigner()
        .withUserId("custom-user")
        .witRoles("testRole", "viewer")
        .run();
    assertThat(assignResult.getError()).isNull();

    // Verify roles assigned
    Result<List<Role>> rolesResult = client.users().oidc().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(false)
        .run();
    List<Role> assignedRoles = rolesResult.getResult();
    assertTrue(assignedRoles.stream().anyMatch(r -> r.getName().equals("testRole")));
    assertTrue(assignedRoles.stream().anyMatch(r -> r.getName().equals("viewer")));

    // List OIDC user roles
    rolesResult = client.users().oidc().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(false)
        .run();
    List<Role> userRoles = rolesResult.getResult();

    System.out.println("OIDC user roles:");
    for (Role role : userRoles) {
      System.out.println(" - " + role.getName());
    }

    assertTrue(userRoles.stream().anyMatch(r -> r.getName().equals("testRole")));
    assertTrue(userRoles.stream().anyMatch(r -> r.getName().equals("viewer")));

    // Revoke one role
    Result<?> revokeResult = client.users().oidc().revoker()
        .withUserId("custom-user")
        .witRoles("testRole")
        .run();
    assertThat(revokeResult.getError()).isNull();

    // Verify role revoked
    rolesResult = client.users().oidc().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(false)
        .run();
    List<Role> remainingRoles = rolesResult.getResult();
    assertFalse(remainingRoles.stream().anyMatch(r -> r.getName().equals("testRole")));

    // Cleanup: Revoke remaining roles
    client.users().oidc().revoker()
        .withUserId("custom-user")
        .witRoles("viewer")
        .run();
  }

  @Test
  public void shouldGetOidcUserRolesWithPermissions() {
    // Assign role to OIDC user
    client.users().oidc().assigner()
        .withUserId("custom-user")
        .witRoles("testRole")
        .run();

    // Get roles with permissions included
    Result<List<Role>> rolesResult = client.users().oidc().userRolesGetter()
        .withUserId("custom-user")
        .includePermissions(true) // Include permission details
        .run();

    assertThat(rolesResult.getError()).isNull();
    List<Role> roles = rolesResult.getResult();

    // Find the testRole
    Role testRole = roles.stream()
        .filter(r -> r.getName().equals("testRole"))
        .findFirst()
        .orElse(null);

    assertNotNull(testRole);
    assertNotNull(testRole.getPermissions());
    assertEquals(2, testRole.getPermissions().size(), "Should have 2 permissions");

    // Cleanup
    client.users().oidc().revoker()
        .withUserId("custom-user")
        .witRoles("testRole")
        .run();
  }

  @AfterEach
  public void cleanup() {
    // Clean up test role
    client.roles().deleter().withName("testRole").run();

    // Clean up any remaining role assignments
    try {
      client.users().oidc().revoker()
          .withUserId("custom-user")
          .witRoles("testRole", "viewer")
          .run();
    } catch (Exception e) {
      // Ignore cleanup errors
    }
  }
}