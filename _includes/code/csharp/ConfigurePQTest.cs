using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.Net.Http;
using System.Linq;
using System.Text.Json.Serialization;

namespace WeaviateProject.Tests;

public class ConfigurePQTest : IAsyncLifetime
{
    private static WeaviateClient client;
    private static List<JsonElement> data;
    private const string COLLECTION_NAME = "Question";

    // Runs once before any tests in the class
    public async Task InitializeAsync()
    {
        // START DownloadData
        using var httpClient = new HttpClient();
        var responseBody = await httpClient.GetStringAsync(
            "https://raw.githubusercontent.com/weaviate-tutorials/intro-workshop/main/data/jeopardy_1k.json");

        data = JsonSerializer.Deserialize<List<JsonElement>>(responseBody);

        Console.WriteLine($"Data type: {data.GetType().Name}, Length: {data.Count}");
        Console.WriteLine(JsonSerializer.Serialize(data[1], new JsonSerializerOptions { WriteIndented = true }));
        // END DownloadData

        // START ConnectCode
        client = await Connect.Local();

        var meta = await client.GetMeta();
        Console.WriteLine($"Weaviate info: {meta.Version}");
        // END ConnectCode
    }

    // Runs once after all tests in the class
    public async Task DisposeAsync()
    {
        if (await client.Collections.Exists(COLLECTION_NAME))
        {
            await client.Collections.Delete(COLLECTION_NAME);
        }
    }

    // This helper runs before each test to ensure a clean collection state
    private async Task BeforeEach()
    {
        if (await client.Collections.Exists(COLLECTION_NAME))
        {
            await client.Collections.Delete(COLLECTION_NAME);
        }
    }

    [Fact]
    public async Task TestCollectionWithAutoPQ()
    {
        await BeforeEach();

        // START CollectionWithAutoPQ
        await client.Collections.Create(new CollectionConfig
        {
            Name = "Question",
            VectorConfig = Configure.Vectors.Text2VecTransformers().New(
                "default",
                new VectorIndex.HNSW
                {
                    // highlight-start
                    Quantizer = new VectorIndex.Quantizers.PQ
                    {
                        TrainingLimit = 50000, // Set the threshold to begin training
                        Encoder = new VectorIndex.Quantizers.PQ.EncoderConfig
                        {
                            Type = VectorIndex.Quantizers.EncoderType.Tile,
                            Distribution = VectorIndex.Quantizers.DistributionType.Normal,
                        },
                    }
                    // highlight-end
                }
            ),
            Properties =
            [
                Property.Text("question"),
                Property.Text("answer"),
                Property.Text("category")
            ]
        });
        // END CollectionWithAutoPQ

        // Confirm that the collection has been created with the right settings
        var collection = client.Collections.Use(COLLECTION_NAME);
        var config = await collection.Config.Get();
        Assert.NotNull(config);
        var hnswConfig = config.VectorConfig["default"].VectorIndexConfig as VectorIndex.HNSW;
        Assert.NotNull(hnswConfig?.Quantizer);
    }

    [Fact]
    public async Task TestUpdateSchemaWithPQ()
    {
        await BeforeEach();

        // START InitialSchema
        await client.Collections.Create(new CollectionConfig
        {
            Name = "Question",
            Description = "A Jeopardy! question",
            VectorConfig = Configure.Vectors.Text2VecTransformers().New("default"),
            Properties =
            [
                Property.Text("question"),
                Property.Text("answer"),
                Property.Text("category")
            ]
        });
        // END InitialSchema

        var collection = client.Collections.Use(COLLECTION_NAME);
        var initialConfig = await collection.Config.Get();
        Assert.NotNull(initialConfig);

        // START LoadData
        var objectList = data.Select(obj => new
        {
            question = obj.GetProperty("Question").GetString(),
            answer = obj.GetProperty("Answer").GetString()
        }).ToArray();

        await collection.Data.InsertMany(objectList);
        // END LoadData

        var aggregateResponse = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(1000, aggregateResponse.TotalCount);

        // START UpdateSchema
        await collection.Config.Update(c =>
        {
            var vectorConfig = c.VectorConfig["default"];
            vectorConfig.VectorIndexConfig.UpdateHNSW(h =>
                h.Quantizer = new VectorIndex.Quantizers.PQ
                {
                    TrainingLimit = 50000,
                    Encoder = new VectorIndex.Quantizers.PQ.EncoderConfig
                    {
                        Type = VectorIndex.Quantizers.EncoderType.Tile,
                        Distribution = VectorIndex.Quantizers.DistributionType.Normal,
                    },
                });
        });
        // END UpdateSchema

        var updatedConfig = await collection.Config.Get();
        Assert.NotNull(updatedConfig);
        var hnswConfig = updatedConfig.VectorConfig["default"].VectorIndexConfig as VectorIndex.HNSW;
        Assert.IsType<VectorIndex.Quantizers.PQ>(hnswConfig?.Quantizer);
    }

    [Fact]
    public async Task TestGetSchema()
    {
        await BeforeEach();

        // Create a collection with PQ enabled to inspect its schema
        await client.Collections.Create(new CollectionConfig
        {
            Name = "Question",
            VectorConfig = Configure.Vectors.Text2VecTransformers().New(
                "default",
                new VectorIndex.HNSW
                {
                    Quantizer = new VectorIndex.Quantizers.PQ
                    {
                        Encoder = new VectorIndex.Quantizers.PQ.EncoderConfig
                        {
                            Type = VectorIndex.Quantizers.EncoderType.Tile,
                            Distribution = VectorIndex.Quantizers.DistributionType.Normal,
                        },
                        TrainingLimit = 50000
                    }
                }
            ),
            Properties =
            [
                Property.Text("question"),
                Property.Text("answer"),
                Property.Text("category")
            ]
        });

        // START GetSchema
        var jeopardy = client.Collections.Use("Question");
        var config = await jeopardy.Config.Get();

        Console.WriteLine(JsonSerializer.Serialize(config, new JsonSerializerOptions { WriteIndented = true }));
        // END GetSchema
        Assert.NotNull(config);

        var hnswConfig = config.VectorConfig["default"].VectorIndexConfig as VectorIndex.HNSW;
        var pqConfig = hnswConfig?.Quantizer as VectorIndex.Quantizers.PQ;
        Assert.NotNull(pqConfig);

        // Print some of the config properties
        Console.WriteLine($"Training: {pqConfig.TrainingLimit}");
        Console.WriteLine($"Segments: {pqConfig.Segments}");
        Console.WriteLine($"Centroids: {pqConfig.Centroids}");
    }
}