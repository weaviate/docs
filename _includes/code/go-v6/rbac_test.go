package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"testing"
	"time"

	weaviate "github.com/weaviate/weaviate-go-client/v6"
	"github.com/weaviate/weaviate-go-client/v6/rbac"
)

// The RBAC snippets run against the RBAC-enabled instance (connectRBACAdmin,
// service weaviate_rbac on :8580).

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

// rbacREST sends a raw REST GET to the RBAC instance as the root user, so the
// tests can check what the server stored independently of the client.
func rbacREST(t *testing.T, path string) (int, []byte) {
	t.Helper()
	url := "http://" + getenvOr("WEAVIATE_RBAC_HTTP_HOST", "localhost") + ":" +
		getenvOr("WEAVIATE_RBAC_HTTP_PORT", "8580") + path
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Authorization", "Bearer "+getenvOr("WEAVIATE_RBAC_API_KEY", "root-user-key"))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal(err)
	}
	return resp.StatusCode, body
}

// assertRESTStatus checks the HTTP status of a raw REST GET on the RBAC instance.
func assertRESTStatus(t *testing.T, path string, want int) {
	t.Helper()
	if got, body := rbacREST(t, path); got != want {
		t.Fatalf("GET %s: status %d, want %d: %s", path, got, want, body)
	}
}

// assertRoleActions reads a role through raw REST and checks that every action
// in want is stored and no action in absent is.
func assertRoleActions(t *testing.T, roleID string, want, absent []string) {
	t.Helper()
	status, body := rbacREST(t, "/v1/authz/roles/"+roleID)
	if status != http.StatusOK {
		t.Fatalf("GET role %q: status %d: %s", roleID, status, body)
	}
	var role struct {
		Permissions []struct {
			Action string `json:"action"`
		} `json:"permissions"`
	}
	if err := json.Unmarshal(body, &role); err != nil {
		t.Fatal(err)
	}
	stored := map[string]bool{}
	for _, p := range role.Permissions {
		stored[p.Action] = true
	}
	for _, a := range want {
		if !stored[a] {
			t.Errorf("role %q: action %q not stored by the server (stored: %v)", roleID, a, stored)
		}
	}
	for _, a := range absent {
		if stored[a] {
			t.Errorf("role %q: action %q stored but should be absent", roleID, a)
		}
	}
}

// checkRoleIDs checks a list of assigned roles against want and absent.
func checkRoleIDs(t *testing.T, who string, roles []rbac.Role, want, absent []string) {
	t.Helper()
	got := map[string]bool{}
	for _, r := range roles {
		got[r.ID] = true
	}
	for _, id := range want {
		if !got[id] {
			t.Errorf("%s: role %q not assigned (got %v)", who, id, got)
		}
	}
	for _, id := range absent {
		if got[id] {
			t.Errorf("%s: role %q still assigned", who, id)
		}
	}
}

func assertDBUserRoles(t *testing.T, client *weaviate.Client, userID string, want, absent []string) {
	t.Helper()
	roles, err := client.Users.DB.AssignedRoles(context.Background(), rbac.AssignedRolesOptions{ID: userID})
	if err != nil {
		t.Fatal(err)
	}
	checkRoleIDs(t, "db user "+userID, roles, want, absent)
}

func assertOIDCUserRoles(t *testing.T, client *weaviate.Client, userID string, want, absent []string) {
	t.Helper()
	roles, err := client.Users.OIDC.AssignedRoles(context.Background(), rbac.AssignedRolesOptions{ID: userID})
	if err != nil {
		t.Fatal(err)
	}
	checkRoleIDs(t, "oidc user "+userID, roles, want, absent)
}

func assertGroupRoles(t *testing.T, client *weaviate.Client, groupID string, want, absent []string) {
	t.Helper()
	roles, err := client.Groups.AssignedRoles(context.Background(), rbac.AssignedRolesOptions{ID: groupID})
	if err != nil {
		t.Fatal(err)
	}
	checkRoleIDs(t, "oidc group "+groupID, roles, want, absent)
}

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

