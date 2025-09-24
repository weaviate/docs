# START ImportEcommerceData
from datasets import load_dataset


def load_ecommerce_data():
    """
    Load the Weaviate ECommerce dataset from Hugging Face.
    This dataset contains clothing items with pre-computed vectors.
    """
    # Load the dataset from Hugging Face
    dataset = load_dataset(
        "weaviate/agents", "query-agent-ecommerce", split="train", streaming=True
    )

    # Convert to list for easier handling
    # Note: Limited to 100 items for demo purposes
    # In production, process the full dataset or use batching
    ecommerce_data = []
    for i, item in enumerate(dataset):
        if i >= 100:  # Limit for demo - remove this for full dataset
            break
        ecommerce_data.append(
            {"properties": item["properties"], "vector": item["vector"]}
        )

    return ecommerce_data


# Load the data once for use in examples
ecommerce_data = load_ecommerce_data()
print(f"Loaded {len(ecommerce_data)} items from ECommerce dataset")
# END ImportEcommerceData

# ============================================
# SHARED SETUP: STEPS 1-4
# ============================================

# START Method1Connect
# Connect to Weaviate Cloud
import os
import weaviate
from weaviate.auth import Auth

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_credentials=Auth.api_key(weaviate_api_key),
)

print(client.is_ready())  # Should print: `True`
# END Method1Connect

client.collections.delete("ECommerceProducts")  # Clean up if exists

# START Method1CreateCollection
from weaviate.classes.config import Configure, DataType, Property

# Create collection with original vector configuration
products = client.collections.create(
    name="ECommerceProducts",
    vector_config=[
        Configure.Vectors.self_provided(
            name="original_vector",  # Name for existing vectors
        )
    ],
    properties=[
        Property(name="collection", data_type=DataType.TEXT),
        Property(name="category", data_type=DataType.TEXT),
        Property(name="tags", data_type=DataType.TEXT_ARRAY),
        Property(name="subcategory", data_type=DataType.TEXT),
        Property(name="name", data_type=DataType.TEXT),
        Property(name="description", data_type=DataType.TEXT),
        Property(name="brand", data_type=DataType.TEXT),
        Property(name="product_id", data_type=DataType.UUID),
        Property(name="colors", data_type=DataType.TEXT_ARRAY),
        Property(name="reviews", data_type=DataType.TEXT_ARRAY),
        Property(name="image_url", data_type=DataType.TEXT),
        Property(name="price", data_type=DataType.NUMBER),
    ],
)
# END Method1CreateCollection

# START Method1ImportData
# Import data with existing vectors
products = client.collections.use("ECommerceProducts")

with products.batch.fixed_size(batch_size=200) as batch:
    for item in ecommerce_data:
        batch.add_object(
            properties=item["properties"],
            vector={"original_vector": item["vector"]},  # Use existing vectors
        )

failed_objects = products.batch.failed_objects
if failed_objects:
    print(f"Number of failed imports: {len(failed_objects)}")
else:
    print(f"Successfully imported {len(ecommerce_data)} products with original vectors")
# END Method1ImportData

# START Method1QueryOriginal
# Query using original vectors
products = client.collections.use("ECommerceProducts")

# Use a vector from one of our items as a query vector
# In production, this would be from your query encoder
query_text = "comfortable athletic wear"
# For demo: use the first item's vector as a query vector
query_vector = ecommerce_data[0]["vector"]

results = products.query.near_vector(
    near_vector=query_vector,
    target_vector="original_vector",  # Specify which vector to search
    limit=3,
    return_properties=["name", "description", "price", "category"],
)

print("Search results with original vectors:")
for obj in results.objects:
    print(
        f"- {obj.properties['name']} ({obj.properties['category']}): ${obj.properties['price']}"
    )
# END Method1QueryOriginal

# ============================================
# METHOD 1: NAMED VECTORS MIGRATION
# ============================================

# START Method1AddNewVector
# Add a new named vector with Weaviate Embeddings
from weaviate.classes.config import Configure

# Add new vector configuration to existing collection
products.config.add_vector(
    vector_config=Configure.Vectors.text2vec_weaviate(  # Add new Weaviate Embeddings vector
        name="new_vector",
        source_properties=["name", "description"],  # Properties to vectorize
    ),
)

print("Added new Weaviate Embeddings vector to collection")
# END Method1AddNewVector

# START Method1TriggerVectorization
# Update all objects to trigger vectorization with new vectorizer
products = client.collections.use("ECommerceProducts")

# Fetch all objects
all_objects = products.query.fetch_objects(limit=10000).objects

# Update each object to trigger vectorization
# We're not changing any properties, just triggering the update
update_count = 0
for obj in all_objects:
    # Update with a minimal property change to trigger vectorization
    products.data.update(
        uuid=obj.uuid,
        properties={
            "name": obj.properties["name"],  # Same value
        },
    )
    update_count += 1

print(f"Triggered vectorization for {update_count} objects")
# END Method1TriggerVectorization

