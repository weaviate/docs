using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Linq;
using System.Threading.Tasks;
using System;
// ... other usings

// 1. Define your strongly-typed class
public class JeopardyQuestion
{
    public string? question { get; set; }
    public string? answer { get; set; }
    public string? category { get; set; }
}

public class GetStartedTests
{
    [Fact]
    public async Task GetStarted()
    {
        var client = await Connect.Local();
        const string collectionName = "Question";

        try
        {
            if (await client.Collections.Exists(collectionName))
            {
                await client.Collections.Delete(collectionName);
            }

            var questions = await client.Collections.Create(new CollectionConfig()
            {
                Name = collectionName,
                VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecOllama { ApiEndpoint = "http://host.docker.internal:11434" }),
                Properties =
                [
                    Property.Text("answer"),
                    Property.Text("question"),
                    Property.Text("category"),
                ]
            });

            // Download and parse data as before...
            using var httpClient = new HttpClient();
            var resp = await httpClient.GetAsync(
                "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json"
            );
            resp.EnsureSuccessStatusCode();
            var jsonString = await resp.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<List<JsonElement>>(jsonString);

            // ============================= YOUR NEW, CLEAN CODE =============================
            // 2. Prepare the data by mapping it to your new class
            var dataObjects = data.Select(d => new JeopardyQuestion
            {
                answer = d.GetProperty("Answer").GetString(),
                question = d.GetProperty("Question").GetString(),
                category = d.GetProperty("Category").GetString()
            }).ToList();
            // ==============================================================================

            var importResult = await questions.Data.InsertMany(dataObjects);
            await Task.Delay(2000); // Wait for data to be indexed
            
            var response = await questions.Query.NearText("biology", limit: 2);
            // ... rest of the test
            Assert.Equal(2, response.Objects.Count());
        }
        finally
        {
            if (await client.Collections.Exists(collectionName))
            {
                await client.Collections.Delete(collectionName);
            }
        }
    }

    [Fact]
    public async Task CreateCollectionAndRunNearTextQuery()
    {
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

        // 1. Connect to Weaviate
        var client = await Connect.Cloud(weaviateUrl, weaviateApiKey);

        // 2. Prepare data (same as Python data_objects)
        var dataObjects = new List<object>
        {
            new {title = "The Matrix", description = "A computer hacker learns about the true nature of reality and his role in the war against its controllers.", genre = "Science Fiction"},
            new {title = "Spirited Away", description = "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.", genre = "Animation"},
            new {title = "The Lord of the Rings: The Fellowship of the Ring", description = "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.", genre = "Fantasy"}
        };

        var CollectionName = "Movie";

        await client.Collections.Delete(CollectionName);
        // 3. Create the collection
        var movies = await client.Collections.Create(new CollectionConfig
        {
            Name = CollectionName,
            VectorConfig = new VectorConfigList
            {
                new VectorConfig("default", new Vectorizer.Text2VecWeaviate())
            },
        });

        // 4. Import the data
        var result = await movies.Data.InsertMany(dataObjects);

        // 5. Run the query
        var response = await movies.Query.NearText(
            "sci-fi",
            limit: 2
        );

        // 6. Inspect the results
        foreach (var obj in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(obj.Properties));
        }

        Assert.Equal(2, response.Objects.Count);
        Assert.Contains(response.Objects, o => o.Properties.ContainsKey("title") && o.Properties["title"].ToString() == "The Matrix");
    }
}