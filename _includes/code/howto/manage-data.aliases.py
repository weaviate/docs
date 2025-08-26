import weaviate
import weaviate.classes as wvc

# Connect to Weaviate
client = weaviate.connect_to_local()

# Cleanup
client.alias.delete(alias_name="ArticlesProd")
client.alias.delete(alias_name="MyArticles")
client.alias.delete(alias_name="Products")
client.collections.delete("Articles")
client.collections.delete("ArticlesV2")
client.collections.delete("Products_v1")
client.collections.delete("Products_v2")

# START CreateAlias
# Create a collection first
client.collections.create(
    name="Articles",
    vector_config=wvc.config.Configure.Vectors.self_provided(),
    properties=[
        wvc.config.Property(name="title", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="content", data_type=wvc.config.DataType.TEXT),
    ],
)

# Create an alias pointing to the collection
client.alias.create(alias_name="ArticlesProd", target_collection="Articles")
# END CreateAlias

# START ListAllAliases
# Get all aliases in the instance
all_aliases = client.alias.list_all()

# Filter to show only aliases from this example
for alias_name, alias_info in all_aliases.items():
    if alias_info.collection in ["Articles", "ArticlesV2"]:
        print(f"Alias: {alias_info.alias} -> Collection: {alias_info.collection}")
# END ListAllAliases

# START ListCollectionAliases
# Get all aliases pointing to a specific collection
collection_aliases = client.alias.list_all(collection="Articles")

for alias_name, alias_info in collection_aliases.items():
    print(f"Alias pointing to Articles: {alias_info.alias}")
# END ListCollectionAliases

# START GetAlias
# Get information about a specific alias
alias_info = client.alias.get(alias_name="ArticlesProd")

if alias_info:
    print(f"Alias: {alias_info.alias}")
    print(f"Target collection: {alias_info.collection}")
# END GetAlias

# START UpdateAlias
# Create a new collection for migration
client.collections.create(
    name="ArticlesV2",
    vector_config=wvc.config.Configure.Vectors.self_provided(),
    properties=[
        wvc.config.Property(name="title", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="content", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(
            name="author", data_type=wvc.config.DataType.TEXT
        ),  # New field
    ],
)

# Update the alias to point to the new collection
success = client.alias.update(
    alias_name="ArticlesProd", new_target_collection="ArticlesV2"
)

if success:
    print("Alias updated successfully")
# END UpdateAlias

client.collections.delete("Articles")

# START UseAlias
# Ensure the Articles collection exists (it might have been deleted in previous examples)

client.collections.create(
    name="Articles",
    vector_config=wvc.config.Configure.Vectors.self_provided(),
    properties=[
        wvc.config.Property(name="title", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="content", data_type=wvc.config.DataType.TEXT),
    ],
)
# END UseAlias
# Delete alias if it exists from a previous run
client.alias.delete(alias_name="MyArticles")

# START DeleteAlias
# Delete an alias (the underlying collection remains)
client.alias.delete(alias_name="ArticlesProd")
# END DeleteAlias
# START UseAlias
# Create an alias for easier access
client.alias.create(alias_name="MyArticles", target_collection="Articles")

# Use the alias just like a collection name
articles = client.collections.use("MyArticles")

# Insert data using the alias
articles.data.insert(
    {
        "title": "Using Aliases in Weaviate",
        "content": "Aliases make collection management easier...",
    }
)

# Query using the alias
results = articles.query.fetch_objects(limit=5)

for obj in results.objects:
    print(f"Found: {obj.properties['title']}")

# Add a new property using the alias
articles.config.add_property(
    wvc.config.Property(name="author", data_type=wvc.config.DataType.TEXT)
)
# END UseAlias

# START MigrationExample
# Step 1: Create original collection with data
client.collections.create(
    name="Products_v1", vector_config=wvc.config.Configure.Vectors.self_provided()
)

products_v1 = client.collections.use("Products_v1")
products_v1.data.insert_many(
    [{"name": "Product A", "price": 100}, {"name": "Product B", "price": 200}]
)

# Step 2: Create alias pointing to current collection
client.alias.create(alias_name="Products", target_collection="Products_v1")

# Step 3: Create new collection with updated schema
client.collections.create(
    name="Products_v2",
    vector_config=wvc.config.Configure.Vectors.self_provided(),
    properties=[
        wvc.config.Property(name="name", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="price", data_type=wvc.config.DataType.NUMBER),
        wvc.config.Property(
            name="category", data_type=wvc.config.DataType.TEXT
        ),  # New field
    ],
)

# Step 4: Migrate data to new collection
products_v2 = client.collections.use("Products_v2")
old_data = products_v1.query.fetch_objects().objects

for obj in old_data:
    products_v2.data.insert(
        {
            "name": obj.properties["name"],
            "price": obj.properties["price"],
            "category": "General",  # Default value for new field
        }
    )

# Step 5: Switch alias to new collection (instant switch!)
client.alias.update(alias_name="Products", new_target_collection="Products_v2")

# All queries using "Products" alias now use the new collection
products = client.collections.use("Products")
result = products.query.fetch_objects(limit=1)
print(result.objects[0].properties)  # Will include the new "category" field

# Step 6: Clean up old collection after verification
client.collections.delete("Products_v1")
# END MigrationExample


# Cleanup
client.alias.delete(alias_name="MyArticles")
client.alias.delete(alias_name="Products")
client.alias.delete(alias_name="ArticlesProd")
client.collections.delete("Articles")
client.collections.delete("ArticlesV2")
client.collections.delete("Products_v1")
client.collections.delete("Products_v2")

client.close()
