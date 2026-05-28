using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

namespace WeaviateProject.Tests;

/// <summary>
/// Combined C# test suite covering all v1.37 tokenization features:
/// accent folding, custom stopword presets, and the /v1/tokenize endpoint.
/// </summary>
public class TokenizationTest : IAsyncLifetime
{
    private WeaviateClient client;

    public async Task InitializeAsync()
    {
        client = await Connect.Local();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    // ============================================================
    // Accent folding (asciiFold / asciiFoldIgnore)
    // ============================================================
    [Fact]
    public async Task TestAccentFolding()
    {
        const string COLLECTION = "AccentFoldingDemo";
        if (await client.Collections.Exists(COLLECTION))
            await client.Collections.Delete(COLLECTION);

        try
        {
            // START AccentFoldingCreateCollection
            await client.Collections.Create(
                new CollectionCreateParams
                {
                    Name = "AccentFoldingDemo",
                    Properties =
                    [
                        new Property
                        {
                            Name = "text_default",
                            DataType = DataType.Text,
                            PropertyTokenization = PropertyTokenization.Word,
                        },
                        new Property
                        {
                            Name = "text_folded",
                            DataType = DataType.Text,
                            PropertyTokenization = PropertyTokenization.Word,
                            TextAnalyzer = new TextAnalyzerConfig
                            {
                                AsciiFold = new AsciiFoldConfig(),
                            },
                        },
                        new Property
                        {
                            Name = "text_folded_keep_e",
                            DataType = DataType.Text,
                            PropertyTokenization = PropertyTokenization.Word,
                            TextAnalyzer = new TextAnalyzerConfig
                            {
                                AsciiFold = new AsciiFoldConfig(Ignore: ["é"]),
                            },
                        },
                    ],
                    VectorConfig = new VectorConfigList
                    {
                        Configure.Vector("default", v => v.SelfProvided()),
                    },
                }
            );
            // END AccentFoldingCreateCollection

            // START AccentFoldingAddObjects
            var products = client.Collections.Use("AccentFoldingDemo");

            string[] testStrings =
            [
                "Café Crème Bio",
                "Łódź Ceramics",
                "São Paulo Sandals",
                "Müller Bräu",
            ];

            foreach (var text in testStrings)
            {
                await products.Data.Insert(
                    new
                    {
                        text_default = text,
                        text_folded = text,
                        text_folded_keep_e = text,
                    }
                );
            }
            // END AccentFoldingAddObjects

            // START AccentFoldingFilter
            string[] queries = ["cafe", "Café", "lodz", "sao paulo", "muller"];
            string[] properties = ["text_default", "text_folded", "text_folded_keep_e"];

            foreach (var query in queries)
            {
                Console.WriteLine($"\nQuery: \"{query}\"");
                foreach (var prop in properties)
                {
                    var response = await products.Query.FetchObjects(
                        filters: Filter.Property(prop).IsEqual(query)
                    );
                    var matches = response
                        .Objects.Select(o => (string)o.Properties[prop])
                        .ToList();
                    Console.WriteLine(
                        $"  {prop}: {(matches.Count == 0 ? "no match" : string.Join(", ", matches))}"
                    );
                }
            }
            // END AccentFoldingFilter

            // Test: "cafe" matches folded but not default or keep_e
            var r = await products.Query.FetchObjects(
                filters: Filter.Property("text_folded").IsEqual("cafe")
            );
            Assert.Single(r.Objects);
            Assert.Equal("Café Crème Bio", (string)r.Objects.First().Properties["text_folded"]);

            r = await products.Query.FetchObjects(
                filters: Filter.Property("text_default").IsEqual("cafe")
            );
            Assert.Empty(r.Objects);

            r = await products.Query.FetchObjects(
                filters: Filter.Property("text_folded_keep_e").IsEqual("cafe")
            );
            Assert.Empty(r.Objects);

            // Test: "Café" matches all three
            foreach (var prop in properties)
            {
                var rr = await products.Query.FetchObjects(
                    filters: Filter.Property(prop).IsEqual("Café")
                );
                Assert.True(rr.Objects.Any(), $"Expected 'Café' to match on {prop}");
            }

            // Test: "lodz" matches folded and keep_e but not default
            r = await products.Query.FetchObjects(
                filters: Filter.Property("text_folded").IsEqual("lodz")
            );
            Assert.Single(r.Objects);
            Assert.Contains("Łódź", (string)r.Objects.First().Properties["text_folded"]);

            r = await products.Query.FetchObjects(
                filters: Filter.Property("text_default").IsEqual("lodz")
            );
            Assert.Empty(r.Objects);

            r = await products.Query.FetchObjects(
                filters: Filter.Property("text_folded_keep_e").IsEqual("lodz")
            );
            Assert.Single(r.Objects);

            // Test: "muller" matches folded but not default
            r = await products.Query.FetchObjects(
                filters: Filter.Property("text_folded").IsEqual("muller")
            );
            Assert.Single(r.Objects);
            Assert.Contains("Müller", (string)r.Objects.First().Properties["text_folded"]);

            r = await products.Query.FetchObjects(
                filters: Filter.Property("text_default").IsEqual("muller")
            );
            Assert.Empty(r.Objects);
        }
        finally
        {
            if (await client.Collections.Exists(COLLECTION))
                await client.Collections.Delete(COLLECTION);
        }
    }

    // ============================================================
    // Custom and per-property stopword presets
    // ============================================================
    [Fact]
    public async Task TestCustomStopwords()
    {
        const string COLLECTION = "StopwordsDemo";
        if (await client.Collections.Exists(COLLECTION))
            await client.Collections.Delete(COLLECTION);

        try
        {
            // START CustomStopwordsCreate
            var presets = new Dictionary<string, IList<string>>
            {
                ["fr"] = ["le", "la", "les", "un", "une", "des", "du", "de", "et"],
            };

            await client.Collections.Create(
                new CollectionCreateParams
                {
                    Name = "StopwordsDemo",
                    InvertedIndexConfig = new InvertedIndexConfig { StopwordPresets = presets },
                    Properties =
                    [
                        new Property
                        {
                            Name = "name_en",
                            DataType = DataType.Text,
                            PropertyTokenization = PropertyTokenization.Word,
                            TextAnalyzer = new TextAnalyzerConfig { StopwordPreset = "en" },
                        },
                        new Property
                        {
                            Name = "name_fr",
                            DataType = DataType.Text,
                            PropertyTokenization = PropertyTokenization.Word,
                            TextAnalyzer = new TextAnalyzerConfig { StopwordPreset = "fr" },
                        },
                    ],
                    VectorConfig = new VectorConfigList
                    {
                        Configure.Vector("default", v => v.SelfProvided()),
                    },
                }
            );
            // END CustomStopwordsCreate

            // START CustomStopwordsAddObjects
            var products = client.Collections.Use("StopwordsDemo");

            await products.Data.Insert(
                new
                {
                    name_en = "The Blue Cup and the Bowl",
                    name_fr = "La Tasse Bleue et le Bol",
                }
            );
            await products.Data.Insert(
                new
                {
                    name_en = "A Red Plate with the Saucer",
                    name_fr = "Une Assiette Rouge avec la Soucoupe",
                }
            );
            // END CustomStopwordsAddObjects

            // START CustomStopwordsSearch
            var responseFr = await products.Query.BM25(
                query: "la tasse bleue et le bol",
                searchFields: ["name_fr"],
                returnMetadata: MetadataOptions.Score
            );

            Console.WriteLine("French property search:");
            foreach (var o in responseFr.Objects)
            {
                Console.WriteLine(
                    $"  {o.Properties["name_fr"]} (score: {o.Metadata.Score})"
                );
            }

            var responseEn = await products.Query.BM25(
                query: "la tasse bleue et le bol",
                searchFields: ["name_en"],
                returnMetadata: MetadataOptions.Score
            );

            Console.WriteLine("\nEnglish property search:");
            foreach (var o in responseEn.Objects)
            {
                Console.WriteLine(
                    $"  {o.Properties["name_en"]} (score: {o.Metadata.Score})"
                );
            }
            // END CustomStopwordsSearch

            // Test: French search finds the matching document
            Assert.Single(responseFr.Objects);
            Assert.Equal(
                "La Tasse Bleue et le Bol",
                (string)responseFr.Objects.First().Properties["name_fr"]
            );
            Assert.True(responseFr.Objects.First().Metadata.Score > 0);

            // Test: English property doesn't match French content
            var enOnEn = await products.Query.BM25(
                query: "la tasse bleue et le bol",
                searchFields: ["name_en"]
            );
            Assert.Empty(enOnEn.Objects);

            // Test: French property doesn't match English content
            var enOnFr = await products.Query.BM25(
                query: "blue cup bowl",
                searchFields: ["name_fr"]
            );
            Assert.Empty(enOnFr.Objects);

            // Test: "la" alone shouldn't score on French property — it's a stopword
            var laResponse = await products.Query.BM25(
                query: "la",
                searchFields: ["name_fr"]
            );
            Assert.Empty(laResponse.Objects);
        }
        finally
        {
            if (await client.Collections.Exists(COLLECTION))
                await client.Collections.Delete(COLLECTION);
        }
    }

    // ============================================================
    // /v1/tokenize endpoint — freeform
    // ============================================================
    [Fact]
    public async Task TestTokenizeFreeform()
    {
        // START TokenizeEndpointFreeform
        // Ad-hoc tokenization with custom config
        var result = await client.Tokenize.Text(
            text: "The organic café crème blend",
            tokenization: PropertyTokenization.Word,
            analyzerConfig: new TextAnalyzerConfig
            {
                AsciiFold = new AsciiFoldConfig(),
                StopwordPreset = "en",
            }
        );

        Console.WriteLine($"indexed: [{string.Join(", ", result.Indexed)}]");
        Console.WriteLine($"query:   [{string.Join(", ", result.Query)}]");
        // END TokenizeEndpointFreeform

        // Test: accent folding converts café→cafe, crème→creme
        Assert.Contains("cafe", result.Indexed);
        Assert.Contains("creme", result.Indexed);
        // Test: stopword "the" is in indexed but not in query
        Assert.Contains("the", result.Indexed);
        Assert.DoesNotContain("the", result.Query);
        // Test: non-stopwords are in both
        Assert.Contains("organic", result.Indexed);
        Assert.Contains("organic", result.Query);
    }

    // ============================================================
    // /v1/tokenize endpoint — with custom preset
    // ============================================================
    [Fact]
    public async Task TestTokenizeCustomPreset()
    {
        // START TokenizeEndpointCustomPreset
        // Define a named "fr" preset and reference it from analyzer config.
        // stopwordPresets is mutually exclusive with stopwords — pass at most one.
        var presets = new Dictionary<string, IList<string>>
        {
            ["fr"] = ["le", "la", "les", "un", "une", "des", "du", "de", "et"],
        };

        var result = await client.Tokenize.Text(
            text: "La Tasse Bleue et le Bol",
            tokenization: PropertyTokenization.Word,
            analyzerConfig: new TextAnalyzerConfig { StopwordPreset = "fr" },
            stopwordPresets: presets
        );

        Console.WriteLine($"indexed: [{string.Join(", ", result.Indexed)}]");
        Console.WriteLine($"query:   [{string.Join(", ", result.Query)}]");
        // END TokenizeEndpointCustomPreset

        // Test: French stopwords are indexed but removed from query
        Assert.Contains("la", result.Indexed);
        Assert.Contains("et", result.Indexed);
        Assert.Contains("le", result.Indexed);
        Assert.DoesNotContain("la", result.Query);
        Assert.DoesNotContain("et", result.Query);
        Assert.DoesNotContain("le", result.Query);
        Assert.Contains("tasse", result.Query);
        Assert.Contains("bleue", result.Query);
        Assert.Contains("bol", result.Query);
    }

    // ============================================================
    // /v1/tokenize endpoint — for an existing property's config
    // ============================================================
    [Fact]
    public async Task TestTokenizeForProperty()
    {
        const string COLLECTION = "TokenizeDemo";
        if (await client.Collections.Exists(COLLECTION))
            await client.Collections.Delete(COLLECTION);

        try
        {
            var presets = new Dictionary<string, IList<string>>
            {
                ["fr"] = ["le", "la", "les", "un", "une", "des", "du", "de", "et"],
            };

            await client.Collections.Create(
                new CollectionCreateParams
                {
                    Name = COLLECTION,
                    InvertedIndexConfig = new InvertedIndexConfig { StopwordPresets = presets },
                    Properties =
                    [
                        new Property
                        {
                            Name = "name_fr",
                            DataType = DataType.Text,
                            PropertyTokenization = PropertyTokenization.Word,
                            TextAnalyzer = new TextAnalyzerConfig { StopwordPreset = "fr" },
                        },
                    ],
                    VectorConfig = new VectorConfigList
                    {
                        Configure.Vector("default", v => v.SelfProvided()),
                    },
                }
            );

            // START TokenizeEndpointProperty
            // Tokenize using an existing property's configuration
            var collection = client.Collections.Use(COLLECTION);
            var result = await collection.Tokenize.Property(
                propertyName: "name_fr",
                text: "La Tasse Bleue et le Bol"
            );

            Console.WriteLine($"indexed: [{string.Join(", ", result.Indexed)}]");
            Console.WriteLine($"query:   [{string.Join(", ", result.Query)}]");
            // END TokenizeEndpointProperty

            // Test: all words are indexed (stopwords are still stored)
            Assert.Contains("la", result.Indexed);
            Assert.Contains("et", result.Indexed);
            Assert.Contains("le", result.Indexed);
            Assert.Contains("tasse", result.Indexed);
            Assert.Contains("bleue", result.Indexed);
            Assert.Contains("bol", result.Indexed);
            // Test: French stopwords are removed from query tokens
            Assert.DoesNotContain("la", result.Query);
            Assert.DoesNotContain("et", result.Query);
            Assert.DoesNotContain("le", result.Query);
            // Test: non-stopwords remain in query tokens
            Assert.Contains("tasse", result.Query);
            Assert.Contains("bleue", result.Query);
            Assert.Contains("bol", result.Query);
            Assert.Equal(6, result.Indexed.Count);
            Assert.Equal(3, result.Query.Count);
        }
        finally
        {
            if (await client.Collections.Exists(COLLECTION))
                await client.Collections.Delete(COLLECTION);
        }
    }
}
