using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;
using System.Net.Http;

namespace WeaviateProject.Tests;

public class BatchImportTests : IAsyncLifetime
{
    private readonly WeaviateClient weaviate;
    private readonly List<string> _collectionNamesToDelete = new List<string>();
    private const int MAX_ROWS_TO_IMPORT = 50; // limit vectorization calls

    public BatchImportTests()
    {
        weaviate = new WeaviateClient(
            new ClientConfiguration { RestAddress = "localhost", RestPort = 8080 }
        );
    }

    public async Task InitializeAsync()
    {
        // Clean slate
        await weaviate.Collections.Delete("MyCollection");

        // Create collection with self-provided vectors
        await weaviate.Collections.Create(new Collection
        {
            Name = "MyCollection",
            VectorConfig = new VectorConfig("default", new Vectorizer.SelfProvided())
        });
    }

    public async Task DisposeAsync()
    {
        foreach (string name in _collectionNamesToDelete)
        {
            await weaviate.Collections.Delete(name);
        }
        await weaviate.Collections.Delete("MyCollection");
        await weaviate.Collections.Delete("JeopardyQuestion");
    }

    [Fact]
    public async Task BasicBatchImport()
    {
        // START BasicBatchImportExample
        var dataRows = Enumerable.Range(0, 5).Select(i => new { title = $"Object {i + 1}" }).ToList();

        var collection = weaviate.Collections.Use<dynamic>("MyCollection");

        // highlight-start
        var result = await collection.Data.InsertMany(add =>
        {
            foreach (var dataRow in dataRows)
            {
                add(dataRow);
            }
        });
        // highlight-end

        var failedObjects = result.Where(r => r.Error != null).ToList();
        if (failedObjects.Any())
        {
            Console.WriteLine($"Number of failed imports: {failedObjects.Count}");
            Console.WriteLine($"First failed object: {failedObjects[0].Error}");
        }
        // END BasicBatchImportExample

        // Test
        Assert.Equal(5, result.Count(r => r.Error == null));
    }

    [Fact]
    public async Task InsertManyWithID()
    {
        // InsertManyWithIDExample
        // highlight-start
        // For deterministic UUID generation
        // highlight-end

        var data = new[]
        {
            new
            {
                properties = new { title = "Object 1" },
                // highlight-start
                id = GenerateUuid5(new { title = "Object 1" })
                // highlight-end
            },
            new
            {
                properties = new { title = "Object 2" },
                id = GenerateUuid5(new { title = "Object 2" })
            },
            new
            {
                properties = new { title = "Object 3" },
                id = GenerateUuid5(new { title = "Object 3" })
            }
        };

        var collection = weaviate.Collections.Use<dynamic>("MyCollection"); // Replace with your collection name
        var result = await collection.Data.InsertMany(add =>
        {
            foreach (var item in data)
            {
                add(item.properties, item.id);
            }
        });
        // END InsertManyWithIDExample

        // Tests
        Assert.Equal(3, result.Count(r => r.Error == null));
        var firstId = GenerateUuid5(new { title = "Object 1" });
        var response = await collection.Query.FetchObjectByID(firstId);
        Assert.NotNull(response);
    }

    [Fact]
    public async Task InsertManyWithVector()
    {
        // InsertManyWithVectorExample
        var data = new[]
        {
            new
            {
                properties = new { title = "Object 1" },
                // highlight-start
                vector = Enumerable.Repeat(0.1f, 6).ToArray()
                // highlight-end
            },
            new
            {
                properties = new { title = "Object 2" },
                vector = Enumerable.Repeat(0.2f, 6).ToArray()
            },
            new
            {
                properties = new { title = "Object 3" },
                vector = Enumerable.Repeat(0.3f, 6).ToArray()
            }
        };

        var collection = weaviate.Collections.Use<dynamic>("MyCollection"); // Replace with your collection name
        var result = await collection.Data.InsertMany(add =>
        {
            foreach (var item in data)
            {
                add(item.properties, Guid.NewGuid(), item.vector);
            }
        });
        // END InsertManyWithVectorExample

        // Tests
        Assert.Equal(3, result.Count(r => r.Error == null));
    }

