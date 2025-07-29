using Xunit;
using Weaviate.Client;
using System;
using System.Threading.Tasks;
using Weaviate.Client.Models;

namespace WeaviateProject.Tests;

public class CollectionTest
{
    [Fact]
    public async Task Should_Create_Collection()
    {
        var client = Connect.Local(restPort: 8085, grpcPort: 50055);
        // START BasicCreateCollection
        var collectionName = "Article";
        // END BasicCreateCollection
        // Clean up previous runs by deleting the collection if it exists
        if (await client.Collections.Exists(collectionName))
        {
            await client.Collections.Delete(collectionName);
            Console.WriteLine($"Deleted existing collection: '{collectionName}'");
        }

        // START BasicCreateCollection
        var articleCollection = new Collection
        {
            Name = collectionName,
            Description = "Collection description",
        };

        var collection = await client.Collections.Create(articleCollection);
        // END BasicCreateCollection
        Console.WriteLine($"Successfully created collection: '{collectionName}'");
    }

    [Fact]
    public async Task Should_Create_Collection_With_Properties()
    {
        var client = Connect.Local(restPort: 8085, grpcPort: 50055);
        // START CreateCollectionWithProperties
        var collectionName = "Article";
        // END CreateCollectionWithProperties
        // Clean up previous runs by deleting the collection if it exists
        if (await client.Collections.Exists(collectionName))
        {
            await client.Collections.Delete(collectionName);
            Console.WriteLine($"Deleted existing collection: '{collectionName}'");
        }

        // START CreateCollectionWithProperties
        var articleCollection = new Collection
        {
            Name = collectionName,
            Description = "something",
            Properties = [Property.Int("number_property"),Property.Text("test_property")],
        };

        var collection = await client.Collections.Create(articleCollection);
        // END CreateCollectionWithProperties
        Console.WriteLine($"Successfully created collection: '{collectionName}'");
    }

    [Fact]
    public async Task Should_Create_Collection_With_Vectorizer()
    {
        var client = Connect.Local(restPort: 8085, grpcPort: 50055);
        // START CreateCollectionWithVectorizer
        var collectionName = "Article";
        // END CreateCollectionWithVectorizer
        // Clean up previous runs by deleting the collection if it exists
        if (await client.Collections.Exists(collectionName))
        {
            await client.Collections.Delete(collectionName);
            Console.WriteLine($"Deleted existing collection: '{collectionName}'");
        }

        // START CreateCollectionWithVectorizer
        var articleCollection = new Collection
        {
            Name = collectionName,
            Description = "something",
            Properties = [Property.Int("number_property"),Property.Text("test_property")],
            VectorConfig = new VectorConfig("vector_name", new Vectorizer.Text2VecContextionary())
        };

        var collection = await client.Collections.Create(articleCollection);
        // END CreateCollectionWithVectorizer
        Console.WriteLine($"Successfully created collection: '{collectionName}'");
    }

    [Fact]
    public async Task Should_Delete_Collection()
    {
        var client = Connect.Local(restPort: 8085, grpcPort: 50055);
        var collectionName = "Article";

        // Ensure the collection exists before attempting to delete it
        if (await client.Collections.Exists(collectionName))
        {
            await client.Collections.Delete(collectionName);
            Console.WriteLine($"Successfully deleted collection: '{collectionName}'");
        }
        else
        {
            Console.WriteLine($"Collection '{collectionName}' does not exist.");
        }
    }
}
