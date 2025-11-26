using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;

namespace WeaviateProject.Examples
{
    public class QuickstartLocalQueryNearVectorRAG
    {
        public static async Task Run()
        {
            // Connect to your local Weaviate instance
            var client = await Connect.Local();

            // Perform RAG with NearVector results
            var movies = client.Collections.Use("Movie");

            // highlight-start
            float[] queryVector = new float[] { 0.11f, 0.21f, 0.31f, 0.41f, 0.51f, 0.61f, 0.71f, 0.81f };

            var response = await movies.Generate.NearVector(
                queryVector,
                "Write a tweet with emojis about this movie.",
                limit: 1,
                returnProperties: new[] { "title", "description", "genre" },
                generativeConfig: new Generative.Ollama
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
