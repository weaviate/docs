# Import
import weaviate
import requests, json

client = weaviate.connect_to_local()

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

if result.has_errors or result.errors:
    print(f"Number of failed imports: {len(result.errors)}")
    # `errors` is keyed by the position of the object in the input
    for index, error in result.errors.items():
        print(f"Failed object at index {index}: {error.message}")

client.close()  # Free up resources
# END Import

