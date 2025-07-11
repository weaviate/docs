// How-to: Manage-Data -> Classes
package io.weaviate.docs;

import io.weaviate.client6.WeaviateClient;
// START CreateCollectionWithProperties // START CrossRefDefinition
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.Vectorizers;

// END CreateCollectionWithProperties // END CrossRefDefinition
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
    String httpHost = "localhost";
    int httpPort = 8080;

    return WeaviateClient.local(conn -> conn.host(httpHost).httpPort(httpPort));
  }

  @Test
  public void shouldManageDataClasses() {
    // START CrossRefDefinition
    String targetCollectionName = "Article";
    // END CrossRefDefinition
    // START BasicCreateCollection // START CreateCollectionWithProperties // START
    // DeleteCollection
    String collectionName = "Article";

    // END BasicCreateCollection // END CreateCollectionWithProperties // END
    // DeleteCollection

    createCollection(collectionName);
    createCollectionWithProperties(collectionName);
    createCollectionWithReferences(collectionName, targetCollectionName);
    deleteCollection(collectionName);
  }

  private void createCollection(String collectionName) {
    // START BasicCreateCollection
    client.collections.create(collectionName);
    // END BasicCreateCollection
  }

  private void createCollectionWithProperties(String collectionName) {
    // START CreateCollectionWithProperties
    client.collections.create(collectionName, collection -> collection
        .properties(
            Property.text("textProperty"))
        // other types of properties
        .vectors(
            Vectorizers.text2vecWeaviate("someVector",
                t2v -> t2v.vectorizeCollectionName(true))));
    // END CreateCollectionWithProperties
  }

  private void createCollectionWithReferences(String collectionName, String targetCollectionName) {
    // START CrossRefDefinition
    client.collections.create(collectionName, collectionConfig -> collectionConfig
        .properties(
            Property.text("propertyName1"))
        .references( // Define a reference to another collection
            Property.reference("referencePropertyName", targetCollectionName))
        .vector(
            new VectorIndex<>(
                VectorIndex.IndexingStrategy.hnsw(),
                Vectorizer.text2vecContextionary())));
    // END CrossRefDefinition
  }

  private void deleteCollection(String collectionName) {
    // START DeleteCollection
    client.collections.delete(collectionName);
    // END DeleteCollection
  }
}
