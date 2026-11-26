# Decision-model rerankers (reranker-typesafeai, reranker-openai).
# These examples need a Python client release that is not out yet,
# so this file is not part of the test suite. Do not add it to tests/ until that release ships.
import os

import weaviate

# START TypeSafeAIInstantiation
# Recommended: save sensitive data as environment variables
typesafeai_key = os.getenv("TYPESAFEAI_API_KEY")

client = weaviate.connect_to_local(
    # highlight-start
    headers={
        "X-Typesafeai-Api-Key": typesafeai_key,
    }
    # highlight-end
)
# END TypeSafeAIInstantiation

client.close()

# START OpenAIDecisionInstantiation
# Recommended: save sensitive data as environment variables
openai_key = os.getenv("OPENAI_API_KEY")

client = weaviate.connect_to_local(
    # highlight-start
    headers={
        "X-Openai-Api-Key": openai_key,
        # "X-Openai-Organization": "org-...",  # Optional
    }
    # highlight-end
)
# END OpenAIDecisionInstantiation

# START RerankerTypeSafeAIBasic
from weaviate.classes.config import Configure

client.collections.create(
    "Tickets",
    # highlight-start
    reranker_config=Configure.Reranker.typesafeai()
    # highlight-end
    # Additional parameters not shown
)
# END RerankerTypeSafeAIBasic

# Clean up
client.collections.delete("Tickets")

# START RerankerTypeSafeAICustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "Tickets",
    # highlight-start
    reranker_config=Configure.Reranker.typesafeai(
        model="jev-latest",
        # base_url="https://api.typesafe.ai",  # Host only, no path
    )
    # highlight-end
    # Additional parameters not shown
)
# END RerankerTypeSafeAICustomModel

# Clean up
client.collections.delete("Tickets")

# START RerankerOpenAIDecisionBasic
from weaviate.classes.config import Configure

client.collections.create(
    "Tickets",
    # highlight-start
    reranker_config=Configure.Reranker.openai()
    # highlight-end
    # Additional parameters not shown
)
# END RerankerOpenAIDecisionBasic

# Clean up
client.collections.delete("Tickets")

# START RerankerOpenAIDecisionCustomModel
from weaviate.classes.config import Configure

client.collections.create(
    "Tickets",
    # highlight-start
    reranker_config=Configure.Reranker.openai(
        model="gpt-6-luna",
        # base_url="https://api.openai.com",  # Host only, no path
    )
    # highlight-end
    # Additional parameters not shown
)
# END RerankerOpenAIDecisionCustomModel

# START RerankerTypeSafeAIReconfigure
from weaviate.classes.config import Reconfigure

tickets = client.collections.use("Tickets")

# highlight-start
tickets.config.update(
    reranker_config=Reconfigure.Reranker.typesafeai()
)
# highlight-end
# END RerankerTypeSafeAIReconfigure

# START RerankerOpenAIDecisionReconfigure
from weaviate.classes.config import Reconfigure

tickets = client.collections.use("Tickets")

# highlight-start
tickets.config.update(
    reranker_config=Reconfigure.Reranker.openai()
)
# highlight-end
# END RerankerOpenAIDecisionReconfigure

# START RerankerDecisionQuery
from weaviate.classes.query import Rerank

tickets = client.collections.use("Tickets")

# highlight-start
response = tickets.query.hybrid(
    query="refund not received",  # The search query picks the candidates
    limit=10,
    rerank=Rerank(
        prop="text",                              # A text or blob property
        query="The customer is about to churn"    # The condition the model judges
    )
)
# highlight-end

for obj in response.objects:
    print(obj.metadata.rerank_score, obj.properties["text"])
# END RerankerDecisionQuery

# START RerankerDecisionThreshold
# Every object stays on the page. Keep the ones where the condition likely holds.
matches = [obj for obj in response.objects if obj.metadata.rerank_score > 0.5]
# END RerankerDecisionThreshold

# START RerankerDecisionImage
from weaviate.classes.query import Rerank

products = client.collections.use("Products")

# highlight-start
response = products.query.near_text(
    query="ceramic mug",
    limit=10,
    rerank=Rerank(
        prop="photo",  # A blob property that holds a base64-encoded image
        query="The product has visible damage, such as a crack, chip or dent"
    )
)
# highlight-end

for obj in response.objects:
    print(obj.metadata.rerank_score, obj.uuid)
# END RerankerDecisionImage

client.close()
