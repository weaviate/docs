import os
from weaviate.classes.config import Configure

# ================================
# ===== INSTANTIATION-COMMON =====
# ================================

import weaviate

def import_data():
    collection = client.collections.create(
        "DemoCollection",
        vector_config=Configure.Vectors.text2vec_openai(),
    )

    source_objects = [
        {"title": "The Shawshank Redemption"},
        {"title": "The Godfather"},
        {"title": "The Dark Knight"},
        {"title": "Jingle All the Way"},
        {"title": "A Christmas Carol"},
    ]

    with collection.batch.fixed_size(batch_size=200) as batch:
        for src_obj in source_objects:
            weaviate_obj = {
                "title": src_obj["title"],
            }
            batch.add_object(
                properties=weaviate_obj,
            )

    if len(collection.batch.failed_objects) > 0:
        print(f"Failed to import {len(collection.batch.failed_objects)} objects")
        for failed in collection.batch.failed_objects:
            print(f"e.g. Failed to import object with error: {failed.message}")

client = weaviate.connect_to_local(
    headers={
        "X-OpenAI-Api-Key": os.environ["OPENAI_APIKEY"],
        "X-Cohere-Api-Key": os.environ["COHERE_APIKEY"],
        "X-Anthropic-Api-Key": os.environ["ANTHROPIC_APIKEY"],
    }
)

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeAnthropic
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.anthropic()
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeAnthropic

# clean up
client.collections.delete("DemoCollection")

# START GenerativeAnthropicCustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.anthropic(
        model="claude-3-opus-20240229"
    )
    # highlight-end
    # Additional parameters not shown
)
# END GenerativeAnthropicCustomModel

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeAnthropic
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.anthropic(
        # # These parameters are optional
        # base_url="https://api.anthropic.com",
        # model="claude-3-opus-20240229",
        # max_tokens=512,
        # temperature=0.7,
        # stop_sequences=["\n\n"],
        # top_p=0.9,
        # top_k=5,
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativeAnthropic

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionAnthropic
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.anthropic(
        # # These parameters are optional
        # base_url="https://api.anthropic.com",
        # model="claude-3-opus-20240229",
        # max_tokens=512,
        # temperature=0.7,
        # stop_sequences=["\n\n"],
        # top_p=0.9,
        # top_k=5,
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionAnthropic

# START WorkingWithImagesAnthropic
import base64
import requests
from weaviate.classes.generate import GenerativeConfig, GenerativeParameters

src_img_path = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Winter_forest_silver.jpg/960px-Winter_forest_silver.jpg"
base64_image = base64.b64encode(requests.get(src_img_path).content).decode('utf-8')

prompt = GenerativeParameters.grouped_task(
    # highlight-start
    prompt="Which movie is closest to the image in terms of atmosphere",
    images=[base64_image],      # A list of base64 encoded strings of the image bytes
    # image_properties=["img"], # Properties containing images in Weaviate
    # highlight-end
)

jeopardy = client.collections.get("DemoCollection")
response = jeopardy.generate.near_text(
    query="Movies",
    limit=5,
    # highlight-start
    grouped_task=prompt,
    # highlight-end
    generative_provider=GenerativeConfig.anthropic(
        max_tokens=1000
    ),
)

# Print the source property and the generated response
for o in response.objects:
    print(f"Title property: {o.properties['title']}")
print(f"Grouped task result: {response.generative.text}")
# END WorkingWithImagesAnthropic

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeAnyscale
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.anyscale()
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeAnyscale

# clean up
client.collections.delete("DemoCollection")

# START GenerativeAnyscaleCustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.anyscale(
        model="mistralai/Mixtral-8x7B-Instruct-v0.1"
    )
    # highlight-end
    # Additional parameters not shown
)
# END GenerativeAnyscaleCustomModel

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeAnyscale
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.anyscale(
        # # These parameters are optional
        # model="meta-llama/Llama-2-70b-chat-hf",
        # temperature=0.7,
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativeAnyscale

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionAnyscale
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.anyscale(
        # # These parameters are optional
        # base_url="https://api.anthropic.com",
        # model="meta-llama/Llama-2-70b-chat-hf",
        # temperature=0.7,
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionAnyscale

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeAWSBedrock
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.aws(
        region="us-east-1",
        service="bedrock",
        model="cohere.command-r-plus-v1:0"
    )
    # highlight-end
)
# END BasicGenerativeAWSBedrock

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeAWSSagemaker
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.aws(
        region="us-east-1",
        service="sagemaker",
        endpoint="<custom_sagemaker_url>"
    )
    # highlight-end
)
# END BasicGenerativeAWSSagemaker

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionAWS
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.aws(
        region="us-east-1",
        service="bedrock", # You can also use sagemaker
        model="cohere.command-r-plus-v1:0"
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionAWS

# START WorkingWithImagesAWS
import base64
import requests
from weaviate.classes.generate import GenerativeConfig, GenerativeParameters

src_img_path = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Winter_forest_silver.jpg/960px-Winter_forest_silver.jpg"
base64_image = base64.b64encode(requests.get(src_img_path).content).decode('utf-8')

prompt = GenerativeParameters.grouped_task(
    # highlight-start
    prompt="Which movie is closest to the image in terms of atmosphere",
    images=[base64_image],      # A list of base64 encoded strings of the image bytes
    # image_properties=["img"], # Properties containing images in Weaviate
    # highlight-end
)

jeopardy = client.collections.get("DemoCollection")
response = jeopardy.generate.near_text(
    query="Movies",
    limit=5,
    # highlight-start
    grouped_task=prompt,
    # highlight-end
    generative_provider=GenerativeConfig.aws(
        region="us-east-1",
        service="bedrock", # You can also use sagemaker
        model="cohere.command-r-plus-v1:0"
    ),
)

# Print the source property and the generated response
for o in response.objects:
    print(f"Title property: {o.properties['title']}")
print(f"Grouped task result: {response.generative.text}")
# END WorkingWithImagesAWS

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeCohere
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.cohere()
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeCohere

# clean up
client.collections.delete("DemoCollection")

# START GenerativeCohereCustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.cohere(
        model="command-r-plus"
    )
    # highlight-end
    # Additional parameters not shown
)
# END GenerativeCohereCustomModel

