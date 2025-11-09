import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Generative;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.data.InsertManyResponse;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class QuickstartLocalTest {

  @Test
  void testConnectionIsReady() throws Exception {
    // START InstantiationExample
    WeaviateClient client = WeaviateClient.connectToLocal();
    // highlight-start
    System.out.println(client.isReady()); // Should print: `True`
    // highlight-end

    client.close(); // Free up resources

    // END InstantiationExample
  }

  @Test
  void testCreateCollection() throws Exception {
    String collectionName = "Question";
    // START CreateCollection
    WeaviateClient client = WeaviateClient.connectToLocal();

    // highlight-start
    client.collections.create(
        collectionName,
        col -> col
            .vectorConfig(VectorConfig.text2vecTransformers()) // Configure the Weaviate Embeddings integration
            .generativeModule(Generative.cohere()) // Configure the Cohere generative AI integration
            .properties(Property.text("answer"), Property.text("question"), Property.text("category")));
    CollectionHandle<Map<String, Object>> questions = client.collections.use(collectionName);
    // highlight-end
    // END CreateCollection
    client.collections.delete(collectionName);
    // START CreateCollection

    client.close(); // Free up resources

    // END CreateCollection
  }

  @Test
  void testImportDataWorkflow() throws Exception {
    // START Import
    WeaviateClient client = WeaviateClient.connectToLocal();

    // Create the collection
    String collectionName = "Question";
    client.collections.create(collectionName, col -> col
        .properties(
            Property.text("answer"),
            Property.text("question"),
            Property.text("category"))
        .vectorConfig(VectorConfig.text2vecTransformers())); // Configure the Weaviate Embeddings integration;

    // Get JSON data using HttpURLConnection
    URL url = new URL("https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json");
    String jsonData = new BufferedReader(
        new InputStreamReader(((HttpURLConnection) url.openConnection()).getInputStream()))
        .lines().reduce("", String::concat);

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

    // Call insertMany with the list of objects
    InsertManyResponse insertResponse = questions.data.insertMany(questionsToInsert.toArray(new Map[0]));
    // highlight-end

    // Check for errors
    if (!insertResponse.errors().isEmpty()) {
      System.err.printf("Number of failed imports: %d\n", insertResponse.errors().size());
      System.err.printf("First failed object error: %s\n", insertResponse.errors().get(0));
    } else {
      System.out.printf("Successfully inserted %d objects.\n", insertResponse.uuids().size());
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
    WeaviateClient client = WeaviateClient.connectToLocal();

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

  // @Test
  // void testRagQuery() {
  // WeaviateClient client = WeaviateClient.connectToLocal();

  // var questions = client.collections.use("Question");

  // // highlight-start
  // var response = questions.generate.nearText(
  // q -> q
  // .query("biology")
  // .limit(2),
  // g -> g.groupedTask("Write a tweet with emojis about these facts."));
  // // highlight-end

  // System.out.println(response.generative().text()); // Inspect the generated
  // text
  // }
  // START RAG
  // Coming soon
  // END RAG
}