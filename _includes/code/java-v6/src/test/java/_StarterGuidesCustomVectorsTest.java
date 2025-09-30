// import com.fasterxml.jackson.annotation.JsonProperty;
// import com.fasterxml.jackson.core.type.TypeReference;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import io.weaviate.client6.v1.api.WeaviateClient;
// import io.weaviate.client6.v1.api.collections.CollectionHandle;
// import io.weaviate.client6.v1.api.collections.VectorConfig;
// import io.weaviate.client6.v1.api.collections.WeaviateObject;
// import io.weaviate.client6.v1.api.collections.query.Metadata;
// import org.junit.jupiter.api.Test;

// import java.net.URI;
// import java.net.http.HttpClient;
// import java.net.http.HttpRequest;
// import java.net.http.HttpResponse;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Map;

// import static org.assertj.core.api.Assertions.assertThat;

// class StarterGuidesCustomVectorsTest {

//   // Helper class for parsing the JSON data with vectors
//   private static class JeopardyQuestionWithVector {
//     @JsonProperty("Answer")
//     String answer;
//     @JsonProperty("Question")
//     String question;
//     @JsonProperty("Category")
//     String category;
//     @JsonProperty("vector")
//     float[] vector;
//   }

//   @Test
//   void testBringYourOwnVectors() throws Exception {
//     WeaviateClient client = null;
//     String collectionName = "Question";

//     try {
//       // Clean slate
//       client = WeaviateClient.connectToLocal();
//       if (client.collections.exists(collectionName)) {
//         client.collections.delete(collectionName);
//       }

//       // ===== Create schema =====
//       // Create the collection.
//       client.collections.create(collectionName,
//           col -> col.vectorConfig(VectorConfig.selfProvided()));

//       // ===== Import data =====
//       String fname = "jeopardy_tiny_with_vectors_all-OpenAI-ada-002.json";
//       String url =
//           "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/" + fname;

//       HttpClient httpClient = HttpClient.newHttpClient();
//       HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).build();
//       HttpResponse<String> responseHttp =
//           httpClient.send(request, HttpResponse.BodyHandlers.ofString());
//       String responseBody = responseHttp.body();

//       ObjectMapper objectMapper = new ObjectMapper();
//       List<JeopardyQuestionWithVector> data =
//           objectMapper.readValue(responseBody, new TypeReference<>() {});

//       CollectionHandle<Map<String, Object>> questions = client.collections.use(collectionName);
//       List<WeaviateObject> questionObjs = new ArrayList<>();

//       for (JeopardyQuestionWithVector d : data) {
//         // highlight-start
//         Map<String, Object> properties = Map.of(
//             "answer", d.answer,
//             "question", d.question,
//             "category", d.category
//         );
//         questionObjs.add(WeaviateObject.of(
//             properties,
//             // This is the "instruction" function (lambda) that adds the vector
//             obj -> obj.vector(Vectors.of("title_vec", d.vector))
//         ));
//         // highlight-end
//       }

//       CollectionHandle<Map<String, Object>> questions = client.collections.use(collectionName);
//       questions.data.insertMany(questionObjs.toArray(new WeaviateObject[0]));

//       // ===== Query =====
//       float[] queryVector = new float[] {0.0042927247f, -0.007413445f, 0.00034457954f,
//           /* ... shortened for brevity ... */ -0.025992135f};

//       // Added a small sleep to ensure indexing is complete
//       Thread.sleep(2000);

//       var response = questions.query.nearVector(queryVector,
//           q -> q.limit(2).returnMetadata(Metadata.CERTAINTY));

//       System.out.println(response);

//       // ===== Test query results =====
//       assertThat(response.objects()).hasSize(2);
//       assertThat(response.objects().get(0).metadata().certainty()).isNotNull()
//           .isInstanceOf(Double.class);
//       assertThat(response.objects().get(0).properties()).isNotNull().isInstanceOf(Map.class);

//     } finally {
//       if (client != null) {
//         if (client.collections.exists(collectionName)) {
//           client.collections.delete(collectionName);
//         }
//         client.close();
//       }
//     }
//   }
// }
