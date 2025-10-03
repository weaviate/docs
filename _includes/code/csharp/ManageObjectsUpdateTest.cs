using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace WeaviateProject.Tests;

public class ManageObjectsUpdateTest : IAsyncLifetime
{
    private static readonly WeaviateClient client;

    // Static constructor for one-time setup
    static ManageObjectsUpdateTest()
    {
        // START INSTANTIATION-COMMON
        // Note: The C# client doesn't support setting headers like 'X-OpenAI-Api-Key' via the constructor.
        // This must be configured in Weaviate's environment variables.
        client = new WeaviateClient(new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 });
        // END INSTANTIATION-COMMON
    }

    // Runs once before any tests in the class (like @BeforeAll)
    public async Task InitializeAsync()
    {
        // Simulate weaviate-datasets and set up collections
        if (await client.Collections.Exists("WineReviewNV"))
        {
            await client.Collections.Delete("WineReviewNV");
        }
        await client.Collections.Create(new Collection
        {
            Name = "WineReviewNV",
            Properties =
            [
                Property.Text("review_body", description: "Review body"),
                Property.Text("title", description: "Name of the wine"),
                Property.Text("country", description: "Originating country")
            ],
            VectorConfig = new[]
            {
                new VectorConfig("title", new Vectorizer.Text2VecContextionary()),
                new VectorConfig("review_body", new Vectorizer.Text2VecContextionary()),
                new VectorConfig(
                "title_country",
                new Vectorizer.Text2VecContextionary { SourceProperties = ["title", "country"] }
                )
            }
        });

        // highlight-start
        // ===== Add three mock objects to the WineReviewNV collection =====
        var reviews = client.Collections.Use<object>("WineReviewNV");
        await reviews.Data.InsertMany(new[]
        {
            new { title = "Mock Wine A", review_body = "A fine mock vintage.", country = "Mocktugal" },
            new { title = "Mock Wine B", review_body = "Notes of mockberry.", country = "Mockstralia" },
            new { title = "Mock Wine C", review_body = "Pairs well with mock turtle soup.", country = "Republic of Mockdova" }
        });
        // highlight-end

        // START Define the class
        if (await client.Collections.Exists("JeopardyQuestion"))
        {
            await client.Collections.Delete("JeopardyQuestion");
        }
        await client.Collections.Create(new Collection
        {
            Name = "JeopardyQuestion",
            Description = "A Jeopardy! question",
            Properties =
            [
                Property.Text("question", description: "The question"),
                Property.Text("answer", description: "The answer"),
                Property.Number("points", description: "The points the question is worth")
            ],
            VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecContextionary())
        });
        // END Define the class
    }

    // Runs once after all tests in the class (like @AfterAll)
    public async Task DisposeAsync()
    {
        await client.Collections.Delete("WineReviewNV");
        await client.Collections.Delete("JeopardyQuestion");
    }

    // START DelProps
    private static async Task DelProps(WeaviateClient client, Guid uuidToUpdate, string collectionName,
        IEnumerable<string> propNames)
    {
        var collection = client.Collections.Use<object>(collectionName);

        // fetch the object to update
        var objectData = await collection.Query.FetchObjectByID(uuidToUpdate);
        if (objectData?.Properties is not IDictionary<string, object> propertiesToUpdate)
        {
            return;
        }

        // remove unwanted properties
        foreach (var propName in propNames)
        {
            propertiesToUpdate.Remove(propName);
        }

        // replace the properties
        await collection.Data.Replace(uuidToUpdate, propertiesToUpdate);
    }
    // END DelProps

    [Fact]
    public async Task TestUpdateAndReplaceFlow()
    {
        var jeopardy = client.Collections.Use<object>("JeopardyQuestion");

        var uuid = await jeopardy.Data.Insert(new
        {
            question = "Test question",
            answer = "Test answer",
            points = -1
        });

        // START UpdateProps
        await jeopardy.Data.Replace(uuid,
        // highlight-start
         data: new { points = 100 }
        // highlight-end
        );
        // END UpdateProps

        var result1 = await jeopardy.Query.FetchObjectByID(uuid);
        Assert.NotNull(result1);
        var props1 = result1.Properties as IDictionary<string, object>;
        Assert.Equal(100d, props1["points"]);


        var vector = Enumerable.Repeat(0.12345f, 300).ToArray();

        // TODO[g-despot]  Not implemented
        // START UpdateVector        
        // Coming soon
        // END UpdateVector
        // await jeopardy.Data.Update(uuid,
        //     properties: new { points = 100 },
        //     // highlight-start
        //     vector: vector
        // // highlight-end
        // );

        // var result2 = await jeopardy.Query.FetchObjectByID(uuid, returnMetadata: MetadataOptions.Vector);
        // Assert.NotNull(result2);
        // Assert.Equal(300, result2.Vectors["default"].Dimensions);


        // TODO[g-despot]  Not implemented
        // START UpdateNamedVector
        // Coming soon
        // END UpdateNamedVector

        var reviews = client.Collections.Use<object>("WineReviewNV");
        var reviewResponse = await reviews.Query.FetchObjects(limit: 1);
        var reviewUuid = reviewResponse.Objects.First().ID.Value;

        var titleVector = Enumerable.Repeat(0.12345f, 300).ToArray();
        var reviewBodyVector = Enumerable.Repeat(0.23456f, 300).ToArray();
        var titleCountryVector = Enumerable.Repeat(0.34567f, 300).ToArray();

        // await reviews.Data.Update(reviewUuid,
        //     data: new
        //     {
        //         title = "A delicious wine",
        //         review_body = "This mystery wine is a delight to the senses.",
        //         country = "Mordor"
        //     },
        //     // highlight-start
        //     vectors: new Dictionary<string, float[]>
        //     {
        //         { "title", titleVector },
        //         { "review_body", reviewBodyVector },
        //         { "title_country", titleCountryVector }
        //     }
        //     // highlight-end
        // );


        // START Replace
        // highlight-start
        await jeopardy.Data.Replace(
            // highlight-end
            uuid,
            data: new { answer = "Replaced" }
        // The other properties will be deleted
        );
        // END Replace

        var result3 = await jeopardy.Query.FetchObjectByID(uuid);
        Assert.NotNull(result3);
        var props3 = result3.Properties as IDictionary<string, object>;
        Assert.Equal("Replaced", props3["answer"].ToString());
        Assert.DoesNotContain("question", props3.Keys);

        // START DelProps

        await DelProps(client, uuid, "JeopardyQuestion", new[] { "answer" });
        // END DelProps

        var result4 = await jeopardy.Query.FetchObjectByID(uuid);
        Assert.NotNull(result4);
        var props4 = result4.Properties as IDictionary<string, object>;
        Assert.False(props4.ContainsKey("answer"));
    }
}