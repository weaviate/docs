package main

import (
	"context"
	"fmt"
	"testing"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/rbac"
)

// The RBAC snippets run against the RBAC-enabled instance (connectRBACAdmin,
// service weaviate_rbac on :8580). TestRBACAdminClient stays skipped: its connect
// is INSIDE the snippet marker (weaviate.NewLocal + WithAPIKey), so it cannot be
// redirected to the non-default RBAC port without leaking the port into the
// rendered snippet — the same class as TestConnectLocalAuth.
const rbacSkip = "connect is inside the snippet marker (NewLocal+WithAPIKey); cannot redirect to the non-default RBAC port without leaking it into the rendered snippet"

// -----------------------------------------------------------------------------
// Test-only isolation helpers. They live outside every snippet marker, so the
// rendered snippets are unaffected.
//
// Roles, database users and OIDC role assignments are cluster-global, not scoped
// to a collection, and these tests run sequentially against one shared RBAC
// instance. Each test therefore deletes the role/user it touches BEFORE it runs
// (clearing anything a previous failed run leaked) and AFTER (via defer, while the
// client is still open), and seeds any prerequisite a snippet assumes already
// exists. Every RBAC operation is a REST call, so none of them hit the gRPC
// transport-switch panic path (unlike Tenants.Get / batch-delete).
// -----------------------------------------------------------------------------

// deleteRoleIfExists best-effort removes a role, ignoring a missing role. Safe to
// call for delete-before-create isolation and as deferred cleanup.
func deleteRoleIfExists(client *weaviate.Client, roleID string) {
	ctx := context.Background()
	if exists, err := client.Roles.Exists(ctx, roleID); err == nil && exists {
		_ = client.Roles.Delete(ctx, roleID)
	}
}

// seedRole (re)creates roleID with a known permission set so snippets that expect
// the role to already exist (add/remove permissions, inspect, assign, delete) have
// something to act on. The set is a superset of the permissions
// TestRBACRemovePermissions removes, plus a cluster-read permission it does not
// remove, so the role never ends up empty.
func seedRole(t *testing.T, client *weaviate.Client, roleID string) {
	t.Helper()
	ctx := context.Background()
	deleteRoleIfExists(client, roleID)
	if err := client.Roles.Create(ctx, rbac.Role{
		ID: roleID,
		Permissions: rbac.Permissions{
			Collections: []rbac.CollectionPermission{
				{Collection: "TargetCollection*", Create: true, Read: true, Update: true, Delete: true},
			},
			Data: []rbac.DataPermission{
				{Collection: "TargetCollection*", Read: true},
			},
			Cluster: []rbac.ClusterPermission{{Read: true}},
		},
	}); err != nil {
		t.Fatalf("seed role %q: %v", roleID, err)
	}
}

// deleteDBUserIfExists best-effort removes a database user, ignoring a missing
// user. Safe for delete-before-create isolation and deferred cleanup.
func deleteDBUserIfExists(client *weaviate.Client, userID string) {
	_ = client.Users.DB.Delete(context.Background(), userID)
}

// seedDBUser (re)creates a database user so snippets that expect the user to
// already exist (delete, rotate key, assign/revoke/list roles) have a target.
func seedDBUser(t *testing.T, client *weaviate.Client, userID string) {
	t.Helper()
	deleteDBUserIfExists(client, userID)
	if _, err := client.Users.DB.Create(context.Background(), userID); err != nil {
		t.Fatalf("seed database user %q: %v", userID, err)
	}
}

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

// TestRBACAdminClient connects with a key belonging to a user that has the
// permissions needed to manage roles and users.
func TestRBACAdminClient(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()

	// START AdminClient
	client, err := weaviate.NewLocal(ctx,
		weaviate.WithAPIKey("admin-api-key"),
	)
	if err != nil {
		// handle error
		panic(err)
	}
	defer client.Close()
	// END AdminClient
}

// -----------------------------------------------------------------------------
// Role management: create roles with permissions
// -----------------------------------------------------------------------------

