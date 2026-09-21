using System;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

namespace WeaviateProject.Tests;

// Requires OBJECTS_TTL_DELETE_SCHEDULE set to a frequent interval (e.g. "*/10 * * * * *")
// and OBJECTS_TTL_ALLOW_SECONDS=true on the Weaviate instance.

[Collection("Sequential")]
public class ManageDataTTLTest : IAsyncLifetime
{
    private WeaviateClient client = null!;

    public async Task InitializeAsync()
    {
        client = await Connect.Local();
        await DeleteTTLCollection();
    }

    public async Task DisposeAsync()
    {
        if (client != null)
        {
            await DeleteTTLCollection();
            client.Dispose();
        }
    }

    private async Task DeleteTTLCollection()
    {
        if (await client.Collections.Exists("CollectionWithTTL"))
            await client.Collections.Delete("CollectionWithTTL");
    }

    private static async Task<long> WaitForCount(
        CollectionClient collection,
        long expectedCount,
        int timeoutMs = 70000,
        int pollIntervalMs = 5000
    )
    {
        var start = DateTime.UtcNow;
        while ((DateTime.UtcNow - start).TotalMilliseconds < timeoutMs)
        {
            var result = await collection.Aggregate.OverAll(totalCount: true);
            if (result.TotalCount == expectedCount)
                return result.TotalCount;
            await Task.Delay(pollIntervalMs);
        }
        var finalResult = await collection.Aggregate.OverAll(totalCount: true);
        return finalResult.TotalCount;
    }

    [Fact]
    public async Task TestTTLByCreationTime()
    {
        // START TTLByCreationTime
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = [Property.Date("referenceDate")],
                ObjectTTLConfig = ObjectTTLConfig.ByCreationTime(
                    TimeSpan.FromHours(1), // 1 hour
                    filterExpiredObjects: true // Optional: automatically filter out expired objects from queries
                ),
            }
        );
        // END TTLByCreationTime

        // Verify creation time TTL config
        var collection = client.Collections.Use("CollectionWithTTL");
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
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = [Property.Date("referenceDate")],
                ObjectTTLConfig = ObjectTTLConfig.ByCreationTime(60),
            }
        );
        collection = client.Collections.Use("CollectionWithTTL");
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
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = [Property.Date("referenceDate")],
                ObjectTTLConfig = ObjectTTLConfig.ByUpdateTime(
                    TimeSpan.FromDays(10), // 10 days
                    filterExpiredObjects: true // Optional: automatically filter out expired objects from queries
                ),
            }
        );
        // END TTLByUpdateTime

        // Verify update time TTL config
        var collection = client.Collections.Use("CollectionWithTTL");
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
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = [Property.Date("referenceDate")],
                ObjectTTLConfig = ObjectTTLConfig.ByUpdateTime(60, filterExpiredObjects: true),
            }
        );
        collection = client.Collections.Use("CollectionWithTTL");
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
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = [Property.Date("referenceDate")],
                ObjectTTLConfig = ObjectTTLConfig.ByDateProperty(
                    "referenceDate",
                    TimeSpan.FromMinutes(5) // 5 minutes offset
                ),
            }
        );
        // END TTLByDateProperty

        // Verify date property TTL config
        var collection = client.Collections.Use("CollectionWithTTL");
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
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "CollectionWithTTL",
                Properties = [Property.Date("expiresAt")],
                ObjectTTLConfig = ObjectTTLConfig.ByDateProperty(
                    "expiresAt",
                    0,
                    filterExpiredObjects: true
                ),
            }
        );
        collection = client.Collections.Use("CollectionWithTTL");
        var expires = DateTime.UtcNow.AddSeconds(60).ToString("o");
        await collection.Data.Insert(new { expiresAt = expires });
        result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(1, result.TotalCount);
        var count = await WaitForCount(collection, 0);
        Assert.Equal(0, count);
    }
}
