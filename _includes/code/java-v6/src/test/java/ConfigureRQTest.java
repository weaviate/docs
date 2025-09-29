import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.Quantization;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

class ConfigureRQTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    // START ConnectCode
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    client = WeaviateClient.connectToLocal(
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    // END ConnectCode
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @Test
  void testEnableRQ() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }

    // START EnableRQ
    client.collections.create(
        "MyCollection",
        col -> col
            .vectorConfig(VectorConfig.text2vecContextionary(
                vc -> vc
                    // highlight-start
                    .quantization(Quantization.rq())
            // highlight-end
            ))
            .properties(Property.text("title")));
    // END EnableRQ
  }

  @Test
  void test1BitEnableRQ() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }

    // START 1BitEnableRQ
    client.collections.create(
        "MyCollection",
        col -> col
            .vectorConfig(VectorConfig.text2vecContextionary(
                vc -> vc
                    // highlight-start
                    .quantization(Quantization.rq(q -> q.bits(1)))
            // highlight-end
            ))
            .properties(Property.text("title")));
    // END 1BitEnableRQ
  }

  @Test
  void testUncompressed() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }

    // START Uncompressed
    client.collections.create(
        "MyCollection",
        col -> col
            .vectorConfig(VectorConfig.text2vecContextionary(
                vc -> vc
                    // highlight-start
                    .quantization(Quantization.uncompressed())
            // highlight-end
            ))
            .properties(Property.text("title")));
    // END Uncompressed
  }

  @Test
  void testRQWithOptions() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }

    // START RQWithOptions
    client.collections.create(
        "MyCollection",
        col -> col
            .vectorConfig(VectorConfig.text2vecContextionary(
                vc -> vc
                    // highlight-start
                    .quantization(Quantization.rq(q -> q
                        .bits(8) // Optional: Number of bits
                        .rescoreLimit(20) // Optional: Number of candidates to fetch before rescoring
                    ))
            // highlight-end
            ))
            .properties(Property.text("title")));
    // END RQWithOptions
  }

  // TODO[g-despot] Errors on collection update: TYPE_UPDATE_CLASS: bad request
  // :parse class update: invalid update for vector "default":
  // skipDefaultQuantization is immutable: attempted change from "true" to "false"
  @Test
  void testUpdateSchema() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }
    client.collections.create(collectionName, col -> col
        .vectorConfig(VectorConfig.text2vecContextionary(
            vc -> vc.quantization(Quantization.uncompressed())))
        .properties(Property.text("title")));

    // START UpdateSchema
    CollectionHandle<Map<String, Object>> collection = client.collections.use("MyCollection");
    collection.config.update(collectionName,
        c -> c.vectorConfig(VectorConfig.text2vecContextionary(vc -> vc.quantization(Quantization.rq()))));
    // END UpdateSchema
    // TODO[g-despot]: Verify the update
  }

  @Test
  void test1BitUpdateSchema() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }
    client.collections.create(collectionName, col -> col
        .vectorConfig(VectorConfig.text2vecContextionary(
            vc -> vc.quantization(Quantization.uncompressed())))
        .properties(Property.text("title")));

    // START 1BitUpdateSchema
    CollectionHandle<Map<String, Object>> collection = client.collections.use("MyCollection");
    collection.config.update(collectionName,
        c -> c
            .vectorConfig(VectorConfig.text2vecContextionary(vc -> vc.quantization(Quantization.rq(q -> q.bits(1))))));
    // END 1BitUpdateSchema
  }
}