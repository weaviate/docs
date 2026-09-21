using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;
using static Weaviate.Client.Models.VectorIndexConfig;

// Reference: Collection definition - the examples rendered on
// docs/weaviate/config-refs/collections.mdx. They mirror the Python examples
// in _includes/code/config-refs/reference.collections.py one-for-one.

// This attribute ensures that tests in this class do not run in parallel,
// which is important because they share a client and perform cleanup operations
// that could otherwise interfere with each other.
[Collection("Sequential")]
public class ReferenceCollectionsTest : IAsyncLifetime
{
    private static readonly WeaviateClient client;

    // Static constructor acts like JUnit's @BeforeAll
    static ReferenceCollectionsTest()
    {
        // Instantiate the client with the OpenAI API key
        string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrWhiteSpace(openaiApiKey))
        {
            throw new ArgumentException("Please set the OPENAI_API_KEY environment variable.");
        }

        var headers = new Dictionary<string, string> { { "X-OpenAI-Api-Key", openaiApiKey } };
        client = Connect
            .Local(hostname: "localhost", restPort: 8080, headers: headers)
            .GetAwaiter()
            .GetResult();
    }

    // InitializeAsync is called before each test. We ensure all collections are deleted.
    public async Task InitializeAsync()
    {
        await client.Collections.DeleteAll();
    }

    // DisposeAsync acts like JUnit's @AfterEach, cleaning up after every test.
    public Task DisposeAsync()
    {
        // No action needed here since cleanup happens in InitializeAsync before the next test.
        return Task.CompletedTask;
    }

    [Fact]
    public async Task TestReferenceFullDefinition()
    {
        // START ReferenceFullDefinition
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                Description = "A collection of articles",
                Properties = [Property.Text("title"), Property.Text("body")],
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector(
                        "default",
                        v => v.Text2VecTransformers(),
                        sourceProperties: ["title", "body"],
                        index: new VectorIndex.HNSW()
                        {
                            EfConstruction = 300,
                            Distance = VectorDistance.Cosine,
                            FilterStrategy = VectorIndexFilterStrategy.Sweeping,
                        }
                    ),
                },
                MultiTenancyConfig = new MultiTenancyConfig { Enabled = false },
                ShardingConfig = new ShardingConfig
                {
                    VirtualPerPhysical = 128,
                    DesiredCount = 1,
                    DesiredVirtualCount = 128,
                },
                ReplicationConfig = new ReplicationConfig
                {
                    Factor = 1,
                    DeletionStrategy = DeletionStrategy.TimeBasedResolution,
                },
            }
        );
        // END ReferenceFullDefinition

        var config = await client.Collections.Export("Article");
        Assert.Equal("A collection of articles", config.Description);
        Assert.Equal(2, config.Properties.Length);
        Assert.Equal(128, config.ShardingConfig.DesiredVirtualCount);
    }

    [Fact]
    public async Task TestReferenceVectorizer()
    {
        // START ReferenceVectorizer
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                // highlight-start
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector(
                        "default", // (Optional) Set the name of the vector, default name is "default"
                        v => v.Text2VecTransformers(vectorizeCollectionName: true),
                        sourceProperties: ["title", "body"], // (Optional) Set the source property(ies)
                        index: new VectorIndex.HNSW() // (Optional) Set vector index options
                        {
                            EfConstruction = 300,
                            Distance = VectorDistance.Cosine,
                            FilterStrategy = VectorIndexFilterStrategy.Sweeping,
                        }
                    ),
                },
                // highlight-end
                // properties configuration is optional
                Properties = [Property.Text("title"), Property.Text("body")],
            }
        );
        // END ReferenceVectorizer

        var config = await client.Collections.Export("Article");
        Assert.True(config.VectorConfig.ContainsKey("default"));
    }

    [Fact]
    public async Task TestReferenceNamedVectors()
    {
        // START ReferenceNamedVectors
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                // highlight-start
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector(
                        "default",
                        v => v.Text2VecTransformers(vectorizeCollectionName: true),
                        sourceProperties: ["title", "body"],
                        index: new VectorIndex.HNSW()
                        {
                            EfConstruction = 300,
                            Distance = VectorDistance.Cosine,
                            FilterStrategy = VectorIndexFilterStrategy.Sweeping,
                        }
                    ),
                    Configure.Vector(
                        "body_vectors",
                        v => v.Text2VecTransformers(),
                        sourceProperties: ["body"],
                        index: new VectorIndex.Flat()
                    ),
                },
                // highlight-end
                // properties configuration is optional
                Properties = [Property.Text("title"), Property.Text("body")],
            }
        );
        // END ReferenceNamedVectors

        var config = await client.Collections.Export("Article");
        Assert.Equal(2, config.VectorConfig.Count);
        Assert.Contains("default", config.VectorConfig.Keys);
        Assert.Contains("body_vectors", config.VectorConfig.Keys);
    }

    [Fact]
    public async Task TestReferencePropertyOptions()
    {
        // START ReferencePropertyOptions
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector("default", v => v.Text2VecTransformers()),
                },
                // highlight-start
                Properties =
                [
                    Property.Text(
                        "title",
                        description: "The article headline",
                        tokenization: PropertyTokenization.Word // How the text is split for the inverted index
                    ),
                    Property.Text("description", indexSearchable: false), // Exclude it from keyword search
                    Property.Number("rating", indexRangeFilters: true), // Index for range-based filtering
                ],
                // highlight-end
            }
        );
        // END ReferencePropertyOptions

        var config = await client.Collections.Export("Article");
        Assert.Equal(3, config.Properties.Length);
    }

    [Fact]
    public async Task TestReferenceReplicationSettings()
    {
        // START ReferenceReplicationSettings
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                // highlight-start
                ReplicationConfig = new ReplicationConfig
                {
                    Factor = 1,
                    DeletionStrategy = DeletionStrategy.TimeBasedResolution,
                    AsyncEnabled = true,
                    AsyncConfig = new ReplicationAsyncConfig
                    {
                        HashtreeHeight = 16,
                        Frequency = 30,
                    },
                },
                // highlight-end
            }
        );
        // END ReferenceReplicationSettings

        var config = await client.Collections.Export("Article");
        Assert.Equal(
            DeletionStrategy.TimeBasedResolution,
            config.ReplicationConfig.DeletionStrategy
        );
    }
}
