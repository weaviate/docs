using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;

namespace WeaviateProject.Tests;

public class ManageObjectsReadAllTest : IAsyncLifetime
{
    private static readonly WeaviateClient client;

    // Static constructor for one-time setup (like @BeforeAll)
    static ManageObjectsReadAllTest()
    {
        // Note: The C# client doesn't support setting headers like 'X-OpenAI-Api-Key' via the constructor.
        // This must be configured in Weaviate's environment variables.
        client = new WeaviateClient(new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 });
    }

    // Runs once before any tests in the class
    public async Task InitializeAsync()
    {
        // Simulate weaviate-datasets by creating and populating collections
        // Create WineReview collection
        if (await client.Collections.Exists("WineReview"))
        {
            await client.Collections.Delete("WineReview");
        }

        var wineReview = await client.Collections.Create(new CollectionConfig { Name = "WineReview" });
        await wineReview.Data.InsertMany(new[]
        {
            new { title = "Review A" },
            new { title = "Review B" }
        });

        // Create WineReviewMT collection
        if (await client.Collections.Exists("WineReviewMT"))
        {
            await client.Collections.Delete("WineReviewMT");
        }
        var wineReviewMT = await client.Collections.Create(new CollectionConfig
        {
            Name = "WineReviewMT",
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true, AutoTenantCreation = true }
        });

        // Create and populate tenants
        await wineReviewMT.Tenants.Add(["tenantA", "tenantB"]);
        await wineReviewMT.WithTenant("tenantA").Data.Insert(new { title = "Tenant A Review 1" });
        await wineReviewMT.WithTenant("tenantB").Data.Insert(new { title = "Tenant B Review 1" });
    }

    // Runs once after all tests in the class
    public async Task DisposeAsync()
    {
        await client.Collections.Delete("WineReview");
        await client.Collections.Delete("WineReviewMT");
    }

    [Fact]
    public async Task TestReadAllProps()
    {
        // START ReadAllProps
        var collection = client.Collections.Use<object>("WineReview");

        // highlight-start
        await foreach (var item in collection.Iterator())
        {
            // highlight-end
            Console.WriteLine($"{item.ID} {JsonSerializer.Serialize(item.Properties)}");
        }
        // END ReadAllProps
    }

    [Fact]
    public async Task TestReadAllVectors()
    {
        // START ReadAllVectors
        var collection = client.Collections.Use<object>("WineReview");

        await foreach (var item in collection.Iterator(
            // highlight-start
            includeVectors: true // If using named vectors, you can specify ones to include
        ))
        // highlight-end
        {
            Console.WriteLine(JsonSerializer.Serialize(item.Properties));
            // highlight-start
            Console.WriteLine(JsonSerializer.Serialize(item.Vectors));
            // highlight-end
        }
        // END ReadAllVectors
    }

    // TODO[g-despot] NEW: Grpc.Core.RpcException : Status(StatusCode="Unknown", Detail="explorer: list class: search: object search at index winereviewmt: class WineReviewMT has multi-tenancy enabled, but request was without tenant")
    [Fact]
    public async Task TestReadAllTenants()
    {
        // START ReadAllTenants
        var multiCollection = client.Collections.Use<object>("WineReviewMT");

        // Get a list of tenants
        // highlight-start
        var tenants = await multiCollection.Tenants.List();
        // highlight-end

        // Iterate through tenants
        foreach (var tenant in tenants)
        {
            // Iterate through objects within each tenant
            // highlight-start
            var tenantCollection = multiCollection.WithTenant(tenant.Name);
            await foreach (var item in tenantCollection.Iterator())
            {
                // highlight-end
                Console.WriteLine($"{tenant.Name}: {JsonSerializer.Serialize(item.Properties)}");
            }
        }
        // END ReadAllTenants
    }
}