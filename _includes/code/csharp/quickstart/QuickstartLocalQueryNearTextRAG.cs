using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;

namespace WeaviateProject.Examples
{
    public class QuickstartLocalQueryNearTextRAG
    {
        public static async Task Run()
        {
            // Connect to your local Weaviate instance
            var client = await Connect.Local();

            // Perform RAG with nearText results
            var movies = client.Collections.Use("Movie");

            // highlight-start
            var response = await movies.Generate.NearText(
                "sci-fi",
                "Write a tweet with emojis about this movie.",
                limit: 1,
                returnProperties: new[] { "title", "description", "genre" },
                groupedPrompt:
                generative: new GenerativeConfig.Ollama
                {
                    ApiEndpoint = "http://ollama:11434", // If using Docker you might need: http://host.docker.internal:11434
                    Model = "llama3.2" // The model to use
                }
            );
            // highlight-end

            // Inspect the results
            Console.WriteLine(response.Generated);
        }
    }
}
