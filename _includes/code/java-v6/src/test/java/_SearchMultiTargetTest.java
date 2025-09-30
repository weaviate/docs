// import com.fasterxml.jackson.core.type.TypeReference;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import io.weaviate.client6.v1.api.WeaviateClient;
// import io.weaviate.client6.v1.api.collections.CollectionHandle;
// import io.weaviate.client6.v1.api.collections.Property;
// import io.weaviate.client6.v1.api.collections.VectorConfig;
// import io.weaviate.client6.v1.api.collections.query.Metadata;
// import io.weaviate.client6.v1.api.collections.query.TargetVectors;
// import org.junit.jupiter.api.AfterAll;
// import org.junit.jupiter.api.BeforeAll;
// import org.junit.jupiter.api.Test;

// import java.io.IOException;
// import java.net.URI;
// import java.net.http.HttpClient;
// import java.net.http.HttpRequest;
// import java.net.http.HttpResponse;
// import java.util.ArrayList;
// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;

// class MultiTargetSearchTest {

//   private static WeaviateClient client;

//   @BeforeAll
//   public static void beforeAll() throws IOException, InterruptedException {
//     // START LoadDataNamedVectors
//     String openaiApiKey = System.getenv("OPENAI_APIKEY");
//     client = WeaviateClient.connectToLocal(
//         config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));

//     // Start with a new collection
//     // CAUTION: The next line deletes the collection if it exists
//     if (client.collections.exists("JeopardyTiny")) {
//       client.collections.delete("JeopardyTiny");
//     }

//     // Define a new schema
//     client.collections.create(
//         "JeopardyTiny",
//         col -> col
//             .description("Jeopardy game show questions")
//             .vectorConfig(
//                 VectorConfig.text2VecWeaviate("jeopardy_questions_vector",
//                     vc -> vc.sourceProperties("question")),
//                 VectorConfig.text2VecWeaviate("jeopardy_answers_vector",
//                     vc -> vc.sourceProperties("answer")))
//             .properties(
//                 Property.text("category"),
//                 Property.text("question"),
//                 Property.text("answer")));

//     // Get the sample data set
//     HttpClient httpClient = HttpClient.newHttpClient();
//     HttpRequest request = HttpRequest.newBuilder()
//         .uri(URI.create("https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json"))
//         .build();
//     HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
//     String responseBody = response.body();

//     ObjectMapper objectMapper = new ObjectMapper();
//     List<Map<String, String>> data = objectMapper.readValue(responseBody, new TypeReference<>() {
//     });

//     // Prepare the sample data for upload
//     List<Map<String, Object>> questionObjects = new ArrayList<>();
//     for (Map<String, String> row : data) {
//       Map<String, Object> questionObject = new HashMap<>();
//       questionObject.put("question", row.get("Question"));
//       questionObject.put("answer", row.get("Answer"));
//       questionObject.put("category", row.get("Category"));
//       questionObjects.add(questionObject);
//     }

//     // Upload the sample data
//     CollectionHandle<Map<String, Object>> nvjcCollection = client.collections.use("JeopardyTiny");
//     nvjcCollection.batch.withFixedSize(200, batch -> {
//       for (Map<String, Object> q : questionObjects) {
//         batch.addObject(q);
//       }
//     });
//     // END LoadDataNamedVectors
//   }

//   @AfterAll
//   public static void afterAll() throws Exception {
//     if (client.collections.exists("JeopardyTiny")) {
//       client.collections.delete("JeopardyTiny");
//     }
//     client.close();
//   }

//   @Test
//   void testMultiBasic() {
//     // START MultiBasic
//     CollectionHandle<Map<String, Object>> collection = client.collections.use("JeopardyTiny");

//     var response = collection.query.nearText(
//         "a wild animal",
//         q -> q
//             .limit(2)
//             // highlight-start
//             // .targetVectors("jeopardy_questions_vector", "jeopardy_answers_vector") // Specify the target vectors
//             // highlight-end
//             .returnMetadata(Metadata.DISTANCE));

//     for (var o : response.objects()) {
//       System.out.println(o.properties());
//       System.out.println(o.metadata().distance());
//     }
//     // END MultiBasic
//   }

//   @Test
//   void testMultiTargetNearVector() {
//     CollectionHandle<Map<String, Object>> collection = client.collections.use("JeopardyTiny");
//     var someResult = collection.query.fetchObjects(q -> q.limit(2).returnMetadata(Metadata.VECTOR));
//     if (someResult.objects().size() < 2)
//       return;

//     var v1 = someResult.objects().get(0).metadata().vectors().get("jeopardy_questions_vector");
//     var v2 = someResult.objects().get(1).metadata().vectors().get("jeopardy_answers_vector");

//     // START MultiTargetNearVector
//     var response = collection.query.nearVector(
//         // highlight-start
//         // Specify the query vectors for each target vector
//         Map.of(
//             "jeopardy_questions_vector", v1,
//             "jeopardy_answers_vector", v2),
//         // highlight-end
//         q -> q
//             .limit(2)
//             // .targetVectors("jeopardy_questions_vector", "jeopardy_answers_vector") // Specify the target vectors
//             .returnMetadata(Metadata.DISTANCE));