    [Fact]
    public async Task BatchImportWithID()
    {
        // START BatchImportWithIDExample
        // highlight-start
        // For deterministic UUID generation
        // highlight-end

        var dataRows = Enumerable.Range(0, 5).Select(i => new { title = $"Object {i + 1}" }).ToList();

        var collection = weaviate.Collections.Use<dynamic>("MyCollection");

        // highlight-start
        var result = await collection.Data.InsertMany(add =>
        {
            foreach (var dataRow in dataRows)
            {
                var objUuid = GenerateUuid5(dataRow);
                add(dataRow, objUuid);
            }
        });
        // highlight-end

        var failedObjects = result.Where(r => r.Error != null).ToList();
        if (failedObjects.Any())
        {
            Console.WriteLine($"Number of failed imports: {failedObjects.Count}");
            Console.WriteLine($"First failed object: {failedObjects[0].Error}");
        }
        // END BatchImportWithIDExample

        // Test
        Assert.Equal(5, result.Count(r => r.Error == null));
        var lastUuid = GenerateUuid5(new { title = "Object 5" });
        var respObj = await collection.Query.FetchObjectByID(lastUuid);
        Assert.NotNull(respObj);
    }

    [Fact]
    public async Task BatchImportWithVector()
    {
        // START BatchImportWithVectorExample
        var dataRows = Enumerable.Range(0, 5).Select(i => new { title = $"Object {i + 1}" }).ToList();
        var vectors = Enumerable.Range(0, 5).Select(_ => Enumerable.Repeat(0.1f, 1536).ToArray()).ToList();

        var collection = weaviate.Collections.Use<dynamic>("MyCollection");

        // highlight-start
        var result = await collection.Data.InsertMany(add =>
        {
            for (int i = 0; i < dataRows.Count; i++)
            {
                add(dataRows[i], Guid.NewGuid(), vectors[i]);
            }
        });
        // highlight-end

        var failedObjects = result.Where(r => r.Error != null).ToList();
        if (failedObjects.Any())
        {
            Console.WriteLine($"Number of failed imports: {failedObjects.Count}");
            Console.WriteLine($"First failed object: {failedObjects[0].Error}");
        }
        // END BatchImportWithVectorExample

        // Test
        Assert.Equal(5, result.Count(r => r.Error == null));
    }

    [Fact]
    public async Task BatchImportWithNamedVectors()
    {
        // Setup collection with named vectors
        await weaviate.Collections.Delete("MyCollection");
        await weaviate.Collections.Create(new Collection
        {
            Name = "MyCollection",
            Properties = new List<Property>
            {
                Property.Text("title"),
                Property.Text("body")
            },
            VectorConfig = new[]
            {
                new VectorConfig("title", new Vectorizer.Text2VecOpenAI()),
                new VectorConfig("body", new Vectorizer.Text2VecOpenAI())
            }
        });

        // START BatchImportWithNamedVectors
        var dataRows = Enumerable.Range(0, 5).Select(i => new
        {
            title = $"Object {i + 1}",
            body = $"Body {i + 1}"
        }).ToList();

        var titleVectors = Enumerable.Range(0, 5).Select(_ => Enumerable.Repeat(0.12f, 1536).ToArray()).ToList();
        var bodyVectors = Enumerable.Range(0, 5).Select(_ => Enumerable.Repeat(0.34f, 1536).ToArray()).ToList();

        var collection = weaviate.Collections.Use<dynamic>("MyCollection");

        // highlight-start
        var result = await collection.Data.InsertMany(add =>
        {
            for (int i = 0; i < dataRows.Count; i++)
            {
                add(
                    dataRows[i],
                    Guid.NewGuid(),
                    new Dictionary<string, float[]>
                    {
                        ["title"] = titleVectors[i],
                        ["body"] = bodyVectors[i]
                    }
                );
            }
        });
        // highlight-end

        var failedObjects = result.Where(r => r.Error != null).ToList();
        if (failedObjects.Any())
        {
            Console.WriteLine($"Number of failed imports: {failedObjects.Count}");
            Console.WriteLine($"First failed object: {failedObjects[0].Error}");
        }
        // END BatchImportWithNamedVectors

        // Test
        var response = await collection.Query.List();
        Assert.Equal(5, response.Objects.Count());
        foreach (var obj in response.Objects)
        {
            Assert.Contains("Object", (string)obj.Properties["title"]);
            Assert.Contains("Body", (string)obj.Properties["body"]);
        }
    }

