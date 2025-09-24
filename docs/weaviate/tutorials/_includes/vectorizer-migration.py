import os
import weaviate
import weaviate.classes as wvc
from weaviate.auth import Auth
from weaviate.classes.config import Configure
import time
from typing import List, Dict, Any
from datasets import load_dataset

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

# START Method1CreateCollection
# Create collection with original vector configuration
client.collections.delete("ECommerceProducts")  # Clean up if exists

products = client.collections.create(
    name="ECommerceProducts",
    vector_config=[
        Configure.Vectors.self_provided(
            name="original_vector",  # Name for existing vectors
            vector_dimensions=768,  # Dimension of the HuggingFace embeddings
        )
    ],
    properties=[
        wvc.config.Property(name="collection", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="category", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="tags", data_type=wvc.config.DataType.TEXT_ARRAY),
        wvc.config.Property(name="subcategory", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="name", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="description", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="brand", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="product_id", data_type=wvc.config.DataType.UUID),
        wvc.config.Property(name="colors", data_type=wvc.config.DataType.TEXT_ARRAY),
        wvc.config.Property(name="reviews", data_type=wvc.config.DataType.TEXT_ARRAY),
        wvc.config.Property(name="image_url", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="price", data_type=wvc.config.DataType.NUMBER),
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
from weaviate.classes.config import Reconfigure

# Add new vector configuration to existing collection
products.config.add_vector(
    vector_config=Configure.Vectors.text2vec_weaviate(  # Add new Weaviate Embeddings vector
        name="weaviate_vector",
        dimensions=768,  # Weaviate Embeddings dimension
        source_properties=["name", "description"],  # Properties to vectorize
        model_name="snowflake-arctic-embed-xs",  # Or another Weaviate model
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

    # Optional: Add delay to avoid rate limiting
    if update_count % 100 == 0:
        print(f"Updated {update_count} objects...")
        time.sleep(0.1)

print(f"Triggered vectorization for {update_count} objects")
# END Method1TriggerVectorization

# START Method1QueryNewVector
# Query using the new Weaviate Embeddings vector
products = client.collections.use("ECommerceProducts")

# Now we can use text search with the new vector
results = products.query.near_text(
    query="comfortable athletic wear",
    target_vector="weaviate_vector",  # Use the new vector
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
# but rename it to v1 for clarity

# START Method2CreateOriginal
# Rename/recreate as v1 for clarity in the alias method
client.collections.delete("ECommerce_v1")  # Clean up if exists

products_v1 = client.collections.create(
    name="ECommerce_v1",
    vectorizer_config=Configure.Vectorizer.none(
        vector_dimensions=768  # HuggingFace embedding dimensions
    ),
    properties=[
        wvc.config.Property(name="collection", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="category", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="tags", data_type=wvc.config.DataType.TEXT_ARRAY),
        wvc.config.Property(name="subcategory", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="name", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="description", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="brand", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="product_id", data_type=wvc.config.DataType.UUID),
        wvc.config.Property(name="colors", data_type=wvc.config.DataType.TEXT_ARRAY),
        wvc.config.Property(name="reviews", data_type=wvc.config.DataType.TEXT_ARRAY),
        wvc.config.Property(name="image_url", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="price", data_type=wvc.config.DataType.NUMBER),
    ],
)

# Import data with existing vectors
products_v1 = client.collections.use("ECommerce_v1")

with products_v1.batch.fixed_size(batch_size=200) as batch:
    for item in ecommerce_data:
        batch.add_object(
            properties=item["properties"], vector=item["vector"]  # Use existing vectors
        )

failed_objects = products_v1.batch.failed_objects
if failed_objects:
    print(f"Number of failed imports: {len(failed_objects)}")
else:
    print(f"Imported {len(ecommerce_data)} products to ECommerce_v1")
# END Method2CreateOriginal

# START Method2CreateAlias
# Create an alias pointing to the current production collection
client.alias.create(alias_name="ECommerceProduction", target_collection="ECommerce_v1")

print("Created alias 'ECommerceProduction' -> 'ECommerce_v1'")
# END Method2CreateAlias

# START Method2QueryAlias
# Your application always uses the alias name
products = client.collections.use("ECommerceProduction")

# Query using the alias (currently points to ECommerce_v1)
# Use a vector from our dataset as query
query_vector = ecommerce_data[0]["vector"]

results = products.query.near_vector(
    near_vector=query_vector, limit=3, return_properties=["name", "price", "category"]
)

print("Query results via alias:")
for obj in results.objects:
    print(
        f"- {obj.properties['name']} ({obj.properties['category']}): ${obj.properties['price']}"
    )
# END Method2QueryAlias

# START Method2CreateNew
# Create new collection with Weaviate Embeddings vectorizer
client.collections.delete("ECommerce_v2")  # Clean up if exists

products_v2 = client.collections.create(
    name="ECommerce_v2",
    vector_config=Configure.Vectors.text2vec_weaviate(
        dimensions=768,  # Weaviate Embeddings dimension
        source_properties=["name", "description"],  # Properties to vectorize
        model_name="snowflake-arctic-embed-xs",  # Or another Weaviate model
    ),
    properties=[
        wvc.config.Property(name="collection", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="category", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="tags", data_type=wvc.config.DataType.TEXT_ARRAY),
        wvc.config.Property(name="subcategory", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="name", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="description", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="brand", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="product_id", data_type=wvc.config.DataType.UUID),
        wvc.config.Property(name="colors", data_type=wvc.config.DataType.TEXT_ARRAY),
        wvc.config.Property(name="reviews", data_type=wvc.config.DataType.TEXT_ARRAY),
        wvc.config.Property(name="image_url", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="price", data_type=wvc.config.DataType.NUMBER),
    ],
)

print("Created ECommerce_v2 with Weaviate Embeddings")
# END Method2CreateNew

# START Method2MigrateData
# Migrate data to new collection (vectors will be auto-generated)
products_v1 = client.collections.use("ECommerce_v1")
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
    limit=3,
    return_properties=["name", "price", "category"],
)

print("\nQuery results after switch (now using Weaviate Embeddings):")
for obj in results.objects:
    print(
        f"- {obj.properties['name']} ({obj.properties['category']}): ${obj.properties['price']}"
    )
# END Method2SwitchAlias

# START Method2Cleanup
# After verification, delete the old collection
# Always verify everything works before cleanup!

# Optional: Keep old collection for a rollback period
print("Keeping ECommerce_v1 for 7 days as rollback option...")

# When ready to clean up:
# client.collections.delete("ECommerce_v1")
# print("Deleted old collection ECommerce_v1")
# END Method2Cleanup

# ============================================
# PRODUCTION EXAMPLE
# ============================================


# START ProductionExample
class VectorizerMigration:
    """Production-ready vectorizer migration with monitoring and rollback"""

    def __init__(self, client: weaviate.Client):
        self.client = client

    def migrate_with_validation(
        self,
        source_collection: str,
        target_collection: str,
        alias_name: str,
        test_queries: List[str],
        rollback_threshold: float = 0.8,
    ):
        """
        Migrate with quality validation and automatic rollback

        Args:
            source_collection: Original collection name
            target_collection: New collection name
            alias_name: Production alias name
            test_queries: Queries to test quality
            rollback_threshold: Min quality score to proceed
        """
        print(f"Starting migration from {source_collection} to {target_collection}")

        # Step 1: Create new collection with new vectorizer
        self._create_new_collection(target_collection)

        # Step 2: Migrate data
        migrated_count = self._migrate_data(source_collection, target_collection)
        print(f"Migrated {migrated_count} objects")

        # Step 3: Validate quality
        quality_score = self._validate_quality(
            source_collection, target_collection, test_queries
        )
        print(f"Quality score: {quality_score:.2%}")

        # Step 4: Decision point
        if quality_score >= rollback_threshold:
            # Switch alias to new collection
            self.client.alias.update(
                alias_name=alias_name, new_target_collection=target_collection
            )
            print(f"✅ Migration successful! Alias now points to {target_collection}")
            return True
        else:
            # Quality too low, don't switch
            print(f"❌ Quality below threshold. Keeping {source_collection}")
            # Optionally delete the new collection
            self.client.collections.delete(target_collection)
            return False

    def _create_new_collection(self, collection_name: str):
        """Create collection with Weaviate Embeddings"""
        self.client.collections.create(
            name=collection_name,
            vector_config=Configure.Vectors.text2vec_weaviate(
                dimensions=768,
                source_properties=["name", "description"],
                model_name="snowflake-arctic-embed-xs",
            ),
            properties=[
                wvc.config.Property(
                    name="collection", data_type=wvc.config.DataType.TEXT
                ),
                wvc.config.Property(
                    name="category", data_type=wvc.config.DataType.TEXT
                ),
                wvc.config.Property(
                    name="tags", data_type=wvc.config.DataType.TEXT_ARRAY
                ),
                wvc.config.Property(
                    name="subcategory", data_type=wvc.config.DataType.TEXT
                ),
                wvc.config.Property(name="name", data_type=wvc.config.DataType.TEXT),
                wvc.config.Property(
                    name="description", data_type=wvc.config.DataType.TEXT
                ),
                wvc.config.Property(name="brand", data_type=wvc.config.DataType.TEXT),
                wvc.config.Property(
                    name="product_id", data_type=wvc.config.DataType.UUID
                ),
                wvc.config.Property(
                    name="colors", data_type=wvc.config.DataType.TEXT_ARRAY
                ),
                wvc.config.Property(
                    name="reviews", data_type=wvc.config.DataType.TEXT_ARRAY
                ),
                wvc.config.Property(
                    name="image_url", data_type=wvc.config.DataType.TEXT
                ),
                wvc.config.Property(name="price", data_type=wvc.config.DataType.NUMBER),
            ],
        )

    def _migrate_data(self, source: str, target: str) -> int:
        """Copy data from source to target collection"""
        source_col = self.client.collections.use(source)
        target_col = self.client.collections.use(target)

        all_objects = source_col.query.fetch_objects(limit=10000).objects

        with target_col.batch.fixed_size(batch_size=200) as batch:
            for obj in all_objects:
                batch.add_object(properties=obj.properties)

        return len(all_objects)

    def _validate_quality(
        self, source: str, target: str, test_queries: List[str]
    ) -> float:
        """Compare search quality between collections"""
        source_col = self.client.collections.use(source)
        target_col = self.client.collections.use(target)

        overlap_scores = []

        for query in test_queries:
            # Get results from both collections
            # For source, we need to convert text to vector first
            # (in production, you'd use your existing encoder)
            # For demo, we'll skip this comparison

            target_results = target_col.query.near_text(query=query, limit=10).objects

            # Simple validation: check if we get results
            if len(target_results) > 0:
                overlap_scores.append(1.0)
            else:
                overlap_scores.append(0.0)

        return sum(overlap_scores) / len(overlap_scores) if overlap_scores else 0.0


# Usage example
migration = VectorizerMigration(client)

success = migration.migrate_with_validation(
    source_collection="ECommerce_v1",
    target_collection="ECommerce_v3",
    alias_name="ECommerceProduction",
    test_queries=[
        "denim jeans",
        "comfortable athletic wear",
        "business casual outfit",
        "summer dress",
    ],
    rollback_threshold=0.7,
)

if success:
    print("Migration completed successfully!")
else:
    print("Migration rolled back due to quality issues")
# END ProductionExample

# Cleanup
client.close()
