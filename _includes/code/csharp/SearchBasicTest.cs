using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.Linq;

// Note: This code assumes the existence of a Weaviate instance populated
// with 'JeopardyQuestion' and 'WineReviewMT' collections
public class SearchBasicTest : IAsyncLifetime
{
    private WeaviateClient client;

    public Task InitializeAsync()
    {
        // ================================
        // ===== INSTANTIATION-COMMON =====
        // ================================

        // Best practice: store your credentials in environment variables
        var weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        var weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        var openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        // The Connect.Cloud helper method is a straightforward way to connect.
        // We add the OpenAI API key to the headers for the text2vec-openai module.
        client = Connect.Cloud(
            weaviateUrl,
            weaviateApiKey
        );

        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        // The C# client manages its connections automatically and does not require an explicit 'close' method.
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

    // TODO[g-despot]: Enable when C# client supports offset
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
        var jeopardy = client.Collections.Use<Dictionary<string, object>>("JeopardyQuestion");
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
        var jeopardy = client.Collections.Use<Dictionary<string, object>>("JeopardyQuestion");
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
        var jeopardy = client.Collections.Use<Dictionary<string, object>>("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            returnMetadata: (MetadataOptions.Vector, ["default"]),
            // highlight-end
            limit: 1
        );

        // Note: The C# client returns a dictionary of named vectors.
        // We assume the default vector name is 'default'.
        //TODO[g-despot]: Why is vector not returned?
        Console.WriteLine("Vector for 'default':");
        Console.WriteLine(JsonSerializer.Serialize(response.Objects.First()));
        // END GetObjectVector

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.IsType<float[]>(response.Objects.First().Vectors["default"]);
    }

    [Fact]
    public async Task GetObjectId()
    {
        // ==================================
        // ===== GET OBJECT ID EXAMPLES =====
        // ==================================

        // START GetObjectId
        var jeopardy = client.Collections.Use<Dictionary<string, object>>("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjectByID(
            Guid.Parse("36ddd591-2dee-4e7e-a3cc-eb86d30a4303")
        );

        Console.WriteLine(response);
        // END GetObjectId
    }

    [Fact]
    public async Task GetWithCrossRefs()
    {
        // ==============================
        // ===== GET WITH CROSS-REF EXAMPLES =====
        // ==============================
        // START GetWithCrossRefs
        var jeopardy = client.Collections.Use<Dictionary<string, object>>("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            returnReferences: [
                new QueryReference(
                    linkOn: "hasCategory",
                    fields: ["title"]
                )
            ],
            // highlight-end
            limit: 2
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(o.Properties["question"]);
            // print referenced objects
            // Note: References are grouped by property name ('hasCategory')
            foreach (var refObj in o.References["hasCategory"])
            {
                Console.WriteLine(JsonSerializer.Serialize(refObj.Properties));
            }
        }
        // END GetWithCrossRefs

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.True(response.Objects.First().References["hasCategory"].Count > 0);
    }

    [Fact]
    public async Task GetWithMetadata()
    {
        // ====================================
        // ===== GET WITH METADATA EXAMPLE =====
        // ====================================

        // START GetWithMetadata
        var jeopardy = client.Collections.Use<Dictionary<string, object>>("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            limit: 1,
            // highlight-start
            returnMetadata: MetadataOptions.CreationTime
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));  // View the returned properties
            Console.WriteLine(o.Metadata.CreationTime);  // View the returned creation time
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
        var mtCollection = client.Collections.Use<Dictionary<string, object>>("WineReviewMT");

        // In the C# client, the tenant is specified directly in the query method
        // rather than creating a separate tenant-specific collection object.
        // highlight-start
        var response = await mtCollection.Query.FetchObjects(
            tenant: "tenantA",
        // highlight-end
            returnProperties: new[] { "review_body", "title" },
            limit: 1
        );

        Console.WriteLine(JsonSerializer.Serialize(response.Objects.First().Properties));
        // END MultiTenancy

        Assert.True(response.Objects.Count() > 0);
        Assert.Equal("WineReviewMT", response.Objects.First().Collection);
    }

    [Fact]
    public async Task GetObjectWithReplication()
    {
        // ==================================
        // ===== GET OBJECT ID EXAMPLES =====
        // ==================================

        // START QueryWithReplication
        var jeopardy = client.Collections.Use<Dictionary<string, object>>("JeopardyQuestion").WithConsistencyLevel(ConsistencyLevels.Quorum);
        var response = await jeopardy.Query.FetchObjectByID(
            Guid.Parse("36ddd591-2dee-4e7e-a3cc-eb86d30a4303")
        );

        // The parameter passed to `withConsistencyLevel` can be one of:
        // * 'ALL',
        // * 'QUORUM' (default), or
        // * 'ONE'.
        //
        // It determines how many replicas must acknowledge a request
        // before it is considered successful.

        Console.WriteLine(response);
        // END QueryWithReplication
    }
}