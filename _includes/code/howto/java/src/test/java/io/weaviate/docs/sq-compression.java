package io.weaviate.docs;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.misc.model.SQConfig;
import io.weaviate.client.v1.misc.model.VectorIndexConfig;
import io.weaviate.client.v1.schema.model.DataType;
import io.weaviate.client.v1.schema.model.Property;
import io.weaviate.client.v1.schema.model.WeaviateClass;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("sq")
class SqCompressionTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    // ==============================
    // ===== CONNECT =====
    // ==============================

    // START ConnectCode
    String scheme = "http";
    String host = "localhost";
    String port = "8080";

    Config config = new Config(scheme, host + ":" + port);

    client = new WeaviateClient(config);
    // END ConnectCode

    // Clean up any existing schema
    Result<Boolean> result = client.schema().allDeleter().run();
    assertThat(result).isNotNull()
        .withFailMessage(() -> result.getError().toString())
        .returns(false, Result::hasErrors)
        .withFailMessage(null)
        .returns(true, Result::getResult);
  }

  @Test
  public void shouldEnableSQ() {
    // ==============================
    // ===== EnableSQ =====
    // ==============================

    // Delete collection if exists
    client.schema().classDeleter()
        .withClassName("MyCollection")
        .run();

    // START EnableSQ
    WeaviateClass myCollection = WeaviateClass.builder()
        .className("MyCollection")
        .vectorizer("text2vec-openai")
        .vectorIndexConfig(VectorIndexConfig.builder()
            // highlight-start
            .sq(SQConfig.builder()
                .enabled(true)
                .build())
            // highlight-end
            .build())
        .properties(Arrays.asList(
            Property.builder()
                .name("title")
                .dataType(Arrays.asList(DataType.TEXT))
                .build()))
        .build();

    Result<Boolean> createResult = client.schema().classCreator()
        .withClass(myCollection)
        .run();
    // END EnableSQ

    assertThat(createResult).isNotNull()
        .withFailMessage(() -> createResult.getError().toString())
        .returns(false, Result::hasErrors)
        .withFailMessage(null)
        .returns(true, Result::getResult);
  }

  @Test
  public void shouldEnableSQWithOptions() {
    // ==============================
    // ===== EnableSQ with Options =====
    // ==============================

    // Delete collection if exists
    client.schema().classDeleter()
        .withClassName("MyCollection")
        .run();

    // START SQWithOptions
    WeaviateClass myCollection = WeaviateClass.builder()
        .className("MyCollection")
        .vectorizer("text2vec-openai")
        .vectorIndexConfig(VectorIndexConfig.builder()
            // highlight-start
            .sq(SQConfig.builder()
                .enabled(true)
                .rescoreLimit(20L) // Number of candidates to rescore
                .build())
            // highlight-end
            .build())
        .properties(Arrays.asList(
            Property.builder()
                .name("title")
                .dataType(Arrays.asList(DataType.TEXT))
                .build()))
        .build();

    Result<Boolean> createResult = client.schema().classCreator()
        .withClass(myCollection)
        .run();
    // END SQWithOptions

    assertThat(createResult).isNotNull()
        .withFailMessage(() -> createResult.getError().toString())
        .returns(false, Result::hasErrors)
        .withFailMessage(null)
        .returns(true, Result::getResult);

    // Verify the configuration
    Result<WeaviateClass> getResult = client.schema().classGetter()
        .withClassName("MyCollection")
        .run();

    assertThat(getResult).isNotNull()
        .withFailMessage(() -> getResult.getError().toString())
        .returns(false, Result::hasErrors)
        .withFailMessage(null)
        .extracting(Result::getResult).isNotNull()
        .extracting(WeaviateClass::getVectorIndexConfig).isNotNull()
        .extracting(VectorIndexConfig::getSq).isNotNull()
        .returns(true, SQConfig::getEnabled)
        .returns(20L, SQConfig::getRescoreLimit);
  }
}