# clean up
client.collections.delete("DemoCollection")


# START FullGenerativeCohere
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.cohere(
        # # These parameters are optional
        # model="command-r",
        # temperature=0.7,
        # max_tokens=500,
        # k=5,
        # stop_sequences=["\n\n"],
        # return_likelihoods="GENERATION"
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativeCohere

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionCohere
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.cohere(
        # # These parameters are optional
        # model="command-r",
        # temperature=0.7,
        # max_tokens=500,
        # k=5,
        # stop_sequences=["\n\n"],
        # return_likelihoods="GENERATION"
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionCohere

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeDatabricks
from weaviate.classes.config import Configure

databricks_generative_endpoint = os.getenv("DATABRICKS_GENERATIVE_ENDPOINT")
client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.databricks(endpoint=databricks_generative_endpoint)
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeDatabricks

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeDatabricks
from weaviate.classes.config import Configure

databricks_generative_endpoint = os.getenv("DATABRICKS_GENERATIVE_ENDPOINT")
client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.databricks(
        endpoint=databricks_generative_endpoint
        # # These parameters are optional
        # max_tokens=500,
        # temperature=0.7,
        # top_p=0.7,
        # top_k=0.1
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativeDatabricks

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionDatabricks
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.databricks(
        # # These parameters are optional
        # max_tokens=500,
        # temperature=0.7,
        # top_p=0.7,
        # top_k=0.1
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionDatabricks

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeFriendliAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    generative_config=Configure.Generative.friendliai()
    # Additional parameters not shown
)
# END BasicGenerativeFriendliAI

# clean up
client.collections.delete("DemoCollection")

# START GenerativeFriendliAICustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.friendliai(
        model="meta-llama-3.1-70b-instruct",
    )
    # highlight-end
    # Additional parameters not shown
)
# END GenerativeFriendliAICustomModel

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeFriendliAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    generative_config=Configure.Generative.friendliai(
        # # These parameters are optional
        # model="meta-llama-3.1-70b-instruct",
        # max_tokens=500,
        # temperature=0.7,
        # base_url="https://inference.friendli.ai"
    )
)
# END FullGenerativeFriendliAI

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionFriendliAI
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.friendliai(
        # # These parameters are optional
        # model="meta-llama-3.1-70b-instruct",
        # max_tokens=500,
        # temperature=0.7,
        # base_url="https://inference.friendli.ai"
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionFriendliAI

# clean up
client.collections.delete("DemoCollection")

# START DedicatedGenerativeFriendliAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    generative_config=Configure.Generative.friendliai(
        model = "YOUR_ENDPOINT_ID",
    )
)
# END DedicatedGenerativeFriendliAI

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeGoogleVertex
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.google(
        project_id="<google-cloud-project-id>",  # Required for Vertex AI
        model_id="gemini-1.0-pro"
    )
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeGoogleVertex

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeGoogleStudio
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.google(
        model_id="gemini-pro"
    )
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeGoogleStudio

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeGoogle
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.google(
        # project_id="<google-cloud-project-id>",  # Required for Vertex AI
        # model_id="<google-model-id>",
        # api_endpoint="<google-api-endpoint>",
        # temperature=0.7,
        # top_k=5,
        # top_p=0.9,
        # vectorize_collection_name=False,
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativeGoogle

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionGoogle
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.google(
        # # These parameters are optional
        # project_id="<google-cloud-project-id>",  # Required for Vertex AI
        # model_id="<google-model-id>",
        # api_endpoint="<google-api-endpoint>",
        # temperature=0.7,
        # top_k=5,
        # top_p=0.9,
        # vectorize_collection_name=False,
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionGoogle

# START WorkingWithImagesGoogle
import base64
import requests
from weaviate.classes.generate import GenerativeConfig, GenerativeParameters

src_img_path = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Winter_forest_silver.jpg/960px-Winter_forest_silver.jpg"
base64_image = base64.b64encode(requests.get(src_img_path).content).decode('utf-8')

prompt = GenerativeParameters.grouped_task(
    # highlight-start
    prompt="Which movie is closest to the image in terms of atmosphere",
    images=[base64_image],      # A list of base64 encoded strings of the image bytes
    # image_properties=["img"], # Properties containing images in Weaviate
    # highlight-end
)

jeopardy = client.collections.get("DemoCollection")
response = jeopardy.generate.near_text(
    query="Movies",
    limit=5,
    # highlight-start
    grouped_task=prompt,
    # highlight-end
    generative_provider=GenerativeConfig.google(
        max_tokens=1000
    ),
)

# Print the source property and the generated response
for o in response.objects:
    print(f"Title property: {o.properties['title']}")
print(f"Grouped task result: {response.generative.text}")
# END WorkingWithImagesGoogle

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeMistral
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.mistral()
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeMistral

# clean up
client.collections.delete("DemoCollection")

# START GenerativeMistralCustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.mistral(
        model="mistral-large-latest"
    )
    # highlight-end
    # Additional parameters not shown
)
# END GenerativeMistralCustomModel

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeMistral
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.mistral(
        # # These parameters are optional
        # model="mistral-large",
        # temperature=0.7,
        # max_tokens=500,
    )
    # highlight-end
)
# END FullGenerativeMistral

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionMistral
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.mistral(
        # # These parameters are optional
        # model="mistral-large",
        # temperature=0.7,
        # max_tokens=500,
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionMistral

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeNVIDIA
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.nvidia()
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeNVIDIA

# clean up
client.collections.delete("DemoCollection")

# START GenerativeNVIDIACustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    generative_config=Configure.Generative.nvidia(
        model="nvidia/llama-3.1-nemotron-70b-instruct"
    )
    # Additional parameters not shown
)
# END GenerativeNVIDIACustomModel

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeNVIDIA
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.nvidia(
        # # These parameters are optional
        # base_url="https://integrate.api.nvidia.com/v1",
        # model="meta/llama-3.3-70b-instruct",
        # temperature=0.7,
        # max_tokens=1024
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativeNVIDIA

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionNVIDIA
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.nvidia(
        # # These parameters are optional
        # base_url="https://integrate.api.nvidia.com/v1",
        # model="meta/llama-3.3-70b-instruct",
        # temperature=0.7,
        # max_tokens=1024
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionNVIDIA

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeOctoAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    generative_config=Configure.Generative.octoai()
    # Additional parameters not shown
)
# END BasicGenerativeOctoAI

# clean up
client.collections.delete("DemoCollection")

# START GenerativeOctoAICustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    generative_config=Configure.Generative.octoai(
        model="meta-llama-3-70b-instruct"
    )
    # Additional parameters not shown
)
# END GenerativeOctoAICustomModel

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeOctoAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    generative_config=Configure.Generative.octoai(
        # # These parameters are optional
        model = "meta-llama-3-70b-instruct",
        max_tokens = 500,
        temperature = 0.7,
        base_url = "https://text.octoai.run"
    )
)
# END FullGenerativeOctoAI

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeOpenAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.openai()
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeOpenAI

