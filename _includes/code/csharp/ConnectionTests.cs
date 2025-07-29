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
        var client = Connect.Local(restPort: 8085, grpcPort: 50055);
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
}
