using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

public class SearchFilterTest : IAsyncLifetime
{
    private WeaviateClient client;

    public async Task InitializeAsync()
    {
        // START INSTANTIATION-COMMON
        // Best practice: store your credentials in environment variables
        var weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        var weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        var openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");

        // Fallback to local if env vars are not set (for local testing)
        if (string.IsNullOrEmpty(weaviateUrl))
        {
            client = await Connect.Local(
                headers: new Dictionary<string, string> { { "X-OpenAI-Api-Key", openaiApiKey } }
            );
        }
        else
        {
            client = await Connect.Cloud(
                weaviateUrl,
                weaviateApiKey,
                headers: new Dictionary<string, string> { { "X-OpenAI-Api-Key", openaiApiKey } }
            );
        }
        // END INSTANTIATION-COMMON
    }

    public Task DisposeAsync()
    {
        // The C# client manages connections automatically.
        return Task.CompletedTask;
    }

    [Fact]
    public async Task TestSingleFilter()
    {
        // START SingleFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            filters: Filter.Property("round").IsEqual("Double Jeopardy!"),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END SingleFilter

        Assert.NotEmpty(response.Objects);
    }

    [Fact]
    public async Task TestSingleFilterNearText()
    {
        // START NearTextSingleFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.NearText(
            "fashion icons",
            // highlight-start
            filters: Filter.Property("points").IsGreaterThan(200),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END NearTextSingleFilter

        Assert.NotEmpty(response.Objects);
    }

    [Fact]
    public async Task TestContainsAnyFilter()
    {
        // START ContainsAnyFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");

        // highlight-start
        string[] tokens = ["australia", "india"];
        // highlight-end

        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            // Find objects where the `answer` property contains any of the strings in `tokens`
            filters: Filter.Property("answer").ContainsAny(tokens),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END ContainsAnyFilter

        Assert.NotEmpty(response.Objects);
    }

    [Fact]
    public async Task TestContainsAllFilter()
    {
        // START ContainsAllFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");

        // highlight-start
        string[] tokens = ["blue", "red"];
        // highlight-end

        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            // Find objects where the `question` property contains all of the strings in `tokens`
            filters: Filter.Property("question").ContainsAll(tokens),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END ContainsAllFilter
    }

    [Fact]
    public async Task TestContainsNoneFilter()
    {
        // START ContainsNoneFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");

        // highlight-start
        string[] tokens = ["bird", "animal"];
        // highlight-end

        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            // Find objects where the `question` property contains none of the strings in `tokens`
            filters: Filter.Property("question").ContainsNone(tokens),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END ContainsNoneFilter
    }

    [Fact]
    public async Task TestLikeFilter()
    {
        // START LikeFilter
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            filters: Filter.Property("answer").IsLike("*ala*"),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END LikeFilter
    }

    [Fact]
    public async Task TestMultipleFiltersAnd()
    {
        // START MultipleFiltersAnd
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            // Combine filters with Filter.And(), Filter.Or(), and Filter.Not()
            filters: Filter.AllOf(
                Filter.Property("round").IsEqual("Double Jeopardy!"),
                Filter.Property("points").IsLessThan(600),
                Filter.Not(Filter.Property("answer").IsEqual("Yucatan"))
            ),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END MultipleFiltersAnd
    }

    [Fact]
    public async Task TestMultipleFiltersAnyOf()
    {
        // START MultipleFiltersAnyOf
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            filters: Filter.AnyOf(
                Filter.Property("points").IsGreaterThan(700), // gte/greaterThanOrEqual not always explicitly named in helpers, check impl
                Filter.Property("points").IsLessThan(500),
                Filter.Property("round").IsEqual("Double Jeopardy!")
            ),
            // highlight-end
            limit: 5
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END MultipleFiltersAnyOf
    }

    [Fact]
    public async Task TestMultipleFiltersAllOf()
    {
        // START MultipleFiltersAllOf
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            filters: Filter.AllOf(
                Filter.Property("points").IsGreaterThan(300),
                Filter.Property("points").IsLessThan(700),
                Filter.Property("round").IsEqual("Double Jeopardy!")
            ),
            // highlight-end
            limit: 5
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END MultipleFiltersAllOf
    }

