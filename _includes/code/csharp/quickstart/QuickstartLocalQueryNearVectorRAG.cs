// START RAG
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Weaviate.Client.Models.Generative;

namespace WeaviateProject.Examples
{
    public class QuickstartLocalQueryNearVectorRAG
    {
        public static async Task Run()
        {
            // Step 3.1: Connect to your local Weaviate instance
            var client = await Connect.Local();

            // Step 3.2: Perform RAG with NearVector results
            var movies = client.Collections.Use("Movie");

            // highlight-start
            float[] queryVector = [0.11f, 0.21f, 0.31f, 0.41f, 0.51f, 0.61f, 0.71f, 0.81f];

            var response = await movies.Generate.NearVector(
                vectors: queryVector,
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
