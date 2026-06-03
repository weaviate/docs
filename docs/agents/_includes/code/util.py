import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType

def populate_weaviate(client, overwrite_existing=False, include_ecommerce=True):

    if overwrite_existing:
        if include_ecommerce:
            client.collections.delete("ECommerce")
        client.collections.delete("Weather")
        client.collections.delete("FinancialContracts")

    if include_ecommerce and not client.collections.exists("ECommerce"):
        client.collections.create(
            "ECommerce",
            description="A dataset that lists clothing items, their brands, prices, and more.",
            vector_config=[
                Configure.Vectors.text2vec_weaviate(
                    name="description_vector",
                    source_properties=[
                        "description",
                    ],
                ),
                Configure.Vectors.text2vec_weaviate(
                    name="name_description_brand_vector",
                    source_properties=[
                        "name",
                        "description",
                        "brand",
                    ],
                ),
            ],
            properties=[
                Property(name="collection", data_type=DataType.TEXT),
                Property(
                    name="category",
                    data_type=DataType.TEXT,
                    description="The category to which the clothing item belongs",
                ),
                Property(
                    name="tags",
                    data_type=DataType.TEXT_ARRAY,
                    description="The tags that are assocciated with the clothing item",
                ),
                Property(name="subcategory", data_type=DataType.TEXT),
                Property(name="name", data_type=DataType.TEXT),
                Property(
                    name="description",
                    data_type=DataType.TEXT,
                    description="A detailed description of the clothing item",
                ),
                Property(
                    name="brand",
                    data_type=DataType.TEXT,
                    description="The brand of the clothing item",
                ),
                Property(name="product_id", data_type=DataType.UUID),
                Property(
                    name="colors",
                    data_type=DataType.TEXT_ARRAY,
                    description="The colors on the clothing item",
                ),
                Property(name="reviews", data_type=DataType.TEXT_ARRAY),
                Property(name="image_url", data_type=DataType.TEXT),
                Property(
                    name="price",
                    data_type=DataType.NUMBER,
                    description="The price of the clothing item in USD",
                ),
            ],
        )
        overwrite_existing = True

    if not client.collections.exists("Weather"):
        client.collections.create(
            "Weather",
            description="Daily weather information including temperature, wind speed, precipitation, pressure etc.",
            vector_config=Configure.Vectors.text2vec_weaviate(),
            properties=[
                Property(name="date", data_type=DataType.DATE),
                Property(name="humidity", data_type=DataType.NUMBER),
                Property(name="precipitation", data_type=DataType.NUMBER),
                Property(name="wind_speed", data_type=DataType.NUMBER),
                Property(name="visibility", data_type=DataType.NUMBER),
                Property(name="pressure", data_type=DataType.NUMBER),
                Property(
                    name="temperature",
                    data_type=DataType.NUMBER,
                    description="temperature value in Celsius",
                ),
            ],
        )
        overwrite_existing = True

    if not client.collections.exists("FinancialContracts"):
        client.collections.create(
            "FinancialContracts",
            description="A dataset of financial contracts between individuals and/or companies, as well as information on the type of contract and who has authored them.",
            vector_config=Configure.Vectors.text2vec_weaviate(),
        )
        overwrite_existing = True

    from datasets import load_dataset

    if not overwrite_existing:
        print("Data already exists in Weaviate, skipping import.")
        return

    weather_dataset = load_dataset(
        "weaviate/agents", "query-agent-weather", split="train", streaming=True
    )
    financial_dataset = load_dataset(
        "weaviate/agents",
        "query-agent-financial-contracts",
        split="train",
        streaming=True,
    )

    weather_collection = client.collections.use("Weather")
    financial_collection = client.collections.use("FinancialContracts")

    if include_ecommerce:
        ecommerce_dataset = load_dataset(
            "weaviate/agents", "query-agent-ecommerce", split="train", streaming=True
        )
        ecommerce_collection = client.collections.use("ECommerce")

        print("\nImport `query-agent-ecommerce` dataset into Weaviate")
        with ecommerce_collection.batch.fixed_size(batch_size=200) as batch:
            for item in ecommerce_dataset:
                batch.add_object(properties=item["properties"])
                if batch.number_errors > 0:
                    print("Batch import stopped due to excessive errors.")
                    break

        failed_objects = ecommerce_collection.batch.failed_objects
        if failed_objects:
            print(f"Number of failed imports: {len(failed_objects)}")
            print(f"First failed object: {failed_objects[0]}")

    print("\nImport `query-agent-weather` dataset into Weaviate")
    with weather_collection.batch.fixed_size(batch_size=200) as batch:
        for item in weather_dataset:
            batch.add_object(properties=item["properties"], vector=item["vector"])
            if batch.number_errors > 0:
                print("Batch import stopped due to excessive errors.")
                break

    failed_objects = weather_collection.batch.failed_objects
    if failed_objects:
        print(f"Number of failed imports: {len(failed_objects)}")
        print(f"First failed object: {failed_objects[0]}")

    print("\nImport `query-agent-financial-contracts` dataset into Weaviate")
    with financial_collection.batch.fixed_size(batch_size=200) as batch:
        for item in financial_dataset:
            batch.add_object(properties=item["properties"], vector=item["vector"])
            if batch.number_errors > 0:
                print("Batch import stopped due to excessive errors.")
                break

    failed_objects = financial_collection.batch.failed_objects
    if failed_objects:
        print(f"Number of failed imports: {len(failed_objects)}")
        print(f"First failed object: {failed_objects[0]}")

    print("\nData import complete!")
    if include_ecommerce:
        print(f"Size of the ECommerce dataset: {len(ecommerce_collection)}")
    print(f"Size of the Weather dataset: {len(weather_collection)}")
    print(f"Size of the Financial dataset: {len(financial_collection)}")

