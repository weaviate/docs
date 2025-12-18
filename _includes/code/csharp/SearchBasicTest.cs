using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

// Note: This code assumes the existence of a Weaviate instance populated
// with 'JeopardyQuestion' and 'WineReviewMT' collections
public class SearchBasicTest : IAsyncLifetime
{
    private WeaviateClient client;

    // Fixed: Signature is Task, not Task<Task>
    public async Task InitializeAsync()
    {
        // ================================
        // ===== INSTANTIATION-COMMON =====
        // ================================

        // Best practice: store your credentials in environment variables
        var weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        var weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        // var openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_APIKEY");

        client = await Connect.Cloud(weaviateUrl, weaviateApiKey);
    }

    // Fixed: Implement DisposeAsync from IAsyncLifetime instead of Dispose
    public Task DisposeAsync()
    {
        // No explicit cleanup needed for the client in this context,
        // but the interface requires the method.
        return Task.CompletedTask;
    }

    [Fact]
    public async Task BasicGet()
    {
        // ==============================
        // ===== BASIC GET EXAMPLES =====
        // ==============================

        // START BasicGet
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // highlight-start
        var response = await jeopardy.Query.FetchObjects();
        // highlight-end

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BasicGet

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
    }

    // TODO[g-despot]: NEW: Enable when C# client supports offset
    // [Fact]
    // public async Task BasicGetOffset()
    // {
    //     // ==============================
    //     // ===== BASIC GET EXAMPLES =====
    //     // ==============================

    //     // START
    //     var jeopardy = client.Collections.Use("JeopardyQuestion");
    //     // highlight-start
    //     var response = await jeopardy.Query.FetchObjects(offset: 1, limit: 1);
    //     // highlight-end

    //     foreach (var o in response.Objects)
    //     {
    //         Console.WriteLine(JsonSerializer.Serialize(o.Properties));
    //     }
    //     // END

    //     Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    //     Assert.True(response.Objects.First().Properties.ContainsKey("question"));
    // }
    // START GetWithOffset
    // Coming soon
    // END GetWithOffset

    [Fact]
    public async Task GetWithLimit()
    {
        // ====================================
        // ===== BASIC GET LIMIT EXAMPLES =====
        // ====================================

        // START GetWithLimit
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            limit: 1
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END GetWithLimit

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
        Assert.Single(response.Objects);
    }

    [Fact]
    public async Task GetProperties()
    {
        // ==========================================
        // ===== GET OBJECT PROPERTIES EXAMPLES =====
        // ==========================================

        // START GetProperties
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            limit: 1,
            returnProperties: new[] { "question", "answer", "points" }
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END GetProperties

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        foreach (var propName in new[] { "question", "answer", "points" })
        {
            Assert.True(response.Objects.First().Properties.ContainsKey(propName));
        }
    }

    [Fact]
    public async Task GetObjectVector()
    {
        // ======================================
        // ===== GET OBJECT VECTOR EXAMPLES =====
        // ======================================

        // START GetObjectVector
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            includeVectors: new[] { "default" },
            // highlight-end
            limit: 1
        );

        // Note: The C# client returns a dictionary of named vectors.
        // We assume the default vector name is 'default'.
        Console.WriteLine("Vector for 'default':");
        if (response.Objects.Any())
        {
            Console.WriteLine(JsonSerializer.Serialize(response.Objects.First()));
        }
        // END GetObjectVector

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.True(response.Objects.First().Vectors.ContainsKey("default"));
    }

    [Fact]
    public async Task GetObjectId()
    {
        // ==================================
        // ===== GET OBJECT ID EXAMPLES =====
        // ==================================

        // START GetObjectId
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // Ensure you use a UUID that actually exists in your DB, or fetch one first
        var allObjs = await jeopardy.Query.FetchObjects(limit: 1);
        var idToFetch = allObjs.Objects.First().UUID;

        var response = await jeopardy.Query.FetchObjectByID((Guid)idToFetch);

        Console.WriteLine(response);
        // END GetObjectId
        Assert.NotNull(response);
    }

    [Fact]
    public async Task GetWithCrossRefs()
    {
        // ==============================
        // ===== GET WITH CROSS-REF EXAMPLES =====
        // ==============================
        // START GetWithCrossRefs
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            returnReferences: [new QueryReference(linkOn: "hasCategory", fields: ["title"])],
            // highlight-end
            limit: 2
        );

        foreach (var o in response.Objects)
        {
            if (o.Properties.ContainsKey("question"))
                Console.WriteLine(o.Properties["question"]);

            // print referenced objects
            // Note: References are grouped by property name ('hasCategory')
            if (o.References != null && o.References.ContainsKey("hasCategory"))
            {
                foreach (var refObj in o.References["hasCategory"])
                {
                    Console.WriteLine(JsonSerializer.Serialize(refObj.Properties));
                }
            }
        }
        // END GetWithCrossRefs

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        // Asserting count > 0 requires data to actually have references
        if (response.Objects.First().References.ContainsKey("hasCategory"))
        {
            Assert.True(response.Objects.First().References["hasCategory"].Count > 0);
        }
    }

    [Fact]
    public async Task GetWithMetadata()
    {
        // ====================================
        // ===== GET WITH METADATA EXAMPLE =====
        // ====================================

        // START GetWithMetadata
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            limit: 1,
            // highlight-start
            returnMetadata: MetadataOptions.CreationTime
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties)); // View the returned properties
            Console.WriteLine(o.Metadata.CreationTime); // View the returned creation time
        }
        // END GetWithMetadata

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.NotNull(response.Objects.First().Metadata.CreationTime);
    }

    [Fact]
    public async Task MultiTenancyGet()
    {
        // =========================
        // ===== MULTI-TENANCY =====
        // =========================

        // START MultiTenancy
        var mtCollection = client.Collections.Use("WineReviewMT").WithTenant("tenantA");

        var response = await mtCollection.Query.FetchObjects(
            returnProperties: new[] { "review_body", "title" },
            limit: 1
        );

        if (response.Objects.Any())
        {
            Console.WriteLine(JsonSerializer.Serialize(response.Objects.First().Properties));
            Assert.Equal("WineReviewMT", response.Objects.First().Collection);
        }
        // END MultiTenancy
    }

    [Fact]
    public async Task GetObjectWithReplication()
    {
        // ==================================
        // ===== GET OBJECT ID EXAMPLES =====
        // ==================================

        // Fetch a valid ID first to ensure test success
        var jeopardyInit = client.Collections.Use("JeopardyQuestion");
        var initResp = await jeopardyInit.Query.FetchObjects(limit: 1);
        if (!initResp.Objects.Any())
            return;
        var validId = initResp.Objects.First().UUID;

        // START QueryWithReplication
        var jeopardy = client
            .Collections.Use("JeopardyQuestion")
            .WithConsistencyLevel(ConsistencyLevels.Quorum);

        var response = await jeopardy.Query.FetchObjectByID((Guid)validId);

        // The parameter passed to `withConsistencyLevel` can be one of:
        // * 'ALL',
        // * 'QUORUM' (default), or
        // * 'ONE'.
        //
        // It determines how many replicas must acknowledge a request
        // before it is considered successful.

        Console.WriteLine(response);
        // END QueryWithReplication
        Assert.NotNull(response);
    }
}
