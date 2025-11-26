using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Collections.Generic;

namespace WeaviateProject.Examples
{
    public class QuickstartQueryNearTextRAG
    {
        public static async Task Run()
        {
            // Best practice: store your credentials in environment variables
            string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
            string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
            string anthropicApiKey = Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY");

            // Connect to your Weaviate Cloud instance
            var client = await Connect.Cloud(weaviateUrl, weaviateApiKey, headers: 
                new Dictionary<string, string> { { "Anthropic-Api-Key", anthropicApiKey } }
            );

            // Perform RAG with nearText results
            var movies = client.Collections.Use("Movie");

            // highlight-start
            var response = await movies.Generate.NearText(
                "sci-fi",
                "Write a tweet with emojis about this movie.",
                limit: 1,
                returnProperties: new[] { "title", "description", "genre" },
                generativeConfig: new Generative.Anthropic { Model = "claude-3-5-haiku-latest" }
            );
            // highlight-end

            // Inspect the results
            Console.WriteLine(response.Generated);
        }
    }
}
