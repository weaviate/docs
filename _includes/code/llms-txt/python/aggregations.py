"""llms.txt snippet: aggregations. Section "Python / TypeScript > Aggregations"."""
import os
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)
client.collections.delete("Movie__AggsPy")
client.collections.create(
    "Movie__AggsPy",
    vector_config=Configure.Vectors.text2vec_weaviate(),
    properties=[
        Property(name="title", data_type=DataType.TEXT),
        Property(name="genre", data_type=DataType.TEXT),
        Property(name="rating", data_type=DataType.NUMBER),
    ],
)
movies = client.collections.use("Movie__AggsPy")
movies.data.insert_many([
    {"title": "The Matrix", "genre": "Science Fiction", "rating": 8.7},
    {"title": "Spirited Away", "genre": "Animation", "rating": 8.6},
    {"title": "Blade Runner", "genre": "Science Fiction", "rating": 8.1},
])

# START llms_aggregations
from weaviate.classes.aggregate import GroupByAggregate, Metrics

# Total object count
total = movies.aggregate.over_all(total_count=True).total_count

# Numeric metric over a property (mean rating)
res = movies.aggregate.over_all(
    return_metrics=Metrics("rating").number(mean=True),
)

# Group object counts by a property
groups = movies.aggregate.over_all(group_by=GroupByAggregate(prop="genre")).groups
# END llms_aggregations

assert total == 3
assert res.properties["rating"].mean is not None
assert len(groups) == 2
client.collections.delete("Movie__AggsPy")
client.close()
