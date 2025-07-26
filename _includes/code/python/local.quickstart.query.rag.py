# RAG
import weaviate

client = weaviate.connect_to_local()

questions = client.collections.get("Question")

print("=== DEBUG: Getting collection configuration ===")
config = questions.config.get()
print(f"DEBUG: Collection config type: {type(config)}")
print(f"DEBUG: Collection config: {config}")

# Print vector configuration
if hasattr(config, "vector_config"):
    print(f"DEBUG: Vector config: {config.vector_config}")
    if hasattr(config.vector_config, "vectorizer"):
        print(f"DEBUG: Vectorizer: {config.vector_config.vectorizer}")
        if hasattr(config.vector_config.vectorizer, "config"):
            print(f"DEBUG: Vectorizer config: {config.vector_config.vectorizer.config}")

# Print generative configuration
if hasattr(config, "generative_config"):
    print(f"DEBUG: Generative config: {config.generative_config}")
    if hasattr(config.generative_config, "generative"):
        print(f"DEBUG: Generative: {config.generative_config.generative}")
        if hasattr(config.generative_config.generative, "config"):
            print(
                f"DEBUG: Generative config: {config.generative_config.generative.config}"
            )

print("=== DEBUG: Starting RAG query ===")

# highlight-start
response = questions.generate.near_text(
    query="biology",
    limit=2,
    grouped_task="Write a tweet with emojis about these facts.",
)
# highlight-end

print(f"DEBUG: Response type: {type(response)}")
print(f"DEBUG: Response object: {response}")
print(
    f"DEBUG: Response attributes: {[attr for attr in dir(response) if not attr.startswith('_')]}"
)

# Check if response has generative attribute
if hasattr(response, "generative"):
    print(f"DEBUG: response.generative type: {type(response.generative)}")
    print(f"DEBUG: response.generative value: {response.generative}")

    if response.generative is not None:
        print(
            f"DEBUG: generative attributes: {[attr for attr in dir(response.generative) if not attr.startswith('_')]}"
        )

        if hasattr(response.generative, "text"):
            print(f"DEBUG: Generated text exists: {response.generative.text}")
        else:
            print("DEBUG: ERROR - response.generative has no 'text' attribute")
    else:
        print("DEBUG: ERROR - response.generative is None")
else:
    print("DEBUG: ERROR - response has no 'generative' attribute")

# Check if there are search results
if hasattr(response, "objects"):
    print(f"DEBUG: Number of objects found: {len(response.objects)}")
    for i, obj in enumerate(response.objects):
        print(f"DEBUG: Object {i+1}: {obj.properties}")
else:
    print("DEBUG: No objects found in response")

# Only print the text if it exists
if (
    hasattr(response, "generative")
    and response.generative is not None
    and hasattr(response.generative, "text")
):
    print(response.generative.text)  # Inspect the generated text
else:
    print("ERROR: Cannot access response.generative.text - it's None or doesn't exist")

client.close()  # Free up resources
# END RAG
