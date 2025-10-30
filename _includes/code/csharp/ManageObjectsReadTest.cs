using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using static Weaviate.Client.Auth;

namespace WeaviateProject.Tests;

public class ManageObjectsReadTest : IDisposable
{
    private static readonly WeaviateClient client;

    // Static constructor for one-time setup (like @BeforeAll)
    static ManageObjectsReadTest()
    {
        // START INSTANTIATION-COMMON
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

        client = Connect.Cloud(weaviateUrl, weaviateApiKey);
        // END INSTANTIATION-COMMON
    }

    // Dispose is called once after all tests in the class are finished (like @AfterAll)
    public void Dispose()
    {
        // The C# client does not have a close() method; disposal is handled
        // by the garbage collector when the static instance is no longer needed.
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task TestReadObject()
    {
        // START ReadSimpleObject
        var jeopardy = client.Collections.Use<object>("JeopardyQuestion");

        // highlight-start
        var dataObject = await jeopardy.Query.FetchObjectByID(Guid.Parse("00ff6900-e64f-5d94-90db-c8cfa3fc851b"));
        // highlight-end

        if (dataObject != null)
        {
            Console.WriteLine(JsonSerializer.Serialize(dataObject.Properties));
        }
        // END ReadSimpleObject
    }

    [Fact]
    public async Task TestReadObjectWithVector()
    {
        // START ReadObjectWithVector
        var jeopardy = client.Collections.Use<object>("JeopardyQuestion");

        var dataObject = await jeopardy.Query.FetchObjectByID(Guid.Parse("00ff6900-e64f-5d94-90db-c8cfa3fc851b"),
            // highlight-start
            returnMetadata: MetadataOptions.Vector
        );
        // highlight-end

        if (dataObject?.Vectors.ContainsKey("default") ?? false)
        {
            var vector = dataObject.Vectors["default"];
            Console.WriteLine(vector);
        }
        // END ReadObjectWithVector
    }

    [Fact]
    public async Task TestReadObjectNamedVectors()
    {
        // START ReadObjectNamedVectors
        var reviews = client.Collections.Use<object>("WineReviewNV"); // Collection with named
        // END ReadObjectNamedVectors                                 // vectors

        var someObjResponse = await reviews.Query.FetchObjects(limit: 1);
        if (!someObjResponse.Objects.Any())
        {
            return; // Skip if no data
        }
        var objUuid = someObjResponse.Objects.First().ID;
        var vectorNames = new List<string> { "title", "review_body" };

        // START ReadObjectNamedVectors
        var dataObject = await reviews.Query.FetchObjectByID(objUuid.Value, // Object UUID
                                                                            // highlight-start
            returnMetadata: MetadataOptions.Vector // Specify to include vectors
        );
        // highlight-end

        // The vectors are returned in the `Vectors` property as a dictionary
        if (dataObject != null)
        {
            foreach (var name in vectorNames)
            {
                if (dataObject.Vectors.TryGetValue(name, out var vector))
                {
                    Console.WriteLine(vector);
                }
            }
        }
        // END ReadObjectNamedVectors
    }

    [Fact]
    public async Task TestCheckObject()
    {
        // START CheckForAnObject
        var jeopardy = client.Collections.Use<object>("JeopardyQuestion");

        // The C# client checks for existence by attempting to fetch an object and checking for null.
        var dataObject = await jeopardy.Query.FetchObjectByID(Guid.Parse("00ff6900-e64f-5d94-90db-c8cfa3fc851b"));
        bool exists = dataObject != null;

        Console.WriteLine(exists);
        // END CheckForAnObject
    }
}