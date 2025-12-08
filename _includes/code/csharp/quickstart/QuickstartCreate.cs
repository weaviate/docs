// START CreateCollection
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace WeaviateProject.Examples
{
    public class QuickstartCreate
    {
        public static async Task Run()
        {
            // Best practice: store your credentials in environment variables
            string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
            string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
            string collectionName = "Movie";

            // Connect to your Weaviate Cloud instance
            var client = await Connect.Cloud(weaviateUrl, weaviateApiKey);
            // END CreateCollection
            // NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
            if (await client.Collections.Exists(collectionName))
            {
                await client.Collections.Delete(collectionName);
            }
            // START CreateCollection
            
            // Create a collection
            var movies = await client.Collections.Create(new CollectionConfig
            {
                Name = collectionName,
                VectorConfig = Configure.Vectors.Text2VecWeaviate().New(),
                // Define properties for the collection
                Properties =
                [
                    Property.Text("title"),
                    Property.Text("description"),
                    Property.Text("genre")
                ]
            });

            // Import three objects
            var dataObjects = new List<object>
            {
                new {
                    title = "The Matrix",
                    description = "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
                    genre = "Science Fiction"
                },
                new {
                    title = "Spirited Away",
                    description = "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
                    genre = "Animation"
                },
                new {
                    title = "The Lord of the Rings: The Fellowship of the Ring",
                    description = "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
                    genre = "Fantasy"
                }
            };

            // Insert objects using InsertMany
            var insertResponse = await movies.Data.InsertMany(dataObjects.ToArray());

            if (insertResponse.HasErrors)
            {
                Console.WriteLine($"Errors during import: {insertResponse.Errors}");
            }
            else
            {
                Console.WriteLine($"Imported & vectorized {insertResponse.Count} objects into the Movie collection");
            }
        }
    }
}
// END CreateCollection
