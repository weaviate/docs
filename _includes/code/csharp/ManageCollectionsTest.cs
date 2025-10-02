using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using static Weaviate.Client.Models.VectorIndex;

namespace WeaviateProject.Tests;

public class ManageCollectionsTests : IAsyncLifetime
{
    private readonly WeaviateClient weaviate;
    private readonly List<string> _collectionNamesToDelete = new List<string>();

    public ManageCollectionsTests()
    {
        weaviate = new WeaviateClient(
            new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 }
        );
    }

    private string AddTestCollection(string name)
    {
        _collectionNamesToDelete.Add(name);
        return name;
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        foreach (string name in _collectionNamesToDelete)
        {
            await weaviate.Collections.Delete(name);
        }
    }

    [Fact]
    public async Task CreateBasicCollection()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START BasicCreateCollection
        Collection articleCollection = new Collection { Name = collectionName };
        await weaviate.Collections.Create(articleCollection);
        // END BasicCreateCollection

        bool exists = await weaviate.Collections.Exists(collectionName);
        Assert.True(exists);
    }

    [Fact]
    public async Task CreateCollectionWithProperties()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START CreateCollectionWithProperties
        Collection articleCollection = new Collection
        {
            Name = collectionName,
            Properties = new List<Property>
            {
                Property.Text("title"),
                Property.Text("body"),
            }
        };
        await weaviate.Collections.Create(articleCollection);
        // END CreateCollectionWithProperties

        Collection collection = await weaviate.Collections.Export(collectionName);
        Assert.NotNull(collection);
        Assert.Equal(2, collection.Properties.Count);
    }

    [Fact]
    public async Task CreateCollectionWithVectorizer()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START Vectorizer
        Collection articleCollection = new Collection
        {
            Name = collectionName,
            VectorConfig = Configure.Vectors.Text2VecOpenAI("default").New(),
            Properties = new List<Property>
            {
                Property.Text("title"),
                Property.Text("body"),
            }
        };
        await weaviate.Collections.Create(articleCollection);
        // END Vectorizer

        Collection collection = await weaviate.Collections.Export(collectionName);
        Assert.NotNull(collection.VectorConfig);
        Assert.Equal("text2vec-openai", collection.VectorConfig["default"].Vectorizer.Identifier);
    }

    [Fact]
    public async Task CreateCollectionWithNamedVectors()
    {
        string collectionName = AddTestCollection("ArticleNV");
        await weaviate.Collections.Delete(collectionName);

        // START BasicNamedVectors
        Collection articleCollection = new Collection
        {
            Name = collectionName,
            VectorConfig = new VectorConfigList
            {
                // TODO[g-despot]: How to specify source properties, it's currently source properties
                
                //Configure.Vectors.Text2VecCohere(sourceProperties: new[] { "title" }).New("title"),
                //Configure.Vectors.Text2VecOpenAI(sourceProperties: new[] { "title", "country" }).New("title_country"),
                Configure.Vectors.SelfProvided("default"),
            },
            Properties = new List<Property>
            {
                Property.Text("title"),
                Property.Text("country"),
            }
        };
        await weaviate.Collections.Create(articleCollection);
        // END BasicNamedVectors

        Collection collection = await weaviate.Collections.Export(collectionName);
        Assert.Equal(1, collection.VectorConfig.Count);
        // Assert.Equal(new[] { "title" }, collection.VectorConfig["title"].Vectorizer.SourceProperties);
    }

    [Fact]
    public async Task SetVectorIndexType()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START SetVectorIndexType
        Collection articleCollection = new Collection
        {
            Name = collectionName,
            VectorConfig = new VectorConfigList
            {
                new VectorConfig(
                    name: "default",
                    vectorizer: new Vectorizer.Text2VecOpenAI(),
                    vectorIndexConfig: new VectorIndex.HNSW()
                )
            },
            Properties = new List<Property>
            {
                Property.Text("title"),
                Property.Text("body"),
            }
        };
        await weaviate.Collections.Create(articleCollection);
        // END SetVectorIndexType

        Collection collection = await weaviate.Collections.Export(collectionName);
        Assert.IsType<VectorIndex.HNSW>(collection.VectorConfig["default"].VectorIndexConfig);
    }

    [Fact]
    public async Task SetVectorIndexParams()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START SetVectorIndexParams
        Collection articleCollection = new Collection
        {
            Name = collectionName,
            VectorConfig = new VectorConfigList
            {
                new VectorConfig(
                    name: "default",
                    vectorizer: new Vectorizer.Text2VecOpenAI(),
                    vectorIndexConfig: new VectorIndex.HNSW
                    {
                        EfConstruction = 300,
                        Distance = VectorIndexConfig.VectorDistance.Cosine,
                        FilterStrategy = VectorIndexConfig.VectorIndexFilterStrategy.Sweeping
                    }
                )
            }
        };
        await weaviate.Collections.Create(articleCollection);
        // END SetVectorIndexParams

        Collection collection = await weaviate.Collections.Export(collectionName);
        VectorIndex.HNSW hnswConfig = Assert.IsType<VectorIndex.HNSW>(collection.VectorConfig["default"].VectorIndexConfig);
        Assert.Equal(300, hnswConfig.EfConstruction);
    }

    [Fact]
    public async Task SetInvertedIndexParams()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START SetInvertedIndexParams
        Collection articleCollection = new Collection
        {
            Name = collectionName,
            Properties = new List<Property>
            {
                Property.Text("title", indexFilterable: true, indexSearchable: true),
                Property.Text("chunk", indexFilterable: true, indexSearchable: true),
                Property.Int("chunk_number", indexRangeFilters: true),
            },
            InvertedIndexConfig = new InvertedIndexConfig
            {
                Bm25 = new BM25Config { B = 0.7f, K1 = 1.25f },
                IndexNullState = true,
                IndexPropertyLength = true,
                IndexTimestamps = true,
            }
        };
        await weaviate.Collections.Create(articleCollection);
        // END SetInvertedIndexParams

        Collection collection = await weaviate.Collections.Export(collectionName);
        Assert.Equal(0.7f, collection.InvertedIndexConfig.Bm25.B);
        Assert.Equal(1.25f, collection.InvertedIndexConfig.Bm25.K1);
    }

    [Fact]
    public async Task SetAndReadModules()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START SetReranker
        Collection articleReranker = new Collection
        {
            Name = collectionName,
            VectorConfig = Configure.Vectors.Text2VecOpenAI().New(),
            RerankerConfig = new Reranker.Cohere()
        };
        await weaviate.Collections.Create(articleReranker);
        // END SetReranker

        Collection collectionConfig = await weaviate.Collections.Export(collectionName);
        Assert.Equal("reranker-cohere", (collectionConfig.RerankerConfig as Reranker.Cohere)?.Type);

        await weaviate.Collections.Delete(collectionName);

        // START SetGenerative
        Collection articleGenerative = new Collection
        {
            Name = collectionName,
            VectorConfig = Configure.Vectors.Text2VecOpenAI().New(),
            GenerativeConfig = new Generative.OpenAIConfig
            {
                Model = "gpt-4o"
            },
        };
        await weaviate.Collections.Create(articleGenerative);
        // END SetGenerative

        collectionConfig = await weaviate.Collections.Export(collectionName);
        Assert.Equal("generative-openai", (collectionConfig.GenerativeConfig as Generative.OpenAIConfig)?.Type);
    }

    [Fact]
    public async Task UpdateModules()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        Collection initialCollection = new Collection
        {
            Name = collectionName,
            VectorConfig = Configure.Vectors.Text2VecOpenAI().New(),
            RerankerConfig = new Reranker.VoyageAI()
        };
        await weaviate.Collections.Create(initialCollection);

        // START UpdateReranker
        CollectionClient<object> collectionToUpdate = weaviate.Collections.Use<object>(collectionName);
        await collectionToUpdate.Config.Update(c =>
        {
            c.RerankerConfig = new Reranker.Cohere();
        });
        // END UpdateReranker

        Collection config = await weaviate.Collections.Export(collectionName);
        Assert.Equal("reranker-cohere", (config.RerankerConfig as Reranker.Cohere)?.Type);
    }

    [Fact]
    public async Task ConfigureModuleSettings()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START ModuleSettings
        Collection articleCollection = new Collection
        {
            Name = collectionName,
            // highlight-start
            VectorConfig = new VectorConfigList
            {
                new VectorConfig(
                    name: "default",
                    vectorizer: new Vectorizer.Text2VecCohere
                    {
                        Model = "embed-multilingual-v2.0",
                        VectorizeCollectionName = true
                    }
                )
            }
            // highlight-end
        };
        await weaviate.Collections.Create(articleCollection);
        // END ModuleSettings

        Collection config = await weaviate.Collections.Export(collectionName);
        Vectorizer.Text2VecCohere cohereVectorizer = Assert.IsType<Vectorizer.Text2VecCohere>(config.VectorConfig["default"].Vectorizer);
        Assert.Equal("embed-multilingual-v2.0", cohereVectorizer.Model);
    }

    [Fact]
    public async Task ConfigurePropertyModuleSettings()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START PropModuleSettings
        Collection articleCollection = new Collection
        {
            Name = collectionName,
            VectorConfig = Configure.Vectors.Text2VecCohere().New(),
            Properties = new List<Property>
            {
                Property.Text(
                    "title",
                    // TODO[g-despot]: Missing vectorizePropertyName
                    // vectorizePropertyName: true,
                    tokenization: PropertyTokenization.Lowercase
                ),
                Property.Text(
                    "body",
                    // TODO[g-despot]: Missing vectorizePropertyName
                    // skipVectorization: true,
                    tokenization: PropertyTokenization.Whitespace
                ),
            }
        };
        await weaviate.Collections.Create(articleCollection);
        // END PropModuleSettings

        // START AddNamedVectors
        CollectionClient<object> articles = weaviate.Collections.Use<object>(collectionName);
        // TODO[g-despot]: AddVector throws error: vectorizer config of vector \"default\" is immutable
        await articles.Config.AddVector(Configure.Vectors.Text2VecCohere().New("body_vector", sourceProperties: "body"));
        // TODO[g-despot]: Missing sourceProperties
        // Configure.Vectors.Text2VecCohere(sourceProperties: new[] { "body" }).New("body_vector")
        //    Configure.Vectors.Text2VecCohere().New("body_vector")
        // );
        // END AddNamedVectors

        Collection config = await weaviate.Collections.Export(collectionName);
        Assert.Equal(1, config.VectorConfig.Count);
        //Assert.NotNull(config.VectorConfig["body_vector"]);
    }

    [Fact]
    public async Task SetDistanceMetric()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START DistanceMetric
        Collection articleCollection = new Collection
        {
            Name = collectionName,
            // highlight-start
            VectorConfig = new VectorConfigList
            {
                new VectorConfig(
                    name: "default",
                    vectorizer: new Vectorizer.Text2VecOpenAI(),
                    vectorIndexConfig: new VectorIndex.HNSW
                    {
                        Distance = VectorIndexConfig.VectorDistance.Cosine
                    }
                )
            }
            // highlight-end
        };
        await weaviate.Collections.Create(articleCollection);
        // END DistanceMetric

        Collection config = await weaviate.Collections.Export(collectionName);
        VectorIndex.HNSW hnswConfig = Assert.IsType<VectorIndex.HNSW>(config.VectorConfig["default"].VectorIndexConfig);
        Assert.Equal(VectorIndexConfig.VectorDistance.Cosine, hnswConfig.Distance);
    }

    [Fact]
    public async Task ConfigureReplicationAndSharding()
    {
        // --- Replication Part ---
        // Connect to the Weaviate instance configured for replication tests on port 8180
        WeaviateClient replicationClient = new WeaviateClient(new ClientConfiguration { RestAddress = "localhost", RestPort = 8180 });
        string replicationCollectionName = AddTestCollection("ArticleReplication");
        await replicationClient.Collections.Delete(replicationCollectionName);

        // START ReplicationSettings
        Collection replCollection = new Collection
        {
            Name = replicationCollectionName,
            ReplicationConfig = new ReplicationConfig { Factor = 3 }
        };
        await replicationClient.Collections.Create(replCollection);
        // END ReplicationSettings

        Collection config = await replicationClient.Collections.Export(replicationCollectionName);
        Assert.Equal(3, config.ReplicationConfig.Factor);
        await replicationClient.Collections.Delete(replicationCollectionName); // Clean up using the replication client


        // --- Sharding Part ---
        // Use the default client for sharding tests
        string shardingCollectionName = AddTestCollection("ArticleSharding");
        await weaviate.Collections.Delete(shardingCollectionName);

        // START ShardingSettings
        Collection shardCollection = new Collection
        {
            Name = shardingCollectionName,
            ShardingConfig = new ShardingConfig
            {
                VirtualPerPhysical = 128,
                DesiredCount = 1,
                DesiredVirtualCount = 128,
            }
        };
        await weaviate.Collections.Create(shardCollection);
        // END ShardingSettings

        config = await weaviate.Collections.Export(shardingCollectionName);
        Assert.Equal(128, config.ShardingConfig.VirtualPerPhysical);
    }

    [Fact]
    public async Task ConfigureMultiTenancyAndProperties()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // START Multi-tenancy
        Collection mtCollection = new Collection
        {
            Name = collectionName,
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true }
        };
        await weaviate.Collections.Create(mtCollection);
        // END Multi-tenancy

        Collection config = await weaviate.Collections.Export(collectionName);
        Assert.True(config.MultiTenancyConfig.Enabled);

        // START AddProperty
        CollectionClient<object> articles = weaviate.Collections.Use<object>(collectionName);
        await articles.Config.AddProperty(Property.Text("body"));
        // END AddProperty

        config = await weaviate.Collections.Export(collectionName);
        // Assert.Contains(config.Properties, p => p.Name == "body");
    }

    [Fact]
    public async Task Should_Update_Collection_Configuration()
    {
        // Arrange: Create a collection with initial settings to be updated
        string collectionName = "ArticleForUpdate";
        await weaviate.Collections.Delete(collectionName); // Ensure clean state

        Collection initialCollection = new Collection
        {
            Name = collectionName,
            Description = "An old collection description.",
            InvertedIndexConfig = new InvertedIndexConfig
            {
                Bm25 = new BM25Config { K1 = 1.2f }
            },
            Properties =
            [
                Property.Text(
                    "title"
                ),
            ],
            VectorConfig = new VectorConfigList
        {
            new VectorConfig(
                "default",
                new Vectorizer.Text2VecOpenAI(),
                new VectorIndex.HNSW { FilterStrategy = VectorIndexConfig.VectorIndexFilterStrategy.Sweeping }
            )
        },
            ReplicationConfig = new ReplicationConfig()
        };
        await weaviate.Collections.Create(initialCollection);

        CollectionClient<object> articles = weaviate.Collections.Use<object>(collectionName);

        // Act: Update the collection
        // START UpdateCollection
        await articles.Config.Update(c =>
        {
            c.Description = "An updated collection description.";
            c.InvertedIndexConfig.Bm25.K1 = 1.5f;

            VectorConfigUpdate vectorConfig = c.VectorConfig["default"];
            vectorConfig.VectorIndexConfig.UpdateHNSW(vic =>
            {
                vic.FilterStrategy = VectorIndexConfig.VectorIndexFilterStrategy.Acorn;
            });

            c.ReplicationConfig.DeletionStrategy = DeletionStrategy.TimeBasedResolution;
        });
        // END UpdateCollection

        // Assert: Fetch the updated config and verify changes
        Collection newConfig = await weaviate.Collections.Export(collectionName);

        Assert.Equal("An updated collection description.", newConfig.Description);
        Assert.Equal(1.5f, newConfig.InvertedIndexConfig.Bm25.K1);

        VectorIndex.HNSW hnswConfig = Assert.IsType<VectorIndex.HNSW>(newConfig.VectorConfig["default"].VectorIndexConfig);
        Assert.Equal(VectorIndexConfig.VectorIndexFilterStrategy.Acorn, hnswConfig.FilterStrategy);

        Assert.Equal(DeletionStrategy.TimeBasedResolution, newConfig.ReplicationConfig.DeletionStrategy);
    }

    [Fact]
    public async Task ReadAndDeleteCollections()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);
        await weaviate.Collections.Create(new Collection { Name = collectionName });

        // START ReadOneCollection
        CollectionClient<object> articlesClient = weaviate.Collections.Use<object>(collectionName);
        Collection articlesConfig = await articlesClient.Get();
        Console.WriteLine(articlesConfig.Name);
        // END ReadOneCollection
        Assert.Equal(collectionName, articlesConfig.Name);

        // START ReadAllCollections
        await foreach (Collection collection in weaviate.Collections.List())
        {
            Console.WriteLine(collection.Name);
        }
        // END ReadAllCollections

        // START DeleteCollection
        await weaviate.Collections.Delete(collectionName);
        // END DeleteCollection

        bool exists = await weaviate.Collections.Exists(collectionName);
        Assert.False(exists);
    }

    [Fact]
    public async Task UpdateGenerativeModule()
    {
        string collectionName = AddTestCollection("Article");
        await weaviate.Collections.Delete(collectionName);

        // Arrange: Create a collection with the OpenAI generative module
        Collection initialCollection = new Collection
        {
            Name = collectionName,
            VectorConfig = new VectorConfigList { new VectorConfig("default", new Vectorizer.Text2VecOpenAI()) },
            GenerativeConfig = new Generative.OpenAIConfig()
        };
        await weaviate.Collections.Create(initialCollection);

        CollectionClient<object> collectionToUpdate = weaviate.Collections.Use<object>(collectionName);

        // Act: Update the generative module to Cohere
        // START UpdateGenerative
        await collectionToUpdate.Config.Update(c =>
        {
            c.GenerativeConfig = new Generative.OpenAIConfig(); // Update the generative module
        });
        // END UpdateGenerative

        // Assert: Verify the change
        Collection config = await weaviate.Collections.Export(collectionName);
        Assert.Equal("generative-openai", (config.GenerativeConfig as Generative.Custom)?.Type);
    }

    [Fact]
    public async Task CreateCollectionWithMultiVectors()
    {
        string collectionName = AddTestCollection("DemoCollection");
        await weaviate.Collections.Delete(collectionName);

        // START MultiValueVectorCollection
        Collection collection = new Collection
        {
            Name = collectionName,
            VectorConfig = new VectorConfigList
        {
            // The factory function will automatically enable multi-vector support for the HNSW index
            Configure.MultiVectors.Text2VecJinaAI().New("jina_colbert"),
            // Must explicitly enable multi-vector support for the HNSW index
            Configure.MultiVectors.SelfProvided("custom_multi_vector"),
        },
            Properties = new List<Property> { Property.Text("text") },
        };
        await weaviate.Collections.Create(collection);
        // END MultiValueVectorCollection

        // Assert
        Collection config = await weaviate.Collections.Export(collectionName);
        Assert.True(config.VectorConfig.ContainsKey("jina_colbert"));
        Assert.True(config.VectorConfig.ContainsKey("custom_multi_vector"));
    }

    // [Fact]
    // public async Task CreateCollectionWithMultiVectorsAndMuvera()
    // {
    //     string collectionName = AddTestCollection("DemoCollection");
    //     await weaviate.Collections.Delete(collectionName);

    //     // START MultiValueVectorMuvera
    //     Collection collection = new Collection
    //     {
    //         Name = collectionName,
    //         VectorConfig = new VectorConfigList
    //     {
    //         Configure.MultiVectors.Text2VecJinaAI(
    //             "jina_colbert",
    //             indexConfig: new VectorIndex.HNSW
    //             {
    //                     MultiVector = new VectorIndexConfig.MultiVectorConfig
    //                     {
    //                         Encoding = new VectorIndexConfig.MuveraEncoding() { },
    //                     },
    //             }
    //         ),
    //         Configure.MultiVectors.SelfProvided(
    //             "custom_multi_vector",
    //             indexConfig: new VectorIndex.HNSW
    //             {
    //                 MultiVector = new VectorIndexConfig.MultiVectorConfig
    //                 {
    //                     Encoding = new VectorIndexConfig.MuveraEncoding()
    //                 }
    //             }
    //         ),
    //     }
    //     };
    //     await weaviate.Collections.Create(collection);
    //     // END MultiValueVectorMuvera

    //     // Assert
    //     Collection config = await weaviate.Collections.Export(collectionName);
    //     VectorIndex.HNSW jinaConfig = Assert.IsType<VectorIndex.HNSW>(config.VectorConfig["jina_colbert"].VectorIndexConfig);
    //     Assert.IsType<VectorIndexConfig.MuveraEncoding>(jinaConfig.MultiVector?.Encoding);
    // }

    [Fact]
    public async Task CreateCollectionWithMultiVectorsAndPQ()
    {
        string collectionName = AddTestCollection("DemoCollection");
        await weaviate.Collections.Delete(collectionName);

        // START MultiValueVectorPQ
        Collection collection = new Collection
        {
            Name = collectionName,
            VectorConfig = new VectorConfigList
        {
            // Configure.MultiVectors.Text2VecJinaAI(
            //     "jina_colbert",
            //     //sourceProperties: new[] { "text" },
            //     // TODO[g-despot]: Why is vectorIndexConfig missing from Text2VecJinaAI?
            //     vectorIndexConfig: new VectorIndex.HNSW
            //     {
            //         Quantizer = new Quantizers.BQ() { Cache = true, RescoreLimit = 64 },
            //     }
            // ),
            Configure.MultiVectors.SelfProvided(
                "custom_multi_vector",
                indexConfig: new VectorIndex.HNSW
                {
                    Quantizer = new Quantizers.BQ() { Cache = true, RescoreLimit = 64 },
                }
            ),
        }
        };
        await weaviate.Collections.Create(collection);
        // END MultiValueVectorPQ

        // Assert
        Collection config = await weaviate.Collections.Export(collectionName);
        // VectorIndex.HNSW jinaConfig = Assert.IsType<VectorIndex.HNSW>(config.VectorConfig["jina_colbert"].VectorIndexConfig);
        // VectorIndex.Quantizers.PQ quantizer = Assert.IsType<VectorIndex.Quantizers.PQ>(jinaConfig.Quantizer);
        // Assert.Equal(100000, quantizer.TrainingLimit);
    }

    [Fact]
    public async Task ConfigureAllReplicationSettings()
    {
        // Connect to the Weaviate instance configured for replication tests on port 8180
        WeaviateClient replicationClient = new WeaviateClient(new ClientConfiguration { RestAddress = "localhost", RestPort = 8180 });
        string collectionName = AddTestCollection("Article");
        await replicationClient.Collections.Delete(collectionName);

        // START AllReplicationSettings
        Collection collection = new Collection
        {
            Name = collectionName,
            ReplicationConfig = new ReplicationConfig
            {
                Factor = 3,
                AsyncEnabled = true,
                DeletionStrategy = DeletionStrategy.TimeBasedResolution,
            },
        };
        await replicationClient.Collections.Create(collection);
        // END AllReplicationSettings

        // Assert
        Collection config = await replicationClient.Collections.Export(collectionName);
        Assert.True(config.ReplicationConfig.AsyncEnabled);
        Assert.Equal(DeletionStrategy.TimeBasedResolution, config.ReplicationConfig.DeletionStrategy);
    }
}