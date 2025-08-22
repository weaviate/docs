import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.MultiTenancy;
import io.weaviate.client6.v1.api.collections.WeaviateCollectionsClient;
import io.weaviate.client6.v1.internal.grpc.protocol.WeaviateProtoTenants.Tenant;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class MultiTenancyTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    assertThat(openaiApiKey).isNotBlank()
        .withFailMessage("Please set the OPENAI_API_KEY environment variable.");

    client = WeaviateClient.local(config -> config
        .setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
  }

  @AfterEach
  public void afterEach() throws IOException {
    client.collections.deleteAll();
  }

  @Test
  void testEnableMultiTenancy() throws IOException {
    // START EnableMultiTenancy
    // TODO[g-despot]: It's not possible to enable MT without specifying additional
    // config
    client.collections.create("MultiTenancyCollection", col -> col
        .multiTenancy(mt -> mt.createAutomatically(true)));
    // END EnableMultiTenancy

    var config = client.collections.getConfig("MultiTenancyCollection").get();
    assertThat(config.multiTenancy().createAutomatically()).isTrue();
  }

  @Test
  void testEnableAutoMT() throws IOException {
    // START EnableAutoMT
    client.collections.create("CollectionWithAutoMTEnabled", col -> col
        .multiTenancy(mt -> mt
            .createAutomatically(true)));
    // END EnableAutoMT

    var config = client.collections.getConfig("CollectionWithAutoMTEnabled").get();
    assertThat(config.multiTenancy().createAutomatically()).isTrue();
  }

  @Test
  void testUpdateAutoMT() throws IOException {
    String collectionName = "MTCollectionNoAutoMT";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt
            .createAutomatically(false)));

    // START UpdateAutoMT
    // TODO[g-despot]: Should be possible to update MT createAutomatically
    // CollectionHandle collection = client.collections.use(collectionName);
    // collection.config.update(collectionName, col -> col
    // .multiTenancy(mt -> mt.createAutomatically(true)));
    // END UpdateAutoMT

    // var config = client.collections.getConfig(collectionName).get();
    // assertThat(config.multiTenancy().createAutomatically()).isTrue();
  }

  @Test
  void testAddTenantsToClass() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.createAutomatically(true)));

    CollectionHandle collection = client.collections.use(collectionName);

    // START AddTenantsToClass
    // TODO[g-despot]: Uncomment when tenant support added
    // collection.tenants.create(
    // Tenant.of("tenantA"),
    // Tenant.of("tenantB")
    // );
    // END AddTenantsToClass

    // List<Tenant> tenants = collection.tenants.get();
    // assertThat(tenants).hasSize(2)
    // .extracting(Tenant::getName)
    // .contains("tenantA", "tenantB");
  }

  @Test
  void testListTenants() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.createAutomatically(true)));

    CollectionHandle collection = client.collections.use(collectionName);
    // TODO[g-despot]: Uncomment when tenant support added
    // collection.tenants.create(
    // Tenant.of("tenantA"),
    // Tenant.of("tenantB")
    // );

    // START ListTenants
    // List<Tenant> tenants = collection.tenants.get();
    // System.out.println(tenants);
    // END ListTenants

    // assertThat(tenants).hasSize(2);
  }

  @Test
  void testGetTenantsByName() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.createAutomatically(true)));

    CollectionHandle collection = client.collections.use(collectionName);
    // TODO[g-despot]: Uncomment when tenant support added
    // collection.tenants.create(
    // Tenant.of("tenantA"),
    // Tenant.of("tenantB")
    // );

    // // START GetTenantsByName
    // List<String> tenantNames = Arrays.asList("tenantA", "tenantB",
    // "nonExistentTenant");
    // List<Tenant> tenants = collection.tenants.get(tenantNames);
    // System.out.println(tenants);
    // // END GetTenantsByName

    // assertThat(tenants).hasSize(2);
  }

  @Test
  void testRemoveTenants() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.createAutomatically(true)));

    CollectionHandle collection = client.collections.use(collectionName);
    // TODO[g-despot]: Uncomment when tenant support added
    // collection.tenants.create(
    // Tenant.of("tenantA"),
    // Tenant.of("tenantB")
    // );

    // // START RemoveTenants
    // collection.tenants.delete(Arrays.asList("tenantB", "tenantX"));
    // // END RemoveTenants

    // List<Tenant> tenants = collection.tenants.get();
    // assertThat(tenants).hasSize(1)
    // .extracting(Tenant::getName)
    // .contains("tenantA");
  }
}
