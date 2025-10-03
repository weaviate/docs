using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Text.Json;
using System.Collections.Generic;
using System.Net.Http;
using Xunit;

namespace WeaviateProject.Examples;

[Collection("Sequential")] // Ensures tests in this class run one after another
public class QuickstartTest
{
    // TODO[g-despot] Replace meta with readiness
    [Fact]
    public static async Task TestConnectionIsReady()
    {
        // START InstantiationExample
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

        WeaviateClient client = Connect.Cloud(
            weaviateUrl,
            weaviateApiKey
        );

        // highlight-start
        // GetMeta returns server info. A successful call indicates readiness.
        var meta = await client.GetMeta();
        Console.WriteLine(meta); // Should print: `True`
        // highlight-end
        // END InstantiationExample
    }

    [Fact]
    public static async Task FullQuickstartWorkflowTest()
    {
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string collectionName = "Question";

        WeaviateClient client = Connect.Cloud(
            weaviateUrl,
            weaviateApiKey
        );
        if (await client.Collections.Exists(collectionName))
        {
            await client.Collections.Delete(collectionName);
        }
        // START CreateCollection
        // highlight-start
        var questions = await client.Collections.Create(new Collection
        {
            Name = collectionName,
            Properties = new()
                {
                    Property.Text("answer"),
                    Property.Text("question"),
                    Property.Text("category")
                },
            VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecWeaviate()), // Configure the Weaviate Embeddings integration
            GenerativeConfig = new Generative.CohereConfig() // Configure the Cohere generative AI integration
        });
        // highlight-end
        // END CreateCollection

        // START Import
        // Get JSON data using HttpClient
        using var httpClient = new HttpClient();
        var jsonData = await httpClient.GetStringAsync("https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json");

        // highlight-start
        var questionsToInsert = new List<object>();

        // Parse and prepare objects using System.Text.Json
        var jsonObjects = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(jsonData);
        foreach (var jsonObj in jsonObjects)
        {
            questionsToInsert.Add(new
            {
                answer = jsonObj["Answer"].GetString(),
                question = jsonObj["Question"].GetString(),
                category = jsonObj["Category"].GetString()
            });
        }

        // Call InsertMany with the list of objects converted to an array
        var insertResponse = await questions.Data.InsertMany(questionsToInsert.ToArray());
        // highlight-end
        // END Import

        // TODO[g-despot] Error handling missing
        // Check for errors
        // if (insertResponse.HasErrors)
        // {
        //     Console.WriteLine($"Number of failed imports: {insertResponse.Errors.Count}");
        //     Console.WriteLine($"First failed object error: {insertResponse.Errors.First()}");
        // }
        // else
        // {
        //     Console.WriteLine($"Successfully inserted {insertResponse.Results.Count} objects.");
        // }

        // START NearText
        // highlight-start
        var response = await questions.Query.NearText("biology", limit: 2);
        // highlight-end

        foreach (var obj in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(obj.Properties));
        }
        // END NearText

        await client.Collections.Delete(collectionName);
    }

    // START RAG
    // Coming soon
    // END RAG
}