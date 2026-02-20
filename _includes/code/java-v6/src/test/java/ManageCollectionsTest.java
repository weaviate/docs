import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionConfig;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Encoding;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.Quantization;
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
import io.weaviate.client6.v1.api.collections.vectorindex.MultiVector;
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
  public static void beforeAll() throws IOException {
    // Instantiate the client with the OpenAI API key
    String openaiApiKey = System.getenv("OPENAI_API_KEY");
    assertThat(openaiApiKey).isNotBlank()
        .withFailMessage("Please set the OPENAI_API_KEY environment variable.");

    client = WeaviateClient.connectToLocal(
        config -> config.setHeaders(Map.of("X-OpenAI-Api-Key", openaiApiKey)));
    client.collections.deleteAll();
  }

  @AfterEach
  public void afterAll() throws IOException {
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
        col -> col.vectorConfig(VectorConfig.text2vecTransformers())
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
    client.collections
        .create("ArticleNV",
            col -> col
                .vectorConfig(
                    VectorConfig.text2vecTransformers("title",
                        c -> c.sourceProperties("title")
                            .vectorIndex(Hnsw.of())),
                    VectorConfig.text2vecTransformers("title_country",
                        c -> c.sourceProperties("title", "country")
                            .vectorIndex(Hnsw.of())),
                    VectorConfig.selfProvided("custom_vector",
                        c -> c.vectorIndex(Hnsw.of()).vectorIndex(Hnsw.of())))
                .properties(Property.text("title"), Property.text("country")));
    // END BasicNamedVectors

    var config = client.collections.getConfig("ArticleNV").get();
    assertThat(config.vectors()).hasSize(3)
        .containsKeys("title", "title_country", "custom_vector");
    assertThat(config.properties().get(0).propertyName().contains("title"));
    assertThat(config.properties().get(1).propertyName().contains("country"));
  }

  @Test
  void testAddNamedVectors() throws IOException {
    client.collections.create("ArticleNV",
        col -> col
            .vectorConfig(VectorConfig.text2vecTransformers("title",
                c -> c.sourceProperties("title")
                    .vectorIndex(Hnsw.of())
                    .quantization(Quantization.uncompressed())))
            .properties(Property.text("title"), Property.text("country")));
    // START AddNamedVectors
    CollectionHandle<Map<String, Object>> collection =
        client.collections.use("ArticleNV");

    collection.config.update(
        u -> u.vectorConfig(VectorConfig.text2vecTransformers("title_country",
            c -> c.sourceProperties("title", "country")
                .vectorIndex(Hnsw.of()))));
    // END AddNamedVectors

    var config = client.collections.getConfig("ArticleNV").get();
    assertThat(config.vectors()).hasSize(2)
        .containsKeys("title", "title_country");
    assertThat(config.properties().get(0).propertyName().contains("title"));
    assertThat(config.properties().get(1).propertyName().contains("country"));
  }

  @Test
  void testMultiValueVectorCollection() throws IOException {
    // START MultiValueVectorCollection
    client.collections.create("DemoCollection", col -> col.vectorConfig(
        // Example 1 - Use a model integration
        // The factory function will automatically enable multi-vector support for the HNSW index
        // highlight-start
        VectorConfig.text2multivecJinaAi("jina_colbert",
            vc -> vc.sourceProperties("text")
                // In Java, explicitly configure the HNSW index for multi-vector
                .vectorIndex(Hnsw.of(h -> h.multiVector(MultiVector.of())))),
        // highlight-end
        // Example 2 - User-provided multi-vector representations
        // Must explicitly enable multi-vector support for the HNSW index
        // highlight-start
        VectorConfig.selfProvided("custom_multi_vector",
            vc -> vc.vectorIndex(Hnsw.of(h -> h.multiVector(MultiVector.of()))))
    // highlight-end
    ).properties(Property.text("text"))
    // Additional parameters not shown
    );
    // END MultiValueVectorCollection

    assertThat(client.collections.exists("DemoCollection")).isTrue();
  }

  @Test
  void testMultiValueVectorMuvera() throws IOException {
    // START MultiValueVectorMuvera
    client.collections.create("DemoCollection", col -> col.vectorConfig(
        // Example 1 - Use a model integration
        VectorConfig.text2multivecJinaAi("jina_colbert",
            vc -> vc.sourceProperties("text")
                // highlight-start
                .vectorIndex(Hnsw.of(h -> h.multiVector(
                    MultiVector.of(mv -> mv.encoding(Encoding.muvera(e -> e
                    // Optional parameters for tuning MUVERA
                    // .ksim(4)
                    // .dprojections(16)
                    // .repetitions(20)
                    ))))))
        // highlight-end
        ),
        // Example 2 - User-provided multi-vector representations
        VectorConfig.selfProvided("custom_multi_vector",
            vc -> vc.vectorIndex(Hnsw.of(h -> h.multiVector(
                MultiVector.of(mv -> mv.encoding(Encoding.muvera())))))))
    // Additional parameters not shown
    );
    // END MultiValueVectorMuvera

    assertThat(client.collections.exists("DemoCollection")).isTrue();
  }

  @Test
  void testSetVectorIndexType() throws IOException {
    // START SetVectorIndexType
    client.collections.create("Article",
        col -> col
            .vectorConfig(VectorConfig
                .text2vecTransformers(vec -> vec.vectorIndex(Hnsw.of())))
            .properties(Property.text("title"), Property.text("body")));
    // END SetVectorIndexType

    var config = client.collections.getConfig("Article").get();
    VectorConfig defaultVector = config.vectors().get("default");
    assertThat(defaultVector.vectorIndex()).isInstanceOf(Hnsw.class);
  }

  @Test
  void testSetVectorIndexParams() throws IOException {
    // START SetVectorIndexParams
    client.collections.create("Article", col -> col
        .vectorConfig(
            VectorConfig.text2vecTransformers(vec -> vec.vectorIndex(Hnsw.of(
                hnsw -> hnsw.efConstruction(300).distance(Distance.COSINE)))))
        .properties(Property.text("title")));
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
            Property.text("title",
                p -> p.indexFilterable(true).indexSearchable(true)),
            Property.text("chunk",
                p -> p.indexFilterable(true).indexSearchable(true)),
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

  //@Test
  void testDropInvertedIndex() throws IOException {
    client.collections.create("Article", col -> col
        .properties(
            Property.text("title",
                p -> p.indexFilterable(true).indexSearchable(true)),
            Property.integer("chunk_number", p -> p.indexRangeFilters(true))));

    // START DropInvertedIndex
    var collection = client.collections.use("Article");

    // highlight-start
    // Drop the searchable inverted index from the "title" property
    collection.config.dropPropertyIndex("title", PropertyIndexType.SEARCHABLE);

    // Drop the filterable inverted index from the "title" property
    collection.config.dropPropertyIndex("title", PropertyIndexType.FILTERABLE);

    // Drop the range filter index from the "chunk_number" property
    collection.config.dropPropertyIndex("chunk_number", PropertyIndexType.RANGE_FILTERS);
    // highlight-end
    // END DropInvertedIndex

    var config = client.collections.getConfig("Article").get();
    var titleProp = config.properties().stream()
        .filter(p -> p.name().equals("title")).findFirst().get();
    assertThat(titleProp.indexFilterable()).isFalse();
    assertThat(titleProp.indexSearchable()).isFalse();
  }

  // TODO[g-despot] IllegalState Not a JSON Object: null
  @Test
  void testSetReranker() throws IOException {
    // START SetReranker
    client.collections.create("Article",
        col -> col.vectorConfig(VectorConfig.text2vecTransformers())
            .rerankerModules(Reranker.cohere())
            .properties(Property.text("title")));
    // END SetReranker

    var config = client.collections.getConfig("Article").get();
    assertThat(config.rerankerModules()).hasSize(1);
    System.out.println("second:" + config.rerankerModules().get(0));
    // assertThat(config.rerankerModules().get(0).name()).isEqualTo("reranker-cohere");
  }

  @Test
  void testUpdateReranker() throws IOException {
    client.collections.create("Article",
        col -> col.vectorConfig(VectorConfig.text2vecTransformers())
            .properties(Property.text("title")));

    // START UpdateReranker
    var collection = client.collections.use("Article");
    collection.config.update(col -> col.rerankerModules(Reranker.cohere()));
    // END UpdateReranker

    var config = client.collections.getConfig("Article").get();
    assertThat(config.rerankerModules()).hasSize(1);
  }

  @Test
  void testSetGenerative() throws IOException {
    // START SetGenerative
    client.collections.create("Article",
        col -> col.vectorConfig(VectorConfig.text2vecTransformers())
            .generativeModule(Generative.cohere())
            .properties(Property.text("title")));
    // END SetGenerative

    var config = client.collections.getConfig("Article").get();
    System.out.println("third: " + config);
    // assertThat(config.generativeModule().name()).isEqualTo("generative-cohere");
    // assertThat(config.generativeModule().model()).isEqualTo("gpt-4o");
  }

  @Test
  void testUpdateGenerative() throws IOException {
    client.collections.create("Article",
        col -> col.vectorConfig(VectorConfig.text2vecTransformers())
            .properties(Property.text("title")));

    // START UpdateGenerative
    var collection = client.collections.use("Article");
    collection.config.update(col -> col.generativeModule(Generative.cohere()));
    // END UpdateGenerative

    var config = client.collections.getConfig("Article").get();
    assertThat(config.generativeModule()).isNotNull();
  }

  @Test
  void testModuleSettings() throws IOException {
    // START ModuleSettings
    client.collections.create("Article", col -> col.vectorConfig(
        VectorConfig.text2vecCohere(c -> c.model("embed-multilingual-v2.0"))));
    // END ModuleSettings
  }

  @Test
  void testCreateCollectionWithPropertyConfig() throws IOException {
    // START PropModuleSettings
    client.collections.create("Article",
        col -> col.properties(
            Property.text("title",
                p -> p.description("The title of the article.")
                    .tokenization(Tokenization.LOWERCASE)
                    .vectorizePropertyName(false)),
            Property.text("body", p -> p.skipVectorization(true)
                .tokenization(Tokenization.WHITESPACE))));
    // END PropModuleSettings

    var config = client.collections.getConfig("Article").get();
    assertThat(config.properties()).hasSize(2);
  }

  @Test
  void testCreateCollectionWithTrigramTokenization() throws IOException {
    // START TrigramTokenization
    client.collections.create("Article", col -> col
        .vectorConfig(VectorConfig.text2vecTransformers())
        .properties(
            Property.text("title", p -> p.tokenization(Tokenization.TRIGRAM))));
    // END TrigramTokenization

    var config = client.collections.getConfig("Article").get();
    assertThat(config.properties()).hasSize(1);
  }

  @Test
  void testDistanceMetric() throws IOException {
    // START DistanceMetric
    client.collections.create("Article",
        col -> col
            .vectorConfig(VectorConfig.text2vecTransformers(vec -> vec
                .vectorIndex(Hnsw.of(hnsw -> hnsw.distance(Distance.COSINE)))))
            .properties(Property.text("title")));
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
    client.collections.create("Article", col -> col.replication(
        Replication.of(rep -> rep.replicationFactor(1).asyncEnabled(true))));
    // END AsyncRepair

    var config = client.collections.getConfig("Article").get();
    assertThat(config.replication().asyncEnabled()).isTrue();
  }

  @Test
  void testAllReplicationSettings() throws IOException {
    // START AllReplicationSettings
    client.collections.create("Article",
        col -> col.replication(Replication.of(rep -> rep.replicationFactor(1)
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
    client.collections.create("Article",
        col -> col.sharding(Sharding.of(s -> s.virtualPerPhysical(128)
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
    client.collections.create("Article", col -> col.multiTenancy(
        mt -> mt.autoTenantCreation(true).autoTenantActivation(true)));
    // END Multi-tenancy

    var config = client.collections.getConfig("Article").get();
    assertThat(config.multiTenancy().activateAutomatically()).isTrue();
  }

  @Test
  void testReadOneCollection() throws IOException {
    client.collections.create("Article");

    // START ReadOneCollection
    CollectionHandle<Map<String, Object>> articles =
        client.collections.use("Article");
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

    assertThat(response).hasSize(2)
        .extracting(CollectionConfig::collectionName)
        .contains("Article", "Publication");
  }

  @Test
  void testUpdateCollection() throws IOException {
    client.collections.create("Article", col -> col
        .invertedIndex(idx -> idx.bm25(bm25Builder -> bm25Builder.k1(10))));

    // START UpdateCollection
    CollectionHandle<Map<String, Object>> articles =
        client.collections.use("Article");

    articles.config.update(col -> col
        .description("An updated collection description.")
        .invertedIndex(idx -> idx.bm25(bm25Builder -> bm25Builder.k1(1.5f))));
    // END UpdateCollection

    var config = articles.config.get().get();
    assertThat(config.description())
        .isEqualTo("An updated collection description.");
    assertThat(config.invertedIndex().bm25().k1()).isEqualTo(1.5f);
  }

  @Test
  void testAddProperty() throws IOException {
    client.collections.create("Article");

    // START AddProperty
    CollectionHandle<Map<String, Object>> articles =
        client.collections.use("Article");

    articles.config.addProperty(Property.bool("onHomepage"));
    // END AddProperty

    var config = articles.config.get().get();
    assertThat(config.properties().size()).isEqualTo(1);
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
  void testExistsCollection() throws IOException {
    String collectionName = "Article";
    client.collections.delete(collectionName);
    client.collections.create(collectionName);
    // START CheckIfExists
    client.collections.exists(collectionName);
    // END CheckIfExists

    assertThat(client.collections.exists(collectionName)).isTrue();
  }

  @Test
  void testInspectCollectionShards() throws IOException {
    client.collections.create("Article");

    // START InspectCollectionShards
    CollectionHandle<Map<String, Object>> articles =
        client.collections.use("Article");

    List<Shard> articleShards = articles.config.getShards();
    System.out.println(articleShards);
    // END InspectCollectionShards

    assertThat(articleShards).isNotNull().hasSize(1);
  }

  @Test
  void testUpdateCollectionShards() throws IOException {
    client.collections.create("Article");
    String shardName =
        client.collections.use("Article").config.getShards().get(0).name();

    // START UpdateCollectionShards
    CollectionHandle<Map<String, Object>> articles =
        client.collections.use("Article");

    List<Shard> articleShards =
        articles.config.updateShards(ShardStatus.READONLY, shardName);
    System.out.println(articleShards);
    // END UpdateCollectionShards

    assertThat(articleShards).isNotNull().hasSize(1);
    assertThat(articleShards.get(0).status())
        .isEqualTo(ShardStatus.READONLY.name());
  }
}
