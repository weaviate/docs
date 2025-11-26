using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace WeaviateProject.Examples
{
    public class QuickstartLocalCreateVectors
    {
        public static async Task Run()
        {
            string collectionName = "Movie";

            // Connect to your local Weaviate instance
            var client = await Connect.Local();

            // NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
            if (await client.Collections.Exists(collectionName))
            {
                await client.Collections.Delete(collectionName);
            }

            // Create a collection
            var movies = await client.Collections.Create(new CollectionConfig
            {
                Name = collectionName,
                // No automatic vectorization since we're providing vectors
                VectorConfig = new VectorConfig("default", new Vectorizer.SelfProvided()),
                // Define properties for the collection
                Properties =
                [
                    Property.Text("title"),
                    Property.Text("description"),
                    Property.Text("genre")
                ]
            });

            // Import three objects
            var dataObjects = new List<WeaviateObject>
            {
                new WeaviateObject
                {
                    Properties = new Dictionary<string, object>
                    {
                        { "title", "The Matrix" },
                        { "description", "A computer hacker learns about the true nature of reality and his role in the war against its controllers." },
                        { "genre", "Science Fiction" }
                    },
                    Vectors = new float[] { 0.1f, 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f }
                },
                new WeaviateObject
                {
                    Properties = new Dictionary<string, object>
                    {
                        { "title", "Spirited Away" },
                        { "description", "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents and return home." },
                        { "genre", "Animation" }
                    },
                    Vectors = new float[] { 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f }
                },
                new WeaviateObject
                {
                    Properties = new Dictionary<string, object>
                    {
                        { "title", "The Lord of the Rings: The Fellowship of the Ring" },
                        { "description", "A meek Hobbit and his companions set out on a perilous journey to destroy a powerful ring and save Middle-earth." },
                        { "genre", "Fantasy" }
                    },
                    Vectors = new float[] { 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f, 0.9f, 1.0f }
                }
            };

            // Insert the objects with vectors
            var insertResponse = await movies.Data.InsertMany(dataObjects.ToArray());
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
