using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace WeaviateProject.Tests;

public class ManageCollectionsMultiTenancyTest : IAsyncLifetime
{
    private WeaviateClient client;

    // Runs before each test (like @BeforeEach)
    public Task InitializeAsync()
    {
        string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrWhiteSpace(openaiApiKey))
        {
            throw new ArgumentException("Please set the OPENAI_API_KEY environment variable.");
        }

        // Note: The C# client doesn't support setting headers like 'X-OpenAI-Api-Key' via the constructor for local connections.
        // This must be configured in Weaviate's environment variables.
        client = new WeaviateClient(new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 });

        return Task.CompletedTask;
    }

    // Runs after each test (like @AfterEach)
    public async Task DisposeAsync()
    {
        // Clean up any collections created during the tests
        await client.Collections.DeleteAll();
    }

    [Fact]
    public async Task TestEnableMultiTenancy()
    {
        // START EnableMultiTenancy
        await client.Collections.Create(new Collection
        {
            Name = "MultiTenancyCollection",
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        // END EnableMultiTenancy

        var config = await client.Collections.Export("MultiTenancyCollection");
        Assert.True(config.MultiTenancyConfig.Enabled);
    }

    [Fact]
    public async Task TestEnableAutoActivationMultiTenancy()
    {
        // START EnableAutoActivation
        await client.Collections.Create(new Collection
        {
            Name = "MultiTenancyCollection",
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true, AutoTenantActivation = true }
        });
        // END EnableAutoActivation

        var config = await client.Collections.Export("MultiTenancyCollection");
        Assert.True(config.MultiTenancyConfig.AutoTenantActivation);
    }

    [Fact]
    public async Task TestEnableAutoMT()
    {
        // START EnableAutoMT
        await client.Collections.Create(new Collection
        {
            Name = "CollectionWithAutoMTEnabled",
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true, AutoTenantCreation = true }
        });
        // END EnableAutoMT

        var config = await client.Collections.Export("CollectionWithAutoMTEnabled");
        Assert.True(config.MultiTenancyConfig.AutoTenantCreation);
    }

    [Fact]
    public async Task TestUpdateAutoMT()
    {
        string collectionName = "MTCollectionNoAutoMT";
        await client.Collections.Create(new Collection
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true, AutoTenantCreation = false }
        });

        // START UpdateAutoMT
        var collection = client.Collections.Use(collectionName);
        await collection.Config.Update(c =>
        {
            c.MultiTenancyConfig.AutoTenantCreation = true;
        });
        // END UpdateAutoMT

        var config = await client.Collections.Export(collectionName);
        Assert.True(config.MultiTenancyConfig.AutoTenantCreation);
    }

    [Fact]
    public async Task TestAddTenantsToClass()
    {
        string collectionName = "MultiTenancyCollection";
        await client.Collections.Create(new Collection
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });

        var collection = client.Collections.Use(collectionName);

        // START AddTenantsToClass
        await collection.Tenants.Add(
            new Tenant { Name = "tenantA" },
            new Tenant { Name = "tenantB" }
        );
        // END AddTenantsToClass

        var tenants = (await collection.Tenants.List()).ToList();
        Assert.Equal(2, tenants.Count);
        Assert.Contains(tenants, t => t.Name == "tenantA");
        Assert.Contains(tenants, t => t.Name == "tenantB");
    }

    [Fact]
    public async Task TestListTenants()
    {
        string collectionName = "MultiTenancyCollection";
        var collection = await client.Collections.Create(new Collection
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Add(new Tenant { Name = "tenantA" }, new Tenant { Name = "tenantB" });

        // START ListTenants
        var tenants = await collection.Tenants.List();
        foreach (var t in tenants) Console.WriteLine(t.Name);
        // END ListTenants

        Assert.Equal(2, tenants.Count());
    }

    [Fact]
    public async Task TestGetTenantsByName()
    {
        string collectionName = "MultiTenancyCollection";
        var collection = await client.Collections.Create(new Collection
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Add(new Tenant { Name = "tenantA" }, new Tenant { Name = "tenantB" });

        // START GetTenantsByName
        var tenantNames = new[] { "tenantA", "tenantB", "nonExistentTenant" };
        var tenants = await collection.Tenants.List(tenantNames);
        foreach (var t in tenants) Console.WriteLine(t.Name);
        // END GetTenantsByName

        Assert.Equal(2, tenants.Count());
    }

    [Fact]
    public async Task TestGetOneTenant()
    {
        string collectionName = "MultiTenancyCollection";
        var collection = await client.Collections.Create(new Collection
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Add(new Tenant { Name = "tenantA" });

        // START GetOneTenant
        string tenantName = "tenantA";
        var tenant = await collection.Tenants.Get(tenantName);
        Console.WriteLine(tenant?.Name);
        // END GetOneTenant

        Assert.NotNull(tenant);
    }

    [Fact]
    public async Task TestActivateTenant()
    {
        string collectionName = "MultiTenancyCollection";
        var collection = await client.Collections.Create(new Collection
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Add(new Tenant { Name = "tenantA", Status = TenantActivityStatus.Inactive });

        // START ActivateTenants
        string tenantName = "tenantA";
        await collection.Tenants.Activate(tenantName);
        // END ActivateTenants

        var tenant = await collection.Tenants.Get(tenantName);
        Assert.Equal(TenantActivityStatus.Active, tenant?.Status);
    }

    [Fact]
    public async Task TestDeactivateTenant()
    {
        string collectionName = "MultiTenancyCollection";
        var collection = await client.Collections.Create(new Collection
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true, AutoTenantCreation = true }
        });
        await collection.Tenants.Add(new Tenant { Name = "tenantA" });

        // START DeactivateTenants
        string tenantName = "tenantA";
        await collection.Tenants.Deactivate(tenantName);
        // END DeactivateTenants

        var tenant = await collection.Tenants.Get(tenantName);
        Assert.Equal(TenantActivityStatus.Inactive, tenant?.Status);
    }

    // START OffloadTenants
    // Note: 'Offload' is not a current concept in the client. Use 'Deactivate' for similar functionality.
    // Coming soon
    // END OffloadTenants

    [Fact]
    public async Task TestRemoveTenants()
    {
        string collectionName = "MultiTenancyCollection";
        var collection = await client.Collections.Create(new Collection
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Add(new Tenant { Name = "tenantA" }, new Tenant { Name = "tenantB" });

        // START RemoveTenants
        await collection.Tenants.Delete(new[] { "tenantB", "tenantX" });
        // END RemoveTenants

        var tenants = (await collection.Tenants.List()).ToList();
        Assert.Single(tenants);
        Assert.Equal("tenantA", tenants.First().Name);
    }
}