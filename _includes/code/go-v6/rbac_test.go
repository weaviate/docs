package main

import (
	"context"
	"testing"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/rbac"
)

// The RBAC snippets below require a Weaviate instance with RBAC enabled and an
// admin API key. They are kept out of the CI run set (compile-only) and skip
// when executed directly.
const rbacSkip = "requires a Weaviate instance with RBAC enabled and an admin API key"

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
		t.Fatal(err)
	}
	defer client.Close()
	// END AdminClient
}

// -----------------------------------------------------------------------------
// Role management: create roles with permissions
// -----------------------------------------------------------------------------

// TestRBACAddManageRolesPermission creates a role that can manage other roles.
func TestRBACAddManageRolesPermission(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START CheckRoleExists
	exists, err := client.Roles.Exists(ctx, "testRole")
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("testRole exists: %t", exists)
	// END CheckRoleExists
}

// TestRBACInspectRole retrieves a role and its permissions.
func TestRBACInspectRole(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START InspectRole
	role, err := client.Roles.Get(ctx, "testRole")
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("role: %s", role.ID)
	t.Logf("collection permissions: %+v", role.Collections)
	t.Logf("data permissions: %+v", role.Data)
	// END InspectRole
}

// TestRBACListAllRoles lists every role in the instance.
func TestRBACListAllRoles(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ListAllRoles
	roles, err := client.Roles.List(ctx)
	if err != nil {
		t.Fatal(err)
	}
	for _, role := range roles {
		t.Logf("%s", role.ID)
	}
	// END ListAllRoles
}

// TestRBACAssignedUsers lists the users that have a given role.
func TestRBACAssignedUsers(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START AssignedUsers
	userIDs, err := client.Roles.AssignedUserIDs(ctx, "testRole")
	if err != nil {
		t.Fatal(err)
	}
	for _, id := range userIDs {
		t.Logf("assigned user: %s", id)
	}
	// END AssignedUsers
}

// TestRBACDeleteRole deletes a role.
func TestRBACDeleteRole(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ListAllUsers
	users, err := client.Users.DB.List(ctx, rbac.ListUsersOptions{})
	if err != nil {
		t.Fatal(err)
	}
	for _, u := range users {
		t.Logf("%s (active: %t)", u.ID, u.Active)
	}
	// END ListAllUsers
}

// TestRBACCreateUser creates a database user and prints its API key.
func TestRBACCreateUser(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START CreateUser
	// Create returns the new user's API key. Store it securely; it cannot be
	// retrieved again later.
	apiKey, err := client.Users.DB.Create(ctx, "custom-user")
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("new API key: %s", apiKey)
	// END CreateUser
}

// TestRBACDeleteUser deletes a database user.
func TestRBACDeleteUser(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START DeleteUser
	err := client.Users.DB.Delete(ctx, "custom-user")
	// END DeleteUser
	if err != nil {
		t.Fatal(err)
	}
}

// TestRBACRotateApiKey rotates a database user's API key.
func TestRBACRotateApiKey(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START RotateApiKey
	newAPIKey, err := client.Users.DB.RotateKey(ctx, "custom-user")
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("rotated API key: %s", newAPIKey)
	// END RotateApiKey
}

// TestRBACAssignRole assigns roles to a database user.
func TestRBACAssignRole(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ListUserRoles
	roles, err := client.Users.DB.AssignedRoles(ctx, rbac.AssignedRolesOptions{
		ID: "custom-user",
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, role := range roles {
		t.Logf("%s", role.ID)
	}
	// END ListUserRoles
}

// -----------------------------------------------------------------------------
// OIDC users
// -----------------------------------------------------------------------------

// TestRBACAssignOidcUserRole assigns roles to an OIDC user.
func TestRBACAssignOidcUserRole(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START ListOidcUserRoles
	roles, err := client.Users.OIDC.AssignedRoles(ctx, rbac.AssignedRolesOptions{
		ID: "custom-user",
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, role := range roles {
		t.Logf("%s", role.ID)
	}
	// END ListOidcUserRoles
}

// -----------------------------------------------------------------------------
// OIDC groups
// -----------------------------------------------------------------------------

// TestRBACAssignOidcGroupRoles assigns roles to an OIDC group.
func TestRBACAssignOidcGroupRoles(t *testing.T) {
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START GetOidcGroupRoles
	roles, err := client.Groups.AssignedRoles(ctx, rbac.AssignedRolesOptions{
		ID:                 "/admin-group",
		IncludePermissions: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, role := range roles {
		t.Logf("%s", role.ID)
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
	t.Skip(rbacSkip)
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START GetGroupAssignments
	groups, err := client.Roles.GroupAssignments(ctx, "testRole")
	if err != nil {
		t.Fatal(err)
	}
	for _, g := range groups {
		t.Logf("group ID: %s, type: %s", g.ID, g.Type)
	}
	// END GetGroupAssignments
}
