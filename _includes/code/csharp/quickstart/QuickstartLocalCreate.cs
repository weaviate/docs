// START CreateCollection
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Threading;

namespace WeaviateProject.Examples
{
    public class QuickstartLocalCreate
    {
        public static async Task Run()
        {
            string collectionName = "Movie";

            // Step 1.1: Connect to your local Weaviate instance
            var client = await Connect.Local();
            // END CreateCollection
            // NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
            if (await client.Collections.Exists(collectionName))
            {
                await client.Collections.Delete(collectionName);
            }
            // START CreateCollection

            // Step 1.2: Create a collection
            var movies = await client.Collections.Create(new CollectionConfig
            {
                Name = collectionName,
                VectorConfig = Configure.Vectors.Text2VecOllama(
                    apiEndpoint: "http://ollama:11434", model: "nomic-embed-text"
                ).New(name: "default"),
                // Define properties for the collection
                Properties =
                [
                    Property.Text("title"),
                    Property.Text("description"),
                    Property.Text("genre")
                ]
            });

            // Step 1.3: Import three objects
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
            // END CreateCollection
            Thread.Sleep(1000);
            // START CreateCollection
        }
    }
}
// END CreateCollection