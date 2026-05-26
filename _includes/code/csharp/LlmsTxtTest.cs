using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Weaviate.Client.Models.Generative;
using Xunit;

namespace WeaviateProject.Examples;

/// <summary>Runnable copies of the C# code snippets shown in llms.txt.</summary>
public class LlmsTxtTest
{
    private static Task<WeaviateClient> ConnectCloud() =>
        Connect.Cloud(
            Environment.GetEnvironmentVariable("WEAVIATE_URL"),
            Environment.GetEnvironmentVariable("WEAVIATE_API_KEY"));

    private static Task<WeaviateClient> ConnectCloudWithOpenAi() =>
        Connect.Cloud(
            Environment.GetEnvironmentVariable("WEAVIATE_URL"),
            Environment.GetEnvironmentVariable("WEAVIATE_API_KEY"),
            headers: new Dictionary<string, string>
            {
                { "X-OpenAI-Api-Key", Environment.GetEnvironmentVariable("OPENAI_API_KEY") }
            });

    [Fact]
    public async Task TestLocalConnection()
    {
        // START llms_local_connection
        WeaviateClient client = await Connect.Local();
        // END llms_local_connection
        Assert.True(await client.IsReady());
    }

    [Fact]
    public async Task TestCrud()
    {
        WeaviateClient client = await ConnectCloud();
        await client.Collections.Delete("Movie__CrudCs");
        await client.Collections.Create(new CollectionCreateParams { Name = "Movie__CrudCs", VectorConfig = Configure.Vector("default", v => v.Text2VecWeaviate()) });
        try
        {
            // START llms_crud
            var movies = client.Collections.Use("Movie__CrudCs");

            // Create — insert one object, returns its UUID
            Guid uuid = await movies.Data.Insert(new { title = "Inception", genre = "Science Fiction" });

            // Read — fetch the object by its UUID
            var obj = await movies.Query.FetchObjectByID(uuid);
            Console.WriteLine(obj?.Properties);

            // Update — merge new property values into the object
            await movies.Data.Update(uuid, new { genre = "Sci-Fi Thriller" });

            // Delete — remove the object by its UUID
            await movies.Data.DeleteByID(uuid);
            // END llms_crud

            Assert.Null(await movies.Query.FetchObjectByID(uuid));
        }
        finally { await client.Collections.Delete("Movie__CrudCs"); }
    }

    [Fact]
    public async Task TestQueries()
    {
        WeaviateClient client = await ConnectCloud();
        await client.Collections.Delete("Movie__QueriesCs");
        await client.Collections.Create(new CollectionCreateParams { Name = "Movie__QueriesCs", VectorConfig = Configure.Vector("default", v => v.Text2VecWeaviate()) });
        try
        {
            var col = client.Collections.Use("Movie__QueriesCs");
            await col.Data.InsertMany(new[]
            {
                new { title = "The animals of the savannah" },
                new { title = "A bowl of ramen and other street food" },
            });

            // START llms_queries
            // Vector search
            var vectorRes = await col.Query.NearText("animals in movies", limit: 3);
            // Keyword search
            var keywordRes = await col.Query.BM25("food", limit: 3);
            // END llms_queries

            Assert.True(keywordRes.Objects.Count >= 1);
            Assert.NotNull(vectorRes);
        }
        finally { await client.Collections.Delete("Movie__QueriesCs"); }
    }

