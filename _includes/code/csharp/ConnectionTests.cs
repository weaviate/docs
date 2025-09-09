using Weaviate.Client;
using System;
using System.Threading.Tasks;
using Xunit;

namespace WeaviateProject.Tests;

public class ConnectionSnippetsTest
{
    /// <summary>
    /// Test for local connection with a custom URL and port.
    /// </summary>
    [Fact]
    public async Task Should_Connect_With_Custom_URL()
    {
        // START CustomURL
        // The Connect.Local() method defaults to "localhost".
        // For a different host, you must use a custom configuration.
        var config = new ClientConfiguration(
            RestAddress: "127.0.0.1",
            GrpcAddress: "127.0.0.1",
            RestPort: 8080,
            GrpcPort: 50051
        );
        var client = new WeaviateClient(config);
        // END CustomURL

        try
        {
            var meta = await client.GetMeta();
            Assert.False(string.IsNullOrEmpty(meta.Version.ToString()));
        }
        catch (Exception ex)
        {
            Assert.Fail($"Connection failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Test for a fully custom connection, typically for a cloud instance.
    /// </summary>
    [Fact]
    public async Task Should_Perform_Custom_Connection_With_ApiKey()
    {
        // START CustomConnect
        var httpHost = Environment.GetEnvironmentVariable("WEAVIATE_HTTP_HOST");
        var grpcHost = Environment.GetEnvironmentVariable("WEAVIATE_GRPC_HOST");
        var weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

        var config = new ClientConfiguration(
            RestAddress: httpHost,        // Hostname for the HTTP API connection
            RestPort: 443,                // Default is 80, WCD uses 443
            UseSsl: true,                 // Whether to use https (secure) for the HTTP API connection
            GrpcAddress: grpcHost,        // Hostname for the gRPC API connection
            GrpcPort: 443,                // Default is 50051, WCD uses 443
            ApiKey: weaviateApiKey        // API key for authentication
        );
        var client = new WeaviateClient(config);
        // END CustomConnect

        try
        {
            var meta = await client.GetMeta();
            Assert.False(string.IsNullOrEmpty(meta.Version.ToString()));
        }
        catch (Exception ex)
        {
            Assert.Fail($"Connection failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Test for connecting to Weaviate Cloud (WCD).
    /// </summary>
    [Fact]
    public async Task Should_Connect_To_WCD_With_Api_Key()
    {
        // START APIKeyWCD
        var weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        var wcdApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

        var client = Connect.Cloud(
            restEndpoint: weaviateUrl,
            apiKey: wcdApiKey
        );
        // END APIKeyWCD

        try
        {
            var meta = await client.GetMeta();
            Assert.False(string.IsNullOrEmpty(meta.Version.ToString()));
        }
        catch (Exception ex)
        {
            Assert.Fail($"Connection failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Test for a default local connection without authentication.
    /// </summary>
    [Fact]
    public async Task Should_Connect_Locally_Without_Auth()
    {
        // START LocalNoAuth
        var client = Connect.Local();
        // END LocalNoAuth

        try
        {
            var meta = await client.GetMeta();
            Assert.False(string.IsNullOrEmpty(meta.Version.ToString()));
        }
        catch (Exception ex)
        {
            Assert.Fail($"Connection failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Test for a local connection using an API key and non-default ports.
    /// </summary>
    // TODO[g-despot]: Broken for some reason
    //[Fact]
    public async Task Should_Connect_Locally_With_Auth()
    {
        // START LocalAuth
        var localApiKey = Environment.GetEnvironmentVariable("WEAVIATE_LOCAL_API_KEY");
        // END LocalAuth
        localApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        // START LocalAuth

        var client = Connect.Local(
            restPort: 8099,
            grpcPort: 50052,
            useSsl: true,
            apiKey: localApiKey
        );
        // END LocalAuth

        try
        {
            var meta = await client.GetMeta();
            Assert.False(string.IsNullOrEmpty(meta.Version.ToString()));
        }
        catch (Exception ex)
        {
            Assert.Fail($"Connection failed: {ex.Message}");
        }
    }
}
