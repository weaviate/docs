# Import
import weaviate
from weaviate.classes.init import Auth
import requests, json, os

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,                                    # Replace with your Weaviate Cloud URL
    auth_credentials=Auth.api_key(weaviate_api_key),             # Replace with your Weaviate Cloud key
)

resp = requests.get(
    "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json"
)
data = json.loads(resp.text)

questions = client.collections.use("Question")

# highlight-start
result = questions.data.ingest(
    [
        {
            "answer": d["Answer"],
            "question": d["Question"],
            "category": d["Category"],
        }
        for d in data
    ]
)
# highlight-end

# Also check `errors` directly; it is populated for every failed object
if result.has_errors or result.errors:
    print(f"Number of failed imports: {len(result.errors)}")
    # `errors` is keyed by the position of the object in the input
    for index, error in result.errors.items():
        print(f"Failed object at index {index}: {error.message}")

client.close()  # Free up resources
# END Import
