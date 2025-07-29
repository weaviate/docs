using Xunit;
using Weaviate.Client;
using System;
using System.Threading.Tasks;

namespace WeaviateProject.Tests;

public class ConnectionTest
{
    [Fact]
    public async Task Should_Connect_To_Weaviate()
    {
        // START LocalNoAuth
        var client = Connect.Local(restPort: 8080, grpcPort: 50051);
        // END LocalNoAuth
        // try
        // {
        //     var meta = await client.GetMeta();
        //     Assert.NotNull(meta);
        //     Assert.NotNull(client);
        // }
        // catch (Exception ex)
        // {
        //     Assert.True(false, $"Connection failed: {ex.Message}");
        // }
    }

    [Fact]
    public async Task Should_Custom_Connect_To_Weaviate()
    {
        // START CustomConnect
         var config = new ClientConfiguration(
            RestAddress: "localhost",
            GrpcAddress: "localhost", 
            RestPort: 8080,
            GrpcPort: 50051,
            UseSsl: false,
            ApiKey: null
        );
        
        var client = new WeaviateClient(config);
        // END CustomConnect
        // try
        // {
        //     var meta = await client.GetMeta();
        //     Assert.NotNull(meta);
        //     Assert.NotNull(client);
        // }
        // catch (Exception ex)
        // {
        //     Assert.True(false, $"Connection failed: {ex.Message}");
        // }
    }
}
