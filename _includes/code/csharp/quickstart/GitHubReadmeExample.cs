using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;

namespace WeaviateProject.Examples
{
    public class GitHubReadmeExample
    {
        public static async Task Run()
        {
            // Connect to Weaviate
            // Using try-with-resources ensures client.close() is called automatically
            var client = await Connect.Local();

            // Clean slate (not in original script, but helpful for re-running main methods)
            if (await client.Collections.Exists("Article"))
            {
                await client.Collections.Delete("Article");
            }

            // Create a collection
            var articles = await client.Collections.Create(
                new CollectionCreateParams
                {
                    Name = "Article",
                    Properties = [Property.Text("content")],
                    VectorConfig = Configure.Vector("default", v => v.Text2VecTransformers()), // Use a vectorizer to generate embeddings during import
                    // VectorConfig = Configure.Vector("default", v => v.SelfProvided())  // If you want to import your own pre-generated embeddings
                }
            );

            // Insert objects and generate embeddings
            var data = new List<object>
            {
                new { content = "Vector databases enable semantic search" },
                new { content = "Machine learning models generate embeddings" },
                new { content = "Weaviate supports hybrid search capabilities" },
            };
            await articles.Data.InsertMany(data.ToArray());

            await Task.Delay(1000);
            // Perform semantic search
            var results = await articles.Query.NearText("Search objects by meaning", limit: 1);
            // Print result
            if (results.Objects.Count > 0)
            {
                Console.WriteLine(JsonSerializer.Serialize(results.Objects.First()));
            }
        }
    }
}