// TestRBACAddManageRolesPermission creates a role that can manage other roles.
func TestRBACAddManageRolesPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddManageRolesPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Roles: []rbac.RolePermission{
				{
					RoleID: "testRole*", // Applies to all roles starting with "testRole".
					// Match limits role management to the current user's permission
					// level; use rbac.RoleScopeAll to allow managing all permissions.
					Scope:  rbac.RoleScopeMatch,
					Create: true, // Allow creating roles.
					Read:   true, // Allow reading roles.
					Update: true, // Allow updating roles.
					Delete: true, // Allow deleting roles.
				},
			},
		},
	})
	// END AddManageRolesPermission
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACAddManageUsersPermission creates a role that can manage users.
func TestRBACAddManageUsersPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddManageUsersPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Users: []rbac.UserPermission{
				{
					UserID:          "testUser*", // Applies to all users starting with "testUser".
					Create:          true,        // Allow creating users.
					Read:            true,        // Allow reading user info.
					Update:          true,        // Allow rotating a user's API key.
					Delete:          true,        // Allow deleting users.
					AssignAndRevoke: true,        // Allow assigning and revoking roles.
				},
			},
		},
	})
	// END AddManageUsersPermission
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACAddCollectionsPermission creates a role with collection permissions.
func TestRBACAddCollectionsPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddCollectionsPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Collections: []rbac.CollectionPermission{
				{
					Collection: "TargetCollection*", // Applies to all matching collections.
					Create:     true,                // Allow creating collections.
					Read:       true,                // Allow reading collection config.
					Update:     true,                // Allow updating collection config.
					Delete:     true,                // Allow deleting collections.
				},
			},
		},
	})
	// END AddCollectionsPermission
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACAddTenantPermission creates a role with tenant permissions.
func TestRBACAddTenantPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddTenantPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Tenants: []rbac.TenantPermission{
				{
					Collection: "TargetCollection*", // Applies to all matching collections.
					Tenant:     "TargetTenant*",     // Applies to all matching tenants.
					Create:     true,                // Allow creating tenants.
					Read:       true,                // Allow reading tenant info.
					Update:     true,                // Allow updating tenant states.
					Delete:     true,                // Allow deleting tenants.
				},
			},
		},
	})
	// END AddTenantPermission
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACAddDataObjectPermission creates a role with data object permissions.
func TestRBACAddDataObjectPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddDataObjectPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Data: []rbac.DataPermission{
				{
					Collection: "TargetCollection*", // Applies to all matching collections.
					Tenant:     "TargetTenant*",     // Applies to all matching tenants.
					Create:     true,                // Allow data inserts.
					Read:       true,                // Allow query and fetch operations.
					Update:     true,                // Allow data updates.
					// Delete is left false, disallowing data deletes.
				},
			},
		},
	})
	// END AddDataObjectPermission
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACAddBackupPermission creates a role with backup permissions.
func TestRBACAddBackupPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddBackupPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Backups: []rbac.BackupsPermission{
				{
					Collection: "TargetCollection*", // Applies to all matching collections.
					Manage:     true,                // Allow managing backups.
				},
			},
		},
	})
	// END AddBackupPermission
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACAddClusterPermission creates a role with cluster read permission.
func TestRBACAddClusterPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddClusterPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Cluster: []rbac.ClusterPermission{
				{Read: true}, // Allow reading cluster data.
			},
		},
	})
	// END AddClusterPermission
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACAddNodesPermission creates a role with node read permission.
func TestRBACAddNodesPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddNodesPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Nodes: []rbac.NodesPermission{
				{
					Collection: "TargetCollection*",       // Verbose reads are scoped to a collection.
					Verbosity:  rbac.NodeVerbosityVerbose, // Or rbac.NodeVerbosityMinimal for all collections.
					Read:       true,                      // Allow reading node metadata.
				},
			},
		},
	})
	// END AddNodesPermission
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACAddAliasPermission creates a role with alias permissions.
func TestRBACAddAliasPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddAliasPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Aliases: []rbac.AliasPermission{
				{
					Alias:      "TargetAlias*",      // Applies to all matching aliases.
					Collection: "TargetCollection*", // Applies to all matching collections.
					Create:     true,                // Allow alias creation.
					Read:       true,                // Allow listing aliases.
					Update:     true,                // Allow updating aliases.
					// Delete is left false, disallowing alias deletion.
				},
			},
		},
	})
	// END AddAliasPermission
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACAddReplicationsPermission creates a role with replication permissions.
func TestRBACAddReplicationsPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddReplicationsPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Replication: []rbac.ReplicationPermission{
				{
					Collection: "TargetCollection*", // Applies to all matching collections.
					Shard:      "TargetShard*",      // Applies to all matching shards.
					Create:     true,                // Allow replica movement operations.
					Read:       true,                // Allow retrieving replication status.
					Update:     true,                // Allow cancelling replication operations.
					// Delete is left false, disallowing deleting replication operations.
				},
			},
		},
	})
	// END AddReplicationsPermission
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACAddGroupsPermission creates a role with group permissions.
func TestRBACAddGroupsPermission(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddGroupsPermission
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "testRole",
		Permissions: rbac.Permissions{
			Groups: []rbac.GroupPermission{
				{
					GroupID:         "TargetGroup*", // Applies to all groups starting with "TargetGroup".
					Type:            rbac.GroupTypeOIDC,
					Read:            true, // Allow reading group information.
					AssignAndRevoke: true, // Allow assigning and revoking group memberships.
				},
			},
		},
	})
	// END AddGroupsPermission
	if err != nil {
		t.Fatal(err)
	}
}

