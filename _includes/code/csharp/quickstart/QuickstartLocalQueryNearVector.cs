using Weaviate.Client;
using System;
using System.Threading.Tasks;
using System.Text.Json;

namespace WeaviateProject.Examples
{
    public class QuickstartLocalQueryNearVector
    {
        public static async Task Run()
        {
            // Connect to your local Weaviate instance
            var client = await Connect.Local();

            // Perform a vector search with NearVector
            var movies = client.Collections.Use("Movie");

            // highlight-start
            float[] queryVector = [0.11f, 0.21f, 0.31f, 0.41f, 0.51f, 0.61f, 0.71f, 0.81f];

            var response = await movies.Query.NearVector(
                queryVector,
                limit: 2,
                returnProperties: ["title", "description", "genre"]
            );
            // highlight-end

            // Inspect the results
            Console.WriteLine("--- Query Results ---");
            foreach (var obj in response.Objects)
            {
                Console.WriteLine(JsonSerializer.Serialize(obj.Properties, new JsonSerializerOptions { WriteIndented = true }));
            }
        }
    }
}