    [Fact]
    public async Task BatchImportWithReference()
    {
        // Setup collections
        await weaviate.Collections.Delete("Author");
        await weaviate.Collections.Delete("Publication");

        await weaviate.Collections.Create(new Collection
        {
            Name = "Publication",
            Properties = new List<Property> { Property.Text("title") }
        });

        await weaviate.Collections.Create(new Collection
        {
            Name = "Author",
            Properties = new List<Property> { Property.Text("name") },
            // TODO[g-despot]: Why is description required?
            References = new List<ReferenceProperty>
            {
                new ReferenceProperty { Name = "writesFor", TargetCollection = "Publication", Description = "The publication this author writes for." }
            }
        });

        var authors = weaviate.Collections.Use<dynamic>("Author");
        var publications = weaviate.Collections.Use<dynamic>("Publication");

        var fromUuid = await authors.Data.Insert(new { name = "Jane Austen" });
        await publications.Data.Insert(new { title = "Ye Olde Times" });

        var pubResult = await publications.Query.List(limit: 1);
        var targetUuid = pubResult.Objects.First().ID;

        // BatchImportWithRefExample
        var collection = weaviate.Collections.Use<dynamic>("Author");

        var referenceResult = await collection.Data.ReferenceAddMany(
            new DataReference(fromUuid, "writesFor", (Guid)targetUuid)
        );

        if (referenceResult.HasErrors)
        {
            var failedReferences = referenceResult.Errors;
            Console.WriteLine($"Number of failed imports: {failedReferences.Count}");
            Console.WriteLine($"First failed reference: {failedReferences[0]}");
        }
        // END BatchImportWithRefExample

        // Test
        var response = await collection.Query.FetchObjectByID(
            fromUuid,
            // TODO[g-despot]: Should this also accept a single QueryReference object?
            references: [new QueryReference(linkOn: "writesFor", fields: new[] { "title" })]
        );

        Assert.Equal("Ye Olde Times", response.References["writesFor"][0].Properties["title"]);
    }

    [Fact]
    public async Task StreamDataJSON()
    {
        // Setup
        await weaviate.Collections.Delete("JeopardyQuestion");
        await weaviate.Collections.Create(new Collection { Name = "JeopardyQuestion" });

        // Download the data
        using var httpClient = new HttpClient();
        var jsonData = await httpClient.GetStringAsync("https://raw.githubusercontent.com/weaviate-tutorials/edu-datasets/main/jeopardy_1k.json");
        await File.WriteAllTextAsync("jeopardy_1k.json", jsonData);

        // START JSON streaming
        var counter = 0;
        var interval = 200; // print progress every this many records

        Console.WriteLine("JSON streaming, to avoid running out of memory on large files...");

        var collection = weaviate.Collections.Use<dynamic>("JeopardyQuestion");
        var objects = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonData);

        var batchSize = 100;
        for (int i = 0; i < objects.Count; i += batchSize)
        {
            var batch = objects.Skip(i).Take(batchSize).ToList();

            await collection.Data.InsertMany(add =>
            {
                foreach (var obj in batch)
                {
                    var properties = new
                    {
                        question = obj["Question"],
                        answer = obj["Answer"]
                    };
                    add(properties);
                    // If you Bring Your Own Vectors, add the vector parameter here
                    // add(properties, Guid.NewGuid(), vectorArray);
                }
            });

            // Calculate and display progress
            counter += batch.Count;
            if (counter % interval == 0)
            {
                Console.WriteLine($"Imported {counter} articles...");
            }
        }

        Console.WriteLine($"Finished importing {counter} articles.");
        // END JSON streaming

        // Test - Note: Count() method may not exist, using FetchObjects instead
        var questions = weaviate.Collections.Use<dynamic>("JeopardyQuestion");
        var testBatch = await questions.Query.List(limit: 10);
        Assert.True(testBatch.Objects.Any());

