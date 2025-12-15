// START CreateCollection
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace WeaviateProject.Examples
{
    public class QuickstartCreateVectors
    {
        public static async Task Run()
        {
            string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
            string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
            string collectionName = "Movie";

            var client = await Connect.Cloud(weaviateUrl, weaviateApiKey);
            // END CreateCollection

            if (await client.Collections.Exists(collectionName))
            {
                await client.Collections.Delete(collectionName);
            }
            // START CreateCollection

            // Step 1.2: Create a collection
            var movies = await client.Collections.Create(new CollectionCreateParams
            {
                Name = collectionName,
                VectorConfig = Configure.Vector("default", v => v.SelfProvided()),
                Properties =
                [
                    Property.Text("title"),
                    Property.Text("description"),
                    Property.Text("genre")
                ]
            });

            // Step 1.3: Import three objects using collection initialization
            var dataToInsert = new List<BatchInsertRequest>
            {
                new BatchInsertRequest(
                    new {
                        title = "The Matrix",
                        description = "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
                        genre = "Science Fiction"
                    },
                    null,
                    new Vectors { { "default", new float[] { 0.1f, 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f } } }
                ),
                new BatchInsertRequest(
                    new {
                        title = "Spirited Away",
                        description = "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
                        genre = "Animation"
                    },
                    null,
                    new Vectors { { "default", new float[] { 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f } } }
                ),
                new BatchInsertRequest(
                    new {
                        title = "The Lord of the Rings: The Fellowship of the Ring",
                        description = "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
                        genre = "Fantasy"
                    },
                    null,
                    new Vectors { { "default", new float[] { 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f, 1.0f } } }
                )
            };

            // Insert the objects with vectors
            var insertResponse = await movies.Data.InsertMany(dataToInsert);

            if (insertResponse.HasErrors)
            {
                Console.WriteLine($"Errors during import: {insertResponse.Errors}");
            }
            else
            {
                Console.WriteLine($"Imported {insertResponse.Count} objects with vectors into the Movie collection");
            }
        }
    }
}
// END CreateCollection