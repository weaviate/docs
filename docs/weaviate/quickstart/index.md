---
title: Quickstart (with cloud resources)
image: og/docs/quickstart-tutorial.jpg
# tags: ['getting started']
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import SkipLink from "/src/components/SkipValidationLink";
import CardsSection from "/src/components/CardsSection";
import Tooltip from "/src/components/Tooltip";

export const quickstartOptions = [
  {
    title: "Vectorize objects during import",
    description:
      "Import objects and vectorize them with the Weaviate Embeddings service.",
    link: "?import=vectorization",
    icon: "fas fa-arrows-spin",
    groupId: "import",
    activeTab: "vectorization",
  },
  {
    title: "Import vectors",
    description: "Import pre-computed vector embeddings along with your data.",
    link: "?import=custom-embeddings",
    icon: "fas fa-circle-nodes",
    groupId: "import",
    activeTab: "custom-embeddings",
  },
];

<br />
<CardsSection items={quickstartOptions} />

---

<Tabs groupId="import" queryString="import">
<TabItem value="vectorization" label="Vectorize objects during import">

Weaviate is an open-source vector database built to power AI applications, from prototypes to production-scale systems. This quickstart guide will show you how to:

1. **Create a collection & import data** - Create a collection and import data into it. The data will be vectorized with the Weaviate Embeddings service.
2. **Search** - Perform a similarity (vector) search on your data using a text query.
3. **RAG** - Perform Retrieval Augmented Generation (RAG) with a generative model.

</TabItem>
<TabItem value="custom-embeddings" label="Import vectors">

Weaviate is an open-source vector database built to power AI applications, from prototypes to production-scale systems. This quickstart guide will show you how to:

1. **Create a collection & import data**- Create a collection and import data into it. The data should already contain the vector embedding.
2. **Search** - Perform a similarity (vector) search on your data using a vector query.
3. **RAG** - Perform Retrieval Augmented Generation (RAG) with a generative model.

</TabItem>
</Tabs>

import KapaAI from '/src/components/KapaAI';

If you encounter any issues along the way or have additional questions, use the <KapaAI>Ask AI</KapaAI> feature.
## Prerequisites

