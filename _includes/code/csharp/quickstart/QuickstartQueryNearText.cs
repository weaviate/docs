// START NearText
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Text.Json;

namespace WeaviateProject.Examples
{
    public class QuickstartQueryNearText
    {
        public static async Task Run()
        {
            // Best practice: store your credentials in environment variables
            string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
            string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

            // Step 2.1: Connect to your Weaviate Cloud instance
            var client = await Connect.Cloud(weaviateUrl, weaviateApiKey);

            // Step 2.2: Perform a semantic search with NearText
            var movies = client.Collections.Use("Movie");

            // highlight-start
            var response = await movies.Query.NearText(
                "sci-fi",
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