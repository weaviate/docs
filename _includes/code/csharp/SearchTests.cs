using Xunit;
using Weaviate.Client;
using System;
using System.Threading.Tasks;
using Weaviate.Client.Models;
using System.Linq;

namespace WeaviateProject.Tests;

public static class QueryConstants
{
    public const string NearTextQuery = "Weaviate";
}

public class SearchTest
{
    readonly WeaviateClient client = Connect.Local(restPort: 8080, grpcPort: 50051);

    [Fact]
    public async Task Should_Fetch_By_Id()
    {
        var collection = client.Collections.Use("JeopardyQuestion");
        var objectId = Guid.NewGuid();
        await collection.Data.Insert(
            new
            {
                question = "This vector DB is OSS & supports automatic property type inference on import",
                newProperty = 123
            },
            id: objectId
        );

        // START FetchById
        var obj = await collection.Query.FetchObjectByID(objectId);
        Console.WriteLine($"Fetched object with ID: {obj.ID}");
        // END FetchById
    }

    [Fact]
    public async Task Should_Near_Text()
    {
        // START GetNearText
        var collection = client.Collections.Use("JeopardyQuestion");
        var queryResult = await collection.Query.NearText(
            "animals in movies",
            limit: 1,
            metadata: MetadataOptions.Distance);

        Console.WriteLine("Search Results:");
        foreach (var obj in queryResult.Objects)
        {
            Console.WriteLine($"Object: {obj.Properties})");
        }
        // END GetNearText
    }
}
