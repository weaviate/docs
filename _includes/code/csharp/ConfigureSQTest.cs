using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;

namespace WeaviateProject.Tests;

public class ConfigureSQTest : IAsyncLifetime
{
    private WeaviateClient client;
    private const string COLLECTION_NAME = "MyCollection";

    // Runs before each test
    public async Task InitializeAsync()
    {
        // START ConnectCode
        // Note: The C# client doesn't support setting headers like 'X-OpenAI-Api-Key' via the constructor for local connections.
        // This must be configured in Weaviate's environment variables.
        client = new WeaviateClient(new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 });
        // END ConnectCode

        // Clean slate for each test
        if (await client.Collections.Exists(COLLECTION_NAME))
        {
            await client.Collections.Delete(COLLECTION_NAME);
        }
    }

    // Runs after each test
    public Task DisposeAsync()
    {
        // No action needed here, as cleanup happens in InitializeAsync before the next test.
        return Task.CompletedTask;
    }

    [Fact]
    public async Task TestEnableSQ()
    {
        // START EnableSQ
        await client.Collections.Create(new Collection
        {
            Name = "MyCollection",
            Properties = [Property.Text("title")],
            VectorConfig = new VectorConfig(
                "default",
                new Vectorizer.Text2VecContextionary(),
                new VectorIndex.HNSW
                {
                    // highlight-start
                    Quantizer = new VectorIndex.Quantizers.SQ()
                    // highlight-end
                }
            )
        });
        // END EnableSQ
    }

    [Fact]
    public async Task TestUpdateSchema()
    {
        // Note: Updating quantization settings on an existing collection is not supported by Weaviate
        // and will result in an error, as noted in the Java test. This test demonstrates the syntax for attempting the update.
        var collection = await client.Collections.Create(new Collection
        {
            Name = "MyCollection",
            Properties = [Property.Text("title")],
            VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecContextionary())
        });

        // START UpdateSchema
        await collection.Config.Update(c =>
        {
            var vectorConfig = c.VectorConfig["default"];
            vectorConfig.VectorIndexConfig.UpdateHNSW(h => h.Quantizer = new VectorIndex.Quantizers.SQ());
        });
        // END UpdateSchema
    }

    // TODO[g-despot] Missing cache
    [Fact]
    public async Task TestSQWithOptions()
    {
        // START SQWithOptions
        await client.Collections.Create(new Collection
        {
            Name = "MyCollection",
            Properties = [Property.Text("title")],
            VectorConfig = new VectorConfig(
                "default",
                new Vectorizer.Text2VecContextionary(),
                // highlight-start
                new VectorIndex.HNSW
                {
                    VectorCacheMaxObjects = 100000,
                    Quantizer = new VectorIndex.Quantizers.SQ
                    {
                        //Cache = true,
                        TrainingLimit = 50000,
                        RescoreLimit = 200
                    }
                }
                // highlight-end
            )
        });
        // END SQWithOptions
    }
}