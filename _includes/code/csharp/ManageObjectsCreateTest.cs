using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace WeaviateProject.Tests;

[Collection("Sequential")]
public class ManageObjectsCreateTest : IAsyncLifetime
{
    private static readonly WeaviateClient client;

    // A helper method to generate a deterministic UUID v5 from a seed.
    private static Guid GenerateUuid5(string seed)
    {
        // Namespace for UUIDv5, can be any valid Guid.
        var namespaceId = Guid.Parse("00000000-0000-0000-0000-000000000000");

        var namespaceBytes = namespaceId.ToByteArray();
        var nameBytes = Encoding.UTF8.GetBytes(seed);

        // Concatenate namespace and name bytes
        var combinedBytes = new byte[namespaceBytes.Length + nameBytes.Length];
        Buffer.BlockCopy(namespaceBytes, 0, combinedBytes, 0, namespaceBytes.Length);
        Buffer.BlockCopy(nameBytes, 0, combinedBytes, namespaceBytes.Length, nameBytes.Length);

        using (var sha1 = SHA1.Create())
        {
            var hash = sha1.ComputeHash(combinedBytes);
            var newGuid = new byte[16];
            Array.Copy(hash, 0, newGuid, 0, 16);

            // Set version to 5
            newGuid[6] = (byte)((newGuid[6] & 0x0F) | (5 << 4));
            // Set variant to RFC 4122
            newGuid[8] = (byte)((newGuid[8] & 0x3F) | 0x80);

            // In-place byte swap for correct Guid constructor order
            (newGuid[0], newGuid[3]) = (newGuid[3], newGuid[0]);
            (newGuid[1], newGuid[2]) = (newGuid[2], newGuid[1]);
            (newGuid[4], newGuid[5]) = (newGuid[5], newGuid[4]);
            (newGuid[6], newGuid[7]) = (newGuid[7], newGuid[6]);

            return new Guid(newGuid);
        }
    }