    [Fact]
    public async Task TestMultipleFiltersNested()
    {
        // START MultipleFiltersNested
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            filters: Filter.AllOf(
                Filter.Property("answer").IsLike("*bird*"),
                Filter.AnyOf(
                    Filter.Property("points").IsGreaterThan(700),
                    Filter.Property("points").IsLessThan(300)
                )
            ),
            // highlight-end
            limit: 3
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));
        }
        // END MultipleFiltersNested
    }

    [Fact]
    public async Task TestCrossReferenceQuery()
    {
        // CrossReference
        var jeopardy = client.Collections.Use("JeopardyQuestion");

        var response = await jeopardy.Query.FetchObjects(
            // highlight-start
            // Filter by property on the referenced object
            filters: Filter.Reference("hasCategory").Property("title").IsLike("*TRANSPORTATION*"),
            // Retrieve the referenced object with specific properties
            returnReferences: [new QueryReference("hasCategory", fields: ["title"])],
            // highlight-end
            limit: 1
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties));

            // Access the referenced object's property
            if (o.References != null && o.References.ContainsKey("hasCategory"))
            {
                // Get the first referenced object
                var refObject = o.References["hasCategory"].First();
                // Access its 'title' property
                Console.WriteLine(refObject.Properties["title"]);
            }
        }
        // END CrossReference

        Assert.NotEmpty(response.Objects);
        // Verify that the filter worked (all returned objects should be linked to 'TRANSPORTATION')
        var firstRef = response.Objects.First().References["hasCategory"].First();
        Assert.Contains("TRANSPORTATION", firstRef.Properties["title"].ToString());
    }

    [Fact]
    public async Task TestFilterById()
    {
        // START FilterById
        var collection = client.Collections.Use("Article");

        Guid targetId = Guid.Parse("00037775-1432-35e5-bc59-443baaef7d80");

        var response = await collection.Query.FetchObjects(filters: Filter.UUID.IsEqual(targetId));

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties)); // Inspect returned objects
            Console.WriteLine(o.UUID);
        }
        // END FilterById
    }

    [Fact]
    public async Task TestFilterByTimestamp()
    {
        // START FilterByTimestamp
        // highlight-start
        // Set the timezone for avoidance of doubt
        DateTime filterTime = new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        // highlight-end

        var collection = client.Collections.Use("Article");

        var response = await collection.Query.FetchObjects(
            limit: 3,
            // highlight-start
            filters: Filter.CreationTime.IsGreaterThan(filterTime),
            returnMetadata: MetadataOptions.CreationTime
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties)); // Inspect returned objects
            Console.WriteLine(o.Metadata.CreationTime); // Inspect object creation time
        }
        // END FilterByTimestamp
    }

    [Fact]
    public async Task TestFilterByDateDatatype()
    {
        string collectionName = "CollectionWithDate";

        if (await client.Collections.Exists(collectionName))
        {
            await client.Collections.Delete(collectionName);
        }

        try
        {
            await client.Collections.Create(
                new CollectionCreateParams
                {
                    Name = collectionName,
                    Properties = [Property.Text("title"), Property.Date("some_date")],
                    // VectorConfig = new VectorConfig("default", new Vectorizer.SelfProvided())
                    VectorConfig = Configure.Vector("default", v => v.SelfProvided()),
                }
            );

            var collection = client.Collections.Use(collectionName);

            // 1. Create a list to hold objects
            var objects = new List<object>();

            // 2. Populate list
            for (int year = 2020; year <= 2024; year++)
            {
                for (int month = 1; month <= 12; month += 2)
                {
                    for (int day = 1; day <= 20; day += 5)
                    {
                        DateTime date = new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
                        objects.Add(
                            new
                            {
                                title = $"Object: yr/month/day:{year}/{month}/{day}",
                                some_date = date,
                            }
                        );
                    }
                }
            }

            // 3. Insert
            await collection.Data.InsertMany(objects.ToArray());
            Console.WriteLine($"Successfully inserted {objects.Count} objects.");

            // START FilterByDateDatatype
            // highlight-start
            // Use DateTime object for filter
            DateTime filterTime = new DateTime(2022, 6, 10, 0, 0, 0, DateTimeKind.Utc);
            // highlight-end

            var response = await collection.Query.FetchObjects(
                limit: 3,
                // highlight-start
                // This property (`some_date`) is a `DATE` datatype
                filters: Filter.Property("some_date").IsGreaterThan(filterTime)
            // highlight-end
            );

            foreach (var o in response.Objects)
            {
                Console.WriteLine(JsonSerializer.Serialize(o.Properties)); // Inspect returned objects
            }
            // END FilterByDateDatatype

            Assert.NotEmpty(response.Objects);
        }
        finally
        {
            await client.Collections.Delete(collectionName);
        }
    }

    [Fact]
    public async Task TestFilterByPropertyLength()
    {
        // START FilterByPropertyLength
        int lengthThreshold = 20;

        var collection = client.Collections.Use("JeopardyQuestion");
        var response = await collection.Query.FetchObjects(
            limit: 3,
            // highlight-start
            filters: Filter.Property("answer").HasLength().IsGreaterThan(lengthThreshold)
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties)); // Inspect returned objects
            Console.WriteLine(o.Properties["answer"].ToString().Length); // Inspect property length
        }
        // END FilterByPropertyLength
    }

    [Fact]
    public async Task TestFilterByPropertyNullState()
    {
        // START FilterByPropertyNullState
        var collection = client.Collections.Use("WineReview");
        var response = await collection.Query.FetchObjects(
            limit: 3,
            // highlight-start
            // This requires the `country` property to be configured with `indexNullState: true` in the schema
            filters: Filter.Property("country").IsNull() // Find objects where the `country` property is null
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties)); // Inspect returned objects
        }
        // END FilterByPropertyNullState
    }

    [Fact]
    public async Task TestFilterByGeolocation()
    {
        string collectionName = "Publication";
        var localClient = await Connect.Local(); // Create separate client connection for isolated setup if needed

        if (await localClient.Collections.Exists(collectionName))
        {
            await localClient.Collections.Delete(collectionName);
        }

        try
        {
            await localClient.Collections.Create(
                new CollectionCreateParams
                {
                    Name = collectionName,
                    Properties =
                    [
                        Property.Text("title"),
                        Property.GeoCoordinate("headquartersGeoLocation"),
                    ],
                }
            );

            var publications = localClient.Collections.Use(collectionName);
            await publications.Data.Insert(
                new
                {
                    title = "Weaviate HQ",
                    headquartersGeoLocation = new GeoCoordinate(52.3932696f, 4.8374263f),
                }
            );

            // START FilterbyGeolocation
            var response = await publications.Query.FetchObjects(
                filters: Filter
                    .Property("headquartersGeoLocation")
                    .IsWithinGeoRange(new GeoCoordinate(52.39f, 4.84f), 1000.0f) // In meters
            );

            foreach (var o in response.Objects)
            {
                Console.WriteLine(JsonSerializer.Serialize(o.Properties)); // Inspect returned objects
            }
            // END FilterbyGeolocation

            Assert.Single(response.Objects);
        }
        finally
        {
            if (await localClient.Collections.Exists(collectionName))
            {
                await localClient.Collections.Delete(collectionName);
            }
        }
    }
}
