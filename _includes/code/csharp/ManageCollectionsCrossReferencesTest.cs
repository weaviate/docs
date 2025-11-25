using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace WeaviateProject.Tests;

public class ManageCollectionsCrossReferencesTest : IAsyncLifetime
{
    private WeaviateClient client;

    // Runs before each test
    public Task InitializeAsync()
    {
        // Note: The C# client doesn't support setting headers like 'X-OpenAI-Api-Key' via the constructor for local connections.
        // This must be configured in Weaviate's environment variables.
        client = new WeaviateClient(new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 });
        return Task.CompletedTask;
    }

    // Runs after each test
    public async Task DisposeAsync()
    {
        // Clean up collections after each test
        await client.Collections.Delete("JeopardyQuestion");
        await client.Collections.Delete("JeopardyCategory");
    }

    [Fact]
    public async Task TestCrossRefDefinition()
    {
        // START CrossRefDefinition
        await client.Collections.Create(new CollectionConfig
        {
            Name = "JeopardyCategory",
            Description = "A Jeopardy! category",
            Properties = [Property.Text("title")]
        });

        await client.Collections.Create(new CollectionConfig
        {
            Name = "JeopardyQuestion",
            Description = "A Jeopardy! question",
            Properties = [Property.Text("question"), Property.Text("answer")],
            // highlight-start
            References = [new Reference("hasCategory", "JeopardyCategory")]
            // highlight-end
        });
        // END CrossRefDefinition

        // Verify collections were created properly
        var questionConfig = await client.Collections.Export("JeopardyQuestion");
        Assert.Single(questionConfig.References);
        Assert.Equal("hasCategory", questionConfig.References.First().Name);
    }

    [Fact]
    public async Task TestObjectWithCrossRef()
    {
        await SetupCollections();
        var categories = client.Collections.Use<object>("JeopardyCategory");
        var categoryUuid = await categories.Data.Insert(new { title = "Weaviate" });
        var properties = new { question = "What tooling helps make Weaviate scalable?", answer = "Sharding, multi-tenancy, and replication" };

        // START ObjectWithCrossRef
        var questions = client.Collections.Use<object>("JeopardyQuestion");

        var newObject = await questions.Data.Insert(
            properties, // The properties of the object
                        // highlight-start
            references: [new ObjectReference("hasCategory", categoryUuid)]
        // highlight-end
        );
        // END ObjectWithCrossRef

        // Test results
        var fetchedObj = await questions.Query.FetchObjectByID(newObject, returnReferences: [new QueryReference("hasCategory")]);
        Assert.NotNull(fetchedObj);
        Assert.True(fetchedObj.References.ContainsKey("hasCategory"));
    }

    [Fact]
    public async Task TestOneWay()
    {
        await SetupCollections();
        var questions = client.Collections.Use<object>("JeopardyQuestion");
        var categories = client.Collections.Use<object>("JeopardyCategory");

        var questionObjId = await questions.Data.Insert(new { question = "This city is known for the Golden Gate Bridge", answer = "San Francisco" });
        var categoryObjId = await categories.Data.Insert(new { title = "U.S. CITIES" });

        // START OneWayCrossReferences
        await questions.Data.ReferenceAdd(
            from: questionObjId,
            fromProperty: "hasCategory",
            // highlight-start
            to: categoryObjId
        // highlight-end
        );
        // END OneWayCrossReferences

        var result = await questions.Query.FetchObjectByID(questionObjId, returnReferences: [new QueryReference("hasCategory")]);
        Assert.NotNull(result);
        Assert.True(result.References.ContainsKey("hasCategory"));
    }

    [Fact]
    public async Task TestTwoWay()
    {
        // START TwoWayCategory1CrossReferences
        await client.Collections.Create(new CollectionConfig
        {
            Name = "JeopardyCategory",
            Description = "A Jeopardy! category",
            Properties = [Property.Text("title")]
        });
        // END TwoWayCategory1CrossReferences

        // START TwoWayQuestionCrossReferences
        await client.Collections.Create(new CollectionConfig
        {
            Name = "JeopardyQuestion",
            Description = "A Jeopardy! question",
            Properties = [Property.Text("question"), Property.Text("answer")],
            // highlight-start
            References = [new Reference("hasCategory", "JeopardyCategory")]
            // highlight-end
        });
        // END TwoWayQuestionCrossReferences

        // START TwoWayCategoryCrossReferences
        var category = client.Collections.Use("JeopardyCategory");
        await category.Config.AddProperty(
            // highlight-start
            Property.Reference("hasQuestion", "JeopardyQuestion")
        // highlight-end
        );
        // END TwoWayCategoryCrossReferences

        var questions = client.Collections.Use<object>("JeopardyQuestion");
        var categories = client.Collections.Use("JeopardyCategory");

        var questionObjId = await questions.Data.Insert(new { question = "This city is known for the Golden Gate Bridge", answer = "San Francisco" });
        var categoryObjId = await categories.Data.Insert(new { title = "U.S. CITIES" });

        // START TwoWayCrossReferences
        // For the "San Francisco" JeopardyQuestion object, add a cross-reference to the "U.S. CITIES" JeopardyCategory object
        // highlight-start
        await questions.Data.ReferenceAdd(from: questionObjId, fromProperty: "hasCategory", to: categoryObjId);
        // highlight-end

        // For the "U.S. CITIES" JeopardyCategory object, add a cross-reference to "San Francisco"
        // highlight-start
        await categories.Data.ReferenceAdd(from: categoryObjId, fromProperty: "hasQuestion", to: questionObjId);
        // highlight-end
        // END TwoWayCrossReferences

        var result = await categories.Query.FetchObjectByID(categoryObjId, returnReferences: [new QueryReference("hasQuestion")]);
        Assert.NotNull(result);
        Assert.True(result.References.ContainsKey("hasQuestion"));
    }

    [Fact]
    public async Task TestMultiple()
    {
        await SetupCollections();
        var questions = client.Collections.Use<object>("JeopardyQuestion");
        var categories = client.Collections.Use<object>("JeopardyCategory");

        var questionObjId = await questions.Data.Insert(new { question = "This city is known for the Golden Gate Bridge", answer = "San Francisco" });
        var categoryObjId = await categories.Data.Insert(new { title = "U.S. CITIES" });
        var categoryObjIdAlt = await categories.Data.Insert(new { title = "MUSEUMS" });

        // START MultipleCrossReferences
        // highlight-start
        // Add multiple references - need to add them individually
        foreach (var tempUuid in new[] { categoryObjId, categoryObjIdAlt })
        {
            await questions.Data.ReferenceAdd(
                from: questionObjId,
                fromProperty: "hasCategory",
                to: tempUuid
            );
        }
        // highlight-end
        // END MultipleCrossReferences

        var result = await questions.Query.FetchObjectByID(questionObjId, returnReferences: [new QueryReference("hasCategory")]);
        Assert.NotNull(result);
        Assert.True(result.References.ContainsKey("hasCategory"));
        Assert.Equal(2, result.References["hasCategory"].Count);
    }

    [Fact]
    public async Task TestReadCrossRef()
    {
        await SetupCollections();
        var questions = client.Collections.Use<object>("JeopardyQuestion");
        var categories = client.Collections.Use<object>("JeopardyCategory");

        var categoryResult = await categories.Data.Insert(new { title = "SCIENCE" });
        var questionObjId = await questions.Data.Insert(
            new { question = "What is H2O?", answer = "Water" },
            references: [new ObjectReference("hasCategory", categoryResult)]
        );

        // START ReadCrossRef
        // Include the cross-references in a query response
        // highlight-start
        var response = await questions.Query.FetchObjects( // Or `Hybrid`, `NearText`, etc.
            limit: 2,
            returnReferences: [new QueryReference("hasCategory", fields: ["title"])]
        );
        // highlight-end

        // Or include cross-references in a single-object retrieval
        // highlight-start
        var obj = await questions.Query.FetchObjectByID(
            questionObjId,
            returnReferences: [new QueryReference("hasCategory", fields: ["title"])]
        );
        // highlight-end
        // END ReadCrossRef

        Assert.NotEmpty(response.Objects);
        Assert.NotNull(obj);
        Assert.True(obj.References.ContainsKey("hasCategory"));
    }

    [Fact]
    public async Task TestDelete()
    {
        await SetupCollections();
        var questions = client.Collections.Use<object>("JeopardyQuestion");
        var categories = client.Collections.Use<object>("JeopardyCategory");

        var categoryObjId = await categories.Data.Insert(new { title = "MUSEUMS" });
        var questionObjId = await questions.Data.Insert(
            new { question = "This city is known for the Golden Gate Bridge", answer = "San Francisco" },
            references: [new ObjectReference("hasCategory", categoryObjId)]
        );

        // START DeleteCrossReference
        // From the "San Francisco" JeopardyQuestion object, delete the "MUSEUMS" category cross-reference
        // highlight-start
        await questions.Data.ReferenceDelete(
            // highlight-end
            from: questionObjId,
            fromProperty: "hasCategory",
            to: categoryObjId
        );
        // END DeleteCrossReference

        var result = await questions.Query.FetchObjectByID(questionObjId, returnReferences: [new QueryReference("hasCategory")]);
        Assert.NotNull(result);

        // FIX: Check if the reference list is empty OR if the key is missing
        if (result.References.ContainsKey("hasCategory"))
        {
            Assert.Empty(result.References["hasCategory"]);
        }
    }

    [Fact]
    public async Task TestUpdate()
    {
        await SetupCollections();
        var questions = client.Collections.Use<object>("JeopardyQuestion");
        var categories = client.Collections.Use<object>("JeopardyCategory");

        var categoryObjId = await categories.Data.Insert(new { title = "MUSEUMS" });
        await categories.Data.Insert(new { title = "U.S. CITIES" });
        var questionObjId = await questions.Data.Insert(new { question = "This city is known for the Golden Gate Bridge", answer = "San Francisco" });

        // START UpdateCrossReference
        // In the "San Francisco" JeopardyQuestion object, set the "hasCategory" cross-reference only to "MUSEUMS"
        // highlight-start
        await questions.Data.ReferenceReplace(
            // highlight-end
            from: questionObjId,
            fromProperty: "hasCategory",
            to: [categoryObjId]
        );
        // END UpdateCrossReference

        var result = await questions.Query.FetchObjectByID(questionObjId, returnReferences: [new QueryReference("hasCategory")]);
        Assert.NotNull(result);
        Assert.True(result.References.ContainsKey("hasCategory"));
        Assert.Single(result.References["hasCategory"]);
        Assert.Equal(categoryObjId, result.References["hasCategory"][0].ID);
    }

    // Helper method to set up collections
    private async Task SetupCollections()
    {
        await client.Collections.Create(new CollectionConfig
        {
            Name = "JeopardyCategory",
            Description = "A Jeopardy! category",
            Properties = [Property.Text("title")]
        });

        await client.Collections.Create(new CollectionConfig
        {
            Name = "JeopardyQuestion",
            Description = "A Jeopardy! question",
            Properties = [Property.Text("question"), Property.Text("answer")],
            References = [new Reference("hasCategory", "JeopardyCategory")]
        });
    }
}