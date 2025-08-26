import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.data.Reference;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import io.weaviate.client6.v1.api.collections.query.QueryReference;
import io.weaviate.client6.v1.api.collections.ObjectMetadata;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class CrossReferencesTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    // Instantiate the client anonymously
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    client = WeaviateClient.local(config -> config
        .setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
  }

  @AfterEach
  public void afterEach() throws IOException {
    // Clean up collections after each test
    try {
      client.collections.delete("JeopardyQuestion");
    } catch (Exception e) {
      // Collection might not exist
    }
    try {
      client.collections.delete("JeopardyCategory");
    } catch (Exception e) {
      // Collection might not exist
    }
  }

  @Test
  void testCrossRefDefinition() throws IOException {
    // START CrossRefDefinition
    client.collections.create("JeopardyCategory", col -> col
        .description("A Jeopardy! category")
        .properties(
            Property.text("title")));

    client.collections.create("JeopardyQuestion", col -> col
        .description("A Jeopardy! question")
        .properties(
            Property.text("question"),
            Property.text("answer"))
        // highlight-start
        .references(
            Property.reference("hasCategory", "JeopardyCategory"))
    // highlight-end
    );
    // END CrossRefDefinition

    // Verify collections were created properly
    var questionConfig = client.collections.getConfig("JeopardyQuestion").get();
    assertThat(questionConfig.references()).hasSize(1);
    assertThat(questionConfig.references().get(0).propertyName()).isEqualTo("hasCategory");
  }

  @Test
  void testObjectWithCrossRef() throws IOException {
    // Setup collections
    setupCollections();

    // Prep data
    var categories = client.collections.use("JeopardyCategory");
    Map<String, Object> categoryProperties = Map.of("title", "Weaviate");
    var categoryResult = categories.data.insert(categoryProperties);
    var categoryUuid = categoryResult.metadata().uuid();

    Map<String, Object> properties = Map.of(
        "question", "What tooling helps make Weaviate scalable?",
        "answer", "Sharding, multi-tenancy, and replication");

    // START ObjectWithCrossRef
    var questions = client.collections.use("JeopardyQuestion");

    var result = questions.data.insert(
        properties, // A map with the properties of the object
        opt -> opt
            // highlight-start
            .reference("hasCategory", Reference.uuids(categoryUuid)) // e.g. {"hasCategory":
                                                                     // "583876f3-e293-5b5b-9839-03f455f14575"}
    // highlight-end
    );
    // END ObjectWithCrossRef

    // Test results
    var fetchedObj = questions.query.byId(
        result.metadata().uuid(),
        opt -> opt.returnReferences(
            QueryReference.single("hasCategory")));

    assertThat(fetchedObj).isPresent();
    assertThat(fetchedObj.get().references()).containsKey("hasCategory");
  }

  @Test
  void testOneWay() throws IOException {
    // Setup collections and get sample IDs
    setupCollections();
    var questions = client.collections.use("JeopardyQuestion");
    var categories = client.collections.use("JeopardyCategory");

    // Insert test data
    Map<String, Object> questionData = Map.of(
        "question", "This city is known for the Golden Gate Bridge",
        "answer", "San Francisco");
    var questionResult = questions.data.insert(questionData);
    var questionObjId = questionResult.metadata().uuid();

    Map<String, Object> categoryData = Map.of("title", "U.S. CITIES");
    var categoryResult = categories.data.insert(categoryData);
    var categoryObjId = categoryResult.metadata().uuid();

    // START OneWayCrossReferences
    questions.data.referenceAdd(
        questionObjId,
        "hasCategory",
        // highlight-start
        Reference.uuids(categoryObjId)
    // highlight-end
    );
    // END OneWayCrossReferences

    // Test results
    var result = questions.query.byId(
        questionObjId,
        opt -> opt.returnReferences(
            QueryReference.single("hasCategory",
                ref -> ref.returnMetadata(Metadata.UUID))));

    assertThat(result).isPresent();
    assertThat(result.get().references()).containsKey("hasCategory");
  }

  @Test
  void testTwoWay() throws IOException {
    // Clean up first
    client.collections.delete("JeopardyQuestion");
    client.collections.delete("JeopardyCategory");

    // START TwoWayCategory1CrossReferences
    client.collections.create("JeopardyCategory", col -> col
        .description("A Jeopardy! category")
        .properties(
            Property.text("title")));
    // END TwoWayCategory1CrossReferences

    // START TwoWayQuestionCrossReferences
    client.collections.create("JeopardyQuestion", col -> col
        .description("A Jeopardy! question")
        .properties(
            Property.text("question"),
            Property.text("answer"))
        // highlight-start
        .references(
            Property.reference("hasCategory", "JeopardyCategory"))
    // highlight-end
    );
    // END TwoWayQuestionCrossReferences

    // START TwoWayCategoryCrossReferences
    var category = client.collections.use("JeopardyCategory");
    category.config.addReference(
        // highlight-start
        "hasQuestion", "JeopardyQuestion"
    // highlight-end
    );
    // END TwoWayCategoryCrossReferences

    // Insert test data
    var questions = client.collections.use("JeopardyQuestion");
    var categories = client.collections.use("JeopardyCategory");

    Map<String, Object> questionData = Map.of(
        "question", "This city is known for the Golden Gate Bridge",
        "answer", "San Francisco");
    var questionResult = questions.data.insert(questionData);
    var questionObjId = questionResult.metadata().uuid();

    Map<String, Object> categoryData = Map.of("title", "U.S. CITIES");
    var categoryResult = categories.data.insert(categoryData);
    var categoryObjId = categoryResult.metadata().uuid();

    // START TwoWayCrossReferences
    // For the "San Francisco" JeopardyQuestion object, add a cross-reference to the
    // "U.S. CITIES" JeopardyCategory object
    // highlight-start
    questions.data.referenceAdd(
        questionObjId,
        "hasCategory",
        Reference.uuids(categoryObjId));
    // highlight-end

    // For the "U.S. CITIES" JeopardyCategory object, add a cross-reference to "San
    // Francisco"
    // highlight-start
    categories.data.referenceAdd(
        categoryObjId,
        "hasQuestion",
        Reference.uuids(questionObjId));
    // highlight-end
    // END TwoWayCrossReferences

    // Test results
    var result = categories.query.byId(
        categoryObjId,
        opt -> opt.returnReferences(
            QueryReference.single("hasQuestion",
                ref -> ref.returnMetadata(Metadata.UUID))));

    assertThat(result).isPresent();
    assertThat(result.get().references()).containsKey("hasQuestion");
  }

  @Test
  void testMultiple() throws IOException {
    // Setup collections
    setupCollections();
    var questions = client.collections.use("JeopardyQuestion");
    var categories = client.collections.use("JeopardyCategory");

    // Insert test data
    Map<String, Object> questionData = Map.of(
        "question", "This city is known for the Golden Gate Bridge",
        "answer", "San Francisco");
    var questionResult = questions.data.insert(questionData);
    var questionObjId = questionResult.metadata().uuid();

    Map<String, Object> categoryData1 = Map.of("title", "U.S. CITIES");
    var categoryResult1 = categories.data.insert(categoryData1);
    var categoryObjId = categoryResult1.metadata().uuid();

    Map<String, Object> categoryData2 = Map.of("title", "MUSEUMS");
    var categoryResult2 = categories.data.insert(categoryData2);
    var categoryObjIdAlt = categoryResult2.metadata().uuid();

    // START MultipleCrossReferences
    // highlight-start
    // Add multiple references - need to add them individually
    for (String tempUuid : List.of(categoryObjId, categoryObjIdAlt)) {
      questions.data.referenceAdd(
          questionObjId,
          "hasCategory",
          Reference.uuids(tempUuid));
    }
    // highlight-end
    // END MultipleCrossReferences

    // Test results
    var result = questions.query.byId(
        questionObjId,
        opt -> opt.returnReferences(
            QueryReference.single("hasCategory",
                ref -> ref.returnMetadata(Metadata.UUID))));

    assertThat(result).isPresent();
    assertThat(result.get().references()).containsKey("hasCategory");

    @SuppressWarnings("unchecked")
    List<Object> refs = result.get().references().get("hasCategory");
    assertThat(refs).hasSize(2);
  }

  @Test
  void testReadCrossRef() throws IOException {
    // Setup collections with data
    setupCollections();
    var questions = client.collections.use("JeopardyQuestion");
    var categories = client.collections.use("JeopardyCategory");

    // Insert category and question with reference
    Map<String, Object> categoryData = Map.of("title", "SCIENCE");
    var categoryResult = categories.data.insert(categoryData);
    Map<String, Object> questionData = Map.of("question", "What is H2O?", "answer", "Water");
    var questionResult = questions.data.insert(
        questionData,
        opt -> opt.reference("hasCategory", Reference.objects(categoryResult)));
    var questionObjId = questionResult.metadata().uuid();

    // START ReadCrossRef
    // Include the cross-references in a query response
    // highlight-start
    var response = questions.query.fetchObjects( // Or `hybrid`, `nearText`, etc.
        opt -> opt
            .limit(2)
            .returnReferences(
                QueryReference.single("hasCategory",
                    ref -> ref.returnProperties("title"))));
    // highlight-end

    // Or include cross-references in a single-object retrieval
    // highlight-start
    var obj = questions.query.byId(
        questionObjId,
        opt -> opt.returnReferences(
            QueryReference.single("hasCategory",
                ref -> ref.returnProperties("title"))));
    // highlight-end
    // END ReadCrossRef

    // Test results
    assertThat(response.objects()).isNotEmpty();
    assertThat(obj).isPresent();
    assertThat(obj.get().references()).containsKey("hasCategory");
  }

  @Test
  void testDelete() throws IOException {
    // Setup collections
    setupCollections();
    var questions = client.collections.use("JeopardyQuestion");
    var categories = client.collections.use("JeopardyCategory");

    // Insert test data with reference
    Map<String, Object> categoryData = Map.of("title", "MUSEUMS");
    var categoryResult = categories.data.insert(categoryData);
    var categoryObjId = categoryResult.metadata().uuid();

    Map<String, Object> questionData = Map.of(
        "question", "This city is known for the Golden Gate Bridge",
        "answer", "San Francisco");
    var questionResult = questions.data.insert(
        questionData,
        opt -> opt.reference("hasCategory", Reference.uuids(categoryObjId)));
    var questionObjId = questionResult.metadata().uuid();

    // START DeleteCrossReference
    // From the "San Francisco" JeopardyQuestion object, delete the "MUSEUMS"
    // category cross-reference
    // highlight-start
    questions.data.referenceDelete(
        // highlight-end
        questionObjId,
        "hasCategory",
        Reference.uuids(categoryObjId));
    // END DeleteCrossReference

    // Test results
    var result = questions.query.byId(
        questionObjId,
        opt -> opt.returnReferences(
            QueryReference.single("hasCategory")));

    assertThat(result).isPresent();
    @SuppressWarnings("unchecked")
    List<Object> refs = result.get().references().get("hasCategory");
    assertThat(refs).isEmpty();
  }

  @Test
  void testUpdate() throws IOException {
    // Setup collections
    setupCollections();
    var questions = client.collections.use("JeopardyQuestion");
    var categories = client.collections.use("JeopardyCategory");

    // Insert test data
    Map<String, Object> categoryData1 = Map.of("title", "MUSEUMS");
    var categoryResult1 = categories.data.insert(categoryData1);
    var categoryObjId = categoryResult1.metadata().uuid();

    Map<String, Object> categoryData2 = Map.of("title", "U.S. CITIES");
    categories.data.insert(categoryData2); // Secondary category for testing replacement

    Map<String, Object> questionData = Map.of(
        "question", "This city is known for the Golden Gate Bridge",
        "answer", "San Francisco");
    var questionResult = questions.data.insert(questionData);
    var questionObjId = questionResult.metadata().uuid();

    // START UpdateCrossReference
    // In the "San Francisco" JeopardyQuestion object, set the "hasCategory"
    // cross-reference only to "MUSEUMS"
    // highlight-start
    questions.data.referenceReplace(
        // highlight-end
        questionObjId,
        "hasCategory",
        Reference.uuids(categoryObjId));
    // END UpdateCrossReference

    // Test results
    var result = questions.query.byId(
        questionObjId,
        opt -> opt.returnReferences(
            QueryReference.single("hasCategory",
                ref -> ref.returnMetadata(Metadata.UUID))));

    assertThat(result).isPresent();
    List<Object> refs = result.get().references().get("hasCategory");
    assertThat(refs).hasSize(1);
    System.out.println("Reference UUID: " + refs.get(0));
    // var refObj = (ObjectMetadata) refs.get(0);
    // assertThat(refObj.uuid()).isEqualTo(categoryObjId);
  }

  // Helper method to set up collections
  private void setupCollections() throws IOException {
    client.collections.create("JeopardyCategory", col -> col
        .description("A Jeopardy! category")
        .properties(
            Property.text("title")));

    client.collections.create("JeopardyQuestion", col -> col
        .description("A Jeopardy! question")
        .properties(
            Property.text("question"),
            Property.text("answer"))
        .references(
            Property.reference("hasCategory", "JeopardyCategory")));
  }
}