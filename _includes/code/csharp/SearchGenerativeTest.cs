using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Weaviate.Client;
using Weaviate.Client.Models;
using Weaviate.Client.Models.Generative;
using Xunit;

namespace WeaviateProject.Tests;

public class SearchGenerativeTest : IDisposable
{
    private static readonly WeaviateClient client;

    static SearchGenerativeTest()
    {
        // START INSTANTIATION-COMMON
        // Best practice: store your credentials in environment variables
        string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
        string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
        string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_APIKEY");
        string anthropicApiKey = Environment.GetEnvironmentVariable("ANTHROPIC_APIKEY");

        client = Connect
            .Cloud(
                weaviateUrl,
                weaviateApiKey,
                headers: new Dictionary<string, string>
                {
                    { "X-OpenAI-Api-Key", openaiApiKey },
                    { "Anthropic-Api-Key", anthropicApiKey },
                }
            )
            .GetAwaiter()
            .GetResult();
        // END INSTANTIATION-COMMON
    }

    // Dispose is called once after all tests in the class are finished (like @AfterAll)
    public void Dispose()
    {
        // The C# client manages connections automatically and does not require an explicit 'close' method.
        GC.SuppressFinalize(this);
    }

    // TODO[g-despot] NEW: Grpc.Core.RpcException : Status(StatusCode="Unknown", Detail="connection to: OpenAI API failed with status: 400 request-id: req_5abd283f230349a08d87849af0a556ce error: Unsupported parameter: 'top_p' is not supported with this model.")
    [Fact]
    public async Task TestDynamicRag()
    {
        // START DynamicRag
        var reviews = client.Collections.Use("WineReviewNV");
        var response = await reviews.Generate.NearText(
            "a sweet German white wine",
            limit: 2,
            targetVector: ["title_country"],
            provider: new Providers.OpenAI { Model = "gpt-5-mini" },
            singlePrompt: new SinglePrompt("Translate this into German: {review_body}"),
            // highlight-start
            groupedTask: new GroupedTask("Summarize these reviews")
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
            Console.WriteLine($"Single prompt result: {o.Generative?.Values.First()}");
        }
        Console.WriteLine($"Grouped task result: {response.Generative?.Values.First()}");
        // END DynamicRag
    }

    [Fact]
    public async Task TestNamedVectorNearText()
    {
        // START NamedVectorNearTextPython
        var reviews = client.Collections.Use("WineReviewNV");
        var response = await reviews.Generate.NearText(
            "a sweet German white wine",
            limit: 2,
            // highlight-start
            targetVector: ["title_country"], // Specify the target vector for named vector collections
            returnMetadata: MetadataOptions.Distance,
            singlePrompt: new SinglePrompt("Translate this into German: {review_body}"),
            groupedTask: new GroupedTask("Summarize these reviews")
        // highlight-end
        );

        foreach (var o in response.Objects)
        {
            Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
            Console.WriteLine($"Single prompt result: {o.Generative?.Values.First()}");
        }
        Console.WriteLine($"Grouped task result: {response.Generative?.Values.First()}");
        // END NamedVectorNearTextPython
    }

    [Fact]
    public async Task TestSingleGenerative()
    {
        // START SingleGenerativePython
        // highlight-start
        var prompt =
            "Convert the following into a question for twitter. Include emojis for fun, but do not include the answer: {question}.";
        // highlight-end

        var jeopardy = client.Collections.Use("JeopardyQuestion");
        // highlight-start
        var response = await jeopardy.Generate.NearText(
            // highlight-end
            "World history",
            limit: 2,
            // highlight-start
            singlePrompt: new SinglePrompt(prompt)
        );
        // highlight-end

        foreach (var o in response.Objects)
        {
            var props = o.Properties as IDictionary<string, object>;
            Console.WriteLine($"Property 'question': {props?["question"]}");
            // highlight-start
            Console.WriteLine($"Single prompt result: {o.Generative?.Values.First()}");
            // highlight-end
        }
        // END SingleGenerativePython
    }

    [Fact]
    public async Task TestSingleGenerativeProperties()
    {
        // START SingleGenerativePropertiesPython
        // highlight-start
        var prompt =
            "Convert this quiz question: {question} and answer: {answer} into a trivia tweet.";
        // highlight-end

        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Generate.NearText(
            "World history",
            limit: 2,
            singlePrompt: new SinglePrompt(prompt)
        );

        // print source properties and generated responses
        foreach (var o in response.Objects)
        {
            Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
            Console.WriteLine($"Single prompt result: {o.Generative?.Values.First()}");
        }
        // END SingleGenerativePropertiesPython
    }

