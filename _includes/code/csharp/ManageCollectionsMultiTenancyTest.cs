using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Text.Json;

namespace WeaviateProject.Tests;

public class ManageCollectionsMultiTenancyTest : IAsyncLifetime
{
    private WeaviateClient client;

    // Runs before each test (like @BeforeEach)
    public async Task InitializeAsync()
    {
        string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrWhiteSpace(openaiApiKey))
        {
            throw new ArgumentException("Please set the OPENAI_API_KEY environment variable.");
        }

        client = await Connect.Local();
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
        await client.Collections.Create(new CollectionConfig
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
        await client.Collections.Create(new CollectionConfig
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
        await client.Collections.Create(new CollectionConfig
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
        await client.Collections.Create(new CollectionConfig
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
        await client.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });

        var collection = client.Collections.Use(collectionName);

        // START AddTenantsToClass
        await collection.Tenants.Create(
            ["tenantA", "tenantB"]
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
        var collection = await client.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Create(["tenantA", "tenantB"]);

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
        var collection = await client.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Create(["tenantA", "tenantB"]);

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
        var collection = await client.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Create(["tenantA"]);

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
        var collection = await client.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Create(["tenantA"]);

        // START ActivateTenants
        string[] tenantName = ["tenantA"];
        await collection.Tenants.Activate(tenantName);
        // END ActivateTenants

        var tenant = await collection.Tenants.Get(tenantName.First());
        Assert.Equal(TenantActivityStatus.Active, tenant?.Status);
    }

    [Fact]
    public async Task TestDeactivateTenant()
    {
        string collectionName = "MultiTenancyCollection";
        var collection = await client.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true, AutoTenantCreation = true }
        });
        await collection.Tenants.Create(["tenantA"]);

        // START DeactivateTenants
        string[] tenantName = ["tenantA"];
        await collection.Tenants.Deactivate(tenantName);
        // END DeactivateTenants

        var tenant = await collection.Tenants.Get(tenantName.First());
        Assert.Equal(TenantActivityStatus.Inactive, tenant?.Status);
    }

    [Fact(Skip = "Requires offload-s3 module to be enabled")]
    public async Task TestOffloadTenants()
    {
        string collectionName = "MultiTenancyCollection";
        var collection = await client.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Create(["tenantA"]);
        // START OffloadTenants
        await collection.Tenants.Offload(new[] { "tenantA" });
        // END OffloadTenants

        var tenants = (await collection.Tenants.List()).ToList();
        Assert.Single(tenants);
        Assert.Equal("tenantA", tenants.First().Name);
    }

    [Fact]
    public async Task TestRemoveTenants()
    {
        string collectionName = "MultiTenancyCollection";
        var collection = await client.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });
        await collection.Tenants.Create(["tenantA", "tenantB"]);
        // START RemoveTenants
        await collection.Tenants.Delete(new[] { "tenantB", "tenantX" });
        // END RemoveTenants

        var tenants = (await collection.Tenants.List()).ToList();
        Assert.Single(tenants);
        Assert.Equal("tenantA", tenants.First().Name);
    }

    [Fact]
    public async Task TestChangeTenantState()
    {
        string collectionName = "MultiTenancyCollection";
        await client.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true, AutoTenantCreation = true }
        });

        var collection = client.Collections.Use(collectionName);
        await collection.Tenants.Create(["tenantA"]);

        // START ChangeTenantState
        string tenantName = "tenantA";
        var multiCollection = client.Collections.Use(collectionName);

        // Deactivate
        await multiCollection.Tenants.Update([new Tenant
        {
            Name = tenantName,
            Status = TenantActivityStatus.Inactive
        }]);

        // Activate
        await multiCollection.Tenants.Update([new Tenant
        {
            Name = tenantName,
            Status = TenantActivityStatus.Active
        }]);

        // Offloading requires S3/warm/cold configuration
        // END ChangeTenantState

        var tenants = await multiCollection.Tenants.List();
        Assert.Contains(tenants, t => t.Name == tenantName && t.Status == TenantActivityStatus.Active);
    }

    [Fact]
    public async Task TestCreateTenantObject()
    {
        await client.Collections.Create(new CollectionConfig
        {
            Name = "JeopardyQuestion",
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });

        var collection = client.Collections.Use("JeopardyQuestion");
        await collection.Tenants.Create(["tenantA"]);

        // START CreateMtObject
        // highlight-start
        var jeopardy = client.Collections.Use("JeopardyQuestion").WithTenant("tenantA");
        // highlight-end

        var uuid = await jeopardy.Data.Insert(new
        {
            question = "This vector DB is OSS & supports automatic property type inference on import"
        });

        Console.WriteLine(uuid); // the return value is the object's UUID
        // END CreateMtObject

        var result = await jeopardy.Query.FetchObjectByID(uuid);
        Assert.NotNull(result);
    }

    [Fact]
    public async Task TestSearchTenant()
    {
        await client.Collections.Create(new CollectionConfig
        {
            Name = "JeopardyQuestion",
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        });

        var jeopardyCollection = client.Collections.Use("JeopardyQuestion");
        await jeopardyCollection.Tenants.Create(["tenantA"]);

        // Insert some test data
        var jeopardyTenant = jeopardyCollection.WithTenant("tenantA");
        await jeopardyTenant.Data.Insert(new { question = "Test question" });

        // START Search
        // highlight-start
        var jeopardy = client.Collections.Use("JeopardyQuestion").WithTenant("tenantA");
        // highlight-end

        var response = await jeopardy.Query.FetchObjects(limit: 2);

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END Search

        Assert.NotEmpty(response.Objects);
    }

    [Fact]
    public async Task TestAddReferenceToTenantObject()
    {
        await client.Collections.Delete("MultiTenancyCollection");
        await client.Collections.Create(new CollectionConfig
        {
            Name = "MultiTenancyCollection",
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true, AutoTenantActivation = true }
        });

        var jeopardy = client.Collections.Use("JeopardyCategory");
        var categoryId = await jeopardy.Data.Insert(new { category = "Software" });

        // START AddCrossRef
        var multiCollection = client.Collections.Use("MultiTenancyCollection");
        await multiCollection.Tenants.Create(["tenantA"]);
        // Add the cross-reference property to the multi-tenancy class
        await multiCollection.Config.AddReference(
            Property.Reference("hasCategory", "JeopardyCategory")
        );

        // Get collection specific to the required tenant
        // highlight-start
        var multiTenantA = multiCollection.WithTenant("tenantA");
        // highlight-end

        // Insert an object to tenantA
        var objectId = await multiTenantA.Data.Insert(new
        {
            question = "This vector DB is OSS & supports automatic property type inference on import"
        });

        // Add reference from MultiTenancyCollection object to a JeopardyCategory object
        // highlight-start
        await multiTenantA.Data.ReferenceAdd(
            // highlight-end
            from: objectId,  // MultiTenancyCollection object id (a Jeopardy question)
            fromProperty: "hasCategory",
            to: categoryId // JeopardyCategory id
        );
        // END AddCrossRef

        // Test
        var result = await multiTenantA.Query.FetchObjectByID(objectId);
    }
}