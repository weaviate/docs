import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.alias.Alias;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class ManageCollectionsAliasTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws IOException {
    // START ConnectToWeaviate
    // Connect to local Weaviate instance
    client = WeaviateClient.connectToLocal();
    // END ConnectToWeaviate
    if (client.alias.list().stream().anyMatch(a -> a.alias().equals("ArticlesAlias")))
      client.alias.delete("ArticlesAlias");
    if (client.alias.list().stream().anyMatch(a -> a.alias().equals("ProductsAlias")))
      client.alias.delete("ProductsAlias");
    client.collections.delete("Articles");
    client.collections.delete("ArticlesV2");
    client.collections.delete("Products_v1");
    client.collections.delete("Products_v2");
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @AfterEach
  public void cleanup() throws IOException {
    // Cleanup collections and aliases after each test
    if (client.alias.list().stream().anyMatch(a -> a.alias().equals("ArticlesAlias")))
      client.alias.delete("ArticlesAlias");
    if (client.alias.list().stream().anyMatch(a -> a.alias().equals("ProductsAlias")))
      client.alias.delete("ProductsAlias");
    client.collections.delete("Articles");
    client.collections.delete("ArticlesV2");
    client.collections.delete("Products_v1");
    client.collections.delete("Products_v2");
  }

  @Test
  void testCreateAlias() throws IOException {
    // START CreateAlias
    // Create a collection first
    client.collections.create("Articles", col -> col.vectorConfig(VectorConfig.selfProvided())
        .properties(Property.text("title"), Property.text("content")));

    // Create an alias pointing to the collection
    client.alias.create("Articles", "ArticlesAlias");
    // END CreateAlias
  }

  @Test
  void testListAliases() throws IOException {
    client.collections.create("Articles");
    client.alias.create("Articles", "ArticlesAlias");

    // START ListAllAliases
    // Get all aliases in the instance
    List<Alias> allAliases = client.alias.list();

    for (Alias aliasInfo : allAliases) {
      System.out.printf("Alias: %s -> Collection: %s\n", aliasInfo.alias(), aliasInfo.collection());
    }
    // END ListAllAliases

    // START ListCollectionAliases
    // Get all aliases pointing to a specific collection
    List<Alias> collectionAliases = client.alias.list(a -> a.collection("Articles"));

    for (Alias aliasInfo : collectionAliases) {
      System.out.printf("Alias pointing to Articles: %s\n", aliasInfo.alias());
    }
    // END ListCollectionAliases
  }

  @Test
  void testGetAlias() throws IOException {
    client.collections.create("Articles");
    client.alias.create("Articles", "ArticlesAlias");

    // START GetAlias
    // Get information about a specific alias
    Optional<Alias> aliasInfoOpt = client.alias.get("ArticlesAlias");

    aliasInfoOpt.ifPresent(aliasInfo -> {
      System.out.printf("Alias: %s\n", aliasInfo.alias());
      System.out.printf("Target collection: %s\n", aliasInfo.collection());
    });
    // END GetAlias
  }

  // TODO[g-despot] Python alias creation returns bool
  @Test
  void testUpdateAlias() throws IOException {
    client.collections.create("Articles");
    client.alias.create("Articles", "ArticlesAlias");

    // START UpdateAlias
    // Create a new collection for migration
    client.collections.create("ArticlesV2", col -> col.vectorConfig(VectorConfig.selfProvided())
        .properties(Property.text("title"), Property.text("content"), Property.text("author") // New field
        ));

    // Update the alias to point to the new collection
    client.alias.update("ArticlesAlias", "ArticlesV2");
    // END UpdateAlias
  }

  @Test
  void testUseAlias() throws IOException {
    client.collections.create("Articles", col -> col.vectorConfig(VectorConfig.selfProvided())
        .properties(Property.text("title"), Property.text("content")));
    client.alias.create("Articles", "ArticlesAlias");

    // START UseAlias
    // Use the alias just like a collection name
    CollectionHandle<Map<String, Object>> articles = client.collections.use("ArticlesAlias");

    // Insert data using the alias
    articles.data.insert(Map.of("title", "Using Aliases in Weaviate", "content",
        "Aliases make collection management easier..."));

    // Query using the alias
    var results = articles.query.fetchObjects(q -> q.limit(5));

    for (var obj : results.objects()) {
      System.out.printf("Found: %s\n", obj.properties().get("title"));
    }
    // END UseAlias

    // START DeleteAlias
    // Delete an alias (the underlying collection remains)
    client.alias.delete("ArticlesAlias");
    // END DeleteAlias
  }

  // TODO[g-despot] Python fetchObjects(...) can be empty
  @Test
  void testMigrationWorkflow() throws IOException {
    // START Step1CreateOriginal
    // Create original collection with data
    client.collections.create("Products_v1", col -> col.vectorConfig(VectorConfig.selfProvided())
        .properties(Property.text("name"), Property.number("price")));

    var productsV1 = client.collections.use("Products_v1");
    productsV1.data.insertMany(Map.of("name", "Product A", "price", 100.0),
        Map.of("name", "Product B", "price", 200.0));
    // END Step1CreateOriginal

    // START Step2CreateAlias
    // Create alias pointing to current collection
    client.alias.create("Products_v1", "ProductsAlias");
    // END Step2CreateAlias

    // START MigrationUseAlias
    // Your application always uses the alias name
    CollectionHandle<Map<String, Object>> products = client.collections.use("ProductsAlias");

    // Insert data through the alias
    products.data.insert(Map.of("name", "Product C", "price", 300.0));

    // Query through the alias
    var results = products.query.fetchObjects(q -> q.limit(5));
    for (var obj : results.objects()) {
      System.out.printf("Product: %s, Price: $%.2f\n", obj.properties().get("name"),
          obj.properties().get("price"));
    }
    // END MigrationUseAlias

    // START Step3NewCollection
    // Create new collection with updated schema
    client.collections.create("Products_v2", col -> col.vectorConfig(VectorConfig.selfProvided())
        .properties(Property.text("name"), Property.number("price"), Property.text("category") // New field
        ));
    // END Step3NewCollection

    // START Step4MigrateData
    // Migrate data to new collection
    var productsV2 = client.collections.use("Products_v2");
    var oldData = productsV1.query.fetchObjects(c -> c.limit(10)).objects();

    List<Map<String, Object>> migratedObjects = new ArrayList<>();
    for (var obj : oldData) {
      migratedObjects.add(Map.of("name", obj.properties().get("name"), "price",
          obj.properties().get("price"), "category", "General" // Default value for new field
      ));
    }
    productsV2.data.insertMany(migratedObjects.toArray(new Map[0]));
    // END Step4MigrateData

    // START Step5UpdateAlias
    // Switch alias to new collection (instant switch!)
    client.alias.update("ProductsAlias", "Products_v2");

    // All queries using "Products" alias now use the new collection
    products = client.collections.use("ProductsAlias");
    var result = products.query.fetchObjects(q -> q.limit(1));
    System.out.println(result.objects().get(0).properties()); // Will include the new "category" field
    // END Step5UpdateAlias
    assertThat(result.objects().get(0).properties()).containsKey("category");

    // START Step6Cleanup
    // Clean up old collection after verification
    client.collections.delete("Products_v1");
    // END Step6Cleanup
  }
}
