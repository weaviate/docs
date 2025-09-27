import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionConfig;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.Replication;
import io.weaviate.client6.v1.api.collections.Sharding;
import io.weaviate.client6.v1.api.collections.vectorindex.Distance;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.Replication.DeletionStrategy;
import io.weaviate.client6.v1.api.collections.config.Shard;
import io.weaviate.client6.v1.api.collections.config.ShardStatus;
import io.weaviate.client6.v1.api.collections.Reranker;
import io.weaviate.client6.v1.api.collections.Generative;
import io.weaviate.client6.v1.api.collections.vectorindex.Hnsw;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ManageCollectionsTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    // Instantiate the client with the OpenAI API key
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    assertThat(openaiApiKey).isNotBlank()
        .withFailMessage("Please set the OPENAI_API_KEY environment variable.");

    client = WeaviateClient.connectToLocal(config -> config
        .setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
  }

  @AfterEach
  public void afterEach() throws IOException {
    // Clean up all collections after each test
    client.collections.deleteAll();
  }

  @Test
  void testBasicCreateCollection() throws IOException {
    // START BasicCreateCollection
    client.collections.create("Article");
    // END BasicCreateCollection

    assertThat(client.collections.exists("Article")).isTrue();
  }

  @Test
  void testCreateCollectionWithProperties() throws IOException {
    // START CreateCollectionWithProperties
    client.collections.create("Article", col -> col
        .properties(
            Property.text("title"),
            Property.text("body")));
    // END CreateCollectionWithProperties

    var config = client.collections.getConfig("Article").get();
    assertThat(config.properties()).hasSize(2);
  }

  @Test
  void testCreateCollectionWithVectorizer() throws IOException {
    // START Vectorizer
    client.collections.create("Article", col -> col
        .vectorConfig(VectorConfig.text2vecContextionary())
        .properties(
            Property.text("title"),
            Property.text("body")));
    // END Vectorizer

    var config = client.collections.getConfig("Article").get();
    assertThat(config.vectors()).containsKey("default");
    System.out.println("first: " + config.vectors().get("default"));
    // assertThat(config.vectors().get("default").vectorizerName()).isEqualTo("text2vec-weaviate");
  }

  @Test
  void testCreateCollectionWithNamedVectors() throws IOException {
    // START BasicNamedVectors
    // TODO[g-despot]: Missing source properties and other VectorConfig beside
    // Weaviate
    client.collections.create("ArticleNV", col -> col
        .vectorConfig(
            VectorConfig.text2vecContextionary("title"),
            VectorConfig.text2vecContextionary("title_country"),
            VectorConfig.selfProvided("custom_vector"))
        .properties(
            Property.text("title"),
            Property.text("country")));
    // END BasicNamedVectors

    var config = client.collections.getConfig("ArticleNV").get();
    assertThat(config.vectors()).hasSize(3)
        .containsKeys("title", "title_country", "custom_vector");
    // assertThat(config.vectors().get("title").sourceProperties()).containsExactly("title");
    // assertThat(config.vectors().get("title_country").sourceProperties()).containsExactly("title",
    // "country");
  }

  @Test
  void testSetVectorIndexType() throws IOException {
    // START SetVectorIndexType
    client.collections.create("Article", col -> col
        .vectorConfig(VectorConfig.text2vecContextionary(vec -> vec
            .vectorIndex(Hnsw.of())))
        .properties(
            Property.text("title"),
            Property.text("body")));
    // END SetVectorIndexType

    var config = client.collections.getConfig("Article").get();
    VectorConfig defaultVector = config.vectors().get("default");
    assertThat(defaultVector.vectorIndex()).isInstanceOf(Hnsw.class);
  }

  @Test
  void testSetVectorIndexParams() throws IOException {
    // START SetVectorIndexParams
    client.collections.create("Article", col -> col
        .vectorConfig(VectorConfig.text2vecContextionary(vec -> vec
            .vectorIndex(Hnsw.of(hnsw -> hnsw
                .efConstruction(300)
                .distance(Distance.COSINE))))));
    // END SetVectorIndexParams

    var config = client.collections.getConfig("Article").get();
    Hnsw hnswConfig = (Hnsw) config.vectors().get("default").vectorIndex();
    assertThat(hnswConfig.efConstruction()).isEqualTo(300);
    assertThat(hnswConfig.distance()).isEqualTo(Distance.COSINE);
  }

  @Test
  void testSetInvertedIndexParams() throws IOException {
    // START SetInvertedIndexParams
    client.collections.create("Article", col -> col
        .properties(
            Property.text("title", p -> p.indexFilterable(true).indexSearchable(true)),
            Property.text("chunk", p -> p.indexFilterable(true).indexSearchable(true)),
            Property.integer("chunk_number", p -> p.indexRangeFilters(true)))
        .invertedIndex(idx -> idx.bm25(b -> b.b(1).k1(2))
            .indexNulls(true)
            .indexPropertyLength(true)
            .indexTimestamps(true)));
    // END SetInvertedIndexParams

    var config = client.collections.getConfig("Article").get();
    assertThat(config.invertedIndex().bm25().b()).isEqualTo(1);
    assertThat(config.invertedIndex().bm25().k1()).isEqualTo(2);
    assertThat(config.properties()).hasSize(3);
  }

  @Test
  void testSetReranker() throws IOException {
    // START SetReranker
    client.collections.create("Article", col -> col
        .vectorConfig(VectorConfig.text2vecContextionary())
        .rerankerModules(Reranker.cohere()));
    // END SetReranker

    var config = client.collections.getConfig("Article").get();
    assertThat(config.rerankerModules()).hasSize(1);
    System.out.println("second:" + config.rerankerModules().get(0));
    // assertThat(config.rerankerModules().get(0).name()).isEqualTo("reranker-cohere");
  }

  @Test
  void testSetGenerative() throws IOException {
    // START SetGenerative
    client.collections.create("Article", col -> col
        .vectorConfig(VectorConfig.text2vecContextionary())
        .generativeModule(Generative.cohere()));
    // END SetGenerative

    var config = client.collections.getConfig("Article").get();
    System.out.println("third: " + config);
    // assertThat(config.generativeModule().name()).isEqualTo("generative-cohere");
    // assertThat(config.generativeModule().model()).isEqualTo("gpt-4o");
  }

  @Test
  void testModuleSettings() throws IOException {
    // START ModuleSettings
    // TODO[g-despot]: Add model once other VectorConfig are available
    client.collections.create("Article", col -> col
        .vectorConfig(VectorConfig.text2vecContextionary()));
    // vec -> vec.model("Snowflake/snowflake-arctic-embed-m-v1.5"))));
    // .vectorizeClassName(true))));
    // END ModuleSettings

    var config = client.collections.getConfig("Article").get();
    System.out.println("fourth: " + config);
    // assertThat(config.model()).isEqualTo("Snowflake/snowflake-arctic-embed-m-v1.5");
  }

  @Test
  void testDistanceMetric() throws IOException {
    // START DistanceMetric
    client.collections.create("Article", col -> col
        .vectorConfig(VectorConfig.text2vecContextionary(vec -> vec
            .vectorIndex(Hnsw.of(hnsw -> hnsw
                .distance(Distance.COSINE))))));
    // END DistanceMetric

    var config = client.collections.getConfig("Article").get();
    Hnsw hnswConfig = (Hnsw) config.vectors().get("default").vectorIndex();
    assertThat(hnswConfig.distance()).isEqualTo(Distance.COSINE);
  }

  @Test
  void testReplicationSettings() throws IOException {
    // START ReplicationSettings
    client.collections.create("Article", col -> col
        .replication(Replication.of(rep -> rep.replicationFactor(1))));
    // END ReplicationSettings

    var config = client.collections.getConfig("Article").get();
    assertThat(config.replication().replicationFactor()).isEqualTo(1);
  }

  @Test
  void testAsyncRepair() throws IOException {
    // START AsyncRepair
    client.collections.create("Article", col -> col
        .replication(Replication.of(rep -> rep
            .replicationFactor(1)
            .asyncEnabled(true))));
    // END AsyncRepair

    var config = client.collections.getConfig("Article").get();
    assertThat(config.replication().asyncEnabled()).isTrue();
  }

  @Test
  void testAllReplicationSettings() throws IOException {
    // START AllReplicationSettings
    client.collections.create("Article", col -> col
        .replication(Replication.of(rep -> rep
            .replicationFactor(1)
            .asyncEnabled(true)
            .deletionStrategy(DeletionStrategy.TIME_BASED_RESOLUTION))));
    // END AllReplicationSettings

    var config = client.collections.getConfig("Article").get();
    assertThat(config.replication().replicationFactor()).isEqualTo(1);
    assertThat(config.replication().asyncEnabled()).isTrue();
  }

  @Test
  void testShardingSettings() throws IOException {
    // START ShardingSettings
    client.collections.create("Article", col -> col
        .sharding(Sharding.of(s -> s
            .virtualPerPhysical(128)
            .desiredCount(1)
            .desiredVirtualCount(128))));
    // END ShardingSettings

    var config = client.collections.getConfig("Article").get();
    assertThat(config.sharding().virtualPerPhysical()).isEqualTo(128);
    // assertThat(config.sharding().desiredCount()).isEqualTo(1);
    assertThat(config.sharding().desiredVirtualCount()).isEqualTo(128);
  }

  @Test
  void testMultiTenancy() throws IOException {
    // START Multi-tenancy
    // TODO[g-despot]: Why isn't there an enabled parameter, also
    // auto_tenant_creation
    client.collections.create("Article", col -> col
        .multiTenancy(mt -> mt.autoTenantCreation(true)
            .autoTenantActivation(true)));
    // END Multi-tenancy

    var config = client.collections.getConfig("Article").get();
    // assertThat(config.multiTenancy().activateAutomatically()).isTrue();
  }

  @Test
  void testReadOneCollection() throws IOException {
    client.collections.create("Article");

    // START ReadOneCollection
    var articles = client.collections.use("Article");
    var articlesConfig = articles.config.get();

    System.out.println(articlesConfig);
    // END ReadOneCollection

    assertThat(articlesConfig).isNotNull();
    assertThat(articlesConfig.get().collectionName()).isEqualTo("Article");
  }

  @Test
  void testReadAllCollections() throws IOException {
    client.collections.create("Article");
    client.collections.create("Publication");

    // START ReadAllCollections
    List<CollectionConfig> response = client.collections.list();

    System.out.println(response);
    // END ReadAllCollections

    assertThat(response).hasSize(2)
        .extracting(CollectionConfig::collectionName)
        .contains("Article", "Publication");
  }

  @Test
  void testUpdateCollection() throws IOException {
    client.collections.create("Article", col -> col
        .invertedIndex(idx -> idx.bm25(bm25Builder -> bm25Builder
            .k1(10))));

    // START UpdateCollection
    var articles = client.collections.use("Article");
    // TODO[g-despot]: Why can't k1 be a float?
    articles.config.update("Article", col -> col
        .description("An updated collection description.")
        .invertedIndex(idx -> idx.bm25(bm25Builder -> bm25Builder
            .k1(15))));
    // END UpdateCollection

    var config = articles.config.get().get();
    assertThat(config.description()).isEqualTo("An updated collection description.");
    assertThat(config.invertedIndex().bm25().k1()).isEqualTo(15);
  }

  @Test
  void testDeleteCollection() throws IOException {
    String collectionName = "Article";
    client.collections.create(collectionName);
    assertThat(client.collections.exists(collectionName)).isTrue();

    // START DeleteCollection
    client.collections.delete(collectionName);
    // END DeleteCollection

    assertThat(client.collections.exists(collectionName)).isFalse();
  }

  @Test
  void testInspectCollectionShards() throws IOException {
    client.collections.create("Article");

    // START InspectCollectionShards
    var articles = client.collections.use("Article");
    List<Shard> articleShards = articles.config.getShards();
    System.out.println(articleShards);
    // END InspectCollectionShards

    assertThat(articleShards).isNotNull().hasSize(1);
  }

  @Test
  void testUpdateCollectionShards() throws IOException {
    client.collections.create("Article");
    var articles = client.collections.use("Article");
    String shardName = articles.config.getShards().get(0).name();

    // START UpdateCollectionShards
    List<Shard> articleShards = articles.config.updateShards(ShardStatus.READONLY, shardName);
    System.out.println(articleShards);
    // END UpdateCollectionShards

    assertThat(articleShards).isNotNull().hasSize(1);
    assertThat(articleShards.get(0).status()).isEqualTo(ShardStatus.READONLY.name());
  }
}
