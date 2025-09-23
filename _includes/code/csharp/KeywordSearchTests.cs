using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.Linq;

public class KeywordSearchTests : IAsyncLifetime
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

        client = Connect.Cloud(
            weaviateUrl,
            weaviateApiKey
            //additionalHeaders: new Dictionary<string, string> { { "X-OpenAI-Api-Key", openaiApiKey } }
        );
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        // The C# client manages its connections automatically and does not require an explicit 'close' method.
        return Task.CompletedTask;
    }

    [Fact]
    public async Task BasicBM25()
    {
        // ============================
        // ===== Basic BM25 Query =====
        // ============================

        // BM25Basic
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // highlight-start
        var response = await jeopardy.Query.BM25(
        // highlight-end
            "food",
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BM25Basic

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Contains("food", JsonSerializer.Serialize(response.Objects.First().Properties).ToLower());
    }

    [Fact]
    public async Task BM25WithScore()
    {
        // ================================================
        // ===== BM25 Query with score / explainScore =====
        // ================================================

        // BM25WithScore
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            "food",
            returnMetadata: MetadataOptions.Score,
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            // highlight-start
            Console.WriteLine(o.Metadata.Score);
            // highlight-end
        }
        // END BM25WithScore

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Contains("food", JsonSerializer.Serialize(response.Objects.First().Properties).ToLower());
        Assert.NotNull(response.Objects.First().Metadata.Score);
    }

    [Fact]
    public async Task BM25WithLimit()
    {
        // =================================
        // ===== BM25 Query with limit =====
        // =================================

        // START limit 
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            "safety",
            // highlight-start
            limit: 3,
            offset: 1
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END limit 

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Contains("safety", JsonSerializer.Serialize(response.Objects.First().Properties).ToLower());
        Assert.Equal(3, response.Objects.Count());
    }

    [Fact]
    public async Task BM25WithAutocut()
    {
        // ===================================
        // ===== BM25 Query with autocut =====
        // ===================================

        // START autocut 
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            "safety",
            // highlight-start
            autoCut: 1
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END autocut 

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Contains("safety", JsonSerializer.Serialize(response.Objects.First().Properties).ToLower());
    }

    [Fact]
    public async Task BM25WithProperties()
    {
        // ===============================================
        // ===== BM25 Query with Selected Properties =====
        // ===============================================

        // BM25WithProperties
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            "safety",
            // highlight-start
            searchFields: new[] { "question" },
            // highlight-end
            returnMetadata: MetadataOptions.Score,
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Score);
        }
        // END BM25WithProperties

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Contains("safety", response.Objects.First().Properties["question"].ToString().ToLower());
    }

    [Fact]
    public async Task BM25WithBoostedProperties()
    {
        // ==============================================
        // ===== BM25 Query with Boosted Properties =====
        // ==============================================

        // BM25WithBoostedProperties
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            "food",
            // highlight-start
            searchFields: new[] { "question^2", "answer" },
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BM25WithBoostedProperties

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Contains("food", JsonSerializer.Serialize(response.Objects.First().Properties).ToLower());
    }

    [Fact]
    public async Task BM25MultipleKeywords()
    {
        // ==================================
        // ===== BM25 multiple keywords =====
        // ==================================

        // START MultipleKeywords 
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            // highlight-start
            "food wine", // search for food or wine
                         // highlight-end
            searchFields: new[] { "question" },
            limit: 5
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(o.Properties["question"]);
        }
        // END MultipleKeywords 

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        var propertiesJson = JsonSerializer.Serialize(response.Objects.First().Properties).ToLower();
        Assert.True(propertiesJson.Contains("food") || propertiesJson.Contains("wine"));
    }

    [Fact]
    public async Task BM25WithFilter()
    {
        // ==================================
        // ===== Basic BM25 With Filter =====
        // ==================================

        // BM25WithFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // TODO[g-despot]: Filters missing?
        var response = await jeopardy.Query.BM25(
            "food",
            // highlight-start
            filter: Filter.Property("round").Equal("Double Jeopardy!"),
            // highlight-end
            returnProperties: new[] { "answer", "question", "round" }, // return these properties
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BM25WithFilter

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Contains("food", JsonSerializer.Serialize(response.Objects.First().Properties).ToLower());
        Assert.Equal("Double Jeopardy!", response.Objects.First().Properties["round"].ToString());
    }

    [Fact]
    public async Task BM25WithGroupBy()
    {
        // ==================================
        // ===== BM25 groupBy  =====
        // ==================================

        // START BM25GroupByPy4
        var jeopardy = client.Collections.Use("JeopardyQuestion");

        // Grouping parameters
        var groupBy = new GroupByRequest
        {
            PropertyName = "round",       // group by this property
            ObjectsPerGroup = 3,          // maximum objects per group
            NumberOfGroups = 2,           // maximum number of groups
        };

        // Query
        var response = await jeopardy.Query.BM25(
            "California",
            groupBy: groupBy
        );

        foreach (var grp in response.Groups.Values)
        {
            Console.WriteLine($"{grp.Name} {JsonSerializer.Serialize(grp.Objects)}");
        }
        // END BM25GroupByPy4

        Assert.True(response.Groups.Count > 0);
        Assert.True(response.Groups.Count <= 2);
    }
}