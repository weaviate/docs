using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Text.Json;
using System.Linq;
using System.Collections.Generic;

namespace WeaviateProject.Tests;

public class SearchHybridTest : IDisposable
{
    private static readonly WeaviateClient client;

    // Static constructor for one-time setup (like @BeforeAll)
    static SearchHybridTest()
    {
        // START INSTANTIATION-COMMON
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_APIKEY");

        client = Connect.Cloud(
                    weaviateUrl,
                    weaviateApiKey,
                    headers: new Dictionary<string, string>()
                    {
                { "X-OpenAI-Api-Key", openaiApiKey }
                    }
                ).GetAwaiter().GetResult();
        // END INSTANTIATION-COMMON
    }

    // Dispose is called once after all tests in the class are finished (like @AfterAll)
    public void Dispose()
    {
        // The C# client manages connections automatically and does not require an explicit 'close' method.
        GC.SuppressFinalize(this);
    }

    // TODO[g-despot] NEW: Grpc.Core.RpcException : Status(StatusCode="Unknown", Detail="extract target vectors: class WineReviewNV has multiple vectors, but no target vectors were provided")
    [Fact]
    public async Task NamedVectorHybrid()
    {
        // START NamedVectorHybrid
        var reviews = client.Collections.Use("WineReviewNV");
        // highlight-start
        var response = await reviews.Query.Hybrid(
            "A French Riesling",
            targetVector: ["title_country"],
            limit: 3
        );
        // highlight-end

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END NamedVectorHybrid

        Assert.Equal("WineReviewNV", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestHybridBasic()
    {
        // START HybridBasic
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            // highlight-start
            "food",
            limit: 3
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridBasic

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestHybridWithScore()
    {
        // START HybridWithScore
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            alpha: 0.5f,
            // highlight-start
            returnMetadata: MetadataOptions.Score | MetadataOptions.ExplainScore,
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            // highlight-start
            Console.WriteLine($"Score: {o.Metadata.Score}, Explain Score: {o.Metadata.ExplainScore}");
            // highlight-end
        }
        // END HybridWithScore

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.NotNull(response.Objects.First().Metadata.Score);
        Assert.NotNull(response.Objects.First().Metadata.ExplainScore);
    }

    [Fact]
    public async Task TestLimit()
    {
        // START limit 
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
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
        Assert.Equal(3, response.Objects.Count());
    }

    [Fact]
    public async Task TestAutocut()
    {
        // START autocut 
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            fusionType: HybridFusion.RelativeScore,
            autoLimit: 1
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END autocut 

        Assert.True(response.Objects.Any());
        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestHybridWithAlpha()
    {
        // START HybridWithAlpha
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            alpha: 0.25f,
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithAlpha

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestHybridWithFusionType()
    {
        // START HybridWithFusionType
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            fusionType: HybridFusion.RelativeScore,
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithFusionType

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task HybridWithBM25OperatorOr()
    {
        // START HybridWithBM25OperatorOrWithMin
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            // highlight-start
            "Australian mammal cute",
            bm25Operator: new BM25Operator.Or(MinimumMatch: 1),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithBM25OperatorOrWithMin

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task HybridWithBM25OperatorAnd()
    {

        // START HybridWithBM25OperatorAnd
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            // highlight-start
            "Australian mammal cute",
            bm25Operator: new BM25Operator.And(),  // Each result must include all tokens
                                                   // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithBM25OperatorAnd

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestHybridWithProperties()
    {
        // START HybridWithProperties
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            queryProperties: ["question"],
            // highlight-end
            alpha: 0.25f,
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithProperties

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestHybridWithPropertyWeighting()
    {
        // START HybridWithPropertyWeighting
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            queryProperties: ["question^2", "answer"],
            // highlight-end
            alpha: 0.25f,
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithPropertyWeighting

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestHybridWithVector()
    {
        // START HybridWithVector
        var queryVector = Enumerable.Repeat(-0.02f, 1536).ToArray();

        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            vectors: Vectors.Create(queryVector),
            // highlight-end
            alpha: 0.25f,
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithVector

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestHybridWithFilter()
    {
        // START HybridWithFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            filters: Filter.Property("round").Equal("Double Jeopardy!"),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithFilter

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Equal("Double Jeopardy!", (response.Objects.First().Properties as IDictionary<string, object>)["round"].ToString());
    }

    [Fact]
    public async Task TestVectorParameters()
    {
        // START VectorParameters
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // This query is complex and depends on a previous nearText query to get a vector.
        // We simulate this by fetching a vector first.
        var nearTextResponse = await jeopardy.Query.NearText(
            "large animal",
            moveAway: new Move(force: 0.5f, concepts: ["mammal", "terrestrial"]),
            limit: 1,
            includeVectors: true
        );
        var nearTextVector = nearTextResponse.Objects.First().Vectors["default"];

        var response = await jeopardy.Query.Hybrid(
            "California",
            // highlight-start
            maxVectorDistance: 0.4f,
            vectors: nearTextVector,
            // highlight-end
            alpha: 0.75f,
            limit: 5
        );
        // END VectorParameters

        Assert.True(response.Objects.Any() && response.Objects.Count() <= 5);
    }

    [Fact]
    public async Task TestVectorSimilarity()
    {
        // START VectorSimilarity
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "California",
            // highlight-start
            maxVectorDistance: 0.4f, // Maximum threshold for the vector search component
                                     // highlight-end
            alpha: 0.75f,
            limit: 5
        );
        // END VectorSimilarity

        Assert.True(response.Objects.Any() && response.Objects.Count() <= 5);
    }

    [Fact]
    public async Task TestHybridGroupBy()
    {
        // START HybridGroupByPy4
        // Query
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "California",
            alpha: 0.75f,
            groupBy: new GroupByRequest
            {
                PropertyName = "round",       // group by this property
                NumberOfGroups = 2,           // maximum number of groups
                ObjectsPerGroup = 3,          // maximum objects per group
            }
        );

        foreach (var group in response.Groups.Values)
        {
            Console.WriteLine($"{group.Name} {JsonSerializer.Serialize(group.Objects)}");
        }
        // END HybridGroupByPy4

        Assert.True(response.Groups.Count > 0 && response.Groups.Count <= 2);
    }
}