    // Static constructor acts like JUnit's @BeforeAll for one-time setup.
    static ManageObjectsCreateTest()
    {
        // START INSTANTIATION-COMMON
        client = new WeaviateClient(new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 });
        // END INSTANTIATION-COMMON
    }

    // InitializeAsync runs once before the class tests start.
    public async Task InitializeAsync()
    {
        await client.Collections.DeleteAll(); // Clean slate before tests

        // START Define the class
        await client.Collections.Create(new CollectionConfig
        {
            Name = "JeopardyQuestion",
            Properties =
            [
                Property.Text("title", description: "Question title")
            ],
            VectorConfig = new VectorConfigList
            {
                new VectorConfig("default", new Vectorizer.Text2VecTransformers())
            }
        });

        await client.Collections.Create(new CollectionConfig
        {
            Name = "WineReviewNV",
            Properties =
            [
                Property.Text("review_body", description: "Review body"),
                Property.Text("title", description: "Name of the wine"),
                Property.Text("country", description: "Originating country")
            ],
            VectorConfig = new VectorConfigList
            {
                new VectorConfig("title", new Vectorizer.Text2VecTransformers()),
                new VectorConfig("review_body", new Vectorizer.Text2VecTransformers()),
                new VectorConfig("title_country", new Vectorizer.Text2VecTransformers())
            }
        });
        // END Define the class

        // Additional collections for other tests
        await client.Collections.Create(new CollectionConfig
        {
            Name = "Publication",
            Properties =
            [
                Property.GeoCoordinate("headquartersGeoLocation")
            ]
        });
        await client.Collections.Create(new CollectionConfig
        {
            Name = "Author",
            VectorConfig = new VectorConfigList
            {
                new VectorConfig("default", new Vectorizer.SelfProvided())
            }
        });
    }

    // DisposeAsync acts like JUnit's @AfterAll for one-time teardown.
    public async Task DisposeAsync()
    {
        await client.Collections.DeleteAll();
    }

    [Fact]
    public async Task TestCreateObject()
    {
        // START CreateSimpleObject
        var jeopardy = client.Collections.Use("JeopardyQuestion");

        // highlight-start
        var uuid = await jeopardy.Data.Insert(new
        {
            // highlight-end
            question = "This vector DB is OSS & supports automatic property type inference on import",
            // answer = "Weaviate", // properties can be omitted
            newProperty = 123 // will be automatically added as a number property
        });

        Console.WriteLine(uuid); // the return value is the object's UUID
        // END CreateSimpleObject

        var result = await jeopardy.Query.FetchObjectByID(uuid);
        Assert.NotNull(result);
        var props = result.Properties as IDictionary<string, object>;
        Assert.Equal(123d, props["newProperty"]);
    }

    [Fact]
    public async Task TestCreateObjectWithVector()
    {
        // START CreateObjectWithVector
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var uuid = await jeopardy.Data.Insert(
            new
            {
                question = "This vector DB is OSS and supports automatic property type inference on import",
                answer = "Weaviate"
            },
            // highlight-start
            vectors: new float[300] // Using a zero vector for demonstration
        );
        // highlight-end

        Console.WriteLine(uuid); // the return value is the object's UUID
        // END CreateObjectWithVector

        var result = await jeopardy.Query.FetchObjectByID(uuid);
        Assert.NotNull(result);
    }

    [Fact]
    public async Task TestCreateObjectNamedVectors()
    {
        // START CreateObjectNamedVectors
        var reviews = client.Collections.Use("WineReviewNV"); // This collection must have named vectors configured
        var uuid = await reviews.Data.Insert(
            new
            {
                title = "A delicious Riesling",
                review_body = "This wine is a delicious Riesling which pairs well with seafood.",
                country = "Germany"
            },
            // highlight-start
            // Specify the named vectors, following the collection definition
            vectors: new Vectors
            {
                { "title", new float[1536] },
                { "review_body", new float[1536] },
                { "title_country", new float[1536] }
            }
        );
        // highlight-end

        Console.WriteLine(uuid); // the return value is the object's UUID
        // END CreateObjectNamedVectors

        var result = await reviews.Query.FetchObjectByID(uuid, includeVectors: true);
        Assert.NotNull(result);
        Assert.NotNull(result.Vectors);
        Assert.Contains("title", result.Vectors.Keys);
        Assert.Contains("review_body", result.Vectors.Keys);
        Assert.Contains("title_country", result.Vectors.Keys);
    }

    [Fact]
    public async Task TestCreateObjectWithDeterministicId()
    {
        // START CreateObjectWithDeterministicId
        // highlight-start
        // In C#, you can generate a deterministic UUID from a string or bytes.
        // This helper function creates a UUID v5 for this purpose.
        // highlight-end

        var dataObject = new
        {
            question = "This vector DB is OSS and supports automatic property type inference on import",
            answer = "Weaviate"
        };
        var dataObjectString = JsonSerializer.Serialize(dataObject);

        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var uuid = await jeopardy.Data.Insert(
            dataObject,
            // highlight-start
            id: GenerateUuid5(dataObjectString)
        );
        // highlight-end
        // END CreateObjectWithDeterministicId

        Assert.Equal(GenerateUuid5(dataObjectString), uuid);
        await jeopardy.Data.DeleteByID(uuid); // Clean up
    }

    [Fact]
    public async Task TestCreateObjectWithId()
    {
        // START CreateObjectWithId
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var uuid = await jeopardy.Data.Insert(
            new
            {
                question = "This vector DB is OSS and supports automatic property type inference on import",
                answer = "Weaviate"
            },
            // highlight-start
            id: Guid.Parse("12345678-e64f-5d94-90db-c8cfa3fc1234")
        );
        // highlight-end

        Console.WriteLine(uuid); // the return value is the object's UUID
        // END CreateObjectWithId

        var result = await jeopardy.Query.FetchObjectByID(uuid);
        Assert.NotNull(result);
        var props = result.Properties as IDictionary<string, object>;
        Assert.Equal("This vector DB is OSS and supports automatic property type inference on import", props["question"]);
    }

    [Fact]
    public async Task TestWithGeoCoordinates()
    {
        // START WithGeoCoordinates
        var publications = client.Collections.Use("Publication");

        var uuid = await publications.Data.Insert(
            new
            {
                headquartersGeoLocation = new GeoCoordinate(52.3932696f, 4.8374263f)
            }
        );
        // END WithGeoCoordinates

        var result = await publications.Query.FetchObjectByID(uuid);
        Assert.NotNull(result);
        await publications.Data.DeleteByID(uuid);
    }

    [Fact]
    public async Task TestCheckForAnObject()
    {
        // START CheckForAnObject
        // generate uuid based on the key properties used during data insert
        var objectUuid = GenerateUuid5("Author to fetch");
        // END CheckForAnObject

        var authors = client.Collections.Use("Author");
        await authors.Data.Insert(
            new { name = "Author to fetch" },
            id: objectUuid,
            vectors: new float[1536]);

        // START CheckForAnObject
        // highlight-start
        var authorExists = (await authors.Query.FetchObjectByID(objectUuid)) != null;
        // highlight-end

        Console.WriteLine("Author exists: " + authorExists);
        // END CheckForAnObject

        Assert.True(authorExists);
        await authors.Data.DeleteByID(objectUuid);
        Assert.False((await authors.Query.FetchObjectByID(objectUuid)) != null);
    }

    // START ValidateObject
    // Coming soon
    // END ValidateObject
}