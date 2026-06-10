using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

namespace WeaviateProject.Tests;

public class ConfigureRQTest : IAsyncLifetime
{
    private WeaviateClient client;
    private const string COLLECTION_NAME = "MyCollection";

    // Runs before each test
    public async Task InitializeAsync()
    {
        // START ConnectCode
        client = await Connect.Local();
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
    public async Task TestEnableRQ()
    {
        // START EnableRQ
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "MyCollection",
                Properties = [Property.Text("title")],
                VectorConfig = Configure.Vector(
                    "default",
                    v => v.Text2VecTransformers(),
                    index: new VectorIndex.HNSW
                    {
                        // highlight-start
                        Quantizer = new VectorIndex.Quantizers.RQ(),
                        // highlight-end
                    }
                ),
            }
        );
        // END EnableRQ
    }

    [Fact]
    public async Task Test1BitEnableRQ()
    {
        // START 1BitEnableRQ
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "MyCollection",
                Properties = [Property.Text("title")],
                VectorConfig = Configure.Vector(
                    "default",
                    v => v.Text2VecTransformers(),
                    index: new VectorIndex.HNSW
                    {
                        // highlight-start
                        Quantizer = new VectorIndex.Quantizers.RQ { Bits = 1 },
                        // highlight-end
                    }
                ),
            }
        );
        // END 1BitEnableRQ
    }

    [Fact]
    public async Task TestUncompressed()
    {
        // START Uncompressed
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "MyCollection",
                Properties = [Property.Text("title")],
                VectorConfig = Configure.Vector(
                    "default",
                    v => v.Text2VecTransformers(),
                    index: new VectorIndex.HNSW
                    {
                        // highlight-start
                        Quantizer = new VectorIndex.Quantizers.None { },
                        // highlight-end
                    }
                // highlight-end
                ),
            }
        );
        // END Uncompressed
    }

    [Fact]
    public async Task TestRQWithOptions()
    {
        // START RQWithOptions
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "MyCollection",
                Properties = [Property.Text("title")],
                VectorConfig = Configure.Vector(
                    "default",
                    v => v.Text2VecTransformers(),
                    index: new VectorIndex.HNSW
                    {
                        // highlight-start
                        Quantizer = new VectorIndex.Quantizers.RQ
                        {
                            Bits = 8, // Optional: Number of bits
                            RescoreLimit = 20, // Optional: Number of candidates to fetch before rescoring
                        },
                        // highlight-end
                    }
                ),
            }
        );
        // END RQWithOptions
    }

    [Fact]
    public async Task TestUpdateSchema()
    {
        // Note: Updating quantization settings on an existing collection is not supported by Weaviate
        // and will result in an error, as noted in the Java test. This test demonstrates the syntax for attempting the update.
        var collection = await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "MyCollection",
                Properties = [Property.Text("title")],
                VectorConfig = Configure.Vector("default", v => v.Text2VecTransformers()),
            }
        );

        // START UpdateSchema
        await collection.Config.Update(c =>
        {
            var vectorConfig = c.VectorConfig["default"];
            vectorConfig.VectorIndexConfig.UpdateHNSW(h =>
                h.Quantizer = new VectorIndex.Quantizers.RQ()
            );
        });
        // END UpdateSchema
    }

    [Fact]
    public async Task Test1BitUpdateSchema()
    {
        var collection = await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "MyCollection",
                Properties = [Property.Text("title")],
                VectorConfig = Configure.Vector("default", v => v.Text2VecTransformers()),
            }
        );

        // START 1BitUpdateSchema
        await collection.Config.Update(c =>
        {
            var vectorConfig = c.VectorConfig["default"];
            vectorConfig.VectorIndexConfig.UpdateHNSW(h =>
                h.Quantizer = new VectorIndex.Quantizers.RQ { Bits = 1 }
            );
        });
        // END 1BitUpdateSchema
    }
}
