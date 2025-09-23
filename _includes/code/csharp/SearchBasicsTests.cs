using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.Linq;

// Note: This code assumes the existence of a Weaviate instance populated
// with 'JeopardyQuestion' and 'WineReviewMT' collections as per the Python examples.
public class SearchBasicsTests : IAsyncLifetime
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
        var openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_APIKEY");

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

        // BasicGetPython
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // highlight-start
        var response = await jeopardy.Query.FetchObjects();
        // highlight-end

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BasicGetPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
    }

    [Fact]
    public async Task GetWithLimit()
    {
        // ====================================
        // ===== BASIC GET LIMIT EXAMPLES =====
        // ====================================

        // GetWithLimitPython
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
        // END GetWithLimitPython

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

        // GetPropertiesPython
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
        // END GetPropertiesPython

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

        // GetObjectVectorPython
        var jeopardy = client.Collections.Use<Dictionary<string, object>>("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            returnMetadata: MetadataOptions.Vector,
            // highlight-end
            limit: 1
        );

        // Note: The C# client returns a dictionary of named vectors.
        // We assume the default vector name is 'default'.
        Console.WriteLine(JsonSerializer.Serialize(response.Objects.First().Vectors["default"]));
        // END GetObjectVectorPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.IsType<float[]>(response.Objects.First().Vectors["default"]);
    }

    [Fact]
    public async Task GetObjectId()
    {
        // ==================================
        // ===== GET OBJECT ID EXAMPLES =====
        // ==================================

        // GetObjectIdPython
        var jeopardy = client.Collections.Use<Dictionary<string, object>>("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // Object IDs are included by default with the Weaviate C# client! :)
            limit: 1
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(o.ID);
        }
        // END GetObjectIdPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.IsType<Guid>(response.Objects.First().ID);
    }

    [Fact]
    public async Task GetWithCrossRefs()
    {
        // ==============================
        // ===== GET WITH CROSS-REF EXAMPLES =====
        // ==============================
        //TODO
        // GetWithCrossRefsPython
        var jeopardy = client.Collections.Use<Dictionary<string, object>>("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            returnReferences: new[] {
                new QueryReference(
                    linkOn: "hasCategory"
                    //returnProperties: "title"
                )
            },
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
        // END GetWithCrossRefsPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.True(response.Objects.First().References["hasCategory"].Count > 0);
    }

    [Fact]
    public async Task GetWithMetadata()
    {
        // ====================================
        // ===== GET WITH METADATA EXAMPLE =====
        // ====================================

        // GetWithMetadataPython
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
        // END GetWithMetadataPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.NotNull(response.Objects.First().Metadata.CreationTime);
    }

    [Fact]
    public async Task MultiTenancyGet()
    {
        // =========================
        // ===== MULTI-TENANCY =====
        // =========================

        // MultiTenancy
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
}