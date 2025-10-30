// using Xunit;
// using Weaviate.Client;
// using Weaviate.Client.Models;
// using System;
// using System.Threading.Tasks;
// using System.Text.Json;
// using System.Linq;
// using System.Collections.Generic;
// using System.Net.Http;

// namespace WeaviateProject.Tests;

// public class GenerativeSearchTest : IDisposable
// {
//     private static readonly WeaviateClient client;

//     // Static constructor for one-time setup (like @BeforeAll)
//     static GenerativeSearchTest()
//     {
//         // START INSTANTIATION-COMMON
//         // Best practice: store your credentials in environment variables
//         string weaviateUrl = Environment.GetEnvironmentVariable("WEAVIATE_URL");
//         string weaviateApiKey = Environment.GetEnvironmentVariable("WEAVIATE_API_KEY");
//         string openaiApiKey = Environment.GetEnvironmentVariable("OPENAI_APIKEY");
//         string anthropicApiKey = Environment.GetEnvironmentVariable("ANTHROPIC_APIKEY");

//         var config = new ClientConfiguration
//         {
//             GrpcAddress = weaviateUrl,
//             // Headers = new()
//             // {
//             //     { "Authorization", $"Bearer {weaviateApiKey}" },
//             //     { "X-OpenAI-Api-Key", openaiApiKey },
//             //     { "X-Anthropic-Api-Key", anthropicApiKey }
//             // }
//         };
//         client = new WeaviateClient(config);
//         // END INSTANTIATION-COMMON
//     }

//     // Dispose is called once after all tests in the class are finished (like @AfterAll)
//     public void Dispose()
//     {
//         // The C# client manages connections automatically and does not require an explicit 'close' method.
//         GC.SuppressFinalize(this);
//     }

//     [Fact]
//     public async Task TestDynamicRag()
//     {
//         // START DynamicRag
//         var reviews = client.Collections.Use("WineReviewNV");
//         var response = await reviews.Generate.NearText(
//             "a sweet German white wine",
//             limit: 2,
//             targetVector: ["title_country"],
//             prompt: new SinglePrompt { Prompt = "Translate this into German: {review_body}" },
//             groupedPrompt: new GroupedPrompt { Task = "Summarize these reviews" }
//             // highlight-start
//             // provider: new GenerativeProvider.(OpenAI) { Temperature = 0.1f }
//             // highlight-end
//         );

//         foreach (var o in response.Objects)
//         {
//             Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
//             Console.WriteLine($"Single prompt result: {o.Generative?.Values}");
//         }
//         Console.WriteLine($"Grouped task result: {response.Generative?.Values}");
//         // END DynamicRag
//     }

//     [Fact]
//     public async Task TestNamedVectorNearText()
//     {
//         // START NamedVectorNearTextPython
//         var reviews = client.Collections.Use("WineReviewNV");
//         var response = await reviews.Generate.NearText(
//             "a sweet German white wine",
//             limit: 2,
//             // highlight-start
//             targetVector: ["title_country"], // Specify the target vector for named vector collections
//             returnMetadata: MetadataOptions.Distance,
//             prompt: new SinglePrompt { Prompt = "Translate this into German: {review_body}" },
//             groupedPrompt: new GroupedPrompt { Task = "Summarize these reviews" }
//             // highlight-end
//         );

//         foreach (var o in response.Objects)
//         {
//             Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
//             Console.WriteLine($"Single prompt result: {o.Generative?.Values}");
//         }
//         Console.WriteLine($"Grouped task result: {response.Generative?.Values}");
//         // END NamedVectorNearTextPython
//     }

//     [Fact]
//     public async Task TestSingleGenerative()
//     {
//         // START SingleGenerativePython
//         // highlight-start
//         var prompt = "Convert the following into a question for twitter. Include emojis for fun, but do not include the answer: {question}.";
//         // highlight-end

//         var jeopardy = client.Collections.Use("JeopardyQuestion");
//         // highlight-start
//         var response = await jeopardy.Generate.NearText(
//             // highlight-end
//             "World history",
//             limit: 2,
//             // highlight-start
//             prompt: new SinglePrompt { Prompt = prompt }
//         );
//         // highlight-end

//         foreach (var o in response.Objects)
//         {
//             var props = o.Properties as IDictionary<string, object>;
//             Console.WriteLine($"Property 'question': {props?["question"]}");
//             // highlight-start
//             Console.WriteLine($"Single prompt result: {o.Generative?.Values}");
//             // highlight-end
//         }
//         // END SingleGenerativePython
//     }

//     [Fact]
//     public async Task TestSingleGenerativeProperties()
//     {
//         // START SingleGenerativePropertiesPython
//         // highlight-start
//         var prompt = "Convert this quiz question: {question} and answer: {answer} into a trivia tweet.";
//         // highlight-end

//         var jeopardy = client.Collections.Use("JeopardyQuestion");
//         var response = await jeopardy.Generate.NearText(
//             "World history",
//             limit: 2,
//             prompt: new SinglePrompt { Prompt = prompt }
//         );

