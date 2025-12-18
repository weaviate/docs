using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

namespace Weaviate.Tests;

[Collection("Sequential")]
public class MultiTargetVectorsTest : IAsyncLifetime
{
    private WeaviateClient client;
    private const string CollectionName = "JeopardyTiny";

    public async Task InitializeAsync()
    {
        // 1. Connect
        string url = Environment.GetEnvironmentVariable("WEAVIATE_URL") ?? "http://localhost:8080";
        string apiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string openaiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        // Note: For these tests to run exactly like Python, we need an OpenAI key.
        // If not present, tests relying on 'NearText' will fail or need mocking.
        client = await Connect.Cloud(
            url,
            apiKey,
            new Dictionary<string, string> { { "X-OpenAI-Api-Key", openaiKey } }
        );

        // 2. Clean up
        if (await client.Collections.Exists(CollectionName))
        {
            await client.Collections.Delete(CollectionName);
        }

        // 3. Define Schema (LoadDataNamedVectors)
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = CollectionName,
                Description = "Jeopardy game show questions",
                VectorConfig =
                [
                    Configure.Vector(
                        "jeopardy_questions_vector",
                        v => v.Text2VecOpenAI(vectorizeCollectionName: false),
                        sourceProperties: ["question"]
                    ),
                    Configure.Vector(
                        "jeopardy_answers_vector",
                        v => v.Text2VecOpenAI(vectorizeCollectionName: false),
                        sourceProperties: ["answer"]
                    ),
                ],
                Properties =
                [
                    Property.Text("category"),
                    Property.Text("question"),
                    Property.Text("answer"),
                ],
            }
        );

        // 4. Load Data
        await LoadData();
    }

    private async Task LoadData()
    {
        using var httpClient = new HttpClient();
        var jsonStr = await httpClient.GetStringAsync(
            "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json"
        );

        using var doc = JsonDocument.Parse(jsonStr);
        var dataObjects = new List<BatchInsertRequest>();

        foreach (var element in doc.RootElement.EnumerateArray())
        {
            var props = new
            {
                question = element.GetProperty("Question").ToString(),
                answer = element.GetProperty("Answer").ToString(),
                category = element.GetProperty("Category").ToString(),
            };

            dataObjects.Add(new BatchInsertRequest(props));
        }

        var collection = client.Collections.Use(CollectionName);
        var response = await collection.Data.InsertMany(dataObjects);

        if (response.HasErrors)
        {
            throw new Exception($"Import failed: {response.Errors.First().Message}");
        }
    }

    public async Task DisposeAsync()
    {
        // Cleanup after tests
        if (client != null)
        {
            await client.Collections.Delete(CollectionName);
        }
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
            targetVector: ["jeopardy_questions_vector", "jeopardy_answers_vector"], // Specify the target vectors
            // highlight-end
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END MultiBasic

        Assert.NotEmpty(response.Objects);
    }

    [Fact]
    public async Task TestMultiTargetNearVector()
    {
        var collection = client.Collections.Use(CollectionName);

        // Fetch objects to get existing vectors for the test
        var someResult = await collection.Query.FetchObjects(limit: 2, includeVectors: true);

        // Explicitly cast to float[]
        float[] v1 = someResult.Objects.ElementAt(0).Vectors["jeopardy_questions_vector"];
        float[] v2 = someResult.Objects.ElementAt(1).Vectors["jeopardy_answers_vector"];

        // START MultiTargetNearVector
        var response = await collection.Query.NearVector(
            // highlight-start
            // Specify the query vectors for each target vector
            vector: new Vectors
            {
                { "jeopardy_questions_vector", v1 },
                { "jeopardy_answers_vector", v2 },
            },
            // highlight-end
            limit: 2,
            targetVector: ["jeopardy_questions_vector", "jeopardy_answers_vector"], // Optional if keys match input
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END MultiTargetNearVector

        Assert.NotEmpty(response.Objects);
    }

    [Fact]
    public async Task TestMultiTargetMultipleNearVectors()
    {
        var collection = client.Collections.Use(CollectionName);
        var someResult = await collection.Query.FetchObjects(limit: 3, includeVectors: true);

        float[] v1 = someResult.Objects.ElementAt(0).Vectors["jeopardy_questions_vector"];
        float[] v2 = someResult.Objects.ElementAt(1).Vectors["jeopardy_answers_vector"];
        float[] v3 = someResult.Objects.ElementAt(2).Vectors["jeopardy_answers_vector"];

        // START MultiTargetMultipleNearVectorsV1
        var response = await collection.Query.NearVector(
            // highlight-start
            // Use NearVectorInput to pass multiple vectors naturally
            vector: new NearVectorInput
            {
                { "jeopardy_questions_vector", v1 },
                { "jeopardy_answers_vector", v2, v3 },
            },
            // highlight-end
            limit: 2,
            targetVector: ["jeopardy_questions_vector", "jeopardy_answers_vector"],
            returnMetadata: MetadataOptions.Distance
        );
        // END MultiTargetMultipleNearVectorsV1
        Assert.Equal(2, response.Objects.Count());

        // START MultiTargetMultipleNearVectorsV2
        var responseV2 = await collection.Query.NearVector(
            vector: new NearVectorInput
            {
                { "jeopardy_questions_vector", v1 },
                { "jeopardy_answers_vector", v2, v3 },
            },
            // highlight-start
            // Specify weights matching the structure of the input vectors
            targetVector: TargetVectors.ManualWeights(
                ("jeopardy_questions_vector", 10.0),
                ("jeopardy_answers_vector", new double[] { 30.0, 30.0 })
            ),
            // highlight-end
            limit: 2,
            returnMetadata: MetadataOptions.Distance
        );
        // END MultiTargetMultipleNearVectorsV2
        Assert.Equal(2, responseV2.Objects.Count());
    }

    [Fact]
    public async Task TestSimpleJoinStrategy()
    {
        // START MultiTargetWithSimpleJoin
        var collection = client.Collections.Use(CollectionName);

        var response = await collection.Query.NearText(
            "a wild animal",
            limit: 2,
            // highlight-start
            // Specify the target vectors and the join strategy
            // Available: Sum, Minimum, Average, ManualWeights, RelativeScore
            targetVector: TargetVectors.Average([
                "jeopardy_questions_vector",
                "jeopardy_answers_vector",
            ]),
            // highlight-end
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END MultiTargetWithSimpleJoin

        Assert.NotEmpty(response.Objects);
    }

    [Fact]
    public async Task TestManualWeights()
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

        Assert.NotEmpty(response.Objects);
    }

    [Fact]
    public async Task TestRelativeScore()
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

        Assert.NotEmpty(response.Objects);
    }
}
