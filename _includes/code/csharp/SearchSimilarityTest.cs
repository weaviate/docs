using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.Linq;

public class SearchSimilarityTest : IAsyncLifetime
{
    private WeaviateClient client;

    // InitializeAsync is used for asynchronous setup before tests in the class run.
    public async Task InitializeAsync()
    {
        // START INSTANTIATION-COMMON
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
        // END INSTANTIATION-COMMON
    }

    // DisposeAsync is used for asynchronous teardown after all tests in the class have run.
    public async Task DisposeAsync()
    {
        await client.Collections.DeleteAll();
        // The C# client, using HttpClient, manages its connections automatically and does not require an explicit 'close' method.
    }

    [Fact]
    public async Task NamedVectorNearText()
    {
        // START NamedVectorNearText
        var reviews = client.Collections.Use("WineReviewNV");
        var response = await reviews.Query.NearText(
            "a sweet German white wine",
            limit: 2,
            // highlight-start
            targetVector: ["title_country"],  // Specify the target vector for named vector collections
                                              // highlight-end
            returnMetadata: MetadataOptions.Distance
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
        // START GetNearText
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
        // highlight-start
            "animals in movies",
        // highlight-end
            limit: 2,
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END GetNearText
    }

    [Fact]
    public async Task GetNearObject()
    {
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var initialResponse = await jeopardy.Query.FetchObjects(limit: 1);
        if (!initialResponse.Objects.Any()) return; // Skip test if no data
        Guid uuid = (Guid)initialResponse.Objects.First().ID;

        // START GetNearObject
        // highlight-start
        var response = await jeopardy.Query.NearObject(
            uuid, // A UUID of an object
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
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var initialResponse = await jeopardy.Query.FetchObjects(limit: 1, returnMetadata: MetadataOptions.Vector);
        if (!initialResponse.Objects.Any()) return; // Skip test if no data
        var queryVector = initialResponse.Objects.First().Vectors["default"];

        // START GetNearVector
        // highlight-start
        var response = await jeopardy.Query.NearVector(
            queryVector, // your query vector goes here
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
    public async Task GetLimitOffset()
    {
        // START GetLimitOffset
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            limit: 2,   // return 2 objects
            offset: 1,  // With an offset of 1
                        // highlight-end
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END GetLimitOffset
    }

    [Fact]
    public async Task GetWithDistance()
    {
        // START GetWithDistance
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
        // START Autocut
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            autoCut: 1, // number of close groups
                        // highlight-end
            returnMetadata: MetadataOptions.Distance
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
        // START GetWithGroupby
        var jeopardy = client.Collections.Use("JeopardyQuestion");

        // highlight-start
        var response = await jeopardy.Query.NearText(
            "animals in movies",   // find object based on this query
            limit: 10,             // maximum total objects
            returnMetadata: MetadataOptions.Distance,
            groupBy: new GroupByRequest
            {
                PropertyName = "round",       // group by this property
                NumberOfGroups = 2,           // maximum number of groups
                ObjectsPerGroup = 2,          // maximum objects per group
            }
        );
        // highlight-end

        foreach (var o in response.Objects)
        {
            Console.WriteLine(o.ID);
            Console.WriteLine(o.BelongsToGroup);
            Console.WriteLine(o.Metadata.Distance);
        }

        foreach (var group in response.Groups.Values)
        {
            Console.WriteLine($"=========={group.Name}==========");
            Console.WriteLine(group.Objects.Count());
            foreach (var o in group.Objects)
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
        // START GetWithFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "animals in movies",
            // highlight-start
            filters: Filter.Property("round").Equal("Double Jeopardy!"),
            // highlight-end
            limit: 2,
            returnMetadata: MetadataOptions.Distance
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
            Console.WriteLine(o.Metadata.Distance);
        }
        // END GetWithFilter

        Assert.True(response.Objects.Count() > 0);
        Assert.Equal("JeopardyQuestion", response.Objects.First().Collection);
        Assert.Equal("Double Jeopardy!", response.Objects.First().Properties["round"].ToString());
        Assert.True(response.Objects.First().Properties.ContainsKey("question"));
        Assert.NotNull(response.Objects.First().Metadata.Distance);
    }
}