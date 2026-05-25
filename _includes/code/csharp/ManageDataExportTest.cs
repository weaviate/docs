using System;
using System.Linq;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

namespace WeaviateProject.Tests;

public class ManageDataExportTest : IAsyncLifetime
{
    private static readonly string[] COLLECTIONS = ["Articles", "Products", "TempData"];
    private WeaviateClient client = null!;

    public async Task InitializeAsync()
    {
        client = await Connect.Local();

        foreach (var name in COLLECTIONS)
        {
            if (await client.Collections.Exists(name))
                await client.Collections.Delete(name);

            await client.Collections.Create(
                new CollectionCreateParams
                {
                    Name = name,
                    Properties = [Property.Text("title")],
                }
            );
            var collection = client.Collections.Use(name);
            await collection.Data.Insert(new { title = $"Test {name} object" });
        }
    }

    public async Task DisposeAsync()
    {
        if (client != null)
        {
            foreach (var name in COLLECTIONS)
            {
                if (await client.Collections.Exists(name))
                    await client.Collections.Delete(name);
            }
            client.Dispose();
        }
    }

    [Fact]
    public async Task TestCreateExport()
    {
        // START CreateExport
        // Export specific collections
        var includeResult = await client.Export.CreateSync(
            new ExportCreateRequest(
                Id: "my-export-include",
                Backend: ExportBackend.Filesystem(),
                FileFormat: ExportFileFormat.Parquet,
                IncludeCollections: ["Articles", "Products"]
            ),
            timeout: TimeSpan.FromMinutes(2)
        );

        Console.WriteLine(includeResult.Status); // ExportStatus.Success
        Console.WriteLine(string.Join(", ", includeResult.Collections ?? [])); // Articles, Products

        // Or exclude specific collections (exports everything else)
        var excludeResult = await client.Export.CreateSync(
            new ExportCreateRequest(
                Id: "my-export-exclude",
                Backend: ExportBackend.Filesystem(),
                FileFormat: ExportFileFormat.Parquet,
                ExcludeCollections: ["TempData"]
            ),
            timeout: TimeSpan.FromMinutes(2)
        );
        // END CreateExport

        Assert.Equal(ExportStatus.Success, includeResult.Status);
        Assert.Contains("Articles", includeResult.Collections!);
        Assert.Contains("Products", includeResult.Collections!);

        Assert.Equal(ExportStatus.Success, excludeResult.Status);
        Assert.DoesNotContain("TempData", excludeResult.Collections!);
        Assert.Contains("Articles", excludeResult.Collections!);
    }

    [Fact]
    public async Task TestCreateExportAsyncAndStatus()
    {
        var asyncId = $"my-async-export-{Guid.NewGuid():N}".Substring(0, 28);

        // START CreateExportAsync
        await using var operation = await client.Export.Create(
            new ExportCreateRequest(
                Id: asyncId,
                Backend: ExportBackend.Filesystem(),
                FileFormat: ExportFileFormat.Parquet,
                IncludeCollections: ["Articles"]
            )
        );

        Console.WriteLine(operation.Current.Status); // Started or Transferring
        // END CreateExportAsync

        Assert.Contains(
            operation.Current.Status,
            new[] { ExportStatus.Started, ExportStatus.Transferring, ExportStatus.Success }
        );

        // START GetExportStatus
        var status = await client.Export.GetStatus(
            backend: ExportBackend.Filesystem(),
            id: asyncId
        );

        Console.WriteLine(status.Status); // e.g. Transferring
        Console.WriteLine(string.Join(", ", status.Collections ?? [])); // Articles
        // status.ShardStatus has per-shard progress details (collection -> shard -> ShardProgress)
        // END GetExportStatus

        Assert.Equal(asyncId, status.Id);
        Assert.Contains(
            status.Status,
            new[] { ExportStatus.Started, ExportStatus.Transferring, ExportStatus.Success }
        );

        // Wait for completion before the test ends so cleanup works.
        await operation.WaitForCompletion(TimeSpan.FromMinutes(2));
    }

    [Fact]
    public async Task TestCancelExport()
    {
        var cancelId = $"my-cancel-export-{Guid.NewGuid():N}".Substring(0, 28);

        await using var operation = await client.Export.Create(
            new ExportCreateRequest(
                Id: cancelId,
                Backend: ExportBackend.Filesystem(),
                FileFormat: ExportFileFormat.Parquet,
                IncludeCollections: ["Articles"]
            )
        );

        // START CancelExport
        await client.Export.Cancel(
            backend: ExportBackend.Filesystem(),
            id: cancelId
        );
        // END CancelExport

        // Cancel may return false if the export already reached a terminal state on a small dataset.
        var status = await client.Export.GetStatus(ExportBackend.Filesystem(), cancelId);
        Assert.Contains(
            status.Status,
            new[] { ExportStatus.Canceled, ExportStatus.Success }
        );
    }
}
