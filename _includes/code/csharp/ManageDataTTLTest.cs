using System;
using System.Threading;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

// Requires OBJECTS_TTL_DELETE_SCHEDULE set to a frequent interval (e.g. "*/10 * * * * *")
// and OBJECTS_TTL_ALLOW_SECONDS=true on the Weaviate instance.

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

    private async Task<long> WaitForCount(CollectionClient collection, long expectedCount, int timeoutMs = 70000, int pollIntervalMs = 5000)
    {
        var start = DateTime.UtcNow;
        while ((DateTime.UtcNow - start).TotalMilliseconds < timeoutMs)
        {
            var result = await collection.Aggregate.OverAll(totalCount: true);
            if (result.TotalCount == expectedCount) return result.TotalCount;
            await Task.Delay(pollIntervalMs);
        }
        var finalResult = await collection.Aggregate.OverAll(totalCount: true);
        return finalResult.TotalCount;
    }

    [Fact]
    public async Task TestTTLByCreationTime()
    {
        // START TTLByCreationTime
        var collection = await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = new[]
                {
                    new Property { Name = "referenceDate", DataType = DataType.Date },
                },
                ObjectTTLConfig = ObjectTTLConfig.ByCreationTime(
                    TimeSpan.FromHours(1),  // 1 hour
                    filterExpiredObjects: true  // Optional: automatically filter out expired objects from queries
                ),
            }
        );
        // END TTLByCreationTime

        // Verify creation time TTL config
        var config = await collection.Config.Get();
        Assert.NotNull(config.ObjectTTLConfig);
        Assert.True(config.ObjectTTLConfig.Enabled);
        Assert.Equal("_creationTimeUnix", config.ObjectTTLConfig.DeleteOn);
        Assert.Equal(3600, config.ObjectTTLConfig.DefaultTTL);
        Assert.True(config.ObjectTTLConfig.FilterExpiredObjects);

        // Add an object and verify it exists
        await collection.Data.Insert(new { referenceDate = DateTime.UtcNow.ToString("o") });
        var result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(1, result.TotalCount);

        // Verify deletion: recreate with minimum TTL (60s), insert, and wait for expiry
        await client.Collections.Delete("CollectionWithTTL");
        collection = await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = new[] { new Property { Name = "referenceDate", DataType = DataType.Date } },
                ObjectTTLConfig = ObjectTTLConfig.ByCreationTime(60),
            }
        );
        await collection.Data.Insert(new { referenceDate = DateTime.UtcNow.ToString("o") });
        result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(1, result.TotalCount);
        var count = await WaitForCount(collection, 0);
        Assert.Equal(0, count);
    }

    [Fact]
    public async Task TestTTLByUpdateTime()
    {
        // START TTLByUpdateTime
        var collection = await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = new[]
                {
                    new Property { Name = "referenceDate", DataType = DataType.Date },
                },
                ObjectTTLConfig = ObjectTTLConfig.ByUpdateTime(
                    TimeSpan.FromDays(10),  // 10 days
                    filterExpiredObjects: true  // Optional: automatically filter out expired objects from queries
                ),
            }
        );
        // END TTLByUpdateTime

        // Verify update time TTL config
        var config = await collection.Config.Get();
        Assert.NotNull(config.ObjectTTLConfig);
        Assert.True(config.ObjectTTLConfig.Enabled);
        Assert.Equal("_lastUpdateTimeUnix", config.ObjectTTLConfig.DeleteOn);
        Assert.Equal(864000, config.ObjectTTLConfig.DefaultTTL);
        Assert.True(config.ObjectTTLConfig.FilterExpiredObjects);

        // Add an object and verify it exists
        await collection.Data.Insert(new { referenceDate = DateTime.UtcNow.ToString("o") });
        var result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(1, result.TotalCount);

        // Verify deletion: recreate with minimum TTL (60s), insert, and wait for expiry
        await client.Collections.Delete("CollectionWithTTL");
        collection = await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = new[] { new Property { Name = "referenceDate", DataType = DataType.Date } },
                ObjectTTLConfig = ObjectTTLConfig.ByUpdateTime(60, filterExpiredObjects: true),
            }
        );
        await collection.Data.Insert(new { referenceDate = DateTime.UtcNow.ToString("o") });
        result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(1, result.TotalCount);
        var count = await WaitForCount(collection, 0);
        Assert.Equal(0, count);
    }

    [Fact]
    public async Task TestTTLByDateProperty()
    {
        // START TTLByDateProperty
        var collection = await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = new[]
                {
                    new Property { Name = "referenceDate", DataType = DataType.Date },
                },
                ObjectTTLConfig = ObjectTTLConfig.ByDateProperty(
                    "referenceDate",
                    TimeSpan.FromMinutes(5)  // 5 minutes offset
                ),
            }
        );
        // END TTLByDateProperty

        // Verify date property TTL config
        var config = await collection.Config.Get();
        Assert.NotNull(config.ObjectTTLConfig);
        Assert.True(config.ObjectTTLConfig.Enabled);
        Assert.Equal("referenceDate", config.ObjectTTLConfig.DeleteOn);
        Assert.Equal(300, config.ObjectTTLConfig.DefaultTTL);

        // Add an object with a future date and verify it exists
        var futureDate = DateTime.UtcNow.AddHours(1).ToString("o");
        await collection.Data.Insert(new { referenceDate = futureDate });
        var result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(1, result.TotalCount);

        // Verify deletion: recreate with ttl_offset=0, insert object expiring in 60s, and wait
        await client.Collections.Delete("CollectionWithTTL");
        collection = await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = new[] { new Property { Name = "expiresAt", DataType = DataType.Date } },
                ObjectTTLConfig = ObjectTTLConfig.ByDateProperty("expiresAt", 0, filterExpiredObjects: true),
            }
        );
        var expires = DateTime.UtcNow.AddSeconds(60).ToString("o");
        await collection.Data.Insert(new { expiresAt = expires });
        result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(1, result.TotalCount);
        var count = await WaitForCount(collection, 0);
        Assert.Equal(0, count);
    }
}
