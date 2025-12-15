using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Text.Json;
using System.Linq;

namespace WeaviateProject.Tests;

public class SearchKeywordTest : IDisposable
{
    private static readonly WeaviateClient client;

    // Static constructor for one-time setup (like @BeforeAll)
    static SearchKeywordTest()
    {
        // START INSTANTIATION-COMMON
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_APIKEY");

        // The C# client uses a configuration object.
        client = Connect.Cloud(restEndpoint: weaviateUrl,
                               apiKey: weaviateApiKey,
                               headers: new() { { "X-OpenAI-Api-Key", openaiApiKey } }).GetAwaiter().GetResult();
        // END INSTANTIATION-COMMON
    }

    // Dispose is called once after all tests in the class are finished (like @AfterAll)
    public void Dispose()
    {
        // The C# client manages connections automatically and does not require an explicit 'close' method.
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task TestBM25Basic()
    {
        // START BM25Basic
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            // highlight-start
            "food",
            // highlight-end
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
    public async Task TestBM25OperatorOrWithMin()
    {
        // START BM25OperatorOrWithMin
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            // highlight-start
            query: "Australian mammal cute",
            searchOperator: new BM25Operator.Or(MinimumMatch: 1),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BM25OperatorOrWithMin

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        var propertiesJson = JsonSerializer.Serialize(response.Objects.First().Properties).ToLower();
        Assert.True(propertiesJson.Contains("australia") || propertiesJson.Contains("mammal") || propertiesJson.Contains("cute"));
    }

    // TODO[g-despot] Does the search operator work?
    [Fact]
    public async Task TestBM25OperatorAnd()
    {
        // START BM25OperatorAnd
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            // highlight-start
            query: "Australian mammal cute",
            searchOperator: new BM25Operator.And(), // Each result must include all tokens (e.g. "australian", "mammal", "cute")
                                                    // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BM25OperatorAnd

        // Assert.True(response.Objects.Count == 0);
    }

    [Fact]
    public async Task TestBM25WithScore()
    {
        // START BM25WithScore
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
    public async Task TestLimit()
    {
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
    public async Task TestAutocut()
    {
        // START autocut
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            "safety",
            // highlight-start
            autoLimit: 1
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
    public async Task TestBM25WithProperties()
    {
        // START BM25WithProperties
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            "safety",
            // highlight-start
            searchFields: ["question"],
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
    public async Task TestBM25WithBoostedProperties()
    {
        // START BM25WithBoostedProperties
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            "food",
            // highlight-start
            searchFields: ["question^2", "answer"],
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
    public async Task TestMultipleKeywords()
    {
        // START MultipleKeywords
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            // highlight-start
            "food wine", // search for food or wine
                         // highlight-end
            searchFields: ["question"],
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
    public async Task TestBM25WithFilter()
    {
        // START BM25WithFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            "food",
            // highlight-start
            filters: Filter.Property("round").IsEqual("Double Jeopardy!"),
            // highlight-end
            returnProperties: ["answer", "question", "round"], // return these properties
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
    public async Task TestBM25GroupBy()
    {
        // START BM25GroupByPy4
        var jeopardy = client.Collections.Use("JeopardyQuestion");

        var response = await jeopardy.Query.BM25(
            "California",
            groupBy: new GroupByRequest("round")  // group by this property
            {
                NumberOfGroups = 2,           // maximum number of groups
                ObjectsPerGroup = 3,          // maximum objects per group
            }
        );

        foreach (var group in response.Groups.Values)
        {
            Console.WriteLine($"{group.Name} {JsonSerializer.Serialize(group.Objects)}");
        }
        // END BM25GroupByPy4

        Assert.True(response.Groups.Count > 0);
        Assert.True(response.Groups.Count <= 2);
    }
}