package main

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/weaviate/weaviate-go-client/v6/backup"
)

// The docs instance has the filesystem backend, but these snippets use a fixed
// backup ID. Backups persist on the instance, so a second run collides with the
// first, and an unscoped backup or restore acts on every collection of the shared
// instance. They stay skipped and compile only.

// TestCreateBackup starts a backup and waits for it to complete.
func TestCreateBackup(t *testing.T) {
	t.Skip("fixed backup ID: backups persist on the shared instance, so a rerun collides with the existing backup")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START CreateBackup
	info, err := client.Backup.Create(ctx, backup.CreateOptions{
		Backend: "filesystem",
		ID:      "my-backup",
	})
	if err != nil {
		// handle error
		panic(err)
	}

	// Block until the backup finishes. The default polling interval is one
	// second; override it with backup.WithPollingInterval.
	info, err = backup.AwaitCompletion(ctx, info, backup.WithPollingInterval(2*time.Second))
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Printf("backup %q finished with status %s\n", info.ID, info.Status)
	// END CreateBackup
}

// TestStatusCreateBackup polls the status of an in-progress backup creation.
func TestStatusCreateBackup(t *testing.T) {
	t.Skip("fixed backup ID: backups persist on the shared instance, so a rerun collides with the existing backup")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START StatusCreateBackup
	info, err := client.Backup.GetCreateStatus(ctx, backup.GetStatusOptions{
		Backend: "filesystem",
		ID:      "my-backup",
	})
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Printf("backup %q status: %s\n", info.ID, info.Status)
	// END StatusCreateBackup
}

// TestCancelBackup cancels an in-progress backup creation.
func TestCancelBackup(t *testing.T) {
	t.Skip("needs an in-flight backup with this fixed ID: cancelling a finished backup returns HTTP 422 and an unknown ID is a no-op")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START CancelBackup
	err := client.Backup.CancelCreate(ctx, backup.CancelOptions{
		Backend: "filesystem",
		ID:      "some-unwanted-backup",
	})
	if err != nil {
		// handle error
		panic(err)
	}
	// END CancelBackup
}

// TestRestoreBackup restores a backup and waits for it to complete.
func TestRestoreBackup(t *testing.T) {
	t.Skip("fixed backup ID: backups persist on the shared instance, so a rerun collides with the existing backup")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START RestoreBackup
	info, err := client.Backup.Restore(ctx, backup.RestoreOptions{
		Backend: "filesystem",
		ID:      "my-backup",
	})
	if err != nil {
		// handle error
		panic(err)
	}

	info, err = backup.AwaitCompletion(ctx, info)
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Printf("restore of %q finished with status %s\n", info.ID, info.Status)
	// END RestoreBackup
}

// TestStatusRestoreBackup polls the status of an in-progress backup restore.
func TestStatusRestoreBackup(t *testing.T) {
	t.Skip("fixed backup ID: backups persist on the shared instance, so a rerun collides with the existing backup")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START StatusRestoreBackup
	info, err := client.Backup.GetRestoreStatus(ctx, backup.GetStatusOptions{
		Backend: "filesystem",
		ID:      "my-backup",
	})
	if err != nil {
		// handle error
		panic(err)
	}
	fmt.Printf("restore of %q status: %s\n", info.ID, info.Status)
	// END StatusRestoreBackup
}
