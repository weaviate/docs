# START GetStarted
import weaviate
import requests, json
from weaviate.classes.config import Configure

# highlight-start
client = weaviate.connect_to_local()
# highlight-end

# highlight-start
questions = client.collections.create(
    name="Question",
    vector_config=Configure.Vectors.text2vec_ollama(),  # Configure the Ollama embedding model
)
# highlight-end

resp = requests.get(
    "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json"
)
data = json.loads(resp.text)

# highlight-start
with questions.batch.dynamic() as batch:
    for d in data:
        batch.add_object(
            {
                "answer": d["Answer"],
                "question": d["Question"],
                "category": d["Category"],
            }
        )
        # highlight-end
        if batch.number_errors > 10:
            print("Batch import stopped due to excessive errors.")
            break

failed_objects = questions.batch.failed_objects
if failed_objects:
    print(f"Number of failed imports: {len(failed_objects)}")
    print(f"First failed object: {failed_objects[0]}")

# highlight-start
response = questions.query.near_text(query="biology", limit=2)
# highlight-end

for obj in response.objects:
    print(json.dumps(obj.properties, indent=2))

client.close()  # Free up resources
# END GetStarted
