using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CsvHelper;
using Weaviate.Client;
using Weaviate.Client.Models;
using Xunit;

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
        var jsonData = await httpClient.GetStreamAsync(
            "https://raw.githubusercontent.com/weaviate-tutorials/edu-datasets/main/jeopardy_1k.json"
        );
        using var fileStream = new FileStream(JsonDataFile, FileMode.Create, FileAccess.Write);
        await jsonData.CopyToAsync(fileStream);
    }

    // Runs once after all tests in the class
    public async Task DisposeAsync()
    {
        await client.Collections.DeleteAll();
        File.Delete(JsonDataFile);
        if (File.Exists(CsvDataFile))
            File.Delete(CsvDataFile);
    }

    private async Task BeforeEach()
    {
        await client.Collections.DeleteAll();
    }

    [Fact]
    public async Task TestBasicBatchImport()
    {
        await BeforeEach();
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "MyCollection",
                VectorConfig = Configure.Vector("default", v => v.SelfProvided()),
            }
        );

        // START BasicBatchImportExample
        var dataRows = Enumerable
            .Range(0, 5)
            .Select(i => new { title = $"Object {i + 1}" })
            .ToList();

        var collection = client.Collections.Use("MyCollection");

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
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "MyCollection",
                VectorConfig = Configure.Vector("default", v => v.SelfProvided()),
            }
        );

        // START BatchImportWithIDExample
        var dataToInsert = new List<BatchInsertRequest>();
        var vectorData = Enumerable.Repeat(0.1f, 10).ToArray();

        for (int i = 0; i < 5; i++)
        {
            var dataRow = new { title = $"Object {i + 1}" };
            var objUuid = GenerateUuid5(JsonSerializer.Serialize(dataRow));

            var vectors = new Vectors { { "default", vectorData } };

            dataToInsert.Add(
                BatchInsertRequest.Create(data: dataRow, uuid: objUuid, vectors: vectors)
            );
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

        Assert.Empty(failedObjects);

        var result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(5, result.TotalCount);

        var lastUuid = dataToInsert[4].UUID;
        Assert.NotNull(await collection.Query.FetchObjectByID((Guid)lastUuid));
    }

    [Fact]
    public async Task TestBatchImportWithVector()
    {
        await BeforeEach();
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "MyCollection",
                VectorConfig = Configure.Vector("default", v => v.SelfProvided()),
            }
        );

        // START BatchImportWithVectorExample
        var dataToInsert = new List<BatchInsertRequest>();
        var vectorData = Enumerable.Repeat(0.1f, 10).ToArray();

        for (int i = 0; i < 5; i++)
        {
            var dataRow = new { title = $"Object {i + 1}" };
            var objUuid = GenerateUuid5(JsonSerializer.Serialize(dataRow));

            var vectors = new Vectors { { "default", vectorData } };

            dataToInsert.Add(
                BatchInsertRequest.Create(data: dataRow, uuid: objUuid, vectors: vectors)
            );
        }

        var collection = client.Collections.Use("MyCollection");

        var response = await collection.Data.InsertMany(dataToInsert);

        // Handle errors
        if (response.HasErrors)
        {
            Console.WriteLine($"Number of failed imports: {response.Errors.Count()}");
            Console.WriteLine($"First failed object: {response.Errors.First().Message}");
        }
        // END BatchImportWithVectorExample

        var result = await collection.Aggregate.OverAll(totalCount: true);
        Assert.Equal(5, result.TotalCount);
    }

    [Fact]
    public async Task TestBatchImportWithCrossReference()
    {
        await BeforeEach();
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Publication",
                Properties = [Property.Text("title")],
            }
        );
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "Author",
                Properties = [Property.Text("name")],
                References = [new Reference("writesFor", "Publication")],
            }
        );

        var authors = client.Collections.Use("Author");
        var publications = client.Collections.Use("Publication");

        var fromUuid = await authors.Data.Insert(new { name = "Jane Austen" });
        var targetUuid = await publications.Data.Insert(new { title = "Ye Olde Times" });

        // START BatchImportWithRefExample
        var collection = client.Collections.Use("Author");

        var response = await collection.Data.ReferenceAddMany([
            new DataReference(fromUuid, "writesFor", targetUuid),
        ]);

        if (response.HasErrors)
        {
            Console.WriteLine($"Number of failed imports: {response.Errors.Count}");
            Console.WriteLine($"First failed object: {response.Errors.First()}");
        }
        // END BatchImportWithRefExample

        var result = await collection.Query.FetchObjectByID(
            fromUuid,
            returnReferences: [new QueryReference("writesFor")]
        );
        Assert.NotNull(result);
        Assert.True(result.References.ContainsKey("writesFor"));
    }

    [Fact]
    public async Task TestImportWithNamedVectors()
    {
        await BeforeEach();
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "MyCollection",
                VectorConfig = new[]
                {
                    Configure.Vector("title", v => v.SelfProvided()),
                    Configure.Vector("body", v => v.SelfProvided()),
                },
                Properties = [Property.Text("title"), Property.Text("body")],
            }
        );

        // START BatchImportWithNamedVectors
        var dataToInsert = new List<BatchInsertRequest>();

        for (int i = 0; i < 5; i++)
        {
            var dataRow = new { title = $"Object {i + 1}", body = $"Body {i + 1}" };
            var titleVector = Enumerable.Repeat(0.12f, 1536).ToArray();
            var bodyVector = Enumerable.Repeat(0.34f, 1536).ToArray();

            // highlight-start
            var namedVectors = new Vectors { { "title", titleVector }, { "body", bodyVector } };

            dataToInsert.Add(BatchInsertRequest.Create(dataRow, vectors: namedVectors));
            // highlight-end
        }

        var collection = client.Collections.Use("MyCollection");

        // Insert the data using InsertMany
        // highlight-start
        var response = await collection.Data.InsertMany(dataToInsert);
        // highlight-end

        // Handle errors
        if (response.HasErrors)
        {
            Console.WriteLine($"Number of failed imports: {response.Errors.Count()}");
            Console.WriteLine($"First failed object error: {response.Errors.First().Message}");
        }
        // END BatchImportWithNamedVectors
    }

    [Fact]
    public async Task TestJsonStreaming()
    {
        await BeforeEach();
        // Ensure using correct Collection creation syntax
        await client.Collections.Create(
            new CollectionCreateParams
            {
                Name = "JeopardyQuestion",
                // Optional: Define properties explicitly if needed, but auto-schema usually handles it
                Properties = [Property.Text("question"), Property.Text("answer")],
            }
        );

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
            if (obj.ValueKind == JsonValueKind.Null || obj.ValueKind == JsonValueKind.Undefined)
                continue;

            var properties = new
            {
                question = obj.GetProperty("Question").ToString(),
                answer = obj.GetProperty("Answer").ToString(),
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
            var jsonObjects = JsonSerializer.DeserializeAsyncEnumerable<Dictionary<string, object>>(
                fileStream
            );
            csv.WriteHeader<JeopardyQuestion>();
            await csv.NextRecordAsync();
            await foreach (var obj in jsonObjects)
            {
                if (obj != null)
                {
                    csv.WriteRecord(
                        new JeopardyQuestion
                        {
                            Question = obj["Question"]?.ToString(),
                            Answer = obj["Answer"]?.ToString(),
                        }
                    );
                    await csv.NextRecordAsync();
                }
            }
        }

        await client.Collections.Create(new CollectionCreateParams { Name = "JeopardyQuestion" });

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
        public string Question { get; set; }
        public string Answer { get; set; }
    }
}