def populate_brands(client, overwrite_existing=False):
    """Create and populate the `Brands` collection used by the recipe walkthroughs.

    Idempotent: skips creation/import when the collection already has data, unless
    `overwrite_existing=True`.
    """
    if overwrite_existing:
        client.collections.delete("Brands")

    needs_import = overwrite_existing
    if not client.collections.exists("Brands"):
        client.collections.create(
            "Brands",
            description=(
                "A dataset that lists information about clothing brands, their "
                "parent companies, average rating and more."
            ),
            vector_config=Configure.Vectors.text2vec_weaviate(),
        )
        needs_import = True

    if not needs_import:
        print("Brands data already exists in Weaviate, skipping import.")
        return

    from datasets import load_dataset

    brands_dataset = load_dataset(
        "weaviate/agents", "query-agent-brands", split="train", streaming=True
    )
    brands_collection = client.collections.use("Brands")

    print("\nImport `query-agent-brands` dataset into Weaviate")
    with brands_collection.batch.fixed_size(batch_size=200) as batch:
        for item in brands_dataset:
            batch.add_object(properties=item["properties"])
            if batch.number_errors > 0:
                print("Batch import stopped due to excessive errors.")
                break

    failed_objects = brands_collection.batch.failed_objects
    if failed_objects:
        print(f"Number of failed imports: {len(failed_objects)}")
        print(f"First failed object: {failed_objects[0]}")

    print(f"Size of the Brands dataset: {len(brands_collection)}")


def populate_recipe_ecommerce(client):
    """Create and populate `ECommerce` with a single default vector, matching the
    recipe walkthroughs (so the agent can target it by name without specifying a
    vector). Force-recreates the collection so the schema is deterministic even if
    a multi-vector `ECommerce` was left behind by another test.
    """
    client.collections.delete("ECommerce")
    client.collections.create(
        "ECommerce",
        description="A dataset that lists clothing items, their brands, prices, and more.",
        vector_config=Configure.Vectors.text2vec_weaviate(),
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
            Property(
                name="price",
                data_type=DataType.NUMBER,
                description="price of item in USD",
            ),
        ],
    )

    from datasets import load_dataset

    ecommerce_dataset = load_dataset(
        "weaviate/agents", "query-agent-ecommerce", split="train", streaming=True
    )
    ecommerce_collection = client.collections.use("ECommerce")

    print("\nImport `query-agent-ecommerce` dataset into Weaviate (single vector)")
    with ecommerce_collection.batch.fixed_size(batch_size=200) as batch:
        for item in ecommerce_dataset:
            batch.add_object(properties=item["properties"])
            if batch.number_errors > 0:
                print("Batch import stopped due to excessive errors.")
                break

    failed_objects = ecommerce_collection.batch.failed_objects
    if failed_objects:
        print(f"Number of failed imports: {len(failed_objects)}")
        print(f"First failed object: {failed_objects[0]}")

    print(f"Size of the ECommerce dataset: {len(ecommerce_collection)}")


def load_client_internally():
    headers = {
        "X-OpenAI-API-Key": os.environ.get("OPENAI_API_KEY"),
        "X-INFERENCE-PROVIDER-API-KEY": os.environ.get("YOUR_INFERENCE_PROVIDER_KEY", ""),
    }

    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=os.environ.get("WEAVIATE_URL"),
        auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
        headers=headers,
    )
    return client