import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.ObjectMetadata;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.Vectors;
import io.weaviate.client6.v1.api.collections.WeaviateObject;
import io.weaviate.client6.v1.api.collections.data.Reference;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;

class StarterGuidesCustomVectorsTest {

  // Helper class for parsing the JSON data with vectors
  private static class JeopardyQuestionWithVector {
    @JsonProperty("Answer")
    String answer;
    @JsonProperty("Question")
    String question;
    @JsonProperty("Category")
    String category;
    @JsonProperty("vector")
    float[] vector;
  }

  //TODO[g-despot] NearVector missing targetVector
  @Test
  void testBringYourOwnVectors() throws Exception {
    WeaviateClient client = null;
    String collectionName = "Question";

    try {
      // Clean slate
      client = WeaviateClient.connectToLocal();
      if (client.collections.exists(collectionName)) {
        client.collections.delete(collectionName);
      }

      // START CreateCollection
      // Create the collection.
      client.collections.create(collectionName, col -> col
          .properties(Property.text("answer"), Property.text("question"), Property.text("category"))
          .vectorConfig(VectorConfig.selfProvided()));
      // END CreateCollection
      // START ImportData
      String fname = "jeopardy_tiny_with_vectors_all-OpenAI-ada-002.json";
      String url =
          "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/" + fname;

      HttpClient httpClient = HttpClient.newHttpClient();
      HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).build();
      HttpResponse<String> responseHttp =
          httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      String responseBody = responseHttp.body();

      ObjectMapper objectMapper = new ObjectMapper();
      List<JeopardyQuestionWithVector> data =
          objectMapper.readValue(responseBody, new TypeReference<>() {});

      // Get a handle to the collection
      CollectionHandle<Map<String, Object>> questions = client.collections.use(collectionName);
      // Declare the list with the specific generic signature required by insertMany
      List<WeaviateObject<Map<String, Object>, Reference, ObjectMetadata>> questionObjs =
          new ArrayList<>();

      for (JeopardyQuestionWithVector d : data) {
        // highlight-start
        Map<String, Object> properties =
            Map.of("answer", d.answer, "question", d.question, "category", d.category);

        // Use the explicit Builder to construct the object with a custom vector
        questionObjs
            .add(new WeaviateObject.Builder<Map<String, Object>, Reference, ObjectMetadata>()
                .properties(properties)
                .metadata(ObjectMetadata
                    .of(meta -> meta.uuid(UUID.randomUUID()).vectors(Vectors.of(d.vector))))
                .build());
        // highlight-end
      }

      // Pass the correctly typed list directly to insertMany
      var insertManyResponse = questions.data.insertMany(questionObjs);
      if (!insertManyResponse.errors().isEmpty()) {
        System.err.printf("Number of failed imports: %d\n", insertManyResponse.errors().size());
        System.err.printf("First failed object error: %s\n", insertManyResponse.errors().get(0));
      }
      // END ImportData
      // START NearVector
      float[] queryVector = data.get(0).vector; // Use a vector from the dataset for a reliable query

      // Added a small sleep to ensure indexing is complete
      Thread.sleep(2000);

      var response = questions.query.nearVector(queryVector,
          q -> q.limit(2).returnMetadata(Metadata.CERTAINTY));

      System.out.println(response);
      // END NearVector
      // ===== Test query results =====
      assertThat(response.objects()).hasSize(2);
      // The first result should be the object we used for the query, with near-perfect certainty
      assertThat(response.objects().get(0).metadata().certainty()).isNotNull()
          .isGreaterThan(0.999f);
      assertThat(response.objects().get(0).properties()).isNotNull().isInstanceOf(Map.class);
      assertThat(response.objects().get(0).properties().get("question"))
          .isEqualTo(data.get(0).question);


    } finally {
      if (client != null) {
        if (client.collections.exists(collectionName)) {
          client.collections.delete(collectionName);
        }
        client.close();
      }
    }
  }
}
