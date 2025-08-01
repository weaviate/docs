# DockerInstantiationExample
import weaviate
import weaviate.classes as wvc
import os

client = weaviate.connect_to_local(
    headers={
        "X-OpenAI-Api-Key": os.environ["OPENAI_APIKEY"]  # Replace with your inference API key
    }
)
# END DockerInstantiationExample

assert client.is_ready()

client.close()

# EndToEndExample  # InstantiationExample  # NearTextExample
import weaviate
import weaviate.classes as wvc
import os
# END EndToEndExample  # END InstantiationExample  # END NearTextExample
# EndToEndExample
import requests
import json
# END EndToEndExample

# EndToEndExample  # InstantiationExample  # NearTextExample

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]
openai_api_key = os.environ["OPENAI_APIKEY"]

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,                                    # Replace with your Weaviate Cloud URL
    auth_credentials=wvc.init.Auth.api_key(weaviate_api_key),    # Replace with your Weaviate Cloud key
    headers={"X-OpenAI-Api-Key": openai_api_key}            # Replace with appropriate header key/value pair for the required API
)

# END EndToEndExample  # END InstantiationExample  # END NearTextExample

assert client.is_ready()

client.close()

# Actual instantiation for testing
client = weaviate.connect_to_local(
    headers={
        "X-OpenAI-Api-Key": os.environ["OPENAI_APIKEY"]  # Replace with your inference API key
    }
)

client.collections.delete("Question")


# DockerInstantiationExample # EndToEndExample  # InstantiationExample  # NearTextExample
try:
    pass  # Work with the client. Close client gracefully in the finally block.
# END DockerInstantiationExample  # END EndToEndExample  # END InstantiationExample  # END NearTextExample

    # EndToEndExample
    # ===== define collection =====
    questions = client.collections.create(
        name="Question",
        vector_config=wvc.Configure.Vectors.text2vec_openai(),  # If set to "none" you must always provide vectors yourself. Could be any other "text2vec-*" also.
        generative_config=wvc.config.Configure.Generative.openai()  # Ensure the `generative-openai` module is used for generative queries
    )

    # ===== import data =====
    resp = requests.get('https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json')
    data = json.loads(resp.text)  # Load data

    question_objs = list()
    for i, d in enumerate(data):
        question_objs.append({
            "answer": d["Answer"],
            "question": d["Question"],
            "category": d["Category"],
        })

    questions = client.collections.get("Question")
    questions.data.insert_many(question_objs)

    # END EndToEndExample    # Test import
    questions_definition = questions.config.get()
    obj_count = questions.aggregate.over_all(total_count=True)

    assert questions_definition.name == "Question"
    assert obj_count.total_count == 10

    # NearTextExample
    questions = client.collections.get("Question")

    response = questions.query.near_text(
        query="biology",
        limit=2
    )

    print(response.objects[0].properties)  # Inspect the first object
    # END NearTextExample

    # ===== Test query responses =====
    assert len(response.objects) == 2
    assert response.objects[0].properties["answer"] == "the nose or snout"

    # NearTextWhereExample
    questions = client.collections.get("Question")

    response = questions.query.near_text(
        query="biology",
        limit=2,
        filters=wvc.query.Filter.by_property("category").equal("ANIMALS")
    )

    print(response.objects[0].properties)  # Inspect the first object
    # END NearTextWhereExample

    # ===== Test query responses =====
    assert len(response.objects) == 2
    assert response.objects[0].properties["category"] == "SCIENCE"


    # GenerativeSearchExample
    questions = client.collections.get("Question")

    response = questions.generate.near_text(
        query="biology",
        limit=2,
        single_prompt="Explain {answer} as you might to a five-year-old."
    )

    print(response.objects[0].generated)  # Inspect the generated text
    # END GenerativeSearchExample

    # ===== Test query responses =====
    assert len(response.objects) == 2
    assert len(response.objects[0].generated) > 0

    # GenerativeSearchGroupedTaskExample
    questions = client.collections.get("Question")

    response = questions.generate.near_text(
        query="biology",
        limit=2,
        grouped_task="Write a tweet with emojis about these facts."
    )

    print(response.generated)  # Inspect the generated text
    # END GenerativeSearchGroupedTaskExample

    # ===== Test query responses =====
    assert len(response.objects) == 2
    assert len(response.generated) > 0

    # Cleanup

    client.collections.delete("Question")  # Cleanup after


    # ===== import with custom vectors =====
    import requests

    # highlight-start
    fname = "jeopardy_tiny_with_vectors_all-OpenAI-ada-002.json"  # This file includes pre-generated vectors
    # highlight-end
    url = f"https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/{fname}"
    resp = requests.get(url)
    data = json.loads(resp.text)  # Load data

    question_objs = list()
    for i, d in enumerate(data):
        question_objs.append(wvc.data.DataObject(
            properties={
                "answer": d["Answer"],
                "question": d["Question"],
                "category": d["Category"],
            },
            vector=d["vector"]
        ))

    questions = client.collections.get("Question")
    questions.data.insert_many(question_objs)    # This uses batching under the hood
    # ===== END import with custom vectors =====

    questions_definition = questions.config.get()
    obj_count = questions.aggregate.over_all(total_count=True)

    assert questions_definition.name == "Question"
    assert obj_count.total_count == 10

    client.collections.delete("Question")  # Cleanup after

# DockerInstantiationExample  # EndToEndExample  # InstantiationExample  # NearTextExample

finally:
    client.close()  # Close client gracefully
# END DockerInstantiationExample  # END EndToEndExample  # END InstantiationExample  # END NearTextExample
