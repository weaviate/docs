import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.ObjectTtl;
import io.weaviate.client6.v1.api.collections.Property;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

// Requires OBJECTS_TTL_DELETE_SCHEDULE set to a frequent interval (e.g. "*/10 * * * * *")
// and OBJECTS_TTL_ALLOW_SECONDS=true on the Weaviate instance.

class ManageDataTTLTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    client = WeaviateClient.connectToLocal();
  }

  @AfterEach
  public void afterEach() throws IOException {
    client.collections.delete("CollectionWithTTL");
  }

  private long waitForCount(CollectionHandle collection, long expectedCount, long timeoutMs) throws IOException, InterruptedException {
    long start = System.currentTimeMillis();
    while (System.currentTimeMillis() - start < timeoutMs) {
      var result = collection.aggregate.overAll(a -> a.includeTotalCount(true));
      if (result.totalCount() == expectedCount) return result.totalCount();
      Thread.sleep(5000);
    }
    return collection.aggregate.overAll(a -> a.includeTotalCount(true)).totalCount();
  }

  @Test
  public void testTTLByCreationTime() throws IOException, InterruptedException {
    client.collections.delete("CollectionWithTTL");

    // START TTLByCreationTime
    client.collections.create("CollectionWithTTL",
        c -> c.properties(Property.date("referenceDate"))
            .objectTtl(ttl -> ttl
                .deleteByCreationTime()
                .defaultTtlSeconds(3600)  // 1 hour
                .filterExpiredObjects(true)  // Optional: automatically filter out expired objects from queries
            ));
    // END TTLByCreationTime

    // Verify creation time TTL config
    var collection = client.collections.use("CollectionWithTTL");
    var config = collection.config.get().get();
    assertThat(config.objectTtl()).isNotNull();
    assertThat(config.objectTtl().enabled()).isTrue();
    assertThat(config.objectTtl().deleteOn()).isEqualTo("_creationTimeUnix");
    assertThat(config.objectTtl().defaultTtlSeconds()).isEqualTo(3600);
    assertThat(config.objectTtl().filterExpiredObjects()).isTrue();

    // Add an object and verify it exists
    collection.data.insert(Map.of("referenceDate", Instant.now().toString()));
    var result = collection.aggregate.overAll(a -> a.includeTotalCount(true));
    assertThat(result.totalCount()).isEqualTo(1);

    // Verify deletion: recreate with minimum TTL (60s), insert, and wait for expiry
    client.collections.delete("CollectionWithTTL");
    client.collections.create("CollectionWithTTL",
        c -> c.properties(Property.date("referenceDate"))
            .objectTtl(ttl -> ttl.deleteByCreationTime().defaultTtlSeconds(60)));
    collection = client.collections.use("CollectionWithTTL");
    collection.data.insert(Map.of("referenceDate", Instant.now().toString()));
    assertThat(collection.aggregate.overAll(a -> a.includeTotalCount(true)).totalCount()).isEqualTo(1);
    long count = waitForCount(collection, 0, 70000);
    assertThat(count).isEqualTo(0);
  }

  @Test
  public void testTTLByUpdateTime() throws IOException, InterruptedException {
    client.collections.delete("CollectionWithTTL");

    // START TTLByUpdateTime
    client.collections.create("CollectionWithTTL",
        c -> c.properties(Property.date("referenceDate"))
            .objectTtl(ttl -> ttl
                .deleteByUpdateTime()
                .defaultTtlSeconds(864000)  // 10 days
                .filterExpiredObjects(true)  // Optional: automatically filter out expired objects from queries
            ));
    // END TTLByUpdateTime

    // Verify update time TTL config
    var collection = client.collections.use("CollectionWithTTL");
    var config = collection.config.get().get();
    assertThat(config.objectTtl()).isNotNull();
    assertThat(config.objectTtl().enabled()).isTrue();
    assertThat(config.objectTtl().deleteOn()).isEqualTo("_lastUpdateTimeUnix");
    assertThat(config.objectTtl().defaultTtlSeconds()).isEqualTo(864000);
    assertThat(config.objectTtl().filterExpiredObjects()).isTrue();

    // Add an object and verify it exists
    collection.data.insert(Map.of("referenceDate", Instant.now().toString()));
    var result = collection.aggregate.overAll(a -> a.includeTotalCount(true));
    assertThat(result.totalCount()).isEqualTo(1);

    // Verify deletion: recreate with minimum TTL (60s), insert, and wait for expiry
    client.collections.delete("CollectionWithTTL");
    client.collections.create("CollectionWithTTL",
        c -> c.properties(Property.date("referenceDate"))
            .objectTtl(ttl -> ttl.deleteByUpdateTime().defaultTtlSeconds(60).filterExpiredObjects(true)));
    collection = client.collections.use("CollectionWithTTL");
    collection.data.insert(Map.of("referenceDate", Instant.now().toString()));
    assertThat(collection.aggregate.overAll(a -> a.includeTotalCount(true)).totalCount()).isEqualTo(1);
    long count = waitForCount(collection, 0, 70000);
    assertThat(count).isEqualTo(0);
  }

  @Test
  public void testTTLByDateProperty() throws IOException, InterruptedException {
    client.collections.delete("CollectionWithTTL");

    // START TTLByDateProperty
    client.collections.create("CollectionWithTTL",
        c -> c.properties(Property.date("referenceDate"))
            .objectTtl(ttl -> ttl
                .deleteByDateProperty("referenceDate")
                .defaultTtlSeconds(300)  // 5 minutes offset
            ));
    // END TTLByDateProperty

    // Verify date property TTL config
    var collection = client.collections.use("CollectionWithTTL");
    var config = collection.config.get().get();
    assertThat(config.objectTtl()).isNotNull();
    assertThat(config.objectTtl().enabled()).isTrue();
    assertThat(config.objectTtl().deleteOn()).isEqualTo("referenceDate");
    assertThat(config.objectTtl().defaultTtlSeconds()).isEqualTo(300);

    // Add an object with a future date and verify it exists
    String futureDate = Instant.now().plus(1, ChronoUnit.HOURS).toString();
    collection.data.insert(Map.of("referenceDate", futureDate));
    var result = collection.aggregate.overAll(a -> a.includeTotalCount(true));
    assertThat(result.totalCount()).isEqualTo(1);

    // Verify deletion: recreate with ttl_offset=0, insert object expiring in 60s, and wait
    client.collections.delete("CollectionWithTTL");
    client.collections.create("CollectionWithTTL",
        c -> c.properties(Property.date("expiresAt"))
            .objectTtl(ttl -> ttl
                .deleteByDateProperty("expiresAt")
                .defaultTtlSeconds(0)
                .filterExpiredObjects(true)));
    collection = client.collections.use("CollectionWithTTL");
    String expires = Instant.now().plus(60, ChronoUnit.SECONDS).toString();
    collection.data.insert(Map.of("expiresAt", expires));
    assertThat(collection.aggregate.overAll(a -> a.includeTotalCount(true)).totalCount()).isEqualTo(1);
    long count = waitForCount(collection, 0, 70000);
    assertThat(count).isEqualTo(0);
  }
}
