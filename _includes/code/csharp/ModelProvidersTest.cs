using System;
using System.Linq;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

public class ModelProvidersTest : IAsyncLifetime
{
    private WeaviateClient client;

    public async Task InitializeAsync()
    {
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

        // Create the client for the test class context
        if (!string.IsNullOrEmpty(weaviateUrl))
        {
            client = await Connect.Cloud(weaviateUrl, weaviateApiKey);
        }
        else
        {
            // Fallback/Mock for compilation if env vars aren't set
            client = await Connect.Local();
        }

        // Cleanup before tests
        if (await client.Collections.Exists("DemoCollection"))
        {
            await client.Collections.Delete("DemoCollection");
        }
    }

    public async Task DisposeAsync()
    {
        if (client != null && await client.Collections.Exists("DemoCollection"))
        {
            await client.Collections.Delete("DemoCollection");
        }
    }

    [Fact]
    public async Task TestWeaviateInstantiation()
    {
        // START WeaviateInstantiation
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

        // highlight-start
        using var client = await Connect.Cloud(
            weaviateUrl, // Replace with your Weaviate Cloud URL
            weaviateApiKey // Replace with your Weaviate Cloud key
        );

        // Verify connection (GetMeta is a quick way to check connectivity)
        // Note: C# client constructor doesn't block, so we make a call to verify.
        var meta = await client.GetMeta();
        Console.WriteLine(meta.Version);
        // highlight-end
        // END WeaviateInstantiation
    }

    [Fact]
    public async Task TestWeaviateVectorizer()
    {
        if (await client.Collections.Exists("DemoCollection"))
            await client.Collections.Delete("DemoCollection");

        // START BasicVectorizerWeaviate
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "DemoCollection",
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector(
                        "title_vector",
                        v => v.Text2VecWeaviate(),
                        sourceProperties: ["title"]
                    ),
                },
                Properties = [Property.Text("title"), Property.Text("description")],
            }
        );
        // END BasicVectorizerWeaviate

        var config = await client.Collections.Export("DemoCollection");
        Assert.True(config.VectorConfig.ContainsKey("title_vector"));
        Assert.Equal(
            "text2vec-weaviate",
            config.VectorConfig["title_vector"].Vectorizer.Identifier
        );

        await client.Collections.Delete("DemoCollection");
    }

    [Fact]
    public async Task TestWeaviateVectorizerModel()
    {
        // START VectorizerWeaviateCustomModel
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "DemoCollection",
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector(
                        "title_vector",
                        v => v.Text2VecWeaviate(model: "Snowflake/snowflake-arctic-embed-l-v2.0"),
                        sourceProperties: ["title"]
                    ),
                },
                Properties = [Property.Text("title"), Property.Text("description")],
            }
        );
        // END VectorizerWeaviateCustomModel

        var config = await client.Collections.Export("DemoCollection");
        Assert.True(config.VectorConfig.ContainsKey("title_vector"));
        Assert.Equal(
            "text2vec-weaviate",
            config.VectorConfig["title_vector"].Vectorizer.Identifier
        );

        await client.Collections.Delete("DemoCollection");
    }

    [Fact]
    public async Task TestWeaviateVectorizerParameters()
    {
        // START SnowflakeArcticEmbedMV15
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "DemoCollection",
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector(
                        "title_vector",
                        v =>
                            v.Text2VecWeaviate(
                                model: "Snowflake/snowflake-arctic-embed-m-v1.5"
                            // baseURL: null,
                            // dimensions: 0
                            ),
                        sourceProperties: ["title"]
                    ),
                },
                Properties = [Property.Text("title"), Property.Text("description")],
            }
        );
        // END SnowflakeArcticEmbedMV15

        var config = await client.Collections.Export("DemoCollection");
        Assert.True(config.VectorConfig.ContainsKey("title_vector"));
        Assert.Equal(
            "text2vec-weaviate",
            config.VectorConfig["title_vector"].Vectorizer.Identifier
        );
    }

    [Fact]
    public async Task TestInsertData()
    {
        // Ensure collection exists from previous test steps or recreate
        if (!await client.Collections.Exists("DemoCollection"))
        {
            await TestWeaviateVectorizerParameters(); // Re-run creation
        }

        // START BatchImportExample
        // Define the source objects
        var sourceObjects = new[]
        {
            new
            {
                title = "The Shawshank Redemption",
                description = "A wrongfully imprisoned man forms an inspiring friendship while finding hope and redemption in the darkest of places.",
            },
            new
            {
                title = "The Godfather",
                description = "A powerful mafia family struggles to balance loyalty, power, and betrayal in this iconic crime saga.",
            },
            new
            {
                title = "The Dark Knight",
                description = "Batman faces his greatest challenge as he battles the chaos unleashed by the Joker in Gotham City.",
            },
            new
            {
                title = "Jingle All the Way",
                description = "A desperate father goes to hilarious lengths to secure the season's hottest toy for his son on Christmas Eve.",
            },
            new
            {
                title = "A Christmas Carol",
                description = "A miserly old man is transformed after being visited by three ghosts on Christmas Eve in this timeless tale of redemption.",
            },
        };

        // Get a handle to the collection
        var collection = client.Collections.Use("DemoCollection");

        // Insert the data using insertMany
        var response = await collection.Data.InsertMany(sourceObjects);

        // Check for errors
        if (response.HasErrors)
        {
            Console.WriteLine($"Number of failed imports: {response.Errors.Count()}");
            Console.WriteLine($"First failed object error: {response.Errors.First().Message}");
        }
        else
        {
            Console.WriteLine($"Successfully inserted {response.Objects.Count()} objects.");
        }
        // END BatchImportExample

        Assert.False(response.HasErrors);
    }

    [Fact]
    public async Task TestNearText()
    {
        // Ensure data exists
        await TestInsertData();

        // START NearTextExample
        var collection = client.Collections.Use("DemoCollection");

        // highlight-start
        var response = await collection.Query.NearText(
            "A holiday film", // The model provider integration will automatically vectorize the query
            limit: 2,
            returnMetadata: MetadataOptions.Distance
        );
        // highlight-end

        foreach (var o in response.Objects)
        {
            Console.WriteLine(o.Properties["title"]);
        }
        // END NearTextExample

        Assert.NotEmpty(response.Objects);
    }

    [Fact]
    public async Task TestHybrid()
    {
        // Ensure data exists
        await TestInsertData();

        // START HybridExample
        var collection = client.Collections.Use("DemoCollection");

        // highlight-start
        var response = await collection.Query.Hybrid(
            "A holiday film", // The model provider integration will automatically vectorize the query
            limit: 2,
            returnMetadata: MetadataOptions.Distance
        );
        // highlight-end

        foreach (var o in response.Objects)
        {
            Console.WriteLine(o.Properties["title"]);
        }
        // END HybridExample

        Assert.NotEmpty(response.Objects);
    }
}
