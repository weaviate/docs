import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.data.InsertManyResponse;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class GetStartedTest {

  @Test
  void testGetStartedWorkflow() throws Exception {
    WeaviateClient client = null;
    String collectionName = "Question";
    try {
      // START GetStarted
      // highlight-start
      // Connect to a local Weaviate instance
      client = WeaviateClient.connectToLocal();
      // highlight-end
      if (client.collections.exists(collectionName)) {
        client.collections.delete(collectionName);
      }

      // highlight-start
      // Create a collection with
      client.collections.create(
          collectionName,
          col -> col.properties(Property.text("answer"),
              Property.text("question"),
              Property.text("category"))
              .vectorConfig(VectorConfig.text2vecContextionary()) // Configure the Contextionary embedding model
      );
      CollectionHandle<Map<String, Object>> questions = client.collections.use(collectionName);
      // highlight-end

      HttpClient httpClient = HttpClient.newHttpClient();
      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI
              .create("https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json"))
          .build();
      HttpResponse<String> responseHttp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      String responseBody = responseHttp.body();

      ObjectMapper objectMapper = new ObjectMapper();
      List<Map<String, String>> data = objectMapper.readValue(responseBody, new TypeReference<>() {
      });

      // highlight-start
      // Create a list to hold the objects for insertion
      List<Map<String, Object>> questionsToInsert = new ArrayList<>();

      // Populate the list with the data
      for (Map<String, String> d : data) {
        Map<String, Object> properties = new HashMap<>();
        properties.put("answer", d.get("Answer"));
        properties.put("question", d.get("Question"));
        properties.put("category", d.get("Category"));
        questionsToInsert.add(properties);
      }

      // Call insertMany with the list of objects
      InsertManyResponse insertResponse = questions.data.insertMany(questionsToInsert.toArray(new Map[0]));

      // Check for errors
      if (!insertResponse.errors().isEmpty()) {
        System.err.println("Errors during insertMany: " + insertResponse.errors());
      }
      // highlight-end

      // END GetStarted
      Thread.sleep(2000);
      // START GetStarted
      // highlight-start
      // Perform a vector similarity search
      var queryResponse = questions.query.nearText("biology", q -> q.limit(2));
      // highlight-end

      for (var obj : queryResponse.objects()) {
        System.out.println(obj.properties());
      }
      // END GetStarted
    } finally {
      if (client != null) {
        if (client.collections.exists(collectionName)) {
          client.collections.delete(collectionName);
        }
        client.close(); // Free up resources
      }
    }
  }
}