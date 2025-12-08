using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Text.Json;
using System.Linq;
using System.Collections.Generic;
using System.Net.Http;
using Weaviate.Client.Models.Generative;
using Xunit;

namespace WeaviateProject.Examples;

[Collection("Sequential")] // Ensures tests in this class run one after another
public class QuickstartLocalTest
{
    [Fact]
    public async Task TestConnectionIsReady()
    {
        // START InstantiationExample
        using var client = await Connect.Local();

        // highlight-start
        // GetMeta returns server info. A successful call indicates readiness.
        var meta = await client.GetMeta();
        Console.WriteLine(meta);
        // highlight-end

        // The 'using' statement handles freeing up resources automatically.
        // END InstantiationExample
    }

    [Fact]
    public async Task FullQuickstartWorkflowTest()
    {
        using var client = await Connect.Local();
        string collectionName = "Question";

        // Clean up previous runs if they exist
        if (await client.Collections.Exists(collectionName))
        {
            await client.Collections.Delete(collectionName);
        }

        // START CreateCollection
        // highlight-start
        var questions = await client.Collections.Create(new CollectionConfig
        {
            Name = collectionName,
            Properties =
            [
                    Property.Text("answer"),
                    Property.Text("question"),
                    Property.Text("category")
            ],
            VectorConfig = Configure.Vectors.Text2VecTransformers().New("default"),  // Configure the text2vec-transformers integration
            GenerativeConfig = new GenerativeConfig.Cohere() // Configure the Cohere generative AI integration
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

        // Check for errors
        if (insertResponse.HasErrors)
        {
            Console.WriteLine($"Number of failed imports: {insertResponse.Errors.Count()}");
            Console.WriteLine($"First failed object error: {insertResponse.Errors.First()}");
        }
        else
        {
            Console.WriteLine($"Successfully inserted {insertResponse.Objects.Count()} objects.");
        }

        // START NearText
        // highlight-start
        var response = await questions.Query.NearText("biology", limit: 2);
        // highlight-end

        foreach (var obj in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(obj.Properties));
        }
        // END NearText

        // START RAG
        // highlight-start
        var ragResponse = await questions.Generate.NearText(
            "biology",
            limit: 2,
            groupedTask: new GroupedTask("Write a tweet with emojis about these facts."),
            provider: new Providers.OpenAI {}
        );
        // highlight-end

        // Inspect the results
        Console.WriteLine(JsonSerializer.Serialize(ragResponse.Generative.Values));
        // END RAG
        await client.Collections.Delete(collectionName);
    }
}