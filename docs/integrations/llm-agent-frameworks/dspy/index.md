---
title: DSPy
sidebar_position: 1
image: og/docs/more-resources.jpg
---
[DSPy](https://github.com/stanfordnlp/dspy) from Stanford NLP is a framework for programming language models.

DSPy introduces two key concepts, the **programming model** and **optimizers**.

- **Programing model**: The programming model lets you define a series of components that make a language model request. Components include input fields, output fields, task descriptions, and calls to a vector database like Weaviate.

- **Optimizers**: Optimizers compile your DSPy program to tune the language model prompt and/or the weights.

## DSPy and Weaviate

Weaviate is integrated with DSPy through the retriever model! 

Connect your Weaviate cluster (WCD or local instance) to DSPy, use the [retriever module](https://github.com/stanfordnlp/dspy/blob/6270e951b1f20b2cb02a3fdc769156e7e16dbd26/dspy/retrieve/weaviate_rm.py#L17) and pass in your collection:

```python
weaviate_client = weaviate.Client("http://localhost:8080") # or pass in your WCD cluster url

retriever_module = WeaviateRM("WeaviateBlogChunk", # collection name
                    weaviate_client=weaviate_client)
```

## Our Resources 
Here are a few resources from the Weaviate team on using DSPy!

The resources are broken into two categories: 
1. [**Hands on Learning**](#hands-on-learning): Build your technical understanding with end-to-end tutorials.

2. [**Read and Listen**](#read-and-listen): Develop your conceptual understanding of these technologies.


### Hands on Learning 

| Topic | Description | Resource | 
| --- | --- | --- |
| Getting Started with RAG in DSPy | Learn about DSPy and how to build a program: Installation, settings, datasets, LLM metrics, DSPy programming model, and optimization. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/1.Getting-Started-with-RAG-in-DSPy.ipynb), [Video](https://youtu.be/CEuUG4Umfxs?si=4Gp8gR9glmoMJNaU) |
| DSPy + Weaviate for the Next Generation of LLM Apps | Build a 4-layer DSPy program for generating blog posts from queries. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/2.Writing-Blog-Posts-with-DSPy.ipynb), [Video](https://youtu.be/ickqCzFxWj0?si=AxCbD9tq2cbAH6bB)|
| RAG with Persona | Build a compound AI system with DSPy, Cohere, and Weaviate, where you'll add a persona to the language model. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/fullstack-recipes/RAGwithPersona/4.RAG-with-Persona.ipynb), [Post](https://twitter.com/ecardenas300/status/1765444492348243976)|
| Adding Depth to RAG Programs | Enhancing DSPy programs by integrating unique input-output examples and multiple LLMs. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/3.Adding-Depth-to-RAG-Programs.ipynb), [Video](https://youtu.be/0c7Ksd6BG88?si=YUF2wm1ncUTkSuPQ) |
| Hurricane: Writing Blog Posts with Generative Feedback Loops | Introduction to Hurricane, a web app for demonstrating generative feedback loops with blog posts. | [Notebook](https://github.com/weaviate-tutorials/Hurricane), [Blog](https://weaviate.io/blog/hurricane-generative-feedback-loops) |
| Structured Outputs with DSPy | The three methods for structuring outputs in DSPy programs. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/4.Structured-Outputs-with-DSPy.ipynb), [Video](https://youtu.be/tVw3CwrN5-8?si=P7fWeXzQ7p-2SFYF) |
| Building RAG with Command R+ from Cohere, DSPy, and Weaviate | Overview of Command R+ with a quick RAG demo in DSPy. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/llms/Command-R-Plus.ipynb), [Video](https://youtu.be/6dgXALb_5Ag?si=nSX2AnmpbUau_2JF) |
| Advanced Optimizers in DSPy | Dive into optimizing DSPy programs with various techniques. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/5.Advanced-Optimizers.ipynb) |
| Llama 3 RAG Demo with DSPy Optimization, Ollama, and Weaviate | Integrating Llama3 with DSPy and optimizing prompts with MIPRO. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/llms/Llama3.ipynb), [Video](https://youtu.be/1h3_h8t3L14?si=G4d-aY5Ynpv8ckea)|
| BigQuery and Weaviate orchestrated with DSPy | Build an end-to-end RAG pipeline that uses BigQuery and Weaviate using DSPy. | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/cloud-hyperscalers/google/bigquery/BigQuery-Weaviate-DSPy-RAG.ipynb)|
| DSPy and Weaviate Query Agent | Use the Query Agent as a Tool with DSPy | [Notebook](https://github.com/weaviate/recipes/blob/main/integrations/llm-agent-frameworks/dspy/Query-Agent-as-a-Tool.ipynb) |


### Read and Listen

| Topic | Description | Resource | 
| --- | --- | --- |
| DSPy and ColBERT with Omar Khattab! - Weaviate Podcast #85 | Omar Khattab joins the Weaviate podcast to discuss DSPy and ColBERT. | [Video](https://www.youtube.com/watch?v=CDung1LnLbY) |
| DSPy Explained| Learn about the core concepts of DSPy. Walk through the introduction notebooks to compile a simple retrieve-then-read RAG program and Multi-Hop RAG Program. | [Video](https://youtu.be/41EfOY0Ldkc?si=sFieUeHc9rXRn6uk)|
| XMC.dspy with Karel D'Oosterlinck - Weaviate Podcast #87 | Karel D'Oosterlinck joins the Weaviate podcast to discuss IReRa (Infer-Retrieve-Rank). | [Video](https://youtu.be/_ye26_8XPcs?si=ZBodgHbOcaq2Kwky)
| Intro to DSPy: Goodbye Prompting, Hello Programming | Overview of DSPy and how it solves the fragility problem in LLM-based applications. | [Blog](https://towardsdatascience.com/intro-to-dspy-goodbye-prompting-hello-programming-4ca1c6ce3eb9)|
| Fine-Tuning Cohere’s Reranker | Generate synthetic data with DSPy to fine-tune Cohere’s reranker model. |[Blog](https://weaviate.io/blog/fine-tuning-coheres-reranker)|
| Your Language Model Deserves Better Prompting | Overview of the DSPy optimizers for prompt tuning. | [Blog](https://weaviate.io/blog/dspy-optimizers)|


## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
