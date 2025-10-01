import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionConfig;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.Replication;
import io.weaviate.client6.v1.api.collections.Sharding;
import io.weaviate.client6.v1.api.collections.Tokenization;
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
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;

class ManageCollectionsTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    // Instantiate the client with the OpenAI API key
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    assertThat(openaiApiKey).isNotBlank()
        .withFailMessage("Please set the OPENAI_API_KEY environment variable.");

    client = WeaviateClient
        .connectToLocal(config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
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
    client.collections.create("Article",
        col -> col.properties(Property.text("title"), Property.text("body")));
    // END CreateCollectionWithProperties

    var config = client.collections.getConfig("Article").get();
    assertThat(config.properties()).hasSize(2);
  }

  @Test
  void testCreateCollectionWithVectorizer() throws IOException {
    // START Vectorizer
    client.collections.create("Article",
        col -> col.vectorConfig(VectorConfig.text2vecContextionary())
            .properties(Property.text("title"), Property.text("body")));
    // END Vectorizer

    var config = client.collections.getConfig("Article").get();
    assertThat(config.vectors()).containsKey("default");
    System.out.println("first: " + config.vectors().get("default"));
    // assertThat(config.vectors().get("default").vectorizerName()).isEqualTo("text2vec-weaviate");
  }

  @Test
  void testCreateCollectionWithNamedVectors() throws IOException {
    // START BasicNamedVectors
    // Weaviate
    client.collections.create("ArticleNV",
        col -> col
            .vectorConfig(
                VectorConfig.text2vecContextionary("title",
                    c -> c.sourceProperties("title").vectorIndex(Hnsw.of())),
                VectorConfig.text2vecContextionary("title_country",
                    c -> c.sourceProperties("title", "country").vectorIndex(Hnsw.of())),
                VectorConfig.selfProvided("custom_vector",
                    c -> c.vectorIndex(Hnsw.of()).vectorIndex(Hnsw.of())))
            .properties(Property.text("title"), Property.text("country")));
    // END BasicNamedVectors

    var config = client.collections.getConfig("ArticleNV").get();
    assertThat(config.vectors()).hasSize(3).containsKeys("title", "title_country", "custom_vector");
    assertThat(config.properties().get(0).propertyName().contains("title"));
    assertThat(config.properties().get(1).propertyName().contains("country"));
  }

  // TODO[g-despot]: Add example when AddNamedVectors is implemented
  // START AddNamedVectors
  // Coming soon
  // END AddNamedVectors

  // TODO[g-despot]: Add example when MultiValueVectorCollection is implemented
  // START MultiValueVectorCollection
  // Coming soon
  // END MultiValueVectorCollection

  @Test
  void testSetVectorIndexType() throws IOException {
    // START SetVectorIndexType
    client.collections.create("Article",
        col -> col
            .vectorConfig(VectorConfig.text2vecContextionary(vec -> vec.vectorIndex(Hnsw.of())))
            .properties(Property.text("title"), Property.text("body")));
    // END SetVectorIndexType

    var config = client.collections.getConfig("Article").get();
    VectorConfig defaultVector = config.vectors().get("default");
    assertThat(defaultVector.vectorIndex()).isInstanceOf(Hnsw.class);
  }

  @Test
  void testSetVectorIndexParams() throws IOException {
    // START SetVectorIndexParams
    client.collections.create("Article",
        col -> col.vectorConfig(VectorConfig.text2vecContextionary(vec -> vec
            .vectorIndex(Hnsw.of(hnsw -> hnsw.efConstruction(300).distance(Distance.COSINE))))));
    // END SetVectorIndexParams

    var config = client.collections.getConfig("Article").get();
    Hnsw hnswConfig = (Hnsw) config.vectors().get("default").vectorIndex();
    assertThat(hnswConfig.efConstruction()).isEqualTo(300);
    assertThat(hnswConfig.distance()).isEqualTo(Distance.COSINE);
  }

  @Test
  void testSetInvertedIndexParams() throws IOException {
    // START SetInvertedIndexParams
    client.collections.create("Article",
        col -> col
            .properties(Property.text("title", p -> p.indexFilterable(true).indexSearchable(true)),
                Property.text("chunk", p -> p.indexFilterable(true).indexSearchable(true)),
                Property.integer("chunk_number", p -> p.indexRangeFilters(true)))
            .invertedIndex(idx -> idx.bm25(b -> b.b(1).k1(2)).indexNulls(true)
                .indexPropertyLength(true).indexTimestamps(true)));
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
        .vectorConfig(VectorConfig.text2vecContextionary()).rerankerModules(Reranker.cohere()));
    // END SetReranker

    var config = client.collections.getConfig("Article").get();
    assertThat(config.rerankerModules()).hasSize(1);
    System.out.println("second:" + config.rerankerModules().get(0));
    // assertThat(config.rerankerModules().get(0).name()).isEqualTo("reranker-cohere");
  }

  // TODO[g-despot] Update when more rerankers available
  // TODO[g-despot] Why does update need collection name?
  @Test
  void testUpdateReranker() throws IOException {
    // START UpdateReranker
    var collection = client.collections.use("Article");
    collection.config.update("Article", col -> col.rerankerModules(Reranker.cohere()));
    // END UpdateReranker

    var config = client.collections.getConfig("Article").get();
    assertThat(config.rerankerModules()).hasSize(1);
    System.out.println("second:" + config.rerankerModules().get(0));
    // assertThat(config.rerankerModules().get(0).name()).isEqualTo("reranker-cohere");
  }

  @Test
  void testSetGenerative() throws IOException {
    // START SetGenerative
    client.collections.create("Article", col -> col
        .vectorConfig(VectorConfig.text2vecContextionary()).generativeModule(Generative.cohere()));
    // END SetGenerative

    var config = client.collections.getConfig("Article").get();
    System.out.println("third: " + config);
    // assertThat(config.generativeModule().name()).isEqualTo("generative-cohere");
    // assertThat(config.generativeModule().model()).isEqualTo("gpt-4o");
  }

  // TODO[g-despot] Update when more generative modules available
  @Test
  void testUpdateGenerative() throws IOException {
    // START UpdateGenerative
    var collection = client.collections.use("Article");
    collection.config.update("Article", col -> col.generativeModule(Generative.cohere()));
    // END UpdateGenerative

    var config = client.collections.getConfig("Article").get();
    assertThat(config.generativeModule()).isNotNull();
    System.out.println("third: " + config.generativeModule());
    // assertThat(config.generativeModule().name()).isEqualTo("generative-cohere");
    // assertThat(config.generativeModule().model()).isEqualTo("gpt-4o");
  }

  // TODO[g-despot] Update when more model providers available
  // @Test
  // void testModuleSettings() throws IOException {
  //   client.collections.create("Article",
  //       col -> col.vectorConfig(VectorConfig.text2vecContextionary()));

  //   var config = client.collections.getConfig("Article").get();
  // }
  // START ModuleSettings
  // Coming soon
  // END ModuleSettings

  @Test
  void testCreateCollectionWithPropertyConfig() throws IOException {
    // START PropModuleSettings
    client.collections.create("Article",
        col -> col.properties(
            Property.text("title",
                p -> p.description("The title of the article.").tokenization(Tokenization.LOWERCASE)
                    .vectorizePropertyName(false)),
            Property.text("body",
                p -> p.skipVectorization(true).tokenization(Tokenization.WHITESPACE))));
    // END PropModuleSettings

    var config = client.collections.getConfig("Article").get();
    assertThat(config.properties()).hasSize(2);
  }

  @Test
  void testCreateCollectionWithTrigramTokenization() throws IOException {
    // START TrigramTokenization
    client.collections.create("Article",
        col -> col.vectorConfig(VectorConfig.text2vecContextionary())
            .properties(Property.text("title", p -> p.tokenization(Tokenization.TRIGRAM))));
    // END TrigramTokenization

    var config = client.collections.getConfig("Article").get();
    assertThat(config.properties()).hasSize(2);
  }

  @Test
  void testDistanceMetric() throws IOException {
    // START DistanceMetric
    client.collections.create("Article", col -> col.vectorConfig(VectorConfig.text2vecContextionary(
        vec -> vec.vectorIndex(Hnsw.of(hnsw -> hnsw.distance(Distance.COSINE))))));
    // END DistanceMetric

    var config = client.collections.getConfig("Article").get();
    Hnsw hnswConfig = (Hnsw) config.vectors().get("default").vectorIndex();
    assertThat(hnswConfig.distance()).isEqualTo(Distance.COSINE);
  }

  @Test
  void testReplicationSettings() throws IOException {
    // START ReplicationSettings
    client.collections.create("Article",
        col -> col.replication(Replication.of(rep -> rep.replicationFactor(1))));
    // END ReplicationSettings

    var config = client.collections.getConfig("Article").get();
    assertThat(config.replication().replicationFactor()).isEqualTo(1);
  }

  @Test
  void testAsyncRepair() throws IOException {
    // START AsyncRepair
    client.collections.create("Article",
        col -> col.replication(Replication.of(rep -> rep.replicationFactor(1).asyncEnabled(true))));
    // END AsyncRepair

    var config = client.collections.getConfig("Article").get();
    assertThat(config.replication().asyncEnabled()).isTrue();
  }

  @Test
  void testAllReplicationSettings() throws IOException {
    // START AllReplicationSettings
    client.collections.create("Article",
        col -> col.replication(Replication.of(rep -> rep.replicationFactor(1).asyncEnabled(true)
            .deletionStrategy(DeletionStrategy.TIME_BASED_RESOLUTION))));
    // END AllReplicationSettings

    var config = client.collections.getConfig("Article").get();
    assertThat(config.replication().replicationFactor()).isEqualTo(1);
    assertThat(config.replication().asyncEnabled()).isTrue();
  }

  @Test
  void testShardingSettings() throws IOException {
    // START ShardingSettings
    client.collections.create("Article", col -> col.sharding(
        Sharding.of(s -> s.virtualPerPhysical(128).desiredCount(1).desiredVirtualCount(128))));
    // END ShardingSettings

    var config = client.collections.getConfig("Article").get();
    assertThat(config.sharding().virtualPerPhysical()).isEqualTo(128);
    // assertThat(config.sharding().desiredCount()).isEqualTo(1);
    assertThat(config.sharding().desiredVirtualCount()).isEqualTo(128);
  }

  @Test
  void testMultiTenancy() throws IOException {
    // START Multi-tenancy
    client.collections.create("Article",
        col -> col.multiTenancy(mt -> mt.autoTenantCreation(true).autoTenantActivation(true)));
    // END Multi-tenancy

    var config = client.collections.getConfig("Article").get();
    assertThat(config.multiTenancy().activateAutomatically()).isTrue();
  }

  @Test
  void testReadOneCollection() throws IOException {
    client.collections.create("Article");

    // START ReadOneCollection
    CollectionHandle<Map<String, Object>> articles = client.collections.use("Article");
    Optional<CollectionConfig> articlesConfig = articles.config.get();

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

    assertThat(response).hasSize(2).extracting(CollectionConfig::collectionName).contains("Article",
        "Publication");
  }

  @Test
  void testUpdateCollection() throws IOException {
    client.collections.create("Article",
        col -> col.invertedIndex(idx -> idx.bm25(bm25Builder -> bm25Builder.k1(10))));

    // START UpdateCollection
    CollectionHandle<Map<String, Object>> articles = client.collections.use("Article");

    articles.config.update("Article", col -> col.description("An updated collection description.")
        .invertedIndex(idx -> idx.bm25(bm25Builder -> bm25Builder.k1(1.5f))));
    // END UpdateCollection

    var config = articles.config.get().get();
    assertThat(config.description()).isEqualTo("An updated collection description.");
    assertThat(config.invertedIndex().bm25().k1()).isEqualTo(1.5f);
  }

  // TODO[g-despot]: Add example when AddProperty is implemented
  // START AddProperty
  // Coming soon
  // END AddProperty

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
    CollectionHandle<Map<String, Object>> articles = client.collections.use("Article");

    List<Shard> articleShards = articles.config.getShards();
    System.out.println(articleShards);
    // END InspectCollectionShards

    assertThat(articleShards).isNotNull().hasSize(1);
  }

  @Test
  void testUpdateCollectionShards() throws IOException {
    client.collections.create("Article");
    String shardName = client.collections.use("Article").config.getShards().get(0).name();

    // START UpdateCollectionShards
    CollectionHandle<Map<String, Object>> articles = client.collections.use("Article");

    List<Shard> articleShards = articles.config.updateShards(ShardStatus.READONLY, shardName);
    System.out.println(articleShards);
    // END UpdateCollectionShards

    assertThat(articleShards).isNotNull().hasSize(1);
    assertThat(articleShards.get(0).status()).isEqualTo(ShardStatus.READONLY.name());
  }
}
