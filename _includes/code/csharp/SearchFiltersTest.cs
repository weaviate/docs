using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;

public class SearchFilterTest : IAsyncLifetime
{
    private WeaviateClient client;

    public async Task InitializeAsync()
    {
        // START INSTANTIATION-COMMON
        // Best practice: store your credentials in environment variables
        var weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        var weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        var openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_APIKEY");

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
            filters: Filter.Property("round").Equal("Double Jeopardy!"),
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
            filters: Filter.Property("points").GreaterThan(200),
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
            filters: Filter.Property("answer").Like("*ala*"),
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
            filters: Filter.And(
                Filter.Property("round").Equal("Double Jeopardy!"),
                Filter.Property("points").LessThan(600),
                Filter.Not(Filter.Property("answer").Equal("Yucatan"))
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
            filters: Filter.Or(
                Filter.Property("points").GreaterThan(700), // gte/greaterThanOrEqual not always explicitly named in helpers, check impl
                Filter.Property("points").LessThan(500),
                Filter.Property("round").Equal("Double Jeopardy!")
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
            filters: Filter.And(
                Filter.Property("points").GreaterThan(300),
                Filter.Property("points").LessThan(700),
                Filter.Property("round").Equal("Double Jeopardy!")
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
            filters: Filter.And(
                Filter.Property("answer").Like("*bird*"),
                Filter.Or(
                    Filter.Property("points").GreaterThan(700),
                    Filter.Property("points").LessThan(300)
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

    // START CrossReference
    // Coming soon
    // END CrossReference

    [Fact]
    public async Task TestFilterById()
    {
        // START FilterById
        var collection = client.Collections.Use("Article");

        // NOTE: You would typically use a UUID known to exist in your data
        Guid targetId = Guid.Parse("00037775-1432-35e5-bc59-443baaef7d80");

        var response = await collection.Query.FetchObjects(
            filters: Filter.ID.Equal(targetId)
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(o.Properties)); // Inspect returned objects
            Console.WriteLine(o.ID);
        }
        // END FilterById
    }

    // START FilterByTimestamp
    // Coming soon
    // END FilterByTimestamp

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
            await client.Collections.Create(new CollectionConfig
            {
                Name = collectionName,
                Properties = [
                    Property.Text("title"),
                    Property.Date("some_date")
                ],
                VectorConfig = new VectorConfig("default", new Vectorizer.SelfProvided())
            });

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
                        objects.Add(new
                        {
                            title = $"Object: yr/month/day:{year}/{month}/{day}",
                            some_date = date
                        });
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
                filters: Filter.Property("some_date").GreaterThan(filterTime)
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
            filters: Filter.Property("answer").Length().GreaterThan(lengthThreshold)
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
            await localClient.Collections.Create(new CollectionConfig
            {
                Name = collectionName,
                Properties = [
                    Property.Text("title"),
                    Property.GeoCoordinate("headquartersGeoLocation")
                ]
            });

            var publications = localClient.Collections.Use(collectionName);
            await publications.Data.Insert(new
            {
                title = "Weaviate HQ",
                headquartersGeoLocation = new GeoCoordinate(52.3932696f, 4.8374263f)
            });

            // START FilterbyGeolocation
            var response = await publications.Query.FetchObjects(
                filters: Filter.Property("headquartersGeoLocation")
                    .WithinGeoRange(new GeoCoordinate(52.39f, 4.84f), 1000.0f) // In meters
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