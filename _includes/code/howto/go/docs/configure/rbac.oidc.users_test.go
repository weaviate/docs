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

func TestOIDCUserManagement(t *testing.T) {
	// TODO[g-despot]: OIDC testing not yet implemented
	// This test requires OIDC provider configuration
	// Uncomment and configure when OIDC is available
	// t.Skip("OIDC testing not yet implemented")

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

	// Clean up any existing test role
	client.Roles().Deleter().WithName("testRole").Do(ctx)

	// Create test role for OIDC user assignment
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

	err = client.Roles().Creator().WithRole(rbac.NewRole("testRole", permissions...)).Do(ctx)
	require.NoError(t, err)

	t.Cleanup(func() {
		client.Roles().Deleter().WithName("testRole").Do(ctx)
	})

	t.Run("AssignOidcUserRole", func(t *testing.T) {
		// START AssignOidcUserRole
		err = client.Users().OIDC().RolesAssigner().
			WithUserID("custom-user").
			WithRoles("testRole", "viewer").
			Do(ctx)
		// END AssignOidcUserRole

		require.NoError(t, err)

		// Verify roles were assigned
		userRoles, err := client.Users().OIDC().RolesGetter().
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
	})

	t.Run("ListOidcUserRoles", func(t *testing.T) {
		// Ensure roles are assigned
		err = client.Users().OIDC().RolesAssigner().
			WithUserID("custom-user").
			WithRoles("testRole", "viewer").
			Do(ctx)
		require.NoError(t, err)

		// START ListOidcUserRoles
		userRoles, err := client.Users().OIDC().RolesGetter().
			WithUserID("custom-user").
			WithIncludeFullRoles(true).
			Do(ctx)

		for _, role := range userRoles {
			fmt.Println(role)
		}
		// END ListOidcUserRoles

		require.NoError(t, err)

		roleNames := make([]string, len(userRoles))
		for i, role := range userRoles {
			roleNames[i] = role.Name
		}
		assert.Contains(t, roleNames, "testRole")
		assert.Contains(t, roleNames, "viewer")
	})

	t.Run("RevokeOidcUserRoles", func(t *testing.T) {
		// Ensure roles are assigned first
		err = client.Users().OIDC().RolesAssigner().
			WithUserID("custom-user").
			WithRoles("testRole", "viewer").
			Do(ctx)
		require.NoError(t, err)

		// START RevokeOidcUserRoles
		err = client.Users().OIDC().RolesRevoker().
			WithUserID("custom-user").
			WithRoles("testRole").
			Do(ctx)
		// END RevokeOidcUserRoles

		require.NoError(t, err)

		// Verify role was revoked
		userRoles, err := client.Users().OIDC().RolesGetter().
			WithUserID("custom-user").
			WithIncludeFullRoles(true).
			Do(ctx)
		require.NoError(t, err)

		roleNames := make([]string, len(userRoles))
		for i, role := range userRoles {
			roleNames[i] = role.Name
		}
		assert.NotContains(t, roleNames, "testRole", "testRole should be revoked")
	})
}
