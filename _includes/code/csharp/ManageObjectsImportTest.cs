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
using System.Globalization;
using CsvHelper;

namespace WeaviateProject.Tests;

[Collection("Sequential")]
public class ManageObjectsImportTest : IAsyncLifetime
{
    private static readonly WeaviateClient client;
    private const string JsonDataFile = "jeopardy_1k.json";
    private const string CsvDataFile = "jeopardy_1k.csv";

    // Static constructor for one-time setup (like @BeforeAll)
    static ManageObjectsImportTest()
    {
        // START INSTANTIATION-COMMON
        string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrWhiteSpace(openaiApiKey))
        {
            throw new ArgumentException("Please set the OPENAI_API_KEY environment variable.");
        }

        client = Connect.Local().GetAwaiter().GetResult();
        // END INSTANTIATION-COMMON
    }

    // A helper method to generate a deterministic UUID from a seed
    private static Guid GenerateUuid5(string seed)
    {
        var namespaceId = Guid.Empty;
        var namespaceBytes = namespaceId.ToByteArray();
        var nameBytes = Encoding.UTF8.GetBytes(seed);

        var combinedBytes = new byte[namespaceBytes.Length + nameBytes.Length];
        Buffer.BlockCopy(namespaceBytes, 0, combinedBytes, 0, namespaceBytes.Length);
        Buffer.BlockCopy(nameBytes, 0, combinedBytes, namespaceBytes.Length, nameBytes.Length);

        using (var sha1 = SHA1.Create())
        {
            var hash = sha1.ComputeHash(combinedBytes);
            var newGuid = new byte[16];
            Array.Copy(hash, 0, newGuid, 0, 16);

            newGuid[6] = (byte)((newGuid[6] & 0x0F) | (5 << 4));
            newGuid[8] = (byte)((newGuid[8] & 0x3F) | 0x80);

            (newGuid[0], newGuid[3]) = (newGuid[3], newGuid[0]);
            (newGuid[1], newGuid[2]) = (newGuid[2], newGuid[1]);
            (newGuid[4], newGuid[5]) = (newGuid[5], newGuid[4]);
            (newGuid[6], newGuid[7]) = (newGuid[7], newGuid[6]);

            return new Guid(newGuid);
        }
    }

    // Runs once before any tests in the class
    public async Task InitializeAsync()
    {
        using var httpClient = new HttpClient();
        var jsonData = await httpClient.GetStreamAsync("https://raw.githubusercontent.com/weaviate-tutorials/edu-datasets/main/jeopardy_1k.json");
        using var fileStream = new FileStream(JsonDataFile, FileMode.Create, FileAccess.Write);
        await jsonData.CopyToAsync(fileStream);
    }

    // Runs once after all tests in the class
    public async Task DisposeAsync()
    {
        await client.Collections.DeleteAll();
        File.Delete(JsonDataFile);
        if (File.Exists(CsvDataFile)) File.Delete(CsvDataFile);
    }

    private async Task BeforeEach()
    {
        await client.Collections.DeleteAll();
    }

    [Fact]
    public async Task TestBasicBatchImport()
    {
        await BeforeEach();
        await client.Collections.Create(new CollectionConfig
        {
            Name = "MyCollection",
            VectorConfig = new VectorConfig("default", new Vectorizer.SelfProvided())
        });

        // START BasicBatchImportExample
        var dataRows = Enumerable.Range(0, 5).Select(i => new { title = $"Object {i + 1}" }).ToList();

        var collection = client.Collections.Use("MyCollection");

        // The Java client uses insertMany for batching.
        // There is no direct equivalent of the Python client's stateful batch manager.
        // You collect objects and send them in a single request.
        // highlight-start
        var response = await collection.Data.InsertMany(dataRows);
        // highlight-end

        var failedObjects = response.Where(r => r.Error != null).ToList();
        if (failedObjects.Any())
        {
            Console.WriteLine($"Number of failed imports: {failedObjects.Count}");
            Console.WriteLine($"First failed object: {failedObjects.First().Error}");
        }
        // END BasicBatchImportExample

        var result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(5, result.TotalCount);
    }

    // START ServerSideBatchImportExample
    // Coming soon
    // END ServerSideBatchImportExample

    [Fact]
    public async Task TestBatchImportWithID()
    {
        await BeforeEach();
        await client.Collections.Create(new CollectionConfig
        {
            Name = "MyCollection",
            VectorConfig = new VectorConfig("default", new Vectorizer.SelfProvided())
        });

        // START BatchImportWithIDExample
        var dataToInsert = new List<(object properties, Guid uuid)>();
        for (int i = 0; i < 5; i++)
        {
            var dataRow = new { title = $"Object {i + 1}" };
            var objUuid = GenerateUuid5(JsonSerializer.Serialize(dataRow));
            dataToInsert.Add((dataRow, objUuid));
        }

        var collection = client.Collections.Use("MyCollection");

        // highlight-start
        var response = await collection.Data.InsertMany(dataToInsert);
        // highlight-end

        var failedObjects = response.Where(r => r.Error != null).ToList();
        if (failedObjects.Any())
        {
            Console.WriteLine($"Number of failed imports: {failedObjects.Count}");
            Console.WriteLine($"First failed object: {failedObjects.First().Error}");
        }
        // END BatchImportWithIDExample

        var result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(5, result.TotalCount);
        var lastUuid = dataToInsert[4].uuid;
        Assert.NotNull(await collection.Query.FetchObjectByID(lastUuid));
    }

    [Fact]
    public async Task TestBatchImportWithVector()
    {
        await BeforeEach();
        await client.Collections.Create(new CollectionConfig
        {
            Name = "MyCollection",
            VectorConfig = new VectorConfig("default", new Vectorizer.SelfProvided())
        });

        // START BatchImportWithVectorExample
        var dataToInsert = new List<BatchInsertRequest>();
        var vectorData = Enumerable.Repeat(0.1f, 10).ToArray();

        for (int i = 0; i < 5; i++)
        {
            var dataRow = new { title = $"Object {i + 1}" };
            var objUuid = GenerateUuid5(JsonSerializer.Serialize(dataRow));

            // 1. Use 'Vector' instead of 'VectorData'
            // 2. Use dictionary initializer syntax for 'Vectors'
            var vectors = new Vectors
        {
            { "default", vectorData }
        };

            // 3. Pass arguments to the constructor (Data is required)
            // Signature: BatchInsertRequest(TData data, Guid? id = null, Vectors? vectors = null, ...)
            dataToInsert.Add(new BatchInsertRequest(
                dataRow,
                objUuid,
                vectors
            ));
        }

        var collection = client.Collections.Use("MyCollection");

        var response = await collection.Data.InsertMany(dataToInsert);

        // Handle errors (response.Errors is a Dictionary<int, string>)
        if (response.Errors.Any())
        {
            Console.WriteLine($"Number of failed imports: {response.Errors.Count()}");
            Console.WriteLine($"First failed object: {response.Errors.First().Data}");
        }
        // END BatchImportWithVectorExample

        var result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(5, result.TotalCount);
    }

    [Fact]
    public async Task TestBatchImportWithCrossReference()
    {
        await BeforeEach();
        await client.Collections.Create(new CollectionConfig { Name = "Publication", Properties = [Property.Text("title")] });
        await client.Collections.Create(new CollectionConfig
        {
            Name = "Author",
            Properties = [Property.Text("name")],
            References = [new Reference("writesFor", "Publication")]
        });

        var authors = client.Collections.Use("Author");
        var publications = client.Collections.Use("Publication");

        var fromUuid = await authors.Data.Insert(new { name = "Jane Austen" });
        var targetUuid = await publications.Data.Insert(new { title = "Ye Olde Times" });

        // START BatchImportWithRefExample
        var collection = client.Collections.Use("Author");

        var response = await collection.Data.ReferenceAddMany([new DataReference(fromUuid, "writesFor", targetUuid)]);

        if (response.HasErrors)
        {
            Console.WriteLine($"Number of failed imports: {response.Errors.Count}");
            Console.WriteLine($"First failed object: {response.Errors.First()}");
        }
        // END BatchImportWithRefExample

        var result = await collection.Query.FetchObjectByID(fromUuid, returnReferences: [new QueryReference("writesFor")]);
        Assert.NotNull(result);
        Assert.True(result.References.ContainsKey("writesFor"));
    }

    [Fact]
    public async Task TestImportWithNamedVectors()
    {
        await BeforeEach();
        await client.Collections.Create(new CollectionConfig
        {
            Name = "MyCollection",
            VectorConfig = new[]
            {
            new VectorConfig("title", new Vectorizer.SelfProvided()),
            new VectorConfig("body", new Vectorizer.SelfProvided())
        },
            Properties = [Property.Text("title"), Property.Text("body")]
        });

        // START BatchImportWithNamedVectors
        // 1. Change list type to BatchInsertRequest
        var dataToInsert = new List<BatchInsertRequest>();

        for (int i = 0; i < 5; i++)
        {
            var dataRow = new { title = $"Object {i + 1}", body = $"Body {i + 1}" };
            var titleVector = Enumerable.Repeat(0.12f, 1536).ToArray();
            var bodyVector = Enumerable.Repeat(0.34f, 1536).ToArray();

            // highlight-start
            // 2. Create the Vectors object mapping names to Vector wrappers
            var namedVectors = new Vectors
        {
            { "title", titleVector },
            { "body", bodyVector }
        };

            // 3. Add a specific request object to the list
            // Constructor signature: (Data, ID?, Vectors?, References?, Tenant?)
            dataToInsert.Add(new BatchInsertRequest(dataRow, Vectors: namedVectors));
            // highlight-end
        }

        var collection = client.Collections.Use("MyCollection");

        // Insert the data using InsertMany
        // highlight-start
        var response = await collection.Data.InsertMany(dataToInsert);
        // highlight-end

        // Check for errors (Access the Errors dictionary)
        if (response.Errors.Any())
        {
            Console.WriteLine($"Number of failed imports: {response.Errors.Count()}");
            Console.WriteLine($"First failed object error: {response.Errors.First().Data}");
        }
        // END BatchImportWithNamedVectors
    }

    [Fact]
    public async Task TestJsonStreaming()
    {
        await BeforeEach();
        // Ensure using correct Collection creation syntax
        await client.Collections.Create(new CollectionConfig
        {
            Name = "JeopardyQuestion",
            // Optional: Define properties explicitly if needed, but auto-schema usually handles it
            Properties = [Property.Text("question"), Property.Text("answer")]
        });

        // START JSON streaming
        int batchSize = 100;
        var batch = new List<object>(batchSize);
        var collection = client.Collections.Use("JeopardyQuestion");

        Console.WriteLine("JSON streaming, to avoid running out of memory on large files...");
        using var fileStream = File.OpenRead(JsonDataFile);

        // Deserialize as JsonElement to handle types more safely/explicitly than Dictionary<string, object>
        var jsonObjects = JsonSerializer.DeserializeAsyncEnumerable<JsonElement>(fileStream);

        await foreach (var obj in jsonObjects)
        {
            // JsonElement is a struct, checking ValueKind is safer than null check
            if (obj.ValueKind == JsonValueKind.Null || obj.ValueKind == JsonValueKind.Undefined) continue;

            var properties = new
            {
                question = obj.GetProperty("Question").ToString(),
                answer = obj.GetProperty("Answer").ToString()
            };

            batch.Add(properties);

            if (batch.Count == batchSize)
            {
                await collection.Data.InsertMany(batch);
                Console.WriteLine($"Imported {batch.Count} articles...");
                batch.Clear();
            }
        }

        if (batch.Any())
        {
            await collection.Data.InsertMany(batch);
            Console.WriteLine($"Imported remaining {batch.Count} articles...");
        }

        Console.WriteLine("Finished importing articles.");
        // END JSON streaming

        var result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(1000, result.TotalCount);
    }

    [Fact]
    public async Task TestCsvStreaming()
    {
        await BeforeEach();
        // Create a CSV file from the JSON for the test
        using (var fileStream = File.OpenRead(JsonDataFile))
        using (var writer = new StreamWriter(CsvDataFile))
        using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
        {
            var jsonObjects = JsonSerializer.DeserializeAsyncEnumerable<Dictionary<string, object>>(fileStream);
            csv.WriteHeader<JeopardyQuestion>();
            await csv.NextRecordAsync();
            await foreach (var obj in jsonObjects)
            {
                if (obj != null)
                {
                    csv.WriteRecord(new JeopardyQuestion { Question = obj["Question"]?.ToString(), Answer = obj["Answer"]?.ToString() });
                    await csv.NextRecordAsync();
                }
            }
        }

        await client.Collections.Create(new CollectionConfig { Name = "JeopardyQuestion" });

        // START CSV streaming
        int batchSize = 100;
        var batch = new List<object>(batchSize);
        var collection = client.Collections.Use("JeopardyQuestion");

        Console.WriteLine("CSV streaming to not load all records in RAM at once...");
        using (var reader = new StreamReader(CsvDataFile))
        using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
        {
            var records = csv.GetRecords<JeopardyQuestion>();
            foreach (var record in records)
            {
                var properties = new { question = record.Question, answer = record.Answer };
                batch.Add(properties);

                if (batch.Count == batchSize)
                {
                    await collection.Data.InsertMany(batch);
                    Console.WriteLine($"Imported {batch.Count} articles...");
                    batch.Clear();
                }
            }
        }

        if (batch.Any())
        {
            await collection.Data.InsertMany(batch);
            Console.WriteLine($"Imported remaining {batch.Count} articles...");
        }

        Console.WriteLine("Finished importing articles.");
        // END CSV streaming

        var result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(1000, result.TotalCount);
    }

    // Helper class for CSV parsing
    private class JeopardyQuestion
    {
        public string? Question { get; set; }
        public string? Answer { get; set; }
    }
}