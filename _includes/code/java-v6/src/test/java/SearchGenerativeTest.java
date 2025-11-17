import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.generative.GenerativeProvider;
import io.weaviate.client6.v1.api.generative.GroupedTask;
import io.weaviate.client6.v1.api.generative.SinglePrompt;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.List;
import java.util.Map;

class GenerativeSearchTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    // START INSTANTIATION-COMMON
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String openaiApiKey = System.getenv("OPENAI_APIKEY");
    String anthropicApiKey = System.getenv("ANTHROPIC_APIKEY");

    client = WeaviateClient.connectToWeaviateCloud(weaviateUrl, weaviateApiKey,
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey,
            "X-Anthropic-Api-Key", anthropicApiKey)));
    // END INSTANTIATION-COMMON
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @Test
  void testDynamicRag() {
    // START DynamicRag
    CollectionHandle<Map<String, Object>> reviews =
        client.collections.use("WineReviewNV");
    var response =
        reviews.generate.nearText("a sweet German white wine", q -> q.limit(2),
            // .target("title_country"),
            g -> g.singlePrompt("Translate this into German: {review_body}")
                .groupedTask("Summarize these reviews")
                // highlight-start
                .provider(GenerativeProvider.openAI(p -> p.temperature(0.1f)))
        // highlight-end
        );

    for (var o : response.objects()) {
      System.out.printf("Properties: %s\n", o.properties());
      System.out.printf("Single prompt result: %s\n", o.generated().text());
    }
    System.out.printf("Grouped task result: %s\n",
        response.generated().text());
    // END DynamicRag
  }

  @Test
  void testNamedVectorNearText() {
    // START NamedVectorNearTextPython
    CollectionHandle<Map<String, Object>> reviews =
        client.collections.use("WineReviewNV");
    var response = reviews.generate.nearText("a sweet German white wine",
        q -> q.limit(2)
            // highlight-start
            // .targetVector("title_country") // Specify the target vector for named vector collections
            .returnMetadata(Metadata.DISTANCE),
        g -> g.singlePrompt("Translate this into German: {review_body}")
            .groupedTask("Summarize these reviews")
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.printf("Properties: %s\n", o.properties());
      System.out.printf("Single prompt result: %s\n", o.generated().text());
    }
    System.out.printf("Grouped task result: %s\n",
        response.generated().text());
    // END NamedVectorNearTextPython
  }

  @Test
  void testSingleGenerative() {
    // START SingleGenerativePython
    // highlight-start
    String prompt =
        "Convert the following into a question for twitter. Include emojis for fun, but do not include the answer: {question}.";
    // highlight-end

    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    // highlight-start
    var response = jeopardy.generate.nearText("World history",
        // highlight-end
        q -> q.limit(2),
        // highlight-start
        g -> g.singlePrompt(prompt)
    // highlight-end
    );

    for (var o : response.objects()) {
      System.out.printf("Property 'question': %s\n",
          o.properties().get("question"));
      // highlight-start
      System.out.printf("Single prompt result: %s\n", o.generated().text());
      // highlight-end
    }
    // END SingleGenerativePython
  }

  @Test
  void testSingleGenerativeProperties() {
    // START SingleGenerativePropertiesPython
    // highlight-start
    String prompt =
        "Convert this quiz question: {question} and answer: {answer} into a trivia tweet.";
    // highlight-end

    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.generate.nearText("World history", q -> q.limit(2),
        g -> g.singlePrompt(prompt));

    // print source properties and generated responses
    for (var o : response.objects()) {
      System.out.printf("Properties: %s\n", o.properties());
      System.out.printf("Single prompt result: %s\n", o.generated().text());
    }
    // END SingleGenerativePropertiesPython
  }

  @Test
  void testSingleGenerativeParameters() {
    // START SingleGenerativeParametersPython
    // highlight-start
    var prompt = SinglePrompt.builder()
        .prompt(
            "Convert this quiz question: {question} and answer: {answer} into a trivia tweet.")
        .metadata(true)
        .debug(true)
        .build();
    // highlight-end

    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.generate.nearText("World history", q -> q.limit(2),
        // highlight-start
        g -> g.singlePrompt(prompt)
            // highlight-end
            .provider(GenerativeProvider.openAI()));

    // print source properties and generated responses
    for (var o : response.objects()) {
      System.out.printf("Properties: %s\n", o.properties());
      System.out.printf("Single prompt result: %s\n", o.generated().text());
      System.out.printf("Debug: %s\n", o.generated().debug());
      System.out.printf("Metadata: %s\n", o.generated().metadata());
    }
    // END SingleGenerativeParametersPython
  }

  @Test
  void testGroupedGenerative() {
    // START GroupedGenerativePython
    // highlight-start
    String task = "What do these animals have in common, if anything?";
    // highlight-end

    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.generate.nearText("Cute animals", q -> q.limit(3),
        // highlight-start
        g -> g.groupedTask(task)
    // highlight-end
    );

    // print the generated response
    System.out.printf("Grouped task result: %s\n",
        response.generated().text());
    // END GroupedGenerativePython
  }

  @Test
  void testGroupedGenerativeParameters() {
    // START GroupedGenerativeParametersPython
    // highlight-start
    var groupedTask = GroupedTask.builder()
        .prompt("What do these animals have in common, if anything?")
        .metadata(true)
        .build();
    // highlight-end

    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.generate.nearText("Cute animals", q -> q.limit(3),
        // highlight-start
        g -> g.groupedTask(groupedTask)
            // highlight-end
            .provider(GenerativeProvider.openAI()));

    // print the generated response
    System.out.printf("Grouped task result: %s\n",
        response.generated().text());
    System.out.printf("Metadata: %s\n", response.generated().metadata());
    // END GroupedGenerativeParametersPython
  }

  @Test
  void testGroupedGenerativeProperties() {
    // START GroupedGenerativeProperties Python
    String task = "What do these animals have in common, if anything?";

    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.generate.nearText("Cute animals", q -> q.limit(3),
        g -> g.groupedTask(task)
            // highlight-start
            .groupedProperties("answer", "question")
    // highlight-end
    );

    // print the generated response
    // highlight-start
    for (var o : response.objects()) {
      System.out.printf("Properties: %s\n", o.properties());
    }
    System.out.printf("Grouped task result: %s\n",
        response.generated().text());
    // highlight-end
    // END GroupedGenerativeProperties Python
  }

  @Test
  void testWorkingWithImages() throws IOException, InterruptedException {
    // START WorkingWithImages
    String srcImgPath =
        "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=500&h=500&fit=crop";
    HttpClient httpClient = HttpClient.newHttpClient();
    HttpRequest request =
        HttpRequest.newBuilder().uri(URI.create(srcImgPath)).build();
    HttpResponse<byte[]> imageResponse =
        httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
    String base64Image =
        Base64.getEncoder().encodeToString(imageResponse.body());

    var prompt = GroupedTask.builder()
        // highlight-start
        .prompt("Formulate a Jeopardy!-style question about this image")
        .images(List.of(base64Image)) // A list of base64 encoded strings of the image bytes
        // .imageProperties("img") // Properties containing images in Weaviate
        // highlight-end
        .build();

    CollectionHandle<Map<String, Object>> jeopardy =
        client.collections.use("JeopardyQuestion");
    var response = jeopardy.generate.nearText("Australian animals",
        q -> q.limit(3).groupedProperties("answer", "question"),
        // highlight-start
        g -> g.groupedTask(prompt)
            // highlight-end
            .provider(GenerativeProvider.anthropic(p -> p.maxTokens(1000))));

    // Print the source property and the generated response
    for (var o : response.objects()) {
      System.out.printf("Properties: %s\n", o.properties());
    }
    System.out.printf("Grouped task result: %s\n",
        response.generated().text());
    // END WorkingWithImages
  }
}
