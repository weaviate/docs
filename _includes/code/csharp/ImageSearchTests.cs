using Xunit;
using Weaviate.Client;
using Weaviate.Client.Models;
using System;
using System.Threading.Tasks;
using System.Text.Json;
using System.Linq;
using System.IO;
using System.Net.Http;
using System.Text;

// Note: This code assumes a local Weaviate instance is running and has the 'Dog' collection
// imported, as per the weaviate-examples GitHub repository.
// It also assumes an image file exists at "./images/search-image.jpg" for some tests.
public class ImageSearchTests : IAsyncLifetime
{
    private WeaviateClient client;

    public Task InitializeAsync()
    {
        client = Connect.Local();
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        // START-ANY
        // The C# client manages its connections automatically and does not require an explicit 'close' method.
        // END-ANY
        return Task.CompletedTask;
    }

    // =================================================
    // ===== Helper functions to convert to base64 =====
    // =================================================

    // START helper base64 functions
    private static async Task<string> UrlToBase64(string url)
    {
        using var httpClient = new HttpClient();
        var imageBytes = await httpClient.GetByteArrayAsync(url);
        return Convert.ToBase64String(imageBytes);
    }
    // END helper base64 functions

    [Fact]
    public async Task SearchWithBase64()
    {
        // ===========================================
        // ===== Search by base64 representation =====
        // ===========================================

        // Using the helper function to get a real Base64 image string for the test
        var base64Img = await UrlToBase64("https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Deutsches_Museum_Portrait_4.jpg/500px-Deutsches_Museum_Portrait_4.jpg");

        // START search with base64
        // highlight-start
        var base64_string = base64Img;
        // highlight-end

        // Convert base64 string to byte array
        var imageBytes = Convert.FromBase64String(base64_string);

        // Get the collection containing images
        var dogs = client.Collections.Use("Dog");

        // Perform query
        // highlight-start
        var response = await dogs.Query.NearImage(
            imageBytes,
        // highlight-end
            returnProperties: new[] { "breed" },
            limit: 1
        // targetVector: "vector_name" // required when using multiple named vectors
        );

        Console.WriteLine(JsonSerializer.Serialize(response.Objects.FirstOrDefault()));
        // END search with base64

        Assert.NotNull(response.Objects.FirstOrDefault());
        // A more robust test would check for a specific expected breed,
        // but this depends heavily on the dataset and vectorizer used.
        Assert.True(response.Objects.First().Properties.ContainsKey("breed"));
    }

    [Fact]
    public async Task SearchWithImageFile()
    {
        // ====================================
        // ===== Search by image filename =====
        // ====================================

        // This test requires a file named 'search-image.jpg' inside an 'images' folder.
        var imagePath = Path.Combine("images", "search-image.jpg");
        if (!File.Exists(imagePath))
        {
            // Skip test if the image file doesn't exist.
            Assert.True(false, $"Image file not found at {imagePath}. Skipping test.");
            return;
        }

        // START ImageFileSearch
        var dogs = client.Collections.Use("Dog");
        // Read the image file into a byte array
        var imageBytes = await File.ReadAllBytesAsync(imagePath);
        var response = await dogs.Query.NearImage(
            // highlight-start
            imageBytes,  // Provide image bytes
                         // highlight-end
            returnProperties: new[] { "breed" },
            limit: 1
        // targetVector: "vector_name" // required when using multiple named vectors
        );

        Console.WriteLine(JsonSerializer.Serialize(response.Objects.FirstOrDefault()));
        // END ImageFileSearch

        Assert.NotNull(response.Objects.FirstOrDefault());
        Assert.True(response.Objects.First().Properties.ContainsKey("breed"));
    }

    [Fact]
    public async Task SearchWithDistance()
    {
        // ============================
        // ===== Maximum distance =====
        // ============================

        // This test requires a file named 'search-image.jpg' inside an 'images' folder.
        var imagePath = Path.Combine("images", "search-image.jpg");
        if (!File.Exists(imagePath))
        {
            // Skip test if the image file doesn't exist.
            Assert.True(false, $"Image file not found at {imagePath}. Skipping test.");
            return;
        }

        // START Distance
        var dogs = client.Collections.Use("Dog");
        var imageBytes = await File.ReadAllBytesAsync(imagePath);
        var response = await dogs.Query.NearImage(
            imageBytes,
            // highlight-start
            distance: 0.8f, // Maximum accepted distance
            returnMetadata: MetadataOptions.Distance, // return distance from the source image
                                                      // highlight-end
            returnProperties: new[] { "breed" },
            limit: 5
        );

        foreach (var item in response.Objects)
        {
            Console.WriteLine(JsonSerializer.Serialize(item));
        }
        // END Distance

        Assert.NotEmpty(response.Objects);
        Assert.NotNull(response.Objects.First().Metadata.Distance);
        Assert.True(response.Objects.First().Metadata.Distance < 0.8f);
    }
}