import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.ObjectMetadata;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.ReferenceProperty;
import io.weaviate.client6.v1.api.collections.WeaviateObject;
import io.weaviate.client6.v1.api.collections.Vectorizers;
import io.weaviate.client6.v1.api.collections.Vectors;
import io.weaviate.client6.v1.api.collections.data.BatchReference;
import io.weaviate.client6.v1.api.collections.data.Reference;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import io.weaviate.client6.v1.api.collections.query.QueryReference;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class BatchImportTest {

  private static WeaviateClient client;

  // A helper method to generate a deterministic UUID from a seed
  private static UUID generateUuid5(String seed) {
    return UUID.nameUUIDFromBytes(seed.getBytes(StandardCharsets.UTF_8));
  }

  @BeforeAll
  public static void beforeAll() throws IOException {
    // START INSTANTIATION-COMMON
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    assertThat(openaiApiKey).isNotBlank()
        .withFailMessage("Please set the OPENAI_API_KEY environment variable.");

    client = WeaviateClient.local(config -> config
        .setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    // END INSTANTIATION-COMMON

    // Download data file for streaming tests
    try (InputStream in = new URL(
        "https://raw.githubusercontent.com/weaviate-tutorials/edu-datasets/main/jeopardy_1k.json").openStream()) {
      Files.copy(in, Paths.get("jeopardy_1k.json"));
    }
  }

  @AfterAll
  public static void afterAll() throws IOException {
    client.collections.deleteAll();
    Files.deleteIfExists(Paths.get("jeopardy_1k.json"));
  }

  @Test
  void testBasicBatchImport() throws IOException {
    // Define and create the class
    client.collections.create("MyCollection", col -> col.vectors(Vectorizers.none()));

    // START BasicBatchImportExample
    List<Map<String, Object>> dataRows = new ArrayList<>();
    for (int i = 0; i < 5; i++) {
      dataRows.add(Map.of("title", "Object " + (i + 1)));
    }

    var collection = client.collections.use("MyCollection");

    // The Java client uses insertMany for batching.
    // There is no direct equivalent of the Python client's stateful batch manager.
    // You collect objects and send them in a single request.
    // highlight-start
    var response = collection.data.insertMany(dataRows.toArray(new Map[0]));
    // highlight-end

    assertThat(response.errors()).isEmpty();
    // END BasicBatchImportExample

    var result = collection.aggregate.overAll(agg -> agg.includeTotalCount(true));
    assertThat(result.totalCount()).isEqualTo(5);

    client.collections.delete("MyCollection");
  }

  @Test
  void testBatchImportWithID() throws IOException {
    client.collections.create("MyCollection", col -> col.vectors(Vectorizers.none()));

    // START BatchImportWithIDExample
    // highlight-start
    // In Java, you can generate a deterministic UUID from a string or bytes.
    // highlight-end

    List<WeaviateObject<Map<String, Object>, Reference, ObjectMetadata>> dataObjects = new ArrayList<>();
    for (int i = 0; i < 5; i++) {
      Map<String, Object> dataRow = Map.of("title", "Object " + (i + 1));
      // TODO[g-despot]: Somewhere it's string somewhere it's UUID
      UUID objUuid = generateUuid5(dataRow.toString());
      dataObjects.add(WeaviateObject.of(obj -> obj
          .properties(dataRow)
          .metadata(ObjectMetadata.of(meta -> meta.uuid(objUuid)))));
    }

    var collection = client.collections.use("MyCollection");

    // highlight-start
    var response = collection.data.insertMany(dataObjects);
    // highlight-end

    assertThat(response.errors()).isEmpty();
    // END BatchImportWithIDExample

    var result = collection.aggregate.overAll(agg -> agg.includeTotalCount(true));
    assertThat(result.totalCount()).isEqualTo(5);
    String lastUuid = dataObjects.get(4).metadata().uuid();
    assertThat(collection.data.exists(lastUuid)).isTrue();

    client.collections.delete("MyCollection");
  }

  @Test
  void testBatchImportWithVector() throws IOException {
    client.collections.create("MyCollection", col -> col.vectors(Vectorizers.none()));

    // START BatchImportWithVectorExample
    List<WeaviateObject<Map<String, Object>, Reference, ObjectMetadata>> dataObjects = new ArrayList<>();
    float[] vector = new float[10]; // Using a small vector for demonstration
    Arrays.fill(vector, 0.1f);

    for (int i = 0; i < 5; i++) {
      Map<String, Object> dataRow = Map.of("title", "Object " + (i + 1));
      UUID objUuid = generateUuid5(dataRow.toString());
      dataObjects.add(WeaviateObject.of(obj -> obj
          .properties(dataRow)
          .metadata(ObjectMetadata.of(meta -> meta.uuid(objUuid).vectors(Vectors.of(vector))))));
    }

    var collection = client.collections.use("MyCollection");

    // highlight-start
    var response = collection.data.insertMany(dataObjects);
    // highlight-end

    assertThat(response.errors()).isEmpty();
    // END BatchImportWithVectorExample

    var result = collection.aggregate.overAll(agg -> agg.includeTotalCount(true));
    assertThat(result.totalCount()).isEqualTo(5);

    client.collections.delete("MyCollection");
  }

  @Test
  void testBatchImportWithCrossReference() throws IOException {
    client.collections.create("Publication", col -> col.properties(Property.text("title")));
    client.collections.create("Author", col -> col
        .properties(Property.text("name"))
        .references(new ReferenceProperty("writesFor", List.of("Publication"))));

    var authors = client.collections.use("Author");
    var publications = client.collections.use("Publication");

    var from = authors.data.insert(Map.of("name", "Jane Austen"));
    var fromUuid = from.metadata().uuid();
    var targetUuid = publications.data.insert(Map.of("title", "Ye Olde Times")).metadata().uuid();

    // START BatchImportWithRefExample
    var collection = client.collections.use("Author");

    var response = collection.data.referenceAddMany(
        BatchReference.uuids(from, "writesFor", targetUuid));

    assertThat(response.errors()).isEmpty();
    // END BatchImportWithRefExample

    var result = collection.query.byId(fromUuid, q -> q
        .returnReferences(QueryReference.single("writesFor",
            airport -> airport.returnMetadata(Metadata.UUID))));

    assertThat(result).isPresent();
    assertThat(result.get().references().get("writesFor")).isNotNull();
  }

  @Test
  void testJsonStreaming() throws IOException {
    client.collections.create("JeopardyQuestion");

    // START JSON streaming
    int batchSize = 100;
    List<Map<String, Object>> batch = new ArrayList<>(batchSize);
    var collection = client.collections.use("JeopardyQuestion");
    Gson gson = new Gson();

    System.out.println("JSON streaming, to avoid running out of memory on large files...");
    try (JsonReader reader = new JsonReader(new FileReader("jeopardy_1k.json"))) {
      reader.beginArray();
      while (reader.hasNext()) {
        Map<String, String> obj = gson.fromJson(reader, Map.class);
        Map<String, Object> properties = new HashMap<>();
        properties.put("question", obj.get("Question"));
        properties.put("answer", obj.get("Answer"));
        batch.add(properties);

        if (batch.size() == batchSize) {
          collection.data.insertMany(batch.toArray(new Map[0]));
          System.out.println("Imported " + batch.size() + " articles...");
          batch.clear();
        }
      }
      reader.endArray();
    }

    if (!batch.isEmpty()) {
      collection.data.insertMany(batch.toArray(new Map[0]));
      System.out.println("Imported remaining " + batch.size() + " articles...");
    }

    System.out.println("Finished importing articles.");
    // END JSON streaming

    var result = collection.aggregate.overAll(agg -> agg.includeTotalCount(true));
    assertThat(result.totalCount()).isEqualTo(1000);

    client.collections.delete("JeopardyQuestion");
  }

  @Test
  void testCsvStreaming() throws IOException {
    // Create a CSV file from the JSON for the test
    try (JsonReader reader = new JsonReader(new FileReader("jeopardy_1k.json"));
        java.io.FileWriter writer = new java.io.FileWriter("jeopardy_1k.csv")) {
      Gson gson = new Gson();
      reader.beginArray();
      writer.write("Question,Answer\n");
      while (reader.hasNext()) {
        Map<String, String> obj = gson.fromJson(reader, Map.class);
        writer.write("\"" + obj.get("Question") + "\",\"" + obj.get("Answer") + "\"\n");
      }
      reader.endArray();
    }

    client.collections.create("JeopardyQuestion");

    // START CSV streaming
    int batchSize = 100;
    List<Map<String, Object>> batch = new ArrayList<>(batchSize);
    var collection = client.collections.use("JeopardyQuestion");

    System.out.println("CSV streaming to not load all records in RAM at once...");
    try (BufferedReader csvReader = new BufferedReader(new FileReader("jeopardy_1k.csv"))) {
      String line = csvReader.readLine(); // skip header
      while ((line = csvReader.readLine()) != null) {
        String[] data = line.split("\",\"");
        Map<String, Object> properties = new HashMap<>();
        properties.put("question", data[0].substring(1));
        properties.put("answer", data[1].substring(0, data[1].length() - 1));
        batch.add(properties);

        if (batch.size() == batchSize) {
          collection.data.insertMany(batch.toArray(new Map[0]));
          System.out.println("Imported " + batch.size() + " articles...");
          batch.clear();
        }
      }
    }

    if (!batch.isEmpty()) {
      collection.data.insertMany(batch.toArray(new Map[0]));
      System.out.println("Imported remaining " + batch.size() + " articles...");
    }

    System.out.println("Finished importing articles.");
    // END CSV streaming

    var result = collection.aggregate.overAll(agg -> agg.includeTotalCount(true));
    assertThat(result.totalCount()).isEqualTo(1000);

    Files.deleteIfExists(Paths.get("jeopardy_1k.csv"));
  }
}
