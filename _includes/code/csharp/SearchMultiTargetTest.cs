using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.Linq;
using System.Net.Http;

public class MultiTargetSearchTest : IAsyncLifetime
{
    private WeaviateClient client;
    private const string CollectionName = "JeopardyTiny";

    public async Task InitializeAsync()
    {
        // START LoadDataNamedVectors
        var weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        var weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        var openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_APIKEY");

        // Fallback for local
        if (string.IsNullOrEmpty(weaviateUrl))
        {
            client = await Connect.Local(
                headers: new Dictionary<string, string> { { "X-OpenAI-Api-Key", openaiApiKey } }
            );
        }
        else
        {
            client = await Connect.Cloud(
                weaviateUrl,
                weaviateApiKey,
                headers: new Dictionary<string, string> { { "X-OpenAI-Api-Key", openaiApiKey } }
            );
        }

        // Start with a new collection
        if (await client.Collections.Exists(CollectionName))
        {
            await client.Collections.Delete(CollectionName);
        }

        // Define a new schema
        await client.Collections.Create(new CollectionConfig
        {
            Name = CollectionName,
            Description = "Jeopardy game show questions",
            VectorConfig = new VectorConfigList()
            {
                Configure.Vectors.Text2VecOpenAI().New("jeopardy_questions_vector", ["question"]),
                Configure.Vectors.Text2VecOpenAI().New("jeopardy_answers_vector", ["answer"])
            },
            Properties =
            [
                Property.Text("category"),
                Property.Text("question"),
                Property.Text("answer")
            ]
        });

        // Get the sample data set
        using var httpClient = new HttpClient();
        var responseBody = await httpClient.GetStringAsync("https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json");
        var data = JsonSerializer.Deserialize<List<JsonElement>>(responseBody);

        // Prepare and upload the sample data
        var collection = client.Collections.Use(CollectionName);

        // Use anonymous objects for insertion
        var insertTasks = data.Select(row =>
            collection.Data.Insert(new
            {
                question = row.GetProperty("Question").ToString(),
                answer = row.GetProperty("Answer").ToString(),
                category = row.GetProperty("Category").ToString()
            })
        );
        await Task.WhenAll(insertTasks);
        // END LoadDataNamedVectors

        // Wait for indexing
        await Task.Delay(2000);
    }

    public Task DisposeAsync()
    {
        // Clean up
        if (client != null)
        {
            // cleanup logic if needed
        }
        return Task.CompletedTask;
    }

