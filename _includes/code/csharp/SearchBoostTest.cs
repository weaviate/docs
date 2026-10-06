using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

namespace WeaviateProject.Tests;

// Boost requires Weaviate v1.38+ and Weaviate.Client v1.2.0 or higher.
public class SearchBoostTest : IDisposable
{
    private static readonly WeaviateClient client;

    // Static constructor for one-time setup (like @BeforeAll)
    static SearchBoostTest()
    {
        // START INSTANTIATION-COMMON
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        // The C# client uses a configuration object.
        client = Connect
            .Cloud(
                restEndpoint: weaviateUrl,
                apiKey: weaviateApiKey,
                headers: new() { { "X-OpenAI-Api-Key", openaiApiKey } }
            )
            .GetAwaiter()
            .GetResult();
        // END INSTANTIATION-COMMON
    }

    // Dispose is called once after all tests in the class are finished (like @AfterAll)
    public void Dispose()
    {
        // The C# client manages connections automatically and does not require an explicit 'close' method.
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task TestBoostFilter()
    {
        // START BoostFilter
        // Promote questions from the "Double Jeopardy!" round without filtering others out.
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            boost: Boost.Filter(Filter.Property("round").IsEqual("Double Jeopardy!"), weight: 0.5),
            // highlight-end
            limit: 5,
            returnProperties: ["question", "round"]
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BoostFilter

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestBoostProperty()
    {
        // START BoostProperty
        // Bias toward questions worth more points. Log1P dampens the long tail so a
        // single high-value outlier doesn't dominate.
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            boost: Boost.NumericProperty("points", modifier: Boost.Modifier.Log1P, weight: 0.7),
            // highlight-end
            limit: 5,
            returnProperties: ["question", "points"]
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BoostProperty

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestBoostTimeDecay()
    {
        // START BoostTimeDecay
        // Score decays exponentially with age. A "365d" scale with decay 0.5 means an
        // episode that aired a year before the origin gets half the score of one that
        // aired on it. Duration strings must look like "365d", "24h", "30m": the server
        // silently ignores a string it cannot parse.
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            boost: Boost.TimeDecay(
                "air_date",
                scale: "365d",
                origin: "2005-01-01T00:00:00Z",
                curve: Boost.Curve.Exponential,
                decay: 0.5,
                weight: 0.6
            ),
            // highlight-end
            limit: 5,
            returnProperties: ["question", "air_date"]
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BoostTimeDecay

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestBoostNumericDecay()
    {
        // START BoostNumericDecay
        // Score peaks at a target value and falls off symmetrically. Gaussian gives a
        // bell-shaped falloff: questions worth 400 points score 1.0, questions 200
        // points away (one scale) score `decay`.
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            boost: Boost.NumericDecay(
                "points",
                origin: 400,
                scale: 200,
                curve: Boost.Curve.Gaussian,
                decay: 0.5,
                weight: 0.5
            ),
            // highlight-end
            limit: 5,
            returnProperties: ["question", "points"]
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BoostNumericDecay

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestBoostBlend()
    {
        // START BoostBlend
        // Combine two soft signals: recency (weight 2) + points (weight 1).
        // The outer weight 0.4 controls how much the blended rank affects the final
        // score; the inner weights are *per-condition* and balance each other.
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            boost: Boost.Blend(
                [
                    Boost.TimeDecay("air_date", scale: "365d", weight: 2),
                    Boost.NumericProperty("points", modifier: Boost.Modifier.Log1P, weight: 1),
                ],
                weight: 0.4,
                depth: 200 // rescore the top 200 vector matches
            ),
            // highlight-end
            limit: 5,
            returnProperties: ["question", "points", "air_date"]
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BoostBlend

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestBoostNegativeWeight()
    {
        // START BoostNegativeWeight
        // A negative per-condition weight pushes matching documents DOWN - they stay
        // in the result set but lose ground against everything else. Use this to
        // deprioritize a category without filtering it out entirely.
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.BM25(
            "animal",
            // highlight-start
            boost: Boost.Blend(
                [Boost.Filter(Filter.Property("round").IsEqual("Final Jeopardy!"), weight: -2)],
                weight: 0.5
            ),
            // highlight-end
            limit: 5,
            returnProperties: ["question", "round"]
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BoostNegativeWeight

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }

    [Fact]
    public async Task TestBoostOnHybrid()
    {
        // START BoostOnHybrid
        // Hybrid keeps its own alpha-blend of BM25 + vector. The boost runs once over
        // the fused hybrid result - the sub-search legs don't see it.
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.Hybrid(
            "animals in movies",
            alpha: 0.75f,
            // highlight-start
            boost: Boost.Blend(
                [
                    Boost.Filter(Filter.Property("round").IsEqual("Double Jeopardy!"), weight: 1),
                    Boost.Filter(Filter.Property("round").IsEqual("Final Jeopardy!"), weight: -2),
                ],
                weight: 0.3
            ),
            // highlight-end
            limit: 5,
            returnProperties: ["question", "round"]
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END BoostOnHybrid

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
    }
}
