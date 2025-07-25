weaviate_version = "1.23.10"

# START SimpleInstantiationEmbedded
import weaviate
import os

client = weaviate.connect_to_embedded(
    version=weaviate_version,  # e.g. version="1.26.5"
    headers={
        "X-OpenAI-Api-Key": os.getenv("OPENAI_APIKEY")  # Replace with your API key
    },
    environment_variables={"LOG_LEVEL": "error"}  # Reduce amount of logs
)

# Add your client code here.

# END SimpleInstantiationEmbedded

assert client.is_ready()

client.close()


# START ModuleInstantiationEmbedded
import weaviate
from weaviate.embedded import EmbeddedOptions
import os

client = weaviate.WeaviateClient(
    embedded_options=EmbeddedOptions(
        additional_env_vars={
            "ENABLE_MODULES": "backup-filesystem,text2vec-openai,text2vec-cohere,text2vec-huggingface,ref2vec-centroid,generative-openai,qna-openai",
            "BACKUP_FILESYSTEM_PATH": "/tmp/backups"
        }
    )
    # Add additional options here. For syntax, see the Python client documentation.
)

# Run your client code in a context manager or call client.close()
# before exiting the client to avoid connection errors.
client.connect()  # Call `connect()` to connect to the server when you use `WeaviateClient`

# Add your client code here.

# END ModuleInstantiationEmbedded

assert client.is_ready()

client.close()


# START FullInstantiationEmbedded
import weaviate
from weaviate.embedded import EmbeddedOptions
import os

client = weaviate.WeaviateClient(
    embedded_options=EmbeddedOptions(
        additional_env_vars={
            "ENABLE_MODULES": "backup-filesystem,text2vec-openai,text2vec-cohere,text2vec-huggingface,ref2vec-centroid,generative-openai,qna-openai",
            "BACKUP_FILESYSTEM_PATH": "/tmp/backups"
        }
    )
    # Add additional options here (see Python client docs for syntax)
)

client.connect()  # Call `connect()` to connect to the server when you use `WeaviateClient`

# Add your client code here.

# Uncomment the next line to exit the Embedded Weaviate server.
# client.close()

# END FullInstantiationEmbedded

assert client.is_ready()

client.close()
