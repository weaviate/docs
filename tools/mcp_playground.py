import weaviate
from weaviate.classes.config import Configure, Property, DataType
from weaviate.classes.tenants import Tenant
from weaviate.classes.query import MetadataQuery
import base64
from datetime import datetime

import base64
import requests
from typing import Optional
from io import BytesIO
from PIL import Image


def fetch_image_as_base64(
    url: str,
    timeout: int = 10,
    max_size: Optional[tuple] = None,
    verify_ssl: bool = True,
) -> str:
    """
    Fetch an image from a URL and encode it as base64.

    Args:
        url: The URL of the image to fetch
        timeout: Request timeout in seconds (default: 10)
        max_size: Optional tuple (width, height) to resize image
        verify_ssl: Whether to verify SSL certificates (default: True)

    Returns:
        Base64 encoded string of the image

    Raises:
        requests.exceptions.RequestException: If the request fails
        ValueError: If the response is not an image
    """
    try:
        # Fetch the image
        response = requests.get(url, timeout=timeout, verify=verify_ssl)
        response.raise_for_status()

        # Verify it's an image
        content_type = response.headers.get("Content-Type", "")
        if not content_type.startswith("image/"):
            raise ValueError(
                f"URL does not point to an image. Content-Type: {content_type}"
            )

        # If max_size is specified, resize the image
        if max_size:
            img = Image.open(BytesIO(response.content))
            img.thumbnail(max_size, Image.Resampling.LANCZOS)

            # Save resized image to bytes
            buffered = BytesIO()
            img.save(buffered, format=img.format or "PNG")
            image_bytes = buffered.getvalue()
        else:
            image_bytes = response.content

        # Encode to base64
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        return image_base64

    except requests.exceptions.RequestException as e:
        raise requests.exceptions.RequestException(
            f"Failed to fetch image from {url}: {str(e)}"
        )


# Connect to Weaviate
client = weaviate.connect_to_local(auth_credentials="admin-key")

try:
    # ========== MOVIE COLLECTION ==========
    movie_collection_name = "Movie"

    # Delete collection if it exists
    if client.collections.exists(movie_collection_name):
        client.collections.delete(movie_collection_name)
        print(f"Deleted existing collection: {movie_collection_name}")

    # Create Movie collection with named vectors
    movie_collection = client.collections.create(
        name=movie_collection_name,
        vector_config=[
            Configure.Vectors.text2vec_transformers(
                name="string_vector", source_properties=["title", "description"]
            ),
            Configure.Vectors.multi2vec_clip(
                name="image_vector", image_fields=["poster"]
            ),
        ],
        properties=[
            Property(name="title", data_type=DataType.TEXT),
            Property(name="description", data_type=DataType.TEXT),
            Property(name="poster", data_type=DataType.BLOB),
            Property(name="rating", data_type=DataType.NUMBER),
            Property(name="year", data_type=DataType.DATE),
        ],
    )
    print(f"Created collection: {movie_collection_name}")

    # ========== USER COLLECTION ==========
    user_collection_name = "User"

    # Delete collection if it exists
    if client.collections.exists(user_collection_name):
        client.collections.delete(user_collection_name)
        print(f"Deleted existing collection: {user_collection_name}")

    # Create User collection with multi-tenancy
    user_collection = client.collections.create(
        name=user_collection_name,
        vector_config=Configure.Vectors.text2vec_transformers(),
        multi_tenancy_config=Configure.multi_tenancy(enabled=True),
        properties=[
            Property(name="name", data_type=DataType.TEXT),
            Property(name="liked_movies", data_type=DataType.TEXT_ARRAY),
        ],
    )
    print(f"Created collection: {user_collection_name}")

    # Create two tenants for User collection
    user_collection.tenants.create([Tenant(name="user_alice"), Tenant(name="user_bob")])
    print("Created tenants: user_alice, user_bob")

    # ========== INSERT MOVIES ==========

    movies = [
        {
            "title": "The Matrix",
            "description": "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
            "poster": fetch_image_as_base64(
                "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
            ),
            "rating": 8.7,
            "year": "1999-03-31T00:00:00Z",  # RFC3339 format with timezone
        },
        {
            "title": "Inception",
            "description": "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
            "poster": fetch_image_as_base64(
                "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg"
            ),
            "rating": 8.8,
            "year": "2010-07-16T00:00:00Z",  # RFC3339 format with timezone
        },
        {
            "title": "Interstellar",
            "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            "poster": fetch_image_as_base64(
                "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
            ),
            "rating": 8.6,
            "year": "2014-11-07T00:00:00Z",  # RFC3339 format with timezone
        },
    ]

    movie_collection = client.collections.get(movie_collection_name)

    with movie_collection.batch.dynamic() as batch:
        for movie in movies:
            batch.add_object(properties=movie)

    print(f"Inserted {len(movies)} movies")

    # ========== INSERT USERS ==========
    # Insert user for tenant alice
    user_alice_data = {
        "name": "Alice Johnson",
        "liked_movies": ["The Matrix", "Inception"],
    }

    user_collection_alice = client.collections.get(user_collection_name).with_tenant(
        "user_alice"
    )
    user_collection_alice.data.insert(properties=user_alice_data)
    print("Inserted user Alice into tenant user_alice")

    # Insert user for tenant bob
    user_bob_data = {"name": "Bob Smith", "liked_movies": ["Inception", "Interstellar"]}

    user_collection_bob = client.collections.get(user_collection_name).with_tenant(
        "user_bob"
    )
    user_collection_bob.data.insert(properties=user_bob_data)
    print("Inserted user Bob into tenant user_bob")

    # ========== VERIFY DATA ==========
    print("\n" + "=" * 80)
    print("VERIFICATION")
    print("=" * 80)

    # Check movies
    movie_count = movie_collection.aggregate.over_all(total_count=True)
    print(f"\nTotal movies: {movie_count.total_count}")

    # Check users
    print(f"\nUsers:")
    alice_user = user_collection_alice.query.fetch_objects(limit=1)
    for user in alice_user.objects:
        print(
            f"  - Tenant: user_alice | {user.properties['name']} | Liked: {user.properties['liked_movies']}"
        )

finally:
    # Clean up connection
    client.close()
    print("\nConnection closed")
