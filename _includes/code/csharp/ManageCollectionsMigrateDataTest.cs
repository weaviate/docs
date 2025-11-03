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

    // Runs once before any tests in the class
    public async Task InitializeAsync()
    {
        string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_APIKEY");

        // Connect to the source Weaviate instance
        clientSrc = new WeaviateClient(new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 });
        // Connect to the target Weaviate instance
        clientTgt = new WeaviateClient(new ClientConfiguration
        {
            RestAddress = "localhost",
            RestPort = 8090,
            GrpcPort = 50061,
        });

        // Simulate weaviate-datasets by creating and populating source collections
        await CreateCollection(clientSrc, "WineReview", false);
        await CreateCollection(clientSrc, "WineReviewMT", true);

        var wineReview = clientSrc.Collections.Use<object>("WineReview");
        var wineReviewData = Enumerable.Range(0, DATASET_SIZE)
            .Select(i => new { title = $"Review {i}" })
            .ToArray();
        await wineReview.Data.InsertMany(wineReviewData);

        var wineReviewMT = clientSrc.Collections.Use<object>("WineReviewMT");
        await wineReviewMT.Tenants.Add(new Tenant { Name = "tenantA" });
        await wineReviewMT.WithTenant("tenantA").Data.InsertMany(wineReviewData);
    }

    // Runs once after all tests in the class
    public async Task DisposeAsync()
    {
        // Clean up collections on both clients
        await clientSrc.Collections.DeleteAll();
        await clientTgt.Collections.DeleteAll();
    }

    // START CreateCollectionCollectionToCollection
    // START CreateCollectionCollectionToTenant
    // START CreateCollectionTenantToCollection
    // START CreateCollectionTenantToTenant
    private static async Task<CollectionClient<object>> CreateCollection(WeaviateClient clientIn,
        string collectionName, bool enableMt)
    // END CreateCollectionCollectionToCollection
    // END CreateCollectionCollectionToTenant
    // END CreateCollectionTenantToCollection
    // END CreateCollectionTenantToTenant
    {
        if (await clientIn.Collections.Exists(collectionName))
        {
            await clientIn.Collections.Delete(collectionName);
        }
        // START CreateCollectionCollectionToCollection
        // START CreateCollectionCollectionToTenant
        // START CreateCollectionTenantToCollection
        // START CreateCollectionTenantToTenant
        return await clientIn.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = enableMt },
            // Additional settings not shown
            VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecTransformers()),
            GenerativeConfig = new GenerativeConfig.Cohere(),
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
    // END CreateCollectionCollectionToCollection
    // END CreateCollectionCollectionToTenant
    // END CreateCollectionTenantToCollection
    // END CreateCollectionTenantToTenant

    // START CollectionToCollection
    // START TenantToCollection
    // START CollectionToTenant
    // START TenantToTenant
    private async Task MigrateData(CollectionClient<object> collectionSrc,
     CollectionClient<object> collectionTgt)
    {
        Console.WriteLine("Starting data migration...");
        var sourceObjects = new List<WeaviateObject>();

        // FIX 1: Use FetchObjects instead of Iterator for better tenant support
        var response = await collectionSrc.Query.FetchObjects(limit: 10000, returnMetadata: MetadataOptions.Vector);

        foreach (var obj in response.Objects)
        {
            sourceObjects.Add(new WeaviateObject
            {
                ID = obj.ID,
                // FIX 2: Cast the dynamic properties to a supported dictionary type
                Properties = (IDictionary<string, object>)obj.Properties,
                Vectors = obj.Vectors
            });
        }

        // FIX 3 (from previous advice): Convert the List to an Array before inserting
        await collectionTgt.Data.InsertMany(sourceObjects.ToArray());

        Console.WriteLine("Data migration complete.");
    }
    // END CollectionToCollection
    // END TenantToCollection
    // END CollectionToTenant
    // END TenantToTenant

    private async Task<bool> VerifyMigration(CollectionClient<object> collectionSrc,
    CollectionClient<object> collectionTgt, int numSamples)
    {
        // FIX 1: Use FetchObjects instead of Iterator
        var srcResponse = await collectionSrc.Query.FetchObjects(limit: 10000);
        var srcObjects = srcResponse.Objects;

        if (!srcObjects.Any())
        {
            Console.WriteLine("No objects in source collection");
            return false;
        }

        var sampledObjects = srcObjects.OrderBy(x => Guid.NewGuid()).Take(numSamples).ToList();

        Console.WriteLine($"Verifying {sampledObjects.Count} random objects...");
        foreach (var srcObj in sampledObjects)
        {
            var tgtObj = await collectionTgt.Query.FetchObjectByID(srcObj.ID.Value);
            if (tgtObj == null)
            {
                Console.WriteLine($"Object {srcObj.ID} not found in target collection");
                return false;
            }

            var srcJson = JsonSerializer.Serialize(srcObj.Properties);
            var tgtJson = JsonSerializer.Serialize(tgtObj.Properties);
            if (srcJson != tgtJson)
            {
                Console.WriteLine($"Properties mismatch for object {srcObj.ID}");
                return false;
            }
        }
        Console.WriteLine("All sampled objects verified successfully!");
        return true;
    }

    // START CreateCollectionCollectionToCollection
    private async Task CreateCollectionToCollection()
    {
        await CreateCollection(clientTgt, "WineReview", false);
    }
    // END CreateCollectionCollectionToCollection

    [Fact]
    // START CollectionToCollection
    public async Task TestCollectionToCollection()
    {
        await CreateCollectionToCollection();

        var reviewsSrc = clientSrc.Collections.Use<object>("WineReview");
        var reviewsTgt = clientTgt.Collections.Use<object>("WineReview");
        await MigrateData(reviewsSrc, reviewsTgt);
        // END CollectionToCollection

        Assert.Equal(DATASET_SIZE, (await reviewsTgt.Aggregate.OverAll(totalCount: true)).TotalCount);
        Assert.True(await VerifyMigration(reviewsSrc, reviewsTgt, 5));
    }

    // START CreateCollectionTenantToCollection
    private async Task CreateTenantToCollection()
    {
        await CreateCollection(clientTgt, "WineReview", false);
    }
    // END CreateCollectionTenantToCollection

    [Fact]
    // START TenantToCollection
    public async Task TestTenantToCollection()
    {
        await CreateTenantToCollection();

        var reviewsSrc = clientSrc.Collections.Use<object>("WineReviewMT");
        var reviewsTgt = clientTgt.Collections.Use<object>("WineReview");
        var reviewsSrcTenantA = reviewsSrc.WithTenant("tenantA");
        await MigrateData(reviewsSrcTenantA, reviewsTgt);
        // END TenantToCollection

        Assert.Equal(DATASET_SIZE, (await reviewsTgt.Aggregate.OverAll(totalCount: true)).TotalCount);
        Assert.True(await VerifyMigration(reviewsSrcTenantA, reviewsTgt, 5));
    }

    // START CreateCollectionCollectionToTenant
    private async Task CreateCollectionToTenant()
    {
        await CreateCollection(clientTgt, "WineReviewMT", true);
    }
    // END CreateCollectionCollectionToTenant

    // START CreateTenants
    // START CreateCollectionTenantToTenant
    private async Task CreateTenants()
    {
        var reviewsMtTgt = clientTgt.Collections.Use<object>("WineReviewMT");

        var tenantsTgt = new[] { new Tenant { Name = "tenantA" }, new Tenant { Name = "tenantB" } };
        await reviewsMtTgt.Tenants.Add(tenantsTgt);
    }
    // END CreateTenants
    // END CreateCollectionTenantToTenant

    [Fact]
    // START CollectionToTenant
    public async Task TestCollectionToTenant()
    {
        await CreateCollectionToTenant();
        await CreateTenants();

        var reviewsMtTgt = clientTgt.Collections.Use<object>("WineReviewMT");
        var reviewsSrc = clientSrc.Collections.Use<object>("WineReview");

        var reviewsTgtTenantA = reviewsMtTgt.WithTenant("tenantA");

        await MigrateData(reviewsSrc, reviewsTgtTenantA);
        // END CollectionToTenant

        Assert.Equal(DATASET_SIZE, (await reviewsTgtTenantA.Aggregate.OverAll(totalCount: true)).TotalCount);
        Assert.True(await VerifyMigration(reviewsSrc, reviewsTgtTenantA, 5));
    }

    // START CreateCollectionTenantToTenant
    private async Task CreateTenantToTenant()
    {
        await CreateCollection(clientTgt, "WineReviewMT", true);
    }
    // END CreateCollectionTenantToTenant

    [Fact]
    // START TenantToTenant
    public async Task TestTenantToTenant()
    {
        await CreateTenantToTenant();
        await CreateTenants();

        var reviewsMtSrc = clientSrc.Collections.Use<object>("WineReviewMT");
        var reviewsMtTgt = clientTgt.Collections.Use<object>("WineReviewMT");
        var reviewsSrcTenantA = reviewsMtSrc.WithTenant("tenantA");
        var reviewsTgtTenantA = reviewsMtTgt.WithTenant("tenantA");

        await MigrateData(reviewsSrcTenantA, reviewsTgtTenantA);
        // END TenantToTenant

        Assert.Equal(DATASET_SIZE, (await reviewsTgtTenantA.Aggregate.OverAll(totalCount: true)).TotalCount);
        Assert.True(await VerifyMigration(reviewsSrcTenantA, reviewsTgtTenantA, 5));
    }
}