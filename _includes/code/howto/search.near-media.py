# How-to: Search -> Near media search - Python examples
# Requirements: Weaviate >= 1.36.5, weaviate-client >= 4.20.4
# Set GOOGLE_API_KEY env var before running

import os
import base64
import weaviate
from pathlib import Path
from weaviate.classes.config import Configure, Property, DataType
from weaviate.classes.query import MetadataQuery, NearMediaType, Filter

# Run from _includes/ so relative paths in snippets resolve correctly
os.chdir(Path(__file__).parent.parent.parent)

client = weaviate.connect_to_local(
    headers={"X-Goog-Api-Key": os.environ["GOOGLE_API_KEY"]}
)

# ======================================
# ===== Create a demo collection =======
# ======================================

# START CreateCollection
from weaviate.classes.config import Configure, Property, DataType

client.collections.delete("MediaExample")
client.collections.create(
    name="MediaExample",
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="mediaType", data_type=DataType.TEXT),
    ],
    # highlight-start
    vector_config=Configure.Vectors.multi2vec_google_gemini(
        model="gemini-embedding-2-preview",
        text_fields=["title"],
        # video_fields=["video"],
        # image_fields=["image"],
    ),
    # highlight-end
)
# END CreateCollection

collection = client.collections.use("MediaExample")

# Insert test data (vectorized via text_fields)
collection.data.insert_many(
    [
        {"title": "A butterfly flying through a garden", "mediaType": "nature"},
        {"title": "A cat playing with a ball of yarn", "mediaType": "animals"},
        {"title": "A dog barking", "mediaType": "animals"},
        {"title": "Classical music symphony performance", "mediaType": "music"},
        {"title": "Documentary about space exploration", "mediaType": "documentary"},
    ]
)


# ============================================
# ===== Search by video file =====
# ============================================

# START VideoFileSearch
from pathlib import Path

# highlight-start
from weaviate.classes.query import NearMediaType

# highlight-end

collection = client.collections.use("MediaExample")

response = collection.query.near_media(
    # highlight-start
    media=Path("./videos/dog.mp4"),
    media_type=NearMediaType.VIDEO,
    # highlight-end
    return_properties=["title", "mediaType"],
    limit=5,
)

for obj in response.objects:
    print(obj.properties)
# END VideoFileSearch

assert len(response.objects) > 0, "VideoFileSearch: expected results"
print(f"VideoFileSearch: OK ({len(response.objects)} results)")


# ============================================
# ===== Search by video - base64 =====
# ============================================

# START VideoBase64Search
import base64
from weaviate.classes.query import NearMediaType

# highlight-start
with open("./videos/butterfly.mp4", "rb") as f:
    video_base64 = base64.b64encode(f.read()).decode("utf-8")
# highlight-end

collection = client.collections.use("MediaExample")

response = collection.query.near_media(
    # highlight-start
    media=video_base64,
    media_type=NearMediaType.VIDEO,
    # highlight-end
    return_properties=["title", "mediaType"],
    limit=5,
)

for obj in response.objects:
    print(obj.properties)
# END VideoBase64Search

assert len(response.objects) > 0, "VideoBase64Search: expected results"
print(f"VideoBase64Search: OK ({len(response.objects)} results)")


# ============================================
# ===== Search with distance =====
# ============================================

# START DistanceSearch
import base64
from weaviate.classes.query import MetadataQuery, NearMediaType

with open("./videos/cat.mp4", "rb") as f:
    video_base64 = base64.b64encode(f.read()).decode("utf-8")

collection = client.collections.use("MediaExample")

response = collection.query.near_media(
    media=video_base64,
    media_type=NearMediaType.VIDEO,
    # highlight-start
    distance=0.8,  # Maximum accepted distance
    return_metadata=MetadataQuery(distance=True),
    # highlight-end
    return_properties=["title", "mediaType"],
    limit=5,
)

for obj in response.objects:
    print(f"{obj.properties} - Distance: {obj.metadata.distance}")
# END DistanceSearch

assert len(response.objects) > 0, "DistanceSearch: expected results"
assert (
    response.objects[0].metadata.distance is not None
), "DistanceSearch: expected distance metadata"
print(
    f"DistanceSearch: OK ({len(response.objects)} results, dist={response.objects[0].metadata.distance:.4f})"
)


# ============================================
# ===== Search with filters =====
# ============================================

# START FilteredSearch
import base64
from weaviate.classes.query import NearMediaType
from weaviate.classes.query import Filter

with open("./videos/dog.mp4", "rb") as f:
    video_base64 = base64.b64encode(f.read()).decode("utf-8")

collection = client.collections.use("MediaExample")

response = collection.query.near_media(
    media=video_base64,
    media_type=NearMediaType.VIDEO,
    # highlight-start
    filters=Filter.by_property("mediaType").equal("animals"),
    # highlight-end
    return_properties=["title", "mediaType"],
    limit=5,
)

for obj in response.objects:
    print(obj.properties)
# END FilteredSearch

assert (
    len(response.objects) == 2
), f"FilteredSearch: expected 2 results, got {len(response.objects)}"
print(f"FilteredSearch: OK ({len(response.objects)} results)")


# ============================================
# ===== Search by audio file =====
# ============================================

# START AudioBase64Search
import base64
from weaviate.classes.query import NearMediaType

collection = client.collections.use("MediaExample")

response = collection.query.near_media(
    # highlight-start
    media=Path("./audio/dog.wav"),
    media_type=NearMediaType.AUDIO,
    # highlight-end
    return_properties=["title", "mediaType"],
    limit=5,
)

for obj in response.objects:
    print(obj.properties)
# END AudioBase64Search

assert len(response.objects) > 0, "AudioBase64Search: expected results"
print(f"AudioBase64Search: OK ({len(response.objects)} results)")


# ===== Cleanup =====
client.collections.delete("MediaExample")

client.close()
