// How-to: Manage-Data -> Classes
package io.weaviate.docs;

import io.weaviate.client6.Config;
import io.weaviate.client6.WeaviateClient;
import io.weaviate.client6.v1.collections.Property;
import io.weaviate.client6.v1.collections.Vectorizer;
import io.weaviate.client6.v1.collections.VectorIndex;
import io.weaviate.docs.helper.EnvHelper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

@Tag("crud")
@Tag("classes")
class ManageDataClassesTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    String scheme = EnvHelper.scheme("http");
    String host = EnvHelper.host("localhost");
    String port = EnvHelper.port("8080");

    Config config = new Config(scheme, host + ":" + port);
    client = new WeaviateClient(config);
  }

  @Test
  public void shouldManageDataClasses() {
    // START BasicCreateCollection // START DeleteCollection
    String collectionName = "Article";

    // END BasicCreateCollection // END DeleteCollection

    createCollection(collectionName);
    deleteCollection(collectionName);
  }

  private void createCollection(String collectionName) {
    // START BasicCreateCollection

    client.collections.create(collectionName, collectionConfig -> collectionConfig
        .properties(
            Property.text("propertyName1"), // Example text property
            Property.integer("integerPropertyName") // Example integer property
        )
        .references( // Optional: define a reference to another collection
            Property.reference("referencePropertyName", TARGET_COLLECTION_NAME))
        .vector( // Define vector index configuration
            new VectorIndex<>(
                VectorIndex.IndexingStrategy.hnsw(),
                Vectorizer.text2vecContextionary() // Or your chosen vectorizer
            )));
    // END BasicCreateCollection
  }

  private void deleteCollection(String collectionName) {
    // START DeleteCollection
    client.collections.delete(collectionName);
    // END DeleteCollection
  }
}
