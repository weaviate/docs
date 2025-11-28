// START NearText
using Weaviate.Client;
using System;
using System.Threading.Tasks;
using System.Text.Json;

namespace WeaviateProject.Examples
{
    public class QuickstartQueryNearVector
    {
        public static async Task Run()
        {
            // Best practice: store your credentials in environment variables
            string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
            string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

            // Step 2.1: Connect to your Weaviate Cloud instance
            var client = await Connect.Cloud(weaviateUrl, weaviateApiKey);

            // Step 2.2: Perform a vector search with NearVector
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
// END NearText