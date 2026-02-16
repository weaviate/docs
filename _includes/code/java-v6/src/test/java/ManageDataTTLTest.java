import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.ObjectTtl;
import io.weaviate.client6.v1.api.collections.Property;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

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

  @Test
  public void testTTLByCreationTime() throws IOException {
    client.collections.delete("CollectionWithTTL");

    // START TTLByCreationTime
    client.collections.create("CollectionWithTTL",
        c -> c.property(Property.ofDate("referenceDate"))
            .objectTtl(ttl -> ttl
                .deleteByCreationTime()
                .defaultTtlSeconds(3600)  // 1 hour
                .filterExpiredObjects(true)  // Optional: automatically filter out expired objects from queries
            ));
    // END TTLByCreationTime
  }

  @Test
  public void testTTLByUpdateTime() throws IOException {
    client.collections.delete("CollectionWithTTL");

    // START TTLByUpdateTime
    client.collections.create("CollectionWithTTL",
        c -> c.property(Property.ofDate("referenceDate"))
            .objectTtl(ttl -> ttl
                .deleteByUpdateTime()
                .defaultTtlSeconds(864000)  // 10 days
                .filterExpiredObjects(true)  // Optional: automatically filter out expired objects from queries
            ));
    // END TTLByUpdateTime
  }

  @Test
  public void testTTLByDateProperty() throws IOException {
    client.collections.delete("CollectionWithTTL");

    // START TTLByDateProperty
    client.collections.create("CollectionWithTTL",
        c -> c.property(Property.ofDate("referenceDate"))
            .objectTtl(ttl -> ttl
                .deleteByDateProperty("referenceDate")
                .defaultTtlSeconds(300)  // 5 minutes offset
            ));
    // END TTLByDateProperty
  }
}
