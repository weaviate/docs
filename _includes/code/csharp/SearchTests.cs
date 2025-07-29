using Xunit;
using Weaviate.Client;
using System;
using System.Threading.Tasks;
using Weaviate.Client.Models;

namespace WeaviateProject.Tests;

public class SearchTest
{
    [Fact]
    public async Task Should_Fetch_By_Id()
    {
        var client = Connect.Local(restPort: 8085, grpcPort: 50055);

    }

    [Fact]
    public async Task Should_Near_Text()
    {
        var client = Connect.Local(restPort: 8085, grpcPort: 50055);

    }
}
