import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.WeaviateObject;
import io.weaviate.client6.v1.api.collections.tenants.Tenant;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;
import java.util.Map;

class ManageObjectsReadAllTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    // Instantiate the client
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    client = WeaviateClient.connectToLocal(
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));

    // Simulate weaviate-datasets by creating and populating collections
    // Create WineReview collection
    if (client.collections.exists("WineReview")) {
      client.collections.delete("WineReview");
    }

    var wineReview = client.collections.create("WineReview");
    wineReview.data.insertMany(Map.of("title", "Review A"),
        Map.of("title", "Review B"));

    // Create WineReviewMT collection
    if (client.collections.exists("WineReviewMT")) {
      client.collections.delete("WineReviewMT");
    }
    client.collections.create("WineReviewMT",
        col -> col.multiTenancy(c -> c.autoTenantCreation(true)));
    var wineReviewMT = client.collections.use("WineReviewMT");

    // Create and populate tenants
    List<Tenant> tenants =
        List.of(Tenant.active("tenantA"), Tenant.active("tenantB"));
    wineReviewMT.tenants.create(tenants);
    wineReviewMT.withTenant("tenantA").data
        .insert(Map.of("title", "Tenant A Review 1"));
    wineReviewMT.withTenant("tenantB").data
        .insert(Map.of("title", "Tenant B Review 1"));
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.collections.delete("WineReview");
    client.collections.delete("WineReviewMT");
    client.close();
  }

  @Test
  void testReadAllProps() {
    // START ReadAllProps
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use("WineReview");

    // highlight-start
    for (WeaviateObject<Map<String, Object>> item : collection.paginate()) {
      // highlight-end
      System.out.printf("%s %s\n", item.uuid(), item.properties());
    }
    // END ReadAllProps
  }

  @Test
  void testReadAllVectors() {
    // START ReadAllVectors
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use("WineReview");

    for (WeaviateObject<Map<String, Object>> item : collection.paginate(
        // highlight-start
        i -> i.returnMetadata() // If using named vectors, you can specify ones to include
    // highlight-end
    )) {
      System.out.println(item.properties());
      // highlight-start
      System.out.println(item.vectors());
      // highlight-end
    }
    // END ReadAllVectors
  }

  @Test
  void testReadAllTenants() {
    // START ReadAllTenants
    CollectionHandle<Map<String, Object>> multiCollection =
        client.collections.use("WineReviewMT");

    // Get a list of tenants
    // highlight-start
    var tenants = multiCollection.tenants.get();
    // highlight-end

    // Iterate through tenants
    for (Tenant tenant : tenants) {
      // Iterate through objects within each tenant
      // highlight-start
      for (WeaviateObject<Map<String, Object>> item : multiCollection
          .withTenant(tenant.name())
          .paginate()) {
        // highlight-end
        System.out.printf("%s: %s\n", tenant.name(), item.properties());
      }
    }
    // END ReadAllTenants
  }
}
