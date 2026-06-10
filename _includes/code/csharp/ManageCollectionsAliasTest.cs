using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

public class ManageCollectionsAliasTest : IAsyncLifetime
{
    private WeaviateClient client;

    // Constant names to avoid typos
    private const string Articles = "Articles";
    private const string ArticlesV2 = "ArticlesV2";
    private const string ArticlesAlias = "ArticlesAlias";
    private const string ProductsV1 = "Products_v1";
    private const string ProductsV2 = "Products_v2";
    private const string ProductsAlias = "ProductsAlias";

    public async Task InitializeAsync()
    {
        // START ConnectToWeaviate
        // Connect to local Weaviate instance
        client = await Connect.Local();
        // END ConnectToWeaviate

        // Initial Cleanup to ensure clean state
        await CleanupResources();
    }

    public async Task DisposeAsync()
    {
        await CleanupResources();
    }

    private async Task CleanupResources()
    {
        // Cleanup aliases first
        await client.Alias.Delete(ArticlesAlias);
        await client.Alias.Delete(ProductsAlias);

        // Cleanup collections
        await client.Collections.Delete(Articles);
        await client.Collections.Delete(ArticlesV2);
        await client.Collections.Delete(ProductsV1);
        await client.Collections.Delete(ProductsV2);
    }

