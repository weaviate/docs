import weaviate
import os
import requests
import json
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure

# Get credentials from environment variables
wcd_url = os.environ["WCD_DEMO_URL"]
wcd_api_key = os.environ["WCD_DEMO_ADMIN_KEY"]

# Instantiate the v4 Weaviate client using the cloud helper.
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=wcd_url,
    auth_credentials=Auth.api_key(wcd_api_key),
)

client.collections.delete("JeopardyQuestion")
questions = client.collections.create(
    name="JeopardyQuestion", vectorizer_config=Configure.Vectorizer.text2vec_weaviate()
)

# --- Import objects from JSON file ---
url = "https://raw.githubusercontent.com/weaviate-tutorials/edu-datasets/main/jeopardy_100.json"
resp = requests.get(url)
data = json.loads(resp.text)

# Use dynamic batching (which automatically adjusts the batch size) for the import:
with questions.batch.dynamic() as batch:
    for i, obj in enumerate(data):
        batch.add_object(
            {
                "question": obj["Question"],
                "answer": obj["Answer"],
                "points": obj["Value"],
                "round": obj["Round"],
                "air_date": obj["Air Date"],
                "hasCategory": obj["Category"],
            }
        )

collection_size = len(questions)
assert (
    collection_size == 100
), f"Expected 100 imported objects but got {collection_size}"
print("All objects were imported successfully!")
