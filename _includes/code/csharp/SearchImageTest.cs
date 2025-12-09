using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Text.Json;
using System.Linq;
using System.IO;
using System.Net.Http;

namespace WeaviateProject.Tests;

public class SearchImageTest : IAsyncLifetime
{
    private static WeaviateClient client;
    private const string QUERY_IMAGE_PATH = "images/search-image.jpg";

    // START helper base64 functions
    private static async Task<string> UrlToBase64(string url)
    {
        using var httpClient = new HttpClient();
        var imageBytes = await httpClient.GetByteArrayAsync(url);
        return Convert.ToBase64String(imageBytes);
    }

    private static async Task<byte[]> FileToByteArray(string path)
    {
        return await File.ReadAllBytesAsync(path);
    }
    // END helper base64 functions

    // Runs once before any tests in the class (like @BeforeAll)
    public async Task InitializeAsync()
    {
        client = await Connect.Local(restPort: 8280, grpcPort: 50251);

        if (await client.Collections.Exists("Dog"))
        {
            await client.Collections.Delete("Dog");
        }

        await client.Collections.Create(new CollectionConfig
        {
            Name = "Dog",
            Properties =
            [
                Property.Blob("image"),
                Property.Text("breed"),
                Property.Text("description")
            ],
            VectorConfig = Configure.Vectors.Multi2VecClip(imageFields: new[] { "image" }, textFields: new[] { "breed", "description" }).New("default")
        });

        // Prepare and ingest sample dog images
        var dogs = client.Collections.Use("Dog");
        var sampleImages = new[]
        {
            new { url = "https://images.unsplash.com/photo-1489924034176-2e678c29d4c6?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", breed = "Husky", description = "Siberian Husky with distinctive blue eyes, pointed ears, and thick white and grey fur coat, typical of arctic sled dogs" },
            new { url = "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8R29sZGVuJTIwUmV0cmlldmVyfGVufDB8fDB8fHwy", breed = "Golden Retriever", description = "Golden Retriever with beautiful long golden fur, friendly expression, sitting and posing for the camera, known for being excellent family pets" },
            new { url = "https://images.unsplash.com/photo-1612979148245-d8c79c50935d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZG9nJTIwZ2VybWFuJTIwc2hlcGFyZHxlbnwwfHwwfHx8Mg%3D%3D", breed = "German Shepherd", description = "The German Shepherd, also known in Britain as an Alsatian, is a German breed of working dog of medium to large size. It was originally bred as a herding dog, for herding sheep. " }
        };

        Console.WriteLine("Inserting sample data...");
        foreach (var image in sampleImages)
        {
            string base64Image = await UrlToBase64(image.url);
            await dogs.Data.Insert(new { image = base64Image, breed = image.breed, description = image.description });
            Console.WriteLine($"Inserted: {image.breed}");
        }
        Console.WriteLine("Data insertion complete!");

        // Download the specific image to be used for searches
        var queryImageUrl = "https://images.unsplash.com/photo-1590419690008-905895e8fe0d?q=80&w=1336&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
        using var httpClient = new HttpClient();
        var imageStream = await httpClient.GetStreamAsync(queryImageUrl);

        Directory.CreateDirectory("images");
        using var fileStream = new FileStream(QUERY_IMAGE_PATH, FileMode.Create, FileAccess.Write);
        await imageStream.CopyToAsync(fileStream);
    }

    // Runs once after all tests in the class (like @AfterAll)
    public async Task DisposeAsync()
    {
        if (client != null)
        {
            if (await client.Collections.Exists("Dog"))
            {
                await client.Collections.Delete("Dog");
            }
        }
        if (File.Exists(QUERY_IMAGE_PATH)) File.Delete(QUERY_IMAGE_PATH);
        if (Directory.Exists("images")) Directory.Delete("images");
    }

    [Fact]
    public async Task TestSearchWithBase64()
    {
        // START search with base64
        // highlight-start
        // The C# client's NearImage method takes a byte array directly.
        var imageBytes = await FileToByteArray(QUERY_IMAGE_PATH);
        // highlight-end

        // Get the collection containing images
        var dogs = client.Collections.Use("Dog");

        // Perform query
        // highlight-start
        var response = await dogs.Query.NearImage(
            imageBytes,
            // highlight-end
            returnProperties: ["breed"],
            limit: 1
        // targetVector: "vector_name" // required when using multiple named vectors
        );

        if (response.Objects.Any())
        {
            Console.WriteLine(JsonSerializer.Serialize(response.Objects.First()));
        }
        // END search with base64
    }

    // START ImageFileSearch
    // Coming soon
    // END ImageFileSearch

    [Fact]
    public async Task TestDistance()
    {
        // START Distance
        var dogs = client.Collections.Use("Dog");
        var imageBytes = await FileToByteArray(QUERY_IMAGE_PATH);

        var response = await dogs.Query.NearImage(
            imageBytes,
            // highlight-start
            distance: 0.8f, // Maximum accepted distance
            returnMetadata: MetadataOptions.Distance, // return distance from the source image
                                                      // highlight-end
            returnProperties: "breed",
            limit: 5
        );

        foreach (var item in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(item));
        }
        // END Distance
    }
}