# START Method1QueryNewVector
# Query using the new Weaviate Embeddings vector
products = client.collections.use("ECommerceProducts")

# Now we can use text search with the new vector
results = products.query.near_text(
    query="comfortable athletic wear",
    target_vector="new_vector",  # Use the new vector
    limit=3,
    return_properties=["name", "description", "price", "category"],
)

print("\nSearch results with Weaviate Embeddings:")
for obj in results.objects:
    print(
        f"- {obj.properties['name']} ({obj.properties['category']}): ${obj.properties['price']}"
    )

# You can still query with the original vector
# Use the first item's vector as query
query_vector = ecommerce_data[0]["vector"]
results_original = products.query.near_vector(
    near_vector=query_vector,
    target_vector="original_vector",
    limit=3,
    return_properties=["name", "category"],
)

print("\nComparison - Original vectors still work:")
for obj in results_original.objects:
    print(f"- {obj.properties['name']} ({obj.properties['category']})")
# END Method1QueryNewVector

# ============================================
# METHOD 2: COLLECTION ALIASES MIGRATION
# ============================================

# For Method 2, we start with the same collection from Steps 1-4
client.alias.delete(alias_name="ECommerceProduction")  # Clean up if exists

# START Method2CreateAlias
# Create an alias pointing to the current production collection
client.alias.create(
    alias_name="ECommerceProduction", target_collection="ECommerceProducts"
)
# END Method2CreateAlias

# START Method2QueryAlias
# Your application always uses the alias name
products = client.collections.use("ECommerceProduction")

# Query using the alias (currently points to ECommerceProducts)
# Use a vector from our dataset as query
query_vector = ecommerce_data[0]["vector"]

results = products.query.near_vector(
    near_vector=query_vector,
    target_vector=["original_vector"],
    limit=3,
    return_properties=["name", "price"],
)

print("Query results via alias:")
for obj in results.objects:
    print(f"{obj.properties['name']}: ${obj.properties['price']}")
# END Method2QueryAlias

# START Method2CreateNew
from weaviate.classes.config import Configure, DataType, Property

# Create new collection with Weaviate Embeddings vectorizer
client.collections.delete("ECommerce_v2")  # Clean up if exists

products_v2 = client.collections.create(
    name="ECommerce_v2",
    vector_config=Configure.Vectors.text2vec_weaviate(
        name="new_vector",
        source_properties=["name", "description"],  # Properties to vectorize
    ),
    properties=[
        Property(name="collection", data_type=DataType.TEXT),
        Property(name="category", data_type=DataType.TEXT),
        Property(name="tags", data_type=DataType.TEXT_ARRAY),
        Property(name="subcategory", data_type=DataType.TEXT),
        Property(name="name", data_type=DataType.TEXT),
        Property(name="description", data_type=DataType.TEXT),
        Property(name="brand", data_type=DataType.TEXT),
        Property(name="product_id", data_type=DataType.UUID),
        Property(name="colors", data_type=DataType.TEXT_ARRAY),
        Property(name="reviews", data_type=DataType.TEXT_ARRAY),
        Property(name="image_url", data_type=DataType.TEXT),
        Property(name="price", data_type=DataType.NUMBER),
    ],
)

print("Created ECommerce_v2 with Weaviate Embeddings")
# END Method2CreateNew

# START Method2MigrateData
# Migrate data to new collection (vectors will be auto-generated)
products_v1 = client.collections.use("ECommerceProducts")
products_v2 = client.collections.use("ECommerce_v2")

# Fetch all data from v1
all_products = products_v1.query.fetch_objects(limit=10000).objects

# Import to v2 (without vectors - they'll be auto-generated)
with products_v2.batch.fixed_size(batch_size=200) as batch:
    for obj in all_products:
        batch.add_object(
            properties=obj.properties
            # No vector provided - Weaviate Embeddings will generate it
        )

failed_objects = products_v2.batch.failed_objects
if failed_objects:
    print(f"Number of failed migrations: {len(failed_objects)}")
else:
    print(f"Migrated {len(all_products)} products to ECommerce_v2")
# END Method2MigrateData

# START Method2SwitchAlias
# Switch the alias to the new collection (instant switch!)
client.alias.update(
    alias_name="ECommerceProduction", new_target_collection="ECommerce_v2"
)

print("Switched alias 'ECommerceProduction' -> 'ECommerce_v2'")

# Now queries using the alias automatically use the new collection
products = client.collections.use("ECommerceProduction")

# Can now use text search (wasn't possible with self-provided vectors)
results = products.query.near_text(
    query="comfortable athletic wear",
    target_vector="new_vector",
    limit=3,
    return_properties=["name", "price", "category"],
)

print("\nQuery results after switch (now using Weaviate Embeddings):")
for obj in results.objects:
    print(
        f"- {obj.properties['name']} ({obj.properties['category']}): ${obj.properties['price']}"
    )
# END Method2SwitchAlias

# Cleanup
client.close()
