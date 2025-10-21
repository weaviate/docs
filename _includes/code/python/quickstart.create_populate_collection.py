# START CreateCollection
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType
import os

# Best practice: store your credentials in environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]

# Step 1.1: Connect to your Weaviate Cloud instance
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_credentials=Auth.api_key(weaviate_api_key),
)

# END CreateCollection

# NOT SHOWN TO THE USER - DELETE EXISTING COLLECTION
client.collections.delete("Question")

# START CreateCollection
# Step 1.2: Create a collection
# highlight-start
questions = client.collections.create(
    name="Question",
    vector_config=Configure.Vectors.text2vec_weaviate(),  # Configure the Weaviate Embeddings vectorizer
    # You can also use auto-schema, here we define the schema manually
    properties=[
        Property(name="question", data_type=DataType.TEXT),
        Property(name="answer", data_type=DataType.TEXT),
        Property(name="category", data_type=DataType.TEXT),
    ],
)
# highlight-end
# START CreateCollection

# END CreateCollection
# fmt: off
# START CreateCollection
# Step 1.3: Import three objects
data_objects = [
    {"properties": {"question": "What is Python?", "answer": "Python is a high-level, interpreted programming language known for its simplicity and readability.", "category": "Programming"}},
    {"properties": {"question": "What is machine learning?", "answer": "Machine learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed.", "category": "AI"}},
    {"properties": {"question": "What is a vector database?", "answer": "A vector database is a specialized database designed to store and query high-dimensional vectors efficiently.", "category": "Database"}},
]
# END CreateCollection
# fmt: on
# START CreateCollection

questions = client.collections.use("Question")
with questions.batch.dynamic() as batch:
    for obj in data_objects:
        batch.add_object(properties=obj)

print(f"Imported {len(questions)} objects into the Question collection")

client.close()  # Free up resources
# END CreateCollection