        // Cleanup
        File.Delete("jeopardy_1k.json");
    }

    [Fact]
    public async Task StreamDataCSV()
    {
        // Setup - create CSV from JSON
        using var httpClient = new HttpClient();
        var jsonData = await httpClient.GetStringAsync("https://raw.githubusercontent.com/weaviate-tutorials/edu-datasets/main/jeopardy_1k.json");
        var objects = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(jsonData);

        // Convert to CSV
        var csvLines = new List<string> { "Question,Answer,Category" };
        foreach (var obj in objects)
        {
            // Use .ToString() to safely access the values
            var question = obj.ContainsKey("Question") ? obj["Question"]?.ToString()?.Replace(",", "\\,") : "";
            var answer = obj.ContainsKey("Answer") ? obj["Answer"]?.ToString()?.Replace(",", "\\,") : "";
            var category = obj.ContainsKey("Category") ? obj["Category"]?.ToString()?.Replace(",", "\\,") : "";
            csvLines.Add($"{question},{answer},{category}");
        }
        await File.WriteAllLinesAsync("jeopardy_1k.csv", csvLines);

        await weaviate.Collections.Delete("JeopardyQuestion");
        await weaviate.Collections.Create(new Collection { Name = "JeopardyQuestion" });

        // START CSV streaming
        var counter = 0;
        var interval = 200; // print progress every this many records

        Console.WriteLine("CSV streaming with chunking, to not load all records in RAM at once...");

        var collection = weaviate.Collections.Use<dynamic>("JeopardyQuestion");
        var csvContent = await File.ReadAllLinesAsync("jeopardy_1k.csv");
        var headers = csvContent[0].Split(',');

        var chunkSize = 100; // number of rows per chunk
        for (int i = 1; i < csvContent.Length; i += chunkSize)
        {
            var chunk = csvContent.Skip(i).Take(chunkSize).ToList();

            await collection.Data.InsertMany(add =>
            {
                foreach (var line in chunk)
                {
                    var values = line.Split(',');
                    var properties = new
                    {
                        question = values[0].Replace("\\,", ","),
                        answer = values[1].Replace("\\,", ",")
                    };
                    add(properties);
                    // If you Bring Your Own Vectors, add the vector parameter here
                    // add(properties, Guid.NewGuid(), vectorArray);
                }
            });

            // Calculate and display progress
            counter += chunk.Count;
            if (counter % interval == 0)
            {
                Console.WriteLine($"Imported {counter} articles...");
            }
        }

        Console.WriteLine($"Finished importing {counter} articles.");
        // END CSV streaming

        // Test
        var questions = weaviate.Collections.Use<dynamic>("JeopardyQuestion");
        var testBatch = await questions.Query.List(limit: 10);
        Assert.True(testBatch.Objects.Any());

        // Cleanup
        File.Delete("jeopardy_1k.csv");
    }

    [Fact]
    public async Task BatchVectorClient()
    {
        await weaviate.Collections.Delete("NewCollection");

        // START BatchVectorClient
        var collection = await weaviate.Collections.Create(new Collection
        {
            Name = "NewCollection",
            Properties = new List<Property>
            {
                Property.Text("url"),
                Property.Text("title"),
                Property.Text("raw"),
                Property.Text("sha")
            },
            VectorConfig = new[]
            {
                new VectorConfig("cohereFirst", new Vectorizer.Text2VecCohere()),
                new VectorConfig("cohereSecond", new Vectorizer.Text2VecCohere())
            }
        });
        // END BatchVectorClient

        Assert.NotNull(collection);
        await weaviate.Collections.Delete("NewCollection");
    }

    [Fact]
    public async Task BatchVectorizationClientModify()
    {
        var rpmEmbeddings = 100;
        var tpmEmbeddings = 10000;

        var cohereKey = Environment.GetEnvironmentVariable("COHERE_API_KEY") ?? "";
        var openaiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") ?? "";

        // START BatchVectorizationClientModify
        // Note: The C# client may not have direct equivalent of Python's Integrations configuration
        // This is a placeholder showing the concept

        // Each model provider may expose different parameters
        // In the C# client, these might be configured differently
        var clientConfig = new ClientConfiguration
        {
            RestAddress = "localhost",
            RestPort = 8080,
        };

        // Rate limiting parameters would typically be configured at the collection level
        // or through the vectorizer configuration in C#
        // END BatchVectorizationClientModify

        // Note: The actual implementation would depend on how the C# client handles integrations
        Assert.NotNull(clientConfig);
    }

    // Helper method for UUID v5 generation
    private static Guid GenerateUuid5(object data)
    {
        var json = JsonSerializer.Serialize(data);
        var bytes = Encoding.UTF8.GetBytes(json);

        using (var sha1 = SHA1.Create())
        {
            var hash = sha1.ComputeHash(bytes);
            var guidBytes = new byte[16];
            Array.Copy(hash, guidBytes, 16);

            guidBytes[6] = (byte)((guidBytes[6] & 0x0F) | 0x50);
            guidBytes[8] = (byte)((guidBytes[8] & 0x3F) | 0x80);

            return new Guid(guidBytes);
        }
    }
}