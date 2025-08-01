# ========================================
# GraphQLAggregateSimple
# ========================================

# START-ANY
import weaviate
import weaviate.classes as wvc
import os
# END-ANY # START GraphQLSimpleAggregateGroupby
from weaviate.classes.aggregate import GroupByAggregate
# END GraphQLSimpleAggregateGroupby
# START-ANY

client = weaviate.connect_to_local()

# END-ANY

# Actual client instantiation
client.close()

from weaviate.classes.init import Auth

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]
openai_api_key = os.environ["OPENAI_APIKEY"]

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_credentials=Auth.api_key(weaviate_api_key),
    headers={
        "X-OpenAI-Api-Key": openai_api_key,
    }
)


# START-ANY
try:
# END-ANY

    # START GraphQLAggregateSimple
    collection = client.collections.get("Article")
    response = collection.aggregate.over_all(
        total_count=True,
        return_metrics=wvc.query.Metrics("wordCount").integer(
            count=True,
            maximum=True,
            mean=True,
            median=True,
            minimum=True,
            mode=True,
            sum_=True,
        ),
    )

    print(response.total_count)
    print(response.properties)
    # END GraphQLAggregateSimple

    # TEST
    assert "wordCount" in response.properties.keys()
    assert response.total_count > 0


    # ========================================
    # GraphQLMetaCount
    # ========================================

    # START GraphQLMetaCount
    collection = client.collections.get("Article")
    response = collection.aggregate.over_all(total_count=True)

    print(response.total_count)
    # END GraphQLMetaCount

    # TEST
    assert response.total_count > 0

    # TODO[g-despot]: Update once fixed client
    # START GraphQLSimpleAggregateGroupby
    # Coming soon
    # END GraphQLSimpleAggregateGroupby
    # ========================================
    # GraphQLSimpleAggregateGroupby
    # ========================================
    
    # collection = client.collections.get("Article")
    # response = collection.aggregate.over_all(
    #     group_by=GroupByAggregate(prop="title"),
    #     total_count=True,
    #     return_metrics=wvc.query.Metrics("wordCount").integer(mean=True)
    # )

    # for g in response.groups:
    #     print(g.total_count)
    #     print(g.properties)
    #     print(g.grouped_by)
    
    #     # TEST
    #     assert g.total_count > 0
    #     assert "wordCount" in g.properties.keys()
    #     assert "title" == g.grouped_by.prop

    # ========================================
    # GraphQLnearObjectAggregate
    # ========================================

    # START GraphQLnearObjectAggregate
    collection = client.collections.get("Article")
    response = collection.aggregate.near_object(
        near_object="00037775-1432-35e5-bc59-443baaef7d80",
        distance=0.6,
        object_limit=200,
        total_count=True,
        return_metrics=[
            wvc.query.Metrics("wordCount").integer(
                count=True,
                maximum=True,
                mean=True,
                median=True,
                minimum=True,
                mode=True,
                sum_=True,
            ),
            # END GraphQLnearObjectAggregate
            # 2024-01-29 Hidden as there is a Weaviate-side bug
            # wvc.query.Metrics("inPublication").reference(
            #     pointing_to=True,
            # )
            # START GraphQLnearObjectAggregate
        ]
    )

    print(response.total_count)
    print(response.properties)
    # END GraphQLnearObjectAggregate

    # TEST
    # assert "inPublication" in response.properties.keys()
    assert "wordCount" in response.properties.keys()
    assert response.total_count > 0


    # ========================================
    # GraphQLnearVectorAggregate
    # ========================================

    collection = client.collections.get("Article")
    rand_obj = collection.query.fetch_objects(limit=1, include_vector=True)
    some_vector = rand_obj.objects[0].vector["default"]

    # START GraphQLnearVectorAggregate
    collection = client.collections.get("Article")
    response = collection.aggregate.near_vector(
        near_vector=some_vector,
        distance=0.7,
        object_limit=100,
        total_count=True,
        return_metrics=[
            wvc.query.Metrics("wordCount").integer(
                count=True,
                maximum=True,
                mean=True,
                median=True,
                minimum=True,
                mode=True,
                sum_=True,
            ),
            # END GraphQLnearVectorAggregate
            # 2024-01-29 Hidden as there is a Weaviate-side bug
            # wvc.query.Metrics("inPublication").reference(
            #     pointing_to=True,
            # )
            # START GraphQLnearVectorAggregate
        ]
    )

    print(response.total_count)
    print(response.properties)
    # END GraphQLnearVectorAggregate

    # TEST
    # assert "inPublication" in response.properties.keys()
    assert "wordCount" in response.properties.keys()
    assert response.total_count > 0


    # ========================================
    # GraphQLnearTextAggregate
    # ========================================

    collection = client.collections.get("Article")
    rand_obj = collection.query.fetch_objects(limit=1, include_vector=True)
    some_vector = rand_obj.objects[0].vector

    # START GraphQLnearTextAggregate
    collection = client.collections.get("Article")
    response = collection.aggregate.near_text(
        query="apple iphone",
        object_limit=200,
        total_count=True,
        return_metrics=[
            wvc.query.Metrics("wordCount").integer(
                count=True,
                maximum=True,
                mean=True,
                median=True,
                minimum=True,
                mode=True,
                sum_=True,
            ),
            # END GraphQLnearTextAggregate
            # 2024-01-29 Hidden as there is a Weaviate-side bug
            # wvc.query.Metrics("inPublication").reference(
            #     pointing_to=True,
            # )
            # START GraphQLnearTextAggregate
        ]
    )

    print(response.total_count)
    print(response.properties)
    # END GraphQLnearTextAggregate

    # TEST
    # assert "inPublication" in response.properties.keys()  # 2024-01-29 Hidden as there is a Weaviate-side bug
    assert "wordCount" in response.properties.keys()
    assert response.total_count > 0

# START-ANY

finally:
    client.close()
# END-ANY
