// START CreateCollection
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;

namespace WeaviateProject.Examples
{
    public class QuickstartLocalCreateVectors
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
            var movies = await client.Collections.Create(
                new CollectionCreateParams
                {
                    Name = collectionName,
                    // No automatic vectorization since we're providing vectors
                    VectorConfig = Configure.Vector("default", v => v.SelfProvided()),
                    // Define properties for the collection
                    Properties =
                    [
                        Property.Text("title"),
                        Property.Text("description"),
                        Property.Text("genre"),
                    ],
                }
            );

            // Step 1.3: Import three objects
            var dataToInsert = new List<BatchInsertRequest>
            {
                new(
                    new
                    {
                        title = "The Matrix",
                        description = "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
                        genre = "Science Fiction",
                    },
                    null,
                    new float[] { 0.1f, 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f }
                ),
                new(
                    new
                    {
                        title = "Spirited Away",
                        description = "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home.",
                        genre = "Animation",
                    },
                    null,
                    new float[] { 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f }
                ),
                new(
                    new
                    {
                        title = "The Lord of the Rings: The Fellowship of the Ring",
                        description = "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth.",
                        genre = "Fantasy",
                    },
                    null,
                    new float[] { 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f, 1.0f }
                ),
            };

            // Insert the objects with vectors
            var insertResponse = await movies.Data.InsertMany(dataToInsert);
            if (insertResponse.HasErrors)
            {
                Console.WriteLine($"Errors during import: {insertResponse.Errors}");
            }
            else
            {
                Console.WriteLine(
                    $"Imported {insertResponse.Count} objects with vectors into the Movie collection"
                );
            }
            // END CreateCollection
            Thread.Sleep(1000);
            // START CreateCollection
        }
    }
}
// END CreateCollection