// TestRBACAdminClient connects as the root user. The region dials the default
// local ports, while the docs test stack runs the RBAC instance on 8580, so the
// test is compile-only. The other RBAC tests reach 8580 via connectRBACAdmin.
func TestRBACAdminClient(t *testing.T) {
	t.Skip("the region dials the default local ports. The RBAC instance in the docs test stack runs on 8580")
	ctx := context.Background()

	// START AdminClient
	// Connect to Weaviate as root user
	client, err := weaviate.NewLocal(ctx,
		weaviate.WithAPIKey("root-user-key"),
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

// TestRBACAddManageRolesPermission is a placeholder: at v6.0.0-rc.0
// Roles.Create returns nil but the server stores no Roles permission.
func TestRBACAddManageRolesPermission(t *testing.T) {
	t.Skip("fails at v6.0.0-rc.0: Roles.Create silently drops Roles permissions and returns nil")

	// TODO[g-despot]: manage-roles permission snippet pending a v6 client fix for dropped Roles permissions
	// START AddManageRolesPermission
	// Coming soon
	// END AddManageRolesPermission
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddManageUsersPermission
	assertRoleActions(t, "testRole", []string{"create_users", "read_users", "update_users", "delete_users", "assign_and_revoke_users"}, nil)
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddCollectionsPermission
	assertRoleActions(t, "testRole", []string{"create_collections", "read_collections", "update_collections", "delete_collections"}, nil)
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddTenantPermission
	assertRoleActions(t, "testRole", []string{"create_tenants", "read_tenants", "update_tenants", "delete_tenants"}, nil)
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddDataObjectPermission
	assertRoleActions(t, "testRole", []string{"create_data", "read_data", "update_data"}, []string{"delete_data"})
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddBackupPermission
	assertRoleActions(t, "testRole", []string{"manage_backups"}, nil)
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddClusterPermission
	assertRoleActions(t, "testRole", []string{"read_cluster"}, nil)
}

// TestRBACAddNodesPermission is a placeholder: at v6.0.0-rc.0
// Roles.Create returns nil but the server stores no Nodes permission.
func TestRBACAddNodesPermission(t *testing.T) {
	t.Skip("fails at v6.0.0-rc.0: Roles.Create silently drops Nodes permissions and returns nil")

	// TODO[g-despot]: nodes permission snippet pending a v6 client fix for dropped Nodes permissions
	// START AddNodesPermission
	// Coming soon
	// END AddNodesPermission
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddAliasPermission
	assertRoleActions(t, "testRole", []string{"create_aliases", "read_aliases", "update_aliases"}, []string{"delete_aliases"})
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddReplicationsPermission
	assertRoleActions(t, "testRole", []string{"create_replicate", "read_replicate", "update_replicate"}, []string{"delete_replicate"})
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddGroupsPermission
	assertRoleActions(t, "testRole", []string{"read_groups", "assign_and_revoke_groups"}, nil)
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AddRoles
	assertRoleActions(t, "testRole", []string{"create_data"}, nil)
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END RemovePermissions
	assertRoleActions(t, "testRole", []string{"update_collections", "read_cluster"}, []string{"create_collections", "read_collections", "delete_collections", "read_data"})
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END DeleteRole
	assertRESTStatus(t, "/v1/authz/roles/testRole", http.StatusNotFound)
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
	users, err := client.Users.DB.List(ctx, rbac.ListUsersOptions{
		// Ask the server to report when each key was last used.
		IncludeLastUsedAt: true,
	})
	if err != nil {
		// handle error
		panic(err)
	}
	for _, u := range users {
		fmt.Printf("%s (active: %t)\n", u.ID, u.Active)
		// When the server has nothing to report it sends the zero time, not a
		// null value.
		if !u.CreatedAt.IsZero() {
			fmt.Printf("  created: %s\n", u.CreatedAt.Format(time.RFC3339))
		}
		if u.LastUsedAt.IsZero() {
			fmt.Println("  never used")
		} else {
			fmt.Printf("  last used: %s\n", u.LastUsedAt.Format(time.RFC3339))
		}
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END DeleteUser
	assertRESTStatus(t, "/v1/users/db/custom-user", http.StatusNotFound)
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AssignRole
	assertDBUserRoles(t, client, "custom-user", []string{"testRole", "viewer"}, nil)
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END RevokeRoles
	assertDBUserRoles(t, client, "custom-user", nil, []string{"testRole"})
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AssignOidcUserRole
	assertOIDCUserRoles(t, client, "custom-user", []string{"testRole", "viewer"}, nil)
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END RevokeOidcUserRoles
	assertOIDCUserRoles(t, client, "custom-user", nil, []string{"testRole"})
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END AssignOidcGroupRoles
	assertGroupRoles(t, client, "/admin-group", []string{"testRole", "viewer"}, nil)
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
	if err != nil {
		// handle error
		panic(err)
	}
	// END RevokeOidcGroupRoles
	assertGroupRoles(t, client, "/admin-group", nil, []string{"testRole"})
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

// TestRBACGetKnownOidcGroups is a placeholder: rc.0 has the list-groups endpoint
// only in an internal package, and GroupsClient does not expose it.
func TestRBACGetKnownOidcGroups(t *testing.T) {
	t.Skip("not available at v6.0.0-rc.0: GroupsClient has no call that lists known OIDC groups")

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

// -----------------------------------------------------------------------------
// RBAC tutorial: role definitions and assignments
//
// The tutorial walks through three roles (read-and-write, viewer, tenant
// manager), each created and then assigned to the "custom-user" database user.
// The connect and create-user steps reuse the AdminClient and CreateUser markers
// above. Each test seeds any prerequisite (a database user, or the target role)
// outside the snippet marker and cleans it up afterwards.
// -----------------------------------------------------------------------------

// TestRBACReadWritePermissionDefinition is a placeholder: the tutorial role
// includes a Nodes permission, which Roles.Create drops at v6.0.0-rc.0.
func TestRBACReadWritePermissionDefinition(t *testing.T) {
	t.Skip("fails at v6.0.0-rc.0: Roles.Create silently drops the Nodes permission in this role and returns nil")

	// TODO[g-despot]: tutorial read-and-write role pending a v6 client fix for dropped Nodes permissions
	// START ReadWritePermissionDefinition
	// Coming soon
	// END ReadWritePermissionDefinition
}

// TestRBACReadWritePermissionAssignment is a placeholder: it assigns the
// tutorial's read-and-write role, which the Go tab cannot create at
// v6.0.0-rc.0 (see TestRBACReadWritePermissionDefinition).
func TestRBACReadWritePermissionAssignment(t *testing.T) {
	t.Skip("depends on the tutorial read-and-write role, which Roles.Create cannot create at v6.0.0-rc.0 because it drops the Nodes permission")

	// TODO[g-despot]: tutorial read-and-write role assignment pending a v6 client fix for dropped Nodes permissions
	// START ReadWritePermissionAssignment
	// Coming soon
	// END ReadWritePermissionAssignment
}

// TestRBACViewerPermissionDefinition creates the tutorial's viewer role:
// read-only access to collections starting with "TargetCollection".
func TestRBACViewerPermissionDefinition(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "viewer_role")
	defer deleteRoleIfExists(client, "viewer_role")

	// START ViewerPermissionDefinition
	// Confer viewer (read-only) rights to collections starting with
	// "TargetCollection".
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "viewer_role",
		Permissions: rbac.Permissions{
			Collections: []rbac.CollectionPermission{
				{Collection: "TargetCollection*", Read: true},
			},
			Data: []rbac.DataPermission{
				{Collection: "TargetCollection*", Read: true},
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END ViewerPermissionDefinition
	assertRoleActions(t, "viewer_role", []string{"read_collections", "read_data"}, []string{"create_collections", "create_data"})
}

// TestRBACViewerPermissionAssignment assigns the viewer role to the tutorial's
// custom user.
func TestRBACViewerPermissionAssignment(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedDBUser(t, client, "custom-user")
	seedRole(t, client, "viewer_role")
	defer deleteDBUserIfExists(client, "custom-user")
	defer deleteRoleIfExists(client, "viewer_role")

	// START ViewerPermissionAssignment
	// Assign the role to a user.
	err := client.Users.DB.AssignRoles(ctx, rbac.AssignRolesOptions{
		ID:    "custom-user",
		Roles: []string{"viewer_role"},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END ViewerPermissionAssignment
	assertDBUserRoles(t, client, "custom-user", []string{"viewer_role"}, nil)
}

// TestRBACMTPermissionsExample creates the tutorial's tenant-manager role: full
// tenant management and full data access for tenants starting with
// "TargetTenant" in collections starting with "TargetCollection".
func TestRBACMTPermissionsExample(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	deleteRoleIfExists(client, "tenant_manager")
	defer deleteRoleIfExists(client, "tenant_manager")

	// START MTPermissionsExample
	err := client.Roles.Create(ctx, rbac.Role{
		ID: "tenant_manager",
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
			Data: []rbac.DataPermission{
				{
					Collection: "TargetCollection*", // Applies to all matching collections.
					Tenant:     "TargetTenant*",     // Applies to all matching tenants.
					Create:     true,                // Allow data inserts.
					Read:       true,                // Allow query and fetch operations.
					Update:     true,                // Allow data updates.
					Delete:     true,                // Allow data deletes.
				},
			},
		},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END MTPermissionsExample
	assertRoleActions(t, "tenant_manager", []string{"create_tenants", "read_tenants", "update_tenants", "delete_tenants", "create_data", "read_data", "update_data", "delete_data"}, nil)
}

// TestRBACMTPermissionsAssignment assigns the tenant-manager role to the
// tutorial's custom user.
func TestRBACMTPermissionsAssignment(t *testing.T) {
	ctx := context.Background()
	client := connectRBACAdmin(t)
	defer client.Close()
	seedDBUser(t, client, "custom-user")
	seedRole(t, client, "tenant_manager")
	defer deleteDBUserIfExists(client, "custom-user")
	defer deleteRoleIfExists(client, "tenant_manager")

	// START MTPermissionsAssignment
	// Assign the role to a user.
	err := client.Users.DB.AssignRoles(ctx, rbac.AssignRolesOptions{
		ID:    "custom-user",
		Roles: []string{"tenant_manager"},
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END MTPermissionsAssignment
	assertDBUserRoles(t, client, "custom-user", []string{"tenant_manager"}, nil)
}
