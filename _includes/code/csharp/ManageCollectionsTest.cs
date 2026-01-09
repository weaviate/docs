using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;
using static Weaviate.Client.Models.VectorIndexConfig;

// This attribute ensures that tests in this class do not run in parallel,
// which is important because they share a client and perform cleanup operations
// that could otherwise interfere with each other.
[Collection("Sequential")]
public class ManageCollectionsTest : IAsyncLifetime
{
    private static readonly WeaviateClient client;

    // Static constructor acts like JUnit's @BeforeAll
    static ManageCollectionsTest()
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
    public async Task TestBasicCreateCollection()
    {
        // START BasicCreateCollection
        await client.Collections.Create(new CollectionCreateParams { Name = "Article" });
        // END BasicCreateCollection

        // START CheckIfExists
        bool exists = await client.Collections.Exists("Article");
        // END CheckIfExists
        Assert.True(exists);
    }

    [Fact]
    public async Task TestCreateCollectionWithProperties()
    {
        // START CreateCollectionWithProperties
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                Properties = [Property.Text("title"), Property.Text("body")],
            }
        );
        // END CreateCollectionWithProperties

        var config = await client.Collections.Export("Article");
        Assert.Equal(2, config.Properties.Length);
    }

    public class Article
    {
        public string Title { get; set; }
        public string Body { get; set; }
    }

    [Fact]
    public async Task TestCreateCollectionWithPropertiesFromClass()
    {
        // START CreateCollectionWithClassProperties
        // public class Article
        // {
        //     public string Title { get; set; }
        //     public string Body { get; set; }
        // }

        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                Properties = [.. Property.FromClass<Article>()],
            }
        );
        // END CreateCollectionWithClassProperties

        var config = await client.Collections.Export("Article");
        Assert.Equal(2, config.Properties.Length);
    }

    [Fact]
    public async Task TestAddProperties()
    {
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                Properties = [Property.Text("title"), Property.Text("body")],
            }
        );

        // START AddProperty
        CollectionClient articles = client.Collections.Use("Article");
        await articles.Config.AddProperty(Property.Text("description"));
        // END AddProperty

        var config = await client.Collections.Export("Article");
        Assert.Contains(config.Properties, p => p.Name == "description");
    }

    [Fact]
    public async Task TestCreateCollectionWithVectorizer()
    {
        // START Vectorizer
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector("default", v => v.Text2VecTransformers()),
                },
                Properties = [Property.Text("title"), Property.Text("body")],
            }
        );
        // END Vectorizer

        var config = await client.Collections.Export("Article");
        Assert.True(config.VectorConfig.ContainsKey("default"));
        Assert.Equal("text2vec-transformers", config.VectorConfig["default"].Vectorizer.Identifier);
    }

    [Fact]
    public async Task TestCreateCollectionWithNamedVectors()
    {
        // START BasicNamedVectors
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "ArticleNV",
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector(
                        "title",
                        v => v.Text2VecTransformers(),
                        sourceProperties: ["title"],
                        index: new VectorIndex.HNSW()
                    ),
                    Configure.Vector(
                        "title_country",
                        v => v.Text2VecTransformers(),
                        sourceProperties: ["title", "country"],
                        index: new VectorIndex.HNSW()
                    ),
                    Configure.Vector(
                        "custom_vector",
                        v => v.SelfProvided(),
                        index: new VectorIndex.HNSW()
                    ),
                },
                Properties = [Property.Text("title"), Property.Text("country")],
            }
        );
        // END BasicNamedVectors

        var config = await client.Collections.Export("ArticleNV");
        Assert.Equal(3, config.VectorConfig.Count);
        Assert.Contains("title", config.VectorConfig.Keys);
        Assert.Contains("title_country", config.VectorConfig.Keys);
        Assert.Contains("custom_vector", config.VectorConfig.Keys);
        Assert.Contains(config.Properties, p => p.Name == "title");
        Assert.Contains(config.Properties, p => p.Name == "country");
    }

    [Fact]
    public async Task ConfigurePropertyModuleSettings()
    {
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                VectorConfig = Configure.Vector("default", v => v.Text2VecTransformers()),
                Properties = [Property.Text("title"), Property.Text("body")],
            }
        );
        var articles = client.Collections.Use("Article");
        // START AddNamedVectors
        await articles.Config.AddVector(
            Configure.Vector("body_vector", v => v.Text2VecCohere(), sourceProperties: "body")
        );
        // END AddNamedVectors

        CollectionConfig config = await client.Collections.Export("Article");
        Assert.Equal(2, config.VectorConfig.Count);
        //Assert.NotNull(config.VectorConfig["body_vector"]);
    }

    [Fact]
    public async Task CreateCollectionWithMultiVectors()
    {
        // START MultiValueVectorCollection
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "DemoCollection",
                VectorConfig =
                [
                    // Example 1 - Use a model integration
                    Configure.MultiVector("jina_colbert", v => v.Text2MultiVecJinaAI()),
                    // Example 2 - User-provided multi-vector representations
                    Configure.MultiVector("custom_multi_vector", v => v.SelfProvided()),
                ],
                Properties = [Property.Text("text")],
            }
        );
        // END MultiValueVectorCollection

        // Assert
        CollectionConfig config = await client.Collections.Export("DemoCollection");
        Assert.True(config.VectorConfig.ContainsKey("jina_colbert"));
        Assert.True(config.VectorConfig.ContainsKey("custom_multi_vector"));
    }

    [Fact]
    public async Task TestMultiValueVectorMuvera()
    {
        // START MultiValueVectorMuvera
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "DemoCollection",
                VectorConfig = new VectorConfigList
                {
                    // Example 1 - Use a model integration
                    Configure.MultiVector(
                        "jina_colbert",
                        v => v.Text2MultiVecJinaAI(),
                        index: new VectorIndex.HNSW
                        {
                            MultiVector = new MultiVectorConfig { Encoding = new MuveraEncoding() },
                        }
                    ),
                    // Example 2 - User-provided multi-vector representations
                    Configure.MultiVector(
                        "custom_multi_vector",
                        v => v.SelfProvided(),
                        index: new VectorIndex.HNSW
                        {
                            MultiVector = new MultiVectorConfig { Encoding = new MuveraEncoding() },
                        }
                    ),
                },
            }
        );
        // END MultiValueVectorMuvera

        Assert.True(await client.Collections.Exists("DemoCollection"));
    }

    [Fact]
    public async Task TestSetVectorIndexType()
    {
        // START SetVectorIndexType
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector(
                        "default",
                        v => v.Text2VecTransformers(),
                        index: new VectorIndex.HNSW()
                    ),
                },
                Properties = [Property.Text("title"), Property.Text("body")],
            }
        );
        // END SetVectorIndexType

        var config = await client.Collections.Export("Article");
        Assert.IsType<VectorIndex.HNSW>(config.VectorConfig["default"].VectorIndexConfig);
    }

    [Fact]
    public async Task TestSetVectorIndexParams()
    {
        // START SetVectorIndexParams
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                VectorConfig = new[]
                {
                    Configure.Vector(
                        "default",
                        v => v.Text2VecTransformers(),
                        index: new VectorIndex.HNSW()
                        {
                            EfConstruction = 300,
                            Distance = VectorDistance.Cosine,
                        }
                    ),
                },
                Properties = [Property.Text("title")],
            }
        );
        // END SetVectorIndexParams

        var config = await client.Collections.Export("Article");
        var hnswConfig = Assert.IsType<VectorIndex.HNSW>(
            config.VectorConfig["default"].VectorIndexConfig
        );
        Assert.Equal(300, hnswConfig.EfConstruction);
        Assert.Equal(VectorIndexConfig.VectorDistance.Cosine, hnswConfig.Distance);
    }

    [Fact]
    public async Task TestSetInvertedIndexParams()
    {
        // START SetInvertedIndexParams
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                Properties =
                [
                    Property.Text("title", indexFilterable: true, indexSearchable: true),
                    Property.Text("chunk", indexFilterable: true, indexSearchable: true),
                    Property.Int("chunk_number", indexRangeFilters: true),
                ],
                InvertedIndexConfig = new InvertedIndexConfig
                {
                    Bm25 = new BM25Config { B = 1, K1 = 2 },
                    IndexNullState = true,
                    IndexPropertyLength = true,
                    IndexTimestamps = true,
                },
            }
        );
        // END SetInvertedIndexParams

        var config = await client.Collections.Export("Article");
        Assert.Equal(1, config.InvertedIndexConfig.Bm25.B);
        Assert.Equal(2, config.InvertedIndexConfig.Bm25.K1);
        Assert.Equal(3, config.Properties.Length);
    }

    [Fact]
    public async Task TestSetReranker()
    {
        // START SetReranker
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                VectorConfig = Configure.Vector("default", v => v.Text2VecTransformers()),
                RerankerConfig = Configure.Reranker.Cohere(),
                Properties = [Property.Text("title")],
            }
        );
        // END SetReranker

        var config = await client.Collections.Export("Article");
        Assert.NotNull(config.RerankerConfig);
        Assert.Equal("reranker-cohere", (config.RerankerConfig as Reranker.Cohere)?.Type);
    }

    [Fact]
    public async Task TestUpdateReranker()
    {
        await client.Collections.Create(new CollectionCreateParams { Name = "Article" });

        // START UpdateReranker
        var collection = client.Collections.Use("Article");
        await collection.Config.Update(c =>
        {
            c.RerankerConfig = Configure.Reranker.Cohere();
        });
        // END UpdateReranker

        var config = await client.Collections.Export("Article");
        Assert.NotNull(config.RerankerConfig);
        Assert.Equal("reranker-cohere", (config.RerankerConfig as Reranker.Cohere)?.Type);
    }

    [Fact]
    public async Task TestSetGenerative()
    {
        // START SetGenerative
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                VectorConfig = Configure.Vector("default", v => v.Text2VecTransformers()),
                GenerativeConfig = Configure.Generative.Cohere(),
                Properties = [Property.Text("title")],
            }
        );
        // END SetGenerative

        var config = await client.Collections.Export("Article");
        Assert.NotNull(config.GenerativeConfig);
        Assert.Equal(
            "generative-cohere",
            (config.GenerativeConfig as GenerativeConfig.Cohere)?.Type
        );
    }

    [Fact]
    public async Task TestUpdateGenerative()
    {
        await client.Collections.Create(new CollectionCreateParams { Name = "Article" });

        // START UpdateGenerative
        var collection = client.Collections.Use("Article");
        await collection.Config.Update(c =>
        {
            c.GenerativeConfig = Configure.Generative.Cohere();
        });
        // END UpdateGenerative

        var config = await client.Collections.Export("Article");
        Assert.NotNull(config.GenerativeConfig);
        Assert.Equal(
            "generative-cohere",
            (config.GenerativeConfig as GenerativeConfig.Cohere)?.Type
        );
    }

    [Fact]
    public async Task TestCreateCollectionWithVectorizerSettings()
    {
        // START ModuleSettings
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector(
                        "default",
                        v =>
                            v.Text2VecTransformers( 
                            // The available settings depend on the module
                            // inferenceUrl: "http://custom-inference:8080",
                            // vectorizeCollectionName: false
                            )
                    ),
                },
                Properties = [Property.Text("title"), Property.Text("body")],
            }
        );
        // END ModuleSettings

        var config = await client.Collections.Export("Article");
        Assert.True(config.VectorConfig.ContainsKey("default"));
        Assert.Equal("text2vec-transformers", config.VectorConfig["default"].Vectorizer.Identifier);
    }

    [Fact]
    public async Task TestCreateCollectionWithPropertyConfig()
    {
        // START PropModuleSettings
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                Properties =
                [
                    Property.Text("title", tokenization: PropertyTokenization.Lowercase),
                    Property.Text("body", tokenization: PropertyTokenization.Whitespace),
                ],
            }
        );
        // END PropModuleSettings

        var config = await client.Collections.Export("Article");
        Assert.Equal(2, config.Properties.Length);
    }

    [Fact]
    public async Task TestCreateCollectionWithTrigramTokenization()
    {
        // START TrigramTokenization
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                VectorConfig = new[] { Configure.Vector("default", v => v.Text2VecTransformers()) },
                Properties = [Property.Text("title", tokenization: PropertyTokenization.Trigram)],
            }
        );
        // END TrigramTokenization

        var config = await client.Collections.Export("Article");
        Assert.Single(config.Properties);
        Assert.Equal(PropertyTokenization.Trigram, config.Properties.First().PropertyTokenization);
    }

    [Fact]
    public async Task TestDistanceMetric()
    {
        // START DistanceMetric
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                VectorConfig = new[]
                {
                    Configure.Vector(
                        "default",
                        v => v.Text2VecTransformers(),
                        index: new VectorIndex.HNSW() { Distance = VectorDistance.Cosine }
                    ),
                },
                Properties = [Property.Text("title")],
            }
        );
        // END DistanceMetric

        var config = await client.Collections.Export("Article");
        var hnswConfig = Assert.IsType<VectorIndex.HNSW>(
            config.VectorConfig["default"].VectorIndexConfig
        );
        Assert.Equal(VectorIndexConfig.VectorDistance.Cosine, hnswConfig.Distance);
    }

    [Fact]
    public async Task TestReplicationSettings()
    {
        // START ReplicationSettings
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                ReplicationConfig = new ReplicationConfig { Factor = 1 },
            }
        );
        // END ReplicationSettings

        var config = await client.Collections.Export("Article");
        Assert.Equal(1, config.ReplicationConfig.Factor);
    }

    [Fact]
    public async Task TestAsyncRepair()
    {
        // START AsyncRepair
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                ReplicationConfig = new ReplicationConfig { Factor = 1, AsyncEnabled = true },
            }
        );
        // END AsyncRepair

        var config = await client.Collections.Export("Article");
        Assert.True(config.ReplicationConfig.AsyncEnabled);
    }

    [Fact]
    public async Task TestAllReplicationSettings()
    {
        // START AllReplicationSettings
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                ReplicationConfig = new ReplicationConfig
                {
                    Factor = 1,
                    AsyncEnabled = true,
                    DeletionStrategy = DeletionStrategy.TimeBasedResolution,
                },
            }
        );
        // END AllReplicationSettings

        var config = await client.Collections.Export("Article");
        Assert.Equal(1, config.ReplicationConfig.Factor);
        Assert.True(config.ReplicationConfig.AsyncEnabled);
    }

    [Fact]
    public async Task TestShardingSettings()
    {
        // START ShardingSettings
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                ShardingConfig = new ShardingConfig
                {
                    VirtualPerPhysical = 128,
                    DesiredCount = 1,
                    DesiredVirtualCount = 128,
                },
            }
        );
        // END ShardingSettings

        var config = await client.Collections.Export("Article");
        Assert.Equal(128, config.ShardingConfig.VirtualPerPhysical);
        Assert.Equal(1, config.ShardingConfig.DesiredCount);
        Assert.Equal(128, config.ShardingConfig.DesiredVirtualCount);
    }

    [Fact]
    public async Task TestMultiTenancy()
    {
        // START Multi-tenancy
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                MultiTenancyConfig = new MultiTenancyConfig
                {
                    Enabled = true,
                    AutoTenantCreation = true,
                    AutoTenantActivation = true,
                },
            }
        );
        // END Multi-tenancy

        var config = await client.Collections.Export("Article");
        Assert.True(config.MultiTenancyConfig.AutoTenantActivation);
    }

    [Fact]
    public async Task TestReadOneCollection()
    {
        await client.Collections.Create(new CollectionCreateParams { Name = "Article" });

        // START ReadOneCollection
        var articles = client.Collections.Use("Article");
        var articlesConfig = await articles.Config.Get();

        Console.WriteLine(articlesConfig);
        // END ReadOneCollection

        Assert.NotNull(articlesConfig);
        Assert.Equal("Article", articlesConfig.Name);
    }

    [Fact]
    public async Task TestReadAllCollections()
    {
        await client.Collections.Create(new CollectionCreateParams { Name = "Article" });
        await client.Collections.Create(new CollectionCreateParams { Name = "Publication" });

        // START ReadAllCollections
        var response = new List<CollectionConfig>();
        await foreach (var collection in client.Collections.List())
        {
            response.Add(collection);
            Console.WriteLine(collection);
        }
        // END ReadAllCollections

        Assert.Contains(response, c => c.Name == "Article");
        Assert.Contains(response, c => c.Name == "Publication");
    }

    [Fact]
    public async Task TestUpdateCollection()
    {
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Article",
                InvertedIndexConfig = new InvertedIndexConfig { Bm25 = new BM25Config { K1 = 10 } },
            }
        );

        // START UpdateCollection
        var articles = client.Collections.Use("Article");

        await articles.Config.Update(c =>
        {
            c.Description = "An updated collection description.";
            c.InvertedIndexConfig.Bm25.K1 = 1.5f;
        });
        // END UpdateCollection

        var config = await articles.Config.Get();
        Assert.Equal("An updated collection description.", config.Description);
        Assert.Equal(1.5f, config.InvertedIndexConfig.Bm25.K1);
    }

    [Fact]
    public async Task TestDeleteCollection()
    {
        string collectionName = "Article";
        await client.Collections.Create(new CollectionCreateParams { Name = collectionName });
        Assert.True(await client.Collections.Exists(collectionName));

        // START DeleteCollection
        await client.Collections.Delete(collectionName);
        // END DeleteCollection

        Assert.False(await client.Collections.Exists(collectionName));
    }

    // [Fact]
    // public async Task TestInspectCollectionShards()
    // {
    //     await client.Collections.Create(new CollectionCreateParams { Name = "Article" });

    //     var articles = client.Collections.Use("Article");

    //     var articleShards = await articles.Shards.Get();
    //     Console.WriteLine(string.Join(", ", articleShards.Select(s => s.Name)));

    //     Assert.NotNull(articleShards);
    //     Assert.Single(articleShards);
    // }
    // START InspectCollectionShards
    // Coming soon
    // END InspectCollectionShards

    // [Fact]
    // public async Task TestUpdateCollectionShards()
    // {
    //     await client.Collections.Create(new CollectionCreateParams { Name = "Article" });
    //     var initialShards = await client.Collections.Use("Article").Shards.Get();
    //     var shardName = initialShards.First().Name;

    //     var articles = client.Collections.Use("Article");

    //     var articleShards = await articles.Shards.Update(shardName, "READONLY");
    //     Console.WriteLine(string.Join(", ", articleShards.Select(s => s.Status)));

    //     Assert.NotNull(articleShards);
    //     Assert.Single(articleShards);
    //     Assert.Equal("READONLY", articleShards.First().Status);
    // }
    // START UpdateCollectionShards
    // Coming soon
    // END UpdateCollectionShards
}
