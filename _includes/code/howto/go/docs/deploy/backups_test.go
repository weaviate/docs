package docs

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/weaviate/weaviate-go-client/v5/weaviate"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/auth"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/backup"
	"github.com/weaviate/weaviate/entities/models"
)

func TestBackupAndRestore(t *testing.T) {
	ctx := context.Background()
	cfg := weaviate.Config{
		Host:   "localhost:8580",
		Scheme: "http",
		AuthConfig: auth.ApiKey{
			Value: "root-user-key",
		},
	}
	client, err := weaviate.NewClient(cfg)
	require.NoError(t, err)

	// NOTE: This test uses static backup IDs. You will need to manually clear
	// the backup storage directory on your Weaviate server to re-run this test.

	t.Run("Create, restore, and check backup", func(t *testing.T) {
		// Clean up and create schema
		client.Schema().AllDeleter().Do(ctx)
		classArticle := &models.Class{Class: "Article"}
		classPublication := &models.Class{Class: "Publication"}
		require.NoError(t, client.Schema().ClassCreator().WithClass(classArticle).Do(ctx))
		require.NoError(t, client.Schema().ClassCreator().WithClass(classPublication).Do(ctx))
		_, err = client.Data().Creator().WithClassName("Article").WithProperties(map[string]interface{}{"title": "Dummy"}).Do(ctx)
		require.NoError(t, err)
		_, err = client.Data().Creator().WithClassName("Publication").WithProperties(map[string]interface{}{"title": "Dummy"}).Do(ctx)
		require.NoError(t, err)

		// Add a user to be backed up
		username := "test-user-for-backup"
		// Clean up user if it exists from a previous failed run
		client.Users().DB().Deleter().WithUserID(username).Do(ctx)
		_, err = client.Users().DB().Creator().WithUserID(username).Do(ctx)
		require.NoError(t, err)

		// Create a backup
		// START CreateBackup
		createResponse, err := client.Backup().Creator().
			WithIncludeClassNames("Article", "Publication").
			WithBackend(backup.BACKEND_FILESYSTEM).
			WithBackupID("my-very-first-backup").
			WithWaitForCompletion(true).
			Do(context.Background())
		// END CreateBackup
		require.NoError(t, err)
		require.NotNil(t, createResponse)
		assert.Equal(t, "SUCCESS", *createResponse.Status)

		// Delete the user after creating the backup to test restoration
		deleted, err := client.Users().DB().Deleter().WithUserID(username).Do(ctx)
		require.NoError(t, err)
		require.True(t, deleted)
		_, err = client.Users().DB().Getter().WithUserID(username).Do(ctx)
		require.Error(t, err) // Verify user is deleted

		// Check the creation status
		// START StatusCreateBackup
		statusCreateResponse, err := client.Backup().CreateStatusGetter().
			WithBackend(backup.BACKEND_FILESYSTEM).
			WithBackupID("my-very-first-backup").
			Do(context.Background())
		// END StatusCreateBackup
		require.NoError(t, err)
		require.NotNil(t, statusCreateResponse)
		assert.Equal(t, "SUCCESS", *statusCreateResponse.Status)

		// Delete all classes before restoring to ensure a clean slate
		require.NoError(t, client.Schema().AllDeleter().Do(ctx))

		// Restore the backup, excluding one class and including users/roles
		// START RestoreBackup
		restoreResponse, err := client.Backup().Restorer().
			WithExcludeClassNames("Article").
			WithBackend(backup.BACKEND_FILESYSTEM).
			WithBackupID("my-very-first-backup").
			WithWaitForCompletion(true).
			// The following two methods can be used to restore roles and users separately
			// .WithRBACRoles(rbac.RBACAll).
			// .WithRBACUsers(rbac.UserAll).
			WithRBACAndUsers(). // This is a convenience method to restore both roles and users
			Do(context.Background())
		// END RestoreBackup
		require.NoError(t, err)
		require.NotNil(t, restoreResponse)
		assert.Equal(t, "SUCCESS", *restoreResponse.Status)

		// Check the restore status
		// START StatusRestoreBackup
		statusRestoreResponse, err := client.Backup().RestoreStatusGetter().
			WithBackend(backup.BACKEND_FILESYSTEM).
			WithBackupID("my-very-first-backup").
			Do(context.Background())
		// END StatusRestoreBackup
		require.NoError(t, err)
		require.NotNil(t, statusRestoreResponse)
		assert.Equal(t, "SUCCESS", *statusRestoreResponse.Status)

		// Verify that the correct class was restored
		class, err := client.Schema().ClassGetter().WithClassName("Publication").Do(ctx)
		require.NoError(t, err)
		require.NotNil(t, class)
		// Verify that the excluded class was NOT restored
		class, err = client.Schema().ClassGetter().WithClassName("Article").Do(ctx)
		require.Error(t, err) // Expect an error because the class should not exist
		require.Nil(t, class)

		// Verify that the user was restored by listing all users
		allUsers, err := client.Users().DB().Lister().Do(ctx)
		require.NoError(t, err)
		found := false
		for _, user := range allUsers {
			if user.UserID == username {
				found = true
				break
			}
		}
		require.True(t, found, "restored user %s not found in user list", username)
	})

	t.Run("Cancel backup", func(t *testing.T) {
		// Clean up and create schema for this specific test
		client.Schema().AllDeleter().Do(ctx)
		classArticle := &models.Class{Class: "Article"}
		classPublication := &models.Class{Class: "Publication"}
		require.NoError(t, client.Schema().ClassCreator().WithClass(classArticle).Do(ctx))
		require.NoError(t, client.Schema().ClassCreator().WithClass(classPublication).Do(ctx))

		// Start a backup without waiting for it to complete
		_, err := client.Backup().Creator().
			WithIncludeClassNames("Article", "Publication").
			WithBackend(backup.BACKEND_FILESYSTEM).
			WithBackupID("some-unwanted-backup").
			WithWaitForCompletion(false).
			Do(context.Background())
		require.NoError(t, err)

		// Cancel the backup
		// START CancelBackup
		err = client.Backup().Canceler().
			WithBackend(backup.BACKEND_FILESYSTEM).
			WithBackupID("some-unwanted-backup").
			Do(context.Background())
		// END CancelBackup
		require.NoError(t, err)

		// Poll for the status of the canceled backup until it is CANCELED or a timeout occurs
		var statusResponse *models.BackupCreateStatusResponse
		for i := 0; i < 10; i++ {
			statusResponse, err = client.Backup().CreateStatusGetter().
				WithBackend(backup.BACKEND_FILESYSTEM).
				WithBackupID("some-unwanted-backup").
				Do(context.Background())
			require.NoError(t, err)
			if *statusResponse.Status == "CANCELED" {
				break
			}
			time.Sleep(500 * time.Millisecond)
		}

		// Check that the backup status is CANCELED
		require.NotNil(t, statusResponse)
		assert.Equal(t, "CANCELED", *statusResponse.Status)
	})
}
