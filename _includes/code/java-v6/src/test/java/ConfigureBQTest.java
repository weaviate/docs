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

class ConfigureBQTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    // START ConnectCode
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    client = WeaviateClient
        .connectToLocal(config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    // END ConnectCode
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @Test
  void testEnableBQ() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }

    // START EnableBQ
    client.collections.create("MyCollection",
        col -> col.vectorConfig(VectorConfig.text2vecContextionary(vc -> vc
            // highlight-start
            .quantization(Quantization.bq())
        // highlight-end
        )).properties(Property.text("title")));
    // END EnableBQ
  }

  // TODO[g-despot] Errors on collection update: TYPE_UPDATE_CLASS: bad request :parse class update: invalid update for vector "default": skipDefaultQuantization is immutable: attempted change from "true" to "false"
  @Test
  void testUpdateSchema() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }
    client.collections.create(collectionName,
        col -> col
            .vectorConfig(VectorConfig
                .text2vecContextionary(vc -> vc.quantization(Quantization.uncompressed())))
            .properties(Property.text("title")));

    // START UpdateSchema
    CollectionHandle<Map<String, Object>> collection = client.collections.use("MyCollection");
    collection.config.update(collectionName, c -> c.vectorConfig(
        VectorConfig.text2vecContextionary(vc -> vc.quantization(Quantization.bq()))));
    // END UpdateSchema
    // TODO[g-despot]: Verify the update
  }

  @Test
  void testBQWithOptions() throws IOException {
    String collectionName = "MyCollection";
    if (client.collections.exists(collectionName)) {
      client.collections.delete(collectionName);
    }

    // START BQWithOptions
    client.collections.create("MyCollection",
        col -> col.vectorConfig(VectorConfig.text2vecContextionary(vc -> vc
            // highlight-start
            .quantization(Quantization.bq(q -> q.cache(true).rescoreLimit(200)))
            .vectorIndex(Hnsw.of(c -> c.vectorCacheMaxObjects(100000)))
        // highlight-end
        )).properties(Property.text("title")));
    // END BQWithOptions
  }
}
