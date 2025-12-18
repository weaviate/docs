using System;
using System.Threading;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

// Run sequentially to prevent backup conflicts on the filesystem backend
[Collection("Sequential")]
public class BackupsTest : IAsyncLifetime
{
    private WeaviateClient client;
    private readonly BackupBackend _backend = new FilesystemBackend();

    public async Task InitializeAsync()
    {
        client = await Connect.Local(restPort: 8580, grpcPort: 50551, credentials: "root-user-key");

        // Ensure a clean state
        await CleanupCollections();
    }

    public Task DisposeAsync()
    {
        // The C# client manages connections automatically.
        return Task.CompletedTask;
    }

    // Helper method to set up collections for tests
    private async Task SetupCollections()
    {
        await CleanupCollections();

        await client.Collections.Create(
            new CollectionCreateParams { Name = "Article", Properties = [Property.Text("title")] }
        );

        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Publication",
                Properties = [Property.Text("title")],
            }
        );

        await client.Collections.Use("Article").Data.Insert(new { title = "Dummy" });
        await client.Collections.Use("Publication").Data.Insert(new { title = "Dummy" });
    }

    private async Task CleanupCollections()
    {
        if (await client.Collections.Exists("Article"))
            await client.Collections.Delete("Article");
        if (await client.Collections.Exists("Publication"))
            await client.Collections.Delete("Publication");
    }

    [Fact]
    public async Task TestBackupAndRestoreLifecycle()
    {
        await SetupCollections();
        string backupId = "my-very-first-backup";

        // START CreateBackup
        var createResult = await client.Backup.CreateSync(
            new BackupCreateRequest(
                Id: backupId,
                Backend: _backend,
                IncludeCollections: ["Article", "Publication"]
            )
        );

        Console.WriteLine($"Status: {createResult.Status}");
        // END CreateBackup

        Assert.Equal(BackupStatus.Success, createResult.Status);

        // START StatusCreateBackup
        var createStatus = await client.Backup.GetStatus(_backend, backupId);

        Console.WriteLine($"Backup ID: {createStatus.Id}, Status: {createStatus.Status}");
        // END StatusCreateBackup

        Assert.Equal(BackupStatus.Success, createStatus.Status);

        // Delete all classes before restoring
        await client.Collections.DeleteAll();
        Assert.False(await client.Collections.Exists("Article"));
        Assert.False(await client.Collections.Exists("Publication"));

        // START RestoreBackup
        var restoreResult = await client.Backup.RestoreSync(
            new BackupRestoreRequest(
                Id: backupId,
                Backend: _backend,
                ExcludeCollections: ["Article"] // Exclude Article from restoration
            )
        );

        Console.WriteLine($"Restore Status: {restoreResult.Status}");
        // END RestoreBackup

        Assert.Equal(BackupStatus.Success, restoreResult.Status);

        // Verify that Publication was restored and Article was excluded
        Assert.True(await client.Collections.Exists("Publication"));
        Assert.False(await client.Collections.Exists("Article"));

        // START StatusRestoreBackup
        // Note: In C#, restore status is often tracked via the returned operation or by polling if async.
        // GetRestoreStatus checks the status of a specific restore job.
        // Since we ran RestoreSync, we know it is done.
        // We can inspect the result returned from RestoreSync directly.
        Console.WriteLine($"Restore ID: {restoreResult.Id}, Status: {restoreResult.Status}");
        // END StatusRestoreBackup

        Assert.Equal(BackupStatus.Success, restoreResult.Status);

        // Clean up
        await client.Collections.Delete("Publication");
    }

    [Fact]
    public async Task TestCancelBackup()
    {
        await SetupCollections();
        string backupId = "some-unwanted-backup";

        // Start a backup to cancel (Async, creates the operation but returns immediately)
        CancellationToken cancellationToken = new CancellationToken();
        var backupOperation = await client.Backup.Create(
            new BackupCreateRequest(
                Id: backupId,
                Backend: _backend,
                ExcludeCollections: ["Article", "Publication"]
            ),
            cancellationToken
        );

        Console.WriteLine($"Backup started with ID: {backupOperation.Current.Id}");

        // START CancelBackup
        await backupOperation.Cancel(cancellationToken);
        // END CancelBackup

        // Wait for the cancellation to be processed
        var finalStatus = await backupOperation.WaitForCompletion();

        // Verify status
        Assert.Equal(BackupStatus.Canceled, finalStatus.Status);

        // Clean up
        await client.Collections.Delete("Article");
        await client.Collections.Delete("Publication");
    }
}