// -----------------------------------------------------------------------------
// Role management: modify and inspect roles
// -----------------------------------------------------------------------------

// TestRBACAddRoles grants additional permissions to an existing role.
func TestRBACAddRoles(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AddRoles
	err := client.Roles.AddPermissions(ctx, rbac.AddPermissions{
		RoleID: "testRole",
		Permissions: rbac.Permissions{
			Data: []rbac.DataPermission{
				{Collection: "TargetCollection*", Create: true},
			},
		},
	})
	// END AddRoles
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACRemovePermissions removes permissions from a role.
func TestRBACRemovePermissions(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START RemovePermissions
	err := client.Roles.RemovePermissions(ctx, rbac.RemovePermissions{
		RoleID: "testRole",
		Permissions: rbac.Permissions{
			Collections: []rbac.CollectionPermission{
				{Collection: "TargetCollection*", Read: true, Create: true, Delete: true},
			},
			Data: []rbac.DataPermission{
				{Collection: "TargetCollection*", Read: true},
			},
		},
	})
	// END RemovePermissions
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACCheckRoleExists checks whether a role exists.
func TestRBACCheckRoleExists(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()

	// START CheckRoleExists
	exists, err := client.Roles.Exists(ctx, "testRole")
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Printf("testRole exists: %t\n", exists)
	// END CheckRoleExists
}

// TestRBACInspectRole retrieves a role and its permissions.
func TestRBACInspectRole(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START InspectRole
	role, err := client.Roles.Get(ctx, "testRole")
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Printf("role: %s\n", role.ID)
	fmt.Printf("collection permissions: %+v\n", role.Collections)
	fmt.Printf("data permissions: %+v\n", role.Data)
	// END InspectRole
}

// TestRBACListAllRoles lists every role in the instance.
func TestRBACListAllRoles(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()

	// START ListAllRoles
	roles, err := client.Roles.List(ctx)
	if err != nil {
		// handle error
		panic(err)
	}
	for _, role := range roles {
		fmt.Printf("%s\n", role.ID)
	}
	// END ListAllRoles
}

// TestRBACAssignedUsers lists the users that have a given role.
func TestRBACAssignedUsers(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START AssignedUsers
	userIDs, err := client.Roles.AssignedUserIDs(ctx, "testRole")
	if err != nil {
		// handle error
		panic(err)
	}
	for _, id := range userIDs {
		fmt.Printf("assigned user: %s\n", id)
	}
	// END AssignedUsers
}

// TestRBACDeleteRole deletes a role.
func TestRBACDeleteRole(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START DeleteRole
	err := client.Roles.Delete(ctx, "testRole")
	// END DeleteRole
	if err != nil {
		t.Fatal(err)
	}
}

// -----------------------------------------------------------------------------
// User management (database users)
// -----------------------------------------------------------------------------

// TestRBACListAllUsers lists all database users.
func TestRBACListAllUsers(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()

	// START ListAllUsers
	users, err := client.Users.DB.List(ctx, rbac.ListUsersOptions{})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, u := range users {
		fmt.Printf("%s (active: %t)\n", u.ID, u.Active)
	}
	// END ListAllUsers
}

// TestRBACCreateUser creates a database user and prints its API key.
func TestRBACCreateUser(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteDBUserIfExists(client, "custom-user")
	defer deleteDBUserIfExists(client, "custom-user")

	// START CreateUser
	// Create returns the new user's API key. Store it securely; it cannot be
	// retrieved again later.
	apiKey, err := client.Users.DB.Create(ctx, "custom-user")
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Printf("new API key: %s\n", apiKey)
	// END CreateUser
}

// TestRBACDeleteUser deletes a database user.
func TestRBACDeleteUser(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedDBUser(t, client, "custom-user")
	defer deleteDBUserIfExists(client, "custom-user")

	// START DeleteUser
	err := client.Users.DB.Delete(ctx, "custom-user")
	// END DeleteUser
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACRotateApiKey rotates a database user's API key.
func TestRBACRotateApiKey(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedDBUser(t, client, "custom-user")
	defer deleteDBUserIfExists(client, "custom-user")

	// START RotateApiKey
	newAPIKey, err := client.Users.DB.RotateKey(ctx, "custom-user")
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Printf("rotated API key: %s\n", newAPIKey)
	// END RotateApiKey
}

// TestRBACAssignRole assigns roles to a database user.
func TestRBACAssignRole(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedDBUser(t, client, "custom-user")
	seedRole(t, client, "testRole") // "viewer" is a built-in role.
	defer deleteDBUserIfExists(client, "custom-user")
	defer deleteRoleIfExists(client, "testRole")

	// START AssignRole
	err := client.Users.DB.AssignRoles(ctx, rbac.AssignRolesOptions{
		ID:    "custom-user",
		Roles: []string{"testRole", "viewer"},
	})
	// END AssignRole
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACRevokeRoles revokes roles from a database user.
func TestRBACRevokeRoles(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedDBUser(t, client, "custom-user")
	seedRole(t, client, "testRole")
	// Assign the role first so the snippet has something to revoke.
	if err := client.Users.DB.AssignRoles(ctx, rbac.AssignRolesOptions{
		ID:    "custom-user",
		Roles: []string{"testRole"},
	}); err != nil {
		t.Fatalf("seed role assignment: %v", err)
	}
	defer deleteDBUserIfExists(client, "custom-user")
	defer deleteRoleIfExists(client, "testRole")

	// START RevokeRoles
	err := client.Users.DB.RevokeRoles(ctx, rbac.RevokeRolesOptions{
		ID:    "custom-user",
		Roles: []string{"testRole"},
	})
	// END RevokeRoles
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACListUserRoles lists the roles assigned to a database user.
func TestRBACListUserRoles(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedDBUser(t, client, "custom-user")
	defer deleteDBUserIfExists(client, "custom-user")

	// START ListUserRoles
	roles, err := client.Users.DB.AssignedRoles(ctx, rbac.AssignedRolesOptions{
		ID: "custom-user",
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, role := range roles {
		fmt.Printf("%s\n", role.ID)
	}
	// END ListUserRoles
}

// -----------------------------------------------------------------------------
// OIDC users
// -----------------------------------------------------------------------------

// TestRBACAssignOidcUserRole assigns roles to an OIDC user.
func TestRBACAssignOidcUserRole(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole") // "viewer" is a built-in role.
	defer deleteRoleIfExists(client, "testRole")
	defer func() {
		_ = client.Users.OIDC.RevokeRoles(ctx, rbac.RevokeRolesOptions{
			ID: "custom-user", Roles: []string{"testRole", "viewer"},
		})
	}()

	// START AssignOidcUserRole
	err := client.Users.OIDC.AssignRoles(ctx, rbac.AssignRolesOptions{
		ID:    "custom-user",
		Roles: []string{"testRole", "viewer"},
	})
	// END AssignOidcUserRole
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACRevokeOidcUserRoles revokes roles from an OIDC user.
func TestRBACRevokeOidcUserRoles(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole")
	// Assign the role first so the snippet has something to revoke.
	if err := client.Users.OIDC.AssignRoles(ctx, rbac.AssignRolesOptions{
		ID:    "custom-user",
		Roles: []string{"testRole"},
	}); err != nil {
		t.Fatalf("seed OIDC role assignment: %v", err)
	}
	defer deleteRoleIfExists(client, "testRole")

	// START RevokeOidcUserRoles
	err := client.Users.OIDC.RevokeRoles(ctx, rbac.RevokeRolesOptions{
		ID:    "custom-user",
		Roles: []string{"testRole"},
	})
	// END RevokeOidcUserRoles
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACListOidcUserRoles lists the roles assigned to an OIDC user.
func TestRBACListOidcUserRoles(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()

	// START ListOidcUserRoles
	roles, err := client.Users.OIDC.AssignedRoles(ctx, rbac.AssignedRolesOptions{
		ID: "custom-user",
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, role := range roles {
		fmt.Printf("%s\n", role.ID)
	}
	// END ListOidcUserRoles
}

// -----------------------------------------------------------------------------
// OIDC groups
// -----------------------------------------------------------------------------

// TestRBACAssignOidcGroupRoles assigns roles to an OIDC group.
func TestRBACAssignOidcGroupRoles(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole") // "viewer" is a built-in role.
	defer deleteRoleIfExists(client, "testRole")
	defer func() {
		_ = client.Groups.RevokeRoles(ctx, rbac.RevokeRolesOptions{
			ID: "/admin-group", Roles: []string{"testRole", "viewer"},
		})
	}()

	// START AssignOidcGroupRoles
	err := client.Groups.AssignRoles(ctx, rbac.AssignRolesOptions{
		ID:    "/admin-group",
		Roles: []string{"testRole", "viewer"},
	})
	// END AssignOidcGroupRoles
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACRevokeOidcGroupRoles revokes roles from an OIDC group.
func TestRBACRevokeOidcGroupRoles(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole")
	// Assign the role first so the snippet has something to revoke.
	if err := client.Groups.AssignRoles(ctx, rbac.AssignRolesOptions{
		ID:    "/admin-group",
		Roles: []string{"testRole"},
	}); err != nil {
		t.Fatalf("seed group role assignment: %v", err)
	}
	defer deleteRoleIfExists(client, "testRole")

	// START RevokeOidcGroupRoles
	err := client.Groups.RevokeRoles(ctx, rbac.RevokeRolesOptions{
		ID:    "/admin-group",
		Roles: []string{"testRole"},
	})
	// END RevokeOidcGroupRoles
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACGetOidcGroupRoles lists the roles assigned to an OIDC group.
func TestRBACGetOidcGroupRoles(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole")
	if err := client.Groups.AssignRoles(ctx, rbac.AssignRolesOptions{
		ID:    "/admin-group",
		Roles: []string{"testRole"},
	}); err != nil {
		t.Fatalf("seed group role assignment: %v", err)
	}
	defer deleteRoleIfExists(client, "testRole")
	defer func() {
		_ = client.Groups.RevokeRoles(ctx, rbac.RevokeRolesOptions{
			ID: "/admin-group", Roles: []string{"testRole"},
		})
	}()

	// START GetOidcGroupRoles
	roles, err := client.Groups.AssignedRoles(ctx, rbac.AssignedRolesOptions{
		ID:                 "/admin-group",
		IncludePermissions: true,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, role := range roles {
		fmt.Printf("%s\n", role.ID)
	}
	// END GetOidcGroupRoles
}

// TestRBACGetKnownOidcGroups is a placeholder: the v6 Go client cannot yet list
// all known OIDC groups.
func TestRBACGetKnownOidcGroups(t *testing.T) {
	t.Skip("listing all known OIDC groups is not yet available in the v6 Go client")

	// TODO[g-despot]: list-known-OIDC-groups snippet pending v6 client support
	// START GetKnownOidcGroups
	// Coming soon
	// END GetKnownOidcGroups
}

// TestRBACGetGroupAssignments lists the groups assigned to a role.
func TestRBACGetGroupAssignments(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedRole(t, client, "testRole")
	defer deleteRoleIfExists(client, "testRole")

	// START GetGroupAssignments
	groups, err := client.Roles.GroupAssignments(ctx, "testRole")
	if err != nil {
		// handle error
		panic(err)
	}
	for _, g := range groups {
		fmt.Printf("group ID: %s, type: %s\n", g.ID, g.Type)
	}
	// END GetGroupAssignments
}
