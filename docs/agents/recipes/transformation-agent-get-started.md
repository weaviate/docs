---
layout: recipe
colab: https://colab.research.google.com/github/weaviate/recipes/blob/main//weaviate-services/agents/transformation-agent-get-started.ipynb
toc: True
title: "Build A Weaviate Transformation Agent"
featured: True
integration: False
agent: True
tags: ['Transformation Agent']
---
    


In this recipe, we will use a Weaviate [`TransformationAgent`](https://weaviate.io/developers/agents/transformation) to enhance our data in Weaviate. We will build an agent that has access to a collection containing a bunch or research papers, their abstracts and titles. We will then use the agent to create additional properties for eaach of our objects in the collection.

> ⚠️ The Weaviate Transformation Agent is designed to modify data in Weaviate in place. **While the Agent is in technical preview, do not use it in a production environment.** The Agent may not work as expected, and the data in your Weaviate instance may be affected in unexpected ways.

The `TransformationAgent` is able to access a Weaviate collection of your chosing, and perform operations on the objects within it. However, each operation for the agent can be defined in natural language. The agent will then use an LLM to complete the instructions in the operation.


> 📚 You can learn more about the new `TransformationAgent`, you can read our accompanyin ["Introducing the Weaviate Transformation Agent"](https://weaviate.io/blog/transformation-agent) blog

To get started, we've prepared an open datasets, available on Hugging Face. The first step will be walking through how to populate your Weaviate Cloud collections.

- [**ArxivPapers:**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-ecommerce) A dataset that lists titles and abstracts of research papers.


If you'd like to try out building more agents with different datasets, check out the list of demo datasets we have available on [Hugging Face Weaviate agents dataset](https://huggingface.co/datasets/weaviate/agents)

## Setting Up Weaviate & Importing Data

To use the Weaviate Transformation Agent, first, create a [Weaviate Cloud](https://weaviate.io/deployment/serverless) account👇
1. [Create Serverless Weaviate Cloud account](https://weaviate.io/deployment/serverless) and setup a free [Sandbox](https://weaviate.io/developers/wcs/manage-clusters/create#sandbox-clusters)
2. Go to 'Embedding' and enable it, by default, this will make it so that we use `Snowflake/snowflake-arctic-embed-l-v2.0` as the embedding model
3. Take note of the `WEAVIATE_URL` and `WEAVIATE_API_KEY` to connect to your cluster below

> Info: We recommend using [Weaviate Embeddings](https://weaviate.io/developers/weaviate/model-providers/weaviate) so you do not have to provide any extra keys for external embedding providers.


```python
!pip install "weaviate-client[agents]" datasets
!pip install -U weaviate-agents
```


```python
import os
from getpass import getpass

if "WEAVIATE_API_KEY" not in os.environ:
  os.environ["WEAVIATE_API_KEY"] = getpass("Weaviate API Key")
if "WEAVIATE_URL" not in os.environ:
  os.environ["WEAVIATE_URL"] = getpass("Weaviate URL")
```


```python
import weaviate
from weaviate.auth import Auth

client = weaviate.connect_to_weaviate_cloud(
        cluster_url=os.environ.get("WEAVIATE_URL"),
        auth_credentials=Auth.api_key(os.environ.get("WEAVIATE_API_KEY")),
)
```

### Prepare the Collections


In the following code block, we are pulling our demo "papers" datasets from Hugging Face and writing them to a new collection in our Weaviate Serverless cluster.

**Important:** Please enable 'Embeddings' in the Weavaite Cloud console. This way, you can use the `text2vec_weaviate` vectorizer, which will create vectors for each object using `Snowflake/snowflake-arctic-embed-l-v2.0` by default.


```python
from weaviate.classes.config import Configure

# To re-run cell you may have to delete collections
# client.collections.delete("ArxivPapers")
client.collections.create(
    "ArxivPapers",
    description="A dataset that lists research paper titles and abstracts",
    vectorizer_config=Configure.Vectorizer.text2vec_weaviate()
)

```



```
<weaviate.collections.collection.sync.Collection at 0x128ae3680>
```



```python
from datasets import load_dataset

dataset = load_dataset("weaviate/agents", "transformation-agent-papers", split="train", streaming=True)

papers_collection = client.collections.get("ArxivPapers")

with papers_collection.batch.dynamic() as batch:
    for i, item in enumerate(dataset):
      if i < 200:
        batch.add_object(properties=item["properties"])
```

### Inspect the Collection in Explorer

The `TransformationAgent` will modify the collection as we go along. This is a good time to take a look at the contents of your "ArxivPapers" collection. You can inspect the data in the Explorer tool in the Weaviate Cloud Console. If all goes well, you should be seeing 2 properties listed for each object:
- `title`: the title of the paper.
- `abstract`: the abstract of the paper.

As well as the `vectors` for each object.

## Define Transformation Operations

The star of the show for the `TransformationAgent` are the operations.

We can now define transformation operations which we want to perform on our collection. An operation can be:

- Appending a new property
- Updating an existing property

Currently, the `TransformationAgent` supports operations that update existing objects in Weaviate.

### Append New Properties

To append a new property, we define an operation with:
- **`instrcution`**: This is where you can describe, in natural language, what you want this new property to be.
- **`property_name`**: The name you want the property to have
- **`data_type`**: The specific datatype the property should be. E.g.: `DataType.TEXT`, `DataType.TEXT_ARRAY`, `DataType.BOOL`, `DataType.INT` etc.
- **`view_properties`**: Sometimes, you may want to create properties that are based on information provided in other properties, this is where you can list out which properties the instruction should view.

#### Create a List of Topics

First, let's append a new property called "topics", which should be a `TEXT_ARRAY`. Based on the "abstract" and "title", let's ask for the LLM to extract a list of topic tags. We can be specific here. Let's ask for no more than 5


```python
from weaviate.agents.classes import Operations
from weaviate.classes.config import DataType

add_topics = Operations.append_property(
    property_name="topics",
    data_type=DataType.TEXT_ARRAY,
    view_properties=["abstract"],
    instruction="""Create a list of topic tags based on the abstract.
    Topics should be distinct from eachother. Provide a maximum of 5 topics.
    Group similar topics under one topic tag.""",
)

```

#### Add a French Translation

Next, let's add a new "french_abstract" property which is simply a translation of the "abstract"


```python
add_french_abstract = Operations.append_property(
      property_name="french_abstract",
      data_type=DataType.TEXT,
      view_properties=["abstract"],
      instruction="Translate the abstract to French",
)
```

#### Update the Title

This time, we are updating the `title` property to include the French translation of itself in parantheses.


```python
update_title = Operations.update_property(
    property_name="title",
    view_properties=["title"],
    instruction="""Update the title to ensure that it contains the French translation of itself in parantheses, after the original title.""",
)
```

#### Determine If It's a Survey Paper

Finally, let's ask for a `BOOL` property which indicates whether the paper is a survey or not. I.e., we'll ask the LLM to determine if the paper presents  novel techniques, or whether it's a survey of existing ones.


```python
is_survey_paper = Operations.append_property(
    property_name="is_survey_paper",
    data_type=DataType.BOOL,
    view_properties=["abstract"],
    instruction="""Determine if the paper is a "survey".
    A paper is considered survey it's a surveys existing techniques, and not if it presents novel techniques""",
)
```

## Create & Run the Transformation Agent

Once we have all of our operations defined, we can initialize a `TransformationAgent`.

When initializing the agent, we have to decide which `collection` it may have accesss to modify. In this case, we want it to have access to the "ArxivPapers" collection we previously created.

Next, we need to provide a list of `operations` which the agent should run. Here, we provide all the operations we defined above.

> Note: We are working on resolving a known issue which can result in data consistency issues when multiple operations act on the same object at once.


```python
from weaviate.agents.transformation import TransformationAgent

agent = TransformationAgent(
    client=client,
    collection="ArxivPapers",
    operations=[
        add_topics,
        add_french_abstract,
        is_survey_paper,
        update_title,
    ],
)
```

### Running the Transformations

By calling `update_all()`, we get the agent to spin up individual workflows for each operation. Each operation will then run on each object in our collectoion.


```python
response = agent.update_all()
```

### Inspect the Operation Workflows

To inspect the status of our operations, we can take a look at the `workflow_id` in each `TransformationResponse` returned, and get their status with `agent.get_status(workflow_id)`. These operations are asynchronous.


```python
response
```




    [TransformationResponse(operation_name='topics', workflow_id='TransformationWorkflow-1766a450c35039c2a44e1fa33dc49dd4'),
     TransformationResponse(operation_name='french_abstract', workflow_id='TransformationWorkflow-67e90d88830347a5581d3ee1aa10b867'),
     TransformationResponse(operation_name='is_survey_paper', workflow_id='TransformationWorkflow-6294dd575fad55c318ee7b0e8a38a8ff'),
     TransformationResponse(operation_name='title', workflow_id='TransformationWorkflow-bba64a5bf204b00c3572310de715d1e2')]




```python
agent.get_status(workflow_id=response[0].workflow_id)
```



```
    {'workflow_id': 'TransformationWorkflow-1766a450c35039c2a44e1fa33dc49dd4',
     'status': {'batch_count': 1,
      'end_time': '2025-03-11 14:58:57',
      'start_time': '2025-03-11 14:57:55',
      'state': 'completed',
      'total_duration': 62.56732,
      'total_items': 200}}
```

