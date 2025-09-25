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

func TestUserManagement(t *testing.T) {
	ctx := context.Background()

	// ==============================
	// =====  CONNECT =====
	// ==============================

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

	// Verify connection
	ready, err := client.Misc().ReadyChecker().Do(ctx)
	require.NoError(t, err)
	require.True(t, ready)

	// Clean up any existing test user
	client.Users().DB().Deleter().WithUserID("custom-user").Do(ctx)

	// Clean up any existing test role
	client.Roles().Deleter().WithName("testRole").Do(ctx)

	t.Run("CreateUser", func(t *testing.T) {
		// START CreateUser
		userApiKey, err := client.Users().DB().Creator().WithUserID("custom-user").Do(ctx)
		fmt.Println(userApiKey)
		// END CreateUser

		require.NoError(t, err)
		assert.Greater(t, len(userApiKey), 0)

		// Store for later tests
		t.Cleanup(func() {
			client.Users().DB().Deleter().WithUserID("custom-user").Do(ctx)
		})
	})

	t.Run("RotateApiKey", func(t *testing.T) {
		// Ensure user exists
		userApiKey, err := client.Users().DB().Creator().WithUserID("custom-user").Do(ctx)
		require.NoError(t, err)

		// START RotateApiKey
		newApiKey, err := client.Users().DB().KeyRotator().WithUserID("custom-user").Do(ctx)
		fmt.Println(newApiKey)
		// END RotateApiKey

		require.NoError(t, err)
		assert.Greater(t, len(newApiKey), 0)
		assert.NotEqual(t, newApiKey, userApiKey)

		t.Cleanup(func() {
			client.Users().DB().Deleter().WithUserID("custom-user").Do(ctx)
		})
	})

	t.Run("AssignRole", func(t *testing.T) {
		// Create test role first
		permissions := []rbac.Permission{
			rbac.CollectionsPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionReadCollections,
					models.PermissionActionCreateCollections,
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

		err := client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		require.NoError(t, err)

		// Ensure user exists
		_, err = client.Users().DB().Creator().WithUserID("custom-user").Do(ctx)
		require.NoError(t, err)

		// START AssignRole
		err = client.Users().DB().RolesAssigner().
			WithUserID("custom-user").
			WithRoles("testRole", "viewer").
			Do(ctx)
		// END AssignRole

		require.NoError(t, err)

		// Verify roles were assigned
		userRoles, err := client.Users().DB().RolesGetter().
			WithUserID("custom-user").
			WithIncludeFullRoles(true).
			Do(ctx)
		require.NoError(t, err)

		roleNames := make([]string, len(userRoles))
		for i, role := range userRoles {
			roleNames[i] = role.Name
		}
		assert.Contains(t, roleNames, "testRole")
		assert.Contains(t, roleNames, "viewer")

		t.Cleanup(func() {
			client.Users().DB().Deleter().WithUserID("custom-user").Do(ctx)
			client.Roles().Deleter().WithName("testRole").Do(ctx)
		})
	})

	t.Run("ListAllUsers", func(t *testing.T) {
		// Ensure user exists
		_, err := client.Users().DB().Creator().WithUserID("custom-user").Do(ctx)
		require.NoError(t, err)

		// START ListAllUsers
		users, err := client.Users().DB().Lister().Do(ctx)
		fmt.Println(users)
		// END ListAllUsers

		require.NoError(t, err)

		// Verify custom-user is in the list
		userFound := false
		for _, user := range users {
			if user.UserID == "custom-user" {
				userFound = true
				break
			}
		}
		assert.True(t, userFound, "custom-user should be in the list")

		t.Cleanup(func() {
			client.Users().DB().Deleter().WithUserID("custom-user").Do(ctx)
		})
	})

	t.Run("ListUserRoles", func(t *testing.T) {
		// Create test role
		permissions := []rbac.Permission{
			rbac.CollectionsPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionReadCollections,
					models.PermissionActionCreateCollections,
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

		err := client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		require.NoError(t, err)

		// Create user and assign roles
		_, err = client.Users().DB().Creator().WithUserID("custom-user").Do(ctx)
		require.NoError(t, err)

		err = client.Users().DB().RolesAssigner().
			WithUserID("custom-user").
			WithRoles("testRole", "viewer").
			Do(ctx)
		require.NoError(t, err)

		// START ListUserRoles
		userRoles, err := client.Users().DB().RolesGetter().
			WithUserID("custom-user").
			WithIncludeFullRoles(true).
			Do(ctx)

		for _, role := range userRoles {
			fmt.Println(role)
		}
		// END ListUserRoles

		require.NoError(t, err)

		roleNames := make([]string, len(userRoles))
		for i, role := range userRoles {
			roleNames[i] = role.Name
		}
		assert.Contains(t, roleNames, "testRole")
		assert.Contains(t, roleNames, "viewer")

		t.Cleanup(func() {
			client.Users().DB().Deleter().WithUserID("custom-user").Do(ctx)
			client.Roles().Deleter().WithName("testRole").Do(ctx)
		})
	})

	t.Run("RevokeRoles", func(t *testing.T) {
		// Create test role
		permissions := []rbac.Permission{
			rbac.CollectionsPermission{
				Collection: "TargetCollection*",
				Actions: []string{
					models.PermissionActionReadCollections,
					models.PermissionActionCreateCollections,
				},
			},
		}

		err := client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
		require.NoError(t, err)

		// Create user and assign roles
		_, err = client.Users().DB().Creator().WithUserID("custom-user").Do(ctx)
		require.NoError(t, err)

		err = client.Users().DB().RolesAssigner().
			WithUserID("custom-user").
			WithRoles("testRole", "viewer").
			Do(ctx)
		require.NoError(t, err)

		// START RevokeRoles
		err = client.Users().DB().RolesRevoker().
			WithUserID("custom-user").
			WithRoles("testRole").
			Do(ctx)
		// END RevokeRoles

		require.NoError(t, err)

		// Verify role was revoked
		userRoles, err := client.Users().DB().RolesGetter().
			WithUserID("custom-user").
			WithIncludeFullRoles(true).
			Do(ctx)
		require.NoError(t, err)

		roleNames := make([]string, len(userRoles))
		for i, role := range userRoles {
			roleNames[i] = role.Name
		}
		assert.NotContains(t, roleNames, "testRole", "testRole should be revoked")
		assert.Contains(t, roleNames, "viewer", "viewer role should still be assigned")

		t.Cleanup(func() {
			client.Users().DB().Deleter().WithUserID("custom-user").Do(ctx)
			client.Roles().Deleter().WithName("testRole").Do(ctx)
		})
	})

	t.Run("DeleteUser", func(t *testing.T) {
		// Create user
		_, err := client.Users().DB().Creator().WithUserID("custom-user").Do(ctx)
		require.NoError(t, err)

		// START DeleteUser
		deleted, err := client.Users().DB().Deleter().WithUserID("custom-user").Do(ctx)
		// END DeleteUser

		require.NoError(t, err)
		require.True(t, deleted)

		// Verify user was deleted
		users, err := client.Users().DB().Lister().Do(ctx)
		require.NoError(t, err)

		userFound := false
		for _, user := range users {
			if user.UserID == "custom-user" {
				userFound = true
				break
			}
		}
		assert.False(t, userFound, "custom-user should not be in the list after deletion")
	})
}
