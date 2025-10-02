using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.Linq;

// Note: This code assumes the existence of a Weaviate instance populated
// with 'JeopardyQuestion' and 'WineReviewNV' collections as per the Python examples.
public class HybridSearchTests : IAsyncLifetime
{
    private WeaviateClient client;

    public Task InitializeAsync()
    {
        // ================================
        // ===== INSTANTIATION-COMMON =====
        // ================================

        // Best practice: store your credentials in environment variables
        var weaviateUrl = Environment.GetEnvironmentVariable("WEAVATE_URL");
        var weaviateApiKey = Environment.GetEnvironmentVariable("WEAVATE_API_KEY");
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
    public async Task NamedVectorHybrid()
    {
        // ==============================
        // ===== Named Vector Hybrid Query =====
        // ==============================

        // NamedVectorHybridPython
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
        // END NamedVectorHybridPython

        Assert.Equal("WineReviewNV", response.Objects.First().Collection);
    }

    [Fact]
    public async Task BasicHybrid()
    {
        // ==============================
        // ===== Basic Hybrid Query =====
        // ==============================

        // HybridBasicPython
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // highlight-start
        var response = await jeopardy.Query.Hybrid("food", limit: 3);
        // highlight-end

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridBasicPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task HybridWithScore()
    {
        // =======================================
        // ===== Hybrid Query with the Score =====
        // =======================================

        // HybridWithScorePython
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
        // END HybridWithScorePython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.NotNull(response.Objects.First().Metadata.Score);
        Assert.NotNull(response.Objects.First().Metadata.ExplainScore);
    }

    [Fact]
    public async Task HybridWithLimitAndOffset()
    {
        // ===================================
        // ===== Hybrid Query with limit =====
        // ===================================

        // START limit Python
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
        // END limit Python

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Equal(3, response.Objects.Count());
    }

    [Fact]
    public async Task HybridWithAutocut()
    {
        // =====================================
        // ===== Hybrid Query with autocut =====
        // =====================================

        // START autocut Python
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            fusionType: HybridFusion.Ranked,
            autoLimit: 1
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END autocut Python

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task HybridWithAlpha()
    {
        // ===================================
        // ===== Hybrid Query with Alpha =====
        // ===================================

        // HybridWithAlphaPython
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
        // END HybridWithAlphaPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task HybridWithFusionType()
    {
        // ========================================
        // ===== Hybrid Query with FusionType =====
        // ========================================

        // HybridWithFusionTypePython
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
        // END HybridWithFusionTypePython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task HybridWithBM25OperatorOr()
    {
        // ========================================
        // ===== Hybrid Query with BM25 Operator (Or) =====
        // ========================================

        // START HybridWithBM25OperatorOrWithMin
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            // highlight-start
            "Australian mammal cute",
            bm25Operator: new BM25Operator.Or(MinimumMatch: 2),
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
        // ========================================
        // ===== Hybrid Query with BM25 Operator (And) =====
        // ========================================

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
    public async Task HybridWithProperties()
    {
        // ==================================================
        // ===== Hybrid Query with Properties Specified =====
        // ==================================================

        // HybridWithPropertiesPython
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            queryProperties: new[] { "question" },
            // highlight-end
            alpha: 0.25f,
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithPropertiesPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task HybridWithPropertyWeighting()
    {
        // ====================================================
        // ===== Hybrid Query with Properties & Weighting =====
        // ====================================================

        // HybridWithPropertyWeightingPython
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            queryProperties: new[] { "question^2", "answer" },
            // highlight-end
            alpha: 0.25f,
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithPropertyWeightingPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task HybridWithVector()
    {
        // ====================================
        // ===== Hybrid Query With Vector =====
        // ====================================

        // HybridWithVectorPython
        var queryVector = Enumerable.Repeat(-0.02f, 1536).ToArray();

        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // TODO[g-despot] Why is name required in VectorData.Create?
        var response = await jeopardy.Query.Hybrid(
            "food",
            // highlight-start
            vectors: Vectors.Create("default", queryVector),
            // highlight-end
            alpha: 0.25f,
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END HybridWithVectorPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task HybridWithFilter()
    {
        // ===================================
        // ===== Hybrid Query with Where =====
        // ===================================

        // HybridWithFilterPython
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
        // END HybridWithFilterPython

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Equal("Double Jeopardy!", response.Objects.First().Properties["round"].ToString());
    }

    [Fact]
    public async Task HybridWithVectorParameters()
    {
        // =========================================
        // ===== Hybrid with vector parameters =====
        // =========================================

        // START VectorParametersPython
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "California",
            // highlight-start
            maxVectorDistance: 0.4f,  // Maximum threshold for the vector search component
            vectors: new HybridNearText(
                "large animal",
                MoveAway: new Move(force: 0.5f, concepts: ["mammal", "terrestrial"])
            ),
            // highlight-end
            alpha: 0.75f,
            limit: 5
        );
        // END VectorParametersPython

        Assert.True(response.Objects.Count() <= 5);
        Assert.True(response.Objects.Count() > 0);
    }

    [Fact]
    public async Task HybridWithVectorSimilarity()
    {
        // =========================================
        // ===== Hybrid with vector similarity threshold =====
        // =========================================

        // START VectorSimilarityPython
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "California",
            // highlight-start
            maxVectorDistance: 0.4f,  // Maximum threshold for the vector search component
                                      // highlight-end
            alpha: 0.75f,
            limit: 5
        );
        // END VectorSimilarityPython

        Assert.True(response.Objects.Count() <= 5);
        Assert.True(response.Objects.Count() > 0);
    }

    [Fact]
    public async Task HybridWithGroupBy()
    {
        // =========================================
        // ===== Hybrid with groupBy =====
        // =========================================

        // START HybridGroupByPy4
        // Grouping parameters
        var groupBy = new GroupByRequest
        {
            PropertyName = "round",       // group by this property
            ObjectsPerGroup = 3,          // maximum objects per group
            NumberOfGroups = 2,           // maximum number of groups
        };

        // Query
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "California",
            alpha: 0.75f,
            groupBy: groupBy
        );

        foreach (var grp in response.Groups.Values)
        {
            Console.WriteLine($"{grp.Name} {JsonSerializer.Serialize(grp.Objects)}");
        }
        // END HybridGroupByPy4

        Assert.True(response.Groups.Count <= 2);
        Assert.True(response.Groups.Count > 0);
    }
}