using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Linq;
using System.Threading.Tasks;
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
        var client = Connect.Local();
        const string collectionName = "Question";

        try
        {
            if (await client.Collections.Exists(collectionName))
            {
                await client.Collections.Delete(collectionName);
            }

            var questions = await client.Collections.Create(new Collection()
            {
                Name = collectionName,
                VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecOllama()),
                Properties = new List<Property>
                {
                    Property.Text("answer"),
                    Property.Text("question"),
                    Property.Text("category"),
                }
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
}