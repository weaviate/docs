// START RAG
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Weaviate.Client.Models.Generative;

namespace WeaviateProject.Examples
{
    public class QuickstartLocalQueryNearTextRAG
    {
        public static async Task Run()
        {
            // Step 3.1: Connect to your local Weaviate instance
            var client = await Connect.Local();

            // Step 3.2: Perform RAG with nearText results
            var movies = client.Collections.Use("Movie");

            // highlight-start
            var response = await movies.Generate.NearText(
                "sci-fi",
                limit: 1,
                returnProperties: ["title", "description", "genre"],
                groupedTask: new GroupedTask("Write a tweet with emojis about this movie."),
                provider: new Providers.Ollama
                {
                    ApiEndpoint = "http://ollama:11434", // If using Docker you might need: http://host.docker.internal:11434
                    Model = "llama3.2", // The model to use
                }
            );
            // highlight-end

            // Inspect the results
            Console.WriteLine(JsonSerializer.Serialize(response.Generative.Values));
        }
    }
}
// END RAG