    [Fact]
    public async Task TestFiltering()
    {
        WeaviateClient client = await ConnectCloud();
        await client.Collections.Delete("Restaurant__FilteringCs");
        try
        {
            // START llms_filtering_create_minimal
            // Minimal: auto-schema sets filterable + searchable defaults on every property
            await client.Collections.Create(new CollectionCreateParams { Name = "Restaurant__FilteringCs", VectorConfig = Configure.Vector("default", v => v.Text2VecWeaviate()) });
            // END llms_filtering_create_minimal

            await client.Collections.Delete("Restaurant__FilteringCs");

            // START llms_filtering_create_full
            // Full control: all options set explicitly
            await client.Collections.Create(new CollectionCreateParams
            {
                Name = "Restaurant__FilteringCs",
                VectorConfig = Configure.Vector("default", v => v.Text2VecWeaviate()),
                Properties =
                [
                    Property.Text("name"),
                    Property.Text("cuisine"),
                    Property.Text("url"),
                    Property.Number("price"),
                ],
            });
            // END llms_filtering_create_full

            var col = client.Collections.Use("Restaurant__FilteringCs");
            await col.Data.InsertMany(new[]
            {
                new { name = "Ramen House", cuisine = "Japanese", url = "https://a.example", price = 15 },
                new { name = "Sushi Bar", cuisine = "Japanese", url = "https://b.example", price = 25 },
                new { name = "Pasta Place", cuisine = "Italian", url = "https://c.example", price = 40 },
            });

            // START llms_filtering_query
            // Single condition
            var cheapRamen = await col.Query.Hybrid("ramen",
                filters: Filter.Property("price").IsLessThan(20), limit: 3);

            // Combine conditions with Filter.AllOf (AND) / Filter.AnyOf (OR)
            var japaneseUnder30 = await col.Query.FetchObjects(
                filters: Filter.AllOf(
                    Filter.Property("cuisine").IsEqual("Japanese"),
                    Filter.Property("price").IsLessThan(30)),
                limit: 5);
            // END llms_filtering_query

            Assert.Equal(2, japaneseUnder30.Objects.Count);
            Assert.NotNull(cheapRamen);
        }
        finally { await client.Collections.Delete("Restaurant__FilteringCs"); }
    }

    [Fact]
    public async Task TestMultiTenancy()
    {
        WeaviateClient client = await ConnectCloud();
        await client.Collections.Delete("Docs__MtCs");
        try
        {
            // START llms_multi_tenancy
            await client.Collections.Create(new CollectionCreateParams
            {
                Name = "Docs__MtCs",
                VectorConfig = Configure.Vector("default", v => v.Text2VecWeaviate()),
                MultiTenancyConfig = new MultiTenancyConfig { Enabled = true },
            });
            var col = client.Collections.Use("Docs__MtCs");
            await col.Tenants.Create(["tenantA", "tenantB"]);
            var tenantCol = col.WithTenant("tenantA");
            await tenantCol.Data.Insert(new { title = "Hello" });
            var res = await tenantCol.Query.Hybrid("hello", limit: 3);
            // END llms_multi_tenancy

            Assert.Single(res.Objects);
        }
        finally { await client.Collections.Delete("Docs__MtCs"); }
    }

    [Fact]
    public async Task TestNamedVectors()
    {
        WeaviateClient client = await ConnectCloud();
        await client.Collections.Delete("Article__NvCs");
        try
        {
            // START llms_named_vectors
            await client.Collections.Create(new CollectionCreateParams
            {
                Name = "Article__NvCs",
                VectorConfig = new VectorConfigList
                {
                    Configure.Vector("title", v => v.Text2VecWeaviate(), sourceProperties: ["title"]),
                    Configure.Vector("body", v => v.Text2VecWeaviate(), sourceProperties: ["body"]),
                },
                Properties = [Property.Text("title"), Property.Text("body")],
            });
            var col = client.Collections.Use("Article__NvCs");
            var res = await col.Query.NearText(
                query => query(["machine learning"]).TargetVectorsMinimum("title"), limit: 3);
            // END llms_named_vectors

            await col.Data.Insert(new { title = "Deep learning advances", body = "A study of neural networks." });
            await Task.Delay(2000);
            var res2 = await col.Query.NearText(
                query => query(["machine learning"]).TargetVectorsMinimum("title"), limit: 3);
            Assert.Single(res2.Objects);
            Assert.NotNull(res);
        }
        finally { await client.Collections.Delete("Article__NvCs"); }
    }

