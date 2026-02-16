using System;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

[Collection("Sequential")]
public class ManageDataTTLTest : IAsyncLifetime
{
    private static readonly WeaviateClient client;

    static ManageDataTTLTest()
    {
        client = Connect
            .Local(hostname: "localhost", restPort: 8080)
            .GetAwaiter()
            .GetResult();
    }

    public async Task InitializeAsync()
    {
        await client.Collections.Delete("CollectionWithTTL");
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }

    [Fact]
    public async Task TestTTLByCreationTime()
    {
        // START TTLByCreationTime
        var collection = await client.Collections.Create(
            "CollectionWithTTL",
            properties: new[]
            {
                new Property { Name = "referenceDate", DataType = DataType.Date },
            },
            objectTTLConfig: ObjectTTLConfig.ByCreationTime(
                TimeSpan.FromHours(1),  // 1 hour
                filterExpiredObjects: true  // Optional: automatically filter out expired objects from queries
            )
        );
        // END TTLByCreationTime
    }

    [Fact]
    public async Task TestTTLByUpdateTime()
    {
        // START TTLByUpdateTime
        var collection = await client.Collections.Create(
            "CollectionWithTTL",
            properties: new[]
            {
                new Property { Name = "referenceDate", DataType = DataType.Date },
            },
            objectTTLConfig: ObjectTTLConfig.ByUpdateTime(
                TimeSpan.FromDays(10),  // 10 days
                filterExpiredObjects: true  // Optional: automatically filter out expired objects from queries
            )
        );
        // END TTLByUpdateTime
    }

    [Fact]
    public async Task TestTTLByDateProperty()
    {
        // START TTLByDateProperty
        var collection = await client.Collections.Create(
            "CollectionWithTTL",
            properties: new[]
            {
                new Property { Name = "referenceDate", DataType = DataType.Date },
            },
            objectTTLConfig: ObjectTTLConfig.ByDateProperty(
                "referenceDate",
                TimeSpan.FromMinutes(5)  // 5 minutes offset
            )
        );
        // END TTLByDateProperty
    }
}
