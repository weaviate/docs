using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace WeaviateProject.Tests;

public class ManageDataTests : IAsyncLifetime
{
    private readonly WeaviateClient weaviate;
    private readonly List<string> _collectionNamesToDelete = new List<string>();

    public ManageDataTests()
    {
        weaviate = new WeaviateClient(
            new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 }
        );
    }

    private string AddTestCollection(string name)
    {
        _collectionNamesToDelete.Add(name);
        return name;
    }

    public async Task InitializeAsync()
    {
        // Clean slate - delete collections if they exist
        await weaviate.Collections.Delete("JeopardyQuestion");
        await weaviate.Collections.Delete("WineReviewNV");
        await weaviate.Collections.Delete("Publication");
        await weaviate.Collections.Delete("Author");

        // Create JeopardyQuestion collection
        await weaviate.Collections.Create(new Collection
        {
            Name = "JeopardyQuestion",
            VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecOpenAI())
        });

        // Create WineReviewNV collection with named vectors
        await weaviate.Collections.Create(new Collection
        {
            Name = "WineReviewNV",
            Properties = new List<Property>
            {
                Property.Text("review_body", "Review body"),
                Property.Text("title", "Name of the wine"),
                Property.Text("country", "Originating country")
            },
            VectorConfig = new[]
            {
                // TODO[g-despot]: Uncomment when source properties available
                // new VectorConfig("title", new Vectorizer.Text2VecOpenAI()) { SourceProperties = new[] { "title" } },
                // new VectorConfig("review_body", new Vectorizer.Text2VecOpenAI()) { SourceProperties = new[] { "review_body" } },
                // new VectorConfig("title_country", new Vectorizer.Text2VecOpenAI()) { SourceProperties = new[] { "title", "country" } }
                new VectorConfig("title", new Vectorizer.Text2VecOpenAI()),
                    new VectorConfig("review_body", new Vectorizer.Text2VecOpenAI()),
                    new VectorConfig("title_country", new Vectorizer.Text2VecOpenAI())
            }
        });

        // Create Publication collection for geo tests
        await weaviate.Collections.Create(new Collection
        {
            Name = "Publication",
            Properties = new List<Property>
            {
                Property.GeoCoordinate("headquartersGeoLocation")
            }
        });

        // Create Author collection for existence checks
        await weaviate.Collections.Create(new Collection
        {
            Name = "Author",
            Properties = new List<Property>
            {
                Property.Text("name")
            },
            VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecOpenAI())
        });
    }

    public async Task DisposeAsync()
    {
        foreach (string name in _collectionNamesToDelete)
        {
            await weaviate.Collections.Delete(name);
        }
        await weaviate.Collections.Delete("JeopardyQuestion");
        await weaviate.Collections.Delete("WineReviewNV");
        await weaviate.Collections.Delete("Publication");
        await weaviate.Collections.Delete("Author");
    }

    [Fact]
    public async Task CreateObject()
    {
        // CreateObject START
        var jeopardy = weaviate.Collections.Use<dynamic>("JeopardyQuestion");

        // highlight-start
        var uuid = await jeopardy.Data.Insert(new
        {
            // highlight-end
            question = "This vector DB is OSS & supports automatic property type inference on import",
            // answer = "Weaviate",  // properties can be omitted
            newProperty = 123  // will be automatically added as a number property
        });

        Console.WriteLine(uuid); // the return value is the object's UUID
        // CreateObject END

        // Test
        var result = await jeopardy.Query.FetchObjectByID(uuid);
        var newPropertyValue = Convert.ToInt64(result?.Properties["newProperty"]);
        Assert.Equal(123L, newPropertyValue);
    }

    [Fact]
    public async Task CreateObjectWithVector()
    {
        // CreateObjectWithVector START
        var jeopardy = weaviate.Collections.Use<dynamic>("JeopardyQuestion");
        var uuid = await jeopardy.Data.Insert(
            new
            {
                question = "This vector DB is OSS and supports automatic property type inference on import",
                answer = "Weaviate"
            },
            // highlight-start
            vectors: Enumerable.Repeat(0.12345f, 1536).ToArray()
        // highlight-end
        );

        Console.WriteLine(uuid); // the return value is the object's UUID
        // CreateObjectWithVector END

        Assert.NotEqual(Guid.Empty, uuid);
    }

    [Fact]
    public async Task CreateObjectNamedVectors()
    {
        // CreateObjectNamedVectors START
        var reviews = weaviate.Collections.Use<dynamic>("WineReviewNV"); // This collection must have named vectors configured
        var uuid = await reviews.Data.Insert(
            new
            {
                title = "A delicious Riesling",
                review_body = "This wine is a delicious Riesling which pairs well with seafood.",
                country = "Germany"
            },
            // highlight-start
            // Specify the named vectors, following the collection definition
            vectors: new Dictionary<string, float[]>
            {
                ["title"] = Enumerable.Repeat(0.12345f, 1536).ToArray(),
                ["review_body"] = Enumerable.Repeat(0.31313f, 1536).ToArray(),
                ["title_country"] = Enumerable.Repeat(0.05050f, 1536).ToArray()
            }
            // highlight-end
        );

        Console.WriteLine(uuid); // the return value is the object's UUID
        // CreateObjectNamedVectors END

        // Test
        var result = await reviews.Query.FetchObjectByID(uuid, returnMetadata: MetadataOptions.Vector);
        Assert.NotNull(result?.Vectors);
        Assert.Equal(3, result.Vectors.Count);
        Assert.True(result.Vectors.ContainsKey("title"));
        Assert.True(result.Vectors.ContainsKey("review_body"));
        Assert.True(result.Vectors.ContainsKey("title_country"));
    }

    [Fact]
    public async Task CreateObjectWithDeterministicId()
    {
        // CreateObjectWithDeterministicId START
        // highlight-start
        // For deterministic UUID generation
        // highlight-end

        var dataObject = new
        {
            question = "This vector DB is OSS and supports automatic property type inference on import",
            answer = "Weaviate"
        };

        var jeopardy = weaviate.Collections.Use<dynamic>("JeopardyQuestion");
        var uuid = await jeopardy.Data.Insert(
            dataObject,
            // highlight-start
            id: GenerateUuid5(dataObject)
        // highlight-end
        );
        // CreateObjectWithDeterministicId END

        // Test
        Assert.Equal(GenerateUuid5(dataObject), uuid);
        await jeopardy.Data.DeleteByID(uuid); // Clean up
    }

    [Fact]
    public async Task CreateObjectWithId()
    {
        // CreateObjectWithId START
        var properties = new
        {
            question = "This vector DB is OSS and supports automatic property type inference on import",
            answer = "Weaviate"
        };
        var jeopardy = weaviate.Collections.Use<dynamic>("JeopardyQuestion");
        var uuid = await jeopardy.Data.Insert(
            properties,
            // highlight-start
            id: Guid.Parse("12345678-e64f-5d94-90db-c8cfa3fc1234")
        // highlight-end
        );

        Console.WriteLine(uuid); // the return value is the object's UUID
        // CreateObjectWithId END

        // Test
        var result = await jeopardy.Query.FetchObjectByID(uuid);
        Assert.Equal(properties.question, result?.Properties["question"]);
    }

    [Fact]
    public async Task WithGeoCoordinates()
    {
        // START WithGeoCoordinates
        var publications = weaviate.Collections.Use<dynamic>("Publication");

        await publications.Data.Insert(
            new
            {
                headquartersGeoLocation = new GeoCoordinate(
                    52.3932696f,
                    4.8374263f
                )
            }
        );
        // END WithGeoCoordinates

        var response = await publications.Query.FetchObjects(
            filter: Filter.Property("headquartersGeoLocation")
                .WithinGeoRange(
                    new GeoCoordinateConstraint(52.39f, 4.84f, 1000)
                )
        );

        Assert.Single(response.Objects);
        var objUuid = response.Objects.First().ID;
        await publications.Data.DeleteByID((Guid)objUuid);
    }

    [Fact]
    public async Task CheckForAnObject()
    {
        // START CheckForAnObject
        // generate uuid based on the key properties used during data insert
        var objectUuid = GenerateUuid5(new { name = "Author to fetch" });

        // END CheckForAnObject

        var authorsCollection = weaviate.Collections.Use<dynamic>("Author");
        await authorsCollection.Data.Insert(
            new { name = "Author to fetch" },
            objectUuid, // Custom UUID for testing
            Enumerable.Repeat(0.3f, 1536).ToArray() // If you want to specify a vector
        );

        // START CheckForAnObject
        var authors = weaviate.Collections.Use<dynamic>("Author");
        // highlight-start
        var author = await authors.Query.FetchObjectByID(objectUuid);
        var authorExists = author != null;
        // highlight-end

        Console.WriteLine("Author exists: " + authorExists);
        // END CheckForAnObject

        Assert.True(authorExists);
        await authorsCollection.Data.DeleteByID(objectUuid);
        var deletedAuthor = await authorsCollection.Query.FetchObjectByID(objectUuid);
        Assert.Null(deletedAuthor);
    }

    [Fact]
    public async Task ValidateObject()
    {
        // ValidateObject START
        // Validate is currently not supported with the Weaviate C# client
        // ValidateObject END

        // Note: Validation functionality is not yet implemented in the C# client
        // This test serves as a placeholder for when the feature becomes available

        Assert.True(true, "Validation not yet supported - placeholder test");
    }

    // Helper method for UUID v5 generation
    private static Guid GenerateUuid5(object data)
    {
        // Serialize the object to JSON for consistent hashing
        var json = JsonSerializer.Serialize(data);
        var bytes = Encoding.UTF8.GetBytes(json);

        using (var sha1 = SHA1.Create())
        {
            var hash = sha1.ComputeHash(bytes);

            // Convert first 16 bytes to GUID
            var guidBytes = new byte[16];
            Array.Copy(hash, guidBytes, 16);

            // Set version (5) and variant bits according to UUID v5 spec
            guidBytes[6] = (byte)((guidBytes[6] & 0x0F) | 0x50);
            guidBytes[8] = (byte)((guidBytes[8] & 0x3F) | 0x80);

            return new Guid(guidBytes);
        }
    }
}