    [Fact]
    public async Task TestAliasBasicWorkflow()
    {
        // START CreateAlias
        // Create a collection first
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = Articles,
                VectorConfig = Configure.Vector("default", v => v.SelfProvided()),
                Properties = [Property.Text("title"), Property.Text("content")],
            }
        );

        // Create an alias pointing to the collection
        await client.Alias.Create(ArticlesAlias, Articles);
        // END CreateAlias

        // START ListAllAliases
        // Get all aliases in the instance
        var allAliases = await client.Alias.List();

        foreach (var entry in allAliases)
        {
            Console.WriteLine($"Alias: {entry.Name} -> Collection: {entry.TargetCollection}");
        }
        // END ListAllAliases

        // START ListCollectionAliases
        // Get all aliases pointing to a specific collection
        var collectionAliases = await client.Alias.List(Articles);

        foreach (var entry in collectionAliases)
        {
            Console.WriteLine($"Alias pointing to Articles: {entry.Name}");
        }
        // END ListCollectionAliases

        // START GetAlias
        // Get information about a specific alias
        var aliasInfo = await client.Alias.Get(aliasName: ArticlesAlias);

        if (aliasInfo != null)
        {
            Console.WriteLine($"Alias: {aliasInfo.Name}");
            Console.WriteLine($"Target collection: {aliasInfo.TargetCollection}");
        }
        // END GetAlias
        Assert.NotNull(aliasInfo);
        Assert.Equal(Articles, aliasInfo.TargetCollection);

        // START UpdateAlias
        // Create a new collection for migration
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = ArticlesV2,
                VectorConfig = Configure.Vector("default", v => v.Text2VecTransformers()),
                Properties =
                [
                    Property.Text("title"),
                    Property.Text("content"),
                    Property.Text("author"), // New field
                ],
            }
        );

        // Update the alias to point to the new collection
        bool success =
            (await client.Alias.Update(aliasName: ArticlesAlias, targetCollection: ArticlesV2))
            != null;

        if (success)
        {
            Console.WriteLine("Alias updated successfully");
        }
        // END UpdateAlias
        Assert.True(success);

        // Delete original collection to prove alias still works pointing to V2
        await client.Collections.Delete(Articles);

        // START UseAlias
        // Ensure the Articles collection exists (it might have been deleted in previous examples)
        // Note: In C# we check existence first to avoid errors if it already exists
        if (!await client.Collections.Exists(Articles))
        {
            await client.Collections.Create(
                new CollectionCreateParams
                {
                    Name = Articles,
                    VectorConfig = Configure.Vector("default", v => v.SelfProvided()),
                    Properties = [Property.Text("title"), Property.Text("content")],
                }
            );
        }
        // END UseAlias

        // START DeleteAlias
        // Delete an alias (the underlying collection remains)
        await client.Alias.Delete(aliasName: ArticlesAlias);
        // END DeleteAlias
        Assert.Null(await client.Alias.Get(ArticlesAlias));

        // Re-create alias for the usage example below (since we just deleted it)
        await client.Alias.Create(ArticlesAlias, Articles);

        // START UseAlias
        // Use the alias just like a collection name
        var articles = client.Collections.Use(ArticlesAlias);

        // Insert data using the alias
        await articles.Data.Insert(
            new
            {
                title = "Using Aliases in Weaviate",
                content = "Aliases make collection management easier...",
            }
        );

        // Query using the alias
        var results = await articles.Query.FetchObjects(limit: 5);

        foreach (var obj in results.Objects)
        {
            Console.WriteLine($"Found: {obj.Properties["title"]}");
        }
        // END UseAlias
        Assert.Single(results.Objects);
    }

    [Fact]
    public async Task TestZeroDowntimeMigration()
    {
        // START Step1CreateOriginal
        // Create original collection with data
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = ProductsV1,
                VectorConfig = Configure.Vector("default", v => v.Text2VecTransformers()),
            }
        );

        var productsV1 = client.Collections.Use(ProductsV1);

        // Batch insert works best with anonymous objects here
        await productsV1.Data.InsertMany(
            new[]
            {
                new { name = "Product A", price = 100 },
                new { name = "Product B", price = 200 },
            }
        );
        // END Step1CreateOriginal

        // START Step2CreateAlias
        // Create alias pointing to current collection
        await client.Alias.Create(ProductsAlias, ProductsV1);
        // END Step2CreateAlias

        // START MigrationUseAlias
        // Your application always uses the alias name "Products"
        var products = client.Collections.Use(ProductsAlias);

        // Insert data through the alias
        await products.Data.Insert(new { name = "Product C", price = 300 });

        // Query through the alias
        var results = await products.Query.FetchObjects(limit: 5);
        foreach (var obj in results.Objects)
        {
            Console.WriteLine(
                $"Product: {obj.Properties["name"]}, Price: ${obj.Properties["price"]}"
            );
        }
        // END MigrationUseAlias
        Assert.Equal(3, results.Objects.Count);

        // START Step3NewCollection
        // Create new collection with updated schema
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = ProductsV2,
                VectorConfig = Configure.Vector("default", v => v.SelfProvided()),
                Properties =
                [
                    Property.Text("name"),
                    Property.Number("price"),
                    Property.Text("category"), // New field
                ],
            }
        );
        // END Step3NewCollection

        // START Step4MigrateData
        // Migrate data to new collection
        var productsV2 = client.Collections.Use(ProductsV2);
        var oldData = (await productsV1.Query.FetchObjects()).Objects;

        foreach (var obj in oldData)
        {
            // Convert property values to primitives (string, double, etc.) explicitly.
            await productsV2.Data.Insert(
                new
                {
                    name = obj.Properties["name"].ToString(),
                    price = Convert.ToDouble(obj.Properties["price"].ToString()),
                    category = "General",
                }
            );
        }
        // END Step4MigrateData

        // START Step5UpdateAlias
        // Switch alias to new collection (instant switch!)
        await client.Alias.Update(aliasName: ProductsAlias, targetCollection: ProductsV2);

        // All queries using "Products" alias now use the new collection
        products = client.Collections.Use(ProductsAlias);
        var result = await products.Query.FetchObjects(limit: 1);

        // Will include the new "category" field
        Console.WriteLine(JsonSerializer.Serialize(result.Objects.First().Properties));
        // END Step5UpdateAlias

        Assert.True(result.Objects.First().Properties.ContainsKey("category"));

        // START Step6Cleanup
        // Clean up old collection after verification
        await client.Collections.Delete(ProductsV1);
        // END Step6Cleanup
        Assert.False(await client.Collections.Exists(ProductsV1));
    }
}