# clean up
client.collections.delete("DemoCollection")

# START GenerativeOpenAICustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.openai(
        model="gpt-4-1106-preview"
    )
    # highlight-end
    # Additional parameters not shown
)
# END GenerativeOpenAICustomModel

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeOpenAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.openai(
        # # These parameters are optional
        # model="gpt-4",
        # frequency_penalty=0,
        # max_tokens=500,
        # presence_penalty=0,
        # temperature=0.7,
        # top_p=0.7,
        # base_url="<custom_openai_url>"
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativeOpenAI

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionOpenAI
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.openai(
        # # These parameters are optional
        # model="gpt-4",
        # frequency_penalty=0,
        # max_tokens=500,
        # presence_penalty=0,
        # temperature=0.7,
        # top_p=0.7,
        # base_url="<custom_openai_url>"
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionOpenAI

# START WorkingWithImagesOpenAI
import base64
import requests
from weaviate.classes.generate import GenerativeConfig, GenerativeParameters

src_img_path = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Winter_forest_silver.jpg/960px-Winter_forest_silver.jpg"
base64_image = base64.b64encode(requests.get(src_img_path).content).decode('utf-8')

prompt = GenerativeParameters.grouped_task(
    # highlight-start
    prompt="Which movie is closest to the image in terms of atmosphere",
    images=[base64_image],      # A list of base64 encoded strings of the image bytes
    # image_properties=["img"], # Properties containing images in Weaviate
    # highlight-end
)

jeopardy = client.collections.get("DemoCollection")
response = jeopardy.generate.near_text(
    query="Movies",
    limit=5,
    # highlight-start
    grouped_task=prompt,
    # highlight-end
    generative_provider=GenerativeConfig.openai(
        max_tokens=1000
    ),
)

# Print the source property and the generated response
for o in response.objects:
    print(f"Title property: {o.properties['title']}")
print(f"Grouped task result: {response.generative.text}")
# END WorkingWithImagesOpenAI

# clean up
client.collections.delete("DemoCollection")

# START BasicGenerativeAzureOpenAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.azure_openai(
        resource_name="<azure-resource-name>",
        deployment_id="<azure-deployment-id>",
    )
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeAzureOpenAI

# START BasicGenerativexAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.xai()
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativexAI

# START GenerativexAICustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    generative_config=Configure.Generative.xai(
        model="grok-2-latest"
    )
    # Additional parameters not shown
)
# END GenerativexAICustomModel

