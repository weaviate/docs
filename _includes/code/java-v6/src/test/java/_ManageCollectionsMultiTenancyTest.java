import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.tenants.Tenant;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class _ManageCollectionsMultiTenancyTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    assertThat(openaiApiKey).isNotBlank()
        .withFailMessage("Please set the OPENAI_API_KEY environment variable.");

    client = WeaviateClient.connectToLocal(config -> config
        .setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
  }

  @AfterEach
  public void afterAll() throws Exception {
    client.close();
  }

  //TODO[g.-despot] A lot of strange errors: IllegalState Connection pool shut down
  @Test
  void testEnableMultiTenancy() throws IOException {
    // START EnableMultiTenancy
    client.collections.create("MultiTenancyCollection", col -> col
        .multiTenancy(mt -> mt.enabled(true)));
    // END EnableMultiTenancy

    var config = client.collections.getConfig("MultiTenancyCollection").get();
    assertThat(config.multiTenancy().createAutomatically()).isTrue();
  }

  @Test
  void testEnableAutoActivationMultiTenancy() throws IOException {
    // START EnableAutoActivation
    client.collections.create("MultiTenancyCollection", col -> col
        .multiTenancy(mt -> mt.autoTenantActivation(true)));
    // END EnableAutoActivation

    var config = client.collections.getConfig("MultiTenancyCollection").get();
    assertThat(config.multiTenancy().activateAutomatically()).isTrue();
  }

  @Test
  void testEnableAutoMT() throws IOException {
    // START EnableAutoMT
    client.collections.create("CollectionWithAutoMTEnabled", col -> col
        .multiTenancy(mt -> mt
            .autoTenantCreation(true)));
    // END EnableAutoMT

    var config = client.collections.getConfig("CollectionWithAutoMTEnabled").get();
    assertThat(config.multiTenancy().createAutomatically()).isTrue();
  }

  @Test
  void testUpdateAutoMT() throws IOException {
    String collectionName = "MTCollectionNoAutoMT";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt
            .autoTenantActivation(false)));

    // START UpdateAutoMT
    CollectionHandle<Map<String, Object>> collection = client.collections.use(collectionName);
    collection.config.update(collectionName, col -> col
        .multiTenancy(mt -> mt.autoTenantCreation(true)));
    // END UpdateAutoMT

    var config = client.collections.getConfig(collectionName).get();
    assertThat(config.multiTenancy().createAutomatically()).isTrue();
  }

  @Test
  void testAddTenantsToClass() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.autoTenantCreation(true)));

    CollectionHandle<Map<String, Object>> collection = client.collections.use(collectionName);

    // START AddTenantsToClass
    collection.tenants.create(
        Tenant.active("tenantA"),
        Tenant.active("tenantB"));
    // END AddTenantsToClass

    List<Tenant> tenants = collection.tenants.get();
    assertThat(tenants).hasSize(2);
    assertThat(tenants.get(0).name())
        .containsAnyOf("tenantA", "tenantB");
  }

  @Test
  void testListTenants() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.autoTenantCreation(true)));

    CollectionHandle<Map<String, Object>> collection = client.collections.use(collectionName);
    collection.tenants.create(
        Tenant.active("tenantA"),
        Tenant.active("tenantB"));

    // START ListTenants
    List<Tenant> tenants = collection.tenants.get();
    System.out.println(tenants);
    // END ListTenants

    assertThat(tenants).hasSize(2);
  }

  @Test
  void testGetTenantsByName() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.autoTenantCreation(true)));

    CollectionHandle<Map<String, Object>> collection = client.collections.use(collectionName);
    collection.tenants.create(
        Tenant.active("tenantA"),
        Tenant.active("tenantB"));

    // // START GetTenantsByName
    List<String> tenantNames = Arrays.asList("tenantA", "tenantB",
        "nonExistentTenant");
    List<Tenant> tenants = collection.tenants.get(tenantNames);
    System.out.println(tenants);
    // // END GetTenantsByName

    assertThat(tenants).hasSize(2);
  }

  @Test
  void testGetOneTenant() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.autoTenantCreation(true)));

    CollectionHandle<Map<String, Object>> collection = client.collections.use(collectionName);
    collection.tenants.create(Tenant.active("tenantA"));

    // // START GetOneTenant
    String tenantName = "tenantA";
    Optional<Tenant> tenant = collection.tenants.get(tenantName);
    System.out.println(tenant);
    // // END GetOneTenant

    assertThat(tenant).isPresent();
  }

  @Test
  void testActivateTenant() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.autoTenantCreation(true)));

    // // START ActivateTenants
    String tenantName = "tenantA";
    CollectionHandle<Map<String, Object>> collection = client.collections.use(collectionName);
    collection.tenants.activate(tenantName);
    // // END ActivateTenants

    Optional<Tenant> tenant = collection.tenants.get(tenantName);
    assertThat(tenant).isPresent();
  }

  @Test
  void testDeactivateTenant() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.autoTenantCreation(true)));

    // // START DeactivateTenants
    String tenantName = "tenantA";
    CollectionHandle<Map<String, Object>> collection = client.collections.use(collectionName);
    collection.tenants.deactivate(tenantName);
    // // END DeactivateTenants

    Optional<Tenant> tenant = collection.tenants.get(tenantName);
    assertThat(tenant).isPresent();
  }

  @Test
  void testOffloadTenant() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.autoTenantCreation(true)));

    // // START OffloadTenants
    String tenantName = "tenantA";
    CollectionHandle<Map<String, Object>> collection = client.collections.use(collectionName);
    collection.tenants.offload(tenantName);
    // // END OffloadTenants

    Optional<Tenant> tenant = collection.tenants.get(tenantName);
    assertThat(tenant).isPresent();
  }

  @Test
  void testRemoveTenants() throws IOException {
    String collectionName = "MultiTenancyCollection";
    client.collections.create(collectionName, col -> col
        .multiTenancy(mt -> mt.autoTenantCreation(true)));

    CollectionHandle<Map<String, Object>> collection = client.collections.use(collectionName);
    collection.tenants.create(
        Tenant.active("tenantA"),
        Tenant.active("tenantB"));

    // // START RemoveTenants
    collection.tenants.delete(Arrays.asList("tenantB", "tenantX"));
    // // END RemoveTenants

    List<Tenant> tenants = collection.tenants.get();
    assertThat(tenants).hasSize(1);
    assertThat(tenants.get(0).name())
        .containsAnyOf("tenantA");
  }
}
