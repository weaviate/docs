using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Text.Json;
using System.Linq;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json.Serialization;

namespace WeaviateProject.Tests;

public class StarterGuidesCustomVectorsTest
{
    // Helper class for parsing the JSON data with vectors
    private record JeopardyQuestionWithVector
    {
        [JsonPropertyName("Answer")]
        public string Answer { get; init; }
        [JsonPropertyName("Question")]
        public string Question { get; init; }
        [JsonPropertyName("Category")]
        public string Category { get; init; }
        [JsonPropertyName("vector")]
        public float[] Vector { get; init; }
    }

    [Fact]
    public async Task TestBringYourOwnVectors()
    {
        using var client = Connect.Local();
        string collectionName = "Question";

        try
        {
            // Clean slate
            if (await client.Collections.Exists(collectionName))
            {
                await client.Collections.Delete(collectionName);
            }

            // START CreateCollection
            // Create the collection.
            await client.Collections.Create(new CollectionConfig
            {
                Name = collectionName,
                Properties = 
                [
                    Property.Text("answer"),
                    Property.Text("question"),
                    Property.Text("category")
                ],
                VectorConfig = new VectorConfig("default", new Vectorizer.SelfProvided())
            });
            // END CreateCollection

            // START ImportData
            var fname = "jeopardy_tiny_with_vectors_all-OpenAI-ada-002.json";
            var url = $"https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/{fname}";

            using var httpClient = new HttpClient();
            var responseBody = await httpClient.GetStringAsync(url);

            var data = JsonSerializer.Deserialize<List<JeopardyQuestionWithVector>>(responseBody);

            // Get a handle to the collection
            var questions = client.Collections.Use<object>(collectionName);
            var questionObjs = new List<WeaviateObject>();

            foreach (var d in data)
            {
                // highlight-start
                var properties = new Dictionary<string, object>
                {
                    { "answer", d.Answer },
                    { "question", d.Question },
                    { "category", d.Category }
                };

                questionObjs.Add(new WeaviateObject
                {
                    Properties = properties,
                    Vectors = Vectors.Create("default", d.Vector)
                });
                // highlight-end
            }

            var insertManyResponse = await questions.Data.InsertMany(questionObjs.ToArray());
            // END ImportData
            // TODO[g-despot] Error handling missing
            // Pass the list of objects (converted to an array) to InsertMany
            // if (insertManyResponse.HasErrors)
            // {
            //     Console.WriteLine($"Number of failed imports: {insertManyResponse.Errors.Count}");
            //     Console.WriteLine($"First failed object error: {insertManyResponse.Errors.First()}");
            // }

            // START NearVector
            var queryVector = data[0].Vector; // Use a vector from the dataset for a reliable query

            // Added a small delay to ensure indexing is complete
            await Task.Delay(2000);

            var response = await questions.Query.NearVector(
                queryVector,
                limit: 2,
                returnMetadata: MetadataOptions.Certainty
            );

            Console.WriteLine(JsonSerializer.Serialize(response.Objects));
            // END NearVector

            // ===== Test query results =====
            Assert.Equal(2, response.Objects.Count());
            // The first result should be the object we used for the query, with near-perfect certainty
            Assert.NotNull(response.Objects.First().Metadata.Certainty);
            Assert.True(response.Objects.First().Metadata.Certainty > 0.999);
            var props = response.Objects.First().Properties as IDictionary<string, object>;
            Assert.NotNull(props);
            Assert.Equal(data[0].Question, props["question"].ToString());
        }
        finally
        {
            if (client != null && await client.Collections.Exists(collectionName))
            {
                await client.Collections.Delete(collectionName);
            }
        }
    }
}