# START FullGenerativexAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.xai(
        # # These parameters are optional
        # base_url="https://api.x.ai/v1"
        # model="grok-2-latest",
        # max_tokens=500,
        # temperature=0.7,
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativexAI

# clean up
client.collections.delete("DemoCollection")

# START RuntimeModelSelectionxAI
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.xai(
        # # These parameters are optional
        # base_url="https://api.x.ai/v1"
        # model="grok-2-latest",
        # max_tokens=500,
        # temperature=0.7,
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionxAI

# START FullGenerativeKubeAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.openai(
        # Setting the model and base_url is required
        model="gpt-3.5-turbo",
        base_url="http://kubeai/openai", # Your private KubeAI API endpoint
        # These parameters are optional
        # frequency_penalty=0,
        # max_tokens=500,
        # presence_penalty=0,
        # temperature=0.7,
        # top_p=0.7,
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativeKubeAI

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionKubeAI
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.openai(
        # Setting the model and base_url is required
        model="gpt-3.5-turbo",
        base_url="http://kubeai/openai", # Your private KubeAI API endpoint
        # These parameters are optional
        # frequency_penalty=0,
        # max_tokens=500,
        # presence_penalty=0,
        # temperature=0.7,
        # top_p=0.7,
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionKubeAI

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeAzureOpenAI
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.azure_openai(
        resource_name="<azure-resource-name>",
        deployment_id="<azure-deployment-id>",
        # # These parameters are optional
        # frequency_penalty=0,
        # max_tokens=500,
        # presence_penalty=0,
        # temperature=0.7,
        # top_p=0.7,
        # base_url="<custom-azure-url>"
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativeAzureOpenAI

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionAzureOpenAI
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.azure_openai(
        resource_name="<azure-resource-name>",
        deployment_id="<azure-deployment-id>",
        # # These parameters are optional
        # frequency_penalty=0,
        # max_tokens=500,
        # presence_penalty=0,
        # temperature=0.7,
        # top_p=0.7,
        # base_url="<custom-azure-url>"
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionAzureOpenAI

# START BasicGenerativeOllama
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.ollama(
        api_endpoint="http://host.docker.internal:11434",  # If using Docker, use this to contact your local Ollama instance
        model="llama3"  # The model to use, e.g. "phi3", or "mistral", "command-r-plus", "gemma"
    )
    # highlight-end
    # Additional parameters not shown
)
# END BasicGenerativeOllama

# clean up
client.collections.delete("DemoCollection")

# START FullGenerativeOllama
from weaviate.classes.config import Configure

client.collections.create(
    "DemoCollection",
    # highlight-start
    generative_config=Configure.Generative.ollama(
        api_endpoint="http://host.docker.internal:11434",  # If using Docker, use this to contact your local Ollama instance
        model="llama3"  # The model to use, e.g. "phi3", or "mistral", "command-r-plus", "gemma"
    )
    # highlight-end
    # Additional parameters not shown
)
# END FullGenerativeOllama

# clean up
client.collections.delete("DemoCollection")
import_data()

# START RuntimeModelSelectionOllama
from weaviate.classes.config import Configure
from weaviate.classes.generate import GenerativeConfig

collection = client.collections.get("DemoCollection")
response = collection.generate.near_text(
    query="A holiday film",
    limit=2,
    grouped_task="Write a tweet promoting these two movies",
    # highlight-start
    generative_provider=GenerativeConfig.ollama(
        api_endpoint="http://host.docker.internal:11434",  # If using Docker, use this to contact your local Ollama instance
        model="llama3"  # The model to use, e.g. "phi3", or "mistral", "command-r-plus", "gemma"
    ),
    # Additional parameters not shown
    # highlight-end
)
# END RuntimeModelSelectionOllama

# START WorkingWithImagesOllama
import base64
import requests
from weaviate.classes.generate import GenerativeConfig, GenerativeParameters

src_img_path = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Winter_forest_silver.jpg/960px-Winter_forest_silver.jpg"
base64_image = base64.b64encode(requests.get(src_img_path).content).decode('utf-8')

prompt = GenerativeParameters.grouped_task(
    # highlight-start
    prompt="Which movie is closest to the image in terms of atmosphere",
    images=[base64_image],      # A list of base64 encoded strings of the image bytes
    # image_properties=["img"], # Properties containing images in Weaviate
    # highlight-end
)

jeopardy = client.collections.get("DemoCollection")
response = jeopardy.generate.near_text(
    query="Movies",
    limit=5,
    # highlight-start
    grouped_task=prompt,
    # highlight-end
    generative_provider=GenerativeConfig.ollama(),
)

# Print the source property and the generated response
for o in response.objects:
    print(f"Title property: {o.properties['title']}")
print(f"Grouped task result: {response.generative.text}")
# END WorkingWithImagesOllama

client.collections.delete("DemoCollection")
import_data()

# START SinglePromptExample
collection = client.collections.get("DemoCollection")

response = collection.generate.near_text(
    query="A holiday film",  # The model provider integration will automatically vectorize the query
    # highlight-start
    single_prompt="Translate this into French: {title}",
    limit=2
    # highlight-end
)

for obj in response.objects:
    print(obj.properties["title"])
    print(f"Generated output: {obj.generated}")  # Note that the generated output is per object
# END SinglePromptExample

# START GroupedTaskExample
collection = client.collections.get("DemoCollection")

response = collection.generate.near_text(
    query="A holiday film",  # The model provider integration will automatically vectorize the query
    # highlight-start
    grouped_task="Write a fun tweet to promote readers to check out these films.",
    limit=2
    # highlight-end
)

print(f"Generated output: {response.generated}")  # Note that the generated output is per query
for obj in response.objects:
    print(obj.properties["title"])
# END GroupedTaskExample

client.close()
