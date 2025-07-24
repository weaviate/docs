package io.weaviate.docs;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.misc.model.RQConfig;
import io.weaviate.client.v1.misc.model.VectorIndexConfig;
import io.weaviate.client.v1.schema.model.DataType;
import io.weaviate.client.v1.schema.model.Property;
import io.weaviate.client.v1.schema.model.WeaviateClass;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("rq")
class RqCompressionTest {

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
  public void shouldEnableRQ() {
    // ==============================
    // ===== EnableRQ =====
    // ==============================

    // Delete collection if exists
    client.schema().classDeleter()
        .withClassName("MyCollection")
        .run();

    // START EnableRQ
    WeaviateClass myCollection = WeaviateClass.builder()
        .className("MyCollection")
        .vectorizer("text2vec-openai")
        .vectorIndexConfig(VectorIndexConfig.builder()
            // highlight-start
            .rq(RQConfig.builder()
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
    // END EnableRQ

    assertThat(createResult).isNotNull()
        .withFailMessage(() -> createResult.getError().toString())
        .returns(false, Result::hasErrors)
        .withFailMessage(null)
        .returns(true, Result::getResult);
  }

  @Test
  public void shouldEnableRQWithOptions() {
    // ==============================
    // ===== EnableRQ with Options =====
    // ==============================

    // Delete collection if exists
    client.schema().classDeleter()
        .withClassName("MyCollection")
        .run();

    // START RQWithOptions
    WeaviateClass myCollection = WeaviateClass.builder()
        .className("MyCollection")
        .vectorizer("text2vec-openai")
        .vectorIndexConfig(VectorIndexConfig.builder()
            // highlight-start
            .rq(RQConfig.builder()
                .enabled(true)
                .bits(8L) // Number of bits, only 8 is supported for now
                .rescoreLimit(10L)
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
    // END RQWithOptions

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
        .extracting(VectorIndexConfig::getRq).isNotNull()
        .returns(true, RQConfig::getEnabled)
        .returns(8L, RQConfig::getBits);
  }
}