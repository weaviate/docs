using Weaviate.Client;
using System;
using System.Threading.Tasks;
using Xunit;
using System.Collections.Generic;

namespace WeaviateProject.Examples;

public class ConnectionTest
{
    [Fact]
    public async Task TestConnectLocalWithCustomUrl()
    {
        // START CustomURL
        WeaviateClient client = await WeaviateClientBuilder.Custom(
                restEndpoint: "127.0.0.1",
                restPort: "8080",
                grpcEndpoint: "127.0.0.1",
                grpcPort: "50051",
                useSsl: false
            )
            .BuildAsync();

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
        // END CustomURL
    }

    [Fact]
    public async Task TestConnectLocalWithTimeouts()
    {
        // START TimeoutLocal
        WeaviateClient client = await Connect.Local(
            initTimeout: TimeSpan.FromSeconds(30),
            queryTimeout: TimeSpan.FromSeconds(60),
            insertTimeout: TimeSpan.FromSeconds(120)
        );

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
        // END TimeoutLocal
    }

    [Fact]
    public async Task TestConnectCloudWithTimeouts()
    {
        // START TimeoutWCD
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

        WeaviateClient client = await Connect.Cloud(
            weaviateUrl,
            weaviateApiKey,
            initTimeout: TimeSpan.FromSeconds(30),
            queryTimeout: TimeSpan.FromSeconds(60),
            insertTimeout: TimeSpan.FromSeconds(120)
        );

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
        // END TimeoutWCD
    }

    [Fact]
    public async Task TestConnectCustomWithTimeouts()
    {
        // START TimeoutCustom
        // Best practice: store your credentials in environment variables
        string httpHost = Environment.GetEnvironmentVariable("WEAVIATE_HTTP_HOST");
        string grpcHost = Environment.GetEnvironmentVariable("WEAVIATE_GRPC_HOST");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string cohereApiKey = Environment.GetEnvironmentVariable("COHERE_API_KEY");

        WeaviateClient client = await WeaviateClientBuilder.Custom(
                restEndpoint: httpHost,
                restPort: "443",
                grpcEndpoint: grpcHost,
                grpcPort: "443",
                useSsl: true
            )
            .WithCredentials(Auth.ApiKey(weaviateApiKey))
            .WithHeaders(new Dictionary<string, string>
            {
                { "X-Cohere-Api-Key", cohereApiKey }
            })
            .WithInitTimeout(TimeSpan.FromSeconds(30))
            .WithQueryTimeout(TimeSpan.FromSeconds(60))
            .WithInsertTimeout(TimeSpan.FromSeconds(120))
            .BuildAsync();

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
        // END TimeoutCustom
    }

    [Fact]
    public async Task TestConnectWCDWithApiKey()
    {
        // START APIKeyWCD
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");

        WeaviateClient client = await Connect.Cloud(
            weaviateUrl, // Replace with your Weaviate Cloud URL
            weaviateApiKey // Replace with your Weaviate Cloud key
        );

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
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

        WeaviateClient client = await WeaviateClientBuilder.Custom(
                restEndpoint: httpHost,
                restPort: "443",
                grpcEndpoint: grpcHost,
                grpcPort: "443",
                useSsl: true
            )
            .WithCredentials(Auth.ApiKey(weaviateApiKey))
            .WithHeaders(new Dictionary<string, string>
            {
                { "X-Cohere-Api-Key", cohereApiKey }
            })
            .BuildAsync();

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
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

        WeaviateClient client = await WeaviateClientBuilder.Custom(
                restEndpoint: httpHost,
                restPort: "443",
                grpcEndpoint: grpcHost,
                grpcPort: "443",
                useSsl: true
            )
            .WithCredentials(Auth.ApiKey(weaviateApiKey))
            .WithHeaders(new Dictionary<string, string>
            {
                { "X-Cohere-Api-Key", cohereApiKey }
            })
            .BuildAsync();

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
        // END ConnectWithApiKeyExample
    }

    [Fact]
    public async Task TestConnectLocalNoAuth()
    {
        // START LocalNoAuth
        WeaviateClient client = await Connect.Local();

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
        // END LocalNoAuth
    }

    [Fact]
    public async Task TestConnectLocalWithAuth()
    {
        // START LocalAuth
        // Best practice: store your credentials in environment variables
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_LOCAL_API_KEY");

        WeaviateClient client = await Connect.Local(
            credentials: Auth.ApiKey(weaviateApiKey)
        );

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
        // END LocalAuth
    }

    [Fact]
    public async Task TestConnectLocalWithThirdPartyKeys()
    {
        // START LocalThirdPartyAPIKeys
        // Best practice: store your credentials in environment variables
        string cohereApiKey = Environment.GetEnvironmentVariable("COHERE_API_KEY");

        WeaviateClient client = await WeaviateClientBuilder.Local(
                hostname: "localhost",
                restPort: 8080,
                grpcPort: 50051,
                useSsl: false
            )
            .WithHeaders(new Dictionary<string, string>
            {
                { "X-Cohere-Api-Key", cohereApiKey }
            })
            .BuildAsync();

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
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

        WeaviateClient client = await Connect.Cloud(
            weaviateUrl, // Replace with your Weaviate Cloud URL
            weaviateApiKey, // Replace with your Weaviate Cloud key
            new Dictionary<string, string>
            {
                { "X-Cohere-Api-Key", cohereApiKey }
            }
        );

        var isReady = await client.IsReady();
        Console.WriteLine(isReady);
        // END ThirdPartyAPIKeys
    }
}