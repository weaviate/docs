using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;

namespace WeaviateProject.Tests;

public class ConfigureBQTest : IAsyncLifetime
{
    private WeaviateClient client;
    private const string COLLECTION_NAME = "MyCollection";

    // Runs before each test
    public async Task InitializeAsync()
    {
        // START ConnectCode
        client = await Connect.Local();
        // END ConnectCode
    }

    // Runs after each test
    public Task DisposeAsync()
    {
        // No action needed here, as cleanup happens in InitializeAsync before the next test.
        return Task.CompletedTask;
    }

    [Fact]
    public async Task TestEnableBQ()
    {
        await client.Collections.Delete(COLLECTION_NAME);
        // START EnableBQ
        await client.Collections.Create(new CollectionConfig
        {
            Name = "MyCollection",
            Properties = [Property.Text("title")],
            VectorConfig = Configure.Vectors.Text2VecTransformers().New(
                "default",
                new VectorIndex.HNSW
                {
                    // highlight-start
                    Quantizer = new VectorIndex.Quantizers.BQ()
                    // highlight-end
                }
            )
        });
        // END EnableBQ
    }

    [Fact]
    public async Task TestUpdateSchema()
    {
        await client.Collections.Delete(COLLECTION_NAME);
        // Note: Updating quantization settings on an existing collection is not supported by Weaviate
        // and will result in an error, as noted in the Java test. This test demonstrates the syntax for attempting the update.
        var collection = await client.Collections.Create(new CollectionConfig
        {
            Name = "MyCollection",
            Properties = [Property.Text("title")],
            VectorConfig = Configure.Vectors.Text2VecTransformers().New("default")
        });

        // START UpdateSchema
        await collection.Config.Update(c =>
        {
            var vectorConfig = c.VectorConfig["default"];
            vectorConfig.VectorIndexConfig.UpdateHNSW(h => h.Quantizer = new VectorIndex.Quantizers.BQ());
        });
        // END UpdateSchema
    }

    [Fact]
    public async Task TestBQWithOptions()
    {
        await client.Collections.Delete(COLLECTION_NAME);
        // START BQWithOptions
        await client.Collections.Create(new CollectionConfig
        {
            Name = "MyCollection",
            Properties = [Property.Text("title")],
            VectorConfig = Configure.Vectors.Text2VecTransformers().New(
                "default",
                // highlight-start
                new VectorIndex.HNSW
                {
                    VectorCacheMaxObjects = 100000,
                    Quantizer = new VectorIndex.Quantizers.BQ
                    {
                        Cache = true,
                        RescoreLimit = 200
                    }
                }
                // highlight-end
            )
        });
        // END BQWithOptions
    }
}