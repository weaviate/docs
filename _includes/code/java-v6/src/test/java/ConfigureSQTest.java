import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.Quantization;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.vectorindex.Hnsw;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

class ConfigureSQTest {

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
  void testEnableSQ() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }

    // START EnableSQ
    client.collections.create("MyCollection",
        col -> col.vectorConfig(VectorConfig.text2vecTransformers(vc -> vc
            // highlight-start
            .quantization(Quantization.sq())
        // highlight-end
        )).properties(Property.text("title")));
    // END EnableSQ
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
    client.collections.create(collectionName,
        col -> col
            .vectorConfig(VectorConfig.text2vecTransformers(
                vc -> vc.quantization(Quantization.uncompressed())))
            .properties(Property.text("title")));

    // START UpdateSchema
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use("MyCollection");
    collection.config.update(c -> c.vectorConfig(VectorConfig
        .text2vecTransformers(vc -> vc.quantization(Quantization.sq()))));
    // END UpdateSchema
    // TODO[g-despot]: Verify the update
  }

  @Test
  void testSQWithOptions() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }

    // START SQWithOptions
    client.collections.create("MyCollection",
        col -> col.vectorConfig(VectorConfig.text2vecTransformers(vc -> vc
            // highlight-start
            .quantization(Quantization
                .sq(q -> q.cache(true).trainingLimit(50000).rescoreLimit(200)))
            .vectorIndex(Hnsw.of(c -> c.vectorCacheMaxObjects(100000)))
        // highlight-end
        )).properties(Property.text("title")));
    // END SQWithOptions
  }
}
