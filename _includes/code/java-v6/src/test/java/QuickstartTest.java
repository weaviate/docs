import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Generative;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.WeaviateObject;
import io.weaviate.client6.v1.api.collections.batch.BatchContext;
import io.weaviate.client6.v1.api.collections.generate.GenerativeProvider;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class QuickstartTest {

  @Test
  void testConnectionIsReady() throws Exception {
    // START InstantiationExample
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

    WeaviateClient client = WeaviateClient.connectToWeaviateCloud(
        weaviateUrl, // Replace with your Weaviate Cloud URL
        weaviateApiKey // Replace with your Weaviate Cloud key
    );
    // highlight-start
    System.out.println(client.isReady()); // Should print: `True`
    // highlight-end

    client.close(); // Free up resources
    // END InstantiationExample
  }

  @Test
  void testCreateCollection() throws Exception {
    // START CreateCollection
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

    WeaviateClient client = WeaviateClient.connectToWeaviateCloud(
        weaviateUrl, // Replace with your Weaviate Cloud URL
        weaviateApiKey // Replace with your Weaviate Cloud key
    );

    String collectionName = "Question";
    try { client.collections.delete(collectionName); } catch (Exception ignored) {} // Clean up from any previous run
    // highlight-start
    client.collections.create(
        collectionName,
        col -> col
            .vectorConfig(VectorConfig.text2vecWeaviate()) // Configure the Weaviate Embeddings integration
            .generativeModule(Generative.openai()) // Configure the OpenAI generative AI integration
    );
    CollectionHandle<Map<String, Object>> questions = client.collections.use(collectionName);
    // highlight-end
    // END CreateCollection
    System.out.println("Collection created: " + questions.toString());
    client.collections.delete(collectionName);
    // START CreateCollection
    client.close(); // Free up resources

    // END CreateCollection
  }

  @Test
  void testImportDataWorkflow() throws Exception {
    // START Import
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

    WeaviateClient client = WeaviateClient.connectToWeaviateCloud(
        weaviateUrl, // Replace with your Weaviate Cloud URL
        weaviateApiKey // Replace with your Weaviate Cloud key
    );

    // Create the collection
    String collectionName = "Question";
    try { client.collections.delete(collectionName); } catch (Exception ignored) {} // Clean up from any previous run
    client.collections.create(collectionName, col -> col
        .properties(
            Property.text("answer"),
            Property.text("question"),
            Property.text("category"))
        .vectorConfig(VectorConfig.text2vecWeaviate())); // Configure the Weaviate Embeddings integration;
    // Get JSON data using HttpURLConnection
    URL url = URI.create("https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json").toURL();
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    String jsonData;
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
      jsonData = reader.lines().reduce("", String::concat);
    }

    // highlight-start
    CollectionHandle<Map<String, Object>> questions = client.collections.use(collectionName);
    List<Map<String, Object>> questionsToInsert = new ArrayList<>();

    // Parse and prepare objects using org.json
    new JSONArray(jsonData).forEach(item -> {
      JSONObject json = (JSONObject) item;
      Map<String, Object> properties = new HashMap<>();
      properties.put("answer", json.getString("Answer"));
      properties.put("question", json.getString("Question"));
      properties.put("category", json.getString("Category"));
      questionsToInsert.add(properties);
    });

    // `batch.start()` opens a server-side batch
    BatchContext<Map<String, Object>> batch = questions.batch.start();
    // Closing the batch sends the remaining objects and waits for the results
    try (batch) {
      for (Map<String, Object> properties : questionsToInsert) {
        batch.add(WeaviateObject.<Map<String, Object>>of(o -> o.properties(properties)));
      }
    }
    // highlight-end

    // Check for errors
    if (batch.numberOfErrors() > 0) {
      System.err.printf("Number of failed imports: %d\n", batch.numberOfErrors());
    } else {
      System.out.printf("Successfully inserted %d objects.\n", questionsToInsert.size());
    }
    // END Import
    // client.collections.delete(collectionName);
    // START Import

    client.close(); // Free up resources
    // END Import
  }

  @Test
  void testNearTextQuery() throws Exception {
    // START NearText
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

    WeaviateClient client = WeaviateClient.connectToWeaviateCloud(
        weaviateUrl, // Replace with your Weaviate Cloud URL
        weaviateApiKey // Replace with your Weaviate Cloud key
    );

    String collectionName = "Question";
    var questions = client.collections.use(collectionName);

    // highlight-start
    var response = questions.query.nearText("biology", q -> q.limit(2));
    // highlight-end

    for (var obj : response.objects()) {
      System.out.println(obj.properties());
    }
    // END NearText
    client.collections.delete(collectionName);
    // START NearText

    client.close(); // Free up resources
    // END NearText
  }

  @Test
  void testRagQuery() throws Exception {
    // Setup, not shown in the docs: build the `Question` collection this example
    // queries, so the test does not depend on the order the other tests run in.
    // The collection is deliberately left in place: `testCreateCollection` and
    // `testImportDataWorkflow` both delete it before they recreate it.
    WeaviateClient setupClient = WeaviateClient.connectToWeaviateCloud(
        System.getenv("WEAVIATE_URL"),
        System.getenv("WEAVIATE_API_KEY"));
    String setupCollectionName = "Question";
    if (setupClient.collections.exists(setupCollectionName)) {
      setupClient.collections.delete(setupCollectionName);
    }
    setupClient.collections.create(setupCollectionName, col -> col
        .properties(
            Property.text("answer"),
            Property.text("question"),
            Property.text("category"))
        .vectorConfig(VectorConfig.text2vecWeaviate()));
    setupClient.collections.use(setupCollectionName).data.insertMany(
        Map.of("answer", "DNA",
            "question", "In 1953 Watson & Crick built a model of the molecular structure of this, the gene-carrying substance",
            "category", "SCIENCE"),
        Map.of("answer", "Liver",
            "question", "This organ removes excess glucose from the blood & stores it as glycogen",
            "category", "SCIENCE"));
    Thread.sleep(3000); // Give the vectorizer time to index the new objects
    setupClient.close();

    // START RAG
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String openaiApiKey = System.getenv("OPENAI_API_KEY");

    // highlight-start
    WeaviateClient client = WeaviateClient.connectToWeaviateCloud(
        weaviateUrl, // Replace with your Weaviate Cloud URL
        weaviateApiKey, // Replace with your Weaviate Cloud key
        config -> config.setHeaders(
            Map.of("X-OpenAI-Api-Key", openaiApiKey)) // Replace with your OpenAI API key
    );
    // highlight-end

    CollectionHandle<Map<String, Object>> questions = client.collections.use("Question");

    // highlight-start
    var response = questions.generate.nearText(
        "biology",
        // Query configuration (nearText and limit)
        q -> q.limit(2),
        // Generative configuration (the RAG task)
        g -> g.groupedTask(
            "Write a tweet with emojis about these facts.",
            c -> c.generativeProvider(GenerativeProvider.openai(o -> o))));
    // highlight-end

    // Use `.generative()` to access the generated text
    System.out.println(response.generative().text());

    client.close(); // Free up resources
    // END RAG
  }
}