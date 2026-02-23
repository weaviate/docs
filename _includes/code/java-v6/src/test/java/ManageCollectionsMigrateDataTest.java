import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Generative;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.WeaviateObject;
import io.weaviate.client6.v1.api.collections.tenants.Tenant;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.assertj.core.api.Assertions.assertThat;

class ManageCollectionsMigrateDataTest {

  private static WeaviateClient clientSrc;
  private static WeaviateClient clientTgt;
  private static final int DATASET_SIZE = 50;

  @BeforeAll
  public static void beforeAll() throws IOException {
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    // Connect to the source Weaviate instance
    clientSrc = WeaviateClient.connectToLocal(
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    // Connect to the target Weaviate instance
    clientTgt = WeaviateClient.connectToLocal(config -> config.port(8090)
        .grpcPort(50061)
        .setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));


    // Simulate weaviate-datasets by creating and populating source collections
    createCollection(clientSrc, "WineReview", false);
    createCollection(clientSrc, "WineReviewMT", true);

    var wineReview = clientSrc.collections.use("WineReview");
    List<Map<String, Object>> wineReviewData = new ArrayList<>();
    for (int i = 0; i < DATASET_SIZE; i++) {
      wineReviewData.add(Map.of("title", "Review " + i));
    }
    wineReview.data.insertMany(wineReviewData.toArray(new Map[0]));

    var wineReviewMT = clientSrc.collections.use("WineReviewMT");
    wineReviewMT.tenants.create(List.of(Tenant.active("tenantA")));
    wineReviewMT.withTenant("tenantA").data
        .insertMany(wineReviewData.toArray(new Map[0]));

    assertThat(clientSrc.isReady()).isTrue();
  }

  @AfterAll
  public static void afterAll() throws Exception {
    if (clientSrc != null) {
      clientSrc.close();
    }
    if (clientTgt != null) {
      clientTgt.close();
    }
  }

  @AfterEach
  public void cleanupTarget() throws IOException {
    // Clean up collections on the target client after each test
    clientTgt.collections.delete("WineReview");
    clientTgt.collections.delete("WineReviewMT");
  }

  // START CreateCollectionCollectionToCollection // START CreateCollectionCollectionToTenant // START CreateCollectionTenantToCollection // START CreateCollectionTenantToTenant
  private static CollectionHandle<Map<String, Object>> createCollection(
      WeaviateClient clientIn, String collectionName, boolean enableMt)
      throws IOException {
    // END CreateCollectionCollectionToCollection // END CreateCollectionCollectionToTenant // END CreateCollectionTenantToCollection // END CreateCollectionTenantToTenant
    if (clientIn.collections.exists(collectionName)) {
      clientIn.collections.delete(collectionName);
    }
    // START CreateCollectionCollectionToCollection // START CreateCollectionCollectionToTenant // START CreateCollectionTenantToCollection // START CreateCollectionTenantToTenant
    clientIn.collections.create(collectionName,
        col -> col.multiTenancy(c -> c.enabled(enableMt))
            // Additional settings not shown
            .vectorConfig(VectorConfig.text2vecTransformers())
            .generativeModule(Generative.cohere())
            .properties(Property.text("review_body"), Property.text("title"),
                Property.text("country"), Property.integer("points"),
                Property.number("price")));

    return clientIn.collections.use(collectionName);
  }

  // END CreateCollectionCollectionToCollection // END CreateCollectionCollectionToTenant // END CreateCollectionTenantToCollection // END CreateCollectionTenantToTenant

  // START CollectionToCollection // START TenantToCollection // START CollectionToTenant // START TenantToTenant
  private void migrateData(CollectionHandle<Map<String, Object>> collectionSrc,
      CollectionHandle<Map<String, Object>> collectionTgt) {
    System.out.println("Starting data migration...");
    List<WeaviateObject<Map<String, Object>>> sourceObjects = StreamSupport
        .stream(collectionSrc.paginate(p -> p.includeVector()).spliterator(),
            false)
        .map(readObj -> WeaviateObject
            .<Map<String, Object>>of(c -> c.properties(readObj.properties())
                .uuid(readObj.uuid())
                .vectors(readObj.vectors())))
        .collect(Collectors.toList());

    collectionTgt.data.insertMany(sourceObjects);

    System.out.println("Data migration complete.");
  }

  // END CollectionToCollection // END TenantToCollection // END CollectionToTenant // END TenantToTenant

  private boolean verifyMigration(
      CollectionHandle<Map<String, Object>> collectionSrc,
      CollectionHandle<Map<String, Object>> collectionTgt, int numSamples) {

    List<WeaviateObject<Map<String, Object>>> srcObjects =
        StreamSupport.stream(collectionSrc.paginate().spliterator(), false)
            .collect(Collectors.toList());

    if (srcObjects.isEmpty()) {
      System.out.println("No objects in source collection");
      return false;
    }
    Collections.shuffle(srcObjects);
    List<WeaviateObject<Map<String, Object>>> sampledObjects =
        srcObjects.subList(0, Math.min(numSamples, srcObjects.size()));

    System.out.printf("Verifying %d random objects...\n",
        sampledObjects.size());
    for (var srcObj : sampledObjects) {
      Optional<WeaviateObject<Map<String, Object>>> tgtObjOpt =
          collectionTgt.query.fetchObjectById(srcObj.uuid());
      if (tgtObjOpt.isEmpty()) {
        System.out.printf("Object %s not found in target collection\n",
            srcObj.uuid());
        return false;
      }
      if (!srcObj.properties().equals(tgtObjOpt.get().properties())) {
        System.out.printf("Properties mismatch for object %s\n", srcObj.uuid());
        return false;
      }
    }
    System.out.println("All sampled objects verified successfully!");
    return true;
  }

