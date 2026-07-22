package main

import (
	"context"
	"testing"
	"time"

	"github.com/weaviate/weaviate-go-client/v6/backup"
)

// The backup snippets below require a configured backup backend (for example the
// filesystem module). They are kept out of the CI run set (compile-only) and
// skip when executed directly.

// TestCreateBackup starts a backup and waits for it to complete.
func TestCreateBackup(t *testing.T) {
	t.Skip("requires a Weaviate instance with a backup backend module enabled")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START CreateBackup
	info, err := client.Backup.Create(ctx, backup.CreateOptions{
		Backend: "filesystem",
		ID:      "my-backup",
	})
	if err != nil {
		t.Fatal(err)
	}

	// Block until the backup finishes. The default polling interval is one
	// second; override it with backup.WithPollingInterval.
	info, err = backup.AwaitCompletion(ctx, info, backup.WithPollingInterval(2*time.Second))
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("backup %q finished with status %s", info.ID, info.Status)
	// END CreateBackup
}

// TestStatusCreateBackup polls the status of an in-progress backup creation.
func TestStatusCreateBackup(t *testing.T) {
	t.Skip("requires a Weaviate instance with a backup backend module enabled")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START StatusCreateBackup
	info, err := client.Backup.GetCreateStatus(ctx, backup.GetStatusOptions{
		Backend: "filesystem",
		ID:      "my-backup",
	})
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("backup %q status: %s", info.ID, info.Status)
	// END StatusCreateBackup
}

// TestCancelBackup cancels an in-progress backup creation.
func TestCancelBackup(t *testing.T) {
	t.Skip("requires a Weaviate instance with a backup backend module enabled")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START CancelBackup
	err := client.Backup.CancelCreate(ctx, backup.CancelOptions{
		Backend: "filesystem",
		ID:      "my-backup",
	})
	// END CancelBackup
	if err != nil {
		t.Fatal(err)
	}
}

// TestRestoreBackup restores a backup and waits for it to complete.
func TestRestoreBackup(t *testing.T) {
	t.Skip("requires a Weaviate instance with a backup backend module enabled")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START RestoreBackup
	info, err := client.Backup.Restore(ctx, backup.RestoreOptions{
		Backend: "filesystem",
		ID:      "my-backup",
	})
	if err != nil {
		t.Fatal(err)
	}

	info, err = backup.AwaitCompletion(ctx, info)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("restore of %q finished with status %s", info.ID, info.Status)
	// END RestoreBackup
}

// TestStatusRestoreBackup polls the status of an in-progress backup restore.
func TestStatusRestoreBackup(t *testing.T) {
	t.Skip("requires a Weaviate instance with a backup backend module enabled")
	ctx := context.Background()
	client := connectLocal(t)
	defer client.Close()

	// START StatusRestoreBackup
	info, err := client.Backup.GetRestoreStatus(ctx, backup.GetStatusOptions{
		Backend: "filesystem",
		ID:      "my-backup",
	})
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("restore of %q status: %s", info.ID, info.Status)
	// END StatusRestoreBackup
}
