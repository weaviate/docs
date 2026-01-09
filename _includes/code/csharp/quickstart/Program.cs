using System;
using System.Threading.Tasks;
using WeaviateProject.Examples;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("Running QuickstartCreate...");
        await QuickstartCreate.Run();

        Console.WriteLine("Running QuickstartQueryNearText...");
        await QuickstartQueryNearText.Run();

        Console.WriteLine("Running QuickstartQueryNearTextRAG...");
        await QuickstartQueryNearTextRAG.Run();

        Console.WriteLine("Running QuickstartCreateVectors...");
        await QuickstartCreateVectors.Run();

        Console.WriteLine("Running QuickstartQueryNearVector...");
        await QuickstartQueryNearVector.Run();

        Console.WriteLine("Running QuickstartQueryNearVectorRAG...");
        await QuickstartQueryNearVectorRAG.Run();

        Console.WriteLine("Running QuickstartLocalCreate...");
        await QuickstartLocalCreate.Run();

        Console.WriteLine("Running QuickstartLocalQueryNearText...");
        await QuickstartLocalQueryNearText.Run();

        Console.WriteLine("Running QuickstartLocalQueryNearTextRAG...");
        await QuickstartLocalQueryNearTextRAG.Run();

        Console.WriteLine("Running QuickstartLocalCreateVectors...");
        await QuickstartLocalCreateVectors.Run();

        Console.WriteLine("Running QuickstartLocalQueryNearVector...");
        await QuickstartLocalQueryNearVector.Run();

        Console.WriteLine("Running QuickstartLocalQueryNearVectorRAG...");
        await QuickstartLocalQueryNearVectorRAG.Run();
    }
}
