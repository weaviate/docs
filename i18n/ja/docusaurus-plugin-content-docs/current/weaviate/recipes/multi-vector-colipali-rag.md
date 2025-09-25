---
layout: recipe
toc: True
title: "マルチベクトル RAG: Weaviate で PDF ドキュメント コレクションを検索する "
featured: False
integration: False
agent: False
tags: ['ColPali', 'Named Vectors']
---
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/weaviate/recipes/blob/main/weaviate-features/multi-vector/multi-vector-colipali-rag.ipynb)

# ColQwen2、Qwen2.5、Weaviate を用いた PDF 上のマルチモーダル RAG

このノートブックでは、PDF ドキュメントに対する [マルチモーダル Retrieval-Augmented Generation (RAG)](https://weaviate.io/blog/multimodal-rag) を実演します。  
ドキュメントの各ページとクエリを同じマルチベクトル空間に埋め込み、MaxSim 類似度の下で ColBERT スタイルのマルチベクトル埋め込みに対する近似最近傍検索へと問題を帰着させ、PDF コレクションからの検索を行います。

この目的のために以下を使用します。

- **マルチモーダル [late-interaction モデル](https://weaviate.io/blog/late-interaction-overview)**（ColPali や ColQwen2 など）を使って埋め込みを生成します。本チュートリアルでは、寛容な Apache 2.0 ライセンスの公開モデル [ColQwen2-v1.0](https://huggingface.co/vidore/colqwen2-v1.0) を使用します。  
- **Weaviate の [ベクトル データベース](https://weaviate.io/blog/what-is-a-vector-database)**。これは [マルチベクトル機能](https://docs.weaviate.io/weaviate/tutorials/multi-vector-embeddings) を備えており、PDF コレクションを効率的にインデックスし、テキストと図版の両方を含むドキュメント内容に対するテキスト検索をサポートします。  
- **ビジョン ランゲージ モデル (VLM)**、具体的には [Qwen/Qwen2.5-VL-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct) を用いてマルチモーダル RAG を実現します。

下図にマルチモーダル RAG システムの概要を示します。

<img src="https://github.com/weaviate/recipes/blob/main/weaviate-features/multi-vector/figures/multimodal-rag-diagram.png?raw=1" width="700px"/>

まず、取り込みパイプラインが PDF ドキュメントを画像としてマルチモーダル late-interaction モデルで処理します。生成されたマルチベクトル埋め込みはベクトル データベースに保存されます。  
次にクエリ時には、テキスト クエリを同じマルチモーダル late-interaction モデルで処理し、関連ドキュメントを検索します。  
取得した PDF ファイルは、元のユーザークエリとともに視覚的コンテキストとして VLM に渡され、そこから回答が生成されます。

## 前提条件

このノートブックを実行するには、5〜10 GB 程度のメモリでニューラル ネットワークを実行できるマシンが必要です。  
本デモでは 2 つの異なる VLM を使用しており、どちらも数 GB のメモリを要します。各モデルおよび PyTorch のドキュメントを参照し、ご自身のハードウェアでの最適な実行方法をご確認ください。

例として、以下の環境で実行できます。

- Google Colab（無料枠 T4 GPU）
- ローカル環境（M2 Pro Mac でテスト済み）

さらに、Weaviate バージョン >= `1.29.0` のインスタンスが必要です。

## ステップ 1: 必要なライブラリのインストール

まず、必要なライブラリをインストールしてインポートしましょう。

Python は `3.13` が必要です。

```python
%%capture
%pip install colpali_engine weaviate-client qwen_vl_utils
%pip install -q -U "colpali-engine[interpretability]>=0.3.2,&lt;0.4.0"
```

```python
import os
import torch
import numpy as np

from google.colab import userdata
from datasets import load_dataset

from transformers.utils.import_utils import is_flash_attn_2_available
from transformers import Qwen2_5_VLForConditionalGeneration, AutoTokenizer, AutoProcessor

from colpali_engine.models import ColQwen2, ColQwen2Processor
#from colpali_engine.models import ColPali, ColPaliProcessor # uncomment if you prefer to use ColPali models instead of ColQwen2 models

import weaviate
from weaviate.classes.init import Auth
import weaviate.classes.config as wc
from weaviate.classes.config import Configure
from weaviate.classes.query import MetadataQuery

from qwen_vl_utils import process_vision_info
import base64
from io import BytesIO

import matplotlib.pyplot as plt

from colpali_engine.interpretability import (
    get_similarity_maps_from_embeddings,
    plot_all_similarity_maps,
    plot_similarity_map,
)

```

## ステップ 2: PDF データセットの読み込み

データセットから始めましょう。  
[arXiv で最も引用された AI 論文上位 40 件](https://arxiv.org/abs/2412.12121)（期間 2023-01-01〜2024-09-30）の PDF ドキュメント データセットを Hugging Face から読み込みます。

```python
dataset = load_dataset("weaviate/arXiv-AI-papers-multi-vector", split="train")
```

Python output:
```text
README.md:   0%|          | 0.00/530 [00:00&lt;?, ?B/s]

n40_p10_images.parquet:   0%|          | 0.00/201M [00:00&lt;?, ?B/s]

Generating train split:   0%|          | 0/399 [00:00&lt;?, ? examples/s]
```
```python
dataset
```

Python output:
```text
Dataset({
    features: ['page_id', 'paper_title', 'paper_arxiv_id', 'page_number', 'colqwen_embedding', 'page_image'],
    num_rows: 399
})
```
```python
dataset[398]
```

読み込んだ PDF データセットからサンプルのドキュメントページを見てみましょう。

```python
display(dataset[289]["page_image"])
```

![Retrieved page](https://raw.githubusercontent.com/weaviate/recipes/refs/heads/main/weaviate-features/multi-vector/figures/retrieved_page.png)

## ステップ 3: ColVision (ColPali または ColQwen2) モデルの読み込み

本チュートリアルで使用する埋め込み生成手法は、論文 [ColPali: Efficient Document Retrieval with Vision Language Models](https://arxiv.org/abs/2407.01449) で概説されています。同論文は、PDF ドキュメントを検索用に前処理する従来手法を簡素化できることを示しました。

従来の PDF 処理では、RAG システムで OCR（光学文字認識）やレイアウト検出ソフトウェアを使い、テキスト、表、図、チャートを個別に処理します。さらにテキスト抽出後にはチャンク化処理も必要です。  
代わりに ColPali 手法では、PDF のページ全体をスクリーンショット画像として VLM に入力し、ColBERT スタイルのマルチベクトル埋め込みを生成します。

<img src="https://github.com/weaviate/recipes/blob/main/weaviate-features/multi-vector/figures/colipali_pipeline.jpeg?raw=1" width="700px"/>

ColVision には ColPali や ColQwen2 など複数モデルがあり、主に使用するエンコーダ（Qwen2 による Contextualized Late Interaction か PaliGemma-3B か）で異なります。ColPali と ColQwen2 の違いについては [late-interaction モデルの概要](https://weaviate.io/blog/late-interaction-overview) をご覧ください。

このチュートリアルでは [ColQwen2-v1.0](https://huggingface.co/vidore/colqwen2-v1.0) モデルを読み込みます。

```python
# Get rid of process forking deadlock warnings.
os.environ["TOKENIZERS_PARALLELISM"] = "false"
```

```python
if torch.cuda.is_available(): # If GPU available
    device = "cuda:0"
elif torch.backends.mps.is_available(): # If Apple Silicon available
    device = "mps"
else:
    device = "cpu"

if is_flash_attn_2_available():
    attn_implementation = "flash_attention_2"
else:
    attn_implementation = "eager"

print(f"Using device: {device}")
print(f"Using attention implementation: {attn_implementation}")
```

Python output:
```text
Using device: cuda:0
Using attention implementation: eager
```
```python
model_name = "vidore/colqwen2-v1.0"

# About a 5 GB download and similar memory usage.
model = ColQwen2.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map=device,
    attn_implementation=attn_implementation,
).eval()

# Load processor
processor = ColQwen2Processor.from_pretrained(model_name)
```

Python output:
```text
adapter_config.json:   0%|          | 0.00/728 [00:00&lt;?, ?B/s]

config.json: 0.00B [00:00, ?B/s]

model.safetensors.index.json: 0.00B [00:00, ?B/s]

Fetching 2 files:   0%|          | 0/2 [00:00&lt;?, ?it/s]

model-00001-of-00002.safetensors:   0%|          | 0.00/4.98G [00:00&lt;?, ?B/s]

model-00002-of-00002.safetensors:   0%|          | 0.00/3.85G [00:00&lt;?, ?B/s]

Loading checkpoint shards:   0%|          | 0/2 [00:00&lt;?, ?it/s]

adapter_model.safetensors:   0%|          | 0.00/74.0M [00:00&lt;?, ?B/s]

preprocessor_config.json:   0%|          | 0.00/619 [00:00&lt;?, ?B/s]

Using a slow image processor as `use_fast` is unset and a slow processor was saved with this model. `use_fast=True` will be the default behavior in v4.52, even if the model was saved with a slow processor. This will result in minor differences in outputs. You'll still be able to use a slow processor with `use_fast=False`.

tokenizer_config.json: 0.00B [00:00, ?B/s]

vocab.json: 0.00B [00:00, ?B/s]

merges.txt: 0.00B [00:00, ?B/s]

tokenizer.json:   0%|          | 0.00/11.4M [00:00&lt;?, ?B/s]

added_tokens.json:   0%|          | 0.00/392 [00:00&lt;?, ?B/s]

special_tokens_map.json:   0%|          | 0.00/613 [00:00&lt;?, ?B/s]

video_preprocessor_config.json:   0%|          | 0.00/54.0 [00:00&lt;?, ?B/s]

chat_template.json: 0.00B [00:00, ?B/s]
```
本ノートブックでは、寛容な Apache 2.0 ライセンスを持つ ColQwen2 モデルを使用します。  
代わりに Gemma ライセンスの [ColPali](https://huggingface.co/vidore/colpali-v1.2) を使用することも可能ですし、その他の [ColVision モデル](https://github.com/illuin-tech/colpali) もお試しいただけます。詳細比較については [ViDoRe: The Visual Document Retrieval Benchmark](https://huggingface.co/spaces/vidore/vidore-leaderboard) もご参照ください。

ColQwen2 ではなく ColPali を使用したい場合は、上記セルをコメントアウトし、以下のセルのコメントを外してください。

```python
#model_name = "vidore/colpali-v1.2"

# Load model
#colpali_model = ColPali.from_pretrained(
#    model_name,
#    torch_dtype=torch.bfloat16,
#    device_map=device,
#    attn_implementation=attn_implementation,
#).eval()

# Load processor
#colpali_processor = ColPaliProcessor.from_pretrained(model_name)
```

先に進む前に、ColQwen2 モデルに慣れておきましょう。ColQwen2 は画像とテキストクエリの両方からマルチベクトル埋め込みを生成できます。下にそれぞれの例を示します。

```python
# Sample image inputs
images = [
    dataset[0]["page_image"],
    dataset[1]["page_image"],
]

# Process the inputs
batch_images = processor.process_images(images).to(model.device)

# Forward pass
with torch.no_grad():
    query_embedding = model(**batch_images)

print(query_embedding)
print(query_embedding.shape)
```

Python output:
```text
tensor([[[ 2.0630e-02, -8.6426e-02, -7.1289e-02,  ...,  5.1758e-02,
          -3.0365e-03,  1.1084e-01],
         [ 1.9409e-02, -1.0840e-01, -2.6245e-02,  ...,  7.6172e-02,
          -4.4922e-02, -1.3965e-01],
         [-1.7242e-03, -9.8145e-02, -1.9653e-02,  ...,  7.5684e-02,
          -3.3936e-02, -1.2891e-01],
         ...,
         [ 5.0537e-02, -1.0205e-01, -8.6426e-02,  ...,  4.9561e-02,
           3.1982e-02,  8.0078e-02],
         [ 3.9795e-02, -1.3477e-01, -5.0537e-02,  ...,  3.8330e-02,
          -6.1523e-02, -1.2012e-01],
         [ 9.3384e-03, -2.2168e-01, -1.4746e-01,  ..., -8.1177e-03,
          -5.2246e-02, -3.1128e-02]],

        [[ 2.0630e-02, -8.6426e-02, -7.1289e-02,  ...,  5.1758e-02,
          -3.0365e-03,  1.1084e-01],
         [ 1.9409e-02, -1.0840e-01, -2.6245e-02,  ...,  7.6172e-02,
          -4.4922e-02, -1.3965e-01],
         [-1.7242e-03, -9.8145e-02, -1.9653e-02,  ...,  7.5684e-02,
          -3.3936e-02, -1.2891e-01],
         ...,
         [ 7.2266e-02, -9.3750e-02, -7.9102e-02,  ...,  5.7373e-02,
           1.0803e-02,  7.1777e-02],
         [ 5.2490e-02, -1.2207e-01, -4.9072e-02,  ...,  3.2471e-02,
          -6.4453e-02, -1.1084e-01],
         [ 1.7480e-01, -1.8457e-01, -7.2937e-03,  ...,  6.4392e-03,
          -1.3828e-04, -5.7617e-02]]], device='cuda:0', dtype=torch.bfloat16)
torch.Size([2, 755, 128])
```
```python
# Sample query inputs
queries = [
    "A table with LLM benchmark results.",
    "A figure detailing the architecture of a neural network.",
]

# Process the inputs
batch_queries = processor.process_queries(queries).to(model.device)

# Forward pass
with torch.no_grad():
    query_embedding = model(**batch_queries)

print(query_embedding)
print(query_embedding.shape)
```

Python output:
```text
tensor([[[ 0.0000, -0.0000, -0.0000,  ..., -0.0000,  0.0000,  0.0000],
         [ 0.0000, -0.0000, -0.0000,  ..., -0.0000,  0.0000,  0.0000],
         [ 0.0238, -0.0835, -0.0752,  ...,  0.0549,  0.0076,  0.0903],
         ...,
         [ 0.0559, -0.0457, -0.1118,  ..., -0.1621,  0.1758,  0.1011],
         [ 0.0525, -0.0376, -0.1172,  ..., -0.1572,  0.1787,  0.0938],
         [ 0.0486, -0.0294, -0.1250,  ..., -0.1494,  0.1797,  0.0918]],

        [[ 0.0238, -0.0835, -0.0752,  ...,  0.0549,  0.0076,  0.0903],
         [-0.0086, -0.1021, -0.0198,  ...,  0.0708, -0.0310, -0.1367],
         [-0.0864, -0.1230, -0.0222,  ...,  0.0776,  0.1040, -0.0128],
         ...,
         [-0.0544,  0.0310, -0.1318,  ..., -0.2236, -0.1445,  0.0381],
         [-0.0679,  0.0292, -0.1484,  ..., -0.2178, -0.1387,  0.0439],
         [-0.0742,  0.0291, -0.1553,  ..., -0.2109, -0.1289,  0.0452]]],
       device='cuda:0', dtype=torch.bfloat16)
torch.Size([2, 22, 128])
```
それでは、マルチモーダル late-interaction モデルとその埋め込み機能を扱いやすくするためのラッパークラスを作成しましょう。

```python
# A convenience class to wrap the embedding functionality 
# of ColVision models like ColPali and ColQwen2 
class ColVision:
    def __init__(self, model, processor):
        """Initialize with a loaded model and processor."""
        self.model = model
        self.processor = processor

    # A batch size of one appears to be most performant when running on an M4.
    # Note: Reducing the image resolution speeds up the vectorizer and produces
    # fewer multi-vectors.
    def multi_vectorize_image(self, img):
        """Return the multi-vector image of the supplied PIL image."""
        image_batch = self.processor.process_images([img]).to(self.model.device)
        with torch.no_grad():
            image_embedding = self.model(**image_batch)
        return image_embedding[0]

    def multi_vectorize_text(self, query):
        """Return the multi-vector embedding of the query text string."""
        query_batch = self.processor.process_queries([query]).to(self.model.device)
        with torch.no_grad():
            query_embedding = self.model(**query_batch)
        return query_embedding[0]

# Instantiate the model to be used below.
colvision_embedder = ColVision(model, processor) # This will be instantiated after loading the model and processor
```

画像とクエリの埋め込みが意図通り動作するか確認します。

```python
# Sample image inputs
images = dataset[0]["page_image"]

page_embedding = colvision_embedder.multi_vectorize_image(images)
print(page_embedding.shape)  # torch.Size([755, 128])

queries = [
    "A table with LLM benchmark results.",
    "A figure detailing the architecture of a neural network.",
]

query_embeddings = [colvision_embedder.multi_vectorize_text(q) for q in queries]
print(query_embeddings[0].shape)  # torch.Size([20, 128])
```

Python output:
```text
torch.Size([755, 128])
torch.Size([20, 128])
```

## ステップ 4：Weaviate ベクトルデータベースインスタンスへの接続

ここでは、稼働中の Weaviate ベクトルデータベースクラスターに接続する必要があります。

次のいずれかのオプションを選択できます。

1. **オプション 1:** マネージドサービスの [Weaviate Cloud (WCD)](https://console.weaviate.cloud/) で 14 日間の無料サンドボックスを作成  
2. **オプション 2:** [Embedded Weaviate](https://docs.weaviate.io/deploy/installation-guides/embedded)  
3. **オプション 3:** [ローカルデプロイ](https://docs.weaviate.io/deploy/installation-guides/docker-installation)  
4. [その他のオプション](https://docs.weaviate.io/deploy)

```python
# Option 1: Weaviate Cloud
WCD_URL = os.environ["WEAVIATE_URL"] # Replace with your Weaviate cluster URL
WCD_AUTH_KEY = os.environ["WEAVIATE_API_KEY"] # Replace with your cluster auth key

# Uncomment if you are working in a Google Colab environment
#WCD_URL = userdata.get("WEAVIATE_URL")
#WCD_AUTH_KEY = userdata.get("WEAVIATE_API_KEY")

# Weaviate Cloud Deployment
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=WCD_URL,
    auth_credentials=weaviate.auth.AuthApiKey(WCD_AUTH_KEY),
)

# Option 2: Embedded Weaviate instance
# use if you want to explore Weaviate without any additional setup
#client = weaviate.connect_to_embedded()

# Option 3: Locally hosted instance of Weaviate via Docker or Kubernetes
#!docker run --detach -p 8080:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:1.29.0
#client = weaviate.connect_to_local()

print(client.is_ready())
```

Python 出力:  
```text
True
```  
本チュートリアルでは、Weaviate `v1.29.0` 以上が必要です。  
必要なバージョンであることを確認しましょう:

```python
client.get_meta()['version']
```

Python 出力:  
```text
'1.32.4'
```  

## ステップ 5：コレクションの作成

次に、PDF ドキュメントのページ画像の埋め込みを保持するコレクションを作成します。

ここでは組み込みベクトライザーを定義せず、[Bring Your Own Vectors (BYOV) アプローチ](https://docs.weaviate.io/weaviate/starter-guides/custom-vectors) を使用して、取り込み時とクエリ時に手動でクエリと PDF ドキュメントを埋め込みます。

さらに、マルチベクトル埋め込み用の [MUVERA エンコーディングアルゴリズム](https://weaviate.io/blog/muvera) を使用したい場合は、下記のコードでコメントアウトを解除してください。

```python
collection_name = "PDFDocuments"
```

```python
# Delete the collection if it already exists
# Note: in practice, you shouldn't rerun this cell, as it deletes your data
# in "PDFDocuments", and then you need to re-import it again.
#if client.collections.exists(collection_name):
#  client.collections.delete(collection_name)

# Create a collection
collection = client.collections.create(
    name=collection_name,
    properties=[
        wc.Property(name="page_id", data_type=wc.DataType.INT),
        wc.Property(name="dataset_index", data_type=wc.DataType.INT),
        wc.Property(name="paper_title", data_type=wc.DataType.TEXT),
        wc.Property(name="paper_arxiv_id", data_type=wc.DataType.TEXT),
        wc.Property(name="page_number", data_type=wc.DataType.INT),
    ],
    vector_config=[
        Configure.MultiVectors.self_provided(
            name="colqwen",
            #encoding=Configure.VectorIndex.MultiVector.Encoding.muvera(),
            vector_index_config=Configure.VectorIndex.hnsw(
                multi_vector=Configure.VectorIndex.MultiVector.multi_vector()
            )
    )]
)
```

## ステップ 6：ベクトルを Weaviate へアップロード

このステップでは、バッチ処理で Weaviate コレクションにベクトルをインデックスします。

各バッチごとに画像を処理して ColPali モデルでエンコードし、マルチベクトル埋め込みへ変換します。  
これらの埋め込みはテンソルからリスト形式のベクトルへ変換され、各画像の主要な情報を捉えてドキュメントごとのマルチベクトル表現を作成します。  
このセットアップは Weaviate のマルチベクトル機能と相性が良いです。

処理後、ベクトルとメタデータを Weaviate にアップロードし、インデックスを徐々に構築します。  
利用可能な GPU リソースに応じて `batch_size` を増減させてください。

```python
# Map of page ids to images to support displaying the image corresponding to a
# particular page id.
page_images = {}

with collection.batch.dynamic() as batch:
    for i in range(len(dataset)):
        p = dataset[i]
        page_images[p["page_id"]] = p["page_image"]

        batch.add_object(
            properties={
                "page_id": p["page_id"],
                "paper_title": p["paper_title"],
                "paper_arxiv_id": p["paper_arxiv_id"],
                "page_number": p["page_number"],
                },
            vector={"colqwen": colvision_embedder.multi_vectorize_image(p["page_image"]).cpu().float().numpy().tolist()})

        if i % 25 == 0:
            print(f"Added {i+1}/{len(dataset)} Page objects to Weaviate.")

    batch.flush()

# Delete dataset after creating page_images dict to hold the images
del dataset
```

Python 出力:  
```text
Added 1/399 Page objects to Weaviate.
Added 26/399 Page objects to Weaviate.
Added 51/399 Page objects to Weaviate.
Added 76/399 Page objects to Weaviate.
Added 101/399 Page objects to Weaviate.
Added 126/399 Page objects to Weaviate.
Added 151/399 Page objects to Weaviate.
Added 176/399 Page objects to Weaviate.
Added 201/399 Page objects to Weaviate.
Added 226/399 Page objects to Weaviate.
Added 251/399 Page objects to Weaviate.
Added 276/399 Page objects to Weaviate.
Added 301/399 Page objects to Weaviate.
Added 326/399 Page objects to Weaviate.
Added 351/399 Page objects to Weaviate.
Added 376/399 Page objects to Weaviate.
```  
```python
len(collection)
```

Python 出力:  
```text
399
```  

## ステップ 7：マルチモーダル検索クエリ

構築するものの例として、以下の実際のデモクエリとコレクションからの結果（最近傍）を考えてみます。

- クエリ: 「DeepSeek-V2 は LLaMA ファミリーの LLM と比較してどうですか？」  
- 最近傍:  "DeepSeek-V2: A Strong Economical and Efficient Mixture-of-Experts Language Model" (arXiv: 2405.04434)、ページ: 1

```python
query = "How does DeepSeek-V2 compare against the LLaMA family of LLMs?"
```

Python 出力:  
```text
Running cells with 'Python 3.13.5' requires the ipykernel package.

Install 'ipykernel' into the Python environment. 

Command: '/opt/homebrew/bin/python3 -m pip install ipykernel -U --user --force-reinstall'
```  
[DeepSeek-V2 論文](https://arxiv.org/abs/2405.04434) の 1 ページ目を確認すると、クエリに関連する図が実際に含まれていることがわかります:

<img src="https://github.com/weaviate/recipes/blob/main/weaviate-features/multi-vector/figures/deepseek_efficiency.jpeg?raw=1" width="700px"/>

注意: Google Colab などの無料リソースで `OutOfMemoryError` を避けるために、ここでは 1 件のみを取得します。  
より多くのメモリを使用できる環境では、`limit` パラメータを `limit=3` など高い値に設定し、取得する PDF ページ数を増やせます。

```python
response = collection.query.near_vector(
    near_vector=colvision_embedder.multi_vectorize_text(query).cpu().float().numpy(),
    target_vector="colqwen",
    limit=1,
    return_metadata=MetadataQuery(distance=True), # Needed to return MaxSim score
)

print(f"The most relevant documents for the query \"{query}\" by order of relevance:\n")
result_images = []
for i, o in enumerate(response.objects):
    p = o.properties
    print(
        f"{i+1}) MaxSim: {-o.metadata.distance:.2f}, "
        + f"Title: \"{p['paper_title']}\" "
        + f"(arXiv: {p['paper_arxiv_id']}), "
        + f"Page: {int(p['page_number'])}"
    )
    result_images.append(page_images[p["page_id"]])
```

Python 出力:  
```text
The most relevant documents for the query "How does DeepSeek-V2 compare against the LLaMA family of LLMs?" by order of relevance:

1) MaxSim: 23.12, Title: "DeepSeek-V2: A Strong Economical and Efficient Mixture-of-Experts Language Model" (arXiv: 2405.04434), Page: 1
```  
最も高い MaxSim スコアで取得されたページは、前述の図が含まれるページでした。

```python
closest_page_id = response.objects[0].properties['page_id']
image = page_images[closest_page_id]
display(image)
```

![Retrieved page](https://raw.githubusercontent.com/weaviate/recipes/refs/heads/main/weaviate-features/multi-vector/figures/retrieved_page.png)

取得した PDF ドキュメントページの類似度マップを可視化し、ユーザークエリの各トークンと画像パッチとの意味的類似度を確認しましょう。（任意のステップです）

```python

# Preprocess inputs
batch_images = processor.process_images([image]).to(device)
batch_queries = processor.process_queries([query]).to(device)

# Forward passes
with torch.no_grad():
    image_embeddings = model.forward(**batch_images)
    query_embeddings = model.forward(**batch_queries)

# Get the number of image patches
n_patches = processor.get_n_patches(
    image_size=image.size,
    spatial_merge_size=model.spatial_merge_size,
)

# Get the tensor mask to filter out the embeddings that are not related to the image
image_mask = processor.get_image_mask(batch_images)

# Generate the similarity maps
batched_similarity_maps = get_similarity_maps_from_embeddings(
    image_embeddings=image_embeddings,
    query_embeddings=query_embeddings,
    n_patches=n_patches,
    image_mask=image_mask,
)

# Get the similarity map for our (only) input image
similarity_maps = batched_similarity_maps[0]  # (query_length, n_patches_x, n_patches_y)

print(f"Similarity map shape: (query_length, n_patches_x, n_patches_y) = {tuple(similarity_maps.shape)}")
```

```python
# Remove the padding tokens and the query augmentation tokens
query_content = processor.decode(batch_queries.input_ids[0])
query_content = query_content.replace(processor.tokenizer.pad_token, "")
query_content = query_content.replace(processor.query_augmentation_token, "").strip()

# Retokenize the cleaned query
query_tokens = processor.tokenizer.tokenize(query_content)

# Use this cell output to choose a token using its index
for idex, val in enumerate(query_tokens):
    print(f"{idex}: {val}")
```

「LLaMA」の「MA」トークンに対する類似度プロットを確認してみます。（類似度マップはトークンごとに作成されます）

```python
token_idx = 13

fig, ax = plot_similarity_map(
    image=image,
    similarity_map=similarity_maps[token_idx],
    figsize=(18, 18),
    show_colorbar=False,
)

max_sim_score = similarity_maps[token_idx, :, :].max().item()
ax.set_title(f"Token #{token_idx}: `{query_tokens[token_idx]}`. MaxSim score: {max_sim_score:.2f}", fontsize=14)

plt.show()
```

![Similarity map](https://raw.githubusercontent.com/weaviate/recipes/refs/heads/main/weaviate-features/multi-vector/figures/similarity_map.png)

```python
# Delete variables used for visualization
del batched_similarity_maps, similarity_maps, n_patches, query_content, query_tokens, token_idx
```

## ステップ 8：Qwen2.5 を用いたマルチモーダル RAG への拡張

上記の例では、クエリに回答するために最も関連性の高いページを取得できました。  
次に、このマルチモーダルドキュメント検索パイプラインをマルチモーダル RAG パイプラインへ拡張します。

ビジョン言語モデル (VLM) は視覚機能を備えた Large Language Model です。  
現在の VLM は十分に強力で、クエリと関連ページをモデルに渡すだけで、クエリへの回答を自然言語で生成できます。

これを実現するために、上位結果を最先端 VLM である [Qwen/Qwen2.5-VL-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct) に入力します。

```python
# Setting up Qwen2.5-VL-3B-Instruct for generating answers from a query string
# plus a collection of (images of) PDF pages.

class QwenVL:
    def __init__(self):
        # Adjust the settings to your available architecture, see the link
        # https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct for examples.
        self.model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
            "Qwen/Qwen2.5-VL-3B-Instruct",
            torch_dtype=torch.bfloat16,
            device_map=device,
            attn_implementation=attn_implementation,
        )

        min_pixels = 256*28*28
        max_pixels = 1280*28*28
        self.processor = AutoProcessor.from_pretrained(
            "Qwen/Qwen2.5-VL-3B-Instruct", min_pixels=min_pixels, max_pixels=max_pixels)

    def query_images(self, query, images):
        """Generate a textual response to the query (text) based on the information in the supplied list of PIL images."""
        # Preparation for inference.
        # Convert the images to base64 strings.
        content = []

        for img in images:
            buffer = BytesIO()
            img.save(buffer, format="jpeg")
            img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
            content.append({"type": "image", "image": f"data:image;base64,{img_base64}"})

        content.append({"type": "text", "text": query})
        messages = [{"role": "user", "content": content}]

        text = self.processor.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        image_inputs, video_inputs = process_vision_info(messages)
        inputs = self.processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt",
        )
        inputs = inputs.to(device)

        # Inference: Generation of the output.
        generated_ids = self.model.generate(**inputs, max_new_tokens=128)
        generated_ids_trimmed = [
            out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        return self.processor.batch_decode(
            generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
        )[0]

# Instantiate the model to be used below.
qwenvl = QwenVL()
```

Python 出力:  
```text
config.json: 0.00B [00:00, ?B/s]

model.safetensors.index.json: 0.00B [00:00, ?B/s]

Fetching 2 files:   0%|          | 0/2 [00:00&lt;?, ?it/s]

model-00002-of-00002.safetensors:   0%|          | 0.00/3.53G [00:00&lt;?, ?B/s]

model-00001-of-00002.safetensors:   0%|          | 0.00/3.98G [00:00&lt;?, ?B/s]

Loading checkpoint shards:   0%|          | 0/2 [00:00&lt;?, ?it/s]

generation_config.json:   0%|          | 0.00/216 [00:00&lt;?, ?B/s]

preprocessor_config.json:   0%|          | 0.00/350 [00:00&lt;?, ?B/s]

tokenizer_config.json: 0.00B [00:00, ?B/s]

vocab.json: 0.00B [00:00, ?B/s]

merges.txt: 0.00B [00:00, ?B/s]

tokenizer.json: 0.00B [00:00, ?B/s]

You have video processor config saved in `preprocessor.json` file which is deprecated. Video processor configs should be saved in their own `video_preprocessor.json` file. You can rename the file or load and save the processor back which renames it automatically. Loading from `preprocessor.json` will be removed in v5.0.

chat_template.json: 0.00B [00:00, ?B/s]
```  
`Qwen2.5-VL-3B-Instruct` から取得した回答（取得した PDF ページに基づく）:

```python
qwenvl.query_images(query, result_images)
```

Python 出力:  
```text
'DeepSeek-V2 achieves significantly stronger performance than the LLaMA family of LLMs, while also saving 42.5% of training costs and boosting the maximum generation throughput to 5.76 times.'
```  
ご覧のとおり、マルチモーダル RAG パイプラインは元のクエリ「DeepSeek-V2 は LLaMA ファミリーの LLM と比較してどうですか？」に回答できました。  
ColQwen2 検索モデルが "DeepSeek-V2: A Strong Economical and Efficient Mixture-of-Experts Language Model" 論文から正しい PDF ページを取得し、そのページのテキストと画像の両方を活用して質問に回答しました。

## まとめ

このノートブックでは、ColQwen2 によるマルチベクトル埋め込み、Weaviate ベクトルデータベースによる保存と検索、そして Qwen2.5-VL-3B-Instruct による回答生成を組み合わせた、PDF ドキュメント向けマルチモーダル RAG パイプラインを紹介しました。



## 参考文献

- Faysse, M., Sibille, H., Wu, T., Omrani, B., Viaud, G., Hudelot, C., Colombo, P. (2024). ColPali: Efficient Document Retrieval with Vision Language Models. arXiv. https://doi.org/10.48550/arXiv.2407.01449
- [ColPali GitHub リポジトリ](https://github.com/illuin-tech/colpali)
- [ColPali クックブック](https://github.com/tonywu71/colpali-cookbooks)

