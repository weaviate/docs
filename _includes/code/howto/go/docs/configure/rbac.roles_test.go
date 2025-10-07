package docs

import (
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/weaviate/weaviate-go-client/v5/weaviate"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/auth"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/rbac"
	"github.com/weaviate/weaviate/entities/models"
)

func TestRoleManagement(t *testing.T) {
	ctx := context.Background()

	// ==============================
	// =====  CONNECT =====
	// ==============================

	cfg := weaviate.Config{
		Host:       "localhost:8580",
		Scheme:     "http",
		AuthConfig: auth.ApiKey{Value: "root-user-key"},
	}

	client, err := weaviate.NewClient(cfg)
	require.NoError(t, err)

	// Verify connection
	ready, err := client.Misc().ReadyChecker().Do(ctx)
	require.NoError(t, err)
	require.True(t, ready)

	// Clean up any existing test roles before tests
	allRoles, err := client.Roles().AllGetter().Do(ctx)
	if err == nil {
		for _, role := range allRoles {
			if role.Name != "viewer" && role.Name != "root" && role.Name != "admin" && role.Name != "read-only" {
				client.Roles().Deleter().WithName(role.Name).Do(ctx)
			}
		}
	}

	// Clean up helper function for deferred cleanup
	cleanup := func(roleName string) {
		client.Roles().Deleter().WithName(roleName).Do(ctx)
	}

	t.Run("AdminClient", func(t *testing.T) {
		// START AdminClient
		cfg := weaviate.Config{
			Host:       "localhost:8580",
			Scheme:     "http",
			AuthConfig: auth.ApiKey{Value: "root-user-key"},
		}

		// Connect to Weaviate as root user
		client, err := weaviate.NewClient(cfg)
		// END AdminClient
		require.NoError(t, err)
		require.NotNil(t, client)
	})

	t.Run("CreateRole", func(t *testing.T) {
		defer cleanup("testRole")

		// START CreateRole
		role := rbac.NewRole("testRole", rbac.DataPermission{
			Actions:    []string{models.PermissionActionReadData},
			Collection: "*",
		})
		err = client.Roles().Creator().WithRole(role).Do(ctx)
		require.NoError(t, err)
		// END CreateRole

		// START CheckRoleExists
		exists, err := client.Roles().Exists().WithName("testRole").Do(ctx)
		fmt.Println(exists) // Returns true or false
		// END CheckRoleExists

		require.NoError(t, err)
		assert.True(t, exists)
	})

	t.Run("AddManageRolesPermission", func(t *testing.T) {
		defer cleanup("testRole")

		// START AddManageRolesPermission
		permissions := []rbac.Permission{
			rbac.RolesPermission{
				Role:  "testRole*", // Applies to all roles starting with "testRole"
				Scope: "match",     // Only allow role management with the current user's permission level, can also be "all"
				// Scope: rbac.RoleScopeAll, // Allow role management with all permissions
				Actions: []string{
					models.PermissionActionCreateRoles, // Allow creating roles
					models.PermissionActionReadRoles,   // Allow reading roles
					models.PermissionActionUpdateRoles, // Allow updating roles
					models.PermissionActionDeleteRoles, // Allow deleting roles
				},
			},
		}

		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		// END AddManageRolesPermission
		require.NoError(t, err)

		exists, err := client.Roles().Exists().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.True(t, exists)
	})

	t.Run("AddManageUsersPermission", func(t *testing.T) {
		defer cleanup("testRole")

		// START AddManageUsersPermission
		permissions := []rbac.Permission{
			rbac.UsersPermission{
				Actions: []string{
					models.PermissionActionCreateUsers,          // Allow creating users
					models.PermissionActionReadUsers,            // Allow reading user info
					models.PermissionActionUpdateUsers,          // Allow rotating user API key
					models.PermissionActionDeleteUsers,          // Allow deleting users
					models.PermissionActionAssignAndRevokeUsers, // Allow assigning and revoking roles to and from users
				},
			},
		}

		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		// END AddManageUsersPermission
		require.NoError(t, err)

		exists, err := client.Roles().Exists().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.True(t, exists)
	})

	t.Run("AddCollectionsPermission", func(t *testing.T) {
		defer cleanup("testRole")

		// START AddCollectionsPermission
		permissions := []rbac.Permission{
			rbac.CollectionsPermission{
				Collection: "TargetCollection*", // Applies to all collections starting with "TargetCollection"
				Actions: []string{
					models.PermissionActionCreateCollections, // Allow creating new collections
					models.PermissionActionReadCollections,   // Allow reading collection info/metadata
					models.PermissionActionUpdateCollections, // Allow updating collection configuration, i.e. update schema properties, when inserting data with new properties
					models.PermissionActionDeleteCollections, // Allow deleting collections
				},
			},
		}

		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		// END AddCollectionsPermission
		require.NoError(t, err)

		role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.NotNil(t, role.Collections)
		assert.Greater(t, len(role.Collections), 0)
		found := false
		for _, perm := range role.Collections {
			if perm.Collection == "TargetCollection*" {
				found = true
				break
			}
		}
		assert.True(t, found)
	})

	t.Run("AddTenantPermission", func(t *testing.T) {
		defer cleanup("testRole")

		// START AddTenantPermission
		permissions := []rbac.Permission{
			rbac.TenantsPermission{
				Actions: []string{
					models.PermissionActionCreateTenants, // Allow creating new tenants
					models.PermissionActionReadTenants,   // Allow reading tenant info/metadata
					models.PermissionActionUpdateTenants, // Allow updating tenant states
					models.PermissionActionDeleteTenants, // Allow deleting tenants
				},
			},
		}

		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		// END AddTenantPermission
		require.NoError(t, err)

		role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.NotNil(t, role.Tenants)
		assert.Greater(t, len(role.Tenants), 0)
	})

	t.Run("AddDataObjectPermission", func(t *testing.T) {
		defer cleanup("testRole")

		// START AddDataObjectPermission
		permissions := []rbac.Permission{
			rbac.DataPermission{
				Collection: "TargetCollection*", // Applies to all collections starting with "TargetCollection"
				Actions: []string{
					models.PermissionActionCreateData, // Allow data inserts
					models.PermissionActionReadData,   // Allow query and fetch operations
					models.PermissionActionUpdateData, // Allow data updates
					// models.PermissionActionDeleteData, // Allow data deletes - set to false by not including
				},
			},
		}

		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		// END AddDataObjectPermission
		require.NoError(t, err)

		role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.NotNil(t, role.Data)
		assert.Greater(t, len(role.Data), 0)
		found := false
		for _, perm := range role.Data {
			if perm.Collection == "TargetCollection*" {
				found = true
				break
			}
		}
		assert.True(t, found)
	})

	t.Run("AddBackupPermission", func(t *testing.T) {
		defer cleanup("testRole")

		// START AddBackupPermission
		permissions := []rbac.Permission{
			rbac.BackupsPermission{
				Collection: "TargetCollection*", // Applies to all collections starting with "TargetCollection"
				Actions: []string{
					models.PermissionActionManageBackups, // Allow managing backups
				},
			},
		}

		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		// END AddBackupPermission
		require.NoError(t, err)

		role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.NotNil(t, role.Backups)
		assert.Greater(t, len(role.Backups), 0)
		found := false
		for _, perm := range role.Backups {
			if perm.Collection == "TargetCollection*" {
				found = true
				break
			}
		}
		assert.True(t, found)
	})

	t.Run("AddClusterPermission", func(t *testing.T) {
		defer cleanup("testRole")

		// START AddClusterPermission
		permissions := []rbac.Permission{
			rbac.ClusterPermission{
				Actions: []string{
					models.PermissionActionReadCluster, // Allow reading cluster data
				},
			},
		}

		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		// END AddClusterPermission
		require.NoError(t, err)

		role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.NotNil(t, role.Cluster)
	})

	t.Run("AddNodesPermission", func(t *testing.T) {
		defer cleanup("testRole")

		// START AddNodesPermission
		verbosePermissions := []rbac.Permission{
			rbac.NodesPermission{
				Verbosity:  "verbose",
				Collection: "TargetCollection*", // Applies to all collections starting with "TargetCollection"
				Actions: []string{
					models.PermissionActionReadNodes, // Allow reading node metadata
				},
			},
		}

		// The `minimal` verbosity level applies to all collections unlike
		// the `verbose` level where you specify the collection name filter
		err = client.Roles().Creator().WithRole(
			rbac.NewRole("testRole", verbosePermissions...),
		).Do(ctx)
		// END AddNodesPermission
		require.NoError(t, err)

		role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.NotNil(t, role.Nodes)
		assert.Greater(t, len(role.Nodes), 0)
		found := false
		for _, perm := range role.Nodes {
			if perm.Collection == "TargetCollection*" {
				found = true
				break
			}
		}
		assert.True(t, found)
	})

	t.Run("AddAliasPermission", func(t *testing.T) {
		defer cleanup("testRole")

		// START AddAliasPermission
		permissions := []rbac.Permission{
			rbac.AliasPermission{
				Alias:      "TargetAlias*",      // Applies to all aliases starting with "TargetAlias"
				Collection: "TargetCollection*", // Applies to all collections starting with "TargetCollection"
				Actions: []string{
					models.PermissionActionCreateAliases, // Allow alias creation
					models.PermissionActionReadAliases,   // Allow listing aliases
					models.PermissionActionUpdateAliases, // Allow updating aliases
					// models.PermissionActionDeleteAliases, // Allow deleting aliases - set to false by not including
				},
			},
		}

		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		// END AddAliasPermission
		require.NoError(t, err)

		role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.NotNil(t, role.Alias)
		assert.Greater(t, len(role.Alias), 0)
		found := false
		for _, perm := range role.Alias {
			if perm.Alias == "TargetAlias*" {
				found = true
				break
			}
		}
		assert.True(t, found)
	})

	t.Run("AddReplicationsPermission", func(t *testing.T) {
		defer cleanup("testRole")

		// START AddReplicationsPermission
		permissions := []rbac.Permission{
			rbac.ReplicatePermission{
				Collection: "TargetCollection*", // Applies to all collections starting with "TargetCollection"
				Shard:      "TargetShard*",      // Applies to all shards starting with "TargetShard"
				Actions: []string{
					models.PermissionActionCreateReplicate, // Allow replica movement operations
					models.PermissionActionReadReplicate,   // Allow retrieving replication status
					models.PermissionActionUpdateReplicate, // Allow cancelling replication operations
					// models.PermissionActionDeleteReplicate, // Allow deleting replication operations - set to false by not including
				},
			},
		}

		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		// END AddReplicationsPermission
		require.NoError(t, err)

		role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.NotNil(t, role.Replicate)
		assert.Greater(t, len(role.Replicate), 0)
		found := false
		for _, perm := range role.Replicate {
			if perm.Collection == "TargetCollection*" && perm.Shard == "TargetShard*" {
				found = true
				break
			}
		}
		assert.True(t, found)
	})

	// t.Run("AddGroupsPermission", func(t *testing.T) {
	// 	defer cleanup("testRole")

	// 	// START AddGroupsPermission
	//  Coming soon
	// 	permissions := []rbac.Permission{
	// 		rbac.GroupsPermission{
	// 			Group: "TargetGroup*", // Applies to all groups starting with "TargetGroup"
	// 			Actions: []string{
	// 				models.PermissionActionReadGroups,            // Allow reading group information
	// 				models.PermissionActionAssignAndRevokeGroups, // Allow assigning and revoking group memberships
	// 			},
	// 		},
	// 	}

	// 	err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
	// 	// END AddGroupsPermission
	// 	require.NoError(t, err)

	// 	role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
	// 	require.NoError(t, err)
	// 	assert.NotNil(t, role.Groups)
	// 	assert.Greater(t, len(role.Groups), 0)
	// 	found := false
	// 	for _, perm := range role.Groups {
	// 		if perm.Group == "TargetGroup*" {
	// 			found = true
	// 			break
	// 		}
	// 	}
	// 	assert.True(t, found)
	// })

	t.Run("AddRoles", func(t *testing.T) {
		defer cleanup("testRole")

		// Create initial role
		initialPermissions := []rbac.Permission{
			rbac.CollectionsPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionReadCollections,
				},
			},
		}
		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", initialPermissions...)).Do(ctx)
		require.NoError(t, err)

		// START AddRoles
		permissions := []rbac.Permission{
			rbac.DataPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionCreateData,
				},
			},
		}

		err = client.Roles().PermissionAdder().
			WithRole("testRole").
			WithPermissions(permissions...).
			Do(ctx)
		// END AddRoles
		require.NoError(t, err)

		role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		assert.NotNil(t, role.Data)
	})

	t.Run("InspectRole", func(t *testing.T) {
		defer cleanup("testRole")

		// Create test role with permissions
		permissions := []rbac.Permission{
			rbac.CollectionsPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionReadCollections,
				},
			},
			rbac.DataPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionCreateData,
				},
			},
		}
		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		require.NoError(t, err)

		// START InspectRole
		testRole, err := client.Roles().Getter().WithName("testRole").Do(ctx)

		fmt.Println(testRole)
		fmt.Println(testRole.Collections)
		fmt.Println(testRole.Data)
		// END InspectRole

		require.NoError(t, err)
		assert.NotNil(t, testRole)
		assert.NotNil(t, testRole.Collections)
		assert.NotNil(t, testRole.Data)
	})

	t.Run("AssignedUsers", func(t *testing.T) {
		defer cleanup("testRole")

		// Create test role
		role := rbac.NewRole("testRole", rbac.DataPermission{
			Actions:    []string{models.PermissionActionReadData},
			Collection: "*",
		})
		err = client.Roles().Creator().WithRole(role).Do(ctx)
		require.NoError(t, err)

		// Create and assign user
		client.Users().DB().Deleter().WithUserID("custom-user").Do(ctx)
		_, err = client.Users().DB().Creator().WithUserID("custom-user").Do(ctx)
		require.NoError(t, err)
		err = client.Users().DB().RolesAssigner().
			WithUserID("custom-user").
			WithRoles("testRole").
			Do(ctx)
		require.NoError(t, err)

		// START AssignedUsers
		assignedUsers, err := client.Roles().UserAssignmentGetter().
			WithRole("testRole").
			Do(ctx)

		for _, user := range assignedUsers {
			fmt.Println(user)
		}
		// END AssignedUsers

		require.NoError(t, err)
		found := false
		for _, u := range assignedUsers {
			if u.UserID == "custom-user" {
				found = true
				break
			}
		}
		assert.True(t, found)

		// Clean up
		client.Users().DB().Deleter().WithUserID("custom-user").Do(ctx)
	})

	t.Run("ListAllRoles", func(t *testing.T) {
		defer cleanup("testRole")

		// Create test role
		role := rbac.NewRole("testRole", rbac.DataPermission{
			Actions:    []string{models.PermissionActionReadData},
			Collection: "*",
		})
		err = client.Roles().Creator().WithRole(role).Do(ctx)
		require.NoError(t, err)

		// START ListAllRoles
		allRoles, err := client.Roles().AllGetter().Do(ctx)

		for _, role := range allRoles {
			fmt.Println(role.Name, role)
		}
		// END ListAllRoles

		require.NoError(t, err)
		found := false
		for _, role := range allRoles {
			if role.Name == "testRole" {
				found = true
				break
			}
		}
		assert.True(t, found)
	})

	t.Run("RemovePermissions", func(t *testing.T) {
		defer cleanup("testRole")

		// Create role with permissions
		permissions := []rbac.Permission{
			rbac.CollectionsPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionReadCollections,
					models.PermissionActionCreateCollections,
					models.PermissionActionDeleteCollections,
				},
			},
			rbac.DataPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionReadData,
					models.PermissionActionCreateData,
				},
			},
		}
		err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		require.NoError(t, err)

		// START RemovePermissions
		permissions = []rbac.Permission{
			rbac.CollectionsPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionReadCollections,
					models.PermissionActionCreateCollections,
					models.PermissionActionDeleteCollections,
				},
			},
			rbac.DataPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionReadData,
					// models.PermissionActionCreateData, // create=False
				},
			},
		}

		err = client.Roles().PermissionRemover().
			WithRole("testRole").
			WithPermissions(permissions...).
			Do(ctx)
		// END RemovePermissions

		require.NoError(t, err)

		role, err := client.Roles().Getter().WithName("testRole").Do(ctx)
		require.NoError(t, err)
		// Verify permissions were removed
		assert.NotNil(t, role)
	})

	t.Run("DeleteRole", func(t *testing.T) {
		// Create test role
		role := rbac.NewRole("testRole", rbac.DataPermission{
			Actions:    []string{models.PermissionActionReadData},
			Collection: "*",
		})
		err = client.Roles().Creator().WithRole(role).Do(ctx)
		require.NoError(t, err)

		// START DeleteRole
		err = client.Roles().Deleter().WithName("testRole").Do(ctx)
		// END DeleteRole

		require.NoError(t, err)

		exists, err := client.Roles().Exists().WithName("testRole").Do(ctx)
		require.Error(t, err)
		assert.False(t, exists)
	})
}
