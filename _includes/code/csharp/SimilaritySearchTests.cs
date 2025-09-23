using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.Linq;

public class SemanticSearchTests : IAsyncLifetime
{
    private WeaviateClient client;

    public Task InitializeAsync()
    {
        // ================================
        // ===== INSTANTIATION-COMMON =====
        // ================================

        // Best practice: store your credentials in environment variables
        var weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        var weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        var openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_APIKEY");
        var cohereApiKey = Environment.GetEnvironmentVariable("COHERE_APIKEY");

        client = Connect.Cloud(
            weaviateUrl,
            weaviateApiKey
            // additionalHeaders: new Dictionary<string, string>
            // {
            //     { "X-OpenAI-Api-Key", openaiApiKey },
            //     { "X-Cohere-Api-Key", cohereApiKey }
            // }
        );
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        // The C# client manages its connections automatically and does not require an explicit 'close' method.
        return Task.CompletedTask;
    }

    [Fact]
    public async Task NamedVectorNearText()
    {
        // ===============================================
        // ===== QUERY WITH TARGET VECTOR & nearText =====
        // ===============================================

        // NamedVectorNearText
        var reviews = client.Collections.Use("WineReviewNV");
        // TODO[g-despot] Why is groupBy necessary here?
        var response = await reviews.Query.NearText(
            "a sweet German white wine",
            limit: 2,
            // highlight-start
            targetVector: ["title_country"],  // Specify the target vector for named vector collections
                                              // highlight-end
            returnMetadata: MetadataOptions.Distance,
            groupBy: new GroupByRequest
            {
                PropertyName = "country",       // group by this property
                ObjectsPerGroup = 1,            // maximum objects per group
                NumberOfGroups = 2,             // maximum number of groups
            }
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END NamedVectorNearText

        Assert.Equal("WineReviewNV", response.Objects.First().Collection);
        Assert.Equal(2, response.Objects.Count());
        Assert.True(response.Objects.First().Properties.ContainsKey("title"));
        Assert.NotNull(response.Objects.First().Metadata.Distance);
    }

    [Fact]
    public async Task GetNearText()
    {
        // ===============================
        // ===== QUERY WITH nearText =====
        // ===============================

        // GetNearText
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // highlight-start
        var response = await jeopardy.Query.NearText(
            "animals in movies"
        // highlight-end
            ,
            limit: 2,
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END GetNearText

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Equal(2, response.Objects.Count());
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
        Assert.NotNull(response.Objects.First().Metadata.Distance);
    }

    [Fact]
    public async Task GetNearObject()
    {
        // =================================
        // ===== QUERY WITH nearObject =====
        // =================================
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var objects = await jeopardy.Query.FetchObjects(limit: 1);
        var uuid = objects.Objects.First().ID;

        // GetNearObject
        // highlight-start
        var response = await jeopardy.Query.NearObject(
            (Guid)uuid,  // A UUID of an object
        // highlight-end
            limit: 2,
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END GetNearObject

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Equal(2, response.Objects.Count());
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
        Assert.NotNull(response.Objects.First().Metadata.Distance);
    }

    [Fact]
    public async Task GetNearVector()
    {
        // =================================
        // ===== QUERY WITH nearVector =====
        // =================================

        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var objectWithVector = await jeopardy.Query.FetchObjects(limit: 1, returnMetadata: MetadataOptions.Vector);
        var queryVector = objectWithVector.Objects.First().Vectors["default"];

        // GetNearVector
        // highlight-start
        var response = await jeopardy.Query.NearVector(
            VectorData.Create("default", queryVector), // your query vector goes here
        // highlight-end
            limit: 2,
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END GetNearVector

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Equal(2, response.Objects.Count());
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
        Assert.NotNull(response.Objects.First().Metadata.Distance);
    }

    [Fact]
    public async Task GetWithDistance()
    {
        // ===============================
        // ===== QUERY WITH DISTANCE =====
        // ===============================

        // GetWithDistance
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            distance: 0.25f, // max accepted distance
                             // highlight-end
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END GetWithDistance

        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
        Assert.NotNull(response.Objects.First().Metadata.Distance);
        foreach (var o in response.Objects)
        {
            Assert.True(o.Metadata.Distance < 0.25f);
        }
    }

    [Fact]
    public async Task GetWithAutocut()
    {
        // ===============================
        // ===== Query with autocut =====
        // ===============================

        // START Autocut 
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            autoCut: 1, // number of close groups
                          // highlight-end
            returnMetadata: MetadataOptions.Distance,
            // TODO[g-despot]: Why is groupBy necessary here?
            groupBy: new GroupByRequest
            {
                PropertyName = "round",       // group by this property
                ObjectsPerGroup = 2,          // maximum objects per group
                NumberOfGroups = 2,           // maximum number of groups
            }
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END Autocut 

        Assert.True(response.Objects.Count() > 0);
        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
        Assert.NotNull(response.Objects.First().Metadata.Distance);
    }

    [Fact]
    public async Task GetWithGroupBy()
    {
        // ==============================
        // ===== QUERY WITH groupBy =====
        // ==============================

        // GetWithGroupby
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // highlight-start
        var groupBy = new GroupByRequest
        {
            PropertyName = "round",       // group by this property
            ObjectsPerGroup = 2,          // maximum objects per group
            NumberOfGroups = 2,           // maximum number of groups
        };

        var response = await jeopardy.Query.NearText(
            "animals in movies",   // find object based on this query
            limit: 10,                    // maximum total objects
            returnMetadata: MetadataOptions.Distance,
            groupBy: groupBy
        );
        // highlight-end

        foreach (var o in response.Objects)
        {
            Console.WriteLine(o.ID);
            Console.WriteLine(o.BelongsToGroup);
            Console.WriteLine(o.Metadata.Distance);
        }

        foreach (var grp in response.Groups.Values)
        {
            Console.WriteLine("==========" + grp.Name + "==========");
            Console.WriteLine(grp.Objects);
            foreach (var o in grp.Objects)
            {
                Console.WriteLine(JsonSerializer.Serialize(o.Properties));
                Console.WriteLine(JsonSerializer.Serialize(o.Metadata));
            }
        }
        // END GetWithGroupby

        Assert.True(response.Objects.Count() > 0);
        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
        Assert.NotNull(response.Objects.First().Metadata.Distance);
        Assert.True(response.Groups.Count > 0);
        Assert.True(response.Groups.Count <= 2);
    }

    [Fact]
    public async Task GetWithWhere()
    {
        // ============================
        // ===== QUERY WITH WHERE =====
        // ============================

        // GetWithWhere
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            // TODO[g-despot]: Uncomment when filters becomes available
            filter: Filter.Property("round").Equal("Double Jeopardy!"),
            // highlight-end
            limit: 2,
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END GetWithWhere

        Assert.True(response.Objects.Count() > 0);
        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Equal("Double Jeopardy!", response.Objects.First().Properties["round"].ToString());
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
        Assert.NotNull(response.Objects.First().Metadata.Distance);
    }
}