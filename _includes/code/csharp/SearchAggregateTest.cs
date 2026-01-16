using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

namespace WeaviateProject.Tests;

public class SearchAggregateTest : IDisposable
{
    private static readonly WeaviateClient client;

    // Static constructor for one-time setup (like @BeforeAll)
    static SearchAggregateTest()
    {
        // START INSTANTIATION-COMMON
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        client = Connect
            .Cloud(
                weaviateUrl,
                weaviateApiKey,
                headers: new Dictionary<string, string>() { { "X-OpenAI-Api-Key", openaiApiKey } }
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
    public async Task TestMetaCount()
    {
        // START MetaCount
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Aggregate.OverAll(
            // highlight-start
            totalCount: true
        // highlight-end
        );

        Console.WriteLine(response.TotalCount);
        // END MetaCount
    }

    [Fact]
    public async Task TestTextProp()
    {
        // START TextProp
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Aggregate.OverAll(
            // highlight-start
            returnMetrics:
            [
                Metrics
                    .ForProperty("answer")
                    .Text(
                        topOccurrencesCount: true,
                        topOccurrencesValue: true,
                        minOccurrences: 5 // Threshold minimum count
                    ),
            ]
        // highlight-end
        );

        var answerMetrics = response.Properties["answer"] as Aggregate.Text;
        if (answerMetrics != null)
        {
            Console.WriteLine(JsonSerializer.Serialize(answerMetrics.TopOccurrences));
        }
        // END TextProp
    }

    [Fact]
    public async Task TestIntProp()
    {
        // START IntProp
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Aggregate.OverAll(
            // highlight-start
            // Use .Number for floats (NUMBER datatype in Weaviate)
            returnMetrics:
            [
                Metrics.ForProperty("points").Integer(sum: true, maximum: true, minimum: true),
            ]
        // highlight-end
        );

        var pointsMetrics = response.Properties["points"] as Aggregate.Integer;
        if (pointsMetrics != null)
        {
            Console.WriteLine($"Sum: {pointsMetrics.Sum}");
            Console.WriteLine($"Max: {pointsMetrics.Maximum}");
            Console.WriteLine($"Min: {pointsMetrics.Minimum}");
        }
        // END IntProp
    }

    [Fact]
    public async Task TestGroupBy()
    {
        // START groupBy
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Aggregate.OverAll(
            // highlight-start
            groupBy: new Aggregate.GroupBy("round")
        // highlight-end
        );

        // print rounds names and the count for each
        foreach (var group in response.Groups)
        {
            Console.WriteLine($"Value: {group.GroupedBy.Value} Count: {group.TotalCount}");
        }
        // END groupBy
    }

    [Fact]
    public async Task TestNearTextWithLimit()
    {
        // START nearTextWithLimit
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Aggregate.NearText(
            "animals in space",
            // highlight-start
            limit: 10,
            // highlight-end
            returnMetrics: [Metrics.ForProperty("points").Number(sum: true)]
        );

        var pointsMetrics = response.Properties["points"] as Aggregate.Number;
        Console.WriteLine(JsonSerializer.Serialize(pointsMetrics));
        // END nearTextWithLimit
    }

    [Fact]
    public async Task TestHybrid()
    {
        // START HybridExample
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Aggregate.Hybrid(
            "animals in space",
            // Additional parameters are available, such as `bm25Operator`, `filters`, etc.
            // highlight-start
            objectLimit: 10,
            // highlight-end
            returnMetrics: [Metrics.ForProperty("points").Number(sum: true)]
        );

        var pointsMetrics = response.Properties["points"] as Aggregate.Number;
        Console.WriteLine(JsonSerializer.Serialize(pointsMetrics));
        // END HybridExample
    }

    [Fact]
    public async Task TestNearTextWithDistance()
    {
        // Note: The C# client supports the 'distance' parameter for nearText aggregations.
        // START nearTextWithDistance
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Aggregate.NearText(
            ["animals in space"],
            // highlight-start
            distance: 0.19,
            // highlight-end
            returnMetrics: [Metrics.ForProperty("points").Number(sum: true)]
        );

        var pointsMetrics = response.Properties["points"] as Aggregate.Number;
        Console.WriteLine(JsonSerializer.Serialize(pointsMetrics));
        // END nearTextWithDistance
    }

    [Fact]
    public async Task TestWhereFilter()
    {
        // Note: The C# client supports the 'filter' parameter for OverAll aggregations.
        // START whereFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Aggregate.OverAll(
            // highlight-start
            filters: Filter.Property("round").IsEqual("Final Jeopardy!"),
            // highlight-end
            totalCount: true
        );

        Console.WriteLine(response.TotalCount);
        // END whereFilter
    }
}