    [Fact]
    public async Task TestSingleGenerativeParameters()
    {
        // START SingleGenerativeParametersPython
        // highlight-start
        var singlePrompt = new SinglePrompt(
            "Convert this quiz question: {question} and answer: {answer} into a trivia tweet."
        )
        {
            // Metadata = true,
            Debug = true,
        };
        // highlight-end

        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Generate.NearText(
            "World history",
            limit: 2,
            // highlight-start
            singlePrompt: singlePrompt
        // highlight-end
        // provider: new GenerativeProvider.OpenAI()
        );

        // print source properties and generated responses
        foreach (var o in response.Objects)
        {
            Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
            Console.WriteLine($"Single prompt result: {o.Generative?.Values.First()}");
            //Console.WriteLine($"Debug: {o.Generative?}");
            //Console.WriteLine($"Metadata: {JsonSerializer.Serialize(o.Generative?.Metadata)}");
        }
        // END SingleGenerativeParametersPython
    }

    [Fact]
    public async Task TestGroupedGenerative()
    {
        // START GroupedGenerativePython
        // highlight-start
        var task = "What do these animals have in common, if anything?";
        // highlight-end

        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Generate.NearText(
            "Cute animals",
            limit: 3,
            // highlight-start
            groupedTask: new GroupedTask(task)
        );
        // highlight-end

        // print the generated response
        Console.WriteLine($"Grouped task result: {response.Generative?.Values.First()}");
        // END GroupedGenerativePython
    }

    // TODO[g-despot] NEW: Grpc.Core.RpcException : Status(StatusCode="Unknown", Detail="connection to: OpenAI API failed with status: 400 request-id: req_5abd283f230349a08d87849af0a556ce error: Unsupported parameter: 'top_p' is not supported with this model.")
    [Fact]
    public async Task TestGroupedGenerativeParameters()
    {
        // START GroupedGenerativeParametersPython
        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Generate.NearText(
            "Cute animals",
            limit: 3,
            // highlight-start
            groupedTask: new GroupedTask("What do these animals have in common, if anything?")
            {
                Debug = true,
            },
            provider: new Providers.OpenAI { ReturnMetadata = true, Model = "gpt-5-mini" }
        // highlight-end
        );

        // print the generated response
        Console.WriteLine($"Grouped task result: {response.Generative?.Values.First()}");
        // Console.WriteLine($"Metadata: {JsonSerializer.Serialize(response.Generative?.Metadata)}");
        // END GroupedGenerativeParametersPython
    }

    [Fact]
    public async Task TestGroupedGenerativeProperties()
    {
        // START GroupedGenerativeProperties Python
        var task = "What do these animals have in common, if anything?";

        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Generate.NearText(
            "Australian animals",
            limit: 3,
            groupedTask: new GroupedTask(task)
            {
                // highlight-start
                Properties = ["answer", "question"],
                // highlight-end
            }
        );

        // print the generated response
        // highlight-start
        foreach (var o in response.Objects)
        {
            Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
        }
        Console.WriteLine($"Grouped task result: {response.Generative?.Values.First()}");
        // highlight-end
        // END GroupedGenerativeProperties Python
    }

    // TODO[g-despot] NEW: Implement testing with images
    // [Fact]
    [Fact]
    public async Task TestWorkingWithImages()
    {
        // START WorkingWithImages
        var srcImgPath =
            "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=500&h=500&fit=crop";
        using var httpClient = new HttpClient();
        var imageBytes = await httpClient.GetByteArrayAsync(srcImgPath);
        var base64Image = Convert.ToBase64String(imageBytes);

        var groupedTask = new GroupedTask("Formulate a Jeopardy!-style question about this image");
        // highlight-start
        var provider = new Providers.Anthropic
        {
            MaxTokens = 1000,
            Images = [base64Image], // A list of base64 encoded strings of the image bytes
            ImageProperties = ["img"], // Properties containing images in Weaviate }
        };
        // highlight-end

        var jeopardy = client.Collections.Use("JeopardyQuestion");
        var response = await jeopardy.Generate.NearText(
            "Australian animals",
            limit: 3,
            groupedTask: groupedTask,
            provider: provider
        );

        // Print the source property and the generated response
        foreach (var o in response.Objects)
        {
            Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
        }
        Console.WriteLine($"Grouped task result: {response.Generative?.Values.First()}");
        // END WorkingWithImages
    }
}
