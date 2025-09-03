import weaviate
import weaviate.classes as wvc

# START ConnectToWeaviate
# Connect to local Weaviate instance
client = weaviate.connect_to_local()
# END ConnectToWeaviate

# Cleanup
print("deleted:", client.alias.delete(alias_name="ArticlesAlias"))
client.alias.delete(alias_name="ProductsAlias")
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
client.alias.create(alias_name="ArticlesAlias", target_collection="Articles")
# END CreateAlias

# START ListAllAliases
# Get all aliases in the instance
all_aliases = client.alias.list_all()

for alias_name, alias_info in all_aliases.items():
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
alias_info = client.alias.get(alias_name="ArticlesAlias")

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
    alias_name="ArticlesAlias", new_target_collection="ArticlesV2"
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
# START DeleteAlias
# Delete an alias (the underlying collection remains)
client.alias.delete(alias_name="ArticlesAlias")
# END DeleteAlias
# START UseAlias
# Use the alias just like a collection name
articles = client.collections.use("ArticlesAlias")

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
# END UseAlias

# START Step1CreateOriginal
# Create original collection with data
client.collections.create(
    name="Products_v1", vector_config=wvc.config.Configure.Vectors.self_provided()
)

products_v1 = client.collections.use("Products_v1")
products_v1.data.insert_many(
    [{"name": "Product A", "price": 100}, {"name": "Product B", "price": 200}]
)
# END Step1CreateOriginal

# START Step2CreateAlias
# Create alias pointing to current collection
client.alias.create(alias_name="ProductsAlias", target_collection="Products_v1")
# END Step2CreateAlias

# START MigrationUseAlias
# Your application always uses the alias name "Products"
products = client.collections.use("ProductsAlias")

# Insert data through the alias
products.data.insert({"name": "Product C", "price": 300})

# Query through the alias
results = products.query.fetch_objects(limit=5)
for obj in results.objects:
    print(f"Product: {obj.properties['name']}, Price: ${obj.properties['price']}")
# END MigrationUseAlias

# START Step3NewCollection
# Create new collection with updated schema
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
# END Step3NewCollection

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
# END Step4MigrateData

# START Step5UpdateAlias
# Switch alias to new collection (instant switch!)
client.alias.update(alias_name="ProductsAlias", new_target_collection="Products_v2")

# All queries using "Products" alias now use the new collection
products = client.collections.use("ProductsAlias")
result = products.query.fetch_objects(limit=1)
print(result.objects[0].properties)  # Will include the new "category" field
# END Step5UpdateAlias

# START Step6Cleanup
# Clean up old collection after verification
client.collections.delete("Products_v1")
# END Step6Cleanup


# Cleanup
client.alias.delete(alias_name="ProductsAlias")
client.alias.delete(alias_name="ArticlesAlias")
client.collections.delete("Articles")
client.collections.delete("ArticlesV2")
client.collections.delete("Products_v1")
client.collections.delete("Products_v2")

client.close()
