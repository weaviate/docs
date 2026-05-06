using System;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

namespace WeaviateProject.Tests;

public class SearchProfileTest : IAsyncLifetime
{
    private const string COLLECTION = "Article";
    private WeaviateClient client = null!;

    public async Task InitializeAsync()
    {
        client = await Connect.Local();

        if (await client.Collections.Exists(COLLECTION))
            await client.Collections.Delete(COLLECTION);

        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = COLLECTION,
                Properties = [Property.Text("title")],
                VectorConfig = Configure.Vector("default", v => v.SelfProvided()),
            }
        );

        var articles = client.Collections.Use(COLLECTION);

        string[] titles =
        [
            "machine learning",
            "deep neural networks",
            "natural language processing",
            "computer vision",
            "reinforcement learning",
        ];

        for (int i = 0; i < titles.Length; i++)
        {
            float[] v = [0.1f * (i + 1), 0.2f * (i + 1), 0.3f * (i + 1)];
            await articles.Data.Insert(properties: new { title = titles[i] }, vectors: v);
        }

        // ASYNC_INDEXING is enabled on the test instance; the HNSW graph isn't
        // queryable immediately after insert, so the first near_vector call would
        // return zero results and the server would skip populating queryProfile.
        await Task.Delay(3000);
    }

    public async Task DisposeAsync()
    {
        if (client != null)
        {
            if (await client.Collections.Exists(COLLECTION))
                await client.Collections.Delete(COLLECTION);
            client.Dispose();
        }
    }

    [Fact]
    public async Task TestProfileNearVector()
    {
        // START ProfileNearVector
        var collection = client.Collections.Use(COLLECTION);

        var response = await collection.Query.NearVector(
            vectors: new float[] { 0.1f, 0.2f, 0.3f },
            limit: 5,
            returnMetadata: MetadataOptions.QueryProfile | MetadataOptions.Distance
        );

        if (response.QueryProfile != null)
        {
            foreach (var shard in response.QueryProfile.Shards)
            {
                Console.WriteLine($"Shard: {shard.Name} (node: {shard.Node})");
                foreach (var (searchType, profile) in shard.Searches)
                {
                    Console.WriteLine($"  [{searchType}]");
                    foreach (var (key, value) in profile.Details)
                    {
                        Console.WriteLine($"    {key}: {value}");
                    }
                }
            }
        }
        // END ProfileNearVector

        Assert.NotNull(response.QueryProfile);
        Assert.NotEmpty(response.QueryProfile.Shards);
    }

    [Fact]
    public async Task TestProfileBM25()
    {
        // START ProfileBM25
        var collection = client.Collections.Use(COLLECTION);

        var response = await collection.Query.BM25(
            query: "machine learning",
            returnMetadata: MetadataOptions.QueryProfile | MetadataOptions.Score
        );

        if (response.QueryProfile != null)
        {
            foreach (var shard in response.QueryProfile.Shards)
            {
                Console.WriteLine($"Shard: {shard.Name} (node: {shard.Node})");
                foreach (var (searchType, profile) in shard.Searches)
                {
                    Console.WriteLine($"  [{searchType}]");
                    foreach (var (key, value) in profile.Details)
                    {
                        Console.WriteLine($"    {key}: {value}");
                    }
                }
            }
        }
        // END ProfileBM25

        Assert.NotNull(response.QueryProfile);
    }

    [Fact]
    public async Task TestProfileHybrid()
    {
        // START ProfileHybrid
        var collection = client.Collections.Use(COLLECTION);

        var response = await collection.Query.Hybrid(
            query: "machine learning",
            vectors: new float[] { 0.1f, 0.2f, 0.3f },
            limit: 5,
            returnMetadata: MetadataOptions.QueryProfile
        );

        if (response.QueryProfile != null)
        {
            foreach (var shard in response.QueryProfile.Shards)
            {
                Console.WriteLine($"Shard: {shard.Name} (node: {shard.Node})");
                foreach (var (searchType, profile) in shard.Searches)
                {
                    Console.WriteLine($"  [{searchType}]");
                    foreach (var (key, value) in profile.Details)
                    {
                        Console.WriteLine($"    {key}: {value}");
                    }
                }
            }
        }
        // END ProfileHybrid

        Assert.NotNull(response.QueryProfile);
    }
}
