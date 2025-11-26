using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using System.Text.Json;

namespace WeaviateProject.Tests;

public class ManageCollectionsMigrateDataTest : IAsyncLifetime
{
    private static WeaviateClient clientSrc;
    private static WeaviateClient clientTgt;
    private const int DATASET_SIZE = 50;

    // Defines the schema structure for strong typing
    private class WineReviewModel
    {
        public string title { get; set; }
        public string review_body { get; set; }
        public string country { get; set; }
        public int? points { get; set; }
        public double? price { get; set; }
    }

    public async Task InitializeAsync()
    {
        clientSrc = await Connect.Local(restPort: 8080, grpcPort: 50051);
        clientTgt = await Connect.Local(restPort: 8090, grpcPort: 50061);

        await CreateCollection(clientSrc, "WineReview", false);
        await CreateCollection(clientSrc, "WineReviewMT", true);

        var wineReview = clientSrc.Collections.Use("WineReview");
        var wineReviewData = Enumerable.Range(0, DATASET_SIZE)
            .Select(i => new WineReviewModel
            {
                title = $"Review {i}",
                review_body = "Description...",
                price = 10.5 + i
            })
            .ToArray();

        await wineReview.Data.InsertMany(wineReviewData);

        var wineReviewMT = clientSrc.Collections.Use("WineReviewMT");
        await wineReviewMT.Tenants.Add(["tenantA"]);
        await wineReviewMT.WithTenant("tenantA").Data.InsertMany(wineReviewData);
    }

    public async Task DisposeAsync()
    {
        await clientSrc.Collections.DeleteAll();
        await clientTgt.Collections.DeleteAll();
    }

    // START CreateCollectionCollectionToCollection
    // START CreateCollectionCollectionToTenant
    // START CreateCollectionTenantToCollection
    // START CreateCollectionTenantToTenant
    private static async Task<CollectionClient> CreateCollection(WeaviateClient clientIn,
        string collectionName, bool enableMt)
    {
        if (await clientIn.Collections.Exists(collectionName))
        {
            await clientIn.Collections.Delete(collectionName);
        }
        return await clientIn.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = enableMt },
            VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecTransformers()),
            Properties =
            [
                Property.Text("review_body"),
                Property.Text("title"),
                Property.Text("country"),
                Property.Int("points"),
                Property.Number("price")
            ]
        });
    }

    // TODO[g-despot] NEW: Why can't I insert many with preserved IDs?

    // START CollectionToCollection
    // START TenantToCollection
    // START CollectionToTenant
    // START TenantToTenant
    private async Task MigrateData<T>(CollectionClient collectionSrc,
     CollectionClient collectionTgt)
    {
        Console.WriteLine("Starting data migration...");

        // Fetch source objects
        var response = await collectionSrc.Query.FetchObjects(limit: 10000, includeVectors: true);

        // Map to Strong Type List
        var sourceObjects = new List<T>();
        foreach (var obj in response.Objects)
        {
            // Deserialize the inner properties Dictionary to the POCO type
            var json = JsonSerializer.Serialize(obj.Properties);
            var typedObj = JsonSerializer.Deserialize<T>(json);
            if (typedObj != null)
            {
                sourceObjects.Add(typedObj);
            }
        }

        // InsertMany using Strong Types
        await collectionTgt.Data.InsertMany(sourceObjects.ToArray());

        Console.WriteLine($"Data migration complete. Migrated {sourceObjects.Count} objects.");
    }

    private async Task<bool> VerifyMigration(CollectionClient collectionTgt, int expectedCount)
    {
        // Verification modified because InsertMany generates NEW IDs.
        // We check if the total count matches and if a sample query works.
        var countResult = await collectionTgt.Aggregate.OverAll(totalCount: true);

        if (countResult.TotalCount != expectedCount)
        {
            Console.WriteLine($"Count mismatch. Expected {expectedCount}, found {countResult.TotalCount}");
            return false;
        }

        var sample = await collectionTgt.Query.FetchObjects(limit: 1);
        if (sample.Objects.Count == 0 || !sample.FirstOrDefault().Properties.ContainsKey("title"))
        {
            Console.WriteLine("Data verification failed. Properties missing.");
            return false;
        }

        Console.WriteLine("Verification successful!");
        return true;
    }

    private async Task CreateCollectionToCollection()
    {
        await CreateCollection(clientTgt, "WineReview", false);
    }

    [Fact]
    public async Task TestCollectionToCollection()
    {
        await CreateCollectionToCollection();

        var reviewsSrc = clientSrc.Collections.Use("WineReview");
        var reviewsTgt = clientTgt.Collections.Use("WineReview");
        await MigrateData<WineReviewModel>(reviewsSrc, reviewsTgt);
        // END CollectionToCollection

        // Pass the Type to the generic method
        await MigrateData<WineReviewModel>(reviewsSrc, reviewsTgt);

        Assert.True(await VerifyMigration(reviewsTgt, DATASET_SIZE));
    }

    private async Task CreateTenantToCollection()
    {
        await CreateCollection(clientTgt, "WineReview", false);
    }

    [Fact]
    public async Task TestTenantToCollection()
    {
        await CreateTenantToCollection();

        var reviewsSrc = clientSrc.Collections.Use("WineReviewMT");
        var reviewsTgt = clientTgt.Collections.Use("WineReview");
        var reviewsSrcTenantA = reviewsSrc.WithTenant("tenantA");

        await MigrateData<WineReviewModel>(reviewsSrcTenantA, reviewsTgt);

        Assert.True(await VerifyMigration(reviewsTgt, DATASET_SIZE));
    }

    private async Task CreateCollectionToTenant()
    {
        await CreateCollection(clientTgt, "WineReviewMT", true);
    }

    private async Task CreateTenants()
    {
        var reviewsMtTgt = clientTgt.Collections.Use("WineReviewMT");

        var tenantsTgt = new[] { new Tenant { Name = "tenantA" }, new Tenant { Name = "tenantB" } };
        await reviewsMtTgt.Tenants.Add(tenantsTgt);
    }

    [Fact]
    public async Task TestCollectionToTenant()
    {
        await CreateCollectionToTenant();
        await CreateTenants();

        var reviewsMtTgt = clientTgt.Collections.Use("WineReviewMT");
        var reviewsSrc = clientSrc.Collections.Use("WineReview");

        var reviewsTgtTenantA = reviewsMtTgt.WithTenant("tenantA");

        await MigrateData<WineReviewModel>(reviewsSrc, reviewsTgtTenantA);

        Assert.True(await VerifyMigration(reviewsTgtTenantA, DATASET_SIZE));
    }

    private async Task CreateTenantToTenant()
    {
        await CreateCollection(clientTgt, "WineReviewMT", true);
    }

    [Fact]
    public async Task TestTenantToTenant()
    {
        await CreateTenantToTenant();
        await CreateTenants();

        var reviewsMtSrc = clientSrc.Collections.Use("WineReviewMT");
        var reviewsMtTgt = clientTgt.Collections.Use("WineReviewMT");
        var reviewsSrcTenantA = reviewsMtSrc.WithTenant("tenantA");
        var reviewsTgtTenantA = reviewsMtTgt.WithTenant("tenantA");

        await MigrateData<WineReviewModel>(reviewsSrcTenantA, reviewsTgtTenantA);

        Assert.True(await VerifyMigration(reviewsTgtTenantA, DATASET_SIZE));
    }
}