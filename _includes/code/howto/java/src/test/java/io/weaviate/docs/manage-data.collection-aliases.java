package io.weaviate.docs;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.aliases.model.Alias;
import io.weaviate.client.v1.batch.model.ObjectGetResponse;
import io.weaviate.client.v1.data.model.WeaviateObject;
import io.weaviate.client.v1.graphql.model.GraphQLResponse;
import io.weaviate.client.v1.graphql.query.fields.Field;
import io.weaviate.client.v1.schema.model.DataType;
import io.weaviate.client.v1.schema.model.Property;
import io.weaviate.client.v1.schema.model.WeaviateClass;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("aliases")
class AliasesTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() {
    // START ConnectToWeaviate
    // Connect to local Weaviate instance
    String scheme = "http";
    String host = "localhost";
    String port = "8080";

    Config config = new Config(scheme, host + ":" + port);
    client = new WeaviateClient(config);
    // END ConnectToWeaviate
  }

  @BeforeEach
  public void cleanup() {
    // Cleanup
    client.alias().deleter().withAlias("ArticlesProd").run();
    client.alias().deleter().withAlias("MyArticles").run();
    client.alias().deleter().withAlias("Products").run();
    client.schema().classDeleter().withClassName("Articles").run();
    client.schema().classDeleter().withClassName("ArticlesV2").run();
    client.schema().classDeleter().withClassName("Products_v1").run();
    client.schema().classDeleter().withClassName("Products_v2").run();
  }

  @Test
  public void shouldCreateAlias() {
    // START CreateAlias
    // Create a collection first
    WeaviateClass articlesClass = WeaviateClass.builder()
        .className("Articles")
        .properties(Arrays.asList(
            Property.builder()
                .name("title")
                .dataType(Arrays.asList(DataType.TEXT))
                .build(),
            Property.builder()
                .name("content")
                .dataType(Arrays.asList(DataType.TEXT))
                .build()))
        .build();

    Result<Boolean> createResult = client.schema().classCreator()
        .withClass(articlesClass)
        .run();

    // Create an alias pointing to the collection
    Result<Boolean> aliasResult = client.alias().creator()
        .withClassName("Articles")
        .withAlias("ArticlesProd")
        .run();
    // END CreateAlias

    assertThat(createResult).isNotNull()
        .returns(true, Result::getResult);
    assertThat(aliasResult).isNotNull()
        .returns(true, Result::getResult);
  }

  @Test
  public void shouldListAllAliases() {
    // Setup
    createArticlesCollection();
    client.alias().creator().withClassName("Articles").withAlias("ArticlesProd").run();

    // START ListAllAliases
    // Get all aliases in the instance
    Result<Map<String, Alias>> allAliasesResult = client.alias().allGetter().run();
    Map<String, Alias> allAliases = allAliasesResult.getResult();

    for (Map.Entry<String, Alias> entry : allAliases.entrySet()) {
      Alias aliasInfo = entry.getValue();
      System.out.println("Alias: " + aliasInfo.getAlias() +
          " -> Collection: " + aliasInfo.getClassName());
    }
    // END ListAllAliases

    assertThat(allAliasesResult).isNotNull()
        .returns(false, Result::hasErrors);
    assertThat(allAliases).containsKey("ArticlesProd");
  }

  @Test
  public void shouldListCollectionAliases() {
    // Setup
    createArticlesCollection();
    client.alias().creator().withClassName("Articles").withAlias("ArticlesProd").run();
    client.alias().creator().withClassName("Articles").withAlias("MyArticles").run();

    // START ListCollectionAliases
    // Get all aliases pointing to a specific collection
    Result<Map<String, Alias>> collectionAliasesResult = client.alias()
        .allGetter()
        .withClassName("Articles")
        .run();
    Map<String, Alias> collectionAliases = collectionAliasesResult.getResult();

    for (Map.Entry<String, Alias> entry : collectionAliases.entrySet()) {
      Alias aliasInfo = entry.getValue();
      System.out.println("Alias pointing to Articles: " + aliasInfo.getAlias());
    }
    // END ListCollectionAliases

    assertThat(collectionAliasesResult).isNotNull()
        .returns(false, Result::hasErrors);
    assertThat(collectionAliases).hasSize(2);
  }

  @Test
  public void shouldGetAlias() {
    // Setup
    createArticlesCollection();
    client.alias().creator().withClassName("Articles").withAlias("ArticlesProd").run();

    // START GetAlias
    // Get information about a specific alias
    Result<Alias> aliasInfoResult = client.alias()
        .getter()
        .withAlias("ArticlesProd")
        .run();

    if (aliasInfoResult.getResult() != null) {
      Alias aliasInfo = aliasInfoResult.getResult();
      System.out.println("Alias: " + aliasInfo.getAlias());
      System.out.println("Target collection: " + aliasInfo.getClassName());
    }
    // END GetAlias

    assertThat(aliasInfoResult).isNotNull()
        .returns(false, Result::hasErrors);
    assertThat(aliasInfoResult.getResult())
        .returns("ArticlesProd", Alias::getAlias)
        .returns("Articles", Alias::getClassName);
  }

  @Test
  public void shouldUpdateAlias() {
    // Setup
    createArticlesCollection();
    client.alias().creator().withClassName("Articles").withAlias("ArticlesProd").run();

    // START UpdateAlias
    // Create a new collection for migration
    WeaviateClass articlesV2Class = WeaviateClass.builder()
        .className("ArticlesV2")
        .properties(Arrays.asList(
            Property.builder()
                .name("title")
                .dataType(Arrays.asList(DataType.TEXT))
                .build(),
            Property.builder()
                .name("content")
                .dataType(Arrays.asList(DataType.TEXT))
                .build(),
            Property.builder()
                .name("author")
                .dataType(Arrays.asList(DataType.TEXT))
                .build() // New field
        ))
        .build();

    client.schema().classCreator()
        .withClass(articlesV2Class)
        .run();

    // Update the alias to point to the new collection
    Result<Boolean> updateResult = client.alias()
        .updater()
        .withAlias("ArticlesProd")
        .withNewClassName("ArticlesV2")
        .run();

    if (updateResult.getResult()) {
      System.out.println("Alias updated successfully");
    }
    // END UpdateAlias

    assertThat(updateResult).isNotNull()
        .returns(true, Result::getResult);
  }

  @Test
  public void shouldUseAlias() {
    // START UseAlias
    // Ensure the Articles collection exists
    WeaviateClass articlesClass = WeaviateClass.builder()
        .className("Articles")
        .properties(Arrays.asList(
            Property.builder()
                .name("title")
                .dataType(Arrays.asList(DataType.TEXT))
                .build(),
            Property.builder()
                .name("content")
                .dataType(Arrays.asList(DataType.TEXT))
                .build()))
        .build();

    client.schema().classCreator()
        .withClass(articlesClass)
        .run();

    // Create an alias for easier access
    client.alias().creator()
        .withClassName("Articles")
        .withAlias("MyArticles")
        .run();

    // Use the alias just like a collection name
    // Insert data using the alias
    WeaviateObject article = WeaviateObject.builder()
        .className("MyArticles") // Using alias instead of actual class name
        .properties(new HashMap<String, Object>() {
          {
            put("title", "Using Aliases in Weaviate");
            put("content", "Aliases make collection management easier...");
          }
        })
        .build();

    Result<ObjectGetResponse[]> insertResult = client.batch()
        .objectsBatcher()
        .withObject(article)
        .run();

    // Query using the alias
    Result<GraphQLResponse> queryResult = client.graphQL()
        .get()
        .withClassName("MyArticles") // Using alias
        .withFields(Field.builder().name("title").build())
        .withLimit(5)
        .run();

    if (queryResult.getResult() != null) {
      Map<String, Object> data = (Map<String, Object>) queryResult.getResult().getData();
      Map<String, Object> get = (Map<String, Object>) data.get("Get");
      List<Map<String, Object>> myArticles = (List<Map<String, Object>>) get.get("MyArticles");

      for (Map<String, Object> obj : myArticles) {
        System.out.println("Found: " + obj.get("title"));
      }
    }
    // END UseAlias

    assertThat(insertResult).isNotNull()
        .returns(false, Result::hasErrors);
    assertThat(queryResult).isNotNull()
        .returns(false, Result::hasErrors);
  }

  @Test
  public void shouldDeleteAlias() {
    // Setup
    createArticlesCollection();
    client.alias().creator().withClassName("Articles").withAlias("ArticlesProd").run();

    // START DeleteAlias
    // Delete an alias (the underlying collection remains)
    Result<Boolean> deleteResult = client.alias()
        .deleter()
        .withAlias("ArticlesProd")
        .run();
    // END DeleteAlias

    assertThat(deleteResult).isNotNull()
        .returns(false, Result::hasErrors)
        .returns(true, Result::getResult);
  }

  @Test
  public void shouldPerformMigration() {
    // START Step1CreateOriginal
    // Create original collection with data
    WeaviateClass productsV1 = WeaviateClass.builder()
        .className("Products_v1")
        .build();

    client.schema().classCreator()
        .withClass(productsV1)
        .run();

    // Insert data into v1
    List<WeaviateObject> products = Arrays.asList(
        WeaviateObject.builder()
            .className("Products_v1")
            .properties(new HashMap<String, Object>() {
              {
                put("name", "Product A");
                put("price", 100);
              }
            })
            .build(),
        WeaviateObject.builder()
            .className("Products_v1")
            .properties(new HashMap<String, Object>() {
              {
                put("name", "Product B");
                put("price", 200);
              }
            })
            .build());

    client.batch().objectsBatcher()
        .withObjects(products.toArray(new WeaviateObject[0]))
        .run();
    // END Step1CreateOriginal

    // START Step2CreateAlias
    // Create alias pointing to current collection
    client.alias().creator()
        .withClassName("Products_v1")
        .withAlias("Products")
        .run();
    // END Step2CreateAlias

    // START MigrationUseAlias
    // Your application always uses the alias name "Products"
    // Insert data through the alias
    Result<WeaviateObject> insertResult = client.data().creator()
        .withClassName("Products")
        .withProperties(new HashMap<String, Object>() {{
            put("name", "Product C");
            put("price", 300);
        }})
        .run();

    // Query through the alias
    Result<List<WeaviateObject>> queryResult = client.data().objectsGetter()
        .withClassName("Products")
        .withLimit(5)
        .run();
    List<WeaviateObject> results = queryResult.getResult();
    for (WeaviateObject obj : results) {
        Map<String, Object> props = obj.getProperties();
        System.out.println("Product: " + props.get("name") + ", Price: $" + props.get("price"));
    }
    // END MigrationUseAlias

    // START Step3NewCollection
    // Create new collection with updated schema
    WeaviateClass productsV2 = WeaviateClass.builder()
        .className("Products_v2")
        .properties(Arrays.asList(
            Property.builder()
                .name("name")
                .dataType(Arrays.asList(DataType.TEXT))
                .build(),
            Property.builder()
                .name("price")
                .dataType(Arrays.asList(DataType.NUMBER))
                .build(),
            Property.builder()
                .name("category")
                .dataType(Arrays.asList(DataType.TEXT))
                .build() // New field
        ))
        .build();

    client.schema().classCreator()
        .withClass(productsV2)
        .run();
    // END Step3NewCollection

    // START Step4MigrateData
    // Migrate data to new collection
    Result<GraphQLResponse> oldDataResult = client.graphQL()
        .get()
        .withClassName("Products_v1")
        .withFields(
            Field.builder().name("name").build(),
            Field.builder().name("price").build(),
            Field.builder().name("_additional").fields(
                Field.builder().name("id").build()).build())
        .run();

    if (oldDataResult.getResult() != null) {
      Map<String, Object> data = (Map<String, Object>) oldDataResult.getResult().getData();
      Map<String, Object> get = (Map<String, Object>) data.get("Get");
      List<Map<String, Object>> oldProducts = (List<Map<String, Object>>) get.get("Products_v1");

      List<WeaviateObject> newProducts = new java.util.ArrayList<>();
      for (Map<String, Object> obj : oldProducts) {
        WeaviateObject newProduct = WeaviateObject.builder()
            .className("Products_v2")
            .properties(new HashMap<String, Object>() {
              {
                put("name", obj.get("name"));
                put("price", obj.get("price"));
                put("category", "General"); // Default value for new field
              }
            })
            .build();
        newProducts.add(newProduct);
      }

      client.batch().objectsBatcher()
          .withObjects(newProducts.toArray(new WeaviateObject[0]))
          .run();
    }
    // END Step4MigrateData

    // START Step5UpdateAlias
    // Switch alias to new collection (instant switch!)
    client.alias().updater()
        .withAlias("Products")
        .withNewClassName("Products_v2")
        .run();

    // All queries using "Products" alias now use the new collection
    Result<GraphQLResponse> result = client.graphQL()
        .get()
        .withClassName("Products") // Using alias
        .withFields(
            Field.builder().name("name").build(),
            Field.builder().name("price").build(),
            Field.builder().name("category").build())
        .withLimit(1)
        .run();

    if (result.getResult() != null) {
      Map<String, Object> data = (Map<String, Object>) result.getResult().getData();
      Map<String, Object> get = (Map<String, Object>) data.get("Get");
      List<Map<String, Object>> products_data = (List<Map<String, Object>>) get.get("Products");
      System.out.println(products_data.get(0)); // Will include the new "category" field
    }
    // END Step5UpdateAlias

    // START Step6Cleanup
    // Clean up old collection after verification
    client.schema().classDeleter()
        .withClassName("Products_v1")
        .run();
    // END Step6Cleanup

    assertThat(result).isNotNull()
        .returns(false, Result::hasErrors);
  }

  private void createArticlesCollection() {
    WeaviateClass articlesClass = WeaviateClass.builder()
        .className("Articles")
        .properties(Arrays.asList(
            Property.builder()
                .name("title")
                .dataType(Arrays.asList(DataType.TEXT))
                .build(),
            Property.builder()
                .name("content")
                .dataType(Arrays.asList(DataType.TEXT))
                .build()))
        .build();

    client.schema().classCreator()
        .withClass(articlesClass)
        .run();
  }
}
