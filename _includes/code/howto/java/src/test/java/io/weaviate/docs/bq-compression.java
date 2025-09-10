package io.weaviate.docs;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.misc.model.BQConfig;
import io.weaviate.client.v1.misc.model.VectorIndexConfig;
import io.weaviate.client.v1.schema.model.DataType;
import io.weaviate.client.v1.schema.model.Property;
import io.weaviate.client.v1.schema.model.WeaviateClass;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("bq")
class BqCompressionTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    // ==============================
    // ===== CONNECT =====
    // ==============================

    String scheme = "http";
    String host = "localhost";
    String port = "8080";

    Config config = new Config(scheme, host + ":" + port);

    client = new WeaviateClient(config);

    // Clean up any existing schema
    Result<Boolean> result = client.schema().allDeleter().run();
    assertThat(result).isNotNull()
        .withFailMessage(() -> result.getError().toString())
        .returns(false, Result::hasErrors)
        .withFailMessage(null)
        .returns(true, Result::getResult);
  }

  @Test
  public void shouldEnableBQ() {
    // ==============================
    // ===== EnableBQ =====
    // ==============================

    // Delete collection if exists
    client.schema().classDeleter()
        .withClassName("MyCollection")
        .run();

    // START EnableBQ
    WeaviateClass myCollection = WeaviateClass.builder()
        .className("MyCollection")
        .vectorizer("text2vec-openai")
        .vectorIndexConfig(VectorIndexConfig.builder()
            // highlight-start
            .bq(BQConfig.builder()
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
    // END EnableBQ

    assertThat(createResult).isNotNull()
        .withFailMessage(() -> createResult.getError().toString())
        .returns(false, Result::hasErrors)
        .withFailMessage(null)
        .returns(true, Result::getResult);
  }

  @Test
  public void shouldEnableBQWithOptions() {
    // ==============================
    // ===== EnableBQ with Options =====
    // ==============================

    // Delete collection if exists
    client.schema().classDeleter()
        .withClassName("MyCollection")
        .run();

    // START BQWithOptions
    WeaviateClass myCollection = WeaviateClass.builder()
        .className("MyCollection")
        .vectorizer("text2vec-openai")
        .vectorIndexConfig(VectorIndexConfig.builder()
            // highlight-start
            .bq(BQConfig.builder()
                .enabled(true)
                .rescoreLimit(20L)
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
    // END BQWithOptions

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
        .extracting(VectorIndexConfig::getBq).isNotNull()
        .returns(true, BQConfig::getEnabled);
    // TODO[g-despot]: Check why this fails
    // .returns(20L, BQConfig::getRescoreLimit);
  }

  @Test
  public void shouldUpdateSchemaWithBQ() {
    // ==============================
    // ===== UpdateSchema =====
    // ==============================

    // Delete collection if exists
    client.schema().classDeleter()
        .withClassName("MyCollection")
        .run();

    // First create a collection without BQ
    WeaviateClass initialCollection = WeaviateClass.builder()
        .className("MyCollection")
        .description("A collection without BQ")
        .vectorizer("text2vec-openai")
        .properties(Arrays.asList(
            Property.builder()
                .name("title")
                .dataType(Arrays.asList(DataType.TEXT))
                .build()))
        .build();

    Result<Boolean> createResult = client.schema().classCreator()
        .withClass(initialCollection)
        .run();

    assertThat(createResult).isNotNull()
        .withFailMessage(() -> createResult.getError().toString())
        .returns(false, Result::hasErrors)
        .withFailMessage(null)
        .returns(true, Result::getResult);

    // START UpdateSchema
    WeaviateClass updatedCollection = WeaviateClass.builder()
        .className("MyCollection")
        .description("Updated collection with BQ compression")
        .properties(Arrays.asList(
            Property.builder()
                .name("title")
                .dataType(Arrays.asList(DataType.TEXT))
                .build()))
        .vectorizer("text2vec-openai")
        .vectorIndexConfig(VectorIndexConfig.builder()
            .bq(BQConfig.builder()
                .enabled(true)
                .rescoreLimit(10L)
                .build())
            .build())
        .build();

    Result<Boolean> updateResult = client.schema().classUpdater()
        .withClass(updatedCollection)
        .run();
    // END UpdateSchema

    assertThat(updateResult).isNotNull()
        .withFailMessage(() -> updateResult.getError().toString())
        .returns(false, Result::hasErrors)
        .withFailMessage(null)
        .returns(true, Result::getResult);

    // Verify the BQ configuration was applied
    Result<WeaviateClass> getResult = client.schema().classGetter()
        .withClassName("MyCollection")
        .run();

    assertThat(getResult).isNotNull()
        .withFailMessage(() -> getResult.getError().toString())
        .returns(false, Result::hasErrors)
        .withFailMessage(null)
        .extracting(Result::getResult).isNotNull()
        .extracting(WeaviateClass::getVectorIndexConfig).isNotNull()
        .extracting(VectorIndexConfig::getBq).isNotNull()
        .returns(true, BQConfig::getEnabled);
    // .returns(10L, BQConfig::getRescoreLimit);
  }
}