//         // print source properties and generated responses
//         foreach (var o in response.Objects)
//         {
//             Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
//             Console.WriteLine($"Single prompt result: {o.Generative?.Values}");
//         }
//         // END SingleGenerativePropertiesPython
//     }

//     [Fact]
//     public async Task TestSingleGenerativeParameters()
//     {
//         // START SingleGenerativeParametersPython
//         // highlight-start
//         var singlePrompt = new SinglePrompt
//         {
//             Prompt = "Convert this quiz question: {question} and answer: {answer} into a trivia tweet.",
//             // Metadata = true,
//             Debug = true
//         };
//         // highlight-end

//         var jeopardy = client.Collections.Use("JeopardyQuestion");
//         var response = await jeopardy.Generate.NearText(
//             "World history",
//             limit: 2,
//             // highlight-start
//             prompt: singlePrompt
//         // highlight-end
//         // provider: new GenerativeProvider.OpenAI()
//         );

//         // print source properties and generated responses
//         foreach (var o in response.Objects)
//         {
//             Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
//             Console.WriteLine($"Single prompt result: {o.Generative?.Values}");
//             //Console.WriteLine($"Debug: {o.Generative?}");
//             //Console.WriteLine($"Metadata: {JsonSerializer.Serialize(o.Generative?.Metadata)}");
//         }
//         // END SingleGenerativeParametersPython
//     }

//     [Fact]
//     public async Task TestGroupedGenerative()
//     {
//         // START GroupedGenerativePython
//         // highlight-start
//         var task = "What do these animals have in common, if anything?";
//         // highlight-end

//         var jeopardy = client.Collections.Use("JeopardyQuestion");
//         var response = await jeopardy.Generate.NearText(
//             "Cute animals",
//             limit: 3,
//             // highlight-start
//             groupedPrompt: new GroupedPrompt { Task = task }
//         );
//         // highlight-end

//         // print the generated response
//         Console.WriteLine($"Grouped task result: {response.Generative?.Values}");
//         // END GroupedGenerativePython
//     }

//     // TODO[g-despot] Metadata missing
//     [Fact]
//     public async Task TestGroupedGenerativeParameters()
//     {
//         // START GroupedGenerativeParametersPython
//         // highlight-start
//         var groupedTask = new GroupedPrompt
//         {
//             Task = "What do these animals have in common, if anything?",
//             // Metadata = true
//         };
//         // highlight-end

//         var jeopardy = client.Collections.Use("JeopardyQuestion");
//         var response = await jeopardy.Generate.NearText(
//             "Cute animals",
//             limit: 3,
//             // highlight-start
//             groupedPrompt: groupedTask
//         // highlight-end
//         // provider: new GenerativeProvider.OpenAI()
//         );

//         // print the generated response
//         Console.WriteLine($"Grouped task result: {response.Generative?.Values}");
//         // Console.WriteLine($"Metadata: {JsonSerializer.Serialize(response.Generative?.Metadata)}");
//         // END GroupedGenerativeParametersPython
//     }

//     [Fact]
//     public async Task TestGroupedGenerativeProperties()
//     {
//         // START GroupedGenerativeProperties Python
//         var task = "What do these animals have in common, if anything?";

//         var jeopardy = client.Collections.Use("JeopardyQuestion");
//         var response = await jeopardy.Generate.NearText(
//             "Australian animals",
//             limit: 3,
//             groupedPrompt: new GroupedPrompt
//             {
//                 Task = task,
//                 // highlight-start
//                 Properties = ["answer", "question"]
//                 // highlight-end
//             }
//         );

//         // print the generated response
//         // highlight-start
//         foreach (var o in response.Objects)
//         {
//             Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
//         }
//         Console.WriteLine($"Grouped task result: {response.Generative?.Values}");
//         // highlight-end
//         // END GroupedGenerativeProperties Python
//     }

//     //TODO[g-despot] Missing image processing
//     [Fact]
//     public async Task TestWorkingWithImages()
//     {
//         // START WorkingWithImages
//         var srcImgPath = "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=500&h=500&fit=crop";
//         using var httpClient = new HttpClient();
//         var imageBytes = await httpClient.GetByteArrayAsync(srcImgPath);
//         var base64Image = Convert.ToBase64String(imageBytes);

//         var groupedTask = new GroupedPrompt
//         {
//             // highlight-start
//             Task = "Formulate a Jeopardy!-style question about this image",
//             // Images = [base64Image] // A list of base64 encoded strings of the image bytes
//             // ImageProperties = ["img"] // Properties containing images in Weaviate
//             // highlight-end
//         };

//         var jeopardy = client.Collections.Use("JeopardyQuestion");
//         var response = await jeopardy.Generate.NearText(
//             "Australian animals",
//             limit: 3,
//             groupedPrompt: groupedTask
//         // highlight-start
//         // highlight-end
//         // provider: new GenerativeProvider.Anthropic { MaxTokensToSample = 1000 }
//         );

//         // Print the source property and the generated response
//         foreach (var o in response.Objects)
//         {
//             Console.WriteLine($"Properties: {JsonSerializer.Serialize(o.Properties)}");
//         }
//         Console.WriteLine($"Grouped task result: {response.Generative?.Result}");
//         // END WorkingWithImages
//     }
// }