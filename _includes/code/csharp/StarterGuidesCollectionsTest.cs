using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;

namespace WeaviateProject.Tests;

public class StarterGuidesCollectionsTest : IAsyncLifetime
{
    private WeaviateClient client;

    // Runs before each test
    public Task InitializeAsync()
    {
        // START-ANY
        // Note: The C# client doesn't support setting headers like 'X-OpenAI-Api-Key' via the constructor for local connections.
        // This must be configured in Weaviate's environment variables.
        client = new WeaviateClient(new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 });
        // END-ANY
        return Task.CompletedTask;
    }

    // Runs after each test
    public async Task DisposeAsync()
    {
        // Clean up any collections created during the tests
        if (await client.Collections.Exists("Question"))
        {
            await client.Collections.Delete("Question");
        }
    }

    [Fact]
    public async Task TestBasicSchema()
    {
        // START BasicSchema
        var questionsCollection = await client.Collections.Create(new CollectionConfig
        {
            Name = "Question",
            VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecWeaviate()), // Set the vectorizer
            GenerativeConfig = new GenerativeConfig.Cohere(), // Set the generative module
            Properties = 
            [
                Property.Text("question"),
                Property.Text("answer"),
                Property.Text("category")
            ]
        });

        Console.WriteLine(questionsCollection);
        // END BasicSchema
    }

    // TODO[g-despot] Missing vectorizePropertyName
    [Fact]
    public async Task TestSchemaWithPropertyOptions()
    {
        // START SchemaWithPropertyOptions
        await client.Collections.Create(new CollectionConfig
        {
            Name = "Question",
            VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecWeaviate()),
            GenerativeConfig = new GenerativeConfig.Cohere(),
            Properties = 
            [
                Property.Text(
                    "question",
                    tokenization: PropertyTokenization.Lowercase
                    // vectorizePropertyName: true // Pass as a simple named argument
                ),
                Property.Text(
                    "answer",
                    tokenization: PropertyTokenization.Whitespace
                    // vectorizePropertyName: false // Pass as a simple named argument
                )
            ]
        });
        // END SchemaWithPropertyOptions
    }

    [Fact]
    public async Task TestSchemaWithMultiTenancy()
    {
        // START SchemaWithMultiTenancy
        await client.Collections.Create(new CollectionConfig
        {
            Name = "Question",
            VectorConfig = new VectorConfig("default", new Vectorizer.Text2VecWeaviate()),
            GenerativeConfig = new GenerativeConfig.Cohere(),
            Properties = 
            [
                Property.Text("question"),
                Property.Text("answer")
            ],
            // highlight-start
            MultiTenancyConfig = new MultiTenancyConfig { Enabled = true, AutoTenantCreation = true } // Enable multi-tenancy
            // highlight-end
        });
        // END SchemaWithMultiTenancy
    }

    [Fact]
    public async Task TestSchemaWithIndexSettings()
    {
        // START SchemaWithIndexSettings
        await client.Collections.Create(new CollectionConfig
        {
            Name = "Question",
            VectorConfig = new VectorConfig(
                "default", // Set the name of the vector configuration
                new Vectorizer.Text2VecWeaviate(),
                // highlight-start
                new VectorIndex.HNSW
                {
                    Distance = VectorIndexConfig.VectorDistance.Cosine, // Configure the vector index
                    Quantizer = new VectorIndex.Quantizers.BQ() // Enable vector compression (quantization)
                }
                // highlight-end
            ),
            GenerativeConfig = new GenerativeConfig.Cohere(),
            Properties = 
            [
                Property.Text("question"),
                Property.Text("answer")
            ],
            // highlight-start
            // Configure the inverted index
            InvertedIndexConfig = new InvertedIndexConfig
            {
                IndexNullState = true,
                IndexPropertyLength = true,
                IndexTimestamps = true
            }
            // highlight-end
        });
        // END SchemaWithIndexSettings
    }
}