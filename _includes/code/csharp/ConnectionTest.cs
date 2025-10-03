using Weaviate.Client;
using System;
using System.Threading.Tasks;
using Xunit;

namespace WeaviateProject.Examples;

public class ConnectionTest
{
    //TODO[g-despot] Replace with readiness check
    [Fact]
    public async Task TestConnectLocalWithCustomUrl()
    {
        // START CustomURL
        var config = new ClientConfiguration
        {
            RestAddress = "127.0.0.1",
            RestPort = 8080,
            GrpcAddress = "127.0.0.1",
            GrpcPort = 50051 // Default gRPC port
        };
        using var client = new WeaviateClient(config);

        var meta = await client.GetMeta();
        Console.WriteLine(meta);

        // The 'using' statement handles freeing up resources automatically.
        // END CustomURL
    }

    // TODO[g-despot] How to add timeout
    // START TimeoutLocal
    // Coming soon
    // END TimeoutLocal
    // START TimeoutCustom
    // Coming soon
    // END TimeoutCustom

    [Fact]
    public async Task TestConnectWCDWithApiKey()
    {
        // START APIKeyWCD
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

        using var client = Connect.Cloud(
            weaviateUrl, // Replace with your Weaviate Cloud URL
            weaviateApiKey // Replace with your Weaviate Cloud key
        );

        var meta = await client.GetMeta();
        Console.WriteLine(meta);

        // The 'using' statement handles freeing up resources automatically.
        // END APIKeyWCD
    }

    [Fact]
    public async Task TestCustomConnection()
    {
        // START CustomConnect
        // Best practice: store your credentials in environment variables
        string httpHost = Environment.GetEnvironmentVariable("WEAVIATE_HTTP_HOST");
        string grpcHost = Environment.GetEnvironmentVariable("WEAVIATE_GRPC_HOST");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string cohereApiKey = Environment.GetEnvironmentVariable("COHERE_API_KEY");

        var config = new ClientConfiguration
        {
            UseSsl = true, // Corresponds to scheme("https")
            RestAddress = httpHost,
            RestPort = 443,
            GrpcAddress = grpcHost,
            GrpcPort = 443,
            Credentials = Auth.ApiKey(weaviateApiKey),
            // Headers = new Dictionary<string, string>
            // {
            //     { "X-Cohere-Api-Key", cohereApiKey }
            // }
        };
        using var client = new WeaviateClient(config);

        var meta = await client.GetMeta();
        Console.WriteLine(meta);

        // The 'using' statement handles freeing up resources automatically.
        // END CustomConnect
    }

    [Fact]
    public async Task TestCustomApiKeyConnection()
    {
        // START ConnectWithApiKeyExample
        // Best practice: store your credentials in environment variables
        string httpHost = Environment.GetEnvironmentVariable("WEAVIATE_HTTP_HOST");
        string grpcHost = Environment.GetEnvironmentVariable("WEAVIATE_GRPC_HOST");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string cohereApiKey = Environment.GetEnvironmentVariable("COHERE_API_KEY");

        var config = new ClientConfiguration
        {
            UseSsl = true, // Corresponds to scheme("https")
            RestAddress = httpHost,
            RestPort = 443,
            GrpcAddress = grpcHost,
            GrpcPort = 443,
            Credentials = Auth.ApiKey(weaviateApiKey),
            // Headers = new Dictionary<string, string>
            // {
            //     { "X-Cohere-Api-Key", cohereApiKey }
            // }
        };
        using var client = new WeaviateClient(config);

        var meta = await client.GetMeta();
        Console.WriteLine(meta);

        // The 'using' statement handles freeing up resources automatically.
        // END ConnectWithApiKeyExample
    }

    [Fact]
    public async Task TestConnectLocalNoAuth()
    {
        // START LocalNoAuth
        using var client = Connect.Local();

        var meta = await client.GetMeta();
        Console.WriteLine(meta);

        // The 'using' statement handles freeing up resources automatically.
        // END LocalNoAuth
    }

    [Fact]
    public async Task TestConnectLocalWithAuth()
    {
        // START LocalAuth
        // Best practice: store your credentials in environment variables
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_LOCAL_API_KEY");

        // The Connect.Local() helper doesn't support auth, so we must use a custom configuration.
        var config = new ClientConfiguration
        {
            Credentials = Auth.ApiKey(weaviateApiKey)
        };
        using var client = new WeaviateClient(config);

        var meta = await client.GetMeta();
        Console.WriteLine(meta);

        // The 'using' statement handles freeing up resources automatically.
        // END LocalAuth
    }

    [Fact]
    public async Task TestConnectLocalWithThirdPartyKeys()
    {
        // START LocalThirdPartyAPIKeys
        // Best practice: store your credentials in environment variables
        string cohereApiKey = Environment.GetEnvironmentVariable("COHERE_API_KEY");

        var config = new ClientConfiguration
        {
            // Headers = new Dictionary<string, string>
            // {
            //     { "X-Cohere-Api-Key", cohereApiKey }
            // }
        };
        using var client = new WeaviateClient(config);

        var meta = await client.GetMeta();
        Console.WriteLine(meta);

        // The 'using' statement handles freeing up resources automatically.
        // END LocalThirdPartyAPIKeys
    }

    [Fact]
    public async Task TestConnectWCDWithThirdPartyKeys()
    {
        // START ThirdPartyAPIKeys
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string cohereApiKey = Environment.GetEnvironmentVariable("COHERE_API_KEY");

        using var client = Connect.Cloud(
            weaviateUrl, // Replace with your Weaviate Cloud URL
            weaviateApiKey // Replace with your Weaviate Cloud key
                           // headers: new Dictionary<string, string>
                           // {
                           //     { "X-Cohere-Api-Key", cohereApiKey }
                           // }
        );

        var meta = await client.GetMeta();
        Console.WriteLine(meta);

        // The 'using' statement handles freeing up resources automatically.
        // END ThirdPartyAPIKeys
    }

    // START TimeoutWCD
    // Coming soon
    // END TimeoutWCD
}