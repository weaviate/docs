using Xunit;
using Weaviate.Client;
using System;
using System.Threading.Tasks;
using Weaviate.Client.Models;

namespace WeaviateProject.Tests;

public class ObjectTest
{
    readonly Guid objectId = Guid.NewGuid();
    readonly string collectionName = "Jeopardy";

    [Fact]
    public async Task Should_Import_Objects()
    {
        var client = Connect.Local(restPort: 8085, grpcPort: 50055);
        // START CreateObject
        var collectionClient = client.Collections.Use(collectionName);

        var obj = await collectionClient.Data.Insert(
            new
            {
                question = "This vector DB is OSS & supports automatic property type inference on import",
                // "answer": "Weaviate",  # properties can be omitted
                newProperty = 123
            },
            id: objectId
        );
        // END CreateObject
        Console.WriteLine($"Successfully created collection: '{collectionName}'");
    }

    [Fact]
    public async Task Should_Delete_Objects()
    {
        var client = Connect.Local(restPort: 8085, grpcPort: 50055);
        var collectionName = "Article";

        if (await client.Collections.Exists(collectionName))
        {
            // START DeleteObject
            var collection = client.Collections.Use(collectionName);
            await collection.Data.Delete(objectId);
            // END DeleteObject
            Console.WriteLine($"Successfully deleted object: '{objectId}' from collection: '{collectionName}'");
        }
        else
        {
            Console.WriteLine($"Collection '{collectionName}' does not exist.");
        }
    }
}
