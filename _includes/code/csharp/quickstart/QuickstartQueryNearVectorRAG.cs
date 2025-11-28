// START RAG
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;

namespace WeaviateProject.Examples
{
    public class QuickstartQueryNearVectorRAG
    {
        public static async Task Run()
        {
            // Best practice: store your credentials in environment variables
            string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
            string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
            string anthropicApiKey = Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY");

            // Step 3.1: Connect to your Weaviate Cloud instance
            var client = await Connect.Cloud(weaviateUrl, weaviateApiKey, headers:
                new Dictionary<string, string> { { "X-Anthropic-Api-Key", anthropicApiKey } }
            );

            // Step 3.2: Perform RAG with NearVector results
            var movies = client.Collections.Use("Movie");

            // highlight-start
            float[] queryVector = [0.11f, 0.21f, 0.31f, 0.41f, 0.51f, 0.61f, 0.71f, 0.81f];

            var response = await movies.Generate.NearVector(
                queryVector,
                limit: 1,
                returnProperties: ["title", "description", "genre"],
                groupedTask: new GroupedTask
                {
                    Task = "Write a tweet with emojis about this movie.",
                    Provider = new Weaviate.Client.Models.Generative.Providers.Anthropic
                    {
                        Model = "claude-3-5-haiku-latest" // The model to use
                    }
                }
            );
            // highlight-end

            // Inspect the results
            Console.WriteLine(JsonSerializer.Serialize(response.Generative.Values));
        }
    }
}
// END RAG