    [Fact]
    public async Task TestAggregations()
    {
        WeaviateClient client = await ConnectCloud();
        await client.Collections.Delete("Movie__AggsCs");
        await client.Collections.Create(new CollectionCreateParams
        {
            Name = "Movie__AggsCs",
            VectorConfig = Configure.Vector("default", v => v.Text2VecWeaviate()),
            Properties = [Property.Text("title"), Property.Text("genre"), Property.Number("rating")],
        });
        try
        {
            var movies = client.Collections.Use("Movie__AggsCs");
            await movies.Data.InsertMany(new[]
            {
                new { title = "The Matrix", genre = "Science Fiction", rating = 8.7 },
                new { title = "Spirited Away", genre = "Animation", rating = 8.6 },
                new { title = "Blade Runner", genre = "Science Fiction", rating = 8.1 },
            });

            // START llms_aggregations
            // Total object count
            var total = await movies.Aggregate.OverAll(totalCount: true);

            // Group object counts by a property
            var byGenre = await movies.Aggregate.OverAll(groupBy: new Aggregate.GroupBy("genre"));
            // END llms_aggregations

            Assert.Equal(3, total.TotalCount);
            Assert.Equal(2, byGenre.Groups.Count);
        }
        finally { await client.Collections.Delete("Movie__AggsCs"); }
    }

    [Fact]
    public async Task TestGenerative()
    {
        WeaviateClient client = await ConnectCloudWithOpenAi();
        await client.Collections.Delete("Movie__GenCs");
        await client.Collections.Create(new CollectionCreateParams { Name = "Movie__GenCs", VectorConfig = Configure.Vector("default", v => v.Text2VecWeaviate()) });
        try
        {
            var movies = client.Collections.Use("Movie__GenCs");
            await movies.Data.InsertMany(new[]
            {
                new { title = "The Matrix", genre = "Science Fiction" },
                new { title = "Blade Runner", genre = "Science Fiction" },
            });
            await Task.Delay(3000);

            // START llms_generative
            var response = await movies.Generate.NearText(
                "science fiction",
                limit: 2,
                provider: new Providers.OpenAI { Model = "gpt-4o-mini" },
                singlePrompt: new SinglePrompt("Write a one-line tagline for {title}"),
                groupedTask: new GroupedTask("In one sentence, what common theme do these movies share?"));

            // Per-object result from the single prompt
            foreach (var obj in response.Objects)
                Console.WriteLine(obj.Generative?.Values.First());
            // Combined result from the grouped task
            Console.WriteLine(response.Generative?.Values.First());
            // END llms_generative

            Assert.NotNull(response.Generative);
        }
        finally { await client.Collections.Delete("Movie__GenCs"); }
    }

    [Fact]
    public async Task TestRbac()
    {
        // RBAC requires an authenticated connection; the test instance runs on :8580
        WeaviateClient client = await Connect.Local(restPort: 8580, grpcPort: 50551, credentials: "root-user-key");
        try { await client.Roles.Delete("movie_reader"); } catch { /* not present */ }
        try { await client.Users.Db.Delete("alice"); } catch { /* not present */ }
        try
        {
            // START llms_rbac
            // Create a role scoped to one collection
            await client.Roles.Create("movie_reader", new PermissionScope[]
            {
                new Permissions.Collections("Movie") { Read = true },
                new Permissions.Data("Movie") { Read = true },
            });

            // Create a user and assign the role
            var apiKey = await client.Users.Db.Create("alice");
            await client.Users.Db.AssignRoles("alice", new[] { "movie_reader" });
            // END llms_rbac

            Assert.NotNull(await client.Roles.Get("movie_reader"));
            Assert.NotNull(apiKey);
        }
        finally
        {
            try { await client.Roles.Delete("movie_reader"); } catch { /* ignore */ }
            try { await client.Users.Db.Delete("alice"); } catch { /* ignore */ }
        }
    }
}