    [Fact]
    public async Task TestMultiBasic()
    {
        // START MultiBasic
        var collection = client.Collections.Use(CollectionName);

        var response = await collection.Query.NearText(
            "a wild animal",
            limit: 2,
            // highlight-start
            // Implicit conversion to TargetVectors.Average
            targetVector: ["jeopardy_questions_vector", "jeopardy_answers_vector"],
            // highlight-end
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END MultiBasic

        Assert.Equal(2, response.Objects.Count());
    }

    // [Fact]
    // public async Task TestMultiTargetNearVector()
    // {
    //     var collection = client.Collections.Use(CollectionName);
    //     var someResult = await collection.Query.FetchObjects(limit: 2, includeVectors: true);

    //     var v1 = someResult.Objects.ElementAt(0).Vectors["jeopardy_questions_vector"];
    //     var v2 = someResult.Objects.ElementAt(1).Vectors["jeopardy_answers_vector"];

    //     // START MultiTargetNearVector
    //     var response = await collection.Query.NearVector(
    //         // highlight-start
    //         // Specify the query vectors for each target vector using the Vectors dictionary
    //         vector: new Vectors
    //         {
    //             { "jeopardy_questions_vector", v1 },
    //             { "jeopardy_answers_vector", v2 }
    //         },
    //         // highlight-end
    //         limit: 2,
    //         // targetVector: ["jeopardy_questions_vector", "jeopardy_answers_vector"], // Optional if keys match
    //         returnMetadata: MetadataOptions.Distance
    //     );

    //     foreach (var o in response.Objects)
    //     {
    //         Console.WriteLine(JsonSerializer.Serialize(o.Properties));
    //         Console.WriteLine(o.Metadata.Distance);
    //     }
    //     // END MultiTargetNearVector
    //     Assert.Equal(2, response.Objects.Count());
    // }

    // [Fact]
    // public async Task TestMultiTargetMultipleNearVectors()
    // {
    //     var collection = client.Collections.Use(CollectionName);
    //     var someResult = await collection.Query.FetchObjects(limit: 3, includeVectors: true);

    //     var v1 = someResult.Objects.ElementAt(0).Vectors["jeopardy_questions_vector"];
    //     var v2 = someResult.Objects.ElementAt(1).Vectors["jeopardy_answers_vector"];
    //     var v3 = someResult.Objects.ElementAt(2).Vectors["jeopardy_answers_vector"];

    //     // START MultiTargetMultipleNearVectorsV1
    //     var response = await collection.Query.NearVector(
    //         // highlight-start
    //         // Pass multiple vectors for a single target using a multi-dimensional array/list
    //         vector: new Vectors
    //         {
    //             { "jeopardy_questions_vector", v1 },
    //             { "jeopardy_answers_vector", new[] { v2, v3 } } // List of vectors for this target
    //         },
    //         // highlight-end
    //         limit: 2,
    //         targetVector: ["jeopardy_questions_vector", "jeopardy_answers_vector"],
    //         returnMetadata: MetadataOptions.Distance
    //     );
    //     // END MultiTargetMultipleNearVectorsV1
    //     Assert.Equal(2, response.Objects.Count());

    //     // START MultiTargetMultipleNearVectorsV2
    //     var responseV2 = await collection.Query.NearVector(
    //         vector: new Vectors
    //         {
    //             { "jeopardy_questions_vector", v1 },
    //             { "jeopardy_answers_vector", new[] { v2, v3 } }
    //         },
    //         // highlight-start
    //         // Specify weights matching the structure of the input vectors
    //         targetVector: TargetVectors.ManualWeights(
    //             ("jeopardy_questions_vector", 10),
    //             ("jeopardy_answers_vector", [30, 30]) // Array of weights for the array of vectors
    //         ),
    //         // highlight-end
    //         limit: 2,
    //         returnMetadata: MetadataOptions.Distance
    //     );
    //     // END MultiTargetMultipleNearVectorsV2
    //     Assert.Equal(2, responseV2.Objects.Count());
    // }

    [Fact]
    public async Task TestMultiTargetWithSimpleJoin()
    {
        // START MultiTargetWithSimpleJoin
        var collection = client.Collections.Use(CollectionName);

        var response = await collection.Query.NearText(
            "a wild animal",
            limit: 2,
            // highlight-start
            // Explicitly specify the join strategy
            targetVector: TargetVectors.Average(["jeopardy_questions_vector", "jeopardy_answers_vector"]),
            // TargetVectors.Sum(), TargetVectors.Minimum(), TargetVectors.ManualWeights(), TargetVectors.RelativeScore() also available
            // highlight-end
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END MultiTargetWithSimpleJoin
        Assert.Equal(2, response.Objects.Count());
    }

    [Fact]
    public async Task TestMultiTargetManualWeights()
    {
        // START MultiTargetManualWeights
        var collection = client.Collections.Use(CollectionName);

        var response = await collection.Query.NearText(
            "a wild animal",
            limit: 2,
            // highlight-start
            targetVector: TargetVectors.ManualWeights(
                ("jeopardy_questions_vector", 10),
                ("jeopardy_answers_vector", 50)
            ),
            // highlight-end
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END MultiTargetManualWeights
        Assert.Equal(2, response.Objects.Count());
    }

    [Fact]
    public async Task TestMultiTargetRelativeScore()
    {
        // START MultiTargetRelativeScore
        var collection = client.Collections.Use(CollectionName);

        var response = await collection.Query.NearText(
            "a wild animal",
            limit: 2,
            // highlight-start
            targetVector: TargetVectors.RelativeScore(
                ("jeopardy_questions_vector", 10),
                ("jeopardy_answers_vector", 10)
            ),
            // highlight-end
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END MultiTargetRelativeScore
        Assert.Equal(2, response.Objects.Count());
    }
}