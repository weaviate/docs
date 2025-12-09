using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Text.Json;

namespace WeaviateProject.Tests;

public class ManageObjectsDeleteTest : IAsyncLifetime
{
    private static readonly WeaviateClient client;
    private const string COLLECTION_NAME = "EphemeralObject";

    // Static constructor for one-time setup (like @BeforeAll)
    static ManageObjectsDeleteTest()
    {
        client = Connect.Local().GetAwaiter().GetResult();
    }

    // Runs before each test (like @BeforeEach)
    public async Task InitializeAsync()
    {
        if (await client.Collections.Exists(COLLECTION_NAME))
        {
            await client.Collections.Delete(COLLECTION_NAME);
        }
        await client.Collections.Create(new CollectionConfig
        {
            Name = COLLECTION_NAME,
            Properties = [Property.Text("name")]
        });
    }

    // Runs after each test (like @AfterEach and @AfterAll)
    public async Task DisposeAsync()
    {
        if (await client.Collections.Exists(COLLECTION_NAME))
        {
            await client.Collections.Delete(COLLECTION_NAME);
        }
    }

    [Fact]
    public async Task TestDeleteObject()
    {
        var collection = client.Collections.Use(COLLECTION_NAME);
        var uuidToDelete = await collection.Data.Insert(new { name = "EphemeralObjectA" });
        Assert.NotNull(await collection.Query.FetchObjectByID(uuidToDelete));

        // START DeleteObject
        await collection.Data.DeleteByID(uuidToDelete);
        // END DeleteObject

        Assert.Null(await collection.Query.FetchObjectByID(uuidToDelete));
    }

    [Fact]
    public async Task TestBatchDelete()
    {
        var collection = client.Collections.Use(COLLECTION_NAME);
        var objects = Enumerable.Range(0, 5)
            .Select(i => new { name = $"EphemeralObject_{i}" })
            .ToArray(); // Creates an array T[]

        await collection.Data.InsertMany(objects);
        var initialCount = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(5, initialCount.TotalCount);

        // START DeleteBatch
        await collection.Data.DeleteMany(
            // highlight-start
            Filter.Property("name").Like("EphemeralObject*")
        // highlight-end
        );
        // END DeleteBatch

        var finalCount = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(0, finalCount.TotalCount);
    }

    [Fact]
    public async Task TestDeleteContains()
    {
        // START DeleteContains
        var collection = client.Collections.Use(COLLECTION_NAME);
        await collection.Data.InsertMany(new[]
        {
            new { name = "asia" },
            new { name = "europe" }
        });

        await collection.Data.DeleteMany(
            // highlight-start
            Filter.Property("name").ContainsAny(["europe", "asia"])
        // highlight-end
        );
        // END DeleteContains
    }

    [Fact]
    public async Task TestDryRun()
    {
        var collection = client.Collections.Use(COLLECTION_NAME);
        var objects = Enumerable.Range(0, 5)
            .Select(i => new { name = $"EphemeralObject_{i}" })
            .ToArray(); // Creates an array T[]

        await collection.Data.InsertMany(objects);

        // START DryRun
        var result = await collection.Data.DeleteMany(
            Filter.Property("name").Like("EphemeralObject*"),
            // highlight-start
            dryRun: true
        // highlight-end
        );

        Console.WriteLine(JsonSerializer.Serialize(result));
        // END DryRun

        Assert.Equal(5, result.Matches);
        var finalCount = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(5, finalCount.TotalCount); // Objects should not be deleted
    }

    [Fact]
    public async Task TestBatchDeleteWithIDs()
    {
        var collection = client.Collections.Use(COLLECTION_NAME);
        var objects = Enumerable.Range(0, 5)
            .Select(i => new { name = $"EphemeralObject_{i}" })
            .ToArray(); // Creates an array T[]

        await collection.Data.InsertMany(objects);
        var initialCount = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(5, initialCount.TotalCount);

        // START DeleteByIDBatch
        var queryResponse = await collection.Query.FetchObjects(limit: 3);
        var ids = queryResponse.Objects.Select(obj => obj.ID.Value).ToList();

        await collection.Data.DeleteMany(
            // highlight-start
            Filter.ID.ContainsAny(ids) // Delete the 3 objects
                                       // highlight-end
        );
        // END DeleteByIDBatch

        var finalCount = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(2, finalCount.TotalCount);
    }
}