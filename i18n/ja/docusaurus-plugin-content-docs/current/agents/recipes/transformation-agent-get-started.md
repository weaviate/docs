---
layout: recipe
colab: https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-services/agents/transformation-agent-get-started.ipynb
toc: True
title: "Weaviate Transformation エージェントの構築"
featured: True
integration: False
agent: True
tags: ['Transformation Agent']
---
<a href="https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-services/agents/transformation-agent-get-started.ipynb" target="_blank">
  <img src="https://img.shields.io/badge/Open%20in-Colab-4285F4?style=flat&logo=googlecolab&logoColor=white" alt="Open In Google Colab" width="130"/>
</a>

このレシピでは、Weaviate の [`TransformationAgent`](https://docs.weaviate.io/agents/transformation) を使用して、Weaviate 内のデータを強化します。研究論文のタイトルとアブストラクトを含むコレクションにアクセスできるエージェントを構築し、そのエージェントを使ってコレクション内の各オブジェクトに追加プロパティを作成します。

> ⚠️ Weaviate Transformation エージェントは、Weaviate 内のデータをインプレースで変更するよう設計されています。**技術プレビュー期間中は、本番環境での使用は避けてください。** エージェントが期待どおりに動作しない場合や、Weaviate インスタンス内のデータが予期せず変更される可能性があります。

`TransformationAgent` は、任意の Weaviate コレクションにアクセスし、その中のオブジェクトに対して操作を実行できます。ただし、各操作は自然言語で定義できます。エージェントは LLM を使用して指示を実行します。

> 📚 新しい `TransformationAgent` について詳しくは、併せてお読みいただけるブログ記事「[Introducing the Weaviate Transformation Agent](https://weaviate.io/blog/transformation-agent)」をご覧ください。

まずは Hugging Face に公開されているオープンデータセットを用意しました。最初のステップとして、Weaviate Cloud のコレクションをどのように埋め込むかを説明します。

- [**ArxivPapers:**](https://huggingface.co/datasets/weaviate/agents/viewer/query-agent-ecommerce) 研究論文のタイトルとアブストラクトをまとめたデータセットです。

他のデータセットでさらにエージェントを試したい場合は、[Hugging Face Weaviate agents dataset](https://huggingface.co/datasets/weaviate/agents) にあるデモデータセット一覧をご覧ください。

## Weaviate のセットアップとデータのインポート

Weaviate Transformation エージェントを使用するには、まず [Weaviate Cloud](https://weaviate.io/deployment/serverless) アカウントを作成します👇  
1. [Serverless Weaviate Cloud アカウントの作成](https://weaviate.io/deployment/serverless) と無料の [Sandbox](https://docs.weaviate.io/cloud/manage-clusters/create#sandbox-clusters) のセットアップ  
2. 「Embedding」に移動して有効化します。デフォルトでは `Snowflake/snowflake-arctic-embed-l-v2.0` が埋め込みモデルとして使用されます  
3. 下記でクラスターに接続するために `WEAVIATE_URL` と `WEAVIATE_API_KEY` を控えておきます  

> Info: 外部埋め込みプロバイダー用の追加キーを用意しなくても済むよう、[Weaviate Embeddings](https://docs.weaviate.io/weaviate/model-providers/weaviate) の利用を推奨します。

```python
!pip install "weaviate-client[agents]" datasets
!pip install -U weaviate-agents
```

Python output:
```text
/Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/pty.py:95: DeprecationWarning: This process (pid=93073) is multi-threaded, use of forkpty() may lead to deadlocks in the child.
  pid, fd = os.forkpty()

Collecting datasets
  Using cached datasets-3.3.2-py3-none-any.whl.metadata (19 kB)
Requirement already satisfied: weaviate-client[agents] in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (4.11.1)
Requirement already satisfied: httpx&lt;0.29.0,>=0.26.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client[agents]) (0.27.0)
Requirement already satisfied: validators==0.34.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client[agents]) (0.34.0)
Requirement already satisfied: authlib&lt;1.3.2,>=1.2.1 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client[agents]) (1.3.1)
Requirement already satisfied: pydantic&lt;3.0.0,>=2.8.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client[agents]) (2.10.5)
Requirement already satisfied: grpcio&lt;2.0.0,>=1.66.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client[agents]) (1.69.0)
Requirement already satisfied: grpcio-tools&lt;2.0.0,>=1.66.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client[agents]) (1.69.0)
Requirement already satisfied: grpcio-health-checking&lt;2.0.0,>=1.66.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client[agents]) (1.69.0)
Requirement already satisfied: weaviate-agents&lt;1.0.0,>=0.3.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client[agents]) (0.4.0)
Requirement already satisfied: filelock in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from datasets) (3.17.0)
Requirement already satisfied: numpy>=1.17 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from datasets) (2.2.2)
Collecting pyarrow>=15.0.0 (from datasets)
  Using cached pyarrow-19.0.1-cp313-cp313-macosx_12_0_arm64.whl.metadata (3.3 kB)
Collecting dill&lt;0.3.9,>=0.3.0 (from datasets)
  Using cached dill-0.3.8-py3-none-any.whl.metadata (10 kB)
Requirement already satisfied: pandas in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from datasets) (2.2.3)
Requirement already satisfied: requests>=2.32.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from datasets) (2.32.3)
Requirement already satisfied: tqdm>=4.66.3 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from datasets) (4.67.1)
Collecting xxhash (from datasets)
  Using cached xxhash-3.5.0-cp313-cp313-macosx_11_0_arm64.whl.metadata (12 kB)
Collecting multiprocess&lt;0.70.17 (from datasets)
  Using cached multiprocess-0.70.16-py312-none-any.whl.metadata (7.2 kB)
Requirement already satisfied: fsspec&lt;=2024.12.0,>=2023.1.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from fsspec[http]&lt;=2024.12.0,>=2023.1.0->datasets) (2024.12.0)
Requirement already satisfied: aiohttp in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from datasets) (3.11.11)
Requirement already satisfied: huggingface-hub>=0.24.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from datasets) (0.27.1)
Requirement already satisfied: packaging in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from datasets) (24.2)
Requirement already satisfied: pyyaml>=5.1 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from datasets) (6.0.2)
Requirement already satisfied: cryptography in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from authlib&lt;1.3.2,>=1.2.1->weaviate-client[agents]) (44.0.0)
Requirement already satisfied: aiohappyeyeballs>=2.3.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from aiohttp->datasets) (2.4.4)
Requirement already satisfied: aiosignal>=1.1.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from aiohttp->datasets) (1.3.2)
Requirement already satisfied: attrs>=17.3.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from aiohttp->datasets) (24.3.0)
Requirement already satisfied: frozenlist>=1.1.1 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from aiohttp->datasets) (1.5.0)
Requirement already satisfied: multidict&lt;7.0,>=4.5 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from aiohttp->datasets) (6.1.0)
Requirement already satisfied: propcache>=0.2.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from aiohttp->datasets) (0.2.1)
Requirement already satisfied: yarl&lt;2.0,>=1.17.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from aiohttp->datasets) (1.18.3)
Requirement already satisfied: protobuf&lt;6.0dev,>=5.26.1 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from grpcio-health-checking&lt;2.0.0,>=1.66.2->weaviate-client[agents]) (5.29.3)
Requirement already satisfied: setuptools in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from grpcio-tools&lt;2.0.0,>=1.66.2->weaviate-client[agents]) (75.1.0)
Requirement already satisfied: anyio in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpx&lt;0.29.0,>=0.26.0->weaviate-client[agents]) (4.8.0)
Requirement already satisfied: certifi in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpx&lt;0.29.0,>=0.26.0->weaviate-client[agents]) (2024.12.14)
Requirement already satisfied: httpcore==1.* in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpx&lt;0.29.0,>=0.26.0->weaviate-client[agents]) (1.0.7)
Requirement already satisfied: idna in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpx&lt;0.29.0,>=0.26.0->weaviate-client[agents]) (3.10)
Requirement already satisfied: sniffio in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpx&lt;0.29.0,>=0.26.0->weaviate-client[agents]) (1.3.1)
Requirement already satisfied: h11&lt;0.15,>=0.13 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpcore==1.*->httpx&lt;0.29.0,>=0.26.0->weaviate-client[agents]) (0.14.0)
Requirement already satisfied: typing-extensions>=3.7.4.3 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from huggingface-hub>=0.24.0->datasets) (4.12.2)
Requirement already satisfied: annotated-types>=0.6.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from pydantic&lt;3.0.0,>=2.8.0->weaviate-client[agents]) (0.7.0)
Requirement already satisfied: pydantic-core==2.27.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from pydantic&lt;3.0.0,>=2.8.0->weaviate-client[agents]) (2.27.2)
Requirement already satisfied: charset-normalizer&lt;4,>=2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from requests>=2.32.2->datasets) (3.4.1)
Requirement already satisfied: urllib3&lt;3,>=1.21.1 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from requests>=2.32.2->datasets) (2.3.0)
Requirement already satisfied: rich>=13.9.4 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-agents&lt;1.0.0,>=0.3.0->weaviate-client[agents]) (13.9.4)
Requirement already satisfied: python-dateutil>=2.8.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from pandas->datasets) (2.9.0.post0)
Requirement already satisfied: pytz>=2020.1 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from pandas->datasets) (2024.2)
Requirement already satisfied: tzdata>=2022.7 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from pandas->datasets) (2025.1)
Requirement already satisfied: six>=1.5 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from python-dateutil>=2.8.2->pandas->datasets) (1.17.0)
Requirement already satisfied: markdown-it-py>=2.2.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from rich>=13.9.4->weaviate-agents&lt;1.0.0,>=0.3.0->weaviate-client[agents]) (3.0.0)
Requirement already satisfied: pygments&lt;3.0.0,>=2.13.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from rich>=13.9.4->weaviate-agents&lt;1.0.0,>=0.3.0->weaviate-client[agents]) (2.19.1)
Requirement already satisfied: cffi>=1.12 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from cryptography->authlib&lt;1.3.2,>=1.2.1->weaviate-client[agents]) (1.17.1)
Requirement already satisfied: pycparser in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from cffi>=1.12->cryptography->authlib&lt;1.3.2,>=1.2.1->weaviate-client[agents]) (2.22)
Requirement already satisfied: mdurl~=0.1 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from markdown-it-py>=2.2.0->rich>=13.9.4->weaviate-agents&lt;1.0.0,>=0.3.0->weaviate-client[agents]) (0.1.2)
Using cached datasets-3.3.2-py3-none-any.whl (485 kB)
Using cached dill-0.3.8-py3-none-any.whl (116 kB)
Using cached multiprocess-0.70.16-py312-none-any.whl (146 kB)
Using cached pyarrow-19.0.1-cp313-cp313-macosx_12_0_arm64.whl (30.7 MB)
Using cached xxhash-3.5.0-cp313-cp313-macosx_11_0_arm64.whl (30 kB)
Installing collected packages: xxhash, pyarrow, dill, multiprocess, datasets
Successfully installed datasets-3.3.2 dill-0.3.8 multiprocess-0.70.16 pyarrow-19.0.1 xxhash-3.5.0
Requirement already satisfied: weaviate-agents in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (0.4.0)
Requirement already satisfied: rich>=13.9.4 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-agents) (13.9.4)
Requirement already satisfied: weaviate-client>=4.11.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-agents) (4.11.1)
Requirement already satisfied: markdown-it-py>=2.2.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from rich>=13.9.4->weaviate-agents) (3.0.0)
Requirement already satisfied: pygments&lt;3.0.0,>=2.13.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from rich>=13.9.4->weaviate-agents) (2.19.1)
Requirement already satisfied: httpx&lt;0.29.0,>=0.26.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client>=4.11.0->weaviate-agents) (0.27.0)
Requirement already satisfied: validators==0.34.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client>=4.11.0->weaviate-agents) (0.34.0)
Requirement already satisfied: authlib&lt;1.3.2,>=1.2.1 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client>=4.11.0->weaviate-agents) (1.3.1)
Requirement already satisfied: pydantic&lt;3.0.0,>=2.8.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client>=4.11.0->weaviate-agents) (2.10.5)
Requirement already satisfied: grpcio&lt;2.0.0,>=1.66.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client>=4.11.0->weaviate-agents) (1.69.0)
Requirement already satisfied: grpcio-tools&lt;2.0.0,>=1.66.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client>=4.11.0->weaviate-agents) (1.69.0)
Requirement already satisfied: grpcio-health-checking&lt;2.0.0,>=1.66.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from weaviate-client>=4.11.0->weaviate-agents) (1.69.0)
Requirement already satisfied: cryptography in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from authlib&lt;1.3.2,>=1.2.1->weaviate-client>=4.11.0->weaviate-agents) (44.0.0)
Requirement already satisfied: protobuf&lt;6.0dev,>=5.26.1 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from grpcio-health-checking&lt;2.0.0,>=1.66.2->weaviate-client>=4.11.0->weaviate-agents) (5.29.3)
Requirement already satisfied: setuptools in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from grpcio-tools&lt;2.0.0,>=1.66.2->weaviate-client>=4.11.0->weaviate-agents) (75.1.0)
Requirement already satisfied: anyio in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpx&lt;0.29.0,>=0.26.0->weaviate-client>=4.11.0->weaviate-agents) (4.8.0)
Requirement already satisfied: certifi in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpx&lt;0.29.0,>=0.26.0->weaviate-client>=4.11.0->weaviate-agents) (2024.12.14)
Requirement already satisfied: httpcore==1.* in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpx&lt;0.29.0,>=0.26.0->weaviate-client>=4.11.0->weaviate-agents) (1.0.7)
Requirement already satisfied: idna in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpx&lt;0.29.0,>=0.26.0->weaviate-client>=4.11.0->weaviate-agents) (3.10)
Requirement already satisfied: sniffio in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpx&lt;0.29.0,>=0.26.0->weaviate-client>=4.11.0->weaviate-agents) (1.3.1)
Requirement already satisfied: h11&lt;0.15,>=0.13 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from httpcore==1.*->httpx&lt;0.29.0,>=0.26.0->weaviate-client>=4.11.0->weaviate-agents) (0.14.0)
Requirement already satisfied: mdurl~=0.1 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from markdown-it-py>=2.2.0->rich>=13.9.4->weaviate-agents) (0.1.2)
Requirement already satisfied: annotated-types>=0.6.0 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from pydantic&lt;3.0.0,>=2.8.0->weaviate-client>=4.11.0->weaviate-agents) (0.7.0)
Requirement already satisfied: pydantic-core==2.27.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from pydantic&lt;3.0.0,>=2.8.0->weaviate-client>=4.11.0->weaviate-agents) (2.27.2)
Requirement already satisfied: typing-extensions>=4.12.2 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from pydantic&lt;3.0.0,>=2.8.0->weaviate-client>=4.11.0->weaviate-agents) (4.12.2)
Requirement already satisfied: cffi>=1.12 in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from cryptography->authlib&lt;1.3.2,>=1.2.1->weaviate-client>=4.11.0->weaviate-agents) (1.17.1)
Requirement already satisfied: pycparser in /Users/tuanacelik/miniconda3/envs/agent/lib/python3.13/site-packages (from cffi>=1.12->cryptography->authlib&lt;1.3.2,>=1.2.1->weaviate-client>=4.11.0->weaviate-agents) (2.22)
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

### コレクションの準備

以下のコードブロックでは、Hugging Face からデモの「papers」データセットを取得し、Weaviate Serverless クラスターに新しいコレクションとして書き込みます。

**Important:** Weaviate Cloud コンソールで「Embeddings」を必ず有効にしてください。これにより `text2vec_weaviate` ベクトライザーを使用でき、デフォルトで `Snowflake/snowflake-arctic-embed-l-v2.0` でベクトルが作成されます。

```python
from weaviate.classes.config import Configure

# To re-run cell you may have to delete collections
# client.collections.delete("ArxivPapers")
client.collections.create(
    "ArxivPapers",
    description="A dataset that lists research paper titles and abstracts",
    vector_config=Configure.Vectors.text2vec_weaviate()
)

```

Python output:
```text
<weaviate.collections.collection.sync.Collection at 0x128ae3680>
```
```python
from datasets import load_dataset

dataset = load_dataset("weaviate/agents", "transformation-agent-papers", split="train", streaming=True)

papers_collection = client.collections.use("ArxivPapers")

with papers_collection.batch.dynamic() as batch:
    for i, item in enumerate(dataset):
      if i &lt; 200:
        batch.add_object(properties=item["properties"])
```

### Explorer でコレクションを確認

`TransformationAgent` は、今後コレクションを変更します。ここで「ArxivPapers」コレクションの内容を確認してみましょう。Weaviate Cloud コンソールの Explorer ツールでデータを確認できます。正しく取り込めていれば、各オブジェクトに以下の 2 つのプロパティが表示されるはずです。  
- `title`: 論文のタイトル  
- `abstract`: 論文のアブストラクト  

さらに各オブジェクトの `vectors` も確認できます。

## Transformation 操作の定義

`TransformationAgent` の主役は操作（operations）です。

コレクションに対して実行したい変換操作を定義できます。操作には次の種類があります。  
- 新しいプロパティの追加  
- 既存プロパティの更新  

現在、`TransformationAgent` は Weaviate 内の既存オブジェクトを更新する操作をサポートしています。

### 新しいプロパティの追加

新しいプロパティを追加するには、次の内容で操作を定義します。  
- **`instrcution`**: この新しいプロパティが何であるかを自然言語で説明します  
- **`property_name`**: プロパティ名  
- **`data_type`**: プロパティのデータ型（例: `DataType.TEXT`, `DataType.TEXT_ARRAY`, `DataType.BOOL`, `DataType.INT` など）  
- **`view_properties`**: 他のプロパティを基にプロパティを作成したい場合、ここに参照するプロパティを列挙します  

#### トピック一覧の作成

まず `TEXT_ARRAY` 型の新しいプロパティ「topics」を追加します。「abstract」と「title」を基に、トピックタグを最大 5 つ抽出するよう LLM に依頼しましょう。

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

#### フランス語訳の追加

次に「abstract」をフランス語に翻訳した新しいプロパティ「french_abstract」を追加します。

```python
add_french_abstract = Operations.append_property(
      property_name="french_abstract",
      data_type=DataType.TEXT,
      view_properties=["abstract"],
      instruction="Translate the abstract to French",
)
```

#### タイトルの更新

今回は `title` プロパティを更新し、フランス語の訳をかっこ書きで追記します。

```python
update_title = Operations.update_property(
    property_name="title",
    view_properties=["title"],
    instruction="""Update the title to ensure that it contains the French translation of itself in parantheses, after the original title.""",
)
```

#### サーベイ論文かどうかの判定

最後に、その論文がサーベイ（既存研究の調査）かどうかを示す `BOOL` 型プロパティを作成します。

```python
is_survey_paper = Operations.append_property(
    property_name="is_survey_paper",
    data_type=DataType.BOOL,
    view_properties=["abstract"],
    instruction="""Determine if the paper is a "survey".
    A paper is considered survey it's a surveys existing techniques, and not if it presents novel techniques""",
)
```

## Transformation エージェントの作成と実行

すべての操作を定義したら、`TransformationAgent` を初期化できます。

エージェントを初期化する際には、どの `collection` に対して変更を行うかを指定する必要があります。ここでは、先ほど作成した「ArxivPapers」コレクションにアクセスさせます。

次に、エージェントに実行させたい `operations` のリストを渡します。ここでは前述のすべての操作を指定します。

> Note: 同一オブジェクトに対して複数の操作が同時に実行される場合、データ整合性に関する既知の問題を解決中です。

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

### 変換の実行

`update_all()` を呼び出すことで、 エージェントが各操作ごとに個別のワークフローを立ち上げます。 各操作はコレクション内の各オブジェクトで実行されます。

```python
response = agent.update_all()
```

### 操作ワークフローの確認

操作のステータスを確認するには、 返された `TransformationResponse` に含まれる `workflow_id` を確認し、 `agent.get_status(workflow_id)` でそのステータスを取得できます。 これらの操作は非同期です。

```python
response
```

Python 出力:
```text
[TransformationResponse(operation_name='topics', workflow_id='TransformationWorkflow-1766a450c35039c2a44e1fa33dc49dd4'),
 TransformationResponse(operation_name='french_abstract', workflow_id='TransformationWorkflow-67e90d88830347a5581d3ee1aa10b867'),
 TransformationResponse(operation_name='is_survey_paper', workflow_id='TransformationWorkflow-6294dd575fad55c318ee7b0e8a38a8ff'),
 TransformationResponse(operation_name='title', workflow_id='TransformationWorkflow-bba64a5bf204b00c3572310de715d1e2')]
```
```python
agent.get_status(workflow_id=response.workflow_id)
```

Python 出力:
```text
{'workflow_id': 'TransformationWorkflow-1766a450c35039c2a44e1fa33dc49dd4',
 'status': {'batch_count': 1,
  'end_time': '2025-03-11 14:58:57',
  'start_time': '2025-03-11 14:57:55',
  'state': 'completed',
  'total_duration': 62.56732,
  'total_items': 200}}
```