  // START CreateCollectionCollectionToCollection
  void createCollectionToCollection() throws IOException {
    createCollection(clientTgt, "WineReview", false);
  }
  // END CreateCollectionCollectionToCollection

  @Test
  // START CollectionToCollection
  void testCollectionToCollection() throws IOException {
    createCollectionToCollection();

    var reviewsSrc = clientSrc.collections.use("WineReview");
    var reviewsTgt = clientTgt.collections.use("WineReview");
    migrateData(reviewsSrc, reviewsTgt);

    // END CollectionToCollection
    assertThat(reviewsTgt.aggregate.overAll(a -> a.includeTotalCount(true))
        .totalCount()).isEqualTo(DATASET_SIZE);
    assertThat(verifyMigration(reviewsSrc, reviewsTgt, 5)).isTrue();
    // START CollectionToCollection
  }
  // END CollectionToCollection

  // START CreateCollectionTenantToCollection
  void createTenantToCollection() throws IOException {
    createCollection(clientTgt, "WineReview", false);
  }
  // END CreateCollectionTenantToCollection

  @Test
  // START TenantToCollection
  void testTenantToCollection() throws IOException {
    createTenantToCollection();

    var reviewsSrc = clientSrc.collections.use("WineReviewMT");
    var reviewsTgt = clientTgt.collections.use("WineReview");
    var reviewsSrcTenantA = reviewsSrc.withTenant("tenantA");
    migrateData(reviewsSrcTenantA, reviewsTgt);

    // END TenantToCollection
    assertThat(reviewsTgt.aggregate.overAll(a -> a.includeTotalCount(true))
        .totalCount()).isEqualTo(DATASET_SIZE);
    assertThat(verifyMigration(reviewsSrcTenantA, reviewsTgt, 5)).isTrue();
    // START TenantToCollection
  }
  // END TenantToCollection

  // START CreateCollectionCollectionToTenant
  void createCollectionToTenant() throws IOException {
    createCollection(clientTgt, "WineReviewMT", true);
  }
  // END CreateCollectionCollectionToTenant

  // START CreateTenants // START CreateCollectionTenantToTenant
  void createTenants() throws IOException {
    var reviewsMtTgt = clientTgt.collections.use("WineReviewMT");

    var tenantsTgt =
        List.of(Tenant.active("tenantA"), Tenant.active("tenantB"));
    reviewsMtTgt.tenants.create(tenantsTgt);
  }
  // END CreateTenants // END CreateCollectionTenantToTenant

  @Test
  // START CollectionToTenant
  void testCollectionToTenant() throws IOException {
    createCollectionToTenant();
    createTenants();

    var reviewsMtTgt = clientTgt.collections.use("WineReviewMT");
    var reviewsSrc = clientSrc.collections.use("WineReview");

    var reviewsTgtTenantA = reviewsMtTgt.withTenant("tenantA");

    migrateData(reviewsSrc, reviewsTgtTenantA);
    // END CollectionToTenant

    assertThat(
        reviewsTgtTenantA.aggregate.overAll(a -> a.includeTotalCount(true))
            .totalCount()).isEqualTo(DATASET_SIZE);
    assertThat(verifyMigration(reviewsSrc, reviewsTgtTenantA, 5)).isTrue();
    // START CollectionToTenant
  }
  // END CollectionToTenant

  // START CreateCollectionTenantToTenant
  void createTenantToTenant() throws IOException {
    createCollection(clientTgt, "WineReviewMT", true);
  }
  // END CreateCollectionTenantToTenant

  @Test
  // START TenantToTenant
  void testTenantToTenant() throws IOException {
    createTenantToTenant();
    createTenants();

    var reviewsMtSrc = clientSrc.collections.use("WineReviewMT");
    var reviewsMtTgt = clientTgt.collections.use("WineReviewMT");
    var reviewsSrcTenantA = reviewsMtSrc.withTenant("tenantA");
    var reviewsTgtTenantA = reviewsMtTgt.withTenant("tenantA");

    migrateData(reviewsSrcTenantA, reviewsTgtTenantA);
    // END TenantToTenant

    assertThat(
        reviewsTgtTenantA.aggregate.overAll(a -> a.includeTotalCount(true))
            .totalCount()).isEqualTo(DATASET_SIZE);
    assertThat(verifyMigration(reviewsSrcTenantA, reviewsTgtTenantA, 5))
        .isTrue();
    // START TenantToTenant

  }
  // END TenantToTenant

}