//     for (var o : response.objects()) {
//       System.out.println(o.properties());
//       System.out.println(o.metadata().distance());
//     }
//     // END MultiTargetNearVector
//   }

//   @Test
//   void testMultiTargetMultipleNearVectors() {
//     CollectionHandle<Map<String, Object>> collection = client.collections.use("JeopardyTiny");
//     var someResult = collection.query.fetchObjects(q -> q.limit(3).returnMetadata(Metadata.VECTOR));
//     if (someResult.objects().size() < 3)
//       return;

//     var v1 = someResult.objects().get(0).metadata().vectors().get("jeopardy_questions_vector");
//     var v2 = someResult.objects().get(1).metadata().vectors().get("jeopardy_answers_vector");
//     var v3 = someResult.objects().get(2).metadata().vectors().get("jeopardy_answers_vector");

//     // START MultiTargetMultipleNearVectorsV1
//     Map<String, Object> nearVectorV1 = new HashMap<>();
//     nearVectorV1.put("jeopardy_questions_vector", v1);
//     nearVectorV1.put("jeopardy_answers_vector", List.of(v2, v3));

//     var responseV1 = collection.query.nearVector(
//         // highlight-start
//         // Specify the query vectors for each target vector
//         nearVectorV1,
//         // highlight-end
//         q -> q
//             .limit(2)
//             // Specify the target vectors as a list
//             // .targetVectors("jeopardy_questions_vector", "jeopardy_answers_vector")
//             .returnMetadata(Metadata.DISTANCE));

//     for (var o : responseV1.objects()) {
//       System.out.println(o.properties());
//       System.out.println(o.metadata().distance());
//     }
//     // END MultiTargetMultipleNearVectorsV1

//     // START MultiTargetMultipleNearVectorsV2
//     Map<String, Object> nearVectorV2 = new HashMap<>();
//     nearVectorV2.put("jeopardy_questions_vector", v1);
//     nearVectorV2.put("jeopardy_answers_vector", List.of(v2, v3));

//     var responseV2 = collection.query.nearVector(
//         // highlight-start
//         // Specify the query vectors for each target vector
//         nearVectorV2,
//         // highlight-end
//         q -> q
//             .limit(2)
//             // Specify the target vectors and weights
//             .targetVectors(TargetVectors.manualWeights(Map.of(
//                 "jeopardy_questions_vector", 10,
//                 "jeopardy_answers_vector", List.of(30, 30) // Matches the order of the vectors above
//             )))
//             .returnMetadata(Metadata.DISTANCE));

//     for (var o : responseV2.objects()) {
//       System.out.println(o.properties());
//       System.out.println(o.metadata().distance());
//     }
//     // END MultiTargetMultipleNearVectorsV2
//   }

//   @Test
//   void testMultiTargetWithSimpleJoin() {
//     // START MultiTargetWithSimpleJoin
//     CollectionHandle<Map<String, Object>> collection = client.collections.use("JeopardyTiny");

//     var response = collection.query.nearText(
//         "a wild animal",
//         q -> q
//             .limit(2)
//             // highlight-start
//             .targetVectors(TargetVectors.average("jeopardy_questions_vector", "jeopardy_answers_vector")) // Specify the
//                                                                                                           // target
//                                                                                                           // vectors and
//                                                                                                           // the join
//                                                                                                           // strategy
//             // .sum(), .minimum(), .manualWeights(), .relativeScore() also available
//             // highlight-end
//             .returnMetadata(Metadata.DISTANCE));

//     for (var o : response.objects()) {
//       System.out.println(o.properties());
//       System.out.println(o.metadata().distance());
//     }
//     // END MultiTargetWithSimpleJoin
//   }

//   @Test
//   void testMultiTargetManualWeights() {
//     // START MultiTargetManualWeights
//     CollectionHandle<Map<String, Object>> collection = client.collections.use("JeopardyTiny");

//     var response = collection.query.nearText(
//         "a wild animal",
//         q -> q
//             .limit(2)
//             // highlight-start
//             .targetVectors(TargetVectors.manualWeights(Map.of(
//                 "jeopardy_questions_vector", 10,
//                 "jeopardy_answers_vector", 50)))
//             // highlight-end
//             .returnMetadata(Metadata.DISTANCE));

//     for (var o : response.objects()) {
//       System.out.println(o.properties());
//       System.out.println(o.metadata().distance());
//     }
//     // END MultiTargetManualWeights
//   }

//   @Test
//   void testMultiTargetRelativeScore() {
//     // START MultiTargetRelativeScore
//     CollectionHandle<Map<String, Object>> collection = client.collections.use("JeopardyTiny");

//     var response = collection.query.nearText(
//         "a wild animal",
//         q -> q
//             .limit(2)
//             // highlight-start
//             .targetVectors(TargetVectors.relativeScore(Map.of(
//                 "jeopardy_questions_vector", 10,
//                 "jeopardy_answers_vector", 10)))
//             // highlight-end
//             .returnMetadata(Metadata.DISTANCE));

//     for (var o : response.objects()) {
//       System.out.println(o.properties());
//       System.out.println(o.metadata().distance());
//     }
//     // END MultiTargetRelativeScore
//   }
// }