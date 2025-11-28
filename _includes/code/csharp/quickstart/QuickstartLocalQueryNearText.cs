// START NearText
using Weaviate.Client;
using System;
using System.Threading.Tasks;
using System.Text.Json;
using System.Threading;

namespace WeaviateProject.Examples
{
    public class QuickstartLocalQueryNearText
    {
        public static async Task Run()
        {
            // Step 2.1: Connect to your local Weaviate instance
            var client = await Connect.Local();

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