A **[Weaviate Cloud](https://console.weaviate.cloud/)** Sandbox instance - you will need an admin **API key** and a **REST endpoint URL**. See the instructions below for more info.

<details>
<summary>How to set up a Weaviate Cloud Sandbox instance</summary>

Go to the [Weaviate Cloud console](https://console.weaviate.cloud) and create a free Sandbox instance as shown in the interactive example below.

<div
  style={{
    position: "relative",
    paddingBottom: "calc(54.10879629629629% + 50px)",
    height: 0,
  }}
>
  <iframe
    id="mk6l470aqk"
    src="https://app.guideflow.com/embed/mk6l470aqk"
    width="100%"
    height="100%"
    style={{ overflow: "hidden", position: "absolute", border: "none" }}
    scrolling="no"
    allow="clipboard-read; clipboard-write"
    webKitAllowFullScreen
    mozAllowFullScreen
    allowFullScreen
    allowTransparency="true"
  />
  <script
    src="https://app.guideflow.com/assets/opt.js"
    data-iframe-id="mk6l470aqk"
  ></script>
</div>

<br />

:::note

- Cluster provisioning typically takes 1-3 minutes.
- When the cluster is ready, Weaviate Cloud displays a checkmark (`✔️`) next to the cluster name.
- Note that Weaviate Cloud adds a random suffix to sandbox cluster names to ensure uniqueness.

:::

</details>

<details>
<summary>How to retrieve Weaviate Cloud credentials (`WEAVIATE_API_KEY` and `WEAVIATE_URL`)</summary>

After you create a Weaviate Cloud instance, you will need the:

- **REST Endpoint URL** and the
- **Administrator API Key**.

You can retrieve them both from the [WCD console](https://console.weaviate.cloud) as shown in the interactive example below.

<div
  style={{
    position: "relative",
    paddingBottom: "calc(54.10879629629629% + 50px)",
    height: 0,
  }}
>
  <iframe
    id="ok8l954sxr"
    src="https://app.guideflow.com/embed/ok8l954sxr"
    width="100%"
    height="100%"
    style={{ overflow: "hidden", position: "absolute", border: "none" }}
    scrolling="no"
    allow="clipboard-read; clipboard-write"
    webKitAllowFullScreen
    mozAllowFullScreen
    allowFullScreen
    allowTransparency="true"
  />
  <script
    src="https://app.guideflow.com/assets/opt.js"
    data-iframe-id="ok8l954sxr"
  ></script>
</div>

<br />

:::info REST vs gRPC endpoints

Weaviate supports both REST and gRPC protocols. For Weaviate Cloud deployments, you only need to provide the REST endpoint URL - the client will automatically configure gRPC.

:::

Once you have the **REST Endpoint URL** and the **admin API key**, you can connect to the Sandbox instance, and work with Weaviate.

</details>

---

## Install a client library

We recommend using a [client library](../client-libraries/index.mdx) to work with Weaviate. Follow the instructions below to install one of the official client libraries, available in [Python](../client-libraries/python/index.mdx), [JavaScript/TypeScript](../client-libraries/typescript/index.mdx), [Go](../client-libraries/go.md), and [Java](../client-libraries/java.md).

import CodeClientInstall from "/_includes/code/quickstart/clients.install.new.mdx";

<CodeClientInstall />

## Step 1: Create a collection & import data {#create-a-collection}

Now, we can populate our database by first defining a <Tooltip content="A collection is a set of objects that share the same data structure, like a table in relational databases or a collection in NoSQL databases. A collection also includes additional configurations that define how the data objects are stored and indexed." position="top"><span style={{ textDecoration: "underline", cursor: "help" }}>collection</span></Tooltip> and then adding data. You can either **[vectorize each object during the import](?import=vectorization#create-a-collection)** (we will use the Weaviate Embeddings service to vectorize the data), or you can **[import pre-computed vector embeddings](?import=custom-embeddings#create-a-collection)**.

<Tabs groupId="import" queryString="import">
<TabItem value="vectorization" label="Vectorize objects during import">

The following example creates a _collection_ called `Movie` with the [Weaviate Embeddings](/weaviate/model-providers/weaviate/embeddings.md) service for creating vectors during ingestion and for querying.

import CreateCollection from "/_includes/code/quickstart/quickstart.short.create_collection.mdx";

<CreateCollection />

</TabItem>
<TabItem value="custom-embeddings" label="Import vectors">

The following example creates a _collection_ called `Movie` and imports precomputed vector embeddings created with the [Weaviate Embeddings](/weaviate/model-providers/weaviate/embeddings.md) service.

import CreateCollectionCustomVectors from "/_includes/code/quickstart/quickstart.short.import_vectors.create_collection.mdx";

<CreateCollectionCustomVectors />

</TabItem>
</Tabs>

## Step 2: Semantic (vector) search {#semantic-search}

<Tabs groupId="import" queryString="import" className="hidden-tabs">
<TabItem value="vectorization" label="Vectorize objects during import">

Semantic search finds results based on meaning. This is called `nearText` in Weaviate. The following example searches for 2 objects (_limit_) whose meaning is most similar to that of `sci-fi`.

import QueryNearText from "/_includes/code/quickstart/quickstart.short.query.neartext.mdx";

<QueryNearText />

</TabItem>
<TabItem value="custom-embeddings" label="Import vectors">

Semantic search finds results based on meaning. This is called `nearText` in Weaviate. The following example searches for 2 objects (_limit_) whose meaning is most similar to that of `sci-fi`.

import QueryNearTextImportVectors from "/_includes/code/quickstart/quickstart.short.import_vectors.query.nearvector.mdx";

<QueryNearTextImportVectors />

</TabItem>
</Tabs>

## Step 3: Retrieval augmented generation (RAG)

:::note
For Retrieval Augmented Generation (RAG) in the last step, you will need a [Claude](https://console.anthropic.com/settings/keys) API key. You can also use another [model provider](/weaviate/model-providers) instead.
:::

<Tabs groupId="import" queryString="import" className="hidden-tabs">
<TabItem value="vectorization" label="Vectorize objects during import">

Retrieval augmented generation (RAG), also called generative search, works by prompting a large language model (LLM) with a combination of a _user query_ and _data retrieved from a database_.

The following example combines the same search (for `sci-fi`) with a prompt to generate a tweet.

import QueryRAG from "/_includes/code/quickstart/quickstart.short.query.rag.mdx";

<QueryRAG />

</TabItem>
<TabItem value="custom-embeddings" label="Import vectors">

Retrieval augmented generation (RAG), also called generative search, works by prompting a large language model (LLM) with a combination of a _user query_ and _data retrieved from a database_.

The following example combines the same search (for `sci-fi`) with a prompt to generate a tweet.

import QueryRAGCustomVectors from "/_includes/code/quickstart/quickstart.short.import-vectors.query.rag.mdx";

<QueryRAG />

</TabItem>
</Tabs>

## Next steps

We recommend you check out the following resources to get started with Weaviate.

import styles from "/src/components/CardsSection/styles.module.scss";

export const nextStepsCardsData = [
  {
    title: "Quick tour of Weaviate",
    description: (
      <>
        Continue with the{" "}
        <span className={styles.highlight}>Quick tour tutorial</span> – an
        end-to-end guide that cover important topics like configuring
        collections, searches, etc.
      </>
    ),
    link: "/weaviate/tutorials/quick-tour-of-weaviate",
    icon: "fas fa-signs-post",
  },
  {
    title: "Weaviate Academy",
    description: (
      <>
        Check out <span className={styles.highlight}>Weaviate Academy</span> – a
        learning platform entered around AI-native development.
      </>
    ),
    link: "https://academy.weaviate.io/",
    icon: "fa-solid fa-graduation-cap",
  },
];

<CardsSection items={nextStepsCardsData} className={styles.smallCards} />
<br />

## Questions and feedback

import DocsFeedback from "/_includes/docs-feedback.mdx";

<DocsFeedback />
