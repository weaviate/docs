using System;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

namespace WeaviateProject.Tests;

public class StarterGuidesCollectionsTest : IAsyncLifetime
{
    private WeaviateClient client;

    // Runs before each test
    public async Task InitializeAsync()
    {
        // START-ANY
        client = await Connect.Local();
        // END-ANY
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
        var questionsCollection = await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Question",
                VectorConfig = Configure.Vector("default", v => v.Text2VecWeaviate()),
                GenerativeConfig = Configure.Generative.Cohere(), // Set the generative module
                Properties =
                [
                    Property.Text("question"),
                    Property.Text("answer"),
                    Property.Text("category"),
                ],
            }
        );

        Console.WriteLine(questionsCollection);
        // END BasicSchema
    }

    [Fact]
    public async Task TestSchemaWithPropertyOptions()
    {
        // START SchemaWithPropertyOptions
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Question",
                VectorConfig = Configure.Vector("default", v => v.Text2VecWeaviate()),
                GenerativeConfig = Configure.Generative.Cohere(),
                Properties =
                [
                    Property.Text("question", tokenization: PropertyTokenization.Lowercase),
                    Property.Text("answer", tokenization: PropertyTokenization.Whitespace),
                ],
            }
        );
        // END SchemaWithPropertyOptions
    }

    [Fact]
    public async Task TestSchemaWithMultiTenancy()
    {
        await client.Collections.Delete("Question");
        // START SchemaWithMultiTenancy
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Question",
                VectorConfig = Configure.Vector("default", v => v.Text2VecWeaviate()),
                GenerativeConfig = Configure.Generative.Cohere(),
                Properties = [Property.Text("question"), Property.Text("answer")],
                // highlight-start
                MultiTenancyConfig = new MultiTenancyConfig
                {
                    Enabled = true,
                    AutoTenantCreation = true,
                }, // Enable multi-tenancy
                // highlight-end
            }
        );
        // END SchemaWithMultiTenancy
    }

    [Fact]
    public async Task TestSchemaWithIndexSettings()
    {
        // START SchemaWithIndexSettings
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Question",
                VectorConfig = Configure.Vector(
                    "default",
                    v => v.Text2VecWeaviate(),
                    // highlight-start
                    new VectorIndex.HNSW
                    {
                        Distance = VectorIndexConfig.VectorDistance.Cosine, // Configure the vector index
                        Quantizer = new VectorIndex.Quantizers.BQ(), // Enable vector compression (quantization)
                    }
                // highlight-end
                ),
                GenerativeConfig = Configure.Generative.Cohere(),
                Properties = [Property.Text("question"), Property.Text("answer")],
                // highlight-start
                // Configure the inverted index
                InvertedIndexConfig = new InvertedIndexConfig
                {
                    IndexNullState = true,
                    IndexPropertyLength = true,
                    IndexTimestamps = true,
                },
                // highlight-end
            }
        );
        // END SchemaWithIndexSettings
    }
}
