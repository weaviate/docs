import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.Vectors;
import io.weaviate.client6.v1.api.collections.WeaviateObject;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SearchProfileTest {

  private static WeaviateClient client;
  private static final String COLLECTION = "Article";

  @BeforeAll
  public static void beforeAll() throws IOException, InterruptedException {
    client = WeaviateClient.connectToLocal();
    client.collections.delete(COLLECTION);

    client.collections.create(COLLECTION, c -> c
        .properties(Property.text("title"))
        .vectorConfig(VectorConfig.selfProvided()));

    CollectionHandle<Map<String, Object>> articles =
        client.collections.use(COLLECTION);

    // Insert a few objects with self-provided vectors so vector search works.
    String[] titles = {"machine learning", "deep neural networks",
        "natural language processing", "computer vision",
        "reinforcement learning"};
    List<WeaviateObject<Map<String, Object>>> objs = new ArrayList<>();
    for (int i = 0; i < titles.length; i++) {
      float[] v = new float[]{0.1f * (i + 1), 0.2f * (i + 1), 0.3f * (i + 1)};
      Map<String, Object> props = Map.of("title", titles[i]);
      objs.add(WeaviateObject.of(b -> b
          .uuid(UUID.randomUUID().toString())
          .properties(props)
          .vectors(Vectors.of(v))));
    }
    articles.data.insertMany(objs);

    // ASYNC_INDEXING is enabled on the test instance; the HNSW graph isn't
    // queryable immediately after insert, so the first near_vector call would
    // return zero results and the server would skip populating queryProfile.
    Thread.sleep(3000);
  }

  @AfterAll
  public static void afterAll() throws Exception {
    if (client != null) {
      client.collections.delete(COLLECTION);
      client.close();
    }
  }

  @Test
  void testProfileNearVector() {
    // START ProfileNearVector
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use(COLLECTION);

    var response = collection.query.nearVector(
        new float[]{0.1f, 0.2f, 0.3f},
        q -> q.limit(5).returnMetadata(Metadata.QUERY_PROFILE, Metadata.DISTANCE));

    if (response.queryProfile() != null) {
      for (var shard : response.queryProfile().shards()) {
        // Per-shard execution timing breakdown for vector searches.
        for (var entry : shard.searches().entrySet()) {
          System.out.println("  [" + entry.getKey() + "]");
          for (var detail : entry.getValue().entrySet()) {
            System.out.println("    " + detail.getKey() + ": " + detail.getValue());
          }
        }
      }
    }
    // END ProfileNearVector

    assertThat(response.queryProfile()).isNotNull();
    assertThat(response.queryProfile().shards()).isNotEmpty();
  }

  @Test
  void testProfileBM25() {
    // START ProfileBM25
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use(COLLECTION);

    var response = collection.query.bm25(
        "machine learning",
        q -> q.returnMetadata(Metadata.QUERY_PROFILE, Metadata.SCORE));

    if (response.queryProfile() != null) {
      for (var shard : response.queryProfile().shards()) {
        for (var entry : shard.searches().entrySet()) {
          System.out.println("  [" + entry.getKey() + "]");
          for (var detail : entry.getValue().entrySet()) {
            System.out.println("    " + detail.getKey() + ": " + detail.getValue());
          }
        }
      }
    }
    // END ProfileBM25

    assertThat(response.queryProfile()).isNotNull();
  }

  @Test
  void testProfileHybrid() {
    // START ProfileHybrid
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use(COLLECTION);

    var response = collection.query.hybrid(
        "machine learning",
        q -> q.limit(5).returnMetadata(Metadata.QUERY_PROFILE));

    if (response.queryProfile() != null) {
      for (var shard : response.queryProfile().shards()) {
        for (var entry : shard.searches().entrySet()) {
          System.out.println("  [" + entry.getKey() + "]");
          for (var detail : entry.getValue().entrySet()) {
            System.out.println("    " + detail.getKey() + ": " + detail.getValue());
          }
        }
      }
    }
    // END ProfileHybrid

    assertThat(response.queryProfile()).isNotNull();
  }
}
